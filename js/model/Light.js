import { Component } from './Component.js';
import { DEFAULTS, LIMITS } from './constants.js';

export class Light extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.light.start);
    }

    setLevel(value) {
        this.value = Math.max(LIMITS.minValue, Math.min(20, value));
    }
}
