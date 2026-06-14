// ═══════════════════════════════════════
//  BOSS ENCOUNTERS
//  Each entry: { name, npcId } | { name, npcId, rare: true } | { section } | { name, npcId: null } for events
// ═══════════════════════════════════════
const BOSS_ENCOUNTERS = {
  rfc: [
    { name: 'Oggleflint', npcId: 11517 },
    { name: 'Taragaman the Hungerer', npcId: 11520 },
    { name: 'Jergosh the Invoker', npcId: 11518 },
    { name: 'Bazzalan', npcId: 11519 },
  ],
  wc: [
    { name: 'Kresh', npcId: 3653 },
    { name: 'Skum', npcId: 3674 },
    { name: 'Deviate Faerie Dragon', npcId: 5912, rare: true },
    { name: 'Lady Anacondra', npcId: 3671 },
    { name: 'Lord Cobrahn', npcId: 3669 },
    { name: 'Lord Pythas', npcId: 3670 },
    { name: 'Lord Serpentis', npcId: 3673 },
    { name: 'Verdan the Everliving', npcId: 5775 },
    { name: 'Mutanus the Devourer', npcId: 3654 },
  ],
  deadmines: [
    { name: "Rhahk'Zor", npcId: 644 },
    { name: 'Miner Johnson', npcId: 3586, rare: true },
    { name: "Sneed's Shredder", npcId: 643 },
    { name: 'Gilnid', npcId: 1763 },
    { name: 'Mr. Smite', npcId: 646 },
    { name: 'Captain Greenskin', npcId: 647 },
    { name: 'Cookie', npcId: 645 },
    { name: 'Edwin VanCleef', npcId: 639 },
  ],
  sfk: [
    { name: 'Rethilgore', npcId: 3914 },
    { name: 'Razorclaw the Butcher', npcId: 3886 },
    { name: 'Baron Silverlaine', npcId: 3887 },
    { name: 'Commander Springvale', npcId: 4278 },
    { name: 'Odo the Blindwatcher', npcId: 4279 },
    { name: 'Deathsworn Captain', npcId: 3872, rare: true },
    { name: 'Fenrus the Devourer', npcId: 4274 },
    { name: 'Wolf Master Nandos', npcId: 3927 },
    { name: 'Archmage Arugal', npcId: 4275 },
  ],
  stockades: [
    { name: 'Targorr the Dread', npcId: 1696 },
    { name: 'Kam Deepfury', npcId: 1666 },
    { name: 'Hamhock', npcId: 1717 },
    { name: 'Bazil Thredd', npcId: 1716 },
    { name: 'Dextren Ward', npcId: 1663 },
    { name: 'Bruegal Ironknuckle', npcId: 1720, rare: true },
  ],
  bfd: [
    { name: 'Ghamoo-Ra', npcId: 4887 },
    { name: 'Lady Sarevess', npcId: 4831 },
    { name: 'Gelihast', npcId: 6243 },
    { name: 'Lorgus Jett', npcId: 12902 },
    { name: 'Twilight Lord Kelris', npcId: 4832 },
    { name: "Old Serra'kis", npcId: 4830 },
    { name: "Aku'mai", npcId: 4829 },
    { section: 'Horde Only' },
    { name: 'Baron Aquanis', npcId: 12876 },
  ],
  gnomer: [
    { name: 'Grubbis', npcId: 7361 },
    { name: 'Viscous Fallout', npcId: 7079 },
    { name: 'Electrocutioner 6000', npcId: 6235 },
    { name: 'Crowd Pummeler 9-60', npcId: 6229 },
    { name: 'Dark Iron Ambassador', npcId: 6228, rare: true },
    { name: 'Mekgineer Thermaplugg', npcId: 7800 },
  ],
  rfk: [
    { name: 'Roogug', npcId: 6168 },
    { name: 'Aggem Thorncurse', npcId: 4424 },
    { name: 'Death Speaker Jargba', npcId: 4428 },
    { name: 'Overlord Ramtusk', npcId: 4420 },
    { name: 'Agathelos the Raging', npcId: 4422 },
    { name: 'Earthcaller Halmgar', npcId: 4842, rare: true },
    { name: 'Blind Hunter', npcId: 4425, rare: true },
    { name: 'Charlga Razorflank', npcId: 4421 },
  ],
  sm: [
    { section: 'Graveyard' },
    { name: 'Interrogator Vishas', npcId: 3983 },
    { name: 'Bloodmage Thalnos', npcId: 4543 },
    { name: 'Azshir the Sleepless', npcId: 6490, rare: true },
    { name: 'Fallen Champion', npcId: 6488, rare: true },
    { name: 'Ironspine', npcId: 6489, rare: true },
    { section: 'Library' },
    { name: 'Houndmaster Loksey', npcId: 3974 },
    { name: 'Arcanist Doan', npcId: 6487 },
    { section: 'Armory' },
    { name: 'Herod', npcId: 3975 },
    { section: 'Cathedral' },
    { name: 'Scarlet Commander Mograine', npcId: 3976 },
    { name: 'High Inquisitor Whitemane', npcId: 3977 },
    { name: 'High Inquisitor Fairbanks', npcId: 4542 },
  ],
  rfd: [
    { name: "Tuten'kash", npcId: 7355 },
    { name: 'Ragglesnout', npcId: 7354, rare: true },
    { name: 'Mordresh Fire Eye', npcId: 7357 },
    { name: 'Glutton', npcId: 8567 },
    { name: 'Plaguemaw the Rotting', npcId: 7356 },
    { name: 'Amnennar the Coldbringer', npcId: 7358 },
  ],
  uldaman: [
    { name: 'Revelosh', npcId: 6910 },
    { name: 'Ironaya', npcId: 7228 },
    { name: 'Obsidian Sentinel', npcId: 7023 },
    { name: 'Ancient Stone Keeper', npcId: 7206 },
    { name: 'Galgann Firehammer', npcId: 7291 },
    { name: 'Grimlok', npcId: 4854 },
    { name: 'Archaedas', npcId: 2748 },
    { section: 'Horde Only' },
    { name: 'Baelog', npcId: 6906 },
    { name: 'Eric the Swift', npcId: 6907 },
    { name: 'Olaf', npcId: 6908 },
  ],
  zf: [
    { name: "Antu'sul", npcId: 8127 },
    { name: 'Theka the Martyr', npcId: 7272 },
    { name: 'Sandarr Dunereaver', npcId: 10080, rare: true },
    { name: 'Sandfury Executioner', npcId: 7274 },
    { name: 'Zerillis', npcId: 10082, rare: true },
    { name: 'Dustwraith', npcId: 10081, rare: true },
    { name: "Witch Doctor Zum'rah", npcId: 7271 },
    { name: 'Nekrum Gutchewer', npcId: 7796 },
    { name: "Shadowpriest Sezz'ziz", npcId: 7275 },
    { name: 'Sergeant Bly', npcId: 7604 },
    { name: 'Hydromancer Velratha', npcId: 7795 },
    { name: "Gahz'rilla", npcId: 7273 },
    { name: 'Chief Ukorz Sandscalp', npcId: 7267 },
    { name: 'Ruuzlu', npcId: 7797 },
  ],
  mara: [
    { name: 'Noxxion', npcId: 13282 },
    { name: 'Razorlash', npcId: 12258 },
    { name: 'Lord Vyletongue', npcId: 12236 },
    { name: 'Celebras the Cursed', npcId: 12225 },
    { name: 'Meshlok the Harvester', npcId: 12237, rare: true },
    { name: 'Tinkerer Gizlock', npcId: 13601 },
    { name: 'Landslide', npcId: 12203 },
    { name: 'Rotgrip', npcId: 13596 },
    { name: 'Princess Theradras', npcId: 12201 },
  ],
  st: [
    { name: "Atal'alarion", npcId: 8580 },
    { name: 'Zolo', npcId: 5712 },
    { name: 'Loro', npcId: 5714 },
    { name: 'Hukku', npcId: 5715 },
    { name: 'Zullor', npcId: 5716 },
    { name: 'Mijan', npcId: 5717 },
    { name: 'Dreamscythe', npcId: 5721 },
    { name: 'Weaver', npcId: 5720 },
    { name: 'Hazzas', npcId: 5722 },
    { name: 'Morphaz', npcId: 5719 },
    { name: "Jammal'an the Prophet", npcId: 5710 },
    { name: 'Ogom the Wretched', npcId: 5711 },
    { name: 'Avatar of Hakkar', npcId: 8443 },
    { name: 'Shade of Eranikus', npcId: 5709 },
  ],
  brd: [
    { name: 'High Interrogator Gerstahn', npcId: 9018 },
    { name: 'Houndmaster Grebmar', npcId: 9319 },
    { name: 'Lord Roccor', npcId: 9025 },
    { name: 'Ring of Law', npcId: null },
    { name: 'The Vault (Dark Keepers)', npcId: null },
    { name: 'Lord Incendius', npcId: 9017 },
    { name: 'Warder Stilgiss', npcId: 9041 },
    { name: 'Verek', npcId: 9042 },
    { name: 'Watchman Doomgrip', npcId: 9476 },
    { name: 'Fineous Darkvire', npcId: 9056 },
    { name: "Bael'Gar", npcId: 9016 },
    { name: 'General Angerforge', npcId: 9033 },
    { name: 'Golem Lord Argelmach', npcId: 8983 },
    { name: 'Hurley Blackbreath', npcId: 9537 },
    { name: 'Phalanx', npcId: 9502 },
    { name: 'Plugger Spazzring', npcId: 9499 },
    { name: 'Ribbly Screwspigot', npcId: 9543 },
    { name: 'Ambassador Flamelash', npcId: 9156 },
    { name: 'Panzor the Invincible', npcId: 8923, rare: true },
    { name: 'The Seven', npcId: null },
    { name: 'Magmus', npcId: 9938 },
    { name: 'Princess Moira Bronzebeard', npcId: 8929 },
    { name: 'Emperor Dagran Thaurissan', npcId: 9019 },
  ],
  lbrs: [
    { name: 'Burning Felguard', npcId: 10263, rare: true },
    { name: 'Highlord Omokk', npcId: 9196 },
    { name: 'Spirestone Battle Lord', npcId: 9218, rare: true },
    { name: 'Spirestone Lord Magus', npcId: 9217, rare: true },
    { name: "Shadow Hunter Vosh'gajin", npcId: 9236 },
    { name: 'War Master Voone', npcId: 9237 },
    { name: 'Bannok Grimaxe', npcId: 9596, rare: true },
    { name: 'Mother Smolderweb', npcId: 10596 },
    { name: 'Crystal Fang', npcId: 10376, rare: true },
    { name: 'Urok Doomhowl', npcId: 10584 },
    { name: 'Quartermaster Zigris', npcId: 9736 },
    { name: 'Halycon', npcId: 10220 },
    { name: 'Gizrul the Slavener', npcId: 10268 },
    { name: 'Ghok Bashguud', npcId: 9718, rare: true },
    { name: 'Spirestone Butcher', npcId: 9219, rare: true },
    { name: 'Overlord Wyrmthalak', npcId: 9568 },
  ],
  ubrs: [
    { name: 'Pyroguard Emberseer', npcId: 9816 },
    { name: 'Solakar Flamewreath', npcId: 10264 },
    { name: 'Goraluk Anvilcrack', npcId: 10899 },
    { name: 'Jed Runewatcher', npcId: 10509, rare: true },
    { name: 'Gyth', npcId: 10339 },
    { name: 'Warchief Rend Blackhand', npcId: 10429 },
    { name: 'The Beast', npcId: 10430 },
    { name: 'General Drakkisath', npcId: 10363 },
  ],
  dm: [
    { section: 'East' },
    { name: 'Zevrim Thornhoof', npcId: 11490 },
    { name: 'Hydrospawn', npcId: 13280 },
    { name: 'Lethtendris', npcId: 14327 },
    { name: 'Alzzin the Wildshaper', npcId: 11492 },
    { section: 'West' },
    { name: 'Tendris Warpwood', npcId: 11489 },
    { name: 'Tsuzee', npcId: 11467 },
    { name: 'Illyanna Ravenoak', npcId: 11488 },
    { name: 'Magister Kalendris', npcId: 11487 },
    { name: "Immol'thar", npcId: 11496 },
    { name: 'Lord Helnurath', npcId: 14506 },
    { name: 'Prince Tortheldrin', npcId: 11486 },
    { section: 'North' },
    { name: "Guard Mol'dar", npcId: 14326 },
    { name: 'Stomper Kreeg', npcId: 14322 },
    { name: 'Guard Fengus', npcId: 14321 },
    { name: "Guard Slip'kik", npcId: 14323 },
    { name: 'Captain Kromcrush', npcId: 14325 },
    { name: "Cho'Rush the Observer", npcId: 14324 },
    { name: 'King Gordok', npcId: 11501 },
  ],
  scholo: [
    { name: 'Blood Steward of Kirtonos', npcId: 14861 },
    { name: 'Kirtonos the Herald', npcId: 10506 },
    { name: 'Jandice Barov', npcId: 10503 },
    { name: 'Rattlegore', npcId: 11622 },
    { name: 'Death Knight Darkreaver', npcId: 14516 },
    { name: 'Marduk Blackpool', npcId: 10433 },
    { name: 'Vectus', npcId: 10432 },
    { name: 'Ras Frostwhisper', npcId: 10508 },
    { name: 'Doctor Theolen Krastinov', npcId: 11261 },
    { name: 'Lorekeeper Polkelt', npcId: 10901 },
    { name: 'Instructor Malicia', npcId: 10505 },
    { name: 'Lady Illucia Barov', npcId: 10502 },
    { name: 'The Ravenian', npcId: 10507 },
    { name: 'Darkmaster Gandling', npcId: 1853 },
  ],
  strath: [
    { section: 'Live Side' },
    { name: 'Stratholme Courier', npcId: 11082 },
    { name: 'Hearthsinger Forresten', npcId: 10558 },
    { name: 'Skul', npcId: 10393 },
    { name: 'Postmaster Malown', npcId: 11143 },
    { name: 'The Unforgiven', npcId: 10516 },
    { name: 'Timmy the Cruel', npcId: 10808 },
    { name: 'Archivist Galford', npcId: 10811 },
    { name: 'Malor the Zealous', npcId: 11032 },
    { name: 'Cannon Master Willey', npcId: 10997 },
    { name: 'Grand Crusader Dathrohan', npcId: 10812 },
    { section: 'Undead Side' },
    { name: 'Stonespine', npcId: 10809, rare: true },
    { name: "Nerub'enkan", npcId: 10437 },
    { name: 'Maleki the Pallid', npcId: 10438 },
    { name: 'Baroness Anastari', npcId: 10436 },
    { name: 'Magistrate Barthilas', npcId: 10435 },
    { name: 'Ramstein the Gorger', npcId: 10439 },
    { name: 'Baron Rivendare', npcId: 10440 },
  ],
};

// ═══════════════════════════════════════
//  WOWHEAD STRATEGY GUIDE URLS
// ═══════════════════════════════════════
const STRATEGY_URLS = {
  rfc:       [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic' }],
  wc:        [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic' }],
  deadmines: [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic' }],
  sfk:       [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic' }],
  stockades: [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/the-stockade-dungeon-strategy-wow-classic' }],
  bfd:       [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/blackfathom-deeps-dungeon-strategy-wow-classic' }],
  gnomer:    [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/gnomeregan-dungeon-strategy-wow-classic' }],
  rfk:       [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/razorfen-kraul-dungeon-strategy-wow-classic' }],
  sm:        [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/scarlet-monastery-dungeon-strategy-wow-classic' }],
  rfd:       [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/razorfen-downs-dungeon-strategy-wow-classic' }],
  uldaman:   [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/uldaman-dungeon-strategy-wow-classic' }],
  zf:        [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/zulfarrak-dungeon-strategy-wow-classic' }],
  mara:      [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/maraudon-dungeon-strategy-wow-classic' }],
  st:        [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/temple-of-atalhakkar-sunken-temple-dungeon-strategy-wow-classic' }],
  brd:       [
    { label: 'Detention Block',  url: 'https://www.wowhead.com/classic/guide/blackrock-depths-detention-block-dungeon-strategy-wow-classic' },
    { label: 'Shadowforge City', url: 'https://www.wowhead.com/classic/guide/blackrock-depths-shadowforge-city-dungeon-strategy-wow-classic' },
  ],
  lbrs:      [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/lower-blackrock-spire-lbrs-dungeon-strategy-wow-classic' }],
  ubrs:      [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/upper-blackrock-spire-ubrs-dungeon-strategy-wow-classic' }],
  dm:        [
    { label: 'East Wing',  url: 'https://www.wowhead.com/classic/guide/dire-maul-east-dungeon-strategy-wow-classic' },
    { label: 'West Wing',  url: 'https://www.wowhead.com/classic/guide/dire-maul-west-dungeon-strategy-wow-classic' },
    { label: 'North Wing', url: 'https://www.wowhead.com/classic/guide/dire-maul-north-dungeon-strategy-wow-classic' },
  ],
  scholo:    [{ label: 'Strategy Guide', url: 'https://www.wowhead.com/classic/guide/scholomance-dungeon-strategy-wow-classic' }],
  strath:    [
    { label: 'Live Side',   url: 'https://www.wowhead.com/classic/guide/stratholme-live-dungeon-strategy-wow-classic' },
    { label: 'Undead Side', url: 'https://www.wowhead.com/classic/guide/stratholme-undead-dungeon-strategy-wow-classic' },
  ],
};

// ═══════════════════════════════════════
//  ZONE MAP IDS  (Wowhead area table IDs)
// ═══════════════════════════════════════
const ZONE_IDS = {
  // Capital cities
  'Orgrimmar': 1637, 'Thunder Bluff': 1638, 'Undercity': 1497,
  'Darnassus': 1657, 'Ironforge': 1537, 'Stormwind City': 1519,
  // Kalimdor
  'Durotar': 1411, 'The Barrens': 17, 'Mulgore': 215,
  'Darkshore': 148, 'Ashenvale': 331, 'Stonetalon Mountains': 406,
  'Desolace': 405, 'Feralas': 357, 'Dustwallow Marsh': 15,
  'Thousand Needles': 400, 'Tanaris': 440, "Un'Goro Crater": 490,
  'Azshara': 16, 'Felwood': 361, 'Winterspring': 618,
  'Moonglade': 493, 'Silithus': 1377,
  // Eastern Kingdoms
  'Dun Morogh': 1, 'Loch Modan': 38, 'Wetlands': 11,
  'Arathi Highlands': 45, 'The Hinterlands': 47,
  'Western Plaguelands': 28, 'Eastern Plaguelands': 139,
  'Tirisfal Glades': 85, 'Silverpine Forest': 130,
  'Hillsbrad Foothills': 267, 'Alterac Mountains': 36,
  'Elwynn Forest': 12, 'Westfall': 40, 'Redridge Mountains': 44,
  'Duskwood': 10, 'Stranglethorn Vale': 33, 'Swamp of Sorrows': 8,
  'Badlands': 3, 'Searing Gorge': 51, 'Burning Steppes': 46,
  'Blasted Lands': 4,
  // Dungeons – Kalimdor
  'Ragefire Chasm': 2437, 'Wailing Caverns': 718,
  'Blackfathom Deeps': 719, 'Razorfen Kraul': 1462,
  'Razorfen Downs': 1463, "Zul'Farrak": 1176,
  'Maraudon': 2100, "The Temple of Atal'Hakkar": 1477,
  'Dire Maul': 2557,
  // Dungeons – Eastern Kingdoms
  'The Deadmines': 1581, 'Shadowfang Keep': 209,
  'The Stockade': 717, 'Gnomeregan': 721,
  'Scarlet Monastery': 796, 'Uldaman': 1337,
  'Blackrock Depths': 1584, 'Blackrock Spire': 1583,
  'Blackrock Mountain': 1265, 'Scholomance': 2057,
  'Stratholme': 2017,
};

function buildLocationLink(name) {
  if (!name) return '';
  if (!ZONE_IDS[name]) return name;
  return `<span class="location-link" data-location="${name}" title="View map">${name}</span>`;
}

// ═══════════════════════════════════════
//  MULTI-LEVEL MAPS
// ═══════════════════════════════════════
const MULTI_LEVEL_MAPS = {
  1583: [
    { label: 'Level 1',          src: 'assets/maps/1583_1.jpg' },
    { label: 'Level 2',          src: 'assets/maps/1583_2.jpg' },
    { label: 'Level 3',          src: 'assets/maps/1583_3.jpg' },
    { label: 'Level 4',          src: 'assets/maps/1583_4.jpg' },
    { label: 'Level 5 (Part 1)', src: 'assets/maps/1583_5a.jpg' },
    { label: 'Level 5 (Part 2)', src: 'assets/maps/1583_5b.jpg' },
    { label: 'Level 6 (Part 1)', src: 'assets/maps/1583_6a.jpg' },
    { label: 'Level 6 (Part 2)', src: 'assets/maps/1583_6b.jpg' },
    { label: 'Level 7',          src: 'assets/maps/1583_7.jpg' },
  ],
};

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

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
function init() {
  buildDungeonTabs();
  buildFilterBtns();
  bindControls();
  initSidebarCollapse();
  initMapModal();
  initLoadingScreenLightbox();
  initEncounterModal();
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
  if (dungeon.guideUrl || strategyEntries.length > 0) {
    const questLinkHtml = dungeon.guideUrl
      ? `<a href="${dungeon.guideUrl}" target="_blank" rel="noopener noreferrer" class="guides-box-link">📖 Quest Guide</a>`
      : '';
    const strategyLinksHtml = strategyEntries
      .map(e => `<a href="${e.url}" target="_blank" rel="noopener noreferrer" class="guides-box-link">🎯 ${e.label}</a>`)
      .join('');
    guidesEl.innerHTML = `
      <div class="guides-box">
        <div class="guides-box-label"><img src="assets/icons/wowhead.png" class="guides-box-wowhead-logo" alt="Wowhead"> Wowhead Guides</div>
        <div class="guides-box-links">${questLinkHtml}${strategyLinksHtml}</div>
      </div>`;
  } else {
    guidesEl.innerHTML = '';
  }

  const pct = quests.length ? (completedCount / quests.length * 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressFraction').textContent = `${completedCount} / ${quests.length}`;
  renderStatsBar(dungeon);
}

// ═══════════════════════════════════════
//  STATS BAR
// ═══════════════════════════════════════
function renderStatsBar(dungeon) {
  let quests = dungeon.quests.map(normalizeQuest).filter(q => q.absorbedBy === null);
  if (factionFilter) {
    quests = quests.filter(q => !q.faction || q.faction === 'Both' || q.faction === factionFilter);
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

function buildFilterBtns() {}

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

function applyMapTransform() {
  document.getElementById('mapModalImg').style.transform =
    `translate(${mapX}px, ${mapY}px) scale(${mapScale})`;
}

function resetMapView() {
  const img = document.getElementById('mapModalImg');
  const vp  = document.getElementById('mapModalViewport');
  const vpW = vp.clientWidth, vpH = vp.clientHeight;
  // Fit the image inside the viewport at scale 1
  const scaleW = mapNaturalW > 0 ? vpW / mapNaturalW : 1;
  const scaleH = mapNaturalH > 0 ? vpH / mapNaturalH : 1;
  mapScale = Math.min(scaleW, scaleH, 1);
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

  const wowheadUrl = `https://www.wowhead.com/classic/zone=${zoneId}`;
  document.getElementById('mapModalTitle').textContent = locationName;
  document.getElementById('mapModalWowheadLink').href  = wowheadUrl;

  // Build level nav (empty for single-map zones)
  const levelNav   = document.getElementById('mapLevelNav');
  const levels     = MULTI_LEVEL_MAPS[zoneId];
  levelNav.innerHTML = '';

  if (levels) {
    levels.forEach((level, i) => {
      const btn = document.createElement('button');
      btn.className = 'map-level-btn' + (i === 0 ? ' active' : '');
      btn.textContent = level.label;
      btn.addEventListener('click', () => {
        levelNav.querySelectorAll('.map-level-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadMapImage(level.src);
      });
      levelNav.appendChild(btn);
    });
  }

  // Open the modal first so the viewport has real dimensions when onload fires
  document.getElementById('mapModal').setAttribute('aria-hidden', 'false');
  document.getElementById('mapModal').classList.add('open');

  const firstSrc = levels ? levels[0].src : `assets/maps/${zoneId}.jpg`;
  loadMapImage(firstSrc);
}

function closeMapModal() {
  document.getElementById('mapModal').classList.remove('open');
  document.getElementById('mapModal').setAttribute('aria-hidden', 'true');
  document.getElementById('mapModalImg').src = '';
}

function initMapModal() {
  const modal   = document.getElementById('mapModal');
  const vp      = document.getElementById('mapModalViewport');
  const img     = document.getElementById('mapModalImg');

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

  // Mouse drag
  vp.addEventListener('mousedown', e => {
    mapDragging = true;
    mapDragStartX = e.clientX - mapX;
    mapDragStartY = e.clientY - mapY;
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!mapDragging) return;
    mapX = e.clientX - mapDragStartX;
    mapY = e.clientY - mapDragStartY;
    applyMapTransform();
  });
  window.addEventListener('mouseup', () => { mapDragging = false; });

  // Touch drag
  let lastTouchX = 0, lastTouchY = 0;
  vp.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  }, { passive: true });
  vp.addEventListener('touchmove', e => {
    if (e.touches.length === 1) {
      mapX += e.touches[0].clientX - lastTouchX;
      mapY += e.touches[0].clientY - lastTouchY;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      applyMapTransform();
      e.preventDefault();
    }
  }, { passive: false });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeMapModal();
  });

  // Location link delegation (document-level — quest cards rebuild dynamically)
  document.addEventListener('click', e => {
    const link = e.target.closest('.location-link');
    if (link) openMapModal(link.dataset.location);
  });
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

  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
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

init();
