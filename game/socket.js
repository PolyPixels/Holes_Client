var socket; //Connection to the server

function socketSetup(){
    //all caps means it came from the server
    //all lower means it came from the client

    // Socket event handlers
    socket.on('GIVE_MAP', (data) => {
        testMap.data = data;
    });

    socket.on('NEW_PLAYER', (data) => {
        players[data.id] = new Player(
            data.pos.x,
            data.pos.y,
            data.hp,
            data.id,
            data.color,
            data.race,
            data.name
        );
        updatePlayerCount()
    });

    socket.on('OLD_DATA', (data) => {
        let keys = Object.keys(data.players);
        for (let i = 0; i < keys.length; i++) {
            const playerData = data.players[keys[i]];
            players[keys[i]] = new Player(
                playerData.pos.x,
                playerData.pos.y,
                playerData.hp,
                keys[i],
                playerData.color,
                playerData.race,
                playerData.name
            );
        }
    });

    socket.on('YOUR_ID', (data) => {
        curPlayer = new Player(
            200, //random(-200*TILESIZE, 200*TILESIZE)
            200, //random(-200*TILESIZE, 200*TILESIZE)
            undefined,
            data.id,
            11,
            0,
            ''
        ); // Default race index 0

        camera.pos = createVector(curPlayer.pos.x, curPlayer.pos.y);

        //load in some chunks for easy start
        let chunkPos = testMap.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
        for(let yOff = -2; yOff < 3; yOff++){
            for(let xOff = -2; xOff < 3; xOff++){
                testMap.getChunk(chunkPos.x + xOff,chunkPos.y + yOff);
            }
        }

        giveAllItems(); //TODO: give players starting gear not all items
    });

    socket.on('UPDATE_ALL_POS', (data) => {
        let keys = Object.keys(data);

        // Update players' positions
        for (let i = 0; i < keys.length; i++) {
            const playerId = keys[i];
            const playerData = data[playerId];

            if (playerId === curPlayer.id) {
                socket.emit('update_pos', curPlayer);
            } else {
                if (players[playerId]) {
                    players[playerId].pos.x = playerData.pos.x;
                    players[playerId].pos.y = playerData.pos.y;
                    players[playerId].hp = playerData.hp;
                    players[playerId].holding = playerData.holding;
                    players[playerId].direction = playerData.direction;
                }
            }
        }
    });

    socket.on('UPDATE_POS', (data) => {
        if (!data) return;
        if (!data.pos) return;

        if (players[data.id]) {
            players[data.id].pos.x = data.pos.x;
            players[data.id].pos.y = data.pos.y;
            players[data.id].statBlock.stats.hp = data.hp;
            players[data.id].holding = data.holding;
            players[data.id].animationType = data.animationType;
            players[data.id].animationFrame = data.animationFrame;
        }
    });

    socket.on("UPDATE_NODE", (data) => {
        if(testMap.chunks[data.chunkPos] != undefined) testMap.chunks[data.chunkPos].data[data.index] = data.val;
    });
    socket.on("change_name", (data) => {
        curPlayer.name = data
    });

    socket.on('REMOVE_PLAYER', (data) => {
        delete players[data];
        updatePlayerCount()
    });

    socket.on("NEW_OBJECT", (data) => {
        let chunk = testMap.chunks[data.cx+","+data.cy];
        if(chunk != undefined){
            let temp = createObject(data.obj.objName, data.obj.pos.x, data.obj.pos.y, data.obj.rot, data.obj.color, data.obj.id, data.obj.ownerName);

            if(temp.type == "InvObj"){
                let keys = Object.keys(data.obj.invBlock.items);
                for(let i=0; i<keys.length; i++){
                    temp.invBlock.addItem(keys[i], data.obj.invBlock.items[keys[i]].amount);
                }
            }
            chunk.objects.push(temp);
            chunk.objects.sort((a,b) => a.z - b.z);
        }
    });

    socket.on("DELETE_OBJ", (data) => {
        let chunk = testMap.chunks[data.cx+","+data.cy];
        if(chunk != undefined){
            for(let i = chunk.objects.length-1; i >= 0; i--){
                if(data.pos.x == chunk.objects[i].pos.x && data.pos.y == chunk.objects[i].pos.y && data.z == chunk.objects[i].z && data.objName == chunk.objects[i].objName){
                    chunk.objects[i].deleteTag = true;
                }
            }
        }
    });

    socket.on("UPDATE_OBJ", (data) =>{
        let chunk = testMap.chunks[data.cx+","+data.cy];
        if(chunk != undefined){
            for(let i = chunk.objects.length-1; i >= 0; i--){
                if(data.pos.x == chunk.objects[i].pos.x && data.pos.y == chunk.objects[i].pos.y && data.z == chunk.objects[i].z && data.objName == chunk.objects[i].objName){
                    chunk.objects[i][data.update_name] = data.update_value;
                }
            }
        }
    })

    socket.on("NEW_PROJECTILE", (data) =>{
        let proj = createProjectile(data.name, data.ownerName, data.color, data.pos.x, data.pos.y, data.flightPath.a);
        proj.id = data.id;
        if(testMap.chunks[data.cPos.x+','+data.cPos.y] != undefined){
            testMap.chunks[data.cPos.x+','+data.cPos.y].projectiles.push(proj);
        }
    });

    socket.on("DELETE_PROJ", (data) =>{
        let chunk = testMap.chunks[data.cPos.x+','+data.cPos.y];
        if(chunk != undefined){
            for(let i=chunk.projectiles.length-1; i>=0; i--){
                if(
                    data.id == chunk.projectiles[i].id &&
                    data.lifeSpan == chunk.projectiles[i].lifeSpan &&
                    data.name == chunk.projectiles[i].name &&
                    data.ownerName == chunk.projectiles[i].ownerName
                ){
                    chunk.projectiles[i].deleteTag = true;
                }
            }
        }
    });

    socket.on("GIVE_CHUNK", (data) => {
        testMap.chunks[data.x+","+data.y] = new Chunk(data.x, data.y);
        let keys = Object.keys(data.data);
        for(let i=0; i<keys.length; i++) testMap.chunks[data.x+","+data.y].data[keys[i]] = data.data[keys[i]];
        testMap.chunkBools[data.x+","+data.y] = true;
        for(let i=0; i<data.objects.length; i++){
            let temp = createObject(data.objects[i].objName, data.objects[i].pos.x, data.objects[i].pos.y, data.objects[i].rot, data.objects[i].color, data.objects[i].id, data.objects[i].ownerName);
            testMap.chunks[data.x+","+data.y].objects.push(temp);
            testMap.chunks[data.x+","+data.y].objects.sort((a,b) => a.z - b.z);
        }
        if(data.projectiles){
            for(let i=0; i<data.projectiles.length; i++){
                let temp = createProjectile(data.projectiles[i].name, data.projectiles[i].ownerName, data.projectiles[i].color, data.projectiles[i].pos.x, data.projectiles[i].pos.y, data.projectiles[i].flightPath.a);
                temp.id = data.projectiles[i].id;
                testMap.chunks[data.x+","+data.y].projectiles.push(temp);
            }
        }
    });

    // Listen for a broadcasted new chat message from the server
    socket.on("NEW_CHAT_MESSAGE", (data) => {
        //console.log("message data ",data)
        addChatMessage(data);
    });

    socket.on("sync_time", (data) => {
        setTimeUI(data)
    });

    socket.on("server_ended", () => {

        testMap.chunks = {};
        testMap.chunkBools = {};
        
        gameState = "player_status"
        togglePlayerStatusTable()

        // After 20 seconds, reload once
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    });
}