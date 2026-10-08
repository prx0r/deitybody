/* AI Tool API — the small authoritative set. The agent never interprets
   video: it reads session snapshots (structured state) and calls tools.
   Prescribed state only — never claims to observe inner experience. */
export function makeTools(ctx){
  const { session, graph, fx } = ctx;
  return {
    getPracticeState(){
      const s = session.snapshot();
      return {...s, note:'prescribed+rendered state. Not a measurement of attention.'};
    },
    getSourcePassage(){
      const p = session.practice;
      if(!p) return {none:'no practice loaded'};
      return {practice:p.id, title:p.title, source:p.source||p.provenance||'see score file',
        ask:'fetch the score JSON for full events, cues, feels, addresses'};
    },
    pauseSession(){ session.pause(); return {paused:true, at:session.snapshot()}; },
    resumeSession(){ session.resume(); return {playing:true}; },
    highlightRegion(regionId){
      const nodes = graph ? graph.regionNodes(regionId) : [];
      if(fx&&fx.flashRegion) fx.flashRegion(regionId, nodes);
      return {region:regionId, nodes};
    },
    replayPhase(phaseId){
      const i = phaseId==null ? session.phaseIdx
        : session.phases.findIndex(p=>p.id===phaseId);
      return {replayed: session.replayPhase(i)};
    },
    adjustGuidance(patch){
      Object.assign(session.guide, patch||{});
      return {guide:session.guide};
    },
    recordExperience(report){
      const n = session.recordExperience(report);
      return {recorded:n, note:'practitioner report stored with practice time, not auto-interpreted'};
    },
    /* scripted answers for the on-device guide box (rule-based, no LLM) */
    answer(q){
      const s = session.snapshot();
      const t = (q||'').toLowerCase();
      const ph = s.phase;
      if(/where|doing|happening|phase|what.*(now|current)/.test(t))
        return ph ? `Phase ${s.phase.idx+1}/${s.phases.length}: ${ph.title} (${fmt(s.elapsed_s)} in).`
          : 'No phase active. Start a trajectory or score.';
      if(/next/.test(t)){
        const n = s.phases[s.phase?s.phase.idx+1:0];
        return n ? `Next: ${n.title}.` : 'Nothing after this — rest or replay.';
      }
      if(/repeat|again|replay/.test(t)){ this.replayPhase(); return 'Replaying this phase.'; }
      if(/pause|hold|stop|wait/.test(t)){ this.pauseSession(); return 'Held. Say repeat when ready.'; }
      if(/source|text|verse|provenance/.test(t)){
        const g = this.getSourcePassage();
        return g.title ? `${g.title} — ${g.source}` : 'No practice loaded.';
      }
      if(/mean|what is|what's/.test(t)){
        const r = s.rendered;
        return r ? `Showing ${r.do} ${r.label||''}. Ask source for the text behind it.`
          : 'Nothing shown yet.';
      }
      return 'Try: where am I · next · repeat · pause · source.';
    },
  };
}
function fmt(s){ return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; }
