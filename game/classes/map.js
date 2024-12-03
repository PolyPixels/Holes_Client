const TILESIZE = 16;
const CHUNKSIZE = 50; //how many nodes in 1 direction

class Map{
    constructor(){
        this.chunks = {}; //referance with a string "x,y"     {ex. chunks["0,0"]}
        this.chunkBools = {}; //same referance, just used so you dont ask for the same chunk tons of times undefined if never asked for, false if asked, true if loaded
    }

    getChunk(x,y){
        if(this.chunkBools[x+","+y] == undefined && this.chunks[x+","+y] == undefined){
            socket.emit("get_chunk", (x+","+y));
            this.chunkBools[x+","+y] = false;
        }
        if(this.chunkBools[x+","+y] = true) return this.chunks[x+","+y];
    }

    globalToChunk(x,y){
        let pos = {};
        pos.x = floor(x/(CHUNKSIZE*TILESIZE));
        pos.y = floor(y/(CHUNKSIZE*TILESIZE));
        return pos;
    }

    render(){
        let chunkPos = this.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
        for(let yOff = -2; yOff < 3; yOff++){
            for(let xOff = -2; xOff < 3; xOff++){
                let chunk = this.getChunk(chunkPos.x + xOff,chunkPos.y + yOff);
                if(chunk != undefined && yOff != -2 && yOff != 2 && xOff != -2 && xOff != 2) chunk.render();
                // push();
                // noFill();
                // stroke(255,0,0);
                // strokeWeight(2);
                // rect(((chunkPos.x+xOff)*CHUNKSIZE*TILESIZE)-camera.x+(width/2), ((chunkPos.y+yOff)*CHUNKSIZE*TILESIZE)-camera.y+(height/2), CHUNKSIZE*TILESIZE, CHUNKSIZE*TILESIZE);
                // pop();
            }
        }

        push();
        fill(255); // Set the text color to white
        textSize(16); // Optional: Set text size for readability
        text('Players: ' + (Object.keys(players).length +1), 50, 50); // Display the number of players
        pop();
    }
}

class Chunk{
    constructor(x,y){
        this.data = []; // Data is very obvious, -1 is unbreakable, 0 is nothing, >0 is block
        this.cx = x; //chunk pos x
        this.cy = y; //chunk pos y
    }

    cordToScreen(x,y){
        let val = {};
        val.x = (x)*TILESIZE + (this.cx*CHUNKSIZE*TILESIZE)-camera.x+(width/2);
        val.y = (y)*TILESIZE + (this.cy*CHUNKSIZE*TILESIZE)-camera.y+(height/2);
        return val;
    }
  
    DebugDraw(){
        push();
        for (let x = 0; x < CHUNKSIZE; x++){
            for (let y = 0; y < CHUNKSIZE; y++){
                let index = x + (y / CHUNKSIZE);
                let pos = this.cordToScreen(x,y);
                fill(map(this.data[index], 0, 1, 255, 0));
                circle(pos.x, pos.y, this.data[index]*TILESIZE);
            }
        }
        pop();
    }
  
    render(){
        fill("#3B1725");
        noStroke();
        for (let x = 0; x < CHUNKSIZE; x++){
            for (let y = 0; y < CHUNKSIZE; y++){
                //holds the values at each corner
                let corners = [this.data[x+(y/CHUNKSIZE)],this.data[x+1+(y/CHUNKSIZE)],
                               this.data[x+1+((y+1)/CHUNKSIZE)],this.data[x+((y+1)/CHUNKSIZE)]];
                if(x == CHUNKSIZE-1){
                    if(testMap.chunks[(this.cx+1)+","+this.cy] != undefined){
                        corners[1] = testMap.chunks[(this.cx+1)+","+this.cy].data[(y/CHUNKSIZE)];
                        corners[2] = testMap.chunks[(this.cx+1)+","+this.cy].data[((y+1)/CHUNKSIZE)];
                    }
                }
                if(y == CHUNKSIZE-1){
                    if(testMap.chunks[this.cx+","+(this.cy+1)] != undefined){
                        corners[2] = testMap.chunks[this.cx+","+(this.cy+1)].data[x+1];
                        corners[3] = testMap.chunks[this.cx+","+(this.cy+1)].data[x];
                    }
                }
                for(let i=0; i < 4; i++){
                    if(corners[i] == -1) corners[i] = 1;
                    corners[i] += 0.7;
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
                
                //draw the specific shape based on which corner values > 0
                switch(state){
                    case 1:
                        //line(c.x,c.y,d.x,d.y);
                        beginShape();
                        vertex(scCorners[3].x, scCorners[3].y);
                        vertex(c.x,c.y);
                        vertex(d.x,d.y);
                        endShape();
                        circle(scCorners[3].x, scCorners[3].y, (corners[3]-0.6)*TILESIZE);  //TODO: revisit small nodes rendering werid
                        break;
                    case 2:
                        //line(b.x,b.y,c.x,c.y);
                        beginShape();
                        vertex(scCorners[2].x, scCorners[2].y);
                        vertex(b.x,b.y);
                        vertex(c.x,c.y);
                        endShape();
                        circle(scCorners[2].x, scCorners[2].y, (corners[2]-0.6)*TILESIZE);  //TODO: revisit small nodes rendering werid
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
                        circle(scCorners[1].x, scCorners[1].y, (corners[1]-0.6)*TILESIZE);  //TODO: revisit small nodes rendering werid
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
                        circle(scCorners[0].x, scCorners[0].y, (corners[0]-0.6)*TILESIZE);  //TODO: revisit small nodes rendering werid
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
                        rect(scCorners[0].x, scCorners[0].y, TILESIZE, TILESIZE);
                }
            }
        }
    }
}

//converts corner values into a binary number? resulting in a uniqe int for each possible combination of corner vals
function getState(c1,c2,c3,c4){
    let val = 0;
    if(c1 >= 1) val+=8
    if(c2 >= 1) val+=4
    if(c3 >= 1) val+=2
    if(c4 >= 1) val+=1
    return val;
}