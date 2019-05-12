const Component = require('../Component.js');
module.exports = class BaseStats extends Component {
    constructor(params = {}) {
        super();
        this.physique = params.physique || 5;
        this.mental = params.mental || 5;
        this.health = params.health || 5;
        this.deplacement = params.deplacement || 2;
        this.flag = params.flag || {};
        this.isDead = false;
    }

    get statsToAdd() {
        return ['physique', 'mental', 'desc', 'perception', 'deplacement', 'health', 'isDead', 'flag'];
    }

    get eventsToSubscribe() {
        return [
            {
                name: 'killed-by',
                handler: killer => {
                    this.isDead = true;
                    this.entity._img = this.entity._img + '-dead';
                    return killer;
                },
            },
            {
                name: 'receive-flag',
                handler: flag => {
                    this.flag[flag] = true;
                },
            },
            {
                name: 'remove-flag',
                handler: flag => {
                    this.flag[flag] = false;
                },
            },
            {
                name: 'damage',
                handler: event => {
                    this.health = this.health - event.damage;
                    event.damage = 0;
                    return event;
                },
            },
        ];
    }

    getAction({ stageValuesAccessor, actions }) {
        let grid = stageValuesAccessor.subGrid(this.entity.pos, this.deplacement);
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid.length; x++) {
                let cellPos = {
                    x: this.entity.pos.x + (x - this.deplacement),
                    y: this.entity.pos.y + (y - this.deplacement),
                };
                if (this.canMove(grid[y][x], this.entity.pos, cellPos)) {
                    let modifiers = this.moveModifiers(this.entity.pos, cellPos);
                    actions.push({
                        name: 'move : ' + modifiers.nameModifier,
                        id: 'mv:' + modifiers.idModifier,
                        pos: cellPos,
                        execute: () => {
                            stageValuesAccessor.pushToLog(this.entity.stats.name + ' se deplace');
                            stageValuesAccessor.hasMoved(this.entity, cellPos);
                        },
                    });
                }
            }
        }
        return { stageValuesAccessor, actions };
    }

    canMove(content, oldPos, pos) {
        return content === undefined && Math.abs(pos.x - oldPos.x) + Math.abs(pos.y - oldPos.y) === 1;
    }

    moveModifiers(oldPos, pos) {
        let result = pos.x - oldPos.x + ';' + (pos.y - oldPos.y);
        switch (result) {
        case '1;0':
            return {
                idModifier: 'rg',
                nameModifier: ' right',
            };
        case '-1;0':
            return {
                idModifier: 'lf',
                nameModifier: ' left',
            };
        case '0;1':
            return {
                idModifier: 'dw',
                nameModifier: ' down',
            };
        case '0;-1':
            return {
                idModifier: 'up',
                nameModifier: ' up',
            };
        default:
            throw new Error('unknow direction ' + result);
        }
    }

    get desc() {
        switch (this.health) {
        case 5:
            return ', indemne';
        case 4:
            return ', éraflé';
        case 3:
            return ', legerement blessé';
        case 2:
            return ', blessé';
        case 1:
            return ', a l\'agonie';
        default:
            return ', mort d\'etre décédé';
        }
    }

    get perception() {
        return this.mental * 2;
    }
};
