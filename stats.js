// ---------- stats.js (shared across all pages) ----------
const DEFAULTS = { insight: 50, logic: 0, budget: 0 };

// Read stats from a single JSON blob; migrate any old per-key values if present
function getStats() {
  const raw = localStorage.getItem('stats');
  const base = { ...DEFAULTS };

  // migrate from old keys if they exist
  const old = {
    insight: localStorage.getItem('insight'),
    logic:   localStorage.getItem('logic'),
    budget:  localStorage.getItem('budget'),
  };
  if (old.insight !== null) base.insight = +old.insight || 0;
  if (old.logic   !== null) base.logic   = +old.logic   || 0;
  if (old.budget  !== null) base.budget  = +old.budget  || 0;

  if (!raw) return base;
  try { return { ...base, ...JSON.parse(raw) }; }
  catch { return base; }
}

function setStats(s) {
  localStorage.setItem('stats', JSON.stringify(s));
}

function clamp01(x) { return Math.max(0, Math.min(100, x)); }

// Draw HUD if present on the page
function renderStats() {
  const hud = document.getElementById('statsHud');
  if (!hud) return;               // this page has no HUD
  const s = getStats();
  hud.hidden = false;

  const insight = clamp01(s.insight);
  const logic   = clamp01(s.logic);
  const budgetP = clamp01(s.budget); // bar caps visually at 100%

  const $ = (id) => document.getElementById(id);
  $('insightFill').style.width = insight + '%';
  $('logicFill').style.width   = logic   + '%';
  $('budgetFill').style.width  = budgetP + '%';

  $('insightVal').textContent = insight;
  $('logicVal').textContent   = logic;
  $('budgetVal').textContent  = s.budget + 'k';
}

// Public helpers for game pages
function addStat(key, delta) {
  const s = getStats();
  s[key] = (s[key] ?? 0) + delta;
  // clamp tracked stats to 0–100 (budget can exceed 100 but we still show 100% fill)
  if (key !== 'budget') s[key] = clamp01(s[key]);
  setStats(s);
  renderStats();
}

function setBudget(deltaK) {
  const s = getStats();
  s.budget = (s.budget ?? 0) + deltaK; // unbounded value, bar shows up to 100%
  setStats(s);
  renderStats();
}

// Initialize once per page
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('stats')) setStats(DEFAULTS);
  renderStats();
});

// Optional global namespace
window.CODER = { getStats, setStats, addStat, setBudget, renderStats };
