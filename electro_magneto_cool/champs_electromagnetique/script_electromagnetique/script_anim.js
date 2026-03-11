
const SVG     = document.getElementById('scene');
const SVG_W   = 800, SVG_H = 500;
const ESPC    = 110, VIT = 1.0;
let pileX=400, pileY=370;
let isDragging=false, dragOffX=0, dragOffY=0;
let pileAnimId=null, filAnimId=null, animFrame=null;
let etat=0;
let tooltipActif = false;

// ── SVG UTILS ────────────────────────────────────────────────────────────────
function svgPt(e){
  const r=SVG.getBoundingClientRect();
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const cy=e.touches?e.touches[0].clientY:e.clientY;
  return {x:(cx-r.left)*(SVG_W/r.width), y:(cy-r.top)*(SVG_H/r.height)};
}
function setPile(x,y){
  pileX=x; pileY=y;
  document.getElementById('pile_group').setAttribute('transform',`translate(${x},${y})`);
}
function mkEl(tag, attrs){
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
  return el;
}

// ── CHAMP ELECTRIQUE — moteur (repris de ta page ref) ────────────────────────
// Trace une ligne de champ depuis (x0,y0) dans le repere des charges
function computeFieldLocal(x, y, charges){
  let fx=0,fy=0;
  charges.forEach(c=>{
    const dx=x-c.x, dy=y-c.y;
    const d2=dx*dx+dy*dy;
    if(d2>1){
      const dist=Math.sqrt(d2);
      const f=c.sign/(d2*1);
      fx+=f*dx/dist; fy+=f*dy/dist;
    }
  });
  return {fx,fy};
}

function traceFieldLine(x0,y0,startCharge,charges,maxLen,step=1.5){
  let x=x0,y=y0;
  const pts=[`M${x.toFixed(1)},${y.toFixed(1)}`];
  let prev=null, len=0;
  const opp=charges.find(c=>c.sign!==startCharge.sign);

  for(let i=0;i<600;i++){
    const {fx,fy}=computeFieldLocal(x,y,charges);
    const l=Math.sqrt(fx*fx+fy*fy); if(l===0)break;
    let dx=fx/l, dy=fy/l;
    if(startCharge.sign<0){dx=-dx;dy=-dy;}
    if(prev){
      const s=0.35;
      dx=(1-s)*prev.dx+s*dx; dy=(1-s)*prev.dy+s*dy;
      const dl=Math.sqrt(dx*dx+dy*dy);
      if(dl>0){dx/=dl;dy/=dl;}
    }
    x+=dx*step; y+=dy*step; len+=step;
    if(len>maxLen)break;
    if(opp&&Math.sqrt((x-opp.x)**2+(y-opp.y)**2)<10)break;
    pts.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
    prev={dx,dy};
  }
  return pts.join(' ');
}

// ── CHAMP AUTOUR DE LA PILE (coordonnees locales) ───────────────────────────
// Charges locales : + à (-40,0), - à (+40,0)
const chargesPile=[{x:-40,y:0,sign:1},{x:40,y:0,sign:-1}];
let pileLineEls=[], pileArrowEls=[];

function buildChampPile(){
  const g=document.getElementById('champ_pile_lines');
  g.innerHTML=''; pileLineEls=[]; pileArrowEls=[];
  const nL=16, r0=18;
  const chargePlus  = chargesPile.find(c=>c.sign>0);
  const chargeMoins = chargesPile.find(c=>c.sign<0);

  for(let i=0;i<nL;i++){
    const angle=(2*Math.PI*i)/nL;

    // angle vers le centre (horizontal) = proche de 0
    const versLeCentre = Math.cos(angle); // 1=droite, -1=gauche

    // les 7 du milieu : lignes qui partent du + vers le -
    // on détecte "du milieu" si l'angle est proche de 0 (vers la droite)
    if(versLeCentre > 0.3) {
      const sx=chargePlus.x+Math.cos(angle)*r0;
      const sy=chargePlus.y+Math.sin(angle)*r0;
      const distC=Math.abs(sy);
      const d=traceFieldLine(sx,sy,chargePlus,chargesPile,300);
      const path=mkEl('path',{d,fill:'none',stroke:'black','stroke-width':'0.8'});
      g.appendChild(path);
      const arrow=mkEl('polygon',{fill:'black'});
      g.appendChild(arrow);
      pileLineEls.push(path);
      pileArrowEls.push({arrow,path,isNeg:false});

    } else {
      // lignes extérieures : depuis chaque borne séparément
      [chargePlus, chargeMoins].forEach(charge=>{
        const sx=charge.x+Math.cos(angle)*r0;
        const sy=charge.y+Math.sin(angle)*r0;
        const distC=Math.abs(sy);
        const d=traceFieldLine(sx,sy,charge,chargesPile,55);
        const path=mkEl('path',{d,fill:'none',stroke:'black','stroke-width':'0.8'});
        g.appendChild(path);
        const arrow=mkEl('polygon',{fill:'black'});
        g.appendChild(arrow);
        pileLineEls.push(path);
        pileArrowEls.push({arrow,path,isNeg:charge.sign<0});
      });
    }
  }
}
function animerPile(){
  const t=performance.now()*0.001;
  const cyc=2.5;
  pileArrowEls.forEach(({arrow,path,isNeg})=>{
    if(!path.getTotalLength)return;
    const len=path.getTotalLength(); if(len===0)return;
    const c=(t%cyc)/cyc;
    const pos=isNeg?len*(1-c):len*c;
    const p1=path.getPointAtLength(pos);
    const p2=path.getPointAtLength(isNeg?Math.max(pos-5,0):Math.min(pos+5,len));
    const ang=Math.atan2(p2.y-p1.y,p2.x-p1.x);
    const sz=4,cos=Math.cos(ang),sin=Math.sin(ang);
    arrow.setAttribute('points',[
      `${p1.x+cos*sz},${p1.y+sin*sz}`,
      `${p1.x-sin*sz*0.5},${p1.y+cos*sz*0.5}`,
      `${p1.x+sin*sz*0.5},${p1.y-cos*sz*0.5}`
    ].join(' '));
  });
  pileAnimId=requestAnimationFrame(animerPile);
}

// ── CHAMP DU FIL : 4 fleches a queue ────────────────────────────────────────
// Pas de trait continu — juste 4 petites fleches qui se deplacent
const N_FLECHES_FIL = 4;
const QUEUE_LEN     = 10; // longueur de la queue en px
let filArrowsData   = []; // [{t:0..1}, ...] offsets des 4 fleches

function buildChampFil(){
  const g=document.getElementById('champ_fil');
  g.innerHTML=''; filArrowsData=[];

  for(let i=0;i<N_FLECHES_FIL;i++){
    filArrowsData.push({
      t: i/N_FLECHES_FIL, // offset de phase pour espacer les 4
      lineEl: mkEl('line',{stroke:'black','stroke-width':'1',opacity:'1'}),
      arrowEl: mkEl('polygon',{fill:'black',opacity:'1'})
    });
    g.appendChild(filArrowsData[i].lineEl);
    g.appendChild(filArrowsData[i].arrowEl);
  }
}

function animerFil(){
  const t=performance.now()*0.001;
  const cyc=5; // duree d'un cycle complet de gauche a droite
  const xMin=44, xMax=756, y=150;

  filArrowsData.forEach(fd=>{
    // position de la pointe (0..1 le long du fil)
    const pos=((t/cyc + fd.t)%1);
    const xTip=xMin+(xMax-xMin)*pos;
    const xQueue=Math.max(xMin, xTip-QUEUE_LEN);

    // queue (ligne)
    fd.lineEl.setAttribute('x1',xQueue.toFixed(1));
    fd.lineEl.setAttribute('y1',y);
    fd.lineEl.setAttribute('x2',xTip.toFixed(1));
    fd.lineEl.setAttribute('y2',y);

    // pointe de fleche
    const ang=0; // horizontal -> droite
    const sz=6, cos=Math.cos(ang), sin=Math.sin(ang);
    const px=xTip, py=y;
    fd.arrowEl.setAttribute('points',[
      `${px+cos*sz},${py+sin*sz}`,
      `${px-sin*sz*0.5},${py+cos*sz*0.5}`,
      `${px+sin*sz*0.5},${py-cos*sz*0.5}`
    ].join(' '));
  });

  filAnimId=requestAnimationFrame(animerFil);
}

// ── DRAG & DROP ──────────────────────────────────────────────────────────────
const pileGroup=document.getElementById('pile_group');

pileGroup.addEventListener('mousedown', startDrag);
pileGroup.addEventListener('touchstart',startDrag,{passive:false});
window.addEventListener('mousemove', moveDrag);
window.addEventListener('touchmove', moveDrag,{passive:false});
window.addEventListener('mouseup',   endDrag);
window.addEventListener('touchend',  endDrag);

function startDrag(e){
  if(etat!==1)return;
  e.preventDefault();
  const pt=svgPt(e);
  dragOffX=pt.x-pileX; dragOffY=pt.y-pileY;
  isDragging=true;
}
function moveDrag(e){
  if(!isDragging)return;
  e.preventDefault();
  const pt=svgPt(e);
  setPile(pt.x-dragOffX, pt.y-dragOffY);
  const near=pileY>75&&pileY<220;
  document.getElementById('snap_zone').setAttribute('opacity',near?'0.35':'0');
}
function endDrag(e){
  if(!isDragging)return;
  isDragging=false;
  document.getElementById('snap_zone').setAttribute('opacity','0');
  if(pileY>75&&pileY<220) snapEtBranche();
}

// ── PHASE 1 : approche ───────────────────────────────────────────────────────
function approchePile(){
  if(etat!==0)return; etat=1;

  // bouton disparait
  const btn = document.getElementById('btn_pile');
  btn.style.transition = 'opacity 0.4s ease-out';
  btn.style.opacity = '0';
  setTimeout(()=>{ btn.style.display='none'; }, 400);

// fil retrecit — animation JS fluide
const filHaut = document.getElementById('fil_haut');
const filBas  = document.getElementById('fil_bas');
const dur = 600, t0 = performance.now();
const y1Start = 130, y1End = 143;
const y2Start = 170, y2End = 157;

function animFil(now) {
  const p = Math.min((now - t0) / dur, 1);
  const e = p < 0.5 ? 2*p*p : -1+(4-2*p)*p; // easing
  const yHaut = y1Start + (y1End - y1Start) * e;
  const yBas  = y2Start + (y2End - y2Start) * e;
  filHaut.setAttribute('y1', yHaut.toFixed(1));
  filHaut.setAttribute('y2', yHaut.toFixed(1));
  filBas.setAttribute('y1',  yBas.toFixed(1));
  filBas.setAttribute('y2',  yBas.toFixed(1));
  if (p < 1) requestAnimationFrame(animFil);
}
requestAnimationFrame(animFil);

  // electrons -> petits points
  for(let i=1;i<=8;i++){
    document.getElementById('c'+i).setAttribute('r','3');
    document.getElementById('t'+i).style.opacity='0';
  }
  document.querySelectorAll('.electron').forEach(el=>el.classList.add('no-wiggle'));

  // pile apparait
  setPile(400,370);
  pileGroup.setAttribute('opacity','1');
  buildChampPile();
  animerPile();
tooltipActif = true;
  // legende
  document.getElementById('legende').textContent='glisser la pile sur le fil pour la brancher';
}
// ── SNAP & SEPARATION ────────────────────────────────────────────────────────
function snapEtBranche(){
    if(etat!==1)return; etat=2;
  
  // cacher le tooltip
  tooltipActif = false;
  document.getElementById('tooltip_pile').style.display = 'none';
  
  // stop anim pile
  cancelAnimationFrame(pileAnimId);

  // snap vers le fil
  const x0=pileX,y0=pileY,x1=400,y1=150;
  const dur=350, t0=performance.now();
  function snap(now){
    const p=Math.min((now-t0)/dur,1);
    const e=p<0.5?2*p*p:-1+(4-2*p)*p;
    setPile(x0+(x1-x0)*e, y0+(y1-y0)*e);
    if(p<1) requestAnimationFrame(snap);
    else separerBornes();
  }
  requestAnimationFrame(snap);
}

function separerBornes(){
  document.getElementById('legende').textContent='les bornes se connectent aux extremites du fil...';
  document.getElementById('champ_pile_lines').innerHTML='';

  // separation animee
  // demi_plus  : va de x=-40 (centre) a x=-376 (borne gauche x=24 - pile centre 400)
  // demi_moins : va de x=+40 a x=+376
  const plusTarget  = -(350-24);
  const moinsTarget =  (776-350);
  const dur=800, t0=performance.now();

  function sep(now){
    const p=Math.min((now-t0)/dur,1);
    const e=p<0.5?2*p*p:-1+(4-2*p)*p;
    document.getElementById('demi_plus').setAttribute('transform',`translate(${e*plusTarget},0)`);
    document.getElementById('demi_moins').setAttribute('transform',`translate(${e*moinsTarget},0)`);
    if(p<1) requestAnimationFrame(sep);
    else finBranchement();
  }
  requestAnimationFrame(sep);
}

function finBranchement(){
  // cacher pile, montrer bornes fixes
  pileGroup.setAttribute('opacity','0');
  document.getElementById('demi_plus').removeAttribute('transform');
  document.getElementById('demi_moins').removeAttribute('transform');

  document.getElementById('borne_gauche').setAttribute('opacity','1');
  document.getElementById('borne_droite').setAttribute('opacity','1');

  document.getElementById('legende').textContent='le champ electrique E se propage du + vers le -';

  // champ fil apparait
  buildChampFil();
  setTimeout(()=>{
    document.getElementById('champ_fil').setAttribute('opacity','1');
    animerFil();
  },400);

  // electrons en mouvement
  setTimeout(()=>{
    document.getElementById('legende').textContent=
      'les electrons derivent vers le - (sens inverse de E)';
    phase3_electrons();
  },1400);
}

// ── PHASE 3 : electrons ──────────────────────────────────────────────────────
function phase3_electrons(){
  etat=3;
  const els=document.querySelectorAll('.electron');
  const n=els.length;
  const parts=Array.from({length:n},(_,i)=>({
    x:100+i*ESPC, y:135,
    vx:(Math.random()-0.5),
    vy:(Math.random()-0.5)
  }));
  function tick(){
    parts.forEach((p,i)=>{
      p.x-=VIT;
      p.vx+=(Math.random()-0.5)*0.8; p.vy+=(Math.random()-0.5)*0.8;
      p.vx*=0.85; p.vy*=0.85;
      p.x+=p.vx; p.y+=p.vy;
      p.y=Math.max(145,Math.min(156,p.y));
      if(p.x<45) p.x+=ESPC*n;
      els[i].setAttribute('transform',`translate(${p.x},${p.y})`);
    });
    animFrame=requestAnimationFrame(tick);
  }
  tick();
}




pileGroup.addEventListener('mousemove', (e)=>{
  if(!tooltipActif) return;
  const t = document.getElementById('tooltip_pile');
  t.style.display = 'block';
  t.style.left = (e.clientX + 16) + 'px';
  t.style.top  = (e.clientY + 12) + 'px';
});

pileGroup.addEventListener('mouseleave', ()=>{
  if(!tooltipActif) return;
  document.getElementById('tooltip_pile').style.display = 'none';
});

document.getElementById('btn_pile').addEventListener('click', approchePile);