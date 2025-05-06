// Prevent page scroll on swipe
document.addEventListener('touchmove', e => e.preventDefault(), {passive: false});

// Canvas & Context
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const cellSize = 20, cols = canvas.width / cellSize, rows = canvas.height / cellSize;

// Game state
let snake, dir, food, score, highScore, leaderBoard, gameOver;

// DOM Elements
const loginScreen            = document.getElementById('loginScreen');
const startBtn               = document.getElementById('startGameBtn');
const viewInstr              = document.getElementById('viewInstructionsBtn');
const instrPanel             = document.getElementById('instructionsPanel');
const viewLb                 = document.getElementById('viewLeaderboardBtn');
const lbPanel                = document.getElementById('leaderboardPanel');
const closeInstr             = document.getElementById('closeInstructionsBtn');
const closeLb                = document.getElementById('closeLeaderboardBtn');
const lbList                 = document.getElementById('leaderboardList');
const titleEl                = document.getElementById('gameTitle');
const scoreboard             = document.getElementById('scoreboard');
const scoreEl                = document.getElementById('score');
const highEl                 = document.getElementById('highscore');
const overModal              = document.getElementById('gameOverModal');
const finalScore             = document.getElementById('finalScore');
const music                  = document.getElementById('bgMusic');

// Load persistent data
leaderBoard = JSON.parse(localStorage.getItem('snake_leaderboard')) || [];
highScore    = +localStorage.getItem('snake_highscore') || 0;
highEl.textContent = highScore;

// Show/Hide Panels
viewInstr.onclick = () => instrPanel.classList.remove('hidden');
closeInstr.onclick = () => instrPanel.classList.add('hidden');
viewLb.onclick = () => { lbPanel.classList.remove('hidden'); renderLB(); };
closeLb.onclick = () => lbPanel.classList.add('hidden');

// Render Leaderboard top 10
function renderLB() {
  lbList.innerHTML = '';
  leaderBoard
    .sort((a,b) => b.score - a.score)
    .slice(0,10)
    .forEach((e,i) => {
      const li = document.createElement('li');
      li.textContent = `#${i+1} ${e.name}: ${e.score}`;
      lbList.appendChild(li);
    });
}

// Start Game Click
startBtn.onclick = () => {
  const name = document.getElementById('playerName').value.trim();
  if (!name) return alert('Enter your name');
  // Apply theme
  document.body.className = document.getElementById('themeSelect').value;
  // Music
  if (document.getElementById('musicToggle').checked) {
    music.currentTime = 0;
    music.play().catch(()=>{});
  } else music.pause();
  // Hide login, show game UI
  loginScreen.classList.add('hidden');
  titleEl.classList.remove('hidden');
  scoreboard.classList.remove('hidden');
  canvas.classList.remove('hidden');
  // Init game
  initGame(name);
};

// Initialize or reset game state
function initGame(name) {
  snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
  dir   = { x: 1, y: 0 };
  score = 0; scoreEl.textContent = score;
  gameOver = false;
  placeFood();
  gameLoop();
}

// Place food at random empty cell
function placeFood() {
  let x,y,collision;
  do {
    x = Math.floor(Math.random()*cols);
    y = Math.floor(Math.random()*rows);
    collision = snake.some(s=>s.x===x && s.y===y);
  } while(collision);
  food = { x, y };
}

// Main loop
function gameLoop() {
  if (gameOver) return;
  update();
  draw();
  setTimeout(gameLoop, 200);
}

// Update snake position & game logic
function update() {
  const head = {
    x: (snake[0].x + dir.x + cols) % cols,
    y: (snake[0].y + dir.y + rows) % rows
  };
  // Self-collision?
  if (snake.some(s=>s.x===head.x && s.y===head.y)) {
    return endGame();
  }
  snake.unshift(head);
  // Eat food?
  if (head.x===food.x && head.y===food.y) {
    scoreEl.textContent = ++score;
    placeFood();
  } else {
    snake.pop();
  }
}

// Draw everything
function draw() {
  // Clear
  ctx.fillStyle='black';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Grid (optional)
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--glow');
  for(let i=0;i<=cols;i++){
    ctx.beginPath();
    ctx.moveTo(i*cellSize,0);
    ctx.lineTo(i*cellSize,canvas.height);
    ctx.stroke();
  }
  for(let j=0;j<=rows;j++){
    ctx.beginPath();
    ctx.moveTo(0,j*cellSize);
    ctx.lineTo(canvas.width,j*cellSize);
    ctx.stroke();
  }

  // Snake: head icon + glowing circles
  const snakeColor = getComputedStyle(document.body).getPropertyValue('--ball-color');
  ctx.fillStyle = snakeColor;
  ctx.font = cellSize + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  snake.forEach((s, idx) => {
    const x = s.x*cellSize + cellSize/2;
    const y = s.y*cellSize + cellSize/2;
    if (idx === 0) {
      ctx.fillText('🐍', x, y);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, cellSize/2 - 2, 0, Math.PI*2);
      ctx.fill();
    }
  });

  // Food icon
  const fx = food.x*cellSize + cellSize/2;
  const fy = food.y*cellSize + cellSize/2;
  ctx.fillText('🍎', fx, fy);
}

// End game
function endGame() {
  gameOver = true;
  music.pause();
  finalScore.textContent = score;
  overModal.classList.remove('hidden');

  // Save high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snake_highscore', highScore);
  }
  // Save leaderboard
  leaderBoard.push({ name: document.getElementById('playerName').value, score });
  localStorage.setItem('snake_leaderboard', JSON.stringify(leaderBoard));
}

// Touch-swipe for mobile
let startX, startY;
canvas.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
canvas.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && dir.x === 0) dir = { x: 1, y: 0 };
    if (dx < -30 && dir.x === 0) dir = { x: -1, y: 0 };
  } else {
    if (dy > 30 && dir.y === 0) dir = { x: 0, y: 1 };
    if (dy < -30 && dir.y === 0) dir = { x: 0, y: -1 };
  }
});

// Keyboard fallback
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp'    && dir.y === 0) dir = { x: 0, y: -1 };
  if (e.key === 'ArrowDown'  && dir.y === 0) dir = { x: 0, y: 1 };
  if (e.key === 'ArrowLeft'  && dir.x === 0) dir = { x: -1, y: 0 };
  if (e.key === 'ArrowRight' && dir.x === 0) dir = { x: 1, y: 0 };
});
