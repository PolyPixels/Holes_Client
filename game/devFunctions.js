function getPlayerChunk(){
    let temp = testMap.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
    return temp.x + "," + temp.y;
}

function cleanChunk(cx,cy){  //removes all dirt in a chunk
    let chunk = testMap.chunks[cx+","+cy];
    for (let x = 0; x < CHUNKSIZE; x++){
        for (let y = 0; y < CHUNKSIZE; y++){
            let index = x + (y / CHUNKSIZE);
            chunk.data[index] = 0; 
            //socket.emit("update_node", {chunkPos: (cx+","+cy), index: index, val: 0});
        }
    }
}

function createTestChunk(cx, cy){ //makes the dirt in a specific way to test the rendering
    let testChunk = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,9,9,9,9,9,9,9,9,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,9,9,0,0,8,8,8,0,0,7,7,7,0,0,6,6,6,0,0,5,5,5,0,0,4,4,4,0,0,3,3,3,0,0,2,2,2,0,0,1,1,1,0,0,0,0],
        [0,0,0,9,9,9,0,0,8,8,8,0,0,7,7,7,0,0,6,6,6,0,0,5,5,5,0,0,4,4,4,0,0,3,3,3,0,0,2,2,2,0,0,1,1,1,0,0,0,0],
        [0,0,0,9,9,9,0,0,8,8,8,0,0,7,7,7,0,0,6,6,6,0,0,5,5,5,0,0,4,4,4,0,0,3,3,3,0,0,2,2,2,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,9,9,0,0,8,8,8,0,0,7,7,7,0,0,6,6,6,0,0,5,5,5,0,0,4,4,4,0,0,3,3,3,0,0,2,2,2,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,0,0,0,0,8,0,0,0,0,7,0,0,0,0,6,0,0,0,0,5,0,0,0,0,4,0,0,0,0,3,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,9,0,0,0,8,8,0,0,0,7,7,0,0,0,6,6,0,0,0,5,5,0,0,0,4,4,0,0,0,3,3,0,0,0,2,2,0,0,0,1,1,0,0,0,0,0],
        [0,0,0,9,0,0,0,0,8,0,0,0,0,7,0,0,0,0,6,0,0,0,0,5,0,0,0,0,4,0,0,0,0,3,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,9,0,0,0,0,8,0,0,0,0,7,0,0,0,0,6,0,0,0,0,5,0,0,0,0,4,0,0,0,0,3,0,0,0,0,2,0,0,0,0,1,0,0,0,0],
        [0,0,0,0,9,9,0,0,0,8,8,0,0,0,7,7,0,0,0,6,6,0,0,0,5,5,0,0,0,4,4,0,0,0,3,3,0,0,0,2,2,0,0,0,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,9,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ]
    let chunk = testMap.chunks[cx+","+cy];
    for (let x = 0; x < CHUNKSIZE; x++){
        for (let y = 0; y < CHUNKSIZE; y++){
            let index = x + (y / CHUNKSIZE);
            chunk.data[index] = testChunk[y][x]/9; 
            socket.emit("update_node", {chunkPos: (cx+","+cy), index: index, val: testChunk[y][x]/9});
        }
    }
}

function teleportToChunk(cx,cy){ //teleports you to the top left corner of a chunk
    curPlayer.pos.x = cx*CHUNKSIZE*TILESIZE;
    curPlayer.pos.y = cy*CHUNKSIZE*TILESIZE;
    socket.emit("update_pos", {
        id: curPlayer.id,
        pos: curPlayer.pos,
        holding: curPlayer.holding
    });
    return true;
}

function teleportToPlayer(name){ //teleports you to another player
    let keys = Object.keys(players);
    for(let i = 0; i < keys.length; i++){
        if(players[keys[i]].name === name){
            curPlayer.pos = players[keys[i]].pos.copy();
            socket.emit("update_pos", {
                id: curPlayer.id,
                pos: curPlayer.pos,
                holding: curPlayer.holding
            });
            return true;
        }
    }
    console.log(name + " not found");
    return false;
}

function giveDefaultItems(){
    curPlayer.invBlock.addItem("Basic Shovel", 1, false);
    curPlayer.invBlock.hotbarItem("Basic Shovel", 0);
    curPlayer.invBlock.addItem("Basic Sword", 1, false);
    curPlayer.invBlock.hotbarItem("Basic Sword", 1);
    curPlayer.invBlock.addItem("Basic SlingShot", 1, false);
    curPlayer.invBlock.hotbarItem("Basic SlingShot", 2);
    curPlayer.invBlock.addItem("Apple", 3, false);
    curPlayer.invBlock.hotbarItem("Apple", 3);
    curPlayer.invBlock.addItem("Mushroom Seed", 3, false);
    curPlayer.invBlock.hotbarItem("Mushroom Seed", 4);
}

function giveAllItems(){
    curPlayer.invBlock.addItem("Basic Shovel", 1, false);
    curPlayer.invBlock.addItem("Better Shovel", 1, false);
    curPlayer.invBlock.addItem("God Shovel", 1, false);
    curPlayer.invBlock.addItem("Basic Sword", 1, false);
    curPlayer.invBlock.addItem("Better Sword", 1, false);
    curPlayer.invBlock.addItem("Basic SlingShot", 1, false);
    curPlayer.invBlock.addItem("Better SlingShot", 1, false);
    curPlayer.invBlock.addItem("Dirt Ball", 20, false);
    curPlayer.invBlock.addItem("Dark Gem", 5, false);
    curPlayer.invBlock.addItem("Philosopher Stone", 2, false);
    curPlayer.invBlock.addItem("Mushroom Seed", 5, false);
    curPlayer.invBlock.addItem("Evil Apple on Stick", 1, false);
    curPlayer.invBlock.addItem("Rock", 20, false);
    curPlayer.invBlock.addItem("Gem", 5, false);
    curPlayer.invBlock.addItem("Log", 5, false);
    curPlayer.invBlock.addItem("Tech", 5, false);
    curPlayer.invBlock.addItem("Apple", 5, false);
    curPlayer.invBlock.addItem("Mushroom", 5, false);
    curPlayer.invBlock.addItem("Bad Apple", 5, false);
    
    curPlayer.invBlock.hotbarItem("Basic Shovel", 0);
    curPlayer.invBlock.hotbarItem("Basic Sword", 1);
    curPlayer.invBlock.hotbarItem("Basic SlingShot", 2);
    curPlayer.invBlock.hotbarItem("Apple", 3);
    curPlayer.invBlock.hotbarItem("Mushroom Seed", 4);
}

function giveDefaultItems(){
    curPlayer.invBlock.addItem("Basic Shovel", 1, false);
    curPlayer.invBlock.addItem("Basic Sword", 1, false);
    curPlayer.invBlock.addItem("Basic SlingShot", 1, false);
    curPlayer.invBlock.addItem("Mushroom Seed", 5, false);
    curPlayer.invBlock.addItem("Rock", 20, false);
    curPlayer.invBlock.addItem("Log", 5, false);
    curPlayer.invBlock.addItem("Apple", 5, false);
    curPlayer.invBlock.addItem("Bomb", 5, false);

    curPlayer.invBlock.hotbarItem("Basic Shovel", 0);
    curPlayer.invBlock.hotbarItem("Basic Sword", 1);
    curPlayer.invBlock.hotbarItem("Basic SlingShot", 2);
    curPlayer.invBlock.hotbarItem("Apple", 3);
    curPlayer.invBlock.hotbarItem("Bomb", 4);
}

function spawnObj(name, x, y, rot = 0, color = 0, id = "", ownerName = ""){
    let chunkPos = testMap.globalToChunk(x,y);
    let temp = createObject(name, x, y, rot, color, id, ownerName);
    testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.push(temp);
    testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.sort((a,b) => a.z - b.z);
    socket.emit("new_object", {
        cx: chunkPos.x, 
        cy: chunkPos.y, 
        obj: temp
    });
}