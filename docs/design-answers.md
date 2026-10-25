# Design: answers and later additions

[Back to the design document](design.md)

## 17. Resolved questions

The designer answered the open questions of the draft before the game was built.

| # | Question | Decision |
| --- | --- | --- |
| 1 | Council members 2008 to 2025 | Fictional, with stances that follow each national bank's record |
| 2 | 3-year LTRO, PEPP, TPI | All three count as Draghi measures |
| 3 | EIB bond purchases | Limited to bonds that fund approved projects, up to a yearly cap set by the EIB program |
| 4 | European Council rejects the successor | The run continues with a compromise candidate: weaker Council relations, lower trust |
| 5 | Euro entry of the states outside the euro | Selk is silent on dates; entry depends on the player's record from 2027, and every state uses the currency from 2041 |
| 6 | 2041 to 2044, and terms after 2045 | The Parliament elected in 2039 confirms the president in 2041; after 2045 the term follows the Federal Parliament, with a re-election in 2045, 2050, 2055, 2060 and 2065 |
| 7 | Post-federative grades | Climate replaces Greece |
| 8 | HX Holdings | Halvorsen Relay and Xiran Spaceports appear in the 2060s |
| 9 | Thresholds of section 15.1 ([Endings](design-model.md)) | As proposed |
| 10 | Far-right indicator | Moves to the head of the bar at 30% of the seats or a rise of 5 points between two elections |
| 11 | Title | Follows the chosen acronym |
| 12 | Icons | Breeze icons bundled (LGPL-3.0-or-later) |
| 13 | Licenses | GPL-3.0 for the code, CC BY-SA 4.0 for text and data |
| 14 | Selk code | The sound engine and the translation layer are adapted from Selk |
| 15 | Advisor names | Kept |

The Greek acronym is offered in Latin letters only (EKT), since it looks the same as ΕΚΤ in capitals.

## 18. Notes from building the game

- The historical choice on each card from the record is marked "Historical choice". A run that takes every historical choice reproduces the record within a few tenths of a point (test/model.test.js).
- Mid-year purchase programs (SMP, OMT, QE, PEPP, TPI) count at half weight in the year they start, in history and in the run.
- Advisors set rates by a rule: 0.5 times the gap between inflation and 2%, minus a weight times the rise in unemployment, plus the school's bias. On other cards they score options by their school's weights.
- Proposals gain support with diminishing returns: each press adds (6 + trust / 8) times (1 - support / 120) points.
- Temporary instruments run out: 1-year loans and covered bonds after 2 years, the SMP, the 3-year loans and PEPP after 3. The negative rate ends when the main rate rises above 0.5%.

## 19. Additions after the first version

| Request | What the game does |
| --- | --- |
| Footnotes for harder ideas | Numbered notes at the foot of each card explain ideas such as the Irish bank guarantee, the doom loop between banks and states, collateral waivers or emergency liquidity in plain words. A note can point to another note, which joins the list when opened. The glossary gained entries for the harder terms, and definitions link to other terms. |
| A map of Europe | The Countries view opens on a map with Natural Earth outlines. It shows membership (in the euro, under a program, in the EU only, left the euro) or one indicator in five steps of blue. |
| Debug mode as in Selk | Settings > Debug: a movable debug panel, a console log, fast mode; `?debug` in the address. |
| Storage as in Selk | Save in this tab or on this computer, a warning before switching to this tab only, an offer to keep the game after a canceled close, Wipe data on refresh with a conflict warning, export and import, and a list of kept data. |
| More president types | Eight backgrounds: central banker, finance ministry official, academic economist, trade union economist, former finance minister, commercial banker, former EU official, climate economist. Each sets starting relations; the minister and the EU official start proposals with more support, the banker trades public trust for market confidence, and the climate economist starts with the Parliament and the ecological wing on side. |
| Selk explained | The start screen, the help and the glossary explain Selk for players who do not know it. |
| Third-party files | Kept in `vendor/` with their licenses; nothing is loaded from another site. |
| Tests | In `test/`, run with `node test/run.js`. |
| A euro flow map with sorting | Three flow modes in the Countries map: TARGET2 balances, capital flight and the bank's lending to each state's banks, drawn as arrows as wide as the flows (the 12 largest), beside a table that sorts the states by size, name or share of output and shows the top 5, the top 10 or all of them; the arrows follow the table |
