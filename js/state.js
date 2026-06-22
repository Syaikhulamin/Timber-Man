import * as C from "./constants.js";

const canvas = document.getElementById("gameCanvas");

export const DOM = {
  canvas,
  ctx: canvas.getContext("2d"),
  scoreBox: document.getElementById("scoreBox"),
  comboBox: document.getElementById("comboBox"),
  modeBox: document.getElementById("modeBox"),
  bestBox: document.getElementById("bestBox"),
  timerFill: document.getElementById("timerFill"),
  startOverlay: document.getElementById("startOverlay"),
  gameOverOverlay: document.getElementById("gameOverOverlay"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  finalScoreEl: document.getElementById("finalScore"),
  gameOverMode: document.getElementById("gameOverMode"),
  newBestTag: document.getElementById("newBestTag"),
  hsList: document.getElementById("hsList"),
  hsBox: document.getElementById("highScoresBox"),
  modeBtns: document.querySelectorAll(".modeBtn"),
  retryBtn: document.getElementById("retryBtn"),
  resumeBtn: document.getElementById("resumeBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  menuFromOverBtn: document.getElementById("menuFromOverBtn"),
  menuFromPauseBtn: document.getElementById("menuFromPauseBtn"),
  tapZones: document.getElementById("tapZones"),
};

export const S = {
  W: 0, H: 0, trunkX: 0, groundY: 0,
  logs: [],
  score: 0, bestScore: 0,
  mode: "classic",
  playerSide: "left",
  timeLeft: C.BASE_TIME,
  running: false, paused: false,
  lastTime: 0,
  stunned: false, stunFrames: 0,
  shakeFrames: 0, shakeMag: 0,
  chips: [],
  fallenLogs: [],
  popups: [],
  swingFrames: 0,
  combo: 0,
};

export function resize() {
  const root = document.getElementById("gameRoot");
  S.W = root.clientWidth;
  S.H = root.clientHeight;
  DOM.canvas.width = S.W * devicePixelRatio;
  DOM.canvas.height = S.H * devicePixelRatio;
  DOM.canvas.style.width = S.W + "px";
  DOM.canvas.style.height = S.H + "px";
  DOM.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  S.trunkX = S.W / 2;
  S.groundY = S.H * 0.82;
}

export function updateScoreUI() {
  DOM.scoreBox.textContent = String(S.score);
}

export function updateTimerUI() {
  if (S.mode !== "classic") {
    DOM.timerFill.style.width = "100%";
    DOM.timerFill.classList.remove("warn", "danger");
    return;
  }
  const ratio = Math.max(0, S.timeLeft / C.BASE_TIME);
  DOM.timerFill.style.width = (ratio * 100) + "%";
  DOM.timerFill.classList.remove("warn", "danger");
  if (ratio < 0.25) DOM.timerFill.classList.add("danger");
  else if (ratio < 0.5) DOM.timerFill.classList.add("warn");
}

export function updateComboUI() {
  if (S.combo > 0) {
    DOM.comboBox.classList.remove("hidden");
    DOM.comboBox.textContent = "Combo x" + S.combo;
  } else {
    DOM.comboBox.classList.add("hidden");
  }
}

export function triggerComboFlash() {
  DOM.comboBox.classList.remove("bonus");
  void DOM.comboBox.offsetWidth;
  DOM.comboBox.classList.add("bonus");
}

export function spawnChips(side, wy) {
  const dir = side === "left" ? 1 : -1;
  for (let i = 0; i < 7; i++) {
    S.chips.push({
      x: S.trunkX + dir * 14, y: wy,
      vx: dir * (1.5 + Math.random() * 3.5),
      vy: -(2 + Math.random() * 3.5),
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.4,
      size: 4 + Math.random() * 5,
      life: 1
    });
  }
}

export function shake(mag) {
  S.shakeFrames = 10;
  S.shakeMag = mag;
}

export function updateChips(dt) {
  for (let i = S.chips.length - 1; i >= 0; i--) {
    const c = S.chips[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vy += 0.25;
    c.rot += c.vrot;
    c.life -= dt * 1.3;
    if (c.life <= 0) S.chips.splice(i, 1);
  }
}

export function updateModeUI() {
  const labels = { classic: "Classic", endless: "Endless", zen: "Zen" };
  DOM.modeBox.textContent = labels[S.mode] || "Classic";
}

export function getHSKey() {
  return S.mode === "classic" ? C.HS_KEY : C.HS_KEY + "_" + S.mode;
}

export function spawnPopup(x, y, text, color) {
  S.popups.push({
    x, y, text,
    color: color || "#FFFFFF",
    vy: -60,
    life: 0.9
  });
}

export function updatePopups(dt) {
  for (let i = S.popups.length - 1; i >= 0; i--) {
    const p = S.popups[i];
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) S.popups.splice(i, 1);
  }
}

export function spawnFallenLog(side) {
  const dir = side === "left" ? -1 : 1;
  S.fallenLogs.push({
    x: S.trunkX,
    y: S.groundY - C.LOG_HEIGHT / 2,
    vx: dir * 4,
    vy: -2,
    rot: 0,
    vrot: dir * 5,
    life: 0.8
  });
}

export function updateFallenLogs(dt) {
  for (let i = S.fallenLogs.length - 1; i >= 0; i--) {
    const f = S.fallenLogs[i];
    f.x += f.vx;
    f.y += f.vy;
    f.vy += 0.5;
    f.rot += f.vrot * dt;
    f.life -= dt;
    if (f.life <= 0) S.fallenLogs.splice(i, 1);
  }
}
