# Design: interface

[Back to the design document](design.md)

## 16. Interface

### 16.1 Window

One Breeze application window that fills the page:

- A toolbar: End year, Save, Load, Settings, Help.
- A sidebar with the views: Agenda, Council, Countries, Advisors, Parliament, Treaties, Archive, Glossary.
- The main view: the open decision card or view.
- A header bar with the headline indicators and the year.
- A status bar: term, president, days to the next election.

On phone screens the sidebar becomes a bottom navigation bar, like Selk's, with a 16 px side margin and no horizontal scroll.

### 16.2 Appearance

- Light and dark themes from the Breeze Light and Breeze Dark color schemes, with a third setting that follows the system.
- Accent colors from Plasma's ten accent swatches, plus a color picker: #e93a9a, #e93d58, #e9643a, #e8cb2d, #3dd425, #00d3b8, #3daee9 (the default Breeze blue), #b875dc, #926ee4, #686b6f (source: plasma-workspace, kcms/colors/ui/AccentColorUI.qml).
- Noto Sans, the Plasma default, bundled under the SIL Open Font License.
- The bank's name: any of the acronyms of the 24 official languages, labeled with the language. The Greek acronym ΕΚΤ is written EKT in Latin letters, which look the same in capitals.

| Language | Acronym | Language | Acronym |
| --- | --- | --- | --- |
| Bulgarian | ЕЦБ | Irish | BCE |
| Croatian | ESB | Italian | BCE |
| Czech | ECB | Latvian | ECB |
| Danish | ECB | Lithuanian | ECB |
| Dutch | ECB | Maltese | BĊE |
| English | ECB | Polish | EBC |
| Estonian | EKP | Portuguese | BCE |
| Finnish | EKP | Romanian | BCE |
| French | BCE | Slovak | ECB |
| German | EZB | Slovene | ECB |
| Greek | EKT | Spanish | BCE |
| Hungarian | EKB | Swedish | ECB |

### 16.2.1 Shared values

Text sizes, spacing, layers and the colors of the full-window screens are custom properties on `:root` in `css/breeze.css`:

- `--fs-small` to `--fs-year` for type, and `--gap-xs` to `--gap-l` for spacing (`--dbg-gap` in the debug tools).
- `--radius` for corners and `--control` for the height of a button or a field.
- `--z-sticky` to `--z-nojs` for the order of layers, and `--scrim` and `--scrim-tour` for the layers behind a dialog and around the tour.
- `--crash`, `--finale` and `--on-crash` (with `--on-crash-dim` and `--on-crash-line`) for the crash screen and the films; a lighter or fainter white there is `--on-crash` mixed with transparency.
- `--title-ink`, `--title-gold`, `--splash` and their kin for the themed title screens, and `--on-accent` for white on a colored mark.

Styles in `css/app.css` use these names in place of written values, so a size, a color or a layer changes in one place. A value with no token, such as a 2px nudge or the size of one drawing, stays written out.

Spacing rules:

- **Equal top and bottom space**: a framed box (one with its own border or background: a card, a banner, a panel, a dialog, a tile, a button) has the same space above its first line as below its last. Its first child has no top margin and its last child no bottom margin, so the padding alone sets the space. Cards stretched to the height of their row keep this padding, and the extra height falls below the content.
- **One gap between blocks**: blocks in a column are parted by one gap token, set on the parent, so the space between them is the same everywhere in the column.
- **One control height**: buttons, lists and fields share one height (32px), in the debug panel too.
- **Controls keep their size**: a button or a list shows its whole label on one line and never shrinks below it. A list is as narrow as its chosen label allows, so the buttons after it stay on its line. The controls of a row fill its width and share it evenly. Only a control that cannot fit beside the others moves to the next line, where it extends to the full width.

### 16.3 Motion

Under the reduced motion setting of the system, decorative motion stops: hover transitions, sliding panels, sliding alerts. Four animations stay because they show information: the turn transition, the Council vote appearing member by member, charts and values moving to their new figures, and the ending film, whose screens then fade without moving.

### 16.4 Sound

Sounds are synthesized in the browser, as in Selk. Settings: a master switch, a master volume, and a level for each category: clicks, alerts, votes, end of year. Sound starts after the player's first click.

A soundtrack, off by default, follows the state of the game: Eurocrisis (D minor) by default, Draghi (F major) for three years after a Draghi measure, Troika (A minor) while the bank sits in a Troika, Bankrupt (C minor) when a run ends badly, Ode to Joy (D major, the melody of the European anthem) when a period ends with no grade better than the record, October (E minor, a march) for the move into the Federation, Kremlin (G minor, a hymn with bells, an ironic name) for the federal years, and Finally (G major) when a period ends well or in a calm year.

A calm year has a backstop of at least 0.6, unemployment at or below 8%, inflation between 0 and 3% and no loan program.

Each piece is a loop of chords with a pad, a bass and an arpeggio at fixed levels, so the music stays even; at full volume it peaks at about a fifth of a click. It has its own volume, and each piece its own switch and volume. A second playlist, Resistance, gives each piece a variant made from Bella ciao, L'Internationale, Bandiera rossa, Warszawianka or Le Temps des cerises.

### 16.5 Learning the game

- A guided first year: 2008 with step-by-step explanations, skippable at the start and at any point.
- A glossary, linked from every term in the text.
- A source for every real figure: year, institution and series.
- Advisors who explain their advice in plain language.

### 16.6 Saves

Each game has an autosave, updated after every decision and every year. Save writes a new manual save at once, with an optional name, or overwrites an earlier one after confirmation; autosave never changes a manual save. Every save has an ID (2A, 2A-3M) and can be renamed or deleted, and Save and Load list them sorted by date, year, president or name.

Each save holds a version number, so a newer build can tell which version wrote it. While the game is in development, a newer build may not read older saves: the developer may choose to make saves incompatible, as when the unpublished system of three fixed slots gave way to the current saves.

### 16.7 The end of a run

Every ending follows the same order: its film, from the first screen; the film's title, which stays until the player presses Show summary; then the film fades into a full-window end screen in the film's own colors. The end screen is never shown before its film; it is laid under the film as the film fades out, at full strength, so only the film's fade carries the change and the page never shows between the two. The page under the film keeps the year that ended until the film covers the window, so nothing moves under its fade-in. The film makes no sound by itself; only what the player presses sounds. Each screen has the same layout: a headline, the reason, a panel, the facts of the run, and the actions with the main one first, in one row when they fit at their full labels, else in two even rows, else in one column.

- **Bad ending**: the crash screen, in the film's dark red: the reason, a panel for the ending (the map, a line chart or bars), the facts, then New game, Watch the ending again, Review the run and Load a save.
- **End of the first period (2041)**: the Federation screen, in the film's blue: the grades, the facts, then Continue into the Federation, Watch the ending again, Review the run and New game.
- **True ending (2070)**: the last payment on the Greek loans ends the presidency. The finale screen, in the film's slate: the grades, the facts, then Watch the time-lapse, Watch the ending again, Review the run and New game. The time-lapse fades in with its first year in place and plays the run year by year to Bella ciao: first the map with the main figures and one headline a year, then the charts drawing themselves. The change from the map to the charts, and into the coda, fades the whole stage out and back in, so the map never fades apart from the rest. Speed plays it at one, two or four times the pace. From 2041 the outline of each member turns, a little more each year, from the background's color to the white of its fill, so the borders between the Federation's members fade evenly and in the last year are gone, with no line or seam left. The outer border of the Federation keeps the same line throughout. After the last year of the charts holds, a coda follows: the stage fades out and back in with the map of the last year, the span of the run and its last figures, while Bella ciao fades into the finale's piece; its Show summary fades the time-lapse back into the finale. Skip leads to the coda.
- **Reduced motion**: the same order and timing; every change is a plain fade, and nothing moves or draws.
- **Review**: an ended run stays open read-only. A banner says when and how it ended, and its button goes back to the summary.
- **Taking over at once**: a year that ends the run shows no year report, plays no turn sound and opens no succession; the film starts.
- **Required screens**: the crash screen, the Federation screen, the finale and the succession cannot be closed or clicked away. The rest of the window is inert while one is open, and one removed with the inspector comes back, as the film and the time-lapse do while they play.
- **Read**: the film and the time-lapse have a Read button (R) that holds the current screen until it is pressed again. The film's title and the time-lapse's coda wait for Show summary. Clicks on the film do not skip, and the cursor stays the plain arrow over it.
- **Achievements**: an opaque card with the icon, "Achievement unlocked" and the name, in the notifications' corner (at the top on phones). It waits until no dialog, vote, transition or ending film is shown; on an ending's screen it shows at once, over the screen.
- **Decisions are final**: there is no undo, so a decision, a vote and the end of a year cannot cross each other.
