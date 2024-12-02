const TILESIZE = 16;

class Map{
    constructor(){
        this.chunks = {}; //referance with a string "x,y"     {ex. chunks["0,0"]}
    }

    getChunk(x,y){
        if(this.chunks[x+","+y] == undefined){
            socket.emit("get_chunk", (x+","+y));
        }
        return this.chunks[x+","+y];
    }

    render(){
        if(this.chunks["0,0"] != undefined) this.chunks["0,0"].render();

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
        this.size = {};
        this.size.x = 800 / TILESIZE;
        this.size.y = 800 / TILESIZE;
        this.cx = x; //chunk pos x
        this.cy = y; //chunk pos y
    }

    cordToScreen(x,y){
        let val = {};
        val.x = (x+0.5)*TILESIZE + (this.cx*this.size.x*TILESIZE)-camera.x+(width/2);
        val.y = (y+0.5)*TILESIZE + (this.cy*this.size.y*TILESIZE)-camera.y+(height/2);
        return val;
    }
  
    DebugDraw(){
        push();
        for (let x = 0; x < this.size.x; x++){
            for (let y = 0; y < this.size.y; y++){
                let index = x + (y / this.size.x);
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
        for (let x = 0; x < this.size.x-1; x++){
            for (let y = 0; y < this.size.y-1; y++){
                //holds the values at each corner
                let corners = [this.data[x+(y/this.size.x)],this.data[x+1+(y/this.size.x)],
                               this.data[x+1+((y+1)/this.size.x)],this.data[x+((y+1)/this.size.x)]];
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