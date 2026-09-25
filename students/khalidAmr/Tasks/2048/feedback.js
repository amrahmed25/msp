let soundOn=window.ShiftMusic?window.ShiftMusic.isEnabled():true,audioCtx=null;
if(!soundOn){document.getElementById('soundBtn').classList.add('sound-off');}
function tone(f=560,d=.08){if(!soundOn)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=f;g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.03,audioCtx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+d);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+d)}catch(e){}}
document.getElementById('soundBtn').onclick=()=>{soundOn=!soundOn;document.getElementById('soundBtn').classList.toggle('sound-off',!soundOn);if(window.ShiftMusic)window.ShiftMusic.setEnabled(soundOn);if(soundOn)tone(600,.08)};
document.querySelectorAll('.fb-side-links a,.feedback-btn').forEach(a=>a.addEventListener('click',()=>tone(640,.07)));

let selectedRating=0;
let selectedTopic='Gameplay';
const stars=document.querySelectorAll('.fb-star');
const ratingError=document.getElementById('ratingError');
stars.forEach(star=>{
  star.addEventListener('click',()=>{
    selectedRating=parseInt(star.dataset.value,10);
    stars.forEach(s=>s.classList.toggle('on',parseInt(s.dataset.value,10)<=selectedRating));
    ratingError.classList.remove('show');
    tone(700,.06)
  })
});

const chips=document.querySelectorAll('.fb-chip');
chips.forEach(chip=>{
  chip.addEventListener('click',()=>{
    chips.forEach(c=>c.classList.remove('sel'));
    chip.classList.add('sel');
    selectedTopic=chip.dataset.topic;
    tone(520,.06)
  })
});

const form=document.getElementById('feedbackForm');
const messageField=document.getElementById('fbMessage');
const messageError=document.getElementById('messageError');
const successBlock=document.getElementById('fbSuccess');

form.addEventListener('submit',e=>{
  e.preventDefault();
  let valid=true;
  if(selectedRating===0){
    ratingError.classList.add('show');
    valid=false
  }
  if(messageField.value.trim().length<5){
    messageError.classList.add('show');
    valid=false
  }else{
    messageError.classList.remove('show')
  }
  if(!valid){
    tone(220,.15);
    return
  }
  tone(880,.12);
  form.querySelectorAll('.panel-heading,label,textarea,input,.fb-submit-row').forEach(el=>el.style.display='none');
  successBlock.classList.add('show')
});
