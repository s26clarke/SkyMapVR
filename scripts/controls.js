document.addEventListener('DOMContentLoaded', function () {
    // Button Press Listener (for jumping or vertical movement)
    AFRAME.registerComponent('button-press-listener', {
        init: function () {
            const el = this.el;
            el.addEventListener('buttondown', function (evt) {
                const rig = document.querySelector('#rig');
                const camera = rig.querySelector('[camera]'); // Get the camera entity
                if (evt.detail.id === 'buttonA') {
                    rig.object3D.position.y += 0.1;
                    camera.object3D.position.y += 0.1; // Update the camera's Y position
                }
                if (evt.detail.id === 'buttonB') {
                    rig.object3D.position.y = Math.max(0, rig.object3D.position.y - 0.1);
                    camera.object3D.position.y = Math.max(0, camera.object3D.position.y - 0.1); // Update the camera's Y position
                }
            });
        }
    });

    document.querySelector('.left-hand').setAttribute('button-press-listener', '');
    document.querySelector('.right-hand').setAttribute('button-press-listener', '');

    // VR Controls Listener for movement and rotation
    AFRAME.registerComponent('vr-controls', {
        schema: {speed: {type: 'number', default: 0.1}},

        init: function () {
            this.handleThumbstick = this.handleThumbstick.bind(this);
            this.el.addEventListener('thumbstickmoved', this.handleThumbstick);
        },

        handleThumbstick: function (evt) {
            const rig = document.querySelector('#rig');
            const camera = rig.querySelector('[camera]');
            const input = evt.detail; // Contains thumbstick x and y values

            // Compute the camera's world direction for left-hand movement
            const camDir = new THREE.Vector3();
            camera.object3D.getWorldDirection(camDir);
            camDir.y = 0; // Remove vertical component to constrain movement to the horizontal plane
            camDir.normalize();

            // Compute the right vector for left-hand movement
            const right = new THREE.Vector3();
            right.crossVectors(new THREE.Vector3(0, 1, 0), camDir).normalize();

            // Left-hand controller: Move forward/backward and strafe left/right based on camera's orientation
            if (this.el.classList.contains('left-hand')) {
                rig.object3D.position.x += input.y * this.data.speed * camDir.x + input.x * this.data.speed * right.x;
                rig.object3D.position.z += input.y * this.data.speed * camDir.z + input.x * this.data.speed * right.z;
            }

            // Right-hand controller: Rotate the rig (camera) for looking around (turning)
            if (this.el.classList.contains('right-hand')) {
                rig.object3D.rotation.y -= input.x * 0.05; // Rotate the rig around the Y axis based on thumbstick X input (looking left/right)
            }
        }
    });


    document.querySelector('.left-hand').setAttribute('vr-controls', '');
    document.querySelector('.right-hand').setAttribute('vr-controls', '');

    // Keyboard Event Listener for Q and E (to move up and down)
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
});
