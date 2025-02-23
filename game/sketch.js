/*******************************************************
 * Globals (unchanged)
 *******************************************************/
let gameState = "initial";
let testMap; // your Map object
var lastHolding;
var projectiles = [];
var collisionChecks = [];
var raceSelected = false;
var nameEntered = false;
var raceButtons = []; // now storing "card" divs instead of p5 buttons
var goButton;
var nameInput;
var keyReleasedFlag = false;
const races = ["gnome", "aylah", "skizzard"];

var camera = { x: 0, y: 0 };
var Debuging = true;
var dirtInv = 0;
var buildMode = false;
var renderGhost = false;
var wantRotate = true;
var ghostBuild;
var DIGSPEED = 0.04;


function setup() {
    // Create a responsive canvas
    let cnv = createCanvas(innerWidth - 10, innerHeight - 8);
    cnv.parent("canvas-container");
    noSmooth();
    background(220);
    angleMode(DEGREES);
  
    // Prevent right-click context menu on p5.js canvases
    const canvases = document.getElementsByClassName("p5Canvas");
    for (let element of canvases) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  
    setupUI()
  }
  


   
  function windowResized() {
    resizeCanvas(innerWidth - 10, innerHeight - 8);
    updateResponsiveDesign();
  }

function draw() {
    background("#7F3F00"); //old color is 71413B

    if(gameState == "initial") {
        console.log("restart")
        renderServerBrowser();
        renderLinks()
    }
    else if (gameState === "race_selection") {
        drawSelection()
        renderLinks()
    }
    
    if (gameState === "playing") {
        hideRaceSelect()
        hideLinks()
        // ---- (Your original gameplay code) ----
        if (curPlayer) {
            camera.x = curPlayer.pos.x;
            camera.y = curPlayer.pos.y;
        }

        if (Object.keys(testMap.chunks).length > 0) {
            testMap.render();
            testMap.update();
        }

        if (curPlayer) {
            curPlayer.render();
            curPlayer.update();
            if(renderGhost){
                ghostBuild.pos.x = mouseX + camera.x - width / 2;
                ghostBuild.pos.y = mouseY + camera.y - height / 2;
                if(ghostBuild.canRotate & wantRotate){
                    ghostBuild.rot = ghostBuild.pos.copy().sub(curPlayer.pos).heading();
                }
                ghostBuild.ghostRender(createVector(ghostBuild.pos.x,ghostBuild.pos.y).dist(curPlayer.pos) < 200);
            }
        }

        let keys = Object.keys(players);
        for (let i = 0; i < keys.length; i++) {
            if(curPlayer){
                if(players[keys[i]].pos.dist(curPlayer.pos) < TILESIZE*CHUNKSIZE*2){
                    players[keys[i]].render();
                    players[keys[i]].update();
                }
            }
        }

        if (curPlayer) {
            lastHolding = curPlayer.holding;

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

        curPlayer.invBlock.renderHotBar();

        // Dirt Inventory
        push();
        image(dirtBagImg, width - 180 - 10, height - 186 - 10, 180, 186);
        
        fill("#70443C");
        rect(width - 180 + 20, height - 186 + 25 + (120 * (1-(dirtInv/150))), 120, 120 * (dirtInv/150));
        pop();

        // Digging logic
        if (mouseIsPressed) {
            let x = mouseX + camera.x - width / 2;
            let y = mouseY + camera.y - height / 2;

            if (mouseButton === LEFT) {
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
            if (mouseButton === RIGHT) {
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
                            socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, type: chunk.objects[i].type, pos: {x: chunk.objects[i].pos.x, y: chunk.objects[i].pos.y}, z: chunk.objects[i].z});
                            chunk.objects.splice(i,1);
                        }
                    }
                }
            }
        }
    }
}

/*******************************************************
 * checkName() - same as your code
 *******************************************************/
function checkName() {
    if (nameInput.value().length > 0) {
        nameEntered = true;
    } else {
        nameEntered = false;
    }
}

function flipImage(img) {
    let flippedImg = createGraphics(img.width, img.height);
    flippedImg.scale(-1, 1);
    flippedImg.image(img, -img.width, 0);
    return flippedImg;
}

function keyReleased() {
    if (keyCode === 32 && !keyReleasedFlag) {
        // Spacebar released
        

        keyReleasedFlag = true;
    }

    if (keyCode === 82){ //r
        buildMode = !buildMode;
        renderGhost = buildMode;
    }

    if(buildMode){
        if (keyCode === 49){ //1
            ghostBuild = createObject("Wall", 0, 0, 0, curPlayer.color, " ", " ");
        }
    
        if (keyCode === 50){ //2
            ghostBuild = createObject("Floor", 0, 0, 0, curPlayer.color, " ", " ");
        }
    
        if (keyCode === 51){ //3
            ghostBuild = createObject("Door", 0, 0, 0, curPlayer.color, " ", " ");
        }
    
        if (keyCode === 52){ //4
            ghostBuild = createObject("Rug", 0, 0, 0, curPlayer.color, " ", " ");
        }
    
        if (keyCode === 53){ //5
            ghostBuild = createObject("Mug", 0, 0, 0, curPlayer.color, " ", " ");
        }
    
        if (keyCode === 54){ //6
            ghostBuild = createObject("BearTrap", 0, 0, 0, curPlayer.color, " ", " ");
        }
    
        if (keyCode === 55){ //8
            ghostBuild = createObject("Turret", 0,0,0, curPlayer.obj, " ", " ");
        }
    
        if (keyCode === 56){ //9
            ghostBuild = createObject("PlacedBomb", 0,0,0, curPlayer.obj, " ", " ");
        }
    }

    if(keyCode >= 48 && keyCode <= 58){  //0-9
        // convert key to slot
        if(key == 0) key = 5;
        key --;
        let slot = key%5;
        curPlayer.invBlock.selectedHotBar = slot;

        if(curPlayer.invBlock.hotbar[slot] != ""){
            if(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[slot]].type == "Seed"){
                ghostBuild = createObject(curPlayer.invBlock.items[curPlayer.invBlock.hotbar[slot]].plantName, 0, 0, 0, curPlayer.color, " ", " ");
                renderGhost = true;
            }
        }
        else{
            renderGhost = false;
        }
    }
}

function keyPressed() {
    if (keyCode === 32) {
        keyReleasedFlag = false;
    }
}

function mouseReleased(){
    if(gameState != "playing") return


    let x = mouseX + camera.x - width / 2;
    let y = mouseY + camera.y - height / 2;
    let chunkPos = testMap.globalToChunk(x,y);
    let chunk = testMap.chunks[chunkPos.x + "," + chunkPos.y]
    if(!chunk?.objects) return
    for(let i = 0; i < chunk.objects.length; i++){
        if(chunk.objects[i].type == "door"){
            if(createVector(x,y).dist(chunk.objects[i].pos) < chunk.objects[i].size.h){
                chunk.objects[i].open = !chunk.objects[i].open;
                let chunkPos = testMap.globalToChunk(chunk.objects[i].pos.x,chunk.objects[i].pos.y);
                socket.emit("update_obj", {cx: chunkPos.x, cy: chunkPos.y, type: chunk.objects[i].type, pos: {x: chunk.objects[i].pos.x, y: chunk.objects[i].pos.y}, z: chunk.objects[i].z, update_name: "open", update_value: chunk.objects[i].open});
            }
        }
    }
}

function playerDig(x,y, amount){
    let ray = createVector(x-curPlayer.pos.x, y-curPlayer.pos.y);

    let digSpot = cast(curPlayer.pos.x, curPlayer.pos.y, ray.heading(), (amount < 0));
    if(digSpot != undefined){
        dig(((digSpot.cx*CHUNKSIZE+digSpot.x)*TILESIZE), ((digSpot.cy*CHUNKSIZE+digSpot.y)*TILESIZE), amount);
        
        //2 extra digs to make a better path for walking
        let digSpot2;
        let digSpot3;
        
        if(abs(ray.heading()) >= 0 && abs(ray.heading()) <= 22.5){
            digSpot2 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x, y: digSpot.y+1};
            digSpot3 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x, y: digSpot.y-1};
        }
        else if(abs(ray.heading()) > 22.5 && abs(ray.heading()) <= 67.5){
            if(ray.heading() > 0){
                digSpot2 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x-1, y: digSpot.y+1};
                digSpot3 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x+1, y: digSpot.y-1};
            }
            else{
                digSpot2 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x-1, y: digSpot.y-1};
                digSpot3 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x+1, y: digSpot.y+1};
            }
        }
        else if(abs(ray.heading()) > 67.5 && abs(ray.heading()) <= 112.5){
            digSpot2 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x-1, y: digSpot.y};
            digSpot3 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x+1, y: digSpot.y};
        }
        else if(abs(ray.heading()) > 112.5 && abs(ray.heading()) <= 157.5){
            if(ray.heading() > 0){
                digSpot2 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x-1, y: digSpot.y-1};
                digSpot3 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x+1, y: digSpot.y+1};
            }
            else{
                digSpot2 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x-1, y: digSpot.y+1};
                digSpot3 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x+1, y: digSpot.y-1};
            }
        }
        else if(abs(ray.heading()) > 157.5 && abs(ray.heading()) <= 180){
            digSpot2 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x, y: digSpot.y-1};
            digSpot3 = {cx: digSpot.cx, cy: digSpot.cy, x: digSpot.x, y: digSpot.y+1};
        }

        if(digSpot2 != undefined) dig(((digSpot2.cx*CHUNKSIZE+digSpot2.x)*TILESIZE), ((digSpot2.cy*CHUNKSIZE+digSpot2.y)*TILESIZE), amount);
        if(digSpot3 != undefined) dig(((digSpot3.cx*CHUNKSIZE+digSpot3.x)*TILESIZE), ((digSpot3.cy*CHUNKSIZE+digSpot3.y)*TILESIZE), amount);
        
    }
}

function dig(x, y, amt) {
    x = floor(x / TILESIZE);
    y = floor(y / TILESIZE);
    
    let chunkPos = testMap.globalToChunk(x*TILESIZE,y*TILESIZE);
    if(testMap.chunks[chunkPos.x+","+chunkPos.y] == undefined) return;
    
    x = x-(chunkPos.x*CHUNKSIZE);
    y = y-(chunkPos.y*CHUNKSIZE);
    let index = x + (y / CHUNKSIZE);

    if(Debuging){
        push();
        fill(255);
        circle(((chunkPos.x*CHUNKSIZE+x)*TILESIZE) - camera.x + (width/2), ((chunkPos.y*CHUNKSIZE+y)*TILESIZE) - camera.y + (height/2), TILESIZE/2);
        pop();
    }

    if(amt > 0){
        dirtInv += amt;
        if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] > 0) testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] -= amt;
        if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] < 0.3 && testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] !== -1){
            testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] = 0;
        }
    }
    else{
        dirtInv += amt;
        if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] < 1.3 && testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] !== -1) testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] -= amt;
        if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] > 1.3){
            dirtInv -= testMap.chunks[chunkPos.x+","+chunkPos.y].data[index]-1.3;
            testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] = 1.3;
        }
    }

    socket.emit("update_node", {chunkPos: (chunkPos.x+","+chunkPos.y), index: index, val: testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] });
}


function cast(x,y, angle, placeBool){
    let chunkPos = testMap.globalToChunk(x,y);
    if(testMap.chunks[chunkPos.x+","+chunkPos.y] == undefined) return;
    
    x = floor(x / TILESIZE);
    y = floor(y / TILESIZE);
    let tempRay = createVector(x,y);

    x = x-(chunkPos.x*CHUNKSIZE);
    y = y-(chunkPos.y*CHUNKSIZE);
    let index = x + (y / CHUNKSIZE);

    if(testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] > 0) return {cx: chunkPos.x, cy: chunkPos.y, x: x, y: y};

    let playerToMouse = curPlayer.pos.dist(createVector((mouseX + camera.x - (width / 2)), (mouseY + camera.y - (height / 2))));
    let playerToTile = curPlayer.pos.dist(createVector(((chunkPos.x*CHUNKSIZE+x)*TILESIZE), ((chunkPos.y*CHUNKSIZE+y)*TILESIZE)));

    while(testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] == 0){
      x += cos(angle);
      y += sin(angle);
      
      //reset when ray goes to the next chunk
      if(x >= CHUNKSIZE){
        x = x - CHUNKSIZE;
        chunkPos.x += 1;
      }
      if(x < 0){
            x = x + CHUNKSIZE;
            chunkPos.x -= 1;
        }
          if(y >= CHUNKSIZE){
            y = y - CHUNKSIZE;
            chunkPos.y += 1;
        }
        if(y < 0){
            y = y + CHUNKSIZE;
            chunkPos.y -= 1;
          }
          
        index = floor(x) + (floor(y) / CHUNKSIZE);
        
        if(placeBool){
            if(testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] >= 1.3){
                x -= 1*cos(angle);
                y -= 1*sin(angle);
                return {cx: chunkPos.x, cy: chunkPos.y, x: floor(x), y: floor(y)};
            }
        }
          
        playerToTile = curPlayer.pos.dist(createVector(((chunkPos.x*CHUNKSIZE+x)*TILESIZE), ((chunkPos.y*CHUNKSIZE+y)*TILESIZE)));
        if(playerToTile > playerToMouse) return;
    }

    push();
    stroke(0,255,0);
    strokeWeight(3);
    line(tempRay.x*TILESIZE -camera.x+(width/2), tempRay.y*TILESIZE -camera.y+(height/2), (chunkPos.x*CHUNKSIZE+floor(x))*TILESIZE -camera.x+(width/2), (chunkPos.y*CHUNKSIZE+floor(y))*TILESIZE -camera.y+(height/2));
    pop();

    return {cx: chunkPos.x, cy: chunkPos.y, x: floor(x), y: floor(y)};
}
