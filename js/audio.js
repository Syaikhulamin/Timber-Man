let audioCtx = null;
let muted = false;
let bgmInterval = null;

export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; if (muted) stopBGM(); else startBGM(); }

export function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, dur, type, vol) {
  if (!audioCtx || muted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || "sine";
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  const end = audioCtx.currentTime + dur;
  gain.gain.setValueAtTime(vol || 0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, end);
  osc.start();
  osc.stop(end);
}

export function playChopSound() {
  playTone(600, 0.08, "square", 0.25);
  setTimeout(() => playTone(300, 0.06, "square", 0.15), 40);
}

export function playBranchSound() {
  playTone(120, 0.3, "sawtooth", 0.35);
}

export function playBirdSound() {
  playTone(1200, 0.06, "sine", 0.2);
  setTimeout(() => playTone(1400, 0.06, "sine", 0.2), 80);
}

export function playComboSound() {
  playTone(500, 0.08, "square", 0.2);
  setTimeout(() => playTone(700, 0.08, "square", 0.2), 60);
  setTimeout(() => playTone(900, 0.1, "square", 0.2), 120);
}

export function playGameOverSound() {
  playTone(400, 0.15, "sawtooth", 0.3);
  setTimeout(() => playTone(250, 0.2, "sawtooth", 0.3), 150);
  setTimeout(() => playTone(120, 0.4, "sawtooth", 0.3), 350);
}

const BGM_NOTES = [130.81, 146.83, 164.81, 146.83, 174.61, 164.81, 146.83, 130.81];
let bgmIndex = 0;

export function startBGM() {
  if (!audioCtx || muted || bgmInterval) return;
  bgmInterval = setInterval(() => {
    if (!audioCtx || muted) { stopBGM(); return; }
    playTone(BGM_NOTES[bgmIndex], 0.3, "sine", 0.06);
    bgmIndex = (bgmIndex + 1) % BGM_NOTES.length;
  }, 400);
}

export function stopBGM() {
  if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
  bgmIndex = 0;
}

export function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern || 20);
}

export function playShieldSound() {
  playTone(800, 0.1, "sine", 0.25);
  setTimeout(() => playTone(1000, 0.1, "sine", 0.2), 100);
}

export function playSlowSound() {
  playTone(200, 0.4, "sine", 0.15);
}

export function playGoldSound() {
  playTone(900, 0.08, "triangle", 0.2);
  setTimeout(() => playTone(1200, 0.1, "triangle", 0.2), 60);
}
