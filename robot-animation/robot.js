import * as THREE from 'three';

let scene, camera, renderer, robot;
let mouse = { x: 0, y: 0 };

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-1, 1, 1);
    scene.add(directionalLight);

    // Robot
    createRobot();

    // Events
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    animate();
}

function createRobot() {
    robot = new THREE.Group();

    // Head
    const headGeometry = new THREE.BoxGeometry(1, 1, 1);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.5, metalness: 1 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.name = 'head';
    robot.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.25, 0.25, 0.5);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.25, 0.25, 0.5);
    head.add(rightEye);

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5, metalness: 1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -1.5;
    robot.add(body);

    scene.add(robot);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);

    if (robot) {
        const head = robot.getObjectByName('head');
        if (head) {
            head.rotation.y = mouse.x * 0.5;
            head.rotation.x = mouse.y * -0.5;
        }
    }

    renderer.render(scene, camera);
}

init();
