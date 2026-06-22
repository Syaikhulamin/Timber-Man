import { DOM, S } from "./state.js";

const ctx = DOM.ctx;

export function drawLeaves() {
  for (const l of S.leaves) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, l.life);
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.fillStyle = "#4A7C2A";
    ctx.beginPath();
    ctx.ellipse(0, 0, l.size, l.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawConfetti() {
  for (const c of S.confetti) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, c.life);
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
    ctx.restore();
  }
}
