import { Component } from './Component.js';
import { DEFAULTS, LIMITS } from './constants.js';

export class Oxygen extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.oxygen.start);
    }

    update() {
        const cap = Math.min(DEFAULTS.oxygen.photosynthesisCap ?? LIMITS.maxValue, LIMITS.maxValue);
        if (this.value > cap) {
            this.value = cap;
        }
    }
}
