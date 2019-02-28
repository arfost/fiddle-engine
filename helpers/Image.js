module.exports = class Image {
    constructor(serie, fColor = 'white', bColor = 'black', logic = 'base') {
        this.serie = serie;
        logic = this.logicConv(logic);
        this.logic = new logic(this.serie);
        this.colors = Image.colorToAnsi(fColor, bColor)
    }

    get img() {
        return this.colors + this.logic.img + "\x1b[0m";
    }

    colorConv(color) {
        switch (color) {
            case "red":
                return "\x1b[31m";
            case "green":
                return "\x1b[32m";
            case "yellow":
                return "\x1b[33m";
            case "blue":
                return "\x1b[34m";
            case "magenta":
                return "\x1b[35m";
            case "cyan":
                return "\x1b[36m";
            case "white":
                return "\x1b[37m";
            default:
                return "\x1b[0m"
        }
    }

    logicConv(logic) {
        switch (logic) {
            case "random":
                return RandomLogic;
            default:
                return BaseLogic;
        }
    }

    static colorToAnsi(fg, bg) {
        return "\x1B[0;38;5;" + Image.termcolor(fg) + ";48;5;" + Image.termcolor(bg) + "m";
    }

    static termcolor(color) {
        let SRC_COLORS = 256.0;
        let DST_COLORS = 6.0;
        let COLOR_RATIO = DST_COLORS / SRC_COLORS;
        let rgb = Image.fromString(color);
        let r = Math.floor(rgb[0] * COLOR_RATIO);
        let g = Math.floor(rgb[1] * COLOR_RATIO);
        let b = Math.floor(rgb[2] * COLOR_RATIO);
        return r * 36 + g * 6 + b * 1 + 16;
    }

    static get CACHE() {
        return {
            "black": [0, 0, 0],
            "navy": [0, 0, 128],
            "darkblue": [0, 0, 139],
            "mediumblue": [0, 0, 205],
            "blue": [0, 0, 255],
            "darkgreen": [0, 100, 0],
            "green": [0, 128, 0],
            "teal": [0, 128, 128],
            "darkcyan": [0, 139, 139],
            "deepskyblue": [0, 191, 255],
            "darkturquoise": [0, 206, 209],
            "mediumspringgreen": [0, 250, 154],
            "lime": [0, 255, 0],
            "springgreen": [0, 255, 127],
            "aqua": [0, 255, 255],
            "cyan": [0, 255, 255],
            "midnightblue": [25, 25, 112],
            "dodgerblue": [30, 144, 255],
            "forestgreen": [34, 139, 34],
            "seagreen": [46, 139, 87],
            "darkslategray": [47, 79, 79],
            "darkslategrey": [47, 79, 79],
            "limegreen": [50, 205, 50],
            "mediumseagreen": [60, 179, 113],
            "turquoise": [64, 224, 208],
            "royalblue": [65, 105, 225],
            "steelblue": [70, 130, 180],
            "darkslateblue": [72, 61, 139],
            "mediumturquoise": [72, 209, 204],
            "indigo": [75, 0, 130],
            "darkolivegreen": [85, 107, 47],
            "cadetblue": [95, 158, 160],
            "cornflowerblue": [100, 149, 237],
            "mediumaquamarine": [102, 205, 170],
            "dimgray": [105, 105, 105],
            "dimgrey": [105, 105, 105],
            "slateblue": [106, 90, 205],
            "olivedrab": [107, 142, 35],
            "slategray": [112, 128, 144],
            "slategrey": [112, 128, 144],
            "lightslategray": [119, 136, 153],
            "lightslategrey": [119, 136, 153],
            "mediumslateblue": [123, 104, 238],
            "lawngreen": [124, 252, 0],
            "chartreuse": [127, 255, 0],
            "aquamarine": [127, 255, 212],
            "maroon": [128, 0, 0],
            "purple": [128, 0, 128],
            "olive": [128, 128, 0],
            "gray": [128, 128, 128],
            "grey": [128, 128, 128],
            "skyblue": [135, 206, 235],
            "lightskyblue": [135, 206, 250],
            "blueviolet": [138, 43, 226],
            "darkred": [139, 0, 0],
            "darkmagenta": [139, 0, 139],
            "saddlebrown": [139, 69, 19],
            "darkseagreen": [143, 188, 143],
            "lightgreen": [144, 238, 144],
            "mediumpurple": [147, 112, 216],
            "darkviolet": [148, 0, 211],
            "palegreen": [152, 251, 152],
            "darkorchid": [153, 50, 204],
            "yellowgreen": [154, 205, 50],
            "sienna": [160, 82, 45],
            "brown": [165, 42, 42],
            "darkgray": [169, 169, 169],
            "darkgrey": [169, 169, 169],
            "lightblue": [173, 216, 230],
            "greenyellow": [173, 255, 47],
            "paleturquoise": [175, 238, 238],
            "lightsteelblue": [176, 196, 222],
            "powderblue": [176, 224, 230],
            "firebrick": [178, 34, 34],
            "darkgoldenrod": [184, 134, 11],
            "mediumorchid": [186, 85, 211],
            "rosybrown": [188, 143, 143],
            "darkkhaki": [189, 183, 107],
            "silver": [192, 192, 192],
            "mediumvioletred": [199, 21, 133],
            "indianred": [205, 92, 92],
            "peru": [205, 133, 63],
            "chocolate": [210, 105, 30],
            "tan": [210, 180, 140],
            "lightgray": [211, 211, 211],
            "lightgrey": [211, 211, 211],
            "palevioletred": [216, 112, 147],
            "thistle": [216, 191, 216],
            "orchid": [218, 112, 214],
            "goldenrod": [218, 165, 32],
            "crimson": [220, 20, 60],
            "gainsboro": [220, 220, 220],
            "plum": [221, 160, 221],
            "burlywood": [222, 184, 135],
            "lightcyan": [224, 255, 255],
            "lavender": [230, 230, 250],
            "darksalmon": [233, 150, 122],
            "violet": [238, 130, 238],
            "palegoldenrod": [238, 232, 170],
            "lightcoral": [240, 128, 128],
            "khaki": [240, 230, 140],
            "aliceblue": [240, 248, 255],
            "honeydew": [240, 255, 240],
            "azure": [240, 255, 255],
            "sandybrown": [244, 164, 96],
            "wheat": [245, 222, 179],
            "beige": [245, 245, 220],
            "whitesmoke": [245, 245, 245],
            "mintcream": [245, 255, 250],
            "ghostwhite": [248, 248, 255],
            "salmon": [250, 128, 114],
            "antiquewhite": [250, 235, 215],
            "linen": [250, 240, 230],
            "lightgoldenrodyellow": [250, 250, 210],
            "oldlace": [253, 245, 230],
            "red": [255, 0, 0],
            "fuchsia": [255, 0, 255],
            "magenta": [255, 0, 255],
            "deeppink": [255, 20, 147],
            "orangered": [255, 69, 0],
            "tomato": [255, 99, 71],
            "hotpink": [255, 105, 180],
            "coral": [255, 127, 80],
            "darkorange": [255, 140, 0],
            "lightsalmon": [255, 160, 122],
            "orange": [255, 165, 0],
            "lightpink": [255, 182, 193],
            "pink": [255, 192, 203],
            "gold": [255, 215, 0],
            "peachpuff": [255, 218, 185],
            "navajowhite": [255, 222, 173],
            "moccasin": [255, 228, 181],
            "bisque": [255, 228, 196],
            "mistyrose": [255, 228, 225],
            "blanchedalmond": [255, 235, 205],
            "papayawhip": [255, 239, 213],
            "lavenderblush": [255, 240, 245],
            "seashell": [255, 245, 238],
            "cornsilk": [255, 248, 220],
            "lemonchiffon": [255, 250, 205],
            "floralwhite": [255, 250, 240],
            "snow": [255, 250, 250],
            "yellow": [255, 255, 0],
            "lightyellow": [255, 255, 224],
            "ivory": [255, 255, 240],
            "white": [255, 255, 255]
        }
    };

    static fromString(str) {
        let cached, r;

        if (str in Image.CACHE) {
            cached = Image.CACHE[str];
        } else {
            if (str.charAt(0) == "#") {
                // hex rgb
                let matched = str.match(/[0-9a-f]/gi) || [];
                let values = matched.map(function (x) {
                    return parseInt(x, 16);
                });

                if (values.length == 3) {
                    cached = values.map(function (x) {
                        return x * 17;
                    });
                } else {
                    for (let i = 0; i < 3; i++) {
                        values[i + 1] += 16 * values[i];
                        values.splice(i, 1);
                    }

                    cached = values;
                }
            } else if (r = str.match(/rgb\(([0-9, ]+)\)/i)) {
                // decimal rgb
                cached = r[1].split(/\s*,\s*/).map(function (x) {
                    return parseInt(x);
                });
            } else {
                // html name
                cached = [0, 0, 0];
            }

            Image.CACHE[str] = cached;
        }

        return cached.slice();
    }
};



class BaseLogic {
    constructor(serie) {
        this.serie = serie;
        //-1 because we increase before returning
        this.current = -1;
    }

    get img() {
        this.current++;
        if (this.current >= this.serie.length * 10) {
            this.current = 0;
        }
        return this.serie[Math.floor(this.current / 10)];
    }
}

class RandomLogic {
    constructor(serie) {
        this.serie = serie;
    }

    get img() {
        return this.serie[this.getRandomIntInclusive(0, this.serie.length - 1)];
    }

    getRandomIntInclusive(min, max) {
        if (typeof max === 'undefined') {
            max = min;
            min = 1;
        }
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }
}