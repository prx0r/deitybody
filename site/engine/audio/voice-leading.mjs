const mod=(x,n)=>((x%n)+n)%n;

export function normalizeChord(chord,{period=12}={}){
  return [...chord].map(x=>mod(x,period)).sort((a,b)=>a-b);
}
function permutations(xs){
  if(xs.length<=1)return [xs];
  return xs.flatMap((x,i)=>permutations([...xs.slice(0,i),...xs.slice(i+1)]).map(rest=>[x,...rest]));
}
function circularDistance(a,b,period=12){
  const d=Math.abs(mod(a-b,period));
  return Math.min(d,period-d);
}
export function optimalVoiceLeading(a,b,{period=12}={}){
  if(a.length!==b.length)throw new Error("chords must contain equal numbers of voices");
  const source=normalizeChord(a,{period}),target=normalizeChord(b,{period});
  let best=null;
  for(const perm of permutations(target)){
    const motions=source.map((x,i)=>{
      let delta=mod(perm[i]-x,period);
      if(delta>period/2)delta-=period;
      return delta;
    });
    const distance=Math.sqrt(motions.reduce((s,x)=>s+x*x,0));
    if(!best||distance<best.distance)best={source,target:perm,motions,distance};
  }
  return best;
}
export function chordOrbifoldPoint(chord,{period=12}={}){
  const normalized=normalizeChord(chord,{period});
  const center=normalized.reduce((a,b)=>a+b,0)/normalized.length;
  const centered=normalized.map(x=>x-center);
  return {
    ordered:normalized,
    center:mod(center,period),
    intervals:normalized.map((x,i)=>mod(normalized[(i+1)%normalized.length]-x,period)),
    quotientCoordinates:centered
  };
}
export function voiceLeadingPath(chords,options={}){
  const steps=[];
  for(let i=0;i<chords.length-1;i++)steps.push(optimalVoiceLeading(chords[i],chords[i+1],options));
  return {chords:chords.map(x=>normalizeChord(x,options)),steps,totalDistance:steps.reduce((s,x)=>s+x.distance,0)};
}
