import type { YearResult } from "./types";
import { getDemandHourlyFraction, BATTERY_SIZE_OPTIONS } from "./constants";

/**
 * Compute the evening/night demand (17:00-06:00) as a fraction of daily consumption,
 * then multiply by the user's actual daily consumption.
 *
 * "Evening" hours: 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6
 * These are the hours when solar is not producing and the battery must cover demand.
 */
export function computeEveningDemand(annualConsumptionKwh: number): number {
  const eveningHours = [17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6];

  let eveningWeight = 0;
  let totalWeight = 0;
  for (let h = 0; h < 24; h++) {
    const w = getDemandHourlyFraction(h);
    totalWeight += w;
    if (eveningHours.includes(h)) {
      eveningWeight += w;
    }
  }

  const eveningFraction = totalWeight > 0 ? eveningWeight / totalWeight : 0;
  const dailyConsumption = annualConsumptionKwh / 365;
  return dailyConsumption * eveningFraction;
}

/**
 * Suggest 3 battery sizes from BATTERY_SIZE_OPTIONS that bracket the sweet spot.
 *
 * Sweet spot = evening demand x 1.0 to 1.3 (slight buffer).
 * Picks: one below sweet spot (budget), one at sweet spot, one above (margin).
 * If consumption is very low or very high, clamps to available options.
 */
export function suggestBatterySizes(
  annualConsumptionKwh: number,
  _solarKwp: number,
): number[] {
  const eveningDemand = computeEveningDemand(annualConsumptionKwh);
  const sweetSpot = eveningDemand * 1.15; // middle of the 1.0-1.3 range
  const options = [...BATTERY_SIZE_OPTIONS];

  // Find the closest option to the sweet spot
  let closestIdx = 0;
  let closestDist = Math.abs(options[0] - sweetSpot);
  for (let i = 1; i < options.length; i++) {
    const dist = Math.abs(options[i] - sweetSpot);
    if (dist < closestDist) {
      closestDist = dist;
      closestIdx = i;
    }
  }

  // Pick 3: one below, sweet spot, one above
  // Clamp indices to valid range
  const belowIdx = Math.max(0, closestIdx - 1);
  const aboveIdx = Math.min(options.length - 1, closestIdx + 1);

  // Collect unique sizes in order
  const indices = new Set<number>();
  indices.add(belowIdx);
  indices.add(closestIdx);
  indices.add(aboveIdx);

  // If we only got 2 unique indices (sweet spot is at edge), expand
  if (indices.size < 3) {
    // Try expanding in the other direction
    if (belowIdx > 0) indices.add(belowIdx - 1);
    if (aboveIdx < options.length - 1) indices.add(aboveIdx + 1);
  }

  const result = [...indices]
    .sort((a, b) => a - b)
    .slice(0, 3)
    .map((i) => options[i]);

  return result;
}

/**
 * Compute battery utilization: how much of the battery capacity is actually used daily.
 *
 * utilization = total kWh charged in year / (365 x effectiveCapacity)
 * Returns 0-1 ratio.
 */
export function computeUtilization(
  yearResult: YearResult,
  effectiveCapacity: number,
): number {
  if (effectiveCapacity <= 0) return 0;

  const totalCharged = yearResult.monthlyBreakdown.reduce(
    (sum, m) => sum + m.batteryCharged,
    0,
  );

  return totalCharged / (365 * effectiveCapacity);
}

/**
 * Check if a battery is oversized for the household's evening demand.
 *
 * A battery is oversized when its effective capacity (after DoD) exceeds
 * 1.5x the evening demand — most of the capacity will sit unused.
 */
export function isOversized(
  sizeKwh: number,
  eveningDemandKwh: number,
  dod: number,
): boolean {
  const effectiveSize = sizeKwh * dod;
  return effectiveSize > eveningDemandKwh * 1.5;
}
