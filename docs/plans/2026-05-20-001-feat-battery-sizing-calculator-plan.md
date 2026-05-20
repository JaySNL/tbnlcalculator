---
title: "feat: Build TBNL Battery Sizing Calculator v2"
type: feat
status: active
date: 2026-05-20
origin: docs/brainstorms/battery-calculator-requirements.md
---

# feat: Build TBNL Battery Sizing Calculator v2

## Overview

Greenfield Next.js web calculator that lets homeowners and solar installers input their energy situation and compare multiple battery sizes side-by-side. Runs entirely client-side with NL-specific solar data, salderingsregeling toggle, degradation modeling, and financial payback analysis. Bilingual NL/EN from day one. Deploys to Vercel.

---

## Problem Frame

Homeowners considering a battery and solar installers advising them lack a quick, credible tool to estimate what battery size fits their situation. Existing tools are tied to specific hardware ecosystems, require real sensor data, or are too simplistic. The old v1 calculator (stashed on `legacy/v1`) gives a single recommendation — v2 enables side-by-side comparison of multiple battery sizes with financial analysis and the critical salderingsregeling toggle for NL market relevance. (see origin: `docs/brainstorms/battery-calculator-requirements.md`)

---

## Requirements Trace

- R1. User can input energy profile via presets (werkend/thuiswerk/gezin) or manual entry
- R2. Solar installation configuration: panel count, wattage, orientation, shading
- R3. Compare 2-4 battery sizes side-by-side with savings, payback, cycles, degradation
- R4. Salderingsregeling toggle comparing with/without net metering scenarios
- R5. Financial model: import/export tariffs, annual price increase, payback period
- R6. Hourly simulation over multi-year timeframe with degradation model
- R7. Visualizations: monthly energy flow, payback timeline, daily energy profile
- R8. Bilingual NL/EN with next-intl
- R9. Mobile-responsive, usable on phone during site visit
- R10. All calculation client-side, no API calls for simulation
- R11. Deploy to Vercel as static export
- R12. User goes from landing page to meaningful comparison in under 2 minutes
- R13. NL-specific defaults work out of the box with zero configuration

---

## Scope Boundaries

- No real-time sensor data integration (that's battery_sim's domain)
- No specific brand/model database
- No grid connection capacity simulation
- No dynamic/spot energy pricing (deferred to v2)
- No multi-battery or hybrid system configurations
- No PDF export (deferred to v2)
- No upload of energy data from smart meters (deferred to v2)

---

## Context & Research

### Relevant Code and Patterns (from legacy/v1)

- `website/src/utils/calculate.js` — hourly simulation with monthly solar/demand weights, solar bell curve, battery charge/discharge logic. Core algorithm to port to TypeScript and extend
- `website/src/components/InputSection.jsx` — profile selector (werkend/thuiswerk/gezin/custom), consumption slider, orientation buttons, grid phase selector, heavy consumers (heat pump, EV, airco)
- `website/src/components/Calculator.jsx` — state management with `useMemo` for reactive recalculation
- NL constants from v1: 950 kWh/kWp annual yield, orientation factors (south: 1.0, east: 0.85, west: 0.85, north: 0.60, east-west: 0.82)
- Monthly solar weights from v1: Jan 0.03, Feb 0.05, Mar 0.10, Apr 0.14, May 0.16, Jun 0.17, Jul 0.16, Aug 0.13, Sep 0.08, Oct 0.05, Nov 0.03, Dec 0.02
- Monthly demand weights from v1: Jan 1.15, Feb 1.10, Mar 1.05, Apr 0.95, May 0.90, Jun 0.85, Jul 0.85, Aug 0.90, Sep 0.95, Oct 1.00, Nov 1.10, Dec 1.15

### External References

- battery_sim (hif2k1/battery_sim): degradation model (linear from 100% at 0 cycles to 80% at 6000 cycles), efficiency curves, inverter power capping
- PVGIS/MilieuCentraal: NL solar irradiance reference data
- Salderingsregeling phase-out: net metering ends 2027 in NL, key driver for battery economics

---

## Key Technical Decisions

- **Next.js with static export**: All simulation runs client-side. No API routes needed. `output: 'export'` in next.config for Vercel static deployment
- **next-intl for i18n**: Lightweight, well-supported for Next.js App Router. NL and EN locales with NL as default
- **Recharts for visualization**: React-native charting, good TypeScript support, composable components. Preferred over Chart.js for React integration
- **shadcn/ui + Tailwind**: Component library for consistent, accessible UI. No HeroUI dependency (v1 used HeroUI)
- **Simulation resolution**: Hourly for a typical day per month (24h x 12 months = 288 data points per battery size per year). Good accuracy without expensive computation. Extended to multi-year with degradation applied annually
- **Port v1 algorithm to TypeScript**: Preserve proven NL-specific constants and simulation logic. Extend with multi-battery comparison, degradation, and financial model
- **Client-side state with React hooks**: No external state management needed. `useMemo` for reactive recalculation as user adjusts inputs (proven pattern from v1)

---

## Open Questions

### Resolved During Planning

- **Charting library**: Recharts — best React integration, TypeScript types, composable
- **i18n approach**: next-intl with middleware-based locale detection and `/nl`/`/en` URL prefixes
- **Component library**: shadcn/ui — accessible, customizable, no heavy runtime

### Deferred to Implementation

- Exact solar bell curve parameters per month (v1 used a single sine curve; may want month-specific sunrise/sunset adjustments)
- Optimal default battery sizes for comparison presets
- Exact energy price defaults — need to verify current 2026 NL market rates during implementation

---

## Output Structure

```
src/
  app/
    [locale]/
      layout.tsx           # Root layout with i18n provider
      page.tsx             # Calculator page
    layout.tsx             # Top-level layout
  components/
    calculator/
      Calculator.tsx       # Main calculator container
      InputSection.tsx     # All input controls
      ResultsSection.tsx   # Comparison table + summary
      EnergyFlowChart.tsx  # Monthly energy flow visualization
      PaybackChart.tsx     # Cumulative savings vs cost chart
      DailyProfileChart.tsx # 24h charge/discharge profile
    ui/                    # shadcn/ui components
  lib/
    simulation/
      engine.ts            # Core hourly simulation loop
      types.ts             # TypeScript interfaces for all data
      constants.ts         # NL solar data, defaults, profiles
      financial.ts         # Payback, savings, ROI calculations
      degradation.ts       # Cycle-based degradation model
  i18n/
    messages/
      nl.json              # Dutch translations
      en.json              # English translations
    request.ts             # next-intl config
    routing.ts             # Locale routing config
  __tests__/
    simulation/
      engine.test.ts
      financial.test.ts
      degradation.test.ts
```

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
User Input → React State (formData + selectedBatterySizes[])
                 ↓
         useMemo triggers recalculation
                 ↓
    ┌─── For each battery size in selectedBatterySizes[] ───┐
    │                                                        │
    │  For each year (1..timeframe):                         │
    │    Apply degradation to effective capacity              │
    │    For each month (1..12):                              │
    │      Calculate solar production (kWh)                   │
    │      Calculate consumption (kWh)                        │
    │      For each hour (0..23):                             │
    │        Solar output = bell curve × monthly factor       │
    │        Demand = profile curve × monthly factor          │
    │        Surplus/deficit → charge/discharge battery       │
    │        Track: grid import, grid export, self-consumed   │
    │      Accumulate monthly cycles                          │
    │    Calculate annual savings (with/without saldering)    │
    │    Track cumulative savings for payback                 │
    │                                                        │
    └────────────────────────────────────────────────────────┘
                 ↓
    ComparisonResult[] → ResultsSection (table + charts)
```

**Salderingsregeling logic:**
- Toggle ON: exported kWh offsets imported kWh 1:1. Net savings = (import - export) × import_price. If net negative (more export than import), excess has zero value
- Toggle OFF: savings = avoided_import × import_price + actual_export × export_price. Battery value = additional self-consumption × (import_price - export_price)

---

## Implementation Units

- U1. **Project Scaffold & Configuration**

**Goal:** Set up Next.js project with TypeScript, Tailwind, shadcn/ui, Recharts, next-intl, and Vercel deployment config.

**Requirements:** R8, R9, R10, R11

**Dependencies:** None

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Create: `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`
- Create: `src/i18n/request.ts`, `src/i18n/routing.ts`
- Create: `src/i18n/messages/nl.json`, `src/i18n/messages/en.json` (skeleton)
- Create: `.gitignore`, `vercel.json`
- Create: `src/middleware.ts` (next-intl locale detection)

**Approach:**
- `npx create-next-app` with App Router, TypeScript, Tailwind, src directory
- `npx shadcn@latest init` for component library
- Install next-intl, recharts
- Configure `output: 'export'` in next.config for static site generation
- NL as default locale, EN as secondary
- Set up middleware for automatic locale detection and `/nl`/`/en` URL routing

**Patterns to follow:**
- next-intl App Router setup docs
- shadcn/ui installation guide

**Test expectation:** none — scaffolding only. Verify by running `npm run dev` and seeing the default page render in both locales.

**Verification:**
- `npm run dev` starts without errors
- Navigating to `/nl` and `/en` renders locale-specific content
- `npm run build` produces static export

---

- U2. **Simulation Types & Constants**

**Goal:** Define all TypeScript interfaces and NL-specific constants that the simulation engine and UI components share.

**Requirements:** R1, R2, R3, R5, R13

**Dependencies:** U1

**Files:**
- Create: `src/lib/simulation/types.ts`
- Create: `src/lib/simulation/constants.ts`

**Approach:**
- Types: `HouseholdProfile`, `SolarConfig`, `BatteryConfig`, `FinancialConfig`, `SimulationInput`, `SimulationResult`, `ComparisonResult`, `MonthlyBreakdown`, `HourlyDataPoint`
- Constants: monthly solar weights, monthly demand weights, orientation factors, household profile presets (werkend: 3250, thuiswerk: 4250, gezin: 5000), default energy prices, default battery sizes, solar yield per kWp (948 kWh/yr)
- Port proven NL constants from v1's `calculate.js` (orientation factors, monthly weights)
- Include salderingsregeling as a boolean in `FinancialConfig`

**Patterns to follow:**
- v1 `website/src/utils/calculate.js` for NL-specific values
- Origin requirements doc for parameter definitions

**Test expectation:** none — pure type definitions and constant declarations. Correctness verified by type-checking and downstream unit tests.

**Verification:**
- TypeScript compiles without errors
- Constants match documented values from requirements doc

---

- U3. **Core Simulation Engine**

**Goal:** Implement the hourly simulation loop that calculates energy flows for a single battery configuration over a multi-year timeframe.

**Requirements:** R6, R10

**Dependencies:** U2

**Files:**
- Create: `src/lib/simulation/engine.ts`
- Create: `src/__tests__/simulation/engine.test.ts`

**Approach:**
- Main function: `simulateYear(input: SimulationInput, batteryConfig: BatteryConfig, effectiveCapacity: number) → YearResult`
- Inner loop: for each month, for each hour (0-23), calculate solar production (bell curve × monthly solar weight), consumption (profile curve × monthly demand weight), battery charge/discharge with rate limits and efficiency
- Solar production curve: sinusoidal between sunrise and sunset hours, scaled by monthly solar factor and total kWp
- Demand curve: dual-peak (morning 7-9, evening 17-21) with baseline, scaled by monthly demand factor
- Battery logic: surplus charges battery (capped by charge rate, remaining capacity, efficiency), deficit discharges battery (capped by discharge rate, current charge, efficiency)
- Track per-hour: solar_produced, consumed, battery_charged, battery_discharged, grid_import, grid_export, battery_soc
- Track per-month: total cycles (sum of energy throughput / capacity), self-consumption ratio
- Multi-year wrapper: `simulateMultiYear(input, batteryConfig, years) → MultiYearResult[]` applying degradation per year

**Patterns to follow:**
- v1 `calculate.js` hourly simulation loop (solar bell curve, demand peaks, battery charge/discharge)
- battery_sim's parameter model (charge/discharge rates, efficiency, inverter capping)

**Test scenarios:**
- Happy path: 10 panels south-facing, medium household, 10 kWh battery → annual self-consumption ratio between 40-70%, annual cycles between 200-400
- Happy path: zero solar panels → battery never charges, all consumption from grid
- Happy path: very large battery (20 kWh) with small solar (4 panels) → battery rarely fully charges, low cycle count
- Edge case: battery already at 100% SOC during peak solar → surplus goes to grid export, no overcharge
- Edge case: battery at 0% SOC during evening peak → all deficit from grid import
- Edge case: charge rate limit → surplus exceeds max charge rate, excess goes to grid
- Edge case: discharge rate limit → deficit exceeds max discharge rate, remainder from grid
- Edge case: efficiency losses → charging 1 kWh at 90% efficiency stores 0.9 kWh
- Integration: monthly solar weights produce realistic seasonal pattern (summer months ~5x winter months in kWh)
- Integration: demand weights produce realistic seasonal pattern (winter months ~15-30% higher than summer)

**Verification:**
- All test scenarios pass
- Simulation for a typical NL household (3500 kWh, 10 panels, 10 kWh battery) produces results within plausible ranges validated against battery_sim reference data

---

- U4. **Degradation Model**

**Goal:** Implement cycle-based battery degradation that reduces effective capacity over time.

**Requirements:** R3, R6

**Dependencies:** U2

**Files:**
- Create: `src/lib/simulation/degradation.ts`
- Create: `src/__tests__/simulation/degradation.test.ts`

**Approach:**
- Linear degradation: `effectiveCapacity = nominalCapacity × (1 - (cumulativeCycles / ratedCycles) × (1 - endOfLifeDegradation))`
- Calendar aging: additional 0.5%/year capacity loss independent of cycling
- Combined: `totalDegradation = cycleDegradation + calendarDegradation`, capped at endOfLifeDegradation
- Default: 6000 rated cycles, 80% end-of-life (from battery_sim)
- Returns effective capacity for a given year based on cumulative cycles from prior years

**Patterns to follow:**
- battery_sim degradation model: linear from 100% at 0 cycles to 80% at 6000 cycles

**Test scenarios:**
- Happy path: 0 cycles, year 0 → 100% capacity
- Happy path: 3000 cycles (half life) → ~90% capacity (10% cycle degradation)
- Happy path: 6000 cycles → 80% capacity (full cycle degradation)
- Edge case: cycles exceed rated cycles → capacity does not drop below endOfLifeDegradation floor
- Edge case: calendar aging over 15 years with zero cycles → ~92.5% capacity (7.5% calendar loss)
- Integration: combined cycle + calendar degradation → both factors compound correctly

**Verification:**
- All test scenarios pass
- Degradation curve is monotonically decreasing
- Values match battery_sim reference for equivalent inputs

---

- U5. **Financial Model**

**Goal:** Calculate savings, payback period, ROI, and cumulative financial impact with and without salderingsregeling.

**Requirements:** R3, R4, R5

**Dependencies:** U2, U3

**Files:**
- Create: `src/lib/simulation/financial.ts`
- Create: `src/__tests__/simulation/financial.test.ts`

**Approach:**
- Two modes based on salderingsregeling toggle:
  - **Saldering ON**: net metering — exported kWh offsets imported kWh 1:1. Battery value = additional self-consumption prevents export that would otherwise be "wasted" in a post-saldering world. Under saldering, battery has less financial value since export already offsets import
  - **Saldering OFF**: export earns feed-in tariff only. Battery value = avoided_import × import_price - would_have_exported × export_price (the spread between import and export price)
- Annual savings calculated from simulation results: `(grid_import_without_battery - grid_import_with_battery) × import_price - (grid_export_without_battery - grid_export_with_battery) × export_price`
- Baseline (no battery) simulation needed for comparison: same inputs but battery size = 0
- Cumulative savings with annual price increase compound
- Payback period: year where cumulative savings exceeds battery cost
- ROI: (total_savings - battery_cost) / battery_cost × 100 over timeframe
- Battery cost = capacity × cost_per_kWh

**Patterns to follow:**
- v1 `calculate.js` savings calculation (simplified version to extend)

**Test scenarios:**
- Happy path: saldering OFF, 10 kWh battery, typical margins → positive annual savings, payback within 7-12 years
- Happy path: saldering ON → battery savings significantly lower than saldering OFF (net metering reduces battery value)
- Happy path: annual price increase 2% → later years contribute more to savings than early years
- Edge case: battery cost extremely high → payback exceeds timeframe, ROI negative
- Edge case: import price equals export price (no spread) → battery has zero financial value without saldering
- Edge case: zero solar production → no battery savings (nothing to store)
- Error path: negative energy prices → handled gracefully (savings capped at 0)
- Integration: cumulative savings timeline matches sum of annual savings with compounding price increase

**Verification:**
- All test scenarios pass
- Saldering toggle produces meaningfully different results
- Financial outputs are internally consistent (annual savings × years ≈ total savings when no price increase)

---

- U6. **Multi-Battery Comparison Orchestrator**

**Goal:** Run simulation for multiple battery sizes in parallel and produce structured comparison data for the UI.

**Requirements:** R3, R12

**Dependencies:** U3, U4, U5

**Files:**
- Create: `src/lib/simulation/compare.ts`
- Test: covered by `src/__tests__/simulation/engine.test.ts` (extend with comparison scenarios)

**Approach:**
- `compareScenarios(input: SimulationInput, batterySizes: number[], financialConfig: FinancialConfig) → ComparisonResult[]`
- For each battery size: construct BatteryConfig with size-appropriate defaults (charge/discharge rate scales with size), run multi-year simulation, calculate financial metrics, identify "sweet spot" recommendation
- Sweet spot algorithm: best payback-to-size ratio — the battery size with the shortest payback period relative to its cost. If multiple sizes have similar payback, prefer smaller (less capital risk)
- Also run baseline (no battery) simulation once for financial comparison
- Returns array of `ComparisonResult` sorted by battery size, with `isRecommended` flag on sweet spot

**Test scenarios:**
- Happy path: compare 5, 10, 15 kWh → each produces different savings, cycles, payback. Larger battery = more savings but longer payback
- Happy path: sweet spot identified → medium battery (10 kWh) typically recommended for average household
- Edge case: all battery sizes have payback > timeframe → no recommendation, all flagged as "not recommended"
- Edge case: single battery size selected → comparison still works, shows vs baseline
- Integration: comparison results consistent with individual simulation runs

**Verification:**
- Comparison of multiple sizes produces internally consistent, plausible results
- Sweet spot recommendation logic tested and justified

---

- U7. **Input Form Components**

**Goal:** Build all user input controls: energy profile, solar config, battery selection, and financial parameters.

**Requirements:** R1, R2, R4, R5, R8, R9, R12, R13

**Dependencies:** U1, U2

**Files:**
- Create: `src/components/calculator/Calculator.tsx`
- Create: `src/components/calculator/InputSection.tsx`
- Create: `src/components/calculator/ProfileSelector.tsx`
- Create: `src/components/calculator/SolarConfig.tsx`
- Create: `src/components/calculator/BatterySelector.tsx`
- Create: `src/components/calculator/FinancialConfig.tsx`

**Approach:**
- Stepped layout (4 sections like v1): Energy Profile → Solar Setup → Battery Sizes → Financial Parameters
- Profile selector: card buttons for werkend/thuiswerk/gezin/custom with consumption slider for custom
- Solar config: panel count (slider 1-30), wattage per panel (dropdown: 350/400/450 Wp), orientation (visual buttons: South/SE-SW/E-W/North), shading slider (0-30%)
- Battery selector: checkboxes for common sizes (5, 7, 10, 13.5, 15, 20 kWh) + custom input. Min 2, max 4 selected
- Financial config: import price, export price, salderingsregeling toggle, annual price increase, battery cost per kWh, timeframe slider (5-25 years)
- All inputs use shadcn/ui components (Slider, Select, Toggle, Input, Card)
- All labels and descriptions use next-intl translations
- Responsive: single column on mobile, two columns on larger screens
- NL defaults pre-filled (R13)

**Patterns to follow:**
- v1 `InputSection.jsx` for layout structure and profile selector pattern
- shadcn/ui component patterns

**Test scenarios:**
- Happy path: selecting "werkend" profile sets consumption to 3250 kWh
- Happy path: changing orientation updates the correction factor display
- Edge case: selecting more than 4 battery sizes → UI prevents additional selection
- Edge case: selecting fewer than 2 battery sizes → shows validation hint
- Edge case: custom consumption below 500 or above 15000 kWh → clamped to valid range

**Verification:**
- All inputs render correctly in both NL and EN
- Default state produces valid simulation input
- Mobile layout is usable on 375px width

---

- U8. **Results Section & Comparison Table**

**Goal:** Display side-by-side battery comparison with key metrics, highlighted recommendation, and summary.

**Requirements:** R3, R4, R8, R9

**Dependencies:** U6, U7

**Files:**
- Create: `src/components/calculator/ResultsSection.tsx`
- Create: `src/components/calculator/ComparisonTable.tsx`
- Create: `src/components/calculator/RecommendationBadge.tsx`

**Approach:**
- Comparison table: one column per battery size, rows for each metric (annual savings, self-consumption %, payback period, cycles/year, battery health at end of timeframe, ROI, total savings)
- Highlighted "sweet spot" column with visual emphasis (border, badge)
- Summary recommendation text explaining why the sweet spot was chosen
- Salderingsregeling indicator showing which mode is active and how it affects results
- Responsive: horizontal scroll on mobile for table, or stack to cards
- All text translated via next-intl
- Numbers formatted per locale (NL uses comma for decimal, period for thousands)

**Patterns to follow:**
- v1 `ResultsSection.jsx` for general layout approach
- shadcn/ui Table, Card, Badge components

**Test scenarios:**
- Happy path: 3 battery sizes → 3 columns with all metrics populated
- Happy path: recommended battery has visual distinction
- Edge case: all batteries have negative ROI → no recommendation badge, explanatory text shown
- Edge case: saldering toggle → results update immediately, values change meaningfully

**Verification:**
- Table renders correctly with 2-4 columns
- All numbers formatted correctly for active locale
- Responsive layout works on mobile

---

- U9. **Visualization Charts**

**Goal:** Build three chart components: monthly energy flow, payback timeline, and daily energy profile.

**Requirements:** R7, R8, R9

**Dependencies:** U6, U8

**Files:**
- Create: `src/components/calculator/EnergyFlowChart.tsx`
- Create: `src/components/calculator/PaybackChart.tsx`
- Create: `src/components/calculator/DailyProfileChart.tsx`

**Approach:**
- **Monthly Energy Flow** (stacked bar chart): 12 months, stacked bars showing solar production, direct consumption, battery charge/discharge, grid import, grid export. One series per battery size overlaid or selectable
- **Payback Timeline** (line chart): X-axis = years, Y-axis = cumulative EUR. One line per battery size showing cumulative savings. Horizontal line at battery cost. Intersection = payback point
- **Daily Energy Profile** (area chart): 24 hours, showing solar production curve, consumption curve, battery SOC, charge/discharge actions. Selectable month (default: June) and battery size
- All charts use Recharts with responsive containers
- Tooltips and legends translated via next-intl
- Color scheme: consistent across charts. Solar = yellow/amber, consumption = blue, battery = green, grid import = red, grid export = orange

**Patterns to follow:**
- Recharts ResponsiveContainer, AreaChart, BarChart, LineChart patterns
- v1's June graph data structure for daily profile reference

**Test scenarios:**
- Happy path: monthly chart shows seasonal variation (high solar in summer, low in winter)
- Happy path: payback chart lines cross the cost threshold at different years per battery size
- Happy path: daily profile shows battery charging during midday solar surplus and discharging during evening peak
- Edge case: battery too small to meaningfully shift energy → chart shows mostly grid import/export
- Edge case: zero solar → charts show flat solar line, all consumption from grid

**Verification:**
- Charts render without errors
- Charts resize correctly on window resize
- Visual patterns match expected energy behavior for NL

---

- U10. **i18n Translations & Locale Formatting**

**Goal:** Complete NL and EN translation files and ensure all user-facing text, numbers, dates, and currencies are properly localized.

**Requirements:** R8

**Dependencies:** U7, U8, U9

**Files:**
- Modify: `src/i18n/messages/nl.json`
- Modify: `src/i18n/messages/en.json`
- Create: `src/lib/formatting.ts`

**Approach:**
- Translation keys organized by section: `calculator.profile.*`, `calculator.solar.*`, `calculator.battery.*`, `calculator.financial.*`, `calculator.results.*`, `calculator.charts.*`, `common.*`
- Number formatting: `Intl.NumberFormat` with locale — NL uses comma decimal (€ 1.234,56), EN uses period decimal (€1,234.56)
- Currency: always EUR, formatted per locale
- Percentage: formatted per locale
- Energy units: kWh, kWp — universal, no translation needed
- Language switcher component in header (NL/EN toggle)

**Patterns to follow:**
- next-intl message format and `useTranslations` hook
- `Intl.NumberFormat` for locale-aware number formatting

**Test scenarios:**
- Happy path: switching locale updates all visible text
- Happy path: numbers format correctly per locale (NL: 1.234,56 — EN: 1,234.56)
- Edge case: missing translation key → falls back gracefully (shows key or default)
- Integration: chart tooltips and labels reflect active locale

**Verification:**
- No untranslated strings visible in either locale
- Number formatting matches locale conventions
- Language switcher works without page reload

---

- U11. **Responsive Design, Polish & Landing State**

**Goal:** Ensure mobile-first responsive layout, loading states, smooth transitions, and an inviting landing state before calculation.

**Requirements:** R9, R12

**Dependencies:** U7, U8, U9

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/components/calculator/Calculator.tsx`
- Create: `src/components/calculator/HeroSection.tsx`
- Modify: various component files for responsive adjustments

**Approach:**
- Hero section with title "Batterij Calculator" (NL) / "Battery Calculator" (EN), subtitle explaining purpose, branded visual
- Smooth scroll from inputs to results as user completes form
- Loading/calculating state while simulation runs (should be near-instant but provides feedback)
- Mobile: single-column stacked layout, touch-friendly sliders and buttons, card-based results instead of table
- Tablet: two-column input layout
- Desktop: side-by-side input + results or full-width with clear sections
- Consistent color palette: orange/amber accent (from v1 branding), slate/white backgrounds
- Dark mode support (toggle like v1)

**Test expectation:** none — visual polish. Verified by manual testing across viewport sizes.

**Verification:**
- Usable on 375px mobile viewport
- No horizontal scroll on any viewport
- Professional appearance suitable for installer use

---

- U12. **Vercel Deployment & Final Integration**

**Goal:** Configure Vercel deployment, verify production build, and ensure everything works end-to-end.

**Requirements:** R11

**Dependencies:** U1-U11

**Files:**
- Modify: `next.config.ts` (verify static export settings)
- Modify: `package.json` (verify build scripts)
- Create: `vercel.json` if needed for routing config

**Approach:**
- Verify `npm run build` produces clean static export
- Configure Vercel project linked to `JaySNL/tbnlcalculator` repo
- Set up `main` branch for production deployment
- Verify locale routing works with Vercel (may need rewrites for `/nl`/`/en` paths in static export)
- Test production build locally with `npx serve out/`

**Test expectation:** none — deployment configuration. Verified by successful Vercel deployment.

**Verification:**
- `npm run build` succeeds without errors or warnings
- Static export works correctly with locale routing
- Vercel preview deployment renders correctly
- Both `/nl` and `/en` routes work in production

---

## System-Wide Impact

- **Interaction graph:** All UI components → simulation engine via React state + useMemo. No callbacks, middleware, or side effects. Purely functional data flow
- **Error propagation:** Invalid inputs prevented by UI constraints (min/max values, required selections). Simulation engine receives validated data only
- **State lifecycle risks:** None — stateless client-side calculation. No persistence, no cache, no server state
- **API surface parity:** N/A — no API. All client-side
- **Integration coverage:** Main integration point is InputSection → simulation engine → ResultsSection. Verify that changing any input produces updated, plausible results
- **Unchanged invariants:** The `legacy/v1` branch remains untouched. New code on `main` is a complete rewrite

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Simulation performance on mobile (288 data points × 4 batteries × 15 years) | Profile and optimize. Use Web Workers if > 100ms. Hourly resolution is ~17,000 iterations total — should be fast |
| next-intl static export compatibility | Verify early in U1. Fallback: use client-side locale detection without middleware |
| NL solar data accuracy | Use proven PVGIS-validated constants from v1. Cross-reference with requirements doc values |
| Salderingsregeling model correctness | Critical for NL credibility. Financial model (U5) needs thorough testing against manual calculations |
| Recharts bundle size | Tree-shake unused chart types. Monitor bundle with `next/bundle-analyzer` |

---

## Sources & References

- **Origin document:** [docs/brainstorms/battery-calculator-requirements.md](docs/brainstorms/battery-calculator-requirements.md)
- **Legacy v1 code:** `legacy/v1` branch — `website/src/utils/calculate.js`, `website/src/components/`
- **battery_sim:** https://github.com/hif2k1/battery_sim — degradation model, simulation parameters
- **PVGIS/MilieuCentraal:** NL solar irradiance reference data
- **next-intl docs:** App Router setup for static export
