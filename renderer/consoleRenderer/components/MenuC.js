let BaseConsoleRendererComponents = require('../BaseConsoleRendererComponents.js');

module.exports = class Logs extends BaseConsoleRendererComponents {
    constructor(
        pos,
        size,
        decoration = "*",
        fColor = "white",
        bColor = "black"
    ) {
        super(pos, size, decoration, fColor, bColor);
        this.index = 0;
    }

    hasKeyToBind() {
        return [{
                forComponent: true,
                key: 'z',
                execute: () => {
                    if (this.index > 0) {
                        this.index--;
                        this.draw();
                    }
                }
            },
            {
                forComponent: true,
                key: 's',
                execute: () => {
                    if (this.index < this.lastData.length - 1) {
                        this.index++;
                        this.draw();
                    }
                }
            },
            this.lastData[this.index]
        ]
    }

    get leftSymboleSelection() {
        return this.decoration + " "
    }

    get rightSymboleSelection() {
        return " " + this.decoration;
    }

    /**
     *
     * @param {String[]} infos - array of string to draw
     */
    getThingTodraw(actions) {
        let rows = this.size.rows - 2;
        let lines = []
        if (actions.length > rows) {
            lines.push("error to much options")
        } else {
            for (let i = 0; i < actions.length; i++) {
                delete actions[i].key;
                lines.push(i === this.index ? this.leftSymboleSelection + actions[i].name + this.rightSymboleSelection : actions[i].name)
            }
            actions[this.index].key = "d";
        }
        lines = this.centerHLine(lines, rows);
        lines.unshift(this.newDecorationLine());
        lines.push(" - z,s to navigate, d to validate -  ".padStart(this.size.columns, this.decoration));
        return lines.map(this.centerLine.bind(this)).map(this.decorateLine.bind(this));
    }
};