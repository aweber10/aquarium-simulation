export class Pointd {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Pointd(this.x, this.y);
    }

    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
        return this;
    }

    static from(obj = {}) {
        return new Pointd(obj.x ?? 0, obj.y ?? 0);
    }
}
