import {rk4} from './math-core.mjs';
export const SYSTEMS={
 lorenz:({sigma=10,rho=28,beta=8/3}={})=>s=>[sigma*(s[1]-s[0]),s[0]*(rho-s[2])-s[1],s[0]*s[1]-beta*s[2]],
 rossler:({a=.2,b=.2,c=5.7}={})=>s=>[-s[1]-s[2],s[0]+a*s[1],b+s[2]*(s[0]-c)],
 duffing:({delta=.2,alpha=-1,beta=1,gamma=.3,omega=1.2,time=0}={})=>s=>[s[1],-delta*s[1]-alpha*s[0]-beta*s[0]**3+gamma*Math.cos(omega*(s[2]??time)),1],
 doubleWell:({tilt=0}={})=>s=>[s[1],-(s[0]**3-s[0]+tilt)-.24*s[1]]
};
export function trajectory({system,initial,dt=.01,steps=5000,burn=0}={}){let s=[...initial],points=[];for(let i=0;i<steps+burn;i++){s=rk4(s,dt,system);if(i>=burn)points.push([...s]);}return points;}
export function logisticOrbit({r=3.8,x0=.2,steps=1000,burn=200}={}){let x=x0,out=[];for(let i=0;i<steps+burn;i++){x=r*x*(1-x);if(i>=burn)out.push(x);}return out;}
export function bifurcation({rMin=2.8,rMax=4,rSamples=500,orbitSamples=100,burn=500}={}){const points=[];for(let i=0;i<rSamples;i++){const r=rMin+(rMax-rMin)*i/(rSamples-1);for(const x of logisticOrbit({r,steps:orbitSamples,burn}))points.push({r,x});}return points;}
