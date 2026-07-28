# Střípky světla

Malá webová voxelová JRPG o světle, které se vrací do zapomenutého světa. Projekt
je ve stavu **Wave 1 — první průzkumný gameplay loop**.

Hráč se na okraji Jasnovy setká se správkyní slavnosti Milou, přijme krátký
úkol, najde světelnou jiskru u staré svatyně a vrátí se se stopou vedoucí
k Mechovému lesu.

## Stack

Vite, React, strict TypeScript, Babylon.js, Zustand, Vitest, ESLint a Prettier.
Veškerý vizuál vzniká programově bez externích assetů.

## Spuštění

Požadována je podporovaná LTS verze Node.js a npm.

```bash
npm ci
npm run dev
```

Produkční kontrola:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Ovládání

- Pohyb: `WASD` nebo šipky
- Interakce a pokračování dialogu: `E` nebo `Enter`
- Dialog lze ovládat také tlačítkem „Pokračovat“
- Kamera: tažení myší
- Přiblížení: kolečko myši

## Architektura

React mountuje jediný canvas a vykresluje stavové UI. `GameRuntime` vlastní
Babylon engine, scénu, render loop, vstup, interakce a jejich lifecycle. Zustand
je jediný sdílený zdroj pro story stage, dialog, objective, prompt, feedback
a omezeně aktualizovanou telemetrii.

Mapa, entity, postavy, dialogy a objectives jsou v typované `src/content`
vrstvě. Renderer a interaction system pracují s obecnými definicemi místo
konkrétních podmínek pro Milu nebo jiskru.

Podrobnosti jsou v [docs/architecture.md](docs/architecture.md).

## Wave 1 obsahuje

- data-driven mapu okraje Jasnovy s terénem, dekoracemi a kolizemi,
- obecné definice NPC, collectibles a interakcí,
- procedurální blocky NPC Milu se stavovými dialogy,
- lineární dialogový overlay s blokací pohybu a kamery,
- story state machine a objective mapování,
- obecný proximity interaction system s jednorázovým vstupem,
- animovanou světelnou jiskru s procedurální odezvou po sebrání,
- HUD pro aktuální cíl, contextual prompt a krátké feedback zprávy,
- kolize s vodou, svatyní, Milou, dekoracemi a hranicemi mapy,
- bezpečný lifecycle pro React Strict Mode a hot reload,
- unit testy čisté příběhové, interakční, vstupní a kolizní logiky.

## Záměrně zatím neobsahuje

Souboje, nepřátele, HP, inventář, vybavení, ukládání, audio, branching dialogy,
dialogové volby, více map, přechody mezi mapami, plný quest log, backend,
multiplayer, gamepad, dotykové ovládání, map editor, skutečné chunky, nekonečný
svět, těžení ani pokládání bloků.
