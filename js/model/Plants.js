import { Component } from './Component.js';
import { DEFAULTS } from './constants.js';

export class Plants extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.plants.start);
        this.max = DEFAULTS.plants.max;
        this.growthRate = DEFAULTS.plants.growthRate;
        this.deathRate = DEFAULTS.plants.deathRate;
        this.photosynthesisRate = DEFAULTS.plants.photosynthesisRate;
    }

    update() {
        const { carbonDioxide, oxygen, light, deadPlants, nutrients } = this.environment;
        const fraction = this.value / this.max;
        const nutrientFactor = Math.max(0.1, Math.min(2, nutrients.value / DEFAULTS.nutrients.feedMid));
        const photosynthesis = fraction * carbonDioxide.value * this.photosynthesisRate * light.value * nutrientFactor;

        carbonDioxide.value = Math.max(DEFAULTS.carbonDioxide.minimum, carbonDioxide.value - photosynthesis);
        oxygen.value = Math.min(DEFAULTS.oxygen.photosynthesisCap, oxygen.value + photosynthesis);

        const logisticGrowth = this.value * (1 + this.growthRate * nutrientFactor * (1 - fraction));
        const decay = this.value * this.deathRate;

        this.value = logisticGrowth - decay;
        deadPlants.value += decay;
        nutrients.value = Math.max(0, nutrients.value - nutrientFactor * 0.5);
        if (this.value < 0) {
            this.value = 0;
        }
    }
}
