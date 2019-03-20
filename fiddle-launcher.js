const Game = require('./Game.js');
const Renderer = require('./renderer/consoleRenderer/ConsoleRenderer.js');

let game = new Game(Renderer);
game.start();