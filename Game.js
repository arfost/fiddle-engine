let stageFactory = require('./StageLogic/StageFactory.js');
module.exports = class Game {

    constructor(Renderer) {
        this.renderer = new Renderer(require('./renderer/consoleRenderer/ScreenDesc.json'), 'game');
        this.TICK_RATE = 20;
        this.tick = 0;
        this.previous = this.hrtimeMs();
        this.tickLengthMs = 1000 / this.TICK_RATE;

        this.gameInfos = 'super titre';
        this.savedStages = {};

        this.saveCurrentStageAndChange('first', 'menu');
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
        //how to delta : let delta = (now - this.previous) / 1000; this will maybe be used one day 

        this.currentStage.turn(this.renderer.getLastInput());

        let completScreen = {
            stageInfos: this.currentStage.getStageInfos(),
            gameInfos: this.gameInfos
        };
        this.renderer.drawScreen(completScreen);
        this.previous = now;
        this.tick++
    }

    /**
     * will save current stage and change with a new one
     * 
     * @param {String} stageName - the name to use to save the current stage 
     * @param {String} newStage - the id of the new stage type to use
     * @param {boolean} [shouldBeNew=true] - if the new current stage should be a new stage or a saved one
     * @throws {Error} if the stage name is not in the saved stages list
     */
    saveCurrentStageAndChange(stageName, newStage, shouldBeNew = true) {
        this.savedStages[stageName] = this.currentStage;
        if (shouldBeNew) {
            this.currentStage = stageFactory(newStage, this);
            this.renderer.changeCurrentScreen(newStage);
        } else {
            if (this.savedStages[newStage]) {
                this.currentStage = this.savedStages[newStage];
                this.renderer.changeCurrentScreen(newStage);
            } else {
                throw new Error('no such stage : ' + newStage);
            }
        }
    }

    /**
     * check if a particular stage is saved in the game
     * 
     * @param {String} stageName - the stage name to check if it exist
     * @returns {boolean} true if the stageName correspond to a saved stage
     */
    hasSavedStage(stageName) {
        return !!this.savedStages[stageName];
    }

    hrtimeMs() {
        let time = process.hrtime();
        return time[0] * 1000 + time[1] / 1000000
    }
};