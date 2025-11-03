import { Component } from './Component.js';
import { DEFAULTS, LIMITS } from './constants.js';

export class Oxygen extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.oxygen.start);
    }

    update() {
        if (this.value > LIMITS.maxValue) {
            this.value = LIMITS.maxValue;
        }
    }
}
