/*
Z heights:
    3=decorations (ex. mugs, plates, flowers, papers)
    2=walls,doors,tables,chairs,chests
    1=rugs,traps
    0=floors
*/

var buildOptions = []; //for ui, but defined here cause obj defines need it
var objImgPaths = [];

/*
Obj Dic is a full dictanary of every object that can exist, falling into one of these types:
    Placeable - A regular object with no update function
    Plant - A plant which will grow over time and drop an item when fully grown
    Trap - An object that when stepped on will hurt the player or environment
    InvObj - An object that when clicked will open the inventory menu
    Custom - An object with a custom update Function
*/

var objDic = {};
definePlaceable("Wall", ['tempwall1'], [["dirt", 20]], 128, 128, 2, 100, true, true);
definePlaceable("Door", ['tempdoor1'], [["dirt", 20]], 64, 128, 2, 100, true, true);
definePlaceable("Floor", ['tempfloor1'], [["dirt", 20]], 128, 128, 0, 100, true, true);
definePlaceable("Rug", ['temprug1'], [["dirt", 20]], 128, 128, 1, 100, true, true);
definePlaceable("Mug", ['tempmug'], [["dirt", 20]], 32, 32, 3, 100, false, true);
defineTrap("BearTrap", ['beartrap1'], [["dirt", 20]], 68, 48, 100, 50, 50, false, 15, true);
defineTrap("LandMine", ['bomb1'], [["dirt", 20]], 52, 36, 100, 40, 40, false, 10, false);

function turretUpdate(){
    if(this.hp <= 0){
        this.deleteTag = true;

        let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
        socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
    }
    if(curPlayer.name != this.ownerName){
        this.rot = curPlayer.pos.copy().sub(this.pos).heading();
        let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);

        if(this.cooldown == undefined){
            this.cooldown = 2;
        }
        else{
            this.cooldown -= 1/60;
            if(this.cooldown <= 0){
                this.cooldown = 2;

                let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
                let toPlayer = curPlayer.pos.copy().sub(this.pos).setMag(50);
                let proj = createProjectile(
                    "Rock", this.ownerName, this.color,
                    this.pos.x + toPlayer.x - 20,
                    this.pos.y + toPlayer.y,
                    toPlayer.heading()
                )
                testMap.chunks[chunkPos.x+','+chunkPos.y].projectiles.push(
                    proj
                );
                //tell the server you made a projectile
                socket.emit("new_proj", proj);
            }
        }
        socket.emit("update_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z, update_name: "rot", update_value: this.rot});
    }
}
defineCustomObj("Turret", ['tempturret1'], [["dirt", 20], ["Rock", 5]], 60, 60, 2, 100, turretUpdate, true, true);
definePlant("Mushroom", ['tempmushroom1','tempmushroom2','tempmushroom3'], [["dirt", 20]], 60, 60, 100, 60, "edible_mushroom");

function bombUpdate(){
    //Fuse go down
    this.hp-=1;

    if (this.hp <= 0) {
        
        // Bomb hurts everyone nearby
        if(this.pos.dist(curPlayer.pos) < -2+(this.size.w+this.size.h)/2){
            curPlayer.statBlock.stats.hp -= 20;
            socket.emit("update_pos", curPlayer);
        }

        // if you made this bomb, when it eventually blows up, the 'damage' will be sent to server by bomb-placer
        if(this.id == curPlayer.id && this.ownerName == curPlayer.name) { 

        }

        // Remove bomb after explosion
        this.deleteTag = true;
        let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
        socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
    }
}
defineCustomObj("PlacedBomb", ['bomb1','bomb2'], [["dirt", 20]], 15*4, 13*4, 1, 200, bombUpdate, false, true);

//defineInvObj("Chest", 10, 60, 60, 100, 10.5, true);

var teamColors = [
    {r:   0, g:   0, b:   0}, //Black - No Team
    {r: 255, g:   0, b:   0}, //Red
    {r:   0, g:   0, b: 255}, //Blue
    {r:   0, g: 255, b:   0}, //Green
    {r: 255, g: 255, b:   0}, //Yellow
    {r: 255, g:   0, b: 255}, //Magenta
    {r:   0, g: 255, b: 255}, //Cyan
    {r: 255, g: 255, b: 255}, //White
    {r: 127, g:  63, b:   0}, //Brown
    {r: 255, g: 128, b: 225}, //Pink
    {r: 255, g: 128, b:   0}, //Orange
    {r: 128, g:   0, b: 255}, //Purple
    {r:   0, g: 128, b:   0}  //Dark-Green
]

class Placeable{
    constructor(objName,x,y,w,h,rot,z,color,health,imgNum,canRotate){
        this.objName = objName;
        this.pos = createVector(x,y);
        this.size = {w: w, h: h};
        this.rot = rot;
        this.z = z;
        this.color = color; //index to team colors
        this.hp = health;
        this.mhp = health;
        this.imgNum = imgNum;
        this.canRotate = canRotate;
        this.alpha = 255;

        this.openBool = true; //is object in an open spot?, used for ghost rendering
        this.deleteTag = false;
        this.type = "Placeable";
    }

    update(){
        if(this.hp <= 0){
            this.deleteTag = true;

            let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
            socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
        }
    }

    render(t){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        if(t == "green") tint(100, 200, 100, 100);
        if(t == "red") tint(200, 100, 100, 100);
        if(this.alpha < 255) tint(255, this.alpha);
        image(objImgs[this.imgNum][0], -this.size.w/2,-this.size.h/2, this.size.w, this.size.h);
        pop();
    }

    ghostRender(ob){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        
        this.openBool = ob;

        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        let chunk = testMap.chunks[chunkPos.x+","+chunkPos.y];
        for(let j = 0; j < chunk.objects.length; j++){
            if(this.z == chunk.objects[j].z){
                let d = chunk.objects[j].pos.dist(this.pos);
                if(d*2 < (chunk.objects[j].size.w+chunk.objects[j].size.h)/2 + (this.size.w+this.size.h)/2){
                    this.openBool = false;
                }
            }
        }

        if(this.openBool){
            let collisionChecks = [];
            collisionChecks.push(this.checkCollisions(
                round(((-1*cos(this.rot)*(this.size.w/2))-(-0.9*sin(this.rot)*(this.size.h/2)))/TILESIZE),
                round(((-1*sin(this.rot)*(this.size.w/2))+(-0.9*cos(this.rot)*(this.size.h/2)))/TILESIZE)
            ));
            collisionChecks.push(this.checkCollisions(
                round(((1*cos(this.rot)*(this.size.w/2))-(-1*sin(this.rot)*(this.size.h/2)))/TILESIZE),
                round(((1*sin(this.rot)*(this.size.w/2))+(-1*cos(this.rot)*(this.size.h/2)))/TILESIZE)
            ));
            collisionChecks.push(this.checkCollisions(
                round(((1*cos(this.rot)*(this.size.w/2))-(1*sin(this.rot)*(this.size.h/2)))/TILESIZE),
                round(((1*sin(this.rot)*(this.size.w/2))+(1*cos(this.rot)*(this.size.h/2)))/TILESIZE)
            ));
            collisionChecks.push(this.checkCollisions(
                round(((-1*cos(this.rot)*(this.size.w/2))-(1.1*sin(this.rot)*(this.size.h/2)))/TILESIZE),
                round(((-1*sin(this.rot)*(this.size.w/2))+(1.1*cos(this.rot)*(this.size.h/2)))/TILESIZE)
            ));
            for (let i = 0; i < collisionChecks.length; i++) {
                let check = collisionChecks[i];
                if (check.val == -1) this.openBool = false;
                if (check.val > 0) {
                    this.openBool = false;
                }
            }
        }
        pop();

        if(this.openBool) this.render("green"); //green
        else this.render("red"); //red
    }

    checkCollisions(xOffset, yOffset) {
        let chunkPos = testMap.globalToChunk(this.pos.x+(xOffset*TILESIZE), this.pos.y+(yOffset*TILESIZE));

        let x = floor(this.pos.x / TILESIZE) - (chunkPos.x*CHUNKSIZE) + xOffset;
        let y = floor(this.pos.y / TILESIZE) - (chunkPos.y*CHUNKSIZE) + yOffset;
        if(Debuging){
            push();
            rotate(-this.rot);
            translate(camera.x-(width/2)-this.pos.x, camera.y-(height/2)-this.pos.y);
            fill(255);
            circle(((x+(chunkPos.x*CHUNKSIZE))*TILESIZE)-camera.x+(width/2),((y+(chunkPos.y*CHUNKSIZE))*TILESIZE)-camera.y+(height/2), 10);
            pop(); 
        }
        
        return {
            x: (x + 0.5) * TILESIZE,
            y: (y + 0.5) * TILESIZE,
            cx: chunkPos.x,
            cy: chunkPos.y,
            val: testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + (y / CHUNKSIZE)]
        };
        
    }
}

class Plant extends Placeable{
    constructor(objName,x,y,w,h,color,health,imgNum,growthRate,itemDrop){
        super(objName,x,y,w,h,0,0,color,health,imgNum,false);
        this.growthRate = growthRate;
        this.itemDrop = itemDrop;
        
        this.growthTimer = 0;
        this.stage = 0;
        this.type = "Plant";
    }

    update(){
        super.update();
        if(this.growthTimer > this.growthRate){
            if(this.stage < objImgs[this.imgNum].length-1){
                this.stage ++;
                this.growthTimer = 0;
            }
        }
        this.growthTimer += 1/frameRate(); //growth timer goes up by 1 every second
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        if(t == "green") tint(100, 200, 100, alpha);
        if(t == "red") tint(200, 100, 100, alpha);
        image(objImgs[this.imgNum][this.stage], -this.size.w/2,-this.size.h/2, this.size.w, this.size.h);
        pop();
    }
}

class Trap extends Placeable{
    constructor(objName,x,y,w,h,color,health,imgNum,id,ownerName,triggerRadius,damageRadius,digBool,damage){
        super(objName,x,y,w,h,0,1,color,health,imgNum,false);
        this.id = id;
        this.ownerName = ownerName;
        this.triggerRadius = triggerRadius; //in pixels
        this.damage = damage; //how much it hurts players and objs
        this.damageRadius = damageRadius; //in pixels
        this.digBool = digBool; //does it affect dirt?
        this.type = "Trap";
    }

    update(){
        super.update();
        //!make this handle multiple players
        if(curPlayer.color != this.color || this.color == 0){ //not on the same team as the trap, or the trap belongs to no team
            if(this.id != curPlayer.id && this.ownerName != curPlayer.name){ //aka if you didnt make this trap
                if(this.pos.dist(curPlayer.pos) < this.triggerRadius){
                    this.deleteTag = true;
                    curPlayer.statBlock.stats.hp -= this.damage;
                    socket.emit("update_pos", curPlayer);
                    let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
                    socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
                }
            }
        }
    }
}

class InvObj extends Placeable{
    constructor(objName,x,y,w,h,color,health,imgNum,id,ownerName,maxWeight,canRotate){
        super(objName,x,y,w,h,0,2,color,health,imgNum,canRotate);
        this.id = id;
        this.ownerName = ownerName;
        this.maxWeight = maxWeight;

        this.locked = false;
        this.inv = [];
        this.type = "InvObj";
    }

    update(){
        super.update();
        if(mouseIsPressed){
            if(createVector(mouseX + camera.x - width / 2, mouseY + camera.y - height / 2).dist(this.pos) < (this.size.w+this.size.h)/2){ //if mouse is over the obj
                if(mouseButton == LEFT){ //open inv
                    if(this.locked){ //when locked only owner can open
                        if(curPlayer.name == this.ownerName && curPlayer.id == this.id){
                            //openInv(this.inv);
                            console.log("open Inv");
                        }
                    }
                    else{ //when unlocked all team members can open
                        if(curPlayer.color == this.color){
                            //openInv(this.inv);
                            console.log("open Inv");
                        }
                    }
                }
                else if(mouseButton == RIGHT){ //right click to lock or unlock this chest
                    if(curPlayer.name == this.ownerName && curPlayer.id == this.id){
                        this.locked = !this.locked;
                    }
                }
            }
        }
    }
}

class CustomObj extends Placeable{
    constructor(objName,x,y,w,h,rot,z,color,health,imgNum,id,ownerName,update,canRotate){
        super(objName,x,y,w,h,rot,z,color,health,imgNum,canRotate);
        this.id = id;
        this.ownerName = ownerName;
        this.update = update;
        this.type = "Custom";
    }

    //define your own update
}

function createObject(name, x, y, rot, color, id, ownerName){
    if(objDic[name] == undefined){
        throw new Error(`Object with name: ${name}, does not exist`);
    }
    else{
        if(objDic[name].type == "Placeable"){
            return new Placeable(name, x, y, objDic[name].w, objDic[name].h, rot, objDic[name].z, color, objDic[name].hp, objDic[name].img, objDic[name].canRotate);
        }
        else if(objDic[name].type == "Plant"){
            return new Plant(name, x, y, objDic[name].w, objDic[name].h, color, objDic[name].hp, objDic[name].img, objDic[name].gr, objDic[name].itemDrop);
        }
        else if(objDic[name].type == "Trap"){
            return new Trap(name, x, y, objDic[name].w, objDic[name].h, color, objDic[name].hp, objDic[name].img, id, ownerName, objDic[name].tr, objDic[name].dr, objDic[name].db, objDic[name].damage);
        }
        else if(objDic[name].type == "InvObj"){
            return new InvObj(name, x, y, objDic[name].w, objDic[name].h, color, objDic[name].hp, objDic[name].img, id, ownerName, objDic[name].mw, objDic[name].canRotate);
        }
        else if(objDic[name].type == "Custom"){
            return new CustomObj(name, x, y, objDic[name].w, objDic[name].h, rot, objDic[name].z, color, objDic[name].hp, objDic[name].img, id, ownerName, objDic[name].update, objDic[name].canRotate);
        }
        else{
            throw new Error(`Object type: ${objDic[name].type}, does not exist.`);
        }
    }
}

//the most common parts of a define, so we don't have to keep editing all the defines
function defineObjSuper(type,name,imgPaths,cost,width,height,zLevel,health,canRotate,inBuildList){
    checkParams(arguments, getParamNames(defineObjSuper), ["string","string","object","object","int","int","int","int","boolean","boolean"]);

    for(let i = 0; i < imgPaths.length; i++){
        if(!imgPaths[i].includes("images")){
            imgPaths[i] = "images/structures/" + imgPaths[i];
        }
        if(!imgPaths[i].includes(".")){
            imgPaths[i] = imgPaths[i] + ".png";
        }
    }
    objImgPaths.push(imgPaths);
    let imgNum = objImgPaths.length - 1;
    
    objDic[name] = {
        type: type,
        name: name,
        img: imgNum,
        w: width,
        h: height,
        z: zLevel,
        hp: health,
        canRotate: canRotate,
        cost: cost
    };

    if(inBuildList){
        buildOptions.push({ type: name, key: 49+(buildOptions.length), image: imgPaths[0], cost: cost});
    }
}

/**
 * Creates a new lookup in objDic for an object of type Placeable
 * @returns {Placeable} not an actual Placeable but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgNames an array of names for any images this object will use
 * @param {Array} cost an array of things this obj needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} zLevel the place on the z axis this object should live and react to
 * - 0=floors 
 * - 1=rugs,traps
 * - 2=walls,doors,tables,chairs,chests
 * - 3=decorations
 * @param {int} health how much health this object should have
 * @param {boolean} canRotate self explanitory
 * @param {boolean} inBuildList adds this obj to the build list
*/
function definePlaceable(name,imgNames,cost,width,height,zLevel,health,canRotate,inBuildList){
    defineObjSuper("Placeable",name,imgNames,cost,width,height,zLevel,health,canRotate,inBuildList);
}

/**
 * Creates a new lookup in objDic for an object of type Trap
 * @returns {Trap} not an actual Trap but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgNames an array of names for any images this object will use
 * @param {Array} cost an array of things this obj needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} health how much health this object should have
 * @param {int} triggerRadius how many pixels away does a player have to stand for it to do something
 * @param {int} damageRadius how many pixels away does a player have to stand for it to hurt you
 * @param {boolean} digBool does this trap affect the dirt widthin the damage radius
 * @param {int} damage how much damage does this do to a player within the damageRadius
 * @param {boolean} inBuildList adds this obj to the build list
*/
function defineTrap(name,imgNames,cost,width,height,health,triggerRadius,damageRadius,digBool,damage,inBuildList){
    defineObjSuper("Trap",name,imgNames,cost,width,height,1,health,false,inBuildList);
    
    let paramNames = getParamNames(defineTrap);
    checkParams(
        [arguments[6], arguments[7], arguments[8], arguments[9]],
        [paramNames[6], paramNames[7], paramNames[8], paramNames[9]],
        ["int","int","boolean","int"]
    );
    
    objDic[name].tr = triggerRadius;
    objDic[name].dr = damageRadius;
    objDic[name].db = digBool;
    objDic[name].damage = damage;
}

/**
 * Creates a new lookup in objDic for an object of type InvObj
 * @returns {InvObj} not an actual InvObj but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgNames an array of names for any images this object will use
 * @param {Array} cost an array of things this obj needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} health how much health this object should have
 * @param {number} maxWeight how much this object can hold
 * @param {boolean} canRotate self explanitory
 * @param {boolean} inBuildList adds this obj to the build list
*/
function defineInvObj(name,imgNames,cost,width,height,health,maxWeight,canRotate,inBuildList){
    defineObjSuper("InvObj",name,imgNames,cost,width,height,2,health,canRotate,inBuildList);

    checkParams([arguments[6]], [getParamNames(defineInvObj)[6]], ["number"]);

    objDic[name].mw = maxWeight;
}

/**
 * Creates a new lookup in objDic for an object of type Plant
 * @returns {Plant} not an actual Plant but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgNames an array of names for any images this object will use
 * @param {Array} cost an array of things this obj needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} health how much health this object should have
 * @param {number} growthRate how many seconds before the plant moves to the next stage
 * @param {string} itemDrop the name of the item this plant should drop when fully grown
*/
function definePlant(name,imgNames,cost,width,height,health,growthRate,itemDrop){
    defineObjSuper("Plant",name,imgNames,cost,width,height,2,health,false,false);

    let paramNames = getParamNames(definePlant);
    checkParams([arguments[6], arguments[7]], [paramNames[6], paramNames[7]], ["number", "string"]);
    
    objDic[name].gr = growthRate;
    objDic[name].itemDrop = itemDrop;
}


/**
 * Creates a new lookup in objDic for an object of type CustomObj
 * @returns {CustomObj} not an actual CustomObj but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgNames an array of names for any images this object will use
 * @param {Array} cost an array of things this obj needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} zLevel the place on the z axis this object should live and react to
 * - 0=floors 
 * - 1=rugs,traps
 * - 2=walls,doors,tables,chairs,chests
 * - 3=decorations
 * @param {int} health how much health this object should have
 * @param {Function} update a function to call every tick
 * @param {boolean} canRotate self explanitory
 * @param {boolean} inBuildList adds this obj to the build list
*/
function defineCustomObj(name,imgNames,cost,width,height,zLevel,health,update,canRotate,inBuildList){
    defineObjSuper("Custom",name,imgNames,cost,width,height,zLevel,health,canRotate,inBuildList);

    checkParams([arguments[7]], [getParamNames(defineCustomObj)[7]], ["function"]);
    objDic[name].update = update;
}