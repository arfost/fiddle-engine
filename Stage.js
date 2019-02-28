const Image = require('./helpers/Image.js');
const createEntityFromDesc = require('./helpers/Entities.js');
module.exports = class Stage {

    constructor(params, player) {
        this.params = params;
        this.baseFloor = new Image(["."], "#666");
        this.posEntities = [];
        this.entities = [];
        this.logGameAction = ["Vous entrez dans le stage de test"];
        this.addEntity(createEntityFromDesc({
            pos: {
                x: 4,
                y: 2
            },
            type: "thing",
            img: new Image(["o", "O"], "green")
        }));
        this.addEntity(createEntityFromDesc({
            pos: {
                x: 5,
                y: 5
            },
            type: "player",
            img: new Image(["@"], "yellow")
        }));

        this.actions = this.calculateAction(this.player);
    }

    addEntity(entity) {
        if (entity.type === "player") {
            this.player = entity;
        }
        this.entities.push(entity);
        if (!this.posEntities[entity.pos.y]) {
            this.posEntities[entity.pos.y] = []
        }
        this.posEntities[entity.pos.y][entity.pos.x] = entity;
    }

    turn(input) {
        if (input) {
            this.playerActeOn(input, this.player);
            this.actions = this.calculateAction(this.player);
        }
    }

    calculateAction(player) {
        let actions = [];
        let perce = this.player.stats['perception'];

        for (let i = this.player.pos.y - perce; i < this.player.pos.y + perce; i++) {
            for (let j = this.player.pos.x - perce; j < this.player.pos.x + perce; j++) {
                let content = this.posEntities[i] ? this.posEntities[i][j] : undefined;
                if (content) {
                    let entAction = content.getPossibleActionsFor(player);

                    actions = actions.concat(entAction)
                }
                let pos = {
                    x: j,
                    y: i
                };
                for (let action of this.possibleAction) {
                    let possible = action.condition.reduce((acc, test) => {
                        return acc && test(pos, content, player);
                    }, true);

                    if (possible) {
                        let modifier = action.modifiers(pos, content, player);
                        action.name += modifier.nameModifier;
                        action.key += ":" + modifier.keyModifier;
                        action.pos = pos;
                        actions.push(action)
                    }
                }
            }
        }
        return actions;
    }

    get possibleAction() {
        return [{
                name: "move",
                key: "mv",
                condition: [
                    function (pos, content, player) {
                        return content === undefined;
                    },
                    function (pos, content, player) {
                        return Math.abs(pos.x - player.pos.x) + Math.abs(pos.y - player.pos.y) === 1
                    }
                ],
                modifiers: function (pos, content, player) {
                    let result = (pos.x - player.pos.x) + ";" + (pos.y - player.pos.y);
                    switch (result) {
                        case "1;0":
                            return {
                                keyModifier: "rg",
                                nameModifier: " right"
                            };
                        case "-1;0":
                            return {
                                keyModifier: "lf",
                                nameModifier: " left"
                            };
                        case "0;1":
                            return {
                                keyModifier: "dw",
                                nameModifier: " down"
                            };
                        case "0;-1":
                            return {
                                keyModifier: "up",
                                nameModifier: " up"
                            };
                        default:
                            throw new Error("unknow direction " + result);
                    }
                },
                execute: function (stage, content, player) {
                    let oldPos = player.pos;
                    player.pos = this.pos;
                    stage.hasMoved(oldPos);
                    stage.logGameAction.push('vous vous deplacez');
                }
            },
            {
                name: "run",
                key: "rn",
                condition: [
                    function (pos, content, player) {
                        return content === undefined;
                    },
                    function (pos, content, player) {
                        return Math.abs(pos.x - player.pos.x) + Math.abs(pos.y - player.pos.y) === 2 && Math.abs(pos.x - player.pos.x) !== Math.abs(pos.y - player.pos.y)
                    }
                ],
                modifiers: function (pos, content, player) {
                    let result = (pos.x - player.pos.x) + ";" + (pos.y - player.pos.y);
                    switch (result) {
                        case "2;0":
                            return {
                                keyModifier: "rg",
                                nameModifier: " right"
                            };
                        case "-2;0":
                            return {
                                keyModifier: "lf",
                                nameModifier: " left"
                            };
                        case "0;2":
                            return {
                                keyModifier: "dw",
                                nameModifier: " down"
                            };
                        case "0;-2":
                            return {
                                keyModifier: "up",
                                nameModifier: " up"
                            };
                        default:
                            throw new Error("unknow direction " + result);
                    }
                },
                execute: function (stage, content, player) {
                    let oldPos = player.pos;
                    player.pos = this.pos;
                    stage.hasMoved(oldPos);
                    stage.logGameAction.push('vous vous deplacez');
                }
            }
        ]
    }

    playerActeOn(action, player) {
        action.execute(this, this.posEntities[action.pos.y] ? this.posEntities[action.pos.y][action.pos.x] : undefined, player);
    }

    hasMoved(oldPos) {
        let entity = this.posEntities[oldPos.y][oldPos.x];
        if (!this.posEntities[entity.pos.y]) {
            this.posEntities[entity.pos.y] = []
        }
        this.posEntities[entity.pos.y][entity.pos.x] = entity;
        this.posEntities[oldPos.y][oldPos.x] = undefined;
    }

    getStageInfos() {
        let retour = {
            basePos: this.player.pos,
            entities: [],
            baseFloor: this.baseFloor,
            gameLog: this.logGameAction.slice(-10),
            actions: this.actions
        };

        let perce = this.player.stats['perception'];

        for (let i = this.player.pos.y - perce; i < this.player.pos.y + perce; i++) {
            for (let j = this.player.pos.x - perce; j < this.player.pos.x + perce; j++) {
                if (this.posEntities[i] && this.posEntities[i][j] && this.posEntities[i][j].isVisible(this.player)) {
                    retour.entities.push(this.posEntities[i][j]);
                }
            }
        }
        return retour;
    }

    get screen() {
        let base = new Array(this.screenSize).fill(0);
        base = base.map(() => {
            let row = new Array(this.screenSize).fill(0);
            return row.map(() => this.baseFloor.img);
        });
        let playerRelX = this.player.pos.x - this.screenSize / 2;
        let playerRelY = this.player.pos.y - this.screenSize / 2;

        base[this.player.pos.y - (playerRelY)][this.player.pos.x - (playerRelX)] = this.player.img;
        for (let entity of this.entities) {
            if ((entity.pos.x > playerRelX && entity.pos.x < playerRelX + this.screenSize) &&
                (entity.pos.y > playerRelY && entity.pos.y < playerRelY + this.screenSize)) {
                base[entity.pos.y - playerRelY][entity.pos.x - playerRelX] = entity.img;
            }
        }
        return base;
    }
};