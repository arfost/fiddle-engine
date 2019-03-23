const GameStage = require('./stages/GameStage.js/index.js');
const MenuStage = require('./stages/MenuStage.js');

module.exports = function (stage, game) {
    let stageClass = getStageType(stage);
    return new stageClass(game);
};

function getEntityType(type) {
    switch (type) {
        case "menu":
            return GameStage;
        case "game":
            return MenuStage;
        default:
            throw new Error("unknow stage type : " + type);
    }
}