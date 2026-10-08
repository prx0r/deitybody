/* Living subtle-body lab — Three.js, zero build. Same frozen maps + audio as homescreen. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';

const GOLD=0xc9a45c, TEAL=0x5ec4b6, INK=0xf0ebe0, ROSE=0xd4899a;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- renderer / scene ---------- */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b0d12, 0.055);
const camera = new THREE.PerspectiveCamera(42, innerWidth/innerHeight, .1, 100);
camera.position.set(2.6, 1.1, 7.2);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.target.set(0,.4,0);
controls.minDistance = 3; controls.maxDistance = 16;

/* dust */
{
  const n=350, pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){ pos[i*3]=(Math.random()-.5)*22; pos[i*3+1]=(Math.random()-.5)*14; pos[i*3+2]=(Math.random()-.5)*14; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({color:0x8a7a55,size:.035,transparent:true,opacity:.5})));
}
/* ground glow */
{
  const c=document.createElement('canvas'); c.width=c.height=256;
  const x=c.getContext('2d'), gr=x.createRadialGradient(128,128,4,128,128,128);
  gr.addColorStop(0,'rgba(201,164,92,.5)'); gr.addColorStop(1,'rgba(201,164,92,0)');
  x.fillStyle=gr; x.fillRect(0,0,256,256);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(9,9),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:.35,depthWrite:false}));
  m.rotation.x=-Math.PI/2; m.position.y=-4.4; scene.add(m);
}

/* ---------- body shell (stylized lathe, NOT anatomy) ---------- */
const shellPts=[[.02,-4],[.35,-3.9],[.28,-3.2],[.42,-2.4],[.5,-2.2],[.42,-1.2],[.55,-.2],[.62,.4],[.55,1.0],[.7,1.25],[.28,1.6],[.3,1.9],[.62,2.3],[.62,2.9],[.3,3.2],[.02,3.3]]
  .map(p=>new THREE.Vector2(p[0],p[1]));
const shellGeo=new THREE.LatheGeometry(shellPts,28);
const shellSolid=new THREE.Mesh(shellGeo,new THREE.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.05,depthWrite:false,side:THREE.DoubleSide}));
const shellWire=new THREE.Mesh(shellGeo,new THREE.MeshBasicMaterial({color:GOLD,wireframe:true,transparent:true,opacity:.13}));
scene.add(shellSolid,shellWire);
/* arms */
const armMat=new THREE.MeshBasicMaterial({color:GOLD,wireframe:true,transparent:true,opacity:.13});
[[-1,1],[1,1]].forEach(([s])=>{
  const a=new THREE.Mesh(new THREE.CapsuleGeometry(.16,1.6,4,10),armMat);
  a.position.set(s*.95,.35,0); a.rotation.z=s*.28; scene.add(a);
});
/* head aura ring */
{
  const r=new THREE.Mesh(new THREE.TorusGeometry(.78,.012,8,64),new THREE.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.4}));
  r.position.set(0,2.6,0); scene.add(r);
}
/* suṣumṇā */
const channelY0=-3.9, channelY1=4.3;
{
  const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(
    [new THREE.Vector3(0,channelY0,0),new THREE.Vector3(0,channelY1,0)]),32,.02,8);
  scene.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.75})));
}
/* iḍā / piṅgalā helices */
function helix(phase,color,op){
  const pts=[]; for(let y=-3.4;y<=3.1;y+=.12) pts.push(new THREE.Vector3(Math.sin(y*2.1+phase)*.3,y,Math.cos(y*2.1+phase)*.18));
  const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),120,.008,6),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity:op}));
  scene.add(m); return m;
}
const ida=helix(0,TEAL,.3), ping=helix(Math.PI,ROSE,.3);
/* cakra rings (PEDAGOGICAL overlay) */
const CAKRAS=[['root',-3.2],['sacral',-2.3],['solar',-1.2],['heart',.78],['throat',1.6],['brow',2.75],['crown',3.3]];
const rings=CAKRAS.map(([n,y],k)=>{
  const m=new THREE.Mesh(new THREE.TorusGeometry(.34+k*.02,.015,8,48),
    new THREE.MeshBasicMaterial({color:k===3?GOLD:TEAL,transparent:true,opacity:.4}));
  m.position.set(0,y,0); m.rotation.x=Math.PI/2; m.userData.n=n; scene.add(m); return m;
});
/* dvādaśānta */
{
  const o=new THREE.Mesh(new THREE.OctahedronGeometry(.12),new THREE.MeshBasicMaterial({color:TEAL}));
  o.position.set(0,channelY1,0); scene.add(o);
  const lg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,3.35,0),new THREE.Vector3(0,channelY1,0)]);
  scene.add(new THREE.Line(lg,new THREE.LineDashedMaterial({color:TEAL,dashSize:.08,gapSize:.06,transparent:true,opacity:.6})));
}
/* scan ring — the alive sweep */
const scan=new THREE.Mesh(new THREE.TorusGeometry(.62,.014,8,48),
  new THREE.MeshBasicMaterial({color:TEAL,transparent:true,opacity:.5}));
scan.rotation.x=Math.PI/2; scene.add(scan);

/* ---------- phoneme nodes ---------- */
/* [iast, dev, mLocus, mx,my, aLocus, ax,ay, clip] */
const P=[
['a','अ','forehead',200,92,'speech',200,190,'a.ogg'],
['ā','आ','mouth',200,158,'milk / amṛta',200,300,'aa.ogg'],
['i','इ','right eye',181,118,'tongue',200,170,'i.ogg'],
['ī','ई','left eye',219,118,'nose',200,140,'ii.ogg'],
['u','उ','right ear',156,128,'right ear',156,128,'u.ogg'],
['ū','ऊ','left ear',244,128,'left ear',244,128,'uu.ogg'],
['ṛ','ऋ','right nostril',191,140,'headband',170,78,'r.ogg'],
['ṝ','ॠ','left nostril',209,140,'headband',230,78,'rr.ogg'],
['ḷ','ऌ','right cheek',172,150,'headband',190,78,null],
['ḹ','ॡ','left cheek',228,150,'headband',210,78,null],
['e','ए','lower teeth',186,166,'right knee',170,570,'e.ogg'],
['ai','ऐ','upper teeth',214,162,'left knee',230,570,'ai.ogg'],
['o','ओ','lower lip',188,178,'right shank',170,630,'o.ogg'],
['au','औ','upper lip',212,178,'left shank',230,630,'au.ogg'],
['aṃ','अं','crown',200,62,'right thigh',172,510,'anusvara.ogg'],
['aḥ','अः','tongue',200,170,'general prāṇa',200,350,'visarga.ogg'],
['ka','क','right shoulder',140,250,'teeth',182,162,'ka.ogg'],
['kha','ख','right arm',120,300,'teeth',194,162,'kha.ogg'],
['ga','ग','right hand',105,350,'teeth',206,162,'ga.ogg'],
['gha','घ','right fingers',100,380,'teeth',218,162,'gha.ogg'],
['ṅa','ङ','right nails',100,402,'teeth',200,150,null],
['ca','च','left shoulder',260,250,'right eye',181,118,'ca.ogg'],
['cha','छ','left arm',280,300,'right chest',175,310,'cha.ogg'],
['ja','ज','left hand',295,350,'trident prongs',170,40,'ja.ogg'],
['jha','झ','left fingers',300,380,'right fingers',120,380,'jha.ogg'],
['ña','ञ','left nails',300,402,'left fingers',280,380,'na_j.ogg'],
['ṭa','ट','right hip',175,450,'skull',200,40,'ta1.ogg'],
['ṭha','ठ','right thigh',172,510,'hands',200,365,'tha1.ogg'],
['ḍa','ड','right knee',170,570,'right arm',120,300,'da1.ogg'],
['ḍha','ढ','right shank',170,630,'left arm',280,300,'dha1.ogg'],
['ṇa','ण','right toes',168,690,'ears',200,128,'na_k.ogg'],
['ta','त','left hip',225,450,'left thigh',228,510,'ta.ogg'],
['tha','थ','left thigh',228,510,'top of head',200,70,'tha.ogg'],
['da','द','left knee',230,570,'right foot',168,690,'da.ogg'],
['dha','ध','left shank',230,630,'left eye',219,118,'dha.ogg'],
['na','न','left toes',232,690,'crown-flame śikhā',200,48,'na.ogg'],
['pa','प','right side',165,355,'heart',200,330,'pa.ogg'],
['pha','फ','left side',235,355,'left foot',232,690,'pha.ogg'],
['ba','ब','back',218,372,'mouth',200,168,'ba.ogg'],
['bha','भ','belly',182,400,'right shoulder',140,250,'bha.ogg'],
['ma','म','heart',200,330,'buttocks / hips',200,450,'ma.ogg'],
['ya','य','skin',184,345,'left shoulder',260,250,'ya.ogg'],
['ra','र','blood',216,360,'trident shaft',200,40,'ra.ogg'],
['la','ल','flesh',184,375,'left chest',225,310,'la.ogg'],
['va','व','sinews',216,390,'throat',200,230,'va.ogg'],
['śa','श','bone',184,405,'guhya',200,470,'sha.ogg'],
['ṣa','ष','marrow',216,420,'belly',200,400,'shha.ogg'],
['sa','स','essence',184,435,'jīva / Self',200,330,'sa.ogg'],
['ha','ह','prāṇa',216,450,'particular prāṇa',200,365,'ha.ogg'],
['kṣa','क्ष','generative',200,468,'navel',200,390,null]];
function zFor(locus){
  if(/eye|ear|nostril|cheek|mouth|teeth|lip|tongue|nose|forehead|crown|head|face/.test(locus)) return .55;
  if(/side|chest|heart|skin|throat|speech/.test(locus)) return .45;
  if(/shoulder|arm|hand|finger|nail/.test(locus)) return .18;
  if(/back/.test(locus)) return -.4;
  return 0;
}
const M=p=>({x:(p[3]-200)/90, y:(400-p[4])/90, z:zFor(p[2])});
const A=p=>({x:(p[6]-200)/90, y:(400-p[7])/90, z:zFor(p[5])});
let cfg='matrika';
function glyphSprite(dev){
  const c=document.createElement('canvas'); c.width=c.height=128;
  const x=c.getContext('2d');
  const g=x.createRadialGradient(64,52,6,64,64,62);
  g.addColorStop(0,'#2b3550'); g.addColorStop(1,'#141a29');
  x.fillStyle=g; x.beginPath(); x.arc(64,64,58,0,7); x.fill();
  x.strokeStyle='#c9a45c'; x.lineWidth=3; x.beginPath(); x.arc(64,64,58,0,7); x.stroke();
  x.fillStyle='#f0ebe0'; x.font='600 56px "Noto Sans Devanagari", serif';
  x.textAlign='center'; x.textBaseline='middle'; x.fillText(dev,64,68);
  const t=new THREE.CanvasTexture(c); t.anisotropy=4;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
  s.scale.set(.5,.5,1); return s;
}
const nodes=P.map(p=>{
  const s=glyphSprite(p[1]); const m=M(p);
  s.position.set(m.x,m.y,m.z); s.userData={p,base:1,target:m};
  scene.add(s); return s;
});
const byIast={}; P.forEach((p,k)=>byIast[p[0]]=nodes[k]);

/* ---------- audio ---------- */
let actx=null; const bufCache={};
async function audioBuf(url){
  if(bufCache[url]) return bufCache[url];
  if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
  const r=await fetch(url), b=await r.arrayBuffer();
  return bufCache[url]=await actx.decodeAudioData(b);
}
async function play(url){
  try{ const b=await audioBuf(url);
    const s=actx.createBufferSource(); s.buffer=b; s.connect(actx.destination); s.start();
  }catch(e){}
}

/* ---------- fx: tweens + pulses ---------- */
const tweens=[];
function pop(sprite,big=1.5,dur=.5){
  const s0=sprite.scale.x;
  tweens.push({t:0,dur,fn:k=>{const s=s0*(1+(big-1)*Math.sin(Math.PI*k)); sprite.scale.set(s,s,1);}});
}
const pulses=[];
const pulseMat=new THREE.MeshBasicMaterial({color:0xffe9b0,transparent:true,opacity:.95});
function pulse(y0,y1,dur=.9,cb){
  const m=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),pulseMat.clone());
  m.position.set(0,y0,.1); scene.add(m);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),transparent:true,opacity:.8,depthWrite:false}));
  glow.scale.set(.8,.8,1); m.add(glow);
  pulses.push({m,t:0,y0,y1,dur,cb});
}
let _glow=null;
function glowTex(){
  if(_glow) return _glow;
  const c=document.createElement('canvas'); c.width=c.height=128;
  const x=c.getContext('2d'),g=x.createRadialGradient(64,64,2,64,64,64);
  g.addColorStop(0,'rgba(255,233,176,1)'); g.addColorStop(1,'rgba(255,233,176,0)');
  x.fillStyle=g; x.fillRect(0,0,128,128);
  return _glow=new THREE.CanvasTexture(c);
}
function ringPing(y,color=GOLD){
  const r=new THREE.Mesh(new THREE.TorusGeometry(.4,.02,8,48),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));
  r.position.set(0,y,0); r.rotation.x=Math.PI/2; scene.add(r);
  tweens.push({t:0,dur:.9,fn:k=>{r.scale.setScalar(1+k*1.6); r.material.opacity=.9*(1-k);},done:()=>scene.remove(r)});
}

/* ---------- ui ---------- */
const info=document.getElementById('info');
function show(p){
  const loc=cfg==='matrika'?p[2]:p[5];
  const other=cfg==='matrika'?('Mālinī: '+p[5]):('Mātṛkā: '+p[2]);
  info.querySelector('.dev').textContent=p[1];
  info.querySelector('.iast').textContent=p[0]+' · '+loc;
  info.querySelector('.locus').textContent=(cfg==='matrika'?'Mātṛkā base':'Mālinī infusion')+' · '+other;
}
function fire(iast,withSound=true){
  const k=P.findIndex(p=>p[0]===iast); if(k<0) return;
  const p=P[k], s=nodes[k];
  show(p); pop(s);
  const y=s.position.y;
  pulse(Math.max(y-.4,channelY0),Math.min(y+.9,channelY1),.55,()=>ringPing(Math.min(y+.9,channelY1),TEAL));
  if(withSound&&p[8]) play('audio/phonemes/'+p[8]);
}
/* tap vs drag */
const ray=new THREE.Raycaster(), ptr=new THREE.Vector2(); let downXY=null;
canvas.addEventListener('pointerdown',e=>downXY=[e.clientX,e.clientY]);
canvas.addEventListener('pointerup',e=>{
  if(!downXY) return;
  const dx=e.clientX-downXY[0],dy=e.clientY-downXY[1]; downXY=null;
  if(dx*dx+dy*dy>36) return;
  ptr.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
  ray.setFromCamera(ptr,camera);
  const hit=ray.intersectObjects(nodes,false)[0];
  if(hit){ const i=nodes.indexOf(hit.object); fire(P[i][0]); }
});
document.getElementById('bMat').onclick=e=>{cfg='matrika';
  e.target.classList.add('on'); document.getElementById('bMal').classList.remove('on');
  P.forEach((p,k)=>nodes[k].userData.target=M(p));};
document.getElementById('bMal').onclick=e=>{cfg='malini';
  e.target.classList.add('on'); document.getElementById('bMat').classList.remove('on');
  P.forEach((p,k)=>nodes[k].userData.target=A(p));};
document.getElementById('bX').onclick=e=>{
  const on=shellSolid.material.opacity<.2;
  shellSolid.material.opacity=on?.28:.05; e.target.classList.toggle('on',on);
};
document.getElementById('bOm').onclick=()=>{
  show(['oṃ','ॐ','heart → crown → dvādaśānta → rain','',0,'','',0,null]);
  pulse(.78,channelY1,1.4,()=>{ringPing(channelY1,TEAL); pulse(channelY1,.78,1.2,()=>ringPing(.78));});
  ['ma','ha','aṃ','a'].forEach((id,k)=>setTimeout(()=>{const s=byIast[id]; if(s)pop(s);},k*450));
};
document.getElementById('bNam').onclick=()=>{
  const seq=cfg==='matrika'?['na','ma','aḥ','śa','i','va','ā','ya']:['na','ma','śa','va','ya'];
  pulse(-3.2,.78,1.2,()=>{ringPing(.78); seq.forEach((id,k)=>setTimeout(()=>fire(id,false),k*380));});
};
document.getElementById('bHa').onclick=()=>{
  show(['ha','ह','prāṇa — full-channel flash','',0,'','',0,'ha.ogg']);
  play('audio/phonemes/ha.ogg'); pop(byIast['ha'],2);
  pulse(channelY0,3.3,.9,()=>{ CAKRAS.forEach(([n,y],k)=>setTimeout(()=>ringPing(y),k*120)); });
  shellWire.material.opacity=.3; setTimeout(()=>shellWire.material.opacity=.13,1100);
};
const SEQ={sutra:['sa','u','a','i','ta','a','ña','ma','ā','ta','ma','ā'],
 hrdaye:['ha','ṛ','da','ya','e']};
const WAV={sutra:'audio/edge_test_sutra.wav',hrdaye:'audio/edge_test_hrdaye.wav'};
document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
  play(WAV[b.dataset.s]);
  SEQ[b.dataset.s].forEach((id,k)=>{const kk=P.findIndex(p=>p[0]===id); if(kk>=0)setTimeout(()=>{show(P[kk]); pop(nodes[kk]);},k*450);});
});

/* ---------- loop ---------- */
const clock=new THREE.Clock();
function tick(){
  requestAnimationFrame(tick);
  const dt=Math.min(clock.getDelta(),.05), t=clock.elapsedTime;
  controls.update();
  if(!reduce){
    scan.position.y=-3.4+((t*.5)%7.2); scan.material.opacity=.3+.2*Math.sin(t*2);
    shellWire.material.opacity=.11+.03*Math.sin(t*1.3);
    ida.rotation.y+=dt*.05; ping.rotation.y-=dt*.05;
    rings.forEach((r,k)=>r.material.opacity=.32+.12*Math.sin(t*1.5+k));
  }
  for(let i=tweens.length-1;i>=0;i--){const tw=tweens[i]; tw.t+=dt;
    const k=Math.min(1,tw.t/tw.dur); tw.fn(k); if(k>=1){tweens.splice(i,1); tw.done&&tw.done();}}
  for(let i=pulses.length-1;i>=0;i--){const pu=pulses[i]; pu.t+=dt;
    const k=Math.min(1,pu.t/pu.dur); pu.m.position.y=pu.y0+(pu.y1-pu.y0)*k;
    if(k>=1){scene.remove(pu.m); pulses.splice(i,1); pu.cb&&pu.cb();}}
  nodes.forEach(s=>{const tg=s.userData.target;
    s.position.x+=(tg.x-s.position.x)*Math.min(1,dt*4);
    s.position.y+=(tg.y-s.position.y)*Math.min(1,dt*4);
    s.position.z+=(tg.z-s.position.z)*Math.min(1,dt*4);});
  renderer.render(scene,camera);
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
addEventListener('resize',resize); resize(); tick();
