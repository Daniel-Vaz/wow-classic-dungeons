// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
let currentDungeonId = 'rfc';
let currentFilter = 'all';
let currentView = 'grid';
let searchQuery = '';
let completed = JSON.parse(localStorage.getItem('wow_completed') || '{}');
let locationFilter = null;
let factionFilter = null;
let classFilter = null;

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
    preChain:       Array.isArray(q.preChain)  ? q.preChain  : [],
    postChain:      Array.isArray(q.postChain) ? q.postChain : [],
    absorbedBy:     q.absorbedBy     ?? null,
    money:          q.money          || 0,
    requiredClasses: Array.isArray(q.requiredClasses) ? q.requiredClasses : [],
  };
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

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
function init() {
  buildDungeonTabs();
  updateTabCompletionBadges();
  bindControls();
  initSidebarCollapse();
  initMapModal();
  initLoadingScreenLightbox();
  initEncounterModal();
  initVideoModal();
  selectDungeon('rfc');
}

// ═══════════════════════════════════════
//  COMPLETION HELPERS
// ═══════════════════════════════════════
function isDungeonFullyComplete(dungeon) {
  let quests = dungeon.quests.map(normalizeQuest).filter(q => q.absorbedBy === null);
  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
  }
  if (classFilter) {
    quests = quests.filter(q => q.requiredClasses.length === 0 || q.requiredClasses.includes(classFilter));
  }
  if (quests.length === 0) return false;
  return quests.every(q => completed[dungeon.id + '::' + q.name]);
}

function updateTabCompletionBadges() {
  document.querySelectorAll('.dungeon-tab').forEach(tab => {
    const dungeon = DUNGEONS.find(d => d.id === tab.dataset.id);
    if (!dungeon) return;
    tab.classList.toggle('dungeon-complete', isDungeonFullyComplete(dungeon));
  });
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
    tab.innerHTML = `${d.icon} ${d.abbr}<span class="tab-level">${d.levels}</span>`;
    tab.addEventListener('click', () => selectDungeon(d.id));
    nav.appendChild(tab);
  });
}

// ═══════════════════════════════════════
//  SELECT DUNGEON
// ═══════════════════════════════════════
function selectDungeon(id) {
  currentDungeonId = id;
  locationFilter = null;
  document.querySelectorAll('.dungeon-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.id === id);
  });
  const dungeon = DUNGEONS.find(d => d.id === id);
  if (!dungeon) return;
  renderDungeonHeader(dungeon);
  renderSidebar(dungeon);
  renderQuests();
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
  document.getElementById('dungeonHeaderName').textContent = dungeon.name;

  // Exclude absorbed quests from all header counts — they're shown as chain context
  let quests = dungeon.quests.map(normalizeQuest).filter(q => q.absorbedBy === null);
  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
  }
  if (classFilter) {
    quests = quests.filter(q => q.requiredClasses.length === 0 || q.requiredClasses.includes(classFilter));
  }
  const completedCount = quests.filter(q => completed[dungeon.id + '::' + q.name]).length;

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
        <div class="guides-box-label">🗺 Instance Map</div>
        <div class="guides-box-links">
          <button class="guides-box-link map-instance-btn" data-map-name="${mapName}">View Map</button>
        </div>
      </div>`
    : '';

  const wowheadBoxHtml = (dungeon.guideUrl || strategyEntries.length > 0)
    ? (() => {
        const questLinkHtml = dungeon.guideUrl
          ? `<a href="${dungeon.guideUrl}" target="_blank" rel="noopener noreferrer" class="guides-box-link">📖 Quest Guide</a>`
          : '';
        const strategyLinksHtml = strategyEntries
          .map(e => `<a href="${e.url}" target="_blank" rel="noopener noreferrer" class="guides-box-link">🎯 ${e.label}</a>`)
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
        <div class="guides-box-label"><img src="assets/icons/youtube.svg" class="guides-box-youtube-logo" alt="YouTube"> Video Guides</div>
        <div class="guides-box-links">${videoEntries
          .map(v => `<button class="guides-box-link video-guide-btn" data-youtube-id="${v.youtubeId}" data-video-title="${dungeon.name}${videoEntries.length > 1 ? ' – ' + v.label : ''}">▶ ${v.label}</button>`)
          .join('')}</div>
      </div>`
    : '';

  guidesEl.innerHTML = mapBoxHtml + wowheadBoxHtml + videoBoxHtml;

  const pct = quests.length ? (completedCount / quests.length * 100) : 0;
  const isComplete = quests.length > 0 && completedCount === quests.length;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressBar').classList.toggle('complete', isComplete);
  document.getElementById('progressFraction').textContent = `${completedCount} / ${quests.length}`;
  document.getElementById('progressFraction').classList.toggle('complete', isComplete);
  document.getElementById('dungeonHeader').classList.toggle('all-complete', isComplete);
  renderStatsBar(dungeon);
  updateTabCompletionBadges();
}

// ═══════════════════════════════════════
//  STATS BAR
// ═══════════════════════════════════════
function renderStatsBar(dungeon) {
  let quests = dungeon.quests.map(normalizeQuest).filter(q => q.absorbedBy === null);
  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
  }
  if (classFilter) {
    quests = quests.filter(q => q.requiredClasses.length === 0 || q.requiredClasses.includes(classFilter));
  }
  const totalXP = quests.reduce((s, q) => s + (q.xp || 0), 0);
  const totalMoney = quests.reduce((s, q) => s + (q.money || 0), 0);
  const withGear = quests.filter(q => q.rewards.length > 0 || q.rewardChoices.length > 0 || q.legacyItems.length > 0).length;
  const completedCount = quests.filter(q => completed[dungeon.id + '::' + q.name]).length;

  document.getElementById('statsBar').innerHTML = `
    <div class="stat-item">
      <div class="stat-num">${quests.length}</div>
      <div class="stat-label">Total Quests</div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <div class="stat-num" style="color:#84d4a0">${totalXP.toLocaleString()}</div>
      <div class="stat-label">Total XP</div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <div class="stat-num stat-num--money">${formatMoney(totalMoney)}</div>
      <div class="stat-label">Total Money</div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <div class="stat-num" style="color:#c8a0d4">${withGear}</div>
      <div class="stat-label">Gear Rewards</div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <div class="stat-num" style="color:var(--gold)">${completedCount}</div>
      <div class="stat-label">Completed</div>
    </div>
  `;
}

// ═══════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════
function renderSidebar(dungeon) {
  const quests = dungeon.quests.map(normalizeQuest);

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
      label.innerHTML = `<span class="encounter-skull">⚔</span><span class="encounter-name">${entry.name}</span><span class="encounter-event-badge">Event</span>`;
      wrapper.appendChild(label);

      const bossGroup = document.createElement('div');
      bossGroup.className = 'encounter-event-bosses';

      (entry.bosses || []).forEach(boss => {
        const bossItem = document.createElement('div');
        bossItem.className = 'encounter-item encounter-event-boss has-model';
        bossItem.innerHTML = `<span class="encounter-skull">☠</span><span class="encounter-name">${boss.name}</span>`;
        bossItem.addEventListener('click', () => openEncounterModal(boss.name, boss.npcId));
        bossGroup.appendChild(bossItem);
      });

      wrapper.appendChild(bossGroup);
      list.appendChild(wrapper);
      return;
    }
    const rareBadge = entry.rare ? '<span class="encounter-rare-badge">Rare</span>' : '';
    const icon = entry.rare ? '✧' : (entry.npcId ? '☠' : '⚔');
    const nameHtml = `<span class="encounter-skull">${icon}</span><span class="encounter-name">${entry.name}</span>${rareBadge}`;
    const item = document.createElement('div');
    item.className = 'encounter-item' + (entry.rare ? ' encounter-rare' : '') + (entry.npcId ? ' has-model' : '');
    item.innerHTML = nameHtml;
    if (entry.npcId) {
      item.addEventListener('click', () => openEncounterModal(entry.name, entry.npcId));
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
    const key = dungeon.id + '::' + q.name;
    const isComplete = !!completed[key];
    const hasGear = q.rewards.length > 0 || q.rewardChoices.length > 0 || q.legacyItems.length > 0;
    if (currentFilter === 'has-items') return hasGear;
    if (currentFilter === 'completed') return isComplete;
    if (currentFilter === 'incomplete') return !isComplete;
    return true;
  });

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
    quests = quests.filter(quest =>
      (quest.name || '').toLowerCase().includes(sq) ||
      (quest.startNpc || '').toLowerCase().includes(sq) ||
      (quest.startObject || '').toLowerCase().includes(sq) ||
      (quest.endNpc || '').toLowerCase().includes(sq) ||
      (quest.endObject || '').toLowerCase().includes(sq) ||
      (quest.startLoc || '').toLowerCase().includes(sq) ||
      (quest.endLoc || '').toLowerCase().includes(sq) ||
      quest.rewards.some(r => r.name.toLowerCase().includes(sq)) ||
      quest.rewardChoices.some(r => r.name.toLowerCase().includes(sq)) ||
      quest.legacyItems.some(r => r.name.toLowerCase().includes(sq)) ||
      (quest.notes || '').toLowerCase().includes(sq)
    );
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
        <div class="empty-state-icon">📜</div>
        <div class="empty-state-text">NO QUESTS FOUND</div>
        <div style="margin-top:8px;font-size:0.78rem;color:var(--text-dim)">${emptyMsg}</div>
      </div>`;
    return;
  }

  // Group quests so chain members render together with a wrapper.
  // Absorbed quests (isDungeon prereqs of another dungeon quest) are skipped here
  // and shown instead inside the chain group of their absorber.
  const rendered = new Set();

  quests.forEach(quest => {
    if (rendered.has(quest.id)) return;
    // Skip quests absorbed into another quest's preChain display
    if (quest.absorbedBy !== null) return;

    const cid = quest.chainId;

    if (cid !== null && quest.chainDepth === 0) {
      const chainMembers = quests.filter(q => q.chainId === cid);
      const rootPrechain = quest.preChain || [];
      const rootPostchain = quest.postChain || [];
      const isGroup = chainMembers.length > 1 || rootPrechain.length > 0 || rootPostchain.length > 0;

      if (isGroup) {
        const wrapper = document.createElement('div');
        wrapper.className = 'quest-chain-group';

        const dungeonPartCount = chainMembers.length;
        const label = document.createElement('div');
        label.className = 'chain-group-label';
        label.textContent = dungeonPartCount > 1
          ? `Quest Chain  (${dungeonPartCount} dungeon parts)`
          : 'Quest Chain';
        wrapper.appendChild(label);

        if (rootPrechain.length > 0) {
          wrapper.appendChild(buildPrechainBreadcrumb(rootPrechain));
        }

        chainMembers.forEach((cq, idx) => {
          rendered.add(cq.id);
          const card = buildQuestCard(cq, dungeon, idx, chainMembers.length);
          wrapper.appendChild(card);
        });

        if (rootPostchain.length > 0) {
          wrapper.appendChild(buildPostchainBreadcrumb(rootPostchain));
        }

        container.appendChild(wrapper);
        return;
      }
    }

    if (!rendered.has(quest.id)) {
      rendered.add(quest.id);
      container.appendChild(buildQuestCard(quest, dungeon, null, null));
    }
  });

  if (typeof $WowheadPower !== 'undefined') $WowheadPower.refreshLinks();
}

// ═══════════════════════════════════════
//  PRECHAIN BREADCRUMB
// ═══════════════════════════════════════
function buildPrechainBreadcrumb(preChain) {
  const el = document.createElement('div');
  el.className = 'chain-prechain';
  const label = document.createElement('div');
  label.className = 'chain-context-label';
  label.textContent = 'Prerequisites';
  el.appendChild(label);
  const flow = document.createElement('div');
  flow.className = 'prechain-flow';
  preChain.forEach((s, i) => {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'prechain-arrow';
      arrow.textContent = '›';
      flow.appendChild(arrow);
    }
    const cls = 'prechain-step' + (s.isDungeon ? ' is-dungeon' : '');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = cls;
    a.title = s.isDungeon ? 'Dungeon quest — also in this list' : '';
    a.textContent = s.name;
    flow.appendChild(a);
  });
  const finalArrow = document.createElement('span');
  finalArrow.textContent = '›';
  finalArrow.className = 'prechain-arrow';
  flow.appendChild(finalArrow);
  el.appendChild(flow);
  return el;
}

// ═══════════════════════════════════════
//  POSTCHAIN BREADCRUMB
// ═══════════════════════════════════════
function buildPostchainBreadcrumb(postChain) {
  const el = document.createElement('div');
  el.className = 'chain-postchain';
  const label = document.createElement('div');
  label.className = 'chain-context-label';
  label.textContent = 'Continue chain';
  el.appendChild(label);
  const flow = document.createElement('div');
  flow.className = 'prechain-flow';
  const startArrow = document.createElement('span');
  startArrow.className = 'prechain-arrow';
  startArrow.textContent = '›';
  flow.appendChild(startArrow);
  postChain.forEach((s, i) => {
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
  });
  el.appendChild(flow);
  return el;
}

// ═══════════════════════════════════════
//  BUILD QUEST CARD
// ═══════════════════════════════════════
function buildQuestCard(quest, dungeon, chainPos, chainTotal) {
  const key = dungeon.id + '::' + quest.name;
  const isComplete = !!completed[key];
  const card = document.createElement('div');

  const chainClass = quest.chainId !== null ? ' chain-quest' : '';
  card.className = 'quest-card' + chainClass + (isComplete ? ' completed' : '');

  if (quest.chainId !== null) {
    card.dataset.chainId = quest.chainId;
  }

  // ---- Chain badge ----
  let chainBadgeHtml = '';
  if (chainPos !== null && chainTotal !== null) {
    chainBadgeHtml = `<div class="chain-badge">PART ${chainPos + 1}/${chainTotal}</div>`;
  }

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
    ? `<div class="faction-badge faction-${quest.faction.toLowerCase()}">${quest.faction}</div>`
    : '';

  // ---- Class restriction badge ----
  const classBadgeHtml = quest.requiredClasses && quest.requiredClasses.length > 0
    ? quest.requiredClasses.map(cls => {
        const slug = cls.toLowerCase();
        return `<div class="class-badge class-${slug}"><img class="class-icon" src="https://wow.zamimg.com/images/wow/icons/small/classicon_${slug}.jpg" alt="${cls}">${cls}</div>`;
      }).join('')
    : '';

  // ---- NPC / object / item link helpers ----
  let startNpcHtml;
  if (quest.startNpcLink) {
    startNpcHtml = `<a href="${quest.startNpcLink}" target="_blank" rel="noopener noreferrer" class="npc-link">${quest.startNpc}</a>`;
  } else if (quest.startNpc) {
    startNpcHtml = quest.startNpc;
  } else if (quest.startObjectLink) {
    startNpcHtml = `<a href="${quest.startObjectLink}" target="_blank" rel="noopener noreferrer" class="object-link">${quest.startObject}</a>`;
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
  const endNpcHtml = quest.endNpcLink
    ? `<a href="${quest.endNpcLink}" target="_blank" rel="noopener noreferrer" class="npc-link">${quest.endNpc}</a>`
    : quest.endNpc
      ? quest.endNpc
      : quest.endObjectLink
        ? `<a href="${quest.endObjectLink}" target="_blank" rel="noopener noreferrer" class="object-link">${quest.endObject}</a>`
        : (quest.endObject || '—');

  // ---- Turn-in row ----
  const turninHtml = endEntity && endEntity !== startEntity
    ? `<div class="quest-row">
        <span class="quest-label">Turn in</span>
        <span class="quest-value">${endNpcHtml}${quest.endLoc ? ` <span class="location">— ${buildLocationLink(quest.endLoc)}</span>` : ''}</span>
       </div>`
    : '';

  card.innerHTML = `
    <div class="quest-card-header">
      <div class="quest-checkbox">${isComplete ? '✓' : ''}</div>
      <div class="quest-name">
        ${quest.questLink
          ? `<a href="${quest.questLink}" target="_blank" rel="noopener noreferrer" class="quest-name-link">${quest.name}</a>`
          : quest.name}
      </div>
      <div class="quest-badges">
        ${chainBadgeHtml}${classBadgeHtml}${factionBadgeHtml}${levelText ? `<div class="quest-level-badge">${levelText}</div>` : ''}
      </div>
    </div>
    <div class="quest-card-body">
      <div class="quest-row">
        <span class="quest-label">${endEntity && endEntity === startEntity ? 'Start / Turn in' : 'Start'}</span>
        <span class="quest-value">${startNpcHtml}${quest.startLoc ? ` <span class="location">— ${buildLocationLink(quest.startLoc)}</span>` : ''}</span>
      </div>
      ${turninHtml}
      ${itemsHtml}
      ${choiceHtml}
      ${notesHtml}
    </div>
    <div class="quest-card-footer">
      <div class="footer-pills">
        ${quest.xp ? `<div class="xp-pill">⭐ ${quest.xp.toLocaleString()} XP</div>` : ''}
        ${quest.money ? `<div class="money-pill"><span class="coin-icon coin-${moneyTier(quest.money)}"></span>${formatMoney(quest.money)}</div>` : ''}
      </div>
      <button class="complete-btn" data-key="${key}">${isComplete ? '↩ Undo' : '✓ Complete'}</button>
    </div>
  `;

  // Toggle expand in list view
  card.addEventListener('click', e => {
    if (e.target.classList.contains('complete-btn')) return;
    if (e.target.tagName === 'A') return;
    if (currentView === 'list') card.classList.toggle('expanded');
  });

  // Complete button
  const btn = card.querySelector('.complete-btn');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const wasCompleted = !!completed[key];
    completed[key] = !wasCompleted;
    if (!completed[key]) delete completed[key];

    if (quest.chainId !== null) {
      if (!wasCompleted && quest.chainDepth > 0) {
        // Completing: auto-complete all earlier members in the chain
        dungeon.quests
          .map(normalizeQuest)
          .filter(q => q.chainId === quest.chainId && q.chainDepth < quest.chainDepth)
          .forEach(q => { completed[dungeon.id + '::' + q.name] = true; });
      } else if (wasCompleted) {
        // Undoing: auto-undo all later members in the chain
        dungeon.quests
          .map(normalizeQuest)
          .filter(q => q.chainId === quest.chainId && q.chainDepth > quest.chainDepth)
          .forEach(q => { delete completed[dungeon.id + '::' + q.name]; });
      }
    }

    localStorage.setItem('wow_completed', JSON.stringify(completed));
    renderDungeonHeader(DUNGEONS.find(d => d.id === currentDungeonId));
    renderQuests();
  });

  return card;
}

// ═══════════════════════════════════════
//  ITEM LINK BUILDER
// ═══════════════════════════════════════
function buildItemLink(item) {
  const qClass = `q${Math.min(item.quality || 1, 5)}`;
  if (item.url) {
    return `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="item-link ${qClass}">${item.name}</a>`;
  }
  return `<span class="item-link ${qClass}">${item.name}</span>`;
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

function updateDungeonTabsVisibility() {
  document.querySelectorAll('.dungeon-tab').forEach(tab => {
    const dungeon = DUNGEONS.find(d => d.id === tab.dataset.id);
    if (!dungeon) return;
    const hasQuestsForFaction = !factionFilter || dungeon.quests.some(q => {
      const nq = normalizeQuest(q);
      return !nq.faction || nq.faction === 'Both' || nq.faction === factionFilter;
    });
    tab.classList.toggle('faction-dimmed', !hasQuestsForFaction);
  });
}

function bindControls() {
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    renderQuests();
  });

  document.getElementById('filterGroup').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderQuests();
  });

  document.getElementById('factionGroup').addEventListener('click', e => {
    const btn = e.target.closest('.faction-btn');
    if (!btn) return;
    const f = btn.dataset.faction;
    factionFilter = f === 'all' ? null : f;
    document.querySelectorAll('.faction-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateDungeonTabsVisibility();
    const cur = DUNGEONS.find(d => d.id === currentDungeonId);
    if (cur) renderDungeonHeader(cur);
    renderQuests();
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
      selectedEl.innerHTML = `<img class="class-icon" src="https://wow.zamimg.com/images/wow/icons/small/classicon_${slug}.jpg" alt="">${classFilter}`;
    } else {
      selectedEl.textContent = 'All Classes';
    }
    const cur = DUNGEONS.find(d => d.id === currentDungeonId);
    if (cur) renderDungeonHeader(cur);
    renderQuests();
  });

  document.addEventListener('click', e => {
    if (!classFilterEl.contains(e.target)) {
      classFilterEl.classList.remove('open');
      classFilterTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('gridViewBtn').addEventListener('click', () => {
    currentView = 'grid';
    document.getElementById('gridViewBtn').classList.add('active');
    document.getElementById('listViewBtn').classList.remove('active');
    renderQuests();
  });

  document.getElementById('listViewBtn').addEventListener('click', () => {
    currentView = 'list';
    document.getElementById('listViewBtn').classList.add('active');
    document.getElementById('gridViewBtn').classList.remove('active');
    renderQuests();
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
  };
  img.onerror = () => {
    img.style.display = 'none';
    noImg.classList.add('visible');
  };
  img.src = src;
}

function openMapModal(locationName) {
  const zoneId = ZONE_IDS[locationName];
  if (!zoneId) return;

  mapCurrentLocation = locationName;
  mapCurrentLevelIndex = 0;
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
      btn.className = 'map-level-btn' + (i === 0 ? ' active' : '');
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
  const firstSrc = levels ? levels[0].src : `assets/maps/${zoneId}.jpg`;
  loadMapImage(firstSrc);
}

function clearActivePinLabels() {
  document.querySelectorAll('.map-pin.label-active').forEach(p => p.classList.remove('label-active'));
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

  // Touch drag
  let lastTouchX = 0, lastTouchY = 0;
  vp.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      mapMouseDownX = lastTouchX;
      mapMouseDownY = lastTouchY;
      mapWasDragged = false;
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
      if (modal.classList.contains('open')) closeMapModal();
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

  // System/predefined pins from MAP_PINS constant
  const zoneId = ZONE_IDS[mapCurrentLocation];
  let systemEntry = MAP_PINS[mapCurrentLocation] || (zoneId && MAP_PINS[zoneId]) || null;
  let systemPins = [];
  if (systemEntry) {
    systemPins = Array.isArray(systemEntry[0]) ? (systemEntry[mapCurrentLevelIndex] || []) : systemEntry;
    systemPins.forEach(pin => renderSinglePin(container, pin, 'system'));
  }

  // User pins
  mapUserPins.forEach(pin => renderSinglePin(container, pin, 'user'));

  renderPinList(systemPins, mapUserPins);
}

function renderPinList(systemPins, userPins) {
  const list = document.getElementById('mapPinList');
  if (!list) return;
  list.innerHTML = '';

  if (systemPins.length === 0 && userPins.length === 0) {
    list.innerHTML = `<div class="pin-list-empty">No pins yet.<br>Click the map or use<br>the coordinate inputs.</div>`;
    return;
  }

  if (systemPins.length > 0) {
    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'map-pin-list-section-label';
    sectionLabel.textContent = 'Map Pins';
    list.appendChild(sectionLabel);
    systemPins.forEach(pin => list.appendChild(buildPinListItem(pin, 'system')));
  }

  if (userPins.length > 0) {
    if (systemPins.length > 0) {
      const sectionLabel = document.createElement('div');
      sectionLabel.className = 'map-pin-list-section-label';
      sectionLabel.textContent = 'My Pins';
      list.appendChild(sectionLabel);
    }
    userPins.forEach(pin => list.appendChild(buildPinListItem(pin, 'user')));
  }
}

function buildPinListItem(pin, type) {
  const pinType = pin.type || type;
  const item = document.createElement('div');
  item.className = 'pin-list-item';
  if (type === 'user') item.dataset.pinId = pin.id;

  const iconEl = document.createElement('div');
  iconEl.className = `pin-list-icon pin-list-icon--${pinType}`;

  const info = document.createElement('div');
  info.className = 'pin-list-info';

  const nameEl = document.createElement('div');
  nameEl.className = 'pin-list-name';
  nameEl.textContent = pin.label || `${pin.x.toFixed(1)}, ${pin.y.toFixed(1)}`;

  const coordEl = document.createElement('div');
  coordEl.className = 'pin-list-coords';
  coordEl.textContent = pin.label ? `${pin.x.toFixed(1)}, ${pin.y.toFixed(1)}` : '';

  info.appendChild(nameEl);
  if (pin.label) info.appendChild(coordEl);
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
  return item;
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
      : `.map-pin--system[data-x="${pin.x}"]`
  );
  if (pinEl) {
    pinEl.classList.remove('pin-highlight');
    void pinEl.offsetWidth; // reflow to restart animation
    pinEl.classList.add('pin-highlight');
    pinEl.addEventListener('animationend', () => pinEl.classList.remove('pin-highlight'), { once: true });
    clearActivePinLabels();
    pinEl.classList.add('label-active');
  }

  // Open edit dialog for user pins
  if (type === 'user') openPinEditDialog(pin.id);
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
  const tooltipInner = pin.label
    ? `<strong>${pin.label}</strong><span>${coordStr}</span>`
    : `<span>${coordStr}</span>`;

  el.innerHTML = `
    <div class="map-pin-marker"></div>
    <div class="map-pin-tooltip">${tooltipInner}</div>
  `;

  el.addEventListener('click', e => {
    e.stopPropagation();
    const wasActive = el.classList.contains('label-active');
    clearActivePinLabels();
    if (!wasActive) el.classList.add('label-active');
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
    if (!screen) return;
    const img = document.getElementById('loadingScreenLightboxImg');
    img.src = screen.src;
    img.alt = screen.alt;
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

  renderEncounterLoot(npcId);

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
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
    if (e.key === 'Escape' && modal.classList.contains('open')) closeEncounterModal();
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
