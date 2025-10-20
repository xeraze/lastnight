const textDisplay = document.getElementById('text-display');
const choicesContainer = document.getElementById('choices-container');
const player = document.getElementById('player');

let playerX = 50;
let playerY = 50;
const speed = 2;

const gameStates = {
    start: {
        text: "Тишина. Вы сидите за столом, доедая печенье. Рядом на телефоне что-то тихо бормочет, свет от экрана мягко освещает стол. Вы чувствуете себя расслабленно и спокойно.",
        choices: [
            {
                text: "Продолжить есть печенье.",
                nextState: "calm_continue"
            }
        ]
    },
    calm_continue: {
        text: "Внезапно, **резкий, многоголосый крик** пронзает тишину. Страх, боль, отчаяние. Звук из телефона обрывается. Сердце колотится.",
        choices: [
            {
                text: "Встать и выйти из комнаты в коридор (Переход к управлению WASD)",
                nextState: "corridor_movement"
            }
        ]
    },
    corridor_movement: {
        text: "Вы стоите посреди абсолютной темноты. Вдали, вправо, мерцает свет. (Управляйте движением с помощью WASD/Стрелок).",
        choices: []
    },
    discovery: {
        text: "Вы вошли в светлую зону. В центре, в слабом пятне света, лежит... котенок. Вокруг него растекается густая, **темно-бордовая жидкость**.",
        choices: []
    },
    glitch: {
        text: "#### [ERROR] @%#$ Тёма... почему.. **&^$@!%^&**",
        isGlitch: true,
        choices: []
    },
    end: {
        text: "Вся комната погружается в абсолютную тьму. Остается только луч света, направленный на котенка. Вы не можете отвести взгляд.\n\n[КОНЕЦ ДЕМО]",
        choices: [
            {
                text: "Обернуть время вспять.",
                nextState: "start"
            }
        ]
    }
};

function updatePlayerPosition() {
    player.style.left = `${playerX}vw`;
    player.style.top = `${playerY}vh`;
}

function handleMovement(event) {
    if (document.body.getAttribute('data-state') !== 'corridor_movement') return;

    let moved = false;
    
    switch (event.key.toLowerCase()) {
        case 'w':
        case 'ц':
        case 'arrowup':
            playerY = Math.max(playerY - speed, 10);
            moved = true;
            break;
        case 's':
        case 'ы':
        case 'arrowdown':
            playerY = Math.min(playerY + speed, 90);
            moved = true;
            break;
        case 'a':
        case 'ф':
        case 'arrowleft':
            playerX = Math.max(playerX - speed, 10);
            moved = true;
            break;
        case 'd':
        case 'в': // D
        case 'arrowright':
            playerX = Math.min(playerX + speed, 90);
            moved = true;
            break;
    }
    
    if (moved) {
        updatePlayerPosition();
        checkCollision();
    }
}

function checkCollision() {
    if (playerX > 75) { 
        window.removeEventListener('keydown', handleMovement);
        showState('discovery');
        player.style.display = 'none'; 
    }
}


function showState(stateKey) {
    const state = gameStates[stateKey];
    textDisplay.textContent = state.text;
    choicesContainer.innerHTML = '';
    document.body.setAttribute('data-state', stateKey);

    if (stateKey !== 'corridor_movement') {
        player.style.display = 'none';
        window.removeEventListener('keydown', handleMovement);
    }


    if (stateKey === 'corridor_movement') {
        playerX = 15;
        playerY = 50; 
        player.style.display = 'block';
        updatePlayerPosition();
        window.addEventListener('keydown', handleMovement);
        return;
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
            if (choice.nextState === 'discovery' || choice.nextState === 'corridor_movement') {
                if (choice.nextState === 'corridor_movement') {
                    showState('corridor_movement');
                } else {
                    showState('discovery');
                    setTimeout(() => showState('glitch'), 2000);
                }
            } else {
                showState(choice.nextState);
            }
        });
        choicesContainer.appendChild(button);
    });
}

showState('start');
