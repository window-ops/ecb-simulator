# ECB Simulator: design document

Draft 3, 21-10-2026. Every decision below comes from the designer's answers; section 17 records the answers given before the game was built, and section 18 the choices made while building it, both in [Answers and later additions](design-answers.md).

## 1. Premise

The player is the president of the European Central Bank. The goal is to keep the euro crisis from happening, or to make it smaller and shorter than it was. The game is turn-based, one turn per calendar year, and plays like Crisis in the Kremlin: proposals reach the president's desk, the president approves, amends or rejects them, the Governing Council votes, and governments, parliaments and markets react.

The game tries to be realistic and is readable by a general audience. From 2008 to 2025 every figure comes from the historical record with its source. After 2025 the game follows the history of Selk (the Federation of Europe in 2041, the reforms of 2045) and leaves the economy to the model.

The intended way to play avoids the Troika and the Draghi measures and saves Greece through other lawful tools. The player may still use every tool the law allows, including the ones the intended path avoids.

## 2. Summary of decisions

| Area | Decision |
| --- | --- |
| Pre-federative period | 2008 to 2041, handover in 2041 |
| Post-federative period | 2041 to 2070, two phases: 2041 to 2045 and 2045 to 2070 |
| Selk history | Events keep their dates; their size depends on the player's record |
| Tenure before 2041 | Successive presidents in one save, 8-year terms, played by the same player |
| Tenure after 2041 | Elected by the Federal Parliament, which can remove the president |
| Post-federative difficulty | Parliament can instruct and dismiss; climate shocks; turbocapitalist factions |
| Game over | Euro breakup, removal from office, trust collapse, far-right majority, catastrophic and unfixable inflation or unemployment leading to the dissolution of the bank |
| Not game over | A single member state leaving the euro |
| Governing Council | Every member votes, with the rotation from 2015 |
| Countries | Every euro member, joining on its real date |
| Turn | 3 to 6 agenda items a year |
| Model | Historical baseline 2008 to 2025, a macro model for the player's changes, scripted events |
| Law | Unlawful actions are unavailable; a treaty campaign can change the law. One exception: in 2029 the bank may expel a member state from the euro, which no treaty provides for; the Court of Justice annuls it and may retire the president, an ending of its own |
| Parliament before 2041 | Hearings raise trust and political cover, at the cost of an agenda slot |
| Advisors | 3 seats, fictional characters, forecasts biased by school, 9 schools |
| Ending | Graded ending compared with history |
| Saves | An autosave for each game plus named manual saves, sorted in one list, in the browser |
| Platform | Static web game, vanilla JavaScript, no build step, GPL-3.0 |
| Interface | One KDE Breeze application window, light and dark themes, Plasma accents plus custom |
| Language | English, in US spelling |
| Bank name | Any of the 24 official-language acronyms, Greek written EKT in Latin letters; the name stays after 2041 |
| Sound | Master switch, master volume, a level per category |
| Reduced motion | Turn transition, Council vote, charts and values keep animating |

## 3. Periods and timeline

### 3.1 Pre-federative period, 2008 to 2041

The first turn is 2008. The player takes office on 1 January 2008, when Jean-Claude Trichet's term ends early in the game's history. The first decision of the game is the rate rise of July 2008, which the historical bank made.

Presidential terms run for 8 years and cannot be renewed (Art. 283(2) TFEU):

| Term | Years | Notes |
| --- | --- | --- |
| 1 | 2008 to 2015 | The crisis years: Lehman, Greece, Ireland, Portugal, Spain, Cyprus |
| 2 | 2016 to 2023 | Brexit vote, the pandemic of 2020, the inflation of 2022 |
| 3 | 2024 to 2031 | The far-right governments of Selk's 2026 entry |
| 4 | 2032 to 2039 | The climate strikes of 2033 to 2036, the convention elected in 2039 |
| 5 | 2040 onward | Interrupted by the Federal Treaty in 2041 |

At the end of each term the European Council appoints the next president, by qualified majority, on a recommendation of the Council, after consulting the European Parliament and the Governing Council.

The player creates the successor: name, member state and background (central banker, finance ministry, academic, trade union economist). The background sets the successor's starting relations with the Council blocs.

The record of the outgoing president affects whether the European Council accepts the player's candidate (see open question 4).

### 3.2 Post-federative period, 2041 to 2070

In Selk the Federation of Europe was founded in 2041, after referendums in every member state approved the Federal Treaty. The Federation has one budget and one debt shared by its member states.

| Phase | Years | The bank's position |
| --- | --- | --- |
| A | 2041 to 2044 | Federal bank, still independent as before 2041 |
| B | 2045 to 2070 | The bank reports to the Federal Parliament under the 2045 reforms; the debt rules are repealed |

Institutions after 2041, from Selk:

| Body | Composition | Powers |
| --- | --- | --- |
| Federal Parliament | 800 seats, elected every 5 years by proportional representation, 3% threshold | Makes federal law; from 2045 the bank reports to it |
| Federal Council | 81 members, three per member state, chosen by national parliaments | Delays laws for up to one year, approves treaties |
| Commission | Elected by voters from 2045, confirmed by the Federal Parliament | Federal executive |
| Member states | 27 governments and parliaments | Education, policing, local planning |

Federal Parliament elections fall in 2044, 2049, 2054, 2059, 2064 and 2069. The first one, in Selk, gave the European Left Alliance 432 seats, the Social Democrats and Greens 208, the Liberal and Conservative Bloc 136 and the far right 24.

The period ends in 2070, the year the Greek loans of 2010 to 2018 would have been repaid in full under Selk's terms. The final event of the game is the last Greek repayment, or its earlier settlement if the player changed that history.

### 3.3 Relation to Selk

Selk's events keep their dates. The player's record changes their size:

| Selk event | Date | What the player's record changes |
| --- | --- | --- |
| Far-right parties enter government in 11 of 27 states | 2024 to 2031 | The number of states and the length of their governments |
| Climate general strikes | 2033 to 2036 | The size of the strikes and the number of states that pass a 32-hour week (9 in Selk) |
| European Left Alliance founded | 2038 | Its strength in the polls |
| Constitutional convention elected | 2039 | Its composition |
| Federal Treaty, Federation of Europe | 2041 | Referendum margins and the treaty's terms on the bank |
| First Federal Parliament election | 2044 | Seat shares |
| Reforms: elected Commission, bank reports to parliament, debt rules repealed | 2045 | How far the reforms go on the bank |
| Investment grants to Central and Eastern Europe | 2047 to 2060 | The pace of wage convergence (58% of the federal average in 2045, 101% in 2060 in Selk) |
| Floods, heatwaves and emergency laws | 2050s | The financial damage and the strain on the bank |
| CESEA founded and funded from the federal budget | 2052 | The size of its budget |
| Warming peaks at 1.9 °C | 2063 | Unchanged; the bank does not set emissions |

Selk's euro crisis notes say the crisis was one of the reasons the Federation was founded. A player who prevents the crisis still reaches the 2041 Federation, brought about more by the climate strikes and the far-right years.

## 4. The president's office

### 4.1 Appointment

| Period | Appointment |
| --- | --- |
| 2008 to 2040 | European Council, qualified majority, 8 years, no renewal |
| 2041 to 2044 | Confirmed by the Federal Parliament (see open question 6) |
| 2045 to 2070 | Elected by the Federal Parliament |

### 4.2 Removal

Before 2041, only the Court of Justice can retire a member of the Executive Board, on the application of the Governing Council or the Executive Board, when the member no longer meets the conditions for office or has committed serious misconduct (Art. 11.4 of the ECB Statute).

In the game this comes from ethics events: private briefings to banks before an announcement, conflicts of interest, leaks. Each such event offers a choice, and the risky choices raise the chance of a case.

After 2045 the Federal Parliament can pass a vote of no confidence by majority. Ignoring parliamentary instructions, losing trust and losing the president's own bloc raise its chance.

## 5. Legal framework

### 5.1 Before 2041

| Provision | Content | Effect in the game |
| --- | --- | --- |
| Art. 127(1) TFEU | Price stability is the primary objective; the bank supports the Union's general economic policies without prejudice to it | Inflation far above 2% costs legal standing and Council support |
| Art. 127(4) TFEU | The bank gives opinions on draft Union law in its field | The player can publish opinions on fiscal rules and bank law |
| Art. 127(6) TFEU | Basis for banking supervision by the bank | Banking supervision tools from November 2014 |
| Art. 130 TFEU | Independence from governments and Union bodies | Governments can ask and threaten, but cannot instruct |
| Art. 123 TFEU | No overdrafts for governments, no direct purchase of their debt | Purchases in the primary market are unavailable |
| Art. 125 TFEU | No bailout of one member's debts by the Union or other members | Shapes what governments may agree to |
| Art. 126 TFEU, Stability and Growth Pact | Deficit and debt limits, the excessive deficit procedure | Governments respond to them; the player can publish opinions |
| Art. 136(3) TFEU | Added in 2011, in force in 2013: allows a stability mechanism | The basis for the ESM |
| Art. 284(3) TFEU | Annual report; hearings in Parliament committees | The Monetary Dialogue hearings |
| Art. 48 TEU | Treaty revision; unanimity and ratification in every member state | The treaty campaign |
| ECB Statute, Art. 10.2 | Simple majority in the Governing Council; when the votes for and against are equal, the president's vote decides | Council votes |
| ECB Statute, Art. 14.4 | The Council can restrict national tasks such as emergency liquidity by a two-thirds majority | Emergency liquidity (ELA) votes |
| ECB Statute, Art. 18 | Open market and credit operations against adequate collateral | Rates, liquidity, collateral, purchases in the secondary market |

Court cases follow the historical record when the player repeats history (Pringle in 2012, Gauweiler in 2015, Weiss in 2018 and the German Constitutional Court ruling of May 2020). New programs can trigger new cases, whose outcome depends on how close the program is to one the courts already accepted.

### 5.2 Treaty campaign

An action that starts a revision under Art. 48 TEU. It needs a proposal from a government, the Parliament or the Commission, a convention or a conference of governments, unanimity, and ratification in every member state, with referendums where national law requires them.

The campaign takes several years, and every government that changes after an election can stall it. Possible goals include a wider mandate for the bank (price stability and employment), a common debt instrument, and a change to Art. 123. The Federal Treaty of 2041 replaces whatever the campaign achieved.

### 5.3 After 2041

The Federal Treaty keeps the bank's independence until 2045. The 2045 reforms make the bank report to the Federal Parliament and repeal the debt rules. Federal law can then instruct the bank, and the Federal Council can delay those laws by up to one year.

## 6. Turn structure

1. **January briefing:** The headline indicators, last year's results, the news, and the year's calendar of events.
2. **Advisors:** Each of the three advisors comments on the agenda and gives a forecast.
3. **Agenda:** 3 to 6 items, each a decision card. The numbers below are for the Standard area of responsibility; Narrow and Broad hold one item fewer or more ([Settings](settings.md)). A calm year holds 3: the rate decision, any scripted or follow-up cards, and quieter items drawn at random for each run from a pool of 33, so two runs differ. They cover supervision, payments, cash and coins, staff, communication, the courts, statistics, opinions on national laws, the annual report, the bank's accounts and the bank's rules. A crisis year gets no quieter items. It fills up to 4 items with crisis items that fit the kind of crisis: a state's debt, its banks, a slump, prices far from the target, or a climate disaster, from a pool of 22. Scripted crisis years can hold up to 6. An item appears only from the year its subject became real, for example instant payments from 2017. An event such as the cost of the new building comes once in a run; any other item reads differently each time it comes back and stops when its versions run out. A question a choice has settled does not come back, and a measure already taken is not offered again. Some choices bring a follow-up card one to three years later. The yearly rate decision and the requests for a loan program change their wording with the situation.
4. **Initiatives:** The player can spend a free agenda slot on an initiative: a parliament hearing, a speech, a proposal to the Council, a step in the treaty campaign, a change of advisor.
5. **Council votes:** Items that need a decision of the Governing Council go to a vote.
6. **End of year:** The model runs, governments and markets respond, elections and scripted events resolve, and the year report opens.

A decision card names the actor who brought it, describes the situation in plain words, offers 2 to 4 options, and shows each advisor's forecast for the options. Real figures show their year and source.

## The rest of the design

The design continues on four pages, with the same section numbers:

- [Actors, instruments and advisors](design-play.md): sections 7 to 11, the Governing Council and the other actors, the instruments, the Troika and memoranda, proposals to governments, and the advisors.
- [Indicators, model, events and endings](design-model.md): sections 12 to 15.
- [Interface](design-interface.md): section 16, the window, appearance, motion, sound, learning the game and saves.
- [Answers and later additions](design-answers.md): sections 17 to 19, the answers given before the game was built, notes from building it and the additions after the first version.

## Sources

- Treaty on the Functioning of the European Union, Art. 48 TEU, Protocol 4 (Statute of the ESCB and of the ECB).
- Court of Justice: Pringle (C-370/12, 2012), Gauweiler (C-62/14, 2015), Weiss (C-493/17, 2018). German Federal Constitutional Court, 2 BvR 859/15, 5 May 2020.
- Eurostat series named in section 12; ECB CISS, and CLIFS (Duprey and Klaus, ECB Working Paper 1873, 2015); Standard Eurobarometer.
- Blanchard, O. and Leigh, D. (2013). Growth forecast errors and fiscal multipliers. American Economic Review, 103(3).
- De Grauwe, P. (2011). The governance of a fragile eurozone. CEPS Working Document 346, May 2011. Revised version in the Australian Economic Review, 45(3), 2012.
- Funke, M., Schularick, M. and Trebesch, C. (2016). Going to extremes: politics after financial crises, 1870 to 2014. European Economic Review, 88.
- Gabriel, R. D., Klein, M. and Pessoa, A. S. (forthcoming). The political costs of austerity. Review of Economics and Statistics, doi:10.1162/rest_a_01373. Earlier version: Sveriges Riksbank Working Paper 418 (2023).
- Varoufakis, Y., Holland, S. and Galbraith, J. K. (2013). A modest proposal for resolving the eurozone crisis, version 4.0.
- Selk: history/2026-FAR-RIGHT to history/2045-REFORMS in js/data/entries.js, docs/euro-crisis.md, notes/euro-crisis.html.
