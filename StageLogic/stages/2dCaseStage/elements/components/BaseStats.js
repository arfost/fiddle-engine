class BaseStats extends Component {
    constructor(params) {
        super();
        this.physique = 5;
        this.mental = 5;
        this.health = 5;
    }

    get statsToAdd() {
        return ["physique", "mental", "desc", "perception"];
    }

    get desc() {
        switch (this.health) {
            case 5:
                return ", indemne";
            case 4:
                return ", éraflé";
            case 3:
                return ", legerement blessé";
            case 2:
                return ", blessé";
            case 1:
                return ", a l'agonie";
            default:
                return ", mort d'etre décédé";
        }
    }

    get perception() {
        return this.mental * 2;
    }

    get eventsToSubscribe() {
        return [{
            name: "damage",
            handler: event => {
                this.health = this.health - event.damage;
                event.damage = 0;
                return event;
            }
        }];
    }
}