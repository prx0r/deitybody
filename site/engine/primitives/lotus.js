/* Lotus primitive — procedural petal wheel with glyphs, yantra core, unfold.
   Colours/topology come from per-text configs, never from here. */
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export function buildLotus(cfg, opts){
  const { scene, playPhoneme, onPetal } = opts;
  const group = new THREE.Group();
  const N = cfg.geometry.petals, R = opts.radius ?? 0.85;
  const gold = opts.color ?? 0xc9a45c;
  const petals = [];
  for(let k=0; k<N; k++){
    const a = (k/N)*Math.PI*2;
    /* petal: bent plane */
    const geo = new THREE.PlaneGeometry(0.34, 0.62, 1, 6);
    const pos = geo.attributes.position;
    for(let v=0; v<pos.count; v++){
      const y = pos.getY(v);
      pos.setZ(v, Math.sin((y+0.31)/0.62*Math.PI)*0.16);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({color: gold, transparent:true, opacity:0.28, side:THREE.DoubleSide, depthWrite:false});
    const m = new THREE.Mesh(geo, mat);
    const px = Math.cos(a)*R, pz = Math.sin(a)*R;
    m.position.set(px, 0, pz);
    m.rotation.y = -a + Math.PI/2;
    m.userData.closed = new THREE.Euler(0.9, m.rotation.y, 0, 'YXZ');
    m.userData.open = new THREE.Euler(-0.15, m.rotation.y, 0, 'YXZ');
    m.rotation.copy(m.userData.open);
    group.add(m);
    /* petal glyph label */
    const p = cfg.petals[k] || {};
    const el = document.createElement('div');
    el.className = 'petal'; el.textContent = p.dev || '';
    el.setAttribute('role','button'); el.setAttribute('tabindex','0');
    el.setAttribute('aria-label', `petal ${k+1} ${p.bija||''}`);
    el.style.pointerEvents = 'auto';
    const go = ev => { ev.stopPropagation(); onPetal && onPetal(p, el); };
    el.addEventListener('click', go);
    el.addEventListener('keydown', ev=>{ if(ev.key==='Enter'||ev.key===' '){ev.preventDefault(); go(ev);} });
    const o = new CSS2DObject(el);
    o.position.set(Math.cos(a)*(R+0.28), 0, Math.sin(a)*(R+0.28));
    group.add(o);
    petals.push({mesh:m, label:o, el, data:p});
  }
  /* central yantra: hexagram (two triangle loops) + bindu */
  if(cfg.geometry.centralYantra === 'hexagram'){
    const r = 0.3, line = c => new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(c),
      new THREE.LineBasicMaterial({color: gold, transparent:true, opacity:0.9}));
    const up = [0,1,2].map(k=>{const a=-Math.PI/2+k*2*Math.PI/3; return new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r);});
    const dn = [0,1,2].map(k=>{const a=Math.PI/2+k*2*Math.PI/3; return new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r);});
    group.add(line(up), line(dn));
  }
  const bindu = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10),
    new THREE.MeshBasicMaterial({color: 0xffe9b0}));
  group.add(bindu);
  /* center bīja */
  const bel = document.createElement('div');
  bel.className = 'petal core'; bel.textContent = cfg.center?.bijaDev || '';
  bel.style.pointerEvents = 'auto';
  bel.addEventListener('click', ev=>{ ev.stopPropagation(); onPetal && onPetal({bija: cfg.center?.bija, phoneme: null, core:true}, bel); });
  const bo = new CSS2DObject(bel); bo.position.set(0, 0, 0.12); group.add(bo);
  scene.add(group);
  return {
    group, petals,
    setOpen(t){ /* t: 0 closed bud → 1 full bloom */
      for(const p of petals){
        const e0 = p.mesh.userData.closed, e1 = p.mesh.userData.open;
        p.mesh.rotation.x = e0.x + (e1.x - e0.x)*t;
        p.mesh.material.opacity = 0.12 + 0.25*t;
      }
    },
    dispose(){ scene.remove(group); }
  };
}
