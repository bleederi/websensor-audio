'use strict';

//This is an inclination sensor that uses AbsoluteOrientationSensor and converts the quaternion to Euler angles
class AbsoluteInclinationSensor {
        constructor() {
        this.sensor_ = new RelativeOrientationSensor({ frequency: 60 });
        this.roll_ = 0;
        this.pitch_ = 0;
        this.yaw_ = 0;
        this.sensor_.onreading = () => {
                let quat = this.sensor_.quaternion;
                let quaternion = new THREE.Quaternion();
                //Convert to Euler angles
                const ysqr = quat[1] ** 2;

                // Roll (y-axis rotation).
                const t0 = 2 * (quat[3] * quat[0] + quat[1] * quat[2]);
                const t1 = 1 - 2 * (ysqr + quat[0] ** 2);
                //this.roll_ = Math.atan2(t0, t1);

                // Pitch (x-axis rotation).
                let t2 = 2 * (quat[3] * quat[1] - quat[2] * quat[0]);
                t2 = t2 > 1 ? 1 : t2;
                t2 = t2 < -1 ? -1 : t2;
                //this.pitch_ = Math.asin(t2);

                // Yaw (z-axis rotation).
                const t3 = 2 * (quat[3] * quat[2] + quat[0] * quat[1]);
                const t4 = 1 - 2 * (ysqr + quat[2] ** 2);
                //this.yaw_ = Math.atan2(t3, t4);
                if (this.onreading_) this.onreading_();
                quaternion.set(quat[0], quat[1], quat[2], quat[3]);     //x,y,z,w
                euler.setFromQuaternion(quaternion, 'YZX');     //ZYX works in portrait, YZX in landscape
                //this.pitch_ = euler.x;
                //this.roll_ = euler.y;
                //this.yaw_ = euler.z;
        };
        }
        start() { this.sensor_.start(); }
        stop() { this.sensor_.stop(); }
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
var euler = new THREE.Euler( 0, 0, 0, 'YZX' );
var sensor = null;

var image = "beach_dinner.jpg";

//Sets up the required THREE.js variables
var renderer = new THREE.WebGLRenderer();
var scene = new THREE.Scene();

//Camera setup
var cameraConstant = 200;
var fov = 75;
var camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, cameraConstant);
camera.target = new THREE.Vector3(0, 0, 0);

//The sphere where the image will be projected
var sphere = new THREE.SphereGeometry(100, 100, 40);

//TextureLoader for loading the image
var textureLoader = new THREE.TextureLoader();
//AudioLoader for loading audio
var audioLoader = new THREE.AudioLoader();

//init();       //needs to be activated via button press due to fullscreen requirement, does not respond correctly to orientation changes if not fullscreen

//This function sets up the THREE.js scene, initializes the orientation sensor and adds the canvas to the DOM
function init() {

//ThreeJS scene setup below
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );

//Creating the sphere for the image and adding it to the scene
sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));    //The sphere needs to be transformed for the image to render inside it
let sphereMaterial = new THREE.MeshBasicMaterial();
sphereMaterial.map = textureLoader.load(image); //Use the image as the material for the sphere
// Combining geometry and material produces the mesh with the image as its material
let sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
scene.add(sphereMesh);

//The sound needs to be attached to a mesh, here an invisible one, in order to be able to be positioned in the scene. Here the mesh is created and added to the scene
let soundmesh = new THREE.Mesh( new THREE.SphereGeometry(), new THREE.MeshPhongMaterial() );    //The mesh is invisible by default
soundmesh.position.set( -40, 0, 0 ); //The position where the sound will come from, important for directional sound
scene.add( soundmesh );


//Add an audio listener to the camera so we can hear the sound
let listener = new THREE.AudioListener();
camera.add( listener ); //This causes error in landscape mode!

//Here the sound is loaded and attached to the mesh
let sound = new THREE.PositionalAudio( listener );
audioLoader.load( 'ocean.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setRefDistance( 40 );
        sound.setRolloffFactor(1);
	sound.play();
});
soundmesh.add( sound );
container.innerHTML = "";
container.appendChild( renderer.domElement );

 /* var show = function() {
        console.log("Orientation type is " + screen.orientation.type);
        console.log("Orientation angle is " + screen.orientation.angle);
        console.log("w,h:", window.innerWidth, window.innerHeight, "cw, ch:", renderer.domElement.width, renderer.domElement.height);
    //camera.aspect = window.innerWidth / window.innerHeight;
    //camera.updateProjectionMatrix();
var width = container.offsetWidth;
var height = container.offsetHeight;
camera.aspect = width / height;
camera.updateProjectionMatrix();
renderer.setSize(width, height);
        //renderer.setSize(window.innerWidth, window.innerHeight);
        //renderer.setPixelRatio( window.devicePixelRatio );
        //render();
    //renderer.domElement.style.width = window.innerWidth;
    //renderer.domElement.style.height = window.innerHeight;   
        //sphereMaterial.map = textureLoader.load(image); //Use the image as the material for the sphere
        //sphereMaterial.needsUpdate = true;
  }*/
//document.body.requestFullscreen();
//s                                                                                                      creen.orientation.lock('portrait');
//screen.orientation.addEventListener("change", show);


//Sensor setup below - try-catch only for testing
try {
sensor = new AbsoluteInclinationSensor();
sensor.start();
}
catch(err)
{
console.log(err);
sensor = null;
}

window.addEventListener( 'resize', onWindowResize, false );     //for some reason orientationchange does not work

function onWindowResize() {0
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth , window.innerHeight);
}
//container.requestFullscreen();        //needed to make canvas resize correctly on orientation change

        document.getElementById("startbutton").remove();     //hide button
render();

                var interval=window.setInterval(update_debug,100);
}
//Latitude supposed to go -pi to pi down->up
//Calculates the direction the user is viewing in terms of longitude and latitude and renders the scene
function render() {
        //const canvas = renderer.domElement;
        //renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
//camera.aspect = canvas.clientWidth / canvas.clientHeight;
//camera.updateProjectionMatrix();
        if(sensor !== null)
        {
                if(screen.orientation.angle === 0)
                {
                        console.log(euler.x, euler.y, euler.z);
                        var longitudeRad = -euler.y;
                        var latitudeRad = euler.x - Math.PI/2;
                }
                else if(screen.orientation.angle === 90 || screen.orientation.angle === 180 || screen.orientation.angle === 270)
                {
                        console.log(euler.x, euler.y, euler.z);
                                var longitudeRad = -euler.x;
                                var latitudeRad = euler.y - Math.PI/2;                                                
                
                }
        }
        else
        {
                var longitudeRad = 0;
                var latitudeRad = 0;       
        }        

        camera.target.x = (cameraConstant/2) * Math.sin(Math.PI/2 - latitudeRad) * Math.cos(longitudeRad);
        camera.target.y = (cameraConstant/2) * Math.cos(Math.PI/2 - latitudeRad);
        camera.target.z = (cameraConstant/2) * Math.sin(Math.PI/2 - latitudeRad) * Math.sin(longitudeRad);
        camera.lookAt(camera.target);
	renderer.render( scene, camera );
	requestAnimationFrame( render );

}

function update_debug()
{
                        document.getElementById("ori").textContent = `Orientation: ${euler.x} ${euler.y} ${euler.z}`;
}
