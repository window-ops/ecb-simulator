# Architecture

[Back to Developing](developing.md)

## One global object

The game is a set of plain JavaScript files. `index.html` loads them one after another with ordinary `<script>` tags, and each file adds what it defines to one shared object, `window.ECBSIM`, written `S` in the code. There are no JavaScript modules, no packages to install and no build step: what is in the folder is what runs in the browser.

The order of the `<script>` tags is the order of dependence, because a file can only use what the files before it defined:

0. The loading window: `css/loader.css` in the head, then `js/core/loader.js` first in the body, before the game's three stylesheets
1. The translation layer and the events: `js/core/i18n.js`, `js/lang/en.js`, `js/core/events.js`
2. The icons, then the data that needs no code: `js/ui/icons.js`, then `js/data/` from `countries.js` to `map.js`, with the music between `rules.js` and `map.js`: `music/music.js`, the files of `music/european/`, then those of `music/resistance/`
3. The rest of the core: `storage.js` (with the settings), `theme.js`, `wrap.js`, `dom.js`
4. Audio: `js/audio/sound.js`, then `music.js`
5. Model: `js/model/model.js`, `council.js`, `advisors.js`, `game.js`, `auto.js`, `achievements.js`
6. The cards, which use the model: `js/data/cards-common.js`, `cards-pre.js`, `cards-later.js`
7. Interface: `js/ui/chart.js`, `shell.js`, `map.js`, the views, `start.js`, `title.js`, `dialogs.js`, `achievements.js`, `cinema.js`, `finale.js`, `tour.js`
8. `js/dev/debug.js`, then `js/main.js`, which starts the game

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | The page, the screen shown without JavaScript, and the list of scripts, in loading order |
| `css/breeze.css` | Breeze colors for the light and dark themes, base text styles, buttons, fields, tables |
| `css/app.css` | The window layout, the views, the map, footnotes, dialogs and the debug panel |
| `css/motion.css` | Animations, and what reduced motion and fast mode change |
| `js/core/` | The translation layer, events, storage and settings, the theme, even line breaks (`wrap.js`), helpers that build page elements |
| `js/audio/sound.js` | Interface sounds made in the browser (adapted from Selk) |
| `js/audio/music.js` | The soundtrack's engine: it picks the piece for the state of the game and the playlist, hands over between pieces, and plays the notes kept in `js/data/music/` |
| `js/data/countries.js` | Member states and their figures, 2008 to 2025, and the states a run may assume will join the EU |
| `js/data/history.js` | Rates, instruments, programs, tightening, trust, far-right seats and climate shocks |
| `js/data/instruments.js`, `proposals.js` | The bank's instruments, the proposals to governments and the treaty goals |
| `js/data/advisors.js` | The nine schools of advisors |
| `js/data/cards-*.js` | Decision cards: recurring ones, 2008 to 2025, and 2026 to 2070 |
| `js/data/glossary.js`, `notes.js` | Glossary terms and footnotes |
| `js/data/help.js` | The sections of Help, the Concept first |
| `css/loader.css`, `js/core/loader.js` | The loading window, which counts the files after it by reading the page's own source |
| `js/data/flows.js` | TARGET2 balances, lending to banks and euro area output, 2008 to 2025, for the flow map |
| `js/data/names.js` | The bank's name in the 24 official languages |
| `js/data/people.js` | Names for the president by language, the Governing Council's governors and the Executive Board, each with a gender |
| `js/data/rules.js` | The game's rules as data: difficulties, areas of responsibility, the agenda's pools, the endings and the start page's backgrounds |
| `js/data/music/` | The notes of every piece: `music.js` with what the pieces share, `european/` with a file for each piece of the European playlist and the title pieces, `resistance/` with a file for each song of the resistance playlist, its variants and the time-lapse |
| `js/data/map.js` | The map's country outlines, made by `tools/build-map.py` |
| `js/model/` | The economic model, the Governing Council, the advisors, a run of the game, automatic play, and the tests behind the achievements (`achievements.js`) |
| `js/ui/achievements.js` | Achievements kept across games: their notifications and the Achievements dialog |
| `js/ui/cinema.js` | The ending film, which fades into the ending's screen, and the crash screen after a bad ending |
| `js/ui/finale.js` | The Federation screen of 2041, the finale of 2070, the layout of their actions, and the time-lapse of the run |
| `js/ui/keys.js` | The keyboard shortcuts: the areas of Settings > Keyboard, and the keys for views, the toolbar, the end screens and the title screens |
| `js/ui/` | The window, the views, the map, charts, dialogs, the title screen and the tour; `icons.js` is made by `tools/build-icons.py` |
| `js/dev/debug.js` | The debug panel, the debug log and fast mode |
| `vendor/` | Everything taken from other projects: icons, the fonts, the map's license (see `vendor/README.md`) |
| `tools/` | Scripts that rebuild `js/ui/icons.js` and `js/data/map.js` from the files in `vendor/` |
| `test/` | Tests, run with node; `stress.test.js` plays the endings and other rare paths in a browser |

## Events

`S.on(name, fn)` and `S.emit(name, data)` in `js/core/events.js` connect the parts without them calling each other. The game emits `decide`, `vote`, `initiative`, `year`, `save`, `storage`, `settings`, `render`, `debug` and `focus`. The debug log prints every event; the soundtrack listens to `render` to follow the state of the game.

`js/core/events.js` also keeps whether the game has the focus, as `S.pageFocused()`: its tab shown and its window focused. It follows the blur, focus, page hide and visibility events, since `document.hasFocus()` can still say true while the window is losing the focus, as when the tab changes. A click, a tap or a key in the page counts as the focus.

Each change of the focus emits `focus` with `{ focused }`. The soundtrack pauses and resumes on it, and the title bar shows or hides its Not focused pill.

## Drawing the window

`S.ui.build()` in `js/ui/shell.js` makes the window once: title bar, toolbar, sidebar, indicators, page, status bar and the bottom tabs for phones. `S.ui.render()` redraws its contents after every change.

A redraw keeps the scroll positions of the page, the agenda list and the indicators, so the player stays where they were; `S.ui.go(view)` changes the view and starts it at the top. Each view is a function in `S.ui.views` that fills the page from the run in `S.G`.

## Rebuilding the icons and the map

```sh
python3 tools/build-icons.py
python3 tools/build-map.py ne_50m_admin_0_countries.geojson
```

The first reads the SVG files in `vendor/breeze-icons/`, draws each in one color, and measures how wide its drawing is: an icon narrower than Breeze's 16px square gets a viewBox cut to its drawing plus the usual 3px on each side, so it needs no package. The second needs Natural Earth's 1:50m countries file and the Python package `shapely`; the script's first lines say where to download it.
