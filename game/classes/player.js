const BASE_HEALTH = 100;
const BASE_SPEED = 1;

class Player {
    constructor(x, y, health, id) {
        this.id = id;
        this.pos = createVector(x, y);
        this.hp = health;
        this.mhp = BASE_HEALTH;
        this.holding = {w: false, a: false, s: false, d: false}; //use this to reduce lag
    }

    update(){  //move the player based on this.holding
        if(this.holding.w) this.pos.y += -BASE_SPEED;
        if(this.holding.a) this.pos.x += -BASE_SPEED;
        if(this.holding.s) this.pos.y +=  BASE_SPEED;
        if(this.holding.d) this.pos.x +=  BASE_SPEED;
    }

    render(){
        push();
        fill(255,0,0);
        circle(this.pos.x, this.pos.y, 10);
        pop();
    }
}