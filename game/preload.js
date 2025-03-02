const raceImages = {}; // Object to hold all race images
var defaultImage;
var trapImg;
var chunkDirtImg;
var dirtFloorImg;
var dirtBagImg;
var dirtBagOpenImg;

function preload() {
    // Load the default image
    //loadDefaultImage();

    // Load race images
    loadRaceImages();

    //Dirt floor and wall images
    chunkDirtImg = loadImage('images/dirt_walls.png');
    dirtFloorImg = loadImage('images/floor.png');
    dirtBagImg = loadImage('images/ui/dirtbag.png');
    dirtBagOpenImg = loadImage('images/ui/dirtbagopen.png');

    //load obj imgs
    wallImg = loadImage('images/structures/tempwall1.png');
    doorImg = loadImage('images/structures/tempdoor1.png');
    floorImg = loadImage('images/structures/tempfloor1.png');
    rugImg = loadImage('images/structures/temprug1.png');
    mugImg = loadImage('images/structures/tempmug.png');
    bearTrapImg = loadImage('images/structures/beartrap1.png');
    landMineImg = loadImage('images/structures/bomb1.png');
    turretImg = loadImage('images/structures/tempturret1.png');
    mushroomImg3 = loadImage('images/structures/tempmushroom1.png');
    mushroomImg2 = loadImage('images/structures/tempmushroom2.png');
    mushroomImg1 = loadImage('images/structures/tempmushroom3.png');
    bombImg = loadImage('images/structures/bomb1.png');
    bombFlareImg = loadImage('images/structures/bomb2.png');

    //sort obj imgs
    objImgs = [
    /*0*/   [wallImg],
    /*1*/   [doorImg],
    /*2*/   [floorImg],
    /*3*/   [rugImg],
    /*4*/   [mugImg],
    /*5*/   [bearTrapImg],
    /*6*/   [landMineImg],
    /*7*/   [turretImg],
    /*8*/   [mushroomImg1, mushroomImg2, mushroomImg3],
    /*9*/   [bombImg,bombFlareImg]
    ];

    basicShovelImg = loadImage("images/items/shovel1.png");
    swordImg = loadImage("images/items/tempSword.png");
    slingShotImg = loadImage("images/items/sling.png");
    rockImg = loadImage("images/items/temprock.png");
    appleImg = loadImage("images/items/apple.png");
    mushroomSeedImg = loadImage("images/items/tempmushroomseed.png");

    itemImgs = [
    /*0*/ [basicShovelImg],
    /*1*/ [swordImg],
    /*2*/ [slingShotImg],
    /*3*/ [rockImg],
    /*4*/ [appleImg],
    /*5*/ [mushroomSeedImg],
    ];

    //used for inventory rendering, cause html is booty
    itemImgNames = [
    /*0*/ ["shovel1"],
    /*1*/ ["tempSword"],
    /*2*/ ["sling"],
    /*3*/ ["temprock"],
    /*4*/ ["apple"],
    /*5*/ ["tempmushroomseed"]
    ]

    playerCardImg = loadImage('images/ui/playercard.png');

    gameUIFont = loadFont('CalibrationGothicNbpLatin-rYmy.ttf');
    console.log("font:", gameUIFont);
}

function loadDefaultImage(){
    defaultImage = loadImage(
        'images/default_front_walk.png',
        function (img) {
            console.log('Default image loaded successfully.');
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
            right: []
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