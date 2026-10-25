/* Rules and tables of the game that the code reads: the difficulty
   levels, the area of responsibility, the pools of agenda items, the
   bad endings and the president's backgrounds. Kept here, in one place,
   so the code holds no game data of its own. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};

  /* Difficulty, chosen for a run and kept with it. Normal is the game as it
     was; Realistic and Hard make the Council slower to follow (will: how
     readily a member agrees; dist: how much the gap between a member's
     stance and an option counts), weigh relations with the members more
     (rel: the relation that moves a vote by one), and keep only part of
     each rise in the governments' support for the bank's proposals (gain:
     each rise as a share of the Normal one). */
  S.DIFFICULTY = {
    normal: { name: "Normal", will: 0.9, dist: 0.8, rel: 150, gain: 1 },
    realistic: { name: "Realistic", will: 0.65, dist: 1, rel: 100, gain: 0.7 },
    hard: { name: "Hard", will: 0.6, dist: 1.05, rel: 90, gain: 0.5 }
  };

  /* The area of responsibility, beside the difficulty: how many items the
     agenda holds besides the rate decision and the scripted cards. A calm
     year fills up to calm items in all, a crisis year to crisis. */
  S.SCOPE = {
    narrow: { name: "Narrow", calm: 2, crisis: 3 },
    standard: { name: "Standard", calm: 3, crisis: 4 },
    broad: { name: "Broad", calm: 4, crisis: 5 }
  };

  /* The quieter items that fill a calm year, and the crisis items that
     fill a crisis year (their cards are in js/data/cards-common.js) */
  S.AGENDA = {
    fillers: ["annual-report", "collateral-review", "speech-topic", "liquidity-review", "supervision-fine", "payment-outage",
      "staff-hiring", "press-question", "court-case", "climate-reporting", "cash-shortage", "data-leak",
      "law-opinion", "counterfeits", "banknote-design", "small-coins", "cash-acceptance", "instant-payments", "stablecoin",
      "annual-accounts", "staff-pay", "own-emissions", "climate-stress", "cyber-test", "dividends", "bank-merger",
      "money-laundering", "housing-costs", "data-revision", "trust-survey", "hearing", "new-building", "student-contest",
      "draft-law", "state-visit", "reserves", "loan-data", "own-portfolio", "supervision-priorities", "swap-line", "euro-abroad",
      "ethics-rules", "council-diversity", "blind-users", "research-conference",
      "payment-access", "visitor-centre", "languages", "whistleblower", "card-payments", "bond-tilt", "cash-resilience", "auditors",
      "outside-forum", "meeting-accounts", "hybrid-work", "frozen-assets"],
    crisis: ["ela-request", "bank-run", "bank-rescue", "downgrade", "short-selling", "youth-jobs", "deflation",
      "price-surge", "energy-bills", "rate-pressure", "mortgage-stress", "insurance-gap", "farm-loans", "rebuild-bonds",
      "relocation-loans", "river-transport", "savers", "price-caps", "forecast-miss", "crisis-hearing", "protest", "press-slip",
      "fund-run", "strong-euro", "wildfire-region", "wage-claims"]
  };

  /* The bad endings: the sentence that tells it, the crash screen's
     headline and stop code, and its evidence panel (map, line or bars;
     for a line, the series and the limit that ended the run) */
  S.ENDINGS = {
    breakup: { text: "The euro breaks up. Too many members have left for the currency to continue.", title: "The euro has broken up", code: "EURO_BREAKUP", panel: "map" },
    farright: { text: "The far right wins a majority of the seats. Its program ends the bank's independence and the common currency.", title: "The far right has taken power", code: "FAR_RIGHT_MAJORITY", panel: "line", keys: [["fr", "Far-right share of the vote"]], at: 50, atLabel: "A majority" },
    trust: { text: "Trust in the bank has stayed below 20% for two years. Governments and the Parliament withdraw their support, and the president resigns.", title: "The president has resigned", code: "TRUST_LOST", panel: "line", keys: [["trust", "Trust in the bank"]], at: 20, atLabel: "The 20% limit" },
    dissolution: { text: "Inflation or unemployment has reached a level the bank can no longer correct. The bank is dissolved.", title: "The bank has been dissolved", code: "BANK_DISSOLVED", panel: "line", keys: [["u", "Unemployment"], ["p", "Inflation"]] },
    removal: { text: "The Court of Justice retires the president for serious misconduct (ECB Statute, Art. 11.4).", title: "The president has been removed", code: "PRESIDENT_REMOVED", panel: "bars" },
    /* The expulsion of 2029 (js/data/cards-later.js), annulled by the Court */
    expulsion: { text: "The Court of Justice annuls the expulsion of a member state from the euro, which no treaty provides for, and retires the president for serious misconduct (ECB Statute, Art. 11.4). The state returns to the euro.", title: "The expulsion has been annulled", code: "EXPULSION_ANNULLED", panel: "bars" },
    noconfidence: { text: "The Federal Parliament passes a motion of no confidence. The president leaves office.", title: "The Parliament has dismissed the president", code: "NO_CONFIDENCE", panel: "bars" },
    notreelected: { text: "The Federal Parliament does not re-elect the president.", title: "The president has not been re-elected", code: "NOT_REELECTED", panel: "bars" }
  };

  /* The president's backgrounds: [id, name, what it changes] */
  S.BACKGROUNDS = [
    ["central", "Central banker", "Good relations with the Council members who prioritized low inflation, and with the Executive Board."],
    ["finance", "Finance ministry official", "Known to governments; neutral with the periphery."],
    ["academic", "Economist from a university", "Respected by the Executive Board; few allies elsewhere."],
    ["union", "Trade union economist", "Trusted by the periphery; distrusted by the members who prioritized low inflation."],
    ["minister", "Former finance minister", "Strong with governments, so proposals start with more support; the Executive Board sees a politician."],
    ["banker", "Commercial banker", "Trusted by markets and by the members who prioritized low inflation; distrusted by the periphery and by the public."],
    ["euofficial", "Former EU official", "Knows the Commission and the Council; proposals start with a little more support."],
    ["climate", "Climate economist", "Trusted by the Parliament and the ecological wing; few allies among the members who prioritized low inflation."]
  ];
})();
