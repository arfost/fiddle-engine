const Component = require('../Component.js')

module.exports = class Combat extends Component {
    constructor(params) {
        super();
        this.canBeAttacked = true;
        this.canAttack = true;
    }

    get statsToAdd() {
        return ["canBeAttacked", "canAttack"];
    }

    getAction(against) {
        let actions = [];
        let isNear =
            Math.abs(this.entity.pos.x - against.pos.x) +
            Math.abs(this.entity.pos.y - against.pos.y) ===
            1;
        if (against.stats.canBeAttacked && this.canAttack && isNear) {
            actions.push({
                name: "attack : " + this.entity.stats.name,
                id: "atk:norm",
                pos: against.pos,
                execute: (stage, content, player) => {
                    stage.logGameAction.push(
                        String(
                            against.stats.name +
                            " attack " +
                            this.entity.stats.name
                        )
                    );
                    let attackScore =
                        Number(against.stats.physique) + stage.getDice(1, 6);
                    let defenseScore =
                        Number(this.entity.stats.physique) +
                        stage.getDice(1, 6);
                    stage.logGameAction.push(
                        String(
                            attackScore +
                            " attack against " +
                            defenseScore +
                            " defense"
                        )
                    );
                    let degat = attackScore - defenseScore;
                    if (degat > 0) {
                        stage.logGameAction.push(
                            String(
                                this.entity.stats.name +
                                " is touched and take " +
                                degat +
                                " damage(s)"
                            )
                        );
                        this.entity.emit("damage", {
                            damage: degat
                        });
                        if (this.entity.stats.health <= 0) {
                            stage.logGameAction.push(
                                String(this.entity.stats.name + " is dead")
                            );
                        }
                    } else {
                        stage.logGameAction.push(
                            String(
                                this.entity.stats.name +
                                " totaly esquive the attack"
                            )
                        );
                    }
                }
            });
        }
        return actions;
    }
}