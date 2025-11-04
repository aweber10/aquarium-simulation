import { Component } from './Component.js';
import { DEFAULTS, LIMITS } from './constants.js';

export class Toxins extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.toxins.start);
        this.decayRate = DEFAULTS.toxins.decayRate;
    }

    update() {
        const oxygen = this.environment.oxygen.value;
        let targetDecay = DEFAULTS.toxins.decayRate;

        if (oxygen > DEFAULTS.oxygenThresholds.high) {
            targetDecay = DEFAULTS.toxins.highOxygenDecayRate;
        } else if (oxygen > DEFAULTS.oxygenThresholds.medium) {
            targetDecay = DEFAULTS.toxins.decayRate * 1.5;
        }

        const retained = Math.max(0, 1 - targetDecay);
        this.value *= retained;

        const minimum = DEFAULTS.toxins.minimum ?? LIMITS.minValue;
        if (this.value < minimum) {
            this.value = minimum;
        }
    }
}
