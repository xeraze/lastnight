const textDisplay = document.getElementById('text-display');
const choicesContainer = document.getElementById('choices-container');
const player = document.getElementById('player');
const gameWorld = document.getElementById('game-world');

const sceneRoom = document.getElementById('scene-room');
const sceneCorridor = document.getElementById('scene-corridor');
const sceneDiscovery = document.getElementById('scene-discovery');
const allScenes = [sceneRoom, sceneCorridor, sceneDiscovery];

let playerX = 0;
let playerY = 0;
const speed = 5;
const WORLD_SIZE = 300;


const gameStates = {
    start: {
        text: "Тишина. Вы сидите за столом, доедая печенье. Рядом на телефоне что-то тихо бормочет, свет от экрана мягко освещает стол. Вы чувствуете себя расслабленно и спокойно.",
        scene: sceneRoom,
        startX: 50, startY: 200,
        choices: [
            {
                text: "Продолжить есть печенье.",
                nextState: "calm_continue"
            }
        ]
    },
    calm_continue: {
        text: "Внезапно, **резкий, многоголосый крик** пронзает тишину. Страх, боль, отчаяние. Звук из телефона обрывается. Сердце колотится.",
        scene: sceneRoom,
        startX: 50, startY: 200,
        choices: [
            {
                text: "Встать и выйти из комнаты в коридор (Управление WASD)",
                nextState: "corridor_movement"
            }
        ]
    },
    corridor_movement: {
        text: "Вы входите в коридор. Абсолютная тьма. В дальнем **правом** углу мерцает слабый свет. (Управляйте движением с помощью WASD/Стрелок).",
        scene: sceneCorridor,
        startX: 15, startY: 150,
        choices: []
    },
    discovery: {
        text: "Вы вошли в комнату. В центре, в слабом пятне света, лежит... котенок. Вокруг него растекается густая, **темно-бордовая жидкость**.",
        scene: sceneDiscovery,
        startX: 150, startY: 200,
        choices: []
    },
    glitch: {
        text: "#### [ERROR] @%#$ Тёма... почему.. **&^$@!%^&**",
        isGlitch: true,
        scene: sceneDiscovery,
        choices: []
    },
    end: {
        text: "Вся комната погружается в абсолютную тьму. Остается только луч света, направленный на котенка. Вы не можете отвести взгляд.\n\n[КОНЕЦ ДЕМО]",
        scene: sceneDiscovery,
        choices: [
            {
                text: "Обернуть время вспять.",
                nextState: "start"
            }
        ]
    }
};

function updatePlayerPosition() {
    playerX = Math.max(0, Math.min(playerX, WORLD_SIZE - 15));
    playerY = Math.max(0, Math.min(playerY, WORLD_SIZE - 15));

    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}

function handleMovement(event) {
    if (document.body.getAttribute('data-state') !== 'corridor_movement') return;

    let moved = false;
    
    switch (event.key.toLowerCase()) {
        case 'w':
        case 'ц':
        case 'arrowup':
            playerY -= speed;
            moved = true;
            break;
        case 's':
        case 'ы':
        case 'arrowdown':
            playerY += speed;
            moved = true;
            break;
        case 'a':
        case 'ф':
        case 'arrowleft':
            playerX -= speed;
            moved = true;
            break;
        case 'd':
        case 'в':
        case 'arrowright':
            playerX += speed;
            moved = true;
            break;
    }
    
    if (moved) {
        updatePlayerPosition();
        checkCollision();
    }
}

function checkCollision() {
    if (playerX > (WORLD_SIZE - 40) && playerY < 60) { 
        window.removeEventListener('keydown', handleMovement);
        showState('discovery');
    }
}


function showState(stateKey) {
    const state = gameStates[stateKey];
    textDisplay.textContent = state.text;
    choicesContainer.innerHTML = '';
    document.body.setAttribute('data-state', stateKey); 

    allScenes.forEach(scene => scene.style.display = 'none');
    player.style.display = 'none';
    window.removeEventListener('keydown', handleMovement); 

    if (state.scene) {
        state.scene.style.display = 'block';
    }

    if (stateKey === 'corridor_movement') {
        playerX = state.startX;
        playerY = state.startY;
        player.style.display = 'block';
        updatePlayerPosition();
        window.addEventListener('keydown', handleMovement); 
        return;
    }

    if (stateKey === 'start' || stateKey === 'calm_continue') {
        playerX = state.startX;
        playerY = state.startY;
        player.style.display = 'block';
        updatePlayerPosition();
    }
    
    if (state.isGlitch) {
        textDisplay.classList.add('glitch');
        setTimeout(() => {
            textDisplay.classList.remove('glitch');
            showState('end');
        }, 1500);
        return;
    }

    state.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.addEventListener('click', () => {
            if (choice.nextState === 'corridor_movement') {
                showState('corridor_movement');
            } else {
                if (choice.nextState === 'discovery') {
                    showState('discovery');
                    setTimeout(() => showState('glitch'), 2000);
                } else {
                     showState(choice.nextState);
                }
            }
        });
        choicesContainer.appendChild(button);
    });
}

showState('start');
