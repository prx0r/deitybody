/* Vitruvian overlay — circle (heavens) + square (earth) + measure ticks
   + heart torus (HeartMath note) + vacuum point (holofractal note).
   Diagram, not doctrine. Statuses live in vitruvian-man.json. */
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export function buildVitruvian(cfg, opts){
  const { scene } = opts;
  const gold = opts.color ?? 0xc9a45c;
  const teal = 0x5ec4b6;
  const group = new THREE.Group();
  const line = (pts, color=gold, op=.7) => {
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({color, transparent:true, opacity:op})));
  };
  const label = (text, x, y, cls='klabel') => {
    const d = document.createElement('div'); d.className = cls; d.textContent = text;
    const o = new CSS2DObject(d); o.position.set(x, y, 0); group.add(o); return o;
  };
  const g = cfg.geometry;
  /* square: feet → crown (body height H, centered) */
  const yFeet = -3.9, yCrown = 3.3, H = yCrown - yFeet, cx = 0;
  const sq = [[-H/2,yFeet],[H/2,yFeet],[H/2,yCrown],[-H/2,yCrown],[-H/2,yFeet]]
    .map(([x,y])=>new THREE.Vector3(x,y,0));
  line(sq); label('terra · square (earth)', H/2+0.15, (yFeet+yCrown)/2);
  /* circle: navel centre (macrocosm) */
  const yNavel = -0.9, rC = yCrown - yNavel;
  const circ = [];
  for(let k=0;k<=72;k++){const a=k/72*Math.PI*2; circ.push(new THREE.Vector3(cx+Math.cos(a)*rC, yNavel+Math.sin(a)*rC, 0));}
  line(circ, teal); label('caelum · circle (heavens)', rC+0.15, yNavel);
  /* arm-span = height */
  line([new THREE.Vector3(-H/2,1.2,0), new THREE.Vector3(H/2,1.2,0)], gold, .45);
  label('arm span = height', 0, 1.45);
  /* navel + groin centres */
  const dot = (y,c=gold) => { const m=new THREE.Mesh(new THREE.SphereGeometry(.04,10,8),
    new THREE.MeshBasicMaterial({color:c})); m.position.set(0,y,0); group.add(m); };
  dot(yNavel); label('navel · circle-centre', .3, yNavel);
  dot(-2.4); label('groin · square-centre', .3, -2.4);
  /* proportion ticks: 4 cubits of height */
  for(let k=0;k<=4;k++){const y=yFeet+H*k/4;
    line([new THREE.Vector3(-H/2-.2,y,0),new THREE.Vector3(-H/2+.2,y,0)],gold,.5);}
  label('4 cubits = height', -H/2-.25, yCrown+.25);
  /* heart torus (HeartMath note) */
  const torus = new THREE.Mesh(new THREE.TorusGeometry(.5,.05,10,48),
    new THREE.MeshBasicMaterial({color:teal,transparent:true,opacity:.4}));
  torus.position.set(0,.78,0); torus.rotation.x=Math.PI/2.3; group.add(torus);
  label('heart field (HeartMath: HRV peer-reviewed; field claims contested)', .75, .78);
  /* vacuum point (holofractal note) */
  const vac = new THREE.Mesh(new THREE.OctahedronGeometry(.07),
    new THREE.MeshBasicMaterial({color:0xffe9b0}));
  vac.position.set(0,.78,0); group.add(vac);
  label('vacuum point (Haramein: speculative)', -.9, .35);
  /* pilot-wave ripples (Bohm note) */
  for(let k=1;k<=3;k++){
    const r = new THREE.Mesh(new THREE.TorusGeometry(.9+k*.5,.008,6,64),
      new THREE.MeshBasicMaterial({color:teal,transparent:true,opacity:.25}));
    r.position.set(0,.4,0); r.rotation.x=Math.PI/2; group.add(r);
  }
  label('pilot ripples (Bohm: minority interpretation)', -1.4, -.6);
  label('as above · so below (Emerald Tablet)', 0, yCrown+.55);
  group.visible = false;
  scene.add(group);
  return { group };
}
