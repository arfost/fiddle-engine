const readline = require('readline');
const managedComponent = {};
managedComponent.ActionsC = require('./components/ActionsC.js');
managedComponent.GameMapC = require('./components/GameMapC.js');
managedComponent.LogsC = require('./components/LogsC.js');
managedComponent.SimpleTitleC = require('./components/SimpleTitleC.js');
managedComponent.MenuC = require('./components/MenuC.js');

const screensDefs = require('./ScreenDesc.json');

module.exports = class Outside {

    constructor(screensDefs) {
        this.screensDefs = screensDefs;
        this.errorMode = 0;
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
    }

    changeCurrentScreen(screen) {
        this.currentScreen = this.screensDefs[screen];
        this.isResized();
    }

    keyPressed(str, details) {

        if (details.ctrl) {
            str = "ctrl:" + str;
        }
        if (str === "p") {
            process.exit(0);
        }
        let input = this.turnActionAssoc[str];
        if (input && input.forComponent) {
            input.execute();
        } else {
            this.lastInput = input;
        }
    }

    updateInterface() {
        for (let component of this.currentScreen.components) {
            if (!component.instance) {
                component.instance = new managedComponent[component.type](this.applySize(component.pos), this.applySize(component.size));
            } else {
                component.instance.updateConfig(this.applySize(component.pos), this.applySize(component.size));
            }
        }
    }

    applySize(params) {
        let convertedParams = {};
        for (let param in params) {
            let toConvert = params[param];
            let converted = 0;
            for (let part of toConvert.split(" ")) {
                if (part === "windowW") {
                    converted += this.size.columns;
                } else if (part === "windowH") {
                    converted += this.size.rows;
                } else if (!isNaN(Number(part))) {
                    converted += Number(part);
                } else {
                    throw new Error("Malformed value part for " + param + " : " + part);
                }
            }
            convertedParams[param] = converted;
        }
        return convertedParams;
    }

    isResized() {
        if (process.stdout.columns < this.currentScreen.minSize.columns || process.stdout.rows < this.currentScreen.minSize.rows) {
            this.errorMode = 2;
        } else {
            this.size = {
                columns: process.stdout.columns,
                rows: process.stdout.rows
            };
            process.stdout.write("\u001b[2J\u001b[0;0H");
            this.updateInterface();
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

    dataFromPath(path, gameinfos) {
        if (path.startsWith("litt:")) {
            return path.replace('litt:', '');
        } else {
            return path.split('.').reduce((acc, node) => {
                if (acc && acc[node]) {
                    return acc[node];
                }
                return undefined;
            }, gameinfos);
        }
    }

    drawScreen(gameInfos) {

        if (this.errorMode !== 0) {
            this.drawError();
            return;
        }

        let keysDemands = [];
        for (let component of this.currentScreen.components) {
            if (!component.instance) {
                throw new Error("component is not ready");
            }
            component.instance.newDatas(this.dataFromPath(component.datas, gameInfos));
            keysDemands = keysDemands.concat(component.instance.hasKeyToBind());
        }

        this.bindKeysToAction(keysDemands);
    }

    bindKeysToAction(actionToBind) {
        let turnActionAssoc = {};
        for (let action of actionToBind) {
            if (!action)
                continue;

            turnActionAssoc[action.key] = action;
        }
        this.turnActionAssoc = turnActionAssoc;
    }
};