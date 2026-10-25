# The economic model

[Back to Developing](developing.md)

`js/model/model.js` runs one year for every member state. The reasons for each relation are in the design document, [section 13](design-model.md); this page describes the code.

## The record as the baseline

From 2008 to 2025 every state has a recorded value for each figure: the baseline, read with `M.base(code, key, year)`. The model computes only the change that the player's choices cause and adds it to the baseline.

A player who repeats every historical decision therefore sees the recorded history, and the test in `test/model.test.js` checks that a run with the historical choices stays close to it. After 2025 the baseline is a neutral projection with the climate shocks of Selk's history (`S.HIST.climate`).

## One year: `M.step(G, params)`

For each member state, in order:

1. **Rates:** The change from the historical rate, with a negative rate counted as 0.35 points lower, enters with a lag: 60% this year and 40% from last year.
2. **Spreads:** `M.spreadFor` splits the historical spread into a part explained by debt and a panic part. The panic part shrinks as the backstop rises above its historical level, and grows with the far-right share, emergency liquidity that is capped or frozen, and exit risk.
3. **Tightening:** `M.tightening` gives the year's fiscal tightening: the record, or the size set by a loan program and the bank's role in it, reduced by proposals that pass. The difference from the record accumulates with a decay of 10% a year.
4. **Output:** The change in the output gap adds the tightening times the multiplier, the rate change, the spread change, EIB investment, bond purchases and shocks. The multiplier is 1.2 in a recession with rates near zero and 0.6 otherwise.
5. **Unemployment** follows output by the state's Okun coefficient, plus a small hysteresis term that keeps unemployment high after a long slump.
6. **Inflation** follows its own past and the output gap.
7. **Debt** follows deficits, interest costs and nominal growth.
8. **Bank stability** falls with spreads and rises with open emergency liquidity, collateral waivers, broader collateral and the banking proposals.
9. **Exit risk** has a floor set by how severe the year was in the record, and rises with spreads, weaker banks, unemployment above the record, frozen liquidity and a refused program. A backstop above 0.6 lowers it.

Then the model moves money between the states (`flows`). Each state's TARGET2 balance is the record plus a gap: each point of spread above the record moves 1.2% of output out a year, each point of bank stability lost 0.2%, and the gap fades by 15% a year. Capital flight is the change in the balance over the year.

Lending to banks shares the euro area total by output and by TARGET2 liabilities, rises with longer refinancing operations, and adds emergency liquidity for weak banks. The figures sit in each state's `v.t2`, `v.flight` and `v.lend`; `M.gdp`, `M.t2Record` and `M.lendingRecord` give output and the record.

For the euro area the model then sets trust in the bank, which falls with unemployment, inflation above target and a seat in the Troika, and the far-right share, which rises with unemployment and falls with looser policy.

## The backstop

`M.backstop(G)` sums the weights of the instruments in use, the passed proposals, the stability and recovery funds, treaty changes and initiatives, and turns the sum into a share from 0 to 1 with B = 1 - exp(-1.3 × sum). A purchase program announced during a year counts half in that year. `M.histBackstop(year)` gives the same figure for the record, so the model can compare the two.

## Forecasts

`params` holds the model's parameters; `M.TRUE` gives the true ones. Each advisor's school believes its own (`params` in `js/data/advisors.js`), and its forecast runs `M.step` on a copy of the run with those beliefs. A school is right in the conditions its beliefs fit, so the advisors disagree and none is always right.

## Elsewhere in `js/model/`

| File | Contents |
| --- | --- |
| `council.js` | The Governing Council: its members, blocs, rotation from 2015, the expected vote and the vote itself |
| `advisors.js` | Recommendations and forecasts for each school |
| `game.js` | A run: creating it, the agenda, decisions, initiatives, the end of a year, elections, successions, endings and grades |
| `auto.js` | Automatic play for the tests and the debug panel: historical, intended, first or random choices |
