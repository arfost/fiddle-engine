const GameStage = require('./stages/GameStage.js');
const MenuStage = require('./stages/MenuStage.js');

module.exports = function (stage, game) {
    let stageClass = getStageType(stage);
    return new stageClass(game);
};

function getStageType(type) {
    switch (type) {
        case "menu":
            return MenuStage;
        case "game":
            return GameStage;
        default:
            throw new Error("unknow stage type : " + type);
    }
}