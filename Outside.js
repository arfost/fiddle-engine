const readline = require('readline');
module.exports = class Outside {
    constructor() {
        this.errorMode = 0;
        this.minSize = {
            rows: 30,
            columns: 70
        };
        try {
            readline.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);

            process.stdout.write("\u001b[2J\u001b[0;0H");
            process.stdout.write("\u001b[=2h");
        } catch (e) {
            this.errorMode = 1;
        }
        process.stdout.on('resize', ()=>this.isResized());

        this.lastInput = false;
        process.stdin.on('keypress', (str, details)=>this.keyPressed(str, details));
        this.isResized();
    }

    keyPressed(str, details) {
        //console.log(str, details);
        this.lastInput = this.turnActionAssoc[str];
        if (str === "p") {
            process.exit(0);
        }
    }

    isResized() {
        if (process.stdout.columns < this.minSize.columns || process.stdout.rows < this.minSize.rows) {
            this.errorMode = 2;
        } else {
            this.size = {
                columns:process.stdout.columns,
                rows:process.stdout.rows
            };
            process.stdout.write("\u001b[2J\u001b[0;0H");
            this.errorMode = 0;
        }
    }

    getLastInput(){
        let tmp = this.lastInput;
        this.lastInput = false;
        return tmp;
    };

    get errorCodeMessages(){
        return [
            "no error",
            "unable to start in and out correctly, maybe raw mode is insupported, or we are not a TTY",
            "screen is to small to display game interface"
        ]
    }

    drawError(){
        process.stdout.write("\u001b[2J\u001b[0;0H");
        process.stdout.write(this.errorCodeMessages[this.errorMode]);
    }

    drawScreen(gameInfos) {

        if (this.errorMode !== 0) {
            this.drawError();
            return;
        }

        let title = this.normalizeTextLines(gameInfos.gameInfos+` (${this.size.columns}x${this.size.rows})`, this.size.columns, 3);

        let visualPart = this.createVisualPart(gameInfos.stageInfos, Math.floor(this.size.columns*0.66), Math.floor((this.size.rows-8)*0.66), true);

        let preparedActions = this.prepareAction(gameInfos.stageInfos.actions);
        let actionText = this.normalizeTextLines(preparedActions, Math.floor(this.size.columns*0.33), Math.floor((this.size.rows-8)*0.66));
        let mergedVisualAction = this.mergePart(visualPart, actionText.split("\n"));

        let logText = this.normalizeTextLines(gameInfos.stageInfos.gameLog, this.size.columns, Math.floor((this.size.rows-8)*0.33));

        //process.stdout.write("\u001b[2J");
        process.stdout.write("\u001b[0;0H");
        process.stdout.write(title+mergedVisualAction+"\n"+logText);
        process.stdout.write("\x1b[0m");
    }

    prepareAction(actions){

        let formattedActions = [...this.normalizeSoloLine("Actions : ", Math.floor(this.size.columns*0.33)-2, 1)];
        let turnActionAssoc = {};
        let keys = this.keysForBinding;

        for(let action of actions){
            let key;
            if(keys.preferedAssociations[action.key]){
                key = keys.preferedAssociations[action.key];
            }else{
                key = keys.vrac.pop();
            }
            turnActionAssoc[key] = action;
            formattedActions.push(` - ${key} : ${action.name}[${action.pos.x};${action.pos.y}]`);
        }
        this.turnActionAssoc = turnActionAssoc;
        return formattedActions;
    }

    get keysForBinding(){
        return {
            vrac:[
                "r",
                "t",
                "y",
                "u",
                "f"
            ],
            preferedAssociations:{
                "mv:up":"z",
                "mv:dw":"s",
                "mv:lf":"q",
                "mv:rg":"d"
            }
        }
    }

    mergePart(left, right, mergeChar = ''){
        let max = left.length > right.length ? left.length : right.length;
        let merged = [];
        for(let i = 0; i < max; i++){
            let lineLeft = left[i] ? left[i] : " ".repeat();
            let lineRight = right[i] ? right[i] : " ";
            merged.push(lineLeft+mergeChar+lineRight)
        }
        return merged.join('\n');
    }

    get affChars(){
        return {
            bordureVisualHori:"=",
            bordureVisualVerti:"|"
        }
    }

    createVisualPart(infos, columns, rows, doubledColumns = false){

        let doubled = (doubledColumns ? " " : "");
        columns = Math.floor(columns / (doubledColumns ? 2:1))-2;

        let base = new Array(rows).fill(0);
        base = base.map(()=>{
            let row = new Array(columns).fill(0);
            return row.map(()=>doubled+infos.baseFloor.img);
        });
        let playerRelX = Math.ceil(infos.basePos.x-columns/2);
        let playerRelY = Math.ceil(infos.basePos.y-rows/2);

        for(let entity of infos.entities){
            base[entity.pos.y-playerRelY][entity.pos.x-playerRelX] = doubled+entity.img;
        }
        base.unshift(new Array(base[0].length).fill((doubledColumns ? this.affChars['bordureVisualHori']:"")+this.affChars['bordureVisualHori']));
        base.push(new Array(base[0].length).fill((doubledColumns ? this.affChars['bordureVisualHori']:"")+this.affChars['bordureVisualHori']));
        base = base.map((d)=>{
            return this.affChars['bordureVisualVerti']+this.affChars['bordureVisualVerti'] +
                d.join('') +
                this.affChars['bordureVisualVerti']+this.affChars['bordureVisualVerti'];
        });

        return base;
    }

    normalizeTextLines(lines, columns, rows) {
        if(Array.isArray(lines)){
            lines = this.normalizeArray(lines, columns, rows);
        }else{
            lines = this.normalizeSoloLine(lines, columns, rows);
        }

        return lines.join('\n');
    }

    normalizeArray(lines, columns, rows){
        console.log("//////////////"+columns);
        let tranLines = [];
        for (let line of lines) {
            if (line.length <= columns) {
                console.log(columns+";"+line.length+";"+(columns - line.length));
                console.log(line);
                console.log(line.padEnd(columns));
                tranLines.push(line.padEnd(columns));
            } else if (line.length > columns) {
                tranLines.push(`${line.substring(0, columns)}`);
                tranLines.push(`${line.substring(columns)}`);
            }
        }
        while (tranLines.length < rows) {
            tranLines.push(" ".repeat(columns));
        }
        return tranLines;
    }

    normalizeSoloLine(line, columns, rows){
        let diff = (columns - line.length);
        let lineArray = [" ".repeat(diff/2) + line + " ".repeat(diff/2)];

        let emptyRows = rows - lineArray.length;
        while(emptyRows>2){
            if(!!(emptyRows % 2)){
                lineArray.unshift(" ".repeat(columns));
            }else{
                lineArray.push(" ".repeat(columns));
            }
            emptyRows = rows - 2 - lineArray.length;
        }

        if(emptyRows>0){
            lineArray.push("*".repeat(columns));
            emptyRows--;
        }
        if(emptyRows>0){
            lineArray.unshift("*".repeat(columns));
        }
        let copyLineArray = [];
        for(let line of lineArray){
            copyLineArray.push(line.replace(/.$/,"*").replace(/^./,"*"));
        }
        return copyLineArray;
    }
};
