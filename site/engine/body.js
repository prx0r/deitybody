/* Body address space — regions, channels, centres as named addresses.
   Practices speak addresses ("heart", "spine"); the renderer decides the look.
   Pure data + math. No scene, no DOM. */
import * as THREE from 'three';
let cache=null;
export async function loadBody(){
  if(cache) return cache;
  const j=await (await fetch('body/canonical-body.json')).json();
  const api={
    data:j,
    regionY(name){ const r=j.regions[name]; if(!r) throw new Error('region:'+name); return r.y; },
    center(name){
      const c=j.centers[name]||j.mp_centers?.[name];
      if(!c) throw new Error('center:'+name);
      return new THREE.Vector3(c.x??0, c.y, c.z??0);
    },
    channel(name){
      const ch=j.channels[name]; if(!ch) throw new Error('channel:'+name);
      const pts=ch.points.map(p=>new THREE.Vector3(p[0],p[1],p[2]??0));
      return new THREE.CatmullRomCurve3(pts);
    },
    regionNodes(name){
      const r=j.regions[name]; if(!r) throw new Error('region:'+name);
      return r.nodes||[];
    }
  };
  return cache=api;
}
