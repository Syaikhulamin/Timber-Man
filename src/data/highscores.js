import * as C from "../core/constants.js";
import * as A from "../audio/audio.js";
import { DOM, S, getHSKey } from "../core/state.js";
import { spawnConfetti } from "../core/particles.js";

function loadHighScores() {
  const key = getHSKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) throw 0;
    const data = JSON.parse(raw);
    if (data.length > 0 && typeof data[0] === "number") return data.map(s => ({ name: "Player", score: s }));
    return data;
  } catch (_) {}
  if (S.mode === "classic") {
    const old = Number(localStorage.getItem("woodcutterBest") || 0);
    return old > 0 ? [{ name: "Player", score: old }] : [];
  }
  return [];
}

function saveHighScores(scores) {
  localStorage.setItem(getHSKey(), JSON.stringify(scores));
}

function showHighScores(current) {
  const top = loadHighScores();
  DOM.hsBox.classList.add("show");
  DOM.hsList.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const li = document.createElement("li");
    li.innerHTML = i < top.length ? "<span>" + top[i].name + "</span><span>" + top[i].score + "</span>" : "<span>-</span><span></span>";
    if (top[i] && top[i].score === current) li.classList.add("current");
    DOM.hsList.appendChild(li);
  }
}

function updateHighScores(current) {
  const list = loadHighScores();
  list.push({ name: "Player", score: current });
  list.sort((a, b) => b.score - a.score);
  const top = list.slice(0, 5);
  saveHighScores(top);
  return { scores: top, inTop5: top.some(e => e.score === current) };
}

export function endGame() {
  S.running = false;
  A.initAudio();
  A.playGameOverSound();
  const result = updateHighScores(S.score);
  const top = result.scores, inTop5 = result.inTop5;
  const isNew = top[0] && top[0].score === S.score && (top.length < 2 || top[0].score !== top[1].score);
  S.bestScore = isNew ? S.score : (top[0] ? top[0].score : 0);
  DOM.bestBox.textContent = "Terbaik: " + S.bestScore;
  DOM.finalScoreEl.textContent = String(S.score);
  DOM.gameOverMode.textContent = "Mode: " + (S.mode === "classic" ? "Classic" : S.mode === "endless" ? "Endless" : "Zen");
  DOM.nameInputWrap.classList.toggle("hidden", !inTop5);
  if (inTop5) DOM.nameInput.value = "";
  DOM.newBestTag.classList.toggle("show", isNew);
  if (isNew) spawnConfetti();
  showHighScores(S.score);
  A.stopBGM();
  DOM.gameOverOverlay.classList.remove("hidden");
}

export function submitPlayerName() {
  const name = DOM.nameInput.value.trim().slice(0, 10) || "Player";
  const scores = loadHighScores();
  const entry = scores.find(e => e.score === S.score && e.name === "Player");
  if (entry) entry.name = name;
  saveHighScores(scores);
  showHighScores(S.score);
}
