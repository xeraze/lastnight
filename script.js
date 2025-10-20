const textDisplay = document.getElementById('text-display');
const choicesContainer = document.getElementById('choices-container');
const player = document.getElementById('player');
const continueButton = document.getElementById('continue-button');
const gameWorld = document.getElementById('game-world');
const snowContainer = document.getElementById('snow-container');

const sceneRoom = document.getElementById('scene-room');
const sceneCorridor = document.getElementById('scene-corridor');
const sceneDiscovery = document.getElementById('scene-discovery');
const allScenes = [sceneRoom, sceneCorridor, sceneDiscovery];

let playerX = 0;
let playerY = 0;
const speed = 4;
const WORLD_SIZE = 400; 

function generateSnowflakes(count) {
    for (let i = 0; i < count; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = `${Math.random() * 100}vw`;
        flake.style.animationDuration = `${Math.random() * 5 + 3}s`;
        flake.style.animationDelay = `-${Math.random() * 5}s`;
        snowContainer.appendChild(flake);
    }
}
generateSnowflakes(50);

const gameStates = {
    start: {
        text: "Тишина. Вы сидите за столом, доедая печенье. За окном идет снег. Вы чувствуете себя расслабленно и спокойно.",
        scene: sceneRoom,
        startX: 150, startY: 200, 
        choices: [{ text: "Продолжить есть печенье.", nextState: "calm_continue" }]
    },
    calm_continue: {
        text: "Внезапно, **резкий, многоголосый крик** пронзает тишину. Страх, боль, отчаяние. Звук из телефона обрывается. Сердце колотится.",
        scene: sceneRoom,
        startX: 150, startY: 200,
        choices: [{ text: "Встать и выйти из комнаты в коридор (Управление WASD)", nextState: "corridor_movement" }]
    },
    corridor_movement: {
        text: "Вы вышли в темный коридор. Единственный открытый свет — в комнате впереди, справа. (WASD/Стрелки)",
        scene: sceneCorridor,
        startX: 175, startY: 350,
        choices: []
    },
    discovery: {
        text: "Вы вошли в комнату. В слабом луче света лежит... котенок. Кровать залита густой, **темно-бордовой жидкостью**. Та же жидкость сочится из его ушка.",
        scene: sceneDiscovery,
        startX: 190, startY: 300, 
        choices: []
    },
    glitch: {
        text: "#### [ERROR] @%#$ Тёма... почему.. **&^$@!%^&**",
        isGlitch: true,
        scene: sceneDiscovery,
        choices: []
    },
    end: {
        text: "Вся комната погружается в абсолютную тьму. Остается только луч света, направленный на котенка. Вы не можете отвести взгляд.",
        scene: sceneDiscovery,
        choices: [
            { text: "Обернуть время вспять.", nextState: "start" }
        ]
    }
};


function updatePlayerPosition() {
    playerX = Math.max(0, Math.min(playerX, WORLD_SIZE - 18));
    playerY = Math.max(0, Math.min(playerY, WORLD_SIZE - 18));

    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}

function getCorridorBounds() {
    let minX = 50;
    let maxX = WORLD_SIZE - 50 - 18; 
    let minY = 0;
    let maxY = WORLD_SIZE - 18;

    if (playerX >= (WORLD_SIZE - 50 - 18) - 50 && playerY < 180 && playerY > 100) {
        maxX = (WORLD_SIZE - 50 - 18) - 50; 
    }
    
    if (playerX <= 50) {
        if (playerY > 240 || (playerY < 200 && playerY > 90) || playerY < 50) {
            minX = 50;
        }
    }

    return { minX, maxX, minY, maxY };
}

function handleMovement(event) {
    if (document.body.getAttribute('data-state') !== 'corridor_movement') return;

    let newX = playerX;
    let newY = playerY;
    let moved = false;
    
    player.classList.remove('player-idle');
    player.classList.remove('player-walking'); 

    switch (event.key.toLowerCase()) {
        case 'w': case 'ц': case 'arrowup': newY -= speed; moved = true; break;
        case 's': case 'ы': case 'arrowdown': newY += speed; moved = true; break;
        case 'a': case 'ф': case 'arrowleft': newX -= speed; moved = true; break;
        case 'd': case 'в': case 'arrowright': newX += speed; moved = true; break;
    }

    if (moved) {
        const bounds = getCorridorBounds();
        
        newX = Math.max(bounds.minX, Math.min(newX, bounds.maxX));
        newY = Math.max(bounds.minY, Math.min(newY, bounds.maxY));

        playerX = newX;
        playerY = newY;
        updatePlayerPosition();
        
        player.classList.add('player-walking');
        checkCollision();
    } else {
        player.classList.add('player-idle');
    }
}

function checkCollision() {
    const targetX = WORLD_SIZE - 50;
    const targetY = 0;

    if (playerX >= (WORLD_SIZE - 50) && playerY < 50) { 
        window.removeEventListener('keydown', handleMovement);
        showState('discovery');
        player.classList.remove('player-walking');
        player.classList.add('player-idle');
    }
}

continueButton.addEventListener('click', () => {
    continueButton.style.display = 'none';
    showState('end');
});


function showState(stateKey) {
    const state = gameStates[stateKey];
    textDisplay.textContent = state.text;
    choicesContainer.innerHTML = '';
    document.body.setAttribute('data-state', stateKey); 

    allScenes.forEach(scene => scene.style.display = 'none');
    player.style.display = 'none';
    window.removeEventListener('keydown', handleMovement); 
    continueButton.style.display = 'none';

    if (state.scene) {
        state.scene.style.display = 'block';
    }

    if (stateKey === 'corridor_movement') {
        playerX = state.startX;
        playerY = state.startY;
        player.style.display = 'block';
        updatePlayerPosition();
        window.addEventListener('keydown', handleMovement); 
        player.classList.add('player-idle');
        return;
    }

    if (stateKey === 'start' || stateKey === 'calm_continue' || stateKey === 'discovery') {
        playerX = state.startX;
        playerY = state.startY;
        player.style.display = 'block';
        player.classList.add('player-idle');
        updatePlayerPosition();
    }
    
    if (state.isGlitch) {
        textDisplay.classList.add('glitch');
        player.style.display = 'none';
        
        setTimeout(() => {
            textDisplay.classList.remove('glitch');
            player.style.display = 'block';
            continueButton.style.display = 'block';
        }, 1500);
        return;
    }

    state.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.addEventListener('click', () => {
            showState(choice.nextState);
        });
        choicesContainer.appendChild(button);
    });
}

showState('start');
