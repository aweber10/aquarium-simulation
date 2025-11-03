export class Background {
    constructor(ctx, image) {
        this.ctx = ctx;
        this.image = image;
    }

    draw() {
        if (!this.ctx || !this.image) {
            return;
        }

        const { width, height } = this.ctx.canvas;
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.drawImage(this.image, 0, 0, width, height);
    }
}
