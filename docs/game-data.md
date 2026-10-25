# Game data

[Back to Developing](developing.md)

Everything the player reads sits in `js/data/`. The model and the interface read these objects; apart from interface lines, the code holds no game text of its own. Where each figure comes from is listed in [DATA.md](../DATA.md).

## Countries and the record

| File | Object | Contents |
| --- | --- | --- |
| `countries.js` | `S.COUNTRIES`, `S.COUNTRY` | Each state's code, name, year of joining the euro, weight in the euro area, Okun coefficient and national central bank, and its yearly figures for 2008 to 2025: unemployment, inflation, debt, the 10-year yield and growth. `S.PERIPHERY` lists the states the crisis hit hardest, and `S.BANK_CRISES` the recorded stress in banks beyond what spreads show |
| `countries.js` | `S.CANDIDATES`, `S.ACCESSION` | The states outside the EU that a run may assume will join it (Difficulty > EU enlargement), with their figures of about 2024, and for each the year it joins, whether it already uses the euro without an agreement and, for Scotland, the years of its referendum and independence. They enter `S.COUNTRY`, but only the states the player chooses take part in a run (`S.game.states`). Their required items are in `cards-later.js` |
| `history.js` | `S.HIST` | What the historical bank and governments did each year: the main rate, the instruments in use, collateral waivers, emergency liquidity, loan programs and fiscal tightening; trust in the bank; the far-right share; and, after 2025, the seats in the Federal Parliament and the climate shocks of Selk's history |
| `flows.js` | `S.HIST_T2`, `S.EA_LENDING`, `S.EA_GDP` | TARGET2 balances by state at the end of each year, the Eurosystem's lending to banks and euro area output, 2008 to 2025, for the flow map |
| `names.js` | `S.BANK_NAMES` | The bank's name and initials in the 24 official languages |
| `map.js` | `S.MAP` | The outlines of the states, made by `tools/build-map.py` |

## Instruments, proposals and advisors

- `instruments.js`: `S.INSTRUMENTS` lists the bank's tools with their legal basis, the first year they can be used, a tag (`neutral`, `draghi`, `troika` or `intended`) and their weight in the backstop. `S.BACKSTOP_BASE` is the backstop with no tool in use.
- `proposals.js`: `S.PROPOSALS` lists what the bank can ask governments for, such as eurobonds and debt conversion. Each has a starting support, a threshold to pass, a yearly drift, its weight in the backstop once passed, and the share of program tightening it removes. `S.TREATY_GOALS` and `S.TREATY_STAGES` describe a treaty campaign.
- `advisors.js`: `S.ADVISORS` holds the nine schools. Each has one fictional advisor with a name, a member state, a biography, the claims the school makes and the evidence it cites; weights (how it values an option's attributes); params (the model parameters it believes, used for its forecasts); a rate rule; lines for its advice, one for each kind of option; and context lines, one for each situation (high debt, troubled banks, high inflation, falling prices, a slump, a climate shock, a calm year), which open its recommendation. `{state}`, `{s}`, `{p}` and `{u}` in a context line take the state concerned, the spread, inflation and unemployment.

## Cards

Cards live in `cards-common.js` (recurring cards such as the yearly rate decision and loan programs), `cards-pre.js` (2008 to 2025) and `cards-later.js` (2026 to 2070). `S.script(year, ids)` places cards on the agenda of a year; recurring cards come in through their `when` test.

```js
S.script(2013, ["my-card"]);
S.card("my-card", {
  title: "...", actor: "...", date: "2013",
  when: function (G) { return true; },
  text: "...",
  history: "What the historical bank did.",
  options: [
    { label: "...", text: "...", tags: ["neutral"], lean: 0.5, vote: true, onFail: 1,
      apply: function (G) { /* change G */ } },
    { label: "...", tags: ["intended"], lean: -0.5, apply: function (G) {} }
  ]
});
```

- Mark the option the historical bank chose in `S.HIST_CHOICE` in `js/data/cards-pre.js`. That option must add no effect of its own: the record already contains it.
- `lean` (-2 for the most dovish to 2 for the most hawkish), `novelty` (0 to 2), `help` (-1 to 1, for the periphery) and `attr` decide how Council members, advisors and the Federal Parliament react.
- `against: "XX"` names the member state an option acts against; its governor votes no.
- `vote: true` sends the option to the Governing Council; `onFail` names the option that applies when the Council rejects it. `rule` sets a stricter rule: `twothirds` for an objection that needs two thirds, `restrict` for a decision that needs two thirds.
- `tags` mark Draghi measures (`draghi`), a seat in the Troika (`troika`) and the intended path (`intended`). Players see the first two unless Settings > Game > Troika or Draghi measures hides that label; the third shows only with the Debug switch.
- Footnotes for the card go in `S.CARD_NOTES` in `js/data/notes.js`.
- `done: "key"` marks a measure taken once, such as a backup site for the payment system. After the year it was taken the option is no longer offered, and `G.flags["done:key"]` holds that year.

The quieter items that fill a calm year are listed in `FILLERS` in `js/model/game.js`, the crisis items that fill a crisis year in `CRISIS`. `S.game.crisisKinds(G)` names the kinds of crisis in a year (`debt`, `banks`, `slump`, `prices`, `deflation`, `climate`); a scripted card with `crisis: true`, or `crisis: "climate"`, makes its year a crisis year. Each run draws them in an order of its own, seeded by the game's id, which is set before the first year is drawn, so no two games open alike. Items not yet seen in the run come before those coming back, so a run meets as much of the pool as it can before anything repeats. Each item comes back at most every three years, with these properties:

- `once: true` for an event that happens only once in a run, such as the cost of the new building or the end of the 1 and 2 cent coins.
- `variants: [{}, { title, text, options }]` for an item that comes back: each return takes the next variant, which replaces the card's fields it names, and the item stops when the variants run out. Every item has `once` or `variants`; the data test checks it.
- `settled(G)` for a question a choice can close, such as banks' climate reports. Once it returns true the item does not come back.
- `essential: true` for an item that comes whatever the area of responsibility, such as emergency liquidity or a bank that needs capital. The area of responsibility (`Gm.SCOPE`) sets only how many of the other items fill the year.
- `pick(G)` for a crisis item about one state: it returns `{ code }` for the state in the worst position, or null when none fits.
- A decision is kept as it was taken (`entry.label`, and for the rate card `entry.rate` with the rate before and after), so a card whose options depend on the state of the game, such as the rate card, still shows the right decision afterwards. Once decided, the rate card shows the rate set as a small pill in its title when it is open, and gives the change from the year before; the agenda list shows nothing more.
- `S.game.followUp(G, id, years, args)` in a choice places a follow-up card on a later agenda. A follow-up with a `when` test comes only if the test still holds that year, so a matter settled meanwhile drops it.

## President names

`js/data/people.js` holds what the president form uses. `S.PEOPLE` lists, for every member state, 15 given names for men, 15 for women and 25 family names; a family name written `Kowalski/Kowalska` has a form for men and one for women, and `order: "family"` puts the family name first, as in Romania and Hungary (Popescu Andrei). `S.randomName(code)` draws a name, never an advisor's name or family name. `S.LANGS` gives each language the president's title, which an empty name takes; the language follows the member state unless the player picks another, English included. `S.LETTERS` lists the letters with diacritics of each European language for the keyboard under the name.

The same file holds the Governing Council. `S.GOVERNORS` gives each member state its central bank governors in order, each as a name and a gender (`"f"` or `"m"`); `S.BOARD` gives each Executive Board seat its holders with their state, hawkishness, closeness to the president and gender. The model counts women from these lists (`S.council.women`), and the card on women in the Council reads that count: it appears only while women are few and says how many sit on the Council.

## Rules and music

`js/data/rules.js` holds the rules that are data: `S.DIFFICULTY` (the voting values of each difficulty), `S.SCOPE` (the areas of responsibility and their item counts), `S.AGENDA` (the calm and crisis pools of filler cards), `S.ENDINGS` (each bad ending's text, title, code, crash panel and the figures it shows) and `S.BACKGROUNDS` (the start page's backdrops).

The music is in `js/data/music/`, with a folder for each playlist. `music.js` holds what the pieces share: `S.MUSIC`, the order of the pieces, the note onsets, the variant builder and TROIKA.RUN, which is in no playlist. `european/` has a file for each piece of the European playlist, the title screen's pieces included, each with its chords, bass, melody, tempo and voices (`S.MUSIC.piece`). `resistance/` has a file for each song of the resistance playlist: its tune, its chords, its tonic and, for a song not in 4/4, the eighths in a bar (`S.MUSIC.song`), then the variants made from it (`S.MUSIC.resist`); a note with no pitch is a rest. A variant is built with `S.MUSIC.variant(song, options)`, which moves the song to the piece's key, major or minor, and gives it the piece's tempo and voices; `bella-ciao.js` also holds the time-lapse. `test/data.test.js` checks that every tune lasts exactly as long as its chords. A new piece needs a file in `european/`, a script tag in `index.html` and an entry in `test/load.js`, a place in `S.MUSIC.order`, a variant in the file of a song, and a rule for when it plays in `wanted()` in `js/audio/music.js`.

## Glossary and notes

- `glossary.js`: `S.GLOSSARY` is a list of `[term, other forms, definition, category]`. The category is `"basics"` for what EU residents already know and readers outside the EU may not (the institutions, member states, the euro area, the treaties, the qualified majority), `"tools"` for the bank's tools, `"econ"` for economics and finance, `"game"` for the game and Selk's history, and is left out for the other terms, which are about the EU; the Glossary view shows the five categories in the order of `S.GLOSSARY_CATS`: For readers outside the EU, About the EU, The bank's tools, Economics and finance, The game and Selk's history. `S.linkify` turns the first mention of each term in a text into a button that opens its definition.
- `notes.js`: `S.NOTES` holds the footnotes, each with a title, a text and the phrases it attaches to (`anchor`). A note can point to another with `[[id]]` or `[[id|words]]`. `S.CARD_NOTES` lists the notes of each card.

## Achievements

`js/model/achievements.js` lists the achievements (`S.ACHIEVEMENTS`): each has an id, a name, a line that says how to earn it, and a test that reads the run and, for a vote, the vote just cast. `js/ui/achievements.js` runs the tests after every vote, initiative and year, keeps each one earned with its date in `ecbsim-achievements`, and announces it once. A new achievement needs only an entry in the list; a test that counts years uses `years(G)`, so a run from a file counts only the years played after its import.

Two rules keep achievements fair (`S.earnedBy`). A run marked by debug (`G.taint`, written by `S.taint` before each debug action that changes the run, and by Debug: begin in) earns none, except Market manipulator, which is marked `debug: true` and records the use. A run imported from a file carries a sandbox (`G.sandbox`, written by `S.sandbox` at the import): the achievements its run met at that moment stay out of reach, and its years count from the year of the import. An export never contains the achievements, and Settings > Game > Achievements can clear them all (`U.clearAchievements`, after a question). Against the odds needs a run played on Hard from its first year: a change of level in Game settings is kept in `G.levelLog`.
