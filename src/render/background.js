import * as C from "../core/constants.js";
import { DOM, S } from "../core/state.js";
import { getPalette } from "./palette.js";

const ctx = DOM.ctx;

function drawCloud(x, y, s, p) {
  ctx.save();
  ctx.globalAlpha = Math.max(0.2, 0.85 - p.starA * 0.7);
  ctx.fillStyle = p.cloud;
  ctx.beginPath();
  ctx.ellipse(x, y, 28 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 22 * s, y + 4 * s, 20 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 22 * s, y + 4 * s, 18 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function lerpColor(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const ca = [parseInt(a.slice(1,3),16), parseInt(a.slice(3,5),16), parseInt(a.slice(5,7),16)];
  const cb = [parseInt(b.slice(1,3),16), parseInt(b.slice(3,5),16), parseInt(b.slice(5,7),16)];
  const r = ca[0]+(cb[0]-ca[0])*t, g = ca[1]+(cb[1]-ca[1])*t, bl = ca[2]+(cb[2]-ca[2])*t;
  return "#" + [r,g,bl].map(c => Math.round(c).toString(16).padStart(2,"0")).join("");
}

function getTimeNight() {
  const cycleT = S.timeOfDay / C.DAY_CYCLE;
  if (cycleT < 0.25) return 0;
  if (cycleT < 0.4) return (cycleT - 0.25) / 0.15;
  if (cycleT < 0.65) return 1;
  if (cycleT < 0.8) return (0.8 - cycleT) / 0.15;
  return 0;
}

export function drawBackground() {
  const p = getPalette(S.score);
  const timeNight = getTimeNight();
  let skyTop = p.skyTop, skyBot = p.skyBot;
  if (timeNight < 0.8) {
    const noon = getPalette(20);
    const blend = 1 - timeNight / 0.8;
    skyTop = lerpColor(p.skyTop, noon.skyTop, blend);
    skyBot = lerpColor(p.skyBot, noon.skyBot, blend);
  }
  const grad = ctx.createLinearGradient(0, 0, 0, S.groundY);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(1, skyBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S.W, S.groundY);
  ctx.fillStyle = p.ground;
  ctx.fillRect(0, S.groundY, S.W, S.H - S.groundY);
  ctx.fillStyle = p.edge;
  ctx.fillRect(0, S.groundY, S.W, 10);

  const t = Date.now() * 0.0001;
  for (let i = 0; i < 5; i++) {
    const speed = 0.5 + i * 0.15;
    const cx = ((S.W * 0.15 + i * S.W * 0.22 + t * speed * S.W) % (S.W + 200)) - 100;
    const cy = 70 + (i % 2) * 40;
    drawCloud(cx, cy, 1 + (i % 2) * 0.3, p);
  }
}

export function drawStars(alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#FFF";
  for (let i = 0; i < 50; i++) {
    const x = ((i * 137.5 + 43) % S.W);
    const y = ((i * 97.3 + 17) % (S.groundY * 0.8));
    const r = 0.5 + (i % 3) * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawSun() {
  const cycleT = S.timeOfDay / C.DAY_CYCLE;
  const sunPhase = cycleT < 0.5 ? cycleT / 0.5 : 0;
  if (sunPhase <= 0) return;
  const timeNight = getTimeNight();
  const sx = S.W * sunPhase;
  const sy = S.groundY - Math.sin(sunPhase * Math.PI) * S.groundY * 0.3;
  const alpha = (1 - timeNight);
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 70);
  grad.addColorStop(0, "rgba(255,220,120,0.5)");
  grad.addColorStop(0.5, "rgba(255,200,80,0.15)");
  grad.addColorStop(1, "rgba(255,200,80,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(sx, sy, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFE87C";
  ctx.beginPath();
  ctx.arc(sx, sy, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawMoon() {
  const cycleT = S.timeOfDay / C.DAY_CYCLE;
  const moonPhase = cycleT >= 0.5 ? (cycleT - 0.5) / 0.5 : 0;
  if (moonPhase <= 0) return;
  const timeNight = getTimeNight();
  if (timeNight <= 0.02) return;
  const pal = getPalette(S.score);
  const mx = S.W * moonPhase;
  const my = 50 + Math.sin(moonPhase * Math.PI) * 30;
  ctx.save();
  ctx.globalAlpha = Math.min(1, timeNight);
  ctx.fillStyle = "#F0E8D0";
  ctx.beginPath();
  ctx.arc(mx, my, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.skyTop;
  ctx.beginPath();
  ctx.arc(mx + 4, my - 2, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawDistantLumberjacks() {
  const cycleT = S.timeOfDay / C.DAY_CYCLE;
  let alpha = 0.6;
  if (cycleT > 0.25 && cycleT < 0.4) {
    alpha = 0.6 * (1 - (cycleT - 0.25) / 0.15);
  } else if (cycleT >= 0.4 && cycleT <= 0.65) {
    alpha = 0;
  } else if (cycleT > 0.65 && cycleT < 0.8) {
    alpha = 0.6 * ((cycleT - 0.65) / 0.15);
  }
  if (alpha <= 0) return;
  const t = Date.now() * 0.003;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (const lj of S.lumberjacks) {
    ctx.save();
    const dir = lj.x < S.trunkX ? 1 : -1;
    const swing = Math.abs(Math.sin(t + lj.x)) * 14;
    ctx.translate(lj.x, S.groundY - 2);
    ctx.scale(dir * lj.scale, lj.scale);
    ctx.fillStyle = "#5C4033";
    ctx.fillRect(-20, -60, 6, 60);
    ctx.fillStyle = "#4A7C2A";
    ctx.beginPath();
    ctx.arc(-17, -70, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-30, -62, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-6, -64, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3A2A1A";
    ctx.fillRect(4, -28, 16, 28);
    ctx.fillStyle = "#5C4033";
    ctx.beginPath();
    ctx.arc(12, -34, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3A2A1A";
    ctx.fillRect(15, -24, 5, 14);
    ctx.fillStyle = "#C98A4B";
    ctx.fillRect(15 + swing, -24, 5, 3);
    ctx.restore();
  }
  ctx.restore();
}
