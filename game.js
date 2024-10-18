const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis do Jogo
let airplaneImage = new Image();
airplaneImage.src = 'images/nave-espacial.png';

let enemyImage = new Image();
enemyImage.src = 'images/dragao.png';

let tankImage = new Image();
tankImage.src = 'images/bomba-de-gasolina.png';

let airplane = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false
};

let bullets = [];
let enemies = [];
let tanks = [];
let fuel = 100;
let score = 0;
let lives = 3;
let gameOver = false;
let timeAlive = 0;  // Tempo total de jogo

// Função para iniciar a jogada
function startGame() {
    gameLoop();
}

// Controle do avião
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') airplane.moveLeft = true;
    if (e.key === 'ArrowRight') airplane.moveRight = true;
    if (e.key === 'ArrowUp') airplane.moveUp = true;
    if (e.key === 'ArrowDown') airplane.moveDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') airplane.moveLeft = false;
    if (e.key === 'ArrowRight') airplane.moveRight = false;
    if (e.key === 'ArrowUp') airplane.moveUp = false;
    if (e.key === 'ArrowDown') airplane.moveDown = false;
});

// Função para mover o avião
function moveAirplane() {
    if (airplane.moveLeft && airplane.x > 0) airplane.x -= airplane.speed;
    if (airplane.moveRight && airplane.x + airplane.width < canvas.width) airplane.x += airplane.speed;
    if (airplane.moveUp && airplane.y > 0) airplane.y -= airplane.speed;
    if (airplane.moveDown && airplane.y + airplane.height < canvas.height) airplane.y += airplane.speed;
}

// Função para disparar tiros
function shoot() {
    bullets.push({
        x: airplane.x + airplane.width / 2 - 2,
        y: airplane.y,
        width: 4,
        height: 10,
        speed: 7
    });
}

setInterval(shoot, 500);  // Tiros automáticos

// Função para mover e desenhar os tiros
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y + bullet.height < 0) bullets.splice(index, 1);
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Função para gerar inimigos
function spawnEnemies() {
    if (Math.random() < 0.05) {  // 5% de chance de gerar um inimigo a cada frame
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: -50,
            width: 40,
            height: 40,
            speed: 3
        });
    }
}

// Função para gerar tanques de combustível
function spawnTanks() {
    if (Math.random() < 0.02) {  // 2% de chance de gerar um tanque
        tanks.push({
            x: Math.random() * (canvas.width - 30),
            y: -50,
            width: 30,
            height: 30,
            speed: 2
        });
    }
}

// Função para mover inimigos e tanques
function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) enemies.splice(index, 1);
    });
    tanks.forEach((tank, index) => {
        tank.y += tank.speed;
        if (tank.y > canvas.height) tanks.splice(index, 1);
    });
}

// Função para desenhar o avião
function drawAirplane() {
    ctx.drawImage(airplaneImage, airplane.x, airplane.y, airplane.width, airplane.height);
}

// Função para desenhar inimigos e tanques
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });
    tanks.forEach(tank => {
        ctx.drawImage(tankImage, tank.x, tank.y, tank.width, tank.height);
    });
}

// Verifica colisões entre inimigos, tanques e tiros
function checkCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 100; // Adiciona pontos ao derrotar um inimigo
                updateHUD(); // Atualiza o HUD aqui
            }
        });

        // Verifica colisão entre o avião e inimigos
        if (airplane.x < enemy.x + enemy.width &&
            airplane.x + airplane.width > enemy.x &&
            airplane.y < enemy.y + enemy.height &&
            airplane.y + airplane.height > enemy.y) {
            enemies.splice(enemyIndex, 1);
            lives -= 1;
            updateHUD(); // Atualiza o HUD aqui
            if (lives === 0) {
                gameOver = true;
            }
        }
    });

    // Verifica colisão entre o avião e tanques de combustível
    tanks.forEach((tank, tankIndex) => {
        if (airplane.x < tank.x + tank.width &&
            airplane.x + airplane.width > tank.x &&
            airplane.y < tank.y + tank.height &&
            airplane.y + airplane.height > tank.y) {
            tanks.splice(tankIndex, 1);
            fuel = Math.min(100, fuel + 20);  // Reabastece 20%
            updateHUD(); // Atualiza o HUD aqui
        }
    });
}

// Sistema de combustível
function consumeFuel() {
    fuel -= 0.1; // Consome combustível a cada frame
    if (fuel <= 0) {
        fuel = 0; // Garante que o combustível não fique abaixo de 0
        gameOver = true; // Termina o jogo se o combustível chegar a 0
    }
}

// Atualiza HUD
function updateHUD() {
    document.getElementById('fuel').innerText = Math.max(fuel.toFixed(0), 0);
    document.getElementById('score').innerText = score;

    // Atualiza os ícones de vida
    const livesContainer = document.getElementById('livesContainer');
    livesContainer.innerHTML = ''; // Limpa o contêiner antes de atualizar
    for (let i = 0; i < lives; i++) {
        const heartIcon = document.createElement('img');
        heartIcon.src = 'images/coracao.png'; // Caminho para o ícone de coração
        heartIcon.alt = 'Vida';
        livesContainer.appendChild(heartIcon);
    }

    // Atualiza a largura da barra de combustível
    const fuelBar = document.getElementById('fuelBar');
    fuelBar.style.width = fuel + '%'; // Atualiza a largura da barra de combustível
}

// Função de game loop
function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        moveAirplane();
        moveBullets();
        moveEnemies();
        spawnEnemies();
        spawnTanks();
        consumeFuel();

        drawAirplane();
        drawBullets();
        drawEnemies();

        checkCollisions();
        updateHUD();

        timeAlive++;
        // Aumenta a dificuldade a cada 100 frames
        if (timeAlive % 50 === 0) {
            enemies.forEach(enemy => enemy.speed += 0.5);  // Aumenta a velocidade dos inimigos
        }

        requestAnimationFrame(gameLoop);
    } else {
        showGameOverScreen();
    }
}

// Exibe a tela de "Fim de Jogo"
function showGameOverScreen() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'block'; // Mostra a tela de fim de jogo
    document.getElementById('finalScore').innerText = score; // Atualiza a pontuação final
}

// Reinicia o jogo
function restartGame() {
    bullets = [];
    enemies = [];
    tanks = [];
    fuel = 100;
    score = 0;
    lives = 3;
    gameOver = false;
    timeAlive = 0;
    document.getElementById('gameOverScreen').style.display = 'none'; // Esconde a tela de fim de jogo
    startGame();
}

// Inicie o jogo
startGame();
