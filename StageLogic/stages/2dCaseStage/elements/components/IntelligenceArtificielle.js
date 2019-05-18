const Component = require('../Component.js');

module.exports = class IntelligenceArtificielle extends Component {
    constructor() {
        super();
    }

    get eventsToSubscribe() {
        return [
            {
                name: 'turn-end',
                handler: () => {
                    let selectedAction;
                    for (let action of this.entity.turnActions) {
                        if (action.id === 'atk:norm' && action.faction != this.entity.type) {
                            selectedAction = action;
                        }
                    }
                    if (selectedAction) {
                        selectedAction.execute();
                    }
                },
            },
        ];
    }
};
