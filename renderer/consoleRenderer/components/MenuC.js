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
                    if (this.index + this.size.rows - 2 < this.lastData.length) {
                        this.index++;
                        this.draw();
                    }
                }
            }
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
        let columns = this.size.columns - 4;
        let rows = this.size.rows - 2;
        let lines = []
        if (lines.length > rows) {
            lines.push("error to much options")
        } else {
            for (let i = 0; i < actions.length; i++) {
                lines.push(i === this.index ? this.leftSymboleSelection + actions[i].name + this.rightSymboleSelection : actions[i].name)
            }
        }
        lines = this.centerHLine(lines, rows);
        lines.unshift(this.newDecorationLine());
        lines.push(this.newDecorationLine());
        return lines.map(this.decorateLine.bind(this));
    }
};