// ═══════════════════════════════════════
//  ATLAS LEGEND → NPC / OBJECT MODELS
// ═══════════════════════════════════════
// Atlas legend rows that AREN'T boss encounters but still have a model image —
// friendly NPCs, enemy/elite NPCs, and quest objects. Clicking such a row opens
// the expanded image (assets/npc-models/{id}.jpg) in the lightbox, the same way
// the NPC/object thumbnails inside the quest popout do. Boss encounters are
// matched separately against BOSS_ENCOUNTERS and open the encounter popout, so
// they don't need an entry here.
//
// Keyed by dungeon id (see DUNGEON_MAP_NAME), then by the legend label exactly
// as it reads in instance-maps.js, but lowercased and with any trailing
// "<Title>" or "(annotation)" suffix removed. The value is the npc id (the
// number in the Wowhead URL, e.g. npc=13697 → 13697). For a quest *object*,
// write the string "object=ID" instead — objects are a separate Wowhead
// namespace, so the model scraper needs the kind spelled out. null = no image.
//
const ATLAS_LEGEND_NPCS = {
  wc: {
    "mad magglish": 3655,
    "trigore the lasher": 3652,
    "boahn": 3672,
    "disciple of naralex": 3678,
  },
  deadmines: {
    "marisa du'paige": 599,
    "brainwashed noble": 596,
    "foreman thistlenettle": 626,
    "defias gunpowder": "object=5397",
  },
  sfk: {
    "deathstalker adamant": 3849,
  },
  bfd: {
    "lorgalis manuscript": "object=13949",
    "argent guard thaelrid": 4787,
  },
  gnomer: {
    "elevator": null,
    "transpolyporter": null,
    "matrix punchograph 3005-a": "object=142345",
    "techbot": 6231,
    "blastmaster emi shortfuse": 7998,
    "the clean zone": null,
    "kernobee": 7850,
  },
  rfk: {
    "willix the importer": 1144,
  },
  rfd: {
    "henry stern": 8696,
  },
  uldaman: {
    "hammertoe grez": 2909,
    "magregan deepshadow": 2932,
    "tablet of ryun'eh": "object=126260",
    "krom stoutarm's chest": "object=124389",
    "garrett family chest": "object=124388",
    "remains of a paladin": 6912,
    "annora": 11073,
    "the discs of norgannon": "object=131474",
  },
  mara: {
    "kolk": 13742,
    "gelk": 13741,
    "magra": 13740,
    "cavindra": 13697,
    "veng": 13738,
    "maraudos": 13739,
    "elder splitrock": 15556,
  },
  st: {
    "kazkaz the unholy": 5401,
    "zekkis": 5400,
    "altar of hakkar": "object=148836",
    "spawn of hakkar": "object=5708",
    "elder starsong": 15593,
  },
  brd: {
    "overmaster pyron": 4262,
    "lothos riftwaker": 14387,
    "franclorn forgewright": 8888,
    "meeting stone": null,
    "orb of command": "object=179879",
    "scarshield quartermaster": 9046,
    "kharan mighthammer": 9021,
    "commander gor'shak": 9020,
    "marshal windsor": 9023,
    "ring of law": null,
    "monument of franclorn forgewright": "object=164689",
    "the vault": null,
    "the black anvil": null,
    "the shadowforge lock": null,
    "the grim guzzler": null,
    "summoner's tomb": null,
    "the lyceum": null,
    "the black forge": null,
    "the molten core": null,
    "blacksmithing plans": null,
  },
  lbrs: {
    "overmaster pyron": 4262,
    "lothos riftwaker": 14387,
    "franclorn forgewright": 8888,
    "meeting stone": null,
    "orb of command": "object=179879",
    "scarshield quartermaster": 9046,
    "vaelan": 10296,
    "warosh": 10799,
    "roughshod pike": "object=175886",
    "bijou": 10257,
    "bijou's belongings": "object=175334",
    "human remains": "object=176090",
    "urok's tribute pile": null,
  },
  ubrs: {
    "overmaster pyron": 4262,
    "lothos riftwaker": 14387,
    "franclorn forgewright": 8888,
    "meeting stone": null,
    "orb of command": "object=179879",
    "scarshield quartermaster": 9046,
    "darkstone tablet": "object=175385",
    "awbee": 10740,
    "blackwing lair": null,
  },
  dm: {
    "knot thimblejack": 14338,
    "shen'dralar ancient": 14358,
    "old ironbark / ironbark the redeemed": 11491,
  },
  scholo: {
    "the deed to tarren mill": "object=176487",
  },
  strath: {
    "atiesh": 16387,
    "elder farwhisper": 15607,
    "aurius": 10917,
  },
};
