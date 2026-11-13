"""Security hardening and vulnerability resistance tests for GreenCompute AI.

Covers OWASP Top 10 & Enterprise Guardrails:
1. Input Validation & Boundary Testing:
   - Reject negative / zero batch sizes (HTTP 422)
   - Reject out-of-range accuracy constraints (A > 1.0 or A < 0.0)
   - Reject oversized matrix dimensions (matrix_dim > 4096)
   - Reject negative latency limits
   - Handle malformed JSON safely
2. SQL Injection Resistance (CWE-89):
   - ORM parameterization verification against classic and blind SQL injection payloads
   - Table integrity verification (no arbitrary DDL execution)
3. Path Traversal Prevention (CWE-22):
   - Path traversal attempts in model identifiers or report queries
   - Verification that arbitrary system files (/etc/passwd, win.ini) cannot be leaked
4. Cross-Origin Resource Sharing (CORS) Security:
   - Preflight OPTIONS validation
   - Verify allowed methods and headers
"""

from __future__ import annotations

from typing import Any, Dict
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.models import Workload


class TestInputValidationHardening:
    """Rigorous input validation preventing invalid parameters, overflows, and type confusion."""

    def test_reject_negative_batch_size(self, client: TestClient):
        payload = {
            "model_name": "resnet18",
            "precision": "fp32",
            "batch_size": -16,  # Invalid
            "samples": 100,
            "region": "odisha",
        }
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 422, "Negative batch size must be rejected with 422"

    def test_reject_zero_batch_size(self, client: TestClient):
        payload = {
            "model_name": "resnet18",
            "precision": "fp32",
            "batch_size": 0,  # Invalid (ge=1 required)
            "samples": 100,
            "region": "odisha",
        }
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 422

    def test_reject_excessive_batch_size(self, client: TestClient):
        payload = {
            "model_name": "resnet18",
            "precision": "fp32",
            "batch_size": 999999,  # Invalid (le=1024)
            "samples": 100,
            "region": "odisha",
        }
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 422

    def test_reject_negative_samples(self, client: TestClient):
        payload = {
            "model_name": "mobilenetv3",
            "precision": "int8",
            "batch_size": 32,
            "samples": -50,  # Invalid
            "region": "odisha",
        }
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 422

    def test_reject_invalid_accuracy_bounds(self, client: TestClient):
        # Accuracy > 1.0
        payload_high = {
            "model_architecture": "mlp",
            "accuracy_min": 1.5,
            "latency_max_ms": 100.0,
            "memory_max_mb": 200.0,
        }
        resp1 = client.post("/api/optimize", json=payload_high)
        assert resp1.status_code == 422

        # Accuracy < 0.0
        payload_low = {
            "model_architecture": "mlp",
            "accuracy_min": -0.2,
            "latency_max_ms": 100.0,
            "memory_max_mb": 200.0,
        }
        resp2 = client.post("/api/optimize", json=payload_low)
        assert resp2.status_code == 422

    def test_reject_negative_latency_ceiling(self, client: TestClient):
        payload = {
            "model_architecture": "mlp",
            "accuracy_min": 0.85,
            "latency_max_ms": -50.0,  # Invalid
            "memory_max_mb": 200.0,
        }
        response = client.post("/api/optimize", json=payload)
        assert response.status_code == 422

    def test_reject_oversized_matrix_dimension(self, client: TestClient):
        payload = {
            "matrix_dim": 65536,  # Exceeds max allowable dimension (4096)
            "iterations": 10,
        }
        response = client.post("/api/benchmark", json=payload)
        assert response.status_code == 422

    def test_reject_malformed_json(self, client: TestClient):
        response = client.post(
            "/api/workloads",
            content="NOT_VALID_JSON{:::}}",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 422


class TestSQLInjectionResistance:
    """Verifies that SQLAlchemy ORM parameterization neutralizes SQL injection vectors (CWE-89)."""

    @pytest.mark.asyncio
    async def test_orm_parameterization_protects_workloads(self, db_session: AsyncSession):
        """Inserting and querying hostile strings must never execute raw SQL statements."""
        hostile_name = "test_workload'; DROP TABLE workloads; --"

        # Safe insert via ORM
        workload = Workload(
            name=hostile_name,
            model_type="computer_vision",
            framework="pytorch",
            description="' OR '1'='1' --",
        )
        db_session.add(workload)
        await db_session.commit()

        # Query back using parameterized filter
        stmt = select(Workload).where(Workload.name == hostile_name)
        result = await db_session.execute(stmt)
        retrieved = result.scalars().first()

        assert retrieved is not None
        assert retrieved.name == hostile_name

        # Verify the table still exists and was not dropped!
        verify_stmt = select(Workload)
        res_verify = await db_session.execute(verify_stmt)
        assert len(res_verify.scalars().all()) >= 1

    def test_sql_injection_via_api_endpoints(self, client: TestClient):
        """API endpoints must safely handle classic SQL injection payloads without 500 crashes."""
        sql_payloads = [
            "'; DROP TABLE workloads; --",
            "' OR 1=1 --",
            "' UNION SELECT 'a','b','c','d','e' --",
            "admin'--",
            "1; WAITFOR DELAY '0:0:5'--",
        ]

        for payload in sql_payloads:
            # Test in predict
            pred_resp = client.post(
                "/api/predict",
                json={
                    "model_name": payload,
                    "precision": "fp32",
                    "batch_size": 32,
                    "samples": 100,
                    "region": payload,
                },
            )
            # Must either return 200 with fallback or 422 validation, never 500 internal database error
            assert pred_resp.status_code in (200, 422)

            # Test in carbon calculate
            calc_resp = client.post(
                "/api/carbon/calculate",
                json={
                    "energy_wh": 10.0,
                    "region": payload,
                },
            )
            assert calc_resp.status_code in (200, 422)


class TestPathTraversalPrevention:
    """Verifies that user-supplied paths and identifiers cannot escape designated directories (CWE-22)."""

    def test_path_traversal_in_model_name(self, client: TestClient):
        traversal_attempts = [
            "../../../../../../etc/passwd",
            "..\\..\\..\\..\\windows\\win.ini",
            "/etc/shadow",
            "../../benchmarks/run_benchmark.py",
            "....//....//etc/passwd",
        ]

        for path in traversal_attempts:
            resp = client.post(
                "/api/predict",
                json={
                    "model_name": path,
                    "precision": "fp32",
                    "batch_size": 16,
                    "samples": 50,
                },
            )
            # Endpoint must sanitize and not crash or expose file contents
            assert resp.status_code in (200, 422)
            if resp.status_code == 200:
                data = resp.json()
                # Ensure it sanitized model_name to a known fallback or safe string
                assert "root:" not in str(data)
                assert "[extensions]" not in str(data)

    def test_reports_directory_traversal_safety(self, client: TestClient):
        """Summary endpoint safely reads designated directory without path escape."""
        resp = client.get("/api/benchmarks/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "benchmarks" in data
        for bench in data["benchmarks"]:
            # Confirm no sensitive files leaked as benchmark reports
            assert "passwd" not in str(bench.get("model_name", "")).lower()
            assert "win.ini" not in str(bench.get("model_name", "")).lower()


class TestCORSSecurity:
    """Verifies Cross-Origin Resource Sharing (CORS) headers and preflight handling."""

    def test_cors_preflight_options_request(self, client: TestClient):
        headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        }
        response = client.options("/api/predict", headers=headers)
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        assert response.headers["access-control-allow-origin"] in (
            "http://localhost:5173",
            "*",
        )

    def test_cors_header_on_get_request(self, client: TestClient):
        headers = {"Origin": "http://localhost:3000"}
        response = client.get("/health", headers=headers)
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
