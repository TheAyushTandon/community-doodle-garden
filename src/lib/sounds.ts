// Web Audio API sound utility — no external files needed
// Generates all sounds programmatically

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
}

// Resume audio context on first user interaction (browser autoplay policy)
export function resumeAudio() {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
}

// ── Tick Sound (button hover) ──
// A soft, cute "pop" click
export function playTick() {
    try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch { /* ignore */ }
}

// ── Swoosh Down Sound (shutter drops) ──
export function playSwooshDown() {
    try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') return;

        // White noise swoosh
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.35);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.45, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.4);
    } catch { /* ignore */ }
}

// ── Swoosh Up Sound (shutter lifts) ──
export function playSwooshUp() {
    try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') return;

        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Reverse envelope — starts quiet, peaks, then fades
            const t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.8;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.4);
    } catch { /* ignore */ }
}

// ── Background Music ──
// Recreation of user's Music Lab tune (ID: 5215157248196608)
// 98 BPM, C Major, woodwind cluster wave + conga percussion
let bgMusicPlaying = false;
let bgMusicGain: GainNode | null = null;
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;

// 98 BPM → beat = 60/98 ≈ 0.612s, eighth note ≈ 0.306s
const STEP = 60 / 98 / 2; // eighth note duration in seconds ≈ 0.306s
const NOTE_DUR = STEP * 0.85; // slightly shorter than step for detached feel

// C Major scale frequencies (Middle C = C4)
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.00;
const A4 = 440.00;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;

// Rising-and-falling 3-note cluster melody from the song
// Each entry: [notes[], column_index]  (column → time = col * STEP)
const CLUSTERS: [number[], number][] = [
    [[D4, E4, F4], 0],   // Col 1-2: start low
    [[D4, E4, F4], 1],
    [[E4, F4, G4], 2],   // Col 3: step up
    [[F4, G4, A4], 3],   // Col 4
    [[G4, A4, B4], 4],   // Col 5
    [[A4, B4, C5], 5],   // Col 6
    [[B4, C5, D5], 6],   // Col 7: peak!
    [[B4, C5, D5], 7],   // Col 8: hold peak
    [[A4, B4, C5], 8],   // Col 9: descend
    [[G4, A4, B4], 9],   // Col 10
    [[F4, G4, A4], 10],  // Col 11
    [[E4, F4, G4], 11],  // Col 12
    [[D4, E4, F4], 12],  // Col 13
    [[C4, D4, E4], 13],  // Col 14: near bottom
    [[C4, D4], 14],  // Col 15: thinning
    [[C4], 15],  // Col 16: single note resolve
];

// Conga percussion: alternating low/high on every eighth note beat
// low ≈ 120 Hz, high ≈ 220 Hz
const CONGA_PATTERN: [number, number][] = Array.from({ length: 16 }, (_, i) => [
    i % 2 === 0 ? 120 : 210, // Low on even, High on odd
    i,
]);

const LOOP_STEPS = 16; // 16 eighth notes = 2 bars
const LOOP_DURATION = LOOP_STEPS * STEP; // ≈ 4.9s per bar-pair, loop repeats

function playCluster(ctx: AudioContext, freqs: number[], startTime: number, master: GainNode) {
    freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        // Woodwind: square wave softened by envelope
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        // Stagger cluster notes very slightly (strummed feel)
        const offset = idx * 0.012;
        const vel = 0.22 - idx * 0.02; // top note slightly quieter

        g.gain.setValueAtTime(0, startTime + offset);
        g.gain.linearRampToValueAtTime(vel, startTime + offset + 0.025);
        g.gain.setValueAtTime(vel * 0.7, startTime + NOTE_DUR * 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + NOTE_DUR);

        osc.connect(g);
        g.connect(master);
        osc.start(startTime + offset);
        osc.stop(startTime + NOTE_DUR + offset + 0.02);

        // Soft high harmonic (woodwind breath)
        const harm = ctx.createOscillator();
        const hg = ctx.createGain();
        harm.type = 'sine';
        harm.frequency.setValueAtTime(freq * 2, startTime + offset);
        hg.gain.setValueAtTime(0, startTime + offset);
        hg.gain.linearRampToValueAtTime(vel * 0.08, startTime + offset + 0.015);
        hg.gain.exponentialRampToValueAtTime(0.001, startTime + NOTE_DUR * 0.6);
        harm.connect(hg);
        hg.connect(master);
        harm.start(startTime + offset);
        harm.stop(startTime + NOTE_DUR * 0.65);
    });
}

function playConga(ctx: AudioContext, freq: number, startTime: number, master: GainNode) {
    // Synthesize conga as pitched noise burst
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + 0.06);

    g.gain.setValueAtTime(0.18, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    osc.connect(g);
    g.connect(master);
    osc.start(startTime);
    osc.stop(startTime + 0.14);
}

function playMelodyLoop() {
    const ctx = getCtx();
    if (ctx.state === 'suspended') return;

    if (!bgMusicGain) {
        bgMusicGain = ctx.createGain();
        bgMusicGain.gain.setValueAtTime(0.055, ctx.currentTime);
        bgMusicGain.connect(ctx.destination);
    }

    const t0 = ctx.currentTime;

    // Woodwind cluster melody
    for (const [freqs, col] of CLUSTERS) {
        playCluster(ctx, freqs, t0 + col * STEP, bgMusicGain);
    }

    // Conga percussion
    for (const [freq, col] of CONGA_PATTERN) {
        playConga(ctx, freq, t0 + col * STEP, bgMusicGain);
    }
}

export function startBgMusic() {
    if (bgMusicPlaying) return;
    bgMusicPlaying = true;

    playMelodyLoop();
    bgMusicInterval = setInterval(() => {
        playMelodyLoop();
    }, LOOP_DURATION * 1000);
}

export function stopBgMusic() {
    bgMusicPlaying = false;
    if (bgMusicInterval) {
        clearInterval(bgMusicInterval);
        bgMusicInterval = null;
    }
    if (bgMusicGain) {
        const ctx = getCtx();
        bgMusicGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        bgMusicGain = null;
    }
}

export function isBgMusicPlaying() {
    return bgMusicPlaying;
}

