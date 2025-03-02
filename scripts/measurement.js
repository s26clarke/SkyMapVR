let raycaster, line, isInMeasurementMode = false; // Global variables for raycaster, line, and mode flag

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

// Update the ray based on the rig's position and the camera's orientation
function updateRay() {
  if (!raycaster) return;

  // Use the rig's position as the ray origin
  const rigEntity = document.querySelector("#rig");
  if (!rigEntity) {
    console.error("Rig entity not found in the scene.");s
    return;
  }
  const rig = rigEntity.object3D;
  raycaster.ray.origin.copy(rig.position);
  

  // Get the camera's forward direction
  const cameraEntity = document.querySelector('[camera]');
  if (!cameraEntity) {
    console.error("Camera entity not found in the scene.");
    return;
  }
  const camera = cameraEntity.object3D;
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction); // This gives the forward vector (already normalized)

  raycaster.ray.origin.copy(camera.position);
  raycaster.ray.origin.y += 1.6; 
  //raycaster.ray.origin.x += 0.1

  //console.log(camera.position)
  // Do not invert the direction; we want the ray to extend in the same direction as the camera looks.
  // Multiply the direction to extend the ray 200 units forward.
  direction.multiplyScalar(-200); // Ray length: 200 units

  // Calculate the end point of the ray
  const endPoint = new THREE.Vector3().addVectors(raycaster.ray.origin, direction);

  // Perform the raycast against scene objects (ground and all entities)
  const sceneObjects = [
    document.querySelector('a-plane'),  // Ground plane
    ...document.querySelectorAll('a-entity')  // All other 3D models in the scene
  ].filter(object => object && object.object3D);

  const intersects = raycaster.intersectObjects(sceneObjects.map(obj => obj.object3D), true);

  let rayInfo = '';

  if (intersects.length > 0) {
    // If an intersection is detected, use that as the end point.
    const intersection = intersects[0];
    const intersectionPoint = intersection.point;
    rayInfo = `
      Ray Origin: (${raycaster.ray.origin.x.toFixed(2)}, ${raycaster.ray.origin.y.toFixed(2)}, ${raycaster.ray.origin.z.toFixed(2)})<br>
      Ray Direction: (${raycaster.ray.direction.x.toFixed(2)}, ${raycaster.ray.direction.y.toFixed(2)}, ${raycaster.ray.direction.z.toFixed(2)})<br>
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
      Ray Direction: (${raycaster.ray.direction.x.toFixed(2)}, ${raycaster.ray.direction.y.toFixed(2)}, ${raycaster.ray.direction.z.toFixed(2)})<br>
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
    isInMeasurementMode = !isInMeasurementMode;
    document.querySelector('#mode-status').textContent = isInMeasurementMode ? 'ON' : 'OFF';
    // Create the ray if entering measurement mode
    if (isInMeasurementMode && !raycaster) {
      createRay();
    }
  }
  if (event.key === 'r' && isInMeasurementMode) {
    // Reset the line geometry to a default short line
    const positions = line.geometry.attributes.position.array;
    positions[0] = 0;
    positions[1] = 0;
    positions[2] = 0;
    positions[3] = 0;
    positions[4] = 0;
    positions[5] = -1;
    line.geometry.attributes.position.needsUpdate = true;
    isInMeasurementMode = false;
    document.querySelector('#mode-status').textContent = 'OFF';
  }
});

// Animation loop: update the ray and debug info every frame
function animate() {
  if (isInMeasurementMode && raycaster) {
    updateRay();
  }
  // Log the rig's live position for debugging
  const rig = document.querySelector("#rig");
  if (rig && rig.object3D) {
    const pos = rig.object3D.position;
    console.log(`Live Rig Position: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}, Z=${pos.z.toFixed(2)}`);
  } else {
    console.warn("Rig not found or not initialized yet.");
  }
  requestAnimationFrame(animate);
}

animate();
