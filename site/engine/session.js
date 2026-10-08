/* Session — deterministic Practice Engine.
   Owns canonical practice state. Renderer visualizes it; AI queries it;
   sensors (later) observe alongside it. Three states kept distinct:
   expected (prescribed) / rendered (shown) / reported (practitioner said). */
import { PracticeClock } from './clock.js';

export class Session {
  constructor(){
    this.clock = new PracticeClock();
    this.practice = null;      // {id,title,source}
    this.events = [];
    this.phases = [];          // [{id,title,at}]
    this.phaseIdx = -1;
    this.t0 = 0;
    this.reported = [];        // [{t, text}]
    this.rendered = null;      // last rendered event summary
    this.listeners = new Set();
    this.guide = { voice:false, verbose:true };
  }
  on(fn){ this.listeners.add(fn); return ()=>this.listeners.delete(fn); }
  emit(kind, data){ for(const fn of this.listeners){ try{fn(kind,data);}catch(e){} } }
  loadPractice(meta, events, phases=[]){
    this.clock.clear();
    this.practice = meta;
    this.events = events;
    this.phases = phases.length ? phases : inferPhases(events);
    this.phaseIdx = -1;
    for(const e of events) this.clock.at(e.t, ()=>this.fire(e));
    return this;
  }
  play(fromT=0){
    this.clock.clear();
    for(const e of this.events){
      if(e.t>=fromT-1e-6) this.clock.at(e.t-fromT, ()=>this.fire(e));
    }
    this.t0 = Date.now()-fromT*1000;
    this.pausedAt = null;
    this.clock.play(); this.emit('play', this.snapshot());
  }
  pause(){ this.pausedAt=this.elapsed(); this.clock.stop(); this.emit('pause', this.snapshot()); }
  resume(){ this.play(this.pausedAt||0); this.emit('resume', this.snapshot()); }
  stop(){ this.clock.clear(); this.phaseIdx=-1; this.pausedAt=null; this.emit('stop', this.snapshot()); }
  fire(e){
    if(e.do==='phase'){ this.phaseIdx = this.phases.findIndex(p=>p.id===e.id); }
    this.rendered = { t: e.t, do: e.do, label: e.node||e.id||e.at||e.from||'' };
    if(this.render) { try{ this.render(e); }catch(err){} }
    this.emit('event', this.snapshot());
  }
  setPhase(i){
    if(i<0||i>=this.phases.length) return false;
    this.phaseIdx=i; this.emit('phase', this.snapshot()); return true;
  }
  replayPhase(i=this.phaseIdx){
    if(i<0) return false;
    const p=this.phases[i];
    const evts=this.events.filter(e=>e.t>=p.at && (i+1>=this.phases.length || e.t<this.phases[i+1].at));
    const c=new PracticeClock();
    for(const e of evts) c.at(Math.max(0,e.t-p.at), ()=>this.fire(e));
    c.play(); this.emit('replay', this.snapshot()); return true;
  }
  recordExperience(text){
    this.reported.push({t:(Date.now()-this.t0)/1000, text:String(text).slice(0,500)});
    this.emit('report', this.snapshot()); return this.reported.length;
  }
  elapsed(){ return (Date.now()-this.t0)/1000; }
  snapshot(){
    const p=this.phases[this.phaseIdx]||null;
    return {
      practice: this.practice,
      phase: p ? {idx:this.phaseIdx, id:p.id, title:p.title} : null,
      phases: this.phases.map(p=>({id:p.id,title:p.title})),
      elapsed_s: Math.round(this.elapsed()),
      rendered: this.rendered,
      reports: this.reported.length,
      expected: p ? p.expects||null : null,
    };
  }
}
function inferPhases(events){
  // group by info/breath boundaries when author gave none
  const marks=events.map((e,i)=>({e,i})).filter(({e})=>e.do==='info'||e.do==='breath');
  if(!marks.length) return [{id:'all',title:'practice',at:0}];
  return marks.map(({e},k)=>({id:'p'+k, title:e.iast||e.cue||('phase '+(k+1)), at:e.t,
    expects: e.feel?{feel:e.feel}:null}));
}
