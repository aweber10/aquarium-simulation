export const MODEL_INTERVAL_SECONDS = 1;

export const LIMITS = {
    minValue: 0,
    maxValue: 100
};

export const DEFAULTS = {
    fish: {
        start: 50,
        robustness: 20,
        oxygenConsumptionRate: 0.01,
        wasteRate: 0.001
    },
    oxygen: {
        start: 100,
        photosynthesisCap: 120
    },
    carbonDioxide: {
        start: 20,
        minimum: 0
    },
    toxins: {
        start: 2,
        decayRate: 0.001,
        highOxygenDecayRate: 0.002
    },
    toxinThresholds: {
        danger: 5,
        safe: 1
    },
    oxygenThresholds: {
        low: 40,
        high: 80
    },
    plants: {
        start: 500,
        max: 5000,
        growthRate: 0.01,
        deathRate: 0.001,
        photosynthesisRate: 0.01
    },
    algae: {
        start: 1,
        growthRate: 0.001,
        photosynthesisRate: 0.001
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
        plantDecayRate: 0.01,
        fishDecayRate: 0.001,
        plantToxicity: 0.01
    }
};
