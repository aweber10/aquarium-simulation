import { Component } from './Component.js';
import { DEFAULTS } from './constants.js';

export class Algae extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.algae.start);
        this.growthRate = DEFAULTS.algae.growthRate;
        this.photosynthesisRate = DEFAULTS.algae.photosynthesisRate;
    }

    update() {
        const { carbonDioxide, oxygen, light, nutrients } = this.environment;
        const nutrientFactor = Math.max(0.1, Math.min(1.5, nutrients.value / DEFAULTS.nutrients.feedMid));
        const photosynthesis = carbonDioxide.value * this.photosynthesisRate * light.value * nutrientFactor;

        carbonDioxide.value = Math.max(DEFAULTS.carbonDioxide.minimum, carbonDioxide.value - photosynthesis);
        oxygen.value = Math.min(DEFAULTS.oxygen.photosynthesisCap, oxygen.value + photosynthesis);

        this.value *= 1 + this.growthRate * nutrientFactor;
        nutrients.value = Math.max(0, nutrients.value - nutrientFactor * 0.2);
    }
}
