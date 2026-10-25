# Tests

[Back to Developing](developing.md)

```sh
node test/run.js
```

runs the four test files in turn:

- `test/data.test.js` checks that cards, footnotes, the glossary, the map and the icons agree with each other, that every script exists and is loaded, that the page and the stylesheets are indented by two spaces with one declaration per line, that no file has two empty lines in a row, that nothing is loaded from another site, and that the text uses straight quotes.
- `test/model.test.js` plays whole runs without a browser: with the historical choices (which must stay close to the record), on the intended path (which must keep Greece in the euro without the Troika or the Draghi measures), with random choices, in the post-federative period and continued from one period into the other. It also checks every president type and that a saved run continues as the original.
- `test/ui.test.js` plays the game in Chromium. It needs Playwright (`npm install -g playwright` and `npx playwright install chromium`) and reports itself skipped without it.

  It serves the folder on a free port, opens the form for a new game from the title screen, plays several years, opens every view and dialog, checks the map, the state codes switch, the footnotes, the storage choices and the debug panel, checks that headings have equal space above and below, that the first and last text in each box sit flush, and that column heads fit on one line, and saves screenshots: `node test/ui.test.js <folder> <years>`.

- `test/stress.test.js` plays the irregular paths in Chromium, each in a fresh game: the end of each period, a bad ending, a run that ends in its first year (its chart names the year once and shows the figure), a key bound to another action, a succession in an ending year, a debug jump into an ending, keys and clicks during the year transition, the true ending with its time-lapse, and a finished run loaded from a save. It records the sounds, dialogs and transitions of each path and checks that an ending takes over at once (no turn sound, no year report), that the page under the film keeps still until the film covers it, that the film's title waits for Continue and makes no sound by itself, that the time-lapse keeps the keys to itself, speeds up and ends in a coda with no border left inside the Federation, that required screens have no close button, ignore Escape and clicks outside, come back when removed and keep the page under them from reacting, and that no decision goes through after a run has ended. `node test/stress.test.js <scenario>` runs one path.

Each file can also run on its own, for example `node test/data.test.js`, which takes a few seconds and needs no browser.

`test/load.js` loads the model and data files into a node sandbox, in the order `index.html` loads them, and `test/check.js` records each check and sets the exit code.
