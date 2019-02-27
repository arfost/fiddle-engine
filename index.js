const Game = require('./Game.js');
const Outside = require('./Outside.js');

const fs = require('fs');
const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
console.log = function(d) { //
    log_file.write(JSON.stringify(d, null, 4) + '\n');
};

let gameParams = {
    screenSize: 80
};
let gameDesc = {
    stages:{

    },
    player:{

    }
};
let outside = new Outside();
let game = new Game(outside, gameDesc, gameParams);
game.start();
