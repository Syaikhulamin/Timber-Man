import * as C from "./constants.js";
import { DOM, S, resize, updateModeUI, updateTimerUI } from "./state.js";
import { chop, reset, tick } from "./logic.js";
import { initAudio } from "./audio.js";
import { draw } from "./renderer.js";

function togglePause() {
  if (!S.running) return;
  S.paused = !S.paused;
  DOM.pauseOverlay.classList.toggle("hidden", !S.paused);
}

function selectMode(mode) {
  S.mode = mode;
  reset();
  S.running = true;
  updateModeUI();
  updateTimerUI();
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
  DOM.gameOverOverlay.classList.add("hidden");
  DOM.pauseOverlay.classList.add("hidden");
  DOM.startOverlay.classList.remove("hidden");
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

DOM.tapZones.addEventListener("click", (e) => {
  const zone = e.target.closest(".tapZone");
  if (!zone) return;
  initAudio();
  chop(zone.dataset.side);
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

window.addEventListener("resize", resize);
resize();

// ---- Init ----
reset();
updateModeUI();
requestAnimationFrame(frame);
