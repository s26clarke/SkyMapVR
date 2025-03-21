AFRAME.registerComponent('load-ply', {
  schema: { src: { type: 'string' } },

  init: function () {
    const loader = new THREE.PLYLoader();
    const src = this.data.src; // Get the PLY file source from the schema

    if (!src) {
      console.error('No PLY file source provided.');
      return;
    }

    // Load the PLY file
    loader.load(src, (geometry) => {
      console.log('PLY File Loaded:', geometry);  // Log geometry to debug
      console.log(geometry.attributes.color);  // Log all attributes of the geometry to check for vertex colors

      // Ensure the geometry has vertex colors, and check if it's valid
      if (geometry.hasAttribute('color')) {

        // Create material with vertex colors
        const material = new THREE.PointsMaterial({
          size: 0.06,  // Adjust point size for better visibility - 0.01 default
          vertexColors: true  // Ensure the material uses vertex colors
        });

        const points = new THREE.Points(geometry, material);
        this.el.setObject3D('mesh', points); // Set the points as the object3D for the entity
      }
      else {
        console.log('PLY File does NOT have vertex colors. Using default color.');

        // Fallback material if no vertex colors are present
        const material = new THREE.PointsMaterial({
          size: 0.01,  // Adjust point size for better visibility
          color: 0x00ff00  // Default green color
        });

        const points = new THREE.Points(geometry, material);
        this.el.setObject3D('mesh', points); // Set the points as the object3D for the entity
      }
    }, undefined, (error) => {
      console.error('Error loading PLY file:', error);  // Log errors if the file doesn't load
    });
  }
});

// Fetch the list of PLY files from the Python backend
document.addEventListener('DOMContentLoaded', function () {
  //fetch('https://172.20.10.2:5000/get-ply-files')
  fetch('https://192.168.0.109:5000/get-ply-files')
    .then(response => response.json())
    .then(plyFiles => {
      console.log('PLY Files:', plyFiles);  // Log the list of PLY files
      const container = document.querySelector('#model-container');

      if (!container) {
        console.error("Error: #model-container element not found.");
        return;
      }

      // Loop through the PLY files and create A-Frame entities for each
      plyFiles.forEach(plyFile => {
        console.log(`Loading PLY file: ${plyFile}`); // Debug each file being loaded
        const modelEntity = document.createElement('a-entity');
        modelEntity.setAttribute('position', '0 3.5 -3');
        modelEntity.setAttribute('rotation', '-90 0 135');
        modelEntity.setAttribute('load-ply', { src: `models/${plyFile}` });  // Ensure correct path here with object syntax
        console.log(`Setting model path: models/${plyFile}`); // Debug the file path being set
        container.appendChild(modelEntity);
      });
    })
    .catch(error => console.error('Error loading PLY files:', error));
});
