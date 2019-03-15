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
                return this.emit("get_" + stat, 0);
            }.bind(this),
            configurable: true,
            enumerable: true
        });
    }

    subscribeTo(name, handler) {
        console.log("(((((")
        console.log(name)
        console.log("))))))))")
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(handler);
    }

    emit(name, event) {
        console.log("///")
        console.log(name)
        console.log(event)
        console.log(this._events[name])
        console.log(":::::")
        if (this._events[name]) {
            for (let handler of this._events[name]) {
                event = handler(event, this);
            }
        }
        return event
    }

    isVisible() {
        return true;
    }

    get img() {
        return this._img.img;
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
        this.addComponent(
            new BaseApparence({
                desc: "Un vieu tout pourri"
            })
        );
        this.name = "un vieu";
        this.addComponent(new Dialog(require("./../refs/dialogs/test.json")));
    }
}

class Player extends Entity {
    constructor(entity) {
        super(entity);
        this.addComponent(
            new BaseApparence({
                desc: "un joueur sexy et musclé"
            })
        );
        this.addComponent(new BaseStats());
    }
}

class Gobelin extends Entity {
    constructor(entity) {
        super(entity);
        this.addComponent(
            new BaseApparence({
                desc: "Un horrible gobelin. Il semble paralysé, ou trop idiot pour bouger, vous n'etes pas sur "
            })
        );
        this.addComponent(new BaseStats());
    }
}

class Component {
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

class BaseApparence extends Component {
    constructor(params) {
        super();
        this.desc = params.desc;
    }

    get statsToAdd() {
        return ["desc"];
    }
}

class Dialog extends Component {
    constructor(params) {
        super();
        this.step = "base";
        this.desc = params.desc;
        this.steps = params.steps;
    }

    get statsToAdd() {
        return ["desc"];
    }

    getAction(against) {
        let actions = [];
        for (let repli of this.steps[this.step].replis) {
            actions.push({
                name: "say : " + repli.text,
                id: "say:" + this.step + ":" + repli.code,
                pos: this.entity.pos,
                execute: (stage, content, player) => {
                    stage.logGameAction.push(String("you say : " + repli.text));
                    this.step = repli.next;
                    stage.logGameAction.push(
                        String(
                            this.entity.name +
                            " say : " +
                            this.steps[this.step].text
                        )
                    );
                    if (this.steps[this.step].events) {

                        for (let event of this.steps[this.step].events) {
                            player.emit(event.name, event.params);
                            if (event.text) {
                                stage.logGameAction.push(String(this.entity.name + " : " + event.text));
                            }
                        }
                    }
                }
            });
        }
        return actions;
    }
}

class BaseStats extends Component {
    constructor(params) {
        super();
        this.physique = 5;
        this.mental = 5;
        this.health = 5;
    }

    get statsToAdd() {
        return ["physique", "mental", "desc", "perception"];
    }

    get desc() {
        switch (this.health) {
            case 5:
                return " indemne";
            case 4:
                return " éraflé";
            case 3:
                return " legerement blessé";
            case 2:
                return " blessé";
            case 1:
                return " a l'agonie";
            default:
                return " mort d'etre décédé";
        }
    }

    get perception() {
        return this.mental * 2;
    }

    get eventsToSubscribe() {
        return [{
            name: "damage",
            handler: event => {
                this.health = this.health - event.damage;
                event.damage = 0;
                return event;
            }
        }];
    }
}

class Combat extends Component {
    constructor(params) {
        super();
        this.step = "base";
        this.desc = params.desc;
        this.steps = params.steps;
    }

    get statsToAdd() {
        return ["desc"];
    }

    getAction(against) {
        let actions = [];
        for (let repli of this.steps[this.step].replis) {
            actions.push({
                name: "say : " + repli.text,
                id: "say:" + this.step + ":" + repli.code,
                pos: this.entity.pos,
                execute: (stage, content, player) => {
                    stage.logGameAction.push(String("you say : " + repli.text));
                    this.step = repli.next;
                    stage.logGameAction.push(
                        String(
                            this.entity.name +
                            " say : " +
                            this.steps[this.step].text
                        )
                    );
                }
            });
        }
        return actions;
    }
}