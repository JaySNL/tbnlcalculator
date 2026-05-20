import type { BatteryConfig } from "./types";
import { CALENDAR_AGING_PER_YEAR } from "./constants";

/**
 * Calculate effective battery capacity accounting for cycle degradation
 * and calendar aging.
 *
 * Cycle degradation: linear from 100% at 0 cycles to endOfLifeDegradation
 * at ratedCycles.
 *
 * Calendar aging: 0.5% of nominal capacity lost per year regardless of use.
 *
 * Capacity is floored at nominalCapacity * endOfLifeDegradation.
 */
export function calculateEffectiveCapacity(
  nominalCapacity: number,
  cumulativeCycles: number,
  year: number,
  config: { ratedCycles: number; endOfLifeDegradation: number },
): number {
  // Linear cycle degradation: 1 at 0 cycles, endOfLifeDegradation at ratedCycles
  const cycleFactor =
    1 - (cumulativeCycles / config.ratedCycles) * (1 - config.endOfLifeDegradation);

  // Clamp cycle factor to endOfLifeDegradation floor
  const clampedCycleFactor = Math.min(cycleFactor, 1);
  const effectiveCycleFactor = Math.max(clampedCycleFactor, config.endOfLifeDegradation);

  // Calendar aging: subtract flat percentage per year
  const calendarLoss = year * CALENDAR_AGING_PER_YEAR * nominalCapacity;

  // Combined capacity
  const rawCapacity = nominalCapacity * effectiveCycleFactor - calendarLoss;

  // Floor at end-of-life threshold
  const floor = nominalCapacity * config.endOfLifeDegradation;

  return Math.max(rawCapacity, floor);
}

/**
 * Create a degradation function bound to a specific battery configuration.
 * Returns effective capacity in kWh given cumulative cycles and year number.
 *
 * Intended to be passed into `simulateMultiYear`.
 */
export function createDegradationFn(
  batteryConfig: BatteryConfig,
): (cumulativeCycles: number, year: number) => number {
  return (cumulativeCycles: number, year: number): number =>
    calculateEffectiveCapacity(
      batteryConfig.sizeKwh,
      cumulativeCycles,
      year,
      {
        ratedCycles: batteryConfig.ratedCycles,
        endOfLifeDegradation: batteryConfig.endOfLifeDegradation,
      },
    );
}
