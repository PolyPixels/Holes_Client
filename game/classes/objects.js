/*
Z heights:
    3=decorations (ex. mugs, plates, flowers, papers)
    2=walls,doors,tables,chairs,chests
    1=rugs,traps
    0=floors,plants
*/

var buildOptions = []; //for ui, but defined here cause obj defines need it
var objImgPaths = [];
var objImgCords = [];

/*
Obj Dic is a full dictanary of every object that can exist, falling into one of these types:
    Placeable - A regular object with no update function
    Plant - A plant which will grow over time and drop an item when fully grown
    Trap - An object that when stepped on will hurt the player or environment
    InvObj - An object that when clicked will open the inventory menu
    Custom - An object with a custom update Function
*/

var objDic = {};

definePlaceable("Campfire", ['campfire.gif'], [["Log", 2]], 16*4, 16*4, 1, 100, false, true);
definePlaceable("Portal", ['portal.gif'], [["Philosopher's Stone", 1],["Tech",2],["Metal",3]], 128+64, 128+64, 3, 100, false, true);

definePlaceable("Wall", [[352,32,32,32],[0,32,32,32],[32,32,32,32],[64,32,32,32],[96,32,32,32],[128,32,32,32],[160,32,32,32],[192,32,32,32],[224,32,32,32],[256,32,32,32],[288,32,32,32],[320,32,32,32]], [["dirt", 50]], 128, 128, 2, 200, true, true);
definePlaceable("Thin Wall", [[368,64,16,32],[16,64,16,32],[48,64,16,32],[80,64,16,32],[112,64,16,32],[144,64,16,32],[176,64,16,32],[208,64,16,32],[240,64,16,32],[272,64,16,32],[304,64,16,32],[336,64,16,32]], [["dirt", 40]], 64, 128, 2, 150, true, true);
definePlaceable("Door", [[352,64,16,32],[0,64,16,32],[32,64,16,32],[64,64,16,32],[96,64,16,32],[128,64,16,32],[160,64,16,32],[192,64,16,32],[224,64,16,32],[256,64,16,32],[288,64,16,32],[320,64,16,32]], [["dirt", 40], ["Log", 1]], 64, 128, 2, 150, true, true);
definePlaceable("Floor", [[352,0,32,32],[0,0,32,32],[32,0,32,32],[64,0,32,32],[96,0,32,32],[128,0,32,32],[160,0,32,32],[192,0,32,32],[224,0,32,32],[256,0,32,32],[288,0,32,32],[320,0,32,32]], [["dirt", 30]], 128, 128, 0, 100, true, true);
definePlaceable("Rug", [[352,128,32,32],[0,128,32,32],[32,128,32,32],[64,128,32,32],[96,128,32,32],[128,128,32,32],[160,128,32,32],[192,128,32,32],[224,128,32,32],[256,128,32,32],[288,128,32,32],[320,128,32,32]], [["Mushroom Fiber", 6]], 128, 128, 1, 100, true, true);
definePlaceable("Mug", [[385,112,8,8]], [["Rock", 1]], 32, 32, 3, 100, false, true);
defineTrap("BearTrap", [[384,64,17,12]], [["Rock", 5]], 68, 48, 100, 50, 50, false, 15, true);
defineTrap("LandMine", [[431,68,13,9]], [["Rock", 2], ["Bomb", 1]], 52, 36, 100, 40, 40, false, 10, true);

function turretUpdate(){
    if(this.hp <= 0){
        this.deleteTag = true;
        let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
        socket.emit("delete_obj", {
            cx: chunkPos.x, cy: chunkPos.y, 
            objName: this.objName, 
            pos: {x: this.pos.x, y: this.pos.y}, 
            z: this.z, 
            cost: objDic[this.objName].cost
        });
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
                if(testMap.chunks[chunkPos.x+','+chunkPos.y] != undefined){
                    testMap.chunks[chunkPos.x+','+chunkPos.y].projectiles.push(
                        proj
                    );
                    //tell the server you made a projectile
                    socket.emit("new_proj", proj);
                }
            }
        }
        socket.emit("update_obj", {cx: chunkPos.x, cy: chunkPos.y, objName: this.objName, pos: {x: this.pos.x, y: this.pos.y}, z: this.z, update_name: "rot", update_value: this.rot});
    }
}
defineCustomObj("Turret", [[352,96,32,32],[0,96,32,32],[32,96,32,32],[64,96,32,32],[96,96,32,32],[128,96,32,32],[160,96,32,32],[192,96,32,32],[224,96,32,32],[256,96,32,32],[288,96,32,32],[320,96,32,32]], [["Metal", 3], ["Tech", 1], ["Rock", 5]], 60, 60, 2, 100, turretUpdate, true, true);
definePlant("Mushroom", [[392,49,16,16],[424,49,16,16],[460,48,16,16]], [["Mushroom", 1]], 60, 60, 50, 120, "edible_mushroom");

definePlant("AppleTree", [[384,0,34,34],[418,0,34,34],[486,0,34,34]], [["Apple", 1], ["Log", 2], ["Bad Apple", 1]], 120, 120, 80, 300, "Apple");
definePlant("Tree", [[384,0,34,34],[418,0,34,34],[452,0,34,34]], [["Log", 4]], 120, 120, 80, 240, "Tree");

defineInvObj("Chest", [[384,96,14,15]], [['Log', 5]], 14*4, 15*4, 100, 100, false, true);
defineInvObj("ItemBag", [[414,96,15,15]], [], 12*3, 13*3, 100, 100, false, false);

function bombUpdate(){
    //Fuse go down
    this.hp-=1;

    if(this.color != 0 && this.color != 1){
        this.color = 0;
    }

    if(this.bombTimer == undefined){
        this.bombTimer = this.hp/10;
    }
    else{
        this.bombTimer -= 1;
        if(this.bombTimer <= 0){
            if(this.color == 0){
                this.color = 1;
            }
            else if(this.color == 1){
                this.color = 0;
            }
            this.bombTimer = this.hp/10;
        }
    }

    if(this.hp == 3){
        let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
        //play hit noise and tell server
        let temp = new SoundObj("snd_bizarreexplode.ogg", curPlayer.pos.x, curPlayer.pos.y);
        testMap.chunks[chunkPos.x+","+chunkPos.y].soundObjs.push(temp);
        socket.emit("new_sound", {sound: "snd_bizarreexplode.ogg", cPos: chunkPos, pos:{x: curPlayer.pos.x, y: curPlayer.pos.y}, id: temp.id});
    }
    if(this.hp <= 3){
        for(let i=0; i<100; i++){
            push();
            translate(
                -camera.pos.x + (width / 2) + this.pos.x + random((33+(6*(this.size.w+this.size.h)/4))/-2, (33+(6*(this.size.w+this.size.h)/4))/2), 
                -camera.pos.y + (height / 2) + this.pos.y + random((33+(6*(this.size.w+this.size.h)/4))/-2, (33+(6*(this.size.w+this.size.h)/4))/2)
            );
            rotate(random(0,360));
            fill(random(150,255),random(0,255),0);
            noStroke();
            square(0, 0, random(20,50));
            pop();
        }
    }
    if (this.hp <= 0) {
        
        // Bomb hurts everyone nearby
        if(this.pos.dist(curPlayer.pos) < 33+(6*(this.size.w+this.size.h)/4)){
            curPlayer.statBlock.stats.hp -= ((33+(6*(this.size.w+this.size.h)/4))-this.pos.dist(curPlayer.pos))/2;
            curPlayer.attackingOBJ = this;
            camera.shake = {intensity: ((33+(6*(this.size.w+this.size.h)/4))-this.pos.dist(curPlayer.pos))/2, length: 5};
            camera.edgeBlood = 5;
            socket.emit("update_player", {
                id: curPlayer.id,
                pos: curPlayer.pos,
                holding: curPlayer.holding,
                update_names: ["stats.hp"],
                update_values: [curPlayer.statBlock.stats.hp]
            });
        }

        socket.emit("update_nodes", {
            cx: testMap.globalToChunk(this.pos.x,this.pos.y).x,
            cy: testMap.globalToChunk(this.pos.x,this.pos.y).y,
            pos: {x: this.pos.x, y: this.pos.y},
            radius: 5,
            amt: 1
        });

        socket.emit("update_iron_nodes", {
            cx: testMap.globalToChunk(this.pos.x,this.pos.y).x,
            cy: testMap.globalToChunk(this.pos.x,this.pos.y).y,
            pos: {x: this.pos.x, y: this.pos.y},
            radius: 5,
            amt: 1
        });

        // Bomb hurts all objects nearby
        let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
        let chunk = testMap.chunks[chunkPos.x+","+chunkPos.y];
        if(chunk != undefined){
            for(let i=0; i<chunk.objects.length; i++){
                if(chunk.objects[i].pos.dist(this.pos) < 33+(6*(this.size.w+this.size.h)/4)){
                    if(chunk.objects[i].type == "Placeable" || chunk.objects[i].type == "Trap" || chunk.objects[i].objName == "Turret" || chunk.objects[i].type == "Entity"){
                        chunk.objects[i].hp -= ((33+(6*(this.size.w+this.size.h)/4))-chunk.objects[i].pos.dist(this.pos))/2;
                        chunk.objects[i].shake = {intensity: 10, length: 5};
                        
                        scareBrain(chunk.objects[i].brainID, this);

                        //tell the server to update the object
                        socket.emit("update_obj", {
                            cx: chunkPos.x, cy: chunkPos.y,
                            objName: chunk.objects[i].objName,
                            pos: {x: chunk.objects[i].pos.x, y: chunk.objects[i].pos.y},
                            z: chunk.objects[i].z,
                            update_name: "hp",
                            update_value: chunk.objects[i].hp
                        });
                    }
                }
            }
        }



        // if you made this bomb, when it eventually blows up, the 'damage' will be sent to server by bomb-placer
        // if(this.id == curPlayer.id && this.ownerName == curPlayer.name) { 

        // }
        
        // Remove bomb after explosion
        this.deleteTag = true;
        socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, objName: this.objName, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
    }
}
defineCustomObj("PlacedBomb", [[453,69,15,13],[416,64,15,13]], [], 15*4, 13*4, 1, 200, bombUpdate, false, false);
defineCustomObj("DirtBomb", [[473,69,15,13]], [["dirt", 20]], 15*4, 13*4, 1, 200, bombUpdate, false, false);

function dirtBinUpdate(){
    if(this.hp <= 0){
        this.deleteTag = true;
        let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
        socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, objName: this.objName, pos: {x: this.pos.x, y: this.pos.y}, z: this.z, cost: objDic[this.objName].cost});
    }

    if(this.mhp == 1){
        this.mhp = maxDirtInv*3;
    }

    // If the player is holding a shovel or an empty hand
    if (curPlayer == undefined) return; // No player to interact with
    //console.log(curPlayer);
    if(buildMode) return;

    if(curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar] == "" || curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].type == "Shovel") {
        //convert mouse cords to world cords
        let mouseVec = createVector(mouseX + camera.pos.x - (width / 2), mouseY + camera.pos.y - (height / 2));
        // check if the mouse is over the dirt bin
        if (mouseVec.dist(this.pos) < (this.size.w + this.size.h) / 4) {
            // If the player clicks, add dirt to the bin
            if (mouseIsPressed && mouseButton === RIGHT) {
                // Check if the player has dirt in their inventory
                if (dirtInv > 0 && this.hp < this.mhp) {
                    dirtInv -= 1;
                    
                    this.hp += 1;
                    socket.emit("update_obj", {
                        cx: testMap.globalToChunk(this.pos.x, this.pos.y).x,
                        cy: testMap.globalToChunk(this.pos.x, this.pos.y).y,
                        objName: this.objName,
                        pos: {x: this.pos.x, y: this.pos.y},
                        z: this.z,
                        update_name: "hp",
                        update_value: this.hp
                    });
                }
            }
            if (mouseIsPressed && mouseButton === LEFT) {
                if (dirtInv < maxDirtInv && this.hp > 1) {
                    dirtInv += 1;
                    
                    this.hp -= 1;
                    socket.emit("update_obj", {
                        cx: testMap.globalToChunk(this.pos.x, this.pos.y).x,
                        cy: testMap.globalToChunk(this.pos.x, this.pos.y).y,
                        objName: this.objName,
                        pos: {x: this.pos.x, y: this.pos.y},
                        z: this.z,
                        update_name: "hp",
                        update_value: this.hp
                    });
                }
            }
        }
    }
}
defineCustomObj("Dirt Bin", [[399,96,15,15]], [["Log", 3]], 16*4, 16*4, 2, 1, dirtBinUpdate, false, true);

function expOrbUpdate() {
    // Up/down motion setup
    if (this.baseY === undefined) {
        this.baseY = this.pos.y;
        this.moveDir = 1; // 1 = up, -1 = down
    }

    // Up/down bobbing motion
    this.pos.y += this.moveDir * 0.5;
    if (this.pos.y > this.baseY + 2) this.moveDir = -1;
    if (this.pos.y < this.baseY - 2) this.moveDir = 1;

    //find closest player
    let closestDist = Infinity;
    let closestPlayer = null;
    let keys = Object.keys(players);
    for (let i = 0; i < keys.length; i++) {
        let player = players[keys[i]];
        if (player.statBlock.stats.hp > 0) { // only consider players with HP
            let dist = this.pos.dist(player.pos);
            if (dist < closestDist) {
                closestDist = dist;
                closestPlayer = player;
            }
        }
    }
    if(curPlayer != undefined){
        let dist = this.pos.dist(curPlayer.pos);
        if (dist < closestDist) {
            closestDist = dist;
            closestPlayer = curPlayer;
        }
    }
    
    // If a player is close enough, attract the orb towards them
    if (closestDist < 200) { // attraction range
        let attraction = closestPlayer.pos.copy().sub(this.pos);
        attraction.setMag(map(closestDist, 0, 200, 2, 0)*(deltaTime/30)); // stronger when closer
        this.pos.add(attraction);
        //tell the server to update the position of the orb
        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        socket.emit("update_obj", {
            cx: chunkPos.x, cy: chunkPos.y,
            objName: this.objName,
            pos: {x: this.pos.x, y: this.pos.y},
            z: this.z,
            id: this.id,
            update_name: "hp",
            update_value: this.hp
        });
    }

    // Pickup if very close to current player
    if (curPlayer === undefined) return; // No player to interact with
    let distToPlayer = this.pos.dist(curPlayer.pos);
    if ((distToPlayer < (this.size.w + this.size.h) / 4) && curPlayer.statBlock.stats.hp > 0) {
        this.hp = 0;

        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        socket.emit("update_obj", {
            cx: chunkPos.x, cy: chunkPos.y,
            objName: this.objName,
            pos: {x: this.pos.x, y: this.pos.y},
            z: this.z,
            id: this.id,
            update_name: "hp",
            update_value: this.hp
        });
        //console.log(this.size.h, "exp orb size ")
        curPlayer.statBlock.setXP(this.size.h/2);
    }

    // Self-delete if HP zero
    if (this.hp <= 0) {
        this.deleteTag = true;
        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        socket.emit("delete_obj", {
            cx: chunkPos.x,
            cy: chunkPos.y,
            objName: this.objName,
            pos: { x: this.pos.x, y: this.pos.y },
            z: this.z,
            cost: objDic[this.objName].cost
        });
    }

    // ✅ p5 render override
    this.customRender = () => {
        push();
        translate(
            -camera.pos.x + (width/2) + this.pos.x,
            -camera.pos.y + (height/2) + this.pos.y
        );
        noStroke();
        fill(0, 200, 255, 180);
        ellipse(0, 0, this.size.w, this.size.h);
        pop();
    };
}


defineCustomObj(
    "ExpOrb",         // Name
    [[385,130,9,9]],      // Images (make sure this file exists)
    [],    // Cost to place, if relevant
    32,               // Width
    32,               // Height
    3,                // Z level: decorations
    100,              // Health
    expOrbUpdate,     // Update function
    false,            // canRotate
    false             // inBuildList
);

function signUpdate() {
    if(this.txt == undefined) this.txt = [];
    if(this.txt == undefined) this.txt = [
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘███┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘█████┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘███████████████┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘██████████████████┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘███████████████████┘██┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘██████████████┘┘███┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘██████████┘███┘┘┘█┘┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘██████┘┘┘┘┘███┘┘┘┘┘┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘██┘┘┘┘██████┘┘┘┘┘████┘┘┘┘┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘████┘┘┘██████┘┘┘┘┘████┘┘┘┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘█████┘███████┘┘┘┘┘████┘┘┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘███████┘██████┘┘┘┘┘┘┘███┘┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘█████████████┘┘┘┘┘┘┘┘████┘┘┘┘┘┘",
        "┘┘┘┘██████┘┘┘┘████████████┘┘┘┘┘┘┘┘┘██┘┘┘┘┘┘┘",
        "┘┘██████████┘┘┘███████████┘█████┘┘┘██┘┘┘┘┘┘┘",
        "┘████┘┘┘┘┘███┘┘┘██████████████████████┘┘┘┘┘┘",
        "███┘┘┘┘┘┘┘┘███┘┘┘█████████████████████┘┘┘┘┘┘",
        "██┘┘┘█████┘┘███┘█████████████████████┘┘┘┘┘┘┘",
        "██┘┘█████████████████████████████████┘┘┘┘┘┘┘",
        "██┘┘█████████████████████████████████████┘┘┘",
        "███┘┘┘██┘┘┘███┘┘██████████████████┘██┘┘████┘",
        "████┘┘┘┘┘┘████┘┘┘████████████████┘┘██┘┘┘┘┘██",
        "┘████████████┘┘┘██┘██████████┘┘┘┘┘┘██┘┘┘┘┘┘┘",
        "┘┘┘┘███████┘┘┘┘┘┘┘┘┘┘████████┘┘┘┘┘┘██┘┘┘┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘███┘┘┘┘┘███████┘┘┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘█┘┘┘┘███████████┘┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘███┘┘██┘┘┘███┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘███┘┘┘██┘┘┘┘███",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘██┘┘┘┘████┘┘┘██",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘███┘┘██████┘┘┘██",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘██┘┘┘█████┘┘┘██",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘██┘┘┘┘███┘┘┘┘██",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘███┘┘┘┘┘┘┘┘┘██┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘████┘┘┘┘┘████┘",
        "┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘█████████┘┘┘"

    ];

    let mouseVec = createVector(mouseX + camera.pos.x - (width / 2), mouseY + camera.pos.y - (height / 2));
    // check if the mouse is over the sign
    if (mouseVec.dist(this.pos) < (this.size.w + this.size.h) / 4) {
        //check ownership
        //if owner then open sign editor
        if(mouseIsPressed && mouseButton == LEFT){
            if(
                (this.color != 0 && this.color == curPlayer.color) ||
                (this.ownerName == curPlayer.name && this.color == 0)
            ){
                gameState = "Editing Sign";
                curPlayer.sign = this;
                updateSignUI(this.txt);
                signDiv.show();
            }
        }
        
        //if not then just render what the sign says
        let centerY = -64-((this.txt.length-1)*6);
        let sizeX = 60;
        for(let i=0; i<this.txt.length; i++){
            if(textWidth(this.txt[i])+15 > sizeX){
                sizeX = textWidth(this.txt[i])+15;
            }
        }
        let sizeY = 40 + ((this.txt.length-1)*12);
        push();
        translate(this.pos.x - camera.pos.x + (width / 2), this.pos.y - camera.pos.y + (height/2))
        fill(255);
        stroke(0);
        strokeWeight(3);
        ellipse(0, centerY, sizeX, sizeY);
        triangle(-10, centerY+(sizeY/2)-5, 10, centerY+(sizeY/2)-5, 0, -32);
        noStroke();
        ellipse(0, centerY, sizeX-3, sizeY-3);

        fill(0);
        strokeWeight(1);
        textAlign(CENTER, CENTER);
        for(let i=0; i<this.txt.length; i++){
            text(this.txt[i], 0, centerY - ((this.txt.length/2 - (i+0.5))*12));
        }
        
        pop();
    }
    
}
defineCustomObj("Sign", [[398,111,15,18]], [["Log", 3]], 64, 64, 3, 100, signUpdate, false, true);

defineEntity("Ant",[[141,224,17,13],[159,224,17,13]],[["Tech",1]], 17*2, 13*2, 100, 10, 50, 60, 90, 5);

var teamColors = [
    {r: 128, g: 128, b: 128}, //Gray - No Team
    {r: 255, g:   0, b:   0}, //Red
    {r:   0, g:   0, b: 255}, //Blue
    {r:   0, g: 255, b:   0}, //Green
    {r:   0, g: 255, b: 255}, //Cyan
    {r: 255, g: 255, b:   0}, //Yellow
    {r: 255, g:   0, b: 255}, //Magenta
    {r:   0, g: 128, b:   0}, //Dark-Green
    {r: 255, g: 128, b:   0}, //Orange
    {r: 128, g:   0, b: 255}, //Purple
    {r: 255, g: 128, b: 225}, //Pink
    {r: 127, g:  63, b:   0}, //Brown
]

class Placeable{
    constructor(objName,x,y,w,h,rot,z,color,health,imgNum,id,ownerName,canRotate){
        this.objName = objName;
        this.pos = createVector(x,y);
        this.size = {w: w, h: h};
        this.rot = rot;
        this.z = z;
        this.color = color; //index to team colors
        if(this.color == undefined) this.color = 0; //no team color
        this.hp = health;
        this.mhp = health;
        this.imgNum = imgNum;
        this.canRotate = canRotate;
        this.alpha = 255;
        this.id = id;
        this.ownerName = ownerName;

        this.openBool = true; //is object in an open spot?, used for ghost rendering
        this.deleteTag = false;
        this.type = "Placeable";

        this.offset = createVector(0,0);
        this.offVel = createVector(0,0); //offset velocity
        this.shake = {intensity: 0, length: 0};
    }

    update(){
        if(this.hp <= 0){
            this.deleteTag = true;
            let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
            socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, objName: this.objName, pos: {x: this.pos.x, y: this.pos.y}, z: this.z, cost: objDic[this.objName].cost});
        }
    }

    renderHealthBar() {
        push();
        // Move the origin to where this entity is on screen
        translate(
          -camera.pos.x + (width / 2) + this.pos.x,
          -camera.pos.y + (height / 2) + this.pos.y
        );
      
        // (Optional) shift upward so the bar is above the sprite
        translate(0, -this.size.h / 2 - 10);
      
        // Draw health bar background
        fill(255, 0, 0);
        noStroke();
        rect(0, 0, 32, 6);
      
        // Draw health portion
        fill(0, 255, 0); 
        let healthWidth = constrain(map(this.hp, 0, this.mhp, 0, 32), 0, 32);
        rect(0, 0, healthWidth, 6);
      
        pop();
      }

    render(t){
        push();
        
        if(this.shake.length > 0){
            if(this.offVel.mag() < 1){
                this.offVel.x = this.shake.intensity;
            }
            this.offVel.setMag(this.offVel.mag()+this.shake.intensity);
            if(this.offVel.mag() > this.shake.intensity*5){
                this.offVel.setMag(this.shake.intensity*5);
            }
            this.offVel.rotate(random(0, 360));
            this.shake.length -= 1;
        }
        else{
            this.shake.intensity = 0;
            this.offVel.x = -1*this.offset.x;
            this.offVel.y = -1*this.offset.y;
            this.offVel.setMag(this.offVel.mag()/10);
        }
        this.offset.add(this.offVel);

        translate(-camera.pos.x+(width/2)+this.pos.x+this.offset.x, -camera.pos.y+(height/2)+this.pos.y+this.offset.y);
        rotate(this.rot);
        if(t == "green") tint(100, 200, 100, 100);
        if(t == "red") tint(200, 100, 100, 100);
        if(this.alpha < 255) tint(255, this.alpha);
        image(objImgs[this.imgNum][this.color % (objImgs[this.imgNum].length)], -this.size.w/2,-this.size.h/2, this.size.w, this.size.h);
        pop();

        if(this.hp < this.mhp){
            this.renderHealthBar();
        }
    }

    ghostRender(ob){
        push();
        translate(-camera.pos.x+(width/2)+this.pos.x, -camera.pos.y+(height/2)+this.pos.y);
        rotate(this.rot);
        
        this.openBool = ob;
        let touchingObjs = [];

        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        let chunk = testMap.chunks[chunkPos.x+","+chunkPos.y];
        for(let j = 0; j < chunk.objects.length; j++){
            if(this.z == chunk.objects[j].z){
                let d = chunk.objects[j].pos.dist(this.pos);
                if(d < (chunk.objects[j].size.w+chunk.objects[j].size.h)/4 + (this.size.w+this.size.h)/4 - 10 - (this.objName == "Door" || this.objName == "Thin Wall" ? 12 : 0) - (chunk.objects[j].objName == "Door" || chunk.objects[j].objName == "Thin Wall" ? 12 : 0)){
                    this.openBool = false;
                    touchingObjs.push({objName: chunk.objects[j].objName, pos: chunk.objects[j].pos, size: chunk.objects[j].size});
                }
            }
        }

        let keys = Object.keys(players);
        for(let i = 0; i < keys.length; i++){
            if(players[keys[i]].pos.dist(this.pos) < ((48.4+83.6)/4 + (this.size.w+this.size.h)/4)){
                this.openBool = false;
                touchingObjs.push({pos: players[keys[i]].pos, size: {w: 48.4, h: 83.6}});
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
                if (check.val > 0 || check.iron_val > 0) {
                    this.openBool = false;
                }
            }
        }

        if(touchingObjs.length > 0){
            fill(255,100);
            circle(0,0, (this.size.w+this.size.h)/2);
        }
        
        pop();

        push();
        fill(255,100);
        for(let i=0; i<touchingObjs.length; i++){
            circle(touchingObjs[i].pos.x-camera.pos.x+(width/2), touchingObjs[i].pos.y-camera.pos.y+(height/2), (touchingObjs[i].size.w+touchingObjs[i].size.h)/2);
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
            translate(camera.pos.x-(width/2)-this.pos.x, camera.pos.y-(height/2)-this.pos.y);
            fill(255);
            circle(((x+(chunkPos.x*CHUNKSIZE))*TILESIZE)-camera.pos.x+(width/2),((y+(chunkPos.y*CHUNKSIZE))*TILESIZE)-camera.pos.y+(height/2), 10);
            pop(); 
        }
        
        return {
            x: (x + 0.5) * TILESIZE,
            y: (y + 0.5) * TILESIZE,
            cx: chunkPos.x,
            cy: chunkPos.y,
            val: testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + (y / CHUNKSIZE)],
            iron_val: testMap.chunks[chunkPos.x+","+chunkPos.y].iron_data[x + (y / CHUNKSIZE)]
        };
        
    }

    useDoor(){
        if(this.objName == "Door"){
            if(this.ownerName == curPlayer.name || this.color == curPlayer.color){ //only team members and you can open your doors
                if(this.alpha == 255){
                    this.alpha = 100;
                }
                else{
                    this.alpha = 255;
                }
                let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
                socket.emit("update_obj", {
                    cx: chunkPos.x, cy: chunkPos.y, 
                    objName: this.objName, 
                    pos: {x: this.pos.x, y: this.pos.y}, 
                    z: this.z, 
                    update_name: "alpha", 
                    update_value: this.alpha
                });
            }
        }
    }
}

class Plant extends Placeable{
    constructor(objName,x,y,w,h,color,health,imgNum,id,ownerName,growthRate,itemDrop){
        super(objName,x,y,w,h,0,0,color,health,imgNum,id,ownerName,false);
        this.growthRate = growthRate;
        this.itemDrop = itemDrop;
        
        this.growthTimer = 0;
        this.stage = 0;
        this.type = "Plant";
    }

    update(){
        if(this.hp <= 0){
            this.deleteTag = true;
            let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
            let bagInv = [];

            if(this.stage == (objImgs[this.imgNum].length-1)){
                bagInv = objDic[this.objName].cost;
            }
            
            socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, objName: this.objName, pos: {x: this.pos.x, y: this.pos.y}, z: this.z, cost: bagInv});
        }
        if(this.growthTimer > this.growthRate){
            if(this.hp >= this.mhp){
                this.growthTimer = 0;
                if(this.stage < (objImgs[this.imgNum].length-1)){
                    this.stage ++;

                    let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
                    socket.emit("update_obj", {
                        cx: chunkPos.x, cy: chunkPos.y, 
                        objName: this.objName, 
                        pos: {x: this.pos.x, y: this.pos.y}, 
                        z: this.z,
                        update_name: "stage", 
                        update_value: this.stage
                    });
                }
                else{
                    //try to spread
                    if(random() < 0.2){
                        let spreadPos = createVector(this.pos.x + random(-100, 100), this.pos.y + random(-100, 100));
                        let chunkPos = testMap.globalToChunk(spreadPos.x,spreadPos.y);
                        if(testMap.chunks[chunkPos.x+","+chunkPos.y] != undefined){
                            
                            let index = floor((spreadPos.x - (chunkPos.x * CHUNKSIZE * TILESIZE)) / TILESIZE) + (floor((spreadPos.y - (chunkPos.y * CHUNKSIZE * TILESIZE)) / TILESIZE) / CHUNKSIZE);
                            //if(testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] == undefined) {console.log("undefined data")}
                            if(testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] == 0 && testMap.chunks[chunkPos.x+","+chunkPos.y].iron_data[index] == 0){
                                let newPlant = createObject(this.objName, spreadPos.x, spreadPos.y, 0, this.color, this.id, this.ownerName);
                                testMap.chunks[chunkPos.x+","+chunkPos.y].objects.push(newPlant);
                                socket.emit("new_object", {
                                    cx: chunkPos.x,
                                    cy: chunkPos.y,
                                    obj: newPlant
                                });
                            }
                        }
                    }
                }
            }
        }
        this.growthTimer += 1/frameRate(); //growth timer goes up by 1 every second
    }

    render(t){
        push();
        if(this.shake.length > 0){
            if(this.offVel.mag() < 1){
                this.offVel.x = this.shake.intensity;
            }
            this.offVel.setMag(this.offVel.mag()+this.shake.intensity);
            if(this.offVel.mag() > this.shake.intensity*5){
                this.offVel.setMag(this.shake.intensity*5);
            }
            this.offVel.rotate(random(0, 360));
            this.shake.length -= 1;
        }
        else{
            this.shake.intensity = 0;
            this.offVel.x = -1*this.offset.x;
            this.offVel.y = -1*this.offset.y;
            this.offVel.setMag(this.offVel.mag()/10);
        }
        this.offset.add(this.offVel);

        translate(-camera.pos.x+(width/2)+this.pos.x+this.offset.x, -camera.pos.y+(height/2)+this.pos.y+this.offset.y);
        rotate(this.rot);
        if(t == "green") tint(100, 200, 100);
        if(t == "red") tint(200, 100, 100);
        image(objImgs[this.imgNum][this.stage], -this.size.w/2,-this.size.h/2, this.size.w, this.size.h);
        pop();

        if(this.hp < this.mhp){
            this.renderHealthBar()
        }
    }

    usePlant(){
        if(this.stage == (objImgs[this.imgNum].length-1)){
            this.hp = 0;
        }
    }
}

class Trap extends Placeable{
    constructor(objName,x,y,w,h,color,health,imgNum,id,ownerName,triggerRadius,damageRadius,digBool,damage){
        super(objName,x,y,w,h,0,1,color,health,imgNum,id,ownerName,false);
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
            if(this.ownerName != curPlayer.name){ //aka if you didnt make this trap
                if(this.pos.dist(curPlayer.pos) < this.triggerRadius){
                    let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
                    //play hit noise and tell server
                    let temp = new SoundObj("hit.ogg", curPlayer.pos.x, curPlayer.pos.y);
                    testMap.chunks[chunkPos.x+","+chunkPos.y].soundObjs.push(temp);
                    socket.emit("new_sound", {sound: "hit.ogg", cPos: chunkPos, pos:{x: curPlayer.pos.x, y: curPlayer.pos.y}, id: temp.id});
                    this.deleteTag = true;
                    curPlayer.statBlock.stats.hp -= this.damage;
                    camera.shake = {intensity: this.damage, length: 5};
                    camera.edgeBlood = 5;
                    socket.emit("update_player", {
                        id: curPlayer.id,
                        pos: curPlayer.pos,
                        holding: curPlayer.holding,
                        update_names: ["stats.hp"],
                        update_values: [curPlayer.statBlock.stats.hp]
                    });
                    
                    socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, objName: this.objName, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
                }
            }
        }
    }
}

class InvObj extends Placeable{
    constructor(objName,x,y,w,h,color,health,imgNum,id,ownerName,maxWeight,canRotate){
        super(objName,x,y,w,h,0,1,color,health,imgNum,id,ownerName,canRotate);
        this.maxWeight = maxWeight;

        this.locked = false;
        this.invBlock = new InvBlock();
        this.type = "InvObj";
    }

    update(){
        super.update();

        if(this.objName == "ItemBag"){
            if(Object.keys(this.invBlock.items).length <= 0){
                this.hp = 0;
                if(curPlayer.otherInv != undefined){
                    if(curPlayer.otherInv.invBlock.invId == this.invBlock.invId){
                        if(gameState == "swap_inv"){
                            gameState = "playing";
                            swapInvDiv.hide();
                            spaceBarDiv.hide();
                        }
                    }
                }
            }
        }
    }

    useInv(){
        if(this.locked){ //when locked only owner can open
            if(curPlayer.name == this.ownerName){
                gameState = "swap_inv";
                curPlayer.otherInv = this;
                curPlayer.invBlock.curItem = "";
                curPlayer.otherInv.invBlock.curItem = "";
                updateSwapItemLists(this.invBlock);
                swapInvDiv.show();
                //console.log("open Inv");
            }
        }
        else{ //when unlocked all team members can open
            if(curPlayer.color == this.color || (this.ownerName == "" && this.id == "")){
                gameState = "swap_inv";
                curPlayer.otherInv = this;
                curPlayer.invBlock.curItem = "";
                curPlayer.otherInv.invBlock.curItem = "";
                updateSwapItemLists(this.invBlock);
                swapInvDiv.show();
                //console.log("open Inv");
            }
        }
    }
}

class Entity extends Placeable{
    constructor(objName,x,y,w,h,rot,z,color,health,imgNum,id,ownerName,projName,brainID){
        super(objName,x,y,w,h,rot,z,color,health,imgNum,id,ownerName,false);
        this.projName = projName;
        
        this.animationFrame = 0;
        this.currentFrame = 0;

        if(brainID == -1){
            testMap.brains.push(new Brain(200));
            testMap.brains[testMap.brains.length-1].giveBody(this);
        }
        else{
            this.brainID = brainID;
            let found = false;
            for(let i=0; i<testMap.brains.length; i++){
                if(brainID == testMap.brains[i].id){
                    testMap.brains[i].obj = this;
                    found = true;
                }
            }

            if(!found){
                testMap.brains.push(new Brain(200));
                testMap.brains[testMap.brains.length-1].id = brainID;
                testMap.brains[testMap.brains.length-1].obj = this;
            }
        }
    }

    update(){
        if(this.hp <= 0){
            this.deleteTag = true;
            let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);

            let expOrb = createObject(
                "ExpOrb",                         // name
                this.pos.x + random(-10,10), // x (add slight offset)
                this.pos.y + random(-10,10), // y (add slight offset)
                0,                                 // rot
                0,                                 // color/team
                `xp_orb_${Date.now()}`,            // unique id
                this.name                     // owner (optional)
            );
            expOrb.id = random(1000000);
            testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.push(expOrb);
            testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.sort((a,b) => a.z - b.z);

            socket.emit("new_object", {
                cx: chunkPos.x,
                cy: chunkPos.y,
                obj: expOrb
            });

            let cost = objDic[this.objName].cost;
            if(random() < 0.5){
                cost.push(["Philosopher's Stone", 1]);
            }
            socket.emit("delete_obj", {
                cx: chunkPos.x, cy: chunkPos.y, 
                objName: this.objName, 
                pos: {x: this.pos.x, y: this.pos.y}, 
                z: this.z, 
                cost: cost
            });
            
            for(let i=testMap.brains.length-1; i>=0; i--){
                if(testMap.brains[i].id == this.brainID){
                    testMap.brains[i].deleteTag = true;
                }
            }
        }
    }

    render(t){
        push();
        if(this.shake.length > 0){
            if(this.offVel.mag() < 1){
                this.offVel.x = this.shake.intensity;
            }
            this.offVel.setMag(this.offVel.mag()+this.shake.intensity);
            if(this.offVel.mag() > this.shake.intensity*5){
                this.offVel.setMag(this.shake.intensity*5);
            }
            this.offVel.rotate(random(0, 360));
            this.shake.length -= 1;
        }
        else{
            this.shake.intensity = 0;
            this.offVel.x = -1*this.offset.x;
            this.offVel.y = -1*this.offset.y;
            this.offVel.setMag(this.offVel.mag()/10);
        }
        this.offset.add(this.offVel);

        translate(-camera.pos.x+(width/2)+this.pos.x+this.offset.x, -camera.pos.y+(height/2)+this.pos.y+this.offset.y);
        rotate(this.rot);
        if(t == "green") tint(100, 200, 100, 100);
        if(t == "red") tint(200, 100, 100, 100);
        if(this.alpha < 255) tint(255, this.alpha);
        image(objImgs[this.imgNum][floor(this.currentFrame)], -this.size.w/2,-this.size.h/2, this.size.w, this.size.h);
        pop();

        if(this.hp < this.mhp){
            this.renderHealthBar();
        }

        this.animationFrame += (1 / 7);
        this.currentFrame = (this.animationFrame) % 2;
    }
}

class CustomObj extends Placeable{
    constructor(objName,x,y,w,h,rot,z,color,health,imgNum,id,ownerName,update,canRotate){
        super(objName,x,y,w,h,rot,z,color,health,imgNum,id,ownerName,canRotate);
        this.update = update;
        this.type = "Custom";
    }

 
    //define your own update
}

function createObject(name, x, y, rot, color, id, ownerName, brainID){
    if(objDic[name] == undefined){
        throw new Error(`Object with name: ${name}, does not exist`);
    }
    else{
        if(objDic[name].type == "Placeable"){
            return new Placeable(name, x, y, objDic[name].w, objDic[name].h, rot, objDic[name].z, color, objDic[name].hp, objDic[name].img, id, ownerName, objDic[name].canRotate);
        }
        else if(objDic[name].type == "Plant"){
            return new Plant(name, x, y, objDic[name].w, objDic[name].h, color, objDic[name].hp, objDic[name].img, id, ownerName, objDic[name].gr, objDic[name].itemDrop);
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
        else if(objDic[name].type == "Entity"){
            return new Entity(name, x, y, objDic[name].w, objDic[name].h, rot, objDic[name].z, color, objDic[name].hp, objDic[name].img, id, ownerName, objDic[name].projName, brainID);
        }
        else{
            throw new Error(`Object type: ${objDic[name].type}, does not exist.`);
        }
    }
}

//the most common parts of a define, so we don't have to keep editing all the defines
function defineObjSuper(type,name,imgSrc,cost,width,height,zLevel,health,canRotate,inBuildList){
    checkParams(arguments, getParamNames(defineObjSuper), ["string","string","object","object","int","int","int","int","boolean","boolean"]);

    let cords = [];
    let paths = [];
    for(let i = 0; i < imgSrc.length; i++){
        if(Number.isInteger(imgSrc[i][0])){ //assume cords were given
            cords.push(imgSrc[i]);
        }
        else{ //assume path was given
            if(!imgSrc[i].includes("images")){
                imgSrc[i] = "images/structures/" + imgSrc[i];
            }
            if(!imgSrc[i].includes(".")){
                imgSrc[i] = imgSrc[i] + ".png";
            }
            paths.push(imgSrc[i]);
            cords.push([-1,-1]); //add a dummy cord for this image
        }
    }
    if(cords.length != 0) objImgCords.push(cords);
    if(paths.length != 0) objImgPaths.push(paths);
    let imgNum = objImgCords.length - 1;
    
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
        buildOptions.push({ objName: name, key: 49+(buildOptions.length), images2: imgNum, cost: cost});
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
 * - 0=floors,plants
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

function defineEntity(name,imgNames,cost,width,height,health,damage,range,safeRange,angle,knockback){
    defineObjSuper("Entity",name,imgNames,cost,width,height,2,health,false,false);

    let paramNames = getParamNames(defineEntity);
    checkParams(
        [arguments[6],arguments[7],arguments[8],arguments[9],arguments[10]], 
        [paramNames[6],paramNames[7],paramNames[8],paramNames[9],paramNames[10]], 
        ["number","number","number","number","number"]
    );

    objDic[name].projName = name+" Slash"

    defineMeleeProjectile(name+" Slash", 0, range, safeRange, angle, damage, knockback, 0.5);
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
 * - 0=floors,plants
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
