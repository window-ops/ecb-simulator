# Running and debugging

[Back to Developing](developing.md)

## Running

Open `index.html` in a browser, or serve the folder and open the address it prints:

```sh
python3 -m http.server 8000
```

Everything the game needs is in the folder, so it also works offline.

## Debug mode

Settings > Debug opens with the Debug mode switch, off by default, which grants every debug tool. While it is off, the switches below it are disabled and none of the tools acts, whatever its own switch says. Adding `?debug` to the address turns debug mode and the panel on for one visit. The panel's close button hides the panel until the Debug tag in the title bar is pressed; the switch in Settings turns it off.

- **Debug panel**: a panel that can be dragged anywhere and resized from its corner, from 300 by 160px up to 55% of the screen's width and 70% of its height; touch screens keep its size fixed. Five tabs at the top keep the rest short: Situation, Time, Events, Adjust and Inspect. Each row names what its controls act on, and values are in a fixed-width font. Buttons keep their whole label on one line; when the panel is narrow, each label moves above its controls and a list takes a line of its own.

  - Situation: the backstop and the rate against history, the highest exit risks, trust, the far-right share, the Parliament's confidence, and EU enlargement: each state the run assumes will join, with its year in the EU (or the year it is due), its date for the euro and, for Scotland, independence.
  - Time: every control that moves time, and only there: the strategy for automatic choices with a switch for using initiatives to pressure governments, This year (Decide all D, End {year} Y), and Jump (below).
  - Events: adopt a proposal, start a loan program, put an EU enlargement item on this year's agenda (a state's accession, the euro it uses, Scotland's referendum or currency; a state the run did not choose joins the run first, and Scotland's accession and currency make it independent that year), start a succession, and the events that end things, which are marked in red: make a state leave the euro, end the run with a chosen reason. Ending film plays the film of any ending over the run without ending it; that film ends with Close.
  - Adjust: the main rate, an initiative, another change of advisor, the Parliament's confidence, the treaty campaign, the tour, and the achievement tester. The tester shows a chosen achievement's notice without earning it, and earns or forgets it by hand. Beside it, Achievement notices is the same switch as in Settings > Debug: what the run meets by the rules is announced without being kept. It counts the run as if no debug tool had touched it, so a run played to an ending with the debug tools still announces what it reached. Situation shows the achievements: how many are kept, what the run earns, and what it meets by the rules. Achievements are kept across games, not in the run, so the tester does not mark the run as changed by debug.
  - Inspect: the model's hidden values per state, and a copy of the game data.
- **Strategies**: Realistic (the default) takes the historical choice where there is one and the advisors' recommendation elsewhere. Historical, Intended, First and Random are also offered. While debug mode is on, Help has a Debug page that explains each strategy and each tab. Every automatic choice follows the strategy, and the years in between are played in full: votes, successions and events happen as in play.
- **Debug bar and keys**: Settings > Debug > Debug bar (off by default) shows a bar above the agenda, at once and whether the panel is open or not. It holds the actions used most, in separated groups: Play with (the strategy), This year (Decide all D, End year Y) and Jump (a year field with Go to {year} P, and End the period). Controls that reach the end of the period turn red. On a narrow screen the bar scrolls sideways. The keys work while the panel or the bar is on, anywhere in a game, never while typing or while a dialog is open.
- **Jumps into an ending**: a jump or End year that would reach the end of the period (2041 or 2071) asks first, because the ending takes over the run. The question offers the year before (the default), the jump itself, or Cancel. Settings > Debug > Jumps into an ending turns the question off.
- **Begin in**: while debug mode is on, Quick settings on the start page has a Debug: begin in field. The game plays up to that year with the Realistic strategy.
- **The debug mark**: opening the panel or the bar changes nothing. Every action that changes the run (the panel, the bar, the keys and Begin in) first adds an entry to the run's mark (`G.taint`): the year, the action and the date. A marked run earns no achievement other than Market manipulator, and its saves show the tag Debug used, which lists every entry. Help > Saves explains it to the player.

  Every debug action is noted in the archive with a Debug tag. Actions that move to a new year show the year's transition, and one that ends the run plays the ending film, as in play.
- **Debug log**: prints every event (decisions, votes, years, saves, settings) to the browser console. Filter the console by `ECBSIM`.
- **Intended path**: marks the options on the intended path with a tag, as a guide for testing. Players never see the intended path otherwise.
- **Fast mode**: shortens the vote, the turn transition, the charts and the toasts.

The Debug tag in the title bar shows while debug mode is on, so a screenshot shows that it was in use. While an ended run is reviewed (Review the run), the actions that change the run are disabled, in the panel, the debug bar and the keys alike, since each would play the ending again; the ending film, the achievement tester and Inspect still work. The debug panel and the Debug tag stay hidden while an ending screen is shown: the crash screen, the end screen of a period, or an ending film. They come back when it closes.

## Wiping the data

Settings > Debug > Testing > Wipe data on refresh erases every save and the settings at each reload, for testing from a clean start. See [Saved state](saved-state.md).

Settings > Debug > Testing > Keep debug through wipes keeps the debug settings (debug mode, the panel, the log, fast mode, the debug bar, the question before a jump into an ending, the intended path and the achievement notices), Wipe data on refresh, the debug panel's position and the switch itself through every wipe: Wipe data on refresh, Delete all game data, including settings, and Reset all settings. It is kept in localStorage as `ecbsim-debug-keep`. With it on, a tester starts each visit clean and keeps the tools.
