let audioCtx = null;

export function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, dur, type, vol) {
  if (!audioCtx) return;
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
