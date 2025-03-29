
/*
Proj Dic is a full dictanary of every projectile that can exist, falling into one of these types:
    Simple - just a projectile
*/
var projDic = {};

defineSimpleProjectile("Rock", 0, 20, 5, "Straight", 5, 10);

class SimpleProjectile{
    constructor(name, damage, flightPath, speed, lifespan, ownerName, color, imgNum){
        this.name = name;
        this.damage = damage;
        this.flightPath = flightPath;
        //this.flightPath.l = 1;
        this.pos = this.flightPath.calc(0);
        this.speed = speed;
        this.lifespan = lifespan;
        this.ownerName = ownerName;
        this.color = color;
        this.imgNum = imgNum;
        this.cPos = testMap.globalToChunk(this.pos.x, this.pos.y);

        this.type = "Simple";
        this.deleteTag = false;
        this.id = floor(random()*100000);
    }

    update(){
        this.flightPath.update(this.speed);
        this.pos = this.flightPath.calc(this.flightPath.p);

        //move projectiles between chunks
        let newCPos = testMap.globalToChunk(this.pos.x, this.pos.y);
        if(newCPos.x != this.cPos.x || newCPos.y != this.cPos.y){
            let newProj = createProjectile(this.name, this.ownerName, this.color, this.flightPath.s.x, this.flightPath.s.y, this.flightPath.a);
            newProj.pos = this.pos.copy();
            newProj.flightPath.p = this.flightPath.p;
            newProj.cPos.x = newCPos.x;
            newProj.cPos.y = newCPos.y;

            socket.emit("new_proj", newProj);

            if(testMap.chunks[newCPos.x+","+newCPos.y] != undefined){
                testMap.chunks[newCPos.x+","+newCPos.y].projectiles.push(newProj);
            }
            
            this.deleteTag = true;
            socket.emit("delete_proj", this);
        }

        this.lifespan -= 1/60;
        if(this.lifespan <= 0){
            this.deleteTag = true;
            socket.emit("delete_proj", this);
        }

        this.checkCollision();
    }

    render(){
        push();
        translate(-camera.pos.x+(width/2), -camera.pos.y+(height/2));
        image(projImgs[this.imgNum][0], this.pos.x, this.pos.y);
        pop();
    }

    checkCollision(){
        //check collision with dirt walls
        let x = floor(this.pos.x / TILESIZE) - (this.cPos.x*CHUNKSIZE);
        let y = floor(this.pos.y / TILESIZE) - (this.cPos.y*CHUNKSIZE);
        let chunk = testMap.chunks[this.cPos.x+","+this.cPos.y];
        if(chunk.data[x + (y / CHUNKSIZE)] > 0){
            this.deleteTag = true;
            socket.emit("delete_proj", this);
        }

        //check collision with objects
        for(let j = 0; j < chunk.objects.length; j++){
            if(chunk.objects[j].z == 2){
                
                let d = chunk.objects[j].pos.dist(this.pos);
                if(d*2 < (chunk.objects[j].size.w+chunk.objects[j].size.h)/2 + 5){
                    if(chunk.objects[j].objName == "Door"){
                        if(chunk.objects[j].alpha == 255){
                            this.deleteTag = true;
                            socket.emit("delete_proj", this);

                            damageObj(chunk, chunk.objects[j], this.damage);
                        }
                    }
                    else{
                        this.deleteTag = true;
                        socket.emit("delete_proj", this);

                        damageObj(chunk, chunk.objects[j], this.damage);
                    }
                }
            }
        }

        //check collision with curPlayer
        if((this.color == 11 && this.ownerName != curPlayer.name) || this.color != curPlayer.color){
            if(this.pos.dist(curPlayer.pos) < 29){
                this.deleteTag = true;
                //if player collishion tell server to set delete tag to true
                socket.emit("delete_proj", this);
                
                curPlayer.statBlock.stats.hp -= this.damage;
                camera.shake = {intensity: this.damage, length: 5};
                camera.edgeBlood = 5;
                curPlayer.attackingOBJ = this;
                socket.emit("update_pos", curPlayer);
            }
        }
    }
}

class MeleeProjectile extends SimpleProjectile{
    constructor(name, damage, x,y,a, lifespan, range, safeRange, angleWidth, ownerName, color, imgNum){
        super(name, damage/(lifespan*60), createFlightPath("Stay", x,y,a), 0, lifespan, ownerName, color, imgNum);
        
        this.range = range;
        this.safeRange = safeRange;
        this.angleWidth = angleWidth;

        this.ringAngles = [];
        for(let i = 0; i < this.range/10; i++){
            let ringLength = random(this.angleWidth/5, this.angleWidth*0.7);
            let ringOffset = random(-(this.angleWidth-ringLength), this.angleWidth-ringLength)/2;
            this.ringAngles.push([this.flightPath.a+ringOffset-(ringLength/2), this.flightPath.a+ringOffset+(ringLength/2)]);
        }

        this.type = "Melee";
    }

    render(){
        push();
        translate(-camera.pos.x+(width/2), -camera.pos.y+(height/2));
        noFill();
        if(Debuging){
            stroke(200, 200, 215);
            strokeCap(SQUARE);
            strokeWeight(this.range);
            arc(this.pos.x,this.pos.y,this.range+this.safeRange,this.range+this.safeRange,this.flightPath.a-(this.angleWidth/2), this.flightPath.a+(this.angleWidth/2));
        }
        else{
            for(let i = 0; i < this.ringAngles.length; i++){
                let ringRadius = map(i, 0, this.ringAngles.length, 0, (this.range*2))+this.safeRange+10;
                strokeWeight(4);
                stroke(0);
                arc(this.pos.x, this.pos.y,
                    ringRadius,
                    ringRadius,
                    this.ringAngles[i][0],
                    this.ringAngles[i][1]
                );

                strokeWeight(3);
                stroke(200, 200, 215);
                arc(this.pos.x, this.pos.y,
                    ringRadius,
                    ringRadius,
                    this.ringAngles[i][0],
                    this.ringAngles[i][1]
                );
            }
        }
        
        pop();
    }

    update(){
        this.lifespan -= 1/60;
        if(this.lifespan <= 0){
            this.deleteTag = true;
            socket.emit("delete_proj", this);
        }

        this.checkCollision();
    }

    checkCollision(){
        let chunk = testMap.chunks[this.cPos.x+","+this.cPos.y];

        //check collision with objects
        for(let j = 0; j < chunk.objects.length; j++){
            if(chunk.objects[j].z == 2){
                
                let d = chunk.objects[j].pos.dist(this.pos);
                if(d-29 < (this.range*2)+this.safeRange && d+29 > this.safeRange && 
                    chunk.objects[j].pos.copy().sub(this.pos).heading() > this.flightPath.a-(this.angleWidth/2) &&
                    chunk.objects[j].pos.copy().sub(this.pos).heading() < this.flightPath.a+(this.angleWidth/2)
                ){
                    if(chunk.objects[j].objName == "Door"){
                        if(chunk.objects[j].alpha == 255){
                            damageObj(chunk, chunk.objects[j], this.damage);
                        }
                    }
                    else{
                        damageObj(chunk, chunk.objects[j], this.damage);
                    }
                }
            }
        }

        //check collision with curPlayer
        if((this.color == 11 && this.ownerName != curPlayer.name) || this.color != curPlayer.color){
            let d = curPlayer.pos.dist(this.pos);
            if(d-5 < (this.range)+this.safeRange && d+64 > this.safeRange && 
                curPlayer.pos.copy().sub(this.pos).heading() > this.flightPath.a-(this.angleWidth/2) &&
                curPlayer.pos.copy().sub(this.pos).heading() < this.flightPath.a+(this.angleWidth/2)
            ){

                curPlayer.attackingOBJ = this;
                curPlayer.statBlock.stats.hp -= this.damage;
                camera.shake = {intensity: this.damage, length: 5};
                camera.edgeBlood = 5;
                socket.emit("update_pos", curPlayer);
            }
        }
    }
}

function createProjectile(name,owner,color, x,y,a){
    if(projDic[name] == undefined){
        throw new Error(`Projectile with name: ${name}, does not exist`);
    }
    if(projDic[name].type == "SimpleProj"){
        return new SimpleProjectile(name, projDic[name].damage, createFlightPath(projDic[name].fpn, x,y,a), projDic[name].speed, projDic[name].lifespan, owner, color, projDic[name].imgNum);
    }
    if(projDic[name].type == "MeleeProj"){
        return new MeleeProjectile(name, projDic[name].damage, x,y,a, projDic[name].lifespan, projDic[name].r, projDic[name].sr, projDic[name].aw, owner, color, projDic[name].imgNum);
    }
}


function defineSimpleProjectile(name,imgNum,radius,damage,flightPathName,speed,lifespan){
    checkParams(arguments, getParamNames(defineSimpleProjectile), ["string","int","int","int","string","int","number"]);
    projDic[name] = {
        type: "SimpleProj",
        name: name,
        imgNum: imgNum,
        r: radius,
        damage: damage,
        fpn: flightPathName,
        speed: speed,
        lifespan: lifespan
    };
}

function defineMeleeProjectile(name,imgNum,range,safeRange,angleWidth,damage,lifespan){
    checkParams(arguments, getParamNames(defineMeleeProjectile), ["string","int","int","int","int","int","number"]);
    projDic[name] = {
        type: "MeleeProj",
        name: name,
        imgNum: imgNum,
        r: range,
        sr: safeRange,
        aw: angleWidth,
        damage: damage,
        lifespan: lifespan
    };
}



//might move this to another file later

function damageObj(chunk, obj, damage){
    //damage the obj
    obj.hp -= damage;
    socket.emit("upadate_obj", {
        cx: chunk.cx, cy: chunk.cy,
        objName: obj.objName, 
        pos: {x: obj.pos.x, y: obj.pos.y}, 
        z: obj.z, 
        update_name: "hp", 
        update_value: obj.hp
    });
}