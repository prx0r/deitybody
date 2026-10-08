import {TAU,clamp,linspace} from "../core/math.mjs";

export function squareMembraneMode({m=1,n=1,width=1,height=1,waveSpeed=1}={}){
  if(m<1||n<1)throw new Error("m and n must be >= 1");
  const frequency=.5*waveSpeed*Math.sqrt(Math.pow(m/width,2)+Math.pow(n/height,2));
  return {
    id:`square-${m}-${n}`,m,n,frequency,bandwidthHz:Math.max(.5,frequency*.015),
    evaluate:(x,y)=>Math.sin(m*Math.PI*(x/width+.5))*Math.sin(n*Math.PI*(y/height+.5)),
    boundary:"simply-supported approximation",
    status:"analytic membrane approximation"
  };
}

export function rectangularPlateFrequency({
  m=1,n=1,width=1,height=1,youngsModulus=69e9,
  poisson=.33,density=2700,thickness=.001
}={}){
  const D=youngsModulus*Math.pow(thickness,3)/(12*(1-poisson*poisson));
  const k2=Math.pow(m*Math.PI/width,2)+Math.pow(n*Math.PI/height,2);
  const omega=Math.sqrt(D/(density*thickness))*k2;
  return omega/TAU;
}

export function squarePlateMode(config={}){
  const base=squareMembraneMode(config);
  return {
    ...base,
    frequency:rectangularPlateFrequency(config),
    boundary:config.boundary??"simply-supported thin-plate approximation",
    status:"Kirchhoff-Love analytic approximation"
  };
}

function besselJ(n,x){
  let sum=0;
  for(let k=0;k<30;k++){
    const sign=k%2?-1:1;
    let factorialK=1,factorialNK=1;
    for(let i=2;i<=k;i++)factorialK*=i;
    for(let i=2;i<=n+k;i++)factorialNK*=i;
    const term=sign*Math.pow(x/2,2*k+n)/(factorialK*factorialNK);
    sum+=term;
    if(Math.abs(term)<1e-12)break;
  }
  return sum;
}

const BESSEL_ZEROS={
  "0":[2.404825558,5.52007811,8.653727913,11.79153444],
  "1":[3.83170597,7.01558667,10.17346814,13.32369194],
  "2":[5.135622302,8.41724414,11.61984117,14.79595178],
  "3":[6.380161896,9.76102313,13.01520072,16.22346616],
  "4":[7.588342435,11.06470949,14.37253667,17.61596605]
};

export function circularMembraneMode({angular=0,radial=1,radius=1,waveSpeed=1,phase=0}={}){
  const zero=BESSEL_ZEROS[String(angular)]?.[radial-1];
  if(!zero)throw new Error("supported angular 0-4 and radial 1-4");
  const frequency=waveSpeed*zero/(TAU*radius);
  return {
    id:`circle-${angular}-${radial}`,angular,radial,frequency,
    bandwidthHz:Math.max(.5,frequency*.015),
    evaluate:(x,y)=>{
      const r=Math.hypot(x,y)/radius;
      if(r>1)return 0;
      const theta=Math.atan2(y,x);
      return besselJ(angular,zero*r)*Math.cos(angular*theta+phase);
    },
    boundary:"fixed circular membrane approximation",
    status:"analytic Bessel-mode approximation"
  };
}

export function generateModeBank({
  geometry="square",maxOrder=6,dimensions={},material={}
}={}){
  const modes=[];
  if(geometry==="square"||geometry==="rectangle"){
    for(let m=1;m<=maxOrder;m++)for(let n=1;n<=maxOrder;n++){
      modes.push(squarePlateMode({m,n,...dimensions,...material}));
    }
  }else if(geometry==="circle"){
    for(let angular=0;angular<=Math.min(4,maxOrder);angular++){
      for(let radial=1;radial<=Math.min(4,maxOrder);radial++){
        modes.push(circularMembraneMode({angular,radial,...dimensions,...material}));
      }
    }
  }else throw new Error(`unsupported geometry ${geometry}`);
  return modes.sort((a,b)=>a.frequency-b.frequency);
}

export function sampleMode(mode,{resolution=128,extent=1}={}){
  const values=new Float64Array(resolution*resolution);
  let maxAbs=0;
  for(let j=0;j<resolution;j++)for(let i=0;i<resolution;i++){
    const x=(i/(resolution-1)-.5)*2*extent;
    const y=(j/(resolution-1)-.5)*2*extent;
    const value=mode.evaluate(x,y);
    values[j*resolution+i]=value;maxAbs=Math.max(maxAbs,Math.abs(value));
  }
  if(maxAbs>0)for(let i=0;i<values.length;i++)values[i]/=maxAbs;
  return {width:resolution,height:resolution,values,maxAbs,modeId:mode.id};
}

export function nodalMask(field,{threshold=.035}={}){
  return {
    ...field,
    values:Uint8Array.from(field.values,x=>Math.abs(x)<=threshold?1:0),
    threshold
  };
}
