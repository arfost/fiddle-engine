const GameStage = require('./GameStage.js');
module.exports = class Game {

    constructor(Renderer) {
        this.renderer = new Renderer(require("./renderer/consoleRenderer/ScreenDesc.json"), "game");
        this.TICK_RATE = 20;
        this.tick = 0;
        this.previous = this.hrtimeMs();
        this.tickLengthMs = 1000 / this.TICK_RATE;
        this.currentStage = new GameStage();
        this.gameInfos = "super titre"
    }

    start() {
        this.run = true;
        this.loop()
    }

    stop() {
        this.run = false;
    }

    loop() {
        if (this.run) {

            setTimeout(() => this.loop(), this.tickLengthMs);
        }
        let now = this.hrtimeMs();
        let delta = (now - this.previous) / 1000;

        this.currentStage.turn(this.renderer.getLastInput());

        let completScreen = {
            stageInfos: this.currentStage.getStageInfos(),
            gameInfos: this.gameInfos
        };
        this.renderer.drawScreen(completScreen);
        this.previous = now;
        this.tick++
    }

    hrtimeMs() {
        let time = process.hrtime();
        return time[0] * 1000 + time[1] / 1000000
    }
};