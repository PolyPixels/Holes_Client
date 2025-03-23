// Player.js

const BASE_SPEED = 5;

var curPlayer; //Your player
var players = {}; //other players

//player globals
var dirtInv = 0;
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

    newCollisionPoint(xOffset, yOffset) {
        let chunkPos = testMap.globalToChunk(this.pos.x+(xOffset*TILESIZE), this.pos.y+(yOffset*TILESIZE));
        
        let x = floor(this.pos.x / TILESIZE) - (chunkPos.x*CHUNKSIZE) + xOffset;
        let y = floor(this.pos.y / TILESIZE) - (chunkPos.y*CHUNKSIZE) + yOffset;
        if(Debuging){
            push();
            fill(255);
            circle(((x+(chunkPos.x*CHUNKSIZE))*TILESIZE)-camera.x+(width/2),((y+(chunkPos.y*CHUNKSIZE))*TILESIZE)-camera.y+(height/2), 10);
            pop();
        }
        
        if(testMap.chunks[chunkPos.x+","+chunkPos.y] == undefined){ //if you dont have that chunk assume there is no dirt in the way
            return {
                x: (x + 0.5) * TILESIZE,
                y: (y + 0.5) * TILESIZE,
                cx: chunkPos.x,
                cy: chunkPos.y,
                val: 0
            };
        }

        return {
            x: (x + 0.5) * TILESIZE,
            y: (y + 0.5) * TILESIZE,
            cx: chunkPos.x,
            cy: chunkPos.y,
            val: testMap.chunks[chunkPos.x+","+chunkPos.y].data[x + (y / CHUNKSIZE)]
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
            collisionChecks.push(this.newCollisionPoint( 1, -1));
            collisionChecks.push(this.newCollisionPoint( 0, -1));
            collisionChecks.push(this.newCollisionPoint( -1, -1));
        }
        if (this.holding.a) {
            this.pos.x += -BASE_SPEED*this.statBlock.stats.runningSpeed; //*(2*deltaTime/frameRate()) removed while frameRate() is low
            this.direction = 'left';
            collisionChecks.push(this.newCollisionPoint( -1,  1));
            collisionChecks.push(this.newCollisionPoint( -1,  0));
            collisionChecks.push(this.newCollisionPoint( -1, -1));
        }
        if (this.holding.s) {
            this.pos.y += BASE_SPEED*this.statBlock.stats.runningSpeed; //*(2*deltaTime/frameRate()) removed while frameRate() is low
            this.direction = 'down';
            collisionChecks.push(this.newCollisionPoint( 1, 1));
            collisionChecks.push(this.newCollisionPoint( 0, 1));
            collisionChecks.push(this.newCollisionPoint( -1, 1));
        }
        if (this.holding.d) {
            this.pos.x += BASE_SPEED*this.statBlock.stats.runningSpeed; //*(2*deltaTime/frameRate()) removed while frameRate() is low
            this.direction = 'right';
            collisionChecks.push(this.newCollisionPoint(1,  1));
            collisionChecks.push(this.newCollisionPoint(1,  0));
            collisionChecks.push(this.newCollisionPoint(1, -1));
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
            if (check.val > 0) {
                if (this.pos.dist(createVector(check.x+(check.cx*CHUNKSIZE*TILESIZE), check.y+(check.cy*CHUNKSIZE*TILESIZE))) < 16 + (check.val * TILESIZE / 2)) {
                    this.pos = oldPos;
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
        translate(-camera.x+(width/2), -camera.y+(height/2));
        fill(255);
        textSize(10);
        textAlign(CENTER);
        text(this.name, this.pos.x, this.pos.y - 40); // Display player's name above the character
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
        //translate(-camera.x+(width/2), -camera.y+(height/2));

        // Draw health bar background
        fill(255, 0, 0);
        noStroke();
        rect(this.pos.x - 16, this.pos.y + 40, 32, 6);

        // Draw health bar foreground (based on current health)
        fill(0, 255, 0); // Green for health
        let healthWidth = constrain(map(this.statBlock.stats.hp, 0, this.statBlock.stats.mhp, 0, 32),0,32);
        rect(this.pos.x - 16, this.pos.y + 40, healthWidth, 6);

        pop();
    }

    animationCreate(anim) {
        switch (anim) {
            case "put": { this.animationFrame = 4; } break;
        }
        this.animationType = anim;
    }
}