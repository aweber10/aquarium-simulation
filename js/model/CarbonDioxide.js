import { Component } from './Component.js';
import { DEFAULTS } from './constants.js';

export class CarbonDioxide extends Component {
    constructor(environment) {
        super(environment, DEFAULTS.carbonDioxide.start);
    }
}
