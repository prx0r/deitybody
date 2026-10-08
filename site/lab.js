/* Living subtle-body lab — Three.js, zero build. Same frozen maps + audio as homescreen. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { loadBody } from './engine/body.js';
import { Session } from './engine/session.js';
import { loadGraph } from './engine/graph.js';
import { makeTools } from './engine/agent.js';
import { buildLotus } from './engine/primitives/lotus.js';
import { buildSpokes } from './engine/primitives/spokes.js';
let BD=null; loadBody().then(b=>BD=b).catch(()=>{});
/* session owns the clock; exec renders; tools expose state to guide/agents */
const session=new Session();
let graph=null, tools=null;
function fxFlashRegion(regionId, ids){ (ids||[]).slice(0,6).forEach((id,k)=>{
  const n=P.findIndex(p=>p[0]===id); if(n>=0) setTimeout(()=>{show(P[n]); pop(n);},k*350); }); }
function bindTools(){ tools=makeTools({session, graph, fx:{flashRegion:fxFlashRegion}});
  window.deitybody.tools=tools; }
bindTools();
loadGraph().then(g=>{graph=g; bindTools();}).catch(()=>{});
session.render=(e)=>exec(e);
window.deitybody={session, tools:null, get graph(){return graph;}};
Object.defineProperty(window.deitybody,'tools',{get:()=>tools});
session.on((kind)=>{ if(kind==='pause'||kind==='stop'){ try{speechSynthesis.cancel();}catch(e){} } });
document.getElementById('ask').addEventListener('submit',ev=>{
  ev.preventDefault();
  const q=document.getElementById('askQ'); if(!q||!q.value.trim()) return;
  const a=tools?tools.answer(q.value):'Loading…';
  info.querySelector('.locus').textContent=a; speak(a);
  q.value='';
});
const SCORES={};
async function score(url){
  if(!SCORES[url]) SCORES[url]=await (await fetch(url)).json();
  return SCORES[url];
}
/* one player: every trajectory is a score of address-space events */
let guideOn=false;
function speak(t){
  if(!guideOn||!('speechSynthesis' in window)) return;
  try{ const u=new SpeechSynthesisUtterance(t); u.rate=.95; speechSynthesis.speak(u); }catch(e){}
}
function runScore(events, meta){
  session.loadPractice(meta||{id:'adhoc',title:'practice'}, events);
  try{ speechSynthesis.cancel(); }catch(e){}
  session.play();
}
function exec(e){
  if(e.cue){ info.querySelector('.locus').textContent=e.cue+(e.feel?` · feel: ${e.feel}`:''); speak(e.cue); }
  else if(e.feel){ info.querySelector('.locus').textContent=`feel: ${e.feel}`; }
  const Y=a=>BD?BD.regionY(a):({heart:.78,crown:3.3,dvadasanta:4.3,feet:-3.9}[a]??0);
  switch(e.do){
    case 'info':
      info.querySelector('.dev').textContent=e.dev||'';
      info.querySelector('.iast').textContent=e.iast||'';
      if(e.locus) info.querySelector('.locus').textContent=e.locus;
      break;
    case 'flash': {
      const k=P.findIndex(p=>p[0]===e.node); if(k<0) break;
      show(P[k]); pop(k); if(e.sound&&P[k][8]) play('audio/phonemes/'+P[k][8]);
      break; }
    case 'pulse': case 'sweep': {
      const y0=Y(e.from), y1=Y(e.to);
      pulse(y0,y1,e.dur||1.2,()=>ringPing(y1,e.color==='teal'?TEAL:GOLD));
      if(e.do==='sweep'&&BD){
        for(const r of [e.from,e.to]){
          (BD.regionNodes(r)||[]).slice(0,3).forEach((id,kk)=>{
            const k=P.findIndex(p=>p[0]===id); if(k>=0) setTimeout(()=>{show(P[k]); pop(k);},kk*300);
          });
        }
      }
      break; }
    case 'ring': ringPing(Y(e.at),TEAL); break;
    case 'breath': {
      const y0=Y(e.from), y1=Y(e.to);
      pulse(y0,y1,e.dur||4.0,()=>ringPing(y1,TEAL)); break; }
    case 'breath': {
      const y0=Y(e.from), y1=Y(e.to);
      if(e.cue) info.querySelector('.locus').textContent=e.cue;
      pulse(y0,y1,e.dur||4.0,()=>ringPing(y1,TEAL)); break; }
    case 'splat': {
      const k=P.findIndex(p=>p[0]===e.node); if(k<0) break;
      const [sx,sy]=locusScreen(k); fluidSplat(sx,sy,e.dx||0,e.dy||-24); break; }
    case 'audio': play(e.url); break;
    case 'mpfire': mpFire(e.id); break;
  }
}
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const GOLD=0xc9a45c, TEAL=0x5ec4b6, INK=0xf0ebe0, ROSE=0xd4899a;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- renderer / scene ---------- */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene = new THREE.Scene();
scene.fog = null;
const camera = new THREE.PerspectiveCamera(42, innerWidth/innerHeight, .1, 100);
camera.position.set(2.6, 1.1, 7.2);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.target.set(0,.4,0);
controls.minDistance = 3; controls.maxDistance = 16;

/* CSS2D label layer — real shaped Devanagari (browser HarfBuzz), always crisp */
const cssRenderer = new CSS2DRenderer();
cssRenderer.setSize(innerWidth, innerHeight);
Object.assign(cssRenderer.domElement.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:2});
document.body.appendChild(cssRenderer.domElement);

/* bloom — the alive glow (auto-off on small screens) */
let composer=null, bloomOn=innerWidth>=640 && !reduce;
if(bloomOn){
  const rt=new THREE.WebGLRenderTarget(innerWidth,innerHeight,{samples:4,type:THREE.HalfFloatType});
  composer=new EffectComposer(renderer,rt);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.16,.4,.9);
  composer.addPass(bloom); composer.addPass(new OutputPass());
}

/* grid only — no dust, no backdrop. Space is the aesthetic. */

/* ---------- body shell (stylized lathe, NOT anatomy) ---------- */
const shellPts=[[.02,-4],[.35,-3.9],[.28,-3.2],[.42,-2.4],[.5,-2.2],[.42,-1.2],[.55,-.2],[.62,.4],[.55,1.0],[.7,1.25],[.28,1.6],[.3,1.9],[.62,2.3],[.62,2.9],[.3,3.2],[.02,3.3]]
  .map(p=>new THREE.Vector2(p[0],p[1]));
const gridMat=new THREE.LineBasicMaterial({color:GOLD,transparent:true,opacity:.2});
/* true mathematical grid: clean meridians + parallels, NO triangulation diagonals.
   (LatheGeometry wireframe draws quad diagonals — that was the blockiness.) */
{
  const grid=new THREE.Group();
  const M=24, P=26;
  for(let k=0;k<M;k++){
    const a=k/M*Math.PI*2;
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(
      shellPts.map(p=>new THREE.Vector3(Math.cos(a)*p.x,p.y,Math.sin(a)*p.x))),gridMat));
  }
  const ys=[]; for(let k=0;k<P;k++) ys.push(-3.9+(3.25+3.9)*k/(P-1));
  const prof=[...shellPts].sort((a,b)=>a.y-b.y);
  const radiusAt=y=>{
    for(let k=0;k<prof.length-1;k++){
      const a=prof[k],b=prof[k+1];
      if(y>=a.y&&y<=b.y){const t=(y-a.y)/Math.max(1e-6,b.y-a.y); return a.x+(b.x-a.x)*t;}
    }
    return 0.02;
  };
  for(const y of ys){
    const r=radiusAt(y), pts=[];
    for(let k=0;k<=48;k++){const a=k/48*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));}
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gridMat));
  }
  window.__grid=grid; scene.add(grid);
}
const shellWire={material:gridMat};
/* arms: single clean lines, not capsules */
const armMat=new THREE.LineBasicMaterial({color:GOLD,transparent:true,opacity:.16});
[[-1,1],[1,1]].forEach(([s])=>{
  const g=new THREE.BufferGeometry().setFromPoints(
    [new THREE.Vector3(s*.62,1.2,0), new THREE.Vector3(s*1.15,-.35,0)]);
  scene.add(new THREE.Line(g,armMat));
});
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
/* ---------- yantra overlay: measurable geometry (PEDAGOGICAL) ---------- */
const yantra=new THREE.Group(); yantra.visible=false; scene.add(yantra);
{
  const line=(pts,color,op=.8)=>{const g=new THREE.BufferGeometry().setFromPoints(pts);
    yantra.add(new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:op})));};
  const ring=(y,r,color)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,.008,6,72),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7})); m.position.y=y; m.rotation.x=Math.PI/2; yantra.add(m);};
  /* base square (earth) at feet */
  const s=.55,y=-3.9;
  line([new THREE.Vector3(-s,y,-s),new THREE.Vector3(s,y,-s),new THREE.Vector3(s,y,s),new THREE.Vector3(-s,y,s),new THREE.Vector3(-s,y,-s)],GOLD);
  /* heart star: fire triangle up + water triangle down */
  const hy=.78,r=.5;
  line([new THREE.Vector3(0,hy+r*.9,0),new THREE.Vector3(-r,hy-r*.6,0),new THREE.Vector3(r,hy-r*.6,0),new THREE.Vector3(0,hy+r*.9,0)],GOLD);
  line([new THREE.Vector3(0,hy-r*.9,0),new THREE.Vector3(-r,hy+r*.6,0),new THREE.Vector3(r,hy+r*.6,0),new THREE.Vector3(0,hy-r*.9,0)],TEAL);
  /* crown circle + bindu */
  ring(3.3,.3,GOLD);
  const bindu=new THREE.Mesh(new THREE.SphereGeometry(.035,12,10),new THREE.MeshBasicMaterial({color:0xffe9b0}));
  bindu.position.set(0,3.3,0); yantra.add(bindu);
  /* 5 kalā divisions, feet→head */
  [['nivṛtti',-3.2],['pratiṣṭhā',-1.7],['vidyā',-.2],['śāntā',1.5],['śāntātītā',3.1]].forEach(([n,yy])=>{
    line([new THREE.Vector3(-.85,yy,0),new THREE.Vector3(.85,yy,0)],TEAL,.45);
    const d=document.createElement('div'); d.className='klabel'; d.textContent=n;
    const o=new CSS2DObject(d); o.position.set(1.05,yy,0); yantra.add(o);
  });
  /* dvādaśānta 12-unit measure above crown */
  for(let k=1;k<=12;k++){const yy=3.3+k*.083;
    line([new THREE.Vector3(-.12,yy,0),new THREE.Vector3(.12,yy,0)],TEAL,.5);}
}
/* (yantra visibility is toggled from the rail → toggleYan) */
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
function glyphChip(dev, iast){
  const el=document.createElement('div');
  el.className='glyph'; el.textContent=dev;
  el.setAttribute('role','button'); el.setAttribute('tabindex','0');
  el.setAttribute('aria-label','phoneme '+iast);
  const o=new CSS2DObject(el);
  el.style.pointerEvents='auto';
  return {o, el};
}
/* pulse glow texture (kept: travelling pulses need a soft head) */
let _glowTex=null;
const nodes=P.map(p=>{
  const m=M(p);
  const anchor=new THREE.Object3D(); anchor.position.set(m.x,m.y,m.z); scene.add(anchor);
  const {o, el}=glyphChip(p[1],p[0]); anchor.add(o);
  el.addEventListener('click',ev=>{ev.stopPropagation(); fire(p[0]);});
  el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault(); fire(p[0]);}});
  return {anchor, el, p, base:.42, target:m};
});
const byIast={}; P.forEach((p,k)=>byIast[p[0]]=k);

/* ---------- ritual frameworks: overlays over ONE body ----------
   Trika phonemes are the embedded base layer. Other traditions load as
   data (site/frameworks/*) — same mesh, same pulse machinery. */
let fw='trika', MP=null;
const mpGroup=new THREE.Group(); mpGroup.visible=false; scene.add(mpGroup);
fetch('frameworks/hermetic/config.json').then(r=>r.json()).then(fw2=>{
  MP={data:fw2, orbs:{}};
  fw2.centers.forEach(c=>{
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:c.color,transparent:true,opacity:.5,depthWrite:false}));
    halo.scale.set(.9,.9,1); halo.position.set(c.x3,c.y3,c.z3); mpGroup.add(halo);
    const el=document.createElement('div'); el.className='seph';
    el.innerHTML=`<span class="hb" style="border-color:${c.color};color:${c.color}">${c.hebrew}</span>`
      +`<span class="nm">${c.name}</span><span class="gd">${c.godname}</span>`;
    el.setAttribute('role','button'); el.setAttribute('tabindex','0');
    el.setAttribute('aria-label',c.name+' — '+c.meaning);
    el.style.pointerEvents='auto';
    el.addEventListener('click',ev=>{ev.stopPropagation(); mpFire(c.id);});
    const o=new CSS2DObject(el); o.position.set(c.x3,c.y3,c.z3); mpGroup.add(o);
    MP.orbs[c.id]={c,halo,el};
  });
  document.getElementById('rPillar').style.display='';
}).catch(()=>{/* offline/file mode: Trika only */});
/* ---------- layayoga lotus layer (procedural, per-text config) ---------- */
let lotus=null, lotusCfg=null;
fetch('frameworks/layayoga/config/anahata.json').then(r=>r.json()).then(c=>{
  lotusCfg=c; document.getElementById('rLotus').style.display='';
}).catch(()=>{});
function petalShow(p, el){
  const clip = p.phoneme ? 'audio/phonemes/'+({
    'ka':'ka.ogg','kha':'kha.ogg','ga':'ga.ogg','gha':'gha.ogg','ṅa':'na_k.ogg',
    'ca':'ca.ogg','cha':'cha.ogg','ja':'ja.ogg','jha':'jha.ogg','ña':'na_j.ogg',
    'ṭa':'ta1.ogg','ṭha':'tha1.ogg'}[p.phoneme]) : null;  info.querySelector('.dev').textContent = p.bija || p.dev || '';
  info.querySelector('.iast').textContent =
    (p.core ? 'anahata bīja · air · touch' : `anahata petal · ${p.bija}`) +
    (lotusCfg ? ` · ${lotusCfg.provenance.status}` : '');
  info.querySelector('.locus').textContent =
    (p.core ? 'Heart-seat of the lotus. ' : 'Petal syllable as attention-seat. ') +
    'Source: ' + (lotusCfg?.provenance.text || '') + ' — verify Sanskrit before teaching.';
  el.classList.add('lit'); setTimeout(()=>el.classList.remove('lit'), 900);
  if(clip) play(clip); else if(p.core) play('audio/phonemes/ya.ogg');
  const [sx, sy] = [innerWidth/2, innerHeight*0.45];
  fluidSplat(sx, sy, (Math.random()-.5)*30, -20);
}
/* ---------- kalachakra spoke layer (channel counts, educational model) ---------- */
let kalSpokes=null, kalCfg=null;
fetch('frameworks/vajrayana/config/kalachakra.json').then(r=>r.json()).then(c=>{
  kalCfg=c; document.getElementById('rKal').style.display='';
}).catch(()=>{});
function kalConverge(){
  if(!kalSpokes) return;
  info.querySelector('.dev').textContent='❖';
  info.querySelector('.iast').textContent='convergence into the heart centre';
  info.querySelector('.locus').textContent='Winds gather toward the heart hub (educational gesture, not instruction).';
  pulse(-0.9, 0.78, 1.8, ()=>ringPing(0.78, GOLD));
  pulse(3.3, 0.78, 1.8);
}
function kalCentreShow(c, el){
  info.querySelector('.dev').textContent=c.name;
  info.querySelector('.iast').textContent=`${c.spokes} subsidiary channels · ${kalCfg.provenance.status}`;
  info.querySelector('.locus').textContent=
    'Kālacakra completion-stage structure (public teaching level only). ' +
    'Counts per Tsenshap Serkong Rinpoche via Study Buddhism — never lineage instruction.';
  el.classList.add('lit'); setTimeout(()=>el.classList.remove('lit'),900);
  pulse(c.y3-0.5, c.y3+0.5, 0.8, ()=>ringPing(c.y3, TEAL));
}
function setFw(f){
  fw=f;
  const trika=f==='trika', mp=f==='mp', lay=f==='layayoga', kal=f==='kalachakra';
  nodes.forEach(n=>{n.anchor.visible=trika;});
  mpGroup.visible=mp;
  if(lotus) lotus.group.visible=lay;
  if(kalSpokes) kalSpokes.group.visible=kal;
  if(kal && !kalSpokes && kalCfg){
    kalSpokes=buildSpokes(kalCfg,{scene, onCentre:kalCentreShow});
  }
  if(lay && !lotus && lotusCfg){
    lotus=buildLotus(lotusCfg,{scene, playPhoneme:null, onPetal:petalShow});
    lotus.group.position.set(0, 0.78, 0.55);
    lotus.group.rotation.x=-0.12;
    let k=0; const bloomIn=setInterval(()=>{k+=0.06; lotus.setOpen(Math.min(1,k)); if(k>=1)clearInterval(bloomIn);},60);
  }
  markRail();
  document.getElementById('bHa').style.display=trika?'':'none';
  document.querySelectorAll('[data-s]').forEach(b=>b.style.display=trika?'':'none');
  document.getElementById('bOm').textContent=trika?'▶ OM':'▶ Descent';
  document.getElementById('bNam').textContent=trika?'▶ Namaḥ Śivāya':'▶ Circulation';
}
/* (framework switching lives on the rail → rPillar panel) */
function lotusBloom(){
  if(!lotus) return;
  info.querySelector('.dev').textContent='पद्म';
  info.querySelector('.iast').textContent='anahata unfolding · 12 petals';
  info.querySelector('.locus').textContent='Attention rests petal by petal, then in the bindu. (needs_verification)';
  pulse(0.3, 1.3, 1.6, ()=>ringPing(0.78, GOLD));
  let k=0; const t=setInterval(()=>{ k+=0.08; lotus.setOpen(0.4+0.6*Math.abs(Math.sin(k))); if(k>6.3){clearInterval(t); lotus.setOpen(1);} },90);
}
function mpFire(id){
  if(!MP) return; const {c,halo,el}=MP.orbs[id];
  info.querySelector('.dev').textContent=c.hebrew;
  info.querySelector('.iast').textContent=c.name+' · '+c.meaning;
  info.querySelector('.locus').textContent='Middle Pillar · vibrate '+c.godname;
  el.classList.add('lit'); setTimeout(()=>el.classList.remove('lit'),900);
  const s0=.9;
  tweens.push({t:0,dur:.6,fn:k=>{const s=s0*(1+.8*Math.sin(Math.PI*k)); halo.scale.set(s,s,1);}});
  pulse(Math.max(c.y3-.4,channelY0),Math.min(c.y3+.9,channelY1),.55,()=>ringPing(Math.min(c.y3+.9,channelY1),TEAL));
}
function mpRun(trajId){
  score('frameworks/hermetic/middle-pillar.json').then(j=>runScore(j.trajectories[trajId],{id:j.id,title:j.title,source:'Regardie Middle Pillar'}));
}
let actx=null, analyser=null, _fq=null; const bufCache={};
async function audioBuf(url){
  if(bufCache[url]) return bufCache[url];
  if(!actx){ actx=new (window.AudioContext||window.webkitAudioContext)();
    analyser=actx.createAnalyser(); analyser.fftSize=256;
    _fq=new Uint8Array(analyser.frequencyBinCount); analyser.connect(actx.destination); }
  const r=await fetch(url), b=await r.arrayBuffer();
  return bufCache[url]=await actx.decodeAudioData(b);
}
function audioEnergy(){
  if(!analyser) return .5;
  analyser.getByteFrequencyData(_fq);
  let s=0; for(let k=0;k<_fq.length;k++) s+=_fq[k];
  return Math.min(1, s/_fq.length/110);
}
async function play(url){
  try{ const b=await audioBuf(url);
    const s=actx.createBufferSource(); s.buffer=b; s.connect(analyser); s.start();
  }catch(e){}
}

/* ---------- fluid prāṇa-field (Navier-Stokes dye behind the body) ---------- */
let fluidOn = innerWidth>=640 && !reduce, fluidOK=false;
const fluidCanvas=document.getElementById('fluid');
const _pv=new THREE.Vector3();
function locusScreen(k){
  _pv.copy(nodes[k].anchor.position).project(camera);
  return [(_pv.x*.5+.5)*innerWidth, (-_pv.y*.5+.5)*innerHeight];
}
function fluidSplat(x,y,dx,dy){
  if(!fluidOK||!fluidOn) return;
  const o={bubbles:true,cancelable:true,clientX:x,clientY:y};
  fluidCanvas.dispatchEvent(new MouseEvent('mousedown',o));
  for(let k=1;k<=3;k++) fluidCanvas.dispatchEvent(new MouseEvent('mousemove',
    {...o,clientX:x+dx*k/3,clientY:y+dy*k/3}));
  fluidCanvas.dispatchEvent(new MouseEvent('mouseup',o));
}
if(fluidOn){
  import('./vendor/fluid/webgl-fluid.mjs').then(m=>{
    m.default(fluidCanvas,{TRIGGER:'hover',IMMEDIATE:false,AUTO:false,
      SIM_RESOLUTION:128,DYE_RESOLUTION:512,CAPTURE_RESOLUTION:256,
      DENSITY_DISSIPATION:.985,VELOCITY_DISSIPATION:.25,
      PRESSURE:.8,PRESSURE_ITERATIONS:18,CURL:28,
      SPLAT_RADIUS:.3,SPLAT_FORCE:5200,
      COLORFUL:false,SPLAT_COLOR:{r:.79,g:.64,b:.36},
      SHADING:true,BLOOM:true,BLOOM_INTENSITY:.5,BLOOM_THRESHOLD:.55,SUNRAYS:false,
      BACK_COLOR:{r:.043,g:.05,b:.07},TRANSPARENT:false,PAUSED:false});
    fluidOK=true;
    setTimeout(()=>{fluidSplat(innerWidth/2,innerHeight*.42,0,-50);
      setTimeout(()=>fluidSplat(innerWidth/2,innerHeight*.6,0,40),700);},900);
  }).catch(()=>{fluidCanvas.style.display='none';});
} else fluidCanvas.style.display='none';
document.getElementById('rFluid').onclick=e=>{
  fluidOn=!fluidOn; fluidCanvas.style.display=fluidOn?'':'none';
  e.target.classList.toggle('on',fluidOn);
};
if(fluidOn) document.getElementById('rFluid').classList.add('on');

/* ---------- fx: tweens + pulses ---------- */
const tweens=[];
function pop(k,big=1.6,dur=.5){
  const n=nodes[k]; if(!n) return;
  n.el.classList.remove('lit'); void n.el.offsetWidth; n.el.classList.add('lit');
  clearTimeout(n._lt); n._lt=setTimeout(()=>n.el.classList.remove('lit'), 1100);
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
function glowTex(){
  if(_glowTex) return _glowTex;
  const c=document.createElement('canvas'); c.width=c.height=128;
  const x=c.getContext('2d'),g=x.createRadialGradient(64,64,2,64,64,64);
  g.addColorStop(0,'rgba(255,233,176,1)'); g.addColorStop(1,'rgba(255,233,176,0)');
  x.fillStyle=g; x.fillRect(0,0,128,128);
  return _glowTex=new THREE.CanvasTexture(c);
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
  const p=P[k], n=nodes[k];
  show(p); pop(k);
  const y=n.anchor.position.y;
  pulse(Math.max(y-.4,channelY0),Math.min(y+.9,channelY1),.55,()=>ringPing(Math.min(y+.9,channelY1),TEAL));
  if(withSound&&p[8]) play('audio/phonemes/'+p[8]);
  const [sx,sy]=locusScreen(k), e=audioEnergy();
  fluidSplat(sx,sy,(Math.random()-.5)*24,-(14+46*e));
}
/* taps land on the DOM chips themselves — no raycast needed; canvas keeps drag/zoom */
/* ---------- left rail + panel: frameworks, Trika first ---------- */
const panel=document.getElementById('fpanel');
const PANELS={
  trika:{t:'☸ Trika',d:'Mātṛkā base install, Mālinī infusion after automatic. One map per sitting.',
    opts:[['Mātṛkā · base',()=>setCfg('matrika')],['Mālinī · infusion',()=>setCfg('malini')],
      ['VBT 24 · heart↔12 gaze',()=>score('frameworks/vbt/practices/v24-gaze.json').then(j=>runScore(j.events,{id:j.id,title:j.title,source:'VBT dh.24 locus+structure; cues our own'}))],
      ['Guide voice: off',e=>{guideOn=!guideOn; e.target.textContent=`Guide voice: ${guideOn?'on':'off'}`;}]]},
  pillar:{t:'☩ Middle Pillar',d:'Hermetic descent + circulation over the same body. Separate layer — never mixed with nyāsa.',
    opts:[['Enter Pillar',()=>setFw('mp')],['Back to Trika',()=>setFw('trika')]]},
  layayoga:{t:'🪷 Anahata lotus',d:'12-petal procedural lotus at the heart (needs_verification vs Śaṭcakranirūpaṇa). Tap petals for bīja + source.',
    opts:[['Enter lotus',()=>setFw('layayoga')],['Back to Trika',()=>setFw('trika')]]},
  kalachakra:{t:'❖ Kālacakra centres',d:'Six centres with attested subsidiary-channel counts (educational model; initiation contexts never replaced).',
    opts:[['Enter centres',()=>setFw('kalachakra')],['Back to Trika',()=>setFw('trika')]]},
  scan:{t:'◉ Body scan',d:'Crown→feet→crown sweep. Rest attention where the band glows, natural breath.',
    opts:[['Start / stop',()=>toggleScan()]]},
  yantra:{t:'△ Yantra',d:'Measurable geometry: square, star, kalā rulings, 12-tick dvādaśānta. (PEDAGOGICAL)',
    opts:[['Show / hide',()=>toggleYan()]]},
};
function openPanel(k){
  const p=PANELS[k]; if(!p) return;
  panel.querySelector('h4').textContent=p.t;
  panel.querySelector('p').textContent=p.d;
  const row=panel.querySelector('.row'); row.innerHTML='';
  p.opts.forEach(([label,fn])=>{const b=document.createElement('button'); b.textContent=label;
    b.onclick=(ev)=>{fn(ev); markRail();}; row.appendChild(b);});
  panel.classList.add('show');
  ['rTrika','rPillar','rLotus','rKal','rScan','rYan','rX'].forEach(id=>{const b=document.getElementById(id); if(b)b.classList.remove('on');});
  ({trika:'rTrika',pillar:'rPillar',layayoga:'rLotus',kalachakra:'rKal',scan:'rScan',yantra:'rYan'}[k]||'') &&
    document.getElementById({trika:'rTrika',pillar:'rPillar',layayoga:'rLotus',kalachakra:'rKal',scan:'rScan',yantra:'rYan'}[k]).classList.add('on');
}
function markRail(){
  document.getElementById('rTrika').classList.toggle('on',fw==='trika');
  const rp=document.getElementById('rPillar'); if(rp)rp.classList.toggle('on',fw==='mp');
  const rl=document.getElementById('rLotus'); if(rl)rl.classList.toggle('on',fw==='layayoga');
  const rk=document.getElementById('rKal'); if(rk)rk.classList.toggle('on',fw==='kalachakra');
  document.getElementById('rScan').classList.toggle('on',!!scanMode);
  document.getElementById('rYan').classList.toggle('on',yantra.visible);
}
function setCfg(c){
  cfg=c;
  P.forEach((p,k)=>nodes[k].target=c==='matrika'?M(p):A(p));
}
function toggleScan(){
  if(scanMode){scanMode=null; scanBand.visible=false;}
  else{scanMode={y:4.5,dir:-1}; scanBand.visible=true;
    info.querySelector('.dev').textContent='स्मृति';
    info.querySelector('.iast').textContent='body scan — crown → feet → crown';
    info.querySelector('.locus').textContent='Rest attention where the band glows. Breathe naturally (TĀ 4.91).';}
  markRail();
}
function toggleYan(){ yantra.visible=!yantra.visible; markRail(); }
function toggleX(){
  xray=!xray; gridMat.opacity=xray?.04:.2;
  document.getElementById('rX').classList.toggle('on',xray);
}
document.getElementById('rTrika').onclick=()=>{setFw('trika'); openPanel('trika');};
document.getElementById('rPillar').onclick=()=>openPanel('pillar');
document.getElementById('rLotus').onclick=()=>openPanel('layayoga');
document.getElementById('rKal').onclick=()=>openPanel('kalachakra');
document.getElementById('rScan').onclick=()=>{toggleScan(); openPanel('scan');};
document.getElementById('rYan').onclick=()=>{toggleYan(); openPanel('yantra');};
document.getElementById('rX').onclick=()=>toggleX();
/* (x-ray handler lives with the scan block below) */
document.getElementById('bOm').onclick=async ()=>{
  if(fw==='mp'){ if(MP)mpRun('descent'); return; }
  if(fw==='layayoga'){ lotusBloom(); return; }
  if(fw==='kalachakra'){ kalConverge(); return; }
  score('frameworks/trika/practices/om.json').then(j=>runScore(j.events,{id:j.id,title:j.title,source:j.provenance}));
};
document.getElementById('bNam').onclick=async ()=>{
  if(fw==='mp'){ if(MP)mpRun('circulation'); return; }
  if(fw==='layayoga'){ lotusBloom(); return; }
  if(fw==='kalachakra'){ kalConverge(); return; }
  const j=await score('frameworks/trika/practices/namah-shivaya.json');
  runScore(j.variants[cfg],{id:j.id+'/'+cfg,title:j.title+' ('+cfg+')',source:j.provenance});
};
document.getElementById('bHa').onclick=()=>{
  show(['ha','ह','prāṇa — full-channel flash','',0,'','',0,'ha.ogg']);
  play('audio/phonemes/ha.ogg'); pop(byIast['ha'],2.2);
  fluidSplat(innerWidth/2,innerHeight*.45,0,-90);
  for(let k=0;k<4;k++) setTimeout(()=>fluidSplat(
    innerWidth*(.3+Math.random()*.4),innerHeight*(.3+Math.random()*.3),
    (Math.random()-.5)*60,(Math.random()-.5)*60),k*160);
  pulse(channelY0,3.3,.9,()=>{ CAKRAS.forEach(([n,y],k)=>setTimeout(()=>ringPing(y),k*120)); });
};
const SEQ={sutra:['sa','u','a','i','ta','a','ña','ma','ā','ta','ma','ā'],
 hrdaye:['ha','ṛ','da','ya','e']};
const WAV={sutra:'audio/edge_test_sutra.wav',hrdaye:'audio/edge_test_hrdaye.wav'};
document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
  const key=b.dataset.s;
  const evs=[{t:0,do:'audio',url:WAV[key]},
    {t:.05,do:'info',dev:b.textContent.replace('▶ ',''),
      iast:key==='sutra'?'caitanyam ātmā — Consciousness is Self':'hṛdaye — in the Heart'}];
  SEQ[key].forEach((id,kk)=>{const n=P.findIndex(p=>p[0]===id); if(n>=0){
    evs.push({t:.15+kk*.45,do:'flash',node:id});
    evs.push({t:.15+kk*.45,do:'splat',node:id,dy:-26});}});
  runScore(evs,{id:'sutra-'+k,title:b.textContent.replace('▶ ',''),source:'EdgeSanskrit phrase + Mātṛkā loci'});
});

/* ---------- vipassana-style scan (driven from the rail → toggleScan) ---------- */
let scanMode=null;
const scanBand=new THREE.Mesh(new THREE.TorusGeometry(.72,.03,8,48),
  new THREE.MeshBasicMaterial({color:TEAL,transparent:true,opacity:.55}));
scanBand.rotation.x=Math.PI/2; scanBand.visible=false; scene.add(scanBand);

/* ---------- loop ---------- */
const clock=new THREE.Clock();
let frame=0;
const _hv=new THREE.Vector3();
const _cam=new THREE.Vector3(), _nd=new THREE.Vector3(), _ct=new THREE.Vector3(0,.4,0);
let xray=false;
/* (x-ray toggled from the rail → toggleX) */
function tick(){
  requestAnimationFrame(tick);
  const dt=Math.min(clock.getDelta(),.05), t=clock.elapsedTime;
  frame++;
  controls.update();
  if(!reduce){
    scan.position.y=-3.4+((t*.5)%7.2); scan.material.opacity=.3+.2*Math.sin(t*2);
    shellWire.material.opacity=(xray?.04:.2)+.02*Math.sin(t*1.3);
    ida.rotation.y+=dt*.05; ping.rotation.y-=dt*.05;
    rings.forEach((r,k)=>r.material.opacity=.32+.12*Math.sin(t*1.5+k));
  }
  for(let i=tweens.length-1;i>=0;i--){const tw=tweens[i]; tw.t+=dt;
    const k=Math.min(1,tw.t/tw.dur); tw.fn(k); if(k>=1){tweens.splice(i,1); tw.done&&tw.done();}}
  for(let i=pulses.length-1;i>=0;i--){const pu=pulses[i]; pu.t+=dt;
    const k=Math.min(1,pu.t/pu.dur); pu.m.position.y=pu.y0+(pu.y1-pu.y0)*k;
    if(fluidOK&&fluidOn&&frame%7===0&&k<1){
      _hv.copy(pu.m.position).project(camera);
      fluidSplat((_hv.x*.5+.5)*innerWidth,(-_hv.y*.5+.5)*innerHeight,0,pu.y1>pu.y0?-22:22);
    }
    if(k>=1){scene.remove(pu.m); pulses.splice(i,1); pu.cb&&pu.cb();}}
  nodes.forEach(n=>{const tg=n.target, a=n.anchor;
    a.position.x+=(tg.x-a.position.x)*Math.min(1,dt*4);
    a.position.y+=(tg.y-a.position.y)*Math.min(1,dt*4);
    a.position.z+=(tg.z-a.position.z)*Math.min(1,dt*4);
    /* depth cue: nodes on the far side dim (unless x-ray) */
    if(!xray){
      _nd.copy(a.position).sub(_ct); _cam.copy(camera.position).sub(_ct);
      const front=_nd.dot(_cam)>0;
      n.el.classList.toggle('back',!front);
    } else n.el.classList.remove('back');
  });
  /* scan sweep */
  if(scanMode&&!reduce){
    const s=scanMode; s.y+=s.dir*dt*.55;
    if(s.y<-4.4){s.y=-4.4; s.dir=1;} if(s.y>4.5){s.y=4.5; s.dir=-1;}
    scanBand.position.y=s.y;
    if(fluidOK&&fluidOn&&frame%40===0){
      _hv.set(0,s.y,0).project(camera);
      fluidSplat((_hv.x*.5+.5)*innerWidth,(-_hv.y*.5+.5)*innerHeight,(Math.random()-.5)*30,0);
    }
    const sc=1+Math.sin(t*1.2)*.04; scanBand.scale.set(sc,sc,1);
    nodes.forEach((n,k)=>{ if(Math.abs(n.anchor.position.y-s.y)<.35 && !n.el.classList.contains('lit')) pop(k,1.35,.8); });
  }
  if(bloomOn) composer.render(); else renderer.render(scene,camera);
  cssRenderer.render(scene,camera);
  if(typeof kalSpokes!=='undefined'&&kalSpokes&&kalSpokes.group.visible&&!reduce) kalSpokes.spin(dt,0.06);
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight); cssRenderer.setSize(innerWidth,innerHeight);}
addEventListener('resize',resize); resize(); tick();
