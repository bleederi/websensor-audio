'use strict'

function toEulerianAngle(quat, out)
{
        const ysqr = quat[1] ** 2;

        // Roll (x-axis rotation).
        const t0 = 2 * (quat[3] * quat[0] + quat[1] * quat[2]);
        const t1 = 1 - 2 * (ysqr + quat[0] ** 2);
        out[0] = Math.atan2(t0, t1);
        // Pitch (y-axis rotation).
        let t2 = 2 * (quat[3] * quat[1] - quat[2] * quat[0]);
        t2 = t2 > 1 ? 1 : t2;
        t2 = t2 < -1 ? -1 : t2;
        out[1] = Math.asin(t2);
        // Yaw (z-axis rotation).
        const t3 = 2 * (quat[3] * quat[2] + quat[0] * quat[1]);
        const t4 = 1 - 2 * (ysqr + quat[2] ** 2);
        out[2] = Math.atan2(t3, t4);
        return out;
}
class InclinationSensor {
        constructor() {
        const sensor = new AbsoluteOrientationSensor({ frequency: 60 });
        const mat4 = new Float32Array(16);
        const euler = new Float32Array(3);
        sensor.onreading = () => {
                sensor.populateMatrix(mat4);
                let angles = toEulerianAngle(sensor.quaternion, euler);
                this.roll = euler[0];
                this.pitch = euler[1];
                this.yaw = euler[2];
                if (this.onreading) this.onreading();
        };
        sensor.onactivate = () => {
                if (this.onactivate) this.onactivate();
        }
        const start = () => sensor.start();
        Object.assign(this, { start });
        }
}
var roll = 0;
var pitch = 0;
var yaw = 0;
const container = document.querySelector('#app-view');
var camera, controls, scene, renderer;
var light, pointLight;

var material1, material2, material3;
var mesh1;
// panoramas background
var panoramasFolder = "backgrounds/";
var panoramasArray = ["01.jpg","02.jpg","03.jpg","04.jpg","05.jpg","06.jpg"];
var panoramaNumber = Math.floor(Math.random()*this.panoramasArray.length);

// setting up the renderer
var renderer = new THREE.WebGLRenderer();

// creating a new scene
var scene = new THREE.Scene();

// adding a camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
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

//document.body.appendChild(this.renderer.domElement);

camera.target = new THREE.Vector3(0, 0, 0);
sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
sphereMaterial.map = textureLoader.load(panoramasFolder.concat(panoramasArray[panoramaNumber]));
// geometry + material = mesh (actual object)
let sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
scene.add(sphereMesh);

	var listener = new THREE.AudioListener();
	camera.add( listener );

	var sphere2 = new THREE.SphereGeometry( 10, 32, 16 );

	material1 = new THREE.MeshPhongMaterial( { color: 0xffaa00, shading: THREE.FlatShading, shininess: 0 } );

	// sound spheres

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
const sensor = new InclinationSensor();
sensor.onreading = () => {
//Save sensor readings into variables - this step not actually necessary
roll = sensor.roll;
pitch = sensor.pitch;
yaw = sensor.yaw;
}
sensor.onactivate = () => {};
sensor.start();

}

/*
*   Calculates the direction the user is viewing in terms of longitude and latitude and renders the scene
*/
function render() {
        //Move the mesh and sound
        mesh1.translateX(0.5);
//Camera code based on tutorial from http://www.emanueleferonato.com/2014/12/10/html5-webgl-360-degrees-panorama-viewer-with-three-js/
        let longitudeRad = -yaw;
        let latitudeRad = roll - Math.PI/2;
        // limiting latitude from -85 degrees to 85 degrees (cannot point to the sky or under your feet)
        latitudeRad = Math.max(-85/180 * Math.PI, Math.min(85/180 * Math.PI, latitudeRad));
        // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
        camera.target.x = 500 * Math.sin(Math.PI/2 - latitudeRad) * Math.cos(longitudeRad);
        camera.target.y = 500 * Math.cos(Math.PI/2 - latitudeRad);
        camera.target.z = 500 * Math.sin(Math.PI/2 - latitudeRad) * Math.sin(longitudeRad);
        camera.lookAt(camera.target);
	renderer.render( scene, camera );
	requestAnimationFrame( render );

}
