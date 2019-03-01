const readline = require('readline');
const components = require('./out-compo/OutsideComponents.js');
module.exports = class Outside {
    constructor() {
        this.errorMode = 0;
        this.minSize = {
            rows: 30,
            columns: 70
        };
        try {
            readline.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);

            process.stdout.write("\u001b[2J\u001b[0;0H");
            process.stdout.write("\u001b[=2h");
        } catch (e) {
            this.errorMode = 1;
        }
        process.stdout.on('resize', this.isResized.bind(this));

        this.lastInput = false;
        process.stdin.on('keypress', this.keyPressed.bind(this));

        this.isResized();
    }

    keyPressed(str, details) {
        //console.Logs.js(str, details);
        this.lastInput = this.turnActionAssoc[str];
        if (str === "p") {
            process.exit(0);
        }
    }

    initInterface(){
        //console.log("init")
        this.interface = {};
        this.interface.title = new components.SimpleTitle({x: 0, y: 0}, {rows: 3, columns: process.stdout.columns});
        this.interface.title.newDatas("Super titre");
        //this.interface.screen = new components.ScreenMap({x: 0, y: 4}, {rows: 30, columns: 30});
        //this.interface.screen.newDatas(null);
    }

    checkInterface(){
        if(this.interface){
            this.updateInterface();
        }else{
            this.initInterface();
        }
    }

    updateInterface(){
        this.interface.title.updateSize({rows: 3, columns: this.size.columns});
        this.interface.title.newDatas("Super titre ["+this.size.columns+";"+this.size.rows+"]");
    }

    isResized() {
        if (process.stdout.columns < this.minSize.columns || process.stdout.rows < this.minSize.rows) {
            this.errorMode = 2;
        } else {
            this.size = {
                columns: process.stdout.columns,
                rows: process.stdout.rows
            };
            process.stdout.write("\u001b[2J\u001b[0;0H");
            this.checkInterface();
            this.errorMode = 0;
        }
    }

    getLastInput() {
        let tmp = this.lastInput;
        this.lastInput = false;
        return tmp;
    };

    get errorCodeMessages() {
        return [
            "no error",
            "unable to start in and out correctly, maybe raw mode is insupported, or we are not a TTY",
            "screen is to small to display game interface"
        ]
    }

    drawError() {
        process.stdout.write("\u001b[2J\u001b[0;0H");
        process.stdout.write(this.errorCodeMessages[this.errorMode]);
    }

    drawScreen(gameInfos) {

        if (this.errorMode !== 0) {
            this.drawError();
            return;
        }

        //this.interface.screen.newDatas(gameInfos.stageInfos);


        //let visualPart = this.createVisualPart(gameInfos.stageInfos, Math.floor(this.size.columns * 0.66), Math.floor((this.size.rows - 8) * 0.66), true);

        let preparedActions = this.prepareAction(gameInfos.stageInfos.actions);
        let actionText = this.normalizeTextLines(preparedActions, Math.floor(this.size.columns * 0.33), Math.floor((this.size.rows - 8) * 0.66));
        //let mergedVisualAction = this.mergePart(visualPart, actionText.split("\n"));

        let logText = this.normalizeTextLines(gameInfos.stageInfos.gameLog, this.size.columns, Math.floor((this.size.rows - 8) * 0.33));

        //process.stdout.write("\u001b[2J");
        //process.stdout.write("\u001b[0;4H");
        //process.stdout.write(mergedVisualAction + "\n" + logText);
        //process.stdout.write("\x1b[0m");
    }

    prepareAction(actions) {

        let formattedActions = [...this.normalizeSoloLine("Actions : ", Math.floor(this.size.columns * 0.33) - 2, 1), " ", this.normalizeSoloLine("principales : ", Math.floor(this.size.columns * 0.33) - 2, 1)];
        let turnActionAssoc = {};
        let keys = this.keysForBinding;

        let sortedSecondaryActions = {};

        actions = actions.sort((a, b) => (a.key < b.key) ? -1 : 1);

        for (let action of actions) {
            let key;
            if (keys.preferedAssociations[action.key]) {
                key = keys.preferedAssociations[action.key];
                turnActionAssoc[key] = action;
                formattedActions.push(` - ${key} : ${action.name}[${action.pos.x};${action.pos.y}]`);
            } else {
                if (!sortedSecondaryActions[action.key.split(':')[0]]) {
                    sortedSecondaryActions[action.key.split(':')[0]] = [];
                }
                sortedSecondaryActions[action.key.split(':')[0]].push(action)
            }
        }

        for (let cat in sortedSecondaryActions) {
            formattedActions = formattedActions.concat([" ", this.normalizeSoloLine("---", Math.floor(this.size.columns * 0.33) - 2, 1)]);

            for (let action of sortedSecondaryActions[cat]) {
                let key = keys.vrac.pop();
                turnActionAssoc[key] = action;
                formattedActions.push(` - ${key} : ${action.name}[${action.pos.x};${action.pos.y}]`);
            }
        }

        this.turnActionAssoc = turnActionAssoc;
        return formattedActions;
    }

    get keysForBinding() {
        return {
            vrac: [
                "r",
                "t",
                "y",
                "u",
                "f",
                "g",
                "h",
                "j"
            ],
            preferedAssociations: {
                "mv:up": "z",
                "mv:dw": "s",
                "mv:lf": "q",
                "mv:rg": "d"
            }
        }
    }

    mergePart(left, right, mergeChar = '') {
        let max = left.length > right.length ? left.length : right.length;
        let merged = [];
        for (let i = 0; i < max; i++) {
            let lineLeft = left[i] ? left[i] : " ";
            let lineRight = right[i] ? right[i] : " ";
            merged.push(lineLeft + mergeChar + lineRight)
        }
        return merged.join('\n');
    }

    normalizeTextLines(lines, columns, rows) {
        if (Array.isArray(lines)) {
            lines = this.normalizeArray(lines, columns, rows);
        } else {
            lines = this.normalizeSoloLine(lines, columns, rows);
        }

        return lines.join('\n');
    }

    normalizeArray(lines, columns, rows) {
        let tranLines = [];
        for (let line of lines) {
            if (line.length <= columns) {
                try {
                    tranLines.push(line.padEnd(columns));
                } catch (e) {
                    tranLines.push("error");
                }

            } else if (line.length > columns) {
                tranLines.push(`${line.substring(0, columns)}`);
                tranLines.push(`${line.substring(columns)}`);
            }
        }
        while (tranLines.length < rows) {
            tranLines.push(" ".repeat(columns));
        }
        return tranLines;
    }

    normalizeSoloLine(line, columns, rows) {
        let diff = (columns - line.length);
        let lineArray = [" ".repeat(diff / 2) + line + " ".repeat(diff / 2)];

        let emptyRows = rows - lineArray.length;
        while (emptyRows > 2) {
            if (!!(emptyRows % 2)) {
                lineArray.unshift(" ".repeat(columns));
            } else {
                lineArray.push(" ".repeat(columns));
            }
            emptyRows = rows - 2 - lineArray.length;
        }

        if (emptyRows > 0) {
            lineArray.push("*".repeat(columns));
            emptyRows--;
        }
        if (emptyRows > 0) {
            lineArray.unshift("*".repeat(columns));
        }
        let copyLineArray = [];
        for (let line of lineArray) {
            copyLineArray.push(line.replace(/.$/, "*").replace(/^./, "*"));
        }
        return copyLineArray;
    }
};
