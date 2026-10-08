/* Asset registry — deployment-safe audio URLs + preflight decode report.
   No absolute paths. Missing assets are reported, never substituted. */
export async function loadRegistry(){
  const records = await (await fetch('data/phonemes.json')).json();
  return {
    records: records.phonemes,
    audioUrl: ph => ph.audio.reference || null,
    async preflight(actx, ids){
      const report = {ok: [], missing: [], failed: []};
      for(const id of ids){
        const ph = records.phonemes.find(p=>p.iast===id||p.id===id);
        if(!ph || !ph.audio.reference){ report.missing.push(id); continue; }
        try{
          const r = await fetch(ph.audio.reference);
          if(!r.ok) throw new Error('http '+r.status);
          const b = await r.arrayBuffer();
          await actx.decodeAudioData(b.slice(0));
          report.ok.push(id);
        }catch(e){ report.failed.push({id, error:String(e).slice(0,80)}); }
      }
      return report;
    }
  };
}
