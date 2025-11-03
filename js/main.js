import { AssetLoader } from './core/AssetLoader.js';
import { SpriteVector } from './core/SpriteVector.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { Background } from './sprites/Background.js';
import { Fish } from './sprites/Fish.js';
import { Environment } from './model/Environment.js';

const aquariumCanvas = document.getElementById('aquarium');
const controlPanelNode = document.getElementById('control-panel');
const statusNode = document.getElementById('status');

const loader = new AssetLoader();
const controlPanel = new ControlPanel(controlPanelNode);

const worldBounds = {
    x: 0,
    y: 0,
    width: aquariumCanvas.width,
    height: aquariumCanvas.height
};

const spriteVector = new SpriteVector(worldBounds);
const fishSprites = [];
const INITIAL_FISH_COUNT = 6;
const environment = new Environment({ initialFish: INITIAL_FISH_COUNT });
let fishFrames = {
    left: [],
    right: []
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
            onWaterChange: handleWaterChange
        });

        const initialSnapshot = environment.getSnapshot();
        controlPanel.update(initialSnapshot);
        statusNode.textContent = formatStatus(initialSnapshot);

        spawnInitialSchool(INITIAL_FISH_COUNT);

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

        if (tickResult.fishDied > 0) {
            removeFishSprites(tickResult.fishDied);
        }

        if (tickResult.steps > 0) {
            const snapshot = tickResult.snapshot;
            statusNode.textContent = formatStatus(snapshot);
            controlPanel.update(snapshot);
        }

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

function removeFishSprites(count) {
    for (let index = 0; index < count; index += 1) {
        const sprite = fishSprites.pop();
        if (!sprite) {
            break;
        }
        spriteVector.remove(sprite);
    }
}

function formatStatus(snapshot) {
    const { oxygen, carbonDioxide, toxins, fishCount, averageHealth } = snapshot;
    return [
        `O2 ${oxygen.toFixed(0)}`,
        `CO2 ${carbonDioxide.toFixed(0)}`,
        `Gift ${toxins.toFixed(1)}`,
        `Fische ${fishCount}`,
        `Gesundheit ${averageHealth.toFixed(0)}`
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

function spawnInitialSchool(count) {
    for (let index = 0; index < count; index += 1) {
        spawnFishSprite();
    }
}

function spawnFishSprite(direction = null) {
    if (!fishFrames.left.length || !fishFrames.right.length) {
        return null;
    }

    const chosenDirection = direction ?? (Math.random() > 0.5 ? 'left' : 'right');
    const horizontalSpeed = randomBetween(20, 45);
    const verticalSpeed = randomBetween(-12, 12);

    const sprite = new Fish({
        imagesLeft: fishFrames.left,
        imagesRight: fishFrames.right,
        initialDirection: chosenDirection,
        speed: { x: horizontalSpeed, y: verticalSpeed },
        position: {
            x: randomBetween(worldBounds.x + 50, worldBounds.x + worldBounds.width - 100),
            y: randomBetween(worldBounds.y + 30, worldBounds.y + worldBounds.height - 80)
        },
        bounds: worldBounds
    });

    fishSprites.push(sprite);
    spriteVector.add(sprite);
    return sprite;
}

function handleAddFish() {
    const { added } = environment.addFish(1);
    for (let index = 0; index < added; index += 1) {
        spawnFishSprite();
    }
    syncUi();
}

function handleRemoveFish() {
    const { removed } = environment.removeFish(1);
    if (removed > 0) {
        removeFishSprites(removed);
    }
    syncUi();
}

function handleWaterChange() {
    const snapshot = environment.waterChange();
    syncUi(snapshot);
}

function syncUi(snapshot = null) {
    const currentSnapshot = snapshot ?? environment.getSnapshot();
    controlPanel.update(currentSnapshot);
    statusNode.textContent = formatStatus(currentSnapshot);
}

bootstrap();
