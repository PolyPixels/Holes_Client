/*
Item Dic is a full dictanary of every item that can exist, falling into one of these types:
    Simple - just an item
    Shovel - digs dirt
    Melee - does some slash
    Ranged - shoots some projectile
    Food - eat, and only heals
    Potion - eat, and does special things
    Equipment - wearables like armor and clothes
    Seed - makes a plant obj
*/

var itemImgPaths = [];
var itemDic = {};

defineShovel("Basic Shovel", ["shovel1"], [["Plank",1],["Rock",1]], 1, 100, 0.12, 3, 1, "A basic shovel for digging dirt",true);
defineShovel("Better Shovel", ["shovel1"], [], 1, 100, 0.18, 3, 1, "A better shovel for digging dirt",true);
defineShovel("God Shovel", ["shovel1"], [], 1, 100, 0.3, 3, 1, "A godly shovel for digging dirt",true);
defineMelee("Basic Sword", ["tempSword"], [], 1, 100, 10, 5, 50, 90, 20, false, "A basic sword for slashing",true);
defineMelee("Better Sword", ["tempSword"], [], 1, 100, 10, 5, 1, 90, 10, false, "A better sword for slashing",true);
defineRanged("Basic SlingShot", ["sling"], [], 1, 100, 5, 5, "None", "Rock", 10, 10, 60, false, "A basic slingshot for shooting",true);
defineRanged("Better SlingShot", ["sling"], [], 1, 100, 5, 5, "None", "Rock", 10, 10, 60, false, "A better slingshot for shooting",true);
defineSimpleItem("Rock", ["temprock"], [], 1, "A rock for your slingshot",false);
defineSimpleItem("Gem", ["temprock"], [], 1, "A pretty gem",false);
defineSimpleItem("Plank", ["temprock"], [], 1, "A wooden plank",false);
defineSimpleItem("Gay Goo", ["temprock"], [], 1, "A gooey substance",false);
defineFood("Apple", ["apple"], [], 1, 100, 10, "A juicy apple",false);
defineFood("Mushroom", ["images/structures/tempmushroom3"], [], 1, 100, 10, "A tasty mushroom",false);
defineSeed("Mushroom Seed", ["tempmushroomseed"], [["Mushroom", 1]], 1, "Mushroom", 0.5, "Some mushroom spores",true);
defineSeed("Apple Seed", ["tempmushroomseed"], [["Apple", 1]], 1, "Mushroom", 0.5, "A seed for growing apples",true);

class SimpleItem{
    constructor(itemName, weight, durability, imgNum, desc){
        this.itemName = itemName;
        this.weight = weight;
        this.durability = durability; //can be used for other stuff such as spoiling
        this.maxDurability = durability;
        this.imgNum = imgNum;
        this.desc = desc;

        this.amount = 1;
        this.type = "Simple";
    }

    use(x,y,mouseButton){}

    renderInvWindow(x,y){
        push();
        translate(x,y);
        image(itemImgs[this.imgNum], 0,0);
        text(this.amount + " " + this.itemName + "   " + this.amount*this.weight, 64, 0);
        pop();
    }

    renderName(x,y){
        text(this.itemName + " x" + this.amount, x,y);
    }

    renderImage(x,y){
        image(itemImgs[this.imgNum][0], x,y, 60, 60);
    }

    decreaseAmount(amount){
        this.amount -= amount;
        if(this.amount <= 0){
            for(let i=0; i<curPlayer.invBlock.hotbar.length; i++){ //remove item from hotbar
                if(curPlayer.invBlock.hotbar[i] == this.itemName){
                    curPlayer.invBlock.hotbar[i] = "";
                }
            }
            if(!buildMode){
                renderGhost = false;
            }
            delete curPlayer.invBlock.items[this.itemName]; //remove item from inventory
        }
    }

    getStats(){
        return [
            ["Durability", this.durability], 
            ["Weight", this.weight]
        ];
    }
}

class Shovel extends SimpleItem{
    constructor(itemName, weight, durability, imgNum, desc, digSpeed, digSize, range){
        super(itemName, weight, durability, imgNum, desc);
        this.digSpeed = digSpeed;
        this.digSize = digSize;
        this.range = range;

        this.type = "Shovel";
    }

    use(x,y,mouseButton){
        //doesnt wait for useTimer, because it is a continuous action
        if(mouseButton == LEFT){ //dig dirt
            if (dirtInv < maxDirtInv - this.digSpeed) playerDig(x, y, this.digSpeed);
            else dirtBagUI.shake = {intensity: dirtBagUI.shake.intensity + 0.01, length: 1};
        }
        else if(mouseButton == RIGHT){ //place dirt
            if (dirtInv > this.digSpeed) playerDig(x, y, -this.digSpeed);
        }
    }

    getStats(){
        return [
            ["Durability", this.durability], 
            ["Weight", this.weight], 
            ["Dig Speed", this.digSpeed], 
            ["Dig Size", this.digSize], 
            ["Range", this.range]
        ];
    }
}

class Melee extends SimpleItem{
    constructor(itemName, weight, durability, imgNum, desc, damage, range, angle, swingSpeed, magicBool){
        super(itemName, weight, durability, imgNum, desc);
        this.damage = damage;
        this.range = range;
        this.angle = angle;
        this.swingSpeed = swingSpeed; //how many frames in between each swing
        this.magicBool = magicBool; //magic damage or nah

        this.type = "Melee";
    }

    use(x,y,mouseButton){
        if(curPlayer.invBlock.useTimer <= 0){
            let chunkPos = testMap.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
            let toMouse = createVector(x,y).sub(curPlayer.pos).setMag(50);
            let proj = createProjectile(this.itemName+" Slash", curPlayer.name, curPlayer.color, curPlayer.pos.x, curPlayer.pos.y, toMouse.heading());
            testMap.chunks[chunkPos.x+','+chunkPos.y].projectiles.push(
                proj
            );
            //tell the server you made a projectile
            socket.emit("new_proj", proj);

            curPlayer.invBlock.useTimer = this.swingSpeed;
        }
    }

    getStats(){
        return [
            ["Durability", this.durability], 
            ["Weight", this.weight], 
            ["Damage", this.damage], 
            ["Range", this.range], 
            ["Angle", this.angle], 
            ["Swing Speed", (1/this.swingSpeed).toFixed(3)]
        ];
    }
}

class Ranged extends SimpleItem{
    constructor(itemName, weight, durability, imgNum, desc, damage, spread, projName, ammoName, fireRate, roundSize, reloadSpeed, magicBool){
        super(itemName, weight, durability, imgNum, desc);
        this.damage = damage;
        this.spread = spread;
        this.projName = projName; //projectile name
        this.ammoName = ammoName; //item used for ammo
        this.fireRate = fireRate; //frames in between each bullet
        this.roundSize = roundSize; //how many bullets can be shot before reload
        this.reloadSpeed = reloadSpeed; //how many frames it takes to reload
        this.magicBool = magicBool; //magic damage or nah

        this.bulletsLeft = roundSize; //how many bullets left in a round
        this.type = "Ranged";
    }

    use(x,y,mouseButton){
        if(mouseButton == LEFT){
            if(curPlayer.invBlock.useTimer <= 0){
                if(this.bulletsLeft > 0){
                    if(curPlayer.invBlock.items[this.ammoName] != undefined){ //if you have item used for ammo
                        console.log("Shoot");
                        let chunkPos = testMap.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
                        let toMouse = createVector(x,y).sub(curPlayer.pos).setMag(50);
                        let proj = createProjectile(
                            this.ammoName, curPlayer.name, curPlayer.color,
                            curPlayer.pos.x + toMouse.x - 20,
                            curPlayer.pos.y + toMouse.y,
                            toMouse.heading()
                        )
                        testMap.chunks[chunkPos.x+','+chunkPos.y].projectiles.push(
                            proj
                        );
                        //tell the server you made a projectile
                        socket.emit("new_proj", proj);
                        this.bulletsLeft --;
                        curPlayer.invBlock.items[this.ammoName].decreaseAmount(1);
                        curPlayer.invBlock.useTimer = this.fireRate;
                    }
                }
                else{
                    console.log("Reload");
                    
                    //TODO: check for the ammo item first and reduce amount of it in inv
                    curPlayer.invBlock.useTimer = this.reloadSpeed;
                    this.bulletsLeft = this.roundSize;
                }
            }
        }
        else if(mouseButton == RIGHT){
            console.log("Force Reload");

            //TODO: check for the ammo item first and reduce amount of it in inv
            curPlayer.invBlock.useTimer = this.reloadSpeed;
            this.bulletsLeft = this.roundSize;
        }
    }

    getStats(){
        return [
            ["Durability", this.durability], 
            ["Weight", this.weight], 
            ["Damage", this.damage], 
            ["Spread", this.spread],
            ["Ammo Name", this.ammoName],
            ["Firerate", (1/this.fireRate).toFixed(3)],
            ["Round Size", this.roundSize],
            ["Reload Speed", (1/this.reloadSpeed).toFixed(3)]
        ];
    }
}

class Food extends SimpleItem{
    constructor(itemName, weight, durability, imgNum, desc, heal){
        super(itemName, weight, durability, imgNum, desc);
        this.heal = heal; //how much the food heals you
        this.eatWait = 60; //maybe make this variable? so BIGGER food items make you wait longer imbetween bites

        this.type = "Food";
    }

    use(x,y,mouseButton){
        console.log("!!!!!!!",curPlayer.statBlock.stats.hp ,curPlayer.statBlock.stats.mhp )

        if(curPlayer.statBlock.stats.hp >=  curPlayer.statBlock.stats.mhp) {
            return
        } else if(curPlayer.invBlock.useTimer <= 0){
            curPlayer.statBlock.heal(this.heal);
            curPlayer.invBlock.useTimer = this.eatWait;
            this.decreaseAmount(1);
        }
    }

    getStats(){
        return [
            ["Durability", this.durability], 
            ["Weight", this.weight], 
            ["Heal", this.heal]
        ];
    }
}

class Potion extends SimpleItem{
    constructor(itemName, weight, imgNum, statName, statBoost, time){
        super(itemName, weight, 100, imgNum);
        this.statName = statName; //which stat this equipment effects
        this.statBoost = statBoost; //percentage ex. (0.1 = +10%) (-0.5 = -50%)
        this.time = time; //how many seconds this effect lasts

        this.type = "Potion";
    }

    use(x,y,mouseButton){
        if(curPlayer.invBlock.useTimer <= 0){
            console.log("Drink");
            curPlayer.invBlock.useTimer = 60;
            this.decreaseAmount(1);
        }
    }

    getStats(){
        return [
            ["Durability", this.durability], 
            ["Weight", this.weight]
        ];
    }
}

class Equipment extends SimpleItem{
    constructor(itemName, weight, durability, imgNum, desc, slot, defense, statName, statBoost){
        super(itemName, weight, durability, imgNum, desc);
        this.slot = slot; //what slot the armor should go in
        this.defense = defense; //how much defense it grants the wearer
        this.statName = statName; //which stat this equipment effects
        this.statBoost = statBoost; //percentage ex. (0.1 = +10%) (-0.5 = -50%)

        this.type = "Equipment";
    }

    use(x,y,mouseButton){
        if(curPlayer.invBlock.useTimer <= 0){
            //if the player has an item in the slot already, swap them
            if(curPlayer.invBlock.equiped[this.slot] != ""){
                curPlayer.invBlock.hotbarItem(curPlayer.invBlock.equiped[this.slot], curPlayer.invBlock.selectedHotBar);
            }
            else{
                curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar] = ""; //remove the item from the hotbar
            }
    
            curPlayer.invBlock.equipItem(this.itemName);

            curPlayer.invBlock.useTimer = 60;
        }
    }
}

class Seed extends SimpleItem{
    constructor(itemName, weight, durability, imgNum, desc, plantName, chance){
        super(itemName, weight, durability, imgNum, desc);
        this.plantName = plantName;
        this.chance = chance;

        this.type = "Seed";
    }

    use(x,y,mouseButton){
        //doesnt wait for useTimer, because it needs space to be placed
        if(ghostBuild.openBool){
            let chunkPos = testMap.globalToChunk(x,y);
            let temp = createObject(this.plantName, ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, curPlayer.color, curPlayer.id, curPlayer.name);
            testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.push(temp);
            testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.sort((a,b) => a.z - b.z);
            socket.emit("new_object", {
                cx: chunkPos.x, 
                cy: chunkPos.y, 
                obj: temp
            });

            curPlayer.animationCreate("put");
            socket.emit("update_pos", curPlayer);

            this.decreaseAmount(1);
        }
    }
}

class CustomItem extends SimpleItem{
    constructor(itemName, weight, durability, imgNum, desc, useFunc){
        super(itemName, weight, durability, imgNum, desc);
        this.use = useFunc;

        this.type = "CustomItem";
    }
}

function createItem(name){
    if(itemDic[name] == undefined){
        throw new Error(`Object with name: ${name}, does not exist`);
    }
    else{
        if(itemDic[name].type == "SimpleItem"){
            return new SimpleItem(name, itemDic[name].weight, itemDic[name].durability, itemDic[name].img, itemDic[name].desc);
        }
        else if(itemDic[name].type == "Shovel"){
            return new Shovel(name, itemDic[name].weight, itemDic[name].durability, itemDic[name].img, itemDic[name].desc, itemDic[name].digSpeed, itemDic[name].digSize, itemDic[name].range);
        }
        else if(itemDic[name].type == "Melee"){
            return new Melee(name, itemDic[name].weight, itemDic[name].durability, itemDic[name].img, itemDic[name].desc, itemDic[name].damage, itemDic[name].range, itemDic[name].angle, itemDic[name].swingSpeed, itemDic[name].magicBool);
        }
        else if(itemDic[name].type == "Ranged"){
            return new Ranged(name, itemDic[name].weight, itemDic[name].durability, itemDic[name].img, itemDic[name].desc, itemDic[name].damage, itemDic[name].spread, itemDic[name].projName, itemDic[name].ammoName, itemDic[name].fireRate, itemDic[name].roundSize, itemDic[name].reloadSpeed, itemDic[name].magicBool);
        }
        else if(itemDic[name].type == "Food"){
            return new Food(name, itemDic[name].weight, itemDic[name].durability, itemDic[name].img, itemDic[name].desc, itemDic[name].heal);
        }
        else if(itemDic[name].type == "Potion"){
            return new Potion(name, itemDic[name].weight, itemDic[name].img, itemDic[name].desc, itemDic[name].statName, itemDic[name].statBoost, itemDic[name].time);
        }
        else if(itemDic[name].type == "Equipment"){
            return new Equipment(name, itemDic[name].weight, itemDic[name].durability, itemDic[name].img, itemDic[name].desc, itemDic[name].slot, itemDic[name].defense, itemDic[name].statName, itemDic[name].statBoost);
        }
        else if(itemDic[name].type == "Seed"){
            return new Seed(name, itemDic[name].weight, itemDic[name].durability, itemDic[name].img, itemDic[name].desc, itemDic[name].plantName, itemDic[name].chance);
        }
        else if(itemDic[name].type == "CustomItem"){
            return new CustomItem(name, itemDic[name].weight, itemDic[name].durability, itemDic[name].img, itemDic[name].desc, itemDic[name].use);
        }
        else{
            console.log(itemDic[name]);
            throw new Error(`Item type: ${itemDic[name].type}, does not exist.`);
        }
    }
}

//the most common parts of a define, so we don't have to keep editing all the defines
function defineItemSuper(type,name,imgPaths,cost,weight,durability,desc,inCraftList){
    checkParams(arguments, getParamNames(defineItemSuper), ["string","string","object","object","number","int","string","boolean"]);

    for(let i = 0; i < imgPaths.length; i++){
        if(!imgPaths[i].includes("images")){
            imgPaths[i] = "images/items/" + imgPaths[i];
        }
        if(!imgPaths[i].includes(".")){
            imgPaths[i] = imgPaths[i] + ".png";
        }
    }
    itemImgPaths.push(imgPaths);
    let imgNum = itemImgPaths.length - 1;
    
    itemDic[name] = {
        type: type,
        name: name,
        img: imgNum,
        weight: weight,
        durability: durability,
        desc: desc,
        cost: cost
    };

    if(inCraftList){
        //craftOptions.push({type: name, image: imgPaths[0], cost: cost});
    }
}

/**
 * Creates a new lookup in itemDic for an object of type SimpleItem
 * @returns {SimpleItem} not an actual SimpleItem but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgPaths an array of paths for any images this item will use
 * @param {Array} cost an array of things this item needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {number} weight how much the item weighs
 * @param {string} desc the description of the item
 * @param {boolean} inCraftList is this item craftable?
*/
function defineSimpleItem(name, imgPaths, cost, weight, desc, inCraftList){
    defineItemSuper("SimpleItem", name,imgPaths,cost,weight,1,desc,inCraftList);
}

/**
 * Creates a new lookup in itemDic for an object of type Shovel
 * @returns {Shovel} not an actual Shovel but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgPaths an array of paths for any images this item will use
 * @param {Array} cost an array of things this item needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {number} weight how much the item weighs
 * @param {int} durability how many uses the item has left
 * @param {number} digSpeed how fast you affect the dirt your digging 0.065 is the average
 * @param {number} digSize not sure how this will work, but bigger number here should mean more effected dirt nodes
 * @param {int} range how far from the character the shovel will be able to dig
 * @param {string} desc the description of the item
*/
function defineShovel(name, imgPaths, cost, weight, durability, digSpeed, digSize, range, desc, inCraftList){
    defineItemSuper("Shovel", name,imgPaths,cost,weight,durability,desc,inCraftList);

    let paramNames = getParamNames(defineShovel);
    checkParams(
        [arguments[5], arguments[6], arguments[7]],
        [paramNames[5], paramNames[6], paramNames[7]],
        ["number","number","int"]
    );

    itemDic[name].digSpeed = digSpeed;
    itemDic[name].digSize = digSize;
    itemDic[name].range = range;
    
}

/**
 * Creates a new lookup in itemDic for an object of type Melee
 * @returns {Melee} not an actual Melee but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgPaths an array of paths for any images this item will use
 * @param {Array} cost an array of things this item needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {number} weight how much the item weighs
 * @param {int} durability how many uses the item has left
 * @param {int} damage how much damage the weapon does
 * @param {int} range how far the weapon can hit
 * @param {int} angle how wide the weapon can hit
 * @param {int} swingSpeed how many frames between each swing
 * @param {boolean} magicBool if the weapon does magic damage
 * @param {string} desc the description of the item
*/
function defineMelee(name,imgPaths, cost, weight, durability, damage, knockback, range, angle, swingSpeed, magicBool, desc, inCraftList){
    defineItemSuper("Melee", name, imgPaths, cost, weight, durability, desc, inCraftList);

    let paramNames = getParamNames(defineMelee);
    checkParams(
        [arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10]],
        [paramNames[5], paramNames[6], paramNames[7], paramNames[8], paramNames[9], paramNames[10]],
        ["int","int","int","int","int","boolean"]
    );
    
    itemDic[name].damage = damage;
    itemDic[name].range = range;
    itemDic[name].angle = angle;
    itemDic[name].swingSpeed = swingSpeed;
    itemDic[name].magicBool = magicBool;

    defineMeleeProjectile(name+" Slash", 0, range, 60, angle, damage, knockback, 0.5);
}

/**
 * Creates a new lookup in itemDic for an object of type Ranged
 * @returns {Ranged} not an actual Ranged but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgPaths an array of paths for any images this item will use
 * @param {Array} cost an array of things this item needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {number} weight how much the item weighs
 * @param {int} durability how many uses the item has left
 * @param {int} damage how much damage the weapon does
 * @param {int} spread how much the bullets spread
 * @param {string} projName the name of the projectile this will spawn
 * @param {string} ammoName the name of the item used for ammo
 * @param {int} fireRate how many frames between each bullet
 * @param {int} roundSize how many bullets before having to reload
 * @param {number} reloadSpeed how many seconds it takes to reload
 * @param {boolean} magicBool if the weapon does magic damage
 * @param {string} desc the description of the item
*/
function defineRanged(name, imgPaths, cost, weight, durability, damage, spread, projName, ammoName, fireRate, roundSize, reloadSpeed, magicBool, desc, inCraftList){
    defineItemSuper("Ranged", name, imgPaths, cost, weight, durability, desc, inCraftList);
    
    let paramNames = getParamNames(defineRanged);
    checkParams(
        [arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12]],
        [paramNames[5], paramNames[6], paramNames[7], paramNames[8], paramNames[9], paramNames[10], paramNames[11], paramNames[12]],
        ["int","int","string","string","int","int","number","boolean"]
    );
    
    itemDic[name].damage = damage;
    itemDic[name].spread = spread;
    itemDic[name].projName = projName;
    itemDic[name].ammoName = ammoName;
    itemDic[name].fireRate = fireRate;
    itemDic[name].roundSize = roundSize;
    itemDic[name].reloadSpeed = reloadSpeed;
    itemDic[name].magicBool = magicBool;
}

/**
 * Creates a new lookup in itemDic for an object of type Food
 * @returns {Food} not an actual Food but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgPaths an array of paths for any images this item will use
 * @param {Array} cost an array of things this item needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {number} weight how much the item weighs
 * @param {int} durability how many inv updates before this food spoils
 * @param {int} heal how much the food heals
 * @param {string} desc the description of the item
*/
function defineFood(name, imgPaths, cost, weight, durability, heal, desc, inCraftList){
    defineItemSuper("Food", name, imgPaths, cost, weight, durability, desc, inCraftList);

    checkParams([arguments[5]],[getParamNames(defineFood)[5]],["int"]);
    
    itemDic[name].heal = heal;
}

/**
 * Creates a new lookup in itemDic for an object of type Potion
 * @returns {Potion} not an actual Potion but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgPaths an array of paths for any images this item will use
 * @param {Array} cost an array of things this item needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {number} weight how much the item weighs
 * @param {string} statName the name of the stat this potion effects
 * @param {number} statBoost the percentage change in the stat
 * @param {int} time how long the effect lasts
 * @param {string} desc the description of the item
*/
function definePotion(name, imgPaths, cost, weight, statName, statBoost, time, desc, inCraftList){
    defineItemSuper("Potion", name, imgPaths, cost, weight, 1, desc, inCraftList);
    let paramNames = getParamNames(definePotion);
    checkParams(
        [arguments[4], arguments[5], arguments[6]],
        [paramNames[4], paramNames[5], paramNames[6]],
        ["string","number","int"]
    );
    
    itemDic[name].statName = statName;
    itemDic[name].statBoost = statBoost;
    itemDic[name].time = time;
}

/**
 * Creates a new lookup in itemDic for an object of type Equipment
 * @returns {Equipment} not an actual Equipment but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgPaths an array of paths for any images this item will use
 * @param {Array} cost an array of things this item needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {number} weight how much the item weighs
 * @param {int} durability how many uses the item has left
 * @param {string} slot the slot this equipment goes in
 * @param {int} defense how much defense the equipment gives
 * @param {string} statName the name of the stat this equipment effects
 * @param {number} statBoost the percentage change in the stat
 * @param {string} desc the description of the item
*/
function defineEquipment(name, imgPaths, cost, weight, durability, slot, defense, statName, statBoost, desc, inCraftList){
    defineItemSuper("Equipment", name, imgPaths, cost, weight, durability, desc, inCraftList);
    let paramNames = getParamNames(defineEquipment);
    checkParams(
        [arguments[5], arguments[6], arguments[7], arguments[8]],
        [paramNames[5], paramNames[6], paramNames[7], paramNames[8]],
        ["string","int","string","number"]
    );
    
    itemDic[name].slot = slot;
    itemDic[name].defense = defense;
    itemDic[name].statName = statName;
    itemDic[name].statBoost = statBoost;
}

/**
 * Creates a new lookup in itemDic for an object of type Seed
 * @returns {Seed} not an actual Seed but all info needed for one
 * @param {string} name the name of the object
 * @param {Array} imgPaths an array of paths for any images this item will use
 * @param {Array} cost an array of things this item needs to be placed, can take in the names of items, or dirt, followed by how much ex. [["rock", 5],["dirt", 20]]
 * @param {number} weight how much the item weighs
 * @param {string} plantName the name of the plant this seed will grow
 * @param {number} chance the chance the plant will grow
 * @param {string} desc the description of the item
*/
function defineSeed(name, imgPaths, cost, weight, plantName, chance, desc, inCraftList){
    defineItemSuper("Seed", name, imgPaths, cost, weight, 1, desc, inCraftList);
    
    let paramNames = getParamNames(defineSeed);
    checkParams(
        [arguments[4], arguments[5]],
        [paramNames[4], paramNames[5]],
        ["string","number"]
    );
    
    itemDic[name].plantName = plantName;
    itemDic[name].chance = chance;
}