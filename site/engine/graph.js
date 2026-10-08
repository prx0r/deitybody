/* Typed Body Graph — three coordinate frames over one body.
   anatomical: scene-space points (procedural shell, NOT a person).
   phenomenological: felt regions of attention.
   tradition: per-framework loci (nyāsa, sephiroth, petals…).
   Heart-as-organ ≠ hṛdaya-as-seat: the frames stay distinct. */
let cache=null;
export async function loadGraph(){
  if(cache) return cache;
  const [body, phon] = await Promise.all([
    fetch('body/canonical-body.json').then(r=>r.json()),
    fetch('data/phonemes.json').then(r=>r.json()).catch(()=>null),
  ]);
  const nodes=new Map(), edges=[];
  for(const [name,r] of Object.entries(body.regions||{})){
    nodes.set('region:'+name,{kind:'region',id:name,frame:'phenomenological',y:r.y,nodes:r.nodes||[]});
  }
  for(const [name,c] of Object.entries(body.centers||{})){
    nodes.set('center:'+name,{kind:'center',id:name,frame:'phenomenological',x:c.x??0,y:c.y,z:c.z??0});
  }
  for(const [name] of Object.entries(body.channels||{})){
    nodes.set('channel:'+name,{kind:'channel',id:name,frame:'phenomenological'});
  }
  if(phon) for(const p of phon.phonemes||[]){
    nodes.set('phoneme:'+p.iast,{kind:'phoneme',id:p.iast,frame:'tradition',tradition:'trika',
      matrika:p.matrika, malini:p.malini, clip:p.clip});
    edges.push({from:'phoneme:'+p.iast, rel:'installed_at', to:'locus:'+p.matrika?.locus});
  }
  const api={
    data:body, nodes, edges,
    node(id){ return nodes.get(id)||null; },
    regionNodes(name){ return body.regions[name]?.nodes||[]; },
    traditionLoci(framework){
      if(framework==='trika'&&phon) return phon.phonemes.map(p=>({id:p.iast,...p}));
      return [];
    },
  };
  return cache=api;
}
