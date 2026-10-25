# Selk's history in the game

[Back to Developing](developing.md)

From 2008 to 2025 the game follows the record. After 2025 it follows the history told in Selk, another browser game by the same designer, set in 2097 at a base in the Selk crater on Titan. This page lists where that history enters the game. The reasons are in the [design document](design.md), section 3.3.

## Where it appears

| Place | File | What it shows |
| --- | --- | --- |
| Start screen | `js/ui/start.js` | A folded box, "The record, then Selk", with a short account and the "What is Selk?" button |
| "What is Selk?" and Help > Selk | `js/ui/dialogs.js` | The game Selk, and the events of its history that this game uses, from 2024 to 2071 |
| Help | `js/ui/dialogs.js` | A section on Selk and a button to the dialog above |
| Cards from 2026 | `js/data/cards-later.js` | The events below |
| Climate shocks | `S.HIST.climate` in `js/data/history.js` | Heatwaves and failed harvests in 2033, and floods and heatwaves in the 2050s, as changes in growth and inflation |
| Far-right share | `S.HIST.farRight` in `js/data/history.js` | The far right peaks by about 2031 and then declines |
| The Federal Parliament | `S.HIST.fedSeats` in `js/data/history.js` | Seats out of 800 at each federal election: 2044 from Selk, later elections as a projection |
| Glossary and notes | `js/data/glossary.js`, `notes.js` | Glossary entries for Selk, the Federation of Europe, the European Left Alliance and CESEA; notes that explain other names, such as HX Holdings |

## Cards from Selk's history

| Year | Card |
| --- | --- |
| 2026 | Governments question the bank |
| 2028 | A blocked Council |
| 2029 | Force a member state out of the euro? (an authoritarian government; follow-ups on its governor, Article 7, its banks and the Court of Justice) |
| 2030 | Climate and collateral |
| 2033 | Heatwaves and failed harvests |
| 2035 | A five-day general strike |
| 2039 | The constitutional convention |
| 2041 | Confirmation by the Parliament; the Greek loans |
| 2045 | The Parliament's first instruction |
| 2047 | Investment in Central and Eastern Europe |
| 2049 | Credit for renovation |
| 2055 | A cap on rates |
| 2058 | Capital leaves for tax havens |
| 2062 | Private payments over radio relays |
| 2066 | Spaceport finance |
| 2068 | The last Greek repayment |

## Keeping the two games in step

A player needs no knowledge of Selk: every event is explained on the card where it appears. When Selk's history changes, change the dates and names here, in the cards, in `S.HIST` and in the "What is Selk?" dialog together.
