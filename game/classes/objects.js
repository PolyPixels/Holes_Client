/*
Z heights:
    3=decorations (ex. mugs, plates, flowers, papers)
    2=walls,doors,tables,chairs,chests
    1=rugs,traps
    0=floors
*/

class Cup extends Placeable{
    constructor(x,y,rot,color){
        super(x,y,rot, 10, 10, 3);
        this.color = color;
        this.type = "cup";
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        fill(this.color.r, this.color.g, this.color.b, alpha);
        if(t == "green") fill(100, 200, 100, alpha);
        if(t == "red") fill(200, 100, 100, alpha);
        stroke(0);
        circle(-this.size.w/2, -this.size.h/2, this.size.w);
        pop();
    }
}

class Wall extends Placeable{
    constructor(x,y,rot,color){
        super(x,y,rot, 60, 60, 2);
        this.color = color;
        this.type = "wall";
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        fill(this.color.r, this.color.g, this.color.b, alpha);
        if(t == "green") fill(100, 200, 100, alpha);
        if(t == "red") fill(200, 100, 100, alpha);
        stroke(0);
        rect(-this.size.w/2, -this.size.h/2, this.size.w, this.size.h);
        pop();
    }
}

class Door extends Placeable{
    constructor(x,y,rot,color){
        super(x,y,rot, 20, 60, 2);
        this.color = color;
        this.type = "door";
        this.open = false;
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        fill(this.color.r, this.color.g, this.color.b, alpha + (this.open ? -150: 0));
        if(t == "green") fill(100, 200, 100, alpha);
        if(t == "red") fill(200, 100, 100, alpha);
        stroke(0);
        rect(-this.size.w/2, -this.size.h/2, this.size.w, this.size.h);
        pop();
    }
}

class Rug extends Placeable{
    constructor(x,y,rot,color){
        super(x,y,rot, 80, 80, 1);
        this.color = color;
        this.type = "rug";
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        fill(this.color.r, this.color.g, this.color.b, alpha);
        if(t == "green") fill(100, 200, 100, alpha);
        if(t == "red") fill(200, 100, 100, alpha);
        stroke(0);
        rect(-this.size.w/2, -this.size.h/2, this.size.w, this.size.h);
        pop();
    }
}

class Floor extends Placeable{
    constructor(x,y,rot,color){
        super(x,y,rot, 60, 60, 0);
        this.color = color;
        this.type = "floor";
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        fill(this.color.r, this.color.g, this.color.b, alpha);
        if(t == "green") fill(100, 200, 100, alpha);
        if(t == "red") fill(200, 100, 100, alpha);
        stroke(0);
        rect(-this.size.w/2, -this.size.h/2, this.size.w, this.size.h);
        pop();
    }
}

class Turret extends Placeable{
    constructor(x, y, rot, health, id, color, ownerName ) {
        super(x,y,rot,40,40,2);
        this.type = "turret";
        this.id = id; // socket ID
        this.hp = health;
        this.mhp = health;
        this.name = ownerName;
        // Set color with default fallback
        if (!color) {
            console.log("color error");
            this.color = {r:255,g:5,b:5};
        } else {
            this.color ={r:color.r, g:color.g, b:color.b};
        }
    }

    update(){
        if(curPlayer.name != this.name){
            this.rot = curPlayer.pos.copy().sub(this.pos).heading();
            let chunkPos = testMap.globalToChunk(this.pos.x,this.pos.y);
            socket.emit("update_obj", {cx: chunkPos.x, cy: chunkPos.y, type: this.type, pos: {x: this.pos.x, y: this.pos.y}, z: this.z, update_name: "rot", update_value: this.rot});
        }
    }

    render(t, alpha){
        push();
        translate(-camera.x+(width/2)+this.pos.x, -camera.y+(height/2)+this.pos.y);
        rotate(this.rot);
        fill(this.color.r, this.color.g, this.color.b, alpha);
        if(t == "green") fill(100, 200, 100, alpha);
        if(t == "red") fill(200, 100, 100, alpha);
        stroke(0);
        rect(-this.size.w/2, -this.size.h/2, this.size.w, this.size.h);
        rect(-this.size.w/4, -this.size.h/4, this.size.w, this.size.h/2);
        pop();
    }
}