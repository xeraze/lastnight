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
    let viewMode = 'side'; 
    let assets = {};
    let camera = { x: 0, y: 0 };
    let keys = {};
    let ambianceAlpha = 0;
    let flickerTimer = 0;

    let player = {
        x: 450, y: 550, 
        speed: 1.2,
        width: 48, height: 72,
        direction: 'right', isMoving: false
    };

    let kitten = { x: 2200, y: 560, state: 'sleeping' };

    const assetList = {
        playerIdle: 'assets/IdleCharacter5.png',
        playerWalk: 'assets/CharacterWalking5.png',
        playerBack: 'assets/IdleCharacterBack4and5.png',
        floor: 'assets/FloorHouse5.png',
        table: 'assets/FullTable5.png',
        bed: 'assets/Bed5.png'
    };

    const sounds = {
        warmAmbiance: new Tone.Loop(time => {}, "4n"),
        heartCrack: new Tone.MembraneSynth().toDestination(),
        scream: new Tone.NoiseSynth({noise:{type:"white"}, envelope:{attack:0.01, decay:0.3, sustain:0}}).toDestination()
    };

    function loadAssets(cb) {
        let loaded = 0; let total = Object.keys(assetList).length;
        for (let key in assetList) {
            assets[key] = new Image(); assets[key].src = assetList[key];
            assets[key].onload = () => { if (++loaded === total) cb(); };
        }
    }

    startButton.onclick = async () => {
        await Tone.start();
        mainMenu.style.opacity = '0';
        setTimeout(() => { mainMenu.style.display = 'none'; }, 2000);

        setTimeout(() => {
            sounds.heartCrack.triggerAttackRelease("C1", "8n");
            
            setTimeout(() => {
                sounds.scream.triggerAttackRelease("0.5");
                gameState = 'playing';
                showDialog("*Різкий крик розірвав тишу...*");
            }, 500);
        }, 5000);
    };

    window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
    window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

    function update() {
        if (gameState !== 'playing') return;
        player.isMoving = false;

        if (keys['a'] || keys['arrowleft']) { player.x -= player.speed; player.direction = 'left'; player.isMoving = true; }
        if (keys['d'] || keys['arrowright']) { player.x += player.speed; player.direction = 'right'; player.isMoving = true; }

        if (viewMode === 'top') {
            if (keys['w'] || keys['arrowup']) { player.y -= player.speed; player.direction = 'up'; player.isMoving = true; }
            if (keys['s'] || keys['arrowdown']) { player.y += player.speed; player.direction = 'down'; player.isMoving = true; }
            
            ambianceAlpha = Math.min(0.8, (700 - player.y) / 800);
        }

        if (player.x > 620 && player.x < 700 && viewMode === 'side' && player.x < 1000) {
            if (keys['w']) { viewMode = 'top'; player.x = 512; player.y = 700; }
        }
        if (viewMode === 'top' && player.y < -200 && keys['d']) {
            viewMode = 'side'; player.x = 1200; player.y = 550;
        }

        camera.x = player.x - canvas.width / 2;
        camera.y = (viewMode === 'top') ? player.y - canvas.height / 2 : 0;

        let dist = Math.sqrt(Math.pow(player.x - kitten.x, 2) + Math.pow(player.y - (kitten.y+40), 2));
        if (dist < 80 && kitten.state === 'sleeping' && viewMode === 'side' && player.x > 1500) {
            kitten.state = 'scared';
            showDialog("Він здригнувся... Кров...");
            setTimeout(() => { kitten.state = 'dead'; }, 3000);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        if (viewMode === 'side') {
            if (player.x < 1000) drawKitchen();
            else drawBedroom();
        } else {
            drawCorridor();
        }

        drawPlayer();
        
        ctx.restore();
        applyLighting();

        requestAnimationFrame(draw);
        update();
    }

    function drawKitchen() {
        ctx.fillStyle = "#3d2e20";
        ctx.fillRect(camera.x, 0, 1024, 768);
        ctx.drawImage(assets.table, 450, 560, 120, 60);
        ctx.fillStyle = "rgba(255, 200, 100, 0.2)";
        ctx.fillRect(camera.x, 0, 1024, 768);
    }

    function drawCorridor() {
        ctx.fillStyle = "#111";
        ctx.fillRect(450, -1000, 124, 2000);
        flickerTimer++;
        if (Math.random() > 0.95) {
            ctx.fillStyle = "rgba(200, 220, 255, 0.1)";
            ctx.fillRect(460, player.y - 100, 104, 200);
        }
    }

    function drawBedroom() {
        ctx.fillStyle = "#050505";
        ctx.fillRect(camera.x, 0, 3000, 768);
        ctx.drawImage(assets.bed, 2100, 520, 180, 100);
        
        let grad = ctx.createRadialGradient(kitten.x, kitten.y+40, 0, kitten.x, kitten.y+40, 150);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(kitten.x - 200, kitten.y - 200, 400, 400);

        ctx.fillStyle = "#666"; ctx.beginPath(); ctx.ellipse(kitten.x, kitten.y + 40, 15, 7, 0, 0, 7); ctx.fill();
        if (kitten.state !== 'sleeping') {
            ctx.fillStyle = "red"; ctx.fillRect(kitten.x - 5, kitten.y + 35, 3, 10);
        }
    }

    function applyLighting() {
        if (gameState === 'playing') {
            ctx.fillStyle = `rgba(0, 5, 20, ${ambianceAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    function drawPlayer() {
        let img = (player.direction === 'up') ? assets.playerBack : assets.playerWalk;
        if (!player.isMoving) img = (player.direction === 'up') ? assets.playerBack : assets.playerIdle;
        ctx.save();
        if (player.direction === 'left') {
            ctx.translate(player.x + player.width, player.y); ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, 32, 48, 0, 0, player.width, player.height);
        } else {
            ctx.drawImage(img, 0, 0, 32, 48, player.x, player.y, player.width, player.height);
        }
        ctx.restore();
    }

    function showDialog(t) {
        dialogText.innerText = t; dialogBox.style.display = 'block';
        setTimeout(()=>dialogBox.style.display='none', 5000);
    }

    loadAssets(() => { draw(); });
};
