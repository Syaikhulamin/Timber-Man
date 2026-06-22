import * as C from "./constants.js";
import { DOM, S } from "./state.js";
import { drawLeaves, drawConfetti } from "./effects.js";

const ctx = DOM.ctx;function drawCloud(x, y, s) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.ellipse(x, y, 28 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 22 * s, y + 4 * s, 20 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 22 * s, y + 4 * s, 18 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBackground() {
  ctx.fillStyle = "#3D5C2F";
  ctx.fillRect(0, S.groundY, S.W, S.H - S.groundY);
  ctx.fillStyle = "#2A4220";
  ctx.fillRect(0, S.groundY, S.W, 10);

  for (let i = 0; i < 5; i++) {
    const cx = S.W * 0.15 + i * S.W * 0.22;
    const cy = 70 + (i % 2) * 40;
    drawCloud(cx, cy, 1 + (i % 2) * 0.3);
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
function drawLogBody(left, top, tw, wy, fill, stripe, stroke) {
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
}
function drawLogSegment(log, wy, isBottom) {
  const tw = 64, left = S.trunkX - tw / 2, top = wy - C.LOG_HEIGHT;
  if (log.gold) {
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
function drawChips() {
  for (const c of S.chips) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, c.life);
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = "#C98A4B";
    ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
    ctx.restore();
  }
}
function drawPopups() {
  for (const p of S.popups) {
    const alpha = Math.max(0, p.life / 0.9);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 4;
    ctx.strokeText(p.text, 0, 0);
    ctx.fillText(p.text, 0, 0);
    ctx.restore();
  }
}
function drawFallenLogs() {
  for (const f of S.fallenLogs) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, f.life * 1.5);
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.fillStyle = "#A9713F";
    ctx.fillRect(-32, -C.LOG_HEIGHT / 2, 64, C.LOG_HEIGHT);
    ctx.fillStyle = "rgba(111,69,24,0.35)";
    ctx.fillRect(-32, -C.LOG_HEIGHT / 2, 10, C.LOG_HEIGHT);
    ctx.fillRect(22, -C.LOG_HEIGHT / 2, 10, C.LOG_HEIGHT);
    ctx.restore();
  }
}
export function draw() {
  ctx.save();
  if (S.shakeFrames > 0) {
    ctx.translate((Math.random() - 0.5) * S.shakeMag, (Math.random() - 0.5) * S.shakeMag);
  }
  ctx.clearRect(-20, -20, S.W + 40, S.H + 40);
  drawBackground();
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
