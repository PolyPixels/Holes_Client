/*******************************************************
 * Globals
 *******************************************************/
let gameState = "initial";
let testMap; // your Map object
var lastHolding;
var projectiles = [];
var collisionChecks = [];
const races = BASE_STATS.map(item => item.name);
var camera = {};
var dirtBagUI = {};
var Debuging = false;
//console.log("Race names:", races);

function setup() {
    // Create a responsive canvas
    let cnv = createCanvas(innerWidth - 10, innerHeight - 8);
    cnv.parent("canvas-container");
    document.getElementById("canvas-container").style.display = "none";
    noSmooth();
    background(220);
    angleMode(DEGREES);

    // Prevent right-click context menu on p5.js canvases
    const canvases = document.getElementsByClassName("p5Canvas");
    for (let element of canvases) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    setupUI();

    camera.pos = createVector(0, 0);
    camera.vel = createVector(0,0);
    camera.shake = {intensity: 0, length: 0};
    camera.edgeBlood = 0;

    dirtBagUI.pos = createVector(width-180-10, height-186-10);
    dirtBagUI.vel = createVector(0,0);
    dirtBagUI.shake = {intensity: 0, length: 0};

    // Update the volume of all sounds
    let keys = Object.keys(soundDic);
    for(let i = 0; i < keys.length; i++){
        for(let j = 1; j < soundDic[keys[i]].sounds.length; j++){
            soundDic[keys[i]].sounds[j].setVolume((j/20)*soundDic[keys[i]].volume * (volumeSlider.value()/100));
        }
    }
}

function moveCamera(){
    if(camera.shake.length > 0){
        if(camera.vel.mag() < 1){
            camera.vel.x = camera.shake.intensity;
        }
        camera.vel.setMag(camera.vel.mag()+camera.shake.intensity);
        if(camera.vel.mag() > camera.shake.intensity*5){
            camera.vel.setMag(camera.shake.intensity*5);
        }
        camera.vel.rotate(random(45, 180));
        camera.shake.length -= 1;
    }
    else{
        camera.shake.intensity = 0;
        camera.vel.x = (curPlayer.pos.x-camera.pos.x);
        camera.vel.y = (curPlayer.pos.y-camera.pos.y);
        camera.vel.setMag(camera.vel.mag()/10);
    }
    camera.pos.add(camera.vel);

    //fixes a visual bug where cracks would form in the dirt
    camera.pos.x = round(camera.pos.x);
    camera.pos.y = round(camera.pos.y);

    if(camera.edgeBlood > 0){
        camera.edgeBlood -= 1;
        image(edgeBloodImg, 0, 0, width, height);
    }
}

function windowResized() {
    resizeCanvas(innerWidth - 10, innerHeight - 8);
    updateResponsiveDesign();
}

function draw() {
    // image as background

    background(dirtFloorImg)

    if(gameState == "initial") {
        //console.log("restart");

        //! Why call these in draw if they only need to be called once? (wouldn't it be better to add them to the transitional buttons?)
        //unless they have some form of updates that I didn't see
        renderServerBrowser();
        renderLinks();
    }
    else if (gameState === "race_selection") {
        //! Why call these in draw if they only need to be called once? (wouldn't it be better to add them to the transitional buttons?)
        //unless they have some form of updates that I didn't see
        drawSelection();
        renderLinks();
    }
    
    if (gameState === "playing") {
        timerDiv.show()
        //! Why call these in draw if they only need to be called once?
        hideRaceSelect();
        hideLinks();
        renderChatUI();

        // ---- (Your original gameplay code) ----
        if (Object.keys(testMap.chunks).length > 0) {
            testMap.render();
            testMap.update();
        }

        let keys = Object.keys(players);
        for (let i = 0; i < keys.length; i++) {
            if(curPlayer){ //only render other players once your current player exists
                if(players[keys[i]].pos.dist(curPlayer.pos) < TILESIZE*CHUNKSIZE*2){
                    

                    players[keys[i]].render();
                    players[keys[i]].update();
                }
            }
        }

        if (curPlayer) {
            moveCamera();

            curPlayer.render();
            curPlayer.update();
            if(renderGhost){
                ghostBuild.pos.x = mouseX + camera.pos.x - width / 2;
                ghostBuild.pos.y = mouseY + camera.pos.y - height / 2;
                if(ghostBuild.canRotate & wantRotate){
                    ghostBuild.rot = ghostBuild.pos.copy().sub(curPlayer.pos).heading();
                }
                ghostBuild.ghostRender(createVector(ghostBuild.pos.x,ghostBuild.pos.y).dist(curPlayer.pos) < 200);
            }

            //little f above the thing you can interact with
            let mouseVec = createVector(mouseX + camera.pos.x - (width / 2), mouseY + camera.pos.y - (height / 2));
            let chunkPos = testMap.globalToChunk(mouseVec.x,mouseVec.y);
            let chunk = testMap.chunks[chunkPos.x + "," + chunkPos.y];
            if(chunk != undefined){
                let closest;
                let closestDist;

                for(let i = 0; i < chunk.objects.length; i++){
                    if(chunk.objects[i].type == "InvObj" || (chunk.objects[i].type == "Plant" && chunk.objects[i].stage == (objImgs[chunk.objects[i].imgNum].length-1)) || chunk.objects[i].objName == "Door"){
                        if(closest == undefined){
                            closest = chunk.objects[i];
                            closestDist = mouseVec.dist(closest.pos);
                        }
                        else if (mouseVec.dist(chunk.objects[i].pos) < closestDist){
                            closest = chunk.objects[i];
                            closestDist = mouseVec.dist(closest.pos);
                        }
                    }
                }
                if(closest != undefined){
                    if(closestDist < 2*TILESIZE){
                        push();
                        fill(120);
                        stroke(0);
                        strokeWeight(1);
                        rectMode(CENTER);
                        let offY = 0;
                        if(closest.objName != "Door") offY = (closest.size.h * 0.8);
                        rect(closest.pos.x - camera.pos.x + (width/2), closest.pos.y - offY - camera.pos.y + (height/2), 20, 20);

                        fill(0);
                        stroke(0);
                        textAlign(CENTER, CENTER);
                        textSize(15);
                        textFont(gameUIFont);
                        text("F", closest.pos.x - camera.pos.x + (width/2), closest.pos.y - offY - camera.pos.y + (height/2));
                        pop();
                    }
                    else{
                        let chunkPos = testMap.globalToChunk(curPlayer.pos.x,curPlayer.pos.y);
                        let chunk = testMap.chunks[chunkPos.x + "," + chunkPos.y];
                        if(chunk != undefined){
                            closest = undefined;
                            for(let i = 0; i < chunk.objects.length; i++){
                                if(chunk.objects[i].type == "InvObj" || (chunk.objects[i].type == "Plant" && chunk.objects[i].stage == (objImgs[chunk.objects[i].imgNum].length-1)) || chunk.objects[i].objName == "Door"){
                                    if(closest == undefined){
                                        closest = chunk.objects[i];
                                        closestDist = curPlayer.pos.dist(closest.pos);
                                    }
                                    if (curPlayer.pos.dist(chunk.objects[i].pos) < closestDist){
                                        closest = chunk.objects[i];
                                        closestDist = curPlayer.pos.dist(closest.pos);
                                    }
                                }
                            }

                            if(closest != undefined){
                                if(closestDist < 4*TILESIZE){
                                    push();
                                    fill(120);
                                    stroke(0);
                                    strokeWeight(1);
                                    rectMode(CENTER);
                                    let offY = 0;
                                    if(closest.objName != "Door") offY = (closest.size.h * 0.8);
                                    rect(closest.pos.x - camera.pos.x + (width/2), closest.pos.y - offY - camera.pos.y + (height/2), 20, 20);
        
                                    fill(0);
                                    stroke(0);
                                    textAlign(CENTER, CENTER);
                                    textSize(15);
                                    textFont(gameUIFont);
                                    text("F", closest.pos.x - camera.pos.x + (width/2), closest.pos.y - offY - camera.pos.y + (height/2));
                                    pop();
                                }
                            }
                        }
                    }
                }
            }

            lastHolding = curPlayer.holding;

            curPlayer.invBlock.renderHotBar();
            renderPlayerCardUI();

            if(curPlayer.statBlock.stats.hp <= 0){ //death
                //console.log("dead",curPlayer.attackingOBJ);
                let dealthData = {x:curPlayer.pos.x , y : curPlayer.pos.y, name : curPlayer.name, id:curPlayer.id, attacker : curPlayer.attackingOBJ ? curPlayer.attackingOBJ.ownerName : " Some thing Ominous"}
                socket.emit("player_dies", dealthData);

                curPlayer.invBlock.dropAll();

                dirtInv = 0;
                gameState = "dead";
                deathDiv.show();
            }
        }

        renderTimeUI()
        renderDirtBagUI();
    }
    if (gameState === "chating" || gameState === "inventory" || gameState === "crafting" || gameState === "swap_inv" || gameState === "pause" || gameState =="player_status" || gameState == "team_select" || gameState == "dead") {
        //render the game in the background

        renderTimeUI()
        if (Object.keys(testMap.chunks).length > 0) {
            testMap.render();
            testMap.update();
        }

        if (curPlayer) {
            moveCamera();

            curPlayer.render();
            curPlayer.update();
            // if(renderGhost){
            //     ghostBuild.pos.x = mouseX + camera.pos.x - width / 2;
            //     ghostBuild.pos.y = mouseY + camera.pos.y - height / 2;
            //     if(ghostBuild.canRotate & wantRotate){
            //         ghostBuild.rot = ghostBuild.pos.copy().sub(curPlayer.pos).heading();
            //     }
            //     ghostBuild.ghostRender(createVector(ghostBuild.pos.x,ghostBuild.pos.y).dist(curPlayer.pos) < 200);
            // }
        }

        let keys = Object.keys(players);
        for (let i = 0; i < keys.length; i++) {
            if(curPlayer){
                if(players[keys[i]].pos.dist(curPlayer.pos) < TILESIZE*CHUNKSIZE*2){
                    players[keys[i]].render();
                    players[keys[i]].update();
                }
            }
        }

        if(gameState == "dead"){
            push();
            fill(255, 0, 0, 100);
            rect(0, 0, width, height);
            image(edgeBloodImg, 0, 0, width, height);
            pop();
        }

        curPlayer.invBlock.renderHotBar();
        renderPlayerCardUI();
        renderDirtBagUI();
    }

    continousKeyBoardInput();
    continousMouseInput();
}