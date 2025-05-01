const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 20, cols = canvas.width / cellSize, rows = canvas.height / cellSize;
let snake, dir, food, score, highScore, gameOver, leaderBoard;

const loginScreen = document.getElementById('loginScreen');
const startGameBtn = document.getElementById('startGameBtn');
const viewInstructionsBtn = document.getElementById('viewInstructionsBtn');
const instructionsPanel = document.getElementById('instructionsPanel');
const viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');
const leaderboardPanel = document.getElementById('leaderboardPanel');
const closeInstructionsBtn = document.getElementById('closeInstructionsBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const leaderboardList = document.getElementById('leaderboardList');
const gameTitle = document.getElementById('gameTitle');
const scoreboard = document.getElementById('scoreboard');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const musicElement = document.getElementById('bgMusic');

// Leaderboard storage
leaderBoard = JSON.parse(localStorage.getItem('snake_leaderboard')) || [];
highScore = localStorage.getItem('snake_highscore') || 0;
highscoreEl.textContent = highScore;

// Event listeners
startGameBtn.addEventListener('click', () => {
  const name = document.getElementById('playerName').value.trim();
  if (!name) return alert('Enter your name');
  const theme = document.getElementById('themeSelect').value;
  document.body.className = theme;
  if (document.getElementById('musicToggle').checked) {
    musicElement.currentTime = 0; musicElement.play().catch(()=>{});
  } else musicElement.pause();
  loginScreen.classList.add('hidden');
  gameTitle.classList.remove('hidden');
  scoreboard.classList.remove('hidden');
  canvas.classList.remove('hidden');
  initGame();
});

viewInstructionsBtn.addEventListener('click', () => instructionsPanel.classList.remove('hidden'));
closeInstructionsBtn.addEventListener('click', () => instructionsPanel.classList.add('hidden'));
viewLeaderboardBtn.addEventListener('click', () => {
  leaderboardPanel.classList.remove('hidden'); renderLeaderboard();
});
closeLeaderboardBtn.addEventListener('click', () => leaderboardPanel.classList.add('hidden'));

function renderLeaderboard() {
  leaderboardList.innerHTML = '';
  leaderBoard.sort((a,b)=>b.score-a.score).slice(0,10).forEach((e,i)=>{
    const li = document.createElement('li');
    li.textContent = `#${i+1} ${e.name}: ${e.score}`;
    leaderboardList.appendChild(li);
  });
}

function initGame() {
  snake = [{x:5,y:5}]; dir={x:1,y:0};
  score = 0; scoreEl.textContent = score;
  placeFood();
  gameOver = false;
  loop();
}

function placeFood() {
  let x, y, coll;
  do {
    x = Math.floor(Math.random()*cols);
    y = Math.floor(Math.random()*rows);
    coll = snake.some(s=>s.x===x&&s.y===y);
  } while(coll);
  food = {x,y};
}

function loop() {
  if (gameOver) return;
  update(); draw();
  setTimeout(loop, 200);
}

function update() {
  const head = {x: snake[0].x+dir.x, y: snake[0].y+dir.y};
  if (head.x<0||head.x>=cols||head.y<0||head.y>=rows ||
      snake.some(s=>s.x===head.x&&s.y===head.y)) return endGame();
  snake.unshift(head);
  if (head.x===food.x&&head.y===food.y) {
    score++; scoreEl.textContent = score;
    placeFood();
  } else snake.pop();
}

function draw() {
  ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width,canvas.height);
  // grid
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid-color');
  for(let i=0;i<=cols;i++){ctx.beginPath();ctx.moveTo(i*cellSize,0);ctx.lineTo(i*cellSize,canvas.height);ctx.stroke();}
  for(let j=0;j<=rows;j++){ctx.beginPath();ctx.moveTo(0,j*cellSize);ctx.lineTo(canvas.width,j*cellSize);ctx.stroke();}
  // snake
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--snake-color');
  snake.forEach(s=>ctx.fillRect(s.x*cellSize, s.y*cellSize, cellSize, cellSize));
  // food
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--food-color');
  ctx.beginPath();
  ctx.arc(food.x*cellSize+cellSize/2, food.y*cellSize+cellSize/2, cellSize/2-2, 0,2*Math.PI);
  ctx.fill();
}

function endGame() {
  gameOver = true; musicElement.pause();
  finalScoreEl.textContent = score;
  gameOverModal.classList.remove('hidden');
  // save highscore & leaderboard
  if (score > highScore) {
    highScore = score; localStorage.setItem('snake_highscore', highScore);
  }
  leaderBoard.push({name: document.getElementById('playerName').value, score});
  localStorage.setItem('snake_leaderboard', JSON.stringify(leaderBoard));
}

document.addEventListener('keydown', e => {
  if (e.key==='ArrowUp' && dir.y===0) dir={x:0,y:-1};
  if (e.key==='ArrowDown' && dir.y===0) dir={x:0,y:1};
  if (e.key==='ArrowLeft' && dir.x===0) dir={x:-1,y:0};
  if (e.key==='ArrowRight' && dir.x===0) dir={x:1,y:0};
});
