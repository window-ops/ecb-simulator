/* Euro area figures that are not per country: the bank's rates, the
   instruments it used in history, trust in the bank, the far-right share of
   seats, and the fiscal tightening of each year. The model measures the
   player's choices against these. Values after 2025 follow Selk's history
   (js/data/selk.js) or a neutral projection. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  function byYear(first, text) {
    var o = {};
    text.trim().split(/\s+/).forEach(function (v, i) { o[first + i] = Number(v); });
    return o;
  }
  var H = S.HIST = {};

  /* Main refinancing rate, annual average, % (ECB key interest rates) */
  H.rate = byYear(2008, "3.9 1.3 1.0 1.25 0.9 0.55 0.15 0.05 0.0 0.0 0.0 0.0 0.0 0.0 0.6 3.75 4.1 2.4");
  /* Deposit facility rate, annual average, % */
  H.depo = byYear(2008, "3.0 0.5 0.25 0.5 0.1 0.0 -0.05 -0.2 -0.35 -0.4 -0.4 -0.45 -0.5 -0.5 0.1 3.3 3.65 2.2");

  /* Instruments the historical bank used, by year. Draghi measures are
     marked in S.INSTRUMENTS (js/data/instruments.js). */
  function span(a, b) { var o = {}; for (var y = a; y <= b; y++) { o[y] = true; } return o; }
  H.used = {
    fullAllot: span(2008, 2025),
    ltro1y: span(2009, 2010),
    cbpp: span(2009, 2010),
    smp: span(2010, 2012),
    ltro3y: span(2011, 2013),
    omt: span(2012, 2025),
    neg: span(2014, 2021),
    tltro: span(2014, 2023),
    qe: (function () { var o = span(2015, 2018); o[2019] = true; o[2020] = true; o[2021] = true; o[2022] = true; return o; })(),
    pepp: span(2020, 2022),
    tpi: span(2022, 2025)
  };
  /* Collateral waivers for program countries in history: Greek bonds were
     accepted whatever their rating from May 2010, with pauses, until
     February 2015 */
  H.waiver = { GR: span(2010, 2014), IE: span(2011, 2013), PT: span(2011, 2014), CY: span(2013, 2014) };
  /* Emergency liquidity in history: frozen for Greek banks on 28 June 2015;
     a deadline for Cypriot banks in March 2013 */
  H.ela = { GR: { 2015: "capped" }, CY: { 2013: "capped" } };
  /* Troika programs in history: the years the bank sat in the Troika */
  H.programs = {
    GR: { start: 2010, end: 2018 },
    IE: { start: 2010, end: 2013 },
    PT: { start: 2011, end: 2014 },
    CY: { start: 2013, end: 2016 }
  };

  /* Fiscal tightening by year, % of GDP: the change in the structural
     primary balance attributed to programs and to the fiscal rules.
     Rounded estimates (DATA.md). */
  H.tightening = {
    GR: { 2010: 5.0, 2011: 3.0, 2012: 2.5, 2013: 2.0, 2014: 0.5, 2015: 0.5, 2016: 1.0, 2017: 0.5 },
    PT: { 2011: 2.5, 2012: 2.0, 2013: 1.2, 2014: 0.5 },
    IE: { 2009: 2.0, 2010: 2.0, 2011: 2.0, 2012: 1.5, 2013: 1.0 },
    ES: { 2010: 1.5, 2011: 1.0, 2012: 2.5, 2013: 1.0 },
    IT: { 2011: 1.0, 2012: 2.5, 2013: 0.5 },
    CY: { 2013: 2.0, 2014: 2.0 },
    FR: { 2011: 1.0, 2012: 1.0, 2013: 1.0 },
    NL: { 2011: 0.8, 2012: 0.8, 2013: 0.8 },
    BE: { 2011: 0.6, 2012: 0.6, 2013: 0.6 },
    AT: { 2011: 0.6, 2012: 0.6, 2013: 0.6 },
    SI: { 2012: 1.0, 2013: 1.0 },
    SK: { 2011: 1.0, 2012: 1.0, 2013: 1.0 },
    DE: { 2011: 0.5, 2012: 0.5 },
    FI: { 2012: 0.5, 2013: 0.5 },
    LV: { 2009: 4.0, 2010: 3.0 },
    LT: { 2009: 3.0, 2010: 2.0 },
    EE: { 2009: 3.0 }
  };

  /* Trust in the ECB, % of respondents who tend to trust it, Standard
     Eurobarometer, rounded; projection after 2025. Checked: 50% in autumn
     2008 and 40% in spring 2011 (ifo DICE Report 4/2011), 43% of euro area
     respondents in autumn 2023 (ECB Economic Bulletin 3/2024). */
  H.trust = byYear(2008, "50 44 42 38 33 31 33 33 34 38 41 42 40 45 42 43 44 45");

  /* Far-right share of seats, %. European Parliament: the groups to the
     right of the EPP (2009: ECR and EFD; 2014: ECR, EFDD and ENF; 2019: ECR
     and ID; 2024: PfE, ECR and ESN, 187 of 720, as Selk counts them). After
     2024: Selk's history, with the far-right governments ending by 2031
     and 24 of 800 seats in the first Federal Parliament. */
  H.farRight = { 2009: 11.7, 2014: 20.5, 2019: 18.0, 2024: 26.0, 2029: 28.0, 2034: 21.0, 2039: 13.0,
    2044: 3.0, 2049: 4.0, 2054: 5.0, 2059: 5.0, 2064: 6.0, 2069: 6.0 };
  H.EP_ELECTIONS = [2009, 2014, 2019, 2024, 2029, 2034, 2039];
  H.FED_ELECTIONS = [2044, 2049, 2054, 2059, 2064, 2069];

  /* Federal Parliament after 2041, seats out of 800 (Selk: 2044; later
     elections are a projection) */
  H.fedSeats = {
    2044: { ela: 432, sdg: 208, lcb: 136, far: 24 },
    2049: { ela: 404, sdg: 220, lcb: 144, far: 32 },
    2054: { ela: 384, sdg: 228, lcb: 148, far: 40 },
    2059: { ela: 372, sdg: 232, lcb: 156, far: 40 },
    2064: { ela: 360, sdg: 240, lcb: 152, far: 48 },
    2069: { ela: 352, sdg: 244, lcb: 156, far: 48 }
  };

  /* Supply shocks after 2025, from Selk: the heatwaves and failed harvests
     of 2033 in southern Europe, and the floods and heatwaves of the 2050s.
     g is a change in growth, p in inflation, both in points. */
  H.SOUTH = ["GR", "IT", "ES", "PT", "CY", "MT", "HR", "BG", "RO", "SI"];
  H.climate = {
    2033: { south: { g: -1.2, p: 1.0 }, all: { g: -0.2, p: 0.4 } },
    2051: { all: { g: -1.0, p: 0.8 } },
    2053: { south: { g: -1.5, p: 1.5 }, all: { g: -0.5, p: 0.7 } },
    2056: { all: { g: -1.2, p: 1.0 } },
    2058: { south: { g: -1.0, p: 1.2 }, all: { g: -0.4, p: 0.6 } }
  };
})();
