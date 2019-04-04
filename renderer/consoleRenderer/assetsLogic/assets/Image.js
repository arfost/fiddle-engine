const TerminalHelper = require('../../helpers/TerminalHelper.js')

module.exports = class Image {
    constructor(serie, fColor = 'white', bColor = 'black', logic = 'base') {
        this.serie = serie;
        logic = this.logicConv(logic);
        this.logic = new logic(this.serie);

        this.colors = TerminalHelper.colorToAnsi(fColor, bColor);
        this.invertedColors = TerminalHelper.colorToAnsi(fColor, "white");
        this.timerBlink = 0;
    }

    get img() {
        return (Math.floor(this.timerBlink / 10) % 2 == 0 ? this.colors : this.invertedColors) + this.logic.img + "\x1b[0m";
    }

    logicConv(logic) {
        switch (logic) {
            default:
                return BaseLogic;
        }
    }

    toggleBlink(newStat) {
        this.blink = newStat;
        this.timerBlink = newStat ? 10 : 0;
    }

    tick() {
        if (this.blink) {
            this.timerBlink++;
        }
        this.logic.tick();
        if (this.img !== this.lastImg) {
            this.lastImg = this.img;
            process.stdout.write(TerminalHelper.positionToAnsi(this.basePos.x + this.pos.x, this.basePos.y + this.pos.y) + this.lastImg);
        }
    }
};

class BaseLogic {
    constructor(serie) {
        this.serie = serie;
        this.current = 0;
    }

    get img() {
        return this.serie[Math.floor(this.current / 10)];
    }

    tick() {
        this.current++;
        if (this.current >= this.serie.length * 10) {
            this.current = 0;
        }
    }
}