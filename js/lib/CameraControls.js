//https://github.com/mrdoob/three.js/blob/master/examples/js/controls/PointerLockControls.js.js
/**
 * This requires an element that can be used as a button to activate the pointerLock and enable camera movement.
 *
 * Movement:
 * Mouse to rotate camera.
 * W A S D to navigate xz-axis.
 * Space to move up y-axis and c to move down y-axis
 */
class CameraControls {
    /**
     *
     * @param camera a Threejs camera object
     * @param pointerTarget domElement. Pointer lock will be requested when this element is clicked.
     * @param movementSpeed Defines how quickly the camera travels
     * @param cameraspeed defines how quickly the camera will turn when mouse is moved

     */
    constructor(camera, pointerTarget, movementSpeed = 25, cameraspeed = 0.002) {
        this.enabled = false;
        this.movementSpeed = movementSpeed;
        this.cameraspeed = cameraspeed;

        //the element will be used as a button to activate pointerLock
        this.pointerTarget = pointerTarget;

        this.yaw = new THREE.Object3D();
        this.pitch = new THREE.Object3D();
        this.yaw.position.y = 10;
        this.yawChange = 0;
        this.pitchChange = 0;


        this.pitch.add(camera);
        this.yaw.add(this.pitch);


        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;

        document.addEventListener('keydown', this.onKeyDown.bind(this), false );
        document.addEventListener('keyup', this.onKeyUp.bind(this), false );

        this.preparePointerLock();

    }//end constructor

    /**
     * returns the cameras parent object3d elements, these objectcs determines camera pitch and yaw
     */
    get object() {
        return this.yaw;
    }

    //add event listeners for locking and unlocking the pointer
    /**
     * Make browser is compatible with pointerLocks, adds eventListeners.
     */
    preparePointerLock() {
        
        this.havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
        this.element = document.body;


        if (this.havePointerLock) {

            // Hook pointer lock state change events
            document.addEventListener( 'pointerlockchange', this.pointerlockchange.bind(this), false );
            document.addEventListener( 'mozpointerlockchange', this.pointerlockchange.bind(this), false );
            document.addEventListener( 'webkitpointerlockchange', this.pointerlockchange.bind(this), false );
            document.addEventListener( 'pointerlockerror', this.pointerlockerror.bind(this), false );
            document.addEventListener( 'mozpointerlockerror', this.pointerlockerror.bind(this), false );
            document.addEventListener( 'webkitpointerlockerror', this.pointerlockerror.bind(this), false );

            document.addEventListener('mousemove', this.onMouseMove.bind(this), false);

            this.pointerTarget.addEventListener( 'click', this.lockPointer.bind(this) , false );
        }
    }

    //called when click event happens, locks the pointer for use in animation
    /**
     * Event handler for ClickEvent, called when user clicks on the graphics container and sends a request to the browser, for it to lock the pointer.
     * This will in turn fire the pointerLockChange event or a pointerlockerror if anything goes wrong.
     * @param event
     */
    lockPointer(event) {
        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
        document.body.requestPointerLock();
    }

    /**
     * Event handler for pointerLockError, called when an error occurs
     * @param event
     */
    pointerlockerror(event) {
        // do something?
    }

    /**
     * Event handler for pointerLockChange, called when pointer is locked or released
     * @param event
     */
    pointerlockchange(event) {
        if (document.pointerLockElement === this.element || document.mozPointerLockElement === this.element || document.webkitPointerLockElement === this.element) {
            this.enabled = true;
        } else {
            this.enabled = false;
        }
    }

    /**
     * Should be used in the update function and be called every frame.
     * Moves the camera if buttons are pressed and pointer is locked.
     * @param delta Time between this frame and the last, used to make movement consistent between frames.
     */
    update(delta) {

        //as long as pointer is not locked in, controls will not work
        if(!this.enabled) return;

        let x = 0;
        let y = 0;
        let z = 0;

        //add velocity in a particular direction
        //multiply by delta to ensure same speed between frames
        let mvspeed = this.movementSpeed;
        
        x += this.moveRight ? mvspeed : 0;
        x -= this.moveLeft ? mvspeed : 0;

        z -= this.moveForward ? mvspeed : 0;
        z += this.moveBackward ? mvspeed : 0;

        y += this.moveUp ? mvspeed : 0;
        y -= this.moveDown ? mvspeed : 0;

        this.object.translateX(x * delta);
        this.object.translateY(y * delta);
        this.object.translateZ(z * delta);

        //keep pitch between -90 and 90 degrees
//        let pitch = this.clamp(this.pitch.rotation.x - this.pitchChange * delta,Math.PI/2,-Math.PI/2);

        this.pitch.rotation.x += this.pitchChange*delta;
        this.yaw.rotation.y += this.yawChange * delta;

        this.pitch.rotation.x = this.clamp(this.pitch.rotation.x,-Math.PI/2,Math.PI/2);

        this.pitchChange = 0;
        this.yawChange = 0;
    }

    //stopper bevegelse når knappen slippes
    /**
     * Event handler for onKeyUp, camera will stop moving when key is not held down
     * @param event
     */
    onKeyUp(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
            case 32: // spacebar
                this.moveUp = false;
                break;
            case 67: // c
                this.moveDown = false;
                break;
        }
    }

    //starter bevegelse når knapp trykkes inn
    /**
     * Event handler for onKeyDown event, moves camera as long os the key is held down
     * @param event
     */
    onKeyDown(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
            case 32: // spacebar
                this.moveUp = true;
                break;
            case 67: // c
                this.moveDown = true;
        }
    }

    /**
     * Event handler for MouseMoved event, rotates camera around x and y axis based on mouse movement
     * @param event
     */
    onMouseMove(event) {
        if(!this.enabled) return;
        let x = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        let y = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.pitchChange -= y*this.cameraspeed;
        this.yawChange -= x*this.cameraspeed;

        //this.pitch.rotation.x -= y*this.cameraspeed;
        //this.yaw.rotation.y -= x*this.cameraspeed;

    }
    clamp(num, min, max) {
        return num <= min ? min : num >= max ? max : num;
    }
}