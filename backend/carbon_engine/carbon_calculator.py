"""CarbonIntelligence — Carbon footprint calculations and grid carbon intensity modeling."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Optional

from backend.config import settings


class CarbonIntelligence:
    """Calculates CO2e emissions (CO2e = E × CI) with regional and temporal dynamics."""

    def __init__(
        self,
        default_intensity: Optional[float] = None,
        regional_intensities: Optional[Dict[str, float]] = None,
        tod_multipliers: Optional[Dict[int, float]] = None,
    ):
        self.default_intensity = (
            default_intensity
            if default_intensity is not None
            else settings.default_carbon_intensity
        )
        self.regional_intensities = (
            regional_intensities
            if regional_intensities is not None
            else dict(settings.regional_carbon_intensity)
        )
        self.tod_multipliers = (
            tod_multipliers
            if tod_multipliers is not None
            else dict(settings.tod_carbon_multipliers)
        )

        # Scenarios mapping multipliers for green transition forecasts
        self.scenarios = {
            "current_thermal_heavy": 1.15,
            "business_as_usual": 1.0,
            "moderate_renewables": 0.75,
            "high_solar_penetration": 0.50,
            "net_zero_target_2030": 0.25,
        }

    def get_carbon_intensity(
        self,
        region: str = "india",
        timestamp: Optional[datetime] = None,
        apply_tod: bool = True,
    ) -> float:
        """Get carbon intensity (kg CO2e/kWh) for a region and time of day."""
        base_ci = self.regional_intensities.get(
            region.lower(), self.default_intensity
        )
        if not apply_tod:
            return round(base_ci, 4)

        target_time = timestamp or datetime.now(timezone.utc)
        hour = target_time.hour
        multiplier = self.tod_multipliers.get(hour, 1.0)
        return round(base_ci * multiplier, 4)

    def calculate_co2e(
        self,
        energy_wh: float,
        region: str = "india",
        timestamp: Optional[datetime] = None,
        apply_tod: bool = True,
        in_grams: bool = True,
    ) -> float:
        """Calculate carbon footprint from energy in Watt-hours.

        Formula: CO2e (kg) = (Energy Wh / 1000) * CI (kg CO2e / kWh)
        Returns CO2e in grams if in_grams=True, otherwise kg.
        """
        ci = self.get_carbon_intensity(
            region=region, timestamp=timestamp, apply_tod=apply_tod
        )
        energy_kwh = energy_wh / 1000.0
        co2e_kg = energy_kwh * ci

        if in_grams:
            return round(co2e_kg * 1000.0, 4)
        return round(co2e_kg, 6)

    def compare_regional_footprint(self, energy_wh: float) -> Dict[str, float]:
        """Compare emission footprint in grams CO2e across supported regions."""
        comparison: Dict[str, float] = {}
        for region in self.regional_intensities:
            comparison[region] = self.calculate_co2e(
                energy_wh, region=region, apply_tod=False
            )
        return comparison

    def project_scenario_emissions(
        self, energy_wh: float, region: str = "odisha"
    ) -> Dict[str, float]:
        """Project emissions across grid scenarios for policy / sustainability reporting."""
        base_grams = self.calculate_co2e(energy_wh, region=region, apply_tod=False)
        projections: Dict[str, float] = {}
        for scenario, factor in self.scenarios.items():
            projections[scenario] = round(base_grams * factor, 4)
        return projections
