/* IAST -> Devanagari, deterministic longest-match. No dependencies. */
const IAST_DEVA = (() => {
  const VOW = {a:'अ', 'ā':'आ', i:'इ', 'ī':'ई', u:'उ', 'ū':'ऊ', 'ṛ':'ऋ', 'ṝ':'ॠ', 'ḷ':'ऌ', e:'ए', o:'ओ', ai:'ऐ', au:'औ'};
  const VSIGN = {'ā':'ा', i:'ि', 'ī':'ी', u:'ु', 'ū':'ू', 'ṛ':'ृ', 'ṝ':'ॄ', 'ḷ':'ॢ', e:'े', o:'ो', ai:'ै', au:'ौ'};
  const CONS = {k:'क', kh:'ख', g:'ग', gh:'घ', 'ṅ':'ङ', c:'च', ch:'छ', j:'ज', jh:'झ', 'ñ':'ञ', 'ṭ':'ट', 'ṭh':'ठ', 'ḍ':'ड', 'ḍh':'ढ', 'ṇ':'ण', t:'त', th:'थ', d:'द', dh:'ध', n:'न', p:'प', ph:'फ', b:'ब', bh:'भ', m:'म', y:'य', r:'र', l:'ल', v:'व', 'ś':'श', 'ṣ':'ष', s:'स', h:'ह', 'ḻ':'ळ'};
  const OTHER = {'ṃ':'ं', 'ṁ':'ं', 'ḥ':'ः', "'":'ऽ', '’':'ऽ', '.':'।', '..':'॥', '|':'।', '||':'॥', ' ': ' ', '\n':'\n'};
  const HALANT = '\u094d';
  const ALL = Object.keys(CONS).concat(Object.keys(VOW)).sort((a,b)=>b.length-a.length);
  function tok(s){
    const out=[]; let i=0;
    while(i<s.length){
      let hit=null;
      for(const k of ALL){ if(s.startsWith(k,i)){hit=k;break;} }
      if(!hit){
        const c=s[i];
        if(OTHER[c]!==undefined){out.push({t:'o',v:OTHER[c]});i++;continue;}
        if(c==='-'||c==='\u2013'){i++;continue;}
        out.push({t:'o',v:c}); i++; continue;
      }
      if(CONS[hit]) out.push({t:'c',v:CONS[hit],k:hit});
      else out.push({t:'v',v:VOW[hit],k:hit});
      i+=hit.length;
    }
    return out;
  }
  function convert(s){
    const tk=tok(s); let out='';
    for(let i=0;i<tk.length;i++){
      const t=tk[i];
      if(t.t==='o'){out+=t.v;continue;}
      if(t.t==='v'){out+=t.v;continue;}
      // consonant: look ahead for vowel sign or another consonant
      const nx=tk[i+1];
      if(nx&&nx.t==='v'){
        // inherent-a suppression: a after consonant = no sign
        if(nx.k==='a'){out+=t.v;}
        else{out+=t.v+(VSIGN[nx.k]||'');}
        i++;
      } else if(nx&&nx.t==='c'){
        out+=t.v+HALANT; // conjunct: font shapes it
      } else {
        // IAST trailing consonant = pure consonant = halant. e.g. -m in -am endings,
        // -t in tat, never an unwritten 'a'. IAST writes every sound; no vowel letter = no vowel.
        out+=t.v+HALANT;
      }
    }
    return out;
  }
  return { convert, tok };
})();
window.IAST = IAST_DEVA;

window.cleanSA = function(s){ return (s||'').replace(/^# Text\s*/,'').replace(/\[[A-Za-z0-9_]+\]/g,'').replace(/\s+/g,' ').trim(); };
window.cleanEN = function(s){ return (s||'').replace(/^#+\s*[^\n]*\n/,'').replace(/\s*\/\/\S+\s*$/,'').trim(); };
