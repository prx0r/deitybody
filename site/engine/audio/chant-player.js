/* ChantPlayer — one Web Audio timeline drives clips AND visual events.
   Speed changes gaps only; source recordings are never stretched
   (a slowed short vowel would become a long vowel). Stop cancels all. */
export class ChantPlayer {
  constructor(actx){
    this.ac = actx;
    this.buffers = new Map();
    this.idx = 0; this.seq = [];
    this.playing = false;
    this.timer = null; this.src = null;
    this.gap = 1.6; this.loop = false; this.map = 'matrika';
    this.onPhoneme = null; this.onEnd = null;
  }
  async load(seq, map='matrika'){
    this.stop();
    this.seq = seq; this.map = map;
    for(const id of seq){
      if(this.buffers.has(id)) continue;
      const ph = ChantPlayer.records.find(p=>p.iast===id||p.id===id);
      if(!ph || !ph.audio.reference){ this.buffers.set(id, null); continue; }
      const r = await fetch(ph.audio.reference);
      const b = await r.arrayBuffer();
      this.buffers.set(id, await this.ac.decodeAudioData(b));
    }
    this.idx = 0;
    return {loaded: seq.length, silent: seq.filter(id=>!this.buffers.get(id))};
  }
  static setRecords(records){ ChantPlayer.records = records.phonemes || records; }
  get current(){ return this.seq[this.idx]; }
  play(){
    if(!this.seq.length || this.playing) return;
    if(this.ac.state === 'suspended') this.ac.resume();
    this.playing = true; this.step();
  }
  step(){
    if(!this.playing) return;
    if(this.idx >= this.seq.length){
      if(this.loop){ this.idx = 0; } else { this.playing = false; this.onEnd && this.onEnd(); return; }
    }
    const id = this.seq[this.idx];
    const buf = this.buffers.get(id);
    const t = this.ac.currentTime + 0.06;
    if(buf){
      const s = this.ac.createBufferSource(); s.buffer = buf; s.connect(this.ac.destination);
      s.start(t); this.src = s;
    }
    const ph = (ChantPlayer.records||[]).find(p=>p.iast===id||p.id===id);
    const wait = (buf ? buf.duration : 0.4) + this.gap;
    const ms = Math.max(0, (t - this.ac.currentTime) * 1000);
    setTimeout(()=>{ this.onPhoneme && this.onPhoneme(id, ph, this.idx); }, ms);
    this.timer = setTimeout(()=>{ this.idx++; this.step(); }, wait * 1000);
  }
  pause(){ this.playing = false; clearTimeout(this.timer); try{ this.src && this.src.stop(); }catch(e){} }
  stop(){ this.pause(); this.idx = 0; }
  next(){ const was = this.playing; this.pause(); this.idx = Math.min(this.seq.length - 1, this.idx + 1); if(was) this.play(); }
  prev(){ const was = this.playing; this.pause(); this.idx = Math.max(0, this.idx - 1); if(was) this.play(); }
  repeat(){ const was = this.playing; this.pause(); if(was) this.play(); }
}
