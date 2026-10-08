# Wearables + EEG — integration spec (no hardware required to read this)

## Principle

Visuals consume biosignal *events* (`{bpm}`, `{breathPhase}`, `{bandPowers}`).
They never know the origin. Simulated baseline, BLE strap, and Muse EEG are
interchangeable sources behind `site/engine/sensors.js`. What the screen shows
is always labeled with its origin. Simulated physiology is never presented as
measured — and measured physiology is never presented as inner experience.

## Origins (in order)

1. **Simulated average human (live now).** Resting HR ~64bpm + HRV jitter,
   0.1Hz resonance breath pacer (5.5 breaths/min, HeartMath-style, no
   affiliation). Clearly a model. Runs everywhere including Firefox.
2. **Breath-audio envelope (live now, needs mic + consent).** Mic amplitude
   envelope as respiration proxy for pacing feedback. Queued behind a toggle.
3. **BLE heart strap (next).** Standard Heart Rate Service `0x180D` read
   directly via Web Bluetooth — no library needed. Chrome/Edge/Opera only;
   Safari and Firefox do not implement Web Bluetooth, so those browsers keep
   the simulated baseline + breath-audio path.
4. **Muse EEG + PPG (next).** `web-muse` (MIT, maintained, mock-data mode) or
   `muse-js` (MIT, unmaintained). EEG 256Hz (TP9/AF7/AF8/TP10), PPG heart on
   Muse 2/S, accelerometer, battery. Same browser constraint as BLE.
5. **Camera posture (later).** MediaPipe Pose Landmarker (browser, 3D
   landmarks) for seated-posture check only — never attention inference.
6. **Belts/HRV/EEG research (later).** Respiration belt, HRV, BrainFlow bridge
   (native sidecar; BrainFlow does not run in-browser). Validation, confidence
   estimates, and measured-vs-inferred distinction mandatory.

## Mappings (allowed)

- Measured/avg HR → heartbeat throb rate at the heart locus.
- HRV (measured) or jitter (simulated) → beat irregularity. Never a "calm score".
- Breath phase → pacer ring + field swell. Inhale/exhale from audio envelope
  or 0.1Hz model.
- EEG band powers (when present) → ambient field brightness *only*, labeled
  "signal presence, not state". No meditation classification without
  validation (consumer neurofeedback is unproven — 2025 meta-analysis).

## Locks

- No sensor may rewrite instruction. Sensors contribute `observedState`
  alongside expected/rendered/reported — see agent tools.
- Firefox/Safari path always works: simulated + breath-audio, no Bluetooth.
- Pairing requires explicit tap (Web Bluetooth user-gesture rule doubles as consent).
