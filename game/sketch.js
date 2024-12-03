var gameState = "initial";
var testMap; // Create a map object
var socket; //Connection to the server
var curPlayer; //Your player
var lastHolding;
var players = {}; //other players WHY IS THIS AN OBJECT  ?? ?? Since we usually only edit 1 player at a time, I(Zoda) think this is the more preformant option
var traps = [];
var projectiles = [];
var collisionChecks = []; //for debugging
var camera = {x: 0, y: 0};

function windowResized() {
    resizeCanvas(innerWidth - 10, innerHeight - 8); // Resizes canvas when window size changes
}

function setup() {
    let cnv = createCanvas(800, 800);
    cnv.parent("canvas-container");
    background(220);

    // Prevent right-click context menu on all p5.js canvases
    const canvases = document.getElementsByClassName("p5Canvas");
    for (let element of canvases) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    socket = io.connect("http://localhost:3000");

    //all caps means it came from the server
    //all lower means it came from the client

    socket.on("NEW_PLAYER", (data) => {
        players[data.id] = new Player(
            data.pos.x,
            data.pos.y,
            data.hp,
            data.id,
            data.color,
            data.race,
            data.name
        );
        players[data.id].color = data.color;
    });

    socket.on("OLD_DATA", (data) => {
        console.log(data);
        let keys = Object.keys(data.players); // Ensure we're getting an array of player IDs

        console.log(keys);
        for (let i = 0; i < keys.length; i++) {
            console.log(players[keys[i]], "player");
            const playerData = data.players[keys[i]];

            // Ensure that playerData has the correct properties for the Player constructor
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
            traps.push(new Trap(nt.x, nt.y, 10, socket.id, nt.color, nt.ownerName));
        }
    });

    socket.on("YOUR_ID", (data) => {
        //console.log(data);
        curPlayer = new Player(0, 0, 100, data.id, data.color); //only create your player once your given your socket id
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

    socket.on("UPDATE_ALL_POS", (data) => {
        let keys = Object.keys(data); // Grabs keys to iterate through, easier to find players this way

        // First, check for missing players
        for (let playerId in players) {
            if (!data.hasOwnProperty(playerId)) {
                // Player is missing from the data, remove or clean up as needed
                delete players[playerId]; // You may want to emit a removal event for this player as well
                console.log(`Player ${playerId} has been removed.`);
            }
        }

        // Now, update players' positions
        for (let i = 0; i < keys.length; i++) {
            const playerId = keys[i];
            const playerData = data[playerId];

            if (playerId === curPlayer.id) {
                socket.emit("update_pos", curPlayer);
            } else {
                if (players[playerId]) {
                // Check if the player exists in the game state
                players[playerId].pos.x = playerData.pos.x;
                players[playerId].pos.y = playerData.pos.y;
                players[playerId].hp = playerData.hp;
                }
            }
        }
    });

    socket.on("UPDATE_POS", (data) => {
        if (!data) return;
        if (!data.pos) return;

        players[data.id].pos.x = data.pos.x;
        players[data.id].pos.y = data.pos.y;
        players[data.id].hp = data.hp;
        players[data.id].holding = data.holding;

        //players[data.id].color = data.color
    });

    socket.on("UPDATE_NODE", (data) => {
        testMap.data[data.index] = data.val;
    });

    socket.on("REMOVE_PLAYER", (data) => {
        players[data] = [];

        delete players[data];
        console.log();
    });

    socket.on("spawn_trap", (data) => {
        console.log(data, "handle");
        let newT = new Trap(
        data.x,
        data.y,
        10,
        socket.id,
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

    // Create race selection buttons for Gnome, Skizard, Aylah
    raceButtons.push(createButton("Gnome"));
    raceButtons.push(createButton("Skizard"));
    raceButtons.push(createButton("Aylah"));

    // Position the buttons and add functionality
    raceButtons.forEach((btn, index) => {
        btn.position(width - 300, height / 2 + 50 + index * 60);
        btn.mousePressed(() => selectRace(index)); // Trigger race selection on button press
        btn.hide(); // Initially hide buttons
    });

    // Create input field for user name
    nameInput = createInput("");
    nameInput.position(width - 300, height / 2 + 250);
    nameInput.input(checkName); // Check if name is entered
    nameInput.hide(); // Initially hide the input field

    // Create the "Go" button (initially disabled)
    goButton = createButton("Go");
    goButton.position(width - 300, height / 2 + 350);
    goButton.attribute("disabled", true); // Disable initially
    goButton.mousePressed(() => {
        socket.emit("new_player", curPlayer);
        gameState = "playing";
    }); // Trigger the start game function
    goButton.hide(); // Initially hide the Go button
}

function selectRace(raceIndex) {
    raceSelected = true; // Set race selected flag to true
    curPlayer.race = raceIndex;
    console.log("Race selected: " + raceButtons[raceIndex].html());
}

function keyReleased() {
    if (keyCode === 32 && !keyReleasedFlag) {
        // Check if the spacebar is released
        console.log("Trap created");

        // Create a new trap at the player's position
        let newT = new Trap(
            curPlayer.pos.x,
            curPlayer.pos.y,
            10,
            curPlayer.id,
            curPlayer.color,
            curPlayer.ownerName
        );
        traps.push(newT);

        // Emit the trap creation to the server
        socket.emit("spawn_trap", {
            x: curPlayer.pos.x,
            y: curPlayer.pos.y,
            ownerName: curPlayer.name,
            color: curPlayer.color,
        });

        // Set the flag to true so the trap is created only once on key release
        keyReleasedFlag = true;
    }
}

function keyPressed() {
    if (keyCode === 32) {
        // Check if spacebar is pressed
        keyReleasedFlag = false; // Reset the flag when the key is pressed
    }
}

// Function to check if a name is entered
function checkName() {
    //console.log(nameInput.value());
    curPlayer.name = nameInput.value();
    if (nameInput.value().length > 0) {
        nameEntered = true; // Set name entered flag to true
    } else {
        nameEntered = false; // Set name entered flag to false
    }
}

var raceSelected = false; // Flag to track if a race is selected
var nameEntered = false; // Flag to track if a name is entered
var raceButtons = [];
var goButton;
var nameInput;

function draw() {
    background("#71413B");

    if (gameState == "initial") {
        nameInput.position(width / 2 - 150, height / 2 + 250);
        nameInput.show();
        goButton.position(width / 2 - 150, height / 2 + 280);
        goButton.show();

        // Position the buttons and add functionality
        raceButtons.forEach((btn, index) => {
            btn.position(width / 2 - 150, height / 2 + 50 + index * 60);
            btn.mousePressed(() => selectRace(index)); // Trigger race selection on button press
            btn.show(); // Initially hide buttons
        });

        // picking user
        push();
        fill(255);
        textSize(40); // Optional: Set text size for readability
        textAlign(CENTER, CENTER);
        text("Pick A Race", width / 2, height / 3);
        pop();

        // Check if both race and name are selected/entered to enable the "Go" button
        if (raceSelected && nameEntered) {
            goButton.removeAttribute("disabled");
        } else {
            goButton.attribute("disabled", true);
        }
    }
    else {
        // normal game
        nameInput.hide();
        goButton.hide();
        raceButtons.forEach((btn, index) => {
            btn.hide(); // hide buttons
        });

        if (Object.keys(testMap.chunks).length > 0) testMap.render();
        //if(testMap.data.length > 0) testMap.DebugDraw();

        if (curPlayer) {
            camera.x = curPlayer.pos.x;
            camera.y = curPlayer.pos.y;
            curPlayer.render();
            curPlayer.update();
        }

        let keys = Object.keys(players);
        for (i = 0; i < keys.length; i++) {
            players[keys[i]].render();
            players[keys[i]].update();
        }

        for (i = 0; i < traps.length; i++) {
            traps[i].render();
            traps[i].update();

            //console.log(traps[i]);
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
            let x = floor((mouseX + camera.x - (width / 2)) / TILESIZE);
            let y = floor((mouseY + camera.y - (height / 2)) / TILESIZE);

            //removes from 5 nodes in a "+" shape, made the digging feel much better
            dig(x + 1, y);
            dig(x - 1, y);
            dig(x, y + 1);
            dig(x, y - 1);
            dig(x, y);
        }
    }
}

function dig(x, y) {
    let chunkPos = testMap.globalToChunk(x,y);
    if(testMap.chunks[chunkPos.x+","+chunkPos.y] == undefined) return;

    x = x-(chunkPos.x*CHUNKSIZE);
    y = y-(chunkPos.y*CHUNKSIZE);
    let index = x + (y / CHUNKSIZE);

    if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] > 0) testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] -= 0.01;
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
