export const MODEL_INTERVAL_SECONDS = 1;

export const LIMITS = {
    minValue: 0,
    maxValue: 100
};

export const DEFAULTS = {
    fish: {
        start: 50,
        robustness: 20,
        oxygenConsumptionRate: 0.0008,
        wasteRate: 0.0006
    },
    oxygen: {
        start: 100,
        photosynthesisCap: 120
    },
    carbonDioxide: {
        start: 20,
        minimum: 8,
        regenerationRate: 0.05
    },
    toxins: {
        start: 2,
        decayRate: 0.0015,
        highOxygenDecayRate: 0.004,
        minimum: 0.5
    },
    toxinThresholds: {
        danger: 5,
        safe: 1
    },
    oxygenThresholds: {
        low: 40,
        medium: 60,
        high: 80
    },
    plants: {
        start: 500,
        max: 5000,
        growthRate: 0.005,
        deathRate: 0.0005,
        photosynthesisRate: 0.0008
    },
    algae: {
        start: 1,
        growthRate: 0.0008,
        photosynthesisRate: 0.0006,
        max: 50
    },
    nutrients: {
        start: 100,
        feedLow: 80,
        feedMid: 100,
        feedHigh: 120
    },
    light: {
        start: 12,
        low: 11,
        medium: 12,
        high: 13
    },
    waste: {
        plantDecayRate: 0.02,
        fishDecayRate: 0.002,
        plantToxicity: 0.008
    }
};
