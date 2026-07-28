# Střípky světla

Malá webová voxelová JRPG o světle, které se vrací do zapomenutého světa. Projekt
je ve stavu **Wave 0 — technický základ**.

## Stack

Vite, React, strict TypeScript, Babylon.js, Zustand, Vitest, ESLint a Prettier.
Veškerý současný vizuál vzniká programově bez externích assetů.

## Spuštění

Požadována je podporovaná LTS verze Node.js a npm.

```bash
npm install
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
- Kamera: tažení myší
- Přiblížení: kolečko myši

## Architektura

React mountuje jediný canvas a vykresluje stavové UI. `GameRuntime` vlastní Babylon
engine, scénu, render loop, vstup a jejich lifecycle. Zustand přenáší pouze omezeně
aktualizovanou telemetrii a stav inicializace do HUD. Procedurální svět, postava,
vstup a čisté mapové funkce mají oddělené moduly.

Podrobnosti jsou v [docs/architecture.md](docs/architecture.md).

## Wave 0 obsahuje

- celostránkovou Babylon.js scénu a responzivní české UI,
- stylizovanou 17 × 17 voxelovou diorámu s terasami, cestou, potokem, stromy,
  kameny a svatyní,
- zářící, animovaný krystal s lehkými procedurálními efekty,
- blocky postavu s idle a walk animací,
- pohyb nezávislý na FPS, hranice mapy a jednoduchou pochozí plochu,
- izometricky působící ovladatelnou kameru,
- bezpečný lifecycle pro React Strict Mode a hot reload,
- testy čisté herní logiky a CI.

## Záměrně zatím neobsahuje

Souboje, NPC, questy, dialogy, inventář, ukládání, audio, gamepad, dotykové
ovládání, backend, multiplayer, map editor, skutečné chunky, nekonečný svět,
těžení ani pokládání bloků. Tyto systémy patří do pozdějších Wave.
