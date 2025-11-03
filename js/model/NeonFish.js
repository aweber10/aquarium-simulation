import { Component } from './Component.js';
import { DEFAULTS, LIMITS } from './constants.js';

export class NeonFish extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.fish.start);
        this.robustness = DEFAULTS.fish.robustness;
    }

    update() {
        const { oxygen, carbonDioxide, toxins } = this.environment;
        const oxygenConsumption = oxygen.value * DEFAULTS.fish.oxygenConsumptionRate;

        oxygen.value = Math.max(LIMITS.minValue, oxygen.value - oxygenConsumption);
        carbonDioxide.value += oxygenConsumption;
        toxins.value += DEFAULTS.fish.wasteRate;

        if (toxins.value > DEFAULTS.toxinThresholds.danger) {
            this.value -= 1;
        }

        if (oxygen.value < DEFAULTS.oxygenThresholds.low) {
            this.value -= DEFAULTS.oxygenThresholds.low - oxygen.value;
        }

        if (toxins.value < DEFAULTS.toxinThresholds.safe) {
            this.value += 1;
        }

        if (oxygen.value > DEFAULTS.oxygenThresholds.high) {
            this.value += oxygen.value - DEFAULTS.oxygenThresholds.high;
        }

        this.value += Math.random() * 2 - 1;

        if (this.value > LIMITS.maxValue) {
            this.value = LIMITS.maxValue;
        } else if (this.value < LIMITS.minValue) {
            this.value = LIMITS.minValue;
        }

        return {
            dead: this.value < this.robustness
        };
    }
}
