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

    const assets = {};
    const patterns = {};

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
        mainMenu.style.backgroundImage = `url(${assetList.menuBg})`;
        gameTitle.textContent = "Last Night"; // Название игры
        startButton.style.backgroundImage = `url(${assetList.menuButton})`;
        startButton.textContent = "Играть";
        mainMenu.style.display = 'flex';
        canvas.style.display = 'none';
        customCursor.style.display = 'block';
    }

    startButton.onclick = () => {
        gameState = 'loading';
        mainMenu.style.display = 'none';
        canvas.style.display = 'block';
        
        ctx.fillStyle = 'white';
        ctx.font = "30px 'Courier New'";
        ctx.textAlign = 'center';
        ctx.
