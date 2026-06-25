import { DOM, S } from "../core/state.js";
import { drawLeaves, drawConfetti, drawChips, drawPopups, drawFallenLogs } from "./effects.js";
import { getPalette } from "./palette.js";
import { drawStars, drawBackground, drawSun, drawMoon, drawDistantLumberjacks } from "./background.js";
import { drawTree } from "./treeRender.js";
import { drawPlayer, drawShieldIndicator, drawSlowMoIndicator } from "./player.js";

const ctx = DOM.ctx;

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
