var camera, controls, scene, renderer;
var contatiner, stats;
var i;
var objects = [];
var enableFog = true;
var gameFlow
var taking_input = false;
scene = new THREE.Scene();
GameFlowState = {

	UNKNOWN: 0,
	INITIALISE: 1,
	GAMESTART: 2,
	GAMEPLAY: 3,
	TALLY: 4
};

// Main Class ------------------------------------------------------------------------------

class Entity {
	constructor() {}
	Update() {}
	Reset() {

	}
}
// Environment Class -------------------------------------------------------------------------

class Environment extends Entity {
	constructor() {
		super();
		this.size = 0;
		this.collidable = false;
		this.geometry = new THREE.PlaneGeometry(1000, 20000, 5, 1000);
		this.material = new THREE.MeshLambertMaterial({
			vertexColors: THREE.VertexColors
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(0, 5.5, 0);
		this.mesh.receiveShadow = true;
		this.mesh.castShadow = false;
		this.mesh.rotation.set(Math.PI * -0.5, 0, 0);

		for (var i = 0, l = this.geometry.faces.length; i < l; i++) {
			var face = this.geometry.faces[i];
			face.vertexColors[0] = new THREE.Color(0xf6d7b0);
			face.vertexColors[1] = new THREE.Color(0xeccca2);
			face.vertexColors[2] = new THREE.Color(0xe1bf92);
		}
		for (var i = 0; i < this.geometry.vertices.length; i++) {
			var vertex = this.geometry.vertices[i];
			vertex.x += (Math.random() * 60) - 15;
			vertex.y += (Math.random() * 60) - 15;
			vertex.z += (Math.random() * 30) - 15;
		}
		scene.add(this.mesh);
	}
}

// Obstacle Class ----------------------------------------------------------------------------

class Obstacle extends Entity {
	constructor() {
		super();
		this.size = 1;
		this.collidable = true;
		this.geometry = new THREE.SphereBufferGeometry(3.5, 12, 12);
		this.material = new THREE.MeshPhongMaterial({
			color: 'rgb(120, 120, 120)'
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.x = Math.random() * (80 - -80) + -70;
		this.mesh.position.z = Math.random() * (80 - -80) + -40;
		this.mesh.position.y = 25;
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = false;
		var loader = new THREE.TextureLoader();
		this.material.map = loader.load('img/rock.jpg');
		scene.add(this.mesh);


	}

	Reset() {
		super.Reset();
	}

	Update() {
		super.Update();
		this.mesh.position.z += 1.0;
		this.mesh.rotation.x += 0.1;
		this.mesh.rotation.y += 0.1;


		if (this.mesh.position.z > test.mesh.position.z + 30) {
			this.mesh.position.x = Math.random() * (80 - -80) + -80;
			this.mesh.position.y = 25;
			this.mesh.position.z -= 179;
		}

	}

}

// Game State -------------------------------------------------------------------------
var taking_input = false;
class GameFlow {
	constructor() {
		this.currentState = GameFlowState.INITIALISE;

	}

	Update() {

		switch (this.currentState) {

			case GameFlowState.INITIALISE:
				document.getElementById("intro_ok_button").onclick = function () {
					document.getElementById("intro_ui").style.display = 'none';
					gameFlow.currentState = GameFlowState.GAMESTART;
				}

				document.getElementById("intro_ui").style.display = 'block';
				gameFlow.currentState = GameFlowState.UNKNOWN;
				taking_input = false;
				break;

			case GameFlowState.GAMESTART:
				test.shields = 100;
				gameFlow.currentState = GameFlowState.GAMEPLAY;
				taking_input = false;
				break;

			case GameFlowState.GAMEPLAY:
				if (test.shields <= 0) {
					gameFlow.currentState = GameFlowState.TALLY;
				}

				taking_input = true;
				break;
			case GameFlowState.TALLY:
				document.getElementById("tally_ok_button").onclick = function () {
					document.getElementById("tally_ui").style.display = 'none';
					gameFlow.currentState = GameFlowState.INITIALISE;
				}

				document.getElementById("tally_ui").style.display = 'block';
				gameFlow.currentState = GameFlowState.UNKNOWN;
				taking_input = false;
				break;


		}
	}

}
var gameFlow = new GameFlow();

// Avatar Class ------------------------------------------------------------------------------

class avatar extends Entity {
	constructor(x, y, z) {
		super();
		this.shields = 100;
		this.size = 2;
		this.geometry = new THREE.ConeGeometry(2, 5, 12)
		this.material = new THREE.MeshPhongMaterial({
			color: 'rgb(120, 120, 120)'
		});
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.x = 0;
		this.mesh.position.y = 25;
		this.mesh.position.z = 20;
		this.mesh.rotation.x = 250;
		var loader = new THREE.TextureLoader();
		this.material.map = loader.load('img/space.JPG');
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = false;
		scene.add(this.mesh);
	}
	Reset() {
		super.Reset();
	}
	Update() {
		super.Update();
		document.getElementById('hud_shields').innerHTML = (this.shields).toFixed(2) + " %";
		if (this.CollidedWithObstacle() && this.shields > -0) {
			this.shields--;
		}
		if (this.mesh.position.x > 74) {
			this.mesh.position.x = 74;
			camera.position.x = 74;
		}
		if (this.mesh.position.x < -74) {
			this.mesh.position.x = -74;
			camera.position.x = -74;
		}
		this.mesh.position.z -= 0.8;
		camera.position.z -= 0.8;
	}
	DistanceTo(x, z) {
		// (xA-xB)²+(yA-yB)²+(zA-zB)² < (rA+rB)²

		let dist = Math.abs(Math.sqrt(
			((this.mesh.position.x - x) * (this.mesh.position.x - x)) +
			((this.mesh.position.z - z) * (this.mesh.position.z - z))
		));
		return dist;
	}

	IsCollidedWith(that) {
		// size + size > distance
		let collidedWith = (this.size + that.size) > this.DistanceTo(that.mesh.position.x, that.mesh.position.z);

		return collidedWith;
	}

	CollidedWithObstacle() {
		for (var n = 0; n < objects.length; n++) {
			if (objects[n].collidable == true) {
				if (this.IsCollidedWith(objects[n]) == true) {
					return true;
				}
			}
		}
		return false;
	}

}
var test = new avatar();




// -------------------------------------------------------------------------------------------

function init() {
	container = document.createElement('scenery');
	document.body.appendChild(container);
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	var loader = new THREE.TextureLoader();
	scene.background = loader.load('img/Back2.JPG');
	gameFlow.Update();

	var light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
	light.shadow.camera.right = 100;
	light.shadow.camera.left = -100;
	light.shadow.camera.top = 100;
	light.shadow.camera.bottom - 100;
	light.shadow.mapSize.width = 512; // default
	light.shadow.mapSize.height = 512; // default
	light.shadow.camera.near = 0.5; // default
	light.shadow.camera.far = 500; // default
	light.position.set(0, 100, 205);
	light.castShadow = true;
	scene.add(light);
	gameFlow.Update();

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.x = 0;
	camera.position.y = 30;
	camera.position.z = 35;

	if (enableFog) {
		scene.fog = new THREE.Fog(0xD8BFD8, 5, 255);
	}

	for (i = 0; i < 15; i++) {
		var obstacle = new Obstacle();
		objects.push(obstacle);
	}

	container.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);
}

// -------------------------------------------------------------------------------------------

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// -------------------------------------------------------------------------------------------

function animate() {

	requestAnimationFrame(animate);
	for (var i = 0; i < objects.length; i++) {
		objects[i].Update();
	}

	test.Update();
	gameFlow.Update();
	renderer.render(scene, camera);
}


init();

// -------------------------------------------------------------------------------------------

gameFlow.Update();
var myEnvironment = new Environment();
document.addEventListener("keydown", onDocumentKeyDown, false);

function onDocumentKeyDown(event) {
	var keyCode = event.keyCode;
	if (taking_input == true) {
		// forward
		if (keyCode == '') {
			myEnvironment.mesh.position.z += 2;
			Avatar.mesh.position.z += 5;
			camera.position.z += 5;

			// backwards
		} else if (keyCode == '') {
			myEnvironment.mesh.position.z += 1;
			camera.position.z += 1;
			// left
		} else if (keyCode == 65) {
			test.mesh.position.x -= 2;
			//myEnvironment.mesh.position.x -= 2;
			camera.position.x -= 2;
			// right
		} else if (keyCode == 68) {
			test.mesh.position.x += 2;
			//myEnvironment.mesh.position.x += 2;
			camera.position.x += 2;
		}
	}
};

// -------------------------------------------------------------------------------------------
animate();

// -------------------------------------------------------------------------------------------