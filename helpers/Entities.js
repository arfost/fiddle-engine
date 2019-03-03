module.exports = function (entity) {
    let type = getEntityType(entity.type);
    return new type(entity);
};

function getEntityType(type) {
    switch (type) {
        case "player":
            return Player;
        case "thing":
            return Thing;
        default:
            throw new Error("unknow entity type : " + type);
    }
}

class Entity {
    constructor(entity) {
        this.pos = entity.pos;
        this._img = entity.img;
        this.type = entity.type;
        this.components = new Set();
        this._stats = {};
        this._events = {};
    }

    get stats() {
        return this._stats;
    }

    getStat(statName) {
        return this._stats[statName]
    }

    addStat(stat) {
        Object.defineProperty(this._stats, stat, {
            get: function () {
                return this.emit('get_' + stat, 0);
            }.bind(this),
            configurable: true,
            enumerable: true
        });
    }

    subscribeTo(name, handler) {
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(handler)
    }

    emit(name, event) {
        let result;
        for (let handler of this._events[name]) {
            result = handler(event, this)
        }
        return result;
    }

    isVisible() {
        return true;
    }

    get img() {
        return this._img.img;
    }

    addComponent(component) {
        if (this.components.has(component)) {
            throw new Error("this entity already have this component")
        } else {
            this.components.add(component);
            component.addEntity(this);
        }
    }

    removeComponent(component) {
        if (!this.components.has(component)) {
            throw new Error("this entity doesn't have this component")
        } else {
            this.components.delete(component);
        }
    }

    getPossibleActionsFor(entity) {
        //console.log("//////////" + this.constructor.name);
        let actions = [];
        for (let component of this.components.values()) {
            //console.log("--- " + component.constructor.name);
            let tmpAct = component.getAction(entity);
            //console.log(tmpAct);
            actions = actions.concat(tmpAct);
            //console.log(actions)
        }
        //console.log("fin")
        //console.log(actions)
        return actions;
    }

    get infos() {
        return this.type;
    }

    interact(player) {
        throw new Error("interact must be overrided");
    }
}

class Thing extends Entity {

    constructor(entity) {
        super(entity);
        this.addComponent(new BaseApparence({
            desc: "un bidon de demonstration"
        }));
    }
}

class Player extends Entity {

    constructor(entity) {
        super(entity);
        this.addComponent(new BaseApparence({
            desc: "un joueur sexy et musclé"
        }))
        this.addComponent(new Eyes({
            perception: 6
        }))
    }

    interact(player) {
        return "you play with youself";
    }
}

class Component {
    getAction(against) {
        return [];
    }

    constructor() {

    }
    get eventsToSubscribe() {
        return []
    }
    get statsToAdd() {
        return []
    }


    addEntity(entity) {
        this.entity = entity;
        for (let eventToSubscribe of this.eventsToSubscribe) {
            this.entity.subscribeTo(eventToSubscribe.name, eventToSubscribe.handler);
        }

        for (let statToAdd of this.statsToAdd) {
            this.entity.addStat(statToAdd);
            this.entity.subscribeTo('get_' + statToAdd, function () {
                return this[statToAdd]
            }.bind(this));
        }
    }
}

class BaseApparence extends Component {

    constructor(params) {
        super();
        this.desc = params.desc
    }

    getAction(against) {
        //console.log("perce" + against.getStat("perception"))
        if (against.getStat("perception") > 0) {
            return [{
                name: "look at",
                id: "lk:" + this.entity.constructor.name,
                pos: this.entity.pos,
                execute: (stage, content, player) => {
                    stage.logGameAction.push(String(this.desc))
                }
            }]
        } else {
            return [];
        }
    }
}
class Eyes extends Component {

    constructor(params) {
        super();
        this.perception = params.perception || 5;
    }

    get statsToAdd() {
        return ["perception"]
    }

}