/*
Proj Dic is a full dictanary of every projectile that can exist, falling into one of these types:
    Simple - just a projectile
*/
var projDic = {};

//defineSimpleProjectile("rock", 2, "Straight", 5);

class SimpleProjectile{
    constructor(name, damage, flightPath, speed, lifespan, imgNum){
        this.name = name;
        this.damage = damage;
        this.flightPath = createPath(flightPath);
        this.speed = speed;
        this.lifespan = lifespan;
        this.imgNum = imgNum;
    }

    update(){

    }

    render(){

    }

    checkCollision(){

    }
}