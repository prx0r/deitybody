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
import { buildVitruvian } from './engine/primitives/vitruvian.js';
import { buildVitruvianFigure } from './engine/primitives/vitruvian-figure.js';
import { buildAvatar } from './engine/primitives/avatar.js';
import { buildGridField } from './engine/primitives/grid-field.js';
import { renderChladni } from './engine/mxth/chladni.js';

/* ---------- Chladni plate: live wave geometry per phoneme ----------
   Mode↔class mapping is AESTHETIC (documented here + panel caption),
   never a textual claim. Audio energy drives time_rate/exposure. */
const CHLADNI_MODES={
  a:'ci-2-2',ā:'ci-2-2',i:'ci-3-2',ī:'ci-3-2',u:'ci-2-2',ū:'ci-2-2',
  'ṛ':'ci-5-1','ṝ':'ci-5-1','ḷ':'ci-6-2','ḹ':'ci-6-2',e:'ci-3-2',ai:'ci-3-2',
  o:'ci-3-2',au:'ci-3-2','aṃ':'ci-2-2','aḥ':'ci-2-2',
  ka:'sq-2-3',kha:'sq-2-3',ga:'sq-2-3',gha:'sq-2-3','ṅa':'sq-2-3',
  ca:'sq-3-4',cha:'sq-3-4',ja:'sq-3-4',jha:'sq-3-4','ña':'sq-3-4',
  'ṭa':'sq-4-5','ṭha':'sq-4-5','ḍa':'sq-4-5','ḍha':'sq-4-5','ṇa':'sq-4-5',
  ta:'sq-3-5',tha:'sq-3-5',da:'sq-3-5',dha:'sq-3-5',na:'sq-3-5',
  pa:'sq-5-8',pha:'sq-5-8',ba:'sq-5-8',bha:'sq-5-8',ma:'sq-5-8',
  ya:'ci-3-2',ra:'ci-3-2',la:'ci-3-2',va:'ci-3-2',
  'śa':'ci-5-1','ṣa':'ci-5-1',sa:'ci-5-1',ha:'ci-6-2','kṣa':'sq-4-7'};
let chladniOn=false;
const chladniGenome={trail:.93,sample:1,rotation:0,time_rate:1,zoom:1,
  node_sharpness:7,observable:'bands',contours:3,threshold:.12,gamma:1.25,
  exposure:1,point_size:1};
let chladniVariant='sq-3-5', chladniLabel='—';
const chCanvas=()=>document.getElementById('chladni');
function chladniSet(iast,dev){
  chladniVariant=CHLADNI_MODES[iast]||'sq-3-5';
  chladniLabel=`${dev||iast} · ${chladniVariant} (aesthetic mapping)`;
  const cap=document.getElementById('chladniCap'); if(cap)cap.textContent=chladniLabel;
}
function toggleChladni(){
  chladniOn=!chladniOn;
  document.getElementById('chladniBox').style.display=chladniOn?'':'none';
}
let BD=null; loadBody().then(b=>BD=b).catch(()=>{});
/* session owns the clock; exec renders; tools expose state to guide/agents */
const session=new Session();
let graph=null, tools=null;
function fxFlashRegion(regionId, ids){ (ids||[]).slice(0,6).forEach((id,k)=>{
  const n=P.findIndex(p=>p[0]===id); if(n>=0) setTimeout(()=>{show(P[n]); pop(n);},k*350); }); }
function bindTools(){ tools=makeTools({session, graph, fx:{flashRegion:fxFlashRegion}});
  if(window.deitybody) window.deitybody.tools=tools; }
window.deitybody={session, tools:null, get graph(){return graph;}, get camera(){return camera;}};
bindTools();
loadGraph().then(g=>{graph=g; bindTools();}).catch(()=>{});
session.render=(e)=>exec(e);
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
  droneStop();
  ensureAudio();
  const last=events.length?Math.max(...events.map(e=>e.t||0)):0;
  droneStart(last+2.5);
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
      const ny=nodes[k].anchor.position.y, st=styleForY(ny);
      ringPing(ny, st.color);
      shapeFlash(nodes[k].anchor.position.x, ny, nodes[k].anchor.position.z, e.shape||st.shape, e.color??st.color);
      playTone(toneForY(ny), toneDur(P[k][0], ny));
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
      breathSound(e.phase, e.dur||4.0);
      pulse(y0,y1,e.dur||4.0,()=>ringPing(y1,TEAL)); break; }
    case 'field': {
      pulse(-3.5,3.5,Math.min(4,(e.dur||8)/3),()=>ringPing(0.78,GOLD));
      for(let k=0;k<6;k++) setTimeout(()=>ringPing(-2+k*1.2, TEAL), k*450);
      fluidSplat(innerWidth/2, innerHeight*0.45, 0, -60);
      break; }
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
camera.position.set(2.2, 0.6, 12.6);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.target.set(0,.4,0);
controls.minDistance = 4; controls.maxDistance = 24;

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

/* ---------- constellation: no physical body. The phonemes ARE the geometry. ---------- */
const MATRIKA_ORDER=["a","ā","i","ī","u","ū","ṛ","ṝ","ḷ","ḹ","e","ai","o","au","aṃ","aḥ","ka","kha","ga","gha","ṅa","ca","cha","ja","jha","ña","ṭa","ṭha","ḍa","ḍha","ṇa","ta","tha","da","dha","na","pa","pha","ba","bha","ma","ya","ra","la","va","śa","ṣa","sa","ha","kṣa"];
let MALINI_ORDER=null;
fetch('data/malini_order.json').then(r=>r.json()).then(j=>{MALINI_ORDER=j.order;}).catch(()=>{});
const IDX={};
const edgeMat=new THREE.LineBasicMaterial({color:0xa86f14,transparent:true,opacity:.32});
const edgeGeo=new THREE.BufferGeometry();
const edgePos=new Float32Array((50-1)*2*3);
edgeGeo.setAttribute('position',new THREE.BufferAttribute(edgePos,3));
const edges=new THREE.LineSegments(edgeGeo,edgeMat);
edges.frustumCulled=false; scene.add(edges);
const _e0=new THREE.Vector3(), _e1=new THREE.Vector3();
function updateEdges(){
  const order=(cfg==='malini'&&MALINI_ORDER)?MALINI_ORDER:MATRIKA_ORDER;
  let o=0;
  for(let k=0;k<order.length-1;k++){
    const a=nodes[IDX[order[k]]], b=nodes[IDX[order[k+1]]];
    if(!a||!b) continue;
    _e0.copy(a.anchor.position); _e1.copy(b.anchor.position);
    edgePos[o++]=_e0.x;edgePos[o++]=_e0.y;edgePos[o++]=_e0.z;
    edgePos[o++]=_e1.x;edgePos[o++]=_e1.y;edgePos[o++]=_e1.z;
  }
  edgeGeo.attributes.position.needsUpdate=true;
  edgeGeo.setDrawRange(0,o/3);
}
/* suṣumṇā + iḍā/piṅgalā — rebuilt from the pose axis whenever posture changes */
const channelY0=-3.9, channelY1=4.3;
let channelMeshes=[];
function axisLerp(y){
  /* local axis point without needing pose fns (setup-safe: standing default) */
  return new THREE.Vector3(0,y,.1);
}
function buildChannels(mapFn){
  for(const m of channelMeshes){ scene.remove(m); m.geometry.dispose(); }
  channelMeshes=[];
  const P0=mapFn?mapFn(channelY0):new THREE.Vector3(0,channelY0,.1);
  const P1=mapFn?mapFn(channelY1):new THREE.Vector3(0,channelY1,.1);
  const dir=P1.clone().sub(P0); const len=dir.length(); dir.normalize();
  const side=new THREE.Vector3(0,0,1);
  const up2=new THREE.Vector3().crossVectors(dir,side).normalize();
  const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([P0,P1]),32,.02,8);
  const sm=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.75}));
  scene.add(sm); channelMeshes.push(sm);
  [[0,TEAL],[Math.PI,ROSE]].forEach(([phase,color])=>{
    const pts=[];
    for(let s=0;s<=1.001;s+=.02){
      const c=P0.clone().addScaledVector(dir,s*len);
      const a=s*len*2.1+phase;
      pts.push(c.addScaledVector(up2,Math.sin(a)*.3).add(new THREE.Vector3(0,0,Math.cos(a)*.18)));
    }
    const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),120,.008,6),
      new THREE.MeshBasicMaterial({color,transparent:true,opacity:.3}));
    scene.add(m); channelMeshes.push(m);
  });
}
buildChannels(null);
let ida={rotation:{}}, ping={rotation:{}};
/* cakra rings (PEDAGOGICAL overlay) */
const CAKRAS=[['root',-3.2],['sacral',-2.3],['solar',-1.2],['heart',.78],['throat',1.6],['brow',2.75],['crown',3.3]];
const rings=CAKRAS.map(([n,y],k)=>{
  const m=new THREE.Mesh(new THREE.TorusGeometry(.34+k*.02,.015,8,48),
    new THREE.MeshBasicMaterial({color:k===3?GOLD:TEAL,transparent:true,opacity:.4}));
  m.position.set(0,y,0); m.rotation.x=Math.PI/2; m.userData.n=n; m.userData.baseY=y; scene.add(m); return m;
});
/* dvādaśānta */
const dvaMark=new THREE.Mesh(new THREE.OctahedronGeometry(.12),new THREE.MeshBasicMaterial({color:TEAL}));
const dvaLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,3.35,0),new THREE.Vector3(0,channelY1,0)]),
  new THREE.LineDashedMaterial({color:TEAL,dashSize:.08,gapSize:.06,transparent:true,opacity:.6}));
{
  dvaMark.position.set(0,channelY1,0); scene.add(dvaMark); scene.add(dvaLine);
}
/* pose root: every static layer re-derives from the posture */
function updateStatics(){
  buildChannels(y=>axisPoint(y));
  for(const m of rings){
    const c=axisPoint(m.userData.baseY);
    m.position.copy(c);
    if(poseName==='lying') m.rotation.set(0,Math.PI/2,0); else m.rotation.set(Math.PI/2,0,0);
  }
  dvaMark.position.copy(axisPoint(channelY1));
  dvaLine.geometry.setFromPoints([axisPoint(3.35),axisPoint(channelY1)]);
  if(poseName!=='standing'){
    yantra.visible=false;
    if(typeof vitLayer!=='undefined'&&vitLayer) vitLayer.group.visible=false;
  }
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
const byIast={}; P.forEach((p,k)=>{byIast[p[0]]=k; IDX[p[0]]=k;});

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
    MP.orbs[c.id]={c,halo,el,labelO:o};
  });
  /* rPillar lives in the circle menu now */
}).catch(()=>{/* offline/file mode: Trika only */});
/* ---------- layayoga lotus layer (procedural, per-text config) ---------- */
let lotus=null, lotusCfg=null;
fetch('frameworks/layayoga/config/anahata.json').then(r=>r.json()).then(c=>{
  lotusCfg=c;
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
  kalCfg=c;
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
  setFigGhost(false);
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
    const [lx,ly]=xfPos(0,.78); lotus.group.position.set(lx,ly,.55);
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

/* ---------- Grid vacuum field (OFF by default: plain background) ---------- */
let gridField=null;
/* enable later with: gridField=buildGridField({scene,count:900}) */
const _gv=new THREE.Vector3();
function gridStimulate(x,y,z,s=1,r=1.4){ if(gridField){ _gv.set(x,y,z); gridField.stimulate(_gv,s,r); } }
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
      COLORFUL:false,SPLAT_COLOR:{r:.5,g:.32,b:.08},
      SHADING:true,BLOOM:true,BLOOM_INTENSITY:.5,BLOOM_THRESHOLD:.55,SUNRAYS:false,
      BACK_COLOR:{r:.965,g:.95,b:.91},TRANSPARENT:true,PAUSED:false});
    fluidOK=true;
    setTimeout(()=>{fluidSplat(innerWidth/2,innerHeight*.42,0,-50);
      setTimeout(()=>fluidSplat(innerWidth/2,innerHeight*.6,0,40),700);},900);
  }).catch(()=>{fluidCanvas.style.display='none';});
} else fluidCanvas.style.display='none';
function setFluid(on){ fluidOn=on; fluidCanvas.style.display=on?'':'none'; }

/* ---------- fx: tweens + pulses ---------- */
const tweens=[];
function pop(k,big=1.6,dur=.5){
  const n=nodes[k]; if(!n) return;
  n.el.classList.remove('lit'); void n.el.offsetWidth; n.el.classList.add('lit');
  clearTimeout(n._lt); n._lt=setTimeout(()=>n.el.classList.remove('lit'), 1100);
}
const pulses=[];
const pulseMat=new THREE.MeshBasicMaterial({color:0xc77f1a,transparent:true,opacity:.95});
function pulse(y0,y1,dur=.9,cb,color){
  const m=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),pulseMat.clone());
  if(color!=null) m.material.color.setHex(color);
  const p0=axisPoint(y0), p1=axisPoint(y1);
  m.position.copy(p0); scene.add(m);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),transparent:true,opacity:.8,depthWrite:false}));
  glow.scale.set(.8,.8,1); m.add(glow);
  pulses.push({m,t:0,p0,p1,dur,cb});
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
  const c=axisPoint(y);
  r.position.copy(c);
  if(poseName==='lying') r.rotation.y=Math.PI/2; else r.rotation.x=Math.PI/2;
  scene.add(r);
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
  readout.innerHTML='<b>'+p[1]+'</b> · '+p[0]+' · '+loc;
}
/* clip resolution: engine library take first (needs ears), human reference fallback.
   null only when nothing exists anywhere → visible flag, never fake audio. */
async function clipFor(p){
  const lib='audio/library/'+encodeURIComponent(p[0])+'/v1_hm_omega.ogg';
  try{ const r=await fetch(lib,{method:'HEAD'}); if(r.ok) return {url:lib, kind:'engine-take'}; }catch(e){}
  if(p[8]) return {url:'audio/phonemes/'+p[8], kind:'human-ref'};
  return {url:null, kind:'missing'};
}
function fire(iast,withSound=true){
  const k=P.findIndex(p=>p[0]===iast); if(k<0) return;
  const p=P[k], n=nodes[k];
  show(p); pop(k);
  const y=n.anchor.position.y, st=styleForY(y);
  pulse(Math.max(y-.4,channelY0),Math.min(y+.9,channelY1),.55,()=>ringPing(Math.min(y+.9,channelY1),st.color),st.color);
  shapeFlash(n.anchor.position.x, y, n.anchor.position.z, st.shape, st.color);
  playTone(toneForY(y), toneDur(p[0], y));
  if(withSound) clipFor(p).then(c=>{
    if(c.url) play(c.url);
    else readout.innerHTML='<b>'+p[1]+'</b> · '+p[0]+' · no recording anywhere — silence, flagged';
  });
  const [sx,sy]=locusScreen(k), e=audioEnergy();
  fluidSplat(sx,sy,(Math.random()-.5)*24,-(14+46*e));
  gridStimulate(n.anchor.position.x, n.anchor.position.y, n.anchor.position.z, 0.9, 1.2);
  if(chladniOn) chladniSet(p.i, p.d);
}
/* ---------- breath audio: audible inhale/exhale for mirroring ---------- */
let breathAudioOn=false, _noiseBuf=null;
function noiseBuf(){
  if(_noiseBuf) return _noiseBuf;
  const b=actx.createBuffer(1, actx.sampleRate*2, actx.sampleRate);
  const d=b.getChannelData(0);
  for(let k=0;k<d.length;k++) d[k]=Math.random()*2-1;
  return _noiseBuf=b;
}
function breathSound(phase,dur){
  if(!breathAudioOn||!ensureAudio()) return;
  try{
    const src=actx.createBufferSource(); src.buffer=noiseBuf(); src.loop=true;
    const f=actx.createBiquadFilter(); f.type='bandpass';
    f.frequency.value=phase==='inhale'?620:400; f.Q.value=0.8;
    const g=actx.createGain(), t=actx.currentTime;
    if(phase==='inhale'){
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.13,t+dur*0.8);
      g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    }else{
      g.gain.setValueAtTime(0.11,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    }
    src.connect(f); f.connect(g); g.connect(actx.destination);
    src.start(t); src.stop(t+dur+0.1);
  }catch(e){}
}
/* ---------- musical body: pitch follows height (sargam ascent), colour+shape follow element.
   Citables: cakra colour table (body/reference), green-core rows (tantrica2),
   tattva shapes square/crescent/triangle/hexagram/circle (Śaṭcakranirūpaṇa standard).
   All three mappings are PEDAGOGICAL aesthetics, never textual claims. */
let melodyOn=false;
const SA=136.1, SARGAM=[1,9/8,5/4,4/3,3/2,5/3,15/8,2];
function toneForY(y){
  const k=Math.max(0,Math.min(7,Math.floor((y+4)/8.5*8)));
  return SA*SARGAM[k];
}
const LONGV=['ā','ī','ū','ṝ','e','ai','o','au'];
function toneDur(iast,y){
  const q=LONGV.includes(iast)?1.8:1.0;
  return q*(1+((y+4)/8.5)*0.9);   // higher = longer: ascent simplifies toward unity
}
function ensureAudio(){
  if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  if(actx&&actx.state==='suspended') actx.resume();
  return actx;
}
let droneNodes=null;
function droneStart(dur){
  droneStop();
  if(!melodyOn||!ensureAudio()) return;
  try{
    droneNodes=[];
    for(const [f,v] of [[SA,.035],[SA*1.5,.022],[SA*2,.012]]){
      const o=actx.createOscillator(), g=actx.createGain();
      o.type='sine'; o.frequency.value=f;
      const t=actx.currentTime;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+1.2);
      g.gain.setValueAtTime(v,t+Math.max(1.2,dur-1)); g.gain.linearRampToValueAtTime(0,t+dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+.1);
      droneNodes.push(o);
    }
  }catch(e){}
}
function droneStop(){ if(droneNodes){ try{droneNodes.forEach(o=>o.stop());}catch(e){} droneNodes=null; } }
function playTone(freq,dur=1.1,vol=.12){
  if(!melodyOn||!actx) return;
  try{
    const o=actx.createOscillator(), g=actx.createGain();
    o.type='sine'; o.frequency.value=freq;
    const t=actx.currentTime;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.08);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+.05);
  }catch(e){}
}
function styleForY(y){
  if(y>=2.6) return {color:0x9a8bd0, css:'#9a8bd0', shape:'dot'};      // ether
  if(y>=1.3) return {color:0x5ec4b6, css:'#5ec4b6', shape:'circle'};  // throat/air
  if(y>=0.2) return {color:0x6fbf8f, css:'#6fbf8f', shape:'circle'};   // heart/anahata green
  if(y>=-1.4) return {color:0xd0653a, css:'#d0653a', shape:'triangle'};// fire
  if(y>=-2.8) return {color:0x5a9ab0, css:'#5a9ab0', shape:'circle'};  // water
  return {color:0xc09a4a, css:'#c09a4a', shape:'square'};              // earth
}
function shapeFlash(x,y,z,shape,color){
  const pts=[];
  if(shape==='square'){ const s=.3;
    pts.push([-s,-s],[s,-s],[s,s],[-s,s],[-s,-s]);
  } else if(shape==='triangle'){ const s=.34;
    pts.push([0,s],[-s,-s*.7],[s,-s*.7],[0,s]);
  } else if(shape==='dot'){
    const m=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),
      new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95}));
    m.position.set(x,y,z); scene.add(m);
    tweens.push({t:0,dur:.9,fn:k=>{m.material.opacity=.95*(1-k);},done:()=>scene.remove(m)});
    return;
  } else { const pts2=[]; for(let k=0;k<=40;k++){const a=k/40*Math.PI*2; pts2.push(new THREE.Vector3(Math.cos(a)*.3,Math.sin(a)*.3,0));}
    const l=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts2),
      new THREE.LineBasicMaterial({color,transparent:true,opacity:.9}));
    l.position.set(x,y,z); scene.add(l);
    tweens.push({t:0,dur:1,fn:k=>{l.material.opacity=.9*(1-k); l.scale.setScalar(1+k*.8);},done:()=>scene.remove(l)});
    return;
  }
  const l=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(p[0],p[1],0))),
    new THREE.LineBasicMaterial({color,transparent:true,opacity:.9}));
  l.position.set(x,y,z); scene.add(l);
  tweens.push({t:0,dur:1,fn:k=>{l.material.opacity=.9*(1-k); l.scale.setScalar(1+k*.8);},done:()=>scene.remove(l)});
}
/* ---------- single circle menu + split bodies ---------- */
const menu=document.getElementById('menu');
const readout=document.getElementById('readout');
function menuMark(){
  menu.querySelectorAll('[data-fw]').forEach(b=>b.classList.toggle('on',b.dataset.fw===fw));
  menu.querySelectorAll('[data-pose]').forEach(b=>b.classList.toggle('on',b.dataset.pose===poseName));
  const set=(id,on)=>{const b=menu.querySelector('#'+id); if(b)b.classList.toggle('on',!!on);};
  set('mScan',scanMode); set('mYan',yantra.visible); set('mX',xray);
  set('mFluid',fluidOn); set('mChlad',chladniOn);
  set('mVit',vitLayer&&vitLayer.group.visible);
  set('mGuide',guideOn);
}
function markRail(){ menuMark(); }
function menuClose(){ menu.classList.remove('show'); document.getElementById('menuBtn').classList.remove('on'); }
function buildMenu(){
  const sec=(t)=>{const h=document.createElement('h3'); h.textContent=t; menu.appendChild(h);
    const r=document.createElement('div'); r.className='row'; menu.appendChild(r); return r;};
  const btn=(parent,label,fn,id)=>{const b=document.createElement('button'); b.textContent=label;
    if(id)b.id=id; b.onclick=(ev)=>{fn(ev); menuMark();}; parent.appendChild(b); return b;};
  let r=sec('Traditions');
  const fwBtn=(label,fwId,go)=>btn(r,label,()=>{go(); menuClose();},null).dataset.fw=fwId;
  fwBtn('☸ Trika · Mātṛkā','trika',()=>{setFw('trika'); setCfg('matrika');});
  fwBtn('☸ Trika · Mālinī','trika',()=>{setFw('trika'); setCfg('malini');});
  fwBtn('☩ Middle Pillar','mp',()=>setFw('mp'));
  fwBtn('🪷 Anahata lotus','layayoga',()=>setFw('layayoga'));
  fwBtn('❖ Kālacakra','kalachakra',()=>setFw('kalachakra'));
  r=sec('Posture');
  const poseBtn=(label,name)=>{const b=btn(r,label,()=>{setPose(name); menuMark();});
    b.dataset.pose=name; return b;};
  poseBtn('🧍 standing','standing'); poseBtn('🧘 seated','seated'); poseBtn('🛌 lying','lying');
  r=sec('Layers');
  btn(r,'◉ scan',()=>toggleScan(),'mScan');
  btn(r,'△ yantra',()=>toggleYan(),'mYan');
  btn(r,'✦ figure',e=>{cycleVitFig(); e.target.textContent='✦ '+vitFigLabel();},'mVit');
  btn(r,'◈ lines',()=>toggleX(),'mX');
  btn(r,'◍ avatar',()=>cycleAvatar(),'mAva');
  btn(r,'🌊 fluid',()=>{fluidOn=!fluidOn; fluidCanvas.style.display=fluidOn?'':'none';},'mFluid');
  btn(r,'≋ chladni',()=>toggleChladni(),'mChlad');
  r=sec('Practice');
  btn(r,'▶ OM',()=>playOM());
  btn(r,'▶ Namaḥ Śivāya',()=>playNamah());
  btn(r,'⚡ ha',()=>playHa());
  btn(r,'VBT 24 gaze',()=>score('frameworks/vbt/practices/v24-gaze.json').then(j=>runScore(j.events,{id:j.id,title:j.title,source:'VBT dh.24 locus+structure; cues our own'})));
  btn(r,'Ajahn Lee · breath energy',()=>startAjahn());
  btn(r,'Breath audio',e=>{breathAudioOn=!breathAudioOn; e.target.textContent=`Breath audio: ${breathAudioOn?'on':'off'}`;});
  btn(r,'caitanyam',()=>playSutra('sutra','caitanyam ātmā — Consciousness is Self'));
  btn(r,'hṛdaye',()=>playSutra('hrdaye','hṛdaye — in the Heart'));
  btn(r,'Guide voice',e=>{guideOn=!guideOn; e.target.textContent=`Guide voice: ${guideOn?'on':'off'}`;},'mGuide');
  btn(r,'Melody',e=>{melodyOn=!melodyOn; e.target.textContent=`Melody: ${melodyOn?'sa…ni ♪':'off'}`;},'mMel');
  const a=document.createElement('a'); a.href='mantra'; a.textContent='chant-through →';
  a.style.cssText='font-size:.85rem;font-family:ui-sans-serif,system-ui'; r.appendChild(a);
  r=sec('Compare');
  btn(r,'OM × Descent',()=>comparePreset('om-descent'));
  btn(r,'VBT 24 × Scan',()=>comparePreset('v24-scan'));
  r=sec('Guide');
  const f=document.createElement('form'); f.id='askRow'; f.style.display='flex'; f.style.gap='.35rem';
  f.innerHTML='<input id="askQ" type="text" placeholder="where am I · next · repeat · pause · source" aria-label="Ask the guide" autocomplete="off" style="flex:1;min-width:0;background:rgba(11,13,18,.7);border:1px solid var(--line);border-radius:8px;color:var(--ink);font-size:.8rem;padding:.5rem .6rem"/>';
  f.onsubmit=ev=>{ev.preventDefault(); const q=f.querySelector('#askQ');
    if(!q.value.trim())return; const a=tools?tools.answer(q.value):'…';
    info.querySelector('.locus').textContent=a; readout.innerHTML='<b>guide</b> · '+a; speak(a); q.value='';};
  menu.appendChild(f);
  const n=document.createElement('p'); n.className='note';
  n.textContent='One map per sitting. Geometries differ per tradition — never one chart.';
  menu.appendChild(n);
}
/* ---------- pose system: energy inhabits the posture ---------- */
let poseName='standing';
function xfPos(x,y){
  if(poseName==='seated'){
    if(y<-1.4) return [x*2.4, -3.45+(y+3.9)*0.1];
    return [x*1.05, -3.5+(y+3.9)*0.58];
  }
  if(poseName==='lying'){
    return [-3.4+(1-(y+3.9)/7.8)*6.8, -0.5-x*0.8];
  }
  return [x,y];
}
function axisPoint(y){
  const [x,yy]=xfPos(0,y);
  return new THREE.Vector3(x,yy,.1);
}
function setTargets(){
  P.forEach((p,k)=>{ const b=cfg==='matrika'?M(p):A(p);
    const [x,y]=xfPos(b.x,b.y); nodes[k].target={x,y,z:b.z}; });
  applyPoseToFrameworks();
}
function applyPoseToFrameworks(){
  if(typeof MP!=='undefined'&&MP) for(const id in MP.orbs){
    const o=MP.orbs[id], [x,y]=xfPos(o.c.x3,o.c.y3);
    o.halo.position.set(x,y,o.c.z3); o.labelO.position.set(x,y,o.c.z3);
  }
  if(typeof lotus!=='undefined'&&lotus){ const [x,y]=xfPos(0,.78); lotus.group.position.set(x,y,.55); }
  if(typeof kalSpokes!=='undefined'&&kalSpokes) for(const w of kalSpokes.wheels){
    w.group.position.y=xfPos(0,w.cfg.y3)[1];
  }
}
function setCfg(c){
  cfg=c; setTargets();
}
function setPose(name){
  poseName=name;
  setTargets();
  updateStatics();
  if(typeof vitFig!=='undefined'&&vitFig&&vitFig.group.visible) vitFig.setPose(name==='lying'?'lying':name==='seated'?'seated':'standing');
  const labels={standing:'standing · full height',seated:'seated lotus · folded',lying:'lying down · horizontal'};
  readout.innerHTML='<b>pose</b> · '+labels[name];
}
function toggleScan(){
  if(scanMode){scanMode=null; scanBand.visible=false;}
  else{scanMode={y:4.5,dir:-1}; scanBand.visible=true;
    info.querySelector('.dev').textContent='स्मृति';
    info.querySelector('.iast').textContent='body scan — crown → feet → crown';
    info.querySelector('.locus').textContent='Rest attention where the band glows. Breathe naturally (TĀ 4.91).';
    readout.innerHTML='<b>scan</b> · crown → feet → crown';}
}
function toggleYan(){ yantra.visible=!yantra.visible; }
function toggleX(){
  xray=!xray; edges.visible=!xray;
}
/* practice actions (also callable via postMessage in embeds) */
function playOM(){
  if(fw==='mp'){ if(MP)mpRun('descent'); return; }
  if(fw==='layayoga'){ lotusBloom(); return; }
  if(fw==='kalachakra'){ kalConverge(); return; }
  score('frameworks/trika/practices/om.json').then(j=>runScore(j.events,{id:j.id,title:j.title,source:j.provenance}));
}
function playNamah(){
  if(fw==='mp'){ if(MP)mpRun('circulation'); return; }
  if(fw==='layayoga'){ lotusBloom(); return; }
  if(fw==='kalachakra'){ kalConverge(); return; }
  score('frameworks/trika/practices/namah-shivaya.json').then(j=>runScore(j.variants[cfg],{id:j.id+'/'+cfg,title:j.title+' ('+cfg+')',source:j.provenance}));
}
function playHa(){
  show(['ha','ह','prāṇa — full-channel flash','',0,'','',0,'ha.ogg']);
  play('audio/phonemes/ha.ogg'); pop(byIast['ha'],2.2);
  const W=viewSize().w;
  fluidSplat(W/2,innerHeight*.45,0,-90);
  for(let k=0;k<4;k++) setTimeout(()=>fluidSplat(
    W*(.3+Math.random()*.4),innerHeight*(.3+Math.random()*.3),
    (Math.random()-.5)*60,(Math.random()-.5)*60),k*160);
  pulse(channelY0,3.3,.9,()=>{ CAKRAS.forEach(([n,y],k)=>setTimeout(()=>ringPing(y),k*120)); });
}
const SEQ={sutra:['sa','u','a','i','ta','a','ña','ma','ā','ta','ma','ā'],
 hrdaye:['ha','ṛ','da','ya','e']};
const WAV={sutra:'audio/edge_test_sutra.wav',hrdaye:'audio/edge_test_hrdaye.wav'};
function playSutra(key,title){
  const evs=[{t:0,do:'audio',url:WAV[key]},
    {t:.05,do:'info',dev:key==='sutra'?'चैतन्यमात्मा':'हृदये',iast:title}];
  SEQ[key].forEach((id,kk)=>{const n=P.findIndex(p=>p[0]===id); if(n>=0){
    evs.push({t:.15+kk*.45,do:'flash',node:id});
    evs.push({t:.15+kk*.45,do:'splat',node:id,dy:-26});}});
  runScore(evs,{id:'sutra-'+key,title,source:'EdgeSanskrit phrase + Mātṛkā loci'});
}

/* ---------- vitruvian overlay (diagram, not doctrine) ---------- */
let vitCfg=null, vitLayer=null;
fetch('frameworks/hermetic/vitruvian-man.json').then(r=>r.json()).then(c=>{
  vitCfg=c;
}).catch(()=>{});
function toggleVit(){
  if(!vitLayer && vitCfg) vitLayer=buildVitruvian(vitCfg,{scene});
  if(!vitLayer) return;
  vitLayer.group.visible=!vitLayer.group.visible;
  const img=document.getElementById('vitruv');
  if(!img.src) img.src='assets/vitruvian.svg';
  img.style.display=vitLayer.group.visible?'':'none';
  if(vitLayer.group.visible){
    info.querySelector('.dev').textContent='☉☽';
    info.querySelector('.iast').textContent='As above, so below — measure, not mystique';
    info.querySelector('.locus').textContent=
      'Circle=heavens (navel centre) · square=earth (feet→crown) · span=height. '+
      'Heart torus: HRV peer-reviewed, field claims contested · vacuum point: speculative · pilot ripples: minority view.';
  }
  markRail();
}
/* ---------- vitruvian figure: two poses, two centres, one morph ---------- */
let vitFig=null, morphOn=false, morphT=0, morphDir=1, lastPhase='';
function vitEnsure(){
  if(!vitFig) vitFig=buildVitruvianFigure({scene});
  if(!vitLayer && vitCfg) vitLayer=buildVitruvian(vitCfg,{scene});
  const img=document.getElementById('vitruv');
  if(!img.src) img.src='assets/vitruvian.svg';
}
/* figure poses: off → still → morph → seated → lying → off */
let vitPoseIdx=0;
function vitFigLabel(){
  return ['figure','still','morph','seated','lying'][vitPoseIdx];
}
function cycleVitFig(){
  vitEnsure();
  vitPoseIdx=(vitPoseIdx+1)%5;
  morphOn=false;
  const img=document.getElementById('vitruv');
  if(vitPoseIdx===0){ vitHide(); }
  else{
    vitFig.show(true);
    if(vitPoseIdx===1){ vitFig.setPose('standing'); vitFig.pose(0);
      readout.innerHTML='<b>earthly pose</b> · square · centre groin'; }
    else if(vitPoseIdx===2){ vitFig.setPose('standing'); morphOn=true; morphT=0; morphDir=1;
      readout.innerHTML='<b>morphing</b> · groin ↔ navel'; }
    else if(vitPoseIdx===3){ vitFig.setPose('seated');
      readout.innerHTML='<b>seated lotus</b> · same canon, folded'; }
    else { vitFig.setPose('lying');
      readout.innerHTML='<b>lying down</b> · same canon, horizontal'; }
    if(vitLayer) vitLayer.group.visible=false;
    img.style.display='';
  }
  menuMark();
}
function vitStill(){
  morphOn=false;
  vitFig.show(true); vitFig.setPose('standing'); vitFig.pose(0);
  if(vitLayer) vitLayer.group.visible=false;
  document.getElementById('vitruv').style.display='';
  readout.innerHTML='<b>earthly pose</b> · square · centre groin';
}
function vitPose(name){
  morphOn=false;
  vitFig.show(true); vitFig.setPose(name);
  if(vitLayer) vitLayer.group.visible=false;
  document.getElementById('vitruv').style.display = name==='standing' ? '' : 'none';
  readout.innerHTML = name==='seated'
    ? '<b>seated lotus</b> · same canon, folded'
    : '<b>lying down</b> · same canon, horizontal';
}
function vitHide(){
  morphOn=false;
  if(vitFig) vitFig.show(false);
  if(vitLayer) vitLayer.group.visible=false;
  document.getElementById('vitruv').style.display='none';
}
/* ---------- avatar reference mesh (articulated, faint, NOT the subtle body) ---------- */
let avatar=null;
const AV_POSES=['stand','seat','lie'];
let avIdx=-1;
async function ensureAvatar(){
  if(!avatar) avatar=await buildAvatar({scene});
  return avatar;
}
function cycleAvatar(){
  ensureAvatar().then(a=>{
    if(!a) return;
    avIdx=(avIdx+1)%(AV_POSES.length+1);
    if(avIdx>=AV_POSES.length){
      a.show(false);
      readout.innerHTML='<b>avatar</b> · hidden';
    }else{
      a.show(true); a.setPose(AV_POSES[avIdx]);
      readout.innerHTML=`<b>avatar</b> · ${AV_POSES[avIdx]} (reference mesh, not subtle body)`;
    }
    menuMark();
  }).catch(()=>{});
}
/* ---------- ajahn lee endgame loop: seated figure, breath audio, narration ---------- */
function setFigGhost(on){
  if(!vitFig) return;
  vitFig.group.traverse(o=>{ if(o.isMesh&&o.material){ o.material.transparent=true; o.material.opacity=on?0.32:0.92; } });
}
function startAjahn(){
  score('frameworks/theravada/practices/ajahn-lee-1.json').then(j=>{
    if(!vitFig) vitFig=buildVitruvianFigure({scene});
    vitFig.show(true); vitFig.setPose('seated'); setFigGhost(true);
    document.getElementById('vitruv').style.display='none';
    breathAudioOn=true; guideOn=true;
    runScore(j.events,{id:j.id,title:j.title,source:'Ajahn Lee M1 simplified — verify against source'});
    readout.innerHTML='<b>ajahn lee · method 1</b> · seated · breath + narration on — mirror, then feel';
  });
}
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
    ida.rotation.y+=dt*.05; ping.rotation.y-=dt*.05;
    rings.forEach((r,k)=>r.material.opacity=.32+.12*Math.sin(t*1.5+k));
  }
  updateEdges();
  if(morphOn&&vitFig&&vitFig.getPose()==='standing'&&!reduce){
    morphT+=morphDir*dt*0.14;
    if(morphT>=1){morphT=1;morphDir=-1;} if(morphT<=0){morphT=0;morphDir=1;}
    const st=vitFig.pose(morphT);
    if(st.pose!==lastPhase){lastPhase=st.pose;
      readout.innerHTML = st.pose==='earthly'
        ? '<b>earthly pose</b> · square · centre groin — earth, measure'
        : '<b>cosmic pose</b> · circle · centre navel — heavens, infinite';}
  }
  for(let i=tweens.length-1;i>=0;i--){const tw=tweens[i]; tw.t+=dt;
    const k=Math.min(1,tw.t/tw.dur); tw.fn(k); if(k>=1){tweens.splice(i,1); tw.done&&tw.done();}}
  for(let i=pulses.length-1;i>=0;i--){const pu=pulses[i]; pu.t+=dt;
    const k=Math.min(1,pu.t/pu.dur); pu.m.position.lerpVectors(pu.p0,pu.p1,k);
    if(fluidOK&&fluidOn&&frame%7===0&&k<1){
      _hv.copy(pu.m.position).project(camera);
      fluidSplat((_hv.x*.5+.5)*innerWidth,(-_hv.y*.5+.5)*innerHeight,0,pu.p1.y>pu.p0.y?-22:22);
    }
    if(gridField&&frame%9===0&&k<1) gridStimulate(pu.m.position.x,pu.m.position.y,pu.m.position.z,0.7,1.0);
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
  /* scan sweep (follows the pose axis) */
  if(scanMode&&!reduce){
    const s=scanMode;
    if(poseName==='lying'){
      if(s.x==null){s.x=-3.4; s.dir=-1;}
      s.x+=s.dir*dt*.55;
      if(s.x<-3.4){s.x=-3.4; s.dir=1;} if(s.x>3.4){s.x=3.4; s.dir=-1;}
      scanBand.position.set(s.x,-0.5,0); scanBand.rotation.set(0,Math.PI/2,0);
    }else{
      const lo=poseName==='seated'?-3.5:-4.4, hi=poseName==='seated'?1.0:4.5;
      s.y+=s.dir*dt*.55;
      if(s.y<lo){s.y=lo; s.dir=1;} if(s.y>hi){s.y=hi; s.dir=-1;}
      scanBand.position.set(0,s.y,0); scanBand.rotation.set(Math.PI/2,0,0);
    }
    if(fluidOK&&fluidOn&&frame%40===0){
      _hv.copy(scanBand.position).project(camera);
      fluidSplat((_hv.x*.5+.5)*innerWidth,(-_hv.y*.5+.5)*innerHeight,(Math.random()-.5)*30,0);
    }
    if(gridField&&frame%50===0){ _hv.copy(scanBand.position); gridField.knot(_hv,0.8); }
    const sc=1+Math.sin(t*1.2)*.04; scanBand.scale.set(sc,sc,1);
    const along=n=>poseName==='lying'?n.anchor.position.x:n.anchor.position.y;
    const at=poseName==='lying'?s.x:s.y;
    nodes.forEach((n,k)=>{ if(Math.abs(along(n)-at)<.35 && !n.el.classList.contains('lit')) pop(k,1.35,.8); });
  }
  if(bloomOn) composer.render(); else renderer.render(scene,camera);
  cssRenderer.render(scene,camera);
  if(gridField) gridField.tick(dt,t);
  if(avatar&&avatar.group.visible){ avatar.tick(dt); avatar.breathe(0.5+0.5*Math.sin(t*0.45)); }
  if(chladniOn){
    const e=audioEnergy();
    chladniGenome.time_rate=0.6+e*2.2;
    chladniGenome.exposure=0.8+e*0.9;
    try{ renderChladni(chCanvas(),{genome:chladniGenome,source_variant:chladniVariant},t); }catch(err){}
  }
  if(typeof kalSpokes!=='undefined'&&kalSpokes&&kalSpokes.group.visible&&!reduce) kalSpokes.spin(dt,0.06);
}
function viewSize(){
  if(document.body.classList.contains('split') && innerWidth>640)
    return {w:Math.floor(innerWidth/2), h:innerHeight};
  return {w:innerWidth, h:innerHeight};
}
function resize(){
  const {w,h}=viewSize();
  camera.aspect=w/h; camera.updateProjectionMatrix();
  renderer.setSize(w,h); cssRenderer.setSize(w,h);
  Object.assign(cssRenderer.domElement.style,{left:'0',top:'0',width:w+'px',height:h+'px'});
}
/* ---------- split bodies + compare presets ---------- */
const secondFrame=()=>document.getElementById('second');
function setSplit(on){
  document.body.classList.toggle('split',on);
  document.getElementById('splitBtn').classList.toggle('on',on);
  document.getElementById('splitBtn').textContent=on?'×':'+';
  const f=secondFrame();
  if(on && !f.src) f.src=location.pathname+'?embed=1';
  setTimeout(resize,60);
}
function postRight(msg){ const f=secondFrame(); if(f&&f.src) f.contentWindow.postMessage(msg,'*'); }
function comparePreset(which){
  if(!document.body.classList.contains('split')) setSplit(true);
  if(which==='om-descent'){
    setFw('trika'); setCfg('matrika'); playOM();
    setTimeout(()=>{ postRight({t:'fw',v:'mp'}); setTimeout(()=>postRight({t:'play',id:'descent'}),900); },900);
    readout.innerHTML='<b>compare</b> · OM ascent × Pillar descent';
  }else if(which==='v24-scan'){
    if(!scanMode) toggleScan();
    setTimeout(()=>postRight({t:'scan'}),900);
    readout.innerHTML='<b>compare</b> · VBT 24 gaze × sweep (right runs the sweep)';
    score('frameworks/vbt/practices/v24-gaze.json').then(j=>runScore(j.events,{id:j.id,title:j.title,source:'VBT dh.24 locus+structure; cues our own'}));
  }
  menuClose(); menuMark();
}
/* ---------- chrome wiring ---------- */
buildMenu(); menuMark();
if(innerWidth>=900 && !new URLSearchParams(location.search).get('embed')){
  menu.classList.add('show'); document.getElementById('menuBtn').classList.add('on');
}
document.getElementById('menuBtn').onclick=()=>{
  const m=menu; m.classList.toggle('show');
  document.getElementById('menuBtn').classList.toggle('on',m.classList.contains('show'));
};
document.getElementById('splitBtn').onclick=()=>setSplit(!document.body.classList.contains('split'));
/* embed control + boot params */
window.addEventListener('message',ev=>{
  const m=ev.data||{}; if(!m.t) return;
  if(m.t==='fw'&&m.v) setFw(m.v);
  else if(m.t==='cfg'&&m.v) setCfg(m.v);
  else if(m.t==='play'&&m.id==='descent'){ setFw('mp'); setTimeout(()=>mpRun('descent'),600); }
  else if(m.t==='play'&&m.id==='circulation'){ setFw('mp'); setTimeout(()=>mpRun('circulation'),600); }
  else if(m.t==='play'&&m.id==='om'){ setFw('trika'); setTimeout(playOM,600); }
  else if(m.t==='scan'){ if(!scanMode) toggleScan(); }
});
(function bootParams(){
  const q=new URLSearchParams(location.search);
  if(q.get('embed')) document.body.classList.add('embed');
  const fw=q.get('fw');
  if(fw&&['trika','mp','layayoga','kalachakra'].includes(fw)) setFw(fw);
})();
addEventListener('resize',resize); resize(); tick();
