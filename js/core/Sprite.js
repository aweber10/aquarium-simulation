export const BoundsAction = {
    STOP: 'stop',
    WRAP: 'wrap',
    BOUNCE: 'bounce',
    DIE: 'die'
};

export class Sprite {
    constructor({
        images = [],
        position,
        velocity,
        frameDelay = 0.15,
        boundsAction = BoundsAction.STOP,
        zIndex = 0,
        hidden = false
    }) {
        if (!images.length) {
            throw new Error('Sprite requires at least one image frame.');
        }

        this.images = images;
        this.boundsAction = boundsAction;
        this.zIndex = zIndex;
        this.hidden = hidden;

        this.frameDelay = frameDelay;
        this.frameTimer = frameDelay;
        this.frameIndex = 0;

        const baseImage = images[0];
        this.position = {
            x: position?.x ?? 0,
            y: position?.y ?? 0,
            width: position?.width ?? baseImage.width,
            height: position?.height ?? baseImage.height
        };

        this.velocity = {
            x: velocity?.x ?? 0,
            y: velocity?.y ?? 0
        };
    }

    update(delta, bounds) {
        const info = {
            bouncedX: false,
            bouncedY: false,
            wrapped: false,
            killed: false
        };

        if (this.hidden) {
            return info;
        }

        this.#advanceFrame(delta);

        const nextPosition = {
            x: this.position.x + this.velocity.x * delta,
            y: this.position.y + this.velocity.y * delta
        };

        const spriteWidth = this.position.width;
        const spriteHeight = this.position.height;
        const boundsRight = bounds?.x + (bounds?.width ?? 0);
        const boundsBottom = bounds?.y + (bounds?.height ?? 0);

        switch (this.boundsAction) {
            case BoundsAction.WRAP: {
                if (nextPosition.x + spriteWidth < bounds.x) {
                    nextPosition.x = boundsRight;
                    info.wrapped = true;
                } else if (nextPosition.x > boundsRight) {
                    nextPosition.x = bounds.x - spriteWidth;
                    info.wrapped = true;
                }

                if (nextPosition.y + spriteHeight < bounds.y) {
                    nextPosition.y = boundsBottom;
                    info.wrapped = true;
                } else if (nextPosition.y > boundsBottom) {
                    nextPosition.y = bounds.y - spriteHeight;
                    info.wrapped = true;
                }
                break;
            }
            case BoundsAction.BOUNCE: {
                if (nextPosition.x < bounds.x) {
                    nextPosition.x = bounds.x;
                    this.velocity.x = Math.abs(this.velocity.x);
                    info.bouncedX = true;
                } else if (nextPosition.x + spriteWidth > boundsRight) {
                    nextPosition.x = boundsRight - spriteWidth;
                    this.velocity.x = -Math.abs(this.velocity.x);
                    info.bouncedX = true;
                }

                if (nextPosition.y < bounds.y) {
                    nextPosition.y = bounds.y;
                    this.velocity.y = Math.abs(this.velocity.y);
                    info.bouncedY = true;
                } else if (nextPosition.y + spriteHeight > boundsBottom) {
                    nextPosition.y = boundsBottom - spriteHeight;
                    this.velocity.y = -Math.abs(this.velocity.y);
                    info.bouncedY = true;
                }
                break;
            }
            case BoundsAction.DIE: {
                if (
                    nextPosition.x + spriteWidth < bounds.x ||
                    nextPosition.x > boundsRight ||
                    nextPosition.y + spriteHeight < bounds.y ||
                    nextPosition.y > boundsBottom
                ) {
                    info.killed = true;
                }
                break;
            }
            case BoundsAction.STOP:
            default: {
                if (nextPosition.x < bounds.x) {
                    nextPosition.x = bounds.x;
                    info.bouncedX = true;
                } else if (nextPosition.x + spriteWidth > boundsRight) {
                    nextPosition.x = boundsRight - spriteWidth;
                    info.bouncedX = true;
                }

                if (nextPosition.y < bounds.y) {
                    nextPosition.y = bounds.y;
                    info.bouncedY = true;
                } else if (nextPosition.y + spriteHeight > boundsBottom) {
                    nextPosition.y = boundsBottom - spriteHeight;
                    info.bouncedY = true;
                }
            }
        }

        if (!info.killed) {
            this.position.x = nextPosition.x;
            this.position.y = nextPosition.y;
        }

        return info;
    }

    draw(ctx) {
        if (this.hidden) {
            return;
        }

        const frame = this.images[this.frameIndex] ?? this.images[0];
        ctx.drawImage(frame, this.position.x, this.position.y, this.position.width, this.position.height);
    }

    setVelocity(velocity) {
        if (!velocity) {
            return;
        }
        this.velocity.x = velocity.x ?? this.velocity.x;
        this.velocity.y = velocity.y ?? this.velocity.y;
    }

    setPosition(position) {
        if (!position) {
            return;
        }
        this.position.x = position.x ?? this.position.x;
        this.position.y = position.y ?? this.position.y;
        this.position.width = position.width ?? this.position.width;
        this.position.height = position.height ?? this.position.height;
    }

    hide() {
        this.hidden = true;
    }

    show() {
        this.hidden = false;
    }

    #advanceFrame(delta) {
        if (this.images.length <= 1) {
            return;
        }

        this.frameTimer -= delta;
        if (this.frameTimer <= 0) {
            this.frameTimer = this.frameDelay > 0 ? this.frameDelay : 0.15;
            this.frameIndex = (this.frameIndex + 1) % this.images.length;
        }
    }
}
