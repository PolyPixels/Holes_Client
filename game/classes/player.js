const BASE_HEALTH = 100;
const BASE_SPEED = 5;
class Player {
    constructor(x, y, health = BASE_HEALTH, id, color,race, name ) {
        this.id = id; // socket ID
        this.pos = createVector(x, y);
        this.hp = health;
        this.mhp = BASE_HEALTH;
        this.holding = { w: false, a: false, s: false, d: false }; // Movement keys state
        this.race = race;
        this.name = name;
        // Set color with default fallback
        if (!color) {
            //console.log("color error");
            this.color = {r:255,g:5,b:5};
        } else {
            this.color ={r:color.r, g:color.g, b:color.b};
        }
    }

    checkCollisions(xOffset, yOffset, tileSize) {
        let x = floor(this.pos.x / tileSize) + xOffset;
        let y = floor(this.pos.y / tileSize) + yOffset;
        /*
        return {
            x: (x + 0.5) * tileSize,
            y: (y + 0.5) * tileSize,
            val: testMap.data[x + (y / testMap.HEIGHT)]
        };
        */
    }

    update() {
        let oldPos = this.pos.copy();
        let collisionChecks = [];

        if (this.holding.w) {
            this.pos.y += -BASE_SPEED;
            collisionChecks.push(this.checkCollisions(0, -1, TILESIZE));
        }
        if (this.holding.a) {
            this.pos.x += -BASE_SPEED;
            collisionChecks.push(this.checkCollisions(-1, 0, TILESIZE));
        }
        if (this.holding.s) {
            this.pos.y += BASE_SPEED;
            collisionChecks.push(this.checkCollisions(0, 1, TILESIZE));
        }
        if (this.holding.d) {
            this.pos.x += BASE_SPEED;
            collisionChecks.push(this.checkCollisions(1, 0, TILESIZE));
        }

        // Handle collisions
        for (let i = 0; i < collisionChecks.length; i++) {
            let check = collisionChecks[i];
            // if (check.val == -1) this.pos = oldPos;
            // if (check.val > 0) {
            //     if (this.pos.dist(createVector(check.x, check.y)) < 16 + (check.val * TILESIZE / 2)) {
            //         this.pos = oldPos;
            //     }
            // }
        }
    }

    render() {
        push();
        translate(-camera.x+(width/2), -camera.y+(height/2));
        fill(255);
        textSize(10); // Optional: Set text size for readability
        text(this.name, this.pos.x, this.pos.y -25); 
        fill(this.color.r,this.color.g,this.color.b);
        circle(this.pos.x, this.pos.y, 32); // TODO: Replace with character image
        pop();
        this.renderHealthBar();
    }

    renderHealthBar() {
        push();
        translate(-camera.x+(width/2), -camera.y+(height/2));
        fill(255,0,0);
        textSize(8); // Optional: Set text size for readability
        text(this.hp, this.pos.x, this.pos.y +25);
        rect(this.pos.x, this.pos.y+ 25, 5);
        pop();
    }
}
