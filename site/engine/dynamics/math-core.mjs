export const TAU=Math.PI*2;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
export function linspace(a,b,n){return Array.from({length:n},(_,i)=>lerp(a,b,n===1?0:i/(n-1)));}
export function range(n){return Array.from({length:n},(_,i)=>i);}
export function rms(s){let a=0;for(let i=0;i<s.length;i++)a+=s[i]*s[i];return Math.sqrt(a/Math.max(1,s.length));}
export function seeded(seed=1){let s=seed>>>0;return()=>((s=(1664525*s+1013904223)>>>0)/4294967296);}
export function rk4(state,dt,derivative){const add=(a,b,k=1)=>a.map((x,i)=>x+b[i]*k);const k1=derivative(state),k2=derivative(add(state,k1,dt/2)),k3=derivative(add(state,k2,dt/2)),k4=derivative(add(state,k3,dt));return state.map((x,i)=>x+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);}
