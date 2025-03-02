function keyReleased() {
    if(gameState == "playing"){
        if (keyCode === 82){ //r
            buildMode = !buildMode;
            renderGhost = buildMode;
        }
        if(keyCode == 73){ //i
            gameState = "inventory";
            updateItemList();
            invDiv.show();
        }
        if(keyCode == 27 || keyCode == 80){ //i
            gameState = "pause";
            pauseDiv.show();
        }

        if(keyCode == 9){ //i
            gameState = "player_status";
            player_status_container.show();
        }

        if(buildMode){ //replace this with the wheel at some point
            if (keyCode === 49) ghostBuild = createObject("Wall", 0, 0, 0, curPlayer.color, " ", " "); //1
            if (keyCode === 50) ghostBuild = createObject("Floor", 0, 0, 0, curPlayer.color, " ", " "); //2
            if (keyCode === 51) ghostBuild = createObject("Door", 0, 0, 0, curPlayer.color, " ", " "); //3
            if (keyCode === 52) ghostBuild = createObject("Rug", 0, 0, 0, curPlayer.color, " ", " "); //4
            if (keyCode === 53) ghostBuild = createObject("Mug", 0, 0, 0, curPlayer.color, " ", " "); //5
            if (keyCode === 54) ghostBuild = createObject("BearTrap", 0, 0, 0, curPlayer.color, " ", " "); //6
            if (keyCode === 55) ghostBuild = createObject("Turret", 0,0,0, curPlayer.obj, " ", " "); //8
            if (keyCode === 56) ghostBuild = createObject("PlacedBomb", 0,0,0, curPlayer.obj, " ", " "); //9
        }
    }
    else if(gameState == "inventory"){
        if (keyCode === 32) { //space
            curPlayer.invBlock.hotbarItem(curPlayer.invBlock.curItem, curPlayer.invBlock.selectedHotBar);
        }
        if(keyCode == 73){
            gameState = "playing";
            invDiv.hide();
        }
    }

    else if (gameState =="pause") {
      
        if(keyCode == 80 || keyCode ==27){
            gameState = "playing";
            pauseDiv.hide();
        }
    }

    else if(gameState == "player_status" ) {
        if(keyCode== 9) {

            gameState = "playing";
            player_status_container.hide();
        }
    }

    if(keyCode == 49 || keyCode == 51){  //1 or 3 -should work in inventory and playing, so players can look at their wheel
        if(abs(curPlayer.invBlock.animationTimer) <= 0.1){
            let offset = 0;
            if(keyCode == 49) offset = -1;
            if(keyCode == 51) offset = 1;
            let slot = curPlayer.invBlock.selectedHotBar + offset;
            if(slot < 0) slot = 4;
            if(slot > 4) slot = 0;
            curPlayer.invBlock.selectedHotBar = slot;
            curPlayer.invBlock.animationTimer = offset;

            if(curPlayer.invBlock.hotbar[slot] != ""){
                if(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[slot]].type == "Seed"){
                    ghostBuild = createObject(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[slot]].plantName, 0, 0, 0, curPlayer.color, " ", " ");
                    renderGhost = true;
                }
                else{
                    renderGhost = false;
                }
            }
            else{
                renderGhost = false;
            }

            updateSpaceBarDiv();
        }
    }
}

function mouseReleased(){
    if(gameState != "playing") return;


    let x = mouseX + camera.x - width / 2;
    let y = mouseY + camera.y - height / 2;
    let chunkPos = testMap.globalToChunk(x,y);
    let chunk = testMap.chunks[chunkPos.x + "," + chunkPos.y]
    if(!chunk?.objects) return
    for(let i = 0; i < chunk.objects.length; i++){
        if(chunk.objects[i].type == "door"){ //TODO: Change this so doors work again, might have to make a custom object
            if(createVector(x,y).dist(chunk.objects[i].pos) < chunk.objects[i].size.h){
                chunk.objects[i].open = !chunk.objects[i].open;
                let chunkPos = testMap.globalToChunk(chunk.objects[i].pos.x,chunk.objects[i].pos.y);
                socket.emit("update_obj", {
                    cx: chunkPos.x, cy: chunkPos.y, 
                    type: chunk.objects[i].type, 
                    pos: {x: chunk.objects[i].pos.x, y: chunk.objects[i].pos.y}, 
                    z: chunk.objects[i].z, 
                    update_name: "open", 
                    update_value: chunk.objects[i].open
                });
            }
        }
    }
}

function continousMouseInput(){ //ran once every frame, good for anything like digging, or items
    if (mouseIsPressed) {
        //converts screen space to global space
        let x = mouseX + camera.x - width / 2;
        let y = mouseY + camera.y - height / 2;

        if (mouseButton === LEFT) {
            if(gameState == "playing"){
                if(!buildMode){
                    if(curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar] != ""){
                        curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].use(x, y, mouseButton);
                    }
                    else{
                        if (dirtInv < 150 - DIGSPEED) playerDig(x, y, DIGSPEED);
                    }
                }
                else{
                    if(ghostBuild.openBool){
                        let chunkPos = testMap.globalToChunk(x,y);
                        let temp = createObject(ghostBuild.objName, ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, ghostBuild.color, curPlayer.id, curPlayer.name);
                        testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.push(temp);
                        testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.sort((a,b) => a.z - b.z);
                        socket.emit("new_object", {
                            cx: chunkPos.x, 
                            cy: chunkPos.y, 
                            obj: temp
                        });
    
                        curPlayer.animationCreate("put");
                        socket.emit("update_pos", curPlayer);
                    }
                }
            }
            else if(gameState == "inventory"){
                //might add a way to mess with your hotbar in here, like spin it, or quick select the item from the hotbar
            }
        }
        if (mouseButton === RIGHT) {
            if(gameState == "playing"){
                if(!buildMode){
                    if(curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar] != ""){
                        curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].use(x, y, mouseButton);
                    }
                    else{
                        if (dirtInv > DIGSPEED) playerDig(x, y, -DIGSPEED);
                    }
                }
                else{
                    let chunkPos = testMap.globalToChunk(x,y);
                    let chunk = testMap.chunks[chunkPos.x + "," + chunkPos.y];
                    for(let i = 0; i < chunk.objects.length; i++){
                        if(createVector(x,y).dist(chunk.objects[i].pos) < (chunk.objects[i].size.w+chunk.objects[i].size.h)/2){
                            socket.emit("delete_obj", {
                                cx: chunkPos.x, cy: chunkPos.y, 
                                type: chunk.objects[i].type, 
                                pos: {x: chunk.objects[i].pos.x, y: chunk.objects[i].pos.y}, 
                                z: chunk.objects[i].z
                            });
                            chunk.objects.splice(i,1);
                        }
                    }
                }
            }
            else if(gameState == "inventory"){

            }
        }
    }
}

function continousKeyBoardInput(){
    if(gameState == "playing"){
        // default all keys to false
        curPlayer.holding = { w: false, a: false, s: false, d: false };

        // Player controls
        if (keyIsDown(87)) curPlayer.holding.w = true; // W
        if (keyIsDown(65)) curPlayer.holding.a = true; // A
        if (keyIsDown(83)) curPlayer.holding.s = true; // S
        if (keyIsDown(68)) curPlayer.holding.d = true; // D

        if (
            lastHolding.w !== curPlayer.holding.w ||
            lastHolding.a !== curPlayer.holding.a ||
            lastHolding.s !== curPlayer.holding.s ||
            lastHolding.d !== curPlayer.holding.d
        ) {
            socket.emit("update_pos", curPlayer);
        }
    }
    else if(gameState == "inventory"){
        if (keyIsDown(87)){} //W
        if (keyIsDown(65)){} //A
        if (keyIsDown(83)){} //S
        if (keyIsDown(68)){} //D
    }
}