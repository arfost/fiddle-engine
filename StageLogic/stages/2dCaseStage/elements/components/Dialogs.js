class Dialog extends Component {
    constructor(params) {
        super();
        this.step = "base";
        this.desc = params.desc;
        this.steps = params.steps;
    }

    get statsToAdd() {
        return ["desc"];
    }

    getAction(against) {
        let actions = [];
        for (let repli of this.steps[this.step].replis) {
            actions.push({
                name: "say : " + repli.text,
                id: "say:" + this.step + ":" + repli.code,
                pos: this.entity.pos,
                execute: (stage, content, player) => {
                    stage.logGameAction.push(String(against.stats.name + " say : " + repli.text));
                    this.step = repli.next;
                    stage.logGameAction.push(
                        String(
                            this.entity.stats.name +
                            " say : " +
                            this.steps[this.step].text
                        )
                    );
                    if (this.steps[this.step].events) {
                        for (let event of this.steps[this.step].events) {
                            against.emit(event.name, event.params);
                            if (event.text) {
                                stage.logGameAction.push(
                                    String(
                                        this.entity.stats.name + " : " + event.text
                                    )
                                );
                            }
                        }
                    }
                }
            });
        }
        return actions;
    }
}