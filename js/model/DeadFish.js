import { Component } from './Component.js';
import { DEFAULTS } from './constants.js';

export class DeadFish extends Component {
    constructor(environment) {
        super(environment, 0);
        this.decayRate = DEFAULTS.waste.fishDecayRate;
    }

    update() {
        if (this.value <= 0) {
            return;
        }

        const decayed = this.value * this.decayRate;
        this.value -= decayed;
        this.environment.toxins.value += decayed;
    }
}
