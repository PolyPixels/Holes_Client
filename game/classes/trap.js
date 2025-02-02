class Trap extends Placeable{
    constructor(x, y, rot, health = BASE_HEALTH, id, color, ownerName ) {
        super(x,y,rot,30,20,1);
        this.type = "trap";
        this.id = id; // socket ID
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

    update() {
        if(this.id != curPlayer.id && this.name != curPlayer.name){ //aka if you didnt make this trap
            if(this.pos.dist(curPlayer.pos) < -2+(this.size.w+this.size.h)/2){
                this.deleteTag = true;
                curPlayer.hp -= 5;
                socket.emit("update_pos", curPlayer);
                let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
                socket.emit("delete_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z});
            }
        }
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        if(t == "green") tint(100, 200, 100, alpha);
        if(t == "red") tint(200, 100, 100, alpha);
        if(t == "none") noTint();
        image(trapImg, -this.size.w/2, -this.size.h/2, this.size.w, this.size.h)
        pop();
    }
}
