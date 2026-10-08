/* MantraPlayer — light is DERIVED from sound, never parallel timers.
   The phrase is decoded once; its measured duration sets every syllable
   flash. Loop gaps separate repetitions; recordings are never stretched.
   Timing marked even-split-approx unless a def carries measured fractions. */
export class MantraPlayer {
  constructor(actx){
    this.ac = actx;
    this.buf = null; this.dur = 0; this.def = null;
    this.timers = []; this.src = null; this.playing = false;
    this.loop = true; this.gap = 2.0;
    this.onSyllable = null; this.onEnd = null;
  }
  async load(def){
    this.stop();
    this.def = def;
    const r = await fetch(def.audio);
    if(!r.ok) throw new Error('mantra audio missing: ' + def.audio);
    const b = await r.arrayBuffer();
    this.buf = await this.ac.decodeAudioData(b);
    this.dur = this.buf.duration;
    return {duration: this.dur, syllables: def.syllables.length};
  }
  fracs(){
    const n = this.def.syllables.length;
    if(this.def.timing && this.def.timing.length === n) return this.def.timing;
    return new Array(n).fill(1/n);   // even-split approximation (labeled)
  }
  play(){
    if(!this.buf || this.playing) return;
    if(this.ac.state === 'suspended') this.ac.resume();
    this.playing = true;
    this.cycle();
  }
  cycle(){
    if(!this.playing) return;
    const t0 = this.ac.currentTime + 0.08;
    const s = this.ac.createBufferSource();
    s.buffer = this.buf; s.connect(this.ac.destination); s.start(t0);
    this.src = s;
    const fr = this.fracs();
    let acc = 0;
    this.def.syllables.forEach((sy, k)=>{
      const at = (t0 - this.ac.currentTime) + acc * this.dur;
      this.timers.push(setTimeout(()=>{
        if(this.playing) this.onSyllable && this.onSyllable(sy, k);
      }, Math.max(0, at*1000)));
      acc += fr[k];
    });
    const total = (t0 - this.ac.currentTime) + this.dur;
    this.timers.push(setTimeout(()=>{
      if(!this.playing) return;
      if(this.loop){ this.timers.push(setTimeout(()=>this.cycle(), this.gap*1000)); }
      else { this.playing = false; this.onEnd && this.onEnd(); }
    }, Math.max(0, total*1000)));
  }
  pause(){ this.playing = false; this.timers.forEach(clearTimeout); this.timers = [];
    try{ this.src && this.src.stop(); }catch(e){} }
  stop(){ this.pause(); }
}
