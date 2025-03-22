/*******************************************************
 * Globals
 *******************************************************/
let gameState = "initial";
let testMap; // your Map object
var lastHolding;
var projectiles = [];
var collisionChecks = [];
const races = BASE_STATS.map(item => item.name);
var camera = { x: 0, y: 0 };
var Debuging = true;
//console.log("Race names:", races);

function setup() {
    // Create a responsive canvas
    let cnv = createCanvas(innerWidth - 10, innerHeight - 8);
    cnv.parent("canvas-container");
    noSmooth();
    background(220);
    angleMode(DEGREES);

    // Prevent right-click context menu on p5.js canvases
    const canvases = document.getElementsByClassName("p5Canvas");
    for (let element of canvases) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    setupUI();
}

function windowResized() {
    resizeCanvas(innerWidth - 10, innerHeight - 8);
    updateResponsiveDesign();
}

function draw() {
    background("#7F3F00"); //old color is 71413B

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
        //! Why call these in draw if they only need to be called once?
        hideRaceSelect();
        hideLinks();
        renderChatUI()
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
            camera.x = curPlayer.pos.x;
            camera.y = curPlayer.pos.y;

            curPlayer.render();
            curPlayer.update();
            if(renderGhost){
                ghostBuild.pos.x = mouseX + camera.x - width / 2;
                ghostBuild.pos.y = mouseY + camera.y - height / 2;
                if(ghostBuild.canRotate & wantRotate){
                    ghostBuild.rot = ghostBuild.pos.copy().sub(curPlayer.pos).heading();
                }
                ghostBuild.ghostRender(createVector(ghostBuild.pos.x,ghostBuild.pos.y).dist(curPlayer.pos) < 200);
            }

            lastHolding = curPlayer.holding;

            curPlayer.invBlock.renderHotBar();

            if(curPlayer.statBlock.stats.hp <= 0){ //death
                console.log("dead")
                curPlayer.pos.x = random(-200*TILESIZE, 200*TILESIZE);
                curPlayer.pos.y = random(-200*TILESIZE, 200*TILESIZE);

                //load in some chunks for easy start
                let chunkPos = testMap.globalToChunk(curPlayer.pos.x, curPlayer.pos.y);
                for(let yOff = -1; yOff < 2; yOff++){
                    for(let xOff = -1; xOff < 2; xOff++){
                        testMap.getChunk(chunkPos.x + xOff,chunkPos.y + yOff);
                    }
                }

                dirtInv = 0;
                // Clear a small area around the player
                for (let y = -5; y < 5; y++) {
                    for (let x = -5; x < 5; x++) {
                        dig(curPlayer.pos.x + x * TILESIZE, curPlayer.pos.y + y * TILESIZE, 1);
                    }
                }
                dirtInv = 0;
                
                curPlayer.statBlock.stats.hp = 100;
            }
        }

        renderDirtBagUI();
    }
    if (gameState === "inventory" || gameState === "pause" || gameState =="player_status") {
        //render the game in the background
        if (Object.keys(testMap.chunks).length > 0) {
            testMap.render();
            testMap.update();
        }

        if (curPlayer) {
            curPlayer.render();
            curPlayer.update();
            if(renderGhost){
                ghostBuild.pos.x = mouseX + camera.x - width / 2;
                ghostBuild.pos.y = mouseY + camera.y - height / 2;
                if(ghostBuild.canRotate & wantRotate){
                    ghostBuild.rot = ghostBuild.pos.copy().sub(curPlayer.pos).heading();
                }
                ghostBuild.ghostRender(createVector(ghostBuild.pos.x,ghostBuild.pos.y).dist(curPlayer.pos) < 200);
            }
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

        curPlayer.invBlock.renderHotBar();
        renderDirtBagUI();
    }
    if (gameState === "chating") {
        //render the game in the background
        if (Object.keys(testMap.chunks).length > 0) {
            testMap.render();
            testMap.update();
        }

        if (curPlayer) {
            curPlayer.render();
            curPlayer.update();
            if(renderGhost){
                ghostBuild.pos.x = mouseX + camera.x - width / 2;
                ghostBuild.pos.y = mouseY + camera.y - height / 2;
                if(ghostBuild.canRotate & wantRotate){
                    ghostBuild.rot = ghostBuild.pos.copy().sub(curPlayer.pos).heading();
                }
                ghostBuild.ghostRender(createVector(ghostBuild.pos.x,ghostBuild.pos.y).dist(curPlayer.pos) < 200);
            }
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

        curPlayer.invBlock.renderHotBar();
        renderDirtBagUI();
    }

    continousKeyBoardInput();
    continousMouseInput();
}