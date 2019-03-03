const TermninalHelper = require('./TerminalHelper.js')

module.exports = class Image {
    constructor(serie, fColor = 'white', bColor = 'black', logic = 'base') {
        this.serie = serie;
        logic = this.logicConv(logic);
        this.logic = new logic(this.serie);
        this.colors = TermninalHelper.colorToAnsi(fColor, bColor)
    }

    get img() {
        return this.colors + this.logic.img + "\x1b[0m";
    }

    colorConv(color) {
        switch (color) {
            case "red":
                return "\x1b[31m";
            case "green":
                return "\x1b[32m";
            case "yellow":
                return "\x1b[33m";
            case "blue":
                return "\x1b[34m";
            case "magenta":
                return "\x1b[35m";
            case "cyan":
                return "\x1b[36m";
            case "white":
                return "\x1b[37m";
            default:
                return "\x1b[0m"
        }
    }

    logicConv(logic) {
        switch (logic) {
            case "random":
                return RandomLogic;
            default:
                return BaseLogic;
        }
    }
};



class BaseLogic {
    constructor(serie) {
        this.serie = serie;
        //-1 because we increase before returning
        this.current = -1;
    }

    get img() {
        this.current++;
        if (this.current >= this.serie.length * 10) {
            this.current = 0;
        }
        return this.serie[Math.floor(this.current / 10)];
    }
}

class RandomLogic {
    constructor(serie) {
        this.serie = serie;
    }

    get img() {
        return this.serie[this.getRandomIntInclusive(0, this.serie.length - 1)];
    }

    getRandomIntInclusive(min, max) {
        if (typeof max === 'undefined') {
            max = min;
            min = 1;
        }
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }
}