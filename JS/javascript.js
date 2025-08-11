const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
const heroImg = new Image();
heroImg.src = "hero.png";

const enemyImg = new Image();
enemyImg.src = "enemy.jpeg";

const bulletImg = new Image();
bulletImg.src = "bullet2.jpeg";

// Load sounds
const fireSound = document.getElementById("fireSound");
const explosionSound = document.getElementById("explosionSound");
const bgMusic = document.getElementById("bgMusic");

// Game state
let hero = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 7
};

let heroHealth = 5;  // Life count

let bullets = [];
let enemies = [];
let enemyBullets = []; // Enemy bullets array

let score = 0;
let gameRunning = false;
let gamePaused = false;
let gameOver = false;

// Movement state for mobile buttons and touch movement
let movingLeft = false;
let movingRight = false;
let touchDirection = null;

// Controls elements
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const fireBtn = document.getElementById("fireBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const scoreSpan = document.getElementById("score");

// Game Over overlay
const gameOverOverlay = document.createElement("div");
gameOverOverlay.id = "gameOverOverlay";
gameOverOverlay.classList.add("hidden");
gameOverOverlay.innerHTML = 
  `Game Over!<br><button id="newGameBtn">New Game</button>`;
document.body.appendChild(gameOverOverlay);

// Add listener to the new game button
const newGameBtn = document.getElementById("newGameBtn");
newGameBtn.addEventListener("click", () => {
  resetGame();
  startEnemySpawn();
  gameLoop();
});

// Reset game state function
function resetGame() {
  bullets = [];
  enemies = [];
  enemyBullets = [];
  score = 0;
  heroHealth = 5;
  gameRunning = true;
  gamePaused = false;
  gameOver = false;
  hero.x = canvas.width / 2 - hero.width / 2;
  hero.y = canvas.height - 100;
  scoreSpan.textContent = `Score: ${score}`;
  gameOverOverlay.classList.add("hidden");
  bgMusic.currentTime = 0;
  bgMusic.play();
}

// Enemy spawn timer variable
let enemySpawnTimer;

// Start spawning enemies at intervals
function startEnemySpawn() {
  if (enemySpawnTimer) clearInterval(enemySpawnTimer);
  enemySpawnTimer = setInterval(() => {
    if (gameRunning && !gamePaused && !gameOver) {
      enemies.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: 3,
        shootTimer: 0  // Timer to shoot bullets
      });
    }
  }, 2000);
}

// Stop spawning enemies
function stopEnemySpawn() {
  if (enemySpawnTimer) clearInterval(enemySpawnTimer);
}

// Fire bullet function (hero)
function fireBullet() {
  if (!gameRunning || gamePaused || gameOver) return;
  bullets.push({
    x: hero.x + hero.width / 2 - 5,
    y: hero.y,
    width: 10,
    height: 20,
    speed: 10
  });
  fireSound.currentTime = 0;
  fireSound.play();
}

// Keyboard controls
let keys = {};
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (gameOver && e.key === "Enter") {
    resetGame();
    startEnemySpawn();
    gameLoop();
  }
});
document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// Fire button and mouse/tap shooting
fireBtn.addEventListener("click", fireBullet);
document.addEventListener("click", (e) => {
  if (gameRunning && !gamePaused && !gameOver && e.target.tagName !== "BUTTON") fireBullet();
});
document.addEventListener("touchstart", (e) => {
  if (gameRunning && !gamePaused && !gameOver && e.target.tagName !== "BUTTON") fireBullet();
});

// Start & Pause buttons
startBtn.addEventListener("click", () => {
  if (!gameRunning || gameOver) {
    resetGame();
    startEnemySpawn();
    gameLoop();
  }
});
pauseBtn.addEventListener("click", () => {
  if (!gameRunning || gameOver) return;
  gamePaused = !gamePaused;
});

// Mobile movement buttons (left/right)
leftBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  movingLeft = true;
});
leftBtn.addEventListener("touchend", e => {
  e.preventDefault();
  movingLeft = false;
});
rightBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  movingRight = true;
});
rightBtn.addEventListener("touchend", e => {
  e.preventDefault();
  movingRight = false;
});

// Also respond to mouse clicks for PC testing
leftBtn.addEventListener("mousedown", e => {
  e.preventDefault();
  movingLeft = true;
});
leftBtn.addEventListener("mouseup", e => {
  e.preventDefault();
  movingLeft = false;
});
rightBtn.addEventListener("mousedown", e => {
  e.preventDefault();
  movingRight = true;
});
rightBtn.addEventListener("mouseup", e => {
  e.preventDefault();
  movingRight = false;
});

// TOUCH controls on the canvas for full directional movement on mobile
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  if (!gameRunning || gamePaused || gameOver) return;

  const touch = e.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  if (touchX < centerX - 50) {
    touchDirection = "left";
  } else if (touchX > centerX + 50) {
    touchDirection = "right";
  } else if (touchY < centerY - 50) {
    touchDirection = "up";
  } else if (touchY > centerY + 50) {
    touchDirection = "down";
  } else {
    touchDirection = null;
  }
});

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!gameRunning || gamePaused || gameOver) return;

  const touch = e.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  if (touchX < centerX - 50) {
    touchDirection = "left";
  } else if (touchX > centerX + 50) {
    touchDirection = "right";
  } else if (touchY < centerY - 50) {
    touchDirection = "up";
  } else if (touchY > centerY + 50) {
    touchDirection = "down";
  } else {
    touchDirection = null;
  }
});

canvas.addEventListener("touchend", e => {
  e.preventDefault();
  touchDirection = null;
});

// Draw health bar above hero
function drawHealthBar() {
  const barWidth = hero.width;
  const barHeight = 8;
  const x = hero.x;
  const y = hero.y - barHeight - 5; // 5 px above hero

  // Background bar (dark gray)
  ctx.fillStyle = "rgba(50, 50, 50, 0.8)";
  ctx.fillRect(x, y, barWidth, barHeight);

  // Health bar (green to red gradient)
  const healthWidth = (heroHealth / 5) * barWidth;
  const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
  gradient.addColorStop(0, "#0f0");
  gradient.addColorStop(0.5, "#ff0");
  gradient.addColorStop(1, "#f00");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, healthWidth, barHeight);

  // Border
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, barHeight);
}

// Game loop
function gameLoop() {
  if (!gameRunning) {
    return; // Stop game loop if game not running
  }

  if (gamePaused || gameOver) {
    requestAnimationFrame(gameLoop);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move hero by keyboard arrows or mobile buttons
  if ((keys["ArrowLeft"] || movingLeft) && hero.x > 0) hero.x -= hero.speed;
  if ((keys["ArrowRight"] || movingRight) && hero.x < canvas.width - hero.width) hero.x += hero.speed;
  if (keys["ArrowUp"] && hero.y > 0) hero.y -= hero.speed;
  if (keys["ArrowDown"] && hero.y < canvas.height - hero.height) hero.y += hero.speed;

  // Move hero by touchDirection (mobile canvas touch)
  if (touchDirection === "left" && hero.x > 0) hero.x -= hero.speed;
  if (touchDirection === "right" && hero.x < canvas.width - hero.width) hero.x += hero.speed;
  if (touchDirection === "up" && hero.y > 0) hero.y -= hero.speed;
  if (touchDirection === "down" && hero.y < canvas.height - hero.height) hero.y += hero.speed;

  // Draw hero
  ctx.drawImage(heroImg, hero.x, hero.y, hero.width, hero.height);

  // Draw health bar above hero
  drawHealthBar();

  // Move and draw hero bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed;
    if (bullet.y + bullet.height < 0) {
      bullets.splice(i, 1);
      continue;
    }
    ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
  }

  // Move and draw enemies & let them shoot bullets
  for (let e = enemies.length - 1; e >= 0; e--) {
    const enemy = enemies[e];
    enemy.y += enemy.speed;
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

    // Enemy shoots bullet every ~2 seconds
    enemy.shootTimer = (enemy.shootTimer || 0) + 1;
    if (enemy.shootTimer > 120) { // approx 2 sec at 60fps
      enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 5,
        y: enemy.y + enemy.height,
        width: 10,
        height: 20,
        speed: 6
      });
      enemy.shootTimer = 0;
    }

    // Game over if enemy reaches bottom (missed)
    if (enemy.y > canvas.height) {
      gameOver = true;
      gameRunning = false;
      gameOverOverlay.classList.remove("hidden");
      bgMusic.pause();
      stopEnemySpawn();
      return;
    }
  }

  // Move and draw enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    eb.y += eb.speed;
    if (eb.y > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }
    ctx.fillStyle = "red";
    ctx.fillRect(eb.x, eb.y, eb.width, eb.height);

    // Check collision with hero
    if (
      eb.x < hero.x + hero.width &&
      eb.x + eb.width > hero.x &&
      eb.y < hero.y + hero.height &&
      eb.y + eb.height > hero.y
    ) {
      enemyBullets.splice(i, 1);
      heroHealth--;
      if (heroHealth <= 0) {
        gameOver = true;
        gameRunning = false;
        gameOverOverlay.classList.remove("hidden");
        bgMusic.pause();
        stopEnemySpawn();
        return;
      }
    }
  }

  // Collision detection (hero bullets hitting enemies)
  for (let e = enemies.length - 1; e >= 0; e--) {
    for (let b = bullets.length - 1; b >= 0; b--) {
      const enemy = enemies[e];
      const bullet = bullets[b];
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        explosionSound.currentTime = 0;
        explosionSound.play();
        enemies.splice(e, 1);
        bullets.splice(b, 1);
        score++;
        scoreSpan.textContent = `Score: ${score}`;
        break;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}
