let gameState ="initial"
let testMap; // Create a map object
var socket; //Connection to the server
var curPlayer; //Your player
var lastHolding;
var players = {}; //other players WHY IS THIS AN OBJECT  ?? ??
var traps = []
var projectiles = []
var collisionChecks = []; //for debugging
var raceSelected = false;
var nameEntered = false;
var raceButtons = [];
var goButton;
var nameInput;
var keyReleasedFlag = false;
const races = ['gnome', 'aylah'];
const raceImages = {}; // Object to hold all race images
var defaultImage;
var camera = {x: 0, y: 0};
var Debuging = false;

function preload() {
    // Load the default image
  
    /*
    defaultImage = loadImage(
      'images/default_front_walk.png',
      function (img) {
        console.log('Default image loaded successfully.');
      },
      function (err) {
        console.error('Failed to load the default image.');
        // Create a placeholder image to use as default
        defaultImage = createImage(32, 32);
        defaultImage.loadPixels();
        for (let i = 0; i < defaultImage.pixels.length; i += 4) {
          defaultImage.pixels[i] = 255;     // R
          defaultImage.pixels[i + 1] = 0;   // G
          defaultImage.pixels[i + 2] = 0;   // B
          defaultImage.pixels[i + 3] = 255; // A
        }
        defaultImage.updatePixels();
      }
    );
    */
  
    // Load race images
    loadRaceImages();
  }
  
  function loadRaceImages() {
    for (let raceIndex = 0; raceIndex < races.length; raceIndex++) {
      let raceName = races[raceIndex];
      raceImages[raceName] = {
        front: [],
        back: [],
        left: [],
        right: [],
      };
      
      raceImages[raceName].front[0] = loadImage(
        `images/${raceName}/${raceName}_front_stand.png`,
          function (img) {
            console.log(`Loaded image: images/${raceName}/${raceName}_front_stand.png`);
          },
          function (err) {
            console.error(`Failed to load image: images/${raceName}/${raceName}_front_stand.png`);
            raceImages[raceName].front[0] = defaultImage;
          }
      );
      raceImages[raceName].back[0] = loadImage(
        `images/${raceName}/${raceName}_back_stand.png`,
          function (img) {
            console.log(`Loaded image: images/${raceName}/${raceName}_back_stand.png`);
          },
          function (err) {
            console.error(`Failed to load image: images/${raceName}/${raceName}_back_stand.png`);
            raceImages[raceName].back[0] = defaultImage;
          }
      );
      raceImages[raceName].right[0] = loadImage(
        `images/${raceName}/${raceName}_side_stand.png`,
          function (img) {
            console.log(`Loaded image: images/${raceName}/${raceName}_side_stand.png`);
          },
          function (err) {
            console.error(`Failed to load image: images/${raceName}/${raceName}_side_stand.png`);
            raceImages[raceName].right[0] = defaultImage;
          }
      );
      // Load images for each direction
      for (let i = 1; i < 4; i++) {
        // Front images
        raceImages[raceName].front[i] = loadImage(
          `images/${raceName}/${raceName}_front_walk${i}.png`,
          function (img) {
            console.log(`Loaded image: images/${raceName}/${raceName}_front_walk${i}.png`);
          },
          function (err) {
            console.error(`Failed to load image: images/${raceName}/${raceName}_front_walk${i}.png`);
            raceImages[raceName].front[i] = defaultImage;
          }
        );
  
        // Back images
        raceImages[raceName].back[i] = loadImage(
          `images/${raceName}/${raceName}_back_walk${i}.png`,
          function (img) {
            console.log(`Loaded image: images/${raceName}/${raceName}_back_walk${i}.png`);
          },
          function (err) {
            console.error(`Failed to load image: images/${raceName}/${raceName}_back_walk${i}.png`);
            raceImages[raceName].back[i] = defaultImage;
          }
        );
  
        // Right images
        raceImages[raceName].right[i] = loadImage(
          `images/${raceName}/${raceName}_side_walk${i}.png`,
          function (img) {
            console.log(`Loaded image: images/${raceName}/${raceName}_side_walk${i}.png`);
          },
          function (err) {
            console.error(`Failed to load image: images/${raceName}/${raceName}_side_walk${i}.png`);
            raceImages[raceName].right[i] = defaultImage;
          }
        );
      }
    }
}

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

    socket.on("use_trap", (data) => {
        //hit a player
        //does damage add damager to the player
    });

    socket.on("GIVE_CHUNK", (data) => {
        testMap.chunks[data.x+","+data.y] = new Chunk(data.x, data.y);
        let keys = Object.keys(data.data);
        for(let i=0; i<keys.length; i++) testMap.chunks[data.x+","+data.y].data[keys[i]] = data.data[keys[i]];
        testMap.chunkBools[data.x+","+data.y] = true;
    });

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
  } else {
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

        if (mouseIsPressed) {
            //does the digging
            let x = (mouseX + camera.x - (width / 2));
            let y = (mouseY + camera.y - (height / 2));

            let ray = createVector(x-curPlayer.pos.x, y-curPlayer.pos.y);
            let digSpot = cast(curPlayer.pos.x, curPlayer.pos.y, ray.heading());
            if(digSpot != undefined) dig(((digSpot.cx*CHUNKSIZE+digSpot.x)*TILESIZE), ((digSpot.cy*CHUNKSIZE+digSpot.y)*TILESIZE), 0.02);
            
            digSpot = cast(curPlayer.pos.x+(16*round(cos(ray.copy().rotate(90).heading()))), 
            curPlayer.pos.y+(16*round(sin(ray.copy().rotate(90).heading()))), ray.heading());
            if(digSpot != undefined) dig(((digSpot.cx*CHUNKSIZE+digSpot.x)*TILESIZE), ((digSpot.cy*CHUNKSIZE+digSpot.y)*TILESIZE), 0.02);
            
            digSpot = cast(curPlayer.pos.x-(16*round(cos(ray.copy().rotate(90).heading()))), 
                           curPlayer.pos.y-(16*round(sin(ray.copy().rotate(90).heading()))), ray.heading());
            if(digSpot != undefined) dig(((digSpot.cx*CHUNKSIZE+digSpot.x)*TILESIZE), ((digSpot.cy*CHUNKSIZE+digSpot.y)*TILESIZE), 0.02);
        }
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

    if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] > 0) testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] -= amt;
    if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] < 0.3 && testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] !== -1){
        testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] = 0;
    }
    
    // if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + 1 + y / CHUNKSIZE] <= 0.4) {
    //     if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[x - 1 + y / CHUNKSIZE] <= 0.4) {
    //         if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + (y + 1) / CHUNKSIZE] <= 0.4) {
    //             if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + (y + 1) / CHUNKSIZE] <= 0.4) {
    //                 testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] = 0;
    //             }
    //         }
    //     }
    // }
    socket.emit("update_node", {chunkPos: (chunkPos.x+","+chunkPos.y), index: index, val: testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] });
}


function cast(x,y, angle){
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

        playerToTile = curPlayer.pos.dist(createVector(((chunkPos.x*CHUNKSIZE+x)*TILESIZE), ((chunkPos.y*CHUNKSIZE+y)*TILESIZE)));
        if(playerToTile > playerToMouse) return;
    }
    return {cx: chunkPos.x, cy: chunkPos.y, x: floor(x), y: floor(y)};
}