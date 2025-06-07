var isChatting = false
var lastGameState = "initial";

function getIsChatting() {
    //console.log("get is chatting ", isChatting)
    isChatting = (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA'));
    //console.log("isChatting ", isChatting)
    return isChatting;
}

function keyReleased() {
    if(keyCode == 27 && gameState != "pause" && gameState != "initial" && gameState != "race_selection"){ //ESC
        gameState = "playing";
        pauseDiv.hide();
        invDiv.hide();
        spaceBarDiv.hide();
        player_status_container.hide();
        craftDiv.hide();
        teamPickDiv.hide();
        curPlayer.otherInv = undefined;
        buildMode = false;
       
        renderGhost = false;
        if(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].type == "Seed"){
            ghostBuild = createObject(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].plantName, 0, 0, 0, curPlayer.color, " ", " ");
            renderGhost = true;
        }
        
    }
    if(gameState == "playing"){
        if (keyCode === Controls_Build_code){ //r
            ghostBuild = createObject("Wall", 0, 0, 0, 0, curPlayer.id, curPlayer.name);
            buildMode = !buildMode;
            renderGhost = buildMode;

            if(!buildMode){
                if(curPlayer.invBlock.selectedHotBar > 4){
                    curPlayer.invBlock.selectedHotBar = 4;
                }
                if(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].type == "Seed"){
                    ghostBuild = createObject(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].plantName, 0, 0, 0, curPlayer.color, " ", " ");
                    renderGhost = true;
                }
            }
        }
        if(keyCode == Controls_Inventory_code){ //i
            gameState = "inventory";
            curPlayer.invBlock.curItem = "";
            updateItemList();
            updatecurItemDiv();
            invDiv.show();
            
            curPlayer.holding = { w: false, a: false, s: false, d: false };
        }
        if(keyCode == Controls_Crafting_code){ //c
            gameState = "crafting";
            curPlayer.invBlock.curItem = "";
            updateCraftList();
            updatecurCraftItemDiv();
            craftDiv.show();
            
            curPlayer.holding = { w: false, a: false, s: false, d: false };
        }
        if( (keyCode == Controls_Pause_code ||  keyCode ==27) && gameState != "initial"){ //p
            gameState = "pause";
            pauseDiv.show();

            pauseDiv.style("display", "flex")
        }

        if(keyCode == 9){ //TAB
            gameState = "player_status";
            togglePlayerStatusTable();
        }

        if (buildMode) { // Assuming buildMode is a boolean flag, yes it is
            buildDiv.show();

            renderBuildOptions();
            
            const option = buildOptions.find(opt => opt.key === keyCode);
            if (option) {

                ghostBuild = createObject(
                    option.objName, 0, 0, 0, 
                    0, curPlayer.id, curPlayer.name
                );

                renderBuildOptions();
            }
        } else {
            buildDiv.hide();
        }

        if(keyCode == Controls_Interact_code){ //f
            let mouseVec = createVector(mouseX + camera.pos.x - (width / 2), mouseY + camera.pos.y - (height / 2));
            let chunkPos = testMap.globalToChunk(mouseVec.x,mouseVec.y);
            let chunk = testMap.chunks[chunkPos.x + "," + chunkPos.y];
            let closest;
            let closestDist;

            for(let i = 0; i < chunk.objects.length; i++){
                if(chunk.objects[i].type == "InvObj" || (chunk.objects[i].type == "Plant" && chunk.objects[i].stage == (objImgs[chunk.objects[i].imgNum].length-1)) || chunk.objects[i].objName == "Door"){
                    if(chunk.objects[i].pos.dist(curPlayer.pos) < 4*TILESIZE){
                        if(closest == undefined){
                            closest = chunk.objects[i];
                            closestDist = mouseVec.dist(closest.pos);
                        }
                        else if (mouseVec.dist(chunk.objects[i].pos) < closestDist){
                            closest = chunk.objects[i];
                            closestDist = mouseVec.dist(closest.pos);
                        }
                    }
                }
            }
            if(closest != undefined){
                if(closestDist < 2*TILESIZE){
                    if(closest.type == "InvObj"){
                        closest.useInv();
                    }
                    else if(closest.type == "Plant"){
                        closest.usePlant();
                    }
                    else if(closest.objName == "Door"){
                        closest.useDoor();
                    }
                }
                else{
                    let chunkPos = testMap.globalToChunk(curPlayer.pos.x,curPlayer.pos.y);
                    let chunk = testMap.chunks[chunkPos.x + "," + chunkPos.y];
                    closest = undefined;
                    for(let i = 0; i < chunk.objects.length; i++){
                        if(chunk.objects[i].type == "InvObj" || (chunk.objects[i].type == "Plant" && chunk.objects[i].stage == (objImgs[chunk.objects[i].imgNum].length-1)) || chunk.objects[i].objName == "Door"){
                            if(closest == undefined){
                                closest = chunk.objects[i];
                                closestDist = curPlayer.pos.dist(closest.pos);
                            }
                            if (curPlayer.pos.dist(chunk.objects[i].pos) < closestDist){
                                closest = chunk.objects[i];
                                closestDist = curPlayer.pos.dist(closest.pos);
                            }
                        }
                    }

                    if(closestDist < 4*TILESIZE){
                        if(closest.type == "InvObj"){
                            closest.useInv();
                        }
                        else if(closest.type == "Plant"){
                            closest.usePlant();
                        }
                        else if(closest.objName == "Door"){
                            closest.useDoor();
                        }
                    }
                }
            }
        }
     
    }
    else if(gameState == "inventory"){

        curPlayer.holding = { w: false, a: false, s: false, d: false };
        if (keyCode === Controls_Space_code) { //space
            curPlayer.invBlock.hotbarItem(curPlayer.invBlock.curItem, curPlayer.invBlock.selectedHotBar);
            updateSpaceBarDiv();
        }
        if(keyCode == Controls_Inventory_code){ //i
            gameState = "playing";
            invDiv.hide();
            spaceBarDiv.hide();
            if(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].type == "Seed"){
                ghostBuild = createObject(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[curPlayer.invBlock.selectedHotBar]].plantName, 0, 0, 0, curPlayer.color, " ", " ");
                renderGhost = true;
            }
        }
        if(keyCode == Controls_Crafting_code){ //c
            gameState = "crafting";
            craftDiv.show();
            curPlayer.invBlock.curItem = "";
            updateCraftList();
            invDiv.hide();
            spaceBarDiv.hide();
        }
    }
    else if(gameState == "crafting"){

        curPlayer.holding = { w: false, a: false, s: false, d: false };
        if (keyCode === Controls_Space_code) { //space
            //check cost
            //add item to inv
        }
        if(keyCode == Controls_Crafting_code){ //c
            gameState = "playing";
            craftDiv.hide();
        }
        if(keyCode == Controls_Inventory_code){ //i
            gameState = "inventory";
            invDiv.show();
            curPlayer.invBlock.curItem = "";
            updateItemList();
            craftDiv.hide();
        }
    }
    else if(gameState == "swap_inv"){
        if (keyCode === Controls_Space_code) { //space
            if(keyIsDown(16)){
                if(curPlayer.invBlock.curItem != ""){
                    curPlayer.otherInv.invBlock.addItem(curPlayer.invBlock.curItem, curPlayer.invBlock.items[curPlayer.invBlock.curItem].amount, false);
                    curPlayer.invBlock.decreaseAmount(curPlayer.invBlock.curItem, curPlayer.invBlock.items[curPlayer.invBlock.curItem].amount);
    
                    curPlayer.otherInv.invBlock.curItem = curPlayer.invBlock.curItem;
                    curPlayer.invBlock.curItem = "";
                }
                else if(curPlayer.otherInv.invBlock.curItem != ""){
                    curPlayer.invBlock.addItem(curPlayer.otherInv.invBlock.curItem, curPlayer.otherInv.invBlock.items[curPlayer.otherInv.invBlock.curItem].amount, true);
                    curPlayer.otherInv.invBlock.decreaseAmount(curPlayer.otherInv.invBlock.curItem, curPlayer.otherInv.invBlock.items[curPlayer.otherInv.invBlock.curItem].amount);
    
                    curPlayer.invBlock.curItem = curPlayer.otherInv.invBlock.curItem;
                    curPlayer.otherInv.invBlock.curItem = "";
                }
            }
            else{
                if(curPlayer.invBlock.curItem != ""){
                    //console.log(curPlayer.otherInv);
                    curPlayer.otherInv.invBlock.addItem(curPlayer.invBlock.curItem, 1, false);
                    curPlayer.invBlock.decreaseAmount(curPlayer.invBlock.curItem,1);
    
                    if(curPlayer.invBlock.items[curPlayer.invBlock.curItem] == undefined){
                        curPlayer.otherInv.invBlock.curItem = curPlayer.invBlock.curItem;
                        curPlayer.invBlock.curItem = "";
                    }
                }
                else if(curPlayer.otherInv.invBlock.curItem != ""){
                    curPlayer.invBlock.addItem(curPlayer.otherInv.invBlock.curItem, 1, true);
                    curPlayer.otherInv.invBlock.decreaseAmount(curPlayer.otherInv.invBlock.curItem, 1);
    
                    if(curPlayer.otherInv.invBlock.items[curPlayer.otherInv.invBlock.curItem] == undefined){
                        curPlayer.invBlock.curItem = curPlayer.otherInv.invBlock.curItem;
                        curPlayer.otherInv.invBlock.curItem = "";
                    }
                }
            }

            let chunkPos = testMap.globalToChunk(curPlayer.otherInv.pos.x,curPlayer.otherInv.pos.y);
            socket.emit("update_inv", {
                cx: chunkPos.x, cy: chunkPos.y, 
                objName: curPlayer.otherInv.objName, 
                pos: {x: curPlayer.otherInv.pos.x, y: curPlayer.otherInv.pos.y}, 
                z: curPlayer.otherInv.z,
                items: curPlayer.otherInv.invBlock.items
            });
            updateSwapItemLists(curPlayer.otherInv.invBlock);
            updatecurSwapItemDiv(curPlayer.otherInv.invBlock);
        }
        if(keyCode == Controls_Inventory_code){ //i
            gameState = "playing";
            swapInvDiv.hide();
            spaceBarDiv.hide();
            curPlayer.otherInv = undefined;
        }
        if(keyCode == 16){ //Shift
            updateSpaceBarDiv();
        }
    }

    else if (gameState =="pause") {
        if(keyCode == Controls_Pause_code || keyCode ==27){ //p or ESC
            gameState = "playing";
            pauseDiv.hide();
        }

        curPlayer.holding = { w: false, a: false, s: false, d: false };
    }

    else if(gameState == "player_status" ) {
        if(keyCode== 9) { //TAB
            gameState = "playing";
            togglePlayerStatusTable()

        }else {

            curPlayer.holding = { w: false, a: false, s: false, d: false };
        }
    }

    else if (gameState == "controls") {
        if (keyCode == 27) { // ESC
            control_set = 0;
            Controls_Up_button.style("background-color", "var(--color-dirt-dark)");
            Controls_Left_button.style("background-color", "var(--color-dirt-dark)");
            Controls_Down_button.style("background-color", "var(--color-dirt-dark)");
            Controls_Right_button.style("background-color", "var(--color-dirt-dark)");
            Controls_Interact_button.style("background-color", "var(--color-dirt-dark)");
            Controls_Inventory_button.style("background-color", "var(--color-dirt-dark)");
            Controls_Crafting_button.style("background-color", "var(--color-dirt-dark)");
            Controls_Pause_button.style("background-color", "var(--color-dirt-dark)");
            Controls_MoveHotBarRight_button.style("background-color", "var(--color-dirt-dark)");
            Controls_MoveHotBarLeft_button.style("background-color", "var(--color-dirt-dark)");
            Controls_Build_button.style("background-color", "var(--color-dirt-dark)");
            return;
        }

        key = keyToVisualKey(key);
        if (control_set == 1 && key != lastKey){
            Controls_move_Up_code = keyCode;
            Controls_Up_key = key;
            control_set = 0;
            Controls_Up_button.html(Controls_Up_key);
            Controls_Up_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 2 && key != lastKey){
            Controls_move_Left_code = keyCode;
            Controls_Left_key = key;
            control_set = 0;
            Controls_Left_button.html(Controls_Left_key);
            Controls_Left_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 3 && key != lastKey){
            Controls_move_Down_code = keyCode;
            Controls_Down_key = key;
            control_set = 0;
            Controls_Down_button.html(Controls_Down_key);
            Controls_Down_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 4 && key != lastKey){
            Controls_move_Right_code = keyCode;
            Controls_Right_key = key;
            control_set = 0;
            Controls_Right_button.html(Controls_Right_key);
            Controls_Right_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if(control_set == 5 && key != lastKey){
            Controls_Interact_code = keyCode;
            Controls_Interact_key = key;
            control_set = 0;
            Controls_Interact_button.html(Controls_Interact_key);
            Controls_Interact_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 6 && key != lastKey){
            Controls_Inventory_code = keyCode;
            Controls_Inventory_key = key;
            control_set = 0;
            Controls_Inventory_button.html(Controls_Inventory_key);
            Controls_Inventory_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 7 && key != lastKey){
            Controls_Crafting_code = keyCode;
            Controls_Crafting_key = key;
            control_set = 0;
            Controls_Crafting_button.html(Controls_Crafting_key);
            Controls_Crafting_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 8 && key != lastKey){
            Controls_Pause_code = keyCode;
            Controls_Pause_key = key;
            control_set = 0;
            Controls_Pause_button.html(Controls_Pause_key);
            Controls_Pause_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 9 && key != lastKey){
            Controls_MoveHotBarRight_code = keyCode;
            Controls_MoveHotBarRight_key = key;
            control_set = 0;
            Controls_MoveHotBarRight_button.html(Controls_MoveHotBarRight_key);
            Controls_MoveHotBarRight_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 10 && key != lastKey){
            Controls_MoveHotBarLeft_code = keyCode;
            Controls_MoveHotBarLeft_key = key;
            control_set = 0;
            Controls_MoveHotBarLeft_button.html(Controls_MoveHotBarLeft_key);
            Controls_MoveHotBarLeft_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 11 && key != lastKey){
            Controls_Build_code = keyCode;
            Controls_Build_key = key;
            control_set = 0;
            Controls_Build_button.html(Controls_Build_key);
            Controls_Build_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
        else if (control_set == 12 && key != lastKey){
            Controls_Space_code = keyCode;
            Controls_Space_key = key;
            control_set = 0;
            Controls_Space_button.html(Controls_Space_key);
            Controls_Space_button.style("background-color", "var(--color-dirt-dark)");
            //saveOptions();
        }
    }

    if(keyCode == Controls_MoveHotBarLeft_code || keyCode == Controls_MoveHotBarRight_code ){  //e or q -should work in inventory and playing, so players can look at their wheel
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
    if (keyCode === 13 && isChatting) { // 13 = Enter
        //console.log("dd");
        blurActiveElement();
        isChatting = false
        return false; // prevent default enter behavior (like form submit)
    }
    if(keyCode == 16){ //Shift
        updateSpaceBarDiv();
    }
}
function blurActiveElement() {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        document.activeElement.blur();
    }
}

function mouseReleased(){

    if(gameState == "chating"){
        // remove chatting if clicked out side of bounds 
        if(!getIsChatting()){
            blurActiveElement();
            gameState = lastGameState;
        }
    }
    if(gameState != "playing") return;

    if(mouseButton === LEFT){
        //if you click on the player card, open the team select ui
        if(mouseX > width-530 && mouseX < width && mouseY > 0 && mouseY < 50){
            gameState = "team_select";
            teamPickDiv.show();
        }
    }
}

function continousMouseInput(){ //ran once every frame, good for anything like digging, or items

    if(isChatting || isElementVisible(pauseDiv)) return
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
                        if (dirtInv < maxDirtInv - DIGSPEED) playerDig(x, y, DIGSPEED);
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
                                    curPlayer.invBlock.decreaseAmount(objDic[ghostBuild.objName].cost[i][0], objDic[ghostBuild.objName].cost[i][1]);
                                }
                            }
                            let chunkPos = testMap.globalToChunk(x,y);
                            let temp = createObject(ghostBuild.objName, ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, curPlayer.color, curPlayer.id, curPlayer.name);
                            testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.push(temp);
                            testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.sort((a,b) => a.z - b.z);
                            socket.emit("new_object", {
                                cx: chunkPos.x, 
                                cy: chunkPos.y, 
                                obj: temp
                            });
        
                            //play placing_structure sound and tell server
                            let temp2 = new SoundObj("placing_structure.ogg", x, y);
                            testMap.chunks[chunkPos.x+","+chunkPos.y].soundObjs.push(temp2);
                            socket.emit("new_sound", {sound: "placing_structure.ogg", cPos: chunkPos, pos:{x: x, y: y}, id: temp.id});
                            curPlayer.animationCreate("put");
                            socket.emit("update_player", {
                                id: curPlayer.id,
                                pos: curPlayer.pos,
                                holding: curPlayer.holding,
                                update_names: ["animationType","animationFrame"],
                                update_values: [curPlayer.animationType,curPlayer.animationFrame]
                            });

                            renderBuildOptions();
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
                            if((chunk.objects[i].color == 0 && chunk.objects[i].ownerName == curPlayer.name) || (chunk.objects[i].color != 0 && chunk.objects[i].color == curPlayer.color)){ //only team members and you can delete your objects
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
function isElementVisible(el) {
    return el && el.style("display") !== "none";
}


function continousKeyBoardInput(){
    if(getIsChatting() || isElementVisible(pauseDiv)) return
    if(gameState == "playing"){
        // default all keys to false
        curPlayer.holding = { w: false, a: false, s: false, d: false };

        // Player controls
        if (keyIsDown(Controls_move_Up_code)) curPlayer.holding.w = true; // W
        if (keyIsDown(Controls_move_Left_code)) curPlayer.holding.a = true; // A
        if (keyIsDown(Controls_move_Down_code)) curPlayer.holding.s = true; // S
        if (keyIsDown(Controls_move_Right_code)) curPlayer.holding.d = true; // D

        if (
            lastHolding.w !== curPlayer.holding.w ||
            lastHolding.a !== curPlayer.holding.a ||
            lastHolding.s !== curPlayer.holding.s ||
            lastHolding.d !== curPlayer.holding.d
        ) {
            socket.emit("update_pos", {
                id: curPlayer.id,
                pos: curPlayer.pos,
                holding: curPlayer.holding
            });
        }
    }
    else if(gameState == "inventory"){
        if (keyIsDown(Controls_move_Up_code)){} //W
        if (keyIsDown(Controls_move_Left_code)){} //A
        if (keyIsDown(Controls_move_Down_code)){} //S
        if (keyIsDown(Controls_move_Right_code)){} //D
    }else {
        if(curPlayer ) {
            curPlayer.holding = { w: false, a: false, s: false, d: false };
        }
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
   
        if(keyCode == Controls_MoveHotBarLeft_code) hotBarOffset = -1;
        if(keyCode == Controls_MoveHotBarRight_code) hotBarOffset = 1;
        let slot = curPlayer.invBlock.selectedHotBar + hotBarOffset;
        if(!buildMode){
            if(slot < 0) slot = 4;
            if(slot > 4) slot = 0;
        }
        else{
            if(slot < 0) slot = 10;
            if(slot > 10) slot = 0;
        }
        curPlayer.invBlock.selectedHotBar = slot;
        curPlayer.invBlock.animationTimer = hotBarOffset;

        if(!buildMode){
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
        }
        else{
            ghostBuild = createObject(buildOptions[curPlayer.invBlock.selectedHotBar].objName, 0, 0, 0, curPlayer.color, curPlayer.id, curPlayer.name);
            renderBuildOptions();
        }
        mouseWheelMoved = false
        updateSpaceBarDiv();
    }
  }



var Controls_Up_key = 'w';
var Controls_Left_key = 'a';
var Controls_Down_key = 's';
var Controls_Right_key = 'd';
var Controls_Interact_key = 'f';
var Controls_Inventory_key = 'i';
var Controls_Crafting_key = 'c';
var Controls_Pause_key = 'p';
var Controls_MoveHotBarRight_key = 'e';
var Controls_MoveHotBarLeft_key = 'q';
var Controls_Build_key = 'r';
var Controls_Space_key = ' ';

var Controls_move_Up_code = 87;       //w
var Controls_move_Left_code = 65;     //a
var Controls_move_Down_code = 83;     //s
var Controls_move_Right_code = 68;    //d
var Controls_Interact_code = 70;   //f
var Controls_Inventory_code = 73;  //i
var Controls_Crafting_code = 67;   //c
var Controls_Pause_code = 80;           //p
var Controls_MoveHotBarRight_code = 69;  //e
var Controls_MoveHotBarLeft_code = 81;   //q
var Controls_Build_code = 82;           //r
var Controls_Space_code = 32;           //space

var control_set = 0;
var lastKey = '!';
