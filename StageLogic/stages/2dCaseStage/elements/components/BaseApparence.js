class BaseApparence extends Component {
    constructor(params) {
        super();
        this.desc = params.desc;
        this.name = params.name;
    }

    get statsToAdd() {
        return ["desc", "name"];
    }
}