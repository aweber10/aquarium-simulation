import { Oxygen } from './Oxygen.js';
import { CarbonDioxide } from './CarbonDioxide.js';
import { Toxins } from './Toxins.js';
import { NeonFish } from './NeonFish.js';
import { MODEL_INTERVAL_SECONDS } from './constants.js';

export class Environment {
    constructor({ initialFish = 0 } = {}) {
        this.oxygen = new Oxygen(this);
        this.carbonDioxide = new CarbonDioxide(this);
        this.toxins = new Toxins(this);
        this.fish = [];
        this.accumulator = 0;

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
        this.carbonDioxide.value = Math.max(this.carbonDioxide.value - 10, 0);
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
            averageHealth
        };
    }

    #applyStep() {
        let deaths = 0;

        this.fish = this.fish.filter((fish) => {
            const { dead } = fish.update();
            if (dead) {
                deaths += 1;
                return false;
            }
            return true;
        });

        this.oxygen.update();
        this.carbonDioxide.clamp();
        this.toxins.update();
        this.carbonDioxide.clamp();

        return deaths;
    }
}
