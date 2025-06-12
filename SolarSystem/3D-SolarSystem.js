 // Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Lighting
const light = new THREE.PointLight(0xffffff, 2, 100);
scene.add(light);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Raycaster for hover effect
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Background stars
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 1000; i++) {
    starVertices.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
    );
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Sun
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), sunMaterial);
scene.add(sun);

// Planets & Orbits
const planets = [];
const planetData = [
    { name: "Mercury", color: 0xaaaaaa, distance: 10, size: 0.5, speed: 0.04 },
    { name: "Venus", color: 0xffcc00, distance: 15, size: 0.9, speed: 0.03 },
    { name: "Earth", color: 0x0000ff, distance: 20, size: 1, speed: 0.02 },
    { name: "Mars", color: 0xff0000, distance: 25, size: 0.7, speed: 0.018 },
    { name: "Jupiter", color: 0xffa500, distance: 35, size: 2, speed: 0.01 },
    { name: "Saturn", color: 0xffff00, distance: 45, size: 1.7, speed: 0.008 },
    { name: "Uranus", color: 0x00ffff, distance: 55, size: 1.5, speed: 0.006 },
    { name: "Neptune", color: 0x0000ff, distance: 65, size: 1.4, speed: 0.005 }
];

const speedControlsDiv = document.getElementById("speedControls");

planetData.forEach((data, index) => {
    const material = new THREE.MeshLambertMaterial({ color: data.color, emissive: 0x111111 });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(data.size, 32, 32), material);
    planet.userData = { distance: data.distance, speed: data.speed, angle: 0 };
    scene.add(planet);
    planets.push(planet);

    const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    const label = document.createElement("label");
    label.innerHTML = `${data.name} Speed: `;
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0.001";
    slider.max = "0.05";
    slider.step = "0.001";
    slider.value = data.speed;
    slider.dataset.index = index;
    slider.addEventListener("input", event => {
        planets[event.target.dataset.index].userData.speed = parseFloat(event.target.value);
    });

    speedControlsDiv.appendChild(label);
    speedControlsDiv.appendChild(slider);
    speedControlsDiv.appendChild(document.createElement("br"));
});

// Camera movement
camera.position.set(30, 30, 80);
let rotationEnabled = true;
let cameraAngle = 0;

function animate() {
    requestAnimationFrame(animate);

    if (rotationEnabled) {
        planets.forEach(planet => {
            planet.userData.angle += planet.userData.speed;
            planet.position.x = planet.userData.distance * Math.cos(planet.userData.angle);
            planet.position.z = planet.userData.distance * Math.sin(planet.userData.angle);
        });
    }

    camera.position.x = 30 * Math.cos(cameraAngle);
    camera.position.z = 80 * Math.sin(cameraAngle);
    camera.lookAt(scene.position);
    cameraAngle += 0.001;

    starMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.001) * 0.5;

    renderer.render(scene, camera);
}
animate();

window.addEventListener("mousemove", event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);

    planets.forEach(planet => planet.material.emissive.setHex(0x111111));
    if (intersects.length > 0) {
        intersects[0].object.material.emissive.setHex(0xffffff);
    }
});
