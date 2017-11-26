"use strict";

class App {
    constructor({ clearColor = 0xFFFFFF } = {}) {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        // CAMERA
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 30000);

        // RENDERER
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.scene.fog = new THREE.FogExp2(0xffffff, 0.0003);

        // add canvas to DOM.
        let canvas = this.renderer.domElement;
        document.body.appendChild(canvas);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(clearColor);

        // handle window resizing.
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        this.extensions = [];
        this.ready = Promise.resolve(); // starts with a resolved promise.

        this.updatables = []; // a bunch of functions that are called each frame with 'this' as a parameter.
    }

    /**
     * Returns a valid App-extension given the callback and optional Promises.
     * @param  {Function} callback A callback function which is called by App, with parameters (app, promise1, ..., promiseN).
     * @param  {...Promise} promises The Promises you want resolved before doing the stuff in the callback (optional).
     * @return {Promise} A valid extension Promise.
     */
    static extension(callback, ...promises) {
        return new Promise((resolve, reject) => {
            Promise.all(promises).then((promiseArgs) => {
                resolve((app) => {
                    callback(app, ...promiseArgs);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Extends the application in an asynchronous manner by exposing 'this' as a parameter to the resolved callback-function.
     * @param  {Promise OR Function} extension A Promise-object that resolves with a callback function, or a callback function directly.
     */
    extend(extension) {
        this.extensions.push(Promise.resolve(extension));
        this.ready = Promise.all(this.extensions); // update ready to include the extension.
    }

    set clearColor(color) {
        this.renderer.setClearColor(clearColor);
    }

    /**
     * Starts the update and rendering loop as soon as all extensions have finished loading.
     * @return {Promise} A Promise, can be safely ignored, or used to start a task after the loop has started.
     */
    start() {
        return this.ready.then((callbacks) => { // once all extensions have loaded:
            callbacks.forEach((callback) => {
                callback(this); // run callback function, with this object as a parameter.
            });
            
            this.loop(); // start loop.

        }).catch((error) => {
            //console.log('Unable to start. An error occurred in one of the extensions: ', error);
            throw error;
        });
    }

    loop() {

        let delta = this.clock.getDelta();

        // perform updates, animations etc.:
        for (let i = 0; i < this.updatables.length; i++) {
            this.updatables[i](delta, this);
        }

        // Perform the render of the scene from our camera's point of view
        this.renderer.render(this.scene, this.camera);

        // this line loops the render call, remember to bind our context so we can access our stuff!
        window.requestAnimFrame(this.loop.bind(this));
    }
}


// shim layer with setTimeout fallback (ignore this)
window.requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
