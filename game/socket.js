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

        // Handle traps
        for (let i = 0; i < data.traps.length; i++) {
            let nt = data.traps[i];
            traps.push(new Trap(nt.x, nt.y, 10, nt.ownerId, nt.color, nt.ownerName));
        }
    });

    socket.on('YOUR_ID', (data) => {
        curPlayer = new Player(
            random(-200*TILESIZE, 200*TILESIZE),
            random(-200*TILESIZE, 200*TILESIZE),
            100,
            data.id,
            data.color,
            0,
            ''
        ); // Default race index 0

        camera.x = curPlayer.pos.x;
        camera.y = curPlayer.pos.y;

        //load in some chunks for easy start
        let chunkPos = testMap.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
        for(let yOff = -2; yOff < 3; yOff++){
            for(let xOff = -2; xOff < 3; xOff++){
                testMap.getChunk(chunkPos.x + xOff,chunkPos.y + yOff);
            }
        }
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
            players[data.id].hp = data.hp;
            players[data.id].holding = data.holding;
        }
    });

    socket.on("UPDATE_NODE", (data) => {
        if(testMap.chunks[data.chunkPos] != undefined) testMap.chunks[data.chunkPos].data[data.index] = data.val;
    });

    socket.on('REMOVE_PLAYER', (data) => {
        delete players[data];
    });

    socket.on('spawn_trap', (data) => {
        let newT = new Trap(
            data.x,
            data.y,
            10,
            data.ownerId,
            data.color,
            data.ownerName
        );
        traps.push(newT);
    });

    socket.on("NEW_OBJECT", (data) => {
        let chunk = testMap.chunks[data.cx+","+data.cy];
        let temp = new Placeable(data.pos.x, data.pos.y, data.rot);
        chunk.objects.push(temp);
    })

    socket.on("use_trap", (data) => {
        //hit a player
        //does damage add damager to the player
    });

    socket.on("GIVE_CHUNK", (data) => {
        testMap.chunks[data.x+","+data.y] = new Chunk(data.x, data.y);
        let keys = Object.keys(data.data);
        for(let i=0; i<keys.length; i++) testMap.chunks[data.x+","+data.y].data[keys[i]] = data.data[keys[i]];
        testMap.chunkBools[data.x+","+data.y] = true;
        //console.log(data.objects);
        for(let i=0; i<data.objects.length; i++) testMap.chunks[data.x+","+data.y].objects.push(new Placeable(data.objects[i].pos.x, data.objects[i].pos.y, data.objects[i].rot));
    });
}