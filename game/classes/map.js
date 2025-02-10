var TILESIZE = 32;
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

    update(){
        let chunkPos = this.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
        let chunk = this.getChunk(chunkPos.x,chunkPos.y);
        if(chunk) chunk.update();
    }

    render(){
        let chunkPos = this.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
        for(let yOff = -1; yOff < 2; yOff++){
            for(let xOff = -1; xOff < 2; xOff++){
                let chunk = this.getChunk(chunkPos.x + xOff,chunkPos.y + yOff);
                if(chunk != undefined) chunk.render();
                
                if(Debuging){
                    push();
                    noFill();
                    stroke(255,0,0);
                    strokeWeight(2);
                    rect(((chunkPos.x+xOff)*CHUNKSIZE*TILESIZE)-camera.x+(width/2), ((chunkPos.y+yOff)*CHUNKSIZE*TILESIZE)-camera.y+(height/2), CHUNKSIZE*TILESIZE, CHUNKSIZE*TILESIZE);
                    fill(255);
                    noStroke();
                    textSize(15);
                    text((chunkPos.x + xOff)+","+(chunkPos.y + yOff), ((chunkPos.x+xOff)*CHUNKSIZE*TILESIZE)-camera.x+(width/2)+5, ((chunkPos.y+yOff)*CHUNKSIZE*TILESIZE)-camera.y+(height/2)+20);
                    pop();
                }
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
        this.objects = []; // list of objects (might need sorting if we make chunks bigger or have tons of objects in a chunk)
    }

    cordToScreen(x,y){
        let val = {};
        val.x = (x)*TILESIZE + (this.cx*CHUNKSIZE*TILESIZE)-camera.x+(width/2);
        val.y = (y)*TILESIZE + (this.cy*CHUNKSIZE*TILESIZE)-camera.y+(height/2);
        return val;
    }

    update(){
        for(let i = this.objects.length-1; i >= 0; i--){
            this.objects[i].update();
            if(this.objects[i].deleteTag){
                this.objects.splice(i, 1);
            }
        }
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
        // Chunk dimensions: 1600 by 1600
        let cpos = this.cordToScreen(0,0)
        image(dirtFloorImg, cpos.x, cpos.y, 1600, 1600 );

        push();
        beginClip();
        fill("#3B1725"); //old one is #3B1725
        //noStroke();
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

                //scCorners = [{x: x*TILESIZE/4, y: y*TILESIZE/4},{x: (x+1)*TILESIZE/4, y: y*TILESIZE/4},
                //             {x: (x+1)*TILESIZE/4, y: (y+1)*TILESIZE/4},{x: x*TILESIZE/4, y: (y+1)*TILESIZE/4}];
                
                //an attempt to reduce banding effects
                scCorners[0].x -= 1.5; scCorners[0].y -= 1.5;
                scCorners[1].x += 1.5; scCorners[1].y -= 1.5;
                scCorners[2].x += 1.5; scCorners[2].y += 1.5;
                scCorners[3].x -= 1.5; scCorners[3].y += 1.5;

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
                        rect(scCorners[0].x, scCorners[0].y, TILESIZE+1, TILESIZE+1);
                }
            }
        }

        endClip();
        image(chunkDirtImg, this.cx*CHUNKSIZE*TILESIZE - camera.x + width/2, this.cy*CHUNKSIZE*TILESIZE - camera.y + height/2, 1600, 1600);
        pop();
        for(let i = 0; i < this.objects.length; i++){
            this.objects[i].render("none", 255);
        }
    }
}

class Placeable{
    constructor(x,y,rot,w,h,z){
        this.pos = createVector(x,y);
        this.rot = rot;
        this.openBool = true;
        this.size = {w: w, h: h};
        this.deleteTag = false;
        this.z = z;
        /*
        3=decorations (ex. mugs, plates, flowers, papers)
        2=walls,doors,tables,chairs,chests
        1=rugs,traps
        0=floors, plants
        */
    }

    update(){

    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        fill(100, 100, 200, alpha);
        if(t == "green") fill(100, 200, 100, alpha);
        if(t == "red") fill(200, 100, 100, alpha);
        stroke(0);
        rect(-this.size.w/2, -this.size.h/2, this.size.w, this.size.h);
        circle(0,0,5);
        pop();
    }

    ghostRender(ob){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        
        this.openBool = ob;

        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        let chunk = testMap.chunks[chunkPos.x+","+chunkPos.y];
        for(let j = 0; j < chunk.objects.length; j++){
            if(this.z == chunk.objects[j].z){
                let d = chunk.objects[j].pos.dist(this.pos);
                if(d*2 < (chunk.objects[j].size.w+chunk.objects[j].size.h)/2 + (this.size.w+this.size.h)/2){
                    this.openBool = false;
                }
            }
        }

        if(this.openBool){
            let collisionChecks = [];
            collisionChecks.push(this.checkCollisions(
                round(((-1*cos(this.rot)*(this.size.w/2))-(-0.9*sin(this.rot)*(this.size.h/2)))/TILESIZE),
                round(((-1*sin(this.rot)*(this.size.w/2))+(-0.9*cos(this.rot)*(this.size.h/2)))/TILESIZE)
            ));
            collisionChecks.push(this.checkCollisions(
                round(((1*cos(this.rot)*(this.size.w/2))-(-1*sin(this.rot)*(this.size.h/2)))/TILESIZE),
                round(((1*sin(this.rot)*(this.size.w/2))+(-1*cos(this.rot)*(this.size.h/2)))/TILESIZE)
            ));
            collisionChecks.push(this.checkCollisions(
                round(((1*cos(this.rot)*(this.size.w/2))-(1*sin(this.rot)*(this.size.h/2)))/TILESIZE),
                round(((1*sin(this.rot)*(this.size.w/2))+(1*cos(this.rot)*(this.size.h/2)))/TILESIZE)
            ));
            collisionChecks.push(this.checkCollisions(
                round(((-1*cos(this.rot)*(this.size.w/2))-(1.1*sin(this.rot)*(this.size.h/2)))/TILESIZE),
                round(((-1*sin(this.rot)*(this.size.w/2))+(1.1*cos(this.rot)*(this.size.h/2)))/TILESIZE)
            ));
            for (let i = 0; i < collisionChecks.length; i++) {
                let check = collisionChecks[i];
                if (check.val == -1) this.openBool = false;
                if (check.val > 0) {
                    this.openBool = false;
                    //if (this.pos.dist(createVector(check.x+(check.cx*CHUNKSIZE*TILESIZE), check.y+(check.cy*CHUNKSIZE*TILESIZE))) < ((this.size.w+this.size.h)/2)-5 + (check.val * TILESIZE / 2)) {
                    //}
                }
            }
        }
        pop();

        if(this.openBool) this.render("green", 100); //green
        else this.render("red", 100); //red
    }

    checkCollisions(xOffset, yOffset) {
        let chunkPos = testMap.globalToChunk(this.pos.x+(xOffset*TILESIZE), this.pos.y+(yOffset*TILESIZE));

        let x = floor(this.pos.x / TILESIZE) - (chunkPos.x*CHUNKSIZE) + xOffset;
        let y = floor(this.pos.y / TILESIZE) - (chunkPos.y*CHUNKSIZE) + yOffset;
        if(Debuging){
            push();
            rotate(-this.rot);
            translate(camera.x-(width/2)-this.pos.x, camera.y-(height/2)-this.pos.y);
            fill(255);
            circle(((x+(chunkPos.x*CHUNKSIZE))*TILESIZE)-camera.x+(width/2),((y+(chunkPos.y*CHUNKSIZE))*TILESIZE)-camera.y+(height/2), 10);
            pop();
        }
        
        
        return {
            x: (x + 0.5) * TILESIZE,
            y: (y + 0.5) * TILESIZE,
            cx: chunkPos.x,
            cy: chunkPos.y,
            val: testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + (y / CHUNKSIZE)]
        };
        
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

function cleanChunk(cx,cy){
    let chunk = testMap.chunks[cx+","+cy];
    for (let x = 0; x < CHUNKSIZE; x++){
        for (let y = 0; y < CHUNKSIZE; y++){
            let index = x + (y / CHUNKSIZE);
            chunk.data[index] = 0; 
            socket.emit("update_node", {chunkPos: (cx+","+cy), index: index, val: 0});
        }
    }
}