// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => { controls.lock(); });

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Block types
const blockTypes = {
  grass: new THREE.MeshStandardMaterial({color: 0x00ff00}),
  dirt: new THREE.MeshStandardMaterial({color: 0x8B4513}),
  stone: new THREE.MeshStandardMaterial({color: 0x808080}),
};

const blockSize = 1;
const blockGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);

// Simple terrain generation (10x10)
for(let x = -5; x <= 5; x++){
  for(let z = -5; z <= 5; z++){
    let height = Math.floor(Math.random() * 3); // Random height
    for(let y = 0; y < height; y++){
      const material = (y === height-1) ? blockTypes.grass : (y === height-2 ? blockTypes.dirt : blockTypes.stone);
      const block = new THREE.Mesh(blockGeometry, material);
      block.position.set(x, y, z);
      scene.add(block);
    }
  }
}

// Raycaster for block interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event){
  event.preventDefault();
  mouse.x = 0;
  mouse.y = 0;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if(intersects.length > 0){
    const intersect = intersects[0];
    if(event.button === 0){ // Left click: remove
      scene.remove(intersect.object);
    } else if(event.button === 2){ // Right click: place
      const newBlock = new THREE.Mesh(blockGeometry, blockTypes.grass);
      const pos = intersect.point.clone().add(intersect.face.normal);
      newBlock.position.set(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
      scene.add(newBlock);
    }
  }
}

window.addEventListener('mousedown', onMouseClick);
window.addEventListener('contextmenu', e => e.preventDefault());

// Movement
const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
const speed = 0.1;

// Animate
function animate(){
  requestAnimationFrame(animate);

  if(controls.isLocked){
    const direction = new THREE.Vector3();
    if(keys['w']) direction.z -= speed;
    if(keys['s']) direction.z += speed;
    if(keys['a']) direction.x -= speed;
    if(keys['d']) direction.x += speed;
    controls.moveRight(direction.x);
    controls.moveForward(direction.z);
  }

  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
