const TerminalHelper = require('./../helpers/TerminalHelper.js')

class BaseOutsideComponent {
    constructor(
        pos,
        size,
        decoration = "*",
        fColor = "white",
        bColor = "black"
    ) {
        this.pos = pos;
        this.size = size;
        this.decoration = decoration;
        this.colors = TerminalHelper.colorToAnsi(fColor, bColor);
        this.lastData = "";
    }



    newDatas(data) {
        //console.log(data)
        let stringiData = JSON.stringify(data);
        if (stringiData !== this.lastDataStringified) {
            this.lastDataStringified = stringiData;
            this.lastData = data;
            this.draw();
        }
    }

    updatePos(newPos) {
        this.pos = newPos;
        this.draw();
    }

    updateSize(newSize) {
        this.size = newSize;
        this.draw();
    }

    draw() {
        //process.stdout.write(`\u001b[${this.pos.x};${this.pos.y}H`);

        process.stdout.write(this.colors);
        let tmp = this.getThingTodraw(this.lastData);


        for (let [index, line] of tmp.entries()) {
            //console.log("line is "+line.length+" long");
            //console.log(this.positionToAnsi(this.pos.x + index, this.pos.y));
            process.stdout.write(
                TerminalHelper.positionToAnsi(this.pos.x + index, this.pos.y)
            );
            try {
                process.stdout.write(line);
            } catch (e) {
                //console.log("error " + e.message + " " + line);
                //console.log(tmp);
            }
        }
        //process.stdout.write(tmp.join('\n'));
        process.stdout.write("\x1b[0m\u001b[0;0H");
    }

    getThingTodraw() {
        throw new Error("must be implemented");
    }

    centerLine(line) {
        if (line.length > this.size.columns) {
            throw new Error("line is to long for this component");
        }
        return (
            " ".repeat(Math.floor((this.size.columns - line.length) / 2)) +
            line +
            " ".repeat(Math.ceil((this.size.columns - line.length) / 2))
        );
    }

    centerHLine(lines, rows = this.size.rows) {
        let newArray = [].concat(lines);
        let emptyRows = rows - newArray.length;
        while (emptyRows > 0) {
            if (!!(emptyRows % 2)) {
                newArray.unshift(" ");
            } else {
                newArray.push(" ");
            }
            emptyRows = rows - 2 - newArray.length;
        }
        return newArray;
    }

    decorateLine(line, decoration) {
        if (!decoration || typeof decoration === "number") { //because map send index.
            decoration = this.decoration;
        }
        return line
            .replace(/.$/, decoration)
            .replace(/^./, decoration);
    }

    newDecorationLine(deco = this.decoration, width = this.size.columns) {
        return deco.repeat(width);
    }
}


module.exports.SimpleTitle = class SimpleTitle extends BaseOutsideComponent {
    /**
     *
     * @param {String} data - title to show
     */
    getThingTodraw(data) {
        let part = [];
        if (typeof data !== "string") {
            throw new Error("data type for SimpleTitle must be a string");
        }

        if (data.length > this.size.columns) {
            let size = this.size.columns / 10;
            part.push(data.substring(0, size));
            part.push(data.substring(size, data.length));
        } else {
            part.push(data);
        }

        part = this.centerHLine(
            part.map(this.centerLine.bind(this)).map(this.decorateLine.bind(this)),
            this.size.rows - 2
        );
        part.unshift(this.newDecorationLine());
        part.push(this.newDecorationLine());

        return part;
    }
};

module.exports.ScreenMap = class ScreenMap extends BaseOutsideComponent {
    constructor(
        pos,
        size,
        decoration = "*",
        fColor = "white",
        bColor = "black",
        doubled = true
    ) {
        super(pos, size, decoration, fColor, bColor);
        this.doubled = doubled;
        this.cursorPos = {
            x: 0,
            y: 0
        }
    }

    get affChars() {
        return {
            bordureVisualHori: "=",
            bordureVisualVerti: "|"
        };
    }

    hasKeyToBind() {
        return [{
                forComponent: true,
                key: 'ctrl:\u001a',
                execute: () => {
                    if (this.cursorPos.y > 0) {
                        this.cursorPos.y--;
                    }
                }
            },
            {
                forComponent: true,
                key: 'ctrl:\u0013',
                execute: () => {
                    if (this.cursorPos.y < this.size.rows - 8) {
                        this.cursorPos.y++;
                    }
                }
            },
            {
                forComponent: true,
                key: 'ctrl:\u0004',
                execute: () => {
                    if (this.cursorPos.x < this.size.columns - 3) {
                        this.cursorPos.x++;
                    }
                }
            },
            {
                forComponent: true,
                key: 'ctrl:\u0011',
                execute: () => {
                    if (this.cursorPos.x > 0) {
                        this.cursorPos.x--;
                    }
                }
            }
        ]
    }

    /**
     *
     * @param {Object} infos - reference of entities and position to draw
     */
    getThingTodraw(infos) {
        let doubled = this.doubled ? " " : "";
        let columns = this.size.columns - 2;
        let rows = this.size.rows - 7;

        if (infos === null) {
            return new Array(this.size.rows).fill(0).map(() => {
                let row = new Array(this.size.columns).fill(0);
                return row.map(() => doubled + " ").join("");
            });
        }

        let base = new Array(rows).fill(0);
        base = base.map(() => {
            let row = new Array(columns).fill(0);
            return row.map(() => doubled + infos.baseFloor.img);
        });
        let playerRelX = Math.ceil(infos.basePos.x - columns / 2);
        let playerRelY = Math.ceil(infos.basePos.y - rows / 2);

        for (let entity of infos.entities) {
            base[entity.pos.y - playerRelY][entity.pos.x - playerRelX] =
                doubled + entity.img;
        }

        console.log(base.length)
        console.log(base[0].length)
        //add cursor
        base[this.cursorPos.y][this.cursorPos.x] = doubled + "é"

        base.unshift(
            new Array(base[0].length).fill(
                (this.doubled ? this.affChars["bordureVisualHori"] : "") +
                this.affChars["bordureVisualHori"]
            )
        );
        base.push(
            new Array(base[0].length).fill(
                (this.doubled ? this.affChars["bordureVisualHori"] : "") +
                this.affChars["bordureVisualHori"]
            )
        );
        base = base.map(d => {
            return (
                this.affChars["bordureVisualVerti"] +
                this.affChars["bordureVisualVerti"] +
                d.join("") +
                this.affChars["bordureVisualVerti"] +
                this.affChars["bordureVisualVerti"]
            );
        });

        base.push(this.decorateLine(("  " + "un texte de test qui sert a tester").padEnd(this.doubled ? this.size.columns * 2 - 2 : this.size.columns - 1), this.affChars["bordureVisualVerti"] +
            this.affChars["bordureVisualVerti"]));
        while (base.length < this.size.rows - 1) {
            base.push(this.decorateLine(" ".repeat(this.doubled ? this.size.columns * 2 - 2 : this.size.columns - 1), this.affChars["bordureVisualVerti"] +
                this.affChars["bordureVisualVerti"]));
        }
        base.push(this.newDecorationLine("*", this.doubled ? this.size.columns * 2 : this.size.columns))

        return base;
    }
};

module.exports.Logs = class Logs extends BaseOutsideComponent {
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
        tranLines.unshift(this.newDecorationLine());
        tranLines.push((" - press x and c to defile(" + this.index + ") -  ").padStart(this.size.columns, this.decoration));
        return tranLines.map(this.decorateLine.bind(this));
    }
};

module.exports.Actions = class Actions extends BaseOutsideComponent {
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
            "g"
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
                this.selectedCatName = "move";
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
        let keys = this.vrac;
        for (let action of actions) {
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
                formattedActions.push(`  - ${action.key} : ${action.name}[${action.pos.x};${action.pos.y}]`.padEnd(this.size.columns));
            } else {
                if (!idCatAdded.includes(catName)) {
                    let actionCat = this.bindFactory(catName, keys.pop(), action.name.split(' ').slice(0, action.name.split(' ').length - 1));
                    this.actionKeys.push(actionCat);
                    idCatAdded.push(catName)
                }
            }
        }
        formattedActions.push(this.centerLine("=".repeat(this.size.columns * 0.6)));
        for (let action of this.actionKeys) {
            if (action.forComponent) {
                formattedActions.push(`  - ${action.key} : ${action.name}`.padEnd(this.size.columns));
            }
        }
        while (formattedActions.length < this.size.rows - 2) {
            formattedActions.push(" ".repeat(this.size.columns));
        }
        formattedActions.unshift(this.newDecorationLine());
        formattedActions.push(this.newDecorationLine());

        return formattedActions.map(this.decorateLine.bind(this));
    }
};