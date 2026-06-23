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
  S.logs.push({ branch: C.BRANCH_NONE, bird: null, gold: false, branchStyle: 0, hp: 1 });
  S.logs.push({ branch: C.BRANCH_NONE, bird: null, gold: false, branchStyle: 0, hp: 1 });
  const diff = getDifficulty();
  for (let i = 2; i < C.TREE_SEGMENTS; i++) {
    const log = { branch: randBranch(diff.branchNoneProb), bird: null, gold: false, branchStyle: randBranchStyle(), hp: 1 };
    maybeSpawnBird(log);
    S.logs.push(log);
  }
}

function addLog() {
  const diff = getDifficulty();
  const last = S.logs[S.logs.length - 1];
  const exclude = last.branch === C.BRANCH_NONE ? null : last.branch;
  const log = { branch: randBranchExclude(exclude, diff.branchNoneProb), bird: null, gold: false, branchStyle: randBranchStyle(), hp: 1 };
  if (log.branch === C.BRANCH_NONE) {
    if (Math.random() < C.GOLD_LOG_CHANCE) log.gold = true;
    if (S.score >= C.HARD_WOOD_SCORE && Math.random() < C.HARD_WOOD_CHANCE) log.hp = 2;
  }
  maybeSpawnBird(log);
  S.logs.push(log);
}

function loadHighScores() {
  const key = getHSKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) throw 0;
    const data = JSON.parse(raw);
    if (data.length > 0 && typeof data[0] === "number") return data.map(s => ({ name: "Player", score: s }));
    return data;
  } catch (_) {}
  if (S.mode === "classic") {
    const old = Number(localStorage.getItem("woodcutterBest") || 0);
    return old > 0 ? [{ name: "Player", score: old }] : [];
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
    li.innerHTML = i < top.length ? "<span>" + top[i].name + "</span><span>" + top[i].score + "</span>" : "<span>-</span><span></span>";
    if (top[i] && top[i].score === current) li.classList.add("current");
    DOM.hsList.appendChild(li);
  }
}
function updateHighScores(current) {
  const list = loadHighScores();
  const savedName = localStorage.getItem(C.PLAYER_NAME_KEY) || "Player";
  list.push({ name: savedName, score: current });
  list.sort((a, b) => b.score - a.score);
  const top = list.slice(0, 5);
  saveHighScores(top);
  return { scores: top, inTop5: top.some(e => e.score === current) };
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

export function endGame() {
  S.running = false;
  A.initAudio();
  A.playGameOverSound();
  const result = updateHighScores(S.score);
  const top = result.scores, inTop5 = result.inTop5;
  const isNew = top[0] && top[0].score === S.score && (top.length < 2 || top[0].score !== top[1].score);
  S.bestScore = isNew ? S.score : (top[0] ? top[0].score : 0);
  DOM.bestBox.textContent = "Terbaik: " + S.bestScore;
  DOM.finalScoreEl.textContent = String(S.score);
  DOM.gameOverMode.textContent = "Mode: " + (S.mode === "classic" ? "Classic" : S.mode === "endless" ? "Endless" : "Zen");
  DOM.nameInputWrap.classList.toggle("hidden", !inTop5);
  if (inTop5) DOM.nameInput.value = localStorage.getItem(C.PLAYER_NAME_KEY) || "";
  DOM.newBestTag.classList.toggle("show", isNew);
  if (isNew) spawnConfetti();
  showHighScores(S.score);
  A.stopBGM();
  DOM.gameOverOverlay.classList.remove("hidden");
}
export function submitPlayerName() {
  const name = DOM.nameInput.value.trim().slice(0, 10) || "Player";
  localStorage.setItem(C.PLAYER_NAME_KEY, name);
  const scores = loadHighScores();
  const entry = scores.find(e => e.score === S.score && e.name === "Player");
  if (entry) entry.name = name;
  saveHighScores(scores);
  showHighScores(S.score);
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
