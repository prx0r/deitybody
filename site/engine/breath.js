/* BreathSignal — one authoritative respiratory state.
   {phase, expansion 0..1, velocity, confidence 0..1, source}
   Sources: simulation (0.1Hz model) | microphone (envelope) | score (practice
   prescribes; confidence high while its event runs). Consumers read; the
   practice may bind progress to it (startWhen breathPhase) when confidence
   allows, else timestamps govern. Independent of any single visualization. */
export function createBreath(){
  const s = {
    phase: 'unknown', expansion: null, velocity: null,
    confidence: 0, source: 'simulation', _t: 0,
  };
  const api = {
    state: s,
    tick(dt, t, mic){
      s._t = t;
      if(mic && mic.on && mic.level != null){
        const prev = s.expansion ?? 0.5;
        s.expansion = mic.level;
        s.velocity = dt > 0 ? (s.expansion - prev)/dt : 0;
        s.phase = s.velocity > 0.02 ? 'inhale' : s.velocity < -0.02 ? 'exhale' : 'pause';
        s.confidence = 0.6; s.source = 'microphone';
      }else{
        const br = 0.5 + 0.5*Math.sin(t*2*Math.PI*0.1);
        const prev = s.expansion ?? br;
        s.expansion = br;
        s.velocity = dt > 0 ? (br - prev)/dt : 0;
        s.phase = Math.cos(t*2*Math.PI*0.1) > 0 ? 'inhale' : 'exhale';
        s.confidence = 0.4; s.source = 'simulation';
      }
    },
    prescribe(phase, expansion){
      s.phase = phase;
      if(expansion != null) s.expansion = expansion;
      s.confidence = 0.9; s.source = 'score';
    },
  };
  return api;
}
