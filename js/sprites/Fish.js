import { Sprite, BoundsAction } from '../core/Sprite.js';

export class Fish extends Sprite {
    constructor({
        imagesLeft,
        imagesRight,
        initialDirection = 'right',
        speed = { x: 30, y: 10 },
        position,
        bounds
    }) {
        const velocity = {
            x: initialDirection === 'left' ? -Math.abs(speed.x) : Math.abs(speed.x),
            y: speed.y ?? 0
        };

        const images = initialDirection === 'left' ? imagesLeft : imagesRight;

        super({
            images,
            position,
            velocity,
            frameDelay: 0.12,
            boundsAction: BoundsAction.BOUNCE,
            zIndex: 10
        });

        this.imagesLeft = imagesLeft;
        this.imagesRight = imagesRight;
        this.bounds = bounds;
    }

    update(delta, bounds) {
        const info = super.update(delta, bounds ?? this.bounds);
        if (info.bouncedX) {
            this.#updateOrientation();
        }
        return info;
    }

    setVelocity(velocity) {
        super.setVelocity(velocity);
        this.#updateOrientation();
    }

    #updateOrientation() {
        this.images = this.velocity.x >= 0 ? this.imagesRight : this.imagesLeft;
        this.frameIndex = 0;
    }
}
