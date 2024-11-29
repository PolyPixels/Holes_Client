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
        let oldPos = this.pos.copy();
        colisionIndex = [];
        if(this.holding.w) {
            this.pos.y += -BASE_SPEED;
            let x = floor(this.pos.x/testMap.tileSize);
            let y = floor(this.pos.y/testMap.tileSize)-1;
            colisionIndex.push({x: (x+0.5+0)*testMap.tileSize, y: (y+0.5)*testMap.tileSize, val: testMap.data[(x+0) + (y/ testMap.HEIGHT)]});
            colisionIndex.push({x: (x+0.5+1)*testMap.tileSize, y: (y+0.5)*testMap.tileSize, val: testMap.data[(x+1) + (y/ testMap.HEIGHT)]});
            colisionIndex.push({x: (x+0.5-1)*testMap.tileSize, y: (y+0.5)*testMap.tileSize, val: testMap.data[(x-1) + (y/ testMap.HEIGHT)]});
        }
        if(this.holding.a){
            this.pos.x += -BASE_SPEED;
            let x = floor(this.pos.x/testMap.tileSize)-1;
            let y = floor(this.pos.y/testMap.tileSize);
            colisionIndex.push({x: (x+0.5)*testMap.tileSize, y: (y+0.5+0)*testMap.tileSize, val: testMap.data[x + ((y+0)/ testMap.HEIGHT)]});
            colisionIndex.push({x: (x+0.5)*testMap.tileSize, y: (y+0.5+1)*testMap.tileSize, val: testMap.data[x + ((y+1)/ testMap.HEIGHT)]});
            colisionIndex.push({x: (x+0.5)*testMap.tileSize, y: (y+0.5-1)*testMap.tileSize, val: testMap.data[x + ((y-1)/ testMap.HEIGHT)]});
        }
        if(this.holding.s){
            this.pos.y +=  BASE_SPEED;
            let x = floor(this.pos.x/testMap.tileSize);
            let y = floor(this.pos.y/testMap.tileSize)+1;
            colisionIndex.push({x: (x+0.5+0)*testMap.tileSize, y: (y+0.5)*testMap.tileSize, val: testMap.data[(x+0) + (y/ testMap.HEIGHT)]});
            colisionIndex.push({x: (x+0.5+1)*testMap.tileSize, y: (y+0.5)*testMap.tileSize, val: testMap.data[(x+1) + (y/ testMap.HEIGHT)]});
            colisionIndex.push({x: (x+0.5-1)*testMap.tileSize, y: (y+0.5)*testMap.tileSize, val: testMap.data[(x-1) + (y/ testMap.HEIGHT)]});
        }
        if(this.holding.d) {
            this.pos.x +=  BASE_SPEED;
            let x = floor(this.pos.x/testMap.tileSize)+1;
            let y = floor(this.pos.y/testMap.tileSize);
            colisionIndex.push({x: (x+0.5)*testMap.tileSize, y: (y+0.5+0)*testMap.tileSize, val: testMap.data[x + ((y+0)/ testMap.HEIGHT)]});
            colisionIndex.push({x: (x+0.5)*testMap.tileSize, y: (y+0.5+1)*testMap.tileSize, val: testMap.data[x + ((y+1)/ testMap.HEIGHT)]});
            colisionIndex.push({x: (x+0.5)*testMap.tileSize, y: (y+0.5-1)*testMap.tileSize, val: testMap.data[x + ((y-1)/ testMap.HEIGHT)]});
        }

        for(let i=0; i<colisionIndex.length; i++){
            if(colisionIndex[i].val == -1) this.pos = oldPos;
            if(colisionIndex[i].val > 0){
                //-------------------------Tweak this 16 when charater image gets put in VV
                if(this.pos.dist(createVector(colisionIndex[i].x, colisionIndex[i].y)) < 16+(colisionIndex[i].val*testMap.tileSize/2)) this.pos = oldPos;
            }
        }
    }

    render(){
        push();
        fill(255,0,0, 100);
        circle(this.pos.x, this.pos.y, 32);
        pop();
    }
}