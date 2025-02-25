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
        if (testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] < 1.3 && testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] !== -1){
            testMap.chunks[chunkPos.x+","+chunkPos.y].data[index] -= amt;
        }
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
    line(
        tempRay.x*TILESIZE -camera.x+(width/2), 
        tempRay.y*TILESIZE -camera.y+(height/2), 
        (chunkPos.x*CHUNKSIZE+floor(x))*TILESIZE -camera.x+(width/2), 
        (chunkPos.y*CHUNKSIZE+floor(y))*TILESIZE -camera.y+(height/2)
    );
    pop();

    return {cx: chunkPos.x, cy: chunkPos.y, x: floor(x), y: floor(y)};
}