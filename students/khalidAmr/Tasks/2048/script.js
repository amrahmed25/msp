const toast=document.getElementById('toast');
const playBtn=document.getElementById('playBtn');
const soundBtn=document.getElementById('soundBtn');
let soundOn=window.ShiftMusic?window.ShiftMusic.isEnabled():true,audioCtx=null;
if(soundBtn&&!soundOn){
  soundBtn.classList.add('sound-off');
  soundBtn.setAttribute('aria-label','Turn sound on');
  soundBtn.title='Sound off';
}

function showToast(m){
  toast.textContent=m;toast.classList.add('show');
  clearTimeout(window.tt);window.tt=setTimeout(()=>toast.classList.remove('show'),1800);
}
function tone(f=520,d=.08){
  if(!soundOn)return;
  try{
    audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
    audioCtx.resume();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(.0001,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.01);
    g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+d);
    o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+d);
  }catch(e){}
}
playBtn.onclick=()=>{
  tone(680,.1);showToast('Classic mode selected');
  setTimeout(()=>location.href='board.html?mode=classic',650);
};
document.querySelectorAll('.mode-card').forEach(card=>{
  const open=()=>{
    const mode=card.dataset.mode;tone(560,.08);showToast(mode+' selected');
    const target = mode === 'Dark Zone'
  ? 'dark-zone.html'
  : mode === 'Rush'
    ? 'rush.html'
    : mode === 'Time Attack'
      ? 'time-attack.html'
      : 'board.html?mode='+mode.toLowerCase().replace(/\s+/g,'-');
      setTimeout(()=>location.href=target,650);
  };
  card.onclick=open;
  card.querySelector('.mode-arrow').onclick=e=>{e.stopPropagation();open()};
});
if(soundBtn) soundBtn.onclick=()=>{
  soundOn=!soundOn;
  soundBtn.classList.toggle('sound-off',!soundOn);
  soundBtn.setAttribute('aria-label',soundOn?'Turn sound off':'Turn sound on');
  soundBtn.title=soundOn?'Sound on':'Sound off';
  if(window.ShiftMusic)window.ShiftMusic.setEnabled(soundOn);
  if(soundOn)tone(600,.08);
};
document.getElementById('profileBtn').onclick=()=>showToast('Profile menu');

(function initHomeStats(){
  const best=Number(localStorage.getItem('shift2048_best'))||0;
  const tile=Number(localStorage.getItem('shift2048_bestTile'))||0;
  const games=Number(localStorage.getItem('shift2048_gamesPlayed'))||0;
  const streak=Number(localStorage.getItem('shift2048_winStreak'))||0;
  const statBest=document.getElementById('statBest');
  const statTile=document.getElementById('statTile');
  const statGames=document.getElementById('statGames');
  const statStreak=document.getElementById('statStreak');
  if(statBest)statBest.textContent=best;
  if(statTile)statTile.textContent=tile>0?tile:'—';
  if(statGames)statGames.textContent=games;
  if(statStreak)statStreak.textContent=streak;
})();
