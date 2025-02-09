class Trap extends Placeable{
    constructor(x, y, health, id, color, ownerName ) {
        super(x,y,0,68,48,1);
        this.type = "trap";
        this.id = id; // socket ID
        this.hp = health;
        this.mhp = 100;
        this.name = ownerName;
        // Set color with default fallback
        if (!color) {
            console.log("color error");
            this.color = {r:255,g:5,b:5}
        } else {
            this.color ={r:color.r, g:color.g, b:color.b}
        }
    }

    update() {
        //if(this.id != curPlayer.id && this.name != curPlayer.name){ //aka if you didnt make this trap
            if(this.pos.dist(curPlayer.pos) < -2+(this.size.w+this.size.h)/2){
                this.deleteTag = true;
                curPlayer.statBlock.stats.hp -= 5;
                socket.emit("update_pos", curPlayer);
                let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
                socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
            }
        //}
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        if(t == "green") tint(100, 200, 100, alpha);
        if(t == "red") tint(200, 100, 100, alpha);
        if(t == "none") noTint();
        image(trapImg, -this.size.w/2, -this.size.h/2, this.size.w, this.size.h)
        pop();
    }
}



class Bomb extends Placeable{
    constructor(x, y, health, id, color, ownerName ) {
        super(x,y,0,60,52,1);
        this.type = "bomb";
        this.id = id; // socket ID
        this.hp = 40*5; // Effectively the timer
        this.mhp = this.hp;
        this.name = ownerName;

        // Set color with default fallback
        if (!color) {
            console.log("color error");
            this.color = {r:255,g:5,b:5}
        } else {
            this.color ={r:color.r, g:color.g, b:color.b}
        }
    }

    update() {
        //Fuse go down
        this.hp-=1;

        if (this.hp <= 0) {
            
            // Bomb hurts everyone nearby
            if(this.pos.dist(curPlayer.pos) < -2+(this.size.w+this.size.h)/2){
                curPlayer.statBlock.stats.hp -= 20;
                socket.emit("update_pos", curPlayer);
            }

            // if you made this bomb, when it eventually blows up, the 'damage' will be sent to server by bomb-placer
            if(this.id == curPlayer.id && this.name == curPlayer.name) { 

            }

            // Remove bomb after explosion
            this.deleteTag = true;
            let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
            socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
        }
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        if(t == "green") tint(100, 200, 100, alpha);
        if(t == "red") tint(200, 100, 100, alpha);
        if(t == "none") noTint();

        let bombFrame = bombImg;
        //starts at 500 and goes to 0
        if (this.hp != this.mhp && ( (floor(millis()*10)/10)/(max(0,this.hp*25)) ) % 2 < 1) bombFrame = bombFlareImg;
        image(bombFrame, -this.size.w/2, -this.size.h/2, this.size.w, this.size.h)
        pop();
    }
}
