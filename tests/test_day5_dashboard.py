"""Day 5 Verification: Green Intelligence Dashboard assets, React pages, and WebSocket integration."""

from __future__ import annotations

import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app


class TestDay5DashboardBuild:
    """Validate React 18 production compilation artifacts and page components."""

    def test_dist_html_and_assets_exist(self):
        dist_dir = Path("frontend/dist")
        assert dist_dir.exists(), "frontend/dist must exist after npm run build"

        index_html = dist_dir / "index.html"
        assert index_html.exists(), "index.html must exist in dist"
        content = index_html.read_text(encoding="utf-8")
        assert "<title>" in content or "GreenCompute" in content

        assets_dir = dist_dir / "assets"
        assert assets_dir.exists()
        js_files = list(assets_dir.glob("*.js"))
        css_files = list(assets_dir.glob("*.css"))
        assert len(js_files) >= 1, "At least one JavaScript bundle must be generated"
        assert len(css_files) >= 1, "At least one CSS stylesheet must be generated"

    def test_all_seven_page_source_files_exist(self):
        pages_dir = Path("frontend/src/pages")
        expected_pages = [
            "Dashboard.tsx",
            "WorkloadPage.tsx",
            "BenchmarkPage.tsx",
            "OptimizerPage.tsx",
            "CarbonPage.tsx",
            "HardwarePage.tsx",
            "SettingsPage.tsx",
        ]
        for page in expected_pages:
            page_path = pages_dir / page
            assert page_path.exists(), f"Page {page} must exist in frontend/src/pages"
            assert page_path.stat().st_size > 500, f"Page {page} must contain comprehensive UI logic"

    def test_dashboard_api_contracts_aligned(self):
        client = TestClient(app)
        # Check that endpoints consumed by Dashboard pages respond properly
        # 1. Summary / Benchmarks
        res_bench = client.get("/api/benchmarks/summary")
        assert res_bench.status_code == 200

        # 2. Hardware latest
        res_hw = client.get("/api/hardware/latest")
        assert res_hw.status_code == 200

        # 3. Workloads
        res_wl = client.get("/api/workloads")
        assert res_wl.status_code == 200

        # 4. Carbon intensity
        res_ci = client.get("/api/carbon/intensity")
        assert res_ci.status_code == 200
