/* Sound as three parallel systems (kept distinct on purpose).
   phonetic: measured sound (clips, EdgeSanskrit phrases, analyser).
   musical: intervals/composition — UNMAPPED stub (no invented correspondences).
   traditional: source-prescribed placement + significance. */
export const Sound = {
  phonetic(iast, clips){
    const map={a:'a.ogg','ā':'aa.ogg',i:'i.ogg','ī':'ii.ogg',u:'u.ogg','ū':'uu.ogg',
      'ṛ':'r.ogg','ṝ':'rr.ogg',e:'e.ogg',ai:'ai.ogg',o:'o.ogg',au:'au.ogg',
      'aṃ':'anusvara.ogg','aḥ':'visarga.ogg',ka:'ka.ogg',kha:'kha.ogg',ga:'ga.ogg',
      gha:'gha.ogg','ṅa':'na_k.ogg',ca:'ca.ogg',cha:'cha.ogg',ja:'ja.ogg',
      jha:'jha.ogg','ña':'na_j.ogg','ṭa':'ta1.ogg','ṭha':'tha1.ogg','ḍa':'da1.ogg',
      'ḍha':'dha1.ogg','ṇa':'na_k.ogg',ta:'ta.ogg',tha:'tha.ogg',da:'da.ogg',
      dha:'dha.ogg',na:'na.ogg',pa:'pa.ogg',pha:'pha.ogg',ba:'ba.ogg',bha:'bha.ogg',
      ma:'ma.ogg',ya:'ya.ogg',ra:'ra.ogg',la:'la.ogg',va:'va.ogg',śa:'sha.ogg',
      'ṣa':'shha.ogg',sa:'sa.ogg',ha:'ha.ogg'};
    const f=map[iast]||null;
    return f?{clip:'audio/phonemes/'+f, note:'human grid model'}:{clip:null,note:'synth-only (heard in phrases)'};
  },
  musical(){
    return {mapped:false,
      note:'No interval/composition mapping asserted. Audio-reactivity uses measured spectrum only.'};
  },
  traditional(iast, cfg='matrika'){
    return {system:'trika-nyasa', config:cfg,
      note:'Placement from matrika-body-map-v2 (verse) ± apparatus variants; efficacy = assimilation, not phonetics.'};
  },
};
