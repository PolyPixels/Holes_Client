
class Trap {
    constructor(x, y, health = BASE_HEALTH, id, color, ownerName ) {
        this.id = id; // socket ID
        this.pos = createVector(x, y);
        this.hp = health;
        this.mhp = BASE_HEALTH;
        this.name = ownerName
        // Set color with default fallback
        if (!color) {
            console.log("color error");
            this.color = {r:255,g:5,b:5}
        } else {
            this.color ={r:color.r, g:color.g, b:color.b}
        }
    }

    checkCollisions(xOffset, yOffset, tileSize) {
        let x = floor(this.pos.x / tileSize) + xOffset;
        let y = floor(this.pos.y / tileSize) + yOffset;
        return {
            x: (x + 0.5) * tileSize,
            y: (y + 0.5) * tileSize,
            val: testMap.data[x + (y / testMap.HEIGHT)]
        };
    }

    update() {


        // Handle collisions
        for (let i = 0; i < collisionChecks.length; i++) {
            let check = collisionChecks[i];
            if (check.val == -1) this.pos = oldPos;
            if (check.val > 0) {
                if (this.pos.dist(createVector(check.x, check.y)) < 16 + (check.val * testMap.tileSize / 2)) {
                    this.pos = oldPos;
                }
            }
        }
    }

        render() {
            push();
            fill(255)
            rect(this.pos.x, this.pos.y, 16); 
            pop();
    }
}
