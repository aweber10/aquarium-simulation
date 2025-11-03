import { Component } from './Component.js';
import { DEFAULTS, LIMITS } from './constants.js';

export class Nutrients extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.nutrients.start);
    }

    setLevel(value) {
        const max = DEFAULTS.nutrients.feedHigh;
        this.value = Math.max(LIMITS.minValue, Math.min(max, value));
    }
}
