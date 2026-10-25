# Saved state

[Back to Developing](developing.md)

## The run

A run is one object, `S.G`, saved as JSON text. It holds no functions: cards are named by their id and built when needed with `S.game.card(G, entry)`. Random numbers come from a generator whose state is kept in `G.rng`, so a loaded save continues exactly as the original would have. `S.game.create(opts)` in `js/model/game.js` makes a new run.

| Field | Meaning |
| --- | --- |
| `v`, `mode`, `year`, `startYear` | Save format version, period (`pre` or `post`), current year and first year |
| `rng` | The state of the random generator |
| `president`, `presidents` | The president in office and those before |
| `advisors`, `swapYear` | The three advisors and the year one was last replaced |
| `pol` | The bank's policy: rate, negative rate, instruments in use, collateral rules, waivers, emergency liquidity per state, EIB purchases |
| `used` | Draghi measures and Troika seats used, with their first year, and the count of choices on the intended path |
| `programs` | Loan programs per state: years, the bank's role, terms and size |
| `esm`, `ngeu` | Whether the stability fund and the recovery fund exist |
| `proposals`, `treaty` | Support for each proposal, and the treaty campaign's goal, stage and progress |
| `c` | Each state: entry and exit years, the model's changes from the record, its figures for the year and its exit risk |
| `accession` | The states outside the EU that the run assumes will join it (Difficulty > EU enlargement); each has an entry in `c` with `cand`, `eu` (the year it joined the EU, or null) and, for Scotland, `independent` (the year of independence, or null) |
| `ea` | The euro area: trust, the far-right share and their changes |
| `council`, `parl` | The Governing Council's members, and the Federal Parliament after 2041 |
| `agenda`, `initiatives`, `initUsed` | The year's items, initiatives left and those used |
| `log`, `reports`, `series` | The archive, the year reports and the figures for the charts |
| `over`, `finished` | Why and when a run ended badly, or which period ended well |

## Storage

The game keeps its data in this tab (`sessionStorage`) until the player chooses to keep it on this computer (`localStorage`), as in Selk.

Settings > Storage holds the choice, then a list of every key with its size, a view of its contents and a delete button. Last come the file operations: export and import of games as a file, and two buttons that delete the game data (the saves and the achievements) with or without the settings.

When the tab is about to close with progress kept only in it, the browser asks first; if the player stays, the game offers once to keep the progress on this computer.

| Key | Where | What |
| --- | --- | --- |
| `ecbsim-settings` | The chosen storage | Settings |
| `ecbsim-save-slots` | The chosen storage | The list of saves: each one's slot, kind, game, number and name |
| `ecbsim-save-auto-N`, `ecbsim-save-manual-N` | The chosen storage | Each save: when it was made, the year, the period, the president and the run |
| `ecbsim-debug-pos` | The chosen storage | Where the debug panel was left |
| `ecbsim-achievements` | The chosen storage | Each achievement earned, with the date, kept across games; never exported, and cleared in Settings > Game > Achievements |
| `ecbsim-save-local` | localStorage | `1` when the game is kept on this computer |
| `ecbsim-debug-keep` | localStorage | `1` when Keep debug through wipes is on |
| `ecbsim-wipe-on-refresh` | localStorage | `1` to erase the game data at every reload |
| `ecbsim-save-nudged` | sessionStorage | The offer to keep the game was shown in this tab |

## Saves

Saves work as in most games, through `S.saves` in `js/core/storage.js`. Each game has one autosave, its automatic slot, made with the game.

The game updates its autosave after every decision, every initiative and every year, and when the page is left, hidden or reloaded. Settings > Game can turn autosave off. Leave the game, in the toolbar, always writes the autosave and returns to the title screen.

Save, in the toolbar, writes a new manual save of the game at once, named after the text typed beside the button, if any. It can also overwrite an earlier manual save, after confirmation; the list of saves then stays open, showing the save as it is now. An overwritten save of another game takes the ID of this game's next manual save.

Each save has an ID: 2A is the autosave of the second game, and 2A-3M is the third manual save made from it. A new ID is the lowest one free. A deleted autosave keeps its ID while a manual save or the open game still names it; once a game has no save left and is not open, its ID is free for the next new game. A name of up to 40 characters can be given when saving, or later with Rename, and shows beside the ID.

Save and Load show every save in one list. It sorts by the date saved (newest or oldest first), the year in the game, the president or the name, and the `saveSort` setting keeps the choice. Beside the order, Group by splits the list by game, by kind (autosaves, then manual saves) or by period, each group under a heading with its count; `saveGroup` keeps that choice. Sort by and Group by appear only when there are two or more saves; with none or one the tools bar is hidden. Grouped by game, the game in progress comes first. Each save can be renamed or deleted. When the list holds saves of more than one game, those of the game in progress have a This game tag.

The title screen offers to continue the latest save, to load another one when there is at least one, and to start a new game.

Loading a save of either kind goes on updating that game's autosave. When the autosave was deleted, the game recreates it, with the same ID, at its next autosave point. When its ID now belongs to another game, the game makes a new autosave with a new ID.

### Export, import and selection

An export file contains games, each with its saves: `{ app: "ecb-simulator", games: [{ saves: [{ kind, number, name, save: { at, game } }] }] }`. A file made before that carries `v: 2` as well is read the same.

Settings > Storage > File operations, the last group, holds every file action, with the two buttons that delete the game data (Delete the game data, keep the settings, and Delete all game data, including settings) and Reset all settings under them:

- Export the game writes the game in progress with every save of its own, its state at that moment as its autosave.
- Export all games writes every save kept, with the game in progress as it is now.
- Import games reads a file.

In Save and Load, Select turns on selection, as on a phone: each save and each group gets a check box, a bar above the list has All and the count, and Export and Delete act on the saves chosen. Cancel, an export or a delete turns selection off. Grouped by game, an import is one group, so its box chooses all its saves at once.

Each save also has an Export button of its own, beside Rename and Delete, that writes that save alone to a file.

Import, in Save and Load and in Settings > Storage, reads a file of at most 20 MB. It must pass `S.game.validateExport` (`js/model/game.js`): only the keys above, at most 50 games, 100 saves a game and 500 in all, one autosave a game, numbers from 1 to 999, names of at most 40 characters, dates in the ISO format.

Each run must pass `S.game.validate`: plain JSON data of bounded size and depth, finite numbers, texts of at most 5 000 characters, no key that could reach an object's prototype, every field the game reads of the right kind and range, every card and state known, and an agenda that builds.

A file of the first format (`v: 1`, one game) is read as one game with one autosave. A file that fails is refused with the reason. One that passes is added after the player confirms (Add, or Add and open the latest).

A run is one president's play from its start year, known by its game ID, which stays the same through all its saves. A game is a run as it appears in the list of saves: one autosave and the manual saves made from it. An import is the games of one file added together. An export contains no save IDs and no import numbers, so an export of an import, imported again, becomes a new import numbered from the start, never a numbering inside another.

When a game of the file is a run kept here (the same game ID), the confirmation names that game and asks, for each such game, where it goes: added to the kept game, which then gets the saves it lacks as its next manual saves (2A-4M; a save is there already when one of the game has the same date and year, and the file's autosave becomes a manual save), or added as a copy, a game of its own in the import with a new game ID. Adding to the kept game is the first choice. Nothing else kept changes.

An imported game is played as any game: it goes on updating its own autosave (I1A), and a manual save made from it joins its import (I1A-3M). When its autosave is deleted while a manual save of it remains, the next autosave point recreates it under the same ID, in the import; with no save of it left, it goes on as a game of its own, with the next free game number.

The saves of a file form an import, numbered as games are, the lowest number free: I1, I2. An import of one game is named as a game is: I1A is its autosave, I1A-3M its third manual save. In an import of several games, each game takes a number in the order of the file: I1-2A is the autosave of the second game of import I1, I1-2A-3M its third manual save. Each save keeps its kind, name and manual number. Imported slots have IDs of their own (`iauto-`, `imanual-`) and have `imp` and `inner` (0 in an import of one game), so they never use up the numbers of the games played here. Each imported game gets a new game ID, so it never takes over the autosave of a game kept here. A manual save made from an imported game joins its import.

The list of saves is read from storage each time it is used. It stays correct when the game moves between this tab and this computer, and when Settings > Storage deletes data.

## Settings

`S.DEFAULT_SETTINGS` in `js/core/storage.js` lists every setting with its default. `S.loadSettings()` reads the saved settings over the defaults, so a setting added in a later version takes its default for players who saved before it existed. A setting that groups several values (`levels`, `tracks`, `titleCustom`, `wrapParts`, `customDifficulty`) keeps the default of each value it lacks.

A run keeps its area of responsibility in `scope` (`narrow`, `standard` or `broad`, from `Gm.SCOPE`); a game saved before it existed plays as `standard`.

A run with the custom difficulty has `difficulty: "custom"` and keeps its four values in `customLevel` (`will`, `dist`, `rel`, `gain`), each held within `Gm.CUSTOM_RANGE`; the start page remembers the last values in the `customDifficulty` setting.

A run keeps what it hides in `hide` (`history`, `votes`, `troika`, `draghi`, `forecasts`, from `S.game.HIDE`), chosen on the form for a new game, and Game settings changes it, with the level and the four values of a custom difficulty; each change of level is kept in `levelLog` (`{ y, d }`). The settings `hideHistory`, `hideVotes`, `hideTroika`, `hideDraghi` and `hideForecasts` keep the last choice for the next new game; a game saved before `hide` existed follows them.

A run changed by the debug tools keeps the changes in `taint`: a list of `{ y, a, at }`, the year in the game, the action as the debug panel names it, and the date. Opening the debug tools adds nothing; each action that changes the run adds an entry before it acts. A run from a file keeps `sandbox`: `{ at, year, met }`, the date and year of the import and the achievements it had already met. Both stay with the run in every save and export, and `S.game.validate` checks their form. Save and Load show them as the tags Debug used and From a file, which open their details.

The `kbdHints` setting holds `all`, `main`, `tooltips` or `off` (Settings > Keyboard > Hints); a setting saved as `true` or `false` reads as `all` or `off`.
