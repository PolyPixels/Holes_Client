// Player.js

const BASE_HEALTH = 100;
const BASE_SPEED = 5;

class Player {
    constructor(x, y, health = BASE_HEALTH, id, color,race, name ) {
        this.id = id; // socket ID
        this.pos = createVector(x, y);
        this.hp = health;
        this.mhp = BASE_HEALTH;
        this.holding = { w: false, a: false, s: false, d: false }; // Movement keys state
        this.race = race; // Race index
        this.name = name;
        this.color = color || { r: 255, g: 5, b: 5 };

        // Animation properties
        this.currentFrame = 0; // Current frame for animation
        this.direction = 'down'; // Default direction
        this.frameCount = 4; // Number of frames per direction
    }

    checkCollisions(xOffset, yOffset) {
        let chunkPos = testMap.globalToChunk(this.pos.x+(xOffset*TILESIZE), this.pos.y+(yOffset*TILESIZE));

        let x = floor(this.pos.x / TILESIZE) - (chunkPos.x*CHUNKSIZE) + xOffset;
        let y = floor(this.pos.y / TILESIZE) - (chunkPos.y*CHUNKSIZE) + yOffset;
        if(Debuging){
            push();
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

    update() {
        //dont update players not in your chunks
        let chunkPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        if(testMap.chunks[chunkPos.x+","+chunkPos.y] == undefined) return;
        
        let oldPos = this.pos.copy();
        let collisionChecks = [];

        if (this.holding.w) {
            this.pos.y += -BASE_SPEED;
            this.direction = 'up';
            collisionChecks.push(this.checkCollisions( 1, -1));
            collisionChecks.push(this.checkCollisions( 0, -1));
            collisionChecks.push(this.checkCollisions(-1, -1));
        }
        if (this.holding.a) {
            this.pos.x += -BASE_SPEED;
            this.direction = 'left';
            collisionChecks.push(this.checkCollisions(-1,  1));
            collisionChecks.push(this.checkCollisions(-1,  0));
            collisionChecks.push(this.checkCollisions(-1, -1));
        }
        if (this.holding.s) {
            this.pos.y += BASE_SPEED;
            this.direction = 'down';
            collisionChecks.push(this.checkCollisions( 1, 1));
            collisionChecks.push(this.checkCollisions( 0, 1));
            collisionChecks.push(this.checkCollisions(-1, 1));
        }
        if (this.holding.d) {
            this.pos.x += BASE_SPEED;
            this.direction = 'right';
            collisionChecks.push(this.checkCollisions(1,  1));
            collisionChecks.push(this.checkCollisions(1,  0));
            collisionChecks.push(this.checkCollisions(1, -1));
        }

        // Handle collisions
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
        if (this.holding.w || this.holding.a || this.holding.s || this.holding.d) {
            this.currentFrame = (this.currentFrame + (1/7)) % this.frameCount;
        } else {
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
    text(this.name, this.pos.x, this.pos.y - 25); // Display player's name above the character
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
    fill(255, 0, 0);
    noStroke();

    // Draw health bar background
    rect(this.pos.x - 16, this.pos.y + 20, 32, 6);

    // Draw health bar foreground (based on current health)
    fill(0, 255, 0); // Green for health
    let healthWidth = map(this.hp, 0, this.mhp, 0, 32);
    rect(this.pos.x - 16, this.pos.y + 20, healthWidth, 6);

    pop();
  }
}
