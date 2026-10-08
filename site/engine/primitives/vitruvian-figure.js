/* Vitruvian figure v3 — one canon, three poses: standing (two-pose morph),
   seated lotus, lying (savasana). Segment lengths canonical (H=4):
   upper-arm .55, fore+hand .95, thigh 1.0, shank 1.0, foot H/6, head H/8.
   Torso/pelvis/head reposition per pose. Group transform per pose keeps
   feet/seat inside the square frame. */
import * as THREE from 'three';

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
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 1, 20), mat);
  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), mat);
  pelvis.scale.set(1.25, 0.75, 0.7);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.3, 12), mat);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 16), mat);
  group.add(torso, pelvis, neck, head);
  const uaL=seg(0.11,mat), uaR=seg(0.11,mat), faL=seg(0.09,mat), faR=seg(0.09,mat);
  const thL=seg(0.16,mat), thR=seg(0.16,mat), shL=seg(0.11,mat), shR=seg(0.11,mat);
  const ftL=seg(0.07,mat), ftR=seg(0.07,mat);
  [uaL,uaR,faL,faR,thL,thR,shL,shR,ftL,ftR].forEach(m=>group.add(m));
  /* square (centre groin 2.0, side H) + circle (centre navel 2.4, r to crown) */
  const sqMat = new THREE.LineBasicMaterial({color: 0xa86f14, transparent:true, opacity:.55});
  const sq = [[-2,0],[2,0],[2,4],[-2,4],[-2,0]].map(([x,y])=>new THREE.Vector3(x,y,0));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(sq), sqMat));
  const ciPts = [];
  for(let k=0;k<=72;k++){const a=k/72*Math.PI*2;
    ciPts.push(new THREE.Vector3(Math.cos(a)*1.6, 2.4+Math.sin(a)*1.6, 0));}
  const ciMat = new THREE.LineBasicMaterial({color: 0x1f7a6e, transparent:true, opacity:.55});
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ciPts), ciMat));
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),
    new THREE.MeshBasicMaterial({color: 0xc77f1a}));
  group.add(dot);
  group.visible = false;
  scene.add(group);

  const D = Math.PI/180;
  const J = {};   // named joints, useful for future IK / constraints
  function standing(t){
    /* arms: horizontal → raised; legs: together → spread */
    const a1 = t*55*D, a2 = t*70*D, sp = t*16*D, kn = t*6*D;
    for(const s of [-1,1]){
      const S=[s*0.5, 3.3];
      const E=[S[0]+s*0.55*Math.cos(a1), S[1]+0.55*Math.sin(a1)];
      const W=[E[0]+s*0.95*Math.cos(a2), E[1]+0.95*Math.sin(a2)];
      place(s<0?uaL:uaR, S[0],S[1], E[0],E[1]); place(s<0?faL:faR, E[0],E[1], W[0],W[1]);
      const Hp=[s*0.14, 2.0];
      const K=[Hp[0]+s*Math.sin(sp)*1.0, Hp[1]-Math.cos(sp)*1.0];
      const A=[K[0]+s*Math.sin(sp+kn)*1.0, Math.max(0.07, K[1]-Math.cos(sp+kn)*1.0)];
      place(s<0?thL:thR, Hp[0],Hp[1], K[0],K[1]);
      place(s<0?shL:shR, K[0],K[1], A[0],A[1]);
      place(s<0?ftL:ftR, A[0],A[1], A[0]+0.667, A[1]);
      J[s<0?'elbowL':'elbowR']=E; J[s<0?'wristL':'wristR']=W;
      J[s<0?'kneeL':'kneeR']=K; J[s<0?'ankleL':'ankleR']=A;
    }
    torso.position.set(0, 2.65, 0); torso.rotation.z = 0;
    pelvis.position.set(0, 1.95, 0);
    neck.position.set(0, 3.42, 0); head.position.set(0, 3.75, 0);
    J.crown=[0,4.0]; J.navel=[0,2.4]; J.groin=[0,2.0];
    const cy = 2.0 + (2.4-2.0)*t;
    dot.position.set(0, cy, 0);
    sqMat.opacity = .55*(1-t*.5); ciMat.opacity = .3+.45*t;
    group.position.set(0, -3.9, -0.7); group.rotation.z = 0; group.scale.setScalar(1.8);
    return t < .5
      ? {pose:'earthly', shape:'square', centre:'groin'}
      : {pose:'cosmic', shape:'circle', centre:'navel'};
  }
  function seated(){
    /* padmasana: seat low, spine tall, knees wide, hands resting to knees */
    const seat = 0.35;
    torso.position.set(0, seat+0.75, 0);
    pelvis.position.set(0, seat, 0);
    neck.position.set(0, seat+1.5, 0); head.position.set(0, seat+1.72, 0);
    for(const s of [-1,1]){
      const S=[s*0.42, seat+1.32];
      const E=[s*0.68, seat+0.72];
      const W=[s*0.88, seat+0.28];
      place(s<0?uaL:uaR, S[0],S[1], E[0],E[1]); place(s<0?faL:faR, E[0],E[1], W[0],W[1]);
      const Hp=[s*0.16, seat];
      const K=[s*0.92, seat-0.02];
      const A=[-s*0.3, seat-0.12];
      place(s<0?thL:thR, Hp[0],Hp[1], K[0],K[1]);
      place(s<0?shL:shR, K[0],K[1], A[0],A[1]);
      place(s<0?ftL:ftR, A[0],A[1], A[0]-s*0.4, A[1]);
      J[s<0?'kneeL':'kneeR']=K; J[s<0?'wristL':'wristR']=W;
    }
    J.crown=[0,seat+1.97]; J.navel=[0,seat+0.95]; J.groin=[0,seat];
    dot.position.set(0, seat+0.95, 0);
    sqMat.opacity = .3; ciMat.opacity = .3;
    group.position.set(0, -3.5, -0.7); group.rotation.z = 0; group.scale.setScalar(1.8);
    return {pose:'seated-lotus', shape:'seat', centre:'navel'};
  }
  function lying(){
    /* savasana: standing geometry laid horizontal, arms slightly out */
    standing(0.08);
    group.rotation.z = -Math.PI/2;
    group.position.set(-3.4, -0.9, -0.7);
    dot.position.set(0, 2.2, 0);
    return {pose:'lying', shape:'horizon', centre:'navel'};
  }
  let poseName = 'standing';
  return {
    group,
    pose(t){ return poseName==='standing' ? standing(t) : poseName==='seated' ? seated() : lying(); },
    setPose(name){
      poseName = name;
      if(name==='standing'){ group.rotation.z=0; standing(0); }
      else if(name==='seated'){ group.rotation.z=0; seated(); }
      else { lying(); }
      return poseName;
    },
    getPose: ()=>poseName,
    joints: J,
    show(v){ group.visible = v; }
  };
}
