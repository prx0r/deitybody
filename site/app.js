/* Body homescreen engine — zero deps. Data: frozen v2 maps. Audio: human clips + EdgeSanskrit phrases. */
(function(){
"use strict";
const $ = s => document.querySelector(s);
const nodesG = $('#nodes'), info = $('#info'), cfgNote = $('#cfgNote');

/* 50 phonemes: dev, iast, matrika locus + xy, malini locus + xy, clip file */
const CLIP = f => 'audio/phonemes/' + f;
const P = [
 // vowels — head/face
 {i:'a', d:'अ', ml:'forehead', mx:200, my:92,  al:'speech', ax:200, ay:190, c:'a.ogg'},
 {i:'ā', d:'आ', ml:'mouth', mx:200, my:158,  al:'milk / amṛta', ax:200, ay:300, c:'aa.ogg'},
 {i:'i', d:'इ', ml:'right eye', mx:181, my:118, al:'tongue', ax:200, ay:170, c:'i.ogg'},
 {i:'ī', d:'ई', ml:'left eye', mx:219, my:118, al:'nose', ax:200, ay:140, c:'ii.ogg'},
 {i:'u', d:'उ', ml:'right ear', mx:156, my:128, al:'right ear', ax:156, ay:128, c:'u.ogg'},
 {i:'ū', d:'ऊ', ml:'left ear', mx:244, my:128, al:'left ear', ax:244, ay:128, c:'uu.ogg'},
 {i:'ṛ', d:'ऋ', ml:'right nostril', mx:191, my:140, al:'headband', ax:170, ay:78, c:'r.ogg'},
 {i:'ṝ', d:'ॠ', ml:'left nostril', mx:209, my:140, al:'headband', ax:230, ay:78, c:'rr.ogg'},
 {i:'ḷ', d:'ऌ', ml:'right cheek', mx:172, my:150, al:'headband', ax:190, ay:78, c:null},
 {i:'ḹ', d:'ॡ', ml:'left cheek', mx:228, my:150, al:'headband', ax:210, ay:78, c:null},
 {i:'e', d:'ए', ml:'lower teeth', mx:186, my:166, al:'right knee', ax:170, ay:570, c:'e.ogg'},
 {i:'ai', d:'ऐ', ml:'upper teeth', mx:214, my:162, al:'left knee', ax:230, ay:570, c:'ai.ogg'},
 {i:'o', d:'ओ', ml:'lower lip', mx:188, my:178, al:'right shank', ax:170, ay:630, c:'o.ogg'},
 {i:'au', d:'औ', ml:'upper lip', mx:212, my:178, al:'left shank', ax:230, ay:630, c:'au.ogg'},
 {i:'aṃ', d:'अं', ml:'crown', mx:200, my:62, al:'right thigh', ax:172, ay:510, c:'anusvara.ogg'},
 {i:'aḥ', d:'अः', ml:'tongue', mx:200, my:170, al:'general prāṇa', ax:200, ay:350, c:'visarga.ogg'},
 // ka-varga right upper
 {i:'ka', d:'क', ml:'right shoulder', mx:140, my:250, al:'teeth', ax:182, ay:162, c:'ka.ogg'},
 {i:'kha', d:'ख', ml:'right arm', mx:120, my:300, al:'teeth', ax:194, ay:162, c:'kha.ogg'},
 {i:'ga', d:'ग', ml:'right hand', mx:105, my:350, al:'teeth', ax:206, ay:162, c:'ga.ogg'},
 {i:'gha', d:'घ', ml:'right fingers', mx:100, my:380, al:'teeth', ax:218, ay:162, c:'gha.ogg'},
 {i:'ṅa', d:'ङ', ml:'right nails', mx:100, my:402, al:'teeth', ax:200, ay:150, c:null},
 // ca-varga left upper
 {i:'ca', d:'च', ml:'left shoulder', mx:260, my:250, al:'right eye', ax:181, ay:118, c:'ca.ogg'},
 {i:'cha', d:'छ', ml:'left arm', mx:280, my:300, al:'right chest', ax:175, ay:310, c:'cha.ogg'},
 {i:'ja', d:'ज', ml:'left hand', mx:295, my:350, al:'trident prongs', ax:170, ay:40, c:'ja.ogg'},
 {i:'jha', d:'झ', ml:'left fingers', mx:300, my:380, al:'right fingers', ax:120, ay:380, c:'jha.ogg'},
 {i:'ña', d:'ञ', ml:'left nails', mx:300, my:402, al:'left fingers', ax:280, ay:380, c:'na_j.ogg'},
 // ta-varga right lower (retroflex)
 {i:'ṭa', d:'ट', ml:'right hip', mx:175, my:450, al:'skull', ax:200, ay:40, c:'ta1.ogg'},
 {i:'ṭha', d:'ठ', ml:'right thigh', mx:172, my:510, al:'hands', ax:200, ay:365, c:'tha1.ogg'},
 {i:'ḍa', d:'ड', ml:'right knee', mx:170, my:570, al:'right arm', ax:120, ay:300, c:'da1.ogg'},
 {i:'ḍha', d:'ढ', ml:'right shank', mx:170, my:630, al:'left arm', ax:280, ay:300, c:'dha1.ogg'},
 {i:'ṇa', d:'ण', ml:'right toes', mx:168, my:690, al:'ears', ax:200, ay:128, c:'na_k.ogg'},
 // ta-varga left lower (dental)
 {i:'ta', d:'त', ml:'left hip', mx:225, my:450, al:'left thigh', ax:228, ay:510, c:'ta.ogg'},
 {i:'tha', d:'थ', ml:'left thigh', mx:228, my:510, al:'top of head', ax:200, ay:70, c:'tha.ogg'},
 {i:'da', d:'द', ml:'left knee', mx:230, my:570, al:'right foot', ax:168, ay:690, c:'da.ogg'},
 {i:'dha', d:'ध', ml:'left shank', mx:230, my:630, al:'left eye', ax:219, ay:118, c:'dha.ogg'},
 {i:'na', d:'न', ml:'left toes', mx:232, my:690, al:'crown-flame śikhā', ax:200, ay:48, c:'na.ogg'},
 // pa-varga torso
 {i:'pa', d:'प', ml:'right side', mx:165, my:355, al:'heart', ax:200, ay:330, c:'pa.ogg'},
 {i:'pha', d:'फ', ml:'left side', mx:235, my:355, al:'left foot', ax:232, ay:690, c:'pha.ogg'},
 {i:'ba', d:'ब', ml:'back', mx:218, my:372, al:'mouth', ax:200, ay:168, c:'ba.ogg'},
 {i:'bha', d:'भ', ml:'belly', mx:182, my:400, al:'right shoulder', ax:140, ay:250, c:'bha.ogg'},
 {i:'ma', d:'म', ml:'heart', mx:200, my:330, al:'buttocks / hips', ax:200, ay:450, c:'ma.ogg'},
 // deep: ya ra la va
 {i:'ya', d:'य', ml:'skin', mx:184, my:345, al:'left shoulder', ax:260, ay:250, c:'ya.ogg'},
 {i:'ra', d:'र', ml:'blood', mx:216, my:360, al:'trident shaft', ax:200, ay:40, c:'ra.ogg'},
 {i:'la', d:'ल', ml:'flesh', mx:184, my:375, al:'left chest', ax:225, ay:310, c:'la.ogg'},
 {i:'va', d:'व', ml:'sinews', mx:216, my:390, al:'throat', ax:200, ay:230, c:'va.ogg'},
 // sibilants+
 {i:'śa', d:'श', ml:'bone', mx:184, my:405, al:'guhya', ax:200, ay:470, c:'sha.ogg'},
 {i:'ṣa', d:'ष', ml:'marrow', mx:216, my:420, al:'belly', ax:200, ay:400, c:'shha.ogg'},
 {i:'sa', d:'स', ml:'essence', mx:184, my:435, al:'jīva / Self', ax:200, ay:330, c:'sa.ogg'},
 {i:'ha', d:'ह', ml:'prāṇa', mx:216, my:450, al:'particular prāṇa', ax:200, ay:365, c:'ha.ogg'},
 {i:'kṣa', d:'क्ष', ml:'generative', mx:200, my:468, al:'navel', ax:200, ay:390, c:null},
];
let cfg = 'matrika';
const byIast = {}; P.forEach(p => byIast[p.i] = p);
const els = {};

/* build nodes */
const NS = 'http://www.w3.org/2000/svg';
P.forEach(p => {
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'node'); g.dataset.iast = p.i;
  g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
  g.setAttribute('aria-label', p.i + ' at ' + p.ml);
  const halo = document.createElementNS(NS, 'circle');
  halo.setAttribute('class', 'halo'); halo.setAttribute('r', '22');
  const pulse = document.createElementNS(NS, 'circle');
  pulse.setAttribute('class', 'pulse'); pulse.setAttribute('r', '14');
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('class', 'dot'); dot.setAttribute('r', '13');
  const t = document.createElementNS(NS, 'text');
  t.textContent = p.d;
  g.append(halo, pulse, dot, t);
  const go = () => activate(p.i, true);
  g.addEventListener('click', go);
  g.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault(); go();} });
  nodesG.appendChild(g);
  els[p.i] = g;
});
function place(){
  P.forEach(p => {
    const g = els[p.i];
    const x = cfg==='matrika' ? p.mx : p.ax, y = cfg==='matrika' ? p.my : p.ay;
    g.setAttribute('transform', `translate(${x},${y})`);
    g.style.transition = 'transform .6s ease';
    g.setAttribute('aria-label', p.i + ' at ' + (cfg==='matrika'?p.ml:p.al));
  });
  cfgNote.textContent = 'config: ' + (cfg==='matrika' ? 'Mātṛkā (verse-literal TĀ 15)' : 'Mālinī (MV 3.37–41 na→pha)');
}
place();

/* entrance: nodes kindle in emission order (a→kṣa), like the alphabet waking up */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  P.forEach((p,k) => {
    const g = els[p.i];
    const x = cfg==='matrika' ? p.mx : p.ax, y = cfg==='matrika' ? p.my : p.ay;
    g.animate(
      [{opacity:0}, {opacity:1}],
      {duration:420, delay:120+k*28, easing:'ease-out', fill:'backwards'});
  });
})();

/* audio */
let actx = null;
function ctx(){ if(!actx) actx = new (window.AudioContext||window.webkitAudioContext)(); return actx; }
async function playClip(file){
  if(!file) { flashInfo('synth-only phoneme — hear it in a phrase below'); return; }
  try{
    const r = await fetch('audio/phonemes/' + file); const b = await r.arrayBuffer();
    const ac = ctx(); const buf = await ac.decodeAudioData(b);
    const s = ac.createBufferSource(); s.buffer = buf; s.connect(ac.destination); s.start();
  }catch(e){ /* offline? ignore */ }
}
async function playPhrase(kind){
  const f = {sutra:'audio/edge_test_sutra.wav', hrdaye:'audio/edge_test_hrdaye.wav', namah:'audio/edge_test_namah.wav'}[kind];
  try{
    const r = await fetch(f); const b = await r.arrayBuffer();
    const ac = ctx(); const buf = await ac.decodeAudioData(b);
    const s = ac.createBufferSource(); s.buffer = buf; s.connect(ac.destination); s.start();
  }catch(e){}
}

/* ui */
function flashInfo(html){ info.querySelector('.locus').textContent = html; }
function light(seq, ms){
  seq.forEach((id,k) => setTimeout(()=>{
    document.querySelectorAll('.node.lit').forEach(n=>n.classList.remove('lit'));
    const g = els[id]; if(g){ g.classList.remove('lit'); void g.getBoundingClientRect(); g.classList.add('lit'); }
  }, k*ms));
  setTimeout(()=>document.querySelectorAll('.node.lit').forEach(n=>n.classList.remove('lit')), seq.length*ms+400);
}
function activate(iast, sound){
  const p = byIast[iast]; if(!p) return;
  document.querySelectorAll('.node.lit').forEach(n=>n.classList.remove('lit'));
  const g = els[iast]; g.classList.remove('lit'); void g.getBoundingClientRect(); g.classList.add('lit');
  const locus = cfg==='matrika' ? p.ml : p.al;
  info.querySelector('.dev').textContent = p.d;
  info.querySelector('.iast').textContent = p.i + ' · ' + locus;
  info.querySelector('.locus').textContent =
    (cfg==='matrika'?'Mātṛkā base':'Mālinī infusion') + ' · ' +
    (cfg==='matrika' ? ('Mālinī: '+p.al) : ('Mātṛkā: '+p.ml));
  if(sound) playClip(p.c);
  clearTimeout(activate._t);
  activate._t = setTimeout(()=>g.classList.remove('lit'), 1400);
}
$('#bMatrika').onclick = e => { cfg='matrika'; place();
  $('#bMatrika').classList.add('on'); $('#bMalini').classList.remove('on');
  $('#bMatrika').setAttribute('aria-selected','true'); $('#bMalini').setAttribute('aria-selected','false'); };
$('#bMalini').onclick = e => { cfg='malini'; place();
  $('#bMalini').classList.add('on'); $('#bMatrika').classList.remove('on');
  $('#bMalini').setAttribute('aria-selected','true'); $('#bMatrika').setAttribute('aria-selected','false'); };

/* trajectories: single-timeline dash draw + sequential stops */
function runFlow(pathId, seq, stepMs){
  const path = $(pathId);
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.classList.add('go');
  const t0 = performance.now(), dur = seq.length*stepMs;
  function fr(t){
    const k = Math.min(1, (t-t0)/dur);
    path.style.strokeDashoffset = len*(1-k);
    const idx = Math.min(seq.length-1, Math.floor(k*seq.length));
    document.querySelectorAll('.node.lit').forEach(n=>n.classList.remove('lit'));
    const g = els[seq[idx]]; if(g) g.classList.add('lit');
    if(k<1) requestAnimationFrame(fr);
    else setTimeout(()=>{ path.classList.remove('go');
      document.querySelectorAll('.node.lit').forEach(n=>n.classList.remove('lit')); }, 600);
  }
  requestAnimationFrame(fr);
}
$('#bOm').onclick = () => {
  info.querySelector('.dev').textContent = 'ॐ';
  info.querySelector('.iast').textContent = 'OM · heart → crown → dvādaśānta → rain to heart';
  info.querySelector('.locus').textContent = 'Ascent then amṛta down-flood (Netra sequel). Stops light in order — one timeline, no drift.';
  runFlow('#flowOm', ['ma','ha','aṃ','a','aṃ','ma'], 700);
};
$('#bNamah').onclick = () => {
  info.querySelector('.dev').textContent = 'ॐ नमः शिवाय';
  info.querySelector('.iast').textContent = 'oṃ namaḥ śivāya · feet → heart → everywhere';
  info.querySelector('.locus').textContent = cfg==='matrika'
    ? 'Mātṛkā: na feet → ma heart → śa bone/i eye → va spread → ya skin'
    : 'Mālinī: na crown-flame → ma base → śa guhya → va throat → ya shoulder · heart silent-center';
  runFlow('#flowNamah', cfg==='matrika' ? ['na','ma','aḥ','śa','i','va','ā','ya','a'] : ['na','ma','śa','va','ya','a'], 650);
};

/* sutra reading: play phrase + flash its phonemes */
const SUTRA_SEQ = {
  sutra: ['sa','u','a','i','ta','a','nja','ma','ā','ta','ma','ā'],
  hrdaye: ['ha','ṛ','da','ya','e'],
  namah: ['a','u','aṃ','na','ma','aḥ','śa','i','va','ā','ya','a']
};
/* map render-only tokens to node ids */
function norm(id){ return byIast[id] ? id : ({nja:'ña'}[id] || null); }
document.querySelectorAll('[data-sutra]').forEach(b => b.onclick = () => {
  const k = b.dataset.sutra;
  playPhrase(k);
  const seq = SUTRA_SEQ[k].map(norm).filter(Boolean);
  light(seq, 450);
  const names = {sutra:'caitanyam ātmā — Consciousness is Self', hrdaye:'hṛdaye — in the Heart', namah:'oṃ namaḥ śivāya — earth → heart → everywhere'};
  info.querySelector('.dev').textContent = b.textContent.replace('▶ ','');
  info.querySelector('.iast').textContent = names[k];
  info.querySelector('.locus').textContent = 'Listen (EdgeSanskrit v1) · watch glyphs flash in order · feel the pathway. Tap any lit glyph to hold it.';
});
})();
