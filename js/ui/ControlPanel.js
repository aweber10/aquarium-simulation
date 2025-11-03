export class ControlPanel {
    constructor(hostElement) {
        this.hostElement = hostElement;
    }

    renderPlaceholder() {
        if (!this.hostElement) {
            return;
        }

        this.hostElement.innerHTML = `
            <div class="control-panel__placeholder">
                <p>Bedienelemente werden waehrend der Migration implementiert.</p>
                <p>Aktionen aus dem Java-Applet folgen schrittweise.</p>
            </div>
        `;
    }
}
