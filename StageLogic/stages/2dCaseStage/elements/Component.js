module.exports = class Component {
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
            this.entity.subscribeTo(eventToSubscribe.name, eventToSubscribe.handler);
        }
        if (this.getAction) {
            this.entity.subscribeTo('collect-actions', this.getAction.bind(this));
        }

        for (let statToAdd of this.statsToAdd) {
            this.entity.addStat(statToAdd);
            this.entity.subscribeTo(
                'get_' + statToAdd,
                function(event) {
                    let data = this[statToAdd];
                    switch (typeof event) {
                    case 'undefined':
                        return data;
                    case 'string':
                        return event + data;
                    case 'number':
                        return event + data;
                    case 'object':
                        return { ...event, ...data };
                    case 'array':
                        return [...event, ...data];
                    }
                }.bind(this)
            );
        }
    }
};
