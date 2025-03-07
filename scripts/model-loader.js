// Register a custom A-Frame component to load PLY files
AFRAME.registerComponent('load-ply', {
  schema: { src: { type: 'string' } },

  init: function () {
    const loader = new THREE.PLYLoader();
    const sceneEl = this.el.sceneEl;
    const src = this.data.src;

    if (!src) {
      console.error('No PLY file source provided.');
      return;
    }

    loader.load(src, (geometry) => {
      const material = new THREE.MeshStandardMaterial({
        vertexColors: THREE.VertexColors  // Use vertex colors from PLY file
      });

      const mesh = new THREE.Mesh(geometry, material);
      this.el.setObject3D('mesh', mesh);
    });
  }
});
// Fetch the list of PLY files from the Python backend

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5000/get-ply-files')
        .then(response => response.json())
        .then(plyFiles => {
            const container = document.querySelector('#model-container'); // Ensure correct ID

            if (!container) {
                console.error("Error: #model-container element not found.");
                return;
            }

            plyFiles.forEach(plyFile => {
                const modelEntity = document.createElement('a-entity');
                modelEntity.setAttribute('position', '0 3.5 -3');
                modelEntity.setAttribute('rotation', '180 0 0');
                modelEntity.setAttribute('gltf-model', `models/${plyFile}`); // Ensure correct path
                container.appendChild(modelEntity);
            });
        })
        .catch(error => console.error('Error loading PLY files:', error));
});