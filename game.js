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

    let player = {
        x: 100, y: 550, 
        speed: 1.5,
        width: 48, height: 72,
        direction: 'right',
        isMoving: false
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

    function loadAssets(cb) {
        let loaded = 0; let total = Object.keys(assetList).length;
        for (let key in assetList) {
            assets[key] = new Image(); assets[key].src = assetList[key];
            assets[key].onload = () => { if (++loaded === total) cb(); };
        }
    }

    window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
    window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

    startButton.onclick = () => {
        mainMenu.style.display = 'none';
        gameState = 'playing';
        showDialog("*Тихий вскрик... Нужно проверить коридор.*");
    };

    function update() {
        if (gameState !== 'playing') return;
        player.isMoving = false;

        if (keys['a'] || keys['arrowleft']) { player.x -= player.speed; player.direction = 'left'; player.isMoving = true; }
        if (keys['d'] || keys['arrowright']) { player.x += player.speed; player.direction = 'right'; player.isMoving = true; }

        if (viewMode === 'top') {
            if (keys['w'] || keys['arrowup']) { player.y -= player.speed; player.direction = 'up'; player.isMoving = true; }
            if (keys['s'] || keys['arrowdown']) { player.y += player.speed; player.direction = 'down'; player.isMoving = true; }
        }
        
        if (player.x > 600 && player.x < 700 && viewMode === 'side' && player.y > 500) {
            if (keys['w']) {
                viewMode = 'top';
                player.x = 512;
                player.y = 700;
            }
        }

        if (viewMode === 'top' && player.y < 100 && player.x > 500) {
            if (keys['d']) {
                viewMode = 'side';
                player.x = 1200;
                player.y = 550;
            }
        }

        camera.x = player.x - canvas.width / 2;
        if (viewMode === 'top') camera.y = player.y - canvas.height / 2;
        else camera.y = 0;

        if (Math.abs(player.x - kitten.x) < 100 && player.x > 2000) {
            if (kitten.state === 'sleeping') {
                kitten.state = 'scared';
                showDialog("Він лежить... Кров...");
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        if (viewMode === 'side') {
            drawSideView();
        } else {
            drawTopView();
        }

        drawPlayer();
        ctx.restore();

        if (gameState === 'menu') {
            ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0,0,1024,768);
            ctx.strokeStyle = "white"; ctx.lineWidth = 10; ctx.strokeRect(30,30,964,708);
        }
        requestAnimationFrame(draw);
        update();
    }

    function drawSideView() {
        ctx.fillStyle = "#333";
        ctx.fillRect(camera.x, 620, 3000, 150);

        if (player.x < 1000) {
            ctx.fillStyle = "white"; ctx.fillRect(100, 200, 80, 150);
            ctx.drawImage(assets.table, 400, 560, 120, 60);
            ctx.fillStyle = "gray"; ctx.fillRect(620, 400, 80, 220);
        } else {
            ctx.drawImage(assets.bed, 2100, 520, 180, 100);
            ctx.fillStyle = "gray"; ctx.beginPath(); ctx.ellipse(kitten.x, kitten.y + 40, 15, 7, 0, 0, 7); ctx.fill();
            if (kitten.state !== 'sleeping') {
                ctx.fillStyle = "red"; ctx.fillRect(kitten.x - 5, kitten.y + 35, 3, 10);
            }
        }
    }

    function drawTopView() {
        ctx.fillStyle = "#222";
        ctx.fillRect(450, -1000, 124, 2000);
        ctx.fillStyle = "#444";
        ctx.fillRect(460, -1000, 104, 2000);
    }

    function drawPlayer() {
        let img = (player.direction === 'up') ? assets.playerBack : assets.playerWalk;
        if (!player.isMoving) img = (player.direction === 'up') ? assets.playerBack : assets.playerIdle;
        
        ctx.save();
        if (player.direction === 'left') {
            ctx.translate(player.x + player.width, player.y);
            ctx.scale(-1, 1);
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
