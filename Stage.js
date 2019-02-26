const Image = require('./helpers/Image.js');
const createEntityFromDesc = require('./helpers/Entities.js');
module.exports = class Stage {

    constructor(params, player) {
        this.screenSize = params.screenSize;
        this.baseFloor = new Image(["."], "#666");
        this.posEntities = [];
        this.entities = [];
        this.logGameAction = ["Vous entrez dans le stage de test"];
        this.addEntity(createEntityFromDesc({
            pos:{
                x:4,
                y:2
            },
            type:"thing",
            img:new Image(["o","O"], "green")
        }));
        this.addEntity(createEntityFromDesc({
            pos:{
                x:5,
                y:5
            },
            type:"player",
            img:new Image(["@"], "yellow")
        }));
    }

    addEntity(entity){
        if(entity.type === "player"){
            this.player = entity;
            return;
        }
        this.entities.push(entity);
        if(!this.posEntities[entity.pos.y]){
            this.posEntities[entity.pos.y] = []
        }
        this.posEntities[entity.pos.y][entity.pos.x] = entity;
    }

    turn(input){
        if(input){
            if(input === "q"){
                this.playerActeOn(-1,0);
            }
            if(input === "d"){
                this.playerActeOn(1,0);
            }
            if(input === "z"){
                this.playerActeOn(0,-1);
            }
            if(input === "s"){
                this.playerActeOn(0,1);
            }
        }
    }

    playerActeOn(x, y){
        let newPos = {
            x:this.player.pos.x+x,
            y:this.player.pos.y+y
        };

        let caseContent = this.posEntities[newPos.y] ? this.posEntities[newPos.y][newPos.x] : undefined;
        if(caseContent){
            this.logGameAction.push(caseContent.interact(this.player));
        }else{
            this.player.pos = newPos;
            this.logGameAction.push('vous vous deplacez');
        }
    }

    get screen(){
        let base = new Array(this.screenSize).fill(0);
        base = base.map(()=>{
            let row = new Array(this.screenSize).fill(0);
            return row.map(()=>" "+this.baseFloor.img);
        });
        let playerRelX = this.player.pos.x-this.screenSize/2;
        let playerRelY = this.player.pos.y-this.screenSize/2;

        base[this.player.pos.y-(playerRelY)][this.player.pos.x-(playerRelX)] = " "+this.player.img;
        for(let entity of this.entities){
            if((entity.pos.x>playerRelX && entity.pos.x < playerRelX+this.screenSize)
                &&
                (entity.pos.y>playerRelY && entity.pos.y < playerRelY+this.screenSize)){
                base[entity.pos.y-playerRelY][entity.pos.x-playerRelX] = " "+entity.img;
            }
        }
        return base;
    }

    get stageInfos(){
        return this.logGameAction.slice(-10);
    }

    get stageOtherInfos(){
        return '';
    }
};
