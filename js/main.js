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

function vectorLength(vector) {
    return Math.hypot(vector.x, vector.y);
}

function normalizeVector(vector) {
    const length = vectorLength(vector);
    if (length === 0) {
        return { x: 0, y: 0 };
    }
    return { x: vector.x / length, y: vector.y / length };
}

function scaleVector(vector, factor) {
    return {
        x: vector.x * factor,
        y: vector.y * factor
    };
}

function addVectors(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

function clampVectorMagnitude(vector, minLength, maxLength) {
    const length = vectorLength(vector);
    if (length === 0) {
        return { x: 0, y: 0 };
    }

    let targetLength = length;
    if (minLength != null && length < minLength) {
        targetLength = minLength;
    } else if (maxLength != null && length > maxLength) {
        targetLength = maxLength;
    }

    if (targetLength === length) {
        return { x: vector.x, y: vector.y };
    }

    const scale = targetLength / length;
    return scaleVector(vector, scale);
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
        lastDirection: chosenDirection === 'left' ? -1 : 1,
        wanderTimer: randomBetween(0.6, 1.6),
        wanderVector: {
            x: randomBetween(-0.4, 0.4),
            y: randomBetween(-0.25, 0.25)
        }
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

function spriteCenter(sprite) {
    return {
        x: sprite.position.x + sprite.position.width / 2,
        y: sprite.position.y + sprite.position.height / 2
    };
}

function computeEdgeAvoidance(center, vitality) {
    if (vitality <= 0) {
        return { x: 0, y: 0 };
    }

    const horizontalPadding = lerp(45, 140, vitality);
    const verticalPadding = lerp(35, 105, vitality);

    const steer = { x: 0, y: 0 };

    const leftThreshold = worldBounds.x + horizontalPadding;
    const rightThreshold = worldBounds.x + worldBounds.width - horizontalPadding;
    if (center.x < leftThreshold) {
        steer.x += (leftThreshold - center.x) / horizontalPadding;
    } else if (center.x > rightThreshold) {
        steer.x -= (center.x - rightThreshold) / horizontalPadding;
    }

    const topThreshold = worldBounds.y + verticalPadding;
    const bottomThreshold = worldBounds.y + worldBounds.height - verticalPadding;
    if (center.y < topThreshold) {
        steer.y += (topThreshold - center.y) / verticalPadding;
    } else if (center.y > bottomThreshold) {
        steer.y -= (center.y - bottomThreshold) / verticalPadding;
    }

    return steer;
}

// Adjust individual fish velocities based on health-driven swarm dynamics.
function updateFishBehavior(delta) {
    if (!fishEntities.length) {
        return;
    }

    const neighborRadius = 130;
    const separationRadius = 55;
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
            continue;
        }

        const center = spriteCenter(sprite);
        let alignmentSum = { x: 0, y: 0 };
        let cohesionSum = { x: 0, y: 0 };
        let separationSum = { x: 0, y: 0 };
        let neighborCount = 0;

        for (const other of fishEntities) {
            if (other === entity) {
                continue;
            }

            const otherCenter = spriteCenter(other.sprite);
            const offset = {
                x: otherCenter.x - center.x,
                y: otherCenter.y - center.y
            };
            const distance = vectorLength(offset);

            if (distance === 0 || distance > neighborRadius) {
                continue;
            }

            neighborCount += 1;
            alignmentSum = addVectors(alignmentSum, other.sprite.velocity);
            cohesionSum = addVectors(cohesionSum, otherCenter);

            if (distance < separationRadius) {
                const factor = 1 - distance / separationRadius;
                const push = scaleVector(normalizeVector(offset), factor);
                separationSum = addVectors(separationSum, {
                    x: -push.x,
                    y: -push.y
                });
            }
        }

        const alignment = neighborCount > 0
            ? normalizeVector({
                  x: alignmentSum.x / neighborCount,
                  y: alignmentSum.y / neighborCount
              })
            : { x: 0, y: 0 };

        const cohesion = neighborCount > 0
            ? normalizeVector({
                  x: cohesionSum.x / neighborCount - center.x,
                  y: cohesionSum.y / neighborCount - center.y
              })
            : { x: 0, y: 0 };

        const separationMagnitude = Math.min(1.7, vectorLength(separationSum));
        const separation =
            neighborCount > 0 && separationMagnitude > 0
                ? scaleVector(normalizeVector(separationSum), separationMagnitude)
                : { x: 0, y: 0 };

        entity.wanderTimer -= delta;
        if (entity.wanderTimer <= 0) {
            const magnitude = lerp(0.2, 0.85, vitality);
            const angle = randomBetween(0, Math.PI * 2);
            entity.wanderVector = {
                x: Math.cos(angle) * magnitude,
                y: Math.sin(angle) * magnitude * 0.6
            };
            entity.wanderTimer = randomBetween(0.7, 1.8);
        }

        const wander = entity.wanderVector ?? { x: 0, y: 0 };
        const avoidance = computeEdgeAvoidance(center, vitality);

        const alignmentWeight = lerp(0.15, 0.85, vitality);
        const cohesionWeight = lerp(0.03, 0.55, vitality);
        const separationWeight = lerp(1.6, 1.05, vitality);
        const avoidanceWeight = lerp(0.5, 1.1, vitality);
        const wanderWeight = lerp(0.12, 0.35, vitality);

        let desired = { x: 0, y: 0 };
        desired = addVectors(desired, scaleVector(alignment, alignmentWeight));
        desired = addVectors(desired, scaleVector(cohesion, cohesionWeight));
        desired = addVectors(desired, scaleVector(separation, separationWeight));
        desired = addVectors(desired, scaleVector(avoidance, avoidanceWeight));
        desired = addVectors(desired, scaleVector(wander, wanderWeight));

        if (vectorLength(desired) === 0) {
            desired = normalizeVector({ x: currentDirection, y: 0 });
        } else {
            desired = normalizeVector(desired);
        }

        const targetSpeed = lerp(baseSpeed * 0.95, baseSpeed * 1.8, vitality);
        const minSpeed = baseSpeed * 0.55;
        const targetVelocity = scaleVector(desired, targetSpeed);

        const blendFactor = Math.min(1, 0.14 + vitality * 0.32);
        const smoothedVelocity = {
            x: lerp(sprite.velocity.x, targetVelocity.x, blendFactor),
            y: lerp(sprite.velocity.y, targetVelocity.y, blendFactor)
        };

        let limitedVelocity = vectorLength(smoothedVelocity) === 0
            ? scaleVector(desired, minSpeed)
            : clampVectorMagnitude(smoothedVelocity, minSpeed, targetSpeed);
        const maxVertical = 35 + vitality * 28;
        limitedVelocity.y = Math.max(-maxVertical, Math.min(maxVertical, limitedVelocity.y));

        if (
            Math.abs(sprite.velocity.x - limitedVelocity.x) > 0.02 ||
            Math.abs(sprite.velocity.y - limitedVelocity.y) > 0.02
        ) {
            sprite.setVelocity(limitedVelocity);
            entity.lastDirection = Math.sign(limitedVelocity.x) || entity.lastDirection || 1;
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
