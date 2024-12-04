// sketch.js

// Global variables
let gameState = 'initial';
let testMap;
let socket;
let curPlayer;
let lastHolding;
let players = {};
let traps = [];
let projectiles = [];
let collisionChecks = [];
let raceSelected = false;
let nameEntered = false;
let raceButtons = [];
let goButton;
let nameInput;
let keyReleasedFlag = false;
const races = ['gnome'];
const raceImages = {}; // Object to hold all race images
let defaultImage;

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

    // Load images for each direction
    for (let i = 0; i < 3; i++) {
      // Front images
      raceImages[raceName].front[i] = loadImage(
        `images/${raceName}_front_walk${i + 1}.png`,
        function (img) {
          console.log(`Loaded image: images/${raceName}_front_walk${i + 1}.png`);
        },
        function (err) {
          console.error(`Failed to load image: images/${raceName}_front_walk${i + 1}.png`);
          raceImages[raceName].front[i] = defaultImage;
        }
      );

      // Back images
      raceImages[raceName].back[i] = loadImage(
        `images/${raceName}_back_walk${i + 1}.png`,
        function (img) {
          console.log(`Loaded image: images/${raceName}_back_walk${i + 1}.png`);
        },
        function (err) {
          console.error(`Failed to load image: images/${raceName}_back_walk${i + 1}.png`);
          raceImages[raceName].back[i] = defaultImage;
        }
      );

      // Left images
      raceImages[raceName].left[i] = loadImage(
        `images/${raceName}_side_walk${i + 1}.png`,
        function (img) {
          console.log(`Loaded image: images/${raceName}_side_walk${i + 1}.png`);
        },
        function (err) {
          console.error(`Failed to load image: images/${raceName}_side_walk${i + 1}.png`);
          raceImages[raceName].left[i] = defaultImage;
        }
      );
    }
  }
}

function setup() {
  createCanvas(windowWidth - 10, windowHeight - 10);
  background(220);

  // Prevent right-click context menu on all p5.js canvases
  const canvases = document.getElementsByClassName('p5Canvas');
  for (let element of canvases) {
    element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  socket = io.connect('http://localhost:3000');

  // Flip left images to create right images
  for (let raceName in raceImages) {
    raceImages[raceName].right = [];
    for (let i = 0; i < raceImages[raceName].left.length; i++) {
      raceImages[raceName].right[i] = flipImage(raceImages[raceName].left[i]);
    }
  }

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
      width / 2,
      height / 2,
      100,
      data.id,
      data.color,
      0,
      ''
    ); // Default race index 0
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
      players[data.id].direction = data.direction;
    }
  });

  socket.on('UPDATE_NODE', (data) => {
    testMap.data[data.index] = data.val;
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

  socket.on('use_trap', (data) => {
    // Handle trap activation
  });

  const grid = 16;
  testMap = new Map(floor(width / grid), floor(height / grid), grid);

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

    if (testMap.data.length > 0) testMap.render();

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
      lastHolding = curPlayer.holding;

      // Reset movement keys
      curPlayer.holding = { w: false, a: false, s: false, d: false };

      // Player Controls
      if (keyIsDown(87)) curPlayer.holding.w = true; // W
      if (keyIsDown(65)) curPlayer.holding.a = true; // A
      if (keyIsDown(83)) curPlayer.holding.s = true; // S
      if (keyIsDown(68)) curPlayer.holding.d = true; // D

      if (
        lastHolding.w != curPlayer.holding.w ||
        lastHolding.a != curPlayer.holding.a ||
        lastHolding.s != curPlayer.holding.s ||
        lastHolding.d != curPlayer.holding.d
      ) {
        socket.emit('update_pos', curPlayer);
      }
    }

    if (mouseIsPressed) {
      // Digging
      let x = floor(mouseX / testMap.tileSize);
      let y = floor(mouseY / testMap.tileSize);

      // Remove from 5 nodes in a "+" shape
      dig(x + 1, y);
      dig(x - 1, y);
      dig(x, y + 1);
      dig(x, y - 1);
      dig(x, y);
    }
  }
}

function dig(x, y) {
  if (x < 0 || x >= testMap.WIDTH || y < 0 || y >= testMap.HEIGHT) return; // Prevent out-of-bounds access

  let index = x + y * testMap.WIDTH;
  if (testMap.data[index] > 0) testMap.data[index] -= 0.01;
  if (testMap.data[index] < 0.2 && testMap.data[index] !== -1) testMap.data[index] = 0;
  socket.emit('update_node', { index: index, val: testMap.data[index] });
}

// Map class and getState function

function Map(w, h, grid) {
  this.data = new Array(w * h).fill(0); // Initialize map data
  this.WIDTH = w;
  this.HEIGHT = h;
  this.tileSize = grid;

  this.cordToScreen = function (x, y) {
    return {
      x: (x + 0.5) * this.tileSize,
      y: (y + 0.5) * this.tileSize,
    };
  };

  this.render = function () {
    fill('#3B1725');
    noStroke();

    // Draw borders
    rect(0, 0, this.tileSize / 2, height);
    rect(0, 0, width, this.tileSize / 2);
    rect(width - this.tileSize / 2, 0, this.tileSize / 2, height);
    rect(0, height - this.tileSize / 2, width, this.tileSize / 2);

    for (let x = 0; x < this.WIDTH - 1; x++) {
      for (let y = 0; y < this.HEIGHT - 1; y++) {
        // Get the values at each corner
        let corners = [
          this.data[x + y * this.WIDTH],
          this.data[x + 1 + y * this.WIDTH],
          this.data[x + 1 + (y + 1) * this.WIDTH],
          this.data[x + (y + 1) * this.WIDTH],
        ];

        for (let i = 0; i < 4; i++) {
          if (corners[i] == -1) corners[i] = 1;
          corners[i] += 0.6;
        }

        // Get the screen coordinates of each corner
        let scCorners = [
          this.cordToScreen(x, y),
          this.cordToScreen(x + 1, y),
          this.cordToScreen(x + 1, y + 1),
          this.cordToScreen(x, y + 1),
        ];

        let state = getState(corners[0], corners[1], corners[2], corners[3]);
        let amt = 0;

        // Calculate side positions
        let a = { x: 0, y: scCorners[0].y };
        amt = (1 - corners[0]) / (corners[1] - corners[0]);
        a.x = lerp(scCorners[0].x, scCorners[1].x, amt);

        let b = { x: scCorners[1].x, y: 0 };
        amt = (1 - corners[1]) / (corners[2] - corners[1]);
        b.y = lerp(scCorners[1].y, scCorners[2].y, amt);

        let c = { x: 0, y: scCorners[2].y };
        amt = (1 - corners[2]) / (corners[3] - corners[2]);
        c.x = lerp(scCorners[2].x, scCorners[3].x, amt);

        let d = { x: scCorners[0].x, y: 0 };
        amt = (1 - corners[0]) / (corners[3] - corners[0]);
        d.y = lerp(scCorners[0].y, scCorners[3].y, amt);

        // Draw the specific shape based on the state
        switch (state) {
          case 1:
            beginShape();
            vertex(scCorners[3].x, scCorners[3].y);
            vertex(c.x, c.y);
            vertex(d.x, d.y);
            endShape();
            break;
          // Handle other cases similarly...
          case 15:
            rect(scCorners[0].x, scCorners[0].y, this.tileSize, this.tileSize);
            break;
        }
      }
    }

    // Draw the number of players
    push();
    fill(255);
    textSize(16);
    text('Players: ' + (Object.keys(players).length + 1), 100, 50);
    pop();
  };
}

function getState(c1, c2, c3, c4) {
  let val = 0;
  if (c1 >= 1) {
    val += 8;
  }
  if (c2 >= 1) {
    val += 4;
  }
  if (c3 >= 1) {
    val += 2;
  }
  if (c4 >= 1) {
    val += 1;
  }
  return val;
}

// Trap class and other necessary classes...

// Note: Ensure that the server-side code correctly handles the race property when new players join and when broadcasting player updates.
