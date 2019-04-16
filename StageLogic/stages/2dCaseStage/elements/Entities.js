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
        case "gobelin":
            return Gobelin;
        default:
            throw new Error("unknow entity type : " + type);
    }
}

class Entity {
    constructor(entity) {
        this.pos = entity.pos;
        this._img = entity.img;
        this.type = entity.type;
        this.id = this.type;
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
            get: function () {
                return this.emit("get_" + stat, "");
            }.bind(this),
            configurable: true,
            enumerable: true
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
            throw new Error("this entity already have this component");
        } else {
            this.components.add(component);
            component.addEntity(this);
        }
    }

    removeComponent(component) {
        if (!this.components.has(component)) {
            throw new Error("this entity doesn't have this component");
        } else {
            this.components.delete(component);
        }
    }

    getPossibleActionsFor(entity) {
        let actions = [];
        for (let component of this.components.values()) {
            actions = actions.concat(component.getAction(entity));
        }
        return actions;
    }

    get infos() {
        return this.type;
    }
}

class Thing extends Entity {
    constructor(entity) {
        super(entity);
        this.addComponent(
            new BaseApparence({
                desc: "Un vieux tout pourri",
                name: "un vieux"
            })
        );
        this.addComponent(
            new Dialog(require("../../../refs/dialogs/test.json"))
        );
    }
}

class Player extends Entity {
    constructor(entity) {
        super(entity);
        this.addComponent(
            new BaseApparence({
                desc: "Peau mate, yeux verts, cheveux noirs, 1.90 mètres, une beauté au diapason de ses origines semi-démoniaques",
                name: "Vous"
            })
        );
        this.addComponent(new BaseStats());
        this.addComponent(new Combat());
    }
}

class Gobelin extends Entity {
    constructor(entity) {
        super(entity);
        this.addComponent(
            new BaseApparence({
                desc: "Un horrible gobelin. Il semble paralysé, ou trop idiot pour bouger, vous n'etes pas sur ",
                name: "Gornog"
            })
        );
        this.addComponent(new BaseStats());
        this.addComponent(new Combat());
        this.addComponent(new IntelligenceArtificielle());
    }
}