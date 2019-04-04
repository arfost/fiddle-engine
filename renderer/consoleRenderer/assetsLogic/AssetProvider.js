const Image = require('./assets/Image.js')
class AssetProvider {
    constructor(assetDeclaration) {
        this.assetDeclaration = assetDeclaration;
    }

    getNewImg(id) {
        if (this.assetDeclaration[id]) {
            return new Image(...this.assetDeclaration[id])
        }
        throw new Error('unknow asset id : ' + id)
    }
}

const instance = new AssetProvider(require('./assetDeclaration.json'));

module.exports = instance;