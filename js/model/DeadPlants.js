import { Component } from './Component.js';
import { DEFAULTS } from './constants.js';

export class DeadPlants extends Component {
    constructor(environment) {
        super(environment, 0);
        this.decayRate = DEFAULTS.waste.plantDecayRate;
        this.toxicity = DEFAULTS.waste.plantToxicity;
    }

    update() {
        if (this.value <= 0) {
            return;
        }

        const decayed = this.value * this.decayRate;
        this.value -= decayed;
        this.environment.toxins.value += decayed * this.toxicity;
    }
}
