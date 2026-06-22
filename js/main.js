import * as C from "./constants.js";
import { DOM, S, resize, updateModeUI, updateTimerUI } from "./state.js";
import { chop, reset, tick, submitPlayerName, resetPlayerName } from "./logic.js";
import { initAudio, toggleMute, isMuted, startBGM, stopBGM } from "./audio.js";
import { draw } from "./renderer.js";

function togglePause() {
  if (!S.running) return;
  S.paused = !S.paused;
  DOM.pauseOverlay.classList.toggle("hidden", !S.paused);
  if (S.paused) stopBGM(); else startBGM();
}

function selectMode(mode) {
  S.mode = mode;
  reset();
  S.running = true;
  updateModeUI();
  updateTimerUI();
  initAudio();
  startBGM();
  DOM.startOverlay.classList.add("hidden");
  DOM.gameOverOverlay.classList.add("hidden");
  DOM.pauseOverlay.classList.add("hidden");
}

function startGame() {
  selectMode(S.mode);
}

function goToMenu() {
  S.running = false;
  S.paused = false;
  stopBGM();
  DOM.gameOverOverlay.classList.add("hidden");
  DOM.pauseOverlay.classList.add("hidden");
  DOM.startOverlay.classList.remove("hidden");
}

let touchStartX = null;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  if (touchStartX === null || S.paused || !S.running) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const threshold = S.W * 0.08;
  if (Math.abs(dx) > threshold) {
    initAudio();
    chop(dx < 0 ? "left" : "right");
    touchStartX = null;
    e.preventDefault();
  }
}

function toggleMuteHandler() {
  toggleMute();
  DOM.muteBtn.textContent = isMuted() ? "🔇" : "🔊";
}

// ---- Game Loop ----
function frame(ts) {
  if (!S.lastTime) S.lastTime = ts;
  const dt = Math.min(0.05, (ts - S.lastTime) / 1000);
  S.lastTime = ts;
  tick(dt);
  draw();
  requestAnimationFrame(frame);
}

// ---- Events ----
for (const btn of DOM.modeBtns) {
  btn.addEventListener("click", () => selectMode(btn.dataset.mode));
}
DOM.retryBtn.addEventListener("click", startGame);
DOM.menuFromOverBtn.addEventListener("click", goToMenu);
DOM.menuFromPauseBtn.addEventListener("click", goToMenu);
DOM.resumeBtn.addEventListener("click", togglePause);
DOM.pauseBtn.addEventListener("click", togglePause);
if (DOM.nameSubmitBtn) DOM.nameSubmitBtn.addEventListener("click", submitPlayerName);
if (DOM.nameInput) DOM.nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitPlayerName();
});
if (DOM.nameResetBtn) DOM.nameResetBtn.addEventListener("click", resetPlayerName);

DOM.tapZones.addEventListener("click", (e) => {
  const zone = e.target.closest(".tapZone");
  if (!zone) return;
  initAudio();
  chop(zone.dataset.side);
});

DOM.legendBtn.addEventListener("click", () => {
  DOM.startOverlay.classList.add("hidden");
  DOM.legendOverlay.classList.remove("hidden");
});

DOM.legendCloseBtn.addEventListener("click", () => {
  DOM.legendOverlay.classList.add("hidden");
  DOM.startOverlay.classList.remove("hidden");
});

window.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P" || e.key === "Escape") {
    togglePause();
    return;
  }
  if (e.key === "m" || e.key === "M") {
    goToMenu();
    return;
  }
  if (S.paused) return;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") chop("left");
  else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") chop("right");
});

const root = document.getElementById("gameRoot");
root.addEventListener("touchstart", handleTouchStart, { passive: true });
root.addEventListener("touchend", handleTouchEnd, { passive: false });

if (DOM.muteBtn) DOM.muteBtn.addEventListener("click", toggleMuteHandler);

window.addEventListener("resize", resize);
resize();

// ---- Init ----
reset();
updateModeUI();
requestAnimationFrame(frame);
