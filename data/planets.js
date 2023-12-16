import mercury from '../assets/images/mercury.jpg';
import venus from '../assets/images/venus.jpg';
import earth from '../assets/images/earth_daymap.jpg';
import mars from '../assets/images/mars.jpg';
import jupiter from '../assets/images/jupiter.jpg';
import saturn from '../assets/images/saturn.jpg';
import saturnRings from '../assets/images/saturn_ring.png';
import uranus from '../assets/images/uranus.jpg';
import neptune from '../assets/images/neptune.jpg';

export const planetsData = [
    { name: "Mercury", color: 0xaaaaaa, size: 0.03504, distance: 1.39, orbitSpeed: 0.04, texturePath: mercury, orbitColor: 0xaaaaaa },
    { name: "Venus", color: 0xffd700, size: 0.08691, distance: 1.72, orbitSpeed: 0.02, texturePath: venus, orbitColor: 0xffd700 },
    { name: "Earth", color: 0x0000ff, size: 0.09149, distance: 2, orbitSpeed: 0.01, texturePath: earth, orbitColor: 0x0000ff },
    { name: "Mars", color: 0xff4500, size: 0.04868, distance: 2.52, orbitSpeed: 0.008, texturePath: mars, orbitColor: 0xff4500 },
    { name: "Jupiter", color: 0xffa500, size: 1.00398, distance: 6.3, orbitSpeed: 0.004, texturePath: jupiter, orbitColor: 0xffa500 },
    { name: "Saturn", color: 0xf4c542, size: 0.83626, distance: 10.58, orbitSpeed: 0.003, texturePath: saturn, orbitColor: 0xf4c542, ringTexturePath: saturnRings },
    { name: "Uranus", color: 0x4169e1, size: 0.36422, distance: 20.22, orbitSpeed: 0.002, texturePath: uranus, orbitColor: 0x4169e1 },
    { name: "Neptune", color: 0x1e90ff, size: 0.35359, distance: 31.05, orbitSpeed: 0.001, texturePath: neptune, orbitColor: 0x1e90ff }
];