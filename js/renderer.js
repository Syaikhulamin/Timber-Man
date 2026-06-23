import * as C from "./constants.js";
import { DOM, S } from "./state.js";
import { drawLeaves, drawConfetti, drawChips, drawPopups, drawFallenLogs } from "./effects.js";
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

function drawBackground() {
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

const BRANCH_STYLES = [
  { w: "#8B5A2B", l1: "#4A7C2A", l2: "#38601F", len:58, th:16 },
  { w: "#9B6A3B", l1: "#D4A025", l2: "#B8860B", len:52, th:14 },
  { w: "#7B4A1B", l1: "#C0392B", l2: "#922B21", len:56, th:18 },
  { w: "#8B6B3B", l1: "#6B8E23", l2: "#556B2F", len:64, th:14 },
  { w: "#8B7B3B", l1: "#9ACD32", l2: "#7CB342", len:54, th:15 },
  { w: "#8B5A2B", l1: "#4A7C2A", l2: "#38601F", len:62, th:17, berry:"#E74C3C" },
  { w: "#6B4A2B", l1: "#8B4513", l2: "#6B3410", len:48, th:13 },
  { w: "#9B7A4B", l1: "#66CDAA", l2: "#3CB371", len:60, th:16 },
];

function drawBranch(bx, by, dir, si) {
  const s = BRANCH_STYLES[si] || BRANCH_STYLES[0];
  ctx.fillStyle = s.w;
  ctx.fillRect(dir > 0 ? bx : bx - s.len, by - s.th / 2, s.len, s.th);
  const lx = bx + dir * s.len;
  ctx.fillStyle = s.l1;
  ctx.beginPath();
  ctx.ellipse(lx, by - 6, 26, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = s.l2;
  ctx.beginPath();
  ctx.ellipse(lx + dir * 10, by + 8, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  if (s.berry) {
    ctx.fillStyle = s.berry;
    ctx.beginPath();
    ctx.arc(lx + dir * 6, by - 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx + dir * 14, by - 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
function drawBird(x, y, dir, flap) {
  const bob = Math.sin(flap * 8) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(dir, 1);

  ctx.fillStyle = "#E85D3A";
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#F5A623";
  ctx.beginPath();
  ctx.moveTo(10, -2);
  ctx.lineTo(16, 0);
  ctx.lineTo(10, 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(5, -1, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#D64B2A";
  ctx.beginPath();
  ctx.ellipse(-3, -4 + Math.sin(flap * 12) * 3, 9, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
function drawLogBody(left, top, tw, wy, fill, stripe, stroke, cracked) {
  ctx.fillStyle = fill;
  ctx.fillRect(left, top, tw, C.LOG_HEIGHT);
  ctx.fillStyle = stripe;
  ctx.fillRect(left, top, 10, C.LOG_HEIGHT);
  ctx.fillRect(left + tw - 10, top, 10, C.LOG_HEIGHT);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left, wy);
  ctx.lineTo(left + tw, wy);
  ctx.stroke();
  if (cracked) {
    ctx.strokeStyle = "#2A1A0A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left + tw * 0.3, top + 4);
    ctx.lineTo(left + tw * 0.5, top + C.LOG_HEIGHT * 0.45);
    ctx.lineTo(left + tw * 0.7, top + C.LOG_HEIGHT - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left + tw * 0.45, top + 10);
    ctx.lineTo(left + tw * 0.35, top + C.LOG_HEIGHT * 0.3);
    ctx.stroke();
  }
}
function drawLogSegment(log, wy, isBottom) {
  const tw = 64, left = S.trunkX - tw / 2, top = wy - C.LOG_HEIGHT;
  const isHard = log.hp > 1;
  const isCracked = log.hp === 1 && isBottom;
  if (isHard) {
    drawLogBody(left, top, tw, wy, "#5C3A1E", "rgba(60,35,10,0.4)", "#3D2210", isCracked);
  } else if (log.gold) {
    drawLogBody(left, top, tw, wy, "#F5D742", "rgba(200,170,20,0.35)", "#B8960F");
  } else {
    drawLogBody(left, top, tw, wy, "#A9713F", "rgba(111,69,24,0.35)", "#6F4518");
  }

  if (isBottom) {
    ctx.fillStyle = "#D9B58A";
    ctx.beginPath();
    ctx.ellipse(S.trunkX, top + 6, tw / 2 - 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#A9713F";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(S.trunkX, top + 6, tw / 2 - 16, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (log.branch === C.BRANCH_LEFT) {
    drawBranch(left, top + C.LOG_HEIGHT * 0.2, -1, log.branchStyle);
    if (log.bird) drawBird(left - 10, top + C.LOG_HEIGHT * 0.2 - 8, -1, log.bird.flap);
  } else if (log.branch === C.BRANCH_RIGHT) {
    drawBranch(left + tw, top + C.LOG_HEIGHT * 0.2, 1, log.branchStyle);
    if (log.bird) drawBird(left + tw + 10, top + C.LOG_HEIGHT * 0.2 - 8, 1, log.bird.flap);
  }
}
function drawTree() {
  for (let i = 0; i < S.logs.length; i++) {
    const wy = S.groundY - i * C.LOG_HEIGHT;
    if (wy < -C.LOG_HEIGHT || wy > S.H + C.LOG_HEIGHT) continue;
    drawLogSegment(S.logs[i], wy, i === 0);
  }
}
function drawShieldIndicator() {
  if (S.shield <= 0) return;
  const x = S.trunkX - 80, y = S.groundY - 20;
  ctx.save();
  ctx.fillStyle = "#4ECDC4";
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(78,205,196,0.2)";
  ctx.fill();
  ctx.strokeStyle = "#4ECDC4";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#4ECDC4";
  ctx.fillText("🛡", x, y + 1);
  ctx.fillStyle = "#FFF";
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("x" + S.shield, x, y + 28);
  ctx.restore();
}
function drawSlowMoIndicator() {
  if (S.slowMo <= 0) return;
  ctx.save();
  ctx.fillStyle = "rgba(135,206,235,0.12)";
  ctx.fillRect(0, 0, S.W, S.H);
  ctx.fillStyle = "#87CEEB";
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 3;
  ctx.strokeText("🐌 SLOW", S.trunkX, 60);
  ctx.fillText("🐌 SLOW", S.trunkX, 60);
  ctx.restore();
}
function drawPlayer() {
  const flip = S.playerSide === "left" ? -1 : 1;
  const sx = S.trunkX + flip * 58, sy = S.groundY;
  const swing = S.swingFrames > 0;
  const prog = swing ? (8 - S.swingFrames) / 8 : 0;
  const lean = swing ? Math.sin(prog * Math.PI) * 0.5 : 0;

  ctx.save();
  if (S.stunned) ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.02) * 0.3;
  ctx.translate(sx, sy);
  ctx.scale(flip, 1);
  ctx.rotate(-lean * 0.3);

  ctx.fillStyle = "#E8B98A";
  ctx.beginPath();
  ctx.arc(0, -64, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#D64545";
  ctx.beginPath();
  ctx.moveTo(-14, -50);
  ctx.lineTo(14, -50);
  ctx.lineTo(11, -8);
  ctx.lineTo(-11, -8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3A4A6B";
  ctx.fillRect(-11, -10, 9, 26);
  ctx.fillRect(2, -10, 9, 26);

  ctx.fillStyle = "#E8B98A";
  ctx.save();
  ctx.translate(10, -42);
  ctx.rotate(lean * 1.8 - 0.3);
  ctx.fillRect(0, -5, 30, 10);
  ctx.fillStyle = "#777";
  ctx.beginPath();
  ctx.moveTo(28, -10);
  ctx.lineTo(44, -16);
  ctx.lineTo(44, 14);
  ctx.lineTo(28, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();

  if (S.shield > 0) {
    ctx.save();
    ctx.globalAlpha = 0.25 + Math.sin(Date.now() * 0.006) * 0.1;
    ctx.strokeStyle = "#4ECDC4";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(sx, sy - 28, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.12;
    ctx.setLineDash([]);
    ctx.fillStyle = "#4ECDC4";
    ctx.beginPath();
    ctx.arc(sx, sy - 28, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (S.stunned) {
    ctx.save();
    ctx.fillStyle = "#FF4444";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 3;
    ctx.strokeText("STUN!", sx, sy - 78);
    ctx.fillText("STUN!", sx, sy - 78);
    ctx.restore();
  }
}
function drawStars(alpha) {
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
function getTimeNight() {
  const cycleT = S.timeOfDay / C.DAY_CYCLE;
  if (cycleT < 0.25) return 0;
  if (cycleT < 0.4) return (cycleT - 0.25) / 0.15;
  if (cycleT < 0.65) return 1;
  if (cycleT < 0.8) return (0.8 - cycleT) / 0.15;
  return 0;
}

function drawSun() {
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

function drawMoon() {
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

function drawDistantLumberjacks() {
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

export function draw() {
  ctx.save();
  if (S.shakeFrames > 0) {
    ctx.translate((Math.random() - 0.5) * S.shakeMag, (Math.random() - 0.5) * S.shakeMag);
  }
  ctx.clearRect(-20, -20, S.W + 40, S.H + 40);
  drawStars(getPalette(S.score).starA);
  drawBackground();
  drawSun();
  drawMoon();
  drawDistantLumberjacks();
  drawConfetti();
  drawTree();
  drawPlayer();
  drawShieldIndicator();
  drawSlowMoIndicator();
  drawFallenLogs();
  drawPopups();
  drawChips();
  drawLeaves();
  ctx.restore();
}
