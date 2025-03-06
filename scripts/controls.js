document.addEventListener("keydown", (event) => {
  console.log("Key Pressed:", event.key);
});

AFRAME.registerComponent('button-press-listener', {
  init: function () {
    const el = this.el;
    el.addEventListener('buttondown', function (evt) {
      const rig = document.querySelector('#rig');
      const camera = rig.querySelector('[camera]'); // Get the camera entity
      if (evt.detail.id === 'buttonA') {
        rig.object3D.position.y += 0.1;
        camera.object3D.position.y += 0.1; // Also update the camera's Y position
      }
      if (evt.detail.id === 'buttonB') {
        rig.object3D.position.y = Math.max(0, rig.object3D.position.y - 0.1);
        camera.object3D.position.y = Math.max(0, camera.object3D.position.y - 0.1); // Also update the camera's Y position
      }
    });
  }
});

document.querySelector('.left-hand').setAttribute('button-press-listener', '');
document.querySelector('.right-hand').setAttribute('button-press-listener', '');

AFRAME.registerComponent('vr-controls', {
  schema: { speed: { type: 'number', default: 0.05 } },
  init: function () {
    this.handleThumbstick = this.handleThumbstick.bind(this);
    this.el.addEventListener('thumbstickmoved', this.handleThumbstick);
  },
  handleThumbstick: function (evt) {
    const rig = document.querySelector('#rig');
    const direction = evt.detail;
    if (this.el.classList.contains('left-hand')) {
      rig.object3D.position.x += direction.x * this.data.speed;
      rig.object3D.position.z += direction.y * this.data.speed;
    }
    if (this.el.classList.contains('right-hand')) {
      rig.object3D.rotation.y -= direction.x * 0.05;
    }
  }
});

document.querySelector('.left-hand').setAttribute('vr-controls', '');
document.querySelector('.right-hand').setAttribute('vr-controls', '');

document.addEventListener('keydown', (event) => {
  const rig = document.querySelector('#rig');
  const camera = rig.querySelector('[camera]'); // Get the camera entity
  if (event.key === 'q') {
    rig.object3D.position.y = Math.max(0, rig.object3D.position.y - 0.1);
    camera.object3D.position.y = rig.object3D.position.y;
  } else if (event.key === 'e') {
    rig.object3D.position.y += 0.1;
    camera.object3D.position.y = rig.object3D.position.y;
  }
});