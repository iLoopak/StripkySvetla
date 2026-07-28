import type { DialogueDefinition } from "../types";

export const storyDialogues = [
  {
    id: "mila-introduction",
    speakerName: "Mila",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        text: "Díky světlu, někdo přišel. Po prasknutí lucerny dopadla ke staré svatyni drobná záře.",
        next: "request",
      },
      {
        id: "request",
        text: "Není to pravý střípek, jen světelná jiskra. Najdeš ji pro mě, prosím?",
      },
    ],
  },
  {
    id: "mila-searching",
    speakerName: "Mila",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        text: "Jiskra dopadla poblíž staré svatyně. Její světlo mezi kameny určitě zahlédneš.",
      },
    ],
  },
  {
    id: "mila-return",
    speakerName: "Mila",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        text: "Ano, to je ona. Počkej… nestáčí se k lesu. Míří přímo k tvé lampičce.",
        next: "react",
      },
      {
        id: "react",
        text: "Světlo se probouzí. Zůstaň klidně stát.",
      },
    ],
  },
  {
    id: "lantern-memory",
    speakerName: "Vzpomínka světla",
    startNodeId: "crack",
    nodes: [
      {
        id: "crack",
        text: "Nad Jasnovem praská hlavní lucerna. Tři velké střípky odlétají do údolí.",
        next: "fragment",
      },
      {
        id: "fragment",
        text: "Jeden nepatrný úlomek padá k poslíkovi pod lucernou a mizí v jeho lampičce.",
        next: "spark",
      },
      {
        id: "spark",
        text: "Dnešní drobná jiskra není hlavní střípek. Jen znovu probudila to, co v lampičce čekalo od prasknutí.",
      },
    ],
  },
  {
    id: "puk-awakening",
    speakerName: "Puk",
    startNodeId: "puk",
    nodes: [
      {
        id: "puk",
        text: "Tak konečně. V té lampě je mnohem méně místa, než by člověk čekal.",
        next: "mila",
      },
      {
        id: "mila",
        speakerName: "Mila",
        text: "Ta lampička právě promluvila?",
        next: "correction",
      },
      {
        id: "correction",
        text: "Ne. Já jsem promluvil. Lampička pořád jen svítí.",
        next: "forest",
      },
      {
        id: "forest",
        text: "A velké světlo táhne k Mechovému lesu. Dost naléhavě, mimochodem.",
      },
    ],
  },
  {
    id: "mila-rena-delivery",
    speakerName: "Mila",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        text: "Než se vydáme k lesu, odnes Reně tento zapečetěný festivalový soupis.",
        next: "courier",
      },
      {
        id: "courier",
        text: "Jsi pořád náš nejspolehlivější poslíček. Rena čeká u skladu na náměstí.",
      },
    ],
  },
  {
    id: "mila-after-delivery",
    speakerName: "Mila",
    startNodeId: "start",
    nodes: [
      {
        id: "start",
        text: "Soupis je zapečetěný. Cesta do Jasnova vede na jih kolem luceren.",
      },
    ],
  },
  {
    id: "rena-delivery",
    speakerName: "Rena",
    startNodeId: "delivery",
    nodes: [
      {
        id: "delivery",
        text: "Zásilka od Mily? Dobře. Pečeť je neporušená.",
        next: "count",
      },
      {
        id: "count",
        text: "Počkej. Podle soupisu chybí další svazek festivalových stužek.",
        next: "request",
      },
      {
        id: "request",
        text: "Prohlédni okolí skladu. Já zkontroluji bránu a zbytek beden.",
      },
    ],
  },
  {
    id: "spunt-confrontation",
    speakerName: "Rena",
    startNodeId: "evidence",
    nodes: [
      {
        id: "evidence",
        text: "Lišák, stužka v tlamě a stopy od skladu. Vypadá to jednoznačně.",
        next: "puk",
      },
      {
        id: "puk",
        speakerName: "Puk",
        text: "Vypadá. Což není totéž jako je.",
        next: "choice",
      },
      {
        id: "choice",
        speakerName: "Poslík",
        text: "Rena čeká na tvůj úsudek.",
        choices: [
          {
            id: "protect-spunt",
            text: "„Jedna stužka ještě není důkaz. Nechte ho být.“",
            next: "protected",
            outcome: "protected",
          },
          {
            id: "hand-over-spunt",
            text: "„Rena má pravdu. Nejdřív musíme zjistit, co provedl.“",
            next: "handed-over",
            outcome: "handed-over",
          },
        ],
      },
      {
        id: "protected",
        speakerName: "Rena",
        text: "Nesouhlasím. Ale tvůj úsudek teď přijmu. Jestli se mýlíš, poneseš za to odpovědnost.",
        next: "protected-puk",
      },
      {
        id: "protected-puk",
        speakerName: "Puk",
        text: "Ohlédl se. Obyčejní zloději mívají při útěku méně starostí.",
      },
      {
        id: "handed-over",
        speakerName: "Rena",
        text: "Rozumné. Neublížím mu, jen ho nechám v bezpečné ohrádce, než zjistíme víc.",
        next: "handed-puk",
      },
      {
        id: "handed-puk",
        speakerName: "Puk",
        text: "Bezpečné ano. Jednoduché nejspíš ne.",
      },
    ],
  },
  {
    id: "gate-protected",
    speakerName: "Puk",
    startNodeId: "spunt",
    nodes: [
      {
        id: "spunt",
        text: "Špunt se protáhl mezerou a uvolnil starou západku. Zdá se, že nezapomněl.",
        next: "hint",
      },
      {
        id: "hint",
        text: "Za bránou právě probliklo modré světlo. A nebylo naše.",
      },
    ],
  },
  {
    id: "gate-handed-over",
    speakerName: "Rena",
    startNodeId: "key",
    nodes: [
      {
        id: "key",
        text: "Bránu otevřu služebním klíčem. Za ní už začíná Mechový les.",
        next: "hint",
      },
      {
        id: "hint",
        speakerName: "Puk",
        text: "Mezi stromy probliklo modré světlo. Někdo je před námi.",
      },
    ],
  },
] as const satisfies readonly DialogueDefinition[];

export const dialoguesById: Readonly<Record<string, DialogueDefinition>> =
  Object.fromEntries(storyDialogues.map((dialogue) => [dialogue.id, dialogue]));
