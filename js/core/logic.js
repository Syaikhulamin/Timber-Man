import * as C from "./constants.js";
import * as A from "../audio/audio.js";
import { DOM, S, updateScoreUI, updateTimerUI, updateComboUI, triggerComboFlash } from "./state.js";
import { spawnChips, spawnFallenLog, spawnPopup, shake, spawnLeaves } from "./particles.js";
import { buildTree, addLog, getDifficulty } from "./tree.js";
import { endGame } from "../data/highscores.js";

export function chop(side) {
  if (!S.running || S.paused) return;
  if (S.stunned && S.mode === "classic") return;
  A.initAudio();

  S.playerSide = side;
  S.swingFrames = 8;

  const bottom = S.logs[0];
  const sideVal = side === "left" ? C.BRANCH_LEFT : C.BRANCH_RIGHT;

  if (bottom.branch === sideVal) {
    if (S.shield > 0) {
      S.shield--;
      shake(6);
      A.playShieldSound();
      spawnPopup(S.trunkX, S.groundY - C.LOG_HEIGHT * 0.4, "SHIELD!", "#4ECDC4");
      A.vibrate([30, 20, 30]);
      S.logs.shift();
      addLog();
      updateScoreUI();
      return;
    }
    S.combo = 0;
    updateComboUI();
    shake(10);
    A.playBranchSound();
    A.vibrate([50, 30, 50]);
    spawnLeaves(side, S.groundY - C.LOG_HEIGHT * 0.5);
    if (S.mode === "classic") {
      S.stunned = true;
      S.stunFrames = 40;
      S.timeLeft = Math.max(0, S.timeLeft - 1.5);
      spawnPopup(S.trunkX, S.groundY - C.LOG_HEIGHT * 0.4, "STUN!", "#FF4444");
      updateTimerUI();
    } else {
      endGame();
    }
    return;
  }

  let pointGain = 1;
  const popupY = S.groundY - C.LOG_HEIGHT * 0.4;
  if (bottom.gold) {
    pointGain = C.GOLD_LOG_BONUS;
    spawnPopup(S.trunkX, popupY, "+" + C.GOLD_LOG_BONUS, "#FFD700");
    A.playGoldSound();
  } else if (bottom.bird) {
    pointGain = C.BIRD_BONUS;
    spawnPopup(S.trunkX, popupY, "+" + C.BIRD_BONUS, "#F5A623");
    A.playBirdSound();
  } else {
    spawnPopup(S.trunkX, popupY, "+1", "#FFFFFF");
    A.playChopSound();
  }

  S.score += pointGain;
  S.combo++;
  updateComboUI();
  A.vibrate(15);

  if (S.combo > 0 && S.combo % C.COMBO_BONUS_INTERVAL === 0) {
    const bonus = Math.max(1, Math.floor(pointGain * 0.2));
    S.score += bonus;
    triggerComboFlash();
    spawnPopup(S.trunkX + (S.playerSide === "left" ? -40 : 40), popupY, "BONUS +" + bonus, "#E6B800");
    A.playComboSound();
  }

  if (!bottom.gold && Math.random() < C.SHIELD_CHANCE) {
    S.shield++;
    spawnPopup(S.trunkX, popupY - 30, "🛡️", "#4ECDC4");
  }
  if (!bottom.gold && Math.random() < C.SLOWMO_CHANCE) {
    S.slowMo = C.SLOWMO_DURATION;
    spawnPopup(S.trunkX, popupY - 30, "🐌", "#87CEEB");
    A.playSlowSound();
  }

  shake(4);
  spawnChips(side, S.groundY - C.LOG_HEIGHT * 0.5);

  if (bottom.hp > 1) {
    bottom.hp--;
    spawnPopup(S.trunkX, popupY + 20, "RETAK!", "#8B4513");
    A.playBranchSound();
    updateScoreUI();
    return;
  }

  S.logs.shift();
  addLog();
  spawnFallenLog(side);

  if (S.mode === "classic" && !bottom.gold) {
    const diff = getDifficulty();
    S.timeLeft = Math.min(C.BASE_TIME, S.timeLeft + diff.timePerChop);
  }

  updateScoreUI();
}
