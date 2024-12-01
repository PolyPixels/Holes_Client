function Map(w, h, grid) // FIXME: This whole thing could be way more performant
{
  this.data = [];
  this.WIDTH = w
  this.HEIGHT = h;
  this.tileSize = grid;
  
  this.cordToScreen = function(x,y){
    let val = {};
    val.x = (x+0.5)*this.tileSize;
    val.y = (y+0.5)*this.tileSize;
    return val;
  }
  
  this.DebugDraw = function()
  {
    for (let x = 0; x < this.WIDTH; x++)
    {
      for (let y = 0; y < this.HEIGHT; y++)
      {
        let index = x + (y / this.WIDTH);
        fill(map(this.data[index], 0, 1, 255, 0));
        //rect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        circle((x+0.5)*this.tileSize, (y+0.5)*this.tileSize, this.data[index]*this.tileSize);
      }
    }
  }
  
  this.render = function()
  {


    fill("#3B1725");
    noStroke();
    
    rect(0,0,this.tileSize/2,height);
    rect(0,0,width,this.tileSize/2);
    rect(width-this.tileSize/2,0,this.tileSize/2,height);
    rect(0,height-this.tileSize/2,width,this.tileSize/2);
    for (let x = 0; x < this.WIDTH-1; x++){
      for (let y = 0; y < this.HEIGHT-1; y++){
        //holds the values at each corner
        let corners = [this.data[x+(y/this.WIDTH)],this.data[x+1+(y/this.WIDTH)],
                      this.data[x+1+((y+1)/this.WIDTH)],this.data[x+((y+1)/this.WIDTH)]];
        for(let i=0; i < 4; i++){
          if(corners[i] == -1) corners[i] = 1;
          corners[i] += 0.6;
        }
        //holds the screen cordinates of each corner
        let scCorners = [this.cordToScreen(x,y),this.cordToScreen(x+1,y),
                        this.cordToScreen(x+1,y+1),this.cordToScreen(x,y+1)];
        let state = getState(corners[0],corners[1],corners[2],corners[3]);
        let amt = 0;

        //Visual Representation of positions:
        //                   
        //  sc[0]--a--sc[1]  
        //    |         |    
        //    d         b    
        //    |         |    
        //  sc[3]--c--sc[2]  
        //                   

        //the side positions, adjsted based on the values at each corner
        let a = {x: 0, y: scCorners[0].y};
        amt = (1-corners[0])/(corners[1]-corners[0]);
        a.x = lerp(scCorners[0].x,scCorners[1].x,amt);

        let b = {x: scCorners[1].x, y: 0};
        amt = (1-corners[1])/(corners[2]-corners[1]);
        b.y = lerp(scCorners[1].y,scCorners[2].y,amt);

        let c = {x: 0, y: scCorners[2].y};
        amt = (1-corners[2])/(corners[3]-corners[2]);
        c.x = lerp(scCorners[2].x,scCorners[3].x,amt);

        let d = {x: scCorners[0].x, y: 0};
        amt = (1-corners[0])/(corners[3]-corners[0]);
        d.y = lerp(scCorners[0].y,scCorners[3].y,amt);

        
        //strokeWeight(5);
        //stroke(100,50,0);
        push();
        
        fill(255); // Set the text color to white
        textSize(16); // Optional: Set text size for readability
        text('Players: ' + (Object.keys(players).length +1), 100, 50); // Display the number of players
        pop();
        
        

        //draw the specific shape based on which corner values > 0
        switch(state){
          case 1:
            //line(c.x,c.y,d.x,d.y);
            beginShape();
            vertex(scCorners[3].x, scCorners[3].y);
            vertex(c.x,c.y);
            vertex(d.x,d.y);
            endShape();
            break;
          case 2:
            //line(b.x,b.y,c.x,c.y);
            beginShape();
            vertex(scCorners[2].x, scCorners[2].y);
            vertex(b.x,b.y);
            vertex(c.x,c.y);
            endShape();
            break;
          case 3:
            //line(b.x,b.y,d.x,d.y);
            beginShape();
            vertex(scCorners[2].x, scCorners[2].y);
            vertex(b.x,b.y);
            vertex(d.x,d.y);
            vertex(scCorners[3].x, scCorners[3].y);
            endShape();
            break;
          case 4:
            //line(b.x,b.y,a.x,a.y);
            beginShape();
            vertex(scCorners[1].x, scCorners[1].y);
            vertex(b.x,b.y);
            vertex(a.x,a.y);
            endShape();
            break;
          case 5:
            //line(a.x,a.y,d.x,d.y);
            //line(b.x,b.y,c.x,c.y);
            beginShape();
            vertex(a.x,a.y);
            vertex(scCorners[1].x, scCorners[1].y);
            vertex(b.x,b.y);
            vertex(c.x,c.y);
            vertex(scCorners[3].x, scCorners[3].y);
            vertex(d.x,d.y);
            endShape();
            break;
          case 6:
            //line(a.x,a.y,c.x,c.y);
            beginShape();
            vertex(scCorners[1].x, scCorners[1].y);
            vertex(a.x,a.y);
            vertex(c.x,c.y);
            vertex(scCorners[2].x, scCorners[2].y);
            endShape();
            break;
          case 7:
            //line(a.x,a.y,d.x,d.y);
            beginShape();
            vertex(scCorners[1].x, scCorners[1].y);
            vertex(scCorners[2].x, scCorners[2].y);
            vertex(scCorners[3].x, scCorners[3].y);
            vertex(d.x,d.y);
            vertex(a.x,a.y);
            endShape();
            break;
          case 8:
            //line(a.x,a.y,d.x,d.y);
            beginShape();
            vertex(scCorners[0].x, scCorners[0].y);
            vertex(a.x,a.y);
            vertex(d.x,d.y);
            endShape();
            break;
          case 9:
            //line(a.x,a.y,c.x,c.y);
            beginShape();
            vertex(scCorners[0].x, scCorners[0].y);
            vertex(a.x,a.y);
            vertex(c.x,c.y);
            vertex(scCorners[3].x, scCorners[3].y);
            endShape();
            break;
          case 10:
            //line(a.x,a.y,b.x,b.y);
            //line(d.x,d.y,c.x,c.y);
            beginShape();
            vertex(scCorners[0].x, scCorners[0].y);
            vertex(a.x,a.y);
            vertex(b.x,b.y);
            vertex(scCorners[2].x, scCorners[2].y);
            vertex(c.x,c.y);
            vertex(d.x,d.y);
            endShape();
            break;
          case 11:
            //line(a.x,a.y,b.x,b.y);
            beginShape();
            vertex(a.x,a.y);
            vertex(b.x,b.y);
            vertex(scCorners[2].x, scCorners[2].y);
            vertex(scCorners[3].x, scCorners[3].y);
            vertex(scCorners[0].x, scCorners[0].y);
            endShape();
            break;
          case 12:
            //line(b.x,b.y,d.x,d.y);
            beginShape();
            vertex(b.x,b.y);
            vertex(d.x,d.y);
            vertex(scCorners[0].x, scCorners[0].y);
            vertex(scCorners[1].x, scCorners[1].y);
            endShape();
            break;
          case 13:
            //line(b.x,b.y,c.x,c.y);
            beginShape();
            vertex(b.x,b.y);
            vertex(c.x,c.y);
            vertex(scCorners[3].x, scCorners[3].y);
            vertex(scCorners[0].x, scCorners[0].y);
            vertex(scCorners[1].x, scCorners[1].y);
            endShape();
            break;
          case 14:
            //line(c.x,c.y,d.x,d.y);
            beginShape();
            vertex(c.x,c.y);
            vertex(d.x,d.y);
            vertex(scCorners[0].x, scCorners[0].y);
            vertex(scCorners[1].x, scCorners[1].y);
            vertex(scCorners[2].x, scCorners[2].y);
            endShape();
            break;
          case 15:
            rect(scCorners[0].x, scCorners[0].y, this.tileSize, this.tileSize);
        }
      }
    }
  }
}

//converts corner values into a binary number? resulting in a uniqe int for each possible combination of corner vals
function getState(c1,c2,c3,c4){
  let val = 0;
  if(c1 >= 1){val+=8}
  if(c2 >= 1){val+=4}
  if(c3 >= 1){val+=2}
  if(c4 >= 1){val+=1}
  return val;
}


//TODO: Move map to server side

let gameState ="initial"
let testMap; // Create a map object
var socket; //Connection to the server
var curPlayer; //Your player
var lastHolding;
var players = {}; //other players WHY IS THIS AN OBJECT  ?? ??
var traps = []
var projectiles = []
var collisionChecks = []; //for debugging

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);  // Resize canvas when window size changes
}
function setup() {
  let cnv = createCanvas(800, 800);
  cnv.parent('canvas-container'); 
  background(220);

  // Prevent right-click context menu on all p5.js canvases
  const canvases = document.getElementsByClassName("p5Canvas");
  for (let element of canvases) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  socket = io.connect("http://localhost:3000");

  //all caps means it came from the server
  //all lower means it came from the client

  socket.on("GIVE_MAP", (data) => {
    let keys = Object.keys(data);
    for(let i=0; i<keys.length; i++) testMap.data[keys[i]] = data[keys[i]];
  });

  socket.on("NEW_PLAYER", (data) => {
    players[data.id] = new Player(data.pos.x, data.pos.y, data.hp, data.id,data.color,data.race,data.name);

    players[data.id].color = data.color
  });

  socket.on("OLD_DATA", (data) => {
    console.log(data);
    let keys = Object.keys(data.players);  // Ensure we're getting an array of player IDs

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
    console.log(data)
    curPlayer = new Player(width/2, height/2, 100, data.id,data.color); //only create your player once your given your socket id
 
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
        if (players[playerId]) { // Check if the player exists in the game state
          players[playerId].pos.x = playerData.pos.x;
          players[playerId].pos.y = playerData.pos.y;
          players[playerId].hp = playerData.hp;
        }
      }
    }
  });
  

  socket.on("UPDATE_POS", (data) => {
    if(!data) return
    if(!data.pos) return


    players[data.id].pos.x = data.pos.x;
    players[data.id].pos.y = data.pos.y;
    players[data.id].hp = data.hp;
    players[data.id].holding = data.holding;


    //players[data.id].color = data.color
  });

  socket.on("UPDATE_NODE", (data) => {
    testMap.data[data.index] = data.val;
  })

  socket.on("REMOVE_PLAYER", (data) => {
    players[data] = []

    delete players[data];
    console.log()
  });

  socket.on("spawn_trap", (data) => {
    console.log(data, "handle")
    let newT = new Trap(data.x,data.y,10,socket.id,data.color,data.ownerName)
    traps.push(newT)
  })


  socket.on("use_trap", (data) => {
    //hit a player 
    //does damage add damager to the player
  })

  const grid = 16;
  testMap = new Map(width / grid, height / grid, grid); // WIDTH, HEIGHT, GRID SIZE

  // FIXME: Do not draw the debug
  //testMap.DebugDraw();

  // Create race selection buttons for Gnome, Skizard, Aylah
  raceButtons.push(createButton('Gnome'));
  raceButtons.push(createButton('Skizard'));
  raceButtons.push(createButton('Aylah'));
  
  // Position the buttons and add functionality
  raceButtons.forEach((btn, index) => {
    btn.position(width -300, height / 2 + 50 + index * 60);
    btn.mousePressed(() => selectRace(index)); // Trigger race selection on button press
    btn.hide(); // Initially hide buttons
  });

  // Create input field for user name
  nameInput = createInput('');
  nameInput.position(width -300, height / 2 + 250);
  nameInput.input(checkName); // Check if name is entered
  nameInput.hide(); // Initially hide the input field

  // Create the "Go" button (initially disabled)
  goButton = createButton('Go');
  goButton.position(width  -300, height / 2 + 350);
  goButton.attribute('disabled', true); // Disable initially
  goButton.mousePressed(() => {

    socket.emit("new_player", curPlayer);
    gameState = "playing"
    
  }); // Trigger the start game function
  goButton.hide(); // Initially hide the Go button

  // Data is very obvious, -1 is unbreakable, 0 is nothing, >0 is block
}
function selectRace(raceIndex) {
  raceSelected = true; // Set race selected flag to true
  curPlayer.race = raceIndex
  console.log('Race selected: ' + raceButtons[raceIndex].html());
}


        function keyReleased() {
            if (keyCode === 32 && !keyReleasedFlag) { // Check if the spacebar is released
                console.log("Trap created");
        
                // Create a new trap at the player's position
                let newT = new Trap(curPlayer.pos.x, curPlayer.pos.y, 10, curPlayer.id, curPlayer.color, curPlayer.ownerName);
                traps.push(newT);
        
                // Emit the trap creation to the server
                socket.emit("spawn_trap", { x: curPlayer.pos.x, y: curPlayer.pos.y, ownerName: curPlayer.name, color: curPlayer.color });
        
                // Set the flag to true so the trap is created only once on key release
                keyReleasedFlag = true;
            }
        }
        
        function keyPressed() {
            if (keyCode === 32) { // Check if spacebar is pressed
                keyReleasedFlag = false; // Reset the flag when the key is pressed
            }
        }

// Function to check if a name is entered
function checkName() {
  console.log(nameInput.value())
  curPlayer.name = nameInput.value()
  if (nameInput.value().length > 0) {
    nameEntered = true; // Set name entered flag to true
  } else {
    nameEntered = false; // Set name entered flag to false
  }
}
let raceSelected = false; // Flag to track if a race is selected
let nameEntered = false; // Flag to track if a name is entered
let raceButtons = [];
let goButton;
let nameInput;
function draw(){
    background("#71413B");

    if(gameState == "initial") {
      nameInput.show();
      goButton.show();
        // Position the buttons and add functionality
  raceButtons.forEach((btn, index) => {
    btn.position(width / 2 - 150, height / 2 + 50 + index * 60);
    btn.mousePressed(() => selectRace(index)); // Trigger race selection on button press
    btn.show(); // Initially hide buttons
  });
      // picking user
      push()
      
      fill(255)
      textSize(40); // Optional: Set text size for readability
      text("Pick A Race", width-500, height -500); 

      pop()
          // Check if both race and name are selected/entered to enable the "Go" button
          if (raceSelected && nameEntered) {
            goButton.removeAttribute('disabled');
          } else {
            goButton.attribute('disabled', true);
          }
    }else {
      // normal game 
      nameInput.hide();
      goButton.hide();
      // Position the buttons and add functionality
  raceButtons.forEach((btn, index) => {
    btn.position(width / 2 - 150, height / 2 + 50 + index * 60);
    btn.mousePressed(() => selectRace(index)); // Trigger race selection on button press
    btn.hide(); // Initially hide buttons
  });


    if(testMap.data.length > 0) testMap.render();
    //if(testMap.data.length > 0) testMap.DebugDraw();

    if(curPlayer){
        curPlayer.render();
        curPlayer.update();
    }

    let keys = Object.keys(players);
    for(i = 0; i < keys.length; i++) {
        players[keys[i]].render(); 
        players[keys[i]].update();
    }

    for(i = 0; i < traps.length; i++) {
        traps[i].render(); 
        traps[i].update();

        console.log(traps[i])
    }

    if(curPlayer){
        lastHolding = curPlayer.holding; //copy to compare to later

        //default all keys to not holding them
        curPlayer.holding = {w: false, a: false, s: false, d: false};

        //Player Controls
        if(keyIsDown(87)) curPlayer.holding.w = true; //w
        if(keyIsDown(65)) curPlayer.holding.a = true; //a
        if(keyIsDown(83)) curPlayer.holding.s = true; //s
        if(keyIsDown(68)) curPlayer.holding.d = true; //d 
   
        if(lastHolding.w != curPlayer.holding.w || lastHolding.a != curPlayer.holding.a || lastHolding.s != curPlayer.holding.s || lastHolding.d != curPlayer.holding.d){
            socket.emit("update_pos", curPlayer);
        }
    }

    if(mouseIsPressed){ //does the digging
      let x = floor(mouseX/testMap.tileSize);
      let y = floor(mouseY/testMap.tileSize);

      //removes from 5 nodes in a "+" shape, made the digging feel much better
      let index = x + (y / testMap.WIDTH);
      if(testMap.data[index] > 0) testMap.data[index] -= 0.01;
      if(testMap.data[index] < 0.2 && testMap.data[index] !== -1) testMap.data[index] = 0;
      socket.emit("update_node", {index: index, val: testMap.data[index]});

      index = (x + 1) + (y / testMap.WIDTH);
      if(testMap.data[index] > 0) testMap.data[index] -= 0.01;
      if(testMap.data[index] < 0.2 && testMap.data[index] !== -1) testMap.data[index] = 0;
      socket.emit("update_node", {index: index, val: testMap.data[index]});

      index = (x - 1) + (y / testMap.WIDTH);
      if(testMap.data[index] > 0) testMap.data[index] -= 0.01;
      if(testMap.data[index] < 0.2 && testMap.data[index] !== -1) testMap.data[index] = 0;
      socket.emit("update_node", {index: index, val: testMap.data[index]});

      index = x + ((y + 1) / testMap.WIDTH);
      if(testMap.data[index] > 0) testMap.data[index] -= 0.01;
      if(testMap.data[index] < 0.2 && testMap.data[index] !== -1) testMap.data[index] = 0;
      socket.emit("update_node", {index: index, val: testMap.data[index]});

      index = x + ((y - 1) / testMap.WIDTH);
      if(testMap.data[index] > 0) testMap.data[index] -= 0.01;
      if(testMap.data[index] < 0.2 && testMap.data[index] !== -1) testMap.data[index] = 0;
      socket.emit("update_node", {index: index, val: testMap.data[index]});
    }
  }
}
