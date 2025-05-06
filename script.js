// Prevent page scrolling on swipe
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// Canvas & Context
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// Grid size: 20×22
const COLS = 20, ROWS = 22;
let cellSize;

// Game state
let snake, dir, food, score, highScore, leaderBoard, gameOver;

// DOM
const loginScreen   = document.getElementById('loginScreen');
const startBtn      = document.getElementById('startGameBtn');
const viewInstr     = document.getElementById('viewInstructionsBtn');
const instrPanel    = document.getElementById('instructionsPanel');
const viewLb        = document.getElementById('viewLeaderboardBtn');
const lbPanel       = document.getElementById('leaderboardPanel');
const closeInstr    = document.getElementById('closeInstructionsBtn');
const closeLb       = document.getElementById('closeLeaderboardBtn');
const lbList        = document.getElementById('leaderboardList');
const scoreBoard    = document.getElementById('scoreboard');
const scoreEl       = document.getElementById('score');
const highEl        = document.getElementById('highscore');
const overModal     = document.getElementById('gameOverModal');
const finalScore    = document.getElementById('finalScore');
const music         = document.getElementById('bgMusic');

// Load persistent data
leaderBoard = JSON.parse(localStorage.getItem('snake_leaderboard')) || [];
highScore   = +localStorage.getItem('snake_highscore') || 0;
highEl.textContent = highScore;

// Show/hide panels
viewInstr.onclick  = () => instrPanel.classList.remove('hidden');
closeInstr.onclick = () => instrPanel.classList.add('hidden');
viewLb.onclick     = () => { lbPanel.classList.remove('hidden'); renderLB(); };
closeLb.onclick    = () => lbPanel.classList.add('hidden');

// Render leaderboard top-10
function renderLB() {
  lbList.innerHTML = '';
  leaderBoard
    .sort((a,b)=>b.score-a.score)
    .slice(0,10)
    .forEach((e,i) => {
      const li = document.createElement('li');
      li.textContent = `#${i+1} ${e.name}: ${e.score}`;
      lbList.appendChild(li);
    });
}

// Resize canvas & compute cellSize
function resizeCanvas(){
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  cellSize = Math.floor(Math.min(canvas.width/COLS, canvas.height/ROWS));
}
window.addEventListener('load',  resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Start Game
startBtn.onclick = () => {
  const name = document.getElementById('playerName').value.trim();
  if (!name) return alert('Enter your name');
  // Theme
  document.body.className = document.getElementById('themeSelect').value;
  // Music
  if (document.getElementById('musicToggle').checked) {
    music.currentTime = 0;
    music.play().catch(()=>{});
  } else music.pause();
  // Show UI
  loginScreen.classList.add('hidden');
  scoreBoard.classList.add('visible');
  canvas.classList.remove('hidden');
  // Init
  initGame(name);
};

// Initialize/reset game
function initGame(name){
  resizeCanvas();
  snake   = [{ x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }];
  dir     = { x: 1, y: 0 };
  score   = 0; scoreEl.textContent = score;
  gameOver = false;
  placeFood();
  gameLoop();
}

// Place food randomly
function placeFood(){
  let x, y, collide;
  do {
    x = Math.floor(Math.random()*COLS);
    y = Math.floor(Math.random()*ROWS);
    collide = snake.some(s=>s.x===x && s.y===y);
  } while(collide);
  food = { x, y };
}

// Main loop
function gameLoop(){
  if (gameOver) return;
  update(); draw();
  setTimeout(gameLoop, 200);
}

// Update snake & game logic
function update(){
  const head = {
    x: (snake[0].x + dir.x + COLS) % COLS,
    y: (snake[0].y + dir.y + ROWS) % ROWS
  };
  // Self-collision?
  if (snake.some(s=>s.x===head.x && s.y===head.y)) return endGame();
  snake.unshift(head);
  // Eat?
  if (head.x===food.x && head.y===food.y){
    scoreEl.textContent = ++score;
    placeFood();
  } else snake.pop();
}

// Draw everything
function draw(){
  // Clear
  ctx.fillStyle='black';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Draw snake body as smooth path
  const snakeColor = getComputedStyle(document.body).getPropertyValue('--ball-color').trim();
  ctx.strokeStyle  = snakeColor;
  ctx.lineWidth    = cellSize - 4;
  ctx.lineJoin     = 'round';
  ctx.lineCap      = 'round';
  ctx.beginPath();
  snake.forEach((s,i) => {
    const x = s.x*cellSize + cellSize/2;
    const y = s.y*cellSize + cellSize/2;
    if (i===0) ctx.moveTo(x,y);
    else       ctx.lineTo(x,y);
  });
  ctx.stroke();

  // Draw head icon
  const hx = snake[0].x*cellSize + cellSize/2;
  const hy = snake[0].y*cellSize + cellSize/2;
  ctx.fillStyle = snakeColor;
  ctx.font      = cellSize + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐍', hx, hy);

  // Draw food
  const fx = food.x*cellSize + cellSize/2;
  const fy = food.y*cellSize + cellSize/2;
  ctx.fillText('🍎', fx, fy);
}

// End game
function endGame(){
  gameOver = true;
  music.pause();
  finalScore.textContent = score;
  overModal.classList.remove('hidden');
  // Save highscore
  if (score>highScore){
    highScore = score;
    localStorage.setItem('snake_highscore', highScore);
  }
  leaderBoard.push({ name: document.getElementById('playerName').value, score });
  localStorage.setItem('snake_leaderboard', JSON.stringify(leaderBoard));
}

// Swipe controls for mobile
let startX, startY;
canvas.addEventListener('touchstart', e=>{
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
canvas.addEventListener('touchend', e=>{
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx)>Math.abs(dy)){
    if (dx>30 && dir.x===0) dir={x:1,y:0};
    if (dx<-30 && dir.x===0) dir={x:-1,y:0};
  } else {
    if (dy>30 && dir.y===0) dir={x:0,y:1};
    if (dy<-30 && dir.y===0) dir={x:0,y:-1};
  }
});

// Keyboard fallback
document.addEventListener('keydown', e=>{
  if (e.key==='ArrowUp'    && dir.y===0) dir={x:0,y:-1};
  if (e.key==='ArrowDown'  && dir.y===0) dir={x:0,y:1};
  if (e.key==='ArrowLeft'  && dir.x===0) dir={x:-1,y:0};
  if (e.key==='ArrowRight' && dir.x===0) dir={x:1,y:0};
});
