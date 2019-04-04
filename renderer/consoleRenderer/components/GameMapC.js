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
                        this.draw();
                    }
                }
            },
            {
                forComponent: true,
                key: 'ctrl:\u0013',
                execute: () => {
                    if (this.cursorPos.y < this.size.rows - 8) {
                        this.cursorPos.y++;
                        this.draw();
                    }
                }
            },
            {
                forComponent: true,
                key: 'ctrl:\u0004',
                execute: () => {
                    if (this.cursorPos.x < this.size.columns - 3) {
                        this.cursorPos.x++;
                        this.draw();
                    }
                }
            },
            {
                forComponent: true,
                key: 'ctrl:\u0011',
                execute: () => {
                    if (this.cursorPos.x > 0) {
                        this.cursorPos.x--;
                        this.draw();
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
        this.activeAssets = [];

        if (infos === null) {
            return new Array(this.size.rows).fill(0).map(() => {
                let row = new Array(this.size.columns).fill(0);
                return row.map(() => doubled + " ").join("");
            });
        }
        let cursorText = infos.baseDesc;

        let playerRelX = Math.ceil(infos.basePos.x - columns / 2);
        let playerRelY = Math.ceil(infos.basePos.y - rows / 2);

        let entByPos = {};
        let assetByPos = {};

        for (let entity of infos.entities) {
            entByPos[entity.pos.x + ":" + entity.pos.y] = entity;
        }

        let base = [];
        for (let i = 0; i < rows; i++) {
            base.push([]);
            for (let j = 0; j < columns; j++) {
                let asset;
                if (entByPos[(j + playerRelX) + ":" + (i + playerRelY)]) {
                    asset = this.createNewAsset(entByPos[(j + playerRelX) + ":" + (i + playerRelY)].img, entByPos[(j + playerRelX) + ":" + (i + playerRelY)].id, {
                        x: i + 1,
                        y: this.doubled ? (j + 1) * 2 + 1 : j + 1
                    });
                    if (i === this.cursorPos.y && j === this.cursorPos.x) {
                        cursorText = entByPos[(j + playerRelX) + ":" + (i + playerRelY)].stats.desc;
                    }
                } else {
                    asset = this.createNewAsset(infos.baseFloor, (j + playerRelY) + ":" + (i + playerRelX), {
                        x: i + 1,
                        y: this.doubled ? (j + 1) * 2 + 1 : j + 1
                    });
                }
                assetByPos[i + ":" + j] = asset;
                asset.toggleBlink(false);
                base[i].push(doubled + asset.img);
            }
        }

        assetByPos[this.cursorPos.y + ":" + this.cursorPos.x].toggleBlink(true);


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