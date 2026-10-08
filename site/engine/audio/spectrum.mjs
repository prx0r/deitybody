import {TAU,clamp,rms} from "../dynamics/math-core.mjs";

export function hann(n,N){return .5-.5*Math.cos(TAU*n/(N-1||1));}

export function dftReal(samples,{sampleRate=44100,bins=Math.min(512,Math.floor(samples.length/2))}={}){
  const N=samples.length;
  const spectrum=[];
  for(let k=0;k<bins;k++){
    let re=0,im=0;
    for(let n=0;n<N;n++){
      const x=samples[n]*hann(n,N),a=-TAU*k*n/N;
      re+=x*Math.cos(a);im+=x*Math.sin(a);
    }
    const magnitude=Math.hypot(re,im)/Math.max(1,N/2);
    spectrum.push({bin:k,frequency:k*sampleRate/N,re,im,magnitude,phase:Math.atan2(im,re)});
  }
  return spectrum;
}

export function spectralMoments(spectrum,{minHz=0,maxHz=Infinity}={}){
  const rows=spectrum.filter(x=>x.frequency>=minHz&&x.frequency<=maxHz);
  const total=rows.reduce((s,x)=>s+x.magnitude,0)||1;
  const centroid=rows.reduce((s,x)=>s+x.frequency*x.magnitude,0)/total;
  const variance=rows.reduce((s,x)=>s+Math.pow(x.frequency-centroid,2)*x.magnitude,0)/total;
  const sd=Math.sqrt(variance)||1;
  const skewness=rows.reduce((s,x)=>s+Math.pow((x.frequency-centroid)/sd,3)*x.magnitude,0)/total;
  const kurtosis=rows.reduce((s,x)=>s+Math.pow((x.frequency-centroid)/sd,4)*x.magnitude,0)/total;
  return {centroid,variance,skewness,kurtosis,totalMagnitude:total};
}

export function estimateFundamental(spectrum,{minHz=60,maxHz=1000}={}){
  const rows=spectrum.filter(x=>x.frequency>=minHz&&x.frequency<=maxHz);
  if(!rows.length)return null;
  let best=rows[0];
  for(const row of rows)if(row.magnitude>best.magnitude)best=row;
  return {frequency:best.frequency,magnitude:best.magnitude};
}

export function bandEnergy(spectrum,lo,hi){
  return spectrum.filter(x=>x.frequency>=lo&&x.frequency<hi).reduce((s,x)=>s+x.magnitude*x.magnitude,0);
}

export function analyzeFrame(samples,{sampleRate=44100,bins}={}){
  const spectrum=dftReal(samples,{sampleRate,bins});
  const moments=spectralMoments(spectrum);
  const total=spectrum.reduce((s,x)=>s+x.magnitude*x.magnitude,0)||1;
  return {
    rms:rms(samples),
    spectrum,
    fundamental:estimateFundamental(spectrum),
    moments,
    bands:{
      low:bandEnergy(spectrum,20,250)/total,
      mid:bandEnergy(spectrum,250,2000)/total,
      high:bandEnergy(spectrum,2000,Math.min(12000,sampleRate/2))/total
    }
  };
}

export function modalForcing(spectrum,modes,{bandwidthHz=12,compression=.55}={}){
  return modes.map(mode=>{
    let energy=0;
    for(const bin of spectrum){
      const z=(bin.frequency-mode.frequency)/Math.max(bandwidthHz,mode.bandwidthHz??bandwidthHz);
      const response=Math.exp(-.5*z*z);
      energy+=bin.magnitude*response;
    }
    return {...mode,forcing:Math.pow(Math.max(0,energy),compression)};
  });
}
