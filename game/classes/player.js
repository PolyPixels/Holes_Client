// Player.js

const BASE_SPEED = 5;

var curPlayer; //Your player
var players = {}; //other players

//player globals
var dirtInv = 0;
var maxDirtInv = 300;
var buildMode = false;
var renderGhost = false;
var wantRotate = true;
var ghostBuild;
var DIGSPEED = 0.04;

class Player {
    constructor(x, y, health, id, color,race, name ) {
        this.id = id; // socket ID
        this.pos = createVector(x, y);
        this.holding = { w: false, a: false, s: false, d: false }; // Movement keys state
        this.race = race; // Race index
        this.name = name;
        this.color = color; //team color index
        this.statBlock = new StatBlock(this.race, health);
        this.invBlock = new InvBlock();
        this.alignment = 50;
        this.moving = false;

        // Animation properties
        this.currentFrame = 0; // Current frame for animation
        this.direction = 'down'; // Default direction
        this.animationFrame = 0;
        this.animationType = ""; // Name of current animation
    }

    newCollisionPoint(xOffset, yOffset, direction) {
        let chunkPos = testMap.globalToChunk(this.pos.x+(xOffset*TILESIZE), this.pos.y+(yOffset*TILESIZE));

        if(testMap.chunks[chunkPos.x+","+chunkPos.y] == undefined){ //if you dont have that chunk assume there is dirt in the way
            return {
                dir: direction,
                val: -1
            };
        }
        
        let x = floor(this.pos.x / TILESIZE) - (chunkPos.x*CHUNKSIZE) + xOffset;
        let y = floor(this.pos.y / TILESIZE) - (chunkPos.y*CHUNKSIZE) + yOffset;

        let x2 = floor(this.pos.x / TILESIZE) - (chunkPos.x*CHUNKSIZE) + xOffset;
        let y2 = floor(this.pos.y / TILESIZE) - (chunkPos.y*CHUNKSIZE) + yOffset;

        if(direction == "up"){
            y2 -= 1;
        }
        if(direction == "down"){
            y2 += 1;
        }
        if(direction == "left"){
            x2 -= 1;
        }
        if(direction == "right"){
            x2 += 1;
        }

        let chunkPos2 = {};
        chunkPos2.x = chunkPos.x;
        chunkPos2.y = chunkPos.y;
        if(x2 < 0){
            chunkPos2.x -= 1;
            x2 = CHUNKSIZE-1;
        }
        if(x2 >= CHUNKSIZE){
            chunkPos2.x += 1;
            x2 = 0;
        }
        if(y2 < 0){
            chunkPos2.y -= 1;
            y2 = CHUNKSIZE-1;
        }
        if(y2 >= CHUNKSIZE){
            chunkPos2.y += 1;
            y2 = 0;
        }

        if(testMap.chunks[chunkPos2.x+","+chunkPos2.y] == undefined){ //if you dont have that chunk assume there is dirt in the way
            return {
                dir: direction,
                val: -1
            };
        }

        //MATH
        let val = testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + (y / CHUNKSIZE)];
        let val2 = testMap.chunks[chunkPos2.x+","+chunkPos2.y].data[x2 + (y2 / CHUNKSIZE)];

        if(val == -1 || val2 == -1){
            return {
                dir: direction,
                val: -1
            };
        }

        val+=0.7;
        val2+=0.7;

        let midpoint = {x: 0, y: 0};
        let amt = 0;
        if(direction == "up" || direction == "down"){
            midpoint.x = x;
        }
        if(direction == "left" || direction == "right"){
            midpoint.y = y;
        }

        if(direction == "up"){
            amt = (1-val)/(val2-val);
            midpoint.y = lerp(y,y2,amt);
        }
        if(direction == "down"){
            amt = (1-val)/(val2-val);
            midpoint.y = lerp(y,y2,amt);
        }
        if(direction == "left"){
            amt = (1-val2)/(val-val2);
            midpoint.x = lerp(x2,x,amt);
        }
        if(direction == "right"){
            amt = (1-val2)/(val-val2);
            midpoint.x = lerp(x2,x,amt);
        }


        if(Debuging){
            push();
            fill(255);
            circle(((x+(chunkPos.x*CHUNKSIZE))*TILESIZE)-camera.pos.x+(width/2),((y+(chunkPos.y*CHUNKSIZE))*TILESIZE)-camera.pos.y+(height/2), 10);
            circle(((x2+(chunkPos2.x*CHUNKSIZE))*TILESIZE)-camera.pos.x+(width/2),((y2+(chunkPos2.y*CHUNKSIZE))*TILESIZE)-camera.pos.y+(height/2), 10);

            fill(255,0,0);
            circle(((midpoint.x+(chunkPos2.x*CHUNKSIZE))*TILESIZE)-camera.pos.x+(width/2),((midpoint.y+(chunkPos2.y*CHUNKSIZE))*TILESIZE)-camera.pos.y+(height/2), 10);
            pop();
        }

        return {
            val: testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + (y / CHUNKSIZE)],
            val2: testMap.chunks[chunkPos2.x+","+chunkPos2.y].data[x2 + (y2 / CHUNKSIZE)],
            x: (midpoint.x + (chunkPos2.x * CHUNKSIZE)) * TILESIZE,
            y: (midpoint.y + (chunkPos2.y * CHUNKSIZE)) * TILESIZE,
            dir: direction
        };
        
    }

    update() {
        //dont update players not in your chunks
        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        if(testMap.chunks[chunkPos.x+","+chunkPos.y] == undefined) return;
        
        let oldPos = this.pos.copy();
        let collisionChecks = [];
        this.moving = (this.holding.w || this.holding.a || this.holding.s || this.holding.d);
        if (this.holding.w) {
            this.pos.y += -BASE_SPEED*this.statBlock.stats.runningSpeed; //*(2*deltaTime/frameRate()) removed while frameRate() is low
            this.direction = 'up';
            collisionChecks.push(this.newCollisionPoint( 0, 1, this.direction));
            collisionChecks.push(this.newCollisionPoint( 1, 1, this.direction));
        }
        if (this.holding.a) {
            this.pos.x += -BASE_SPEED*this.statBlock.stats.runningSpeed; //*(2*deltaTime/frameRate()) removed while frameRate() is low
            this.direction = 'left';
            collisionChecks.push(this.newCollisionPoint( 0,  1, this.direction));
            if(this.holding.w){
                collisionChecks.push(this.newCollisionPoint( 0,  2, this.direction));
            }
            else{
                collisionChecks.push(this.newCollisionPoint( 0,  0, this.direction));
            }
        }
        if (this.holding.s) {
            this.pos.y += BASE_SPEED*this.statBlock.stats.runningSpeed; //*(2*deltaTime/frameRate()) removed while frameRate() is low
            this.direction = 'down';
            collisionChecks.push(this.newCollisionPoint( 0, 1, this.direction));
            collisionChecks.push(this.newCollisionPoint( 1, 1, this.direction));
        }
        if (this.holding.d) {
            this.pos.x += BASE_SPEED*this.statBlock.stats.runningSpeed; //*(2*deltaTime/frameRate()) removed while frameRate() is low
            this.direction = 'right';

            collisionChecks.push(this.newCollisionPoint( 1,  1, this.direction));
            if(this.holding.w){
                collisionChecks.push(this.newCollisionPoint( 1,  2, this.direction));
            }
            else{
                collisionChecks.push(this.newCollisionPoint( 1,  0, this.direction));
            }
        }

        // Handle collisions
        let chunk = testMap.chunks[chunkPos.x+","+chunkPos.y];
        for(let j = 0; j < chunk.objects.length; j++){
            if(chunk.objects[j].z == 2){
                
                let d = chunk.objects[j].pos.dist(this.pos);
                if(d*2 < (chunk.objects[j].size.w+chunk.objects[j].size.h)/2 + 29){
                    if(chunk.objects[j].objName == "Door"){
                        if(chunk.objects[j].alpha == 255){
                            this.pos = oldPos;
                        }
                    }
                    else{
                        this.pos = oldPos;
                    }
                }
            }
        }

        for (let i = 0; i < collisionChecks.length; i++) {
            let check = collisionChecks[i];
            if (check.val == -1) this.pos = oldPos;
            if (check.val2 > 0) {
                if(check.dir == "up" || check.dir == "down"){
                    if(createVector(check.x, this.pos.y).dist(createVector(check.x, check.y)) < TILESIZE) this.pos.y = oldPos.y;
                }
                if(check.dir == "left" || check.dir == "right"){
                    if(createVector(this.pos.x, check.y).dist(createVector(check.x, check.y)) < TILESIZE) this.pos.x = oldPos.x;
                }
            }
        }

        // Update the current frame for animation
        if (this.moving) {
            this.animationFrame += (1/7);
            this.currentFrame = 1 + (this.animationFrame) % 4;
            if (this.currentFrame >= 4) this.currentFrame = 2;
        } else if (this.animationType != "") {
            switch (this.animationType) {
                case "put": { this.currentFrame = 4; } break;
            }

            this.animationFrame -= 1;
            if (this.animationFrame <= 0) {
                this.animationFrame = 0;
                this.animationType = "";
            }
        } else {
            this.animationFrame = 0;
            this.currentFrame = 0; // Reset to standing frame when not moving
        }
    }

    render() {
        //dont render players not in your chunks
        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        if(testMap.chunks[chunkPos.x+","+chunkPos.y] == undefined) return;
        push();
        // Move relative to the camera
        translate(-camera.pos.x + width/2, -camera.pos.y + height/2);
        
        // Decide how far above the character we want the label
        // For a "larger z" effect, increase this from 40 to e.g. 60 or 80
        const yOffset = 60;
        
        // Prepare text
        textSize(16);
        textAlign(CENTER, CENTER);
        let nameText = this.name;
        
        // Measure text width to draw a background rectangle around it
        let textW = textWidth(nameText) + 10;  // some padding
        let textH = 20;                        // approximate line height
        
        // Draw background box behind the text
        rectMode(CENTER);
        fill(0, 150);   // semi-transparent black
        noStroke();
        rect(this.pos.x, this.pos.y - yOffset, textW, textH, 4); // last param 4 = corner radius
        
        // Now draw text with a stroke
        stroke(0);       // black stroke around letters
        strokeWeight(2);
        fill(255);       // white fill
        text(nameText, this.pos.x, this.pos.y - yOffset);
       
        let raceName = races[this.race]
        // Select the correct image based on the direction and frame
        let imageToRender;
        if (this.direction === 'up') {
            imageToRender = raceImages[raceName].back[floor(this.currentFrame)]
        } else if (this.direction === 'down') {
            imageToRender = raceImages[raceName].front[floor(this.currentFrame)]
        } else if (this.direction === 'left') {
            imageToRender = raceImages[raceName].left[floor(this.currentFrame)]
        } else if (this.direction === 'right') {
            imageToRender = raceImages[raceName].right[floor(this.currentFrame)]
        }

        // Draw the character's image
        image(imageToRender, this.pos.x - 2*TILESIZE, this.pos.y - 2*TILESIZE, 4*TILESIZE, 4*TILESIZE, 0, 0, 29, 29); // Adjust size as needed

        this.renderHealthBar(); // Render health bar
        pop();
    }

    renderHealthBar() {
        push();
        
        // Set stroke and stroke weight for the outline
        stroke(0);        // Black stroke
        strokeWeight(2);  // Slightly thicker outline
        
        // Draw the health bar background with rounded corners
        fill(255, 0, 0);
        rect(
          this.pos.x, 
          this.pos.y + 40, 
          32,       // width 
          6,        // height
          3         // corner radius
        );
      
        // Calculate current health width
        let healthWidth = constrain(
          map(this.statBlock.stats.hp, 0, this.statBlock.stats.mhp, 0, 32),
          0,
          32
        );
      
        // Draw the health bar foreground
        // Switch to noStroke if you want the green bar to have no outline
        noStroke();
        fill(0, 255, 0); 
        rect(
          this.pos.x, 
          this.pos.y + 40, 
          healthWidth,
          6, 
          3  // same radius so the corners match up
        );
      
        pop();
      }
      

    animationCreate(anim) {
        switch (anim) {
            case "put": { this.animationFrame = 4; } break;
        }
        this.animationType = anim;
    }
}