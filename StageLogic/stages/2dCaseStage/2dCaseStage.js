const createEntityFromDesc = require("./elements/Entities.js");
module.exports = class GameStage {
    constructor(game) {
        this.game = game;
        this.baseFloor = "base";
        this.baseDesc = "un endroit vide";
        this.posEntities = [];
        this.entities = [];
        this.logGameAction = ["Vous entrez dans le stage de test"];

        this.addEntity(
            createEntityFromDesc({
                pos: {
                    x: 7,
                    y: 3
                },
                type: "player",
                img: "player"
            })
        );
        this.addEntity(
            createEntityFromDesc({
                pos: {
                    x: 5,
                    y: 3
                },
                type: "vieu",
                img: "vieu"
            })
        );
        this.addEntity(
            createEntityFromDesc({
                pos: {
                    x: 3,
                    y: 0
                },
                type: "gobelin",
                img: "gob"
            })
        );

        this.actions = this.calculateAction(this.player);
    }

    addEntity(entity) {
        if (entity.type === "player") {
            this.player = entity;
        }
        this.entities.push(entity);
        if (!this.posEntities[entity.pos.y]) {
            this.posEntities[entity.pos.y] = [];
        }
        this.posEntities[entity.pos.y][entity.pos.x] = entity;
    }

    turn(input) {
        if (input) {
            //big ad hoc test very very bad bad
            if (input.id === "mn:pr") {
                input.execute(this.game, this);
                return;
            }
            input.execute(
                this,
                this.posEntities[input.pos.y] ?
                this.posEntities[input.pos.y][input.pos.x] :
                undefined,
                this.player
            );
            for (let entity of this.entities) {
                //do perception here
                entity.emit("turn", {
                    entList: this.entities,
                    actionExecutor: (action) => {
                        action.execute(this)
                    }
                })
            }
            this.actions = this.calculateAction(this.player);
        }
    }

    calculateAction(player) {
        let actions = [];
        let perce = Number(this.player.stats["perception"]);

        for (let i = this.player.pos.y - perce; i < this.player.pos.y + perce; i++) {
            for (let j = this.player.pos.x - perce; j < this.player.pos.x + perce; j++) {
                let content = this.posEntities[i] ?
                    this.posEntities[i][j] :
                    undefined;
                if (content) {
                    actions = actions.concat(content.getPossibleActionsFor(player));
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
                        if (action.modifiers) {
                            let modifier = action.modifiers(
                                pos,
                                content,
                                player
                            );
                            action.name += modifier.nameModifier;
                            action.id += ":" + modifier.idModifier;
                            action.pos = pos;
                        }
                        actions.push(action);
                    }
                }
            }
        }
        return actions;
    }

    get possibleAction() {
        return [{
                name: "move",
                id: "mv",
                condition: [
                    function (pos, content, player) {
                        return content === undefined;
                    },
                    function (pos, content, player) {
                        return (
                            Math.abs(pos.x - player.pos.x) +
                            Math.abs(pos.y - player.pos.y) ===
                            1
                        );
                    }
                ],
                modifiers: function (pos, content, player) {
                    let result =
                        pos.x - player.pos.x + ";" + (pos.y - player.pos.y);
                    switch (result) {
                        case "1;0":
                            return {
                                idModifier: "rg",
                                nameModifier: " right"
                            };
                        case "-1;0":
                            return {
                                idModifier: "lf",
                                nameModifier: " left"
                            };
                        case "0;1":
                            return {
                                idModifier: "dw",
                                nameModifier: " down"
                            };
                        case "0;-1":
                            return {
                                idModifier: "up",
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
                    stage.logGameAction.push("vous vous deplacez");
                }
            },
            {
                name: "run",
                id: "rn",
                condition: [
                    function (pos, content, player) {
                        return content === undefined;
                    },
                    function (pos, content, player) {
                        return (
                            Math.abs(pos.x - player.pos.x) +
                            Math.abs(pos.y - player.pos.y) ===
                            2 &&
                            Math.abs(pos.x - player.pos.x) !==
                            Math.abs(pos.y - player.pos.y)
                        );
                    }
                ],
                modifiers: function (pos, content, player) {
                    let result =
                        pos.x - player.pos.x + ";" + (pos.y - player.pos.y);
                    switch (result) {
                        case "2;0":
                            return {
                                idModifier: "rg",
                                nameModifier: " right"
                            };
                        case "-2;0":
                            return {
                                idModifier: "lf",
                                nameModifier: " left"
                            };
                        case "0;2":
                            return {
                                idModifier: "dw",
                                nameModifier: " down"
                            };
                        case "0;-2":
                            return {
                                idModifier: "up",
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
                    stage.logGameAction.push("vous vous deplacez");
                }
            },
            {
                name: "menu principal",
                id: "mn:pr",
                condition: [
                    function (pos, content, player) {
                        return content === player;
                    }
                ],
                execute: function (game, stage) {
                    game.saveCurrentStageAndChange("game", "menu");
                }
            }
        ];
    }

    hasMoved(oldPos) {
        let entity = this.posEntities[oldPos.y][oldPos.x];
        if (!this.posEntities[entity.pos.y]) {
            this.posEntities[entity.pos.y] = [];
        }
        this.posEntities[entity.pos.y][entity.pos.x] = entity;
        this.posEntities[oldPos.y][oldPos.x] = undefined;
    }

    getStageInfos() {
        let retour = {
            basePos: this.player.pos,
            entities: [],
            baseFloor: this.baseFloor,
            baseDesc: this.baseDesc,
            gameLog: this.logGameAction,
            actions: this.actions
        };

        let perce = Number(this.player.stats["perception"]);

        for (
            let i = this.player.pos.y - perce; i < this.player.pos.y + perce; i++
        ) {
            for (
                let j = this.player.pos.x - perce; j < this.player.pos.x + perce; j++
            ) {
                if (
                    this.posEntities[i] &&
                    this.posEntities[i][j] &&
                    this.posEntities[i][j].isVisible(this.player)
                ) {
                    retour.entities.push(this.posEntities[i][j]);
                }
            }
        }
        return retour;
    }

    getDice(min, max) {
        if (typeof max === "undefined") {
            max = min;
            min = 1;
        }
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }
};