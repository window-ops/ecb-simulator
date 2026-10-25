# Accessibility

[Back to Developing](developing.md)

## Motion

Settings > Motion and text follows the system's reduced motion setting, or reduces or allows motion. Reduced motion stops decorative motion. The turn transition, the Council vote, charts and values moving to their new figures, and the ending film always run, because they show information; the film's screens then fade in and out without moving. Fast mode, a debug setting, shortens them.

## Text

- Text can be normal or large.
- Even line breaks are on by default, and each kind of element has its own switch: paragraphs and lists, headings, labels and switches, pills (which may then take a second line), table cells, menus and view lists, tooltips and popovers, the agenda, saves and glossary, and captions, notifications, the status bar and the rest of the window (`S.WRAP_PARTS`).

  The last four change only where a line breaks (`text-wrap-style`), never whether a line may break, since some of them, such as a phone's tabs, stay on one line. The browser's own tooltips, from the title attribute, cannot be styled and keep their breaks.

  Browsers that support `text-wrap: pretty` use it, and headings get `text-wrap: balance`. Every other browser gets the same from `js/core/wrap.js`, which joins the last two words of each block with a no-break space, at start and as blocks are added to the page, and takes the spaces back when a kind is turned off.
- Underlined terms open a definition, and footnote numbers open a note at the bottom of the page.

## Keyboard and screen readers

- 1 to 9 choose an option, Enter decides and, on a decided item, goes to the next one, N goes to the next item, E ends the year, ? opens help, Escape closes a dialog or a popover. While the Council's vote is shown, Enter waits for it.
- Settings > Keyboard turns the shortcuts on or off as a whole and for each area (the agenda, the end of the year, views, the toolbar, dialogs, the film and time-lapse, the end screens, the title screens, debug), and lets the player change the key of any action under Key bindings. Beyond the default keys below: the left and right arrows move between agenda items, [ and ] between views, comma opens Settings, S saves, L loads, M turns the sound on or off, Enter presses a dialog's main button, and the end screens and title screens take the letter shown beside each button. No shortcut uses Ctrl, Alt or the system key, and none acts while typing in a field.
- Settings > Keyboard > Keyboard hints shows the keys as key caps: Enter beside Decide and Next item, E beside End year, and, before a choice, "Choose an option:" with the option keys; they show only with a keyboard connected, as do Settings > Keyboard and the Keyboard section of Help: a screen with a mouse or trackpad counts as having one, and a touch screen as having one from the first key pressed outside a text field, since only the on-screen keyboard types in a field.
- The ending film moves on by one screen with Next, the right arrow or Space; Escape or Enter skips to its title. The title stays until the player goes on: its Show summary button, which takes the focus, or Enter, Escape, Space or the right arrow fades the film into the ending's screen, which sums up the run. Clicks and taps on the film do nothing, so a stray click never skips a screen; the film, the time-lapse and the end screens keep the plain arrow cursor, and only their buttons show the hand. Read, or the R key, holds the current screen until it is pressed again. The film and the time-lapse take the focus while they play, and Tab moves only among their own buttons, so no key reaches the screen under them. Under reduced motion the order and the timing stay the same and every change is a plain fade: nothing moves or draws. The time-lapse, played from the finale's button, has Read (R), Speed (F, one, two or four times the pace) and Skip (Escape), which leads to its coda; the coda's Show summary (Enter or Escape) returns to the finale. A live region reads each year and its headline, then the coda.
- An end screen takes the focus itself, not its first button, so an Enter pressed to end the film cannot act on it; Tab reaches its buttons.
- A screen the run cannot go on without (the crash screen, the Federation screen, the finale, the succession) has no close button, ignores Escape and clicks beside it, and makes the rest of the window inert. Removed with the browser's inspector, it comes back. Ordinary dialogs such as Settings close as usual.
- Overlays catch the clicks made on them: nothing under the year transition, the film or a required screen reacts.
- Every button that shows only an icon has a label for screen readers, and so does every slider, list and popover.
- The title bar and toolbar form the banner landmark, the views list and the bottom tabs are navigation, the page is the main landmark and a named region that takes focus so it can be scrolled by keyboard, and the status bar is the footer.
- Each option on a card is a radio button named by its letter and label and described by its text, so the glossary buttons in the text sit beside it. After a choice the focus stays on the chosen radio.
- `S.levelHeadings()` gives every heading an `aria-level` so that levels never skip, across the window, dialogs and popovers.
- A hidden live region (`S.ui.announce`) reads out each decision and the Council's vote; the vote's dots form one image labeled with the count. Toasts are announced as status or alert.
- The map's states are buttons with their names, and charts are images labeled with their titles, each with a table alternative.

The audit tool axe-core reports no problems on the start screen, the agenda, popovers, every view, the flow map, every settings category, help, saves and the year report (contrast excluded, as Breeze's colors set it).
- Every color on the map has a legend, a state that left the euro is hatched, and the table under the map lists the same figures.

## Loading

`js/core/loader.js` runs before every other file and draws the loading window with `css/loader.css`, which has its own Breeze colors and text sizes, since the game's stylesheets load after it. It reads the kept settings for the theme, the accent, the text size and motion.

The window is a status region for screen readers, and its progress bar has its value. Reduced motion stills its fades. The tips explain their own terms, since the glossary has not loaded yet; they cover playing, the record of 2010 to 2015, Yanis Varoufakis and the case against austerity.

## Without JavaScript

`index.html` holds a screen inside `<noscript>` drawn as KDE's crash dialog, with Breeze's crash face icon. It tells, in the game's world, how the euro area economy collapsed because the president's computer would not run the briefing, then asks the player to turn on JavaScript and reload.

The interface sounds and the soundtrack are on [Sound](sound.md).
