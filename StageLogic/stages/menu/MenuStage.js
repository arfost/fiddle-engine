module.exports = class MenuStage {

    constructor(game) {
        this.game = game;

        this.actions = this.calculateAction();
    }


    turn(input) {
        if (input) {
            input.execute(this.game, this);
            this.actions = this.calculateAction();
        }
    }

    calculateAction() {
        let actions = [];
        for (let action of this.possibleAction) {
            let possible = action.condition.reduce((acc, test) => {
                return acc && test(this.game, this);
            }, true);

            if (possible) {
                actions.push(action)
            }
        }
        return actions;
    }

    get possibleAction() {
        return [{
            name: "new game",
            id: "ng",
            condition: [
                function (pos, content, player) {
                    return true;
                }
            ],
            execute: function (game, stage) {
                game.saveCurrentStageAndChange("menu", "game");
            }
        }, {
            name: "reprendre",
            id: "re",
            condition: [
                function (game, stage) {
                    return game.hasSavedStage("game")
                }
            ],
            execute: function (game) {
                game.saveCurrentStageAndChange("menu", "game", false);
            }
        }, {
            name: "quitter",
            id: "qu",
            condition: [
                function () {
                    return true;
                }
            ],
            execute: function (stage) {
                process.exit(0);
            }
        }]
    }


    getStageInfos() {
        let retour = {
            actions: this.actions
        };
        return retour;
    }

    getDice(min, max) {
        if (typeof max === 'undefined') {
            max = min;
            min = 1;
        }
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
    }
};