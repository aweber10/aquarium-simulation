import { Component } from './Component.js';
import { DEFAULTS } from './constants.js';

export class CarbonDioxide extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.carbonDioxide.start);
    }

    update() {
        const minimum = DEFAULTS.carbonDioxide.minimum ?? 0;
        const regenerationRate = DEFAULTS.carbonDioxide.regenerationRate ?? 0;

        if (this.value < minimum) {
            if (regenerationRate > 0) {
                this.value += (minimum - this.value) * regenerationRate;
            } else {
                this.value = minimum;
            }
        }
    }
}
