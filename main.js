// Verifica se o dispositivo é móvel
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Elementos de controle
const controls = document.getElementById('controls');
const upButton = document.getElementById('up');
const leftButton = document.getElementById('left');
const downButton = document.getElementById('down');
const rightButton = document.getElementById('right');

// Mostra os controles apenas em dispositivos móveis
if (isMobile) {
    controls.classList.remove('hidden');
}

// Eventos de toque para os botões
upButton.addEventListener('touchstart', () => moveAvatar('up'));
leftButton.addEventListener('touchstart', () => moveAvatar('left'));
downButton.addEventListener('touchstart', () => moveAvatar('down'));
rightButton.addEventListener('touchstart', () => moveAvatar('right'));

// Função para mover o avatar
function moveAvatar(direction) {
    if (!gameStarted) return;

    switch (direction) {
        case 'up':
            avatar.position.z -= moveSpeed;
            break;
        case 'down':
            avatar.position.z += moveSpeed;
            break;
        case 'left':
            avatar.position.x -= moveSpeed;
            break;
        case 'right':
            avatar.position.x += moveSpeed;
            break;
    }
}

// Configuração da cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Habilitar sombras
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Elementos da interface
const startScreen = document.getElementById('start-screen');
const hud = document.getElementById('hud');
const startButton = document.getElementById('start-button');

// Variáveis do jogo
let score = 0;
let cubes = [];
let gameStarted = false;
let avatar;

// Função para iniciar o jogo
function startGame() {
    startScreen.classList.add('hidden'); // Esconde a tela inicial
    hud.classList.remove('hidden'); // Mostra o HUD
    gameStarted = true;
    setupScene(); // Configura a cena
    animate(); // Inicia a animação
}

// Configuração da cena
function setupScene() {
    // Limpa a cena anterior (se houver)
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Chão
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Calçadas
    const sidewalkGeometry = new THREE.BoxGeometry(20, 0.2, 1);
    const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

    const sidewalk1 = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalk1.position.set(0, 0.1, -10.5);
    sidewalk1.receiveShadow = true;
    scene.add(sidewalk1);

    const sidewalk2 = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalk2.position.set(0, 0.1, 10.5);
    sidewalk2.receiveShadow = true;
    scene.add(sidewalk2);

    const sidewalk3 = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalk3.rotation.y = Math.PI / 2;
    sidewalk3.position.set(-10.5, 0.1, 0);
    sidewalk3.receiveShadow = true;
    scene.add(sidewalk3);

    const sidewalk4 = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalk4.rotation.y = Math.PI / 2;
    sidewalk4.position.set(10.5, 0.1, 0);
    sidewalk4.receiveShadow = true;
    scene.add(sidewalk4);

    // Função para criar postes de luz
    function createStreetLight() {
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 32);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 2.5;
        pole.castShadow = true;

        const lightGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 5;
        light.castShadow = true;

        const pointLight = new THREE.PointLight(0xffff00, 1, 10);
        pointLight.position.set(0, 5, 0);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;

        const streetLight = new THREE.Group();
        streetLight.add(pole);
        streetLight.add(light);
        streetLight.add(pointLight);

        return streetLight;
    }

    // Adiciona postes de luz nas 4 esquinas
    const streetLight1 = createStreetLight();
    streetLight1.position.set(-8, 0, -8);
    scene.add(streetLight1);

    const streetLight2 = createStreetLight();
    streetLight2.position.set(8, 0, -8);
    scene.add(streetLight2);

    const streetLight3 = createStreetLight();
    streetLight3.position.set(-8, 0, 8);
    scene.add(streetLight3);

    const streetLight4 = createStreetLight();
    streetLight4.position.set(8, 0, 8);
    scene.add(streetLight4);

    const streetLight5 = createStreetLight();
    streetLight5.position.set(0, 0, 0);
    scene.add(streetLight5);

    // Avatar
    const avatarGeometry = new THREE.BoxGeometry(1, 1, 1);
    const avatarMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    avatar.position.set(0, 0.5, 0);
    avatar.castShadow = true;
    scene.add(avatar);

    // Cubos brilhantes
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff00ff, 
        emissive: 0xff00ff 
    });

    for (let i = 0; i < 10; i++) {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(
            (Math.random() * 18) - 9,
            0.25,
            (Math.random() * 18) - 9
        );
        cube.castShadow = true;
        scene.add(cube);
        cubes.push(cube);
    }

    // Posiciona a câmera
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
}

// Controles do avatar
const moveSpeed = 0.1;
document.addEventListener('keydown', (event) => {
    if (!gameStarted) return;
    switch (event.key) {
        case 'ArrowUp': avatar.position.z -= moveSpeed; break;
        case 'ArrowDown': avatar.position.z += moveSpeed; break;
        case 'ArrowLeft': avatar.position.x -= moveSpeed; break;
        case 'ArrowRight': avatar.position.x += moveSpeed; break;
    }
});

// Verifica colisões
function checkCollisions() {
    cubes.forEach((cube, index) => {
        if (cube.position.distanceTo(avatar.position) < 1) {
            scene.remove(cube);
            cubes.splice(index, 1);
            score++;
            hud.textContent = `Pontuação: ${score}`;
        }
    });
}

// Animação
function animate() {
    if (!gameStarted) return;
    requestAnimationFrame(animate);
    checkCollisions();
    renderer.render(scene, camera);
}

// Evento de clique no botão Start
startButton.addEventListener('click', startGame);

// Redimensionamento da janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
