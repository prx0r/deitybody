/* Recall drills — G2 body-part-only phase. Hear → choose → reveal → self-grade.
   Tap answers (objective) + self-grade path; no ASR claims. Progress in localStorage. */
export function fourChoices(records, answer, map){
  const others = records.filter(p=>p.iast!==answer).sort(()=>Math.random()-0.5).slice(0,3);
  const opts = [records.find(p=>p.iast===answer), ...others].sort(()=>Math.random()-0.5);
  return opts.map(p=>({iast:p.iast, dev:p.dev, locus:p.placements[map].regionId}));
}
export function loadProgress(){
  try{ return JSON.parse(localStorage.getItem('mantrabody-progress')||'{}'); }catch(e){ return {}; }
}
export function saveProgress(p){
  try{ localStorage.setItem('mantrabody-progress', JSON.stringify(p)); }catch(e){}
}
export function recordResult(progress, phonemeId, mapId, direction, correct){
  const k = `${phonemeId}|${mapId}|${direction}`;
  const r = progress[k] || {seen:0, correct:0};
  r.seen++; if(correct) r.correct++;
  progress[k] = r; saveProgress(progress);
  return r;
}
export function weakest(progress, ids, mapId, n=8){
  const scored = ids.map(id=>{
    let s = 0, seen = 0;
    for(const d of ['sound_to_body','body_to_sound']){
      const r = progress[`${id}|${mapId}|${d}`];
      if(r && r.seen){ s += r.correct/r.seen; seen++; }
    }
    return {id, rate: seen? s/seen : -1};
  });
  scored.sort((a,b)=>a.rate-b.rate);
  return scored.slice(0,n).map(x=>x.id);
}
