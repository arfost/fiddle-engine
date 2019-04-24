let BaseConsoleRendererComponents = require('../BaseConsoleRendererComponents.js');

module.exports = class LogsC extends BaseConsoleRendererComponents {
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
                key: 'x',
                execute: () => {
                    if (this.index > 0) {
                        this.index--;
                        this.draw();
                    }
                }
            },
            {
                forComponent: true,
                key: 'c',
                execute: () => {
                    if (this.index + this.size.rows - 2 < this.lastData.length) {
                        this.index++;
                        this.draw();
                    }
                }
            }
        ]
    }

    /**
     *
     * @param {String[]} infos - array of string to draw
     */
    getThingTodraw(lines) {
        let columns = this.size.columns - 4;
        let rows = this.size.rows - 2;
        if (lines.length > rows) {
            lines = lines.slice(lines.length - (rows + this.index), lines.length - this.index);
        }
        let tranLines = [];
        for (let line of lines) {
            if (line.length <= columns) {
                try {
                    tranLines.push("  - " + line.padEnd(columns));
                } catch (e) {
                    tranLines.push("error");
                }

            } else if (line.length > columns) {
                tranLines.push(`  - ${line.substring(0, columns)}`);
                tranLines.push(`${line.substring(columns)}`);
            }
        }
        while (tranLines.length < rows) {
            tranLines.push(" ".repeat(this.size.columns));
        }
        tranLines = tranLines.slice(0, rows);
        tranLines = tranLines.map(l=>this.decorateLine(l, "║"));
        tranLines.unshift(this.decorateLine(this.newDecorationLine(undefined, "═"), "╠", "╣"));
        tranLines.push(this.decorateLine((" - press x and c to defile(" + this.index + ") -  ").padStart(this.size.columns, "═"), "╚", "╝"));
        return tranLines
    }
};
