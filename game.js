window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const dialogBox = document.getElementById('dialogBox');
    const dialogText = document.getElementById('dialogText');
    const customCursor = document.getElementById('customCursor');
    const mainMenu = document.getElementById('mainMenu');
    const startButton = document.getElementById('startButton');
    const gameTitle = document.getElementById('gameTitle');

    canvas.width = 1024;
    canvas.height = 768;

    let gameState = 'menu';
    let assets = {};
    let patterns = {};
    let snowflakes = [];
    let cursorP = { x: 0, y: 0 };
    
    let playerP = { 
        x: 450,
        y: 250, 
        speed: 3,
        width: 32,
        height: 48,
        drawWidth: 48,
        drawHeight: 72,
        direction: 'down',
        isMoving: false,
        currentFrame: 0,
        animationTimer: 0,
        animationSpeed: 10
    };

    let camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
    };

    let keys = { w: false, a: false, s: false, d: false };

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

    const world = {
        rooms: [
            { id: 'kitchen', x: 300, y: 100, width: 300, height: 250 },
            { id: 'hallway', x: 100, y: 350, width: 700, height: 150 },
            { id: 'bedroom', x: 300, y: 500, width: 300, height: 250 }
        ],
        furniture: [
            { id: 'stove', asset: 'stove', x: 310, y: 110, width: 60, height: 70 },
            { id: 'fridge', asset: 'refrigerator', x: 380, y: 110, width: 60, height: 90 },
            { id: 'kitchenSink', asset: 'sink', x: 450, y: 110, width: 100, height: 70 },
            { id: 'kitchenTable', asset: 'fullTable', x: 380, y: 280, width: 120, height: 60 },
            
            { id: 'couch', asset: 'couch', x: 120, y: 390, width: 100, height: 70 },
            { id: 'hallway_door_kitchen', x: 430, y: 340, width: 40, height: 10 },
            { id: 'hallway_door_bedroom', x: 430, y: 490, width: 40, height: 10 },

            { id: 'bed', asset: 'bed', x: 310, y: 560, width: 90, height: 130 },
            { id: 'kitten', x: 350, y: 600, width: 30, height: 15 },
        ]
    };
    
    function showMainMenu() {
        canvas.style.display = 'block'; 
        mainMenu.style.display = 'flex';
        customCursor.style.display = 'block';

        mainMenu.style.backgroundImage = 'none';
        gameTitle.textContent = "Last Night";
        startButton.style.backgroundImage = `url(${assets.menuButton.src})`;
        startButton.textContent = "Вспомнить..";
        
        if (snowflakes.length === 0) {
            createSnowflakes();
        }
    }

    startButton.onclick = () => {
        gameState = 'playing'; 
        mainMenu.style.display = 'none';
        
        if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') {
            Tone.context.resume().then(startMusic);
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
        for (let s of snowflakes) {
            ctx.moveTo(s.x, s.y);
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2, true);
        }
        ctx.fill();
        updateSnowflakes();
    }

    function updateSnowflakes() {
        for (let s of snowflakes) {
            s.y += s.d;
            if (s.y > canvas.height) {
                s.x = Math.random() * canvas.width;
                s.y = -10;
            }
        }
    }
    
    window.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        cursorP.x = e.clientX - rect.left;
        cursorP.y = e.clientY - rect.top;
        
        const cursorHtml = document.getElementById('customCursor');
        cursorHtml.style.left = `${e.clientX}px`;
        cursorHtml.style.top = `${e.clientY}px`;
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
            if (e.key === 's') keys.s = false;
            if (e.key === 'a') keys.a = false;
            if (e.key === 'd') keys.d = false;
        }
    };

    function updatePlayerPosition() {
        playerP.isMoving = false;
        let newX = playerP.x;
        let newY = playerP.y;

        if (keys.w) {
            newY -= playerP.speed;
            playerP.direction = 'up';
            playerP.isMoving = true;
        }
        if (keys.s) {
            newY += playerP.speed;
            playerP.direction = 'down';
            playerP.isMoving = true;
        }
        if (keys.a) {
            newX -= playerP.speed;
            playerP.direction = 'left';
            playerP.isMoving = true;
        }
        if (keys.d) {
            newX += playerP.speed;
            playerP.direction = 'right';
            playerP.isMoving = true;
        }

        if (isColliding(newX, newY)) {
        } else {
            playerP.x = newX;
            playerP.y = newY;
        }
    }

    function isColliding(x, y) {
        const playerRect = {
            x: x,
            y: y + playerP.drawHeight / 2,
            width: playerP.drawWidth,
            height: playerP.drawHeight / 2
        };

        let inRoom = false;
        for (let room of world.rooms) {
            if (playerRect.x > room.x && 
                playerRect.x + playerRect.width < room.x + room.width &&
                playerRect.y > room.y &&
                playerRect.y + playerRect.height < room.y + room.height) {
                inRoom = true;
                break;
            }
        }
        let inDoor = false;
        for(let door of world.furniture.filter(f => f.id.includes('door'))) {
             if (checkRectCollision(playerRect, door)) inDoor = true;
        }

        if (!inRoom && !inDoor) return true; 

        for (let item of world.furniture) {
            if (item.id.includes('door')) continue;
            if (checkRectCollision(playerRect, item)) {
                return true;
            }
        }

        return false;
    }

    function checkRectCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    let player, noise;
    function startMusic() {
        if (player) return;
        player = new Tone.Player({
            url: "https://archive.org/download/ambient-piano-loop-130-bpm/ambient-piano-loop-130-bpm.mp3",
            loop: true, autostart: true, volume: -15,
        }).toDestination();
        noise = new Tone.Noise("white").start();
        const autoFilter = new Tone.AutoFilter({
            frequency: "8m", baseFrequency: 100, octaves: 4
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
    
    function updateCamera() {
        camera.x = playerP.x - canvas.width / 2 + (playerP.drawWidth / 2);
        camera.y = playerP.y - canvas.height / 2 + (playerP.drawHeight / 2);
        
    }

    function drawWorld() {
        ctx.fillStyle = patterns.floor;
        for (let room of world.rooms) {
            ctx.fillRect(room.x - camera.x, room.y - camera.y, room.width, room.height);
        }

        const wallThickness = 10;
        ctx.fillStyle = patterns.wall;
        for (let room of world.rooms) {
            ctx.fillRect(room.x - camera.x - wallThickness, room.y - camera.y - wallThickness, room.width + wallThickness*2, wallThickness);
            ctx.fillRect(room.x - camera.x - wallThickness, room.y + room.height - camera.y, room.width + wallThickness*2, wallThickness);
            ctx.fillRect(room.x - camera.x - wallThickness, room.y - camera.y, wallThickness, room.height);
            ctx.fillRect(room.x + room.width - camera.x, room.y - camera.y, wallThickness, room.height);
        }
    }

    function drawFurniture() {
        for (let item of world.furniture) {
            if (item.asset) {
                ctx.drawImage(assets[item.asset], item.x - camera.x, item.y - camera.y, item.width, item.height);
            } else if (item.id === 'kitten') {
                ctx.fillStyle = 'gray';
                ctx.beginPath();
                ctx.ellipse(item.x - camera.x + item.width / 2, item.y - camera.y + item.height / 2, item.width / 2, item.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function drawPlayer() {
        let currentSheet = assets.playerIdle;
        let totalFrames = 4;
        let frameY = 0;

        if (playerP.isMoving) {
            playerP.animationTimer++;
            if (playerP.animationTimer > playerP.animationSpeed) {
                playerP.currentFrame = (playerP.currentFrame + 1) % 8;
                playerP.animationTimer = 0;
            }
            
            totalFrames = 8;
            if (playerP.direction === 'up') currentSheet = assets.playerWalkBack;
            else if (playerP.direction === 'down') currentSheet = assets.playerWalkFront;
            else if (playerP.direction === 'left') currentSheet = assets.playerWalk;
            else if (playerP.direction === 'right') currentSheet = assets.playerWalk;

        } else {
            playerP.animationTimer++;
            if (playerP.animationTimer > playerP.animationSpeed * 2) {
                playerP.currentFrame = (playerP.currentFrame + 1) % 4;
                playerP.animationTimer = 0;
            }
            
            if(playerP.direction === 'up') currentSheet = assets.playerIdleBack;
            else currentSheet = assets.playerIdle;
        }

        let frameX = playerP.currentFrame * playerP.width;

        let flip = (playerP.direction === 'left');
        
        if (flip) {
            ctx.save();
            ctx.translate(playerP.x - camera.x + playerP.drawWidth, playerP.y - camera.y);
            ctx.scale(-1, 1);
            ctx.drawImage(currentSheet, 
                frameX, frameY, playerP.width, playerP.height,
                0, 0, playerP.drawWidth, playerP.drawHeight);
            ctx.restore();
        } else {
            ctx.drawImage(currentSheet, 
                frameX, frameY, playerP.width, playerP.height,
                playerP.x - camera.x, playerP.y - camera.y, playerP.drawWidth, playerP.drawHeight);
        }
    }
    
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === 'menu') {
            ctx.drawImage(assets.menuBg, 0, 0, canvas.width, canvas.height);
            drawMenuSnow();
            
        } else if (gameState === 'playing') {
            updatePlayerPosition();
            updateCamera();
            
            drawWorld();
            drawFurniture();
            drawPlayer();
            
        } else if (gameState === 'dialog') {
            drawWorld();
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
