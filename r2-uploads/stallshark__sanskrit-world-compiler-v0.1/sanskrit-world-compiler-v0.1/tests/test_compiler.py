import json, importlib.util
from pathlib import Path
R=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('compiler',R/'compiler.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def load(n): return json.loads((R/'examples'/n).read_text())
a=m.compile_world(load('asato-ma.ir.json'));b=m.compile_world(load('asato-ma.ir.json'));assert a==b
c=m.compile_world(load('citih-svatantra.ir.json'))
sa={(n['id'],n['x'],n['y'],n['z']) for n in a['nodes'] if n['data'].get('sharedShell')};sc={(n['id'],n['x'],n['y'],n['z']) for n in c['nodes'] if n['data'].get('sharedShell')};assert sa==sc
assert a['provenance']['personalOverlayAffectsGeometry'] is False
print('3/3 tests passed')
