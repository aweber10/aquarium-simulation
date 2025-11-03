export class ControlPanel {
    constructor(hostElement) {
        this.hostElement = hostElement;
        this.elements = {};
    }

    render(handlers = {}) {
        if (!this.hostElement) {
            return;
        }

        this.hostElement.innerHTML = `
            <h2 class="control-panel__title">Systemstatus</h2>
            <div class="control-panel__stats">
                <div class="control-panel__stat">
                    <div class="control-panel__row">
                        <span class="control-panel__label">Sauerstoff</span>
                        <span class="control-panel__value" data-value="oxygen">0%</span>
                    </div>
                    <meter min="0" max="100" low="40" high="80" optimum="90" value="0" data-meter="oxygen"></meter>
                </div>
                <div class="control-panel__stat">
                    <div class="control-panel__row">
                        <span class="control-panel__label">Kohlendioxyd</span>
                        <span class="control-panel__value" data-value="carbon">0%</span>
                    </div>
                    <meter min="0" max="100" low="20" high="60" optimum="10" value="0" data-meter="carbon"></meter>
                </div>
                <div class="control-panel__stat">
                    <div class="control-panel__row">
                        <span class="control-panel__label">Giftstoffe</span>
                        <span class="control-panel__value" data-value="toxins">0</span>
                    </div>
                    <meter min="0" max="100" low="2" high="5" optimum="0.5" value="0" data-meter="toxins"></meter>
                </div>
                <div class="control-panel__stat">
                    <div class="control-panel__row">
                        <span class="control-panel__label">Fischbestand</span>
                        <span class="control-panel__value" data-value="fishCount">0</span>
                    </div>
                    <div class="control-panel__row">
                        <span class="control-panel__label">Gesundheit</span>
                        <span class="control-panel__value" data-value="health">0%</span>
                    </div>
                </div>
            </div>
            <div class="control-panel__actions">
                <button type="button" class="control-panel__button control-panel__button--primary" data-action="add">
                    Fisch hinzufuegen
                </button>
                <button type="button" class="control-panel__button" data-action="remove">
                    Fisch entfernen
                </button>
                <button type="button" class="control-panel__button control-panel__button--accent" data-action="water">
                    Wasserwechsel
                </button>
            </div>
            <div class="control-panel__footer">Modell tickt jede Sekunde. Werte experimentell.</div>
        `;

        this.elements = {
            oxygenMeter: this.hostElement.querySelector('[data-meter="oxygen"]'),
            carbonMeter: this.hostElement.querySelector('[data-meter="carbon"]'),
            toxinMeter: this.hostElement.querySelector('[data-meter="toxins"]'),
            oxygenValue: this.hostElement.querySelector('[data-value="oxygen"]'),
            carbonValue: this.hostElement.querySelector('[data-value="carbon"]'),
            toxinsValue: this.hostElement.querySelector('[data-value="toxins"]'),
            fishCount: this.hostElement.querySelector('[data-value="fishCount"]'),
            healthValue: this.hostElement.querySelector('[data-value="health"]'),
            addFishButton: this.hostElement.querySelector('[data-action="add"]'),
            removeFishButton: this.hostElement.querySelector('[data-action="remove"]'),
            waterChangeButton: this.hostElement.querySelector('[data-action="water"]')
        };

        this.handlers = handlers;
        this.#bindEvents();
    }

    update(snapshot) {
        if (!this.elements.oxygenMeter) {
            return;
        }

        this.elements.oxygenMeter.value = snapshot.oxygen;
        this.elements.oxygenValue.textContent = `${snapshot.oxygen.toFixed(0)}%`;

        this.elements.carbonMeter.value = snapshot.carbonDioxide;
        this.elements.carbonValue.textContent = `${snapshot.carbonDioxide.toFixed(0)}%`;

        this.elements.toxinMeter.value = snapshot.toxins;
        this.elements.toxinsValue.textContent = snapshot.toxins.toFixed(1);

        this.elements.fishCount.textContent = snapshot.fishCount.toString();
        this.elements.healthValue.textContent = `${snapshot.averageHealth.toFixed(0)}%`;

        if (this.elements.removeFishButton) {
            this.elements.removeFishButton.disabled = snapshot.fishCount === 0;
        }
    }

    #bindEvents() {
        if (this.elements.addFishButton && typeof this.handlers.onAddFish === 'function') {
            this.elements.addFishButton.addEventListener('click', () => this.handlers.onAddFish());
        }
        if (this.elements.removeFishButton && typeof this.handlers.onRemoveFish === 'function') {
            this.elements.removeFishButton.addEventListener('click', () => this.handlers.onRemoveFish());
        }
        if (this.elements.waterChangeButton && typeof this.handlers.onWaterChange === 'function') {
            this.elements.waterChangeButton.addEventListener('click', () => this.handlers.onWaterChange());
        }
    }
}
