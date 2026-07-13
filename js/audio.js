// --- Sound State ---
export let isMuted = localStorage.getItem("xo_arena_muted") === "true";
export let bgmVolume = parseFloat(localStorage.getItem("xo_arena_bgm_volume") ?? "0.45");
export let sfxVolume = parseFloat(localStorage.getItem("xo_arena_sfx_volume") ?? "0.5");

// --- Sound Files ---
export const clickSound = new Audio("sounds/click.mpeg");
export const winSound = new Audio("sounds/win.mpeg");
export const drawSound = new Audio("sounds/seri.mpeg");

clickSound.volume = sfxVolume;
winSound.volume = sfxVolume;
drawSound.volume = sfxVolume;

export let bgm = null;
let bgmInitialized = false;

// --- BGM Initialization ---
export function initBGM() {
    if (bgmInitialized) return;
    bgm = new Audio("sounds/bgm_p3r_free.mp3");
    bgm.loop = true;
    bgm.volume = isMuted ? 0 : bgmVolume;
    updateMuteButtonVisual();
    
    if (!isMuted) {
        bgm.play().catch(() => {
            console.log("BGM Autoplay blocked, waiting for interaction.");
        });
    }
    bgmInitialized = true;
}

export function playBGM() {
    initBGM();
    if (bgm && !isMuted) {
        return bgm.play();
    }
    return Promise.resolve();
}

// --- Mute UI Update ---
export function updateMuteButtonVisual() {
    const muteBtn = document.getElementById("global-mute-btn");
    if (muteBtn) {
        const icon = muteBtn.querySelector("i");
        if (icon) {
            if (isMuted) {
                icon.className = "fa-solid fa-volume-xmark";
                muteBtn.style.background = "#ff2a5f";
                muteBtn.style.color = "#ffffff";
            } else {
                icon.className = "fa-solid fa-volume-high";
                muteBtn.style.background = "#040914";
                muteBtn.style.color = "#ffffff";
            }
        }
    }
}

// --- Audio Playback ---
export function playSound(audio) {
    if (isMuted) return;
    audio.volume = sfxVolume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

// --- Synthesized SFX (Web Audio API) ---
export function playButtonClickSound() {
    if (isMuted || sfxVolume === 0) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.10);
        
        gain.gain.setValueAtTime(0.03 * sfxVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.10);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.10);
    } catch (e) {
        console.warn("Audio block", e);
    }
}

export function playCardAppearSound() {
    if (isMuted || sfxVolume === 0) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(150, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.3);
        
        gain1.gain.setValueAtTime(0.12 * sfxVolume, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.3);
        
        setTimeout(() => {
            if (ctx.state === "suspended") ctx.resume();
            
            const osc2 = ctx.createOscillator();
            const osc3 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(523.25, ctx.currentTime);
            
            osc3.type = "triangle";
            osc3.frequency.setValueAtTime(783.99, ctx.currentTime);
            
            gain2.gain.setValueAtTime(0.18 * sfxVolume, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            
            osc2.connect(gain2);
            osc3.connect(gain2);
            gain2.connect(ctx.destination);
            
            osc2.start();
            osc3.start();
            osc2.stop(ctx.currentTime + 1.2);
            osc3.stop(ctx.currentTime + 1.2);
        }, 150);
    } catch (e) {
        console.warn("Audio block", e);
    }
}

export function playCardCollectSound() {
    if (isMuted || sfxVolume === 0) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.12 * sfxVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.warn("Audio block", e);
    }
}

export function playP3RVictorySound() {
    if (isMuted || sfxVolume === 0) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = "sine";
        bassOsc.frequency.setValueAtTime(140, now);
        bassOsc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
        
        bassGain.gain.setValueAtTime(0.35 * sfxVolume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start();
        bassOsc.stop(now + 1.0);
        
        const notes = [164.81, 207.65, 246.94, 329.63, 493.88];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 0.15);
            
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(1800, now + 0.2);
            filter.frequency.exponentialRampToValueAtTime(150, now + 2.5);
            
            const vol = idx === 0 ? 0.08 : (idx === 4 ? 0.04 : 0.06);
            gain.gain.setValueAtTime(vol * sfxVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(now + 3.0);
        });
        
        const chimeNotes = [659.25, 830.61, 987.77, 1318.51];
        chimeNotes.forEach((freq, index) => {
            setTimeout(() => {
                if (ctx.state === "suspended") ctx.resume();
                
                const chimeOsc = ctx.createOscillator();
                const chimeGain = ctx.createGain();
                chimeOsc.type = "sine";
                chimeOsc.frequency.setValueAtTime(freq, ctx.currentTime);
                
                chimeGain.gain.setValueAtTime(0.07 * sfxVolume, ctx.currentTime);
                chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                
                chimeOsc.connect(chimeGain);
                chimeGain.connect(ctx.destination);
                chimeOsc.start();
                chimeOsc.stop(ctx.currentTime + 1.2);
            }, index * 90 + 50);
        });
    } catch (e) {
        console.warn("Audio block", e);
    }
}

export function playP3RDrawSound() {
    if (isMuted || sfxVolume === 0) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = "triangle";
        bassOsc.frequency.setValueAtTime(200, now);
        bassOsc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
        
        bassGain.gain.setValueAtTime(0.15 * sfxVolume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.8);
        
        const chordNotes = [293.66, 392.00, 523.25, 659.25];
        chordNotes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);
            
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + 1.5);
            
            const vol = idx === 0 ? 0.06 : 0.04;
            gain.gain.setValueAtTime(vol * sfxVolume, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 2.0);
        });
        
        const bellNotes = [440.00, 587.33];
        bellNotes.forEach((freq, index) => {
            setTimeout(() => {
                if (ctx.state === "suspended") ctx.resume();
                const bellOsc = ctx.createOscillator();
                const bellGain = ctx.createGain();
                bellOsc.type = "triangle";
                bellOsc.frequency.setValueAtTime(freq, ctx.currentTime);
                
                bellGain.gain.setValueAtTime(0.06 * sfxVolume, ctx.currentTime);
                bellGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
                
                bellOsc.connect(bellGain);
                bellGain.connect(ctx.destination);
                bellOsc.start();
                bellOsc.stop(ctx.currentTime + 0.8);
            }, index * 120 + 80);
        });
    } catch (e) {
        console.warn("Audio block", e);
    }
}

export function playP3RTransitionSound() {
    if (isMuted || sfxVolume === 0) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        
        const bufferSize = ctx.sampleRate * 0.5;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(2000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(400, now + 0.4);
        noiseFilter.Q.setValueAtTime(1.5, now);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12 * sfxVolume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.5);
        
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = "sine";
        bassOsc.frequency.setValueAtTime(120, now + 0.08);
        bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        bassGain.gain.setValueAtTime(0.2 * sfxVolume, now + 0.08);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(now + 0.08);
        bassOsc.stop(now + 0.5);
        
        const riseOsc = ctx.createOscillator();
        const riseGain = ctx.createGain();
        riseOsc.type = "sawtooth";
        riseOsc.frequency.setValueAtTime(200, now);
        riseOsc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        
        const riseFilter = ctx.createBiquadFilter();
        riseFilter.type = "lowpass";
        riseFilter.frequency.setValueAtTime(600, now);
        riseFilter.frequency.exponentialRampToValueAtTime(1500, now + 0.25);
        
        riseGain.gain.setValueAtTime(0.04 * sfxVolume, now);
        riseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        riseOsc.connect(riseFilter);
        riseFilter.connect(riseGain);
        riseGain.connect(ctx.destination);
        riseOsc.start(now);
        riseOsc.stop(now + 0.4);
    } catch (e) {
        console.warn("Audio block", e);
    }
}

// --- Volume Updaters ---
export function setBgmVolume(volume) {
    bgmVolume = parseFloat(volume);
    localStorage.setItem("xo_arena_bgm_volume", bgmVolume);
    if (bgm) {
        bgm.volume = isMuted ? 0 : bgmVolume;
    }
}

export function setSfxVolume(volume) {
    sfxVolume = parseFloat(volume);
    localStorage.setItem("xo_arena_sfx_volume", sfxVolume);
    clickSound.volume = sfxVolume;
    winSound.volume = sfxVolume;
    drawSound.volume = sfxVolume;
}

export function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem("xo_arena_muted", isMuted);
    if (bgm) {
        bgm.volume = isMuted ? 0 : bgmVolume;
        if (!isMuted) {
            bgm.play().catch(() => {});
        } else {
            bgm.pause();
        }
    }
    updateMuteButtonVisual();
    return isMuted;
}
