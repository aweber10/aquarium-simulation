import { Oxygen } from './Oxygen.js';
import { CarbonDioxide } from './CarbonDioxide.js';
import { Toxins } from './Toxins.js';
import { NeonFish } from './NeonFish.js';
import { DEFAULTS, MODEL_INTERVAL_SECONDS } from './constants.js';
import { Plants } from './Plants.js';
import { Algae } from './Algae.js';
import { Nutrients } from './Nutrients.js';
import { Light } from './Light.js';
import { DeadPlants } from './DeadPlants.js';
import { DeadFish } from './DeadFish.js';

export class Environment {
    constructor({ initialFish = 0 } = {}) {
        this.oxygen = new Oxygen(this);
        this.carbonDioxide = new CarbonDioxide(this);
        this.toxins = new Toxins(this);
        this.light = new Light(this);
        this.nutrients = new Nutrients(this);
        this.plants = new Plants(this);
        this.algae = new Algae(this);
        this.deadPlants = new DeadPlants(this);
        this.deadFish = new DeadFish(this);
        this.fish = [];
        this.accumulator = 0;
        this.feedLevel = 'medium';
        this.lightLevel = 'medium';

        if (initialFish > 0) {
            this.addFish(initialFish);
        }
    }

    addFish(count = 1) {
        let added = 0;
        for (let index = 0; index < count; index += 1) {
            this.fish.push(new NeonFish(this));
            added += 1;
        }
        return { added, total: this.fish.length };
    }

    removeFish(count = 1) {
        const removable = Math.min(count, this.fish.length);
        if (removable > 0) {
            const start = this.fish.length - removable;
            this.fish.splice(start, removable);
        }
        return { removed: removable, total: this.fish.length };
    }

    waterChange() {
        this.toxins.value *= 0.35;
        this.oxygen.value = Math.min(this.oxygen.value + 15, 100);
        const carbonMinimum = DEFAULTS.carbonDioxide.minimum ?? 0;
        this.carbonDioxide.value = Math.max(carbonMinimum, this.carbonDioxide.value - 10);
        this.deadPlants.value *= 0.5;
        this.deadFish.value *= 0.5;
        return this.getSnapshot();
    }

    setNutrientLevel(value) {
        this.nutrients.setLevel(value);
        this.feedLevel = value <= 90 ? 'low' : value >= 110 ? 'high' : 'medium';
        return this.getSnapshot();
    }

    setLightLevel(value) {
        this.light.setLevel(value);
        this.lightLevel = value <= 11 ? 'low' : value >= 13 ? 'high' : 'medium';
        return this.getSnapshot();
    }

    tick(deltaSeconds) {
        this.accumulator += deltaSeconds;
        const result = {
            steps: 0,
            fishDied: 0
        };

        while (this.accumulator >= MODEL_INTERVAL_SECONDS) {
            this.accumulator -= MODEL_INTERVAL_SECONDS;
            result.steps += 1;
            result.fishDied += this.#applyStep();
        }

        result.snapshot = this.getSnapshot();
        return result;
    }

    getSnapshot() {
        const totalHealth = this.fish.reduce((sum, fish) => sum + fish.value, 0);
        const averageHealth = this.fish.length > 0 ? totalHealth / this.fish.length : 0;

        return {
            oxygen: this.oxygen.value,
            carbonDioxide: this.carbonDioxide.value,
            toxins: this.toxins.value,
            fishCount: this.fish.length,
            averageHealth,
            plants: this.plants.value,
            algae: this.algae.value,
            light: this.light.value,
            nutrients: this.nutrients.value,
            feedLevel: this.feedLevel,
            lightLevel: this.lightLevel
        };
    }

    #applyStep() {
        let deaths = 0;

        this.fish = this.fish.filter((fish) => {
            const { dead } = fish.update();
            if (dead) {
                deaths += 1;
                this.deadFish.value += 10;
                return false;
            }
            return true;
        });

        this.light.update();
        this.plants.update();
        this.algae.update();
        this.oxygen.update();
        this.carbonDioxide.update();
        this.toxins.update();
        this.deadPlants.update();
        this.deadFish.update();
        this.carbonDioxide.clamp();

        return deaths;
    }
}
