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
        start: 100
    },
    carbonDioxide: {
        start: 20
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
    }
};
