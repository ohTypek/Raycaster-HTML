//=============================================================================//
// The main variables of the code                                              //
//=============================================================================//

const mapS = 50, mapX = 10, mapY = 10;
const map = [
  1,1,1,1,1,1,1,1,1,1,
  1,4,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,1,
  1,0,0,4,2,2,0,0,0,1,
  1,0,0,4,5,5,0,0,0,1,
  1,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,1,
  1,0,0,0,1,3,3,0,0,1,
  1,0,0,0,0,0,1,0,0,1,
  1,1,1,1,1,1,1,1,1,1,
]

// The player object
const player = {
  div: document.getElementById('player'),
  x: 240,
  y: 290,
  angle: 0
}

// Indexes of each wall color
const wallColors = {
  0: 'black',
  1: 'white',
  2: 'red',
  3: 'blue',
  4: 'green',
  5: 'yellow'
};

// Array with all ray objects
const rays = createRays(90);

// Array which contains last 3 pressed keys
let lastKeys = [];

init();

function init() {
  // Draws the topdown view tiles
  for(let y = 0; y<mapY; y++) {
    for(let x = 0; x<mapX; x++) {
      let color = wallColors[map[y*mapX + x]];
  
      const div = document.createElement('div');
      div.classList.add('tile');
      div.style.setProperty('--color', color);
      div.style.setProperty('--top', `${y*mapS}px`);
      div.style.setProperty('--left', `${x*mapS}px`);
      document.getElementById('topdown').appendChild(div);
    }
  }

  calculateRays();
  update();
  drawScene();
}

// Creates ray objects and returns them to the rays array
function createRays(fov) {
  let arr = [];

  for(let i = 0; i<fov; i++) {
    const angle = player.angle + i-(fov/2);

    const div = document.createElement('div');
    div.classList.add('ray');
    div.style.setProperty('--length', '100px');
    div.style.setProperty('--angle', `${angle}deg`);
    player.div.appendChild(div);

    // Create ray object
    const ray = {
      div: div,      // the DOM element
      angle: angle,  // ray angle
      length: 100,   // ray lenght / height
      color: null    // color of the wall it hits
    };

    arr.push(ray);
  }

  return arr;
}

// Calculates the length and color of the ray
function calculateRays() {
  rays.forEach(ray => {
    // Convert angle to radians
    const radAngle = (ray.angle + player.angle) * Math.PI / 180;
    
    let rayLength = 0;
    let hitWall = false;

    while(!hitWall && radAngle < 600) {
      rayLength += 1;

      const rayOffset = 11; // We calculate rayX and rayY based on players position
                            // Since the rays are located in the middle of the player we add an offset to counteract the offset
      const rayX = player.x + Math.sin(radAngle) * rayLength + rayOffset;
      const rayY = player.y - Math.cos(radAngle) * rayLength + rayOffset;

      // Convert rayX and rayY to indexes of the map array
      const mX = Math.floor(rayX / mapS);
      const mY = Math.floor(rayY / mapS);

      // Check if the index is a wall or empty space
      if(map[mY*mapX + mX] > 0) {
        // Save the color and exit the function
        ray.color = wallColors[map[mY*mapX + mX]];
        hitWall = true;
      }
    }

    // Set the lenght to previously calculated rayLenght
    ray.length = rayLength;
  })
}

// Updates the positions and rotations of objects in the topdown view
function update() {
  player.div.style.setProperty('--top', `${player.y}px`);
  player.div.style.setProperty('--left', `${player.x}px`);

  rays.forEach(ray => {
    ray.div.style.setProperty('--angle', `${player.angle + ray.angle + 180}deg`);
    ray.div.style.setProperty('--length', `${ray.length}px`);
  });
}

// Draws the 3d part of the site
function drawScene() {
  const scene = document.getElementById('scene');
  scene.innerHTML = null; // Clear the div 

  // Calculate the width of each tile based on amount of rays and width of the scene
  const lineWidth = Math.floor(scene.offsetWidth / rays.length);

  let iteration = 0; // It's used to create offset from the side so they dont stack on top of eachother
  rays.forEach(ray => {
    // Remove fisheye effect
    const correctedDistance = ray.length * Math.cos(ray.angle * Math.PI / 180);

    // Calculate the height of each tile
    let lineHeight = mapS*360 / correctedDistance;
    if(lineHeight > 500) lineHeight = 500;

    // Place the tile in the middle of the screen
    let lineOffset = (500-lineHeight) / 2;

    // Creates a tile DOM element and appends it to the scene
    const div = document.createElement('div');
    div.classList.add('line');
    div.style.setProperty('--width', `${lineWidth}px`);
    div.style.setProperty('--height', `${lineHeight}px`);
    div.style.setProperty('--left', `${lineWidth * iteration}px`);
    div.style.setProperty('--top', `${lineOffset}px`);

    // Sets the tile's color and opacity for FoD
    div.style.background = ray.color || '#999';
    div.style.opacity = Math.max(0.2, 1-correctedDistance/600);

    scene.appendChild(div);

    iteration++;
  })
}

// Shows 3 last pressed keys
function showKeys(key) {
  const keysDiv = document.getElementById('keys');
  keysDiv.innerHTML = null; // Clear the div

  // Check whether the key is repeated
  if(lastKeys[lastKeys.length-1] !== key)
    lastKeys.push(key);

  // Save only last 3 and remove older
  if(lastKeys.length > 3)
    lastKeys = lastKeys.slice(1);

  // Start from the end and go to the start so the last key is the first one to appear
  for(let i = lastKeys.length-1; i>=0; i--) {
    const div = document.createElement('span');
    div.classList.add('key');
    div.innerText = lastKeys[i];
    keysDiv.appendChild(div);
  }
}

// Checks for user input
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  // Convert angle to radians
  const radAngle = player.angle * Math.PI / 180;

  if(key == 'w') {
    player.x += Math.sin(radAngle) * 5;
    player.y -= Math.cos(radAngle) * 5;
  }
  if(key == 's') {
    player.x -= Math.sin(radAngle) * 5;
    player.y += Math.cos(radAngle) * 5;
  }

  if(key == 'a') player.angle -= 5;
  if(key == 'd') player.angle += 5;

  if(player.angle > 360) player.angle -= 360;
  if(player.angle < 0)   player.angle += 360;

  showKeys(key);
  calculateRays();
  update();
  drawScene();
})