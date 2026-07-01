import * as C from "./constants.js";
import { DOM, S, updateScoreUI, updateTimerUI, updateComboUI } from "./state.js";
import { updateChips, updateFallenLogs, updatePopups, updateLeaves, updateConfetti } from "./particles.js";
import { buildTree } from "./tree.js";
import { endGame } from "../data/highscores.js";

export function reset() {
  S.score = 0;
  S.timeLeft = C.BASE_TIME;
  S.playerSide = "left";
  S.bestScore = 0;
  S.shakeFrames = 0;
  S.shakeMag = 0;
  S.chips = [];
  S.fallenLogs = [];
  S.popups = [];
  S.leaves = [];
  S.confetti = [];
  S.swingFrames = 0;
  S.combo = 0;
  S.shield = 0;
  S.slowMo = 0;
  S.stunned = false;
  S.stunFrames = 0;
  S.paused = false;
  DOM.pauseOverlay.classList.add("hidden");
  DOM.gameOverOverlay.classList.add("hidden");
  DOM.hsBox.classList.remove("show");
  S.timeOfDay = 0;
  S.lumberjacks = [];
  const lCount = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < lCount; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    S.lumberjacks.push({
      x: S.W * (0.5 + side * (0.12 + Math.random() * 0.22)),
      scale: 0.7 + Math.random() * 0.6,
    });
  }
  updateComboUI();
  buildTree();
  updateScoreUI();
  updateTimerUI();
}

export function tick(dt) {
  if (!S.running) return;
  if (!S.paused) {
    if (S.slowMo > 0) dt *= 0.5;

    if (S.mode === "classic") {
      S.timeLeft -= dt;
      updateTimerUI();
      if (S.timeLeft <= 0) {
        S.timeLeft = 0;
        updateTimerUI();
        endGame();
        return;
      }
    }

    for (const log of S.logs) {
      if (log.bird) {
        log.bird.timer -= dt;
        log.bird.flap += dt;
        if (log.bird.timer <= 0) log.bird = null;
      }
    }

    updateChips(dt);
    updateFallenLogs(dt);
    updatePopups(dt);
    updateLeaves(dt);
    updateConfetti(dt);
    if (S.swingFrames > 0) S.swingFrames--;
    if (S.shakeFrames > 0) S.shakeFrames--;
    if (S.stunFrames > 0) {
      S.stunFrames--;
      if (S.stunFrames <= 0) S.stunned = false;
    }
    if (S.slowMo > 0) S.slowMo = Math.max(0, S.slowMo - dt);
    S.timeOfDay = (S.timeOfDay + dt) % C.DAY_CYCLE;
  }
}
