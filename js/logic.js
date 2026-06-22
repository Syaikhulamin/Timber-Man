import * as C from "./constants.js";
import * as A from "./audio.js";
import { DOM, S, updateScoreUI, updateTimerUI, updateComboUI, triggerComboFlash, spawnChips, spawnFallenLog, spawnPopup, updateChips, updateFallenLogs, updatePopups, updateModeUI, getHSKey, shake, spawnLeaves, updateLeaves, spawnConfetti, updateConfetti } from "./state.js";

export function getDifficulty() {
  if (S.mode === "zen") {
    return { branchNoneProb: 0.65, timePerChop: 0 };
  }
  const t = Math.min(S.score / 120, 1);
  if (S.mode === "endless") {
    return {
      branchNoneProb: 0.40 - t * 0.3,
      timePerChop: 0
    };
  }
  return {
    branchNoneProb: C.BASE_BRANCH_NONE_PROB - t * 0.22,
    timePerChop: C.BASE_TIME_PER_CHOP - t * 0.2,
  };
}

function randBranch(prob) {
  if (Math.random() < prob) return C.BRANCH_NONE;
  return Math.random() < 0.5 ? C.BRANCH_LEFT : C.BRANCH_RIGHT;
}

function randBranchExclude(exclude, prob) {
  if (Math.random() < prob) return C.BRANCH_NONE;
  let side = Math.random() < 0.5 ? C.BRANCH_LEFT : C.BRANCH_RIGHT;
  if (side === exclude && Math.random() < 0.5) {
    side = side === C.BRANCH_LEFT ? C.BRANCH_RIGHT : C.BRANCH_LEFT;
  }
  return side;
}

function maybeSpawnBird(log) {
  if (log.branch !== C.BRANCH_NONE && Math.random() < C.BIRD_CHANCE) {
    log.bird = { timer: C.BIRD_TIMER, flap: 0 };
  }
}

function randBranchStyle() {
  return Math.floor(Math.random() * 8);
}

export function buildTree() {
  S.logs = [];
  S.logs.push({ branch: C.BRANCH_NONE, bird: null, gold: false, branchStyle: 0 });
  S.logs.push({ branch: C.BRANCH_NONE, bird: null, gold: false, branchStyle: 0 });
  const diff = getDifficulty();
  for (let i = 2; i < C.TREE_SEGMENTS; i++) {
    const log = { branch: randBranch(diff.branchNoneProb), bird: null, gold: false, branchStyle: randBranchStyle() };
    maybeSpawnBird(log);
    S.logs.push(log);
  }
}

function addLog() {
  const diff = getDifficulty();
  const last = S.logs[S.logs.length - 1];
  const exclude = last.branch === C.BRANCH_NONE ? null : last.branch;
  const log = { branch: randBranchExclude(exclude, diff.branchNoneProb), bird: null, gold: false, branchStyle: randBranchStyle() };
  if (log.branch === C.BRANCH_NONE && Math.random() < C.GOLD_LOG_CHANCE) log.gold = true;
  maybeSpawnBird(log);
  S.logs.push(log);
}

function loadHighScores() {
  const key = getHSKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  if (S.mode === "classic") {
    const old = Number(localStorage.getItem("woodcutterBest") || 0);
    return old > 0 ? [old] : [];
  }
  return [];
}

function saveHighScores(scores) {
  localStorage.setItem(getHSKey(), JSON.stringify(scores));
}

function showHighScores(current) {
  const top = loadHighScores();
  DOM.hsBox.classList.add("show");
  DOM.hsList.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const li = document.createElement("li");
    if (i < top.length) li.textContent = top[i];
    else li.textContent = "-";
    if (top[i] === current) li.classList.add("current");
    DOM.hsList.appendChild(li);
  }
}

function updateHighScores(current) {
  const list = loadHighScores();
  list.push(current);
  list.sort((a, b) => b - a);
  const top = list.slice(0, 5);
  saveHighScores(top);
  return top;
}

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

  S.logs.shift();
  addLog();

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

  if (S.mode === "classic") {
    const diff = getDifficulty();
    S.timeLeft = Math.min(C.BASE_TIME, S.timeLeft + diff.timePerChop);
  }

  if (S.combo > 0 && S.combo % C.COMBO_BONUS_INTERVAL === 0) {
    if (S.mode === "classic") {
      S.timeLeft = Math.min(C.BASE_TIME, S.timeLeft + C.COMBO_BONUS_TIME);
    }
    triggerComboFlash();
    spawnPopup(S.trunkX + (S.playerSide === "left" ? -40 : 40), popupY, "COMBO +" + C.COMBO_BONUS_TIME + "s", "#E6B800");
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
  spawnFallenLog(side);

  updateScoreUI();
}

export function endGame() {
  S.running = false;
  A.initAudio();
  A.playGameOverSound();
  const top = updateHighScores(S.score);
  const isNew = top[0] === S.score && (top.length < 2 || top[0] !== top[1]);
  S.bestScore = isNew ? S.score : (top[0] || 0);
  DOM.bestBox.textContent = "Terbaik: " + S.bestScore;
  DOM.finalScoreEl.textContent = String(S.score);
  DOM.gameOverMode.textContent = "Mode: " + (S.mode === "classic" ? "Classic" : S.mode === "endless" ? "Endless" : "Zen");
  DOM.newBestTag.classList.toggle("show", isNew);
  if (isNew) spawnConfetti();
  showHighScores(S.score);
  A.stopBGM();
  DOM.gameOverOverlay.classList.remove("hidden");
}

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
  }
}
