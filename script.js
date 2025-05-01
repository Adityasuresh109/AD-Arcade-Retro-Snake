const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 20, cols = canvas.width / cellSize, rows = canvas.height / cellSize;
let snake, dir, food, score, highScore, leaderBoard, gameOver;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const startBtn = document.getElementById('startGameBtn');
const viewInstr = document.getElementById('viewInstructionsBtn');
const instrPanel = document.getElementById('instructionsPanel');
const viewLb = document.getElementById('viewLeaderboardBtn');
const lbPanel = document.getElementById('leaderboardPanel');
const closeInstr = document.getElementById('closeInstructionsBtn');
const closeLb = document.getElementById('closeLeaderboardBtn');
const lbList = document.getElementById('leaderboardList');
const titleEl = document.getElementById('gameTitle');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('highscore');
const overModal = document.getElementById('gameOverModal');
const finalScore = document.getElementById('finalScore');
const music = document.getElementById('bgMusic');

// Load storage
leaderBoard = JSON.parse(localStorage.getItem('snake_leaderboard'))||[];
highScore = localStorage.getItem('snake_highscore')||0;
highEl.textContent = highScore;

// Events
startBtn.onclick = ()=>{
  const name = document.getElementById('playerName').value.trim();
  if(!name) return alert('Enter your name');
  document.body.className = document.getElementById('themeSelect').value;
  if(document.getElementById('musicToggle').checked){
    music.currentTime=0; music.play().catch(()=>{});
  } else music.pause();
  loginScreen.classList.add('hidden');
  titleEl.classList.remove('hidden');
  document.getElementById('scoreboard').classList.remove('hidden');
  canvas.classList.remove('hidden');
  initGame(name);
};
viewInstr.onclick = ()=> instrPanel.classList.remove('hidden');
closeInstr.onclick = ()=> instrPanel.classList.add('hidden');
viewLb.onclick = ()=>{ lbPanel.classList.remove('hidden'); renderLB(); };
closeLb.onclick = ()=> lbPanel.classList.add('hidden');

function renderLB(){
  lbList.innerHTML = '';
  leaderBoard.sort((a,b)=>b.score-a.score).slice(0,10).forEach((e,i)=>{
    const li = document.createElement('li');
    li.textContent = `#${i+1} ${e.name}: ${e.score}`;
    lbList.appendChild(li);
  });
}

function initGame(name){
  snake=[{x:Math.floor(cols/2),y:Math.floor(rows/2)}];
  dir={x:1,y:0}; score=0; scoreEl.textContent=score; gameOver=false;
  placeFood(); drawLoop();
}

function placeFood(){
  let x,y,coll;
  do{
    x=Math.floor(Math.random()*cols); y=Math.floor(Math.random()*rows);
    coll=snake.some(s=>s.x===x&&s.y===y);
  }while(coll);
  food={x,y};
}

function drawLoop(){
  if(gameOver) return;
  update(); draw();
  setTimeout(drawLoop,200);
}

function update(){
  const head={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
  // wrap around
  head.x=(head.x+cols)%cols; head.y=(head.y+rows)%rows;
  if(snake.some(s=>s.x===head.x&&s.y===head.y)) return endGame();
  snake.unshift(head);
  if(head.x===food.x&&head.y===food.y){
    scoreEl.textContent=++score;
    placeFood();
  } else snake.pop();
}

function draw(){
  ctx.fillStyle='black'; ctx.fillRect(0,0,canvas.width,canvas.height);
  // grid
  ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--grid-color');
  for(let i=0;i<=cols;i++){ctx.beginPath();ctx.moveTo(i*cellSize,0);ctx.lineTo(i*cellSize,canvas.height);ctx.stroke();}
  for(let j=0;j<=rows;j++){ctx.beginPath();ctx.moveTo(0,j*cellSize);ctx.lineTo(canvas.width,j*cellSize);ctx.stroke();}
  // snake as icons
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=cellSize+'px serif';
  snake.forEach((s,i)=>{
    const x=s.x*cellSize+cellSize/2, y=s.y*cellSize+cellSize/2;
    ctx.fillText(i===0?'🐍':'🟦', x, y);
  });
  // food icon
  const fx=food.x*cellSize+cellSize/2, fy=food.y*cellSize+cellSize/2;
  ctx.fillText('🍎', fx, fy);
}

function endGame(){
  gameOver=true; music.pause();
  finalScore.textContent=score; overModal.classList.remove('hidden');
  if(score>highScore){highScore=score; localStorage.setItem('snake_highscore',score);}
  leaderBoard.push({name:document.getElementById('playerName').value,score});
  localStorage.setItem('snake_leaderboard',JSON.stringify(leaderBoard));
}

// Swipe for mobile
let startX, startY;
canvas.addEventListener('touchstart',e=>{
  startX=e.touches[0].clientX; startY=e.touches[0].clientY;
});
canvas.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-startX, dy=e.changedTouches[0].clientY-startY;
  if(Math.abs(dx)>Math.abs(dy)){
    if(dx>30 && dir.x===0) dir={x:1,y:0};
    if(dx<-30 && dir.x===0) dir={x:-1,y:0};
  } else {
    if(dy>30 && dir.y===0) dir={x:0,y:1};
    if(dy<-30 && dir.y===0) dir={x:0,y:-1};
  }
});

// Keyboard controls
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp'&&dir.y===0) dir={x:0,y:-1};
  if(e.key==='ArrowDown'&&dir.y===0) dir={x:0,y:1};
  if(e.key==='ArrowLeft'&&dir.x===0) dir={x:-1,y:0};
  if(e.key==='ArrowRight'&&dir.x===0) dir={x:1,y:0};
});
