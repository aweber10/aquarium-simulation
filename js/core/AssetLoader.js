const IMAGE_LIST = [
    'Back.gif',
    'Neon_gerade_links.gif',
    'Neon_gerade_rechts.gif',
    'Neon_oben_links.gif',
    'Neon_oben_rechts.gif',
    'Neon_unten_links.gif',
    'Neon_unten_rechts.gif',
    'plus.gif',
    'plus_over.gif',
    'plus_pressed.gif',
    'minus.gif',
    'minus_over.gif',
    'minus_pressed.gif',
    'close.gif',
    'close_over.gif',
    'close_pressed.gif',
    'wb1.gif',
    'wb2.gif'
];

export class AssetLoader {
    constructor(basePath = './assets/images/') {
        this.basePath = basePath;
        this.images = new Map();
    }

    async loadAll() {
        const promises = IMAGE_LIST.map((name) => this.#loadImage(name));
        await Promise.all(promises);
        return Object.fromEntries(this.images);
    }

    async #loadImage(name) {
        if (this.images.has(name)) {
            return this.images.get(name);
        }

        const src = `${this.basePath}${name}`;
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (event) => reject(new Error(`Image failed to load: ${src}`, { cause: event }));
            img.src = src;
        });

        this.images.set(name, image);
        return image;
    }
}
