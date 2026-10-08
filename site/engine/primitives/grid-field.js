/* Grid field — Wilczek-inspired vacuum behaviors (PEDAGOGICAL, not QFT).
   Behaviors, not equations:
   - virtual pairs: particles blink in/out; brighter = shorter-lived (ΔE·Δt feel)
   - excitations: taps/scores inject coherent wavefronts that propagate + decay
   - knots: sustained attention leaves a standing shimmer at a locus
   Closest prior art: ZPEVC/zpe-vc (click-catalyst vacuum, energy→phase events). */
import * as THREE from 'three';

export function buildGridField(opts){
  const { scene } = opts;
  const N = opts.count ?? 900;
  const R = opts.radius ?? 5.2;
  const pos = new Float32Array(N*3);
  const seed = new Float32Array(N*2);   // phase, energy
  const live = new Float32Array(N);     // 0..1 lifecycle position
  const excite = new Float32Array(N);   // coherent excitation 0..1
  for(let k=0;k<N;k++){
    const r = R*Math.cbrt(Math.random());
    const th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
    pos[k*3]=r*Math.sin(ph)*Math.cos(th); pos[k*3+1]=(Math.random()-.5)*9; pos[k*3+2]=r*Math.sin(ph)*Math.sin(th);
    seed[k*2]=Math.random()*Math.PI*2; seed[k*2+1]=0.3+Math.random()*0.7;
    live[k]=Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const col = new Float32Array(N*3);
  geo.setAttribute('color', new THREE.BufferAttribute(col,3));
  const mat = new THREE.PointsMaterial({size:0.045,transparent:true,opacity:0.8,
    vertexColors:true,blending:THREE.NormalBlending,depthWrite:false,sizeAttenuation:true});
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
  const group = new THREE.Group(); group.add(points); scene.add(group);
  return {
    group,
    /* coherent excitation around a world point (tap, pulse head, mantra locus) */
    stimulate(p, strength=1, radius=1.4){
      for(let k=0;k<N;k++){
        const dx=pos[k*3]-p.x, dy=pos[k*3+1]-p.y, dz=pos[k*3+2]-p.z;
        const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
        if(d<radius) excite[k]=Math.min(1.5, excite[k]+strength*(1-d/radius));
      }
    },
    /* standing knot: sustained shimmer at a locus (attention rests) */
    knot(p, strength=0.8){
      for(let k=0;k<N;k++){
        const dx=pos[k*3]-p.x, dy=pos[k*3+1]-p.y, dz=pos[k*3+2]-p.z;
        const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
        if(d<0.55) excite[k]=Math.min(1.5, excite[k]+strength*0.12);
      }
    },
    tick(dt, t){
      const a = geo.attributes.position.array;
      for(let k=0;k<N;k++){
        /* lifecycle: bright = brief */
        live[k]+=dt*(0.25+seed[k*2+1]*0.6);
        if(live[k]>1){ live[k]=0;
          const r=R*Math.cbrt(Math.random()), th=Math.random()*Math.PI*2;
          a[k*3]=r*Math.cos(th)*0.6; a[k*3+1]=(Math.random()-.5)*9; a[k*3+2]=r*Math.sin(th)*0.6;
        }
        const e=seed[k*2+1], L=1-Math.abs(1-live[k]*2);       // triangle envelope
        const glow=Math.min(1, L*(0.2+e*0.5));
        const ex=Math.min(1,excite[k]);
        /* slate vacuum + amber where excited (light background) */
        col[k*3]=0.42*glow+0.35*ex;
        col[k*3+1]=0.44*glow+0.22*ex;
        col[k*3+2]=0.5*glow+0.02*ex;
        /* drift + shimmer */
        pos[k*3]+=Math.sin(t*0.7+seed[k*2])*dt*0.05;
        pos[k*3+1]+=Math.cos(t*0.5+seed[k*2]*1.7)*dt*0.04;
        excite[k]*=Math.pow(0.35,dt);
      }
      geo.attributes.position.needsUpdate=true;
      geo.attributes.color.needsUpdate=true;
    },
    dispose(){ scene.remove(group); }
  };
}
