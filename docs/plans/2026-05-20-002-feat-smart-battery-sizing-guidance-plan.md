---
title: "feat: Smart battery sizing guidance"
type: feat
status: active
date: 2026-05-20
---

# feat: Smart battery sizing guidance

## Overview

The simulation engine produces physically correct results, but users see confusingly low savings for oversized batteries and have no way to understand why. The product needs to compute and display the right battery size for each user's situation, show utilization metrics, and warn when a battery is oversized.

---

## Problem Frame

Root cause analysis revealed: a 3,250 kWh "werkend" household with 4 kWp solar has only ~3.7 kWh of evening demand (17:00-07:00). A 10 kWh battery (9 kWh effective) never empties overnight → never fully recharges → most solar gets exported anyway. The engine correctly models this, producing 130 cycles/year and €292 savings. Industry calculators (plugin-batterij.nl, MobiSolar) use simplified formulas (`capacity × RTE × cycles × spread`) that assume full utilization — they overstate savings for oversized configs. Our simulation is more accurate but currently hides the insight.

The fix: show users WHY certain battery sizes work better, auto-suggest appropriate sizes, and display utilization metrics so the data tells the story.

---

## Requirements Trace

- R1. Compute recommended battery size range from user's evening demand and solar surplus
- R2. Auto-suggest battery sizes for comparison based on consumption/solar ratio
- R3. Show battery utilization % (how much of capacity is used daily on average)
- R4. Warn when selected battery is oversized for the household
- R5. Show evening demand estimate derived from the demand curve
- R6. Keep simulation engine unchanged — it's correct

---

## Scope Boundaries

- Do not change simulation physics or financial model — they're validated
- Do not add dynamic tariff EPEX arbitrage simulation (deferred)
- Do not change profile consumption defaults
- UI design improvements are a separate concern (taste-skill pass)

---

## Context & Research

### Relevant Code

- `src/lib/simulation/constants.ts` — `DEMAND_HOURLY_WEIGHTS`, `HOUSEHOLD_PROFILES`, `BATTERY_SIZE_OPTIONS`, `createDefaultBatteryConfig`
- `src/lib/simulation/engine.ts` — `simulateYear` produces correct physics
- `src/components/calculator/BatterySelector.tsx` — current battery size picker
- `src/components/calculator/Calculator.tsx` — orchestrates state and simulation
- `src/components/calculator/ComparisonTable.tsx` — results display
- `src/components/calculator/InputSection.tsx` — section wrapper

### Key Data (from diagnostic session)

June day trace for 3,250 kWh / 10 panel household with 10 kWh battery:
- Battery never drops below SOC 5.63 kWh (62% full)
- Only charges 3.66 kWh/day in peak summer (41% of 9 kWh effective)
- Exports 9.56 kWh to grid while battery sits full
- Evening demand (19:00-06:00) totals ~3.7 kWh — that's the real battery constraint

### Industry Reference (plugin-batterij.nl)

Realistic cycle counts for NL:
- Conservative: 180 cycles/yr (solar only, no sturing)
- Average: 220 cycles/yr (reasonable surplus, basic sturing)
- Optimistic: 280 cycles/yr (dynamic tariff, smart sturing)

---

## Key Technical Decisions

- **Compute evening demand from the existing demand curve** — sum hourly weights for 17:00-07:00, multiply by daily consumption. No new data source needed.
- **Recommended battery = evening demand × 1.0-1.3** — slight buffer, but not much. A battery bigger than evening demand has sharply diminishing returns.
- **Auto-suggest 3 sizes** — one below sweet spot (budget), sweet spot, one above (margin). Replace hardcoded `DEFAULT_BATTERY_SIZES`.
- **Utilization metric = average daily charge / effective capacity** — already derivable from simulation results (monthly charged / days / effective capacity).

---

## Open Questions

### Resolved During Planning

- **Where to compute evening demand?** In a new helper in `constants.ts` — pure function of consumption + demand weights. No simulation needed.
- **How to show the warning?** Inline in BatterySelector — contextual, not a separate section.

### Deferred to Implementation

- Exact wording of oversized warning in NL/EN
- Whether to show utilization as a number or a visual bar

---

## Implementation Units

- U1. **Evening demand calculator + smart sizing helper**

**Goal:** Add pure functions that compute evening demand and suggest battery sizes from any consumption input.

**Requirements:** R1, R2, R5

**Dependencies:** None

**Files:**
- Create: `src/lib/simulation/sizing.ts`
- Test: `src/__tests__/simulation/sizing.test.ts`

**Approach:**
- `computeEveningDemand(annualConsumptionKwh: number): number` — sums DEMAND_HOURLY_WEIGHTS for hours 17-23 and 0-6, normalizes, multiplies by daily consumption. Returns kWh/evening.
- `suggestBatterySizes(annualConsumptionKwh: number, solarKwp: number): number[]` — returns 3 sizes from BATTERY_SIZE_OPTIONS that bracket the sweet spot (evening demand × 1.0-1.3). Picks closest below, closest match, closest above.
- `computeUtilization(yearResult: YearResult, effectiveCapacity: number): number` — average daily charge / effective capacity as 0-1 ratio.
- `isOversized(sizeKwh: number, eveningDemandKwh: number): boolean` — true when effective size > evening demand × 1.5.

**Test scenarios:**
- Happy path: 3250 kWh werkend → evening demand ~3.7 kWh → suggests [3, 5, 7] or similar small sizes
- Happy path: 5000 kWh family → evening demand ~5.7 kWh → suggests [5, 7, 10]
- Happy path: 10000 kWh high usage → evening demand ~11.4 kWh → suggests [10, 13.5, 15]
- Edge case: 1000 kWh very low → evening demand ~1.1 kWh → suggests smallest available sizes
- Edge case: isOversized(20, 3.7) → true; isOversized(5, 3.7) → false

**Verification:**
- All test scenarios pass
- Evening demand values are plausible (30-60% of daily consumption depending on profile)

---

- U2. **Auto-suggest battery sizes in Calculator**

**Goal:** Replace hardcoded DEFAULT_BATTERY_SIZES with dynamically computed suggestions based on user's consumption and solar.

**Requirements:** R2

**Dependencies:** U1

**Files:**
- Modify: `src/components/calculator/Calculator.tsx`

**Approach:**
- Compute `suggestedSizes` from `formData.consumption` and solar kWp using the new helper
- Use as initial `batterySizes` in state
- Recompute when consumption or solar changes and update batterySizes if user hasn't manually edited them
- Track whether user has manually toggled any battery size (if so, stop auto-updating)

**Test expectation:** none — UI integration. Verified by changing consumption profile and seeing battery suggestions update.

**Verification:**
- Selecting "werkend" (3250 kWh) auto-suggests small batteries (3-7 kWh range)
- Selecting "family" (5000 kWh) auto-suggests medium batteries (5-10 kWh range)
- Manual battery toggle stops auto-updates

---

- U3. **Battery utilization metric in results**

**Goal:** Show battery utilization % in the comparison table — makes oversized batteries obviously visible.

**Requirements:** R3

**Dependencies:** U1

**Files:**
- Modify: `src/lib/simulation/compare.ts` — add utilization to ComparisonResult
- Modify: `src/lib/simulation/types.ts` — add `utilization: number` to ComparisonResult
- Modify: `src/components/calculator/ComparisonTable.tsx` — add utilization row
- Modify: `src/i18n/messages/nl.json` — add "Batterij benutting" translation
- Modify: `src/i18n/messages/en.json` — add "Battery utilization" translation

**Approach:**
- In `compareScenarios`, compute utilization for each battery using `computeUtilization`
- Display as percentage in the comparison table
- Highlight: high utilization (>70%) = good, low (<40%) = amber warning color

**Test scenarios:**
- Happy path: 5 kWh battery for 3250 kWh household → utilization 60-80%
- Happy path: 20 kWh battery for 3250 kWh household → utilization <30%
- Integration: utilization values are consistent with cycle counts

**Verification:**
- Small batteries show high utilization, large batteries show low utilization
- Values are plausible compared to manual calculation

---

- U4. **Oversized warning + evening demand display in BatterySelector**

**Goal:** Show the user their evening demand and warn when selected batteries exceed it significantly.

**Requirements:** R4, R5

**Dependencies:** U1

**Files:**
- Modify: `src/components/calculator/BatterySelector.tsx` — add warning and evening demand display
- Modify: `src/i18n/messages/nl.json` — add warning translations
- Modify: `src/i18n/messages/en.json` — add warning translations

**Approach:**
- Show evening demand estimate above the battery grid: "Jouw avondverbruik: ~X kWh"
- For each battery size that's oversized (>1.5× evening demand), show subtle indicator
- Below the grid, if any selected battery is oversized, show: "Batterijen boven X kWh bieden weinig extra besparing voor jouw verbruik"
- Use `text-brand` for the evening demand number, `text-muted-foreground` for the warning

**Test scenarios:**
- Happy path: 3250 kWh, evening demand 3.7 kWh, selecting 5 kWh → no warning
- Happy path: 3250 kWh, evening demand 3.7 kWh, selecting 10 kWh → warning shown
- Edge case: 6500 kWh, evening demand 7.4 kWh, selecting 10 kWh → no warning
- Integration: warning appears/disappears as consumption profile changes

**Verification:**
- Warning only appears for genuinely oversized combinations
- Evening demand value matches manual calculation from demand curve

---

## System-Wide Impact

- **Interaction graph:** sizing.ts is pure functions consumed by Calculator.tsx and compare.ts. No side effects.
- **Unchanged invariants:** Simulation engine, financial model, and chart components are not touched. All existing energy calculations remain identical.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Auto-suggested sizes might surprise users who expect to see 10/15/20 kWh | Keep all sizes available for manual selection; auto-suggest is a starting point, not a constraint |
| Evening demand calculation assumes fixed demand curve | Acceptable for generic calculator; real data upload would improve this (future feature) |

---

## Sources & References

- Diagnostic session: June day trace showing 10 kWh battery at 62% minimum SOC for 3250 kWh household
- plugin-batterij.nl: 180-280 cycles/year realistic range, `capacity × RTE × cycles × spread` formula
- jeroen.nl/stroomanalyse: reference data for self-consumption by battery size
