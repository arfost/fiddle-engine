const Component = require('../Component.js');

module.exports = class Combat extends Component {
    constructor() {
        super();
        this.attackRange = 1;
    }

    get statsToAdd() {
        return ['canBeAttacked', 'canAttack', 'attackRange'];
    }

    get canBeAttacked() {
        return !this.entity.stats.isDead;
    }
    get canAttack() {
        return !this.entity.stats.isDead;
    }

    getAction({ stageValuesAccessor, actions }) {
        let close = stageValuesAccessor.closeEntityAccessor(this.entity.pos, this.entity.stats.attackRange);
        for (let potentialFoe of close) {
            if (potentialFoe.stats.canBeAttacked && this.entity.stats.canAttack && this.entity !== potentialFoe) {
                actions.push({
                    name: 'attack : ' + potentialFoe.stats.name,
                    id: 'atk:norm',
                    pos: potentialFoe.pos,
                    execute: () => {
                        stageValuesAccessor.pushToLog(this.entity.stats.name + ' attack ' + potentialFoe.stats.name);
                        let attackScore = Number(this.entity.stats.physique) + stageValuesAccessor.getDice(1, 6);
                        let defenseScore = Number(potentialFoe.stats.physique) + stageValuesAccessor.getDice(1, 6);
                        stageValuesAccessor.pushToLog(attackScore + ' attack against ' + defenseScore + ' defense');
                        let degat = attackScore - defenseScore;
                        if (degat > 0) {
                            stageValuesAccessor.pushToLog(potentialFoe.stats.name + ' is touched and take ' + degat + ' damage(s)');
                            potentialFoe.emit('damage', {
                                damage: degat,
                            });
                            if (potentialFoe.stats.health <= 0) {
                                stageValuesAccessor.pushToLog(potentialFoe.stats.name + ' is dead');
                                potentialFoe.emit('killed-by', this.entity);
                            }
                        } else {
                            stageValuesAccessor.pushToLog(potentialFoe.stats.name + ' totaly esquive the attack');
                        }
                    },
                });
            }
        }
        return { stageValuesAccessor, actions };
    }
};
