/*
Proj Dic is a full dictanary of every projectile that can exist, falling into one of these types:
    Simple - just a projectile
*/
var projDic = {};

defineSimpleProjectile("Rock", 0, 20, 5, "FollowMouse", 5, 10);

class SimpleProjectile{
    constructor(name, damage, flightPath, speed, lifespan, imgNum){
        this.name = name;
        this.damage = damage;
        this.flightPath = flightPath;
        //this.flightPath.l = 1;
        this.pos = this.flightPath.calc(0);
        this.speed = speed;
        this.lifespan = lifespan;
        this.imgNum = imgNum;

        this.type = "Simple";
        this.deleteTag = false;
    }

    update(){
        this.flightPath.update(this.speed);
        this.pos = this.flightPath.calc(this.flightPath.p);

        this.lifespan -= 1/60;
        if(this.lifespan <= 0){
            this.deleteTag = true;
        }

        this.checkCollision();
    }

    render(){
        push();
        translate(-camera.x+(width/2), -camera.y+(height/2));
        image(projImgs[this.imgNum][0], this.pos.x, this.pos.y);
        pop();
    }

    checkCollision(){
        //check collision with dirt walls

        //check collision with objects

        //check collision with curPlayer
        //if player collishion tell server to set delete tag to true

        //if any collishion set delete tag to true
    }
}

function createProjectile(name,owner,color, x,y,a){
    if(projDic[name] == undefined){
        throw new Error(`Projectile with name: ${name}, does not exist`);
    }
    if(projDic[name].type == "SimpleProj"){
        return new SimpleProjectile(name, projDic[name].damage, createFlightPath(projDic[name].fpn, x,y,a), projDic[name].speed, projDic[name].lifespan, projDic[name].imgNum);
    }
}


function defineSimpleProjectile(name,imgNum,radius,damage,flightPathName,speed,lifespan){
    checkParams(arguments, getParamNames(defineSimpleProjectile), ["string","int","int","int","string","int","int"]);
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