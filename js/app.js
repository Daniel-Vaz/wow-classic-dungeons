// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
const PREFS_KEY = 'wow_prefs';
let currentDungeonId = 'rfc';
let currentFilter = 'all';
let hasGearOnly = false;
let currentView = 'grid';
let searchQuery = '';
let completed = JSON.parse(localStorage.getItem('wow_completed') || '{}');
let locationFilter = null;
let factionFilter = null;
let classFilter = null;
// When set (to a dungeon quest's name), only that main dungeon quest's chain shows.
let dungeonQuestFilter = null;
// Collapsed/expanded state of the dungeon-quest panel. null = use per-dungeon default.
let dungeonQuestFiltersOpen = null;

// ═══════════════════════════════════════
//  DATA NORMALISATION
//  Supports both the old static format and the new scraped format
// ═══════════════════════════════════════
function normalizeQuest(q) {
  // Rewards: new format is array of {id,name,url,quality}; old format is a string or items[]
  let rewards = q.rewards;
  if (!Array.isArray(rewards)) {
    rewards = rewards ? [{ id: null, name: rewards, url: null, quality: 1 }] : [];
  }

  let rewardChoices = Array.isArray(q.rewardChoices) ? q.rewardChoices : [];

  // Old "items" field: array of plain strings → convert to reward-objects (quality 2 default)
  let legacyItems = [];
  if (Array.isArray(q.items) && q.items.length > 0) {
    legacyItems = q.items.map(name => ({ id: null, name, url: null, quality: 2 }));
  }

  return {
    ...q,
    rewards,
    rewardChoices,
    legacyItems,
    chainId:        q.chainId        ?? null,
    chainDepth:     q.chainDepth     ?? 0,
    levels:         q.levels         || '',
    minLevel:       q.minLevel       ?? null,
    faction:        q.faction        || '',
    startItem:       q.startItem       || '',
    startItemLink:   q.startItemLink   || '',
    startObject:     q.startObject     || '',
    startObjectLink: q.startObjectLink || '',
    endObject:       q.endObject       || '',
    endObjectLink:   q.endObjectLink   || '',
    startNpcs:       Array.isArray(q.startNpcs) ? q.startNpcs : [],
    endNpcs:         Array.isArray(q.endNpcs)   ? q.endNpcs   : [],
    preChain:       Array.isArray(q.preChain)  ? q.preChain  : [],
    postChain:      Array.isArray(q.postChain) ? q.postChain : [],
    absorbedBy:     q.absorbedBy     ?? null,
    money:          q.money          || 0,
    requiredClasses: Array.isArray(q.requiredClasses) ? q.requiredClasses : [],
  };
}

// schema-2 dungeons key completions by quest ID so same-named quests in a
// series (e.g. all five "Hidden Enemies") are tracked independently.
// Legacy dungeons keep the name-based key to preserve existing saved progress.
function questKey(dungeon, quest) {
  return dungeon.schema === 2
    ? dungeon.id + '::id::' + quest.id
    : dungeon.id + '::' + quest.name;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(copper) {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  const parts = [];
  if (g) parts.push(`<span class="money-gold">${g}g</span>`);
  if (s) parts.push(`<span class="money-silver">${s}s</span>`);
  if (c || !parts.length) parts.push(`<span class="money-copper">${c}c</span>`);
  return parts.join(' ');
}

function moneyTier(copper) {
  if (copper >= 10000) return 'gold';
  if (copper >= 100) return 'silver';
  return 'copper';
}

function buildLocationLink(name) {
  if (!name) return '';
  if (!ZONE_IDS[name]) return name;
  return `<span class="location-link" data-location="${name}" title="View map">${name}</span>`;
}

// Resolve a predefined-pin entry (curated MAP_PINS or generated QUEST_PINS) for
// a location, by location name or its zone ID — mirrors renderMapPins's lookup.
function resolveSystemPinEntry(source, location) {
  const zoneId = ZONE_IDS[location];
  return source[location] || (zoneId && source[zoneId]) || null;
}

// Find the predefined pin (and its map level) matching a giver name in a zone.
// Returns { pin, levelIndex } or null. Used to decide whether a quest-giver
// name should act as a map link, and where to focus when it is clicked.
function questPinFor(location, label) {
  if (!location || !label) return null;
  const want = label.trim().toLowerCase();
  const sources = [typeof QUEST_PINS !== 'undefined' ? QUEST_PINS : null, MAP_PINS];
  for (const source of sources) {
    if (!source) continue;
    const entry = resolveSystemPinEntry(source, location);
    if (!entry) continue;
    const levels = Array.isArray(entry[0]) ? entry : [entry];
    for (let lvl = 0; lvl < levels.length; lvl++) {
      const hit = (levels[lvl] || []).find(p => (p.label || '').trim().toLowerCase() === want);
      if (hit) return { pin: hit, levelIndex: lvl };
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  QUEST ↔ NPC CROSS-REFERENCE
//  Map pins are scraped quest-giver locations keyed only by a Wowhead URL, so on
//  their own they don't reveal *which* quests an NPC serves — and one NPC can be
//  a giver for quests across several dungeons. We build a reverse index from the
//  entity id embedded in each giver link (npc=/object=/item=) to the quests that
//  use it, so a pin can list its associated quests grouped by dungeon.
// ─────────────────────────────────────────────────────────────────────────────

// Extract a stable "type:id" key (e.g. "npc:3216") from a Wowhead giver/pin URL.
function entityKeyFromUrl(url) {
  if (!url) return null;
  const m = url.match(/(npc|object|item)=(\d+)/);
  return m ? `${m[1]}:${m[2]}` : null;
}

// Collect the giver links of a quest as { key, role } pairs. Prefers the
// multi-giver arrays (startNpcs/endNpcs) when present, else the single fields.
function questGiverKeys(q) {
  const out = [];
  const add = (url, role) => {
    const key = entityKeyFromUrl(url);
    if (key) out.push({ key, role });
  };
  if (Array.isArray(q.startNpcs) && q.startNpcs.length) {
    q.startNpcs.forEach(n => add(n.link, 'start'));
  } else {
    add(q.startNpcLink || q.startObjectLink || q.startItemLink, 'start');
  }
  if (Array.isArray(q.endNpcs) && q.endNpcs.length) {
    q.endNpcs.forEach(n => add(n.link, 'turnin'));
  } else {
    add(q.endNpcLink || q.endObjectLink, 'turnin');
  }
  return out;
}

// Reverse index: "type:id" → [{ dungeonId, dungeonName, dungeonAbbr, questName,
// questId, questLink, roles[] }]. Built lazily on first use (DUNGEONS is global).
let _questNpcIndex = null;
function questNpcIndex() {
  if (_questNpcIndex) return _questNpcIndex;
  const idx = {};
  if (typeof DUNGEONS !== 'undefined') {
    DUNGEONS.forEach(d => {
      // getCountableQuests yields exactly the quests that surface as their own
      // card — top-level quests plus the preChain "requires" alternatives (e.g.
      // a class quest's city-specific giver variants) that aren't in d.quests
      // directly. Iterating d.quests alone would miss those nested givers.
      getCountableQuests(d).forEach(q => {
        // Merge roles per entity so an NPC that both starts and turns in the
        // same quest yields a single entry tagged with both roles.
        const rolesByKey = {};
        questGiverKeys(q).forEach(({ key, role }) => {
          (rolesByKey[key] = rolesByKey[key] || new Set()).add(role);
        });
        Object.entries(rolesByKey).forEach(([key, roles]) => {
          (idx[key] = idx[key] || []).push({
            dungeonId: d.id,
            dungeonName: d.name,
            dungeonAbbr: d.abbr,
            questName: q.name,
            questId: q.id,
            questLink: q.questLink,
            roles: [...roles],
          });
        });
      });
    });
  }
  _questNpcIndex = idx;
  return idx;
}

// Quests associated with a map pin (via its Wowhead URL), grouped by dungeon.
// Returns [] when the pin has no matching giver. Each group:
// { dungeonId, dungeonName, dungeonAbbr, quests: [entry, ...] }.
function pinQuestGroups(pin) {
  const key = pin && entityKeyFromUrl(pin.url);
  const entries = key ? (questNpcIndex()[key] || []) : [];
  if (!entries.length) return [];
  const groups = new Map();
  entries.forEach(e => {
    if (!groups.has(e.dungeonId)) {
      groups.set(e.dungeonId, {
        dungeonId: e.dungeonId,
        dungeonName: e.dungeonName,
        dungeonAbbr: e.dungeonAbbr,
        quests: [],
      });
    }
    groups.get(e.dungeonId).quests.push(e);
  });
  return [...groups.values()];
}

// Render a quest-giver name. When the giver (an NPC or object) has a predefined
// map pin, the name becomes a clickable map link that opens the map popout and
// focuses that pin; its Wowhead URL is surfaced inside the popout. Otherwise it
// falls back to a plain Wowhead anchor.
function buildGiverNameHtml(name, link, type, loc) {
  if (!name) return '';
  // NPCs carry a data-npc-id so hovering the name shows a floating model preview
  // (assets/npc-models/{npcId}.jpg) — see the delegated handler in init().
  const npcMatch = (type === 'npc' && link) ? link.match(/npc=(\d+)/) : null;
  const npcAttr = npcMatch ? ` data-npc-id="${npcMatch[1]}"` : '';
  const isMappable = (type === 'npc' || type === 'object');
  if (isMappable && questPinFor(loc, name)) {
    const cls = type === 'object' ? 'npc-link object-link map-npc-link' : 'npc-link map-npc-link';
    return `<span class="${cls}" data-location="${escapeHtml(loc)}" data-pin-label="${escapeHtml(name)}"${npcAttr}`
      + ` title="Show on map">${escapeHtml(name)}</span>`;
  }
  const cls = type === 'object' ? 'object-link' : 'npc-link';
  return link
    ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="${cls}"${npcAttr}>${escapeHtml(name)}</a>`
    : escapeHtml(name);
}

// Render a list of quest givers (start or turn-in NPCs/objects). Used when a
// quest has more than one giver, e.g. a class quest offered by every city's
// trainer. Each giver may carry a faction so it can be tagged Alliance/Horde,
// and its own location so each giver shows where to find it.
// Collapse giver entries that point at the same NPC name+type (e.g. an NPC that
// exists under multiple wowhead IDs across game versions, like Franclorn
// Forgewright as npc=8888 and npc=184290). Keeping the first occurrence means a
// genuinely single giver isn't mistaken for a "multi-giver" quest — which would
// otherwise hide the inline model preview and show a Wowhead link list instead.
function dedupeGivers(givers) {
  if (!Array.isArray(givers)) return givers;
  const seen = new Set();
  return givers.filter(g => {
    const key = `${g.type || ''}|${g.name || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderGiverList(givers) {
  return `<span class="npc-multi">${dedupeGivers(givers).map(g => {
    const inner = buildGiverNameHtml(g.name, g.link, g.type, g.loc);
    let mark = '';
    if (g.faction === 'Alliance') {
      mark = '<span class="faction-dot faction-alliance" title="Alliance only"></span>';
    } else if (g.faction === 'Horde') {
      mark = '<span class="faction-dot faction-horde" title="Horde only"></span>';
    }
    const locHtml = g.loc ? ` <span class="location">— ${buildLocationLink(g.loc)}</span>` : '';
    return `<span class="npc-entry">${mark}${inner}${locHtml}</span>`;
  }).join('')}</span>`;
}

// ═══════════════════════════════════════
//  URL / DEEPLINK HELPERS
// ═══════════════════════════════════════
function updateUrl() {
  const params = new URLSearchParams();
  params.set('dungeon', currentDungeonId);
  if (classFilter) params.set('class', classFilter.toLowerCase());
  if (factionFilter) params.set('faction', factionFilter.toLowerCase());
  history.replaceState(null, '', '?' + params.toString());
}

function readUrlParams() {
  const params = new URLSearchParams(location.search);
  const dungeon = params.get('dungeon');
  if (dungeon && DUNGEONS.some(d => d.id === dungeon)) currentDungeonId = dungeon;
  const cls = params.get('class');
  if (cls) {
    const normalized = cls.charAt(0).toUpperCase() + cls.slice(1).toLowerCase();
    const validClasses = ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Shaman', 'Mage', 'Warlock', 'Druid'];
    if (validClasses.includes(normalized)) classFilter = normalized;
  }
  const faction = params.get('faction');
  if (faction) {
    const normalized = faction.charAt(0).toUpperCase() + faction.slice(1).toLowerCase();
    if (normalized === 'Alliance' || normalized === 'Horde') factionFilter = normalized;
  }
}

function syncClassOptionsToFaction() {
  let reset = false;
  document.querySelectorAll('.class-filter-option[data-faction]').forEach(opt => {
    const incompatible = factionFilter && opt.dataset.faction !== factionFilter;
    opt.hidden = incompatible;
    if (incompatible && opt.dataset.class === classFilter) reset = true;
  });
  if (reset) {
    classFilter = null;
    document.querySelectorAll('.class-filter-option').forEach(o => o.classList.remove('active'));
    const allOpt = document.querySelector('.class-filter-option[data-class="all"]');
    if (allOpt) allOpt.classList.add('active');
    document.getElementById('classFilterSelected').textContent = 'All Classes';
  }
}

function syncFiltersToUI() {
  document.querySelectorAll('.faction-btn').forEach(b => {
    const f = b.dataset.faction;
    b.classList.toggle('active', factionFilter === null ? f === 'all' : factionFilter === f);
  });
  document.querySelectorAll('.class-filter-option').forEach(o => {
    o.classList.toggle('active', classFilter === null ? o.dataset.class === 'all' : o.dataset.class === classFilter);
  });
  const selectedEl = document.getElementById('classFilterSelected');
  if (classFilter) {
    const slug = classFilter.toLowerCase();
    selectedEl.innerHTML = `<img class="class-icon" src="assets/icons/classicon_${slug}.jpg" alt="">${classFilter}`;
  } else {
    selectedEl.textContent = 'All Classes';
  }
  syncClassOptionsToFaction();
}

// ═══════════════════════════════════════
//  PREFERENCES
// ═══════════════════════════════════════
function loadPrefs() {
  try {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
    if (!prefs) return;
    if (prefs.view === 'list' || prefs.view === 'grid') currentView = prefs.view;
    if (['all', 'completed', 'incomplete'].includes(prefs.filter)) currentFilter = prefs.filter;
    if (typeof prefs.hasGearOnly === 'boolean') hasGearOnly = prefs.hasGearOnly;
  } catch (_) {}
}

function savePrefs() {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ view: currentView, filter: currentFilter, hasGearOnly }));
}

function syncPrefsToUI() {
  document.getElementById('gridViewBtn').classList.toggle('active', currentView === 'grid');
  document.getElementById('listViewBtn').classList.toggle('active', currentView === 'list');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.filter === 'has-gear') {
      btn.classList.toggle('active', hasGearOnly);
    } else {
      btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    }
  });
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
function initScrollLogo() {
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    const past = window.scrollY > header.offsetHeight;
    document.body.classList.toggle('scrolled', past);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ═══════════════════════════════════════
//  DUNGEON CARD DOCK
// ═══════════════════════════════════════
// As soon as the page is scrolled down past the sticky controls, dock the
// dungeon card: the full banner collapses and the compact card (already in the
// sticky right column) cross-fades in above Locations/Encounters. All of this
// is purely CSS — this handler only toggles the body.dungeon-docked flag, and
// only matters on desktop (≥901px); the mobile layout shows the compact card
// unconditionally regardless of this class.
// Hysteresis: we DOCK once the page is scrolled past the controls/tabs, but we
// only UNDOCK again when scrolled back near the very top. The wide gap between
// the two thresholds is what makes the card "stick" docked. It also defeats a
// feedback loop: docking collapses the banner, which shrinks the page; on short
// pages (few dungeons, collapsed/filtered quests) the browser then clamps
// scrollY downward. With a single threshold that clamp would drop us back below
// it and undock — causing the dock to flicker back and forth. By undocking only
// near the top, the post-dock clamp can never reach the undock threshold.
function initDungeonDock() {
  let dockThreshold = 108;   // scroll past this (going down) → dock
  const undockThreshold = 8; // only undock once back this close to the top
  const readOffset = () => {
    const cs = getComputedStyle(document.documentElement);
    dockThreshold = (parseInt(cs.getPropertyValue('--controls-height'), 10) || 64)
                  + (parseInt(cs.getPropertyValue('--dungeon-tabs-height'), 10) || 44);
  };
  const onScroll = () => {
    const docked = document.body.classList.contains('dungeon-docked');
    if (!docked && window.scrollY > dockThreshold) {
      document.body.classList.add('dungeon-docked');
    } else if (docked && window.scrollY < undockThreshold) {
      document.body.classList.remove('dungeon-docked');
    }
  };
  readOffset();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { readOffset(); onScroll(); }, { passive: true });
}

function init() {
  loadPrefs();
  readUrlParams();
  buildDungeonTabs();
  buildDungeonFilterPanel();
  updateTabCompletionBadges();
  bindControls();
  syncFiltersToUI();
  syncPrefsToUI();
  initSidebarCollapse();
  initMapModal();
  initLoadingScreenLightbox();
  initEncounterModal();
  initQuestModal();
  initKeyModal();
  initVideoModal();
  initScrollLogo();
  initDungeonDock();
  initControlsHeightObserver();
  initLogoCinematic();
  selectDungeon(currentDungeonId);
}

// ═══════════════════════════════════════
//  LOGO CINEMATIC — "Enter the Dungeon Gate"
// ═══════════════════════════════════════
function initLogoCinematic() {
  const logos = document.querySelectorAll('.header-logo, .controls-logo');
  if (!logos.length) return;
  let playing = false;
  logos.forEach(logo => {
    logo.addEventListener('click', () => {
      if (playing) return;
      playing = true;
      playLogoCinematic(logo).finally(() => { playing = false; });
    });
  });
}

async function playLogoCinematic(logo) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // respect reduced-motion: do nothing flashy

  const subtitleEl = document.querySelector('.site-subtitle');
  const text = (subtitleEl ? subtitleEl.textContent : '').trim()
    || "The Definitive Guide to Azeroth's Classic Dungeons";

  // ── Geometry: where the logo lives now, and where it should land ──
  const start = logo.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  const targetW = Math.min(360, vw * 0.5);
  const scale = targetW / start.width;
  const dx = (vw / 2) - (start.left + start.width / 2);
  const dy = (vh * 0.36) - (start.top + start.height / 2);
  // The zoom expands around the gate doors, which sit above the image center.
  // gateFrac is the vertical focal point as a fraction of image height
  // (0.5 = center; lower = higher up, on the gate).
  const gateFrac = 0.35;
  const offY = (gateFrac - 0.5) * start.height; // gate offset from center (negative = up)
  // Resting translate is compensated so the logo still looks centered even
  // though the transform-origin is above its center.
  const restY = dy - (1 - scale) * offY;
  const T1 = `translate(${dx}px, ${restY}px) scale(${scale})`;

  // ── Build the stage ──
  const overlay = document.createElement('div');
  overlay.className = 'logo-cinematic-overlay';

  const clone = document.createElement('img');
  clone.className = 'cinematic-logo';
  clone.src = logo.currentSrc || logo.src;
  clone.alt = '';
  clone.style.left = start.left + 'px';
  clone.style.top = start.top + 'px';
  clone.style.width = start.width + 'px';
  clone.style.transformOrigin = `50% ${gateFrac * 100}%`; // pivot zoom on the gate

  const sub = document.createElement('div');
  sub.className = 'cinematic-subtitle';
  // one span per character so each letter can be chiseled in turn
  const STEP = 45; // ms between letters
  const frag = document.createDocumentFragment();
  let charIndex = 0;
  text.split(' ').forEach((word, wi) => {
    if (wi > 0) {
      // Space between words: display:inline so the browser treats it as a
      // soft-wrap opportunity (prevents breaking in the middle of a word).
      const sp = document.createElement('span');
      sp.className = 'carve-letter';
      sp.textContent = ' ';
      sp.style.animationDelay = (charIndex * STEP) + 'ms';
      sp.style.display = 'inline';
      charIndex++;
      frag.appendChild(sp);
    }
    // Wrap each word in an inline-block so it cannot be split across lines.
    const wordEl = document.createElement('span');
    wordEl.style.cssText = 'display:inline-block;white-space:nowrap';
    [...word].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'carve-letter';
      span.textContent = ch;
      span.style.animationDelay = (charIndex * STEP) + 'ms';
      charIndex++;
      wordEl.appendChild(span);
    });
    frag.appendChild(wordEl);
  });
  sub.style.opacity = '0';
  // NOTE: `frag` (the carve-letter spans) is intentionally left detached here.
  // It is appended in Phase 2 so the per-letter animations start with the
  // carving — otherwise they'd run during the lift while the subtitle is hidden.

  overlay.appendChild(clone);
  overlay.appendChild(sub);
  document.body.appendChild(overlay);

  // Hide the real logo so the clone is the sole star
  logo.classList.remove('cinematic-returning');
  logo.classList.add('cinematic-hidden');

  // ── Phase 1: zoom the logo front & center ──
  void overlay.offsetWidth; // force reflow before transitions/animations
  overlay.classList.add('active');
  const lift = clone.animate(
    [{ transform: 'translate(0,0) scale(1)' }, { transform: T1 }],
    { duration: 720, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
  );
  await lift.finished;

  // ── Phase 2: carve the subtitle, letter by letter ──
  sub.appendChild(frag); // attach now so the stagger starts from the first letter
  sub.style.opacity = '1';
  sub.classList.add('carving');
  const carveTime = text.length * STEP + 400;
  await sleep(carveTime);
  sub.classList.remove('carving');
  sub.style.transform = 'none';

  // hold a beat so the finished carving can be read
  await sleep(800);

  // ── Phase 3: gold shine wave sweeps the carved letters ──
  // Measure the actual text bounds so the shine travels end-to-end on the text.
  const subRect = sub.getBoundingClientRect();
  let textLeft = Infinity, textRight = -Infinity;
  sub.querySelectorAll('.carve-letter').forEach(l => {
    if (!l.textContent.trim()) return; // skip spaces
    const r = l.getBoundingClientRect();
    if (r.width > 0) { textLeft = Math.min(textLeft, r.left); textRight = Math.max(textRight, r.right); }
  });
  if (!isFinite(textLeft)) { textLeft = subRect.left + subRect.width * 0.1; textRight = subRect.right - subRect.width * 0.1; }
  const band = document.createElement('div');
  band.className = 'shine-band';
  band.style.left = (textLeft - subRect.left) + 'px';
  band.style.right = (subRect.right - textRight) + 'px';
  sub.appendChild(band);
  sub.classList.add('shine');
  await sleep(1200);

  // ── Phase 4: zoom straight through the gate — no spin, grow until it
  //            fills and surpasses the page ──
  sub.animate([{ opacity: 1 }, { opacity: 0 }],
    { duration: 380, easing: 'ease-in', fill: 'forwards' });
  const zoom = clone.animate(
    [
      { transform: T1, filter: 'drop-shadow(0 0 30px rgba(200,140,40,0.5))' },
      { transform: `translate(${dx}px, ${restY}px) scale(${scale * 0.9})`,
        filter: 'drop-shadow(0 0 44px rgba(255,210,120,0.8))', offset: 0.16 },
      { transform: `translate(${dx}px, ${restY}px) scale(${scale * 16})`,
        filter: 'drop-shadow(0 0 60px rgba(255,210,120,0.9)) brightness(1.3)' }
    ],
    { duration: 1150, easing: 'cubic-bezier(.5,0,.85,.5)', fill: 'forwards' }
  );
  await zoom.finished;

  // ── Phase 5: now engulfing the page — slowly fade it out ──
  overlay.classList.add('black-out');
  const fade = clone.animate(
    [
      { transform: `translate(${dx}px, ${restY}px) scale(${scale * 16})`, opacity: 1 },
      { transform: `translate(${dx}px, ${restY}px) scale(${scale * 19})`, opacity: 0 }
    ],
    { duration: 820, easing: 'ease-in-out', fill: 'forwards' }
  );
  await fade.finished;

  // dissolve the stage, then slowly fade the logo back to its place
  overlay.classList.remove('active');
  await sleep(450);
  overlay.remove();

  logo.classList.add('cinematic-returning');
  logo.classList.remove('cinematic-hidden');
  await sleep(1150);
  logo.classList.remove('cinematic-returning');
}

// ═══════════════════════════════════════
//  COMPLETION HELPERS
// ═══════════════════════════════════════

// Returns every quest that should count toward totals (count, XP, money, gear,
// progress). For schema-2 dungeons this includes preChain context quests
// (requires gates + earlier series members) which appear as real cards.
// postChain ("Continue chain") stubs are excluded.
// For legacy dungeons: dungeon.quests minus absorbed, unchanged.
function getCountableQuests(dungeon) {
  if (dungeon.schema !== 2) {
    return dungeon.quests.map(normalizeQuest).filter(q => q.absorbedBy === null);
  }
  const seen = new Set();
  const result = [];
  function add(raw) {
    const q = normalizeQuest(raw);
    if (seen.has(q.id)) return;
    seen.add(q.id);
    result.push(q);
  }
  dungeon.quests.forEach(q => {
    (q.preChain || []).forEach(entry => {
      if (entry.or) entry.or.forEach(v => add(v));
      else add(entry);
    });
    add(q);
    // postChain intentionally excluded (Continue chain breadcrumbs only).
  });
  return result;
}

function isDungeonFullyComplete(dungeon) {
  let quests = getCountableQuests(dungeon);
  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
  }
  if (classFilter) {
    quests = quests.filter(q => q.requiredClasses.length === 0 || q.requiredClasses.includes(classFilter));
  }
  if (quests.length === 0) return false;
  return quests.every(q => completed[questKey(dungeon, q)]);
}

function updateTabCompletionBadges() {
  document.querySelectorAll('.dungeon-tab').forEach(tab => {
    const dungeon = DUNGEONS.find(d => d.id === tab.dataset.id);
    if (!dungeon) return;
    tab.classList.toggle('dungeon-complete', isDungeonFullyComplete(dungeon));
  });
  buildDungeonFilterPanel();
}

// ═══════════════════════════════════════
//  BUILD TABS
// ═══════════════════════════════════════
function buildDungeonTabs() {
  const nav = document.getElementById('dungeonTabs');
  DUNGEONS.forEach(d => {
    const tab = document.createElement('div');
    tab.className = 'dungeon-tab' + (d.id === currentDungeonId ? ' active' : '');
    tab.dataset.id = d.id;
    tab.innerHTML = `<img class="dungeon-tab-icon" src="assets/icons/${d.iconFile}" alt=""> ${d.abbr}<span class="tab-level">${d.levels}</span>`;
    tab.addEventListener('click', () => selectDungeon(d.id));
    nav.appendChild(tab);
  });
}

// ═══════════════════════════════════════
//  DUNGEON FILTER DROPDOWN (mobile)
// ═══════════════════════════════════════
function buildDungeonFilterPanel() {
  const panel = document.getElementById('dungeonFilterPanel');
  if (!panel) return;
  panel.innerHTML = '';
  DUNGEONS.forEach(d => {
    const li = document.createElement('li');
    li.className = 'dungeon-filter-option' + (d.id === currentDungeonId ? ' active' : '');
    li.dataset.id = d.id;
    li.setAttribute('role', 'option');
    const isComplete = isDungeonFullyComplete(d);
    li.innerHTML = `
      <span class="df-icon"><img src="assets/icons/${d.iconFile}" alt=""></span>
      <span class="df-name">${d.name}</span>
      <span class="df-levels">${d.levels}</span>
      ${isComplete ? '<span class="df-complete">✓</span>' : ''}
    `;
    panel.appendChild(li);
  });
  updateDungeonTabsVisibility();
}

function updateDungeonFilterTrigger() {
  const dungeon = DUNGEONS.find(d => d.id === currentDungeonId);
  if (!dungeon) return;
  const el = document.getElementById('dungeonFilterSelected');
  if (el) el.innerHTML = `<img class="df-trigger-icon" src="assets/icons/${dungeon.iconFile}" alt=""> ${dungeon.abbr}`;
  document.querySelectorAll('.dungeon-filter-option').forEach(o => {
    o.classList.toggle('active', o.dataset.id === currentDungeonId);
  });
}

function initControlsHeightObserver() {
  const controls = document.querySelector('.controls');
  if (!controls) return;
  const update = () => {
    document.documentElement.style.setProperty('--controls-height', controls.offsetHeight + 'px');
  };
  update();
  new ResizeObserver(update).observe(controls);

  const tabs = document.querySelector('.dungeon-tabs');
  if (!tabs) return;
  const updateTabs = () => {
    document.documentElement.style.setProperty('--dungeon-tabs-height', tabs.offsetHeight + 'px');
  };
  updateTabs();
  new ResizeObserver(updateTabs).observe(tabs);
}

// ═══════════════════════════════════════
//  SELECT DUNGEON
// ═══════════════════════════════════════
function selectDungeon(id) {
  currentDungeonId = id;
  locationFilter = null;
  dungeonQuestFilter = null;
  dungeonQuestFiltersOpen = null;
  document.querySelectorAll('.dungeon-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.id === id);
  });
  updateDungeonFilterTrigger();
  const dungeon = DUNGEONS.find(d => d.id === id);
  if (!dungeon) return;
  renderDungeonHeader(dungeon);
  renderSidebar(dungeon);
  renderQuests();
  updateUrl();
}

// ═══════════════════════════════════════
//  DUNGEON HEADER
// ═══════════════════════════════════════
function renderDungeonHeader(dungeon) {
  const iconEl = document.getElementById('dungeonHeaderIcon');
  if (dungeon.loadingScreen) {
    iconEl.innerHTML = `<img src="${dungeon.loadingScreen}" alt="${dungeon.name} loading screen" class="dungeon-loading-screen">`;
  } else {
    iconEl.textContent = dungeon.icon;
  }
  document.getElementById('dungeonHeaderName').innerHTML = `<img class="dungeon-name-icon" src="assets/icons/${dungeon.iconFile}" alt=""> ${escapeHtml(dungeon.name)}`;

  // All quests that count toward totals (schema-2 includes preChain context cards).
  let quests = getCountableQuests(dungeon);
  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
  }
  if (classFilter) {
    quests = quests.filter(q => q.requiredClasses.length === 0 || q.requiredClasses.includes(classFilter));
  }
  const completedCount = quests.filter(q => completed[questKey(dungeon, q)]).length;

  const locLinkHtml = ZONE_IDS[dungeon.location]
    ? `<span class="location-link" data-location="${dungeon.location}" title="View map">${dungeon.location}</span>`
    : dungeon.location;
  let metaHtml = `
    <span class="dungeon-meta-item">LEVELS<strong>${dungeon.levels}</strong></span>
    <span class="dungeon-meta-item">FACTION<strong>${dungeon.faction}</strong></span>
    <span class="dungeon-meta-item">LOCATION<strong>${locLinkHtml}</strong></span>
    <span class="dungeon-meta-item">QUESTS<strong>${quests.length}</strong></span>
  `;
  document.getElementById('dungeonHeaderMeta').innerHTML = metaHtml;

  const strategyEntries = STRATEGY_URLS[dungeon.id] || [];
  const guidesEl = document.getElementById('dungeonHeaderGuides');

  const mapName = DUNGEON_MAP_NAME[dungeon.id];
  const mapBoxHtml = mapName
    ? `<div class="guides-box map-instance-box">
        <div class="guides-box-label"><img class="section-icon" src="assets/icons/maps.png" alt=""> Instance Map</div>
        <div class="guides-box-links">
          <button class="guides-box-link map-instance-btn" data-map-name="${mapName}">View Map</button>
        </div>
      </div>`
    : '';

  const wowheadBoxHtml = (dungeon.guideUrl || strategyEntries.length > 0)
    ? (() => {
        const questLinkHtml = dungeon.guideUrl
          ? `<a href="${dungeon.guideUrl}" target="_blank" rel="noopener noreferrer" class="guides-box-link"><img class="section-icon" src="assets/icons/guides.png" alt=""> Quest Guide</a>`
          : '';
        const strategyLinksHtml = strategyEntries
          .map(e => `<a href="${e.url}" target="_blank" rel="noopener noreferrer" class="guides-box-link"><img class="section-icon" src="assets/icons/objectives.png" alt=""> ${e.label}</a>`)
          .join('');
        return `<div class="guides-box">
          <div class="guides-box-label"><img src="assets/icons/wowhead.png" class="guides-box-wowhead-logo" alt="Wowhead"> Wowhead Guides</div>
          <div class="guides-box-links">${questLinkHtml}${strategyLinksHtml}</div>
        </div>`;
      })()
    : '';

  const videoEntries = VIDEO_GUIDES[dungeon.id] || [];
  const videoBoxHtml = videoEntries.length > 0
    ? `<div class="guides-box video-guides-box">
        <div class="guides-box-label"><img src="assets/icons/youtube.png" class="guides-box-youtube-logo" alt="YouTube"> Video Guides</div>
        <div class="guides-box-links">${videoEntries
          .map(v => `<button class="guides-box-link video-guide-btn" data-youtube-id="${v.youtubeId}" data-video-title="${dungeon.name}${videoEntries.length > 1 ? ' – ' + v.label : ''}">▶ ${v.label}</button>`)
          .join('')}</div>
      </div>`
    : '';

  guidesEl.innerHTML = mapBoxHtml + wowheadBoxHtml + videoBoxHtml;

  renderDungeonQuestFilters(dungeon, quests);

  const pct = quests.length ? (completedCount / quests.length * 100) : 0;
  const isComplete = quests.length > 0 && completedCount === quests.length;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressBar').classList.toggle('complete', isComplete);
  document.getElementById('progressFraction').textContent = `${completedCount} / ${quests.length}`;
  document.getElementById('progressFraction').classList.toggle('complete', isComplete);
  document.getElementById('dungeonHeader').classList.toggle('all-complete', isComplete);
  renderStatsBar(dungeon);
  renderDungeonCardCompact(dungeon);
  updateTabCompletionBadges();
}

// ═══════════════════════════════════════
//  COMPACT DUNGEON CARD (docked right column / mobile section)
// ═══════════════════════════════════════
// A condensed presentation of the dungeon header that lives inside the sticky
// right column. On desktop it cross-fades in once the full banner is scrolled
// past (see initDungeonDock); on mobile it is always shown as a third
// collapsible sidebar section. All of its controls reuse the document-level
// delegated handlers (.map-instance-btn, .video-guide-btn, .guides-box-link,
// .dungeon-loading-screen), so nothing needs re-binding here.
function renderDungeonCardCompact(dungeon) {
  const el = document.getElementById('dungeonCardCompact');
  if (!el) return;

  // Same countable-quest set + active filters used by the banner/stats bar.
  let quests = getCountableQuests(dungeon);
  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
  }
  if (classFilter) {
    quests = quests.filter(q => q.requiredClasses.length === 0 || q.requiredClasses.includes(classFilter));
  }
  const completedCount = quests.filter(q => completed[questKey(dungeon, q)]).length;
  const pct = quests.length ? (completedCount / quests.length * 100) : 0;
  const isComplete = quests.length > 0 && completedCount === quests.length;
  const totalXP = quests.reduce((s, q) => s + (q.xp || 0), 0);
  const totalMoney = quests.reduce((s, q) => s + (q.money || 0), 0);
  const withGear = quests.filter(q => q.rewards.length > 0 || q.rewardChoices.length > 0 || q.legacyItems.length > 0).length;

  // Section title doubles as the dungeon name (informative when collapsed).
  const titleEl = document.getElementById('dungeonCardTitle');
  if (titleEl) titleEl.innerHTML = `<img class="dungeon-card-title-icon" src="assets/icons/${dungeon.iconFile}" alt=""> ${escapeHtml(dungeon.name)}`;

  // Media: loading-screen image (reuses the lightbox via .dungeon-loading-screen)
  // with a small circular instance-map button overlaid in the corner.
  const mapName = DUNGEON_MAP_NAME[dungeon.id];
  const mapOrbHtml = mapName
    ? `<button class="map-instance-btn dungeon-card-map-orb" data-map-name="${mapName}" title="View instance map" aria-label="View instance map"><img class="section-icon" src="assets/icons/maps.png" alt="Map"></button>`
    : '';
  const mediaInner = dungeon.loadingScreen
    ? `<img src="${dungeon.loadingScreen}" alt="${escapeHtml(dungeon.name)} loading screen" class="dungeon-loading-screen dungeon-card-img">`
    : `<div class="dungeon-card-icon">${dungeon.icon}</div>`;
  const mediaHtml = `<div class="dungeon-card-media">${mediaInner}${mapOrbHtml}</div>`;

  // Compact meta line: level range · faction · location (location reuses the map link).
  const locLinkHtml = ZONE_IDS[dungeon.location]
    ? `<span class="location-link" data-location="${dungeon.location}" title="View map">${dungeon.location}</span>`
    : escapeHtml(dungeon.location);
  const metaHtml = `<div class="dungeon-card-meta">Lv ${escapeHtml(dungeon.levels)} · ${escapeHtml(dungeon.faction)} · ${locLinkHtml}</div>`;

  // Quest-completion bar (own ids so it doesn't collide with the banner's).
  const progressHtml = `
    <div class="dungeon-card-progress">
      <div class="dungeon-card-progress-head">
        <span class="progress-label">QUEST PROGRESS</span>
        <span class="progress-fraction${isComplete ? ' complete' : ''}" id="progressFractionCompact">${completedCount} / ${quests.length}</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill${isComplete ? ' complete' : ''}" id="progressBarCompact" style="width:${pct}%"></div></div>
    </div>`;

  // Rewards info: compact 2-col stat grid (XP / money / gear rewards).
  const rewardsHtml = `
    <div class="dungeon-card-stats">
      <div class="stat-item"><img class="stat-ico" src="assets/icons/experience.png" alt=""><div class="stat-num" style="color:#84d4a0">${totalXP.toLocaleString()}</div><div class="stat-label">Total XP</div></div>
      <div class="stat-item"><img class="stat-ico" src="assets/icons/money.png" alt=""><div class="stat-num stat-num--money">${formatMoney(totalMoney)}</div><div class="stat-label">Money</div></div>
      <div class="stat-item"><img class="stat-ico" src="assets/icons/rewards.png" alt=""><div class="stat-num" style="color:#c8a0d4">${withGear}</div><div class="stat-label">Gear Rewards</div></div>
      <div class="stat-item"><img class="stat-ico" src="assets/icons/quest_info.png" alt=""><div class="stat-num">${quests.length}</div><div class="stat-label">Quests</div></div>
    </div>`;

  // Guides: Wowhead quest/strategy links + video buttons collapsed into one panel.
  const strategyEntries = STRATEGY_URLS[dungeon.id] || [];
  const videoEntries = VIDEO_GUIDES[dungeon.id] || [];
  const guideLinks = [];
  if (dungeon.guideUrl) {
    guideLinks.push(`<a href="${dungeon.guideUrl}" target="_blank" rel="noopener noreferrer" class="guides-box-link"><img class="section-icon" src="assets/icons/guides.png" alt=""> Quest Guide</a>`);
  }
  strategyEntries.forEach(e => {
    guideLinks.push(`<a href="${e.url}" target="_blank" rel="noopener noreferrer" class="guides-box-link"><img class="section-icon" src="assets/icons/objectives.png" alt=""> ${escapeHtml(e.label)}</a>`);
  });
  videoEntries.forEach(v => {
    const title = `${dungeon.name}${videoEntries.length > 1 ? ' – ' + v.label : ''}`;
    guideLinks.push(`<button class="guides-box-link video-guide-btn" data-youtube-id="${v.youtubeId}" data-video-title="${escapeHtml(title)}">▶ ${escapeHtml(v.label)}</button>`);
  });
  const guidesHtml = guideLinks.length
    ? `<div class="dungeon-card-guides">
        <button class="dcg-toggle" type="button" aria-expanded="false">
          <span class="dcg-label"><img class="section-icon" src="assets/icons/guides.png" alt=""> Guides</span>
          <span class="dqf-count">${guideLinks.length}</span>
          <span class="dqf-chevron" aria-hidden="true">▾</span>
        </button>
        <div class="dcg-panel">${guideLinks.join('')}</div>
      </div>`
    : '';

  // Main Dungeon Quests filter — same panel as the banner; populated below by
  // renderDungeonQuestFilters, which targets every .dungeon-quest-filters node.
  const dqfHtml = '<div class="dungeon-quest-filters dungeon-card-dqf" id="dungeonCardQuestFilters"></div>';

  el.innerHTML = mediaHtml + metaHtml + progressHtml + rewardsHtml + guidesHtml + dqfHtml;

  const toggle = el.querySelector('.dcg-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const guides = toggle.closest('.dungeon-card-guides');
      const open = guides.classList.toggle('dcg-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Now that the compact panel container exists, render the quest filters into
  // both it and the banner so they share the active selection.
  renderDungeonQuestFilters(dungeon, quests);
}

// ═══════════════════════════════════════
//  DUNGEON QUEST FILTER PANEL
// ═══════════════════════════════════════
// A collapsible panel with one chip per main dungeon quest (isDungeon). Picking
// one toggles a filter that shows only that quest's full chain. Faction variants
// share a name, so chips are de-duped by name and the filter matches by name.
//
// Large dungeons (e.g. Dire Maul, BRD) have 25–30 dungeon quests, which is a wall
// of chips — overwhelming, especially on mobile. So the panel is collapsed by
// default for every dungeon, stays scrollable, and keeps a compact "active filter"
// row visible while collapsed so the current selection (and a clear button) are
// always reachable without expanding.
// Renders the panel into every `.dungeon-quest-filters` container on the page
// (the full banner + the compact docked card) so both stay in sync. The shared
// global state (dungeonQuestFilter / dungeonQuestFiltersOpen) means an
// interaction in either one re-renders all of them.
function renderDungeonQuestFilters(dungeon, quests) {
  document.querySelectorAll('.dungeon-quest-filters').forEach(el => {
    renderDungeonQuestFiltersInto(el, dungeon, quests);
  });
}

function renderDungeonQuestFiltersInto(el, dungeon, quests) {
  const seen = new Set();
  const dungeonQuests = quests.filter(q => {
    if (!q.isDungeon || seen.has(q.name)) return false;
    seen.add(q.name);
    return true;
  });

  if (dungeonQuests.length === 0) {
    el.innerHTML = '';
    el.classList.remove('dqf-open', 'dqf-filtered');
    return;
  }

  // Drop a stale selection if the active dungeon doesn't offer it.
  if (dungeonQuestFilter && !dungeonQuests.some(q => q.name === dungeonQuestFilter)) {
    dungeonQuestFilter = null;
  }

  // Resolve the open state: explicit user choice wins, else collapsed by default.
  if (dungeonQuestFiltersOpen === null) {
    dungeonQuestFiltersOpen = false;
  }
  const open = dungeonQuestFiltersOpen;

  el.classList.toggle('dqf-open', open);
  el.classList.toggle('dqf-filtered', !!dungeonQuestFilter);

  const activeRow = dungeonQuestFilter
    ? `<div class="dqf-active-row">
        <span class="dqf-active-tag">Showing chain</span>
        <span class="dqf-active-name">${escapeHtml(dungeonQuestFilter)}</span>
        <button class="dqf-clear" type="button" title="Show all quests" aria-label="Clear filter">✕</button>
      </div>`
    : '';

  el.innerHTML = `
    <button class="dqf-toggle" type="button" aria-expanded="${open}">
      <span class="dqf-toggle-label"><img class="section-icon" src="assets/icons/key.png" alt=""> Main Dungeon Quests</span>
      <span class="dqf-count">${dungeonQuests.length}</span>
      <span class="dqf-chevron" aria-hidden="true">▾</span>
    </button>
    ${activeRow}
    <div class="dqf-panel">
      ${dungeonQuests.map(q => {
        const name = escapeHtml(q.name);
        const active = dungeonQuestFilter === q.name ? ' active' : '';
        return `<button class="dqf-btn${active}" type="button" data-quest-name="${name}" title="${name}">${name}</button>`;
      }).join('')}
    </div>`;

  el.querySelector('.dqf-toggle').addEventListener('click', () => {
    dungeonQuestFiltersOpen = !dungeonQuestFiltersOpen;
    el.classList.toggle('dqf-open', dungeonQuestFiltersOpen);
    el.querySelector('.dqf-toggle').setAttribute('aria-expanded', String(dungeonQuestFiltersOpen));
  });

  const clearBtn = el.querySelector('.dqf-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      dungeonQuestFilter = null;
      renderDungeonQuestFilters(dungeon, quests);
      renderQuests();
    });
  }

  el.querySelectorAll('.dqf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.questName;
      dungeonQuestFilter = dungeonQuestFilter === name ? null : name;
      // On phones, collapse after picking so the long list stops eating the
      // screen — the active-filter row still shows what's selected.
      if (dungeonQuestFilter && window.matchMedia('(max-width: 600px)').matches) {
        dungeonQuestFiltersOpen = false;
      }
      renderDungeonQuestFilters(dungeon, quests);
      renderQuests();
    });
  });
}

// ═══════════════════════════════════════
//  STATS BAR
// ═══════════════════════════════════════
function renderStatsBar(dungeon) {
  let quests = getCountableQuests(dungeon);
  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
  }
  if (classFilter) {
    quests = quests.filter(q => q.requiredClasses.length === 0 || q.requiredClasses.includes(classFilter));
  }
  const totalXP = quests.reduce((s, q) => s + (q.xp || 0), 0);
  const totalMoney = quests.reduce((s, q) => s + (q.money || 0), 0);
  const withGear = quests.filter(q => q.rewards.length > 0 || q.rewardChoices.length > 0 || q.legacyItems.length > 0).length;

  document.getElementById('statsBar').innerHTML = `
    <div class="stat-item">
      <img class="stat-ico" src="assets/icons/quest_info.png" alt="">
      <div class="stat-num">${quests.length}</div>
      <div class="stat-label">Total Quests</div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <img class="stat-ico" src="assets/icons/experience.png" alt="">
      <div class="stat-num" style="color:#84d4a0">${totalXP.toLocaleString()}</div>
      <div class="stat-label">Total XP</div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <img class="stat-ico" src="assets/icons/money.png" alt="">
      <div class="stat-num stat-num--money">${formatMoney(totalMoney)}</div>
      <div class="stat-label">Total Money</div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <img class="stat-ico" src="assets/icons/rewards.png" alt="">
      <div class="stat-num" style="color:#c8a0d4">${withGear}</div>
      <div class="stat-label">Gear Rewards</div>
    </div>
  `;
}

// ═══════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════
function renderSidebar(dungeon) {
  const quests = getCountableQuests(dungeon);

  // By Location
  const locs = [...new Set(quests.map(q => (q.startLoc || '').split(',')[0].trim()).filter(Boolean))];
  const locList = document.getElementById('locationList');
  locList.innerHTML = '';
  locs.forEach(loc => {
    const count = quests.filter(q => (q.startLoc || '').startsWith(loc)).length;
    const item = document.createElement('div');
    item.className = 'sidebar-item' + (locationFilter === loc ? ' active' : '');
    item.innerHTML = `<span>${loc}</span><span class="sidebar-item-count">${count}</span>`;
    item.addEventListener('click', () => {
      locationFilter = locationFilter === loc ? null : loc;
      renderSidebar(dungeon);
      renderQuests();
    });
    locList.appendChild(item);
  });

  renderEncounterList(dungeon);
}

// ═══════════════════════════════════════
//  ENCOUNTER FACE AVATAR
// ═══════════════════════════════════════
// Circular face crop for an encounter. All faces live in ONE sprite atlas
// (assets/npc-faces.webp, built by scraper/detect_heads.py); we show one by
// offsetting background-position into the grid. This makes the whole encounter
// list cost a single image request/decode total (Firefox choked on one request
// per avatar). NPC_FACE.index is the source of truth for which NPCs have a
// face; otherwise fall back to the skull glyph.
function encounterIconHtml(npcId, fallbackIcon) {
  const idx = (npcId != null && typeof NPC_FACE !== 'undefined') ? NPC_FACE.index[String(npcId)] : undefined;
  if (idx == null) return fallbackIcon;
  const cell = NPC_FACE.cell;
  const x = (idx % NPC_FACE.cols) * cell;
  const y = Math.floor(idx / NPC_FACE.cols) * cell;
  return `<span class="encounter-avatar" ` +
    `style="background-position:-${x}px -${y}px;background-size:${NPC_FACE.cols * cell}px auto"></span>`;
}

// ═══════════════════════════════════════
//  ENCOUNTER HOVER PREVIEW
// ═══════════════════════════════════════
let encounterPreviewEl = null;

function getEncounterPreview() {
  if (encounterPreviewEl) return encounterPreviewEl;
  const el = document.createElement('div');
  el.className = 'encounter-preview';
  el.innerHTML = '<img alt=""><div class="encounter-preview-name"></div>';
  document.body.appendChild(el);
  encounterPreviewEl = el;
  return el;
}

function positionEncounterPreview(el, anchor) {
  const rect = anchor.getBoundingClientRect();
  const pw = el.offsetWidth;
  const ph = el.offsetHeight;
  const gap = 12;
  // Prefer placing the preview to the left of the sidebar item; fall back to
  // the right if there isn't room.
  let left = rect.left - pw - gap;
  if (left < gap) left = rect.right + gap;
  let top = rect.top + rect.height / 2 - ph / 2;
  top = Math.max(gap, Math.min(top, window.innerHeight - ph - gap));
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

// Show/hide the floating model preview anchored to `anchor`, loading
// assets/npc-models/{npcId}.jpg. Shared by the encounter list (per-element
// listeners) and quest-card NPC names (delegated hover) so both look identical.
function showNpcModelPreview(anchor, name, npcId) {
  const el = getEncounterPreview();
  const img = el.querySelector('img');
  el.querySelector('.encounter-preview-name').textContent = name;
  img.onload = () => {
    positionEncounterPreview(el, anchor);
    el.classList.add('visible');
  };
  img.onerror = () => { el.classList.remove('visible'); };
  img.src = `assets/npc-models/${npcId}.jpg`;
}

function hideNpcModelPreview() {
  if (!encounterPreviewEl) return;
  encounterPreviewEl.classList.remove('visible');
  const img = encounterPreviewEl.querySelector('img');
  img.onload = null;
  img.src = '';
}

// Show a small floating model preview when hovering an encounter, so users can
// match a boss name to its appearance without opening the full modal.
function attachEncounterPreview(item, name, npcId) {
  item.addEventListener('mouseenter', () => showNpcModelPreview(item, name, npcId));
  item.addEventListener('mouseleave', hideNpcModelPreview);
}

// ═══════════════════════════════════════
//  ENCOUNTER LIST
// ═══════════════════════════════════════
function renderEncounterList(dungeon) {
  const list = document.getElementById('encounterList');
  if (!list) return;
  list.innerHTML = '';

  const encounters = BOSS_ENCOUNTERS[dungeon.id];
  if (!encounters || encounters.length === 0) {
    list.innerHTML = '<div class="encounter-empty">No data available</div>';
    return;
  }

  encounters.forEach(entry => {
    if (entry.section) {
      const header = document.createElement('div');
      header.className = 'encounter-section';
      header.textContent = entry.section;
      list.appendChild(header);
      return;
    }
    if (entry.event) {
      const wrapper = document.createElement('div');
      wrapper.className = 'encounter-event-wrapper';

      const label = document.createElement('div');
      label.className = 'encounter-item encounter-event-header';
      label.innerHTML = `<img class="encounter-skull-icon" src="assets/icons/rare_encounters.png" alt=""><span class="encounter-name">${entry.name}</span><span class="encounter-event-badge">Event</span>`;
      wrapper.appendChild(label);

      const bossGroup = document.createElement('div');
      bossGroup.className = 'encounter-event-bosses';

      (entry.bosses || []).forEach(boss => {
        const bossItem = document.createElement('div');
        bossItem.className = 'encounter-item encounter-event-boss has-model';
        bossItem.innerHTML = `${encounterIconHtml(boss.npcId, '<img class="encounter-skull-icon" src="assets/icons/encounters.png" alt="">')}<span class="encounter-name">${boss.name}</span>`;
        bossItem.addEventListener('click', () => openEncounterModal(boss.name, boss.npcId));
        attachEncounterPreview(bossItem, boss.name, boss.npcId);
        bossGroup.appendChild(bossItem);
      });

      wrapper.appendChild(bossGroup);
      list.appendChild(wrapper);
      return;
    }
    const rareBadge = entry.rare ? '<span class="encounter-rare-badge">Rare</span>' : '';
    const icon = entry.rare
      ? '<img class="encounter-skull-icon" src="assets/icons/rare_encounters.png" alt="">'
      : '<img class="encounter-skull-icon" src="assets/icons/encounters.png" alt="">';
    const nameHtml = `${encounterIconHtml(entry.npcId, icon)}<span class="encounter-name">${entry.name}</span>${rareBadge}`;
    const item = document.createElement('div');
    item.className = 'encounter-item' + (entry.rare ? ' encounter-rare' : '') + (entry.npcId ? ' has-model' : '');
    item.innerHTML = nameHtml;
    if (entry.npcId) {
      item.addEventListener('click', () => openEncounterModal(entry.name, entry.npcId));
      attachEncounterPreview(item, entry.name, entry.npcId);
    }
    list.appendChild(item);
  });
}

// ═══════════════════════════════════════
//  RENDER QUESTS
// ═══════════════════════════════════════
function renderQuests() {
  const dungeon = DUNGEONS.find(d => d.id === currentDungeonId);
  if (!dungeon) return;
  const container = document.getElementById('quest-container');
  container.className = currentView === 'grid' ? 'grid-view' : 'list-view';

  let quests = dungeon.quests.map(normalizeQuest).filter(q => {
    // Never show absorbed quests as standalone cards
    if (q.absorbedBy !== null) return false;
    const key = questKey(dungeon, q);
    const isComplete = !!completed[key];
    const hasGear = q.rewards.length > 0 || q.rewardChoices.length > 0 || q.legacyItems.length > 0;
    if (hasGearOnly && !hasGear) return false;
    if (currentFilter === 'completed') return isComplete;
    if (currentFilter === 'incomplete') return !isComplete;
    return true;
  });

  // Dungeon-quest filter: narrow to the selected main dungeon quest so only its
  // chain renders (the group renderers expand the full chain around it).
  if (dungeonQuestFilter) {
    quests = quests.filter(q => q.name === dungeonQuestFilter);
  }

  if (locationFilter) {
    quests = quests.filter(q => (q.startLoc || '').startsWith(locationFilter));
  }

  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
  }

  if (classFilter) {
    quests = quests.filter(q => q.requiredClasses.length === 0 || q.requiredClasses.includes(classFilter));
  }

  if (searchQuery) {
    const sq = searchQuery.toLowerCase();
    const questFieldsMatch = (q) =>
      (q.name || '').toLowerCase().includes(sq) ||
      (q.startNpc || '').toLowerCase().includes(sq) ||
      (q.startObject || '').toLowerCase().includes(sq) ||
      (q.endNpc || '').toLowerCase().includes(sq) ||
      (q.endObject || '').toLowerCase().includes(sq) ||
      (q.startNpcs || []).some(n => (n.name || '').toLowerCase().includes(sq)) ||
      (q.endNpcs || []).some(n => (n.name || '').toLowerCase().includes(sq)) ||
      (q.startLoc || '').toLowerCase().includes(sq) ||
      (q.endLoc || '').toLowerCase().includes(sq) ||
      (q.rewards || []).some(r => r.name.toLowerCase().includes(sq)) ||
      (q.rewardChoices || []).some(r => r.name.toLowerCase().includes(sq)) ||
      (q.legacyItems || []).some(r => r.name.toLowerCase().includes(sq)) ||
      (q.notes || '').toLowerCase().includes(sq);

    quests = quests.filter(quest => {
      if (questFieldsMatch(quest)) return true;
      // Also match against preChain quests (rendered as cards inside chain groups)
      return (quest.preChain || []).some(entry => {
        const candidates = entry.or ? entry.or : [entry];
        return candidates.some(c => questFieldsMatch(normalizeQuest(c)));
      });
    });
  }

  // Isolated quests (no chain) first, then quest chains
  quests.sort((a, b) => {
    const aIsolated = a.chainId === null ? 0 : 1;
    const bIsolated = b.chainId === null ? 0 : 1;
    return aIsolated - bIsolated;
  });

  const visibleCountEl = document.getElementById('visibleCount');
  if (visibleCountEl) visibleCountEl.textContent = quests.length;
  container.innerHTML = '';

  if (quests.length === 0) {
    const isFactionEmpty = factionFilter && !dungeon.quests
      .map(normalizeQuest)
      .filter(q => q.absorbedBy === null)
      .some(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
    const emptyMsg = isFactionEmpty
      ? `No ${factionFilter} quests in this dungeon`
      : 'Adjust your search or filters';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><img src="assets/icons/quest_info.png" alt="" style="width:48px;height:48px;object-fit:contain;opacity:0.4;"></div>
        <div class="empty-state-text">NO QUESTS FOUND</div>
        <div style="margin-top:8px;font-size:0.78rem;color:var(--text-dim)">${emptyMsg}</div>
      </div>`;
    prependDungeonKeyCard(dungeon, container);
    if (typeof $WowheadPower !== 'undefined') $WowheadPower.refreshLinks();
    return;
  }

  // schema-2 dungeons declare their chain structure explicitly in the data, so
  // they use a dedicated config-driven renderer instead of the heuristic
  // grouping below (which only legacy dungeons rely on).
  if (dungeon.schema === 2) {
    renderConfigGroups(dungeon, quests, container);
    prependDungeonKeyCard(dungeon, container);
    if (typeof $WowheadPower !== 'undefined') $WowheadPower.refreshLinks();
    return;
  }

  // Group quests so chain members render together with a wrapper.
  // Chain structure is built from the FULL (unfiltered) member set so the tree
  // shape survives faction/search filtering; the active filter only decides
  // which chains appear and which faction variant shows inside each step.
  const allMembers = dungeon.quests.map(normalizeQuest).filter(q => q.absorbedBy === null);
  const membersByChain = {};
  allMembers.forEach(m => {
    if (m.chainId !== null) (membersByChain[m.chainId] = membersByChain[m.chainId] || []).push(m);
  });

  const rendered = new Set();
  const renderedChains = new Set();

  quests.forEach(quest => {
    if (rendered.has(quest.id)) return;
    // Skip quests absorbed into another quest's preChain display
    if (quest.absorbedBy !== null) return;

    const cid = quest.chainId;
    if (cid !== null) {
      if (renderedChains.has(cid)) return;
      renderedChains.add(cid);
      const members = membersByChain[cid] || [quest];
      members.forEach(m => rendered.add(m.id));
      const el = buildChainGroup(members, dungeon);
      if (el) container.appendChild(el);
      return;
    }

    rendered.add(quest.id);
    container.appendChild(buildQuestCard(quest, dungeon, null, null));
  });

  prependDungeonKeyCard(dungeon, container);
  if (typeof $WowheadPower !== 'undefined') $WowheadPower.refreshLinks();
}

// ═══════════════════════════════════════
//  CONFIG-DRIVEN RENDERING (schema 2)
// ═══════════════════════════════════════
// schema-2 data declares relationships explicitly per quest:
//   isDungeon            → DUNGEON badge
//   series {id,index,total} → membership + "PART x/y" badge
//   prevQuestId/nextQuestId → series neighbours (arrows + completion cascade)
//   preChain[]  → context leading IN: requires gates ({or:[...]} | full quest,
//                 relation:'requires') + earlier non-dungeon series members
//                 (full quest, relation:'series')
//   postChain[] → later non-dungeon series members (stubs → "Continue series")
function renderConfigGroups(dungeon, visibleQuests, container) {
  const visibleIds = new Set(visibleQuests.map(q => q.id));
  // Standalone quests first, chained/gated groups at the bottom.
  // Stable sort preserves declared order within each bucket.
  const all = dungeon.quests.map(normalizeQuest).sort((a, b) => {
    const aChained = (a.series || (a.preChain || []).length || (a.postChain || []).length) ? 1 : 0;
    const bChained = (b.series || (b.preChain || []).length || (b.postChain || []).length) ? 1 : 0;
    return aChained - bChained;
  });
  const rendered = new Set();

  all.forEach(q => {
    if (rendered.has(q.id)) return;
    if (q.absorbedBy != null) { rendered.add(q.id); return; }

    // Flow chains declared via `flows`: a series-parallel DAG (fork + "complete
    // all to unlock" convergence) rendered by the dedicated flow renderer. All
    // members share one flowId; the nested structure lives on dungeon.flows.
    if (q.flowChain && q.flowId != null) {
      const members = all.filter(m => m.flowId === q.flowId);
      members.forEach(m => rendered.add(m.id));
      if (!members.some(m => visibleIds.has(m.id))) return;
      const flow = (dungeon.flows || []).find(f => f.id === q.flowId);
      const el = flow ? buildFlowGroup(flow, members, dungeon)
                      : buildQuestCard(q, dungeon, null, null);
      if (el) container.appendChild(el);
      return;
    }

    // Branching chains declared via `trees`: all members share a chainId and are
    // rendered as a real fork tree (reusing the legacy chain-tree renderer) so a
    // quest that unlocks two questlines shows them in one connected box.
    if (q.treeChain && q.chainId !== null) {
      const members = all.filter(m => m.treeChain && m.chainId === q.chainId);
      members.forEach(m => rendered.add(m.id));
      if (!members.some(m => visibleIds.has(m.id))) return;
      const el = buildChainGroup(members, dungeon);
      if (el) container.appendChild(el);
      return;
    }

    if (q.series) {
      const members = all
        .filter(m => m.series && m.series.id === q.series.id)
        .sort((a, b) => a.series.index - b.series.index);
      members.forEach(m => rendered.add(m.id));
      // Also mark alsoUnlocks quests as rendered so they aren't shown standalone.
      members.forEach(m => (m.alsoUnlocks || []).forEach(u => rendered.add(u.id)));
      const isVisible = m => visibleIds.has(m.id) ||
        (m.alsoUnlocks || []).some(u => visibleIds.has(u.id));
      if (!members.some(isVisible)) return;
      const el = buildConfigSeriesGroup(members, dungeon);
      if (el) container.appendChild(el);
      return;
    }

    rendered.add(q.id);
    if (!visibleIds.has(q.id)) return;
    if ((q.preChain || []).length || (q.postChain || []).length) {
      container.appendChild(buildConfigGatedGroup(q, dungeon));
    } else {
      container.appendChild(buildQuestCard(q, dungeon, null, null));
    }
  });
}

// ── Unified chain completion cascade ──────────────────────────────────────
// A chain's quests form a prerequisite DAG wired by prevQuestId/nextQuestId:
// these edges connect every series, gate and parallel branch (forks share a
// prevQuestId, convergences share a nextQuestId). Completing a quest implies
// all of its prerequisites are done; un-completing it un-does everything that
// depended on it. We walk that DAG across the WHOLE chain rather than just the
// toggled quest's own series spine.

// Build a cascade context from an arbitrary set of chain quests (deduped &
// normalized). Handed to every card in a chain group so the cascade can see
// the entire chain; null when there is nothing to chain.
function chainCascadeCtx(quests) {
  const members = [];
  const seen = new Set();
  quests.forEach(q => {
    if (!q || q.id == null || seen.has(q.id)) return;
    seen.add(q.id);
    members.push(normalizeQuest(q));
  });
  return members.length ? { members } : null;
}

// The full member set of the chain the toggled quest belongs to: same-chainId
// in-dungeon quests (flow/tree/series declared top-level) ∪ the renderer's
// cascade-context members ∪ the quest itself.
function chainMemberMap(quest, dungeon, cascadeCtx) {
  const map = new Map();
  const add = q => { if (q && q.id != null && !map.has(q.id)) map.set(q.id, normalizeQuest(q)); };
  if (quest.chainId != null) {
    dungeon.quests.forEach(q => { if (q.chainId === quest.chainId) add(q); });
  }
  if (cascadeCtx) {
    (cascadeCtx.members || []).forEach(add);
    (cascadeCtx.dungeonMembers || []).forEach(add);
  }
  add(quest);
  return map;
}

// Cascade a completion toggle along the whole-chain prerequisite graph.
function applyChainCascade(quest, dungeon, cascadeCtx, wasCompleted) {
  const members = chainMemberMap(quest, dungeon, cascadeCtx);
  if (members.size < 2) return;

  const prereqs = new Map();     // id → Set(prerequisite ids)
  const dependents = new Map();  // id → Set(dependent ids)
  const edge = (map, from, to) => {
    let s = map.get(from);
    if (!s) { s = new Set(); map.set(from, s); }
    s.add(to);
  };
  const link = (pre, post) => {
    if (pre === post || !members.has(pre) || !members.has(post)) return;
    edge(prereqs, post, pre);
    edge(dependents, pre, post);
  };
  // Wire every prerequisite a quest declares (the prevQuestId spine, `requires`
  // gates, and required preChain members) as edges pointing INTO targetId.
  const declarePrereqEdges = (decl, targetId) => {
    if (decl.prevQuestId != null) link(decl.prevQuestId, targetId);
    // `requires` gates connect prerequisites that aren't on the prev/next spine
    // (e.g. an OR gate whose options feed into a series step).
    (decl.requires || []).forEach(r => {
      if (r.type === 'single' && r.id != null) link(r.id, targetId);
      else if (r.type === 'or') (r.ids || []).forEach(id => link(id, targetId));
    });
    // preChain containment: a quest's required prerequisites (series steps and
    // gates — not optional ones) are its prerequisites even when no prev/next or
    // requires edge wires them, so completing the quest cascades to all of them.
    (decl.preChain || []).forEach(e => {
      if (e.relation !== 'series' && e.relation !== 'requires') return;
      if (e.or) e.or.forEach(v => { if (v && v.id != null) link(v.id, targetId); });
      else if (e.id != null) link(e.id, targetId);
    });
  };
  members.forEach(m => {
    declarePrereqEdges(m, m.id);
    if (m.nextQuestId != null) link(m.id, m.nextQuestId);
    // Parallel "also unlocks" forks share the host quest's prerequisite chain
    // (they branch off the same questline), so each fork inherits the host's
    // prerequisites — completing any fork marks the shared chain done while the
    // forks stay independent of one another.
    (m.alsoUnlocks || []).forEach(f => {
      if (f && f.id != null && members.has(f.id)) declarePrereqEdges(m, f.id);
    });
  });

  const reach = (startId, adj) => {
    const out = new Set();
    const stack = [startId];
    while (stack.length) {
      const cur = stack.pop();
      (adj.get(cur) || []).forEach(n => { if (!out.has(n)) { out.add(n); stack.push(n); } });
    }
    out.delete(startId);
    return out;
  };

  if (!wasCompleted) {
    // Completing: every prerequisite leading here is implicitly done too.
    reach(quest.id, prereqs).forEach(id => { completed[questKey(dungeon, members.get(id))] = true; });
  } else {
    // Un-completing: anything that depended on this quest is no longer reachable.
    reach(quest.id, dependents).forEach(id => { delete completed[questKey(dungeon, members.get(id))]; });
  }
}

// Cascade context for a chain group: one whole-chain context shared by every
// card (prerequisites + the dungeon quests they gate). Direction is derived
// from the prerequisite graph, so dungeon cards and prereq cards use the same
// context. The two names are kept for call-site clarity.
function configCascadeContexts(ctxMembers, dungeonQuests = []) {
  const ctx = chainCascadeCtx([...dungeonQuests, ...ctxMembers]);
  return { dungeonCtx: ctx, prechainCtx: ctx };
}

// Requires gates → a "Prerequisite(s)" section. Single gate = one card; an OR
// group = a "pick one" OR-box (reusing the faction-alt / or-divider styling).
function buildConfigGates(gates, dungeon, ctx) {
  const el = document.createElement('div');
  el.className = 'chain-prechain';
  const label = document.createElement('div');
  label.className = 'chain-context-label';
  label.textContent = gates.length > 1 ? 'Prerequisites' : 'Prerequisite';
  el.appendChild(label);

  gates.forEach((g, i) => {
    if (g.or) {
      const node = document.createElement('div');
      node.className = 'chain-tree-node faction-alt';
      g.or.forEach((v, j) => {
        if (j > 0) {
          const or = document.createElement('div');
          or.className = 'chain-or-divider';
          or.textContent = 'or';
          node.appendChild(or);
        }
        node.appendChild(buildQuestCard(normalizeQuest(v), dungeon, null, null, false, ctx));
      });
      el.appendChild(node);
    } else {
      el.appendChild(buildQuestCard(normalizeQuest(g), dungeon, null, null, false, ctx));
    }
    if (i < gates.length - 1) el.appendChild(buildFlowConnector(0));
  });
  return el;
}

// Sub-box header: "Quest series · <name>" when the grouped cards carry a
// series name, else the generic "Quest series". Names let the distinct series
// in a merged cross-series chain be told apart at a glance.
function seriesGroupLabel(cards) {
  const name = cards.find(c => c.series && c.series.name)?.series?.name;
  return name ? `Quest series · ${name}` : 'Quest series';
}

// A standalone dungeon quest that has requires gates but no series.
function buildConfigGatedGroup(quest, dungeon) {
  const wrapper = document.createElement('div');
  wrapper.className = 'quest-chain-group has-prechain';
  const label = document.createElement('div');
  label.className = 'chain-group-label';
  label.textContent = 'Quest Chain';
  wrapper.appendChild(label);

  // Build an ordered list of blocks preserving the interleaved order from the
  // prechain: each block is either {type:'series', sid, cards[]} or
  // {type:'gate', entries[]}, created on first encounter of each series.id /
  // standalone gate key. This ensures a standalone quest between two series
  // boxes renders in the correct position rather than always at the top.
  const optionalEntries = (quest.preChain || []).filter(e => e.relation === 'optional' && questPassesFaction(e));

  const blocks = [];
  const sidToBlock = new Map();
  const gateKeySeen = new Set();

  (quest.preChain || []).forEach(e => {
    if (e.relation !== 'series' && e.relation !== 'requires') return;
    const sid = e.series?.id;
    if (sid) {
      if (!sidToBlock.has(sid)) { const b = { type: 'series', cards: [] }; sidToBlock.set(sid, b); blocks.push(b); }
      const b = sidToBlock.get(sid);
      if (!b.cards.some(c => c.id === e.id)) b.cards.push(normalizeQuest(e));
    } else if (e.relation === 'requires') {
      const key = e.or ? 'or:' + e.or.map(v => v.id).join(',') : 'q:' + e.id;
      if (!gateKeySeen.has(key)) { gateKeySeen.add(key); blocks.push({ type: 'gate', entries: [e] }); }
    }
  });

  blocks.forEach(b => {
    if (b.type === 'series') b.cards.sort((a, b) => (a.series?.index ?? 0) - (b.series?.index ?? 0));
  });

  const allCtxCards = blocks.flatMap(b =>
    b.type === 'gate'
      ? b.entries.flatMap(g => g.or ? g.or.map(normalizeQuest) : [normalizeQuest(g)])
      : b.cards
  );
  const { dungeonCtx, prechainCtx } = configCascadeContexts(allCtxCards, [quest]);

  if (optionalEntries.length) {
    wrapper.appendChild(buildOptionalPrereqSection(optionalEntries, dungeon, prechainCtx));
    wrapper.appendChild(buildFlowConnector(0, true));
  }

  blocks.forEach((b, i) => {
    if (b.type === 'gate') {
      const gateEl = buildConfigGates(b.entries, dungeon, prechainCtx);
      gateEl.classList.add('gate-section');
      wrapper.appendChild(gateEl);
    } else {
      const sg = document.createElement('div');
      sg.className = 'quest-series-group';
      const sgLabel = document.createElement('div');
      sgLabel.className = 'chain-context-label';
      sgLabel.textContent = seriesGroupLabel(b.cards);
      sg.appendChild(sgLabel);
      b.cards.forEach((c, j) => {
        sg.appendChild(buildQuestCard(c, dungeon, null, null, false, prechainCtx));
        if (j < b.cards.length - 1) sg.appendChild(buildFlowConnector(0));
      });
      wrapper.appendChild(sg);
    }
    wrapper.appendChild(buildFlowConnector(0));
  });

  wrapper.appendChild(buildQuestCard(quest, dungeon, null, null, false, dungeonCtx));
  const postChain = quest.postChain || [];
  if (postChain.length) { const bc = buildPostchainBreadcrumb(postChain); if (bc) wrapper.appendChild(bc); }
  return wrapper;
}

// A series group: optional requires gates, then the ordered series sequence
// (earlier non-dungeon members + dungeon members) as cards joined by arrows,
// then later non-dungeon members as a "Continue series" breadcrumb.
function buildConfigSeriesGroup(members, dungeon) {
  const wrapper = document.createElement('div');
  wrapper.className = 'quest-chain-group has-prechain';
  const label = document.createElement('div');
  label.className = 'chain-group-label';
  label.textContent = 'Quest Chain';
  wrapper.appendChild(label);

  // Build an ordered list of blocks preserving the interleaved order from the
  // prechain: each block is either {type:'series', sid, cards[]} or
  // {type:'gate', entries[]}. A series block is created on first encounter of
  // its series.id; subsequent entries with the same id are appended to it.
  // Standalone requires gates (no series.id) become their own gate block in
  // position, so a standalone quest between two series boxes renders correctly.
  const dungeonSid = members[0].series.id;
  const blocks = [];           // ordered blocks
  const sidToBlock = new Map();
  const gateKeySeen = new Set();

  function ensureSeriesBlock(sid) {
    if (!sidToBlock.has(sid)) {
      const b = { type: 'series', sid, cards: [] };
      sidToBlock.set(sid, b);
      blocks.push(b);
    }
    return sidToBlock.get(sid);
  }

  function addToSeriesBlock(sid, card) {
    const b = ensureSeriesBlock(sid);
    if (!b.cards.some(c => c.id === card.id)) b.cards.push(card);
  }

  // Seed the dungeon series block first so it always ends up as the main group.
  members.forEach(m => addToSeriesBlock(m.series.id, m));

  const optionalEntriesSeries = [];
  const optionalSeenSeries = new Set();
  members.forEach(m => (m.preChain || []).forEach(e => {
    if (e.relation === 'optional' && questPassesFaction(e) && !optionalSeenSeries.has(e.id)) {
      optionalSeenSeries.add(e.id);
      optionalEntriesSeries.push(e);
    }
    if (e.relation !== 'series' && e.relation !== 'requires') return;
    const sid = e.series?.id;
    if (sid) {
      addToSeriesBlock(sid, normalizeQuest(e));
    } else if (e.relation === 'requires') {
      const key = e.or ? 'or:' + e.or.map(v => v.id).join(',') : 'q:' + e.id;
      if (!gateKeySeen.has(key)) {
        gateKeySeen.add(key);
        blocks.push({ type: 'gate', entries: [e] });
      }
    }
  }));

  blocks.forEach(b => {
    if (b.type === 'series') b.cards.sort((a, b) => (a.series?.index ?? 0) - (b.series?.index ?? 0));
  });

  // Follow-ups: later non-dungeon members → breadcrumb. Skip any that already
  // render as a full card in a series block (e.g. an intermediate member that is
  // both a later step of one dungeon quest and an earlier step of the next).
  const blockCardIds = new Set(
    blocks.flatMap(b => (b.type === 'series' ? b.cards.map(c => c.id) : []))
  );
  const followSeen = new Set();
  const followups = [];
  members.forEach(m => (m.postChain || []).forEach(s => {
    if (followSeen.has(s.id) || blockCardIds.has(s.id)) return;
    followSeen.add(s.id);
    followups.push(s);
  }));
  followups.sort((a, b) => (a.series ? a.series.index : 0) - (b.series ? b.series.index : 0));

  // Cascade context spans the whole chain, including prerequisite steps that are
  // themselves dungeon quests (cross-series merges, e.g. BRD's "Abandoned Hope" /
  // "A Crumpled Up Note" leading into "Jail Break!"). They render in their own
  // groups too, but the cascade graph must still see them so completing the final
  // quest marks the entire preceding chain done.
  const allCtxCards = blocks.flatMap(b =>
    b.type === 'gate'
      ? b.entries.flatMap(g => g.or ? g.or.map(normalizeQuest) : [normalizeQuest(g)])
      : b.cards
  );
  // Include alsoUnlocks quests in dungeon context so checking either fork outcome
  // marks the shared prerequisite chain as complete.
  const alsoUnlocksAll = members.flatMap(m => (m.alsoUnlocks || []).map(normalizeQuest));
  const { dungeonCtx, prechainCtx } = configCascadeContexts(allCtxCards, [...members, ...alsoUnlocksAll]);

  // Render blocks in order, inserting flow connectors between them.
  // The dungeon series block is the last block; followups attach to it.
  const prereqBlocks = blocks.filter(b => !(b.type === 'series' && b.sid === dungeonSid));
  const mainBlock = blocks.find(b => b.type === 'series' && b.sid === dungeonSid);
  const orderedBlocks = [...prereqBlocks, mainBlock].filter(Boolean);

  if (optionalEntriesSeries.length) {
    wrapper.appendChild(buildOptionalPrereqSection(optionalEntriesSeries, dungeon, prechainCtx));
    wrapper.appendChild(buildFlowConnector(0, true));
  }

  orderedBlocks.forEach((b, i) => {
    const isLast = i === orderedBlocks.length - 1;
    if (b.type === 'gate') {
      const gateEl = buildConfigGates(b.entries, dungeon, prechainCtx);
      gateEl.classList.add('gate-section');
      wrapper.appendChild(gateEl);
      if (!isLast) wrapper.appendChild(buildFlowConnector(0));
      return;
    }
    const g = b.cards;
    const sg = document.createElement('div');
    sg.className = 'quest-series-group';
    const sgLabel = document.createElement('div');
    sgLabel.className = 'chain-context-label';
    sgLabel.textContent = seriesGroupLabel(g);
    sg.appendChild(sgLabel);

    // Detect if the last dungeon quest forks into parallel outcomes (alsoUnlocks).
    const lastCard = g[g.length - 1];
    const forkQuests = (lastCard && lastCard.isDungeon && (lastCard.alsoUnlocks || []).length)
      ? [lastCard, ...lastCard.alsoUnlocks.map(normalizeQuest)]
      : null;

    if (forkQuests) {
      // Render all cards before the fork normally.
      g.slice(0, -1).forEach((c, j) => {
        sg.appendChild(buildQuestCard(c, dungeon, null, null, false, prechainCtx));
        if (j < g.length - 2) sg.appendChild(buildFlowConnector(0));
      });
      sg.appendChild(buildFlowConnector(forkQuests.length));
      const branches = document.createElement('div');
      branches.className = 'chain-branches';
      forkQuests.forEach(fq => {
        const col = document.createElement('div');
        col.className = 'chain-branch';
        col.appendChild(buildQuestCard(normalizeQuest(fq), dungeon, null, null, false, dungeonCtx));
        branches.appendChild(col);
      });
      sg.appendChild(branches);
    } else {
      g.forEach((c, j) => {
        const ctx = c.isDungeon ? dungeonCtx : prechainCtx;
        sg.appendChild(buildQuestCard(c, dungeon, null, null, false, ctx));
        if (j < g.length - 1) sg.appendChild(buildFlowConnector(0));
      });
      // Keep the "Continue series" follow-ups inside the last box so they read
      // as part of the same questline rather than a detached section below it.
      if (isLast && followups.length) {
        const bc = buildPostchainBreadcrumb(followups);
        if (bc) sg.appendChild(bc);
      }
    }

    wrapper.appendChild(sg);
    if (!isLast) wrapper.appendChild(buildFlowConnector(0));
  });

  return wrapper;
}

// ═══════════════════════════════════════
//  CHAIN GROUP / TREE RENDERING
// ═══════════════════════════════════════
function questPassesFaction(q) {
  return !factionFilter || !q.faction || q.faction === 'Both' || q.faction === factionFilter;
}

// Build the structural model of a chain: faction-variant "slots" (quests that
// share a parent and name, e.g. the Alliance/Horde versions of one step) wired
// into a parent→children tree by prevQuestId.
function buildChainModel(members) {
  const byId = {};
  members.forEach(m => { byId[m.id] = m; });
  const parentIdOf = m => (m.prevQuestId != null && byId[m.prevQuestId]) ? m.prevQuestId : null;

  const slotByKey = new Map();      // "parentId|name" -> slot
  const slotOfQuest = new Map();    // questId -> slot
  members.forEach(m => {
    const pid = parentIdOf(m);
    const key = pid + '|' + m.name;
    let slot = slotByKey.get(key);
    if (!slot) { slot = { key, name: m.name, parentId: pid, variants: [] }; slotByKey.set(key, slot); }
    slot.variants.push(m);
    slotOfQuest.set(m.id, slot);
  });

  const childrenOf = new Map();     // slotKey -> [slot]
  const roots = [];
  slotByKey.forEach(slot => {
    const parentSlot = slot.parentId != null ? slotOfQuest.get(slot.parentId) : null;
    if (parentSlot) {
      if (!childrenOf.has(parentSlot.key)) childrenOf.set(parentSlot.key, []);
      childrenOf.get(parentSlot.key).push(slot);
    } else {
      roots.push(slot);
    }
  });

  const visibleVariants = slot => slot.variants.filter(questPassesFaction);
  const visibleChildren = slot => (childrenOf.get(slot.key) || []).filter(s => visibleVariants(s).length > 0);
  const slotOf = qid => slotOfQuest.get(qid);
  return { roots, visibleVariants, visibleChildren, slotOf };
}

function buildChainGroup(members, dungeon) {
  const model = buildChainModel(members);
  const visibleRoots = model.roots.filter(s => model.visibleVariants(s).length > 0);
  if (visibleRoots.length === 0) return null;
  // `trees`-declared chains hoist a fork's single continuing tail out of the box.
  const forkHeadsOnly = members.some(m => m.treeChain);

  const rootQuests = [].concat(...visibleRoots.map(model.visibleVariants));
  const rootPrechain  = (rootQuests.find(q => (q.preChain  || []).length) || {}).preChain  || [];
  const rootPostchain = (rootQuests.find(q => (q.postChain || []).length) || {}).postChain || [];

  let hasBranch = visibleRoots.length > 1;
  const walkDetect = slot => {
    const kids = model.visibleChildren(slot);
    if (kids.length > 1) hasBranch = true;
    kids.forEach(walkDetect);
  };
  visibleRoots.forEach(walkDetect);

  const totalVisible = rootQuests.length === 1 && model.visibleChildren(visibleRoots[0]).length === 0;
  if (totalVisible && rootPrechain.length === 0 && rootPostchain.length === 0 && members.length === 1) {
    return buildQuestCard(rootQuests[0], dungeon, null, null);
  }

  const gateChain   = rootPrechain.filter(s => s.preChainRole === 'gate');
  const seriesChain = rootPrechain.filter(s => s.preChainRole === 'series' || !s.preChainRole);
  const hasPrechain = rootPrechain.length > 0;

  // One whole-chain cascade context shared by every card: the in-dungeon chain
  // members plus their prerequisites. Direction comes from the prereq graph.
  const chainCtx = chainCascadeCtx([...members, ...rootPrechain]);
  const prechainCtx = chainCtx;
  const dungeonCtx  = chainCtx;

  const wrapper = document.createElement('div');
  // has-prechain switches the wrapper to flex-column so all children stack
  // vertically with flow connectors instead of the side-by-side grid.
  wrapper.className = 'quest-chain-group'
    + (hasPrechain ? ' has-prechain' : (hasBranch || forkHeadsOnly) ? ' chain-tree' : '');

  const label = document.createElement('div');
  label.className = 'chain-group-label';
  label.textContent = hasBranch && !hasPrechain ? 'Quest Chain  (branching)' : 'Quest Chain';
  wrapper.appendChild(label);

  // ── Gate section: standalone prerequisites that unlock the series ──
  if (gateChain.length > 0) {
    const gateEl = buildPrechainCards(gateChain, dungeon, 'Prerequisite', prechainCtx);
    if (gateEl) {
      gateEl.classList.add('gate-section');
      wrapper.appendChild(gateEl);
    }
    wrapper.appendChild(buildFlowConnector(0));
  }

  // ── Quest series group: series preChain + dungeon quest in one bordered box ──
  // This makes it visually obvious that e.g. 1489→1490→914 are one questline.
  if (seriesChain.length > 0) {
    const sg = document.createElement('div');
    sg.className = 'quest-series-group';
    const sgLabel = document.createElement('div');
    sgLabel.className = 'chain-context-label';
    sgLabel.textContent = 'Quest series';
    sg.appendChild(sgLabel);

    // Series prerequisite cards (with flow connectors between them)
    const sMembers = seriesChain.map(normalizeQuest);
    const sModel = buildChainModel(sMembers);
    const sRoots = sModel.roots.filter(s => sModel.visibleVariants(s).length > 0);
    const sOrdered = [];
    const walkS = s => {
      if (sModel.visibleVariants(s).length > 0) sOrdered.push(s);
      sModel.visibleChildren(s).forEach(walkS);
    };
    sRoots.forEach(walkS);

    sOrdered.forEach(slot => {
      const variants = sModel.visibleVariants(slot);
      if (variants.length === 1) {
        sg.appendChild(buildQuestCard(variants[0], dungeon, null, null, false, prechainCtx));
      } else {
        const node = document.createElement('div');
        node.className = 'chain-tree-node faction-alt';
        variants.forEach((q, j) => {
          if (j > 0) {
            const or = document.createElement('div');
            or.className = 'chain-or-divider';
            or.textContent = 'or';
            node.appendChild(or);
          }
          node.appendChild(buildQuestCard(q, dungeon, null, null, false, prechainCtx));
        });
        sg.appendChild(node);
      }
      // Connector after every series item, including just before the dungeon card
      sg.appendChild(buildFlowConnector(0));
    });

    appendDungeonSlots(visibleRoots, model, hasBranch, dungeon, sg, dungeonCtx, forkHeadsOnly);
    wrapper.appendChild(sg);
  } else {
    appendDungeonSlots(visibleRoots, model, hasBranch, dungeon, wrapper, dungeonCtx, forkHeadsOnly);
  }

  if (rootPostchain.length > 0) { const bc = buildPostchainBreadcrumb(rootPostchain); if (bc) wrapper.appendChild(bc); }

  return wrapper;
}

// Append in-dungeon quest cards (and their flow connectors) into a container.
// When dungeonCtx is set the wrapper is already vertical (has-prechain mode), so
// we add connectors between slots. Otherwise we preserve the existing flat layout.
function appendDungeonSlots(visibleRoots, model, hasBranch, dungeon, container, dungeonCtx, forkHeadsOnly = false) {
  // Tree chains (forkHeadsOnly) use the dedicated tree renderer: it boxes
  // consecutive series-runs into "Quest series" groups and renders many→one
  // convergences (parallel branches all unlocking one follow-up) explicitly.
  if (forkHeadsOnly) {
    visibleRoots.forEach(root => renderTreeSpine(root, model, dungeon, container, dungeonCtx, true));
  } else if (hasBranch) {
    visibleRoots.forEach(root => renderChainSlot(root, model, dungeon, container, false, true, dungeonCtx, false));
  } else {
    const slots = [];
    let cur = visibleRoots[0];
    while (cur) { slots.push(cur); cur = model.visibleChildren(cur)[0]; }
    slots.forEach((slot, idx) => {
      model.visibleVariants(slot).forEach(q => {
        container.appendChild(buildQuestCard(q, dungeon, idx, slots.length, false, dungeonCtx));
      });
      if (dungeonCtx && idx < slots.length - 1) container.appendChild(buildFlowConnector(0));
    });
  }
}

// One tree step as a card node. Multiple variants (same parent + name) collapse
// into a single "pick your faction" OR-slot.
function buildSlotNode(variants, dungeon, isDungeonChain, dungeonCtx) {
  const node = document.createElement('div');
  node.className = 'chain-tree-node' + (variants.length > 1 ? ' faction-alt' : '');
  variants.forEach((q, i) => {
    if (i > 0) {
      const or = document.createElement('div');
      or.className = 'chain-or-divider';
      or.textContent = 'or';
      node.appendChild(or);
    }
    node.appendChild(buildQuestCard(q, dungeon, null, null, isDungeonChain, dungeonCtx));
  });
  return node;
}

// Recursively render a slot (and its subtree) as an indented tree. Linear
// runs stay in the current column, joined by a downward "leads to" connector;
// a branch point nests each child branch under a shared trunk.
// isDungeonChain: true when this slot is an in-dungeon quest (not a preChain item),
// so buildQuestCard receives the isDungeonCard flag and shows the DUNGEON badge.
// forkHeadsOnly: when a fork has exactly one branch that keeps going, the box
// holds only the parallel heads and that branch's continuation flows below it
// (so the "unlocks" box wraps just the immediate alternatives, not a whole tail).
function renderChainSlot(slot, model, dungeon, container, isBranchChild, isDungeonChain = false, dungeonCtx = null, forkHeadsOnly = false) {
  const variants = model.visibleVariants(slot);
  if (variants.length === 0) return;

  container.appendChild(buildSlotNode(variants, dungeon, isDungeonChain, dungeonCtx));

  const kids = model.visibleChildren(slot);
  if (kids.length === 1) {
    container.appendChild(buildFlowConnector(0));
    renderChainSlot(kids[0], model, dungeon, container, false, isDungeonChain, dungeonCtx, forkHeadsOnly);
  } else if (kids.length > 1) {
    container.appendChild(buildFlowConnector(kids.length));
    const continuing = forkHeadsOnly ? kids.filter(k => model.visibleChildren(k).length > 0) : [];
    const pullOut = continuing.length === 1;  // one tail to hoist out of the box

    const branches = document.createElement('div');
    branches.className = 'chain-branches';
    kids.forEach(kid => {
      const col = document.createElement('div');
      col.className = 'chain-branch';
      if (pullOut) {
        col.appendChild(buildSlotNode(model.visibleVariants(kid), dungeon, isDungeonChain, dungeonCtx));
      } else {
        renderChainSlot(kid, model, dungeon, col, false, isDungeonChain, dungeonCtx, forkHeadsOnly);
      }
      branches.appendChild(col);
    });
    container.appendChild(branches);

    if (pullOut) {
      model.visibleChildren(continuing[0]).forEach(gk => {
        container.appendChild(buildFlowConnector(0));
        renderChainSlot(gk, model, dungeon, container, false, isDungeonChain, dungeonCtx, forkHeadsOnly);
      });
    }
  }
}

// Render a `trees`-declared chain as a vertical spine. Consecutive nodes that
// share a series.id are wrapped in one bordered "Quest series" box (so e.g.
// 6566→6567→6568→6569→6570 read as one questline); a fork whose branches all
// lead to the same follow-up renders as parallel "unlocks all" heads that then
// converge — via a "complete all to unlock" merge connector — on that follow-up.
function renderTreeSpine(startSlot, model, dungeon, container, dungeonCtx, isDungeonChain = false) {
  let slot = startSlot;
  let seriesBox = null;       // currently open .quest-series-group, or null
  let currentSid = null;
  let firstEl = true;         // suppress the leading connector
  let skipConnector = false;  // a convergence connector already bridged the gap

  while (slot) {
    const variants = model.visibleVariants(slot);
    if (variants.length === 0) break;
    const sid = variants[0].series ? variants[0].series.id : null;

    if (sid && sid === currentSid && seriesBox) {
      // Same series as the open box: connector + card stay inside the box.
      seriesBox.appendChild(buildFlowConnector(0));
      seriesBox.appendChild(buildSlotNode(variants, dungeon, isDungeonChain, dungeonCtx));
    } else {
      if (!firstEl && !skipConnector) container.appendChild(buildFlowConnector(0));
      skipConnector = false;
      if (sid) {
        seriesBox = document.createElement('div');
        seriesBox.className = 'quest-series-group';
        const lbl = document.createElement('div');
        lbl.className = 'chain-context-label';
        lbl.textContent = seriesGroupLabel(variants);
        seriesBox.appendChild(lbl);
        seriesBox.appendChild(buildSlotNode(variants, dungeon, isDungeonChain, dungeonCtx));
        container.appendChild(seriesBox);
        currentSid = sid;
      } else {
        seriesBox = null; currentSid = null;
        container.appendChild(buildSlotNode(variants, dungeon, isDungeonChain, dungeonCtx));
      }
    }
    firstEl = false;

    const kids = model.visibleChildren(slot);
    if (kids.length === 0) break;
    if (kids.length === 1) { slot = kids[0]; continue; }

    // ── Fork ──
    seriesBox = null; currentSid = null;
    const kidNext = kids.map(k => {
      const v = model.visibleVariants(k)[0];
      return v ? v.nextQuestId : null;
    });
    const converges = kidNext.every(n => n != null && n === kidNext[0]);
    const convSlot = converges ? model.slotOf(kidNext[0]) : null;

    container.appendChild(buildFlowConnector(kids.length));
    const branches = document.createElement('div');
    branches.className = 'chain-branches';
    kids.forEach(kid => {
      const col = document.createElement('div');
      col.className = 'chain-branch';
      if (convSlot) {
        // Converging branches: each is just its head (the shared follow-up is
        // rendered once, after the merge connector).
        col.appendChild(buildSlotNode(model.visibleVariants(kid), dungeon, isDungeonChain, dungeonCtx));
      } else {
        renderTreeSpine(kid, model, dungeon, col, dungeonCtx, isDungeonChain);
      }
      branches.appendChild(col);
    });
    container.appendChild(branches);

    if (convSlot) {
      container.appendChild(buildFlowConnector(kids.length, false,
        { merge: true, label: 'complete all to unlock' }));
      skipConnector = true;
      slot = convSlot;     // continue the spine from the convergence node
      continue;
    }
    break;                 // diverging branches are fully rendered recursively
  }
}

// Vertical "leads to" connector between a step and what it unlocks. When the
// step forks (childCount > 1) it labels the fork so the follow-ups read as a
// group. `opts.label` overrides the auto label; `opts.merge` styles it as a
// many→one join (parallel branches converging on a single follow-up).
function buildFlowConnector(childCount, dashed = false, opts = {}) {
  const el = document.createElement('div');
  el.className = 'chain-flow' + (childCount > 1 && !opts.merge ? ' split' : '')
    + (opts.merge ? ' merge' : '') + (dashed ? ' optional' : '');
  const label = opts.label != null ? opts.label
    : childCount === 2 ? 'unlocks both' : childCount > 2 ? 'unlocks all' : '';
  el.innerHTML = '<span class="chain-flow-line"></span>' +
    (label ? `<span class="chain-flow-label">${label}</span>` : '') +
    '<span class="chain-flow-arrow">▾</span>';
  return el;
}

// ═══════════════════════════════════════
//  FLOW CHAINS (series-parallel DAG)
// ═══════════════════════════════════════
// A `flows` chain renders a true fork/convergence dependency graph that the
// linear series + requires renderers can't express: one quest unlocking several
// parallel questlines, groups of quests that must ALL be completed to unlock the
// next (a many→one join), and those joins nesting (the Dreadsteed questline:
// three relics → Arcanite; then Arcanite + the imp line → Imp Delivery).
//
// The structure is a nested tree of nodes:
//   {type:'leaf', id}                 — one quest card
//   {type:'series', items:[...]}      — vertical sequence joined by "leads to"
//   {type:'all', items:[...]}         — parallel branches, complete ALL to unlock
//   {type:'any', items:[...]}         — parallel branches, complete ONE to unlock
// A parallel group unlocks whatever follows it in the enclosing series; that is
// where the "complete all/one to unlock" merge connector is drawn.

function flowEntryCount(node) {
  if (node.type === 'leaf') return 1;
  if (node.type === 'series') return flowEntryCount(node.items[0]);
  return node.items.reduce((s, c) => s + flowEntryCount(c), 0);
}
function flowExitCount(node) {
  if (node.type === 'leaf') return 1;
  if (node.type === 'series') return flowExitCount(node.items[node.items.length - 1]);
  return node.items.reduce((s, c) => s + flowExitCount(c), 0);
}

function buildFlowGroup(flow, members, dungeon) {
  const byId = {};
  members.forEach(m => { byId[m.id] = normalizeQuest(m); });
  // Every quest in the flow belongs to one prerequisite DAG, so each card gets
  // the same whole-chain context; the cascade walks the graph both directions.
  const cardCtx = chainCascadeCtx(members);
  const ctx = { byId, dungeon, cardCtx };

  const wrapper = document.createElement('div');
  wrapper.className = 'quest-chain-group has-prechain';
  const label = document.createElement('div');
  label.className = 'chain-group-label';
  label.textContent = 'Quest Chain';
  wrapper.appendChild(label);
  renderFlowNode(flow.tree, wrapper, ctx);
  // Post-dungeon follow-ups peeled off the flow's tail render as a breadcrumb.
  if (flow.postChain && flow.postChain.length) {
    const bc = buildPostchainBreadcrumb(flow.postChain);
    if (bc) wrapper.appendChild(bc);
  }
  return wrapper;
}

function flowCard(id, ctx) {
  const q = ctx.byId[id];
  if (!q) return document.createComment('flow: missing quest ' + id);
  return buildQuestCard(q, ctx.dungeon, null, null, false, ctx.cardCtx);
}

function renderFlowNode(node, container, ctx) {
  if (node.type === 'leaf') {
    container.appendChild(flowCard(node.id, ctx));
  } else if (node.type === 'series') {
    renderFlowSeries(node.items, container, ctx);
  } else {
    renderFlowParallel(node, container, ctx);
  }
}

// Parallel branches stack vertically inside one dashed "branches" box (matching
// the existing tree renderer). Each branch is rendered recursively.
function renderFlowParallel(node, container, ctx) {
  const branches = document.createElement('div');
  branches.className = 'chain-branches';
  node.items.forEach(child => {
    const col = document.createElement('div');
    col.className = 'chain-branch';
    renderFlowNode(child, col, ctx);
    branches.appendChild(col);
  });
  container.appendChild(branches);
}

// A series lays its items out vertically. Consecutive leaf quests that share a
// series id are boxed together as a "Quest series" group (with PART x/y badges).
// Connectors between items express the relationship: a fork connector before a
// parallel group ("unlocks all/one"), a merge connector after one ("complete
// all/one to unlock"), or a plain "leads to" arrow between sequential quests.
function renderFlowSeries(items, container, ctx) {
  // Group consecutive same-series leaves into runs; parallel blocks and lone
  // leaves are their own segments.
  const segs = [];
  let i = 0;
  while (i < items.length) {
    const it = items[i];
    if (it.type === 'leaf') {
      const sid = ctx.byId[it.id] && ctx.byId[it.id].series ? ctx.byId[it.id].series.id : null;
      if (sid) {
        const run = [it.id];
        let j = i + 1;
        while (j < items.length && items[j].type === 'leaf'
               && ctx.byId[items[j].id] && ctx.byId[items[j].id].series
               && ctx.byId[items[j].id].series.id === sid) {
          run.push(items[j].id); j++;
        }
        if (run.length >= 2) { segs.push({ kind: 'seriesRun', ids: run }); i = j; continue; }
      }
      segs.push({ kind: 'leaf', id: it.id }); i++;
    } else {
      segs.push({ kind: 'parallel', node: it }); i++;
    }
  }

  const anyLabel = (n, fork) => n.label
    || (n.type === 'any'
        ? (fork ? 'unlocks one' : 'complete one to unlock')
        : (fork ? (flowEntryCount(n) > 2 ? 'unlocks all' : 'unlocks both')
                : (flowExitCount(n) > 2 ? 'complete all to unlock' : 'complete both to unlock')));

  segs.forEach((seg, k) => {
    if (k > 0) {
      const prev = segs[k - 1];
      if (prev.kind === 'parallel') {
        container.appendChild(buildFlowConnector(flowExitCount(prev.node), false,
          { merge: true, label: anyLabel(prev.node, false) }));
      } else if (seg.kind === 'parallel') {
        container.appendChild(buildFlowConnector(flowEntryCount(seg.node), false,
          { label: anyLabel(seg.node, true) }));
      } else {
        container.appendChild(buildFlowConnector(0));
      }
    }
    if (seg.kind === 'seriesRun') {
      const box = document.createElement('div');
      box.className = 'quest-series-group';
      const lbl = document.createElement('div');
      lbl.className = 'chain-context-label';
      lbl.textContent = seriesGroupLabel(seg.ids.map(id => ctx.byId[id]));
      box.appendChild(lbl);
      seg.ids.forEach((id, idx) => {
        if (idx > 0) box.appendChild(buildFlowConnector(0));
        box.appendChild(flowCard(id, ctx));
      });
      container.appendChild(box);
    } else if (seg.kind === 'leaf') {
      container.appendChild(flowCard(seg.id, ctx));
    } else {
      renderFlowParallel(seg.node, container, ctx);
    }
  });
}

// Optional prerequisites: quests that feed into the dungeon quest but are not
// required — players can pick up the dungeon quest independently.
function buildOptionalPrereqSection(entries, dungeon, ctx) {
  const section = document.createElement('div');
  section.className = 'optional-prereq-section';
  const label = document.createElement('div');
  label.className = 'chain-context-label';
  label.textContent = entries.length > 1 ? 'Optional Prerequisites' : 'Optional Prerequisite';
  section.appendChild(label);
  entries.forEach((e, i) => {
    section.appendChild(buildQuestCard(normalizeQuest(e), dungeon, null, null, false, ctx));
    if (i < entries.length - 1) section.appendChild(buildFlowConnector(0));
  });
  return section;
}

// ═══════════════════════════════════════
//  PRECHAIN CARDS
// ═══════════════════════════════════════
// Prerequisites now carry full quest data, so render each as a proper quest card
// (the same size as the in-dungeon cards — they share the chain group's grid)
// instead of a minified breadcrumb link.
//
// The prerequisites form their own little chain, so the chain tree model wires
// them via prevQuestId: sequential same-named steps (e.g. a 4-part "The Defias
// Brotherhood" series) stay distinct cards, while true faction variants — quests
// that share a parent AND a name — collapse into one "pick your faction" OR-slot.
// They lay out as flat grid items (no flow connectors) to match the linear chain
// cards below them.
function buildPrechainCards(preChain, dungeon, sectionLabel, cascadeCtx = null) {
  const members = preChain.map(normalizeQuest);
  const model = buildChainModel(members);
  const visibleRoots = model.roots.filter(s => model.visibleVariants(s).length > 0);
  if (visibleRoots.length === 0) return null;

  const ordered = [];
  const walk = slot => {
    if (model.visibleVariants(slot).length > 0) ordered.push(slot);
    model.visibleChildren(slot).forEach(walk);
  };
  visibleRoots.forEach(walk);

  const el = document.createElement('div');
  el.className = 'chain-prechain';
  const label = document.createElement('div');
  label.className = 'chain-context-label';
  label.textContent = sectionLabel || 'Prerequisites';
  el.appendChild(label);

  ordered.forEach((slot, slotIdx) => {
    const variants = model.visibleVariants(slot);
    if (variants.length === 1) {
      el.appendChild(buildQuestCard(variants[0], dungeon, null, null, false, cascadeCtx));
    } else {
      const node = document.createElement('div');
      node.className = 'chain-tree-node faction-alt';
      variants.forEach((q, j) => {
        if (j > 0) {
          const or = document.createElement('div');
          or.className = 'chain-or-divider';
          or.textContent = 'or';
          node.appendChild(or);
        }
        node.appendChild(buildQuestCard(q, dungeon, null, null, false, cascadeCtx));
      });
      el.appendChild(node);
    }
    if (slotIdx < ordered.length - 1) el.appendChild(buildFlowConnector(0));
  });

  return el;
}

// ═══════════════════════════════════════
//  POSTCHAIN BREADCRUMB
// ═══════════════════════════════════════
function buildPostchainBreadcrumb(postChain) {
  // Resolve OR groups against the active faction filter first.
  // If every item in the postChain ends up empty, return null.
  const resolved = postChain.map(s => {
    if (!s.or) return s;
    const visible = factionFilter
      ? s.or.filter(v => !v.faction || v.faction === 'Both' || v.faction === factionFilter)
      : s.or;
    return visible.length ? { or: visible } : null;
  }).filter(Boolean);

  if (!resolved.length) return null;

  const el = document.createElement('div');
  el.className = 'chain-postchain';
  const label = document.createElement('div');
  label.className = 'chain-context-label';
  label.textContent = 'Continue series';
  el.appendChild(label);
  const flow = document.createElement('div');
  flow.className = 'prechain-flow';
  const startArrow = document.createElement('span');
  startArrow.className = 'prechain-arrow';
  startArrow.textContent = '›';
  flow.appendChild(startArrow);

  function makeOrStep(v) {
    const row = document.createElement('div');
    row.className = 'postchain-or-row';

    const a = document.createElement('a');
    a.href = v.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'prechain-step postchain-step postchain-or-step';
    if (v.faction && v.faction !== 'Both') {
      const badge = document.createElement('span');
      badge.className = `faction-badge faction-${v.faction.toLowerCase()}`;
      badge.textContent = v.faction;
      a.appendChild(badge);
    }
    const nameEl = document.createElement('span');
    nameEl.textContent = v.name;
    a.appendChild(nameEl);
    row.appendChild(a);

    (v.then || []).forEach(t => {
      const arrow = document.createElement('span');
      arrow.className = 'prechain-arrow';
      arrow.textContent = '›';
      row.appendChild(arrow);
      const ta = document.createElement('a');
      ta.href = t.url;
      ta.target = '_blank';
      ta.rel = 'noopener noreferrer';
      ta.className = 'prechain-step postchain-step';
      ta.textContent = t.name;
      row.appendChild(ta);
    });

    if (v.alsoUnlocks && v.alsoUnlocks.length) {
      const also = document.createElement('span');
      also.className = 'postchain-also-unlocks';
      also.appendChild(document.createTextNode('(+ '));
      v.alsoUnlocks.forEach((u, i) => {
        if (i > 0) also.appendChild(document.createTextNode(', '));
        const ua = document.createElement('a');
        ua.href = u.url;
        ua.target = '_blank';
        ua.rel = 'noopener noreferrer';
        ua.className = 'prechain-step postchain-step';
        ua.textContent = u.name;
        also.appendChild(ua);
      });
      also.appendChild(document.createTextNode(')'));
      row.appendChild(also);
    }

    return row;
  }

  resolved.forEach((s, i) => {
    if (s.or) {
      if (s.or.length === 1) {
        // Faction filtered to one option — plain step, no OR box.
        flow.appendChild(makeOrStep(s.or[0]));
      } else {
        // Multiple faction alternatives: "pick one" box.
        const node = document.createElement('div');
        node.className = 'chain-tree-node faction-alt';
        s.or.forEach((v, j) => {
          if (j > 0) {
            const orDiv = document.createElement('div');
            orDiv.className = 'chain-or-divider';
            orDiv.textContent = 'or';
            node.appendChild(orDiv);
          }
          node.appendChild(makeOrStep(v));
        });
        flow.appendChild(node);
      }
    } else {
      if (i > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'prechain-arrow';
        arrow.textContent = '›';
        flow.appendChild(arrow);
      }
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'prechain-step postchain-step';
      a.textContent = s.name;
      flow.appendChild(a);
    }
  });

  el.appendChild(flow);
  return el;
}

// ═══════════════════════════════════════
//  BUILD QUEST CARD
// ═══════════════════════════════════════
function buildQuestCard(quest, dungeon, chainPos, chainTotal, isDungeonCard = false, cascadeCtx = null) {
  const key = questKey(dungeon, quest);
  const isComplete = !!completed[key];
  const card = document.createElement('div');

  const chainClass = quest.chainId !== null ? ' chain-quest' : '';
  card.className = 'quest-card' + chainClass + (isComplete ? ' completed' : '');

  // Tag the card so map-pin quest links can scroll to / highlight it after
  // navigating to this dungeon (id disambiguates same-named series quests).
  card.dataset.questName = quest.name;
  if (quest.id != null) card.dataset.questId = quest.id;

  if (quest.chainId !== null) {
    card.dataset.chainId = quest.chainId;
  }

  // ---- Chain badges (dungeon quest indicator + series part) ----
  // schema-2 dungeons carry explicit isDungeon / series fields, so the DUNGEON
  // badge marks only declared objectives (incl. standalone ones) and series
  // members get a separate "PART x/y" badge. Legacy dungeons keep deriving the
  // badge from the chainPos / isDungeonCard params.
  let dungeonBadgeHtml = '';
  let seriesBadgeHtml = '';
  if (dungeon.schema === 2) {
    if (quest.isDungeon) dungeonBadgeHtml = `<div class="chain-badge dungeon-badge">DUNGEON</div>`;
    if (quest.series && quest.series.total > 1) {
      seriesBadgeHtml = `<div class="chain-badge series-badge">PART ${quest.series.index}/${quest.series.total}</div>`;
    }
  } else if (chainPos !== null && chainTotal !== null) {
    const part = chainTotal > 1 ? ` ${chainPos + 1}/${chainTotal}` : '';
    dungeonBadgeHtml = `<div class="chain-badge dungeon-badge">DUNGEON${part}</div>`;
  } else if (isDungeonCard) {
    dungeonBadgeHtml = `<div class="chain-badge dungeon-badge">DUNGEON</div>`;
  }
  const chainBadgeHtml = dungeonBadgeHtml + seriesBadgeHtml;

  // ---- Rewards (always-give) ----
  const rewardItems = quest.rewards.length > 0 ? quest.rewards : quest.legacyItems;
  let itemsHtml = '';
  if (rewardItems.length > 0) {
    const links = rewardItems.map(r => buildItemLink(r)).join('<br>');
    itemsHtml = `<div class="quest-row"><span class="quest-label">Reward</span><span class="quest-value items">${links}</span></div>`;
  }

  // ---- Choice rewards ----
  let choiceHtml = '';
  if (quest.rewardChoices.length > 0) {
    const links = quest.rewardChoices.map(r => buildItemLink(r)).join('<br>');
    choiceHtml = `<div class="quest-row"><span class="quest-label">Choice</span><span class="quest-value items">${links}</span></div>`;
  }

  // ---- Notes ----
  const notesHtml = quest.notes
    ? `<div class="quest-row"><span class="quest-label">Note</span><span class="quest-value note">${quest.notes}</span></div>`
    : '';

  // ---- Quest level badge ----
  const levelNum = quest.minLevel || (quest.levels ? parseInt(quest.levels) : 0);
  const levelText = levelNum ? `ReqLvl ${levelNum}` : '';

  // ---- Faction badge (always shown when quest has a specific faction) ----
  const showFaction = quest.faction && quest.faction !== 'Both';
  const factionBadgeHtml = showFaction
    ? `<div class="faction-badge faction-${quest.faction.toLowerCase()}"><img class="faction-badge-icon" src="assets/icons/${quest.faction.toLowerCase()}.png" alt="">${quest.faction}</div>`
    : '';

  // ---- Class restriction badge ----
  const classBadgeHtml = quest.requiredClasses && quest.requiredClasses.length > 0
    ? quest.requiredClasses.map(cls => {
        const slug = cls.toLowerCase();
        return `<div class="class-badge class-${slug}"><img class="class-icon" src="assets/icons/classicon_${slug}.jpg" alt="${cls}">${cls}</div>`;
      }).join('')
    : '';

  // ---- NPC / object / item link helpers ----
  // A quest may have several givers (e.g. a class quest offered by every city's
  // trainer); render the whole list, tagging any faction-restricted giver.
  const startIsMulti = Array.isArray(quest.startNpcs) && dedupeGivers(quest.startNpcs).length > 1;
  const endIsMulti = Array.isArray(quest.endNpcs) && dedupeGivers(quest.endNpcs).length > 1;
  let startNpcHtml;
  if (startIsMulti) {
    startNpcHtml = renderGiverList(quest.startNpcs);
  } else if (quest.startNpcLink) {
    startNpcHtml = buildGiverNameHtml(quest.startNpc, quest.startNpcLink, 'npc', quest.startLoc);
  } else if (quest.startNpc) {
    startNpcHtml = quest.startNpc;
  } else if (quest.startObjectLink) {
    startNpcHtml = buildGiverNameHtml(quest.startObject, quest.startObjectLink, 'object', quest.startLoc);
  } else if (quest.startObject) {
    startNpcHtml = quest.startObject;
  } else if (quest.startItemLink) {
    startNpcHtml = `<a href="${quest.startItemLink}" target="_blank" rel="noopener noreferrer" class="item-link q1">${quest.startItem}</a>`;
  } else if (quest.startItem) {
    startNpcHtml = quest.startItem;
  } else {
    startNpcHtml = '—';
  }

  const endEntity = quest.endNpc || quest.endObject || '';
  const startEntity = quest.startNpc || quest.startObject || quest.startItem || '';
  let endNpcHtml;
  if (endIsMulti) {
    endNpcHtml = renderGiverList(quest.endNpcs);
  } else if (quest.endNpcLink) {
    endNpcHtml = buildGiverNameHtml(quest.endNpc, quest.endNpcLink, 'npc', quest.endLoc);
  } else if (quest.endNpc) {
    endNpcHtml = quest.endNpc;
  } else if (quest.endObjectLink) {
    endNpcHtml = buildGiverNameHtml(quest.endObject, quest.endObjectLink, 'object', quest.endLoc);
  } else {
    endNpcHtml = quest.endObject || '—';
  }

  // ---- Turn-in row ----
  const turninHtml = endEntity && endEntity !== startEntity
    ? `<div class="quest-row">
        <span class="quest-label">Turn in</span>
        <span class="quest-value">${endNpcHtml}${!endIsMulti && quest.endLoc ? ` <span class="location">— ${buildLocationLink(quest.endLoc)}</span>` : ''}</span>
       </div>`
    : '';

  card.innerHTML = `
    <div class="quest-card-header">
      <div class="quest-checkbox" data-key="${key}" title="${isComplete ? 'Mark incomplete' : 'Mark complete'}">${isComplete ? '✓' : ''}</div>
      <div class="quest-name">
        <span class="quest-name-link" role="button" tabindex="0" title="View quest details">${escapeHtml(quest.name)}</span>
      </div>
      <div class="quest-badges">
        ${chainBadgeHtml}${classBadgeHtml}${factionBadgeHtml}${levelText ? `<div class="quest-level-badge">${levelText}</div>` : ''}
      </div>
    </div>
    <div class="quest-card-body">
      <div class="quest-row">
        <span class="quest-label">${endEntity && endEntity === startEntity ? 'Start / Turn in' : 'Start'}</span>
        <span class="quest-value">${startNpcHtml}${!startIsMulti && quest.startLoc ? ` <span class="location">— ${buildLocationLink(quest.startLoc)}</span>` : ''}</span>
      </div>
      ${turninHtml}
      ${itemsHtml}
      ${choiceHtml}
      ${notesHtml}
    </div>
    <div class="quest-card-footer">
      <div class="footer-pills">
        ${quest.xp ? `<div class="xp-pill"><img class="section-icon" src="assets/icons/experience.png" alt=""> ${quest.xp.toLocaleString()} XP</div>` : ''}
        ${quest.money ? `<div class="money-pill"><img class="money-icon" src="assets/icons/coin-${moneyTier(quest.money)}.png" alt="">${formatMoney(quest.money)}</div>` : ''}
      </div>
      <button class="complete-btn" data-key="${key}">${isComplete ? '↩ Undo' : '✓ Complete'}</button>
    </div>
  `;

  // Clicking the quest name opens the detail popout (instead of leaving to Wowhead).
  const nameEl = card.querySelector('.quest-name-link');
  if (nameEl) {
    const openModal = e => {
      e.stopPropagation();
      openQuestModal(quest, dungeon, card);
    };
    nameEl.addEventListener('click', openModal);
    nameEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(e); }
    });
  }

  // Toggle expand in list view
  card.addEventListener('click', e => {
    if (e.target.classList.contains('complete-btn')) return;
    if (e.target.classList.contains('quest-checkbox')) return;
    if (e.target.classList.contains('quest-name-link')) return;
    if (e.target.tagName === 'A') return;
    if (currentView === 'list') card.classList.toggle('expanded');
  });

  function toggleQuestComplete() {
    const wasCompleted = !!completed[key];
    completed[key] = !wasCompleted;
    if (!completed[key]) delete completed[key];
    applyChainCascade(quest, dungeon, cascadeCtx, wasCompleted);
    localStorage.setItem('wow_completed', JSON.stringify(completed));
    renderDungeonHeader(DUNGEONS.find(d => d.id === currentDungeonId));
    renderQuests();
  }

  // Checkbox click
  const checkbox = card.querySelector('.quest-checkbox');
  checkbox.addEventListener('click', e => {
    e.stopPropagation();
    toggleQuestComplete();
  });

  // Complete button
  const btn = card.querySelector('.complete-btn');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    toggleQuestComplete();
  });

  return card;
}

// ═══════════════════════════════════════
//  ITEM LINK BUILDER
// ═══════════════════════════════════════
function buildItemLink(item) {
  const qClass = `q${Math.min(item.quality || 1, 5)}`;
  const qty = (item.quantity || 1) > 1 ? ` <span class="item-qty">x${item.quantity}</span>` : '';
  if (item.url) {
    return `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="item-link ${qClass}">${item.name}</a>${qty}`;
  }
  return `<span class="item-link ${qClass}">${item.name}</span>${qty}`;
}

// ═══════════════════════════════════════
//  CONTROLS
// ═══════════════════════════════════════
function initSidebarCollapse() {
  document.querySelectorAll('.sidebar-title').forEach(title => {
    title.addEventListener('click', () => {
      title.closest('.sidebar-section').classList.toggle('expanded');
    });
  });
}

function dungeonHasQuestsForFaction(dungeon) {
  return !factionFilter || dungeon.quests.some(q => {
    const nq = normalizeQuest(q);
    return !nq.faction || nq.faction === 'Both' || nq.faction === factionFilter;
  });
}

function updateDungeonTabsVisibility() {
  document.querySelectorAll('.dungeon-tab').forEach(tab => {
    const dungeon = DUNGEONS.find(d => d.id === tab.dataset.id);
    if (!dungeon) return;
    tab.classList.toggle('faction-dimmed', !dungeonHasQuestsForFaction(dungeon));
  });
  document.querySelectorAll('.dungeon-filter-option').forEach(opt => {
    const dungeon = DUNGEONS.find(d => d.id === opt.dataset.id);
    if (!dungeon) return;
    opt.classList.toggle('faction-dimmed', !dungeonHasQuestsForFaction(dungeon));
  });
}

function bindControls() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    searchClear.hidden = e.target.value === '';
    renderQuests();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.hidden = true;
    searchInput.focus();
    renderQuests();
  });

  document.getElementById('filterGroup').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    if (btn.dataset.filter === 'has-gear') {
      hasGearOnly = !hasGearOnly;
      btn.classList.toggle('active', hasGearOnly);
    } else {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn:not([data-filter="has-gear"])').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    renderQuests();
    savePrefs();
  });

  document.getElementById('factionGroup').addEventListener('click', e => {
    const btn = e.target.closest('.faction-btn');
    if (!btn) return;
    const f = btn.dataset.faction;
    factionFilter = f === 'all' ? null : f;
    document.querySelectorAll('.faction-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    syncClassOptionsToFaction();
    updateDungeonTabsVisibility();
    const cur = DUNGEONS.find(d => d.id === currentDungeonId);
    if (cur) renderDungeonHeader(cur);
    renderQuests();
    updateUrl();
  });

  const classFilterEl = document.getElementById('classFilter');
  const classFilterTrigger = document.getElementById('classFilterTrigger');
  const classFilterPanel = document.getElementById('classFilterPanel');

  classFilterTrigger.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = classFilterEl.classList.toggle('open');
    classFilterTrigger.setAttribute('aria-expanded', isOpen);
  });

  classFilterPanel.addEventListener('click', e => {
    const opt = e.target.closest('.class-filter-option');
    if (!opt) return;
    const cls = opt.dataset.class;
    classFilter = cls === 'all' ? null : cls;
    document.querySelectorAll('.class-filter-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    classFilterEl.classList.remove('open');
    classFilterTrigger.setAttribute('aria-expanded', 'false');
    const selectedEl = document.getElementById('classFilterSelected');
    if (classFilter) {
      const slug = classFilter.toLowerCase();
      selectedEl.innerHTML = `<img class="class-icon" src="assets/icons/classicon_${slug}.jpg" alt="">${classFilter}`;
    } else {
      selectedEl.textContent = 'All Classes';
    }
    const cur = DUNGEONS.find(d => d.id === currentDungeonId);
    if (cur) renderDungeonHeader(cur);
    renderQuests();
    updateUrl();
  });

  document.addEventListener('click', e => {
    if (!classFilterEl.contains(e.target)) {
      classFilterEl.classList.remove('open');
      classFilterTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  const dungeonFilterEl = document.getElementById('dungeonFilter');
  const dungeonFilterTrigger = document.getElementById('dungeonFilterTrigger');
  const dungeonFilterPanel = document.getElementById('dungeonFilterPanel');

  dungeonFilterTrigger.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = dungeonFilterEl.classList.toggle('open');
    dungeonFilterTrigger.setAttribute('aria-expanded', isOpen);
  });

  dungeonFilterPanel.addEventListener('click', e => {
    const opt = e.target.closest('.dungeon-filter-option');
    if (!opt) return;
    dungeonFilterEl.classList.remove('open');
    dungeonFilterTrigger.setAttribute('aria-expanded', 'false');
    selectDungeon(opt.dataset.id);
  });

  document.addEventListener('click', e => {
    if (!dungeonFilterEl.contains(e.target)) {
      dungeonFilterEl.classList.remove('open');
      dungeonFilterTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('gridViewBtn').addEventListener('click', () => {
    currentView = 'grid';
    document.getElementById('gridViewBtn').classList.add('active');
    document.getElementById('listViewBtn').classList.remove('active');
    renderQuests();
    savePrefs();
  });

  document.getElementById('listViewBtn').addEventListener('click', () => {
    currentView = 'list';
    document.getElementById('listViewBtn').classList.add('active');
    document.getElementById('gridViewBtn').classList.remove('active');
    renderQuests();
    savePrefs();
  });
}

// ═══════════════════════════════════════
//  MAP MODAL
// ═══════════════════════════════════════
let mapScale = 1, mapX = 0, mapY = 0;
let mapDragging = false, mapDragStartX = 0, mapDragStartY = 0;
let mapNaturalW = 0, mapNaturalH = 0;

// Coordinate & pin state
let mapCurrentLocation = null;
let mapCurrentLevelIndex = 0;
let mapUserPins = [];
let mapEditingPinId = null;
let mapPendingFocus = null; // { label } — pin to centre on once the map image loads
let mapPinListExpanded = new Set(); // pin-list section types the user has expanded (collapsed by default)
let mapMouseDownX = 0, mapMouseDownY = 0, mapWasDragged = false;
let pinPanelManualState = null; // null = follow screen size; true/false = user's explicit choice this session
let resizeDebounceTimer = null;
const PIN_PANEL_COLLAPSE_THRESHOLD = 900; // px — below this width the panel auto-collapses

function applyMapTransform() {
  document.getElementById('mapModalImg').style.transform =
    `translate(${mapX}px, ${mapY}px) scale(${mapScale})`;
  updatePinPositions();
}

function resetMapView() {
  const img = document.getElementById('mapModalImg');
  const vp  = document.getElementById('mapModalViewport');
  const vpW = vp.clientWidth, vpH = vp.clientHeight;
  // Fit the image inside the viewport at scale 1
  const scaleW = mapNaturalW > 0 ? vpW / mapNaturalW : 1;
  const scaleH = mapNaturalH > 0 ? vpH / mapNaturalH : 1;
  mapScale = Math.min(scaleW, scaleH);
  // Centre it
  mapX = (vpW - mapNaturalW * mapScale) / 2;
  mapY = (vpH - mapNaturalH * mapScale) / 2;
  applyMapTransform();
}

function loadMapImage(src) {
  const img   = document.getElementById('mapModalImg');
  const noImg = document.getElementById('mapNoImage');
  img.classList.add('loading');
  noImg.classList.remove('visible');
  img.style.display = 'block';
  img.src = '';
  mapNaturalW = 0; mapNaturalH = 0;
  img.onload = () => {
    mapNaturalW = img.naturalWidth;
    mapNaturalH = img.naturalHeight;
    img.classList.remove('loading');
    resetMapView();
    renderMapPins();
    applyPendingMapFocus();
  };
  img.onerror = () => {
    img.style.display = 'none';
    noImg.classList.add('visible');
  };
  img.src = src;
}

// Centre the map on a pin and play the highlight/label animation. Shared by the
// pin-list navigation and the quest-giver "show on map" links.
function focusMapPin(pin) {
  const vp = document.getElementById('mapModalViewport');
  if (!vp || !mapNaturalW) return;
  // Zoom in a touch from the fit scale so the focused pin reads clearly.
  mapScale = Math.min(Math.max(mapScale * 2.5, mapScale), 3);
  mapX = vp.clientWidth  / 2 - (pin.x / 100) * mapNaturalW * mapScale;
  mapY = vp.clientHeight / 2 - (pin.y / 100) * mapNaturalH * mapScale;
  applyMapTransform();

  const pinEl = document.querySelector(`.map-pin[data-x="${pin.x}"][data-y="${pin.y}"]`);
  if (pinEl) {
    pinEl.classList.remove('pin-highlight');
    void pinEl.offsetWidth; // reflow to restart the animation
    pinEl.classList.add('pin-highlight');
    pinEl.addEventListener('animationend', () => pinEl.classList.remove('pin-highlight'), { once: true });
    clearActivePinLabels();
    pinEl.classList.add('label-active');
    loadPinThumb(pinEl);
  }

  // Mirror the focus in the side list (e.g. opened from a quest-card NPC link).
  revealPinInList(pin, pin.id ? 'user' : 'system');
}

// Once the map image has loaded and pins are rendered, centre on any pin the
// modal was opened to focus (set by openMapModal via a quest-giver link).
function applyPendingMapFocus() {
  if (!mapPendingFocus) return;
  const found = questPinFor(mapCurrentLocation, mapPendingFocus.label);
  mapPendingFocus = null;
  if (found && found.levelIndex === mapCurrentLevelIndex) focusMapPin(found.pin);
}

// Open the map popout for a location. Pass `focus` ({ label, levelIndex }) to
// centre on a specific quest-giver pin once the map loads.
function openMapModal(locationName, focus = null) {
  const zoneId = ZONE_IDS[locationName];
  if (!zoneId) return;

  const initialLevel = focus && focus.levelIndex ? focus.levelIndex : 0;
  mapCurrentLocation = locationName;
  mapCurrentLevelIndex = initialLevel;
  mapPendingFocus = focus ? { label: focus.label } : null;
  closePinEditDialog();
  applyPinListDefault();

  const wowheadUrl = `https://www.wowhead.com/classic/zone=${zoneId}`;
  document.getElementById('mapModalTitle').textContent = locationName;
  document.getElementById('mapModalWowheadLink').href  = wowheadUrl;

  // Build level nav (empty for single-map zones)
  const levelNav   = document.getElementById('mapLevelNav');
  const levels     = MULTI_LEVEL_MAPS[locationName] || MULTI_LEVEL_MAPS[zoneId];
  levelNav.innerHTML = '';

  if (levels) {
    levels.forEach((level, i) => {
      const btn = document.createElement('button');
      btn.className = 'map-level-btn' + (i === initialLevel ? ' active' : '');
      btn.textContent = level.label;
      btn.addEventListener('click', () => {
        levelNav.querySelectorAll('.map-level-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mapCurrentLevelIndex = i;
        closePinEditDialog();
        loadMapUserPins();
        loadMapImage(level.src);
      });
      levelNav.appendChild(btn);
    });
  }

  // Open the modal first so the viewport has real dimensions when onload fires
  document.getElementById('mapModal').setAttribute('aria-hidden', 'false');
  document.getElementById('mapModal').classList.add('open');

  loadMapUserPins();
  const firstSrc = levels ? (levels[initialLevel] || levels[0]).src : `assets/maps/${zoneId}.jpg`;
  loadMapImage(firstSrc);
}

function clearActivePinLabels() {
  document.querySelectorAll('.map-pin.label-active').forEach(p => p.classList.remove('label-active'));
  clearPinListActive();
}

function clearPinListActive() {
  document.querySelectorAll('.pin-list-item--active')
    .forEach(el => el.classList.remove('pin-list-item--active'));
}

// Mirror a map-pin click in the side list: expand the panel (if collapsed) and
// the pin's section, then highlight + scroll its row into view so the user can
// see which list entry the clicked map pin corresponds to.
function revealPinInList(pin, type) {
  const list = document.getElementById('mapPinList');
  if (!list) return;

  const item = type === 'user'
    ? list.querySelector(`.pin-list-item[data-pin-id="${pin.id}"]`)
    : list.querySelector(`.pin-list-item[data-x="${pin.x}"][data-y="${pin.y}"]`);
  if (!item) return;

  // On mobile the map fills the screen — don't auto-expand the side panel or
  // its sections; just highlight the item so it's ready if the user opens them.
  const isMobile = window.matchMedia('(max-width: 720px)').matches;

  // Expand the collapsed side panel so the highlighted row is actually visible.
  const panel = document.getElementById('mapPinListPanel');
  if (!isMobile && panel && panel.classList.contains('collapsed')) {
    pinPanelManualState = false;
    setPinListCollapsed(false);
    // The panel's width transition (0.22s) shrinks the viewport, so re-centre on
    // this pin afterwards at the current zoom — a full resetMapView would refit
    // the whole map and undo a quest-card link's focus.
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      const vp = document.getElementById('mapModalViewport');
      if (!vp || !mapNaturalW) return;
      mapX = vp.clientWidth  / 2 - (pin.x / 100) * mapNaturalW * mapScale;
      mapY = vp.clientHeight / 2 - (pin.y / 100) * mapNaturalH * mapScale;
      applyMapTransform();
    }, 240);
  }

  // Expand the section (e.g. "Quest Givers") that contains the row.
  const section = item.closest('.pin-list-section');
  if (!isMobile && section && !section.classList.contains('expanded')) {
    section.classList.add('expanded');
    const header = section.querySelector('.pin-list-section-header');
    if (header) header.setAttribute('aria-expanded', 'true');
    if (section.dataset.section) mapPinListExpanded.add(section.dataset.section);
  }

  clearPinListActive();
  item.classList.add('pin-list-item--active');
  item.scrollIntoView({ block: 'nearest' });
}

function closeMapModal() {
  closePinEditDialog();
  clearActivePinLabels();
  document.getElementById('mapModal').classList.remove('open');
  document.getElementById('mapModal').setAttribute('aria-hidden', 'true');
  document.getElementById('mapModalImg').src = '';
}

function initMapModal() {
  const modal = document.getElementById('mapModal');
  const vp    = document.getElementById('mapModalViewport');

  document.getElementById('mapModalClose').addEventListener('click', closeMapModal);
  document.querySelector('.map-modal-backdrop').addEventListener('click', closeMapModal);

  // Zoom buttons
  document.getElementById('mapZoomIn').addEventListener('click', () => {
    mapScale = Math.min(mapScale * 1.3, 6);
    applyMapTransform();
  });
  document.getElementById('mapZoomOut').addEventListener('click', () => {
    mapScale = Math.max(mapScale / 1.3, 0.15);
    applyMapTransform();
  });
  document.getElementById('mapZoomReset').addEventListener('click', resetMapView);

  // Scroll-wheel zoom toward cursor
  vp.addEventListener('wheel', e => {
    e.preventDefault();
    const rect    = vp.getBoundingClientRect();
    const mouseX  = e.clientX - rect.left;
    const mouseY  = e.clientY - rect.top;
    const factor  = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newScale = Math.max(0.15, Math.min(6, mapScale * factor));
    mapX = mouseX - (mouseX - mapX) * (newScale / mapScale);
    mapY = mouseY - (mouseY - mapY) * (newScale / mapScale);
    mapScale = newScale;
    applyMapTransform();
  }, { passive: false });

  // Mouse drag — track start position to detect drag vs click
  vp.addEventListener('mousedown', e => {
    if (e.target.closest('.map-pin-edit-dialog')) return;
    mapDragging = true;
    mapDragStartX = e.clientX - mapX;
    mapDragStartY = e.clientY - mapY;
    mapMouseDownX = e.clientX;
    mapMouseDownY = e.clientY;
    mapWasDragged = false;
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!mapDragging) return;
    mapX = e.clientX - mapDragStartX;
    mapY = e.clientY - mapDragStartY;
    if (Math.abs(e.clientX - mapMouseDownX) > 4 || Math.abs(e.clientY - mapMouseDownY) > 4) {
      mapWasDragged = true;
    }
    applyMapTransform();
  });
  window.addEventListener('mouseup', () => { mapDragging = false; });

  // Coordinate display on mouse move
  vp.addEventListener('mousemove', e => {
    const rect = vp.getBoundingClientRect();
    const coords = getMapCoords(e.clientX - rect.left, e.clientY - rect.top);
    const display = document.getElementById('mapCoordsDisplay');
    if (coords) {
      display.textContent = `${coords.x.toFixed(1)}, ${coords.y.toFixed(1)}`;
      display.style.display = '';
    } else {
      display.style.display = 'none';
    }
  });
  vp.addEventListener('mouseleave', () => {
    document.getElementById('mapCoordsDisplay').style.display = 'none';
  });

  // Click on viewport — place a user pin (ignore drags and clicks on existing pins/dialog)
  vp.addEventListener('click', e => {
    if (mapWasDragged) return;
    if (e.target.closest('.map-pin-edit-dialog')) return;
    if (e.target.closest('.map-pin--user')) return; // handled by pin's own listener
    closePinEditDialog();
    if (e.target.closest('.map-pin--system') || e.target.closest('.map-pin--boss') || e.target.closest('.map-pin--quest')) return;
    clearActivePinLabels();
    const rect = vp.getBoundingClientRect();
    const coords = getMapCoords(e.clientX - rect.left, e.clientY - rect.top);
    if (!coords) return;
    placeUserPin(coords.x, coords.y);
  });

  // Touch drag + pinch-to-zoom
  let lastTouchX = 0, lastTouchY = 0, lastPinchDist = 0;
  vp.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      mapMouseDownX = lastTouchX;
      mapMouseDownY = lastTouchY;
      mapWasDragged = false;
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      lastPinchDist = Math.hypot(dx, dy);
    }
  }, { passive: true });
  vp.addEventListener('touchmove', e => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      mapX += dx;
      mapY += dy;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      if (Math.abs(e.touches[0].clientX - mapMouseDownX) > 4 || Math.abs(e.touches[0].clientY - mapMouseDownY) > 4) {
        mapWasDragged = true;
      }
      applyMapTransform();
      e.preventDefault();
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDist > 0) {
        const factor = dist / lastPinchDist;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const newScale = Math.max(0.15, Math.min(6, mapScale * factor));
        mapX = midX - (midX - mapX) * (newScale / mapScale);
        mapY = midY - (midY - mapY) * (newScale / mapScale);
        mapScale = newScale;
        applyMapTransform();
      }
      lastPinchDist = dist;
      mapWasDragged = true;
      e.preventDefault();
    }
  }, { passive: false });

  // Pin list panel collapse/expand
  document.getElementById('mapPinListToggle').addEventListener('click', togglePinListPanel);

  // Place pin by typed coordinates
  document.getElementById('mapPinPlaceByCoord').addEventListener('click', placeUserPinByInput);
  document.getElementById('mapPinInputX').addEventListener('keydown', e => { if (e.key === 'Enter') placeUserPinByInput(); });
  document.getElementById('mapPinInputY').addEventListener('keydown', e => { if (e.key === 'Enter') placeUserPinByInput(); });

  // Pin edit dialog events
  document.getElementById('mapPinEditClose').addEventListener('click', () => closePinEditDialog());
  document.getElementById('mapPinEditSave').addEventListener('click', () => savePinEdit());
  document.getElementById('mapPinEditDelete').addEventListener('click', () => deleteUserPin());
  document.getElementById('mapPinEditInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') savePinEdit();
    if (e.key === 'Escape') closePinEditDialog();
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (mapEditingPinId) { closePinEditDialog(); return; }
      // preventDefault marks Escape handled so a key guide stacked underneath
      // doesn't also close (its keydown listener runs after this one).
      if (modal.classList.contains('open')) { e.preventDefault(); closeMapModal(); }
    }
  });

  // Responsive resize: re-centre the map and auto-toggle the pin panel
  window.addEventListener('resize', () => {
    if (!document.getElementById('mapModal').classList.contains('open')) return;
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      applyPinListResponsive();
      // Wait for the panel CSS transition (0.22s) before recalculating the map layout
      setTimeout(resetMapView, 240);
    }, 150);
  });

  // Location link delegation (document-level — quest cards rebuild dynamically)
  document.addEventListener('click', e => {
    const link = e.target.closest('.location-link');
    if (link) openMapModal(link.dataset.location);
  });

  // Quest-card NPC name → floating model preview on hover. Delegated because
  // quest cards rebuild dynamically; mirrors the encounter-list hover preview.
  // On mobile Chrome, tapping fires a synthetic mouseover before the click,
  // which would open the floating preview on top of the correct map pin tooltip.
  // We suppress mouseover events that occur within 500ms of a real touch.
  let npcPreviewAnchor = null;
  let lastTouchTime = 0;
  document.addEventListener('touchstart', () => { lastTouchTime = Date.now(); }, { passive: true });
  document.addEventListener('mouseover', e => {
    if (Date.now() - lastTouchTime < 500) return;
    const link = e.target.closest('[data-npc-id]');
    if (!link || link === npcPreviewAnchor) return;
    if (link.closest('.qm-givers')) return;
    npcPreviewAnchor = link;
    const name = link.dataset.pinLabel || link.textContent.trim();
    showNpcModelPreview(link, name, link.dataset.npcId);
  });
  document.addEventListener('mouseout', e => {
    if (Date.now() - lastTouchTime < 500) return;
    const link = e.target.closest('[data-npc-id]');
    if (!link || link !== npcPreviewAnchor) return;
    // Ignore moves that stay inside the same anchor.
    if (e.relatedTarget && link.contains(e.relatedTarget)) return;
    npcPreviewAnchor = null;
    hideNpcModelPreview();
  });

  // Quest-giver name → open the map focused on that NPC/object's pin
  document.addEventListener('click', e => {
    const link = e.target.closest('.map-npc-link');
    if (!link) return;
    e.preventDefault();
    const loc = link.dataset.location;
    const label = link.dataset.pinLabel;
    const found = questPinFor(loc, label);
    openMapModal(loc, { label, levelIndex: found ? found.levelIndex : 0 });
  });

  // Instance map button in dungeon header
  document.addEventListener('click', e => {
    const btn = e.target.closest('.map-instance-btn');
    if (btn) openMapModal(btn.dataset.mapName);
  });

  // Video guide button in dungeon header
  document.addEventListener('click', e => {
    const btn = e.target.closest('.video-guide-btn');
    if (btn) openVideoModal(btn.dataset.videoTitle, btn.dataset.youtubeId);
  });
}

// ═══════════════════════════════════════
//  MAP COORDINATES & PINS
// ═══════════════════════════════════════
function mapPinsStorageKey() {
  return `wow_map_pins::${mapCurrentLocation}::${mapCurrentLevelIndex}`;
}

function loadMapUserPins() {
  mapUserPins = JSON.parse(localStorage.getItem(mapPinsStorageKey()) || '[]');
}

function saveMapUserPins() {
  localStorage.setItem(mapPinsStorageKey(), JSON.stringify(mapUserPins));
}

function getMapCoords(vpX, vpY) {
  if (!mapNaturalW || !mapNaturalH) return null;
  const imgX = (vpX - mapX) / mapScale;
  const imgY = (vpY - mapY) / mapScale;
  if (imgX < 0 || imgX > mapNaturalW || imgY < 0 || imgY > mapNaturalH) return null;
  return {
    x: (imgX / mapNaturalW) * 100,
    y: (imgY / mapNaturalH) * 100,
  };
}

function coordsToViewport(x, y) {
  return {
    vx: mapX + (x / 100) * mapNaturalW * mapScale,
    vy: mapY + (y / 100) * mapNaturalH * mapScale,
  };
}

function renderMapPins() {
  const container = document.getElementById('mapPinContainer');
  if (!container) return;
  container.innerHTML = '';

  // System/predefined pins: hand-curated MAP_PINS plus the auto-generated
  // QUEST_PINS (quest giver locations scraped from the Questie database).
  const zoneId = ZONE_IDS[mapCurrentLocation];
  const resolvePinEntry = source => {
    const entry = source[mapCurrentLocation] || (zoneId && source[zoneId]) || null;
    if (!entry) return [];
    return Array.isArray(entry[0]) ? (entry[mapCurrentLevelIndex] || []) : entry;
  };
  const systemPins = [
    ...resolvePinEntry(MAP_PINS),
    ...(typeof QUEST_PINS !== 'undefined' ? resolvePinEntry(QUEST_PINS) : []),
  ];
  systemPins.forEach(pin => renderSinglePin(container, pin, 'system'));

  // User pins
  mapUserPins.forEach(pin => renderSinglePin(container, pin, 'user'));

  renderPinList(systemPins, mapUserPins);
}

// Pin-list sections, grouped by pin type. Order + display labels:
const PIN_SECTION_META = {
  boss:   'Bosses',
  quest:  'Quest Givers',
  npc:    'NPCs',
  point:  'Points of Interest',
  system: 'Map Pins',
  user:   'My Pins',
};
const PIN_SECTION_ORDER = ['boss', 'quest', 'npc', 'point', 'system', 'user'];

function renderPinList(systemPins, userPins) {
  const list = document.getElementById('mapPinList');
  if (!list) return;
  list.innerHTML = '';

  if (systemPins.length === 0 && userPins.length === 0) {
    list.innerHTML = `<div class="pin-list-empty">No pins yet.<br>Click the map or use<br>the coordinate inputs.</div>`;
    return;
  }

  // Bucket pins into sections keyed by type (user pins are their own section).
  const groups = new Map();
  const push = (key, pin, itemType) => {
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ pin, itemType });
  };
  systemPins.forEach(pin => push(pin.type || 'system', pin, 'system'));
  userPins.forEach(pin => push('user', pin, 'user'));

  // Known types first (in PIN_SECTION_ORDER), any unknown types after.
  const rank = key => {
    const i = PIN_SECTION_ORDER.indexOf(key);
    return i === -1 ? PIN_SECTION_ORDER.length : i;
  };
  [...groups.keys()]
    .sort((a, b) => rank(a) - rank(b))
    .forEach(key => list.appendChild(buildPinListSection(key, groups.get(key))));
}

// A collapsible section of pins of a single type. Collapsed by default; the
// user's expand/collapse choice persists across re-renders via mapPinListExpanded.
function buildPinListSection(sectionType, entries) {
  const expanded = mapPinListExpanded.has(sectionType);

  const section = document.createElement('div');
  section.className = 'pin-list-section' + (expanded ? ' expanded' : '');
  section.dataset.section = sectionType;

  const header = document.createElement('button');
  header.className = 'pin-list-section-header';
  header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  header.innerHTML =
    `<span class="pin-list-section-chevron">›</span>`
    + `<span class="pin-list-icon pin-list-icon--${sectionType}"></span>`
    + `<span class="pin-list-section-title">${PIN_SECTION_META[sectionType] || sectionType}</span>`
    + `<span class="pin-list-section-count">${entries.length}</span>`;

  const body = document.createElement('div');
  body.className = 'pin-list-section-body';
  entries.forEach(({ pin, itemType }) => body.appendChild(buildPinListItem(pin, itemType)));

  header.addEventListener('click', () => {
    const nowExpanded = section.classList.toggle('expanded');
    header.setAttribute('aria-expanded', nowExpanded ? 'true' : 'false');
    if (nowExpanded) mapPinListExpanded.add(sectionType);
    else mapPinListExpanded.delete(sectionType);
  });

  section.appendChild(header);
  section.appendChild(body);
  return section;
}

function buildPinListItem(pin, type) {
  const pinType = pin.type || type;
  const item = document.createElement('div');
  item.className = 'pin-list-item';
  item.dataset.x = pin.x;
  item.dataset.y = pin.y;
  if (type === 'user') item.dataset.pinId = pin.id;

  const iconEl = document.createElement('div');
  iconEl.className = `pin-list-icon pin-list-icon--${pinType}`;

  const info = document.createElement('div');
  info.className = 'pin-list-info';

  // The name is a Wowhead link when the pin carries a URL (scraped givers).
  // Clicking the row focuses the pin; clicking the name opens Wowhead instead.
  let nameEl;
  if (pin.url && pin.label) {
    nameEl = document.createElement('a');
    nameEl.className = 'pin-list-name pin-list-name-link';
    nameEl.href = pin.url;
    nameEl.target = '_blank';
    nameEl.rel = 'noopener noreferrer';
    nameEl.title = 'View on Wowhead';
    nameEl.textContent = pin.label;
    nameEl.addEventListener('click', e => e.stopPropagation());
  } else {
    nameEl = document.createElement('div');
    nameEl.className = 'pin-list-name';
    nameEl.textContent = pin.label || `${pin.x.toFixed(1)}, ${pin.y.toFixed(1)}`;
  }

  const coordEl = document.createElement('div');
  coordEl.className = 'pin-list-coords';
  coordEl.textContent = pin.label ? `${pin.x.toFixed(1)}, ${pin.y.toFixed(1)}` : '';

  info.appendChild(nameEl);
  if (pin.label) info.appendChild(coordEl);

  // Quests this giver serves (grouped by dungeon). System/quest pins only.
  const questGroups = type === 'user' ? [] : pinQuestGroups(pin);
  if (questGroups.length) {
    const total = questGroups.reduce((n, g) => n + g.quests.length, 0);
    const toggle = document.createElement('button');
    toggle.className = 'pin-quest-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML =
      `<span class="pin-quest-toggle-chevron">›</span>`
      + `<span>${total} quest${total === 1 ? '' : 's'}</span>`;
    info.appendChild(toggle);
  }

  item.appendChild(iconEl);
  item.appendChild(info);

  if (type === 'user') {
    const delBtn = document.createElement('button');
    delBtn.className = 'pin-list-delete';
    delBtn.title = 'Delete pin';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      mapUserPins = mapUserPins.filter(p => p.id !== pin.id);
      if (mapEditingPinId === pin.id) closePinEditDialog();
      saveMapUserPins();
      renderMapPins();
    });
    item.appendChild(delBtn);
  }

  item.addEventListener('click', () => navigateToPin(pin, type));

  if (!questGroups.length) return item;

  // Wrap the row with an expandable panel listing the associated quests so the
  // user can see — and jump to — the quest/dungeon each pin belongs to.
  const wrapper = document.createElement('div');
  wrapper.className = 'pin-list-entry';
  wrapper.appendChild(item);
  wrapper.appendChild(buildPinQuestPanel(questGroups));

  const toggle = info.querySelector('.pin-quest-toggle');
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = wrapper.classList.toggle('quests-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  return wrapper;
}

const PIN_QUEST_ROLE_LABEL = { start: 'Start', turnin: 'Turn-in' };

// Build the collapsible panel that lists a pin's quests grouped by dungeon.
// Each quest jumps to its dungeon page and highlights the matching card.
function buildPinQuestPanel(groups) {
  const panel = document.createElement('div');
  panel.className = 'pin-list-quests';

  groups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'pin-quest-group';

    const head = document.createElement('div');
    head.className = 'pin-quest-dungeon';
    head.innerHTML = `<img class="pin-quest-dungeon-icon" src="assets/icons/encounters.png" alt="">`
      + `<span class="pin-quest-dungeon-name">${escapeHtml(group.dungeonName)}</span>`;
    groupEl.appendChild(head);

    group.quests.forEach(q => {
      const link = document.createElement('button');
      link.className = 'pin-quest-link';
      link.title = `Open “${q.questName}” in ${group.dungeonName}`;
      const roleTags = q.roles
        .map(r => `<span class="pin-quest-role pin-quest-role--${r}">${PIN_QUEST_ROLE_LABEL[r] || r}</span>`)
        .join('');
      link.innerHTML = `${roleTags}<span class="pin-quest-name">${escapeHtml(q.questName)}</span>`;
      link.addEventListener('click', e => {
        e.stopPropagation();
        navigateToQuestFromMap(group.dungeonId, q.questName, q.questId);
      });
      groupEl.appendChild(link);
    });

    panel.appendChild(groupEl);
  });

  return panel;
}

function navigateToPin(pin, type) {
  const vp = document.getElementById('mapModalViewport');
  mapX = vp.clientWidth  / 2 - (pin.x / 100) * mapNaturalW * mapScale;
  mapY = vp.clientHeight / 2 - (pin.y / 100) * mapNaturalH * mapScale;
  applyMapTransform();

  // Highlight the pin on the map briefly
  const pinEl = document.querySelector(
    type === 'user'
      ? `.map-pin[data-pin-id="${pin.id}"]`
      : `.map-pin[data-x="${pin.x}"][data-y="${pin.y}"]`
  );
  if (pinEl) {
    pinEl.classList.remove('pin-highlight');
    void pinEl.offsetWidth; // reflow to restart animation
    pinEl.classList.add('pin-highlight');
    pinEl.addEventListener('animationend', () => pinEl.classList.remove('pin-highlight'), { once: true });
    clearActivePinLabels();
    pinEl.classList.add('label-active');
    loadPinThumb(pinEl);
  }

  // Keep the clicked list row highlighted so map and list selection stay in sync.
  const listItem = type === 'user'
    ? document.querySelector(`#mapPinList .pin-list-item[data-pin-id="${pin.id}"]`)
    : document.querySelector(`#mapPinList .pin-list-item[data-x="${pin.x}"][data-y="${pin.y}"]`);
  if (listItem) {
    clearPinListActive();
    listItem.classList.add('pin-list-item--active');
  }

  // Open edit dialog for user pins
  if (type === 'user') openPinEditDialog(pin.id);
}

// Jump from a map-pin quest link to the quest's dungeon and focus its card.
// Clears the incidental view filters that could hide the target (search, the
// completed/incomplete filter, has-gear, the per-dungeon quest filter, the
// location filter) so the card is guaranteed to render; faction/class identity
// filters are left intact.
function navigateToQuestFromMap(dungeonId, questName, questId) {
  closeMapModal();

  if (searchQuery) {
    searchQuery = '';
    const si = document.getElementById('searchInput');
    if (si) si.value = '';
    const sc = document.getElementById('searchClear');
    if (sc) sc.hidden = true;
  }
  if (currentFilter !== 'all') {
    currentFilter = 'all';
    document.querySelectorAll('.filter-btn:not([data-filter="has-gear"])')
      .forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    savePrefs();
  }
  if (hasGearOnly) {
    hasGearOnly = false;
    const gb = document.querySelector('.filter-btn[data-filter="has-gear"]');
    if (gb) gb.classList.remove('active');
    savePrefs();
  }

  // selectDungeon resets dungeonQuestFilter + locationFilter and re-renders.
  if (dungeonId === currentDungeonId) {
    dungeonQuestFilter = null;
    locationFilter = null;
    updateDungeonFilterTrigger();
    renderQuests();
  } else {
    selectDungeon(dungeonId);
  }

  // Wait a frame so the freshly rendered cards have layout before scrolling.
  requestAnimationFrame(() => focusQuestCard(questName, questId));
}

// Scroll a quest card into view and pulse it. Prefers an exact quest-id match
// (same-named series quests) and falls back to the quest name.
function focusQuestCard(questName, questId) {
  const cards = [...document.querySelectorAll('.quest-card')];
  let card = questId != null
    ? cards.find(c => c.dataset.questId === String(questId))
    : null;
  if (!card) card = cards.find(c => c.dataset.questName === questName);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.remove('quest-card-focus');
  void card.offsetWidth; // reflow to restart the animation
  card.classList.add('quest-card-focus');
  card.addEventListener('animationend',
    () => card.classList.remove('quest-card-focus'), { once: true });
}

// Lazy-load a pin's NPC model thumbnail (assets/npc-models/{npcId}.jpg) the
// first time the pin is shown — on hover, tap, or programmatic focus. Drops the
// <img> if the NPC has no captured model so the pop-out falls back to name only.
function loadPinThumb(pinEl) {
  if (!pinEl || pinEl.dataset.thumbLoaded) return;
  const npcId = pinEl.dataset.npcModel;
  if (!npcId) return;
  const thumb = pinEl.querySelector('.map-pin-thumb');
  if (!thumb) return;
  pinEl.dataset.thumbLoaded = '1';
  thumb.onload  = () => { thumb.hidden = false; };
  thumb.onerror = () => { thumb.remove(); };
  thumb.src = `assets/npc-models/${npcId}.jpg`;
}

function renderSinglePin(container, pin, type) {
  const { vx, vy } = coordsToViewport(pin.x, pin.y);
  const pinType = pin.type || type;
  const el = document.createElement('div');
  el.className = `map-pin map-pin--${pinType}`;
  el.style.left = `${vx}px`;
  el.style.top  = `${vy}px`;
  el.dataset.x = pin.x;
  el.dataset.y = pin.y;
  if (type === 'user') el.dataset.pinId = pin.id;

  const coordStr = `${pin.x.toFixed(1)}, ${pin.y.toFixed(1)}`;
  // When a pin carries a Wowhead URL (scraped quest givers), make the name in
  // the pop-out a working link; otherwise show it as plain bold text.
  let labelHtml = '';
  if (pin.label) {
    labelHtml = pin.url
      ? `<a class="map-pin-tooltip-link" href="${escapeHtml(pin.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pin.label)}</a>`
      : `<strong>${escapeHtml(pin.label)}</strong>`;
  }
  const tooltipInner = labelHtml + `<span>${coordStr}</span>`;

  // Quest-giver pins link to a Wowhead NPC; show a thumbnail of its 3D model
  // (assets/npc-models/{npcId}.jpg, captured by scrape_quest_npc_models.py).
  const npcMatch = pin.url ? pin.url.match(/npc=(\d+)/) : null;
  const npcId = npcMatch ? npcMatch[1] : null;
  const thumbHtml = npcId ? '<img class="map-pin-thumb" alt="" hidden>' : '';
  if (npcId) el.dataset.npcModel = npcId;

  el.innerHTML = `
    <div class="map-pin-marker"></div>
    <div class="map-pin-tooltip">${thumbHtml}${tooltipInner}</div>
  `;

  // Clicking the Wowhead link should open it without collapsing the pop-out.
  const tooltipLink = el.querySelector('.map-pin-tooltip-link');
  if (tooltipLink) tooltipLink.addEventListener('click', e => e.stopPropagation());

  // Lazy-load the model thumbnail on first hover/open so opening a map doesn't
  // fire a request for every pin at once. (loadPinThumb is also called when a
  // pin is focused programmatically — quest-card link, pin list — so the image
  // shows immediately without needing a second hover/click.)
  if (npcId) el.addEventListener('mouseenter', () => loadPinThumb(el));

  el.addEventListener('click', e => {
    e.stopPropagation();
    loadPinThumb(el); // touch devices have no hover — load on tap
    const wasActive = el.classList.contains('label-active');
    clearActivePinLabels();
    if (!wasActive) {
      el.classList.add('label-active');
      revealPinInList(pin, type); // highlight the matching row in the side list
    }
    if (type === 'user') openPinEditDialog(pin.id);
  });

  container.appendChild(el);
}

function updatePinPositions() {
  const container = document.getElementById('mapPinContainer');
  if (!container) return;
  container.querySelectorAll('.map-pin').forEach(el => {
    const x = parseFloat(el.dataset.x);
    const y = parseFloat(el.dataset.y);
    if (isNaN(x) || isNaN(y)) return;
    const { vx, vy } = coordsToViewport(x, y);
    el.style.left = `${vx}px`;
    el.style.top  = `${vy}px`;
  });

  // Reposition edit dialog if open
  if (mapEditingPinId) {
    const pin = mapUserPins.find(p => p.id === mapEditingPinId);
    if (pin) repositionPinEditDialog(pin);
  }
}

function placeUserPin(x, y) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const pin = { id, x, y, label: '' };
  mapUserPins.push(pin);
  saveMapUserPins();
  renderMapPins();
  openPinEditDialog(id);
}

function placeUserPinByInput() {
  const xEl = document.getElementById('mapPinInputX');
  const yEl = document.getElementById('mapPinInputY');
  const x = parseFloat(xEl.value);
  const y = parseFloat(yEl.value);

  const xValid = !isNaN(x) && x >= 0 && x <= 100;
  const yValid = !isNaN(y) && y >= 0 && y <= 100;
  xEl.classList.toggle('input-error', !xValid);
  yEl.classList.toggle('input-error', !yValid);
  if (!xValid || !yValid) return;

  xEl.classList.remove('input-error');
  yEl.classList.remove('input-error');
  xEl.value = '';
  yEl.value = '';

  // Pan the map to centre on the new pin
  const vp = document.getElementById('mapModalViewport');
  mapX = vp.clientWidth  / 2 - (x / 100) * mapNaturalW * mapScale;
  mapY = vp.clientHeight / 2 - (y / 100) * mapNaturalH * mapScale;
  applyMapTransform();

  placeUserPin(x, y);
}

function openPinEditDialog(pinId) {
  const pin = mapUserPins.find(p => p.id === pinId);
  if (!pin) return;
  mapEditingPinId = pinId;
  document.getElementById('mapPinEditCoords').textContent = `${pin.x.toFixed(1)}, ${pin.y.toFixed(1)}`;
  document.getElementById('mapPinEditInput').value = pin.label || '';
  const dialog = document.getElementById('mapPinEditDialog');
  dialog.style.display = 'block';
  repositionPinEditDialog(pin);
  document.getElementById('mapPinEditInput').focus();
}

function repositionPinEditDialog(pin) {
  const { vx, vy } = coordsToViewport(pin.x, pin.y);
  const dialog = document.getElementById('mapPinEditDialog');
  const vp = document.getElementById('mapModalViewport');
  const vpW = vp.clientWidth;
  const vpH = vp.clientHeight;
  const dw = dialog.offsetWidth || 210;
  const dh = dialog.offsetHeight || 115;

  let dleft = vx + 18;
  let dtop  = vy - dh - 18;
  if (dleft + dw > vpW - 8) dleft = vx - dw - 18;
  if (dleft < 8) dleft = 8;
  if (dtop < 8) dtop = vy + 20;
  if (dtop + dh > vpH - 8) dtop = vpH - dh - 8;

  dialog.style.left = `${dleft}px`;
  dialog.style.top  = `${dtop}px`;
}

function closePinEditDialog() {
  document.getElementById('mapPinEditDialog').style.display = 'none';
  mapEditingPinId = null;
}

function savePinEdit() {
  const pin = mapUserPins.find(p => p.id === mapEditingPinId);
  if (pin) {
    pin.label = document.getElementById('mapPinEditInput').value.trim();
    saveMapUserPins();
    renderMapPins();
  }
  closePinEditDialog();
}

function deleteUserPin() {
  mapUserPins = mapUserPins.filter(p => p.id !== mapEditingPinId);
  saveMapUserPins();
  renderMapPins();
  closePinEditDialog();
}

function setPinListCollapsed(collapsed) {
  const panel = document.getElementById('mapPinListPanel');
  const btn   = document.getElementById('mapPinListToggle');
  panel.classList.toggle('collapsed', collapsed);
  btn.textContent = collapsed ? '›' : '‹';
  btn.title = collapsed ? 'Expand pin list' : 'Collapse pin list';
}

function togglePinListPanel() {
  const collapsed = !document.getElementById('mapPinListPanel').classList.contains('collapsed');
  pinPanelManualState = collapsed;
  setPinListCollapsed(collapsed);
  // Wait for the panel's CSS width transition (0.22s) before recalculating the map layout
  clearTimeout(resizeDebounceTimer);
  resizeDebounceTimer = setTimeout(resetMapView, 240);
}

function applyPinListDefault() {
  // Respect an explicit toggle the user made this session; otherwise use screen width
  const collapsed = pinPanelManualState !== null
    ? pinPanelManualState
    : window.innerWidth < PIN_PANEL_COLLAPSE_THRESHOLD;
  setPinListCollapsed(collapsed);
}

function applyPinListResponsive() {
  const shouldCollapse = window.innerWidth < PIN_PANEL_COLLAPSE_THRESHOLD;
  const isCollapsed = document.getElementById('mapPinListPanel').classList.contains('collapsed');
  if (shouldCollapse !== isCollapsed) {
    // Window crossed the threshold — override manual preference and re-sync
    pinPanelManualState = null;
    setPinListCollapsed(shouldCollapse);
  }
}

// ═══════════════════════════════════════
//  LOADING SCREEN LIGHTBOX
// ═══════════════════════════════════════
function initLoadingScreenLightbox() {
  const lightbox = document.getElementById('loadingScreenLightbox');

  document.querySelector('.ls-lightbox-backdrop').addEventListener('click', closeLSLightbox);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLSLightbox();
  });

  document.addEventListener('click', e => {
    const screen = e.target.closest('.dungeon-loading-screen');
    const npcThumb = e.target.closest('.qm-req-npc-thumb');
    const npcPreview = e.target.closest('.qm-npc-preview-img');
    const source = screen || npcThumb || npcPreview;
    if (!source) return;
    const img = document.getElementById('loadingScreenLightboxImg');
    img.src = source.src;
    img.alt = source.alt;
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('open');
  });
}

function closeLSLightbox() {
  const lightbox = document.getElementById('loadingScreenLightbox');
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

// ═══════════════════════════════════════
//  ENCOUNTER MODEL MODAL
// ═══════════════════════════════════════
function openEncounterModal(name, npcId) {
  const modal  = document.getElementById('encounterModal');
  const img    = document.getElementById('encounterModalImg');
  const noImg  = document.getElementById('encounterNoImage');

  document.getElementById('encounterModalTitle').textContent = name;
  document.getElementById('encounterModalId').textContent = `ID ${npcId}`;
  document.getElementById('encounterModalWowheadLink').href =
    `https://www.wowhead.com/classic/npc=${npcId}`;

  img.classList.remove('hidden');
  noImg.classList.remove('visible');

  img.onload  = null;
  img.onerror = null;
  img.src = '';

  img.onload = () => { img.classList.remove('hidden'); };
  img.onerror = () => {
    img.classList.add('hidden');
    noImg.classList.add('visible');
  };
  img.src = `assets/npc-models/${npcId}.jpg`;

  renderEncounterInfo(npcId);
  renderEncounterLoot(npcId);

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
}

// Spell school → accent colour, matching the in-game school tints.
const ABILITY_SCHOOL_COLORS = {
  Physical: '#c79c6e', Holy: '#f5e9a0', Fire: '#ff7038', Nature: '#4dd34d',
  Frost: '#6fc6ff', Shadow: '#9a7fd0', Arcane: '#e07fff',
};

// Render the level / classification / health / mana stat bar plus the abilities
// list. Data comes from ENCOUNTER_INFO (js/encounter-data.js), keyed by npcId.
function renderEncounterInfo(npcId) {
  const statbar = document.getElementById('encounterStatbar');
  const abilSection = document.getElementById('encounterAbilities');
  const abilList = document.getElementById('encounterAbilitiesList');

  const info = (typeof ENCOUNTER_INFO !== 'undefined' && ENCOUNTER_INFO[npcId]) || null;

  // ── Stat bar ──
  if (!info) {
    statbar.innerHTML = '';
    statbar.classList.remove('visible');
  } else {
    const chips = [];
    if (info.level) {
      const meta = [info.classification, info.type].filter(Boolean).join(' ');
      chips.push(`
        <div class="encounter-stat encounter-stat-level">
          <span class="encounter-stat-label">Level</span>
          <span class="encounter-stat-value">${info.level}</span>
          ${meta ? `<span class="encounter-stat-sub">${meta}</span>` : ''}
        </div>`);
    }
    if (info.health != null) {
      chips.push(`
        <div class="encounter-stat encounter-stat-health">
          <span class="encounter-stat-label">Health</span>
          <span class="encounter-stat-value">${info.health.toLocaleString()}</span>
        </div>`);
    }
    if (info.mana != null) {
      chips.push(`
        <div class="encounter-stat encounter-stat-mana">
          <span class="encounter-stat-label">Mana</span>
          <span class="encounter-stat-value">${info.mana.toLocaleString()}</span>
        </div>`);
    }
    statbar.innerHTML = chips.join('');
    statbar.classList.toggle('visible', chips.length > 0);
  }

  // ── Abilities ──
  const abilities = (info && info.abilities) || [];
  if (abilities.length === 0) {
    abilSection.classList.remove('visible');
    abilList.innerHTML = '';
    return;
  }

  abilList.innerHTML = abilities.map(a => {
    const color = ABILITY_SCHOOL_COLORS[a.school] || 'var(--gold-light)';
    const schoolTag = a.school
      ? `<span class="encounter-ability-school" style="color:${color}">${a.school}</span>`
      : '';
    return `
    <a href="${a.url}" target="_blank" rel="noopener noreferrer"
       class="encounter-ability" style="--school-color:${color}"
       data-wh-icon-size="medium">
      <span class="encounter-ability-name">${a.name}</span>
      ${schoolTag}
    </a>`;
  }).join('');

  abilSection.classList.add('visible');

  if (typeof $WowheadPower !== 'undefined') $WowheadPower.refreshLinks();
}

function renderEncounterLoot(npcId) {
  const section = document.getElementById('encounterLoot');
  const list = document.getElementById('encounterLootList');

  const loot = (typeof ENCOUNTER_LOOT !== 'undefined' && ENCOUNTER_LOOT[npcId]) || [];
  if (loot.length === 0) {
    list.innerHTML = '<div class="encounter-loot-empty">No notable loot recorded for this encounter.</div>';
    section.classList.add('visible');
    return;
  }

  list.innerHTML = loot.map(item => {
    const qClass = `q${Math.min(item.quality || 1, 5)}`;
    return `
    <div class="encounter-loot-row ${qClass}">
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="item-link ${qClass}" data-wh-icon-size="medium">${item.name}</a>
      <span class="encounter-loot-chance">${item.dropChance != null ? item.dropChance.toFixed(1) + '%' : '—'}</span>
    </div>
  `;
  }).join('');

  section.classList.add('visible');

  if (typeof $WowheadPower !== 'undefined') $WowheadPower.refreshLinks();
}

function closeEncounterModal() {
  const modal = document.getElementById('encounterModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('encounterModalImg').src = '';
}

function initEncounterModal() {
  document.getElementById('encounterModalClose').addEventListener('click', closeEncounterModal);
  document.querySelector('.encounter-modal-backdrop').addEventListener('click', closeEncounterModal);
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('encounterModal');
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      // Mark handled so a key guide stacked underneath doesn't also close.
      e.preventDefault();
      closeEncounterModal();
    }
  });
}

// ═══════════════════════════════════════
//  QUEST DETAIL MODAL
// ═══════════════════════════════════════

// An item-reward link with a wowhead tooltip icon (data-wh-icon-size lets the
// wowhead power script render the item icon + hover tooltip inside the popout).
function questModalItemLink(item) {
  const qClass = `q${Math.min(item.quality || 1, 5)}`;
  const inner = item.url
    ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="item-link qm-reward-item ${qClass}" data-wh-icon-size="medium">${escapeHtml(item.name)}</a>`
    : `<span class="item-link qm-reward-item ${qClass}">${escapeHtml(item.name)}</span>`;
  const qty = (item.quantity || 1) > 1 ? `<span class="item-qty">x${item.quantity}</span>` : '';
  return `<div class="qm-loot-row ${qClass}">${inner}${qty}</div>`;
}

// Start / turn-in giver HTML for the popout — mirrors the quest-card logic so an
// NPC, object, or quest-starting item all resolve to the right link (and map
// link when the giver has a known pin). Returns '' when no giver is recorded.
function questModalGiverHtml(quest, role) {
  if (Array.isArray(quest[role + 'Npcs']) && dedupeGivers(quest[role + 'Npcs']).length > 1) {
    return renderGiverList(quest[role + 'Npcs']);
  }
  const npc = quest[role + 'Npc'], npcLink = quest[role + 'NpcLink'];
  const obj = quest[role + 'Object'], objLink = quest[role + 'ObjectLink'];
  const loc = quest[role + 'Loc'];
  if (npcLink) return buildGiverNameHtml(npc, npcLink, 'npc', loc);
  if (npc) return escapeHtml(npc);
  if (objLink) return buildGiverNameHtml(obj, objLink, 'object', loc);
  if (obj) return escapeHtml(obj);
  if (role === 'start' && quest.startItemLink) {
    return `<a href="${quest.startItemLink}" target="_blank" rel="noopener noreferrer" class="item-link q1" data-wh-icon-size="tiny">${escapeHtml(quest.startItem)}</a>`;
  }
  if (role === 'start' && quest.startItem) return escapeHtml(quest.startItem);
  return '';
}

// Extract { npcId, name, loc } for a giver role — used to render inline
// NPC image and mini-map in the quest modal locations section.
function questModalGiverInfo(quest, role) {
  const npcs = dedupeGivers(quest[role + 'Npcs']);
  if (Array.isArray(npcs) && npcs.length > 0) {
    const g = npcs[0];
    const m = g.link && g.link.match(/npc=(\d+)/);
    return { npcId: m ? m[1] : null, name: g.name, loc: g.loc };
  }
  const npcLink = quest[role + 'NpcLink'];
  const npc = quest[role + 'Npc'];
  const loc = quest[role + 'Loc'];
  if (npcLink) {
    const m = npcLink.match(/npc=(\d+)/);
    return { npcId: m ? m[1] : null, name: npc, loc };
  }
  return { npcId: null, name: npc || null, loc };
}

// Build a small map thumbnail zoomed on a single pin. The image is scaled 3×
// and translated so the pin lands at the center of the container.
function buildMiniMapHtml(location, pinName) {
  if (!location || !pinName) return '';
  const zoneId = ZONE_IDS[location];
  if (!zoneId) return '';
  const pinResult = questPinFor(location, pinName);
  if (!pinResult) return '';
  const pin = pinResult.pin;
  const levels = MULTI_LEVEL_MAPS[location] || MULTI_LEVEL_MAPS[zoneId];
  const mapSrc = levels
    ? ((levels[pinResult.levelIndex] || levels[0]).src)
    : `assets/maps/${zoneId}.jpg`;
  const scale = 2.2;
  const minOff = -((scale - 1) * 100); // image can slide at most this far (e.g. -120%)
  const rawLeft = 50 - scale * pin.x;
  const rawTop  = 50 - scale * pin.y;
  const imgLeft = Math.min(0, Math.max(minOff, rawLeft));
  const imgTop  = Math.min(0, Math.max(minOff, rawTop));
  // Pin marker position within the container (may not be perfectly centered when clamped)
  const pinX = imgLeft + scale * pin.x;
  const pinY = imgTop  + scale * pin.y;
  return `<div class="qm-mini-map map-npc-link" data-location="${escapeHtml(location)}" data-pin-label="${escapeHtml(pinName)}" title="Show on map">`
    + `<img class="qm-mini-map-img" src="${mapSrc}" alt="" style="left:${imgLeft.toFixed(1)}%;top:${imgTop.toFixed(1)}%;width:${scale*100}%;height:${scale*100}%" draggable="false">`
    + `<div class="qm-mini-map-pin" style="left:${pinX.toFixed(1)}%;top:${pinY.toFixed(1)}%"></div>`
    + `</div>`;
}

// Header badges: dungeon objective, series part, faction, class, level.
function buildQuestModalBadges(quest, dungeon) {
  const out = [];
  if (dungeon && dungeon.schema === 2 && quest.isDungeon) {
    out.push(`<div class="chain-badge dungeon-badge">DUNGEON</div>`);
  }
  if (quest.series && quest.series.total > 1) {
    out.push(`<div class="chain-badge series-badge">PART ${quest.series.index}/${quest.series.total}</div>`);
  }
  if (quest.requiredClasses && quest.requiredClasses.length > 0) {
    quest.requiredClasses.forEach(cls => {
      const slug = cls.toLowerCase();
      out.push(`<div class="class-badge class-${slug}"><img class="class-icon" src="assets/icons/classicon_${slug}.jpg" alt="${cls}">${cls}</div>`);
    });
  }
  return out.join('');
}

// Collapse 3+ consecutive <br> down to 2 (max one blank line between paragraphs).
function normalizeQuestText(html) {
  return html ? html.replace(/(<br>){3,}/g, '<br><br>') : html;
}

function buildQuestModalBody(quest, dungeon) {
  // ── Objective + quest flavor text (links already point at wowhead) ──
  const objectiveHtml = quest.objective
    ? `<div class="quest-modal-section qm-objective">
         <div class="quest-modal-section-title"><img class="qm-ico" src="assets/icons/objectives.png" alt=""> Objective</div>
         <div class="qm-objective-text">${normalizeQuestText(quest.objective)}</div>
       </div>`
    : '';

  const descriptionHtml = quest.description
    ? `<div class="quest-modal-section qm-description">
         <div class="quest-modal-section-title"><img class="qm-ico" src="assets/icons/quest_info.png" alt=""> Quest Text</div>
         <div class="qm-description-text">${normalizeQuestText(quest.description)}</div>
       </div>`
    : '';

  // ── Quest requirements (kill/collect objectives from the icon-list) ──
  const reqs = quest.requirements;
  const requirementsHtml = (Array.isArray(reqs) && reqs.length)
    ? `<div class="quest-modal-section qm-requirements">
         <div class="quest-modal-section-title"><img class="qm-ico" src="assets/icons/requirements.png" alt=""> Requirements</div>
         <div class="qm-req-list">
           ${reqs.map(req => {
             const qClass = req.type === 'item' ? ` q${Math.min(req.quality || 1, 5)}` : '';
             const qty = req.quantity > 1 ? `<span class="qm-req-qty"> ×${req.quantity}</span>` : '';
             const npcThumb = req.type === 'npc'
               ? `<img class="qm-req-npc-thumb" src="assets/npc-models/${req.id}.jpg" alt="" onerror="this.hidden=true">`
               : '';
             return `<div class="qm-req-entry">
               ${npcThumb}<a href="${req.url}" target="_blank" rel="noopener noreferrer" class="qm-req-link${qClass}" data-wh-icon-size="medium">${escapeHtml(req.name)}</a>${qty}
             </div>`;
           }).join('')}
         </div>
       </div>`
    : '';

  // ── Start / turn-in givers ──
  const startHtml = questModalGiverHtml(quest, 'start');
  const endHtml   = questModalGiverHtml(quest, 'end');
  const startMulti = Array.isArray(quest.startNpcs) && dedupeGivers(quest.startNpcs).length > 1;
  const endMulti   = Array.isArray(quest.endNpcs) && dedupeGivers(quest.endNpcs).length > 1;
  const startEntity = quest.startNpc || quest.startObject || quest.startItem || '';
  const endEntity   = quest.endNpc || quest.endObject || '';
  const startInfo = questModalGiverInfo(quest, 'start');
  const endInfo   = questModalGiverInfo(quest, 'end');

  const giverRow = (label, html, loc, multi, info) => {
    if (!html) return '';
    const locHtml = (!multi && loc) ? ` <span class="location">— ${buildLocationLink(loc)}</span>` : '';
    let npcImgHtml = '';
    let miniMapHtml = '';
    if (!multi && info) {
      if (info.npcId) {
        npcImgHtml = `<div class="qm-npc-preview"><img class="qm-npc-preview-img" src="assets/npc-models/${info.npcId}.jpg" alt="" onerror="this.closest('.qm-npc-preview').hidden=true"></div>`;
      }
      if (info.name && info.loc) {
        miniMapHtml = buildMiniMapHtml(info.loc, info.name);
      }
    }
    const previewsHtml = (npcImgHtml || miniMapHtml)
      ? `<div class="qm-giver-previews">${npcImgHtml}${miniMapHtml}</div>`
      : '';
    return `<div class="qm-giver-row">
        <span class="qm-giver-label">${label}</span>
        <div class="qm-giver-value">
          <div class="qm-giver-name">${html}${locHtml}</div>
          ${previewsHtml}
        </div>
      </div>`;
  };
  let giverRows;
  if (endEntity && endEntity === startEntity) {
    giverRows = giverRow('Start &amp; Turn in', startHtml, quest.startLoc, startMulti, startInfo);
  } else {
    giverRows = giverRow('Start', startHtml, quest.startLoc, startMulti, startInfo)
              + giverRow('Turn in', endHtml, quest.endLoc, endMulti, endInfo);
  }
  const giversHtml = giverRows
    ? `<div class="quest-modal-section qm-givers">
         <div class="quest-modal-section-title"><img class="qm-ico" src="assets/icons/locations.png" alt=""> Locations</div>
         ${giverRows}
       </div>`
    : '';

  // ── Quick facts ──
  const facts = [];
  if (quest.minLevel) facts.push(['Required Level', String(quest.minLevel)]);
  if (quest.levels)   facts.push(['Recommended Level', String(quest.levels)]);
  if (quest.faction && quest.faction !== 'Both') facts.push(['Faction', `<div class="faction-badge faction-${quest.faction.toLowerCase()}"><img class="faction-badge-icon" src="assets/icons/${quest.faction.toLowerCase()}.png" alt="">${quest.faction}</div>`]);
  facts.push(['Shareable', quest.shareable
    ? '<span class="qm-yes">✓ Yes</span>'
    : '<span class="qm-no">✕ No</span>']);
  const factsHtml = `<div class="quest-modal-section qm-facts">
       <div class="quest-modal-section-title"><img class="qm-ico" src="assets/icons/guides.png" alt=""> Quick Facts</div>
       <div class="qm-facts-grid">
         ${facts.map(([k, v]) => `<div class="qm-fact"><span class="qm-fact-key">${k}</span><span class="qm-fact-val">${v}</span></div>`).join('')}
       </div>
     </div>`;

  // ── Rewards (XP, money, gear, choice) ──
  const rewardItems = quest.rewards.length > 0 ? quest.rewards : quest.legacyItems;
  const pills = [];
  if (quest.xp) pills.push(`<div class="xp-pill"><img class="section-icon" src="assets/icons/experience.png" alt=""> ${quest.xp.toLocaleString()} XP</div>`);
  if (quest.money) pills.push(`<div class="money-pill"><img class="money-icon" src="assets/icons/coin-${moneyTier(quest.money)}.png" alt="">${formatMoney(quest.money)}</div>`);
  const pillsHtml = pills.length ? `<div class="qm-reward-pills">${pills.join('')}</div>` : '';

  const itemsHtml = rewardItems.length
    ? `<div class="qm-reward-group">
         <div class="qm-reward-label">You will receive</div>
         <div class="qm-reward-items">${rewardItems.map(questModalItemLink).join('')}</div>
       </div>`
    : '';
  const choiceHtml = quest.rewardChoices.length
    ? `<div class="qm-reward-group">
         <div class="qm-reward-label">Choose one</div>
         <div class="qm-reward-items qm-reward-choice">${quest.rewardChoices.map(questModalItemLink).join('<div class="qm-choice-or">OR</div>')}</div>
       </div>`
    : '';
  const rewardsHtml = (pillsHtml || itemsHtml || choiceHtml)
    ? `<div class="quest-modal-section qm-rewards">
         <div class="quest-modal-section-title"><img class="qm-ico" src="assets/icons/rewards.png" alt=""> Rewards</div>
         ${pillsHtml}${itemsHtml}${choiceHtml}
       </div>`
    : '';

  return `
    <div class="quest-modal-grid">
      <div class="quest-modal-main">
        ${objectiveHtml}
        ${requirementsHtml}
        ${giversHtml}
        ${descriptionHtml}
      </div>
      <aside class="quest-modal-side">
        ${factsHtml}
        ${rewardsHtml}
      </aside>
    </div>`;
}

// ── Chain navigation ──
// The chain a quest belongs to is whatever scrape_quests.py declared and the
// renderer drew into one ".quest-chain-group" box: a series, a tree, a flow, or a
// gated quest, INCLUDING its preChain prerequisite cards and any cross-series
// quests merged in (absorbedBy). Rather than re-deriving that structure, we read
// the chain straight off the rendered group so navigation always matches exactly
// what the user sees — prerequisites → series → forks, in display order. A
// standalone quest renders as a bare card with no group, so it gets no prev/next.

// Per-dungeon id → full quest lookup (dungeon quests + their preChain prerequisite
// cards + alsoUnlocks forks) so an id read off a chain card resolves to full data.
function dungeonQuestIndex(dungeon) {
  if (dungeon.__questIndex) return dungeon.__questIndex;
  const index = new Map();
  const add = q => { if (q && q.id != null && q.name && !index.has(q.id)) index.set(q.id, normalizeQuest(q)); };
  dungeon.quests.forEach(q => {
    add(q);
    (q.preChain || []).forEach(e => { if (e.or) e.or.forEach(add); else add(e); });
    (q.alsoUnlocks || []).forEach(add);
  });
  dungeon.__questIndex = index;
  return index;
}

// Ordered chain sequence for the quest: the full-data cards inside the rendered
// chain-group box containing it, in display order. Returns [quest] when the quest
// isn't in a chain group (standalone) so the popout shows no navigation.
function buildQuestChainSequence(quest, dungeon, originCard) {
  const card = originCard
    || document.querySelector(`.quest-card[data-quest-id="${quest.id}"]`);
  const group = card && card.closest('.quest-chain-group');
  if (!group) return [normalizeQuest(quest)];

  const index = dungeonQuestIndex(dungeon);
  const seq = [];
  const seen = new Set();
  group.querySelectorAll('.quest-card[data-quest-id]').forEach(c => {
    const id = Number(c.dataset.questId);
    if (seen.has(id)) return;
    seen.add(id);
    const q = index.get(id) || (id === quest.id ? normalizeQuest(quest) : null);
    if (q) seq.push(q);
  });
  return seq.length ? seq : [normalizeQuest(quest)];
}

// Live state for the open popout so prev/next can step through a stable sequence.
let questModalState = { seq: [], index: 0, dungeon: null };

function openQuestModal(rawQuest, dungeon, originCard) {
  const quest = normalizeQuest(rawQuest);
  const seq = buildQuestChainSequence(quest, dungeon, originCard);
  let index = seq.findIndex(q => q.id === quest.id);
  if (index < 0) { seq.unshift(quest); index = 0; }
  questModalState = { seq, index, dungeon };

  renderQuestModalAt(index);

  const modal = document.getElementById('questModal');
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
}

// Render the popout for the sequence entry at `index` (title, badges, body, and
// the prev/next chain navigation footer).
function renderQuestModalAt(index) {
  const { seq, dungeon } = questModalState;
  questModalState.index = index;
  const quest = seq[index];

  document.getElementById('questModalTitle').textContent = quest.name;
  document.getElementById('questModalBadges').innerHTML = buildQuestModalBadges(quest, dungeon);

  const wh = document.getElementById('questModalWowheadLink');
  if (quest.questLink) { wh.href = quest.questLink; wh.style.display = ''; }
  else { wh.style.display = 'none'; }

  document.getElementById('questModalBody').innerHTML = buildQuestModalBody(quest, dungeon);

  // ── Chain navigation footer ──
  const nav = document.getElementById('questModalNav');
  if (seq.length <= 1) {
    nav.hidden = true;
  } else {
    nav.hidden = false;
    const prev = seq[index - 1] || null;
    const next = seq[index + 1] || null;
    const prevBtn = document.getElementById('questModalPrev');
    const nextBtn = document.getElementById('questModalNext');
    prevBtn.disabled = !prev;
    nextBtn.disabled = !next;
    prevBtn.querySelector('.qm-nav-name').textContent = prev ? prev.name : '';
    nextBtn.querySelector('.qm-nav-name').textContent = next ? next.name : '';
    document.getElementById('questModalNavPos').textContent = `${index + 1} / ${seq.length}`;
  }

  // Reset scroll to the top so each quest starts from its objective.
  document.getElementById('questModalBody').scrollTop = 0;

  if (typeof $WowheadPower !== 'undefined') $WowheadPower.refreshLinks();
}

function navigateQuestModal(delta) {
  const i = questModalState.index + delta;
  if (i < 0 || i >= questModalState.seq.length) return;
  renderQuestModalAt(i);
}

function closeQuestModal() {
  const modal = document.getElementById('questModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function initQuestModal() {
  document.getElementById('questModalClose').addEventListener('click', closeQuestModal);
  document.querySelector('.quest-modal-backdrop').addEventListener('click', closeQuestModal);
  document.getElementById('questModalPrev').addEventListener('click', () => navigateQuestModal(-1));
  document.getElementById('questModalNext').addEventListener('click', () => navigateQuestModal(1));
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('questModal');
    if (!modal.classList.contains('open')) return;
    // preventDefault marks Escape handled so a key guide stacked underneath
    // doesn't also close (its keydown listener runs after this one).
    if (e.key === 'Escape') { e.preventDefault(); closeQuestModal(); }
    else if (e.key === 'ArrowLeft') navigateQuestModal(-1);
    else if (e.key === 'ArrowRight') navigateQuestModal(1);
  });
}

// ═══════════════════════════════════════
//  DUNGEON KEY CARD + MODAL
// ═══════════════════════════════════════
// Special "key" items (see js/key-items.js) get a highlighted card pinned above
// the regular quest cards, and a fully bespoke pop-out guide on click.

// Lazy index: questId → { quest (normalized), dungeon } for every quest that
// surfaces as a real card somewhere in DUNGEONS. Lets a {quest=ID} token in a
// key guide open that quest's popout directly — even when the quest lives in a
// different dungeon than the one currently in view.
let _keyQuestIndex = null;
function keyQuestIndex() {
  if (_keyQuestIndex) return _keyQuestIndex;
  const idx = {};
  if (typeof DUNGEONS !== 'undefined') {
    DUNGEONS.forEach(d => {
      getCountableQuests(d).forEach(q => {
        if (!(q.id in idx)) idx[q.id] = { quest: q, dungeon: d };
      });
    });
  }
  _keyQuestIndex = idx;
  return idx;
}

// Level index of a map sub-zone, matched by its MULTI_LEVEL_MAPS label (mirrors
// openMapModal's level lookup). Returns -1 when the location has no levels or
// the label doesn't match, so callers can fall back to the default level.
function mapLevelIndexByLabel(locationName, label) {
  const levels = MULTI_LEVEL_MAPS[locationName] || MULTI_LEVEL_MAPS[ZONE_IDS[locationName]];
  if (!Array.isArray(levels)) return -1;
  return levels.findIndex(l => l.label === label);
}

// Replace {item=ID}/{npc=ID}/{object=ID}/{zone=ID}/{quest=ID} tokens. NPC,
// location (zone) and quest tokens resolve to the app's own pop-outs when we
// have that data locally — an NPC name shows a model preview on hover and opens
// the model popout on click, a location opens its map popout, and a quest opens
// its quest-card popout. Item/object tokens (and any entity we lack locally)
// stay as Wowhead tooltip links. `keyId` (the DUNGEON_KEYS id this text belongs
// to) lets a location open its map focused on a key-specific sub-zone.
//
// A zone token may name a sub-zone inline as {zone=ID#Sub-zone Label}: the link
// then reads as that sub-zone and opens the map on it (overriding the per-key
// default focus), e.g. {zone=796#Armory} renders "Armory" → SM Armory map.
function linkifyKeyText(text, keyId = null) {
  const focusMap = (keyId && typeof KEY_MAP_FOCUS !== 'undefined') ? KEY_MAP_FOCUS[keyId] : null;
  return String(text).replace(/\{(item|npc|object|zone|quest)=(\d+)(?:#([^}]+))?\}/g, (m, type, id, sublabel) => {
    const ent = KEY_ENTITIES[`${type}=${id}`];
    const name = ent ? ent.name : m;
    const url = `https://www.wowhead.com/classic/${type}=${id}${ent && ent.slug ? '/' + ent.slug : ''}`;
    const safe = escapeHtml(name);

    // NPC → hover model preview (shared [data-npc-id] handler) + click opens the
    // model/encounter popout. data-npc-name carries the display name for both.
    if (type === 'npc') {
      return `<span class="key-link key-link-npc" data-npc-id="${id}" data-npc-name="${safe}" title="View ${safe}">${safe}</span>`;
    }

    // Location → open the local map popout via the dedicated key-link-zone click
    // handler. The sub-zone to focus comes from the token (#Label) when given,
    // else the per-key default; an inline sub-zone also becomes the link text.
    // Falls back to Wowhead if we have no map.
    if (type === 'zone') {
      if (ent && ZONE_IDS[ent.name]) {
        const sub = sublabel || (focusMap ? focusMap[`zone=${id}`] : null);
        const subAttr = sub ? ` data-map-sublevel="${escapeHtml(sub)}"` : '';
        const display = sublabel ? escapeHtml(sublabel) : safe;
        return `<span class="key-link key-link-zone" data-location="${escapeHtml(ent.name)}"${subAttr} title="View map">${display}</span>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="key-link key-link-zone">${safe}</a>`;
    }

    // Quest → open the local quest-card popout. Falls back to Wowhead when the
    // quest isn't one we surface as a card (e.g. the Scholomance key chain).
    if (type === 'quest') {
      if (keyQuestIndex()[id]) {
        return `<span class="key-link key-link-quest" data-quest-id="${id}" title="View quest">${safe}</span>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="key-link key-link-quest">${safe}</a>`;
    }

    // Item / object → Wowhead tooltip link (unchanged).
    if (type === 'item') {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="key-link" data-wh-icon-size="tiny">${safe}</a>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="key-link key-link-${type}">${safe}</a>`;
  });
}

function keyItemIconUrl(icon) {
  return `https://wow.zamimg.com/images/wow/icons/large/${icon}.jpg`;
}

function buildDungeonKeyCard(keyId) {
  const key = DUNGEON_KEYS[keyId];
  if (!key) return '';
  const item = key.item;
  const q = `q${Math.min(item.quality || 1, 5)}`;
  const method = KEY_METHODS[key.method] || { label: 'Special Item' };
  return `
    <div class="dungeon-key-card ${q}" role="button" tabindex="0" data-dungeon-key="${keyId}" title="View key guide">
      <div class="dungeon-key-card-glow"></div>
      <div class="dungeon-key-card-icon"><img src="${keyItemIconUrl(item.icon)}" alt="" loading="lazy"></div>
      <div class="dungeon-key-card-main">
        <div class="dungeon-key-card-eyebrow"><img src="assets/icons/key.png" class="dkc-eyebrow-ico" alt=""> Dungeon Key</div>
        <div class="dungeon-key-card-name">${escapeHtml(item.name)}</div>
        <div class="dungeon-key-card-tagline">${linkifyKeyText(key.tagline, keyId)}</div>
      </div>
      <div class="dungeon-key-card-cta">
        <span class="dkc-method">${method.icon ? `<img class="dkc-method-ico" src="assets/icons/${method.icon}" alt="">` : ''}${method.label}</span>
        <span class="dkc-open">View guide ›</span>
      </div>
    </div>`;
}

// Ids of the keys to surface on a dungeon: its own primary key (if any) plus any
// cross-referenced keys (e.g. The Scarlet Key also opens a Stratholme door).
function dungeonKeyIds(dungeonId) {
  const ids = [];
  if (DUNGEON_KEYS[dungeonId]) ids.push(dungeonId);
  (DUNGEON_EXTRA_KEYS[dungeonId] || []).forEach(id => {
    if (DUNGEON_KEYS[id] && !ids.includes(id)) ids.push(id);
  });
  return ids;
}

// Pin the key card(s) to the top of the quest container. Hidden while the view
// is narrowed to a single chain/location, or filtered out by an active search
// that doesn't match the key item's name.
function prependDungeonKeyCard(dungeon, container) {
  if (dungeonQuestFilter || locationFilter) return;
  let ids = dungeonKeyIds(dungeon.id);
  if (searchQuery) {
    const sq = searchQuery.toLowerCase();
    ids = ids.filter(id => DUNGEON_KEYS[id].item.name.toLowerCase().includes(sq));
  }
  if (!ids.length) return;

  container.insertAdjacentHTML('afterbegin', ids.map(buildDungeonKeyCard).join(''));
  container.querySelectorAll('.dungeon-key-card').forEach(cardEl => {
    const id = cardEl.dataset.dungeonKey;
    const open = () => openKeyModal(id);
    cardEl.addEventListener('click', e => { if (e.target.tagName !== 'A') open(); });
    cardEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

function buildKeyModalBody(key, keyId) {
  const unlocksHtml = (key.unlocks && key.unlocks.length)
    ? `<div class="key-section key-unlocks">
         <div class="key-section-title"><img class="key-section-ico" src="assets/icons/unlock.png" alt=""> What it unlocks</div>
         <ul class="key-unlock-list">
           ${key.unlocks.map(u => `<li>${linkifyKeyText(u, keyId)}</li>`).join('')}
         </ul>
       </div>`
    : '';

  const sourceHtml = key.source
    ? `<div class="key-source">${linkifyKeyText(key.source, keyId)}</div>`
    : '';

  const stepsHtml = (key.steps && key.steps.length)
    ? `<div class="key-section key-steps">
         <div class="key-section-title"><img class="key-section-ico" src="assets/icons/stepbystep.png" alt=""> How to get it</div>
         ${sourceHtml}
         <ol class="key-step-list">
           ${key.steps.map(s => `
             <li class="key-step">
               <div class="key-step-content">
                 ${s.title ? `<div class="key-step-title">${linkifyKeyText(s.title, keyId)}</div>` : ''}
                 <div class="key-step-text">${linkifyKeyText(s.text, keyId)}</div>
               </div>
             </li>`).join('')}
         </ol>
       </div>`
    : '';

  const rogueHtml = key.rogueNote
    ? `<div class="key-callout key-callout-rogue">
         <img class="key-callout-ico" src="assets/icons/classicon_rogue.jpg" alt="Rogue">
         <div class="key-callout-text"><strong>Rogue shortcut —</strong> ${linkifyKeyText(key.rogueNote, keyId)}</div>
       </div>`
    : '';

  return unlocksHtml + stepsHtml + rogueHtml;
}

function openKeyModal(dungeonId) {
  const key = DUNGEON_KEYS[dungeonId];
  if (!key) return;
  const item = key.item;
  const q = `q${Math.min(item.quality || 1, 5)}`;
  const url = `https://www.wowhead.com/classic/item=${item.id}/${item.slug}`;
  const method = KEY_METHODS[key.method] || { label: 'Special Item' };

  document.getElementById('keyModalIcon').src = keyItemIconUrl(item.icon);
  const iconLink = document.getElementById('keyModalIconLink');
  iconLink.href = url;
  iconLink.className = `key-modal-icon-wrap ${q}`;

  const titleEl = document.getElementById('keyModalTitle');
  titleEl.textContent = item.name;
  titleEl.className = 'key-modal-title';

  document.getElementById('keyModalTagline').innerHTML = linkifyKeyText(key.tagline, dungeonId);

  document.getElementById('keyModalChips').innerHTML =
    `<span class="key-chip key-chip-method">${method.icon ? `<img class="key-chip-ico" src="assets/icons/${method.icon}" alt="">` : ''}${method.label}</span>`;

  document.getElementById('keyModalBody').innerHTML = buildKeyModalBody(key, dungeonId);

  // Force gold on all key links — Wowhead's universal.css overrides stylesheet !important
  document.querySelectorAll('#keyModal .key-link').forEach(el => {
    el.style.setProperty('color', '#f0d080', 'important');
  });

  const panel = document.querySelector('.key-modal-panel');
  panel.className = `key-modal-panel ${q}`;

  const modal = document.getElementById('keyModal');
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
  document.getElementById('keyModalBody').scrollTop = 0;

  if (typeof $WowheadPower !== 'undefined') $WowheadPower.refreshLinks();
}

function closeKeyModal() {
  const modal = document.getElementById('keyModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function initKeyModal() {
  document.getElementById('keyModalClose').addEventListener('click', closeKeyModal);
  document.querySelector('.key-modal-backdrop').addEventListener('click', closeKeyModal);
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('keyModal');
    // initKeyModal runs after the map/quest/encounter inits, so this listener
    // fires last. If a pop-out stacked on top already handled Escape (it calls
    // preventDefault), yield to it and keep the key guide open underneath.
    if (e.key === 'Escape' && modal.classList.contains('open') && !e.defaultPrevented) closeKeyModal();
  });

  // Key-guide NPC reference → open the model popout (hover preview is handled by
  // the shared [data-npc-id] listener). The key modal stays open underneath (it
  // sits one z-index below — see .key-modal CSS), so closing the model popout
  // returns to the key guide.
  document.addEventListener('click', e => {
    const link = e.target.closest('.key-link-npc');
    if (!link) return;
    hideNpcModelPreview();
    openEncounterModal(link.dataset.npcName, link.dataset.npcId);
  });

  // Key-guide location reference → open that location's map popout on top of the
  // key guide, focused on the configured sub-zone when one is set. Skip the
  // Wowhead-fallback anchor, which carries no location.
  document.addEventListener('click', e => {
    const link = e.target.closest('.key-link-zone');
    if (!link || !link.dataset.location) return;
    const loc = link.dataset.location;
    let focus = null;
    if (link.dataset.mapSublevel) {
      const idx = mapLevelIndexByLabel(loc, link.dataset.mapSublevel);
      if (idx >= 0) focus = { levelIndex: idx };
    }
    openMapModal(loc, focus);
  });

  // Key-guide quest reference → open that quest's card popout on top of the key
  // guide.
  document.addEventListener('click', e => {
    const link = e.target.closest('.key-link-quest');
    if (!link) return;
    const entry = keyQuestIndex()[link.dataset.questId];
    if (!entry) return;
    openQuestModal(entry.quest, entry.dungeon, null);
  });
}

// ═══════════════════════════════════════
//  VIDEO GUIDE MODAL
// ═══════════════════════════════════════
function openVideoModal(title, youtubeId) {
  const modal = document.getElementById('videoModal');
  document.getElementById('videoModalTitle').textContent = title;
  document.getElementById('videoModalYoutubeLink').href = `https://www.youtube.com/watch?v=${youtubeId}`;
  document.getElementById('videoModalIframe').src = `https://www.youtube.com/embed/${youtubeId}`;

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('videoModalIframe').src = '';
}

function initVideoModal() {
  document.getElementById('videoModalClose').addEventListener('click', closeVideoModal);
  document.querySelector('.video-modal-backdrop').addEventListener('click', closeVideoModal);
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('videoModal');
    if (e.key === 'Escape' && modal.classList.contains('open')) closeVideoModal();
  });
}

init();
