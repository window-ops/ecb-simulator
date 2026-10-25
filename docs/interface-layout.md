# Interface layout

[Back to Developing](developing.md)

The layout rules of the [interface rules](interface-rules.md): the window, pages, grids and how they adapt to the width.

- On a phone, deciding an item or moving to the next one brings the agenda strip and the card into view, with the current item visible in the strip. A tap on an item in the strip scrolls neither the page nor the strip, since the player is looking at them already.
- Two width limits, each with a switch and a width slider in Settings > Appearance: the page keeps its content at a readable width (on by default, 1200px, from 700 to 1800px) in the middle of the page area, and the window can hold the whole game in a full-height column in the middle of the screen, as web applications do (off by default, 1440px, from 1000 to 2400px).

  Accountant mode (Settings > Appearance, on by default) drops the page's readable width while the sidebar is beside the page, so the page starts at the sidebar's edge and figures can be read against the sidebar and the indicators; the start page and phones keep the limit. Text, the map and charts take the full width of their column; only popovers and toasts have a width of their own.
- The breakpoints are the standard window size classes (Material Design 3): compact below 600px, medium from 600 to 839px, and expanded from 840px.
- In the compact class, below 600px, the window becomes a phone layout: the sidebar gives way to tabs at the bottom and the views stack in one column.

  The toolbar keeps End year with its label at the left. At the right it keeps as many actions as icons as fit while the space beside End year stays at least one button wide, in this order: Save, Load, Settings, Help, New game, Achievements, Leave the game. A large phone keeps more of them. Then come the sound and a menu (Breeze's overflow-menu icon) that holds the remaining actions with their icons and labels, floating at the right edge under the toolbar as More floats above the tabs; an action that cannot be used now, such as Leave the game on the title screen, stays out of both, and the menu hides when nothing is left in it. Its buttons are the same size as on a desktop. The "More" menu opens just above the tabs.
- In the medium class, from 600 to 839px, as on a tablet held upright, the sidebar stays, the agenda's items run in a strip above the card as on a phone, and the indicators wrap into full rows. On any width, a toolbar too narrow for its labels shows its buttons as icons alone, End year apart, and keeps its separator; it measures itself again when the window changes width.
- A button's label never wraps, so even line breaks leave button labels alone.
- On a phone, where a settings row puts its label above its control, the label stands 10px under the control before it and 10px over its own, measured on what is drawn: switches and radio buttons drop the 30px line they keep on a desktop and trim their text to the capitals and the baseline, so every control's box is its ink. The labels of the start page's quick settings stand 10px above their lists.
- Drop-down lists show the pointer, as buttons do, unless they are disabled.
- The window fills the visible screen down to its lower edge.
- Settings > Storage > Delete all game data closes the game in progress and every dialog and shows a screen of its own, "Game data deleted", with a button to start a new game and one back to the title screen.
- At start-up the title screen takes the page area and holds the menu, as in other games: one button a line to continue the latest save, to open the list of saves when there is at least one, and to start a new game, whose form appears only then. Without a save, Start a new game is the first button.

  Settings > Appearance > Title screen leaves the title screen plain (the default) or gives it one of eight themes named loosely after the groups of the European Parliament (Popular, Social, Renew, Green, Conservative, Patriot, Sovereign, Left).

  A theme has its colors and a backdrop whose motif moves in the theme's own way (Popular's rings of stars turn slowly, Renew's turn and breathe, the Left's turn the other way and faster, Social's roses bloom, Green's leaves sway as they fall, Conservative's tiles light in turn, Patriot's banners wave, Sovereign's coins spin).

  It also has a yellow line at an angle off the logo's upper right that pulses, picked at random at each start from the theme's lines and the shared ones, as on Minecraft's title screen.

  Reduced motion stills the backdrop and the line. While Rows of cards fills every row, the backdrop's tiles fill the screen the same way: a whole number across and down, each about 120px, so no tile is cut at an edge.

  A Custom theme takes a color (a theme's or any other), the backdrop of any theme or none, the motif's color (the theme's own or any other, as faint as the theme draws it), and any piece of the soundtrack.

  With a theme chosen, and only then, a switch that moves or stills the backdrop (disabled under reduced motion, which stills it anyway), a speed for its motion (a quarter to twice the usual) and three switches follow: the card, which sets the name and the menu apart from the backdrop; the pulsing line; and the theme's own music in place of Strasbourg.

  Off a card, the menu's buttons are solid, the first in gold and the others in the theme's deep color with white letters, so the backdrop never shows through them.

  While the title screen shows the same theme, card, line, bank name and saves, a redraw leaves it in place, so a setting changed or a switch checked does not restart its motion or change its line. Help offers the guided tour only while a game is open.

  The yellow line starts above the logo's upper right and runs down past it at 36 degrees. Leave the game, in the toolbar, saves the game and returns to the title screen.
- Without a game the sidebar steps aside and the start page takes the whole window. The start page has Quick settings (theme, text size, motion, all sound, the interface sounds, the soundtrack, hiding the record) and a button to all settings.

  It begins with a button back to the title screen; the name and the introduction follow for a first game only, when no save exists. It ends with Start and, at the far right of the same line, the guided first year. A new game, a loaded game and the start page each open at the top of the page.
- A closing dialog lets clicks through at once, so the first click after it reaches the window.
- A click on the layer behind a dialog closes it, except for the year report, which stays until its button, its close button or Escape, unless Settings > Game > Year report lets such a click close it.
- A message of the moment shows in the status bar, as KDE applications show one, with its icon, its text, its buttons and a close button; where the status sits in the sidebar, the bar shows for as long as the message lasts.
- Notifications open in the corner chosen in Settings > Appearance > Notifications: below the toolbar at the top, or above the status bar and the tabs at the bottom.
- Help is laid out as KDE's Help Center, in the settings dialog's width: its sections (`js/data/help.js`) in a list beside the page, Concept first, the page on the view color. The Selk section holds the explanation of Selk, and the Keyboard section shows only where there is a keyboard.
- While the files load, a loading window shows, drawn as a Breeze dialog: a header with the logo and the name, a body with a progress bar, the file loading and the count of files and kilobytes, and at its foot, under a line, a tip that starts "Tip:" in bold beside Breeze's hint icon and changes every eight seconds.

  Its text has the game's sizes. It shows only when loading takes more than a quarter of a second. A file that fails is named in a box of its own, as KDE's inline error message: tinted and outlined in Breeze's negative color, with the error icon and a Reload button.
- A dialog can slide a page in, as KDE and GNOME do, with a back arrow in the header. Closing a dialog fades it out; under reduced motion it closes at once.
- The Countries heading row has a button that hides the map; its tools and the flow table go with it, and the table of states stays at full width.
- Cards that hold actions, such as the advisors, end in a footer strip under a line, so every card in a row ends at the same line. Cards that show a state, such as a proposal's support or adoption and a bloc's relation, end with it under a line at the foot of the card for the same reason.
- A dialog keeps its width while its contents change. The settings dialog is 760px wide and at least 420px tall; a longer category, such as Storage with its kept data open, makes it taller up to the height of the screen before it scrolls, and nothing inside it has a scroll area of its own. Its rows put labels in one column and controls in the other.
- On a wide card the options sit in two columns.
- On the map, pointing at a state or focusing it by keyboard shows its figures; a click selects the state and opens its charts below, and the box stays where it is, by the pointer, through the redraw.

  A state outside the euro, or a first year not yet run, shows a message in place of its charts; a state that has just joined shows its record, in the table, the box and its charts, until the game has figures of its own.

  Charts are wide and low (380 by 120), and smaller in the compact view (260 by 90, in a block of at most 760px), which a phone neither offers nor uses, its map and charts being small already; a low chart draws fewer gridlines, at least 18px apart, so its axis labels never touch. A chart in a grid is drawn again at the width its cell gets, at the same height, so its text keeps one size across the grid.
- The Countries heading row can make the map and charts smaller (at most 720px for the map and 760px for the charts); the choice is kept in the settings. The Parliament view lays out its charts the same way, side by side, and its heading row has the same switch.
- Settings > Appearance > Dialogs keeps dialogs within the height of the window (the default); off, a long dialog grows and the layer behind it scrolls, the dialog keeping its rounded corners and a margin below. The settings categories stay at the top while a long page scrolls past them; the page scrolls inside its own area, so the column under the categories keeps the window's color.
- Rows of cards give each card at least 200px and keep 15px below the row. By Settings > Appearance > Rows of cards (on by default) every row is full: the cards are shared out evenly over the rows and the last row's cards widen to its full width, so a grid ends in a rectangle (`S.tile` in `js/core/dom.js`).

  The options of an agenda card follow the same rule, at least 320px each. While the rows are filled, the same row can cap the cards in a row at 2 to 5 (six cards at most three a row make two rows of three); the cap shows only with the switch on.
