import * as THREE from 'three';

import { scene, camera, renderer, controls, createScene } from './scene/index.js';

import { planetsData } from './data/planets.js';
import { moonsData } from './data/moons.js';

import sunTexture from './assets/images/sun.jpg';

import { createPlanet, createMoon } from './utils/index.js';

let sun;
const planets = {}; // Storing planet meshes by name
let SGmaterial;

function init() {
    createScene();

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
        const planet = createPlanet(scene,planetData);
        planets[planetData.name] = planet; // Store the planet mesh
        createOrbit(planetData.distance, planetData.orbitColor);
    });

    let earth = planets["Earth"];
    if (earth) {
        const moon = createMoon(earth, moonsData[0]);
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
        earth.moon.pivot.rotation.y += moonsData[0].orbitSpeed;
    }

    renderer.render(scene, camera);
}

function updatePlanetRotation(planetMesh, sunPosition) {
    const directionToSun = new THREE.Vector3().subVectors(sunPosition, planetMesh.position);
    planetMesh.rotation.y = Math.atan2(directionToSun.x, directionToSun.z);
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

init();
animate();
