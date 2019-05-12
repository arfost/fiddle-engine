const Component = require('../Component.js');

module.exports = class QuestReward extends Component {
    constructor(params) {
        super();
        this.questId = params;
    }

    get eventsToSubscribe() {
        return [
            {
                name: 'killed-by',
                handler: killer => {
                    killer.emit('receive-flag', this.questId);
                    return killer;
                },
            },
        ];
    }
};
