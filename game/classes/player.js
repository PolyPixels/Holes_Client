// Player.js

const BASE_HEALTH = 100;
const BASE_SPEED = 5;
class Player {
  constructor(x, y, health = BASE_HEALTH, id, color, race = 0, name = '') {
    this.id = id; // Socket ID
    this.pos = createVector(x, y);
    this.hp = health;
    this.mhp = BASE_HEALTH;
    this.holding = { w: false, a: false, s: false, d: false }; // Movement keys state
    this.race = race; // Race index
    this.name = name;
    this.color = color || { r: 255, g: 5, b: 5 };

    // Animation properties
    this.currentFrame = 0; // Current frame for animation
    this.direction = 'down'; // Default direction
    this.frameCount = 3; // Number of frames per direction

    // Load images for the player's race
    this.loadImages();
  }

  loadImages() {
    const raceName = races[this.race];

    this.frontImages = raceImages[raceName].front;
    this.backImages = raceImages[raceName].back;
    this.leftImages = raceImages[raceName].left;
    this.rightImages = raceImages[raceName].right;
  }

  update() {
    let oldPos = this.pos.copy();
    let collisionChecks = [];

    if (this.holding.w) {
      this.pos.y -= BASE_SPEED;
      this.direction = 'up';
      collisionChecks.push(this.checkCollisions(0, -1, testMap.tileSize));
    }
    if (this.holding.a) {
      this.pos.x -= BASE_SPEED;
      this.direction = 'left';
      collisionChecks.push(this.checkCollisions(-1, 0, testMap.tileSize));
    }
    if (this.holding.s) {
      this.pos.y += BASE_SPEED;
      this.direction = 'down';
      collisionChecks.push(this.checkCollisions(0, 1, testMap.tileSize));
    }
    if (this.holding.d) {
      this.pos.x += BASE_SPEED;
      this.direction = 'right';
      collisionChecks.push(this.checkCollisions(1, 0, testMap.tileSize));
    }

    // Handle collisions
    for (let check of collisionChecks) {
      if (
        check.val == -1 ||
        this.pos.dist(createVector(check.x, check.y)) <
          16 + (check.val * testMap.tileSize) / 2
      ) {
        this.pos = oldPos; // Reset to old position on collision
        break;
      }
    }

    // Update the current frame for animation
    if (this.holding.w || this.holding.a || this.holding.s || this.holding.d) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    } else {
      this.currentFrame = 0; // Reset to standing frame when not moving
    }
  }

  checkCollisions(xOffset, yOffset, tileSize) {
    let x = floor(this.pos.x / tileSize) + xOffset;
    let y = floor(this.pos.y / tileSize) + yOffset;
    return {
      x: (x + 0.5) * tileSize,
      y: (y + 0.5) * tileSize,
      val: testMap.data[x + y * testMap.WIDTH],
    };
  }

  render() {
    push();
    fill(255);
    textSize(10);
    textAlign(CENTER);
    text(this.name, this.pos.x, this.pos.y - 25); // Display player's name above the character

    // Select the correct image based on the direction and frame
    let imageToRender;
    if (this.direction === 'up') {
      imageToRender = this.backImages[this.currentFrame];
    } else if (this.direction === 'down') {
      imageToRender = this.frontImages[this.currentFrame];
    } else if (this.direction === 'left') {
      imageToRender = this.leftImages[this.currentFrame];
    } else if (this.direction === 'right') {
      imageToRender = this.rightImages[this.currentFrame];
    }

    // Draw the character's image
    image(imageToRender, this.pos.x - 16, this.pos.y - 16, 32, 32); // Adjust size as needed

    this.renderHealthBar(); // Render health bar
    pop();
  }

  renderHealthBar() {
    push();
    fill(255, 0, 0);
    noStroke();

    // Draw health bar background
    rect(this.pos.x - 16, this.pos.y + 20, 32, 6);

    // Draw health bar foreground (based on current health)
    fill(0, 255, 0); // Green for health
    let healthWidth = map(this.hp, 0, this.mhp, 0, 32);
    rect(this.pos.x - 16, this.pos.y + 20, healthWidth, 6);

    pop();
  }
}
