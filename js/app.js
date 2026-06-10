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
    prequest:       q.prequest       || '',
    prequestLink:   q.prequestLink   || '',
    chainId:        q.chainId        ?? null,
    chainDepth:     q.chainDepth     ?? 0,
    levels:         q.levels         || '',
    minLevel:       q.minLevel       ?? null,
    faction:        q.faction        || '',
    startItem:      q.startItem      || '',
    startItemLink:  q.startItemLink  || '',
    preChain:       Array.isArray(q.preChain)  ? q.preChain  : [],
    postChain:      Array.isArray(q.postChain) ? q.postChain : [],
    absorbedBy:     q.absorbedBy     ?? null,
  };
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
function init() {
  buildDungeonTabs();
  buildFilterBtns();
  bindControls();
  initSidebarCollapse();
  selectDungeon('rfc');
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
  document.getElementById('dungeonHeaderIcon').textContent = dungeon.icon;
  document.getElementById('dungeonHeaderName').textContent = dungeon.name;

  // Exclude absorbed quests from all header counts — they're shown as chain context
  const quests = dungeon.quests.map(normalizeQuest).filter(q => q.absorbedBy === null);
  const completedCount = quests.filter(q => completed[dungeon.id + '::' + q.name]).length;

  let metaHtml = `
    <span class="dungeon-meta-item">LEVELS<strong>${dungeon.levels}</strong></span>
    <span class="dungeon-meta-item">FACTION<strong>${dungeon.faction}</strong></span>
    <span class="dungeon-meta-item">LOCATION<strong>${dungeon.location}</strong></span>
    <span class="dungeon-meta-item">QUESTS<strong>${quests.length}</strong></span>
  `;
  if (dungeon.guideUrl) {
    metaHtml += `<a href="${dungeon.guideUrl}" target="_blank" rel="noopener noreferrer" class="guide-link">📖 Wowhead Guide</a>`;
  }
  document.getElementById('dungeonHeaderMeta').innerHTML = metaHtml;

  const pct = quests.length ? (completedCount / quests.length * 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressFraction').textContent = `${completedCount} / ${quests.length}`;
  renderStatsBar(dungeon);
}

// ═══════════════════════════════════════
//  STATS BAR
// ═══════════════════════════════════════
function renderStatsBar(dungeon) {
  const quests = dungeon.quests.map(normalizeQuest).filter(q => q.absorbedBy === null);
  const totalXP = quests.reduce((s, q) => s + (q.xp || 0), 0);
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

  // Prequest Chains
  const pqs = quests.filter(q => q.prequest);
  const pqList = document.getElementById('prequestList');
  pqList.innerHTML = '';
  if (pqs.length === 0) {
    pqList.innerHTML = '<div class="sidebar-item" style="font-style:italic;color:var(--text-dim);font-size:0.78rem">None for this dungeon</div>';
  } else {
    pqs.forEach(q => {
      const item = document.createElement('div');
      item.className = 'sidebar-item';
      const link = q.prequestLink
        ? `<a href="${q.prequestLink}" target="_blank" rel="noopener noreferrer" class="prequest-chain-link">${q.prequest}</a>`
        : q.prequest;
      item.innerHTML = `
        <span style="font-size:0.78rem;color:var(--text-main)">${q.name}</span>
        <span style="font-size:0.72rem;color:var(--text-dim);margin-top:2px">req: ${link}</span>
      `;
      item.style.flexDirection = 'column';
      item.style.alignItems = 'flex-start';
      item.style.gap = '2px';
      pqList.appendChild(item);
    });
  }
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
    if (currentFilter === 'has-rewards') return hasGear;
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

  if (searchQuery) {
    const sq = searchQuery.toLowerCase();
    quests = quests.filter(quest =>
      (quest.name || '').toLowerCase().includes(sq) ||
      (quest.startNpc || '').toLowerCase().includes(sq) ||
      (quest.endNpc || '').toLowerCase().includes(sq) ||
      (quest.startLoc || '').toLowerCase().includes(sq) ||
      (quest.endLoc || '').toLowerCase().includes(sq) ||
      quest.rewards.some(r => r.name.toLowerCase().includes(sq)) ||
      quest.rewardChoices.some(r => r.name.toLowerCase().includes(sq)) ||
      quest.legacyItems.some(r => r.name.toLowerCase().includes(sq)) ||
      (quest.notes || '').toLowerCase().includes(sq) ||
      (quest.prequest || '').toLowerCase().includes(sq)
    );
  }

  // Isolated quests (no chain) first, then quest chains
  quests.sort((a, b) => {
    const aIsolated = a.chainId === null ? 0 : 1;
    const bIsolated = b.chainId === null ? 0 : 1;
    return aIsolated - bIsolated;
  });

  document.getElementById('visibleCount').textContent = quests.length;
  container.innerHTML = '';

  if (quests.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📜</div>
        <div class="empty-state-text">NO QUESTS FOUND</div>
        <div style="margin-top:8px;font-size:0.78rem;color:var(--text-dim)">Adjust your search or filters</div>
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

  // ---- Prequest row ----
  const prequestHtml = '';

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

  // ---- Faction badge (quest-level, if different from dungeon) ----
  const showFaction = quest.faction && quest.faction !== 'Both' && quest.faction !== dungeon.faction;
  const factionBadgeHtml = showFaction
    ? `<div class="faction-badge faction-${quest.faction.toLowerCase()}">${quest.faction}</div>`
    : '';

  // ---- NPC / item link helpers ----
  let startNpcHtml;
  if (quest.startNpcLink) {
    startNpcHtml = `<a href="${quest.startNpcLink}" target="_blank" rel="noopener noreferrer" class="npc-link">${quest.startNpc}</a>`;
  } else if (quest.startNpc) {
    startNpcHtml = quest.startNpc;
  } else if (quest.startItemLink) {
    startNpcHtml = `<a href="${quest.startItemLink}" target="_blank" rel="noopener noreferrer" class="item-link q1">${quest.startItem}</a>`;
  } else if (quest.startItem) {
    startNpcHtml = quest.startItem;
  } else {
    startNpcHtml = '—';
  }
  const endNpcHtml = quest.endNpcLink
    ? `<a href="${quest.endNpcLink}" target="_blank" rel="noopener noreferrer" class="npc-link">${quest.endNpc}</a>`
    : (quest.endNpc || '—');

  // ---- Turn-in row ----
  const turninHtml = quest.endNpc && quest.endNpc !== quest.startNpc
    ? `<div class="quest-row">
        <span class="quest-label">Turn in</span>
        <span class="quest-value">${endNpcHtml}${quest.endLoc ? ` <span class="location">— ${quest.endLoc}</span>` : ''}</span>
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
      ${chainBadgeHtml}
      ${factionBadgeHtml}
      ${levelText ? `<div class="quest-level-badge">${levelText}</div>` : ''}
    </div>
    <div class="quest-card-body">
      <div class="quest-row">
        <span class="quest-label">${quest.endNpc && quest.endNpc === quest.startNpc ? 'Start / Turn in' : 'Start'}</span>
        <span class="quest-value">${startNpcHtml}${quest.startLoc ? ` <span class="location">— ${quest.startLoc}</span>` : ''}</span>
      </div>
      ${turninHtml}
      ${prequestHtml}
      ${itemsHtml}
      ${choiceHtml}
      ${notesHtml}
    </div>
    <div class="quest-card-footer">
      ${quest.xp ? `<div class="xp-pill">⭐ ${quest.xp.toLocaleString()} XP</div>` : ''}
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

function buildFilterBtns() {}

function updateDungeonTabsVisibility() {
  document.querySelectorAll('.dungeon-tab').forEach(tab => {
    const dungeon = DUNGEONS.find(d => d.id === tab.dataset.id);
    if (!dungeon) return;
    const compatible = !factionFilter || dungeon.faction === factionFilter || dungeon.faction === 'Both';
    tab.classList.toggle('faction-dimmed', !compatible);
  });

  if (factionFilter) {
    const cur = DUNGEONS.find(d => d.id === currentDungeonId);
    if (cur && cur.faction !== factionFilter && cur.faction !== 'Both') {
      const first = DUNGEONS.find(d => d.faction === factionFilter || d.faction === 'Both');
      if (first) selectDungeon(first.id);
    }
  }
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
    renderQuests();
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

init();
