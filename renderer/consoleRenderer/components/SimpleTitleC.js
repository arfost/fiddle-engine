let BaseConsoleRendererComponents = require('../BaseConsoleRendererComponents.js');

module.exports = class SimpleTitleC extends BaseConsoleRendererComponents {
    /**
     *
     * @param {String} data - title to show
     */
    getThingTodraw(data) {
        let part = [];
        if (typeof data !== "string") {
            throw new Error("data type for SimpleTitle must be a string");
        }

        if (data.length > this.size.columns) {
            let size = this.size.columns / 10;
            part.push(data.substring(0, size));
            part.push(data.substring(size, data.length));
        } else {
            part.push(data);
        }

        part = this.centerHLine(
            part.map(this.centerLine.bind(this)).map(this.decorateLine.bind(this)),
            this.size.rows - 2
        );
        part.unshift(this.newDecorationLine());
        part.push(this.newDecorationLine());

        return part;
    }
};
