const BaseApparence = require('./components/BaseApparence.js');
const BaseStats = require('./components/BaseStats.js');
const Combat = require('./components/Combat.js');
const Dialogs = require('./components/Dialogs.js');
const IntelligenceArtificielle = require('./components/IntelligenceArtificielle.js');

module.exports = function (component, opt) {
    let componentClass = getComponentType(component);
    return new componentClass(opt);
};

function getComponentType(type) {
    switch (type) {
        case "baseApparence":
            return BaseApparence;
            case "baseStats":
            return BaseStats;
            case "combat":
            return Combat;
            case "dialogs":
            return Dialogs;
            case "ia":
            return IntelligenceArtificielle;
        default:
            throw new Error("unknow component type : " + type);
    }
}