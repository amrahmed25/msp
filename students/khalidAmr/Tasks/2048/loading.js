const screen=document.getElementById("loadingScreen");
const bar=document.getElementById("progressBar");
const brand=document.getElementById("brand");
const status=document.getElementById("statusText");
const soundBtn=document.getElementById("soundButton");
let sound=true,ctx=null,lastStep=-1;

function audio(){
  if(!ctx) ctx=new(window.AudioContext||window.webkitAudioContext)();
  return ctx;
}
function tone(freq,duration=.08,type="sine",volume=.03){
  if(!sound)return;
  const c=audio(),o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(70,freq*.72),c.currentTime+duration);
  g.gain.setValueAtTime(.0001,c.currentTime);
  g.gain.exponentialRampToValueAtTime(volume,c.currentTime+.012);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration+.02);
}

async function startSoundOnLoad(){
  try{
    const c=audio();
    if(c.state==="suspended") await c.resume();
    tone(330,.14,"sine",.018);
    setTimeout(()=>tone(495,.18,"sine",.014),150);
  }catch(e){
  }
}

window.addEventListener("load",startSoundOnLoad);

soundBtn.addEventListener("click",async()=>{
  sound=!sound;
  soundBtn.classList.toggle("sound-off",!sound);
  if(sound){const c=audio();if(c.state==="suspended")await c.resume();tone(420,.1);setTimeout(()=>tone(630,.12),90);}
});
document.addEventListener("pointerdown",async()=>{
  if(sound){
    try{
      const c=audio();
      if(c.state==="suspended") await c.resume();
      tone(420,.1,"sine",.025);
    }catch(e){}
  }
},{once:true});

const start=performance.now(),duration=4200;
function loop(now){
  const p=Math.min(100,((now-start)/duration)*100);
  bar.style.width=p+"%";
  const step=Math.floor(p/18);
  if(step!==lastStep&&step>0&&step<6){lastStep=step;tone(280+step*45,.055,"triangle",.018);}
  if(p>=70&&!brand.classList.contains("revealed")){
    brand.classList.remove("hidden");brand.classList.add("revealed");status.textContent="READY";
    tone(520,.08);setTimeout(()=>tone(780,.16,"sine",.035),90);
  }
  if(p<100)requestAnimationFrame(loop);
  else {
    setTimeout(()=>{
      screen.classList.add("fade-out");
      setTimeout(()=>{ window.location.href = "home.html"; }, 850);
    },500);
  }
}
requestAnimationFrame(loop);
