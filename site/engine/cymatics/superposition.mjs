export function superposeModes(weightedModes,x,y,time=0){
  let value=0;
  for(const item of weightedModes){
    const phase=item.phase??0;
    const temporal=Math.cos(2*Math.PI*item.frequency*time+phase);
    value+=(item.amplitude??1)*item.evaluate(x,y)*temporal;
  }
  return value;
}

export function buildDrivenField(weightedModes,{resolution=128,extent=1,time=0}={}){
  const values=new Float64Array(resolution*resolution);
  let maxAbs=0;
  for(let j=0;j<resolution;j++)for(let i=0;i<resolution;i++){
    const x=(i/(resolution-1)-.5)*2*extent;
    const y=(j/(resolution-1)-.5)*2*extent;
    const value=superposeModes(weightedModes,x,y,time);
    values[j*resolution+i]=value;maxAbs=Math.max(maxAbs,Math.abs(value));
  }
  if(maxAbs>0)for(let i=0;i<values.length;i++)values[i]/=maxAbs;
  return {width:resolution,height:resolution,values,maxAbs,time};
}

export function selectDrivenModes(modalForcing,{maximumModes=8,minimumForcing=.001}={}){
  return modalForcing
    .filter(x=>x.forcing>=minimumForcing)
    .sort((a,b)=>b.forcing-a.forcing)
    .slice(0,maximumModes)
    .map(x=>({...x,amplitude:x.forcing}));
}
