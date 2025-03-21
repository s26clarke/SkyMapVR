let raycaster, line, isInMeasurementMode = false; // Global variables for raycaster, line, and mode flag

//Measurement point
function createPoint(coords){
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('position', `${coords.x} ${coords.y} ${coords.z}`)
    sphere.setAttribute('radius', '0.05'); // Set the radius of the sphere
    sphere.setAttribute('color', 'yellow'); // Set the color to blue

    document.querySelector('a-scene').appendChild(sphere);
}


// Create the ray and line in the scene
function createRay() {
  // Create a raycaster for intersection
  raycaster = new THREE.Raycaster();

  // Create a line geometry and material to visualize the ray
  const material = new THREE.LineBasicMaterial({
    color: 0xff0000, // Red color
    opacity: 0.7,
    transparent: true
  });
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(2 * 3); // Two points: start and end
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  line = new THREE.Line(geometry, material); // Create the line object
  document.querySelector('a-scene').object3D.add(line); // Add the line to the scene
}

//Get rid of er
function destroyRay(){
    if(line)
    {
        document.querySelector('a-scene').object3D.remove(line);
        line.geometry.dispose();
        line.material.dispose();
        line=null;
    }
}

// Update the ray based on the rig's position and the camera's orientation
function updateRay() {
  if (!raycaster || !line) return; // Check if raycaster and line exist

  // Get the camera's forward direction
  const cameraEntity = document.querySelector('[camera]');
  if (!cameraEntity) {
    console.error("Camera entity not found in the scene.");
    return;
  }

  const camera = cameraEntity.object3D;
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction); // This gives the forward vector (already normalized)

  // Set raycaster origin to be at the camera
  raycaster.ray.origin.copy(camera.position);

  // Do not invert the direction; we want the ray to extend in the same direction as the camera looks.
  direction.multiplyScalar(-200); // Ray length: 200 units

  // Calculate the end point of the ray
  const endPoint = new THREE.Vector3().addVectors(raycaster.ray.origin, direction);

  // Perform the raycast against scene objects (ground and all entities)
  const modelEntity = document.querySelector("#model-container a-entity");
  const sceneObjects = [];

  if (modelEntity && modelEntity.object3D) {
    modelEntity.object3D.traverse((child) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide; // Ensure it's visible from both sides
        child.castShadow = true;
        child.receiveShadow = true;
        sceneObjects.push(child);
      }
    });
  }

  // Perform raycasting on all scene objects
  const intersects = raycaster.intersectObjects(sceneObjects, true); // True for checking all descendants

  let rayInfo = '';

  if (intersects.length > 0) {
    // If an intersection is detected, use that as the end point.
    const intersection = intersects[0];
    const intersectionPoint = intersection.point;
    // Ray Direction: (${raycaster.ray.direction.x.toFixed(2)}, ${raycaster.ray.direction.y.toFixed(2)}, ${raycaster.ray.direction.z.toFixed(2)})<br>
    rayInfo = `
      Ray Origin: (${raycaster.ray.origin.x.toFixed(2)}, ${raycaster.ray.origin.y.toFixed(2)}, ${raycaster.ray.origin.z.toFixed(2)})<br>
      Intersection Point: (${intersectionPoint.x.toFixed(2)}, ${intersectionPoint.y.toFixed(2)}, ${intersectionPoint.z.toFixed(2)})<br>
    `;
    // Update the line geometry to end at the intersection
    const positions = line.geometry.attributes.position.array;
    positions[0] = raycaster.ray.origin.x;
    positions[1] = raycaster.ray.origin.y;
    positions[2] = raycaster.ray.origin.z;
    positions[3] = intersectionPoint.x;
    positions[4] = intersectionPoint.y;
    positions[5] = intersectionPoint.z;
    line.geometry.attributes.position.needsUpdate = true;
  } else {
    // If no intersection, extend the ray to the calculated end point (200 units ahead)
    rayInfo = `
      Ray Origin: (${raycaster.ray.origin.x.toFixed(2)}, ${raycaster.ray.origin.y.toFixed(2)}, ${raycaster.ray.origin.z.toFixed(2)})<br>
      Ray Extended to: (${endPoint.x.toFixed(2)}, ${endPoint.y.toFixed(2)}, ${endPoint.z.toFixed(2)})<br>
    `;
    // Update the line geometry to extend to the endpoint
    const positions = line.geometry.attributes.position.array;
    positions[0] = raycaster.ray.origin.x;
    positions[1] = raycaster.ray.origin.y;
    positions[2] = raycaster.ray.origin.z;
    positions[3] = endPoint.x;
    positions[4] = endPoint.y;
    positions[5] = endPoint.z;
    line.geometry.attributes.position.needsUpdate = true;
  }

  // Update on-screen debug info
  const debugInfoElement = document.querySelector('#debug-info');
  debugInfoElement.innerHTML = `
    <p>Measurement Mode: <span id="mode-status">${isInMeasurementMode ? 'ON' : 'OFF'}</span></p>
    <p>Distance: <span id="distance">N/A</span></p>
    <p>${rayInfo}</p>
  `;
}


// Toggle measurement mode on 'M' key press and reset on 'R'
document.addEventListener('keydown', (event) => {
  if (event.key === 'm') {

    if(!isInMeasurementMode){//Entering measurement mode
        isInMeasurementMode = true;
        document.querySelector('#mode-status').textContent = isInMeasurementMode ? 'ON' : 'OFF';

        createRay();
       
    }
    else{
        isInMeasurementMode = false;
        document.querySelector('#mode-status').textContent = 'OFF';
        destroyRay()
    }
        
  }
  //Delete all markers (reset)
  if (event.key === 'r' && isInMeasurementMode) {
    //pass
  }

  //Place a new marker
  if (event.key == 'p' && isInMeasurementMode){
    const cameraEntity = document.querySelector('[camera]');
    //const camera = cameraEntity.object3D.position;

    createPoint(cameraEntity.object3D.position);

    spheres = document.querySelectorAll('a-spheres')

    spheres.forEach((sphere, index) => {
        const position = sphere.getAttribute('position');
        console.log(`Sphere ${index + 1}: Position - X: ${position.x}, Y: ${position.y}, Z: ${position.z}`);
    });

  }
});

document.addEventListener("modelReady", () => {
  console.log("Model is ready for raycasting!");
  updateRay(); // Ensure raycasting runs after model loads
});

// Animation loop: update the ray and debug info every frame
function animate() {
  if (isInMeasurementMode && raycaster) {
    updateRay();
  }


  const camera = document.querySelector('[camera]');
  if (camera && camera.object3D) {
    const pos = camera.object3D.position;
    //console.log(`Live Camera Position: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}, Z=${pos.z.toFixed(2)}`);
  } else {
    console.warn("Camera not found or not initialized yet.");
  }
  requestAnimationFrame(animate);
}

animate();
