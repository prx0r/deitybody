/* PracticeClock — ONE authoritative clock for practice playback.
   Audio-time upgrade path: pass getTime={()=>actx.currentTime} once audio
   exists; scheduling stays setTimeout-based with clock-derived offsets so
   pause/stop always behave. Seeking comes later. */
export class PracticeClock {
  constructor(getTime){
    this.now = getTime || (()=>performance.now()/1000);
    this.events=[]; this.timers=[]; this.playing=false;
  }
  at(tSec, fn){ this.events.push({t:tSec, fn}); return this; }
  clear(){ this.stop(); this.events=[]; }
  stop(){
    this.playing=false;
    this.timers.forEach(clearTimeout); this.timers=[];
  }
  play(){
    this.stop();
    if(!this.events.length) return;
    this.playing=true;
    const t0=this.now();
    for(const e of this.events){
      const ms=Math.max(0,(e.t-(this.now()-t0))*1000);
      this.timers.push(setTimeout(()=>{ if(this.playing) e.fn(); }, ms));
    }
    const last=Math.max(...this.events.map(e=>e.t));
    this.timers.push(setTimeout(()=>{ this.playing=false; }, last*1000+150));
  }
}
