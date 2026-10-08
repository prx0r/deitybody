import {seeded,clamp} from './math-core.mjs';

function sampleField(field,x,y){
  const fx=clamp((x*.5+.5)*(field.width-1),0,field.width-1);
  const fy=clamp((y*.5+.5)*(field.height-1),0,field.height-1);
  const x0=Math.floor(fx),y0=Math.floor(fy),x1=Math.min(field.width-1,x0+1),y1=Math.min(field.height-1,y0+1);
  const tx=fx-x0,ty=fy-y0;
  const v00=field.values[y0*field.width+x0],v10=field.values[y0*field.width+x1];
  const v01=field.values[y1*field.width+x0],v11=field.values[y1*field.width+x1];
  return (v00*(1-tx)+v10*tx)*(1-ty)+(v01*(1-tx)+v11*tx)*ty;
}

function gradientAbs(field,x,y,eps=.008){
  const ax=Math.abs(sampleField(field,x+eps,y))-Math.abs(sampleField(field,x-eps,y));
  const ay=Math.abs(sampleField(field,x,y+eps))-Math.abs(sampleField(field,x,y-eps));
  return {x:ax/(2*eps),y:ay/(2*eps)};
}

export function createParticles({count=3000,seed=1,domain="square"}={}){
  const rng=seeded(seed),particles=[];
  while(particles.length<count){
    const x=rng()*2-1,y=rng()*2-1;
    if(domain==="circle"&&x*x+y*y>1)continue;
    particles.push({x,y,vx:0,vy:0,age:rng(),id:particles.length});
  }
  return particles;
}

export function stepParticles(particles,field,{
  dt=.016,attraction=1.4,damping=.91,noise=.02,seed=1,domain="square"
}={}){
  const rng=seeded(seed+Math.floor((field.time??0)*10000));
  return particles.map(p=>{
    const g=gradientAbs(field,p.x,p.y);
    let vx=(p.vx-attraction*g.x*dt)*damping+(rng()-.5)*noise;
    let vy=(p.vy-attraction*g.y*dt)*damping+(rng()-.5)*noise;
    let x=p.x+vx*dt,y=p.y+vy*dt;
    if(domain==="circle"){
      const r=Math.hypot(x,y);
      if(r>1){x/=r;y/=r;vx*=-.4;vy*=-.4;}
    }else{
      if(Math.abs(x)>1){x=clamp(x,-1,1);vx*=-.4;}
      if(Math.abs(y)>1){y=clamp(y,-1,1);vy*=-.4;}
    }
    return {...p,x,y,vx,vy,age:(p.age+dt)%1};
  });
}

export function particleNodalScore(particles,field){
  if(!particles.length)return 0;
  return particles.reduce((s,p)=>s+Math.abs(sampleField(field,p.x,p.y)),0)/particles.length;
}
