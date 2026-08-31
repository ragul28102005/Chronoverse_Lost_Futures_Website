const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
let stars = [];
let mouse = { x: innerWidth / 2, y: innerHeight / 2 };

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  stars = Array.from({length: Math.min(220, Math.floor(innerWidth/5))}, () => ({
    x: Math.random()*innerWidth, y: Math.random()*innerHeight,
    r: Math.random()*1.5+.2, a: Math.random()*.8+.2, s: Math.random()*.2+.03
  }));
}
resize(); addEventListener("resize", resize);

function drawSpace(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const s of stars){
    s.y += s.s;
    if(s.y > innerHeight+2){s.y=-2;s.x=Math.random()*innerWidth}
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(220,235,255,${s.a})`;ctx.fill();
  }
  const g=ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,240);
  g.addColorStop(0,"rgba(109,136,255,.07)");g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=g;ctx.fillRect(0,0,innerWidth,innerHeight);
  requestAnimationFrame(drawSpace);
}
drawSpace();

const cursorGlow=document.getElementById("cursorGlow");
addEventListener("pointermove",e=>{mouse.x=e.clientX;mouse.y=e.clientY;cursorGlow.style.left=e.clientX+"px";cursorGlow.style.top=e.clientY+"px"});

const intro=document.getElementById("intro");
const experience=document.getElementById("experience");
const transition=document.getElementById("portalTransition");
document.getElementById("enterBtn").addEventListener("click",()=>{
  transition.classList.add("active");
  setTimeout(()=>intro.classList.add("leave"),250);
  setTimeout(()=>{intro.style.display="none";experience.classList.remove("is-hidden");window.scrollTo(0,0);observeReveals()},850);
  setTimeout(()=>transition.classList.remove("active"),1500);
});

document.querySelectorAll("[data-scroll]").forEach(btn=>btn.addEventListener("click",()=>document.querySelector(btn.dataset.scroll)?.scrollIntoView({behavior:"smooth"})));
document.getElementById("brandHome").addEventListener("click",e=>{e.preventDefault();scrollTo({top:0,behavior:"smooth"})});

function observeReveals(){
  const ob=new IntersectionObserver(entries=>entries.forEach(en=>en.isIntersecting&&en.target.classList.add("visible")),{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>ob.observe(el));
}
observeReveals();

const worlds=[
  {title:"SOLAR EDEN",year:"2150",text:"A thriving Earth where architecture became part of the ecosystem. Solar gardens float above living cities while autonomous rivers carry energy between districts."},
  {title:"NEON ASCENT",year:"2197",text:"Humanity moved upward. Megacities pierce the clouds, holographic marketplaces stretch between towers, and every street exists in both physical and digital space."},
  {title:"ABYSSAL EARTH",year:"2240",text:"The oceans swallowed the old world. Glass cities glow beneath the waves while engineered reefs, aquatic farms and silent ruins preserve memories of the surface."},
  {title:"MACHINE DAWN",year:"2301",text:"Planet-scale intelligence rebuilt civilization. Roads predict travelers, buildings repair themselves, and a distributed machine mind watches every horizon."},
  {title:"THE FORGOTTEN EARTH",year:"????",text:"The impossible timeline. Forests grow through machines, neon ruins sleep below clear oceans, and fragments of every future exist together."}
];

let activeWorld=0;
const collected=new Set(JSON.parse(localStorage.getItem("chronoverseFragments")||"[]"));
const modal=document.getElementById("worldModal");
const modalTitle=document.getElementById("modalTitle");
const modalIndex=document.getElementById("modalIndex");
const modalYear=document.getElementById("modalYear");
const modalText=document.getElementById("modalText");
const modalFragment=document.getElementById("modalFragment");
const collectBtn=document.getElementById("collectFragment");

function openWorld(index){
  if(index===4 && collected.size<4){toast("FINAL TIMELINE LOCKED — RECOVER ALL 4 FRAGMENTS");return}
  activeWorld=index; const w=worlds[index];
  modalTitle.textContent=w.title;modalIndex.textContent=`TIMELINE ${String(index+1).padStart(2,"0")} / 05`;
  modalYear.textContent=w.year;modalText.textContent=w.text;
  document.getElementById("hudTimeline").textContent=`${String(index+1).padStart(2,"0")} / 05`;
  if(index<4){
    const has=collected.has(index);
    modalFragment.textContent=has?"RECOVERED":"DETECTED";
    collectBtn.style.display="inline-flex";
    collectBtn.querySelector("span").textContent=has?"FRAGMENT RECOVERED":"RECOVER TIME FRAGMENT";
    collectBtn.disabled=has;
    collectBtn.style.opacity=has?.55:1;
  }else{
    modalFragment.textContent="CORE ACCESS";
    collectBtn.style.display="inline-flex";
    collectBtn.disabled=false;collectBtn.style.opacity=1;
    collectBtn.querySelector("span").textContent="ENTER CHRONO CORE";
  }
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
}
document.querySelectorAll(".world-card").forEach(card=>card.addEventListener("click",e=>{
  if(e.target.closest("button")||!e.target.closest(".lock-layer")) openWorld(+card.dataset.world);
}));
document.querySelectorAll(".enter-world").forEach((btn,i)=>btn.addEventListener("click",e=>{e.stopPropagation();openWorld(i)}));
document.getElementById("randomWorld").addEventListener("click",()=>{
  const options=collected.size===4?[0,1,2,3,4]:[0,1,2,3];
  const i=options[Math.floor(Math.random()*options.length)];
  document.querySelector(`[data-world="${i}"]`).scrollIntoView({behavior:"smooth",block:"center"});
  setTimeout(()=>openWorld(i),700);
});
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow=""}
document.getElementById("closeWorld").addEventListener("click",closeModal);
modal.querySelector(".modal-backdrop").addEventListener("click",closeModal);
addEventListener("keydown",e=>e.key==="Escape"&&closeModal());

collectBtn.addEventListener("click",()=>{
  if(activeWorld===4){closeModal();document.getElementById("ending").scrollIntoView({behavior:"smooth"});return}
  if(collected.has(activeWorld)) return;
  collected.add(activeWorld);localStorage.setItem("chronoverseFragments",JSON.stringify([...collected]));
  updateFragments();modalFragment.textContent="RECOVERED";collectBtn.querySelector("span").textContent="FRAGMENT RECOVERED";
  collectBtn.disabled=true;collectBtn.style.opacity=.55;
  toast(`TIME FRAGMENT ${activeWorld+1} RECOVERED`);
});

function updateFragments(){
  document.getElementById("fragmentCount").textContent=`${collected.size}/4`;
  document.getElementById("hudFragments").textContent=`${collected.size} / 4`;
  document.getElementById("fragmentRing").style.background=`conic-gradient(#85ffe1 ${collected.size*90}deg,rgba(255,255,255,.05) ${collected.size*90}deg)`;
  document.querySelectorAll(".fragment-row").forEach((row,i)=>{
    const has=collected.has(i);row.classList.toggle("collected",has);row.querySelector("b").textContent=has?"RECOVERED":"NOT RECOVERED";
  });
  if(collected.size===4){
    document.getElementById("finalWorldCard").classList.add("unlocked");
    document.querySelector("#finalWorldCard .enter-world").textContent="ENTER WORLD ↗";
    document.getElementById("hudCore").textContent="ONLINE";
  }
}
updateFragments();

let toastTimer;
function toast(message){
  const t=document.getElementById("toast");t.textContent=message;t.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2700);
}

document.querySelectorAll(".choice").forEach(btn=>btn.addEventListener("click",()=>{
  if(collected.size<4){toast("THE CHRONO CORE IS LOCKED");return}
  document.body.classList.remove("choice-nature","choice-ai","choice-stars");
  const choice=btn.dataset.choice;document.body.classList.add(`choice-${choice}`);
  const msg={nature:"ENDING SELECTED // EARTH BLOOMS AGAIN.",ai:"ENDING SELECTED // HUMANITY AND INTELLIGENCE BUILD TOGETHER.",stars:"ENDING SELECTED // THE LAST SHIPS LEAVE FOR THE STARS."};
  document.getElementById("endingMessage").textContent=msg[choice];
  toast("TIMELINE COMMITTED");
}));

let audioCtx=null,osc=null,gain=null,soundOn=false;
document.getElementById("soundBtn").addEventListener("click",()=>{
  soundOn=!soundOn;const btn=document.getElementById("soundBtn");btn.textContent=`SOUND: ${soundOn?"ON":"OFF"}`;
  if(soundOn){
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();osc=audioCtx.createOscillator();gain=audioCtx.createGain();
    osc.type="sine";osc.frequency.value=55;gain.gain.value=.018;osc.connect(gain);gain.connect(audioCtx.destination);osc.start();
  }else if(osc){gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.25);setTimeout(()=>{osc.stop();audioCtx.close()},300)}
});

addEventListener("scroll",()=>{
  const y=scrollY;document.querySelector(".planet-a")?.style.setProperty("transform",`translateY(${y*.08}px)`);
  document.querySelector(".hero-orbit")?.style.setProperty("transform",`rotate(${y*.025}deg)`);
},{passive:true});
