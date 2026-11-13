"""WebSocket endpoint for live telemetry streaming of CPU%, GPU%, power, and energy."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import json
import logging
from typing import Dict, List, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.config import settings
from backend.hardware.esp32_receiver import hardware_receiver
from backend.profiler.energy_profiler import EnergyProfiler

logger = logging.getLogger(__name__)

ws_router = APIRouter(tags=["telemetry"])


class ConnectionManager:
    """Manages active WebSocket client connections and broadcasts telemetry."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.profiler = EnergyProfiler()
        self._streaming_task: asyncio.Task | None = None
        self._cumulative_energy_wh: float = 0.0
        self._last_tick: float | None = None

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")
        if self._streaming_task is None or self._streaming_task.done():
            self._streaming_task = asyncio.create_task(self._broadcast_loop())

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")
        if not self.active_connections and self._streaming_task:
            self._streaming_task.cancel()
            self._streaming_task = None

    async def broadcast(self, message: dict) -> None:
        disconnected: List[WebSocket] = []
        payload = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

    async def _broadcast_loop(self) -> None:
        """Stream system & hardware telemetry every 1 second."""
        loop = asyncio.get_running_loop()
        while True:
            try:
                now_t = loop.time()
                dt = (now_t - self._last_tick) if self._last_tick else 1.0
                self._last_tick = now_t

                # System telemetry
                snapshot = self.profiler.snapshot()

                # Hardware telemetry if available
                hw_latest = hardware_receiver.get_latest()
                hw_power = hw_latest["power"] if hw_latest else None
                hw_voltage = hw_latest["voltage"] if hw_latest else None

                # Effective power: prefer physical sensor reading if active
                active_power = hw_power if (hw_power is not None and hw_power > 0) else snapshot.power_w
                self._cumulative_energy_wh += (active_power * (dt / 3600.0))

                telemetry_event = {
                    "type": "telemetry_tick",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "cpu_percent": round(snapshot.cpu_percent, 2),
                    "gpu_percent": round(snapshot.gpu_percent, 2),
                    "gpu_power_w": round(snapshot.gpu_power_w, 2),
                    "ram_used_mb": round(snapshot.ram_used_mb, 2),
                    "system_power_w": round(snapshot.power_w, 2),
                    "hardware_power_w": round(hw_power, 2) if hw_power is not None else None,
                    "hardware_voltage_v": round(hw_voltage, 2) if hw_voltage is not None else None,
                    "effective_power_w": round(active_power, 2),
                    "cumulative_energy_wh": round(self._cumulative_energy_wh, 4),
                }

                await self.broadcast(telemetry_event)
                await asyncio.sleep(settings.ws_telemetry_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in telemetry broadcast loop: {e}")
                await asyncio.sleep(settings.ws_telemetry_interval)


manager = ConnectionManager()


@ws_router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """Live WebSocket stream for profiling metrics."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep receiving any control frames or ping-pongs from client
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("command") == "reset_energy":
                    manager._cumulative_energy_wh = 0.0
                    await websocket.send_text(
                        json.dumps({"type": "info", "message": "Cumulative energy counter reset."})
                    )
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket session error: {e}")
        manager.disconnect(websocket)
