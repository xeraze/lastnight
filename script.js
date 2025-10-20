const textDisplay = document.getElementById('text-display');
const choicesContainer = document.getElementById('choices-container');

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
                text: "Встать и выйти из комнаты в коридор",
                nextState: "corridor"
            }
        ]
    },
    corridor: {
        text: "Вы входите в коридор. Абсолютная тьма. Только в одном дверном проеме вдали и конце коридора мерцает **слабый свет**.",
        choices: [
            {
                text: "Идти к свету",
                nextState: "discovery"
            }
        ]
    },
    discovery: {
        text: "Вы входите в комнату. В центре, в слабом пятне света, лежит... котенок. Вокруг него растекается густая, **темно-бордовая жидкость**.",
        choices: [] // Нет выбора, сцена ведет к глитчу
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

function showState(stateKey) {
    const state = gameStates[stateKey];
    textDisplay.textContent = state.text;
    choicesContainer.innerHTML = '';

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
            if (choice.nextState === 'discovery') {
                showState('discovery');
                setTimeout(() => showState('glitch'), 2000);
            } else {
                showState(choice.nextState);
            }
        });
        choicesContainer.appendChild(button);
    });
}

showState('start');
