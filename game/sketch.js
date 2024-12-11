let gameState ="initial";
let testMap; // Create a map object
var lastHolding;
var projectiles = [];
var collisionChecks = []; //for debugging
var raceSelected = false;
var nameEntered = false;
var raceButtons = [];
var goButton;
var nameInput;
var keyReleasedFlag = false;
const races = ['gnome', 'aylah'];
var camera = {x: 0, y: 0};
var Debuging = false;
var dirtInv = 0;

function windowResized() {
    resizeCanvas(innerWidth-10, innerHeight-8);  // Resize canvas when window size changes
}

function setup() {
    let cnv = createCanvas(innerWidth-10, innerHeight-8);
    cnv.parent('canvas-container'); 
    background(220);
    angleMode(DEGREES);

    // Prevent right-click context menu on all p5.js canvases
    const canvases = document.getElementsByClassName("p5Canvas");
    for (let element of canvases) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    socket = io.connect("http://localhost:3000");

    // Flip right images to create left images
    for (let raceName in raceImages) {
        raceImages[raceName].left = [];
        for (let i = 0; i < raceImages[raceName].right.length; i++) {
            raceImages[raceName].left[i] = flipImage(raceImages[raceName].right[i]);
        }
    }

    socketSetup();

    testMap = new Map();

    // Create race selection buttons
    for (let i = 0; i < races.length; i++) {
        let btn = createButton(races[i].charAt(0).toUpperCase() + races[i].slice(1));
        btn.position(width / 2 - 75, height / 2 + 50 + i * 60);
        btn.mousePressed(() => selectRace(i));
        btn.hide();
        raceButtons.push(btn);
    }

    // Create input field for user name
    nameInput = createInput('');
    nameInput.position(width / 2 - 75, height / 2 + 250);
    nameInput.input(checkName);
    nameInput.hide();

    // Create the "Go" button
    goButton = createButton('Go');
    goButton.position(width / 2 - 75, height / 2 + 280);
    goButton.attribute('disabled', true);
    goButton.mousePressed(() => {
        curPlayer.name = nameInput.value();
        socket.emit('new_player', curPlayer);
        gameState = 'playing';

        //empty out a small area around the player
        for(let y = -5; y < 5; y++){
            for(let x = -5; x < 5; x++){
                dig(curPlayer.pos.x+(x*TILESIZE), curPlayer.pos.y+(y*TILESIZE), 1);
            }
        }
        dirtInv = 0; //set back to 0 after filling it with ^^^ that code
    });
    goButton.hide();
}

function flipImage(img) {
    let flippedImg = createGraphics(img.width, img.height);
    flippedImg.scale(-1, 1);
    flippedImg.image(img, -img.width, 0);
    return flippedImg;
}

function selectRace(raceIndex) {
    raceSelected = true;
    curPlayer.race = raceIndex;
    console.log('Race selected: ' + races[raceIndex]);
}

function checkName() {
    if (nameInput.value().length > 0) {
        nameEntered = true;
    } else {
        nameEntered = false;
    }
}

function keyReleased() {
    if (keyCode === 32 && !keyReleasedFlag) {
        // Spacebar released
        console.log('Trap created');

        // Create a new trap at the player's position
        let newT = new Trap(
            curPlayer.pos.x,
            curPlayer.pos.y,
            10,
            curPlayer.id,
            curPlayer.color,
            curPlayer.name
        );
        traps.push(newT);

        // Emit the trap creation to the server
        socket.emit('spawn_trap', {
            x: curPlayer.pos.x,
            y: curPlayer.pos.y,
            ownerName: curPlayer.name,
            color: curPlayer.color,
            ownerId: curPlayer.id,
        });

        keyReleasedFlag = true;
    }
}

function keyPressed() {
    if (keyCode === 32) {
        keyReleasedFlag = false;
    }
}

function draw() {
    background('#71413B');

    if (gameState == 'initial') {
        nameInput.show();
        goButton.show();

        // Show race buttons
        raceButtons.forEach((btn) => {
            btn.show();
        });

        // Display "Pick A Race" text
        push();
        fill(255);
        textSize(40);
        textAlign(CENTER, CENTER);
        text('Pick A Race', width / 2, height / 3);
        pop();

        // Enable "Go" button if race and name are selected
        if (raceSelected && nameEntered) {
            goButton.removeAttribute('disabled');
        } else {
            goButton.attribute('disabled', true);
        }
    }
    else {
        // Hide UI elements during gameplay
        nameInput.hide();
        goButton.hide();
        raceButtons.forEach((btn) => {
            btn.hide();
        });

        if(curPlayer){
            camera.x = curPlayer.pos.x;
            camera.y = curPlayer.pos.y;
        }

        if (Object.keys(testMap.chunks).length > 0) testMap.render();

        if (curPlayer) {
            curPlayer.render();
            curPlayer.update();
        }

        let keys = Object.keys(players);
        for (let i = 0; i < keys.length; i++) {
        players[keys[i]].render();
        players[keys[i]].update();
        }

        for (let i = 0; i < traps.length; i++) {
        traps[i].render();
        traps[i].update();
        }

        if (curPlayer) {
            lastHolding = curPlayer.holding; //copy to compare to later

            //default all keys to not holding them
            curPlayer.holding = { w: false, a: false, s: false, d: false };

            //Player Controls
            if (keyIsDown(87)) curPlayer.holding.w = true; //w
            if (keyIsDown(65)) curPlayer.holding.a = true; //a
            if (keyIsDown(83)) curPlayer.holding.s = true; //s
            if (keyIsDown(68)) curPlayer.holding.d = true; //d

            if (lastHolding.w != curPlayer.holding.w ||
                lastHolding.a != curPlayer.holding.a ||
                lastHolding.s != curPlayer.holding.s ||
                lastHolding.d != curPlayer.holding.d
            ) socket.emit("update_pos", curPlayer);
        }

        push();
        fill(255);
        textSize(20);
        text("Dirt:", 10, height-10);
        stroke(0);
        fill(0);
        rect(50, height-30, 200, 20);
        fill(255,255,0);
        rect(50, height-30, 200*(dirtInv/150), 20);
        pop();

        if (mouseIsPressed) {
            //does the digging
            let x = (mouseX + camera.x - (width / 2));
            let y = (mouseY + camera.y - (height / 2));

            let amount = 0;
            if(mouseButton == LEFT){ //remove dirt
                if(dirtInv < 150-0.04) playerDig(x, y, 0.04);
            }
            if(mouseButton == RIGHT){ //add dirt
                if(dirtInv > 0.04) playerDig(x, y, -0.04);
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