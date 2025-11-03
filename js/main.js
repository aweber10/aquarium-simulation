import { AssetLoader } from './core/AssetLoader.js';
import { SpriteVector } from './core/SpriteVector.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { Background } from './sprites/Background.js';
import { Fish } from './sprites/Fish.js';

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

async function bootstrap() {
    try {
        const images = await loader.loadAll();

        const ctx = aquariumCanvas.getContext('2d');
        const background = new Background(ctx, images['Back.gif']);

        controlPanel.renderPlaceholder();
        statusNode.textContent = 'Simulation laeuft.';

        const fishes = createSchool(images, worldBounds);
        fishes.forEach((fish) => spriteVector.add(fish));

        startLoop(ctx, background);
    } catch (error) {
        statusNode.textContent = 'Fehler beim Laden der Ressourcen.';
        console.error('Asset loading failed', error);
    }
}

function createSchool(images, bounds) {
    const leftFrames = [
        images['Neon_gerade_links.gif'],
        images['Neon_oben_links.gif'],
        images['Neon_unten_links.gif']
    ].filter(Boolean);

    const rightFrames = [
        images['Neon_gerade_rechts.gif'],
        images['Neon_oben_rechts.gif'],
        images['Neon_unten_rechts.gif']
    ].filter(Boolean);

    const school = [];
    const count = 6;
    for (let index = 0; index < count; index += 1) {
        const direction = Math.random() > 0.5 ? 'left' : 'right';
        const horizontalSpeed = randomBetween(20, 45);
        const verticalSpeed = randomBetween(-12, 12);

        school.push(
            new Fish({
                imagesLeft: leftFrames,
                imagesRight: rightFrames,
                initialDirection: direction,
                speed: { x: horizontalSpeed, y: verticalSpeed },
                position: {
                    x: randomBetween(bounds.x + 50, bounds.x + bounds.width - 100),
                    y: randomBetween(bounds.y + 30, bounds.y + bounds.height - 80)
                },
                bounds
            })
        );
    }

    return school;
}

function startLoop(ctx, background) {
    let lastTime = performance.now();

    function frame(now) {
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

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

bootstrap();
