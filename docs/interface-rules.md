# Interface rules

[Back to Developing](developing.md)

These are the rules for how the game looks and reads. Follow them for every new view, dialog and document. To change a rule, change it on this page first, then in the code.

## The theme

The window follows KDE's Breeze style, as a Kirigami application would draw it: a title bar, a toolbar, a sidebar of views on the left, and the page. Breeze Light and Breeze Dark are both complete, and the system's choice is the default. The accent is one of Plasma's ten accent colors or any color the player picks; text on the accent is white, or Breeze's dark text on a light accent. The font is Noto Sans, kept in `vendor/noto-sans/`.

The title bar shows a Not focused pill while the game does not have the focus:

- After a reload, on every screen, until the first click, tap or key in the page. Until then the browser's reload button may keep the focus, so keys do not reach the game, and no sound can start.
- On every screen, the title screen included, whenever the game loses the focus: the tab changes or is hidden, or the window loses the focus, as when another program is chosen. It hides when the player comes back.

Settings > Appearance > Positions > Not focused turns the pill off; it is on by default. The pill sits before the Debug tag, which keeps its place at the right. The title screen focuses no button by itself, so nothing looks focused before the player acts.

## Layout

The layout rules have a page of their own: [Interface layout](interface-layout.md).

## Spacing

- A heading has the same space above and below it.
- The first visible child of a box has no space above it, and the last visible child no space below it. The rule in `css/breeze.css` lists the boxes and the children it applies to; a hidden element does not count. Add a new kind of box to that list.
- Boxes laid out with `gap` give their children no margins of their own.
- One-line controls (buttons, badges, labels, section titles, the indicators' labels and figures) trim their text to the capitals and the baseline, so the text sits in the optical middle; a trimmed element must be a block or inline box, since a flex box is not trimmed. Paragraphs, list items, definitions and headings keep their line height, which spaces stacked lines in every browser, Firefox included.
- Measure spacing on the ink of the text, from the top of the capitals to the baseline, never on the boxes.

## Controls

- A button that shows only an icon is square: 32 by 32px.
- A drop-down list draws its own arrow, so it looks the same in every browser.
- The number beside a view in the sidebar is a pill of its own height, 18px.
- Buttons in a toolbar are flat. Buttons in a page or a dialog, such as Test, Play, Hide and Show, have Breeze's frame.
- A drop-down list or a search box on a phone takes the full width of its row.
- A term inside a popover branches as GNOME's popover menus do: its definition slides in over the same popover, with a back button named after the page before. A click outside or a scroll closes the popover, Escape closes it, and a second press of the button that opened it closes it.
- A setting that cannot apply in the present state stays in place, disabled, with its label dimmed and a short line that says why (Sound is off, reduced motion is on, the backdrop has no motif). One line serves a group of such settings.
- A slider with a default has a reset button beside it, Breeze's edit-reset icon, disabled while the slider is at its default.
- With Settings > Game > Keyboard hints on, buttons that have a key show it in a small key cap 2px after their label, the label's own spacing making up the rest of the gap (Enter on Decide and Next item, E on End year).
- Every control that changes a setting, opens a section or chooses an option makes a sound in the Clicks category. A button whose action makes its own sound, such as opening a dialog, plays that sound alone.

## KDE patterns

- Spacing comes in multiples of five: 5px for related items and inside controls, 10px between groups, and 15px at page edges, between cards and between sections. Kirigami's units (4, 6, 8 and 18px) are drawn for a desktop toolkit and do not map one to one onto a web page, so the game rounds them to this scale. Lines of 1 to 3px, such as borders and the nudges that align an icon, stay as they are.
- Headings follow Kirigami's Heading levels 1 to 4 (1.35, 1.2, 1.15 and 1.1 times the text), all demi-bold, so weight more than size sets them apart.
- The indicators sit at the very top of the page area. They scroll away with the page by default, or stay at the top by Settings > Appearance > Indicators. Each view's title row scrolls with the page, with the view's actions on the right and a line below.
- The indicators form one flat strip, their figures parted by thin lines; an indicator in alarm has a red line under it. Each holds a label and a figure, centered in the strip; a further note, such as the state with the highest spread, goes in its popover, so the strip keeps one height.
- On a desktop the president, the year, the term and the backstop sit in the sidebar's foot, one label and figure a line, with the president's state in parentheses at the right and a long name cut short by an ellipsis, its tooltip giving it in full, or, by Settings > Appearance > Status, in a bar at the bottom; phones keep the bar above the tabs. Notifications sit just above whichever ends the window.
- Notifications are KDE's: an icon centered on the first line. The information mark is Breeze's one-color icon (help-about, which Breeze also names info) in the text color, and so are warnings and errors: Breeze's warning and error shapes with their marks cut out, so the shape tells the kind.
- Icons are drawn in one color, the color of the text, as KDE draws icons in toolbars and lists, with no emoji and no colored icons; `tools/build-icons.py` drops Breeze's accent and status colors: Appearance has Breeze's brush, and Motion and text a one-color version of Breeze's accessibility icon.
- An empty panel or page shows its placeholder in the middle, across and down.
- Fonts are the game's own (Noto Sans, and Hack for fixed-width text) or generic families; Firefox's fingerprinting protection blocks named system fonts.
- In the Council table the president's stance is the mean lean of the options the president put to a vote, on the members' scale, "not yet known" before the first; the president's relation reads "You".
- Marks use Breeze icons, never symbols or emoji: a decided item shows the apply mark, a rejected one the cancel mark.
- A chosen item has a soft tint of the accent and a thin accent line.
- "In history" is an inline message of the information kind: a tinted, rounded box with an icon in the middle of the text beside it.
- The instruments table gives every instrument a state (in use, not in use, or the year it becomes available) and a kind (standard, Draghi measure, alternative), each a pill of its own color.
- Chips are tinted without outlines; the expected Council vote is a pill too, in secondary text.
- A settings page is one grid: labels in the first column, as wide as the longest label, and every control in the second, so all controls start at the same line. Its rows sit in card groups, a titled card per subject on the window's color (Colors, Layout and Title screen under Appearance; Interface sounds, Music and Title screen music under Sound), and every card shares the page's label column.
- An empty state shows a placeholder message: an icon and a line in the middle of the space.
- Icons are 22px in buttons, the toolbar, the sidebar and the tabs, 16px in lines of text, and 32px for advisors.
- An icon narrower than Breeze's 16px square, such as Achievements, Next or Close, is cut to its drawing with 3px on each side, and in a button it takes that width, so every label stands the same distance from its icon. In lists, such as the sidebar and the settings categories, icons keep the full square so the labels line up.

## Text

- Words in full, never short forms: "Unemployment, %", not "Unemp. %"; "points" and "billion euros", not "pts" and "bn".
- Text comes in two sizes, as in KDE: the default font, and the small font (`--fs-small`, 0.857rem) for secondary text only, such as dates, sources, badges, legends and the status bar. Headings and the figures on the indicator cards are the only larger text.
- US English, without naming it so in the settings.
- Straight quotes ("...") and the hyphen only: no long dashes and no double hyphens in text.
- Interface text never names the game as the one acting ("there are no figures for it", not "the game keeps no figures for it"), and figures stand without a judgement beside them, as in Democracy 4.
- With even line breaks on for pills, a long pill such as the Council vote may take a second line, broken evenly.
- Plain words in the cards, with a glossary entry or a footnote for every technical term.
- Each figure names its source and its year; see [DATA.md](../DATA.md).
- A note's title ends with a colon: "Why cuts can shrink the economy: When ..."
- A list item that starts with a label ends the label with a colon, in the game and in these documents: "**Tightening:** ...", never "**Tightening.** ...".
- A glossary term keeps the punctuation that touches it, an opening bracket before or a comma or stop after, on its line.
- Even line breaks are on by default: no word sits alone on the last line of a paragraph, a label or a switch's text.

## Source files

- CSS is indented by two spaces, with one declaration per line.
- `index.html` is indented by two spaces.
- No file has two empty lines in a row.

`test/data.test.js` checks the rules on source files, quotes and dashes; `test/ui.test.js` checks the heading margins and the flush edges.
