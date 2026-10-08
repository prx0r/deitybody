/* Vitruvian figure v2 — canon volumes, two poses, two centres.
   Canon (Vitruvius III.1, Morgan): H=4. Breast breadth 1/4H. Head 1/8H.
   Forearm(+hand) 1/4H. Foot 1/6H. Arm: upper 0.55 + fore 0.95 = 1.5 so that
   shoulder(±0.5) + arm = span/2 (2.0) EXACTLY in pose A. Legs 1.0+1.0 = groin
   height so soles land on the square line. Navel 0.6H (drawing tradition);
   r = crown−navel. Soles do NOT touch the circle — the viral claim is
   geometrically impossible under the text's own numbers; recorded as such.
   Limb widths stylized (Vitruvius silent); lengths canonical. */
import * as THREE from 'three';

const H = 4, Y_NAVEL = 2.4, Y_GROIN = 2.0, R_CIRC = H - Y_NAVEL;
const INK = 0x7a5c3e;

function seg(r, mat){
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, 1, 4, 10), mat);
  m.userData.r = r;
  return m;
}
function place(mesh, ax, ay, bx, by){
  const dx = bx-ax, dy = by-ay, len = Math.max(1e-6, Math.hypot(dx, dy));
  mesh.position.set((ax+bx)/2, (ay+by)/2, 0);
  mesh.rotation.z = Math.atan2(dy, dx) - Math.PI/2;
  mesh.scale.set(1, (len - mesh.userData.r*0.5) / 1, 1);
}

export function buildVitruvianFigure(opts){
  const { scene } = opts;
  const mat = new THREE.MeshBasicMaterial({color: INK, transparent:true, opacity:.92});
  const group = new THREE.Group();
  /* torso: chest (breast breadth 1.0) tapering to groin */
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 1.3, 20), mat);
  torso.position.set(0, 2.65, 0); group.add(torso);
  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), mat);
  pelvis.scale.set(1.25, 0.75, 0.7); pelvis.position.set(0, 1.95, 0); group.add(pelvis);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.3, 12), mat);
  neck.position.set(0, 3.42, 0); group.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 16), mat);
  head.position.set(0, 3.75, 0); group.add(head);
  /* limbs */
  const uaL=seg(0.11,mat), uaR=seg(0.11,mat), faL=seg(0.09,mat), faR=seg(0.09,mat);
  const thL=seg(0.16,mat), thR=seg(0.16,mat), shL=seg(0.11,mat), shR=seg(0.11,mat);
  const ftL=seg(0.07,mat), ftR=seg(0.07,mat);
  [uaL,uaR,faL,faR,thL,thR,shL,shR,ftL,ftR].forEach(m=>group.add(m));
  /* square (centre groin, side H) + circle (centre navel, r to crown) */
  const sqMat = new THREE.LineBasicMaterial({color: 0xa86f14, transparent:true, opacity:.55});
  const sq = [[-2,0],[2,0],[2,4],[-2,4],[-2,0]].map(([x,y])=>new THREE.Vector3(x,y,0));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(sq), sqMat));
  const ciPts = [];
  for(let k=0;k<=72;k++){const a=k/72*Math.PI*2;
    ciPts.push(new THREE.Vector3(Math.cos(a)*R_CIRC, Y_NAVEL+Math.sin(a)*R_CIRC, 0));}
  const ciMat = new THREE.LineBasicMaterial({color: 0x1f7a6e, transparent:true, opacity:.55});
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ciPts), ciMat));
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),
    new THREE.MeshBasicMaterial({color: 0xc77f1a}));
  group.add(dot);
  group.visible = false;
  group.scale.setScalar(1.8);
  group.position.set(0, -3.9, -0.7);
  scene.add(group);

  const D = Math.PI/180;
  function pose(t){
    /* arms: horizontal → raised ~55°/70° */
    const a1 = t*55*D, a2 = t*70*D;
    for(const s of [-1,1]){
      const S=[s*0.5, 3.3];
      const E=[S[0]+s*0.55*Math.cos(a1), S[1]+0.55*Math.sin(a1)];
      const W=[E[0]+s*0.95*Math.cos(a2), E[1]+0.95*Math.sin(a2)];
      const ua=s<0?uaL:uaR, fa=s<0?faL:faR;
      place(ua, S[0],S[1], E[0],E[1]); place(fa, E[0],E[1], W[0],W[1]);
    }
    /* legs: straight → spread 16° + 6° knee */
    const sp = t*16*D, kn = t*6*D;
    for(const s of [-1,1]){
      const Hp=[s*0.14, 2.0];
      const K=[Hp[0]+s*Math.sin(sp)*1.0, Hp[1]-Math.cos(sp)*1.0];
      const A=[K[0]+s*Math.sin(sp+kn)*1.0, Math.max(0.07, K[1]-Math.cos(sp+kn)*1.0)];
      const th=s<0?thL:thR, sh=s<0?shL:shR, ft=s<0?ftL:ftR;
      place(th, Hp[0],Hp[1], K[0],K[1]); place(sh, K[0],K[1], A[0],A[1]);
      place(ft, A[0],A[1], A[0]+0.667, A[1]);   // foot = H/6 forward
    }
    const cy = Y_GROIN + (Y_NAVEL - Y_GROIN)*t;
    dot.position.set(0, cy, 0);
    sqMat.opacity = .55*(1-t*.5);
    ciMat.opacity = .3+.45*t;
    return t < .5
      ? {pose:'earthly', shape:'square', centre:'groin'}
      : {pose:'cosmic', shape:'circle', centre:'navel'};
  }
  pose(0);
  return { group, pose, show(v){ group.visible = v; } };
}
