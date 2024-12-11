const raceImages = {}; // Object to hold all race images
var defaultImage;

function preload() {
    // Load the default image
    //loadDefaultImage();

    // Load race images
    loadRaceImages();
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

function loadRaceImages() {
    for (let raceIndex = 0; raceIndex < races.length; raceIndex++) {
        let raceName = races[raceIndex];
        raceImages[raceName] = {
            front: [],
            back: [],
            left: [],
            right: []
        };
        
        raceImages[raceName].front[0] = loadImage(
            `images/${raceName}/${raceName}_front_stand.png`,
            function (img) {
                console.log(`Loaded image: images/${raceName}/${raceName}_front_stand.png`);
            },
            function (err) {
                console.error(`Failed to load image: images/${raceName}/${raceName}_front_stand.png`);
                raceImages[raceName].front[0] = defaultImage;
            }
        );
        raceImages[raceName].back[0] = loadImage(
            `images/${raceName}/${raceName}_back_stand.png`,
            function (img) {
                console.log(`Loaded image: images/${raceName}/${raceName}_back_stand.png`);
            },
            function (err) {
                console.error(`Failed to load image: images/${raceName}/${raceName}_back_stand.png`);
                raceImages[raceName].back[0] = defaultImage;
            }
        );
        raceImages[raceName].right[0] = loadImage(
            `images/${raceName}/${raceName}_side_stand.png`,
            function (img) {
                console.log(`Loaded image: images/${raceName}/${raceName}_side_stand.png`);
            },
            function (err) {
                console.error(`Failed to load image: images/${raceName}/${raceName}_side_stand.png`);
                raceImages[raceName].right[0] = defaultImage;
            }
        );
        // Load images for each direction
        for (let i = 1; i < 4; i++) {
            // Front images
            raceImages[raceName].front[i] = loadImage(
                `images/${raceName}/${raceName}_front_walk${i}.png`,
                function (img) {
                    console.log(`Loaded image: images/${raceName}/${raceName}_front_walk${i}.png`);
                },
                function (err) {
                    console.error(`Failed to load image: images/${raceName}/${raceName}_front_walk${i}.png`);
                    raceImages[raceName].front[i] = defaultImage;
                }
            );
    
            // Back images
            raceImages[raceName].back[i] = loadImage(
                `images/${raceName}/${raceName}_back_walk${i}.png`,
                function (img) {
                    console.log(`Loaded image: images/${raceName}/${raceName}_back_walk${i}.png`);
                },
                function (err) {
                    console.error(`Failed to load image: images/${raceName}/${raceName}_back_walk${i}.png`);
                    raceImages[raceName].back[i] = defaultImage;
                }
            );
    
            // Right images
            raceImages[raceName].right[i] = loadImage(
                `images/${raceName}/${raceName}_side_walk${i}.png`,
                function (img) {
                    console.log(`Loaded image: images/${raceName}/${raceName}_side_walk${i}.png`);
                },
                function (err) {
                    console.error(`Failed to load image: images/${raceName}/${raceName}_side_walk${i}.png`);
                    raceImages[raceName].right[i] = defaultImage;
                }
            );
        }
    }
}