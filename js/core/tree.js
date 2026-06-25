import * as C from "./constants.js";
import { S } from "./state.js";

export function getDifficulty() {
  if (S.mode === "zen") {
    return { branchNoneProb: 0.65, timePerChop: 0 };
  }
  const t = Math.min(S.score / 120, 1);
  if (S.mode === "endless") {
    return {
      branchNoneProb: 0.40 - t * 0.3,
      timePerChop: 0
    };
  }
  return {
    branchNoneProb: C.BASE_BRANCH_NONE_PROB - t * 0.22,
    timePerChop: C.BASE_TIME_PER_CHOP - t * 0.2,
  };
}

function randBranch(prob) {
  if (Math.random() < prob) return C.BRANCH_NONE;
  return Math.random() < 0.5 ? C.BRANCH_LEFT : C.BRANCH_RIGHT;
}

function randBranchExclude(exclude, prob) {
  if (Math.random() < prob) return C.BRANCH_NONE;
  let side = Math.random() < 0.5 ? C.BRANCH_LEFT : C.BRANCH_RIGHT;
  if (side === exclude && Math.random() < 0.5) {
    side = side === C.BRANCH_LEFT ? C.BRANCH_RIGHT : C.BRANCH_LEFT;
  }
  return side;
}

function maybeSpawnBird(log) {
  if (log.branch !== C.BRANCH_NONE && Math.random() < C.BIRD_CHANCE) {
    log.bird = { timer: C.BIRD_TIMER, flap: 0 };
  }
}

function randBranchStyle() {
  return Math.floor(Math.random() * 8);
}

export function buildTree() {
  S.logs = [];
  S.logs.push({ branch: C.BRANCH_NONE, bird: null, gold: false, branchStyle: 0, hp: 1 });
  S.logs.push({ branch: C.BRANCH_NONE, bird: null, gold: false, branchStyle: 0, hp: 1 });
  const diff = getDifficulty();
  for (let i = 2; i < C.TREE_SEGMENTS; i++) {
    const log = { branch: randBranch(diff.branchNoneProb), bird: null, gold: false, branchStyle: randBranchStyle(), hp: 1 };
    maybeSpawnBird(log);
    S.logs.push(log);
  }
}

export function addLog() {
  const diff = getDifficulty();
  const last = S.logs[S.logs.length - 1];
  const exclude = last.branch === C.BRANCH_NONE ? null : last.branch;
  const log = { branch: randBranchExclude(exclude, diff.branchNoneProb), bird: null, gold: false, branchStyle: randBranchStyle(), hp: 1 };
  if (log.branch === C.BRANCH_NONE) {
    if (Math.random() < C.GOLD_LOG_CHANCE) log.gold = true;
    if (S.score >= C.HARD_WOOD_SCORE && Math.random() < C.HARD_WOOD_CHANCE) log.hp = 2;
  }
  maybeSpawnBird(log);
  S.logs.push(log);
}
