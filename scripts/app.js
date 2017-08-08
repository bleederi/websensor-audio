'use strict'

/*
*       Sensor class
*/

class InclinationSensor {
        constructor() {
        this.sensor_ = new AbsoluteOrientationSensor({ frequency: 60 });
        this.mat4_ = new Float32Array(16);
        this.roll_ = 0;
        this.pitch_ = 0;
        this.yaw_ = 0;
        this.sensor_.onreading = () => {
                this.sensor_.populateMatrix(this.mat4_);
                let quat = this.sensor_.quaternion;
                //Convert to Euler angles
                const ysqr = quat[1] ** 2;
                // Roll (x-axis rotation).
                const t0 = 2 * (quat[3] * quat[0] + quat[1] * quat[2]);
                const t1 = 1 - 2 * (ysqr + quat[0] ** 2);
                this.roll_ = Math.atan2(t0, t1);
                // Pitch (y-axis rotation).
                let t2 = 2 * (quat[3] * quat[1] - quat[2] * quat[0]);
                t2 = t2 > 1 ? 1 : t2;
                t2 = t2 < -1 ? -1 : t2;
                this.pitch_ = Math.asin(t2);
                // Yaw (z-axis rotation).
                const t3 = 2 * (quat[3] * quat[2] + quat[0] * quat[1]);
                const t4 = 1 - 2 * (ysqr + quat[2] ** 2);
                this.yaw_ = Math.atan2(t3, t4);
                if (this.onreading_) this.onreading_();
        };
        }
        start() { this.sensor_.start(); };
        stop() { this.sensor_.stop(); };
        get roll() {
                return this.roll_;
        }
        get pitch() {
                return this.pitch_;
        } 
        get yaw() {
                return this.yaw_;
        }
        set onactivate(func) {
                this.sensor_.onactivate_ = func;
        }
        set onerror(err) {
                this.sensor_.onerror_ = err;
        }
        set onreading (func) {
                this.onreading_ = func;  
        }
}
const container = document.querySelector('#app-view');
var sensor = null;
var camera, controls, scene, renderer;

var material1;
var mesh1;
// panoramas background
var image = "01.jpg";

// setting up the renderer
var renderer = new THREE.WebGLRenderer();

// creating a new scene
var scene = new THREE.Scene();

// adding a camera
const cameraConstant = 200;
const fov = 75;
var camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, cameraConstant);
// creation of a big sphere geometry
var sphere = new THREE.SphereGeometry(100, 100, 40);

// creation of the sphere material
var sphereMaterial = new THREE.MeshBasicMaterial();
var textureLoader = new THREE.TextureLoader();

init();
render();

/*
*   Sets up the THREE.js scene, initializes the orientation sensor and adds the canvas to the DOM
*/
function init() {

//ThreeJS scene setup below
renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio( window.devicePixelRatio );

camera.target = new THREE.Vector3(0, 0, 0);
sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));    //The sphere needs to be transformed for the image to render inside it
sphereMaterial.map = textureLoader.load(image);
// Combining geometry and material produces a mesh we can add to the scene
let sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
scene.add(sphereMesh);

var listener = new THREE.AudioListener();
camera.add( listener );

var sphere2 = new THREE.SphereGeometry( 10, 32, 16 );

material1 = new THREE.MeshPhongMaterial( { color: 0xffaa00, shading: THREE.FlatShading, shininess: 0 } );

// sound sphere

var audioLoader = new THREE.AudioLoader();

mesh1 = new THREE.Mesh( sphere2, material1 );
mesh1.position.set( 0, 0, 40 );
scene.add( mesh1 );

var sound1 = new THREE.PositionalAudio( listener );
audioLoader.load( 'sounds/baby-music-box_daniel-simion.wav', function( buffer ) {
	sound1.setBuffer( buffer );
	sound1.setRefDistance( 40 );
        sound1.setRolloffFactor(2);
	sound1.play();
});
mesh1.add( sound1 );
container.innerHTML = "";
container.appendChild( renderer.domElement );

/*
*       Sensor setup below
*/
sensor = new InclinationSensor();
sensor.start();

}

/*
*   Calculates the direction the user is viewing in terms of longitude and latitude and renders the scene
*/
function render() {
        let longitudeRad = -sensor.yaw;
        let latitudeRad = sensor.roll - Math.PI/2;
        // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
        camera.target.x = (cameraConstant/2) * Math.sin(Math.PI/2 - latitudeRad) * Math.cos(longitudeRad);
        camera.target.y = (cameraConstant/2) * Math.cos(Math.PI/2 - latitudeRad);
        camera.target.z = (cameraConstant/2) * Math.sin(Math.PI/2 - latitudeRad) * Math.sin(longitudeRad);
        camera.lookAt(camera.target);
	renderer.render( scene, camera );
	requestAnimationFrame( render );

}
