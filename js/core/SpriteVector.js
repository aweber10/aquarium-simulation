export class SpriteVector {
    constructor(bounds) {
        this.bounds = bounds ?? { x: 0, y: 0, width: 0, height: 0 };
        this.sprites = [];
    }

    setBounds(bounds) {
        this.bounds = { ...this.bounds, ...bounds };
    }

    add(sprite) {
        this.sprites.push(sprite);
        this.#sortByZIndex();
        return sprite;
    }

    remove(sprite) {
        this.sprites = this.sprites.filter((candidate) => candidate !== sprite);
    }

    clear() {
        this.sprites = [];
    }

    update(delta) {
        this.sprites = this.sprites.filter((sprite) => {
            const info = sprite.update(delta, this.bounds);
            return info.killed !== true;
        });
    }

    draw(ctx) {
        for (const sprite of this.sprites) {
            sprite.draw(ctx);
        }
    }

    #sortByZIndex() {
        this.sprites.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    }
}
