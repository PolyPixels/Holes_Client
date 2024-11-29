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
    for (let x = 0; x < this.WIDTH-1; x++)
    {
      for (let y = 0; y < this.HEIGHT-1; y++)
      {
        let index = x + (y / this.WIDTH);
        
        let corners = [this.data[x+(y/this.WIDTH)],this.data[x+1+(y/this.WIDTH)],
                       this.data[x+1+((y+1)/this.WIDTH)],this.data[x+((y+1)/this.WIDTH)]];
        for(let i=0; i < 4; i++){
          if(corners[i] == -1) corners[i] = 1;
          corners[i] += 0.6;
        }
        let scCorners = [this.cordToScreen(x,y),this.cordToScreen(x+1,y),
                         this.cordToScreen(x+1,y+1),this.cordToScreen(x,y+1)];
        let state = getState(corners[0],corners[1],corners[2],corners[3]);
        let amt = 0;

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

function getState(c1,c2,c3,c4){
  let val = 0;
  if(c1 >= 1){val+=8}
  if(c2 >= 1){val+=4}
  if(c3 >= 1){val+=2}
  if(c4 >= 1){val+=1}
  return val;
}

//TODO: Move map to server side
let testMap; // Create a map object
var socket; //Connection to the server
var curPlayer; //Your player
var lastHolding;
var players = {}; //other players
var colisionIndex = []; //for debugging

function setup() {
  createCanvas(800, 800);
  background(220);

  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  socket = io.connect("http://localhost:3000");

  socket.on("GIVE_MAP", (data) => {
    let keys = Object.keys(data);
    for(let i=0; i<keys.length; i++) testMap.data[keys[i]] = data[keys[i]];
  });

  socket.on("NEW_PLAYER", (data) => {
    players[data.id] = new Player(data.pos.x, data.pos.y, data.hp, data.id);
  });

  socket.on("OLD_PLAYERS", (data) => {
    let keys = Object.keys(data);
    for(i = 0; i < keys.length; i++) players[keys[i]] = new Player(data[keys[i]].pos.x, data[keys[i]].pos.y, data[keys[i]].hp, keys[i]);
  });

  socket.on("YOUR_ID", (data) => {
    curPlayer = new Player(width/2, height/2, 100, data);
    socket.emit("new_player", curPlayer);
  });

  socket.on("UPDATE_ALL_POS", (data) => {
    let keys = Object.keys(data);
    for(i = 0; i < keys.length; i++){
        if(keys[i] == curPlayer.id) socket.emit("update_pos", curPlayer);
        else{
            players[keys[i]].pos.x = data[keys[i]].pos.x;
            players[keys[i]].pos.y = data[keys[i]].pos.y;
            players[keys[i]].hp = data[keys[i]].hp;
        }
    }
  });

  socket.on("UPDATE_POS", (data) => {
    players[data.id].pos.x = data.pos.x;
    players[data.id].pos.y = data.pos.y;
    players[data.id].hp = data.hp;
    players[data.id].holding = data.holding;
  });

  socket.on("UPDATE_NODE", (data) => {
    testMap.data[data.index] = data.val;
  })

  socket.on("REMOVE_PLAYER", (data) => {
    delete players[data];
  });

  const grid = 16;
  testMap = new Map(width / grid, height / grid, grid); // WIDTH, HEIGHT, GRID SIZE

  // FIXME: Do not draw the debug
  //testMap.DebugDraw();

  // Data is very obvious, -1 is unbreakable, 0 is nothing, >0 is block
}

function draw(){
    background("#71413B");
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

    if(mouseIsPressed){
      let x = floor(mouseX/testMap.tileSize);
      let y = floor(mouseY/testMap.tileSize);
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
