from __future__ import annotations
import json, math, argparse
from pathlib import Path

PLACES=["velar","palatal","retroflex","dental","labial"]
MANNERS=["unvoiced","unvoiced_aspirated","voiced","voiced_aspirated","nasal"]
VARGA={
 "velar":["k","kh","g","gh","ṅ"],"palatal":["c","ch","j","jh","ñ"],
 "retroflex":["ṭ","ṭh","ḍ","ḍh","ṇ"],"dental":["t","th","d","dh","n"],
 "labial":["p","ph","b","bh","m"]}
VOWELS=["a","i","u","ṛ","ḷ","e","o","ai","au"]
KARAKA_ANGLES={"kartṛ":0,"karman":math.pi/3,"karaṇa":2*math.pi/3,"sampradāna":math.pi,"apādāna":4*math.pi/3,"adhikaraṇa":5*math.pi/3}

def node(id,kind,label,x,y,z,data=None): return {"id":id,"kind":kind,"label":label,"x":round(x,5),"y":round(y,5),"z":round(z,5),"data":data or {}}
def edge(a,b,kind,label="",data=None): return {"source":a,"target":b,"kind":kind,"label":label,"data":data or {}}

def sound_shell():
    nodes=[]; edges=[]; spacing=2.2
    for xi,place in enumerate(PLACES):
        for yi,manner in enumerate(MANNERS):
            s=VARGA[place][yi]; nid=f"phoneme:{s}"
            nodes.append(node(nid,"phoneme",s,(xi-2)*spacing,(yi-2)*spacing,0,{"place":place,"manner":manner,"sharedShell":True}))
            if yi: edges.append(edge(f"phoneme:{VARGA[place][yi-1]}",nid,"manner_neighbor"))
            if xi: edges.append(edge(f"phoneme:{VARGA[PLACES[xi-1]][yi]}",nid,"place_neighbor"))
    r=7
    for i,v in enumerate(VOWELS):
        a=-math.pi/2+2*math.pi*i/len(VOWELS)
        nodes.append(node(f"phoneme:{v}","phoneme",v,r*math.cos(a),r*math.sin(a),.8,{"series":"maheshvara-vowel-base","sharedShell":True}))
        if i: edges.append(edge(f"phoneme:{VOWELS[i-1]}",f"phoneme:{v}","maheshvara_sequence"))
    return nodes,edges,{"name":"sanskrit-sound-temple-v0.1","invariant":True,"axes":{"x":"place_of_articulation","y":"manner_of_articulation","z":"compiled_layer"},"principle":"same analyzed Sanskrit -> same coordinates; personal imagery never changes canonical coordinates"}

def compile_world(ir):
    nodes,edges,shell=sound_shell(); ids={n["id"] for n in nodes}; toks=ir.get("tokens",[]); pos={}
    for i,t in enumerate(toks):
        a=-math.pi/2+2*math.pi*i/max(len(toks),1); x,y,z=10*math.cos(a),10*math.sin(a),2
        pos[t["id"]]=(x,y,z); nodes.append(node(t["id"],"token",t.get("surface",t["id"]),x,y,z,{"lemma":t.get("lemma"),"root":t.get("root"),"pos":t.get("pos"),"morph":t.get("morph",{}),"order":i,"provider":t.get("provider")})); ids.add(t["id"])
        for p in t.get("phonemes",[]):
            if f"phoneme:{p}" in ids: edges.append(edge(t["id"],f"phoneme:{p}","instantiates_sound",p))
    for t in toks:
        x,y,_=pos[t["id"]]; anchor=None
        if t.get("root"):
            rid=f"dhatu:{t['root']}"
            if rid not in ids: nodes.append(node(rid,"dhatu","√"+t["root"],x*.55,y*.55,4.8,{"meaning":t.get("rootMeaning"),"brunoRole":"persistent_agent"})); ids.add(rid)
            anchor=rid
        elif t.get("lemma"):
            lid=f"lemma:{t['lemma']}"
            if lid not in ids: nodes.append(node(lid,"lemma",t["lemma"],x*.62,y*.62,4.2,{"brunoRole":"stable_lexical_object"})); ids.add(lid)
            anchor=lid
        prev=anchor; deriv=t.get("derivation",[])
        for si,st in enumerate(deriv):
            f=(si+1)/(len(deriv)+1); sid=f"{t['id']}:step:{si+1}"
            nodes.append(node(sid,"derivation_step",st.get("rule") or st.get("operation") or f"step {si+1}",x*(.55+.45*f),y*(.55+.45*f),4.8-2.6*f,st)); ids.add(sid)
            if prev: edges.append(edge(prev,sid,"derives",st.get("rule","")))
            prev=sid
        if prev and prev!=t["id"]: edges.append(edge(prev,t["id"],"surfaces_as"))
    for s in ir.get("sandhi",[]):
        if s["left"] not in pos or s["right"] not in pos: continue
        a=pos[s["left"]]; b=pos[s["right"]]
        nodes.append(node(s["id"],"sandhi_gate",s.get("label","sandhi"),(a[0]+b[0])/2,(a[1]+b[1])/2,1.25,s))
        edges += [edge(s["left"],s["id"],"boundary_in"),edge(s["id"],s["right"],"boundary_out")]
    syntax=ir.get("syntax",[])
    preds=sorted(set(e["target"] for e in syntax if e.get("relation") in KARAKA_ANGLES))
    for pi,pred in enumerate(preds):
        if pred not in pos: continue
        hub=f"predicate:{pred}"; nodes.append(node(hub,"predicate","event:"+pred,0,0,3+pi*.35,{"surfaceToken":pred})); edges.append(edge(hub,pred,"predicate_surface"))
        for e in syntax:
            rel=e.get("relation"); src=e.get("source")
            if e.get("target")!=pred or rel not in KARAKA_ANGLES or src not in pos: continue
            a=KARAKA_ANGLES[rel]; rr=4.2+.3*pi; pid=f"projection:{pred}:{src}:{rel}"
            nodes.append(node(pid,"operator",rel,rr*math.cos(a),rr*math.sin(a),3,{"relation":rel,"sourceToken":src,"targetPredicate":pred}))
            edges += [edge(hub,pid,"karaka_slot",rel),edge(pid,src,"realized_by",rel)]
    concepts=sorted(ir.get("concepts",[]),key=lambda x:x["id"])
    for ci,c in enumerate(concepts):
        a=-math.pi/2+2*math.pi*ci/max(len(concepts),1); r=7.5
        nodes.append(node(c["id"],"concept",c.get("label",c["id"]),r*math.cos(a),r*math.sin(a),7,{k:v for k,v in c.items() if k not in ("id","label")}))
    for e in ir.get("semanticEdges",[]): edges.append(edge(e["source"],e["target"],e.get("relation","semantic"),e.get("label","")))
    route=[]
    for t in toks:
        route.append({"node":t["id"],"action":"hear_then_enter","prompt":f"Enter {t.get('surface',t['id'])} as sound before analysis."})
        for si,_ in enumerate(t.get("derivation",[])): route.append({"node":f"{t['id']}:step:{si+1}","action":"transform","prompt":"Predict the transformation before revealing it."})
    for s in ir.get("sandhi",[]): route.append({"node":s["id"],"action":"cross_boundary","prompt":"Reconstruct both sides of the sandhi gate."})
    return {"version":"0.1","id":ir["id"],"title":ir.get("title",ir["id"]),"text":ir.get("text",""),"nodes":nodes,"edges":edges,"routes":route,"shell":shell,"provenance":{"ir":ir.get("provenance",{}),"compiler":"sanskrit-world-compiler/0.1","geometryRule":"deterministic structural mapping","personalOverlayAffectsGeometry":False,"bruno":"representation layer only","rowe":"formal relation -> inhabitable geometry compiler analogy"}}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("input"); ap.add_argument("-o","--output",required=True); a=ap.parse_args()
    ir=json.loads(Path(a.input).read_text()); w=compile_world(ir); Path(a.output).write_text(json.dumps(w,ensure_ascii=False,indent=2)); print(f"compiled {w['id']}: {len(w['nodes'])} nodes / {len(w['edges'])} edges")
if __name__=="__main__": main()
