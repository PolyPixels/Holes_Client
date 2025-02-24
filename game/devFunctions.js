function cleanChunk(cx,cy){  //removes all dirt in a chunk
    let chunk = testMap.chunks[cx+","+cy];
    for (let x = 0; x < CHUNKSIZE; x++){
        for (let y = 0; y < CHUNKSIZE; y++){
            let index = x + (y / CHUNKSIZE);
            chunk.data[index] = 0; 
            socket.emit("update_node", {chunkPos: (cx+","+cy), index: index, val: 0});
        }
    }
}

function teleportToChunk(cx,cy){ //teleports you to the top left corner of a chunk
    curPlayer.pos.x = cx*CHUNKSIZE*TILESIZE;
    curPlayer.pos.y = cy*CHUNKSIZE*TILESIZE;
    socket.emit("update_pos", curPlayer);
    return true;
}

function teleportToPlayer(name){ //teleports you to another player
    let keys = Object.keys(players);
    for(let i = 0; i < keys.length; i++){
        if(players[keys[i]].name === name){
            curPlayer.pos = players[keys[i]].pos.copy();
            socket.emit("update_pos", curPlayer);
            return true;
        }
    }
    console.log(name + " not found");
    return false;
}

function giveDefaultItems(){
    curPlayer.invBlock.addItem("Basic Shovel", 1);
    curPlayer.invBlock.hotbarItem("Basic Shovel", 0);
    curPlayer.invBlock.addItem("Basic Sword", 1);
    curPlayer.invBlock.hotbarItem("Basic Sword", 1);
    curPlayer.invBlock.addItem("Basic SlingShot", 1);
    curPlayer.invBlock.hotbarItem("Basic SlingShot", 2);
    curPlayer.invBlock.addItem("Apple", 3);
    curPlayer.invBlock.hotbarItem("Apple", 3);
    curPlayer.invBlock.addItem("Mushroom Seed", 3);
    curPlayer.invBlock.hotbarItem("Mushroom Seed", 4);
}