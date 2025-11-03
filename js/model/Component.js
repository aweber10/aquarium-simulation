import { LIMITS } from './constants.js';

export class Component {
    constructor(environment, initialValue = 0) {
        this.environment = environment;
        this.value = initialValue;
    }

    update() {
        // Subclasses implement their own behaviour
    }

    clamp() {
        if (this.value < LIMITS.minValue) {
            this.value = LIMITS.minValue;
        } else if (this.value > LIMITS.maxValue) {
            this.value = LIMITS.maxValue;
        }
    }
}
