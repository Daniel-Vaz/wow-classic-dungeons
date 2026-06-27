// ═══════════════════════════════════════
//  DUNGEON KEYS & SPECIAL ITEMS
// ═══════════════════════════════════════
// Per-dungeon "key" items that summon bonus bosses, skip wings, or unlock
// otherwise-sealed areas. Rendered as a highlighted card pinned above the
// regular quest cards, with a fully bespoke pop-out guide on click.
//
// Source: Wowhead — "Attunements and Keys to Unlock Dungeons and Raids in WoW
// Classic" (https://www.wowhead.com/classic/guide/classic-wow-attunements-and-keys-dungeons-raids)

// Entity registry — names/slugs/qualities for tokens used in step/unlock text.
// Token form inside any text string: {item=ID} {npc=ID} {object=ID} {zone=ID} {quest=ID}
const KEY_ENTITIES = {
  "item=7146": { name: "The Scarlet Key", slug: "the-scarlet-key", quality: 2 },
  "item=6893": { name: "Workshop Key", slug: "workshop-key", quality: 1 },
  "item=9240": { name: "Mallet of Zul'Farrak", slug: "mallet-of-zulfarrak", quality: 2 },
  "item=9241": { name: "Sacred Mallet", slug: "sacred-mallet", quality: 1 },
  "item=10818": { name: "Yeh'kinya's Scroll", slug: "yehkinyas-scroll", quality: 1 },
  "item=17191": { name: "Scepter of Celebras", slug: "scepter-of-celebras", quality: 3 },
  "item=17703": { name: "Celebrian Diamond", slug: "celebrian-diamond", quality: 1 },
  "item=17702": { name: "Celebrian Rod", slug: "celebrian-rod", quality: 1 },
  "item=11000": { name: "Shadowforge Key", slug: "shadowforge-key", quality: 1 },
  "item=10999": { name: "Ironfel", slug: "ironfel", quality: 1 },
  "item=18249": { name: "Crescent Key", slug: "crescent-key", quality: 1 },
  "item=13704": { name: "Skeleton Key", slug: "skeleton-key", quality: 1 },
  "item=12382": { name: "Key to the City", slug: "key-to-the-city", quality: 2 },
  "item=12344": { name: "Seal of Ascension", slug: "seal-of-ascension", quality: 3 },
  "npc=6487": { name: "Arcanist Doan", slug: "arcanist-doan" },
  "npc=6235": { name: "Electrocutioner 6000", slug: "electrocutioner-6000" },
  "npc=7273": { name: "Gahz'rilla", slug: "gahzrilla" },
  "npc=7996": { name: "Qiaga the Keeper", slug: "qiaga-the-keeper" },
  "npc=8443": { name: "Avatar of Hakkar", slug: "avatar-of-hakkar" },
  "npc=12201": { name: "Princess Theradras", slug: "princess-theradras" },
  "npc=13697": { name: "Cavindra", slug: "cavindra" },
  "npc=12236": { name: "Lord Vyletongue", slug: "lord-vyletongue" },
  "npc=13282": { name: "Noxxion", slug: "noxxion" },
  "npc=12225": { name: "Celebras the Cursed", slug: "celebras-the-cursed" },
  "npc=13716": { name: "Celebras the Redeemed", slug: "celebras-the-redeemed" },
  "npc=8888": { name: "Franclorn Forgewright", slug: "franclorn-forgewright" },
  "npc=9056": { name: "Fineous Darkvire", slug: "fineous-darkvire" },
  "npc=9024": { name: "Pyromancer Loregrain", slug: "pyromancer-loregrain" },
  "npc=14354": { name: "Pusillin", slug: "pusillin" },
  "npc=10435": { name: "Magistrate Barthilas", slug: "magistrate-barthilas" },
  "npc=10321": { name: "Emberstrife", slug: "emberstrife" },
  "npc=10429": { name: "Warchief Rend Blackhand", slug: "warchief-rend-blackhand" },
  "object=103821": { name: "Doan's Strongbox", slug: "doans-strongbox" },
  "zone=796": { name: "Scarlet Monastery", slug: "scarlet-monastery" },
  "zone=2017": { name: "Stratholme", slug: "stratholme" },
  "zone=721": { name: "Gnomeregan", slug: "gnomeregan" },
  "zone=1176": { name: "Zul'Farrak", slug: "zulfarrak" },
  "zone=47": { name: "The Hinterlands", slug: "the-hinterlands" },
  "zone=1477": { name: "The Temple of Atal'Hakkar", slug: "the-temple-of-atalhakkar" },
  "zone=1584": { name: "Blackrock Depths", slug: "blackrock-depths" },
  "zone=25": { name: "Blackrock Mountain", slug: "blackrock-mountain" },
  "zone=2557": { name: "Dire Maul", slug: "dire-maul" },
  "zone=2057": { name: "Scholomance", slug: "scholomance" },
  "zone=28": { name: "Western Plaguelands", slug: "western-plaguelands" },
  "zone=1583": { name: "Blackrock Spire", slug: "blackrock-spire" },
  "zone=15": { name: "Dustwallow Marsh", slug: "dustwallow-marsh" },
  "quest=3520": { name: "Screecher Spirits", slug: "screecher-spirits" },
  "quest=3527": { name: "The Prophecy of Mosh'aru", slug: "the-prophecy-of-mosharu" },
  "quest=4787": { name: "The Ancient Egg", slug: "the-ancient-egg" },
  "quest=3528": { name: "The God Hakkar", slug: "the-god-hakkar" },
  "quest=7044": { name: "Legends of Maraudon", slug: "legends-of-maraudon" },
  "quest=7046": { name: "The Scepter of Celebras", slug: "the-scepter-of-celebras" },
  "quest=3802": { name: "Dark Iron Legacy", slug: "dark-iron-legacy" },
  "quest=5092": { name: "Clear the Way", slug: "clear-the-way" },
  "quest=5096": { name: "Scarlet Diversions", slug: "scarlet-diversions" },
  "quest=5097": { name: "All Along the Watchtowers", slug: "all-along-the-watchtowers" },
  "quest=5098": { name: "All Along the Watchtowers", slug: "all-along-the-watchtowers" },
  "quest=5533": { name: "Scholomance", slug: "scholomance" },
  "quest=838": { name: "Scholomance", slug: "scholomance" },
  "quest=5537": { name: "Skeletal Fragments", slug: "skeletal-fragments" },
  "quest=964": { name: "Skeletal Fragments", slug: "skeletal-fragments" },
  "quest=5538": { name: "Mold Rhymes With...", slug: "mold-rhymes-with" },
  "quest=5514": { name: "Mold Rhymes With...", slug: "mold-rhymes-with" },
  "quest=5801": { name: "Fire Plume Forged", slug: "fire-plume-forged" },
  "quest=5802": { name: "Fire Plume Forged", slug: "fire-plume-forged" },
  "quest=5803": { name: "Araj's Scarab", slug: "arajs-scarab" },
  "quest=5804": { name: "Araj's Scarab", slug: "arajs-scarab" },
  "quest=5505": { name: "The Key to Scholomance", slug: "the-key-to-scholomance" },
  "quest=5511": { name: "The Key to Scholomance", slug: "the-key-to-scholomance" },
  "quest=4742": { name: "Seal of Ascension", slug: "seal-of-ascension" },
};

// method → short label + icon shown on the card/modal "how you get it" chip.
const KEY_METHODS = {
  drop:      { label: 'Dungeon Drop', icon: 'drops.png' },
  craft:     { label: 'Forged Item',  icon: 'forging.png' },
  questline: { label: 'Quest Chain',  icon: 'questchain.png' },
  quest:     { label: 'Quest Reward', icon: 'present.png' },
};

// Per-key map focus: when a key guide references a location ({zone=ID}), open
// its map popout already switched to the most relevant sub-zone (level). Keyed
// by key id → { "zone=ID": "Sub-zone label" }. The label is matched against the
// zone's MULTI_LEVEL_MAPS entry at click time, so it survives map reordering and
// falls back to the default level if the label ever stops matching.
const KEY_MAP_FOCUS = {
  sm:   { "zone=796":  "Library" },           // Scarlet Key opens the Armory/Cathedral, looted in the Library
  brd:  { "zone=1584": "Shadowforge City" },  // Shadowforge Key unlocks the Shadowforge City doors
  ubrs: { "zone=1583": "Upper – Dragonspire Hall" }, // Seal of Ascension gates Upper Spire
};

// Keys that also matter to a dungeon other than the one they primarily belong
// to. Listed dungeon → ids of additional keys to surface there (their card +
// pop-out are reused as-is). e.g. The Scarlet Key opens a Stratholme side door.
const DUNGEON_EXTRA_KEYS = {
  strath: ['sm'],
};

const DUNGEON_KEYS = {
  // ─────────────────────────────────────── Scarlet Monastery
  sm: {
    item: { id: 7146, slug: 'the-scarlet-key', name: 'The Scarlet Key', icon: 'inv_misc_key_01', quality: 2 },
    method: 'drop',
    tagline: "Opens the Armory and Cathedral wings of Scarlet Monastery — and the Scarlet Hold side door in Stratholme.",
    unlocks: [
      "The {zone=796#Armory} and {zone=796#Cathedral} wings of Scarlet Monastery",
      "The path to the Scarlet Hold on the Living side of {zone=2017}",
    ],
    source: "Looted from a chest behind the final boss of the Library wing.",
    steps: [
      { title: "Run the Library wing", text: "Enter the {zone=796} <strong>Library</strong> wing and clear your way to the end." },
      { title: "Defeat Arcanist Doan", text: "Kill {npc=6487}, the final boss of the Library wing." },
      { title: "Loot the key", text: "Open {object=103821} — the small chest tucked right behind where Doan stands — and take {item=7146}." },
    ],
    rogueNote: "Rogues can pick the Scarlet Monastery doors at Lockpicking 175 (and the Stratholme door at 275), skipping the key entirely.",
  },

  // ─────────────────────────────────────── Gnomeregan
  gnomer: {
    item: { id: 6893, slug: 'workshop-key', name: 'Workshop Key', icon: 'inv_misc_key_06', quality: 1 },
    method: 'drop',
    tagline: "Opens Gnomeregan's back door so your group can skip the long opening descent.",
    unlocks: [
      "The <strong>back entrance</strong> to {zone=721}, skipping the instance's initial part",
    ],
    source: "Drops from the boss Electrocutioner 6000 inside Gnomeregan.",
    steps: [
      { title: "Defeat Electrocutioner 6000", text: "Run {zone=721} and kill {npc=6235}, one of the dungeon's bosses." },
      { title: "Loot the key", text: "Take {item=6893} from his corpse." },
      { title: "Use the back door", text: "On later runs, use the key on the Workshop back entrance to skip straight to the deeper levels." },
    ],
    rogueNote: "Rogues can pick the Gnomeregan back door at Lockpicking 150.",
  },

  // ─────────────────────────────────────── Zul'Farrak
  zf: {
    item: { id: 9240, slug: 'mallet-of-zulfarrak', name: "Mallet of Zul'Farrak", icon: 'inv_hammer_19', quality: 2 },
    method: 'craft',
    tagline: "Summons the hydra boss Gahz'rilla at the Altar of Zul — a bonus encounter with valuable loot.",
    unlocks: [
      "Summons {npc=7273} at the Altar of Zul in {zone=1176}",
    ],
    source: "Forged in The Hinterlands from the Sacred Mallet, then used inside Zul'Farrak.",
    steps: [
      { title: "Loot the Sacred Mallet", text: "In {zone=47}, kill {npc=7996} atop the Altar of Zul and loot her {item=9241}." },
      { title: "Ride to Jintha'Alor", text: "Travel to the top level of Jintha'Alor, also in The Hinterlands." },
      { title: "Forge the Mallet", text: "Use the Sacred Mallet at the altar there to transform it into the {item=9240}." },
      { title: "Summon Gahz'rilla", text: "Carry the Mallet into {zone=1176} and use it at the Altar of Zul to summon {npc=7273}." },
    ],
  },

  // ─────────────────────────────────────── Sunken Temple (Temple of Atal'Hakkar)
  st: {
    item: { id: 10818, slug: 'yehkinyas-scroll', name: "Yeh'kinya's Scroll", icon: 'inv_scroll_02', quality: 1 },
    method: 'questline',
    tagline: "Lets you re-summon the Avatar of Hakkar in the Sunken Temple any time, without being on the quest.",
    unlocks: [
      "Summons the {npc=8443} in {zone=1477} on demand",
    ],
    source: "Reward for finishing the Hakkar summoning questline; handed over by Yeh'kinya in Tanaris.",
    steps: [
      { title: "Screecher Spirits", text: "Complete {quest=3520}." },
      { title: "The Prophecy of Mosh'aru", text: "Complete {quest=3527} — this requires summoning Gahz'rilla in Zul'Farrak (see the Mallet of Zul'Farrak)." },
      { title: "The Ancient Egg", text: "Complete {quest=4787}." },
      { title: "The God Hakkar", text: "Complete {quest=3528} — your first summoning of the Avatar of Hakkar." },
      { title: "Collect the scroll", text: "Return to Yeh'kinya afterward and he gives you {item=10818}, letting you summon the boss whenever you like." },
    ],
  },

  // ─────────────────────────────────────── Maraudon
  mara: {
    item: { id: 17191, slug: 'scepter-of-celebras', name: 'Scepter of Celebras', icon: 'inv_staff_16', quality: 3 },
    method: 'questline',
    tagline: "Opens a portal straight to Earth Song Falls — skip the Orange and Purple sides of Maraudon entirely.",
    unlocks: [
      "A portal to the inner part of Maraudon, going straight to {npc=12201} and skipping the orange/purple sides",
    ],
    source: "Reward from the 'Legends of Maraudon' quest, completed inside the instance.",
    steps: [
      { title: "Pick up the quest", text: "Talk to {npc=13697} at the outer part of Maraudon to get {quest=7044}." },
      { title: "Loot the two relics", text: "Loot {item=17703} from {npc=12236} (Purple side) and {item=17702} from {npc=13282} (Orange side)." },
      { title: "Defeat Celebras the Cursed", text: "With both relics, kill {npc=12225}, found just before the waterfall that leads to inner Maraudon." },
      { title: "Turn in the legends", text: "Defeating him spawns {npc=13716} — turn in {quest=7044} to him." },
      { title: "Claim the Scepter", text: "Complete the short follow-up {quest=7046} to receive {item=17191}." },
    ],
  },

  // ─────────────────────────────────────── Blackrock Depths
  brd: {
    item: { id: 11000, slug: 'shadowforge-key', name: 'Shadowforge Key', icon: 'inv_misc_key_08', quality: 1 },
    method: 'quest',
    tagline: "Opens the Shadowforge Doors in Blackrock Depths — skip the lower instance and the Ring of Law, and reach the Grim Guzzler.",
    unlocks: [
      "The <strong>Shadowforge Doors</strong> in {zone=1584}, skipping the lower portions and the Ring of Law encounter",
      "Access to the <strong>Grim Guzzler</strong> bar",
    ],
    source: "Reward from the 'Dark Iron Legacy' quest, started by a ghost in Blackrock Mountain.",
    steps: [
      { title: "Find Franclorn's ghost", text: "Die and become a ghost, then speak with {npc=8888} in Forgewright's Tomb in {zone=25} — he's only interactable while you're dead." },
      { title: "Accept Dark Iron Legacy", text: "Take the quest {quest=3802} from Franclorn." },
      { title: "Get Ironfel", text: "Inside Blackrock Depths, slay {npc=9056} and loot {item=10999}." },
      { title: "Place Ironfel", text: "Carry Ironfel to the Shrine of Thaurissan — the statue behind {npc=9024} — and place it there." },
      { title: "Receive the key", text: "Completing the quest rewards you {item=11000}." },
    ],
    rogueNote: "Rogues can pick the Shadowforge Doors at Lockpicking 280.",
  },

  // ─────────────────────────────────────── Dire Maul
  dm: {
    item: { id: 18249, slug: 'crescent-key', name: 'Crescent Key', icon: 'inv_misc_key_10', quality: 1 },
    method: 'drop',
    tagline: "Opens the West and North wings of Dire Maul, plus the Shen'dralar study reached from the North wing.",
    unlocks: [
      "The doors to the <strong>West</strong> and <strong>North</strong> wings of {zone=2557}",
      "Entrance to the <strong>Shen'dralar study</strong> from the North wing",
    ],
    source: "Drops from Pusillin, a fleeing imp in the East wing.",
    steps: [
      { title: "Find Pusillin", text: "Enter the <strong>East</strong> wing of {zone=2557} and find {npc=14354}, a seemingly friendly imp near the start." },
      { title: "Chase him down", text: "He turns hostile and flees, leading you on a chase around the wing. Catch up and kill him." },
      { title: "Loot the key", text: "Take {item=18249} from his corpse." },
    ],
    rogueNote: "Rogues can pick the Dire Maul doors at Lockpicking 300.",
  },

  // ─────────────────────────────────────── Scholomance
  scholo: {
    item: { id: 13704, slug: 'skeleton-key', name: 'Skeleton Key', icon: 'inv_misc_key_11', quality: 1 },
    method: 'questline',
    tagline: "Opens the sealed door in Caer Darrow that blocks the entrance to Scholomance.",
    unlocks: [
      "The sealed door in Caer Darrow guarding {zone=2057} in {zone=28}",
    ],
    source: "Reward at the end of a lengthy Western Plaguelands quest chain. Each step has a separate Alliance and Horde version — complete the one for your faction.",
    steps: [
      { title: "Clear the Way / Scarlet Diversions", text: "{quest=5092} &nbsp;<span class=\"key-or\">or</span>&nbsp; {quest=5096}" },
      { title: "All Along the Watchtowers", text: "{quest=5097} &nbsp;<span class=\"key-or\">or</span>&nbsp; {quest=5098}" },
      { title: "Scholomance", text: "{quest=5533} &nbsp;<span class=\"key-or\">or</span>&nbsp; {quest=838}" },
      { title: "Skeletal Fragments", text: "{quest=5537} &nbsp;<span class=\"key-or\">or</span>&nbsp; {quest=964}" },
      { title: "Mold Rhymes With...", text: "{quest=5538} &nbsp;<span class=\"key-or\">or</span>&nbsp; {quest=5514}" },
      { title: "Fire Plume Forged", text: "{quest=5801} &nbsp;<span class=\"key-or\">or</span>&nbsp; {quest=5802}" },
      { title: "Araj's Scarab", text: "{quest=5803} &nbsp;<span class=\"key-or\">or</span>&nbsp; {quest=5804}" },
      { title: "The Key to Scholomance", text: "{quest=5505} &nbsp;<span class=\"key-or\">or</span>&nbsp; {quest=5511} — you receive {item=13704} on completion." },
    ],
  },

  // ─────────────────────────────────────── Stratholme
  strath: {
    item: { id: 12382, slug: 'key-to-the-city', name: 'Key to the City', icon: 'inv_misc_key_13', quality: 2 },
    method: 'drop',
    tagline: "Opens the side (Service) entrance of Stratholme, letting you start the run on the Undead side.",
    unlocks: [
      "The <strong>side entrance</strong> of {zone=2017}, starting the instance at the Undead side",
    ],
    source: "Drops from Magistrate Barthilas.",
    steps: [
      { title: "Reach Barthilas", text: "From the Living side, make your way to the service entrance, where {npc=10435} awaits." },
      { title: "Defeat him & loot", text: "Kill Barthilas and loot {item=12382}. (If you arrive from the Undead side already holding the key, he instead flees deeper into the Undead side.)" },
    ],
    rogueNote: "Rogues can pick the Service-side entrance at Lockpicking 275.",
  },

  // ─────────────────────────────────────── Upper Blackrock Spire
  ubrs: {
    item: { id: 12344, slug: 'seal-of-ascension', name: 'Seal of Ascension', icon: 'inv_jewelry_ring_01', quality: 3 },
    method: 'questline',
    tagline: "Grants entrance to Upper Blackrock Spire — and can summon Vaelan to aid you during the Rend encounter.",
    unlocks: [
      "Entrance to <strong>Upper</strong> {zone=1583} (UBRS)",
      "Summons Vaelan to aid your group during the {npc=10429} encounter",
    ],
    source: "Forged through the 'Seal of Ascension' quest, started by Vaelan inside Lower Blackrock Spire.",
    steps: [
      { title: "Start the quest", text: "Speak to Vaelan inside Lower Blackrock Spire to pick up {quest=4742}." },
      { title: "Loot the gems", text: "Defeat bosses throughout Lower Blackrock Spire to loot the required gems." },
      { title: "Charge the seal", text: "Travel to {zone=15} and beat down — then mind-control — the black dragon {npc=10321}, forcing him to forge the key for you." },
      { title: "Receive the Seal", text: "Completing the quest grants you {item=12344}, your key into Upper Blackrock Spire." },
    ],
  },
};
