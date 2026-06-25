import * as C from "../core/constants.js";
import { DOM, S } from "../core/state.js";

const ctx = DOM.ctx;

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

export function drawTree() {
  for (let i = 0; i < S.logs.length; i++) {
    const wy = S.groundY - i * C.LOG_HEIGHT;
    if (wy < -C.LOG_HEIGHT || wy > S.H + C.LOG_HEIGHT) continue;
    drawLogSegment(S.logs[i], wy, i === 0);
  }
}
