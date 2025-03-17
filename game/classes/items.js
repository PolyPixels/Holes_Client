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

var itemDic = {};

defineShovel("Basic Shovel", 0, 1, 100, 0.12, 3, 1, "A basic shovel for digging dirt");
defineShovel("Better Shovel", 0, 1, 100, 0.18, 3, 1, "A better shovel for digging dirt");
defineShovel("God Shovel", 0, 1, 100, 0.3, 3, 1, "A godly shovel for digging dirt");
defineMelee("Basic Sword", 1, 1, 100, 10, 1, 90, 10, false, "A basic sword for slashing");
defineMelee("Better Sword", 1, 1, 100, 10, 1, 90, 10, false, "A better sword for slashing");
defineRanged("Basic SlingShot", 2, 1, 100, 5, 5, "None", "Rock", 10, 10, 60, false, "A basic slingshot for shooting");
defineRanged("Better SlingShot", 2, 1, 100, 5, 5, "None", "Rock", 10, 10, 60, false, "A better slingshot for shooting");
defineSimpleItem("Rock", 3, 1, "A rock for your slingshot");
defineSimpleItem("Gem", 3, 1, "A pretty gem");
defineSimpleItem("Plank", 3, 1, "A wooden plank");
defineSimpleItem("Gay Goo", 3, 1, "A gooey substance");
defineFood("Apple", 4, 1, 100, 10, "A juicy apple");
defineFood("Mushroom", 4, 1, 100, 10, "A tasty mushroom");
defineSeed("Mushroom Seed", 5, 1, 1, "Mushroom", 0.5, "Some mushroom spores");
defineSeed("Apple Seed", 5, 1, 1, "Mushroom", 0.5, "A seed for growing apples");

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
            if (dirtInv < 150 - this.digSpeed) playerDig(x, y, this.digSpeed);
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
            console.log("Swing");
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
        if(curPlayer.invBlock.useTimer <= 0){
            curPlayer.statBlock.stats.hp += this.heal;
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
            let temp = createObject(this.plantName, ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, ghostBuild.color, curPlayer.id, curPlayer.name);
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
            throw new Error(`Object type: ${objDic[name].type}, does not exist.`);
        }
    }
}

/**
 * Creates a new lookup in itemDic for an object of type SimpleItem
 * @returns {SimpleItem} not an actual SimpleItem but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {number} weight how much the item weighs
 * @param {string} desc the description of the item
*/
function defineSimpleItem(name,imgNum, weight, desc){
    checkParams(arguments, getParamNames(defineSimpleItem), ["string","int","number","string"]);
    itemDic[name] = {
        type: "SimpleItem",
        name: name,
        img: imgNum,
        weight: weight,
        durability: 1,
        desc: desc
    };
}

/**
 * Creates a new lookup in itemDic for an object of type Shovel
 * @returns {Shovel} not an actual Shovel but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {number} weight how much the item weighs
 * @param {int} durability how many uses the item has left
 * @param {number} digSpeed how fast you affect the dirt your digging 0.065 is the average
 * @param {number} digSize not sure how this will work, but bigger number here should mean more effected dirt nodes
 * @param {int} range how far from the character the shovel will be able to dig
 * @param {string} desc the description of the item
*/
function defineShovel(name, imgNum, weight, durability, digSpeed, digSize, range, desc){
    checkParams(arguments, getParamNames(defineShovel), ["string","int","number","int","number","number","int","string"]);
    itemDic[name] = {
        type: "Shovel",
        name: name,
        img: imgNum,
        weight: weight,
        durability: durability,
        digSpeed: digSpeed,
        digSize: digSize,
        range: range,
        desc: desc
    };
}

/**
 * Creates a new lookup in itemDic for an object of type Melee
 * @returns {Melee} not an actual Melee but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {number} weight how much the item weighs
 * @param {int} durability how many uses the item has left
 * @param {int} damage how much damage the weapon does
 * @param {int} range how far the weapon can hit
 * @param {int} angle how wide the weapon can hit
 * @param {int} swingSpeed how many frames between each swing
 * @param {boolean} magicBool if the weapon does magic damage
 * @param {string} desc the description of the item
*/
function defineMelee(name,imgNum, weight, durability, damage, range, angle, swingSpeed, magicBool, desc){
    checkParams(arguments, getParamNames(defineMelee), ["string","int","number","int","int","int","int", "int","boolean","string"]);
    itemDic[name] = {
        type: "Melee",
        name: name,
        img: imgNum,
        weight: weight,
        durability: durability,
        damage: damage,
        range: range,
        angle: angle,
        swingSpeed: swingSpeed,
        magicBool: magicBool,
        desc: desc
    };
}

/**
 * Creates a new lookup in itemDic for an object of type Ranged
 * @returns {Ranged} not an actual Ranged but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
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
function defineRanged(name,imgNum, weight, durability, damage, spread, projName, ammoName, fireRate, roundSize, reloadSpeed, magicBool, desc){
    checkParams(arguments, getParamNames(defineRanged), ["string","int","number","int","int","int","string","string","int","int","number","boolean","string"]);
    itemDic[name] = {
        type: "Ranged",
        name: name,
        img: imgNum,
        weight: weight,
        durability: durability,
        damage: damage,
        spread: spread,
        projName: projName,
        ammoName: ammoName,
        fireRate: fireRate,
        roundSize: roundSize,
        reloadSpeed: reloadSpeed,
        magicBool: magicBool,
        desc: desc
    };
}

/**
 * Creates a new lookup in itemDic for an object of type Food
 * @returns {Food} not an actual Food but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {number} weight how much the item weighs
 * @param {int} durability how many inv updates before this food spoils
 * @param {int} heal how much the food heals
 * @param {string} desc the description of the item
*/
function defineFood(name,imgNum, weight, durability, heal, desc){
    checkParams(arguments, getParamNames(defineFood), ["string","int","number","int","int","string"]);
    itemDic[name] = {
        type: "Food",
        name: name,
        img: imgNum,
        weight: weight,
        durability: durability,
        heal: heal,
        desc: desc
    };
}

/**
 * Creates a new lookup in itemDic for an object of type Potion
 * @returns {Potion} not an actual Potion but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {number} weight how much the item weighs
 * @param {string} statName the name of the stat this potion effects
 * @param {number} statBoost the percentage change in the stat
 * @param {int} time how long the effect lasts
 * @param {string} desc the description of the item
*/
function definePotion(name,imgNum, weight, statName, statBoost, time, desc){
    checkParams(arguments, getParamNames(definePotion), ["string","int","number","string","number","int","string"]);
    itemDic[name] = {
        type: "Potion",
        name: name,
        img: imgNum,
        weight: weight,
        statName: statName,
        statBoost: statBoost,
        time: time,
        desc: desc
    };
}

/**
 * Creates a new lookup in itemDic for an object of type Equipment
 * @returns {Equipment} not an actual Equipment but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {number} weight how much the item weighs
 * @param {int} durability how many uses the item has left
 * @param {string} slot the slot this equipment goes in
 * @param {int} defense how much defense the equipment gives
 * @param {string} statName the name of the stat this equipment effects
 * @param {number} statBoost the percentage change in the stat
 * @param {string} desc the description of the item
*/
function defineEquipment(name,imgNum, weight, durability, slot, defense, statName, statBoost, desc){
    checkParams(arguments, getParamNames(defineEquipment), ["string","int","number","int","int","string","number","string"]);
    itemDic[name] = {
        type: "Equipment",
        name: name,
        img: imgNum,
        weight: weight,
        durability: durability,
        slot: slot,
        defense: defense,
        statName: statName,
        statBoost: statBoost,
        desc: desc
    };
}

/**
 * Creates a new lookup in itemDic for an object of type Seed
 * @returns {Seed} not an actual Seed but all info needed for one
 * @param {string} name the name of the object
 * @param {int} imgNum the index of the png or pngs, in the objImgs array
 * @param {number} weight how much the item weighs
 * @param {int} durability how many uses the item has left
 * @param {string} plantName the name of the plant this seed will grow
 * @param {number} chance the chance the plant will grow
 * @param {string} desc the description of the item
*/
function defineSeed(name,imgNum, weight, durability, plantName, chance, desc){
    checkParams(arguments, getParamNames(defineSeed), ["string","int","number","int","string","number","string"]);
    itemDic[name] = {
        type: "Seed",
        name: name,
        img: imgNum,
        weight: weight,
        durability: durability,
        plantName: plantName,
        chance: chance,
        desc: desc
    };
}