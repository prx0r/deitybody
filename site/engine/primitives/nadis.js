/* Nadi network — ten principal channels from waypoint data.
   Schematic attention-paths (CatmullRom tubes), never anatomy.
   Pose-aware: waypoints pass through xfPos like everything else. */
import * as THREE from 'three';

export function buildNadis(cfg, opts){
  const { scene, mapPoint } = opts;
  const group = new THREE.Group();
  const color = opts.color ?? 0x8a6f3c;
  const built = [];
  function draw(){
    for(const b of built){ group.remove(b); b.geometry.dispose(); }
    built.length = 0;
    for(const n of cfg.nadis){
      if(n.id==='sushumna'||n.id==='ida'||n.id==='pingala') continue; // main channels already live
      const pts = n.points.map(p=>{
        const [x,y] = mapPoint ? mapPoint(p[0],p[1]) : [p[0],p[1]];
        return new THREE.Vector3(x,y,p[2]??0);
      });
      if(pts.length<2) continue;
      const m = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .012, 6),
        new THREE.MeshBasicMaterial({color, transparent:true, opacity:.5}));
      group.add(m); built.push(m);
    }
    /* kanda hub */
    const h = cfg.hub?.at || [0,-1.6,0];
    const [hx,hy] = mapPoint ? mapPoint(h[0],h[1]) : [h[0],h[1]];
    const hub = new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),
      new THREE.MeshBasicMaterial({color:0xc77f1a}));
    hub.position.set(hx,hy,h[2]??0); group.add(hub); built.push(hub);
  }
  draw();
  group.visible = false;
  scene.add(group);
  return { group, redraw:draw, count:cfg.nadis.length };
}
