const canvas=document.getElementById('gameCanvas'),ctx=canvas.getContext('2d');
canvas.width=cols=30; canvas.height=cols; const cell=canvas.width/cols;
let snake,dir,food,score,highScore,leaderBoard,gameOver,name;

// DOM
const login=document.getElementById('loginScreen'),
  startBtn=document.getElementById('startGameBtn'),
  viewInstr=document.getElementById('viewInstructionsBtn'),
  instr=document.getElementById('instructionsPanel'),
  viewLb=document.getElementById('viewLeaderboardBtn'),
  lb=document.getElementById('leaderboardPanel'),
  closeInstr=document.getElementById('closeInstructionsBtn'),
  closeLb=document.getElementById('closeLeaderboardBtn'),
  lbList=document.getElementById('leaderboardList'),
  title=document.getElementById('gameTitle'),
  scoreEl=document.getElementById('score'),
  highEl=document.getElementById('highscore'),
  over=document.getElementById('gameOverModal'),
  finalScore=document.getElementById('finalScore'),
  music=document.getElementById('bgMusic');

// Storage
leaderBoard=JSON.parse(localStorage.getItem('snake_leaderboard'))||[];
highScore=localStorage.getItem('snake_highscore')||0; highEl.textContent=highScore;

// Events
startBtn.onclick=()=>{
  name=document.getElementById('playerName').value.trim(); if(!name) return alert('Enter name');
  document.body.className='classic';
  if(document.getElementById('musicToggle').checked){music.currentTime=0;music.play().catch(()=>{});}
  else music.pause();
  login.classList.add('fade-out');
  setTimeout(()=>{
    login.classList.add('hidden'); title.classList.remove('hidden'); document.getElementById('scoreboard').classList.remove('hidden');
    canvas.classList.remove('hidden'); initGame();
  },500);
};
viewInstr.onclick=()=>instr.classList.remove('hidden');
closeInstr.onclick=()=>instr.classList.add('hidden');
viewLb.onclick=()=>{lb.classList.remove('hidden');renderLB();};
closeLb.onclick=()=>lb.classList.add('hidden');
function renderLB(){lbList.innerHTML=''; leaderBoard.sort((a,b)=>b.score-a.score).slice(0,10).forEach((e,i)=>{
  let li=document.createElement('li');li.textContent=`#${i+1} ${e.name}: ${e.score}`; lbList.appendChild(li);
});}

// Game
function initGame(){
  snake=[{x:15,y:15}];dir={x:1,y:0};score=0;scoreEl.textContent=0;gameOver=false;
  placeFood();loop();
}
function placeFood(){
  do{food={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*cols)};
  }while(snake.some(s=>s.x===food.x&&s.y===food.y));
}
function loop(){
  if(gameOver)return;update();draw();setTimeout(loop,200);
}
function update(){
  let head={x:(snake[0].x+dir.x+cols)%cols,y:(snake[0].y+dir.y+cols)%cols};
  if(snake.some(s=>s.x===head.x&&s.y===head.y))return endGame();
  snake.unshift(head);
  if(head.x===food.x&&head.y===food.y){scoreEl.textContent=++score;placeFood();}
  else snake.pop();
}
function draw(){
  ctx.fillStyle='black';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--grid-color');
  for(let i=0;i<=cols;i++){ctx.beginPath();ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,canvas.height);ctx.stroke();}
  for(let j=0;j<=cols;j++){ctx.beginPath();ctx.moveTo(0,j*cell);ctx.lineTo(canvas.width,j*cell);ctx.stroke();}
  // snake
  snake.forEach((s,i)=>{
    ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--snake-color');
    if(i===0){
      ctx.font=cell+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('🐍',s.x*cell+cell/2,s.y*cell+cell/2);
    } else {
      ctx.beginPath();ctx.arc(s.x*cell+cell/2,s.y*cell+cell/2,cell*0.4,0,2*Math.PI);
      ctx.fill();
    }
  });
  // food
  ctx.font=cell+'px serif';ctx.fillText('🍎',food.x*cell+cell/2,food.y*cell+cell/2);
}
function endGame(){
  gameOver=true;music.pause(); finalScore.textContent=score;over.classList.remove('hidden');
  if(score>highScore){highScore=score;localStorage.setItem('snake_highscore',score);}
  leaderBoard.push({name,score});localStorage.setItem('snake_leaderboard',JSON.stringify(leaderBoard));
}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp'&&dir.y===0)dir={x:0,y:-1};
  if(e.key==='ArrowDown'&&dir.y===0)dir={x:0,y:1};
  if(e.key==='ArrowLeft'&&dir.x===0)dir={x:-1,y:0};
  if(e.key==='ArrowRight'&&dir.x===0)dir={x:1,y:0};
});
let sx,sy;canvas.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;});
canvas.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>Math.abs(dy)){if(dx>30&&dir.x===0)dir={x:1,y:0}; if(dx<-30&&dir.x===0)dir={x:-1,y:0};}
  else {if(dy>30&&dir.y===0)dir={x:0,y:1}; if(dy<-30&&dir.y===0)dir={x:0,y:-1};}
});
