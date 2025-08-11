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
let bullets = [];
let enemies = [];
let enemyBullets = [];
let score = 0;
let heroLife = 5;  // Hero takes 5 shots before dying
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
  `Game Over!<br>
  <button id="newGameBtn">New Game</button>
  `;
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
  heroLife = 5;
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
      let enemy = {
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: 3,
        zigzagDir: 1,          // 1 means move right, -1 means move left
        zigzagSpeed: 2,        // horizontal zigzag speed
        zigzagLimit: 100,      // max horizontal distance from start x
        startX: 0,             // will set below
        shootCooldown: 0       // cooldown timer for shooting
      };
      enemy.startX = enemy.x;
      enemies.push(enemy);
    }
  }, 2000);
}

// Stop spawning enemies
function stopEnemySpawn() {
  if (enemySpawnTimer) clearInterval(enemySpawnTimer);
}

// Fire bullet function
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

  // Draw hero life bar above hero
  const lifeBarWidth = 50;
  const lifeBarHeight = 7;
  ctx.fillStyle = "red";
  ctx.fillRect(hero.x, hero.y - 15, lifeBarWidth, lifeBarHeight);
  ctx.fillStyle = "lime";
  ctx.fillRect(hero.x, hero.y - 15, (heroLife / 5) * lifeBarWidth, lifeBarHeight);
  ctx.strokeStyle = "white";
  ctx.strokeRect(hero.x, hero.y - 15, lifeBarWidth, lifeBarHeight);

  // Move and draw bullets (hero bullets)
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed;
    if (bullet.y + bullet.height < 0) {
      bullets.splice(i, 1);
      continue;
    }
    ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
  }

  // Move and draw enemies
  for (let e = enemies.length - 1; e >= 0; e--) {
    const enemy = enemies[e];
    
    // Zigzag horizontal movement
    enemy.x += enemy.zigzagDir * enemy.zigzagSpeed;
    if (enemy.x > enemy.startX + enemy.zigzagLimit) enemy.zigzagDir = -1;
    else if (enemy.x < enemy.startX - enemy.zigzagLimit) enemy.zigzagDir = 1;

    // Move enemy downward
    enemy.y += enemy.speed;

    // Enemy shooting cooldown logic
    if (enemy.shootCooldown > 0) enemy.shootCooldown--;

    // Shoot bullet toward hero every ~120 frames
    if (enemy.shootCooldown === 0 && enemy.y > 0 && enemy.y < canvas.height) {
      enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 5,
        y: enemy.y + enemy.height,
        width: 10,
        height: 20,
        speed: 6
      });
      enemy.shootCooldown = 120; // cooldown frames until next shot
    }

    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

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

  // Move and draw enemy bullets, check collision with hero
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eBullet = enemyBullets[i];
    eBullet.y += eBullet.speed;

    if (eBullet.y > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }

    ctx.fillStyle = "red";
    ctx.fillRect(eBullet.x, eBullet.y, eBullet.width, eBullet.height);

    // Hero collision
    if (
      eBullet.x < hero.x + hero.width &&
      eBullet.x + eBullet.width > hero.x &&
      eBullet.y < hero.y + hero.height &&
      eBullet.y + eBullet.height > hero.y
    ) {
      enemyBullets.splice(i, 1);
      heroLife -= 1;
      if (heroLife <= 0) {
        gameOver = true;
        gameRunning = false;
        gameOverOverlay.classList.remove("hidden");
        bgMusic.pause();
        stopEnemySpawn();
        return;
      }
    }
  }

  // Collision detection hero bullet hits enemy
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
        enemies.splice(e, 1);  // enemy dies in one shot
        bullets.splice(b, 1);
        score++;
        scoreSpan.textContent = `Score: ${score}`;
        break;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}
