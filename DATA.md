# Data and sources

This page lists where each figure in the game comes from and what it measures.

## Status of the figures

The country figures of 2008 to 2025 come from the published Eurostat series, rounded to one decimal and modified slightly.

As in Democracy 4 and other policy simulations, figures change with the policies played, so the game's world has its own Eurostat, which reports slightly different figures from the published series, the record included. In the game, the Countries view and Help > Figures and sources say so.

They were entered by hand, and not every value has yet been compared with the current vintage of its series; recent years (2024 and 2025) and later revisions of debt are the most likely to differ.

Checked against web sources while building: Greek 10-year yields 2011 to 2015 (OECD series on FRED: 15.75, 22.50, 10.05, 6.93, 9.67); Greek debt 2022 to 2024 (Public Debt Management Agency: 177.8, 164.3, 154.2); euro area inflation of 10.6% in October 2022 (Eurostat); trust in the ECB in 2008, 2011 and 2023 (ifo DICE Report 4/2011; ECB Economic Bulletin 3/2024).

## Country figures, 2008 to 2025 (`js/data/countries.js`)

| Code | Measure | Series |
| --- | --- | --- |
| u | Unemployment, % of the labor force aged 15 to 74 | Eurostat une_rt_a |
| p | Inflation, annual average change of the HICP, % | Eurostat prc_hicp_aind |
| d | General government gross debt, Maastricht definition, % of GDP | Eurostat gov_10dd_edpt1 |
| y | 10-year government bond yield, annual average, % | Eurostat irt_lt_mcby_a (EMU convergence criterion series) |
| g | Real GDP growth, % | Eurostat nama_10_gdp, chain-linked volumes |

- Estonia issues no 10-year bond; its yield is modeled as the German yield plus 0.6 points.
- Spreads are the yield minus the German yield.
- Euro area figures are weighted by output (shares of about 2019, rescaled to the members of each year); unemployment is weighted by the labor force (Eurostat lfsa_agan, about 2015).
- The states outside the euro in 2025 (Poland, Sweden, Denmark, Czechia, Romania, Hungary) have only rounded 2025 figures, the start of their projection.

## Euro area figures (`js/data/history.js`)

| Figure | Source |
| --- | --- |
| Main refinancing rate and deposit rate, annual averages | ECB key interest rates |
| Instruments used by year | ECB press releases (fixed-rate full allotment 2008; covered bonds 2009; SMP 2010; 3-year LTROs 2011; OMT 2012; negative deposit rate and TLTROs 2014; PSPP 2015; PEPP 2020; TPI 2022) |
| Collateral waivers and emergency liquidity | ECB decisions of 3 May 2010 and 4 February 2015 (Greek bonds), 28 June 2015 (Greek ELA cap), 21 March 2013 (Cypriot ELA) |
| Programs | Greece 2010, 2012, 2015; Ireland 2010; Portugal 2011; Cyprus 2013 (ESM and Commission records) |
| Fiscal tightening by year | Rounded estimates of the change in the structural primary balance |
| Trust in the ECB | Standard Eurobarometer, "tend to trust", rounded; the 2007 value is an estimate |
| Far-right share of seats | European Parliament results: 2009 (ECR, EFD), 2014 (ECR, EFDD, ENF), 2019 (ECR, ID), 2024 (PfE, ECR, ESN, 187 of 720, as Selk counts them) |

## After 2025

- From 2026 to 2041 the events and their dates follow Selk's CESEA archive (history/2026-FAR-RIGHT to history/2045-REFORMS); figures come from a neutral projection: unemployment drifts toward 95% of its 2025 level, inflation toward 2%, growth to the 2015 to 2019 trend, debt follows a 2% deficit.
- Supply shocks: the heatwaves of 2033 in southern Europe and the floods and heatwaves of 2051, 2053, 2056 and 2058, from Selk's history, with sizes chosen for the game.
- Federal Parliament seats: 2044 from Selk (European Left Alliance 432, Social Democrats and Greens 208, Liberal and Conservative Bloc 136, far right 24); later elections are a projection.

## The authoritarian government of 2029 (`js/data/cards-later.js`)

The card of 2029 names one member state, drawn for each run from the states where a far-right party governed, or came close to it, by 2025. The facts the card quotes are those of the record; what follows in 2029 is fiction, as is the rest of Selk's history.

| State | In the record |
| --- | --- |
| Italy | Brothers of Italy has led the government since October 2022 |
| Finland | The Finns Party has been in the government since June 2023 |
| Slovakia | The Slovak National Party has been in the government since October 2023 |
| Croatia | The Homeland Movement has been in the government since April 2024 |
| Netherlands | The Party for Freedom was in the government from July 2024 to June 2025 |
| Austria | The Freedom Party came first in the election of September 2024 |
| France | The National Rally has been the largest group in the National Assembly since July 2024 |
| Portugal | Chega came second in the election of May 2025 |

The legal points on the card and its notes: Article 50 TEU (leaving the EU), Article 140 TFEU (rates fixed irrevocably), Article 263 TFEU (the Court reviews the bank's acts), Article 7 TEU, Art. 14.2 of the Statute of the ESCB and of the ECB, and the Court's judgment of 26 February 2019 on the Governor of the Bank of Latvia (Joined Cases C-202/18 and C-238/18).

## EU enlargement (`js/data/countries.js`)

On the form for a new game, Difficulty > EU enlargement lets the player choose states outside the EU that the run assumes will join it; none is chosen by default. The years are fixed for each state and are assumptions of the game, set from the targets and the state of the talks in October 2026. The European Commission calls such dates technical projections.

| State | Joins the EU | In the record (October 2026) |
| --- | --- | --- |
| Montenegro | 2028 | Candidate since 2010; 21 of the 33 chapters closed on 12 October 2026; the government's target is to join in 2028. Uses the euro without an agreement with the EU. |
| Albania | 2030 | Candidate since 2014, negotiating since 2022; the target reported in 2025 is 2030. |
| Moldova | 2030 | Candidate since 2022, negotiating since 2024; its president's target is 2030. |
| Ukraine | 2032 | Candidate since 2022, negotiating since 2024, at war since 2022. |
| Serbia | 2032 | Candidate since 2012, negotiating since 2014. |
| North Macedonia | 2033 | Candidate since 2005, negotiating since 2022. |
| Scotland | 2033 | Part of the United Kingdom; voted against independence in 2014. The Scottish National Party won 58 of the 129 seats of the Scottish Parliament in May 2026. The run assumes a referendum in 2028 and independence in 2030. Selk's history has no such referendum: in its story Every second Friday, Scotland is still part of the United Kingdom after 2041 and only discusses joining the Federation. The form for a new game marks the choice as outside Selk's history. |
| Iceland | 2034 | Applied in 2009, suspended its talks in 2013; on 29 August 2026 its voters decided, by 52.8% to 47.2%, not to resume them. The year assumes talks resume after 2028. |
| Bosnia and Herzegovina | 2035 | Candidate since 2022; the opening of negotiations agreed in 2024. |
| Georgia | 2036 | Candidate since 2023; the EU called its accession halted in 2024, and its government suspended the process until 2028. |
| Kosovo | 2037 | Applied in 2022; five EU states do not recognize it. Uses the euro without an agreement with the EU. |

The figures of each state are about 2024, the start of its projection, rounded and approximate: unemployment, inflation, general government debt as a share of output, a 10-year yield and real growth. Most of these states issue no 10-year bond in their own currency; the yield is an estimate from their latest bonds abroad. The weight is the state's 2024 output on the scale of the other states. Scotland's debt is an assumed share of the United Kingdom's debt; its growth (1.2% in 2024) and unemployment come from the Scottish Government's figures as Skills Development Scotland reports them.

Sources checked while building: the European Commission's enlargement package of November 2025 and later reports (Euronews, EUISS, Eunews); the intergovernmental conference with Montenegro of 12 October 2026 (European Western Balkans); the Icelandic referendum of 29 August 2026 (Government of Iceland, The Local, Wikipedia's results table); the Scottish Parliament election of May 2026 (Scottish Parliament Information Centre); the World Bank's Western Balkans Regular Economic Report No. 28 (Fall 2025); IMF reviews of Ukraine (2024) and Moldova (2024). The values were not compared one by one with the IMF's or the World Bank's databases, which could not be reached from the build environment.

The map draws the United Kingdom whole until the run's year of Scottish independence (see Map below).

## Money flows (`js/data/flows.js`)

| Figure | Source and treatment |
| --- | --- |
| TARGET2 balances, end of year, 2008 to 2025 | ECB, TARGET balances of the participating national central banks (dataset TGB), rounded to the nearest 5 billion euros. Entered from memory of the series and not yet compared value by value with it; Germany at the end of 2011 (463) matches the Bundesbank's annual report. States not listed are taken as zero. |
| Lending to euro area banks, end of year | ECB, Eurosystem balance sheet: main and longer-term refinancing operations, rounded to the nearest 5 billion euros, with the same caveat |
| Euro area output, current prices | Eurostat, nama_10_gdp, rounded to the nearest 50 billion euros |
| Capital flight | The change in a state's TARGET2 balance over the year |
| Lending by state | The euro area total shared out half by output and half by TARGET2 liabilities, plus emergency liquidity for banks below 45 on the stability index; a modeling choice for the game |
| The player's changes | Each point of spread above the record moves 1.2% of output out of a state each year, and each point of bank stability lost 0.2%; the gap fades by 15% a year. After 2025 the recorded balances fade by 5% a year, and by 20% a year after 2041. A modeling choice for the game. |

## Map (`js/data/map.js`)

Country outlines from Natural Earth, Admin 0 countries at 1:50m (public domain), projected with the Lambert azimuthal equal-area projection centered on 52° N, 10° E (the projection of EPSG:3035, which Eurostat uses), clipped to Europe and simplified to about 4 km. `tools/build-map.py` makes the file. Borders follow Natural Earth's choices; Northern Cyprus is drawn as land outside the EU. Scotland's outline comes from Natural Earth's Admin 0 map units at 1:50m and is drawn only in a run where Scotland has become independent; otherwise the United Kingdom is drawn whole.

## Model parameters (`js/model/model.js`)

| Parameter | Value | Basis |
| --- | --- | --- |
| Fiscal multiplier in a recession with rates near zero | 1.2 | Blanchard and Leigh (2013) |
| Fiscal multiplier in normal times | 0.6 | Same |
| Okun's coefficient | 0.3 to 0.8 by country | Higher where unemployment moved more with output in the record (Spain 0.8, Greece 0.6) |
| Calm part of a spread | 3.5 basis points per point of debt above 60% of GDP | Calibrated to reproduce the record |
| Panic part of a spread | Shrinks with the backstop | De Grauwe (2011) |
| Far-right share | Rises with unemployment and tightening | Funke, Schularick and Trebesch (2016); Gabriel, Klein and Pessoa (forthcoming) |

The parameters are calibrated so that a run taking every historical choice reproduces the record within a few tenths of a point; `node test/model.test.js` checks it and prints the Greek figures.

## References

- Blanchard, O. and Leigh, D. (2013). Growth forecast errors and fiscal multipliers. American Economic Review, 103(3).
- De Grauwe, P. (2011). The governance of a fragile eurozone. CEPS Working Document 346.
- Duprey, T. and Klaus, B. (2015). Dating systemic financial stress episodes in the EU countries. ECB Working Paper 1873.
- Funke, M., Schularick, M. and Trebesch, C. (2016). Going to extremes: politics after financial crises, 1870 to 2014. European Economic Review, 88.
- Gabriel, R. D., Klein, M. and Pessoa, A. S. (forthcoming). The political costs of austerity. Review of Economics and Statistics.
- Varoufakis, Y., Holland, S. and Galbraith, J. K. (2013). A modest proposal for resolving the eurozone crisis, version 4.0.
- Breeze color schemes: KDE/breeze, colors/BreezeLight.colors and colors/BreezeDark.colors. Plasma accent colors: plasma-workspace, kcms/colors/ui/AccentColorUI.qml.
