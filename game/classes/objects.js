/*
Z heights:
    3=decorations (ex. mugs, plates, flowers, papers)
    2=walls,doors,tables,chairs,chests
    1=rugs,traps
    0=floors
*/

/*
Obj Dic is a full dictanary of every object that can exist, falling into one of these types:
    Placeable - A regular object with no update function
    Plant - A plant which will grow over time and drop an item when fully grown
    Trap - An object that when stepped on will hurt the player or environment
    InvObj - An object that when clicked will open the inventory menu
    Custom - An object with a custom update Function
*/

var objDic = {};
definePlacable("Wall", 0, 60, 60, 2, 100);
definePlacable("Door", 1, 60, 60, 2, 100);
definePlacable("Floor", 2, 60, 60, 0, 100);
definePlacable("Rug", 3, 60, 60, 1, 100);
definePlacable("Mug", 4, 60, 60, 3, 100);
defineTrap("BearTrap", 5, 60, 60, 100, 60, 60, false, 5);
defineTrap("LandMine", 6, 60, 60, 100, 60, 60, false, 5);

function turretUpdate(){
    console.log("turret is working");
}
defineCustomObj("Turret", 7, 60, 60, 2, 100, turretUpdate);
definePlant("Mushroom", 8, 60, 60, 100, 5.5, "edible_mushroom");

//defineInvObj("Chest", 9, 60, 60, 100, 10.5);

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
    constructor(x,y,w,h,rot,z,color,health,imgNum){
        this.pos = createVector(x,y);
        this.size = {w: w, h: h};
        this.rot = rot;
        this.z = z;
        this.color = color; //index to team colors
        this.hp = health;
        this.mhp = health;
        this.imgNum = imgNum;

        this.openBool = true; //is object in an open spot?, used for ghost rendering
        this.deleteTag = false;
    }

    update(){}

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        if(t == "green") tint(100, 200, 100, alpha);
        if(t == "red") tint(200, 100, 100, alpha);
        image(objImgs[this.imgNum], -this.size.w/2,-this.size.h/2);
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
                    //if (this.pos.dist(createVector(check.x+(check.cx*CHUNKSIZE*TILESIZE), check.y+(check.cy*CHUNKSIZE*TILESIZE))) < ((this.size.w+this.size.h)/2)-5 + (check.val * TILESIZE / 2)) {
                    //}
                }
            }
        }
        pop();

        if(this.openBool) this.render("green", 100); //green
        else this.render("red", 100); //red
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
    constructor(x,y,w,h,color,health,imgNum,growthRate,itemDrop){
        super(x,y,w,h,0,0,color,health,imgNum);
        this.growthRate = growthRate;
        this.itemDrop = itemDrop;
        
        this.growthTimer = 0;
        this.stage = 0;
    }

    update(){
        if(this.growthTimer > this.growthRate){
            if(this.stage < objImgs[this.imgNum].length-1){
                this.stage ++;
            }
        }
        this.growthTimer += 1/rfameRate(); //growth timer goes up by 1 every second
    }
}

class Trap extends Placeable{
    constructor(x,y,w,h,color,health,imgNum,id,ownerName,triggerRadius,damageRadius,digBool,damage){
        super(x,y,w,h,0,1,color,health,imgNum);
        this.id = id;
        this.ownerName = ownerName;
        this.triggerRadius = triggerRadius; //in pixels
        this.damage = damage; //how much it hurts players and objs
        this.damageRadius = damageRadius; //in pixels
        this.digBool = digBool; //does it affect dirt?
    }

    update(){
        //!make this handle multiple players
        if(curPlayer.color != this.color){ //not on the same team as the trap
            if(this.id != curPlayer.id && this.name != curPlayer.name){ //aka if you didnt make this trap
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
    constructor(x,y,w,h,color,health,imgNum,id,ownerName,maxWeight){
        super(x,y,w,h,0,2,color,health,imgNum);
        this.id = id;
        this.ownerName = ownerName;
        this.maxWeight = maxWeight;

        this.locked = false;
        this.inv = [];
    }

    update(){
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
    constructor(x,y,w,h,rot,z,color,health,imgNum,id,ownerName,update){
        super(x,y,w,h,rot,z,color,health,imgNum);
        this.id = id;
        this.ownerName = ownerName;
        this.update = update;
    }

    //define your own update
}


//These should probably be moved to a different file?
function checkParams(inputs, inputNames, checks){
    for(let i = 0; i < inputs.length; i++){
        if(checks[i] == "int"){
            if(parseInt(inputs[i]) !== inputs[i]){
                throw new TypeError(`${inputNames[i]} is not of type int, ${inputs[i]} was passed as ${inputNames[i]}`);
            }
        }
        else{
            if(typeof inputs[i] != checks[i]){
                throw new TypeError(`${inputNames[i]} is not of type ${checks[i]}, ${inputs[i]} was passed as ${inputNames[i]}`);
            }
        }
    }
}

function getParamNames(func){
    return func.toString().split("{")[0].split("(")[1].split(")")[0].split(",");
}

/**
 * Creates a new lookup in objDic for an object of type Placable
 * @returns {Placeable} not an actual Placable but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} zLevel the place on the z axis this object should live and react to
 * - 0=floors 
 * - 1=rugs,traps
 * - 2=walls,doors,tables,chairs,chests
 * - 3=decorations
 * @param {int} health how much health this object should have
*/
function definePlacable(name,imgNum,width,height,zLevel,health){
    checkParams(arguments, getParamNames(definePlacable), ["string","int","int","int","int","int"]);
    objDic[name] = {
        type: "Placable",
        name: name,
        img: imgNum,
        w: width,
        h: height,
        z: zLevel,
        hp: health
    };
}

/**
 * Creates a new lookup in objDic for an object of type Trap
 * @returns {Trap} not an actual Trap but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} health how much health this object should have
 * @param {int} triggerRadius how many pixels away does a player have to stand for it to do something
 * @param {int} damageRadius how many pixels away does a player have to stand for it to hurt you
 * @param {boolean} digBool does this trap affect the dirt widthin the damage radius
 * @param {int} damage how much damage does this do to a player within the damageRadius
*/
function defineTrap(name,imgNum,width,height,health,triggerRadius,damageRadius,digBool,damage){
    checkParams(arguments, getParamNames(defineTrap), ["string","int","int","int","int","int","int","boolean","int"]);
    objDic[name] = {
        type: "Trap",
        name: name,
        img: imgNum,
        w: width,
        h: height,
        z: 1,
        hp: health,
        tr: triggerRadius,
        dr: damageRadius,
        db: digBool,
        damage: damage
    }
}

/**
 * Creates a new lookup in objDic for an object of type InvObj
 * @returns {InvObj} not an actual InvObj but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} health how much health this object should have
 * @param {number} maxWeight how much this object can hold
*/
function defineInvObj(name,imgNum,width,height,health,maxWeight){
    checkParams(arguments, getParamNames(defineInvObj), ["string","int","int","int","int","number"]);
    objDic[name] = {
        type: "Inv",
        name: name,
        img: imgNum,
        w: width,
        h: height,
        z: 2,
        hp: health,
        mw: maxWeight
    };
}

/**
 * Creates a new lookup in objDic for an object of type Plant
 * @returns {Plant} not an actual Plant but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} health how much health this object should have
 * @param {number} growthRate how many seconds before the plant moves to the next stage
 * @param {string} itemDrop the name of the item this plant should drop when fully grown
*/
function definePlant(name,imgNum,width,height,health,growthRate,itemDrop){
    checkParams(arguments, getParamNames(definePlant), ["string","int","int","int","int","number", "string"]);
    objDic[name] = {
        type: "Plant",
        name: name,
        img: imgNum,
        w: width,
        h: height,
        z: 2,
        hp: health,
        gr: growthRate,
        itemDrop: itemDrop
    };
}


/**
 * Creates a new lookup in objDic for an object of type CustomObj
 * @returns {CustomObj} not an actual CustomObj but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {int} width the desired width of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} height the desired height of the obj, in pixels !Keep TILESIZE in mind!
 * @param {int} zLevel the place on the z axis this object should live and react to
 * - 0=floors 
 * - 1=rugs,traps
 * - 2=walls,doors,tables,chairs,chests
 * - 3=decorations
 * @param {int} health how much health this object should have
 * @param {Function} update a function to call every tick
*/
function defineCustomObj(name,imgNum,width,height,zLevel,health,update){
    checkParams(arguments, getParamNames(defineCustomObj), ["string","int","int","int","int","int","function"]);
    objDic[name] = {
        type: "Custom",
        name: name,
        img: imgNum,
        w: width,
        h: height,
        z: zLevel,
        hp: health,
        update: update
    };
}