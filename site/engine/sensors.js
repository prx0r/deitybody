/* Biosources — one interface, three origins. Visuals consume events;
   they never know or care which origin is live.
   simulated: average-human model (resting HR ~64 + HRV jitter, 0.1Hz breath).
   ble-hr: standard Heart Rate Service 0x180D via Web Bluetooth (Chrome/Edge only).
   muse: web-muse lib (EEG 256Hz + PPG heart on Muse 2/S; mock mode for dev).
   Honesty: simulated baseline is labeled SIMULATED everywhere it surfaces. */
export const HR_REST = 64;
export function hrvJitter(hrvMs=45){
  return (Math.random()+Math.random()+Math.random()-1.5)/1.5*hrvMs/1000;
}
export function beatInterval(hr=HR_REST, hrvMs=45){
  return 60/hr + hrvJitter(hrvMs);
}
export async function connectBleHr(onBeat){
  if(!('bluetooth' in navigator)) return {ok:false, reason:'no Web Bluetooth (use Chrome/Edge)'};
  const dev = await navigator.bluetooth.requestDevice({filters:[{services:['heart_rate']}]});
  const g = await dev.gatt.connect();
  const svc = await g.getPrimaryService('heart_rate');
  const ch = await svc.getCharacteristic('heart_rate_measurement');
  await ch.startNotifications();
  ch.addEventListener('characteristicvaluechanged', ev=>{
    const v = ev.target.value;
    const bpm = (v.getUint8(0)&0x01) ? v.getUint16(1,true) : v.getUint8(1);
    onBeat && onBeat({bpm, at:Date.now(), origin:'ble-hr'});
  });
  return {ok:true, device:dev.name||'hr-strap'};
}
/* Muse via web-muse (npm i web-muse) — dynamic import so non-Chrome stays light.
   Falls back to mock mode when available. Caller handles absence. */
export async function connectMuse(onSample){
  if(!('bluetooth' in navigator)) return {ok:false, reason:'no Web Bluetooth (use Chrome/Edge)'};
  let lib = null;
  try{ lib = await import('web-muse'); }
  catch(e){ return {ok:false, reason:'web-muse not installed (npm i web-muse)'}; }
  const muse = await (lib.connectMuse ? lib.connectMuse() : new lib.Muse({mock:true}).connect());
  return {ok:true, muse, onSample};
}
