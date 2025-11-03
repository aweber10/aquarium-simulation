export class ControlPanel {
    constructor(hostElement, controlsHost = null) {
        this.hostElement = hostElement;
        this.controlsHost = controlsHost;
        this.elements = {};
        this.handlers = {};
    }

    render(handlers = {}) {
        this.handlers = handlers;

        if (this.hostElement) {
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
                    <div class="control-panel__stat">
                        <div class="control-panel__row">
                            <span class="control-panel__label">Pflanzen</span>
                            <span class="control-panel__value" data-value="plants">0</span>
                        </div>
                        <meter min="0" max="5000" value="0" data-meter="plants"></meter>
                    </div>
                    <div class="control-panel__stat">
                        <div class="control-panel__row">
                            <span class="control-panel__label">Algen</span>
                            <span class="control-panel__value" data-value="algae">0</span>
                        </div>
                        <meter min="0" max="200" value="0" data-meter="algae"></meter>
                    </div>
                </div>
                <div class="control-panel__footer">Modell tickt jede Sekunde. Werte experimentell.</div>
            `;
        }

        if (this.controlsHost) {
            this.controlsHost.innerHTML = `
                <h2 class="simulation-controls__title">Steuerung</h2>
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
                <div class="control-panel__controls">
                    <div class="control-panel__group">
                        <span class="control-panel__group-label">Futter</span>
                        <div class="control-panel__segmented" data-group="feed">
                            <button type="button" class="control-panel__segment" data-feed="low">Wenig</button>
                            <button type="button" class="control-panel__segment control-panel__segment--active" data-feed="medium">Normal</button>
                            <button type="button" class="control-panel__segment" data-feed="high">Viel</button>
                        </div>
                        <span class="control-panel__group-value" data-value="nutrients">0</span>
                    </div>
                    <div class="control-panel__group">
                        <span class="control-panel__group-label">Licht</span>
                        <div class="control-panel__segmented" data-group="light">
                            <button type="button" class="control-panel__segment" data-light="low">Sanft</button>
                            <button type="button" class="control-panel__segment control-panel__segment--active" data-light="medium">Standard</button>
                            <button type="button" class="control-panel__segment" data-light="high">Hell</button>
                        </div>
                        <span class="control-panel__group-value" data-value="light">0</span>
                    </div>
                </div>
            `;
        }

        this.elements = {
            oxygenMeter: this.#panelQuery('[data-meter="oxygen"]'),
            carbonMeter: this.#panelQuery('[data-meter="carbon"]'),
            toxinMeter: this.#panelQuery('[data-meter="toxins"]'),
            oxygenValue: this.#panelQuery('[data-value="oxygen"]'),
            carbonValue: this.#panelQuery('[data-value="carbon"]'),
            toxinsValue: this.#panelQuery('[data-value="toxins"]'),
            fishCount: this.#panelQuery('[data-value="fishCount"]'),
            healthValue: this.#panelQuery('[data-value="health"]'),
            plantsValue: this.#panelQuery('[data-value="plants"]'),
            plantsMeter: this.#panelQuery('[data-meter="plants"]'),
            algaeValue: this.#panelQuery('[data-value="algae"]'),
            algaeMeter: this.#panelQuery('[data-meter="algae"]'),
            nutrientsValue: this.#controlsQuery('[data-value="nutrients"]'),
            lightValue: this.#controlsQuery('[data-value="light"]'),
            addFishButton: this.#controlsQuery('[data-action="add"]'),
            removeFishButton: this.#controlsQuery('[data-action="remove"]'),
            waterChangeButton: this.#controlsQuery('[data-action="water"]'),
            feedButtons: this.#controlsQueryAll('[data-feed]'),
            lightButtons: this.#controlsQueryAll('[data-light]')
        };

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

        if (this.elements.plantsValue) {
            this.elements.plantsValue.textContent = snapshot.plants.toFixed(0);
        }
        if (this.elements.plantsMeter) {
            this.elements.plantsMeter.value = snapshot.plants;
        }

        if (this.elements.algaeValue) {
            this.elements.algaeValue.textContent = snapshot.algae.toFixed(1);
        }
        if (this.elements.algaeMeter) {
            this.elements.algaeMeter.value = snapshot.algae;
        }

        if (this.elements.nutrientsValue) {
            this.elements.nutrientsValue.textContent = `${snapshot.nutrients.toFixed(0)} N`;
        }

        if (this.elements.lightValue) {
            this.elements.lightValue.textContent = `${snapshot.light.toFixed(1)} lx`;
        }

        if (this.elements.removeFishButton) {
            this.elements.removeFishButton.disabled = snapshot.fishCount === 0;
        }

        this.#setActiveSegment(this.elements.feedButtons, snapshot.feedLevel, 'feed');
        this.#setActiveSegment(this.elements.lightButtons, snapshot.lightLevel, 'light');
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
        if (this.elements.feedButtons && typeof this.handlers.onFeedChange === 'function') {
            this.elements.feedButtons.forEach((button) => {
                button.addEventListener('click', () => this.handlers.onFeedChange(button.dataset.feed));
            });
        }
        if (this.elements.lightButtons && typeof this.handlers.onLightChange === 'function') {
            this.elements.lightButtons.forEach((button) => {
                button.addEventListener('click', () => this.handlers.onLightChange(button.dataset.light));
            });
        }
    }

    #setActiveSegment(buttons, activeKey, key) {
        if (!buttons || !buttons.length || !activeKey) {
            return;
        }

        buttons.forEach((button) => {
            const value = button.dataset[key];
            button.classList.toggle('control-panel__segment--active', value === activeKey);
        });
    }

    #panelQuery(selector) {
        if (!this.hostElement) {
            return null;
        }
        return this.hostElement.querySelector(selector);
    }

    #controlsQuery(selector) {
        if (!this.controlsHost) {
            return null;
        }
        return this.controlsHost.querySelector(selector);
    }

    #controlsQueryAll(selector) {
        if (!this.controlsHost) {
            return [];
        }
        return Array.from(this.controlsHost.querySelectorAll(selector));
    }
}
