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

export function drawChips() {
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

export function drawPopups() {
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

export function drawFallenLogs() {
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
