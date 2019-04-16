class IntelligenceArtificielle extends Component {
    constructor(params) {
        super();
    }

    get eventsToSubscribe() {
        return [{
            name: "turn",
            handler: event => {
                let allPossibleActions = []
                for (let entity of event.entList) {
                    allPossibleActions = allPossibleActions.concat(entity.getPossibleActionsFor(this.entity));
                }
                let selectedAction;
                for (let action of allPossibleActions) {
                    console.log("testing ia against : " + action.id)
                    if (action.id === "atk:norm") {
                        selectedAction = action;
                    }
                }
                if (selectedAction) {
                    event.actionExecutor(selectedAction);
                }
            }
        }];
    }
}