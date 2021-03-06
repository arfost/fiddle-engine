const TerminalHelper = require('./helpers/TerminalHelper.js');
const assetProvider = require('./assetsLogic/AssetProvider.js')
module.exports = class BaseRendererComponent {
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
        this.activeAssets = [];
        this.assetList = {};
    }

    newDatas(data) {
        let stringiData = JSON.stringify(data);
        if (stringiData !== this.lastDataStringified) {
            this.lastDataStringified = stringiData;
            this.lastData = data;
            this.draw();
        } else {
            for (let asset of this.activeAssets) {
                asset.tick();
            }
            process.stdout.write("\x1b[0m\u001b[0;0H");
        }
    }

    updatePos(newPos) {
        this.pos = newPos;
        this.draw();
    }

    updateConfig(newPos, newSize) {
        this.pos = newPos;
        this.size = newSize;
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
            process.stdout.write(
                TerminalHelper.positionToAnsi(this.pos.x + index, this.pos.y)
            );
            try {
                process.stdout.write(line);
            } catch (e) {}
        }
        process.stdout.write("\x1b[0m\u001b[0;0H");
    }

    createNewAsset(assetId, internalId, internalPos) {
        if (!this.assetList[internalId]) {
            this.assetList[internalId] = assetProvider.getNewImg(assetId);
        }
        this.assetList[internalId].pos = internalPos;
        this.assetList[internalId].basePos = this.pos;
        this.activeAssets.push(this.assetList[internalId]);
        return this.assetList[internalId];
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

    chunkSubstr(str, size) {
        var chunks = new Array(Math.ceil(str.length / size)),
            nChunks = chunks.length;

        var newo = 0;
        for (var i = 0, o = 0; i < nChunks; ++i, o = newo) {
            newo += size;
            chunks[i] = str.substr(o, size);
        }

        return chunks;
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

    newDecorationLine(width = this.size.columns, deco = this.decoration) {
        return deco.repeat(width);
    }

    hasKeyToBind() {
        return [];
    }
}