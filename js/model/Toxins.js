import { Component } from './Component.js';
import { DEFAULTS, LIMITS } from './constants.js';

export class Toxins extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.toxins.start);
        this.decayRate = DEFAULTS.toxins.decayRate;
    }

    update() {
        const oxygen = this.environment.oxygen.value;
        const targetDecay = oxygen > DEFAULTS.oxygenThresholds.high
            ? DEFAULTS.toxins.highOxygenDecayRate
            : DEFAULTS.toxins.decayRate;

        const retained = Math.max(0, 1 - targetDecay);
        this.value *= retained;

        if (this.value < LIMITS.minValue) {
            this.value = LIMITS.minValue;
        }
    }
}
