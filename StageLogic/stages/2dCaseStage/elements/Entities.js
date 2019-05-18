const cFactory = require('./ComponentsFactory.js');
const entitiesDefinition = require('./defs.json');

module.exports = function(entityParams) {
    let definition = entitiesDefinition[entityParams.type];
    if (!definition) {
        throw new Error('unknow entity definition ' + entityParams.type);
    }
    let entity = new Entity(entityParams);
    for (let comp of definition) {
        entity.addComponent(cFactory(comp.type, comp.params));
    }
    return entity;
};

class Entity {
    constructor(entity) {
        this.pos = entity.pos;
        this._img = entity.img;
        this.type = entity.type;
        this.id = entity.id;
        this.components = new Set();
        this._stats = {};
        this._events = {};
    }

    get stats() {
        return this._stats;
    }

    getStat(statName) {
        return this._stats[statName];
    }

    addStat(stat) {
        Object.defineProperty(this._stats, stat, {
            get: function() {
                return this.emit('get_' + stat);
            }.bind(this),
            configurable: true,
            enumerable: true,
        });
    }

    subscribeTo(name, handler) {
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(handler);
    }

    emit(name, event) {
        if (this._events[name]) {
            for (let handler of this._events[name]) {
                event = handler(event, this);
            }
        }
        return event;
    }

    isVisible() {
        return true;
    }

    get img() {
        return this._img;
    }

    addComponent(component) {
        if (this.components.has(component)) {
            throw new Error('this entity already have this component');
        } else {
            this.components.add(component);
            component.addEntity(this);
        }
    }

    removeComponent(component) {
        if (!this.components.has(component)) {
            throw new Error('this entity doesn\'t have this component');
        } else {
            this.components.delete(component);
        }
    }

    prepareForTurn(stageValuesAccessor) {
        this.emit('turn-passif', stageValuesAccessor);
        let eventResult = this.emit('collect-actions', { stageValuesAccessor: stageValuesAccessor, actions: [] });
        this.turnActions = eventResult.actions;
        this.emit('turn-end', stageValuesAccessor);
    }

    addActionForTurn(actions) {
        if (!Array.isArray(actions)) {
            actions = [actions];
        }
        this.turnActions = [...this.turnActions, ...actions];
    }

    get infos() {
        return this.type;
    }
}
