let BaseConsoleRendererComponents = require('../BaseConsoleRendererComponents.js');


module.exports = class Actions extends BaseConsoleRendererComponents {
    constructor(
        pos,
        size,

        decoration = "*",
        fColor = "white",
        bColor = "black"
    ) {
        super(pos, size, decoration, fColor, bColor);
        this.selectedCat = "mv";
        this.actionKey = [];
    }

    get categories() {
        return {
            mv: {
                preferedAssociations: {
                    "mv:up": "z",
                    "mv:dw": "s",
                    "mv:lf": "q",
                    "mv:rg": "d"
                },
                vrac: [
                    "a",
                    "e",
                ],
            },
            rn: {
                preferedAssociations: {
                    "rn:up": "z",
                    "rn:dw": "s",
                    "rn:lf": "q",
                    "rn:rg": "d"
                },
                vrac: [
                    "a",
                    "e",
                ],
            }
        }
    }

    get vrac() {
        return [
            "r",
            "t",
            "y",
            "f",
            "g",
            "h"
        ]
    }

    bindFactory(cat, key, catName) {
        return {
            forComponent: true,
            name: catName,
            key: key,
            execute: () => {
                this.selectedCat = cat;
                this.selectedCatName = catName;
                this.draw();
            }
        }
    }

    hasKeyToBind() {
        return this.actionKeys;
    }

    /**
     *
     * @param {String[]} infos - array of string to draw
     */
    getThingTodraw(actions) {

        let formattedActions = [("  Actions : " + this.selectedCatName).padEnd(this.size.columns), this.centerLine("=".repeat(this.size.columns * 0.6))];
        this.actionKeys = [];
        let idCatAdded = [];
        let keys = JSON.parse(JSON.stringify(this.vrac));
        //key calc
        for (let action of actions) {
            delete action.key;
            let catName = action.id.split(':')[0];
            if (this.selectedCat === catName) {
                let cat = this.categories[catName];
                if (cat) {
                    if (cat.preferedAssociations) {
                        action.key = cat.preferedAssociations[action.id];
                    }
                }
                if (!action.key) {
                    action.key = keys.pop();
                }

                this.actionKeys.push(action);
                formattedActions.push(`  - ${action.key} : ${action.name}${action.pos ? `[${action.pos.x};${action.pos.y}]`:""}`.padEnd(this.size.columns));
            } else {
                if (!idCatAdded.includes(catName)) {
                    let actionCat = this.bindFactory(catName, keys.pop(), action.name.split(' ')[0]);
                    this.actionKeys.push(actionCat);
                    idCatAdded.push(catName)
                }
            }
        }
        //key draw
        formattedActions.push(this.centerLine("=".repeat(this.size.columns * 0.6)));
        for (let action of this.actionKeys) {
            if (action.forComponent) {
                formattedActions.push(`  - ${action.key} : ${action.name}`.padEnd(this.size.columns));
            }
        }

        //decoration ajout lignes + encadrement
        while (formattedActions.length < this.size.rows - 2) {
            formattedActions.push(" ".repeat(this.size.columns));
        }
        formattedActions.unshift(this.newDecorationLine());
        formattedActions.push(this.newDecorationLine());

        return formattedActions.map(this.decorateLine.bind(this));
    }
}