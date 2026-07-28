# Střípky světla

## Story brief v2 — sjednocený s aktuální implementací

Tento dokument nahrazuje původní pracovní brief jako hlavní příběhová reference. Zachovává původní jádro, ale upravuje pořadí prvních událostí podle skutečně vznikajících Waves.

---

# 1. Pevné jádro příběhu

Nad malým městečkem **Jasnov** visí stará krystalová lucerna. Každý večer rozlévá barvy do okolního údolí a její rozsvícení je středobodem každoroční Slavnosti světel.

Během příprav na letošní slavnost lucerna praskne. Tři velké střípky odletí do různých částí údolí:

1. zelený střípek do Mechového lesa,
2. modrý střípek do starého dolu pod horou,
3. poslední střípek do chrámu spojeného se spícím Strážcem.

Vedle nich se po krajině rozptýlí i malé **světelné jiskry**. Ty nejsou jedním ze tří hlavních střípků. Jsou pouze zbytkovou energií lucerny, stopami a drobnými úlomky světla.

Světu nehrozí okamžitá apokalypsa. Údolí jen pomalu bledne:

- tráva ztrácí barvu,
- zvířata jsou zmatená,
- cesty zarůstají nebo mění směr,
- staré mechanismy se probouzejí,
- blížící se bouře začíná být skutečnou hrozbou.

Hráč je obyčejný mladý poslíček nebo poslíčkyně. Není vyvolený bojovník ani mág. Byl poblíž lucerny v okamžiku jejího prasknutí a do jeho malé cestovní lampičky se dostal nepatrný, zatím spící úlomek.

Ten se později probudí jako světelný duch **Puk**.

Hlavní viditelný cíl je:

> Najít tři velké střípky dřív, než začne Slavnost světel a než údolí zasáhne bouře.

Postupně ale vyjde najevo, že lucerna nepraskla náhodou a že její obnovení nemusí být jednoznačně správným řešením.

---

# 2. Tón a témata

## Tón

- cozy luminous fantasy,
- jemná melancholie,
- humor vyrůstající z postav, ne z parodie,
- malé osobní problémy vedle velkého tajemství,
- svět, který není na konci zachráněn pouze silou.

## Hlavní témata

- vztahy jsou důležitější než vlastnictví magického předmětu,
- správné rozhodnutí nemusí být z dostupných informací zřejmé,
- komunita dokáže nahradit systém závislý na jediném zdroji,
- pomoc vedlejším postavám se později vrací praktickým způsobem,
- změna může být bolestivá, ale někdy je nutná pro budoucnost.

---

# 3. Vztah kapitol a implementačních Waves

Příběhová kapitola není totéž jako jedna vývojová Wave.

Jedna kapitola může být rozdělená do několika Waves, aby každá přidala pouze několik stabilních systémů.

## Aktuální rozdělení

### Wave 1 — Světelná stopa

Wave 1 je krátký hratelný prolog na okraji Jasnova krátce po prasknutí lucerny.

Hráč:

- potká Milu,
- získá první konkrétní úkol,
- najde u staré svatyně malou světelnou jiskru,
- vrátí ji Mile,
- zjistí, že světelná stopa směřuje k Mechovému lesu.

Nalezená jiskra **není zelený hlavní střípek**. Je to pouze stopa a zdroj energie potřebný k probuzení úlomku v hráčově lampičce.

Protože současná Wave 1 přímo nezobrazuje prasknutí lucerny, Wave 2 musí tuto událost doplnit krátkou světelnou vzpomínkou vyvolanou navrácenou jiskrou. Tím se potvrdí, že hráč byl při prasknutí přítomen, aniž by se musela Wave 1 předělávat.

### Wave 2 — Zmizelé stužky

Wave 2 je druhý úsek **Kapitoly 1 — Den, kdy tráva zešedla**.

Obsahuje:

- světelnou vzpomínku na prasknutí lucerny,
- probuzení Puka,
- jeden krátký doručovací úkol potvrzující roli hráče jako poslíčka,
- přechod na festivalové náměstí Jasnova,
- setkání se strážkyní Renou,
- stopu u skladu,
- nalezení Špunta,
- první skutečnou příběhovou volbu,
- rozdílný způsob otevření brány do Mechového lesa,
- uložení rozhodnutí.

Wave 2 končí před vstupem do Mechového lesa.

### Wave 3 — První kroky v Mechovém lese

Wave 3 má navázat:

- první částí Mechového lesa,
- rozdílným pokračováním Špuntovy linky,
- prvním jednoduchým soubojem,
- prvním aktivovaným lesním svatostánkem,
- jemnou stopou po neznámé dívce v plášti.

Tím se první combat vertical slice odkládá z Wave 2 do Wave 3, ale zůstává v rané části hry.

---

# 4. Kapitola 1 — Den, kdy tráva zešedla

## Hlavní příběh

Přípravy Slavnosti světel naruší prasknutí krystalové lucerny. Hráč se v prvních úsecích příběhu postupně dozvídá rozsah problému, pomáhá Mile a obyvatelům a získá Puka.

Důležité beaty kapitoly:

1. prasknutí lucerny,
2. rozptýlení tří velkých střípků a mnoha malých jisker,
3. nalezení malé jiskry u svatyně,
4. probuzení Puka,
5. návrat do Jasnova,
6. první poslíčkovský úkol ve městě,
7. případ zmizelých stužek,
8. rozhodnutí kolem Špunta,
9. otevření cesty do Mechového lesa.

Na konci kapitoly hráč opouští město a vydává se po stopě zeleného střípku.

## Pukovo probuzení

Malý úlomek se dostal do hráčovy lampičky už při prasknutí lucerny. Zůstal však neaktivní.

Teprve když hráč přinese světelnou jiskru ze staré svatyně, energie jiskry:

- vyvolá krátkou vzpomínku na prasknutí lucerny,
- aktivuje spící úlomek,
- probudí Puka.

Puk tedy není nalezený collectible ani jeden z hlavních střípků. Je živým projevem malého úlomku, který s hráčem zůstane.

## Krátký doručovací beat

Po Pukově probuzení dá Mila hráči zapečetěný festivalový soupis nebo balíček pro strážkyni Renu.

Tento malý úkol:

- potvrzuje, že hráč je skutečně poslíček,
- přirozeně ho vede na festivalové náměstí,
- představí Renu bez náhodného exposition rozhovoru,
- propojí doručení s odhalením, že ve skladu chybí stužky.

Nejde o samostatný quest log ani několik fetch questů. Je to jediný krátký příběhový beat.

## Vedlejší linka — Špunt a zmizelé stužky

Z festivalového skladu mizí barevné stužky. Po prohlédnutí rozházených zásob a stop za skladem hráč narazí na malého divokého lišáka **Špunta**, který drží jednu stužku v tlamě.

Špunt nemluví lidskou řečí. Je chytrý, ostražitý a zjevně něco sleduje, ale dostupné důkazy vypadají proti němu.

### Varianta A — Špunta ochránit

Hráč namítne, že jedna stužka není dostatečný důkaz, a postaví se mezi Špunta a Renu.

Špunt uteče a před zmizením se krátce ohlédne.

Důsledky:

```text
spunt_outcome = protected
spunt_relation = friendly_seed
ranger_trust -= 1
```

U lesní brány se Špunt ještě jednou objeví a ukáže nebo uvolní skrytý mechanismus.

### Varianta B — Předat Špunta Reně

Hráč uzná, že Rena musí případ nejprve bezpečně vyšetřit.

Špunt skončí v malé bezpečné ohradě. Rena nepoužije násilí a nejde o trest, ale o dočasné zadržení.

Důsledky:

```text
spunt_outcome = handed_over
spunt_relation = distrustful_seed
ranger_trust += 1
```

U lesní brány Rena otevře průchod oficiálně svým klíčem.

### Skrytá pravda

Špunt stužky nekrade pro sebe. Jednu používá jako označení nebezpečné pukliny v Mechovém lese.

Hráč to ve Wave 2 ještě nezjistí.

## Závěrečný náznak dalšího konfliktu

Za otevřenou bránou může Puk zahlédnout:

- krátký modrý záblesk,
- čerstvou stopu cizí boty,
- nebo útržek tmavého pláště.

Nezazní jméno Iria a postava se zatím přímo nepředstaví. Jde pouze o první náznak, že střípky hledá ještě někdo jiný.

---

# 5. Kapitola 2 — Les, který zapomněl cesty

## Hlavní příběh

Mechový les se po ztrátě zeleného střípku mění. Cesty se přesouvají, kořeny blokují průchod a lesní strážce se proměnil v prvního bosse.

Hráč:

- projde měnícím se lesem,
- aktivuje tři malé svatyně,
- učí se první jednoduché souboje,
- porazí nebo uklidní Kořenového strážce,
- získá zelený střípek.

Na místě najde známky toho, že zde před ním byla tajemná dívka v plášti.

## Vedlejší linka podle rozhodnutí z první kapitoly

### Varianta A — Špuntův domov

Pokud hráč Špunta ochránil, lišák ho zavede ke své noře. Puklina označená stužkou ohrožuje jeho rodinu nebo skupinu lesních lišek.

Hráč může:

- puklinu okamžitě uzavřít,
- nebo nejprve prohledat její dno a získat vzácný předmět.

Rychlá záchrana zvýší vztah se Špuntem. Riskantní průzkum poskytne lepší odměnu, ale lišky se budou hráče později bát.

### Varianta B — Důkaz pro Renu

Pokud byl Špunt zadržen, Rena pošle hráče hledat zbytek údajných ukradených stužek.

Hráč zjistí pravdu o puklině a může:

- očistit Špunta a osobně ho propustit,
- předat důkazy Reně a nechat ji chybu napravit oficiálně.

Obě možnosti mohou vztah se Špuntem napravit, ale jiným způsobem.

Výsledek linky:

```text
spunt_relation = friendly | neutral | fearful
```

Linka nezmizí kvůli první volbě. Pouze se odehraje jinou scénou a jiným způsobem.

---

# 6. Volitelná vícedílná linka — Nephi, Pán brambor

## Základ postavy

**Nephi** je excentrický správce starých zásobovacích sklepů a terasovitých polí. Místní mu říkají:

> **Pán brambor**

Titul používá naprosto vážně.

Nephi není neschopný komický maskot. Zpočátku může působit směšně, ale postupně se ukáže, že:

- výborně rozumí půdě, zavlažování a skladování,
- jeho zásoby drží několik osad při životě,
- zná část starých mechanismů údolí,
- dokáže podpořit komunitní cestu v závěru.

Je trochu teatrální, tvrdohlavý a velmi pyšný na svou úrodu. Humor vzniká z kontrastu mezi vznešeností jeho titulu a jeho naprostou oddaností hlízám.

## Lokace

Nephi spravuje:

> **Pátou hlíznou stanici**

Místní jí běžně říkají:

> **Stanice V**

Jde o systém:

- podzemních sklepů,
- terasovitých polí,
- starého zavlažování,
- světelných lamp pro podzemní pěstování,
- zásobovacích tunelů.

Označení „Stanice V“ funguje uvnitř světa a zároveň nese skrytou osobní narážku. Ve hře se nesmí používat moderní výrazy typu konzole, PlayStation nebo PotatoStation.

## Umístění v příběhu

Nephi se nemá objevit ve Wave 2.

Jeho side arc se může otevřít až po zpřístupnění širší části údolí a rozprostřít se přes Kapitoly 2 až 4. Epilog může přijít v Kapitole 5 nebo po hlavním finále.

## Šestidílný questový oblouk

Názvy questů nenápadně tvoří akrostich **LEVICE**. Nikdo ve hře na akrostich neupozorňuje.

### L — Lucerny pod hlínou

Hráč poprvé dorazí na Stanici V. Podzemní pěstební lampy zhasínají a část úrody přestává růst.

Cíl:

- obnovit několik světelných vedení,
- poznat Nephiho,
- zjistit, že problém souvisí s blednutím údolí.

### E — Echa prázdných sklepů

Ze skladů mizí hlízy, ale nejde o obyčejnou krádež. Staré servisní tunely se po probuzení mechanismů znovu otevřely.

Cíl:

- projít sklepní tunely,
- najít zdroj hluku,
- rozhodnout, zda zásoby přesunout, nebo riskovat opravu původního skladu.

### V — Vláha pro stará pole

Zavlažovací systém přestal přivádět vodu na horní terasy.

Cíl:

- obnovit vodní kanály,
- zvolit mezi rychlou provizorní opravou a trvalejším napojením na starý mechanismus,
- případně využít pomoc horníka nebo lesních tvorů podle předchozích vztahů.

### I — I ve tmě něco klíčí

Nephi objeví odolnou světelnou hlízu, která roste i bez lucerny.

Hráč rozhodne, zda:

- ji okamžitě rozdělit hladovějícím,
- nebo část úrody uchovat pro rozmnožení a budoucí sadbu.

Nejde o jednoduchou volbu sobectví proti dobrotě. Okamžitá pomoc řeší současný problém, uchování sadby může zachránit další roky.

### C — Cesta k poslední sadbě

Během zhoršující se bouře musí být poslední bezpečná sadba převezena ze Stanice V do chráněného místa.

Průběh se mění podle:

- Nephiho důvěry,
- opraveného zavlažování,
- vztahu se Špuntem,
- zachráněného horníka,
- podpory Reny.

### E — Epilog Pána brambor

Výsledek Nephiho linky se projeví v závěru:

- úroda může zásobit obyvatele během bouře,
- zachráněná sadba může obnovit pole po změně světla,
- Nephi může přispět ke komunitnímu rozsvěcení nové lucerny,
- špatný výsledek není konec hry, ale údolí bude mít těžší obnovu.

## Stav Nephiho linky

```ts
type NephiArcState = {
  stage:
    | "locked"
    | "started"
    | "lamps-restored"
    | "water-restored"
    | "seed-decided"
    | "completed";
  trust: number;
  stationVRestored: boolean;
  foodShared: boolean;
  seedStockSaved: boolean;
};
```

Nephiho linka může přidávat `communitySupport`, ale nesmí sama automaticky odemknout nejlepší konec.

---

# 7. Kapitola 3 — Ozvěny pod horou

## Hlavní příběh

Druhý velký střípek dopadl do starého dolu a probudil zapomenuté stroje. Důl je napůl klasická šachta a napůl stará voxelová továrna.

Hráč zde poprvé přímo potká **Iriu**, učednici někdejšího správce lucerny. Iria vezme modrý střípek těsně před hráčem, ale nechce bojovat.

Tvrdí:

> Lucerna sice údolí barví, ale zároveň bere energii něčemu, co spí hluboko pod horou.

Než stihne vše vysvětlit, důl se začne hroutit.

## Vedlejší linka — Zasypaný tunel

Jeden z horníků zůstane uvězněný a současně se Iria pokouší uniknout se střípkem.

Hráč si musí vybrat.

### Varianta A — Zachránit horníka

Iria uteče a hráč nezíská střípek.

```text
people_first = true
miner_rescued = true
iria_respect += 1
```

Horník se později vrátí jako mechanik a může pomoci s energetickým kanálem, Stanicí V nebo chrámovým mechanismem.

### Varianta B — Pronásledovat Iriu

Hráč získá část energie střípku, ale horníka zachrání ostatní až později a bude zraněný.

```text
people_first = false
miner_rescued = false
player_power += 1
```

Pokud má hráč dobrý vztah se Špuntem, lišák může najít vedlejší tunel a horníka zachránit i během pronásledování.

---

# 8. Kapitola 4 — Strážce bez srdce

## Hlavní příběh

Iria zamíří do chrámu nad horou. Zde se ukáže pravda.

Pod údolím spí obrovský kamenný Strážce, který kdysi chránil krajinu před otřesy a bouřemi. Lucerna byla vytvořena z jeho srdce. Každý rok svítí krásněji, ale Strážce postupně slábne.

Iria lucernu rozbila úmyslně, protože se blíží silná bouře a chce Strážce probudit. Nevěděla však, že se bez lucerny začnou rozpadat jednotlivé části krajiny.

Hlavní konflikt není dobro proti zlu, ale otázka:

> Zachovat současný krásný svět, nebo riskovat změnu, aby měl budoucnost?

## Stezka pro všechny

Pokud hráč pomáhal lidem a vytvořil dost vztahů, vznikne společná cesta.

Přispět mohou:

- zachráněný horník,
- Rena,
- Špunt a lesní tvorové,
- Mila a obyvatelé Jasnova,
- Nephi a obnovená Stanice V.

Společně opraví starý energetický kanál a umožní řešení, které není založené jen na síle hráče.

## Zapomenutá zbrojnice

Pokud hráč upřednostňoval střípky a osobní sílu, otevře se stará Strážcova zbrojnice.

Hráč získá silnější schopnosti a projde chrámem bojovou cestou. Finále bude mechanicky jednodušší, ale některé postavy ho nepodpoří.

---

# 9. Kapitola 5 — Poslední světlo

Během začínající bouře musí hráč rozhodnout, co udělat se získanými střípky.

## Konec A — Obnovit lucernu

Barvy se okamžitě vrátí a Slavnost světel proběhne.

Strážce ale zůstane spát a Iria odchází hledat jiné řešení. Je to krásný, ale nejistý konec.

## Konec B — Probudit Strážce

Lucerna zhasne a Jasnov už nikdy nebude zářit stejně jako dřív.

Strážce se probudí, zastaví bouři a krajina začne získávat nové, přirozenější barvy.

Obnovená Stanice V a zachráněná sadba mohou výrazně zmírnit první období změny.

## Konec C — Rozdělit světlo

Tato možnost je dostupná jen tehdy, pokud hráč získal dostatečnou podporu různých postav a obnovil potřebná spojení v údolí.

Část energie se vrátí lucerně a část Strážci. Lucerna už nesvítí sama. Každý rok ji musí společně rozsvítit obyvatelé města, lesní tvorové i hráč.

Nephi může během epilogu přivést zásoby ze Stanice V pro první společnou slavnost nového období.

Závěrečná myšlenka:

> Svět nezachrání jeden magický předmět, ale vztahy, které hráč během cesty vytvořil.

---

# 10. Princip větvení

Příběh používá přístup **branch and fold**.

Rozhodnutí mění:

- vedlejší scény,
- pomocníky,
- dialogy,
- způsob řešení problémů,
- menší odměny,
- podobu závěru.

Hlavní kapitoly se ale znovu spojují, aby hra nevytvářela několik kompletně odlišných kampaní.

```text
Kapitola 1
   ├── ochránit Špunta
   └── předat Špunta Reně
          ↓
Kapitola 2 nabídne dvě verze Špuntovy linky
          ↓
obě se vrátí ke společnému zelenému střípku
          ↓
Kapitola 3 vytvoří volbu horník vs. Iria
          ↓
Nephiho volitelná linka může procházet Kapitolami 2–4
          ↓
Kapitola 4 kombinuje vztahy a praktickou pomoc
          ↓
3 hlavní varianty konce + rozdílné epilogy
```

---

# 11. Základní stav příběhu

Přesná implementace může používat více dílčích typů, ale dlouhodobý příběhový stav musí uchovat alespoň:

```ts
type StoryState = {
  chapterId: 1 | 2 | 3 | 4 | 5;
  stage: string;

  pukAwakened: boolean;
  majorShardsRecovered: readonly ("green" | "blue" | "heart")[];

  spuntOutcome: "protected" | "handed-over" | null;
  spuntRelation: "unknown" | "friendly" | "neutral" | "fearful" | "distrustful";
  rangerTrust: number;

  peopleFirst: boolean | null;
  minerRescued: boolean | null;
  iriaRespect: number;

  communitySupport: number;
  nephiArc: NephiArcState;
};
```

Důležité zásady:

- explicitní rozhodnutí se nesmí odvozovat pouze z číselného vztahu,
- malé světelné jiskry se nesmí počítat jako hlavní střípky,
- `spuntOutcome` zůstává uložený i po pozdější změně `spuntRelation`,
- vedlejší linky přispívají k závěru, ale žádná jediná ho automaticky neurčuje,
- nejlepší konec vyžaduje více různých forem podpory.

---

# 12. Produkční roadmapa příběhu

## Hotovo / bezprostřední stav

- Wave 1: Mila, stará svatyně, světelná jiskra, návrat.
- Visual passes: sprite postavy, texturovaný voxel svět, camera-relative ovládání, sky environment.

## Wave 2

- vzpomínka na prasknutí lucerny,
- probuzení Puka,
- doručení pro Renu,
- festivalové náměstí,
- Špunt,
- první volba,
- autosave,
- lesní brána.

## Wave 3

- první část Mechového lesa,
- pokračování důsledku Špuntovy volby,
- první jednoduchý combat vertical slice,
- první lesní svatyně,
- náznak dalšího hledače střípků.

## Pozdější Waves

- dokončení Mechového lesa a Kořenový strážce,
- otevření Nephiho vícedílné side linky,
- důl a Iria,
- chrám a pravda o Strážci,
- finální volba a epilogy.

---

# 13. Story guardrails pro další prompty

Každý další Wave prompt musí respektovat:

1. Existují přesně tři velké střípky.
2. Malé světelné jiskry nejsou velké střípky.
3. Hráč je poslíček, ne předem slavný hrdina.
4. Puk se probudí z úlomku v hráčově lampičce.
5. Špuntova první volba neodhalí pravdu o puklině.
6. Rena není záporná postava.
7. Iria není prostý padouch.
8. Branch-and-fold zachovává důsledky, ale nevytváří separátní kampaně.
9. První souboj může přijít až ve Wave 3.
10. Nephi je pozdější volitelný side content a nesmí nafukovat Wave 2.
11. Humor kolem Pána brambor musí fungovat uvnitř světa bez moderních meta odkazů.
12. Nejlepší konec vzniká spoluprací více postav a komunit, ne splněním jediného side questu.
