
function keyReleased() {


    if(keyCode == 27 && gameState != "pause" && gameState != "initial"){ //ESC
        gameState = "playing";
        pauseDiv.hide();
        invDiv.hide();
        player_status_container.hide();
        buildMode = false;
       
        renderGhost = false;
        
    }
    if(gameState == "playing"){
        if (keyCode === 82){ //r
            ghostBuild = createObject("Wall", 0, 0, 0, curPlayer.color, curPlayer.id, curPlayer.name);
            buildMode = !buildMode;
            renderGhost = buildMode;
        }
        if(keyCode == 73){ //i
            gameState = "inventory";
            updateItemList();
            invDiv.show();
        }
        if( (keyCode == 80 ||  keyCode ==27) && gameState != "initial"){ //p
            gameState = "pause";
            pauseDiv.show();

            pauseDiv.style("display", "flex")
        }

        if(keyCode == 9){ //TAB
            gameState = "player_status";
            player_status_container.show();
        }

        if (buildMode) { // Assuming buildMode is a boolean flag, yes it is
            buildDiv.show();

            renderBuildOptions();
            
            const option = buildOptions.find(opt => opt.key === keyCode);
            if (option) {

                ghostBuild = createObject(
                    option.objName, 0, 0, 0, 
                    curPlayer.color, curPlayer.id, curPlayer.name
                );

                renderBuildOptions();
            }
        } else {
            buildDiv.hide();
        }
     
    }
    else if(gameState == "inventory"){
        if (keyCode === 32) { //space
            curPlayer.invBlock.hotbarItem(curPlayer.invBlock.curItem, curPlayer.invBlock.selectedHotBar);
            updateSpaceBarDiv();
        }
        if(keyCode == 73){ //i
            gameState = "playing";
            invDiv.hide();
        }
    }

    else if (gameState =="pause") {
        if(keyCode == 80 || keyCode ==27){ //p or ESC
            gameState = "playing";
            pauseDiv.hide();
        }
    }

    else if(gameState == "player_status" ) {
        if(keyCode== 9) { //TAB
            gameState = "playing";
            player_status_container.hide();
        }
    }

    if(keyCode == 81 || keyCode == 69 ){  //e or q -should work in inventory and playing, so players can look at their wheel
        updatePlayerHotBarOffset()
    }
}

function keyPressed(){ //prevents normal key related actions
    if(keyCode == 27){ //ESC
        return false;
    }
    if(keyCode == 9){ //TAB
        return false;
    }
}

function mouseReleased(){
    if(gameState == "chating"){
        if(mouseX > 260 || mouseY < height-310){
            gameState = "playing";
            toggleChatDropdown();
        }
    }
    if(gameState != "playing") return;

    if(mouseButton === LEFT){
        //if you click on the player card, open the team select ui
        if(mouseX > width-530 && mouseX < width && mouseY > 0 && mouseY < 100){
            gameState = "team_select";
            teamPickDiv.show();
        }
    }

    let x = mouseX + camera.pos.x - width / 2;
    let y = mouseY + camera.pos.y - height / 2;
    let chunkPos = testMap.globalToChunk(x,y);
    let chunk = testMap.chunks[chunkPos.x + "," + chunkPos.y];
    if(!chunk?.objects) return
    for(let i = 0; i < chunk.objects.length; i++){
        if(chunk.objects[i].objName == "Door"){
            if(createVector(x,y).dist(chunk.objects[i].pos) < chunk.objects[i].size.h){
                if(chunk.objects[i].ownerName == curPlayer.name || chunk.objects[i].color == curPlayer.color){ //only team members and you can open your doors
                    if(chunk.objects[i].alpha == 255){
                        chunk.objects[i].alpha = 100;
                    }
                    else{
                        chunk.objects[i].alpha = 255;
                    }
                    let chunkPos = testMap.globalToChunk(chunk.objects[i].pos.x,chunk.objects[i].pos.y);
                    socket.emit("update_obj", {
                        cx: chunkPos.x, cy: chunkPos.y, 
                        objName: chunk.objects[i].objName, 
                        pos: {x: chunk.objects[i].pos.x, y: chunk.objects[i].pos.y}, 
                        z: chunk.objects[i].z, 
                        update_name: "alpha", 
                        update_value: chunk.objects[i].alpha
                    });
                }
            }
        }
    }
}

function continousMouseInput(){ //ran once every frame, good for anything like digging, or items
    if (mouseIsPressed) {
        //converts screen space to global space
        let x = mouseX + camera.pos.x - width / 2;
        let y = mouseY + camera.pos.y - height / 2;

        if (mouseButton === LEFT) {
            if(gameState == "playing"){
                if(!buildMode){
                    if(curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar] != ""){
                        curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].use(x, y, mouseButton);
                    }
                    else{
                        if (dirtInv < 150 - DIGSPEED) playerDig(x, y, DIGSPEED);
                        else dirtBagUI.shake = {intensity: dirtBagUI.shake.intensity + 0.1, length: 1};
                    }
                }
                else{
                    if(ghostBuild.openBool){
                        let hasCost = true;
                        for(let i=0; i<objDic[ghostBuild.objName].cost.length; i++){
                            if(objDic[ghostBuild.objName].cost[i][0] == "dirt"){
                                if(dirtInv < objDic[ghostBuild.objName].cost[i][1]){
                                    hasCost = false;
                                    i = objDic[ghostBuild.objName].cost.length+1;
                                }
                            }
                            else{ //assume item
                                if(curPlayer.invBlock.items[objDic[ghostBuild.objName].cost[i][0]] == undefined){
                                    hasCost = false;
                                    i = objDic[ghostBuild.objName].cost.length+1;
                                }
                                else{
                                    if(curPlayer.invBlock.items[objDic[ghostBuild.objName].cost[i][0]].amount < objDic[ghostBuild.objName].cost[i][1]){
                                        hasCost = false;
                                        i = objDic[ghostBuild.objName].cost.length+1;
                                    }
                                }
                            }
                        }
                        if(hasCost){
                            for(let i=0; i<objDic[ghostBuild.objName].cost.length; i++){
                                if(objDic[ghostBuild.objName].cost[i][0] == "dirt"){
                                    dirtInv -= objDic[ghostBuild.objName].cost[i][1];
                                }
                                else{
                                    curPlayer.invBlock.items[objDic[ghostBuild.objName].cost[i][0]].decreaseAmount(objDic[ghostBuild.objName].cost[i][1]);
                                }
                            }
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
                            if((chunk.objects[i].color == 11 && chunk.objects[i].ownerName == curPlayer.name) || (chunk.objects[i].color != 11 && chunk.objects[i].color == curPlayer.color)){ //only team members and you can delete your objects
                                socket.emit("delete_obj", {
                                    cx: chunkPos.x, cy: chunkPos.y, 
                                    objName: chunk.objects[i].objName, 
                                    pos: {x: chunk.objects[i].pos.x, y: chunk.objects[i].pos.y}, 
                                    z: chunk.objects[i].z
                                });
                                chunk.objects.splice(i,1);

                                i = chunk.objects.length+1;
                            }
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

function mouseWheel(event) {
    if(gameState != "playing") return
    if (event.delta > 0) {
      // Scrolled down
      hotBarOffset = -1
      mouseWheelMoved= true
    } else {
      // Scrolled up
      hotBarOffset = 1
      mouseWheelMoved = true
    }
    updatePlayerHotBarOffset()
    mouseWheelMoved = false
    return false
  }

  let hotBarOffset = null;
  let mouseWheelMoved = false



  function updatePlayerHotBarOffset(){

    if(gameState != "playing" && gameState != "inventory" ) return

    if(abs(curPlayer.invBlock.animationTimer) <= 0.1){
   
        if(keyCode == 81) hotBarOffset = -1;
        if(keyCode == 69) hotBarOffset = 1;
        let slot = curPlayer.invBlock.selectedHotBar + hotBarOffset;
        if(slot < 0) slot = 4;
        if(slot > 4) slot = 0;
        curPlayer.invBlock.selectedHotBar = slot;
        curPlayer.invBlock.animationTimer = hotBarOffset;

        if(curPlayer.invBlock.hotbar[slot] != ""){
            if(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[slot]].type == "Seed"){
                ghostBuild = createObject(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[slot]].plantName, 0, 0, 0, curPlayer.color, " ", " ");
                renderGhost = true; //this is seperate from buildMode, because this is a placable item, not something you can find in buildMode
            }
            else{
                renderGhost = false;
            }
        }
        else{
            renderGhost = false;
        }
        mouseWheelMoved = false
        updateSpaceBarDiv();
    }
  }