import * as C from "./constants.js";
import { S } from "./state.js";

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
  const speedMul = 1 + S.score * 0.006;
  for (let i = S.fallenLogs.length - 1; i >= 0; i--) {
    const f = S.fallenLogs[i];
    f.x += f.vx * speedMul;
    f.y += f.vy * speedMul;
    f.vy += 0.5;
    f.rot += f.vrot * dt;
    f.life -= dt;
    if (f.life <= 0) S.fallenLogs.splice(i, 1);
  }
}

export function shake(mag) {
  S.shakeFrames = 10;
  S.shakeMag = mag;
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

export function spawnLeaves(side, y) {
  const dir = side === "left" ? 1 : -1;
  for (let i = 0; i < 12; i++) {
    S.leaves.push({
      x: S.trunkX + dir * (10 + Math.random() * 30),
      y: y + (Math.random() - 0.5) * 40,
      vx: dir * (0.5 + Math.random() * 2),
      vy: -(0.5 + Math.random() * 1.5),
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 3,
      size: 3 + Math.random() * 4,
      life: 1,
    });
  }
}

export function updateLeaves(dt) {
  for (let i = S.leaves.length - 1; i >= 0; i--) {
    const l = S.leaves[i];
    l.x += l.vx;
    l.y += l.vy;
    l.vy += 0.08;
    l.rot += l.vrot * dt;
    l.life -= dt * 0.6;
    if (l.life <= 0) S.leaves.splice(i, 1);
  }
}

export function spawnConfetti() {
  const colors = ["#FF6B6B", "#F5A623", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
  for (let i = 0; i < 30; i++) {
    S.confetti.push({
      x: S.W * 0.2 + Math.random() * S.W * 0.6,
      y: -20,
      vx: (Math.random() - 0.5) * 6,
      vy: 1 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 6,
      size: 4 + Math.random() * 4,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

export function updateConfetti(dt) {
  for (let i = S.confetti.length - 1; i >= 0; i--) {
    const c = S.confetti[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vy += 0.1;
    c.rot += c.vrot * dt;
    c.life -= dt * 0.25;
    if (c.life <= 0) S.confetti.splice(i, 1);
  }
}
