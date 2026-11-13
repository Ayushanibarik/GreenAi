"""Async Database Connection & Session Factory with automatic SQLite fallback."""

from __future__ import annotations

import logging
import os
from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from backend.config import settings
from backend.database.models import Base

logger = logging.getLogger("greencompute.database")

SQLITE_FALLBACK_URL = "sqlite+aiosqlite:///./greencompute.db"

primary_url = settings.database_url
# If DATABASE_URL is not explicitly set or empty, prefer SQLite directly
if not primary_url or "localhost:5432" in primary_url:
    target_url = SQLITE_FALLBACK_URL
else:
    target_url = primary_url

# Initialize engine
if target_url.startswith("sqlite"):
    engine: AsyncEngine = create_async_engine(
        target_url,
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_async_engine(
        target_url,
        echo=False,
        pool_size=10,
        max_overflow=20,
    )

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    """Initialize database connection and create tables with fallback handling."""
    global engine, async_session_factory

    try:
        # Test connection
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database initialized successfully using: {engine.url.render_as_string(hide_password=True)}")
    except Exception as e:
        logger.warning(
            f"Primary database connection failed ({e}). Falling back to local SQLite: {SQLITE_FALLBACK_URL}"
        )
        engine = create_async_engine(
            SQLITE_FALLBACK_URL,
            echo=False,
            connect_args={"check_same_thread": False},
        )
        async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Local SQLite database initialized and tables created.")


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency – yields an async DB session."""
    async with async_session_factory() as session:
        yield session
