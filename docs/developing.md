# Developing

The game is a set of plain JavaScript files. `index.html` loads them one after another with ordinary `<script>` tags, and each file adds what it defines to one shared object, `window.ECBSIM`, written `S` in the code. There are no JavaScript modules, no packages to install and no build step: what is in the folder is what runs in the browser. The order of the `<script>` tags matters, because a file can only use what the files before it defined.

## Pages

| Page | Contents |
| --- | --- |
| [Architecture](architecture.md) | The global object, the loading order, the files, events, drawing the window, rebuilding the icons and the map |
| [Running and debugging](running.md) | Running the game, debug mode, wiping the data |
| [Game data](game-data.md) | Countries and the record, instruments, proposals, advisors, cards, the glossary and the notes |
| [The economic model](model.md) | The baseline, one year of the model, the backstop, the advisors' forecasts |
| [Saved state](saved-state.md) | The fields of a run, the storage keys, the settings |
| [Settings](settings.md) | Every setting the player can change, by category |
| [Interface rules](interface-rules.md) | The theme, spacing, controls and text rules every screen follows |
| [Interface layout](interface-layout.md) | The window, pages and grids, and how they adapt to the width |
| [Sound](sound.md) | Interface sounds and the soundtrack |
| [Accessibility](accessibility.md) | Motion, text, keyboard and screen readers, loading, the screen without JavaScript |
| [Wording](wording.md) | The Democracy 4 standard the game's text follows, and how it differs from everyday language |
| [Selk's history in the game](selk-history.md) | Where the history of Selk enters the game after 2025 |
| [Tests](tests.md) | The three test files and how to run them |

The [design document](design.md) holds the decisions behind the game, [DATA.md](../DATA.md) the sources of the figures, and [TRANSLATING.md](../TRANSLATING.md) how to add a language.
