const GameStage = require('./stages/2dCaseStage/2dCaseStage.js');
const MenuStage = require('./stages/menu/MenuStage.js');

const createEntityFromDesc = require('./stages/2dCaseStage/elements/Entities.js');

const DungeonGenerator = require('../utils/2dDungeonGenerator.js');

module.exports = function (type, game, params) {
    let stageClass = getStageType(type);
    let stage = new stageClass(game);
    if(type == 'game'){
        stage = stageConfiguration(stage, params);
    }
    return stage;
};

function getStageType(type) {
    switch (type) {
    case 'menu':
        return MenuStage;
    case 'game':
        return GameStage;
    default:
        throw new Error('unknow stage type : ' + type);
    }
}

function stageConfiguration(stage, params = {
    map : 'generated-dungeon'
}){
    let id = 0;
    let mapRoom = {
        2:{
            foeToSpawn:0,
            shrineToSpawn:0,
            playerToSpawn:1,
        }
    };

    if(params.map == 'generated-dungeon'){
        params.map = DungeonGenerator({width:100,heigth:100});
    }
    for(let j = 0; j < params.map.length; j++){
        for(let i = 0; i < params.map[j].length; i++){
            let cell = params.map[j][i];
            let pos = {
                x: i,
                y: j,
            };
            if(cell == 1){
                stage.addEntity(createEntityFromDesc({
                    pos,
                    type: 'wall',
                    img: 'wall',
                    id: id++
                }));
            }else if(mapRoom[cell] && mapRoom[cell].foeToSpawn){ 
                if(stage.accessors.getDice(1,100)<10){
                    stage.addEntity(createEntityFromDesc({
                        pos,
                        type: 'gobelin',
                        img: 'gob',
                        id: id++,
                    }));
                    mapRoom[cell].foeToSpawn--;
                }
                
            }else if(mapRoom[cell] && mapRoom[cell].shrineToSpawn){ 
                if(stage.accessors.getDice(1,100)<10){
                    stage.addEntity(createEntityFromDesc({
                        pos,
                        type: 'shrine',
                        img: 'shrine',
                        id: id++,
                    }));
                    mapRoom[cell].shrineToSpawn--;
                }
            }else if(mapRoom[cell] && mapRoom[cell].playerToSpawn){ 
                stage.addEntity(createEntityFromDesc({
                    pos,
                    type: 'player',
                    img: 'player',
                    id: id++,
                }));
                mapRoom[cell].playerToSpawn--;
                console.log('player spawned cell '+cell+':'+i+','+j);
            }else if(!mapRoom[cell] && cell != 0){
                mapRoom[cell] = {
                    foeToSpawn:stage.accessors.getDice(0, 3),
                    shrineToSpawn: stage.accessors.getDice(0, 1),
                    playerToSpawn:0,
                }
            }
        }
    }
    stage.init();
    return stage;
}

