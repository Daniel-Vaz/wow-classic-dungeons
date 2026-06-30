// WoW Classic Dungeon Compendium — quest giver map pins
// Keyed by zone name (matches ZONE_IDS / DUNGEON_MAP_NAME). Multi-level
// maps use an array-of-arrays indexed by floor. Pin type 'quest' renders
// in gold (see .map-pin--quest) so it is distinct from teal user pins.

const QUEST_PINS = {
  "Orgrimmar": [
    {
      "x": 38.45,
      "y": 86.13,
      "label": "Deino",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5885/deino"
    },
    {
      "x": 59.49,
      "y": 36.57,
      "label": "Dran Droffers",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6986/dran-droffers"
    },
    {
      "x": 47.52,
      "y": 46.72,
      "label": "Kurgul",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5815/kurgul"
    },
    {
      "x": 49.47,
      "y": 50.59,
      "label": "Neeru Fireblade",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3216/neeru-fireblade"
    },
    {
      "x": 75.99,
      "y": 25.41,
      "label": "Nogg",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3412/nogg"
    },
    {
      "x": 66.05,
      "y": 18.53,
      "label": "Ormak Grimshot",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3352/ormak-grimshot"
    },
    {
      "x": 43.9,
      "y": 54.63,
      "label": "Ormok",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3328/ormok"
    },
    {
      "x": 38.66,
      "y": 35.92,
      "label": "Sagorne Creststrider",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=13417/sagorne-creststrider"
    },
    {
      "x": 80.39,
      "y": 32.38,
      "label": "Sorek",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3354/sorek"
    },
    {
      "x": 75.49,
      "y": 25.36,
      "label": "Sovik",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3413/sovik"
    },
    {
      "x": 31.73,
      "y": 37.82,
      "label": "Thrall",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4949/thrall"
    },
    {
      "x": 35.59,
      "y": 87.82,
      "label": "Ur'kyo",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6018/ur-kyo"
    },
    {
      "x": 39.16,
      "y": 86.27,
      "label": "Uthel'nay",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7311/uthel-nay"
    },
    {
      "x": 37.56,
      "y": 75.36,
      "label": "Warcaller Gorlach",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10880/warcaller-gorlach"
    },
    {
      "x": 48.47,
      "y": 45.43,
      "label": "Zevrost",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3326/zevrost"
    }
  ],
  "Thunder Bluff": [
    {
      "x": 22.81,
      "y": 20.89,
      "label": "Apothecary Zamah",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3419/apothecary-zamah"
    },
    {
      "x": 78.62,
      "y": 28.56,
      "label": "Arch Druid Hamuul Runetotem",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5769/arch-druid-hamuul-runetotem"
    },
    {
      "x": 22.76,
      "y": 14.53,
      "label": "Archmage Shymm",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3047/archmage-shymm"
    },
    {
      "x": 35.97,
      "y": 59.92,
      "label": "Auld Stonespire",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4451/auld-stonespire"
    },
    {
      "x": 71.06,
      "y": 34.19,
      "label": "Bashana Runetotem",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9087/bashana-runetotem"
    },
    {
      "x": 21.99,
      "y": 18.8,
      "label": "Beram Skychaser",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3032/beram-skychaser"
    },
    {
      "x": 44.33,
      "y": 58.76,
      "label": "Bluff Runner Windstrider",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10881/bluff-runner-windstrider"
    },
    {
      "x": 57.3,
      "y": 89.79,
      "label": "Holt Thunderhorn",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3039/holt-thunderhorn"
    },
    {
      "x": 75.65,
      "y": 31.61,
      "label": "Nara Wildmane",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5770/nara-wildmane"
    },
    {
      "x": 38.99,
      "y": 55.98,
      "label": "Orm Stonehoof",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6410/orm-stonehoof"
    },
    {
      "x": 70.14,
      "y": 29.52,
      "label": "Rahauro",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11833/rahauro"
    },
    {
      "x": 34.4,
      "y": 46.87,
      "label": "Sage Truthseeker",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3978/sage-truthseeker"
    },
    {
      "x": 57.24,
      "y": 87.37,
      "label": "Torm Ragetotem",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3041/torm-ragetotem"
    },
    {
      "x": 76.48,
      "y": 27.22,
      "label": "Turak Runetotem",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3033/turak-runetotem"
    },
    {
      "x": 25.7,
      "y": 14.19,
      "label": "Ursyn Ghull",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3048/ursyn-ghull"
    }
  ],
  "Undercity": [
    {
      "x": 85.14,
      "y": 10.03,
      "label": "Anastasia Hartwell",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4568/anastasia-hartwell"
    },
    {
      "x": 74.05,
      "y": 33.31,
      "label": "Andrew Brownell",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2308/andrew-brownell"
    },
    {
      "x": 50.14,
      "y": 67.97,
      "label": "Apothecary Zinge",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5204/apothecary-zinge"
    },
    {
      "x": 47.4,
      "y": 17.29,
      "label": "Baltus Fowler",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4595/baltus-fowler"
    },
    {
      "x": 46.93,
      "y": 15.23,
      "label": "Christoph Walker",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4593/christoph-walker"
    },
    {
      "x": 63.9,
      "y": 44.08,
      "label": "Harbinger Balthazad",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10879/harbinger-balthazad"
    },
    {
      "x": 86.21,
      "y": 15.93,
      "label": "Kaal Soulreaper",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4563/kaal-soulreaper"
    },
    {
      "x": 53.74,
      "y": 54.46,
      "label": "Keeper Bel'dugur",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2934/keeper-bel-dugur"
    },
    {
      "x": 85.7,
      "y": 16.08,
      "label": "Martha Strain",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5753/martha-strain"
    },
    {
      "x": 48.82,
      "y": 69.28,
      "label": "Master Apothecary Faranell",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2055/master-apothecary-faranell"
    },
    {
      "x": 85.21,
      "y": 71.57,
      "label": "Miles Dexter",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4583/miles-dexter"
    },
    {
      "x": 57.8,
      "y": 65.42,
      "label": "Parqual Fintallas",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4488/parqual-fintallas"
    },
    {
      "x": 62.32,
      "y": 48.61,
      "label": "Patrick Garrett",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5651/patrick-garrett"
    },
    {
      "x": 85.45,
      "y": 13.51,
      "label": "Pierce Shackleton",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4567/pierce-shackleton"
    },
    {
      "x": 56.25,
      "y": 92.2,
      "label": "Varimathras",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2425/varimathras"
    },
    {
      "x": 62.14,
      "y": 39.14,
      "label": "Velora Nitely",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6411/velora-nitely"
    }
  ],
  "The Barrens": [
    {
      "x": 63.09,
      "y": 37.61,
      "label": "Crane Operator Bigglefuzz",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3665/crane-operator-bigglefuzz"
    },
    {
      "x": 49.31,
      "y": 57.21,
      "label": "Doan Karhan",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6247/doan-karhan"
    },
    {
      "x": 46.01,
      "y": 35.74,
      "label": "Ebru",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5768/ebru"
    },
    {
      "x": 48.18,
      "y": 32.78,
      "label": "Falla Sagewind",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8418/falla-sagewind"
    },
    {
      "x": 62.45,
      "y": 38.73,
      "label": "Liv Rizzlefix",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8496/liv-rizzlefix"
    },
    {
      "x": 62.37,
      "y": 37.62,
      "label": "Mebok Mizzyrix",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3446/mebok-mizzyrix"
    },
    {
      "x": 49.01,
      "y": 94.94,
      "label": "Myriam Moonsinger",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=12866/myriam-moonsinger"
    },
    {
      "x": 45.99,
      "y": 35.66,
      "label": "Nalpak",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5767/nalpak"
    },
    {
      "x": 44.67,
      "y": 59.42,
      "label": "Ruga Ragetotem",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6394/ruga-ragetotem"
    },
    {
      "x": 57.23,
      "y": 30.34,
      "label": "Thun'grim Firegaze",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5878/thun-grim-firegaze"
    },
    {
      "x": 52.26,
      "y": 31.93,
      "label": "Tonga Runetotem",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3448/tonga-runetotem"
    }
  ],
  "Stormwind City": [
    {
      "x": 39.59,
      "y": 27.19,
      "label": "Archbishop Benedictus",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1284/archbishop-benedictus"
    },
    {
      "x": 21.4,
      "y": 55.8,
      "label": "Argos Nightwhisper",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4984/argos-nightwhisper"
    },
    {
      "x": 49.19,
      "y": 30.28,
      "label": "Baros Alexston",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1646/baros-alexston"
    },
    {
      "x": 64.33,
      "y": 20.63,
      "label": "Brohann Caskbelly",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5384/brohann-caskbelly"
    },
    {
      "x": 42.58,
      "y": 24.23,
      "label": "Brother Crowley",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=12336/brother-crowley"
    },
    {
      "x": 38.54,
      "y": 26.85,
      "label": "Brother Joshua",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5489/brother-joshua"
    },
    {
      "x": 40.55,
      "y": 30.96,
      "label": "Brother Sarno",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7917/brother-sarno"
    },
    {
      "x": 74.01,
      "y": 30.24,
      "label": "Count Remington Ridgewell",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2285/count-remington-ridgewell"
    },
    {
      "x": 47.45,
      "y": 64.17,
      "label": "Crier Goodman",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2198/crier-goodman"
    },
    {
      "x": 25.28,
      "y": 78.22,
      "label": "Demisette Cloyce",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=461/demisette-cloyce"
    },
    {
      "x": 39.81,
      "y": 29.79,
      "label": "Duthorian Rall",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6171/duthorian-rall"
    },
    {
      "x": 58.09,
      "y": 16.54,
      "label": "Furen Longbeard",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5413/furen-longbeard"
    },
    {
      "x": 51.76,
      "y": 12.08,
      "label": "Grimand Elmore",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1416/grimand-elmore"
    },
    {
      "x": 78.23,
      "y": 17.98,
      "label": "Highlord Bolvar Fordragon",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1748/highlord-bolvar-fordragon"
    },
    {
      "x": 38.62,
      "y": 79.3,
      "label": "Jennea Cannon",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5497/jennea-cannon"
    },
    {
      "x": 37.16,
      "y": 33.32,
      "label": "Lord Grayson Shadowbreaker",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=928/lord-grayson-shadowbreaker"
    },
    {
      "x": 38.22,
      "y": 81.85,
      "label": "Maginor Dumas",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=331/maginor-dumas"
    },
    {
      "x": 75.78,
      "y": 59.84,
      "label": "Master Mathias Shaw",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=332/master-mathias-shaw"
    },
    {
      "x": 69.93,
      "y": 39.05,
      "label": "Nikova Raskol",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1721/nikova-raskol"
    },
    {
      "x": 74.64,
      "y": 52.82,
      "label": "Osborne the Night Man",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=918/osborne-the-night-man"
    },
    {
      "x": 55.51,
      "y": 12.51,
      "label": "Shoni the Shilent",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6579/shoni-the-shilent"
    },
    {
      "x": 25.66,
      "y": 77.66,
      "label": "Spackle Thornberry",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5520/spackle-thornberry"
    },
    {
      "x": 21.24,
      "y": 51.63,
      "label": "Theridran",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5505/theridran"
    },
    {
      "x": 61.92,
      "y": 14.66,
      "label": "Ulfir Ironbeard",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5516/ulfir-ironbeard"
    },
    {
      "x": 41.11,
      "y": 58.09,
      "label": "Warden Thelwater",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1719/warden-thelwater"
    },
    {
      "x": 65.44,
      "y": 21.17,
      "label": "Wilder Thistlenettle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=656/wilder-thistlenettle"
    },
    {
      "x": 78.68,
      "y": 45.79,
      "label": "Wu Shen",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5479/wu-shen"
    }
  ],
  "Ironforge": [
    {
      "x": 77.34,
      "y": 9.71,
      "label": "Advisor Belgrum",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2918/advisor-belgrum"
    },
    {
      "x": 27.25,
      "y": 8.3,
      "label": "Bink",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5144/bink"
    },
    {
      "x": 23.13,
      "y": 6.14,
      "label": "Brandur Ironhammer",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5149/brandur-ironhammer"
    },
    {
      "x": 50.35,
      "y": 5.66,
      "label": "Briarthorn",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5172/briarthorn"
    },
    {
      "x": 55.92,
      "y": 81.39,
      "label": "Courier Hammerfall",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10877/courier-hammerfall"
    },
    {
      "x": 27.16,
      "y": 8.57,
      "label": "Dink",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7312/dink"
    },
    {
      "x": 50.83,
      "y": 5.62,
      "label": "Gerrig Bonegrip",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2786/gerrig-bonegrip"
    },
    {
      "x": 69.18,
      "y": 50.55,
      "label": "Gnoarn",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6569/gnoarn"
    },
    {
      "x": 24.73,
      "y": 8.16,
      "label": "High Priest Rohan",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11406/high-priest-rohan"
    },
    {
      "x": 68.75,
      "y": 48.97,
      "label": "High Tinker Mekkatorque",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7937/high-tinker-mekkatorque"
    },
    {
      "x": 77.54,
      "y": 11.82,
      "label": "Historian Karnik",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2916/historian-karnik"
    },
    {
      "x": 51.96,
      "y": 14.84,
      "label": "Hulfdan Blackbeard",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5165/hulfdan-blackbeard"
    },
    {
      "x": 52.7,
      "y": 6.08,
      "label": "Jubahl Corpseseeker",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6382/jubahl-corpseseeker"
    },
    {
      "x": 70.34,
      "y": 90.65,
      "label": "Kelv Sternhammer",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5113/kelv-sternhammer"
    },
    {
      "x": 39.09,
      "y": 56.2,
      "label": "King Magni Bronzebeard",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2784/king-magni-bronzebeard"
    },
    {
      "x": 67.92,
      "y": 46.1,
      "label": "Klockmort Spannerspan",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6169/klockmort-spannerspan"
    },
    {
      "x": 74.19,
      "y": 9.39,
      "label": "Krom Stoutarm",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6294/krom-stoutarm"
    },
    {
      "x": 74.97,
      "y": 12.48,
      "label": "Librarian Mae Paledust",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3979/librarian-mae-paledust"
    },
    {
      "x": 69.83,
      "y": 48.1,
      "label": "Master Mechanic Castpipe",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7950/master-mechanic-castpipe"
    },
    {
      "x": 70.89,
      "y": 83.61,
      "label": "Olmin Burningbeard",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5116/olmin-burningbeard"
    },
    {
      "x": 74.64,
      "y": 11.74,
      "label": "Prospector Stormpike",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1356/prospector-stormpike"
    },
    {
      "x": 38.37,
      "y": 55.31,
      "label": "Royal Historian Archesonus",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8879/royal-historian-archesonus"
    },
    {
      "x": 36.38,
      "y": 3.61,
      "label": "Talvash del Kissel",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6826/talvash-del-kissel"
    },
    {
      "x": 69.55,
      "y": 50.33,
      "label": "Tinkmaster Overspark",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7944/tinkmaster-overspark"
    }
  ],
  "Westfall": [
    {
      "x": 41.69,
      "y": 89.24,
      "label": "Daphne Stilwell",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6182/daphne-stilwell"
    },
    {
      "x": 56.33,
      "y": 47.52,
      "label": "Gryan Stoutmantle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=234/gryan-stoutmantle"
    },
    {
      "x": 56.67,
      "y": 47.35,
      "label": "Scout Riell",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=820/scout-riell"
    },
    {
      "x": 55.68,
      "y": 47.5,
      "label": "The Defias Traitor",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=467/the-defias-traitor"
    }
  ],
  "Redridge Mountains": [
    {
      "x": 26.26,
      "y": 46.58,
      "label": "Guard Berton",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=859/guard-berton"
    },
    {
      "x": 29.99,
      "y": 44.45,
      "label": "Magistrate Solomon",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=344/magistrate-solomon"
    },
    {
      "x": 26.48,
      "y": 45.35,
      "label": "Wiley the Black",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=266/wiley-the-black"
    },
    {
      "x": 26.58,
      "y": 44.72,
      "label": "Yorus Barleybrew",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6166/yorus-barleybrew"
    }
  ],
  "Dun Morogh": [
    {
      "x": 52.49,
      "y": 36.92,
      "label": "Jordan Stilwell",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6181/jordan-stilwell"
    },
    {
      "x": 45.89,
      "y": 49.39,
      "label": "Ozzie Togglevolt",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1268/ozzie-togglevolt"
    },
    {
      "x": 46.83,
      "y": 52.36,
      "label": "Ragnar Thunderbrew",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1267/ragnar-thunderbrew"
    }
  ],
  "Silverpine Forest": [
    {
      "x": 44.2,
      "y": 39.81,
      "label": "Dalar Dawnweaver",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1938/dalar-dawnweaver"
    },
    {
      "x": 43.42,
      "y": 40.86,
      "label": "High Executor Hadrec",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1952/high-executor-hadrec"
    }
  ],
  "Darnassus": [
    {
      "x": 55.24,
      "y": 23.99,
      "label": "Argent Guard Manados",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4784/argent-guard-manados"
    },
    {
      "x": 58.94,
      "y": 35.35,
      "label": "Darnath Bladesinger",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7315/darnath-bladesinger"
    },
    {
      "x": 56.16,
      "y": 24.39,
      "label": "Dawnwatcher Selgorm",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4783/dawnwatcher-selgorm"
    },
    {
      "x": 55.36,
      "y": 25.03,
      "label": "Dawnwatcher Shaedlass",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4786/dawnwatcher-shaedlass"
    },
    {
      "x": 42.21,
      "y": 7.27,
      "label": "Dorion",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4205/dorion"
    },
    {
      "x": 47.81,
      "y": 81.97,
      "label": "Herald Moonstalker",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10878/herald-moonstalker"
    },
    {
      "x": 59.51,
      "y": 45.38,
      "label": "Mathiel",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6142/mathiel"
    },
    {
      "x": 35.37,
      "y": 8.4,
      "label": "Mathrengyl Bearwalker",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4217/mathrengyl-bearwalker"
    },
    {
      "x": 36.99,
      "y": 21.91,
      "label": "Syurna",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4163/syurna"
    },
    {
      "x": 69.54,
      "y": 67.75,
      "label": "Treshala Fallowbrook",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4521/treshala-fallowbrook"
    }
  ],
  "Ashenvale": [
    {
      "x": 11.56,
      "y": 34.29,
      "label": "Je'neu Sancrea",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=12736/je-neu-sancrea"
    }
  ],
  "Stonetalon Mountains": [
    {
      "x": 78.8,
      "y": 45.69,
      "label": "Braug Dimspirit",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4489/braug-dimspirit"
    },
    {
      "x": 59.52,
      "y": 67.15,
      "label": "Gaxim Rustfizzle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4077/gaxim-rustfizzle"
    },
    {
      "x": 47.36,
      "y": 64.25,
      "label": "Tsunaman",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11862/tsunaman"
    }
  ],
  "Darkshore": [
    {
      "x": 31.41,
      "y": 92.3,
      "label": "Damp Note",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/item=16790/damp-note"
    },
    {
      "x": 38.33,
      "y": 43.04,
      "label": "Gershala Nightwhisper",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8997/gershala-nightwhisper"
    }
  ],
  "Duskwood": [
    {
      "x": 71.92,
      "y": 47.79,
      "label": "Councilman Millstipe",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=270/councilman-millstipe"
    }
  ],
  "Wetlands": [
    {
      "x": 49.67,
      "y": 18.23,
      "label": "Motley Garmason",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1074/motley-garmason"
    }
  ],
  "Stranglethorn Vale": [
    {
      "x": 26.94,
      "y": 77.21,
      "label": "Krazek",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=773/krazek"
    },
    {
      "x": 27.6,
      "y": 77.48,
      "label": "Scooty",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7853/scooty"
    }
  ],
  "Feralas": [
    {
      "x": 31.83,
      "y": 45.61,
      "label": "Angelas Moonbreeze",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7900/angelas-moonbreeze"
    },
    {
      "x": 76.91,
      "y": 37.35,
      "label": "Azj'Tordin",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=14355/azj-tordin"
    },
    {
      "x": 89.64,
      "y": 46.57,
      "label": "Falfindel Waywarder",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4048/falfindel-waywarder"
    },
    {
      "x": 45.12,
      "y": 25.57,
      "label": "Gregan Brewspewer",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7775/gregan-brewspewer"
    },
    {
      "x": 30.38,
      "y": 46.17,
      "label": "Latronicus Moonspear",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7877/latronicus-moonspear"
    },
    {
      "x": 46.39,
      "y": 18.24,
      "label": "Rexxar",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10182/rexxar"
    },
    {
      "x": 75.24,
      "y": 43.76,
      "label": "Sage Korolusk",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=14373/sage-korolusk"
    },
    {
      "x": 31.65,
      "y": 43.45,
      "label": "Scholar Runethorn",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=14374/scholar-runethorn"
    },
    {
      "x": 76.18,
      "y": 43.83,
      "label": "Talo Thornhoof",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7776/talo-thornhoof"
    },
    {
      "x": 74.42,
      "y": 43.36,
      "label": "Witch Doctor Uzer'i",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8115/witch-doctor-uzer-i"
    }
  ],
  "Hillsbrad Foothills": [
    {
      "x": 61.44,
      "y": 19.06,
      "label": "Apothecary Lydon",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2216/apothecary-lydon"
    },
    {
      "x": 62.67,
      "y": 18.88,
      "label": "Monika Sengutz",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3982/monika-sengutz"
    },
    {
      "x": 51.47,
      "y": 58.35,
      "label": "Raleigh the Devout",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=3980/raleigh-the-devout"
    }
  ],
  "Desolace": [
    {
      "x": 66.52,
      "y": 7.91,
      "label": "Brother Anton",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1182/brother-anton"
    },
    {
      "x": 32.1,
      "y": 63.96,
      "label": "Cavindra",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=13697"
    },
    {
      "x": 50.42,
      "y": 86.65,
      "label": "Centaur Pariah",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=13717/centaur-pariah"
    },
    {
      "x": 63.83,
      "y": 10.67,
      "label": "Keeper Marandis",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=13698/keeper-marandis"
    },
    {
      "x": 26.87,
      "y": 77.67,
      "label": "Selendra",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=13699/selendra"
    },
    {
      "x": 68.5,
      "y": 8.88,
      "label": "Talendria",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11715/talendria"
    },
    {
      "x": 23.22,
      "y": 70.33,
      "label": "Vark Battlescar",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11823/vark-battlescar"
    },
    {
      "x": 62.2,
      "y": 39.63,
      "label": "Willow",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=13656/willow"
    }
  ],
  "Thousand Needles": [
    {
      "x": 53.95,
      "y": 41.49,
      "label": "Dorn Plainstalker",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2986/dorn-plainstalker"
    },
    {
      "x": 78.06,
      "y": 77.13,
      "label": "Fizzle Brassbolts",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4454/fizzle-brassbolts"
    },
    {
      "x": 78.29,
      "y": 75.7,
      "label": "Magus Tirth",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6548/magus-tirth"
    },
    {
      "x": 80.18,
      "y": 75.88,
      "label": "Pozzik",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4630/pozzik"
    },
    {
      "x": 77.21,
      "y": 77.39,
      "label": "Rizzle's Unguarded Plans",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=20805/rizzle-s-unguarded-plans"
    },
    {
      "x": 78.14,
      "y": 77.12,
      "label": "Wizzle Brassbolts",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4453/wizzle-brassbolts"
    }
  ],
  "Dustwallow Marsh": [
    {
      "x": 66.42,
      "y": 49.26,
      "label": "Archmage Tervosh",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4967/archmage-tervosh"
    },
    {
      "x": 56.66,
      "y": 87.72,
      "label": "Emberstrife",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10321"
    },
    {
      "x": 46.06,
      "y": 57.09,
      "label": "Tabetha",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6546/tabetha"
    }
  ],
  "Badlands": [
    {
      "x": 50.89,
      "y": 62.4,
      "label": "Battered Dwarven Skeleton",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=2875/battered-dwarven-skeleton"
    },
    {
      "x": 53.03,
      "y": 33.94,
      "label": "Crumpled Map",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=2868/crumpled-map"
    },
    {
      "x": 5.96,
      "y": 47.73,
      "label": "Galamav the Marksman",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9081/galamav-the-marksman"
    },
    {
      "x": 3.02,
      "y": 47.81,
      "label": "Hierophant Theodora Mulvadania",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9079/hierophant-theodora-mulvadania"
    },
    {
      "x": 2.42,
      "y": 46.06,
      "label": "Jarkal Mossmeld",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6868/jarkal-mossmeld"
    },
    {
      "x": 3.94,
      "y": 46.73,
      "label": "KILL ON SIGHT",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=164868/kill-on-sight"
    },
    {
      "x": 5.88,
      "y": 47.63,
      "label": "Lexlort",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9080/lexlort"
    },
    {
      "x": 25.95,
      "y": 44.87,
      "label": "Lotwil Veriatus",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2921/lotwil-veriatus"
    },
    {
      "x": 42.22,
      "y": 52.69,
      "label": "Martek the Exiled",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=4618/martek-the-exiled"
    },
    {
      "x": 53.42,
      "y": 43.39,
      "label": "Prospector Ryedol",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2910/prospector-ryedol"
    },
    {
      "x": 42.39,
      "y": 52.93,
      "label": "Rigglefuzz",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2817/rigglefuzz"
    },
    {
      "x": 2.9,
      "y": 47.76,
      "label": "Shadowmage Vivian Lagrave",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9078/shadowmage-vivian-lagrave"
    },
    {
      "x": 51.39,
      "y": 76.87,
      "label": "Theldurin the Lost",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2785/theldurin-the-lost"
    },
    {
      "x": 3.33,
      "y": 48.26,
      "label": "Thunderheart",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9084/thunderheart"
    },
    {
      "x": 3.74,
      "y": 47.43,
      "label": "WANTED",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=164867/wanted"
    },
    {
      "x": 5.81,
      "y": 47.52,
      "label": "Warlord Goretooth",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9077/warlord-goretooth"
    }
  ],
  "Loch Modan": [
    {
      "x": 37.07,
      "y": 49.38,
      "label": "Ghak Healtouch",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1470/ghak-healtouch"
    },
    {
      "x": 37.28,
      "y": 85.78,
      "label": "Hammertoe Grez",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=2909/hammertoe-grez"
    },
    {
      "x": 65.93,
      "y": 65.62,
      "label": "Prospector Ironband",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1344/prospector-ironband"
    },
    {
      "x": 36.67,
      "y": 90.59,
      "label": "Shattered Necklace",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/item=7666/shattered-necklace"
    }
  ],
  "Tanaris": [
    {
      "x": 52.46,
      "y": 28.51,
      "label": "Chief Engineer Bilgewhizzle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7407/chief-engineer-bilgewhizzle"
    },
    {
      "x": 51.46,
      "y": 28.81,
      "label": "Krinkle Goodsteel",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5411/krinkle-goodsteel"
    },
    {
      "x": 52.71,
      "y": 45.92,
      "label": "Marvon Rivetseeker",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7771/marvon-rivetseeker"
    },
    {
      "x": 66.89,
      "y": 24.03,
      "label": "Prospector Ironboot",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10460/prospector-ironboot"
    },
    {
      "x": 51.57,
      "y": 26.76,
      "label": "Tran'rek",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7876/tran-rek"
    },
    {
      "x": 51.41,
      "y": 28.75,
      "label": "Trenton Lighthammer",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7804/trenton-lighthammer"
    },
    {
      "x": 66.99,
      "y": 22.36,
      "label": "Yeh'kinya",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8579/yeh-kinya"
    },
    {
      "x": 67.04,
      "y": 24.01,
      "label": "Yorba Screwspigot",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9706/yorba-screwspigot"
    }
  ],
  "Blasted Lands": [
    {
      "x": 34.13,
      "y": 50.14,
      "label": "Daio the Decrepit",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=14463/daio-the-decrepit"
    },
    {
      "x": 63.63,
      "y": 20.63,
      "label": "Enohar Thunderbrew",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9540/enohar-thunderbrew"
    },
    {
      "x": 66.9,
      "y": 19.47,
      "label": "Thadius Grimshade",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8022/thadius-grimshade"
    }
  ],
  "The Hinterlands": [
    {
      "x": 33.75,
      "y": 75.21,
      "label": "Atal'ai Exile",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5598/atal-ai-exile"
    },
    {
      "x": 11.81,
      "y": 46.76,
      "label": "Falstad Wildhammer",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5635/falstad-wildhammer"
    },
    {
      "x": 9.75,
      "y": 44.47,
      "label": "Gryphon Master Talonaxe",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5636/gryphon-master-talonaxe"
    },
    {
      "x": 48.64,
      "y": 68.24,
      "label": "Qiaga the Keeper",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7996"
    },
    {
      "x": 26.94,
      "y": 48.59,
      "label": "Rhapsody Shindigger",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=5634/rhapsody-shindigger"
    },
    {
      "x": 22.99,
      "y": 57.73,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142714/venom-bottle"
    },
    {
      "x": 23.0,
      "y": 57.71,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142713/venom-bottle"
    },
    {
      "x": 23.21,
      "y": 58.65,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142703/venom-bottle"
    },
    {
      "x": 23.21,
      "y": 58.65,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142707/venom-bottle"
    },
    {
      "x": 23.22,
      "y": 58.64,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142704/venom-bottle"
    },
    {
      "x": 23.53,
      "y": 58.85,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142706/venom-bottle"
    },
    {
      "x": 23.54,
      "y": 58.8,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142702/venom-bottle"
    },
    {
      "x": 23.54,
      "y": 58.85,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142705/venom-bottle"
    },
    {
      "x": 31.55,
      "y": 57.76,
      "label": "Venom Bottle",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/object=142712/venom-bottle"
    }
  ],
  "Moonglade": [
    {
      "x": 36.18,
      "y": 41.79,
      "label": "Keeper Remulos",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11832/keeper-remulos"
    },
    {
      "x": 52.53,
      "y": 40.57,
      "label": "Loganaar",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=12042/loganaar"
    },
    {
      "x": 51.69,
      "y": 45.1,
      "label": "Rabine Saturna",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11801/rabine-saturna"
    }
  ],
  "Un'Goro Crater": [
    {
      "x": 45.54,
      "y": 8.72,
      "label": "Larion",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9118/larion"
    },
    {
      "x": 42.94,
      "y": 9.64,
      "label": "Muigin",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9119/muigin"
    },
    {
      "x": 71.64,
      "y": 75.96,
      "label": "Torwa Pathfinder",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9619/torwa-pathfinder"
    }
  ],
  "Swamp of Sorrows": [
    {
      "x": 34.29,
      "y": 66.14,
      "label": "Fallen Hero of the Horde",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=7572/fallen-hero-of-the-horde"
    },
    {
      "x": 47.93,
      "y": 54.78,
      "label": "Fel'zerul",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1443/fel-zerul"
    }
  ],
  "Azshara": [
    {
      "x": 29.25,
      "y": 40.21,
      "label": "Archmage Xylem",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8379/archmage-xylem"
    },
    {
      "x": 79.28,
      "y": 73.7,
      "label": "Duke Hydraxis",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=13278/duke-hydraxis"
    },
    {
      "x": 42.4,
      "y": 42.62,
      "label": "Ogtinc",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8405/ogtinc"
    },
    {
      "x": 28.11,
      "y": 50.09,
      "label": "Sanath Lim-yo",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=8395/sanath-lim-yo"
    }
  ],
  "Western Plaguelands": [
    {
      "x": 42.66,
      "y": 83.77,
      "label": "Alchemist Arbington",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11056/alchemist-arbington"
    },
    {
      "x": 65.77,
      "y": 75.37,
      "label": "Artist Renfray",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11936/artist-renfray"
    },
    {
      "x": 42.7,
      "y": 84.03,
      "label": "Commander Ashlam Valorfist",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10838/commander-ashlam-valorfist"
    },
    {
      "x": 70.22,
      "y": 73.71,
      "label": "Eva Sarkhoff",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11216/eva-sarkhoff"
    },
    {
      "x": 52.05,
      "y": 83.27,
      "label": "High Priest Thel'danis",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1854/high-priest-thel-danis"
    },
    {
      "x": 53.95,
      "y": 24.45,
      "label": "Lord Tirion Fordring",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=12126/lord-tirion-fordring"
    },
    {
      "x": 70.57,
      "y": 74.11,
      "label": "Magistrate Marduke",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11286/magistrate-marduke"
    },
    {
      "x": 50.79,
      "y": 77.85,
      "label": "Myranda the Hag",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11872/myranda-the-hag"
    },
    {
      "x": 43.45,
      "y": 83.73,
      "label": "Weldon Barov",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11023/weldon-barov"
    }
  ],
  "Felwood": [
    {
      "x": 51.21,
      "y": 82.11,
      "label": "Greta Mosshoof",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10922/greta-mosshoof"
    },
    {
      "x": 41.36,
      "y": 45.02,
      "label": "Impsy",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=14470/impsy"
    },
    {
      "x": 35.93,
      "y": 44.42,
      "label": "Lord Banehollow",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=9516/lord-banehollow"
    }
  ],
  "Alterac Mountains": [
    {
      "x": 80.5,
      "y": 66.92,
      "label": "Bath'rah the Windwatcher",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6176/bath-rah-the-windwatcher"
    },
    {
      "x": 86.02,
      "y": 78.88,
      "label": "Lord Jorach Ravenholdt",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=6768/lord-jorach-ravenholdt"
    }
  ],
  "Burning Steppes": [
    [
      {
        "x": 95.09,
        "y": 31.56,
        "label": "Cyrus Therepentous",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9459/cyrus-therepentous"
      },
      {
        "x": 12.44,
        "y": 31.63,
        "label": "Gorzeeki Wildeyes",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=14437/gorzeeki-wildeyes"
      },
      {
        "x": 40.2,
        "y": 34.24,
        "label": "Grark Lorkrub",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9520/grark-lorkrub"
      },
      {
        "x": 85.82,
        "y": 68.95,
        "label": "Helendis Riverhorn",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9562/helendis-riverhorn"
      },
      {
        "x": 85.41,
        "y": 70.06,
        "label": "Jalinda Sprig",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9561/jalinda-sprig"
      },
      {
        "x": 65.89,
        "y": 21.92,
        "label": "Kibler",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=10260/kibler"
      },
      {
        "x": 84.74,
        "y": 69.02,
        "label": "Marshal Maxwell",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9560/marshal-maxwell"
      },
      {
        "x": 65.15,
        "y": 23.91,
        "label": "Maxwort Uberglint",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9536/maxwort-uberglint"
      },
      {
        "x": 84.84,
        "y": 69.12,
        "label": "Mayara Brightwing",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9565/mayara-brightwing"
      },
      {
        "x": 12.69,
        "y": 31.64,
        "label": "Mor'zul Bloodbringer",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=14436/mor-zul-bloodbringer"
      },
      {
        "x": 84.56,
        "y": 68.68,
        "label": "Oralius",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9177/oralius"
      },
      {
        "x": 65.01,
        "y": 23.76,
        "label": "Ragged John",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9563/ragged-john"
      },
      {
        "x": 65.24,
        "y": 24.0,
        "label": "Tinkee Steamboil",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=10267/tinkee-steamboil"
      },
      {
        "x": 66.06,
        "y": 21.95,
        "label": "Yuka Screwspigot",
        "type": "quest",
        "url": "https://www.wowhead.com/classic/npc=9544/yuka-screwspigot"
      }
    ]
  ],
  "Winterspring": [
    {
      "x": 61.63,
      "y": 38.61,
      "label": "Felnok Steelspring",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10468/felnok-steelspring"
    },
    {
      "x": 54.55,
      "y": 51.2,
      "label": "Haleh",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10929/haleh"
    },
    {
      "x": 61.3,
      "y": 37.07,
      "label": "Kilram",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11192/kilram"
    },
    {
      "x": 61.33,
      "y": 37.13,
      "label": "Lilith the Lithe",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11191/lilith-the-lithe"
    },
    {
      "x": 63.79,
      "y": 73.76,
      "label": "Lorax",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10918/lorax"
    },
    {
      "x": 60.99,
      "y": 38.78,
      "label": "Malyfous Darkhammer",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10637/malyfous-darkhammer"
    },
    {
      "x": 61.33,
      "y": 37.19,
      "label": "Seril Scourgebane",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11193/seril-scourgebane"
    }
  ],
  "Eastern Plaguelands": [
    {
      "x": 81.47,
      "y": 59.66,
      "label": "Betina Bigglezink",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11035/betina-bigglezink"
    },
    {
      "x": 79.55,
      "y": 63.86,
      "label": "Caretaker Alen",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11038/caretaker-alen"
    },
    {
      "x": 81.44,
      "y": 59.82,
      "label": "Duke Nicholas Zverenhoff",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11039/duke-nicholas-zverenhoff"
    },
    {
      "x": 14.45,
      "y": 33.74,
      "label": "Egan",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11140/egan"
    },
    {
      "x": 81.73,
      "y": 57.83,
      "label": "Leonid Barthalomew the Revered",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11036/leonid-barthalomew-the-revered"
    },
    {
      "x": 26.54,
      "y": 74.73,
      "label": "Nathanos Blightcaller",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11878/nathanos-blightcaller"
    },
    {
      "x": 80.61,
      "y": 57.98,
      "label": "Smokey LaRue",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11033/smokey-larue"
    },
    {
      "x": 7.57,
      "y": 43.7,
      "label": "Tirion Fordring",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=1855/tirion-fordring"
    }
  ],
  "Tirisfal Glades": [
    {
      "x": 83.06,
      "y": 71.6,
      "label": "Alexi Barov",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11022/alexi-barov"
    },
    {
      "x": 83.28,
      "y": 69.23,
      "label": "Apothecary Dithers",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=11057/apothecary-dithers"
    },
    {
      "x": 83.13,
      "y": 68.94,
      "label": "High Executor Derrington",
      "type": "quest",
      "url": "https://www.wowhead.com/classic/npc=10837/high-executor-derrington"
    }
  ]
};
