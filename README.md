# ECB Simulator

NOTE: THIS IS A MANUAL COPY OF THE REPOSITORY [FROM GITLAB](https://gitlab.com/window-ops-web/ecb-simulator) BECAUSE I AM TOO TIRED TO ALSO MIRROR THIS REPOSITORY. MAY BE OUTDATED.

A turn-based game in the browser. You lead the European Central Bank and try to keep the euro crisis from happening, or to make it smaller and shorter than it was. Each turn is a year. Decisions reach your desk, the Governing Council votes on them, and governments, parliaments and markets respond.

The game is in constant beta: it may change from one version to the next, or stay as it is, and its figures and texts may contain errors. A new version may not open the saves of an older one.

There are two periods to choose from:

- **Pre-federative, 2008 to 2041:** The European Union under its treaties. Save Greece and the other states the crisis hit. The run ends with the Federal Treaty of 2041, and you may then continue into the Federation.
- **Post-federative, 2041 to 2070:** The Federation of Europe, with one budget and one debt. From 2045 the bank answers to the Federal Parliament, which can give it instructions and remove its president.

The game is built so that Greece can be saved without the Troika and the Draghi measures, with other tools the law allows: interest rates and collateral, emergency liquidity without political conditions, proposals to governments, and investment through the European Investment Bank. Every lawful tool stays open, including those two.

## Premise

Frankfurt, January 2008. You take office as president of the European Central Bank. The euro is nine years old and has just reached 15 members. Inflation is above the bank's target and the main interest rate stands at 4%. In the United States, banks are losing money on mortgages, and within the year Lehman Brothers will fail.

The bank cannot spend, tax or lend to governments. It can set interest rates, decide which assets banks may pledge for loans, provide emergency liquidity, buy bonds within the treaties, and argue in public. Governments decide on loan programs, common debt and treaty changes; the bank can only pressure them. The Governing Council votes on most of your decisions and can reject them.

In the record, the crisis cost Greece a quarter of its output, unemployment in Greece and Spain exceeded 25%, and the bank sat in the Troika that set the terms of the loan programs. The game asks whether a president with the same powers, under the same law, could have done better. After 2025 the question continues into a future that follows Selk's history, up to the Federation of Europe and beyond.

## The record, then Selk

From 2008 to 2025 the events and figures follow what happened. After 2025 the game follows the history told in **Selk**, another browser game by the same designer. Selk is set in 2097 at a research and construction base on Titan, the largest moon of Saturn; its archive tells how Europe got there.

In that history far-right parties lead governments in many states until about 2031, climate strikes spread from 2033, and in 2041 the European Union becomes the Federation of Europe.

You do not need to know Selk to play: every event from it is explained on the card where it appears, the glossary has an entry for each name, and the start screen has a "What is Selk?" button.

## Playing

Open `index.html` in a browser. Everything the game needs is in this folder, so it also works offline; [Running and debugging](docs/running.md) shows how to serve it.

1. Continue a saved game from the title screen, or start a new one: choose a period and a difficulty (with, if you wish, the states the run assumes will join the EU, from Montenegro to an independent Scotland), name the president, pick a member state and one of eight backgrounds (from central banker to climate economist), and choose three advisors out of nine schools.
2. Each year brings 3 to 6 agenda items: the rate decision, events from the record or from Selk's history, and crises your own choices cause. Choose an option on each. Options marked "Council vote" go to the Governing Council, which can reject them.
3. Read the advisors' advice. Each school forecasts with its own idea of how the economy works, and each is right in some conditions.
4. Use the year's initiatives: hearings in the Parliament, persuading a group of the Council, speeches, pressuring governments on a proposal, or a campaign to change the treaties.
5. End the year. The model runs, events and elections follow, and the year report opens.

Underlined words open a short definition, and small raised numbers open a note that explains a harder idea in plain words. The Countries view opens on a map of Europe with each state's figures and the flows of money between them.

A run ends badly if the euro breaks up, if you are removed from office, if trust in the bank stays below 20% for two years, if the far right wins a majority, or if inflation or unemployment become catastrophic. A single state leaving the euro does not end the game. A complete run ends with a short film and four grades compared with history. Achievements are kept across games.

Keyboard: 1 to 9 choose an option, Enter decides and then goes to the next item, N goes to the next item, E ends the year, ? opens help, Escape closes a dialog. Settings > Keyboard lists every key, from moving between views to the end screens, and turns each area on or off.

Help, in the toolbar, explains the concept in detail, with the record of 2010 to 2015 behind it, and each part of the game in a section of its own. Its section The real bank describes how the real bank and its president work, from the bank's public sources, since the bank publishes no program of this kind. Its Bias disclosure page states the designer's position and how it shapes the game.

Settings cover the look of the window and the title screen, difficulty, sound and music, motion and text, and where the game is kept. [Settings](docs/settings.md) describes each one.

## Project

- [Design document](docs/design.md): the decisions behind the game
- [Data and sources](DATA.md): where each figure comes from and how far to trust it
- [Developing](docs/developing.md): how the files fit together, with pages on the architecture, the game data, the model, saved state, the interface rules and layout, sound, accessibility, Selk's history in the game, and the tests
- [Settings](docs/settings.md): every setting, from the theme to the debug tools
- [Translating](TRANSLATING.md)
- [Third-party files](vendor/README.md)

## Credits

- Concept and design: miculpionier
- Code, data entry and text: Claude (Anthropic), following the design document
- Sound engine and translation layer adapted from Selk
- Icons: Breeze icons, KDE
- Font: Noto Sans, the Noto Project Authors
- Map: Natural Earth

## Licenses

- Program code: [GNU GPL-3.0](licenses/GPL-3.0.txt)
- Text and data: [CC BY-SA 4.0](licenses/CC-BY-SA-4.0.txt)
- Third-party files keep their own licenses, listed in [vendor/README.md](vendor/README.md): Breeze icons under LGPL-3.0-or-later, Noto Sans under the SIL Open Font License 1.1, Natural Earth in the public domain.

All characters in the game are fictional. The institutions, treaties, programs and figures of 2008 to 2025 are real; the events after 2025 follow Selk's fictional history.
