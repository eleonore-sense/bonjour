const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();



 $( window ).on( "load", function() {
 if(localStorage.getItem("agent") == "adele"){   
img.src = "../img/flappy-adele.png";}
else if(localStorage.getItem("agent") == "annab"){   
img.src = "../img/flappy-annab.png";}
else if(localStorage.getItem("agent") == "camillec"){   
img.src = "../img/flappy-camillec.png";}
else if(localStorage.getItem("agent") == "camilles"){   
img.src = "../img/flappy-camilles.png";}
else if(localStorage.getItem("agent") == "celine"){   
img.src = "../img/flappy-celine.png";}
else if(localStorage.getItem("agent") == "chloem"){   
img.src = "../img/flappy-chloem.png";}
else if(localStorage.getItem("agent") == "dalva"){   
img.src = "../img/flappy-dalva.png";}
else if(localStorage.getItem("agent") == "diane"){   
img.src = "../img/flappy-diane.png";}
else if(localStorage.getItem("agent") == "jajou"){   
img.src = "../img/flappy-jajou.png";}
else if(localStorage.getItem("agent") == "joris"){   
img.src = "../img/flappy-joris.png";}
else if(localStorage.getItem("agent") == "lucien"){   
img.src = "../img/flappy-lucien.png";}
else if(localStorage.getItem("agent") == "mae"){   
img.src = "../img/flappy-mae.png";}
else if(localStorage.getItem("agent") == "marie"){   
img.src = "../img/flappy-marie.png";}
else if(localStorage.getItem("agent") == "mathias"){   
img.src = "../img/flappy-mathias.png";}
else if(localStorage.getItem("agent") == "mathilde"){   
img.src = "../img/flappy-mathilde.png";}
else if(localStorage.getItem("agent") == "nico"){   
img.src = "../img/flappy-nico.png";}
else if(localStorage.getItem("agent") == "nora"){   
img.src = "../img/flappy-nora.png";}
else if(localStorage.getItem("agent") == "pierre"){   
img.src = "../img/flappy-pierre.png";}
else if(localStorage.getItem("agent") == "raf"){   
img.src = "../img/flappy-raf.png";}
else {   
img.src = "../img/flappy-suzelle.png";}
});
// general settings
let gamePlaying = false;
const gravity = .3;
const speed = 3;
const size = [55, 58];
const jump = -7.5;
const cTenth = (canvas.width / 10);

let index = 0,
    bestScore = 0, 
    flight, 
    flyHeight, 
    currentScore, 
    pipe;

// pipe settings
const pipeWidth = 62;
const pipeGap = 270;
const pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

const setup = () => {
  currentScore = 0;
  flight = jump;

  // set initial flyHeight (middle of screen - size of the bird)
  flyHeight = (canvas.height / 2) - (size[1] / 2);

  // setup first 3 pipes
  pipes = Array(3).fill().map((a, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);
}

const render = () => {
  // make the pipe and bird moving 
  index++;

  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background first part 
  ctx.drawImage(img, 0, 0, 2609, canvas.height, -((index * (speed / 2)) % 2609) + 2609, 0, 2609, canvas.height);
  // background second part
  ctx.drawImage(img, 0, 0, 2609, canvas.height, -(index * (speed / 2)) % 2609, 0, 2609, canvas.height);
  
  // pipe display
  if (gamePlaying){
    pipes.map(pipe => {
      // pipe moving
      pipe[0] -= speed;

      // top pipe
      ctx.drawImage(img, 2609, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
      // bottom pipe
      ctx.drawImage(img, 2609 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

      // give 1 point & create new pipe
      if(pipe[0] <= -pipeWidth){
        currentScore++;
        // check if it's the best score
        bestScore = Math.max(bestScore, currentScore);
        
        // remove & create new pipe
        pipes = [...pipes.slice(1), [pipes[pipes.length-1][0] + pipeGap + pipeWidth, pipeLoc()]];
        console.log(pipes);
      }
    
      // if hit the pipe, end
      if ([
        pipe[0] <= cTenth + size[0], 
        pipe[0] + pipeWidth >= cTenth, 
        pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1]
      ].every(elem => elem)) {
        gamePlaying = false;
        setup();
      }
    })
  }
  // draw bird
  if (gamePlaying) {
    ctx.drawImage(img, 2609, 0, ...size, cTenth, flyHeight, ...size);
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
  } else {
    ctx.drawImage(img, 2609,0, ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);
    flyHeight = (canvas.height / 2) - (size[1] / 2);
      // text accueil
    ctx.fillText('clique sur lʼimage pour jouer à FlappyPote', 90, 535);
    ctx.font = " 25px consolas";
    ctx.fillStyle = "white";
  }

  document.getElementById('bestScore').innerHTML = `flappyPote best score : ${bestScore}`;
  document.getElementById('currentScore').innerHTML = `current : ${currentScore}`;

  // tell the browser to perform anim
  window.requestAnimationFrame(render);
}

// launch setup
setup();
img.onload = render;

// start game
document.addEventListener('click', () => gamePlaying = true);
window.onclick = () => flight = jump;