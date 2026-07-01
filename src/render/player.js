import * as C from "../core/constants.js";
import { DOM, S } from "../core/state.js";

const ctx = DOM.ctx;

export function drawShieldIndicator() {
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

export function drawSlowMoIndicator() {
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

export function drawPlayer() {
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
