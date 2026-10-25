# Design: indicators, model, events and endings

[Back to the design document](design.md)

## 12. Indicators

### 12.1 Headline indicators, always visible

| Indicator | Definition | Source for 2008 to 2025 |
| --- | --- | --- |
| Inflation | Annual average change in the harmonized index of consumer prices (HICP) | Eurostat, prc_hicp_aind |
| Unemployment | Unemployed people as a share of the labor force, ages 15 to 74 | Eurostat, une_rt_a |
| Spread | 10-year government bond yield minus the German 10-year yield, in percentage points | Eurostat, irt_lt_mcby_a (Estonia has no 10-year bond) |
| Debt to GDP | General government gross debt, Maastricht definition, as a share of GDP | Eurostat, gov_10dd_edpt1 |
| Bank stability | 0 to 100, built from systemic stress indices | ECB, CISS (euro area) and CLIFS (countries) |
| Trust in the bank | Share of respondents who tend to trust the ECB | Standard Eurobarometer |

Each indicator shows the euro area figure in the header bar and each member state in the country view.

### 12.2 Far-right vote share

Seats held by the groups to the right of the European People's Party, as Selk counts them (187 of 720 in 2024), and after 2041 the far-right seats in the Federal Parliament. The indicator stays in the country and parliament views and moves to the head of the header bar once it becomes a concern (see open question 10).

### 12.3 Other figures

GDP growth (Eurostat, nama_10_gdp), deficit (Eurostat, gov_10dd_edpt1), youth unemployment, the euro exchange rate, TARGET2 balances, and the policy rates. After 2041: the federal bond yield and the regional figures of the member states.

## 13. Model

### 13.1 Baseline and changes

From 2008 to 2025 each figure has a recorded value. The model computes only the change caused by the player's choices and adds it to the record. A player who repeats every historical decision sees the recorded history. After 2025 the baseline is a trend projection with Selk's scripted events, and the same model applies.

### 13.2 Relations

All relations are per member state and per year:

- **Output** falls with higher real rates, higher spreads, and spending cuts or tax rises, and rises with investment programs. The multiplier depends on the business cycle.
- **Inflation** follows its own past, the output gap, and import prices.
- **Unemployment** follows output, with a stronger link in countries where it was stronger in the record (Spain, Greece).
- **Spreads** rise with debt, bank stress and political risk, and fall with the bank's backstop. The backstop comes from collateral waivers, ELA, purchases and passed proposals. Spreads have two possible states, calm and panic, and a crisis can move a country from one to the other on its own (De Grauwe, 2011).
- **Debt** follows the gap between the interest rate and growth, the primary balance, and the cost of bank rescues.
- **Primary balance** is set by governments; memoranda raise it by the terms of each program.
- **Bank stability** falls with sovereign stress in the bank's home country, deposit flight and frozen liquidity.
- **Trust** falls with unemployment, inflation and Troika membership, and rises with hearings and outcomes.
- **Far-right share** rises after financial crises and after spending cuts (Funke, Schularick and Trebesch, 2016; Gabriel, Klein and Pessoa, forthcoming).

Parameters are calibrated so that the record of 2008 to 2025 is reproduced, and each one is listed in a data file with its source.

### 13.3 Exits

A member state leaves the euro when its government loses access to both markets and liquidity and a government that favors exit wins an election or a referendum. An exit raises spreads elsewhere, costs trust, lowers the grades, and does not end the game.

## 14. Events

### 14.1 2008 to 2025, from the record

| Year | Events on the agenda |
| --- | --- |
| 2008 | Cyprus and Malta join; rate rise of July; Lehman Brothers fails in September; Irish bank guarantee; full allotment of liquidity in October; coordinated rate cuts |
| 2009 | Slovakia joins; rates fall to 1%; covered bond purchases; European elections; Greece revises its deficit in October |
| 2010 | Greek spreads rise; the first Greek memorandum in May; the SMP; the EFSF; the Irish program in November |
| 2011 | Estonia joins; the Portuguese program; rate rises in April and July; letters to Italy and Spain; Greek referendum announced and withdrawn; governments fall in Greece and Italy; 3-year refinancing loans in December |
| 2012 | Greek debt restructuring and second program; Greek elections in May and June; Spanish bank program; "whatever it takes" and OMT; the ESM in force; the Fiscal Compact signed |
| 2013 | Cyprus; closure of the Greek broadcaster ERT; forward guidance |
| 2014 | Latvia joins; Greece borrows on the markets; negative deposit rate; TLTROs; banking supervision begins; European elections |
| 2015 | Lithuania joins; QE; Syriza government; Greek bond waiver lifted in February; ELA frozen in June; referendum in July; third memorandum |
| 2016 to 2019 | Brexit vote; Italian banks; Greece leaves its program in August 2018; Italian budget dispute; European elections 2019 |
| 2020 | Pandemic; joint EU borrowing (NextGenerationEU); the German Constitutional Court ruling on QE |
| 2021 to 2023 | Strategy review; inflation surge and energy prices; rate rises from July 2022; Croatia joins in 2023 |
| 2024 to 2025 | European elections; Selk's far-right advance |

When the player's earlier choices remove the cause of an event, the event changes or drops out. An example: with Greek spreads calm in 2010, the first memorandum never reaches the agenda.

### 14.2 2026 to 2041, from Selk and the model

| Year | Event |
| --- | --- |
| 2026 | Bulgaria joins; far-right governments in up to 11 states, blocking common positions in the Council |
| 2029, 2034, 2039 | European elections |
| 2031 | Most far-right governments have left office |
| 2033 | Heatwaves and failed harvests in southern Europe; the first coordinated strikes |
| 2035 | Five-day general strike in March |
| 2036 | The 32-hour week in 9 states; energy grids return to public ownership in several |
| 2038 | European Left Alliance founded |
| 2039 | Constitutional convention elected |
| 2040 | Referendums on the Federal Treaty |
| 2041 | The Federation of Europe |

### 14.3 2041 to 2070

Federal Parliament elections every 5 years from 2044; the 2045 reforms; parliamentary instructions to the bank (for example, to finance climate investment or to cap rates); investment grants to Central and Eastern Europe; floods, heatwaves and emergency laws in the 2050s, which raise prices and cut output; turbocapitalist factions, capital flight and private payment networks; the warming peak in 2063; the last Greek repayment in 2070.

## 15. Endings

### 15.1 Game over

| Condition | Proposed threshold |
| --- | --- |
| Euro breakup | Germany, France or Italy leaves, or members with a combined third of euro area GDP leave, or three members leave |
| Removal | Court of Justice ruling before 2041; vote of no confidence after 2045 |
| Trust collapse | Euro area trust in the bank below 20% in two years running |
| Far-right majority | Far-right groups win more than half of the seats in a European or Federal Parliament election |
| Dissolution of the bank | Inflation above 50% in a year, or above 20% for three years; or euro area unemployment above 20% for three years; with every tool already used. The European Council (before 2041) or the Federal Parliament (after) dissolves the bank |

For comparison, euro area unemployment stood at about 12% through 2013, and Greek unemployment at 27% to 28% in the same year (Eurostat monthly releases). Euro area inflation peaked at 10.6% in October 2022 (Eurostat, release of 17 November 2022).

### 15.2 Grades

A run that reaches 2041 or 2070 receives an ending text and four grades:

| Grade | Built from |
| --- | --- |
| Stability | Inflation near 2%, spreads, bank stability, exits |
| Welfare | Unemployment, growth, real wages |
| Democracy | Trust, far-right share, hearings held, Troika membership |
| Greece | Greek unemployment, debt, output against 2008, and whether Greece stayed in the euro |

The ending film compares each grade with the historical record. It notes whether the run used the Troika or the Draghi measures, and names the path the player took (see open question 7 for the post-federative grades). The dialog after the film states the outcome and offers the next steps, without repeating the film. The film of the last payment, in 2070, adds a screen on the federal years (the Parliament's confidence, its instructions followed and refused, the climate actions and the Greek loans) and closes on a ledger whose balance is drawn and closed at zero; the Federation's film closes on the twelve stars gathering into their ring.
