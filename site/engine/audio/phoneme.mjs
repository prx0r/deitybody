import {analyzeFrame} from "./spectrum.mjs";

export const SANSKRIT_PHONEME_CLASSES=Object.freeze({
  vowels:["a","ā","i","ī","u","ū","ṛ","ṝ","ḷ","e","ai","o","au"],
  velars:["k","kh","g","gh","ṅ"],
  palatals:["c","ch","j","jh","ñ"],
  retroflexes:["ṭ","ṭh","ḍ","ḍh","ṇ"],
  dentals:["t","th","d","dh","n"],
  labials:["p","ph","b","bh","m"],
  semivowels:["y","r","l","v"],
  sibilants:["ś","ṣ","s"],
  aspirate:["h"]
});

export function createPhonemeRecord({
  id,grapheme,transliteration,ipa=null,speakerId=null,
  sampleRate=44100,samples=[],context="isolated",metadata={}
}={}){
  if(!id||!grapheme||!transliteration)throw new Error("id, grapheme and transliteration required");
  return {id,grapheme,transliteration,ipa,speakerId,sampleRate,samples,context,metadata};
}

export function analyzePhoneme(record,{frameSize=2048}={}){
  const samples=record.samples.slice(0,frameSize);
  while(samples.length<frameSize)samples.push(0);
  const analysis=analyzeFrame(samples,{sampleRate:record.sampleRate,bins:512});
  return {
    id:record.id,
    grapheme:record.grapheme,
    transliteration:record.transliteration,
    context:record.context,
    speakerId:record.speakerId,
    acoustic:{
      rms:analysis.rms,
      fundamentalHz:analysis.fundamental?.frequency??null,
      spectralCentroidHz:analysis.moments.centroid,
      spectralVariance:analysis.moments.variance,
      spectralSkewness:analysis.moments.skewness,
      spectralKurtosis:analysis.moments.kurtosis,
      bands:analysis.bands
    },
    spectrum:analysis.spectrum
  };
}

export function normalizePhonemeComparison(records){
  const values=records.map(r=>r.acoustic);
  const keys=["rms","fundamentalHz","spectralCentroidHz","spectralVariance"];
  const ranges={};
  for(const key of keys){
    const xs=values.map(v=>v[key]).filter(Number.isFinite);
    ranges[key]={min:Math.min(...xs),max:Math.max(...xs)};
  }
  return records.map(r=>({
    ...r,
    normalized:Object.fromEntries(keys.map(key=>{
      const x=r.acoustic[key],range=ranges[key];
      return [key,Number.isFinite(x)?(x-range.min)/(range.max-range.min||1):null];
    }))
  }));
}
