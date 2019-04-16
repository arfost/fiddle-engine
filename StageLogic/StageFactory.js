const GameStage = require('./stages/2dCaseStage/2dCaseStage.js');
const MenuStage = require('./stages/menu/MenuStage.js');

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