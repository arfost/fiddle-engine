
module.exports = class GameStage {
    constructor(game) {
        this.game = game;
        this.baseFloor = 'base';
        this.baseDesc = 'un endroit vide';
        this.posEntities = [];
        this.entities = [];
        this.logGameAction = ['Vous entrez dans le stage de test'];
    }

    init(){
        for (let entity of this.entities) {
            entity.prepareForTurn(this.accessors);
        }
    }

    addEntity(entity) {
        if (entity.type === 'player') {
            this.player = entity;
        }
        this.entities.push(entity);
        if (!this.posEntities[entity.pos.y]) {
            this.posEntities[entity.pos.y] = [];
        }
        this.posEntities[entity.pos.y][entity.pos.x] = entity;
    }
    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
        this.posEntities[entity.pos.y][entity.pos.x] = undefined;
    }
    turn(input) {
        if (input) {
            //big ad hoc test very very bad bad
            if (input.id === 'mn:pr') {
                input.execute(this.game, this);
                return;
            }
            input.execute();
            for (let entity of this.entities) {
                entity.prepareForTurn(this.accessors);
            }
        }
    }

    get accessors() {
        return {
            getDice(min, max) {
                if (typeof max === 'undefined') {
                    max = min;
                    min = 1;
                }
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
            },
            closeEntityAccessor: (basePos, distance) => {
                let entities = [];
                for (let i = basePos.y - distance; i <= basePos.y + distance; i++) {
                    for (let j = basePos.x - distance; j <= basePos.x + distance; j++) {
                        let content = this.posEntities[i] ? this.posEntities[i][j] : undefined;
                        if (content) {
                            entities.push(content);
                        }
                    }
                }
                return entities;
            },
            pushToLog: toPush => {
                this.logGameAction.push(String(toPush));
            },
            subGrid: (pos, size) => {
                let grid = [];
                for (let i = pos.y - size; i < pos.y + size; i++) {
                    let row = this.posEntities[i] ? this.posEntities[i].slice(pos.x - size, pos.x + size) : new Array(size * 2 + 1);
                    grid.push(row);
                }
                return grid;
            },
            hasMoved: (entity, newPos) => {
                this.posEntities[entity.pos.y][entity.pos.x] = undefined;
                entity.pos = newPos;
                if (!this.posEntities[entity.pos.y]) {
                    this.posEntities[entity.pos.y] = [];
                }
                this.posEntities[entity.pos.y][entity.pos.x] = entity;
            },
            removeFromPlay: dead => {
                this.removeEntity(dead);
            },
        };
    }

    get stageAction() {
        return [
            {
                name: 'menu principal',
                id: 'mn:pr',
                execute: function(game) {
                    game.saveCurrentStageAndChange('game', 'menu');
                },
            },
        ];
    }

    getStageInfos() {
        let retour = {
            basePos: this.player.pos,
            entities: [],
            baseFloor: this.baseFloor,
            baseDesc: this.baseDesc,
            gameLog: this.logGameAction,
            actions: [...(!this.player.stats.isDead ? this.player.turnActions : []), ...this.stageAction],
        };

        retour.entities = this.accessors.closeEntityAccessor(this.player.pos, Number(this.player.stats.perception));

        return retour;
    }
};
