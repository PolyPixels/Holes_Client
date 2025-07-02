const raceImages = {}; // Object to hold all race images
var defaultImage;
var trapImg;
var chunkDirtImg;
var dirtFloorImg;
var dirtBagImg;
var dirtBagOpenImg;
var hpBarImg;
var manaBarImg;
var edgeBloodImg;
var objImgs = [];
var itemImgs = [];
var dirtBagShakeSound;

var MusicPlayer;
function preload() {
    // Load the default image
    //loadDefaultImage();

    // Load race images
    loadRaceImages();

    //Dirt floor and wall images
    chunkDirtImg = loadImage('images/dirt_walls.png');
    chunkIronImg = loadImage('images/iron_walls.png');
    dirtFloorImg = loadImage('images/floor.png');

    //Ui Images
    dirtBagImg = loadImage('images/ui/dirtbag.png');
    dirtBagOpenImg = loadImage('images/ui/dirtbagopen.png');
    hpBarImg = loadImage('images/ui/healthbar.png');
    manaBarImg = loadImage('images/ui/manabar.png');
    ammoBarImg = loadImage('images/ui/ammobar.png');
    edgeBloodImg = loadImage('images/ui/edgeblood.png');
    hammerImg = loadImage("images/ui/hammer.png");
    Ximage = loadImage("images/ui/x.png");

    //load obj imgs
    for(let i = 0; i < objImgPaths.length; i++){
        let temp = [];
        for(let j = 0; j < objImgPaths[i].length; j++){
            temp.push(loadImage(objImgPaths[i][j]));
            if(objImgPaths[i][j].includes(".gif")){
                temp[temp.length - 1].play();
            }
        }
        objImgs.push(temp);
    }

    //load item imgs
    for(let i = 0; i < itemImgPaths.length; i++){
        let temp = [];
        for(let j = 0; j < itemImgPaths[i].length; j++){
            temp.push(loadImage(itemImgPaths[i][j]));
        }
        itemImgs.push(temp);
    }

    //Projectile imgs still using the old method
    rockImg = loadImage("images/items/rock.png");
    dirtBallImg = loadImage("images/items/dirtball.png");
    fireBallImg = loadImage("images/items/fireball.png");
    laserImg = loadImage("images/items/laser.png");
    arrowImage = loadImage("images/items/arrow.png");

    projImgs = [
        [rockImg],
        [dirtBallImg],
        [fireBallImg],
        [laserImg],
        [arrowImage]
    ];

    playerCardImg = loadImage('images/ui/playercard.png');

    gameUIFont = loadFont('CalibrationGothicNbpLatin-rYmy.ttf');
    //console.log("font:", gameUIFont);

    // tell p5 which formats to expect
    soundFormats('wav');

    // loadSound paths are relative to your sketch.html
    const mainTheme = loadSound('audio/music/bgtheme.wav');
    const battle    = loadSound('audio/music/battletheme.wav');
    const ambiance  = loadSound('audio/music/WorkingAmbianceSample.wav');
    
    MusicPlayer = new MusicSystem(mainTheme, [battle, ambiance]);
    //load sounds
    let keys = Object.keys(soundDic);
    for(let i = 0; i < keys.length; i++){
        for(let j = 1; j < soundDic[keys[i]].sounds.length; j++){
            soundDic[keys[i]].sounds[j] = loadSound(soundDic[keys[i]].sounds[j]);
            soundDic[keys[i]].sounds[j].setVolume((j/20)*soundDic[keys[i]].volume);
        }
    }

    dirtBagShakeSound = loadSound("audio/dirtbag_shake.ogg");
    dirtBagShakeSound.setVolume(0.1);
}

function loadDefaultImage(){
    defaultImage = loadImage(
        'images/default_front_walk.png',
        function (img) {
            //console.log('Default image loaded successfully.');
        },
        function (err) {
            console.error('Failed to load the default image.');
            // Create a placeholder image to use as default
            defaultImage = createImage(32, 32);
            defaultImage.loadPixels();
            for (let i = 0; i < defaultImage.pixels.length; i += 4) {
                defaultImage.pixels[i] = 255;     // R
                defaultImage.pixels[i + 1] = 0;   // G
                defaultImage.pixels[i + 2] = 0;   // B
                defaultImage.pixels[i + 3] = 255; // A
            }
            defaultImage.updatePixels();
        }
    );
}

function loadRaceFrame(path) {
    path = `images/characters/` + path;
    let img = loadImage(
        path,
        function (loadedImage) {
            //console.log(`Loaded image: ` + path);
            return loadedImage;
        },
        function (err) {
            console.error(`Failed to load image: ` + path);
            return defaultImage;
        }
    );

    return img || defaultImage;
}

function loadRaceImages() {
    for (let raceIndex = 0; raceIndex < races.length; raceIndex++) {
        let raceName = races[raceIndex];
        raceImages[raceName] = {
            front: [],
            back: [],
            left: [],
            right: [],
            portrait: loadImage(`images/characters/${raceName}/${raceName}_portrait.png`)
        };
        
        // 0 is standing
        // 1, 2, 3 are walk cycle

        // 4 is putting something down

        // 5 is standing with shovel
        // 6, 7, 8 are walking with shovel


        raceImages[raceName].front[0] = loadRaceFrame(`${raceName}/${raceName}_front_stand.png`);
        raceImages[raceName].back[0] = loadRaceFrame(`${raceName}/${raceName}_back_stand.png`);
        raceImages[raceName].right[0] = loadRaceFrame(`${raceName}/${raceName}_side_stand.png`);

        // Load images for each direction
        for (let i = 1; i < 4; i++) {
            // Front images
            raceImages[raceName].front[i] = loadRaceFrame(`${raceName}/${raceName}_front_walk${i}.png`);
    
            // Back images
            raceImages[raceName].back[i] = loadRaceFrame(`${raceName}/${raceName}_back_walk${i}.png`);
    
            // Right images
            raceImages[raceName].right[i] = loadRaceFrame(`${raceName}/${raceName}_side_walk${i}.png`);
        }

        raceImages[raceName].front[4] = loadRaceFrame(`${raceName}/place/${raceName}_front_place.png`);
        raceImages[raceName].back[4] = loadRaceFrame(`${raceName}/place/${raceName}_back_place.png`);
        raceImages[raceName].right[4] = loadRaceFrame(`${raceName}/place/${raceName}_side_place.png`);

        //raceImages[raceName].right[4] = loadRaceFrame(`${raceName}/shovel/${raceName}_side_stand_shovel.png`);
    }
}