/**
 * TBNL Battery Calculation Engine v2.1
 * Refined Physics & Simulation
 */

export function calculateBatteryConfig(formData) {
    const {
        consumption,
        solarPanels,
        solarWp,
        orientation,
        hasHeatPump,
        hasAirco,
        hasPool,
        hasEV,
        evCapacity,
        gridPhase
    } = formData;

    // 1. PV Statistics
    const totalWp = (solarPanels * solarWp) / 1000;

    // Real NL orientation factors (Reference: PVGIS/MilieuCentraal)
    const orientationFactor = {
        south: 1.0,
        east: 0.85,
        west: 0.85,
        north: 0.60,
        'east-west': 0.82,
        mixed: 0.90
    }[orientation] || 1.0;

    // Annual generation in kWh (approx 900-1000 kWh per kWp in NL)
    const annualGeneration = totalWp * 950 * orientationFactor;

    // 2. Consumption Breakdown
    const annualDemand = consumption;
    const avgDailyDemand = annualDemand / 365;
    const avgDailyGen = annualGeneration / 365;

    // 3. Battery Sizing (The "Sweet Spot")
    // Target: Based on Total PV Capacity (kWp)
    // Fixed/Variable: Total kWp * 2
    // Dynamic: Total kWp * 2.5
    const totalKWp = totalWp; // totalWp is already in kW (line 21: (solarPanels * solarWp) / 1000)
    
    let recommendedCapacity = 0;

    if (formData.tariff === 'dynamic') {
        recommendedCapacity = totalKWp * 2.5;
    } else {
        // Default to fixed/variable model
        recommendedCapacity = totalKWp * 2.0;
    }

    // Physical bounds (Standard Home sizes)
    recommendedCapacity = Math.max(2.5, Math.min(25, recommendedCapacity));

    // Inverter Sizing
    // 3-phase allows higher discharge
    let inverterSize = Math.max(totalWp * 0.7, recommendedCapacity / 2.5);
    inverterSize = gridPhase === '1' ? Math.min(5, inverterSize) : Math.min(15, inverterSize);
    inverterSize = Math.round(inverterSize * 2) / 2; // Step of 0.5kW

    // 4. 24-Hour Simulation Model
    // This correctly calculates Autarkie and Zelfconsumptie
    let totalSolarUsedDirectly = 0;
    let totalSolarStored = 0;
    let totalSolarWasted = 0;
    let batteryCharge = 0;

    const flowPoints = Array.from({ length: 24 }, (_, h) => {
        // A: Solar Production (Bell Curve)
        // Peak at 13:00
        const solarFactor = h > 6 && h < 20 ? Math.sin((h - 6) / 13 * Math.PI) : 0;
        const hourlyGen = (avgDailyGen / 6.5) * solarFactor; // Area under sine is about 6.5h of peak

        // B: Demand (M-Curve: Peaks at 8:00 and 19:00)
        let hourlyDemand = (Math.exp(-Math.pow(h - 8, 2) / 6) + Math.exp(-Math.pow(h - 19, 2) / 8) + 0.3) * (avgDailyDemand / 12);

        // Add heavy loads
        if (hasHeatPump && (h < 8 || h > 18)) hourlyDemand += (2000 / 8760) * 24; // Heat pump runs more at night
        if (hasEV && h > 21) hourlyDemand += (evCapacity / 10); // Charging at night (simple model)

        // C: Energy Routing
        const directUsage = Math.min(hourlyGen, hourlyDemand);
        let surplus = hourlyGen - directUsage;
        let deficit = hourlyDemand - directUsage;

        // Battery Logic
        let batteryAction = 0;
        if (surplus > 0) {
            const chargable = Math.min(surplus, recommendedCapacity - batteryCharge, inverterSize);
            batteryCharge += chargable;
            surplus -= chargable;
            batteryAction = chargable;
            totalSolarStored += chargable;
        } else if (deficit > 0) {
            const discharge = Math.min(deficit, batteryCharge, inverterSize);
            batteryCharge -= discharge;
            deficit -= discharge;
            batteryAction = -discharge;
        }

        totalSolarUsedDirectly += directUsage;
        totalSolarWasted += surplus; // Export to grid

        return {
            hour: h,
            solar: Number(hourlyGen.toFixed(2)),
            consumption: Number(hourlyDemand.toFixed(2)),
            batteryLevel: Number(((batteryCharge / recommendedCapacity) * 100).toFixed(0)),
            batteryAction: Number(batteryAction.toFixed(2))
        };
    });

    // D: Summary Metrics
    const totalSolarUsed = totalSolarUsedDirectly + totalSolarStored;

    // Autarkie (Self-Sufficiency): How much of your LOAD is covered by solar
    // Adding an EV increases annualDemand -> This lowers Autarkie % unless battery is huge
    const autarkie = (totalSolarUsed / (avgDailyDemand)) * 100;
    const currentAutarkie = (totalSolarUsedDirectly / avgDailyDemand) * 100;

    // Zelfconsumptie: How much of your SOLAR is used by you
    // Adding an EV increases this % because you waste less surplus
    const selfConsumption = (totalSolarUsed / avgDailyGen) * 100;

    // Financials
    const avgEnergyPrice = 0.35; // €/kWh
    const annualSavings = (totalSolarUsed * 365) * avgEnergyPrice;

    return {
        recommendedCapacity: Number(recommendedCapacity.toFixed(1)),
        inverterSize,
        estimatedGenerationKwh: Math.round(annualGeneration),
        annualSavings: Math.round(annualSavings),
        stats: {
            current: Math.min(35, Math.round(currentAutarkie)),
            projected: Math.min(95, Math.round(autarkie)),
            selfConsumption: Math.min(100, Math.round(selfConsumption))
        },
        flowPoints
    };
}
