const STAGES = [
  { score: 0,    skyTop: "#FF9A56", skyBot: "#FFD89B", ground: "#4A7A2A", edge: "#2A5020", cloud: "#FFE4C4", starA: 0 },
  { score: 20,   skyTop: "#7EC8E3", skyBot: "#E8F4F8", ground: "#3D5C2F", edge: "#2A4220", cloud: "#FFFFFF", starA: 0 },
  { score: 50,   skyTop: "#E8734A", skyBot: "#B04A6B", ground: "#3A4A2A", edge: "#25351A", cloud: "#E8C8B0", starA: 0 },
  { score: 100,  skyTop: "#0B1026", skyBot: "#1A1A3A", ground: "#1A2A1A", edge: "#0D1A0D", cloud: "#2A3A4A", starA: 0.8 },
];

function hexToRgb(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}

function lerpHex(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  const r = ca[0]+(cb[0]-ca[0])*t, g = ca[1]+(cb[1]-ca[1])*t, bl = ca[2]+(cb[2]-ca[2])*t;
  return "#" + [r,g,bl].map(c => Math.round(c).toString(16).padStart(2,"0")).join("");
}

export function getPalette(score) {
  for (let i = STAGES.length-1; i >= 0; i--) {
    if (score >= STAGES[i].score) {
      if (i === STAGES.length-1) return STAGES[i];
      const a = STAGES[i], b = STAGES[i+1];
      const t = Math.min(1, (score - a.score) / (b.score - a.score));
      return {
        skyTop: lerpHex(a.skyTop, b.skyTop, t),
        skyBot: lerpHex(a.skyBot, b.skyBot, t),
        ground: lerpHex(a.ground, b.ground, t),
        edge: lerpHex(a.edge, b.edge, t),
        cloud: lerpHex(a.cloud, b.cloud, t),
        starA: a.starA + (b.starA - a.starA) * t,
      };
    }
  }
  return STAGES[0];
}
