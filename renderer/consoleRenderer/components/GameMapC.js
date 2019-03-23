let BaseConsoleRendererComponents = require('../BaseConsoleRendererComponents.js');


module.exports = class ScreenMap extends BaseConsoleRendererComponents {
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
        let cursorText = infos.baseDesc;

        let base = new Array(rows).fill(0);
        base = base.map(() => {
            let row = new Array(columns).fill(0);
            return row.map(() => doubled + infos.baseFloor.img);
        });
        let playerRelX = Math.ceil(infos.basePos.x - columns / 2);
        let playerRelY = Math.ceil(infos.basePos.y - rows / 2);

        for (let entity of infos.entities) {
            base[entity.pos.y - playerRelY][entity.pos.x - playerRelX] = doubled + entity.img;
            if (entity.pos.y - playerRelY === this.cursorPos.y && entity.pos.x - playerRelX === this.cursorPos.x) {
                cursorText = entity.stats.desc;
            }
        }

        //console.log(base.length)
        //console.log(base[0].length)
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

        cursorText = `[${this.cursorPos.x + playerRelX},${this.cursorPos.y + playerRelY}] ` + cursorText;
        let cursorArray = this.chunkSubstr(cursorText, this.doubled ? this.size.columns * 2 - 4 : this.size.columns - 3);
        cursorArray = cursorArray.map(l => this.decorateLine(("  " + l).padEnd(this.doubled ? this.size.columns * 2 - 2 : this.size.columns - 1), this.affChars["bordureVisualVerti"] +
            this.affChars["bordureVisualVerti"]));


        base = [...base, ...cursorArray];
        while (base.length < this.size.rows - 1) {
            base.push(this.decorateLine(" ".repeat(this.doubled ? this.size.columns * 2 - 2 : this.size.columns - 1), this.affChars["bordureVisualVerti"] +
                this.affChars["bordureVisualVerti"]));
        }
        base.push(this.newDecorationLine(this.doubled ? this.size.columns * 2 : this.size.columns, "*"))

        return base;
    }
}