import { AssetLoader } from './core/AssetLoader.js';
import { SpriteVector } from './core/SpriteVector.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { Background } from './sprites/Background.js';
import { Fish } from './sprites/Fish.js';
import { Environment } from './model/Environment.js';
import { DEFAULTS } from './model/constants.js';

const aquariumCanvas = document.getElementById('aquarium');
const controlPanelNode = document.getElementById('control-panel');
const simulationControlsNode = document.getElementById('simulation-controls');
const statusNode = document.getElementById('status');

const loader = new AssetLoader();
const controlPanel = new ControlPanel(controlPanelNode, simulationControlsNode);

const worldBounds = {
    x: 0,
    y: 0,
    width: aquariumCanvas.width,
    height: aquariumCanvas.height
};

const spriteVector = new SpriteVector(worldBounds);
const fishEntities = [];
const INITIAL_FISH_COUNT = 6;
const environment = new Environment({ initialFish: INITIAL_FISH_COUNT });
let fishFrames = {
    left: [],
    right: []
};
const FEED_LEVELS = {
    low: DEFAULTS.nutrients.feedLow,
    medium: DEFAULTS.nutrients.feedMid,
    high: DEFAULTS.nutrients.feedHigh
};

const LIGHT_LEVELS = {
    low: DEFAULTS.light.low,
    medium: DEFAULTS.light.medium,
    high: DEFAULTS.light.high
};

async function bootstrap() {
    try {
        const images = await loader.loadAll();

        const ctx = aquariumCanvas.getContext('2d');
        const background = new Background(ctx, images['Back.gif']);

        fishFrames = prepareFishFrames(images);

        controlPanel.render({
            onAddFish: handleAddFish,
            onRemoveFish: handleRemoveFish,
            onWaterChange: handleWaterChange,
            onFeedChange: handleFeedChange,
            onLightChange: handleLightChange
        });

        const initialSnapshot = environment.getSnapshot();
        controlPanel.update(initialSnapshot);
        statusNode.textContent = formatStatus(initialSnapshot);

        syncFishEntities();

        startLoop(ctx, background);
    } catch (error) {
        statusNode.textContent = 'Fehler beim Laden der Ressourcen.';
        console.error('Asset loading failed', error);
    }
}

function startLoop(ctx, background) {
    let lastTime = performance.now();

    function frame(now) {
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        const tickResult = environment.tick(delta);

        if (tickResult.steps > 0) {
            const snapshot = tickResult.snapshot;
            statusNode.textContent = formatStatus(snapshot);
            controlPanel.update(snapshot);
        }

        syncFishEntities();
        updateFishBehavior(delta);

        background.draw();
        spriteVector.update(delta);
        spriteVector.draw(ctx);

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function lerp(from, to, t) {
    const clamped = Math.max(0, Math.min(1, t));
    return from + (to - from) * clamped;
}

function formatStatus(snapshot) {
    const { oxygen, carbonDioxide, toxins, fishCount, averageHealth, plants, algae } = snapshot;
    return [
        `O2 ${oxygen.toFixed(0)}`,
        `CO2 ${carbonDioxide.toFixed(0)}`,
        `Gift ${toxins.toFixed(1)}`,
        `Fische ${fishCount}`,
        `Gesundheit ${averageHealth.toFixed(0)}`,
        `Pfl ${plants.toFixed(0)}`,
        `Alg ${algae.toFixed(1)}`
    ].join(' | ');
}

function prepareFishFrames(images) {
    return {
        left: [
            images['Neon_gerade_links.gif'],
            images['Neon_oben_links.gif'],
            images['Neon_unten_links.gif']
        ].filter(Boolean),
        right: [
            images['Neon_gerade_rechts.gif'],
            images['Neon_oben_rechts.gif'],
            images['Neon_unten_rechts.gif']
        ].filter(Boolean)
    };
}

function createFishEntity(model, direction = null) {
    if (!fishFrames.left.length || !fishFrames.right.length) {
        return null;
    }

    const chosenDirection = direction ?? (Math.random() > 0.5 ? 'left' : 'right');
    const baseSpeed = randomBetween(20, 45);
    const verticalSpeed = randomBetween(-12, 12);

    const sprite = new Fish({
        imagesLeft: fishFrames.left,
        imagesRight: fishFrames.right,
        initialDirection: chosenDirection,
        speed: { x: baseSpeed, y: verticalSpeed },
        position: {
            x: randomBetween(worldBounds.x + 50, worldBounds.x + worldBounds.width - 100),
            y: randomBetween(worldBounds.y + 30, worldBounds.y + worldBounds.height - 80)
        },
        bounds: worldBounds
    });

    const entity = {
        model,
        sprite,
        baseSpeed,
        turnCooldown: randomBetween(1.5, 3.5),
        lastDirection: chosenDirection === 'left' ? -1 : 1
    };

    fishEntities.push(entity);
    spriteVector.add(sprite);
    return entity;
}

function syncFishEntities() {
    if (!fishFrames.left.length || !fishFrames.right.length) {
        return;
    }

    const models = environment.fish;

    for (let index = fishEntities.length - 1; index >= 0; index -= 1) {
        const entity = fishEntities[index];
        if (!models.includes(entity.model)) {
            spriteVector.remove(entity.sprite);
            fishEntities.splice(index, 1);
        }
    }

    for (const model of models) {
        const exists = fishEntities.some((entity) => entity.model === model);
        if (!exists) {
            createFishEntity(model);
        }
    }
}

function edgeDistances(sprite) {
    const { x, y, width, height } = sprite.position;
    return {
        left: x - worldBounds.x,
        right: worldBounds.x + worldBounds.width - (x + width),
        top: y - worldBounds.y,
        bottom: worldBounds.y + worldBounds.height - (y + height)
    };
}

function computeEdgeAvoidance(edges, vitality) {
    if (vitality <= 0) {
        return { x: 0, y: 0 };
    }

    const marginX = 90;
    const marginY = 70;
    const steer = { x: 0, y: 0 };

    if (edges.left < marginX) {
        steer.x += ((marginX - edges.left) / marginX) * 60 * vitality;
    }
    if (edges.right < marginX) {
        steer.x -= ((marginX - edges.right) / marginX) * 60 * vitality;
    }
    if (edges.top < marginY) {
        steer.y += ((marginY - edges.top) / marginY) * 45 * vitality;
    }
    if (edges.bottom < marginY) {
        steer.y -= ((marginY - edges.bottom) / marginY) * 45 * vitality;
    }

    return steer;
}

// Adjust individual fish velocities based on health-driven swarm dynamics.
function updateFishBehavior(delta) {
    if (!fishEntities.length) {
        return;
    }

    const neighborRadius = 140;
    const separationRadius = 45;
    const lowHealthSpeed = 12;

    for (const entity of fishEntities) {
        const { sprite, model, baseSpeed } = entity;
        const health = Math.max(0, Math.min(model.value ?? 0, 100));
        const vitality = health <= 50 ? 0 : (health - 50) / 50;
        const currentDirection = Math.sign(sprite.velocity.x) || entity.lastDirection || 1;

        if (vitality <= 0) {
            const calmSpeed = Math.max(lowHealthSpeed, baseSpeed * 0.75);
            const newVelocity = {
                x: currentDirection * calmSpeed,
                y: 0
            };
            if (Math.abs(sprite.velocity.x - newVelocity.x) > 0.1 || Math.abs(sprite.velocity.y) > 0.1) {
                sprite.setVelocity(newVelocity);
            }
            entity.lastDirection = Math.sign(newVelocity.x) || entity.lastDirection || 1;
            entity.turnCooldown = Math.max(entity.turnCooldown ?? 0, 0);
            continue;
        }

        let alignment = { x: 0, y: 0 };
        let cohesion = { x: 0, y: 0 };
        let separation = { x: 0, y: 0 };
        let neighborCount = 0;

        for (const other of fishEntities) {
            if (other === entity) {
                continue;
            }

            const dx = other.sprite.position.x - sprite.position.x;
            const dy = other.sprite.position.y - sprite.position.y;
            const distance = Math.hypot(dx, dy);

            if (distance === 0 || distance > neighborRadius) {
                continue;
            }

            neighborCount += 1;
            alignment.x += other.sprite.velocity.x;
            alignment.y += other.sprite.velocity.y;
            cohesion.x += other.sprite.position.x;
            cohesion.y += other.sprite.position.y;

            if (distance < separationRadius) {
                const factor = (separationRadius - distance) / separationRadius;
                separation.x -= (dx / distance) * factor;
                separation.y -= (dy / distance) * factor;
            }
        }

        if (neighborCount > 0) {
            alignment.x = alignment.x / neighborCount - sprite.velocity.x;
            alignment.y = alignment.y / neighborCount - sprite.velocity.y;
            cohesion.x = cohesion.x / neighborCount - sprite.position.x;
            cohesion.y = cohesion.y / neighborCount - sprite.position.y;
        }

        const edges = edgeDistances(sprite);
        const avoidance = computeEdgeAvoidance(edges, vitality);
        const wanderStrength = lerp(2, 24, vitality);
        const wander = {
            x: (Math.random() - 0.5) * wanderStrength,
            y: (Math.random() - 0.5) * wanderStrength * 0.6
        };

        let newVelocity = {
            x:
                sprite.velocity.x +
                alignment.x * (0.5 * vitality) +
                cohesion.x * (0.35 * vitality) +
                separation.x * 1.2 +
                avoidance.x +
                wander.x * 0.2,
            y:
                sprite.velocity.y +
                alignment.y * (0.5 * vitality) +
                cohesion.y * (0.35 * vitality) +
                separation.y * 1.2 +
                avoidance.y +
                wander.y * 0.3
        };

        entity.turnCooldown = (entity.turnCooldown ?? randomBetween(1.5, 3.5)) - delta;
        const nearHorizontalEdge = Math.min(edges.left, edges.right) < 65;
        const nearVerticalEdge = Math.min(edges.top, edges.bottom) < 50;

        if (
            entity.turnCooldown <= 0 &&
            (nearHorizontalEdge || Math.random() < (0.2 + vitality * 0.4) * delta)
        ) {
            const turnDirection = nearHorizontalEdge
                ? edges.left < edges.right
                    ? 1
                    : -1
                : -Math.sign(sprite.velocity.x || entity.lastDirection || 1);

            newVelocity.x = turnDirection * lerp(baseSpeed, baseSpeed * 1.6, vitality);
            newVelocity.y += (Math.random() - 0.5) * baseSpeed * 0.6;
            entity.turnCooldown = randomBetween(1.2, 3.5) / (0.4 + vitality);
        } else if (nearVerticalEdge) {
            newVelocity.y *= -1;
        }

        const desiredSpeed = lerp(baseSpeed, baseSpeed * 1.8, vitality);
        const minSpeed = baseSpeed * 0.6;
        const currentSpeed = Math.hypot(newVelocity.x, newVelocity.y) || 0.0001;

        if (currentSpeed > desiredSpeed) {
            const scale = desiredSpeed / currentSpeed;
            newVelocity.x *= scale;
            newVelocity.y *= scale;
        } else if (currentSpeed < minSpeed) {
            const scale = minSpeed / currentSpeed;
            newVelocity.x *= scale;
            newVelocity.y *= scale;
        }

        const maxVertical = 35 + vitality * 25;
        newVelocity.y = Math.max(-maxVertical, Math.min(maxVertical, newVelocity.y));

        if (
            Math.abs(sprite.velocity.x - newVelocity.x) > 0.05 ||
            Math.abs(sprite.velocity.y - newVelocity.y) > 0.05
        ) {
            sprite.setVelocity(newVelocity);
            entity.lastDirection = Math.sign(newVelocity.x) || entity.lastDirection || 1;
        }
    }
}

function handleAddFish() {
    const { added } = environment.addFish(1);
    if (added > 0) {
        syncFishEntities();
    }
    syncUi();
}

function handleRemoveFish() {
    const { removed } = environment.removeFish(1);
    if (removed > 0) {
        syncFishEntities();
    }
    syncUi();
}

function handleWaterChange() {
    const snapshot = environment.waterChange();
    syncUi(snapshot);
}

function handleFeedChange(level) {
    const target = FEED_LEVELS[level] ?? FEED_LEVELS.medium;
    const snapshot = environment.setNutrientLevel(target);
    syncUi(snapshot);
}

function handleLightChange(level) {
    const target = LIGHT_LEVELS[level] ?? LIGHT_LEVELS.medium;
    const snapshot = environment.setLightLevel(target);
    syncUi(snapshot);
}

function syncUi(snapshot = null) {
    const currentSnapshot = snapshot ?? environment.getSnapshot();
    controlPanel.update(currentSnapshot);
    statusNode.textContent = formatStatus(currentSnapshot);
}

bootstrap();
