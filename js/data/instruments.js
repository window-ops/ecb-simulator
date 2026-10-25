/* The bank's instruments: what each does, its legal basis, from when it can
   be used, its tag, and its weight in the backstop.

   Tags: "draghi" for the Draghi measures the designer listed (SMP, OMT and
   "whatever it takes", QE, negative rates, TLTROs, the 3-year LTROs, PEPP,
   TPI); "intended" for the four intended paths (rates and collateral, ELA
   without conditions, proposals to the Council, EIB investment); "troika"
   for full membership of the Troika; "neutral" for the rest. Tags feed the
   ending and the advisors and never block an action.

   The backstop is how far markets believe the bank or the governments
   stand behind every member's debt. It is 1 - exp(-1.3 * sum of weights),
   so weights add with diminishing effect (js/model/model.js). */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  S.INSTRUMENTS = {
    fullAllot: { name: "Unlimited loans at the main rate (full allotment)", basis: "ECB Statute, Art. 18", from: 2008, tag: "neutral", weight: 0.05,
      text: "Banks can borrow as much as they ask for at the main rate, if they pledge assets the bank accepts." },
    ltro1y: { name: "1-year loans to banks", basis: "ECB Statute, Art. 18", from: 2008, tag: "neutral", weight: 0.03,
      text: "Loans to banks for up to a year at the main rate." },
    cbpp: { name: "Covered bond purchases", basis: "ECB Statute, Art. 18", from: 2009, tag: "neutral", weight: 0.02,
      text: "The bank buys bonds that banks sell with home loans pledged behind them." },
    smp: { name: "Securities Markets Programme (SMP)", basis: "ECB Statute, Art. 18", from: 2010, tag: "draghi", weight: 0.12, draghi: "SMP",
      text: "The bank buys government bonds from investors, then takes the same amount of money back from banks, so the money in circulation does not grow." },
    ltro3y: { name: "3-year loans to banks", basis: "ECB Statute, Art. 18", from: 2011, tag: "draghi", weight: 0.08, draghi: "3-year LTRO",
      text: "Loans to banks for three years: about €1 trillion in December 2011 and February 2012, before banks repaid older loans." },
    omt: { name: "\"Whatever it takes\" and OMT", basis: "ECB Statute, Art. 18", from: 2012, tag: "draghi", weight: 0.40, draghi: "OMT",
      text: "A promise to buy, with no set limit, the short-term bonds of any state in an ESM program." },
    neg: { name: "Negative deposit rate", basis: "ECB Statute, Art. 18", from: 2008, tag: "draghi", weight: 0.02, draghi: "Negative rates",
      text: "Banks pay a charge to keep money at the central bank overnight." },
    tltro: { name: "Targeted long loans to banks (TLTRO)", basis: "ECB Statute, Art. 18", from: 2014, tag: "draghi", weight: 0.04, draghi: "TLTRO",
      text: "Cheap long loans to banks, the cheaper the more they lend to firms and households." },
    qe: { name: "Quantitative easing (PSPP)", basis: "ECB Statute, Art. 18", from: 2015, tag: "draghi", weight: 0.12, draghi: "QE",
      text: "Large purchases of government bonds from investors, shared among the states by their capital key, a share set by population and output." },
    pepp: { name: "Pandemic purchases (PEPP)", basis: "ECB Statute, Art. 18", from: 2020, tag: "draghi", weight: 0.10, draghi: "PEPP",
      text: "Bond purchases during the pandemic, which could favor the states in most difficulty." },
    tpi: { name: "Transmission Protection Instrument (TPI)", basis: "ECB Statute, Art. 18", from: 2022, tag: "draghi", weight: 0.30, draghi: "TPI",
      text: "The bank buys the bonds of a state whose spread it judges too high for the state's real situation, if the state still follows the fiscal rules." },
    broad: { name: "Broad collateral", basis: "ECB Statute, Art. 18", from: 2008, tag: "intended", weight: 0.08,
      text: "The bank accepts more kinds of assets as security for its loans, including assets with lower ratings." },
    waiver: { name: "Collateral waivers for states in programs", basis: "ECB Statute, Art. 18", from: 2008, tag: "intended", weight: 0.05,
      text: "The bank keeps accepting the bonds of a state in difficulty as security for its loans, whatever their rating." },
    elaOpen: { name: "Emergency liquidity without political conditions", basis: "ECB Statute, Art. 14.4", from: 2008, tag: "intended", weight: 0.06,
      text: "The Governing Council lets national central banks give emergency loans to sound banks, and raises the limits when needed." },
    eib: { name: "Purchases of EIB bonds for approved projects", basis: "ECB Statute, Art. 18", from: 2008, tag: "intended", weight: 0.03,
      text: "The bank buys from investors the EIB bonds that pay for approved investment projects, up to a yearly limit set by the size of the EIB program." },
    guidance: { name: "Forward guidance", basis: "None; a public statement", from: 2008, tag: "neutral", weight: 0.04,
      text: "The bank says how long it expects to keep interest rates where they are." }
  };
  S.BACKSTOP_BASE = 0.05;
})();
