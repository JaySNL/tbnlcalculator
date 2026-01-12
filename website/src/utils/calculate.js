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
    // Formula: Max(PV Capacity, Peak Consumer Power)
    // Minimum sizes: Heatpump -> 5kW.
    // EV 3-phase -> 11kW, 1-phase -> 3.7kW (approx 4-5kW inverter)
    // Overig -> 3, 5, or 8kW.

    // 1. Calculate Peak Load Requirement
    let peakLoad = 3; // Base household peak
    if (hasHeatPump) peakLoad = Math.max(peakLoad, 5);
    if (formData.hasOther) peakLoad = Math.max(peakLoad, formData.otherCapacity || 3);
    if (hasEV) {
        // If 3-phase, EV can pull 11kW. Inverter needs to support this if off-grid/hybrid, 
        // but typically for grid-tied we just match the max draw we want to support from battery+solar?
        // User request: "make sure the EV charger can use full power from inverter".
        const evPeak = gridPhase === '3' ? 11 : 5;
        peakLoad = Math.max(peakLoad, evPeak);
    }

    // 2. Initial Inverter Size based on PV
    // Typically Inverter is 80-100% of PV kWp, but sometimes smaller is allowed (clipping).
    // Here we ensure it covers the PV OR the Peak Load.
    let inverterSize = Math.max(totalWp, peakLoad);

    // 3. Phase Constraints
    if (gridPhase === '1') {
        inverterSize = Math.min(5, inverterSize);
    } else {
        inverterSize = Math.min(20, inverterSize); // Cap at 20kW for residential
    }

    // Round to nearest 0.5
    inverterSize = Math.ceil(inverterSize * 2) / 2;

    // 4. Seasonal Simulation Model (Monthly)
    // This allows for realistic 'Winter Dip' and 'Summer Surplus' logic

    const MONTH_WEIGHTS = [
        { name: 'Jan', sol: 0.03, dem: 1.15 },
        { name: 'Feb', sol: 0.05, dem: 1.10 },
        { name: 'Mar', sol: 0.10, dem: 1.05 },
        { name: 'Apr', sol: 0.14, dem: 0.95 },
        { name: 'May', sol: 0.16, dem: 0.90 },
        { name: 'Jun', sol: 0.17, dem: 0.85 },
        { name: 'Jul', sol: 0.16, dem: 0.85 },
        { name: 'Aug', sol: 0.14, dem: 0.85 },
        { name: 'Sep', sol: 0.11, dem: 0.90 },
        { name: 'Oct', sol: 0.08, dem: 1.00 },
        { name: 'Nov', sol: 0.04, dem: 1.10 },
        { name: 'Dec', sol: 0.02, dem: 1.20 }
    ];

    let annualSolarDirect = 0;
    let annualBatteryYield = 0;

    let flowPoints = []; // We will store June (Peak) data for the graph

    MONTH_WEIGHTS.forEach((m, idx) => {
        const daysInMonth = 30.5;
        const dailyGen = (annualGeneration * m.sol) / daysInMonth;
        const dailyDemand = (annualDemand * m.dem) / 365;

        // Run 24h simulation for this "Typical Month Day"
        let monthSolarDirect = 0;
        let monthBatteryYield = 0;
        let monthBatteryCharge = 0; // Reset battery state daily for avg model (simplified)

        // Simulation arrays for graph (only saving June)
        const isGraphMonth = idx === 5; // June
        const dailyPoints = [];

        for (let h = 0; h < 24; h++) {
            // A. Solar Curve (Bell)
            const sunHour = h > 5 && h < 21;
            const solarFactor = sunHour ? Math.sin((h - 5) / 16 * Math.PI) : 0;
            const hourlyGen = (dailyGen / 8) * solarFactor; // Approx distribution

            // B. Demand Curve (Morning/Evening Peaks)
            let hourlyDemand = (Math.exp(-Math.pow(h - 8, 2) / 6) + Math.exp(-Math.pow(h - 19, 2) / 8) + 0.3) * (dailyDemand / 12);

            // Add Appliance Load Profiles
            if (hasHeatPump) {
                const winterFactor = m.dem > 1.0 ? 1.5 : 0.2;
                if (h < 9 || h > 17) hourlyDemand += (2.5 * winterFactor);
            }
            if (hasEV && h > 18) {
                hourlyDemand += (evCapacity / 6);
            }
            if (formData.hasOther && (h === 18 || h === 19)) {
                hourlyDemand += (formData.otherCapacity || 3) * 0.5;
            }

            // C. Energy Routing
            const directUsage = Math.min(hourlyGen, hourlyDemand);
            let surplus = hourlyGen - directUsage;
            let deficit = hourlyDemand - directUsage;

            // Battery logic
            let batteryAction = 0;
            if (surplus > 0) {
                const canCharge = Math.min(surplus, recommendedCapacity - monthBatteryCharge, inverterSize);
                monthBatteryCharge += canCharge;
                surplus -= canCharge;
                batteryAction = canCharge;
            } else if (deficit > 0) {
                const canDischarge = Math.min(deficit, monthBatteryCharge, inverterSize);
                monthBatteryCharge -= canDischarge;
                monthBatteryYield += canDischarge;
                deficit -= canDischarge;
                batteryAction = -canDischarge;
            }

            monthSolarDirect += directUsage;

            if (isGraphMonth) {
                dailyPoints.push({
                    hour: h,
                    solar: Number(hourlyGen.toFixed(2)),
                    consumption: Number(hourlyDemand.toFixed(2)),
                    batteryLevel: Number(((monthBatteryCharge / recommendedCapacity) * 100).toFixed(0)),
                    batteryAction: Number(batteryAction.toFixed(2))
                });
            }
        }

        if (isGraphMonth) flowPoints = dailyPoints;

        // Accumulate Annual Data
        annualSolarDirect += (monthSolarDirect * daysInMonth);
        annualBatteryYield += (monthBatteryYield * daysInMonth);
    });

    // D: Summary Metrics
    const totalSolarUsed = annualSolarDirect + annualBatteryYield;

    // Autarkie
    const autarkie = (totalSolarUsed / annualDemand) * 100;
    const currentAutarkie = (annualSolarDirect / annualDemand) * 100;

    // Zelfconsumptie
    const selfConsumption = (totalSolarUsed / annualGeneration) * 100;

    // Financials
    const energyPrice = formData.tariff === 'dynamic' ? 0.21 : 0.28;

    // Savings Logic
    const annualSavings = totalSolarUsed * energyPrice;

    return {
        recommendedCapacity: Number(recommendedCapacity.toFixed(1)),
        inverterSize,
        estimatedGenerationKwh: Math.round(annualGeneration),
        annualSavings: Math.round(annualSavings),
        stats: {
            current: Math.min(100, Math.round(currentAutarkie)),
            projected: Math.min(99, Math.round(autarkie)),
            selfConsumption: Math.min(100, Math.round(selfConsumption))
        },
        flowPoints
    };
}
