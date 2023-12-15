import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Importing textures
import mercury from './assets/images/mercury.jpg';
import venus from './assets/images/venus.jpg';
import earth from './assets/images/earth_daymap.jpg';
import mars from './assets/images/mars.jpg';
import jupiter from './assets/images/jupiter.jpg';
import saturn from './assets/images/saturn.jpg';
import saturnRings from './assets/images/saturn_ring.png';
import uranus from './assets/images/uranus.jpg';
import neptune from './assets/images/neptune.jpg';
import sunTexture from './assets/images/sun.jpg';
import stars from './assets/images/stars.jpg';
import moon from './assets/images/moon.jpg';

let scene, camera, renderer, controls, asteroidBelt, sun;
const planets = {}; // Storing planet meshes by name
let SGmaterial;

const planetsData = [
    { name: "Mercury", color: 0xaaaaaa, size: 0.03504, distance: 1.39, orbitSpeed: 0.04, texturePath: mercury, orbitColor: 0xaaaaaa },
    { name: "Venus", color: 0xffd700, size: 0.08691, distance: 1.72, orbitSpeed: 0.02, texturePath: venus, orbitColor: 0xffd700 },
    { name: "Earth", color: 0x0000ff, size: 0.09149, distance: 2, orbitSpeed: 0.01, texturePath: earth, orbitColor: 0x0000ff },
    { name: "Mars", color: 0xff4500, size: 0.04868, distance: 2.52, orbitSpeed: 0.008, texturePath: mars, orbitColor: 0xff4500 },
    { name: "Jupiter", color: 0xffa500, size: 1.00398, distance: 6.3, orbitSpeed: 0.004, texturePath: jupiter, orbitColor: 0xffa500 },
    { name: "Saturn", color: 0xf4c542, size: 0.83626, distance: 10.58, orbitSpeed: 0.003, texturePath: saturn, orbitColor: 0xf4c542, ringTexturePath: saturnRings },
    { name: "Uranus", color: 0x4169e1, size: 0.36422, distance: 20.22, orbitSpeed: 0.002, texturePath: uranus, orbitColor: 0x4169e1 },
    { name: "Neptune", color: 0x1e90ff, size: 0.35359, distance: 31.05, orbitSpeed: 0.001, texturePath: neptune, orbitColor: 0x1e90ff }
];

const moonData = {
    name: "Moon",
    color: 0xffffff,
    size: 0.015,
    distanceFromEarth: 0.2,
    orbitSpeed: 0.005,
    texturePath: moon
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const highestPlanetY = 100;
    camera.position.set(0, highestPlanetY, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Enable shadow mapping
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    document.body.appendChild(renderer.domElement);

    addStarBackground();

    // Initialize OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable damping (inertia)
    controls.dampingFactor = 0.25; // Damping inertia factor
    controls.screenSpacePanning = false;
    controls.maxDistance = 500;
    controls.minDistance = 1;

     // Swap the mouse buttons for rotate and pan
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE, // Rotate with the left mouse button
        MIDDLE: THREE.MOUSE.DOLLY, // Zoom with the middle mouse button / scroll wheel
        RIGHT: THREE.MOUSE.PAN // Pan with the right mouse button
    };

    // Add Sun
    let textureLoader = new THREE.TextureLoader();
    let sunGeometry = new THREE.SphereGeometry(5, 64, 64);
    let sunMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load(sunTexture) });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    const vertexShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 cameraPos;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vec3 viewVector = normalize(cameraPos - vPosition);
            float intensity = pow(0.5 - dot(vNormal, viewVector), 5.0);
            gl_FragColor = vec4(1.0, 0.9, 0.5, intensity);
        }
    `;

    SGmaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            cameraPos: { value: camera.position }
        },
        blending: THREE.AdditiveBlending,
        depthTest: false, // disable depth testing
        transparent: true, // enable transparency
        side: THREE.BackSide
    });    

    const glowMesh = new THREE.Mesh(sun.geometry.clone(), SGmaterial);
    glowMesh.scale.multiplyScalar(1.1);
    sun.add(glowMesh);

    // Add point light at the Sun's position
    const sunLight = new THREE.PointLight(0xffffff, 2000, 200);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);

    // Add Planets, their Orbits, and the Asteroid Belt
    planetsData.forEach(planetData => {
        const planet = createPlanet(planetData);
        planets[planetData.name] = planet; // Store the planet mesh
        createOrbit(planetData.distance, planetData.orbitColor);
    });

    asteroidBelt = createAsteroidBelt();

    let earth = planets["Earth"];
    if (earth) {
        const moon = createMoon(earth, moonData);
        moon.castShadow = true;
        earth.moon = moon; // Store the Moon in the Earth object for access during animation
    }

    camera.position.z = 120;
}

function animate() {
    requestAnimationFrame(animate);

    SGmaterial.uniforms.cameraPos.value.copy(camera.position);
    
    controls.update();

    for (const planetName in planets) {
        const planetInfo = planetsData.find(p => p.name === planetName);
        const planet = planets[planetName];
        const angle = planetInfo.orbitSpeed * Date.now() * 0.001;
        planet.mesh.position.x = Math.cos(angle) * planetInfo.distance * 10;
        planet.mesh.position.z = Math.sin(angle) * planetInfo.distance * 10;

        // Update label scale based on distance to camera
        const distance = camera.position.distanceTo(planet.mesh.position);
        const scale = THREE.MathUtils.clamp(distance / 5, 5, 50);
        planet.label.scale.set(scale, scale / 2, 1); // Maintain the aspect ratio of the label

        updatePlanetRotation(planet.mesh, sun.position);
    }

    const earth = planets["Earth"];
    if (earth && earth.moon) {
        earth.moon.pivot.rotation.y += moonData.orbitSpeed;
    }

    renderer.render(scene, camera);
}

function addStarBackground() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(stars);
    const geometry = new THREE.SphereGeometry(500, 64, 64);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
        //make darker
        color: 0x111111,
    });
    const starBackground = new THREE.Mesh(geometry, material);

    scene.add(starBackground);
}


function updatePlanetRotation(planetMesh, sunPosition) {
    const directionToSun = new THREE.Vector3().subVectors(sunPosition, planetMesh.position);
    planetMesh.rotation.y = Math.atan2(directionToSun.x, directionToSun.z);
}

function createPlanet(planetData) {
    const texture = new THREE.TextureLoader().load(planetData.texturePath, (tex) => {
        tex.encoding = THREE.sRGBEncoding;
    });

    let material = new THREE.MeshPhongMaterial({
        map: texture
    });

    let geometry = new THREE.SphereGeometry(planetData.size, 64, 64);
    let planet = new THREE.Mesh(geometry, material);
    planet.position.x = planetData.distance * 10;
    planet.castShadow = true; // Allow planet to cast shadow
    planet.receiveShadow = true; // Allow planet to receive shadow
    scene.add(planet);

    if (planetData.ringTexturePath) {
        addRingsToSaturn(planet, planetData);
    }

    // Create and add the label
    const label = createLabel(planetData.name, planetData.size);
    label.position.y = planetData.size * 2; // Position above the planet
    planet.add(label);

    // Create and add the ring
    const ring = createRing(planetData.size, planetData.color);
    planet.add(ring);

    return { mesh: planet, label: label, ring: ring };
}

function createMoon(earth, moonData) {
    const moonTexture = new THREE.TextureLoader().load(moonData.texturePath);
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
    const moonGeometry = new THREE.SphereGeometry(moonData.size, 32, 32);
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

    // Create a pivot at the Earth's position
    const moonPivot = new THREE.Object3D();

    // Set the Moon's position relative to the Earth
    moonMesh.position.set(moonData.distanceFromEarth, 0, 0);

    // Add the Moon mesh to the pivot
    moonPivot.add(moonMesh);

    // Add the pivot as a child of the Earth mesh so that it follows the Earth
    earth.mesh.add(moonPivot);

    return { mesh: moonMesh, pivot: moonPivot };
}

function createLabel(name, planetSize) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '16px Arial';
    context.fillStyle = 'white';
    context.fillText(name, 10, 20);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(planetSize * 5, planetSize * 2.5, 1); // Scale based on planet size

    return sprite;
}

function createRing(planetSize, color) {
    const innerSize = planetSize * 1.5; // Make sure the ring is larger than the planet
    const outerSize = innerSize * 1.1; // Make the ring slightly larger than the inner size
    const ringGeometry = new THREE.RingGeometry(innerSize, outerSize, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Rotate to encircle the planet
    return ring;
}

function addRingsToSaturn(planetMesh, planetData) {
    const numberOfRings = 50;
    const ringInnerSize = planetData.size * 1.1;
    const ringOuterSize = planetData.size * 2;
    const ringThickness = (ringOuterSize - ringInnerSize) / numberOfRings;

    // Define the gaps - these are the ranges where rings will not be created
    const gapRanges = [
        { start: 0.3, end: 0.32 },
        { start: 0.5, end: 0.53 },
        { start: 0.55, end: 0.58 },
    ];

    for (let i = 0; i < numberOfRings; i++) {
        const distanceFromSaturn = (i / numberOfRings);

        // Check if the current ring is within a gap range
        if (gapRanges.some(gap => distanceFromSaturn >= gap.start && distanceFromSaturn <= gap.end)) {
            continue; // Skip this iteration to create a gap
        }

        const innerRadius = ringInnerSize + ringThickness * i;
        const outerRadius = innerRadius + ringThickness;

        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 1);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(`hsl(0, 0%, ${20 + distanceFromSaturn * 50}%)`),
            transparent: true,
            opacity: 0.5 - distanceFromSaturn * 0.4,
            side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = Math.PI / 2;

        planetMesh.add(ringMesh); // Add the ring as a child of Saturn's mesh
    }
}

function createOrbit(distanceFromSun, color) {
    const orbitRadius = distanceFromSun * 10;
    const orbitThickness = 0.03;
    const orbitSegments = 128;

    const orbitGeometry = new THREE.RingGeometry(orbitRadius, orbitRadius + orbitThickness, orbitSegments);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
}

function createAsteroidBelt() {
    const asteroidBelt = new THREE.Object3D();
    const innerBeltRadius = 2.52 * 10 + 2; // Just outside Mars' orbit
    const outerBeltRadius = 6.2 * 10 - 10; // Just inside Jupiter's orbit
    const asteroidSize = 0.05; // Smaller size for asteroids

    for (let i = 0; i < 1500; i++) {
        const asteroidGeometry = new THREE.SphereGeometry(asteroidSize, 6, 6);
        const asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        const theta = Math.random() * 2 * Math.PI;
        const distance = THREE.MathUtils.lerp(innerBeltRadius, outerBeltRadius, Math.random());
        asteroid.position.x = distance * Math.cos(theta);
        asteroid.position.z = distance * Math.sin(theta);
        asteroid.position.y = (Math.random() - 0.5) * 2; // Randomize the y position to give some depth

        asteroid.castShadow = true;
        asteroid.receiveShadow = true;
        asteroidBelt.add(asteroid);
    }

    scene.add(asteroidBelt);
    return asteroidBelt;
}

init();
animate();
