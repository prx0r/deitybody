/* Vitruvian figure — two poses, two centres. Pose A (earthly): feet together,
   arms horizontal → fits the SQUARE, centre at groin. Pose B (cosmic): legs
   spread, arms raised → fits the CIRCLE, centre at navel. Morph t: 0→1.
   Units: height 4 (cubits), navel 2.47, groin 2.0 — Vitruvian text ratios. */
import * as THREE from 'three';

const H = 4, Y_NAVEL = 2.47, Y_GROIN = 2.0;
const HEAD_R = 0.32, SH_Y = 3.32, HIP_Y = 2.0;

function limb(mat){
  const g = new THREE.BufferGeometry().setFromPoints(
    [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
  return new THREE.Line(g, mat);
}
function setLimb(m, ax, ay, jx, jy, bx, by){
  const p = m.geometry.attributes.position;
  p.setXYZ(0, ax, ay, 0); p.setXYZ(1, jx, jy, 0); p.setXYZ(2, bx, by, 0);
  p.needsUpdate = true;
}

export function buildVitruvianFigure(opts){
  const { scene } = opts;
  const gold = 0xa86f14, teal = 0x1f7a6e;
  const mat = new THREE.LineBasicMaterial({color: gold, transparent:true, opacity:.85});
  const group = new THREE.Group();
  /* torso + head */
  const torsoPts = [new THREE.Vector3(0, HIP_Y, 0), new THREE.Vector3(0, 3.62, 0)];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(torsoPts), mat));
  const head = new THREE.Mesh(new THREE.TorusGeometry(HEAD_R, .012, 8, 48),
    new THREE.MeshBasicMaterial({color: gold, transparent:true, opacity:.85}));
  head.position.set(0, 3.62 + HEAD_R, 0); group.add(head);
  /* limbs: L/R arms (shoulder-elbow-hand), L/R legs (hip-knee-foot) */
  const arms = [limb(mat), limb(mat)], legs = [limb(mat), limb(mat)];
  arms.forEach(a=>group.add(a)); legs.forEach(l=>group.add(l));
  /* square (centre groin) + circle (centre navel) */
  const sqPts = [[-2,0],[2,0],[2,4],[-2,4],[-2,0]].map(([x,y])=>new THREE.Vector3(x,y,0));
  const square = new THREE.Line(new THREE.BufferGeometry().setFromPoints(sqPts),
    new THREE.LineBasicMaterial({color: gold, transparent:true, opacity:.5}));
  group.add(square);
  const circPts = [];
  const rC = 4 - Y_NAVEL;
  for(let k=0;k<=72;k++){const a=k/72*Math.PI*2;
    circPts.push(new THREE.Vector3(Math.cos(a)*rC, Y_NAVEL+Math.sin(a)*rC, 0));}
  const circle = new THREE.Line(new THREE.BufferGeometry().setFromPoints(circPts),
    new THREE.LineBasicMaterial({color: teal, transparent:true, opacity:.5}));
  group.add(circle);
  /* centre marker */
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8),
    new THREE.MeshBasicMaterial({color: 0xc77f1a}));
  group.add(dot);
  group.visible = false;
  group.position.set(0, -3.4, -0.6);
  scene.add(group);

  function pose(t){
    /* arms: horizontal (t=0) → raised ~35° (t=1) */
    const ang = t * 0.6, L1 = 0.75, L2 = 0.7;
    for(const s of [-1, 1]){
      const ax = s*0.28, ay = SH_Y;
      const ex = ax + s*Math.cos(ang)*L1, ey = ay + Math.sin(ang)*L1;
      const hx = ex + s*Math.cos(ang*0.7)*L2, hy = ey + Math.sin(ang*0.7)*L2;
      setLimb(arms[s<0?0:1], ax, ay, ex, ey, hx, hy);
    }
    /* legs: together (t=0) → spread ~28° (t=1) */
    const sp = t * 0.5, G1 = 1.0, G2 = 1.0;
    for(const s of [-1, 1]){
      const kx = s*Math.sin(sp)*G1, ky = HIP_Y - Math.cos(sp)*G1;
      const fx = s*Math.sin(sp)* (G1+G2)*0.95, fy = HIP_Y - Math.cos(sp)*(G1+G2)*0.98;
      setLimb(legs[s<0?0:1], s*0.12, HIP_Y, kx, ky, fx, Math.max(0, fy));
    }
    /* centre glides groin → navel; shapes trade emphasis */
    const cy = Y_GROIN + (Y_NAVEL - Y_GROIN)*t;
    dot.position.set(0, cy, 0);
    square.material.opacity = .5*(1-t*.6);
    circle.material.opacity = .25+.5*t;
    return t < .5
      ? {pose:'earthly', shape:'square', centre:'groin'}
      : {pose:'cosmic', shape:'circle', centre:'navel'};
  }
  pose(0);
  return { group, pose,
    show(v){ group.visible = v; } };
}
