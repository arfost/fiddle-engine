const Component = require('../Component.js');

const DIALOG_MAXIMAL_RANGE = 5;

module.exports.DialogAnswerer = class DialogAnswerer extends Component {
    constructor(ref) {
        super();
        let params = require(ref);
        this.desc = params.desc;
        this._steps = params.steps;
    }

    get isDialogAnswerer(){
        return true;
    }

    get statsToAdd() {
        return ['desc', 'isDialogAnswerer', 'steps'];
    }

    get steps(){
        return this._steps;
    }

    get eventsToSubscribe() {
        return [{
            name: 'dia-answer',
            handler: e => {
                e.outCanal(this.entity.stats.name + ' say : ' + this.steps[e.step].text);
                if (this.steps[e.step].events) {
                    for (let event of this.steps[e.step].events) {
                        e.sayBy.emit(event.name, event.params);
                        e.outCanal(this.entity.stats.name + ' ' + event.text);
                    }
                }
                return null;
            }
        }];
    }
};


module.exports.DialogsInitiator = class DialogsInitiator extends Component {
    constructor() {
        super();
        this.steps = {};
    }

    getAction({stageValuesAccessor, actions}) {
        let entities = stageValuesAccessor.closeEntityAccessor(this.entity.pos, DIALOG_MAXIMAL_RANGE);
        for (let entity of entities) {
            if (entity.stats.isDialogAnswerer) {
                let dialogStepForDialog = this.steps[entity.id] ? this.steps[entity.id] : 'base';
                let stepForCurrentEntity = entity.stats.steps[dialogStepForDialog];
                for (let repli of stepForCurrentEntity.replis) {
                    actions.push({
                        name: 'say : ' + repli.text,
                        id: 'say:' + dialogStepForDialog + ':' + repli.code,
                        pos: entity.pos,
                        execute: () => {
                            stageValuesAccessor.pushToLog(this.entity.stats.name + ' say : ' + repli.text);
                            this.steps[entity.id] = repli.next;
                            entity.emit('dia-answer', {
                                step: repli.next,
                                sayBy:this.entity,
                                outCanal:stageValuesAccessor.pushToLog
                            });
                        },
                    });
                }
            }
        }
        return {stageValuesAccessor, actions};
    }
};
