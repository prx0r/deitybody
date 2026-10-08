/* Canonical path registry — every channel is an addressed path with
   arc-length travel. Poses rebuild the same paths; visuals never own curves.
   Uses three's built-in arc-length mapping (getPointAt/getTangentAt), so
   constant u-steps are constant-distance steps. Junctions explicit. */
import * as THREE from 'three';

export function createPathRegistry(scene){
  const paths = new Map();
  const api = {
    register(id, {points, color=0xc9a45c, radius=0.02, opacity=0.6, provenance=''}){
      let rec = paths.get(id);
      if(rec){ rec.basePoints = points.map(p=>p.slice()); }
      else { rec = {id, color, radius, opacity, provenance, mesh:null, curve:null,
        basePoints: points.map(p=>p.slice())}; }
      paths.set(id, rec);
      return rec;
    },
    rebuild(mapFn){
      for(const rec of paths.values()){
        if(rec.mesh){ scene.remove(rec.mesh); rec.mesh.geometry.dispose(); }
        const pts = rec.basePoints.map(p=>{
          const [x,y] = mapFn ? mapFn(p[0],p[1]) : [p[0],p[1]];
          return new THREE.Vector3(x,y,p[2]??0);
        });
        rec.curve = new THREE.CatmullRomCurve3(pts);
        rec.mesh = new THREE.Mesh(
          new THREE.TubeGeometry(rec.curve, 100, rec.radius, 6),
          new THREE.MeshBasicMaterial({color:rec.color,transparent:true,opacity:rec.opacity}));
        scene.add(rec.mesh);
      }
    },
    /* constant-speed position: u in 0..1 */
    posAt(id, u, out=new THREE.Vector3()){
      const r = paths.get(id); if(!r||!r.curve) return out.set(0,0,0);
      return r.curve.getPointAt(Math.max(0,Math.min(1,u)), out);
    },
    tangentAt(id, u, out=new THREE.Vector3()){
      const r = paths.get(id); if(!r||!r.curve) return out.set(0,1,0);
      return r.curve.getTangentAt(Math.max(0,Math.min(1,u)), out);
    },
    length(id){ const r = paths.get(id); return r&&r.curve ? r.curve.getLength() : 0; },
    setVisible(id, v){ const r = paths.get(id); if(r&&r.mesh) r.mesh.visible = v; },
    ids(){ return [...paths.keys()]; },
  };
  return api;
}
