/* Spoke-wheel primitive — radial subsidiary channels around a hub drop.
   For channel-count centres (e.g. Kālacakra); spokes are channels, NOT lotus petals. */
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export function buildSpokes(cfg, opts){
  const { scene, onCentre } = opts;
  const group = new THREE.Group();
  const color = opts.color ?? 0xc9a45c;
  const wheels = [];
  for(const c of cfg.centres){
    const w = new THREE.Group(); w.position.set(0, c.y3, 0.1);
    const R = 0.32 + Math.min(0.35, c.spokes * 0.004);
    const pts = [];
    for(let k=0; k<c.spokes; k++){
      const a = (k/c.spokes)*Math.PI*2;
      pts.push(new THREE.Vector3(0,0,0), new THREE.Vector3(Math.cos(a)*R, Math.sin(a)*R, 0));
    }
    w.add(new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({color, transparent:true, opacity:0.55})));
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10),
      new THREE.MeshBasicMaterial({color: 0xffe9b0}));
    w.add(hub);
    const el = document.createElement('div');
    el.className = 'spoke'; el.textContent = `${c.name} · ${c.spokes}`;
    el.setAttribute('role','button'); el.setAttribute('tabindex','0');
    el.setAttribute('aria-label', `${c.name}, ${c.spokes} channels`);
    el.style.pointerEvents = 'auto';
    const go = ev => { ev.stopPropagation(); onCentre && onCentre(c, el); };
    el.addEventListener('click', go);
    el.addEventListener('keydown', ev=>{ if(ev.key==='Enter'||ev.key===' '){ev.preventDefault(); go(ev);} });
    const o = new CSS2DObject(el); o.position.set(0, R+0.3, 0); w.add(o);
    group.add(w);
    wheels.push({cfg: c, group: w, el});
  }
  scene.add(group);
  return {
    group, wheels,
    spin(dt, speed=0.05){ for(const w of wheels) w.group.rotation.z += dt*speed; },
    dispose(){ scene.remove(group); }
  };
}
