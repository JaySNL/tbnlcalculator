# Battery Sizing Calculator — Requirements

**Date:** 2026-05-20
**Status:** Draft
**Scope:** Deep — product

---

## Problem Statement

Homeowners considering a battery and solar installers advising them lack a quick, credible tool to estimate what battery size fits their situation. Existing tools are either tied to specific hardware ecosystems, require real sensor data (like battery_sim for Home Assistant), or are too simplistic to be useful.

## Core Outcome

A standalone web calculator where users input their energy situation and get a side-by-side comparison of multiple battery sizes — showing savings, payback period, cycle count, and degradation over a configurable timeframe.

## Users

| Actor | Need |
|-------|------|
| Homeowner considering battery | Understand if a battery makes sense, what size, and when it pays back |
| Solar installer / advisor | Quick credible estimates during sales conversations or site assessments |

## Input Parameters

### Household Energy Profile

- **Preset profiles**: Small (2,500 kWh/yr), Medium (3,500 kWh/yr), Large (5,000 kWh/yr) household — typical NL consumption patterns
- **Manual overrides**: yearly consumption (kWh), ability to adjust the daily consumption curve shape
- All profiles include a realistic intra-day consumption distribution (morning peak, evening peak, overnight baseline)

### Solar Installation

- **Number of panels** (default: 10)
- **Panel wattage** (default: 400Wp per panel)
- **Roof orientation**: dropdown (South, East/West, Southeast/Southwest, North) with yield correction factors
- **Shading factor**: 0-100% slider (default: 0%)
- Solar irradiance data: monthly kWh/kWp values for Netherlands (KNMI/PVGIS averages)

### Battery Parameters (for comparison)

- **Battery sizes to compare**: user selects 2-4 sizes from common options (5, 7, 10, 13.5, 15, 20 kWh) or enters custom
- **Max charge rate** (kW) — default scales with battery size
- **Max discharge rate** (kW) — default scales with battery size
- **Round-trip efficiency**: default 90%, adjustable
- **Rated cycles**: default 6,000
- **End-of-life degradation**: default 80%

### Financial Parameters

- **Battery cost per kWh** (default: ~EUR 500/kWh installed, 2026 NL market)
- **Electricity import price** (EUR/kWh) — default: current NL average
- **Electricity export price / feed-in tariff** (EUR/kWh) — default: current NL salderingsregeling context + post-2027 feed-in tariff
- **Annual electricity price increase** (%): default 2%
- **Salderingsregeling toggle**: on/off — when ON, exported kWh offsets imported kWh 1:1 (current net metering). When OFF, export earns feed-in tariff only (post-2027 scenario). Default: OFF (forward-looking).
- **Analysis timeframe**: default 15 years

## Output — Scenario Comparison

### Per Battery Size Column

1. **Annual energy savings** (kWh) — energy that would have been exported but is now self-consumed
2. **Self-consumption ratio** (%) — solar energy used directly + via battery vs total solar production
3. **Annual financial savings** (EUR)
4. **Total savings over timeframe** (EUR)
5. **Payback period** (years)
6. **Estimated cycles per year**
7. **Battery health at end of timeframe** (%) — based on cycle degradation model
8. **ROI** (%)

### Visualizations

- **Monthly energy flow chart**: solar production vs consumption vs battery charge/discharge vs grid import/export
- **Payback timeline**: cumulative savings vs battery cost over time (line chart per battery size)
- **Daily energy profile**: 24h view showing when battery charges (solar surplus) and discharges (evening peak)

### Summary Recommendation

A highlighted "sweet spot" recommendation based on best payback-to-size ratio, with brief explanation of why.

## Simulation Model

### Core Logic (derived from battery_sim)

For each hour of a simulated year:
1. Calculate solar production based on panel count, wattage, orientation, shading, and monthly irradiance
2. Calculate household consumption from profile
3. If production > consumption: charge battery (capped by charge rate and remaining capacity)
4. If consumption > production: discharge battery (capped by discharge rate and current charge)
5. Remaining surplus → grid export; remaining deficit → grid import
6. Track cumulative cycles, apply degradation model over multi-year timeframe
7. Calculate financial impact using tariff structure

### Netherlands Solar Data

Monthly solar yield (kWh per kWp installed, south-facing, no shading):
| Month | kWh/kWp |
|-------|---------|
| Jan | 25 |
| Feb | 40 |
| Mar | 80 |
| Apr | 110 |
| May | 130 |
| Jun | 135 |
| Jul | 130 |
| Aug | 115 |
| Sep | 85 |
| Oct | 50 |
| Nov | 28 |
| Dec | 20 |
| **Total** | **~948** |

Orientation correction factors:
- South: 1.00
- SE/SW: 0.95
- East/West: 0.85
- North: 0.55

### Degradation Model

- Linear degradation based on cycles: `capacity_remaining = 1 - (cumulative_cycles / rated_cycles) * (1 - end_of_life_degradation)`
- Calendar aging: small additional annual degradation (~0.5%/yr)

## Non-Goals

- Real-time sensor data integration (that's what battery_sim does)
- Specific brand/model database (keep it generic)
- Grid connection capacity simulation
- Dynamic energy pricing / spot market optimization
- Multi-battery or hybrid system configurations (v1)

## Tech Stack

- **Framework**: Next.js (React)
- **Calculation**: All client-side (no server needed for simulation)
- **Styling**: Tailwind CSS
- **Charts**: Recharts or Chart.js
- **Deployment**: Static export, deployable anywhere
- **Language**: TypeScript

## Success Criteria

1. User can go from landing page to meaningful comparison in under 2 minutes
2. Results are credible enough for an installer to reference in a customer conversation
3. Calculator runs entirely client-side (no API calls for simulation)
4. Mobile-responsive — usable on phone during site visit
5. NL-specific defaults make sense out of the box with zero configuration

## Resolved Decisions

1. **Salderingsregeling toggle**: YES — include toggle to compare with/without net metering. Key NL differentiator showing battery value increases post-phase-out (2027).
2. **Language**: Bilingual NL/EN from start — use next-intl or similar i18n solution.

## Open Questions

1. Should we support dynamic/spot energy pricing in v1 or defer?
2. PDF export of results for installer to share with customer?
