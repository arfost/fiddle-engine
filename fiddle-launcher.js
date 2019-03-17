const Game = require('./Game.js');
const Outside = require('./Outside.js');

let gameParams = {
    screenSize: 80
};
let gameDesc = {
    stages: {

    },
    player: {

    }
};
let outside = new Outside();
let game = new Game(outside, gameDesc, gameParams);
game.start();