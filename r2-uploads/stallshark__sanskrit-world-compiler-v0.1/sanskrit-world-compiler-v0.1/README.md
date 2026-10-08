# Sanskrit World Compiler v0.1

Executable prototype of:

**formal Sanskrit → deterministic geometry → inhabitable world**

The central rule is:

> Everyone gets the same linguistic skeleton. Personal imagination is an overlay.

## Run the viewer

```bash
cd sanskrit-world-compiler-v0.1
python -m http.server 8787
```

Open `http://127.0.0.1:8787/web/`.

The package includes two compiled worlds:

- `Asato Mā`: phonological floor + token promenade + √gam inhabitants + derivation chains + sandhi gates + kāraka event geometry + conceptual opposition dome.
- `citiḥ svatantrā viśvasiddhihetuḥ`: compact Trika text world with morphology and concept dome.

In the viewer: drag to rotate, scroll to zoom, click a node to inspect it. Load `examples/personal-overlay.example.json` to see how a learner-specific layer is kept separate.

## Compile a world

```bash
python compiler.py examples/asato-ma.ir.json -o dist/asato-ma.world.json
```

## Key files

- `schema/sanskrit-world-ir.schema.json` — application IR / "bytecode".
- `schema/memory-overlay.schema.json` — learner phenomenology.
- `compiler.py` — no-dependency deterministic geometry compiler.
- `web/index.html` — no-dependency interactive renderer.
- `docs/DESIGN.md` — architecture and external toolchain.

## Next integration

1. Feed Vidyut `Prakriya.history()` into token `derivation[]`.
2. Feed Sanskrit Heritage/Vidyut segmentation candidates into `tokens[]`.
3. Feed Samsaadhanii/SanskritShala/UD dependency relations into `syntax[]`.
4. Let SanskritHelp choose/verify an analysis and emit `SanskritWorldIR`.
5. Let StoneDoorway consume `World JSON + MemoryOverlay + routes`.
