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
var ghostBuild;
var DIGSPEED = 0.04;

let raceContainer, raceTitle

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
    background("#71413B");

    if(gameState === "initial") {
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
            if(buildMode){
                ghostBuild.pos.x = mouseX + camera.x - width / 2;
                ghostBuild.pos.y = mouseY + camera.y - height / 2;
                ghostBuild.rot = ghostBuild.pos.copy().sub(curPlayer.pos).heading();
                ghostBuild.ghostRender(createVector(ghostBuild.pos.x,ghostBuild.pos.y).dist(curPlayer.pos) < 200);
            }
        }

        let keys = Object.keys(players);
        for (let i = 0; i < keys.length; i++) {
            players[keys[i]].render();
            players[keys[i]].update();
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

        // Dirt Inventory
        push();
        fill(255);
        textSize(20);
        text("Dirt:", 10, height - 10);
        stroke(0);
        fill(0);
        rect(50, height - 30, 200, 20);
        fill(255, 255, 0);
        rect(50, height - 30, 200 * (dirtInv / 150), 20);
        pop();

        // Digging logic
        if (mouseIsPressed) {
            let x = mouseX + camera.x - width / 2;
            let y = mouseY + camera.y - height / 2;

            if (mouseButton === LEFT) {
                if(!buildMode){
                    if (dirtInv < 150 - DIGSPEED) playerDig(x, y, DIGSPEED);
                }
                else{
                    if(ghostBuild.openBool){
                        let chunkPos = testMap.globalToChunk(x,y);
                        let temp;
                        if(ghostBuild.type == "trap"){
                            temp = new Trap(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.hp, curPlayer.id, ghostBuild.color, curPlayer.name);
                        }
                        else if(ghostBuild.type == "wall"){
                            temp = new Wall(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, ghostBuild.color);
                        }
                        else if(ghostBuild.type == "door"){
                            temp = new Door(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, ghostBuild.color);
                        }
                        else if(ghostBuild.type == "floor"){
                            temp = new Floor(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, ghostBuild.color);
                        }
                        else if(ghostBuild.type == "rug"){
                            temp = new Rug(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, ghostBuild.color);
                        }
                        else if(ghostBuild.type == "cup"){
                            temp = new Cup(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, ghostBuild.color);
                        }
                        else if(ghostBuild.type == "turret"){
                            temp = new Turret(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot, ghostBuild.hp, curPlayer.id, ghostBuild.color, curPlayer.name);
                        }
                        else if(ghostBuild.type == "bomb"){
                            temp = new Bomb(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.hp, curPlayer.id, ghostBuild.color, curPlayer.name);
                        }
                        else{
                            temp = new Placeable(ghostBuild.pos.x, ghostBuild.pos.y, ghostBuild.rot);
                        }
                        testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.push(temp);
                        testMap.chunks[chunkPos.x + "," + chunkPos.y].objects.sort((a,b) => a.z - b.z);
                        socket.emit("new_object", {cx: chunkPos.x, cy: chunkPos.y, type: temp.type, pos: {x: temp.pos.x, y: temp.pos.y}, rot: temp.rot, id: temp.id, hp: temp.hp, name: temp.name, color: temp.color});

                        curPlayer.animationCreate("put");
                    }
                }
            }
            if (mouseButton === RIGHT) {
                if(!buildMode){
                    if (dirtInv > DIGSPEED) playerDig(x, y, -DIGSPEED);
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
    }

    if (keyCode === 49){ //1
        ghostBuild = new Wall(0,0,0, {r: 100, g: 200, b: 0});
    }

    if (keyCode === 50){ //2
        ghostBuild = new Floor(0,0,0, {r: 150, g: 150, b: 0});
    }

    if (keyCode === 51){ //3
        ghostBuild = new Door(0,0,0, {r: 80, g: 180, b: 0});
    }

    if (keyCode === 52){ //4
        ghostBuild = new Rug(0,0,0, {r: 50, g: 150, b: 0});
    }

    if (keyCode === 53){ //5
        ghostBuild = new Cup(0,0,0, {r: 255, g: 255, b: 255});
    }

    if (keyCode === 54){ //6
        ghostBuild = new Trap(0,0,10,0,{r:255,g:255,b:255}, " ");
    }

    if (keyCode === 55){ //8
        ghostBuild = new Turret(0,0,0,10,0,{r:255,g:255,b:255}, " ");
    }

    if (keyCode === 56){ //9
        ghostBuild = new Bomb(0,0,10,0,{r:255,g:255,b:255}, " ");
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
    if(digSpot != undefined) dig(((digSpot.cx*CHUNKSIZE+digSpot.x)*TILESIZE), ((digSpot.cy*CHUNKSIZE+digSpot.y)*TILESIZE), amount);
    
    //2 extra digs to make a better path for walking
    digSpot = cast(
        curPlayer.pos.x+(16*round(cos(ray.copy().rotate(90).heading()))), 
        curPlayer.pos.y+(16*round(sin(ray.copy().rotate(90).heading()))), ray.heading(),
        (amount < 0)
    );
    if(digSpot != undefined) dig(((digSpot.cx*CHUNKSIZE+digSpot.x)*TILESIZE), ((digSpot.cy*CHUNKSIZE+digSpot.y)*TILESIZE), amount);
    
    digSpot = cast(
        curPlayer.pos.x-(16*round(cos(ray.copy().rotate(90).heading()))), 
        curPlayer.pos.y-(16*round(sin(ray.copy().rotate(90).heading()))), ray.heading(),
        (amount < 0)
    );
    if(digSpot != undefined) dig(((digSpot.cx*CHUNKSIZE+digSpot.x)*TILESIZE), ((digSpot.cy*CHUNKSIZE+digSpot.y)*TILESIZE), amount);
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

    x = x-(chunkPos.x*CHUNKSIZE);
    y = y-(chunkPos.y*CHUNKSIZE);
    let index = x + (y / CHUNKSIZE);
    if(testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] > 0) return {x: x, y: y};

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
    return {cx: chunkPos.x, cy: chunkPos.y, x: floor(x), y: floor(y)};
}
