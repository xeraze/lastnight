window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const dialogBox = document.getElementById('dialogBox');
    const dialogText = document.getElementById('dialogText');
    const customCursor = document.getElementById('customCursor');
    const mainMenu = document.getElementById('mainMenu');
    const startButton = document.getElementById('startButton');

    canvas.width = 1024;
    canvas.height = 768;

    let gameState = 'menu';
    let assets = {};
    let snowflakes = [];
    let zoom = 1.8;
    
    let playerP = { 
        x: 425, y: 260,
        speed: 1.2,
        width: 32, height: 48,
        drawWidth: 48, drawHeight: 72,
        direction: 'down', isMoving: false,
        currentFrame: 0, animationTimer: 0, animationSpeed: 12
    };

    let camera = { x: 300, y: 150 };
    let keys = { w: false, a: false, s: false, d: false };

    let kitten = { x: 350, y: 620, state: 'sleeping' };

    const assetList = {
        playerIdle: 'assets/IdleCharacter5.png',
        playerIdleBack: 'assets/IdleCharacterBack4and5.png',
        playerWalk: 'assets/CharacterWalking5.png',
        playerWalkFront: 'assets/CharacterWalkingFront5.png',
        playerWalkBack: 'assets/CharacterWalkingBackwards5.png',
        floor: 'assets/FloorHouse5.png',
        wall: 'assets/WallHouse5.png',
        menuBg: 'assets/BackgroundMenu1and2.png',
        bed: 'assets/Bed5.png',
        stove: 'assets/Stove5.png',
        refrigerator: 'assets/Refrigerator5.png',
        sink: 'assets/CleanSink5.png',
        fullTable: 'assets/FullTable5.png',
        couch: 'assets/Couch.png'
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
            { id: 'sink', asset: 'sink', x: 450, y: 110, width: 80, height: 60 },
            { id: 'table', asset: 'fullTable', x: 380, y: 260, width: 100, height: 60 },
            { id: 'couch', asset: 'couch', x: 120, y: 380, width: 120, height: 70 },
            { id: 'bed', asset: 'bed', x: 310, y: 550, width: 120, height: 160 }
        ]
    };

    function loadAssets(callback) {
        let loaded = 0;
        let total = Object.keys(assetList).length;
        for (let key in assetList) {
            assets[key] = new Image();
            assets[key].src = assetList[key];
            assets[key].onload = () => { if (++loaded === total) callback(); };
        }
    }

    function createSnowflakes() {
        for (let i = 0; i < 100; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 1,
                d: Math.random() * 1 + 0.5
            });
        }
    }

    function drawSnow() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        for (let s of snowflakes) {
            ctx.moveTo(s.x, s.y);
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            s.y += s.d;
            if (s.y > canvas.height) s.y = -10;
        }
        ctx.fill();
    }

    startButton.onclick = () => {
        mainMenu.style.display = 'none';
        playScreamEffect();
        gameState = 'playing';
        showDialog("*Різкий крик пролунав з коридору...*");
    };

    function playScreamEffect() {
        if (typeof Tone !== 'undefined') {
            Tone.start();
            const noise = new Tone.Noise("brown").start();
            const filter = new Tone.Filter(1500, "lowpass").toDestination();
            noise.connect(filter);
            noise.volume.rampTo(-10, 0.1);
            setTimeout(() => noise.stop(), 600);
        }
    }

    window.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    };

    window.onkeydown = (e) => { if(gameState==='playing') keys[e.key] = true; };
    window.onkeyup = (e) => { if(gameState==='playing') keys[e.key] = false; };

    function showDialog(t) {
        dialogText.textContent = t;
        dialogBox.style.display = 'block';
        setTimeout(() => { dialogBox.style.display = 'none'; }, 4000);
    }

    function update() {
        if (gameState !== 'playing') return;

        playerP.isMoving = false;
        let oldX = playerP.x, oldY = playerP.y;

        if (keys.w) { playerP.y -= playerP.speed; playerP.direction = 'up'; playerP.isMoving = true; }
        if (keys.s) { playerP.y += playerP.speed; playerP.direction = 'down'; playerP.isMoving = true; }
        if (keys.a) { playerP.x -= playerP.speed; playerP.direction = 'left'; playerP.isMoving = true; }
        if (keys.d) { playerP.x += playerP.speed; playerP.direction = 'right'; playerP.isMoving = true; }

        let inRoom = world.rooms.some(r => 
            playerP.x > r.x - 10 && playerP.x < r.x + r.width - 20 &&
            playerP.y > r.y - 10 && playerP.y < r.y + r.height - 40
        );
        if (!inRoom) { playerP.x = oldX; playerP.y = oldY; }

        let targetX = playerP.x - (canvas.width / 2) / zoom;
        let targetY = playerP.y - (canvas.height / 2) / zoom;
        camera.x += (targetX - camera.x) * 0.05;
        camera.y += (targetY - camera.y) * 0.05;

        let dist = Math.sqrt(Math.pow(playerP.x - kitten.x, 2) + Math.pow(playerP.y - kitten.y, 2));
        if (dist < 60 && kitten.state === 'sleeping') {
            kitten.state = 'scared';
            showDialog("Він здригнувся... Кров...");
            setTimeout(() => { kitten.state = 'dead'; }, 3000);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(zoom, zoom);
        ctx.translate(-camera.x, -camera.y);

        world.rooms.forEach(r => {
            let p = ctx.createPattern(assets.floor, 'repeat');
            ctx.fillStyle = p;
            ctx.fillRect(r.x, r.y, r.width, r.height);
        });

        world.furniture.forEach(f => {
            ctx.drawImage(assets[f.asset], f.x, f.y, f.width, f.height);
        });

        if (gameState === 'menu') {
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.arc(430, 295, 6, 0, Math.PI*2); ctx.fill();
        }

        drawKitten();

        let sheet = playerP.isMoving ? (playerP.direction === 'up' ? assets.playerWalkBack : (playerP.direction === 'down' ? assets.playerWalkFront : assets.playerWalk)) : (playerP.direction === 'up' ? assets.playerIdleBack : assets.playerIdle);
        let frameX = (playerP.isMoving ? playerP.currentFrame : Math.floor(Date.now()/250)%4) * 32;
        
        ctx.drawImage(sheet, frameX, 0, 32, 48, playerP.x, playerP.y, playerP.drawWidth, playerP.drawHeight);

        ctx.restore();

        if (gameState === 'menu') {
            drawSnow();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 10;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        }

        if (playerP.isMoving) {
            playerP.animationTimer++;
            if (playerP.animationTimer > playerP.animationSpeed) {
                playerP.currentFrame = (playerP.currentFrame + 1) % 8;
                playerP.animationTimer = 0;
            }
        }

        requestAnimationFrame(() => { update(); draw(); });
    }

    function drawKitten() {
        ctx.save();
        ctx.fillStyle = "#888";
        if (kitten.state === 'sleeping') {
            ctx.beginPath(); ctx.ellipse(kitten.x, kitten.y, 12, 6, 0.2, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.strokeStyle = "#888"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(kitten.x, kitten.y, 10, Math.PI, 0); ctx.stroke();
            ctx.fillStyle = "red";
            ctx.beginPath(); ctx.arc(kitten.x - 5, kitten.y - 5, 2, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }

    loadAssets(() => {
        createSnowflakes();
        customCursor.style.display = 'block';
        draw();
    });
};
