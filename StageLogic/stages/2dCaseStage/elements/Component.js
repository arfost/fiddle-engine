module.exports = class Component {
    getAction(against) {
        return [];
    }

    constructor() {}
    get eventsToSubscribe() {
        return [];
    }
    get statsToAdd() {
        return [];
    }

    addEntity(entity) {
        this.entity = entity;
        for (let eventToSubscribe of this.eventsToSubscribe) {
            this.entity.subscribeTo(
                eventToSubscribe.name,
                eventToSubscribe.handler
            );
        }

        for (let statToAdd of this.statsToAdd) {
            this.entity.addStat(statToAdd);
            this.entity.subscribeTo(
                "get_" + statToAdd,
                function (event) {
                    return (event += this[statToAdd]);
                }.bind(this)
            );
        }
    }
}