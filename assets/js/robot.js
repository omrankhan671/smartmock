
function initRobot() {
    const container = document.getElementById('robot-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);

    // Robot Group
    const robot = new THREE.Group();
    scene.add(robot);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(1, 1, 3, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x60a9ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    robot.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x4394f4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    robot.add(head);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 32);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x60a9ff });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.5, 0, 0);
    leftArm.rotation.z = Math.PI / 4;
    robot.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.5, 0, 0);
    rightArm.rotation.z = -Math.PI / 4;
    robot.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 32);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4394f4 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.5, -2.5, 0);
    robot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.5, -2.5, 0);
    robot.add(rightLeg);

    camera.position.z = 10;

    function animate() {
        requestAnimationFrame(animate);

        // Robot animation
        const time = Date.now() * 0.001;
        robot.rotation.y = Math.sin(time) * 0.5;
        head.rotation.x = Math.sin(time * 2) * 0.2;
        leftArm.rotation.x = Math.sin(time * 3) * 0.5;
        rightArm.rotation.x = -Math.sin(time * 3) * 0.5;

        renderer.render(scene, camera);
    }

    animate();
}

document.addEventListener('DOMContentLoaded', initRobot);
