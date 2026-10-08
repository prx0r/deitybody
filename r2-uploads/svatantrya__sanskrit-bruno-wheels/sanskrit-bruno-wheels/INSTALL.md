# Install into SanskritHelp

From the unzipped bundle:

```bash
./install.sh /path/to/sanskrithelp
```

Then run your normal SanskritHelp dev server and visit:

`/learn/bruno`

No existing files are overwritten by the overlay.

To add navigation manually to `app/learn/page.tsx`, add another card/link pointing to `/learn/bruno`.

## Standalone first
Before touching the app, open `standalone/index.html`. It is the fastest way to begin practicing and stores personal bindings in browser localStorage.

## Important
Do not wire the current repo's full `data/pratyaharas.json` or unreviewed `dhatus.json` directly into the memory wheel. Read `docs/PEER_REVIEW.md` first.
