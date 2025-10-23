window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const dialogBox = document.getElementById('dialogBox');
    const dialogText = document.getElementById('dialogText');
    const customCursor = document.getElementById('customCursor');
    const mainMenu = document.getElementById('mainMenu');
    const startButton = document.getElementById('startButton');
    const gameTitle = document.getElementById('gameTitle');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let gameState = 'menu';
    let assets = {};
    let patterns = {};
    let snowflakes = [];
    
    let cursorP = { x: 0, y: 0 };
    let playerP = { x: canvas.width / 2, y: canvas.height / 2, speed: 4 };
    
    let keys = {
        w: false,
        a: false,
        s: false,
        d: false
    };

    const assetList = {
        playerIdle: 'assets/IdleCharacter5.png',
        playerIdleBack: 'assets/IdleCharacterBack4and5.png',
        playerWalk: 'assets/CharacterWalking5.png',
        playerWalkFront: 'assets/CharacterWalkingFront5.png',
        playerWalkBack: 'assets/CharacterWalkingBackwards5.png',
        playerBath: 'assets/CharacterBath5.png',
        
        furnitureSheet: 'assets/2xMItF.png',
        bed: 'assets/Bed5.png',
        fullTable: 'assets/FullTable5.png',
        refrigerator: 'assets/Refrigerator5.png',
        stove: 'assets/Stove5.png',
        couch: 'assets/Couch.png',
        sink: 'assets/CleanSink5.png',
        stool: 'assets/Chair.png',
        backChair: 'assets/BackChair5.png',
        
        floor: 'assets/FloorHouse5.png',
        wall: 'assets/WallHouse5.png',
        
        menuBg: 'assets/BackgroundMenu1and2.png',
        menuButton: 'assets/ButtonMenu5.png',
        
        cursor: 'assets/Moeda3e4.png',
        favicon: 'assets/Icone.png'
    };
    
    function showMainMenu() {
        mainMenu.style.backgroundImage = `url(${assets.menuBg.src})`;
        gameTitle.textContent = "Last Night";
        startButton.style.backgroundImage = `url(${assets.menuButton.src})`;
        
        startButton.textContent = "Вспомнить.."; 
        
        mainMenu.style.display = 'flex';
        canvas.style.display = 'none';
        customCursor.style.display = 'block';
        
        if (snowflakes.length === 0) {
            createSnowflakes();
        }
    }

    startButton.onclick = () => {
        gameState = 'playing'; 
        mainMenu.style.display = 'none';
        canvas.style.display = 'block';
        
        if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') {
            Tone.context.resume().then(() => {
                startMusic();
            });
        } else if (typeof Tone !== 'undefined') {
            startMusic();
        }
    };
    
    function loadAssets(callback) {
        let loadedCount = 0;
        let totalCount = Object.keys(assetList).length;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = "24px 'Courier New'";
        ctx.textAlign = 'center';
        ctx.fillText(`Загрузка... (0/${totalCount})`, canvas.width / 2, canvas.height / 2);

        for (let key in assetList) {
            let img = new Image();
            img.src = assetList[key];
            img.onload = () => {
                assets[key] = img;
                loadedCount++;
                
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.fillText(`Загрузка... (${loadedCount}/${totalCount})`, canvas.width / 2, canvas.height / 2);

                if (loadedCount === totalCount) {
                    callback();
                }
            };
            img.onerror = () => {
                console.error(`Не удалось загрузить ассет: ${assetList[key]}`);
                ctx.fillStyle = 'red';
                ctx.fillText(`Ошибка! Не найден файл: ${assetList[key]}`, canvas.width / 2, canvas.height / 2 + 40);
                ctx.fillText(`(Проверь, что переименовал Icone.jpg в Icone.png)`, canvas.width / 2, canvas.height / 2 + 80);
            };
        }
    }
    
    function createPatterns() {
        patterns.floor = ctx.createPattern(assets.floor, 'repeat');
        patterns.wall = ctx.createPattern(assets.wall, 'repeat');
        
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.type = 'image/png';
        link.rel = 'icon';
        link.href = assets.favicon.src;
        document.head.appendChild(link);
    }

    function createSnowflakes() {
        for (let i = 0; i < 150; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 3 + 1,
                d: Math.random() + 0.5
            });
        }
    }

    function drawMenuSnow() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        for (let i = 0; i < snowflakes.length; i++) {
            let s = snowflakes[i];
            ctx.moveTo(s.x, s.y);
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2, true);
        }
        ctx.fill();
        updateSnowflakes();
    }

    function updateSnowflakes() {
        for (let i = 0; i < snowflakes.length; i++) {
            snowflakes[i].y += snowflakes[i].d;
            if (snowflakes[i].y > canvas.height) {
                snowflakes[i].x = Math.random() * canvas.width;
                snowflakes[i].y = -10;
            }
        }
    }
    
    window.onmousemove = (e) => {
        cursorP.x = e.clientX;
        cursorP.y = e.clientY;
        customCursor.style.left = `${cursorP.x}px`;
        customCursor.style.top = `${cursorP.y}px`;
    };

    window.onkeydown = (e) => {
        if (gameState === 'playing') {
            if (e.key === 'w') keys.w = true;
            if (e.key === 'a') keys.a = true;
            if (e.key === 's') keys.s = true;
            if (e.key === 'd') keys.d = true;
        }
    };

    window.onkeyup = (e) => {
        if (gameState === 'playing') {
            if (e.key === 'w') keys.w = false;
            if (e.key === 'a') keys.a = false;
            if (e.key === 's') keys.s = false;
            if (e.key === 'd') keys.d = false;
        }
    };

    function updatePlayerPosition() {
        if (keys.w) playerP.y -= playerP.speed;
        if (keys.s) playerP.y += playerP.speed;
        if (keys.a) playerP.x -= playerP.speed;
        if (keys.d) playerP.x += playerP.speed;
        
    }

    let player, noise;
    function startMusic() {
        if (player) return;

        player = new Tone.Player({
            url: "https://archive.org/download/ambient-piano-loop-130-bpm/ambient-piano-loop-130-bpm.mp3",
            loop: true,
            autostart: true,
            volume: -15,
        }).toDestination();

        noise = new Tone.Noise("white").start();
        const autoFilter = new Tone.AutoFilter({
            frequency: "8m",
            baseFrequency: 100,
            octaves: 4
        }).toDestination();
        
        noise.connect(autoFilter);
        noise.volume.value = -30;
    }
    
    function showDialog(text) {
        gameState = 'dialog';
        dialogText.textContent = text;
        dialogBox.style.display = 'block';
    }

    function hideDialog() {
        gameState = 'playing';
        dialogBox.style.display = 'none';
    }
    
    function drawRoom() {
        ctx.fillStyle = patterns.floor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const wallThickness = 20;
        ctx.fillStyle = patterns.wall;
        ctx.fillRect(0, 0, canvas.width, wallThickness); // Верхняя
        ctx.fillRect(0, canvas.height - wallThickness, canvas.width, wallThickness); // Нижняя
        ctx.fillRect(0, 0, wallThickness, canvas.height); // Левая
        ctx.fillRect(canvas.width - wallThickness, 0, wallThickness, canvas.height); // Правая
    }

    function drawFurniture() {
        ctx.drawImage(assets.bed, 100, 100, 100, 150);
        ctx.drawImage(assets.stove, 300, 50, 80, 100);
        ctx.drawImage(assets.refrigerator, 400, 50, 80, 120);
        ctx.drawImage(assets.fullTable, 500, 300, 150, 100);
        
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.ellipse(150, 170, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawPlayer() {
        ctx.drawImage(assets.playerIdle, 
            0, 0, 32, 48,
            playerP.x, playerP.y, 64, 96);
    }
    
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === 'menu') {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawMenuSnow();
            
        } else if (gameState === 'playing') {
            updatePlayerPosition();
            
            drawRoom();
            drawFurniture();
            drawPlayer();
            
        } else if (gameState === 'dialog') {
            drawRoom();
            drawFurniture();
            drawPlayer();
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    customCursor.style.display = 'none';

    loadAssets(() => {
        createPatterns();
        showMainMenu();
        gameLoop();
    });
};
