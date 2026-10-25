/* The member states of the euro area and the EU states that join it later.

   For each state: its name, the year it adopted the euro (null for a state
   that joins during the game), its weight in euro area output (shares of
   about 2019, rescaled whenever membership changes), Okun's coefficient (how
   much unemployment moves with the output gap), its central bank, and the
   annual figures from 2008 to 2025:

     u  unemployment, % of the labor force aged 15 to 74 (Eurostat une_rt_a)
     p  inflation, annual average change of the HICP, % (Eurostat prc_hicp_aind)
     d  general government gross debt, % of GDP (Eurostat gov_10dd_edpt1)
     y  10-year government bond yield, annual average, % (Eurostat irt_lt_mcby_a)
     g  real GDP growth, % (Eurostat nama_10_gdp)

   Euro area figures are weighted by output, and unemployment by the labor
   force.

   The figures come from the published series, rounded to one decimal
   (DATA.md). Estonia issues no 10-year bond; its yield is modeled from the
   German one.

   States that join during the game have only their 2025 figures, the start
   of their projection. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  function row(text) {
    return text.trim().split(/\s+/).map(function (v) { return v === "-" ? null : Number(v); });
  }
  /* Labor force, millions, about 2015 (Eurostat lfsa_agan), for weighting
     unemployment */
  var LF = { DE: 42, FR: 29.5, IT: 25.5, ES: 22.9, NL: 8.9, BE: 5.0, AT: 4.4, IE: 2.2, FI: 2.6, PT: 5.2, GR: 4.8, SK: 2.7, LU: 0.27,
    SI: 1.0, LT: 1.45, LV: 0.98, EE: 0.69, CY: 0.42, MT: 0.2, HR: 1.8, BG: 3.3, PL: 17.3, SE: 5.3, DK: 2.9, CZ: 5.3, RO: 9.0, HU: 4.6,
    /* The states a run may assume to join the EU (S.CANDIDATES), about 2024 */
    ME: 0.29, AL: 1.45, RS: 3.2, MK: 0.8, BA: 1.1, XK: 0.45, MD: 0.9, UA: 13, GE: 1.6, IS: 0.23, SCT: 2.8 };
  function C(code, name, joined, weight, okun, bank, data) {
    var o = { code: code, name: name, joined: joined, weight: weight, okun: okun, bank: bank, lf: LF[code], hist: {} };
    Object.keys(data).forEach(function (k) {
      o.hist[k] = typeof data[k] === "string" ? row(data[k]) : data[k];
    });
    return o;
  }
  S.FIRST_YEAR = 2008;
  S.LAST_DATA_YEAR = 2025;

  S.COUNTRIES = [
    C("DE", "Germany", 1999, 28.5, 0.30, "Deutsche Bundesbank", {
      u: "7.4 7.6 7.0 5.8 5.4 5.2 5.0 4.6 4.1 3.8 3.4 3.1 3.6 3.6 3.1 3.1 3.4 3.7",
      p: "2.8 0.2 1.1 2.5 2.2 1.6 0.8 0.7 0.4 1.7 1.9 1.4 0.4 3.2 8.7 6.0 2.5 2.2",
      d: "65.7 73.2 82.0 79.4 80.7 78.3 75.3 71.9 69.0 64.7 61.3 58.9 68.0 68.1 65.0 62.9 62.5 63.5",
      y: "4.0 3.2 2.7 2.6 1.5 1.6 1.2 0.5 0.1 0.3 0.4 -0.2 -0.5 -0.4 1.1 2.4 2.3 2.6",
      g: "1.0 -5.7 4.2 3.9 0.4 0.4 2.2 1.5 2.2 2.7 1.0 1.1 -4.1 3.7 1.4 -0.3 -0.2 0.3"
    }),
    C("FR", "France", 1999, 20.3, 0.40, "Banque de France", {
      u: "7.4 9.1 9.3 9.2 9.8 10.3 10.3 10.4 10.1 9.4 9.0 8.4 8.0 7.9 7.3 7.4 7.4 7.6",
      p: "3.2 0.1 1.7 2.3 2.2 1.0 0.6 0.1 0.3 1.2 2.1 1.3 0.5 2.1 5.9 5.7 2.3 0.9",
      d: "68.8 83.0 85.3 87.8 90.6 93.4 94.9 95.6 98.0 98.1 97.8 97.4 114.6 112.9 111.4 109.8 113.2 116.0",
      y: "4.2 3.6 3.1 3.3 2.5 2.2 1.7 0.8 0.5 0.8 0.8 0.1 -0.1 0.0 1.7 3.0 3.0 3.3",
      g: "0.3 -2.9 1.9 2.2 0.3 0.6 1.0 1.1 1.0 2.4 1.8 1.9 -7.6 6.8 2.6 1.1 1.1 0.8"
    }),
    C("IT", "Italy", 1999, 15.0, 0.40, "Banca d'Italia", {
      u: "6.7 7.7 8.4 8.4 10.7 12.1 12.7 11.9 11.7 11.3 10.6 10.0 9.3 9.5 8.1 7.7 6.5 6.1",
      p: "3.5 0.8 1.6 2.9 3.3 1.2 0.2 0.1 -0.1 1.3 1.2 0.6 -0.1 1.9 8.7 5.9 1.1 1.7",
      d: "106.2 116.6 119.2 119.7 126.5 132.5 135.4 135.3 134.8 134.2 134.4 134.2 154.9 147.1 140.5 137.3 135.3 137.0",
      y: "4.7 4.3 4.0 5.4 5.5 4.3 2.9 1.7 1.5 2.1 2.6 1.9 1.2 0.8 3.2 4.3 3.7 3.6",
      g: "-1.0 -5.3 1.7 0.7 -3.0 -1.8 0.0 0.8 1.3 1.7 0.9 0.4 -8.9 8.9 4.8 0.8 0.7 0.5"
    }),
    C("ES", "Spain", 1999, 10.5, 0.80, "Banco de España", {
      u: "11.3 17.9 19.9 21.4 24.8 26.1 24.4 22.1 19.6 17.2 15.3 14.1 15.5 14.9 13.0 12.2 11.4 10.5",
      p: "4.1 -0.2 2.0 3.0 2.4 1.5 -0.2 -0.6 -0.3 2.0 1.7 0.8 -0.3 3.0 8.3 3.4 2.9 2.6",
      d: "39.7 53.3 60.5 69.9 90.0 100.5 105.1 103.3 102.8 101.9 100.5 98.2 120.3 116.8 111.6 107.7 101.8 100.5",
      y: "4.4 4.0 4.3 5.4 5.8 4.6 2.7 1.7 1.4 1.6 1.4 0.7 0.4 0.3 2.2 3.5 3.2 3.2",
      g: "1.1 -3.6 0.2 -0.8 -3.0 -1.4 1.4 3.8 3.0 3.0 2.3 2.0 -10.9 6.7 6.4 2.5 3.5 2.9"
    }),
    C("NL", "Netherlands", 1999, 6.8, 0.40, "De Nederlandsche Bank", {
      u: "3.7 4.4 5.0 5.0 5.8 7.3 7.4 6.9 6.0 4.9 3.8 3.4 3.8 4.2 3.5 3.6 3.7 3.9",
      p: "2.2 1.0 0.9 2.5 2.8 2.6 0.3 0.2 0.1 1.3 1.6 2.7 1.1 2.8 11.6 4.1 3.2 3.0",
      d: "54.7 56.8 59.2 61.6 66.0 67.6 67.9 64.6 61.9 56.9 52.4 48.6 54.1 51.7 48.3 45.1 43.7 44.5",
      y: "4.2 3.7 3.0 3.0 1.9 2.0 1.5 0.7 0.3 0.5 0.6 -0.1 -0.4 -0.3 1.4 2.8 2.7 2.9",
      g: "2.2 -3.7 1.3 1.6 -1.0 -0.1 1.4 2.0 2.2 2.9 2.4 2.0 -3.9 6.3 5.0 0.1 1.0 1.6"
    }),
    C("BE", "Belgium", 1999, 3.9, 0.40, "National Bank of Belgium", {
      u: "7.0 7.9 8.3 7.2 7.6 8.5 8.6 8.5 7.8 7.1 6.0 5.4 5.8 6.3 5.6 5.5 5.7 6.0",
      p: "4.5 0.0 2.3 3.4 2.6 1.2 0.5 0.6 1.8 2.2 2.3 1.2 0.4 3.2 10.3 2.3 4.3 3.0",
      d: "92.5 99.5 99.6 102.3 104.1 105.2 107.0 105.2 105.0 102.0 99.9 97.6 111.8 107.9 102.6 103.1 104.7 106.0",
      y: "4.4 3.9 3.5 4.2 3.0 2.4 1.7 0.8 0.5 0.7 0.8 0.2 -0.1 0.0 1.7 3.1 3.0 3.2",
      g: "0.4 -2.0 2.9 1.7 0.7 0.5 1.6 2.0 1.3 1.6 1.8 2.2 -5.3 6.9 3.0 1.4 1.0 1.0"
    }),
    C("AT", "Austria", 1999, 3.3, 0.35, "Oesterreichische Nationalbank", {
      u: "4.1 5.3 4.8 4.6 4.9 5.4 5.6 5.7 6.0 5.5 4.9 4.8 6.0 6.2 4.8 5.1 5.2 5.5",
      p: "3.2 0.4 1.7 3.6 2.6 2.1 1.5 0.8 1.0 2.2 2.1 1.5 1.4 2.8 8.6 7.7 2.9 3.5",
      d: "68.4 79.6 82.4 82.2 81.7 81.3 84.0 84.9 82.8 78.5 74.1 70.6 82.9 82.5 78.4 78.5 81.8 82.5",
      y: "4.4 3.9 3.2 3.3 2.4 2.0 1.5 0.7 0.4 0.6 0.7 0.1 -0.2 -0.1 1.7 3.1 2.9 3.0",
      g: "1.5 -3.8 1.8 2.9 0.7 0.0 0.7 1.0 2.0 2.3 2.4 1.8 -6.6 4.2 5.3 -1.0 -0.7 0.3"
    }),
    C("IE", "Ireland", 1999, 2.9, 0.50, "Central Bank of Ireland", {
      u: "6.8 12.6 14.6 15.4 15.5 13.8 11.9 9.9 8.4 6.7 5.8 5.0 5.9 6.2 4.5 4.3 4.3 4.6",
      p: "3.1 -1.7 -1.6 1.2 1.9 0.5 0.3 0.0 -0.2 0.3 0.7 0.9 -0.5 2.4 8.1 5.2 1.3 1.8",
      d: "42.5 61.5 86.1 110.1 119.9 119.9 104.1 76.7 74.2 67.6 63.0 57.0 58.4 54.4 43.1 43.3 40.9 38.0",
      y: "4.5 5.2 5.7 9.6 6.2 3.8 2.4 1.2 0.7 0.8 0.9 0.3 -0.1 0.1 1.7 3.0 2.8 2.9",
      g: "-4.5 -5.1 1.8 0.3 0.2 1.4 8.6 24.5 2.0 9.0 8.5 5.4 6.6 15.1 7.5 -2.5 2.6 9.0"
    }),
    C("FI", "Finland", 1999, 2.0, 0.40, "Bank of Finland", {
      u: "6.4 8.3 8.5 7.8 7.7 8.2 8.7 9.4 8.8 8.6 7.4 6.7 7.7 7.7 6.8 7.2 8.4 9.8",
      p: "3.9 1.6 1.7 3.3 3.2 2.2 1.2 -0.2 0.4 0.8 1.2 1.1 0.4 2.1 7.2 4.3 1.0 1.9",
      d: "32.6 41.5 46.9 48.3 53.6 56.2 59.8 63.6 63.2 61.2 59.8 64.9 74.7 72.6 74.0 77.1 82.1 85.0",
      y: "4.3 3.7 3.0 3.0 1.9 1.9 1.4 0.7 0.4 0.5 0.7 0.1 -0.2 -0.1 1.6 3.0 2.9 3.1",
      g: "0.8 -8.1 3.2 2.5 -1.4 -0.9 -0.4 0.5 2.8 3.2 1.1 1.2 -2.4 2.7 0.8 -0.9 0.4 0.1"
    }),
    C("PT", "Portugal", 1999, 1.8, 0.50, "Banco de Portugal", {
      u: "8.8 10.7 12.0 12.9 15.8 16.4 14.1 12.6 11.2 9.0 7.1 6.5 6.9 6.6 6.1 6.5 6.4 6.3",
      p: "2.7 -0.9 1.4 3.6 2.8 0.4 -0.2 0.5 0.6 1.6 1.2 0.3 -0.1 0.9 8.1 5.3 2.7 2.2",
      d: "75.6 87.8 100.2 114.4 129.0 131.4 132.9 131.2 131.5 126.1 121.5 116.6 134.9 124.5 112.4 97.7 94.9 91.0",
      y: "4.5 4.2 5.4 10.2 10.5 6.3 3.8 2.4 3.2 3.1 1.8 0.8 0.4 0.3 2.2 3.2 3.0 3.1",
      g: "0.3 -3.1 1.7 -1.7 -4.1 -0.9 0.8 1.8 2.0 3.5 2.8 2.7 -8.2 5.6 7.0 2.6 1.9 1.9"
    }),
    C("GR", "Greece", 2001, 1.5, 0.60, "Bank of Greece", {
      u: "7.8 9.6 12.7 17.9 24.5 27.5 26.5 24.9 23.6 21.5 19.3 17.3 16.3 14.7 12.4 11.1 10.1 9.0",
      p: "4.2 1.3 4.7 3.1 1.0 -0.9 -1.4 -1.1 0.0 1.1 0.8 0.5 -1.3 0.6 9.3 4.2 3.0 3.0",
      d: "109.4 126.7 147.5 175.2 162.0 178.2 180.3 176.7 180.5 179.5 186.4 180.6 207.0 195.0 177.8 164.3 154.2 147.0",
      y: "4.8 5.2 9.1 15.7 22.5 10.1 6.9 9.7 8.4 6.0 4.2 2.6 1.3 0.9 3.5 3.9 3.4 3.4",
      g: "-0.3 -4.3 -5.5 -10.1 -7.1 -2.5 0.5 -0.2 -0.5 1.1 1.7 1.9 -9.2 8.7 5.7 2.3 2.1 2.1"
    }),
    C("SK", "Slovakia", 2009, 0.8, 0.40, "Národná banka Slovenska", {
      u: "9.6 12.1 14.5 13.7 14.0 14.2 13.2 11.5 9.7 8.1 6.5 5.8 6.7 6.8 6.1 5.8 5.3 5.4",
      p: "3.9 0.9 0.7 4.1 3.7 1.5 -0.1 -0.3 -0.5 1.4 2.5 2.8 2.0 2.8 12.1 11.0 3.2 4.2",
      d: "28.6 36.4 40.6 43.3 51.8 54.7 53.6 51.7 52.3 51.5 49.6 48.1 58.9 61.1 57.8 56.1 59.3 61.0",
      y: "4.7 4.7 3.9 4.4 4.6 3.2 2.1 0.9 0.5 0.9 0.9 0.3 0.0 -0.1 2.2 3.7 3.5 3.5",
      g: "5.6 -5.5 5.7 2.9 1.9 0.7 2.7 5.2 1.9 2.9 4.0 2.5 -3.3 4.8 1.9 2.2 2.1 0.8"
    }),
    C("LU", "Luxembourg", 1999, 0.5, 0.30, "Banque centrale du Luxembourg", {
      u: "5.1 5.5 5.8 5.6 6.0 6.9 7.1 6.7 6.3 5.6 5.6 5.6 6.8 5.3 4.6 5.2 6.4 6.5",
      p: "4.1 0.0 2.8 3.7 2.9 1.7 0.7 0.1 0.0 2.1 2.0 1.6 0.0 3.5 8.2 2.9 2.3 2.6",
      d: "14.9 15.7 19.8 18.5 20.9 22.4 21.9 21.1 19.6 21.8 20.8 22.4 24.5 24.2 24.8 25.0 26.3 27.0",
      y: "4.6 4.2 3.2 2.9 1.8 1.9 1.3 0.4 0.3 0.5 0.6 -0.1 -0.4 -0.3 1.4 2.8 2.7 2.9",
      g: "-1.3 -3.2 4.9 2.5 -0.4 3.7 4.3 2.3 5.0 1.3 1.2 2.9 -0.9 7.2 1.4 -1.1 0.4 1.0"
    }),
    C("SI", "Slovenia", 2007, 0.4, 0.40, "Banka Slovenije", {
      u: "4.4 5.9 7.3 8.2 8.9 10.1 9.7 9.0 8.0 6.6 5.1 4.4 5.0 4.7 4.0 3.7 3.7 3.8",
      p: "5.5 0.8 2.1 2.1 2.8 1.9 0.4 -0.8 -0.2 1.6 1.9 1.7 -0.3 2.0 9.3 7.2 2.0 2.5",
      d: "21.8 34.5 38.3 46.5 53.6 70.0 80.3 82.6 78.5 74.1 70.3 65.4 79.6 74.4 72.5 68.4 67.0 66.0",
      y: "4.6 4.4 3.8 5.0 5.8 5.8 3.3 1.7 1.2 1.0 0.9 0.3 -0.1 0.0 2.0 3.4 3.1 3.1",
      g: "3.5 -7.5 1.3 0.9 -2.6 -1.0 2.8 2.2 3.2 4.8 4.4 3.5 -4.1 8.4 2.7 2.1 1.7 1.0"
    }),
    C("LT", "Lithuania", 2015, 0.4, 0.50, "Lietuvos bankas", {
      u: "5.8 13.8 17.8 15.4 13.4 11.8 10.7 9.1 7.9 7.1 6.2 6.3 8.5 7.1 6.0 6.9 7.1 6.9",
      p: "11.1 4.2 1.2 4.1 3.2 1.2 0.2 -0.7 0.7 3.7 2.5 2.2 1.1 4.6 18.9 8.7 0.9 3.6",
      d: "14.6 28.0 36.2 37.1 39.7 38.7 40.5 42.5 39.7 39.1 33.7 35.9 46.2 43.4 38.1 37.3 38.2 41.0",
      y: "5.6 14.0 5.6 5.2 4.8 3.8 2.8 1.4 0.9 0.3 0.3 0.3 0.0 0.1 2.0 4.1 3.4 3.3",
      g: "2.6 -14.8 1.6 6.0 3.8 3.6 3.5 2.0 2.5 4.3 4.0 4.7 0.0 6.4 2.5 0.4 2.8 2.7"
    }),
    C("LV", "Latvia", 2014, 0.25, 0.50, "Latvijas Banka", {
      u: "7.7 17.5 19.5 16.2 15.0 11.9 10.8 9.9 9.6 8.7 7.4 6.3 8.1 7.6 6.9 6.5 6.9 6.8",
      p: "15.3 3.3 -1.2 4.2 2.3 0.0 0.7 0.2 0.1 2.9 2.6 2.7 0.1 3.2 17.2 9.1 1.3 3.6",
      d: "18.5 36.4 47.3 45.1 42.2 40.0 41.6 37.1 40.4 39.0 37.1 36.7 42.7 44.4 41.8 43.6 46.8 48.0",
      y: "6.4 12.4 10.3 5.9 4.6 3.3 2.5 1.0 0.5 0.8 0.9 0.3 0.0 0.0 2.3 3.7 3.4 3.4",
      g: "-3.6 -14.3 -4.5 6.3 4.1 2.3 1.1 4.0 2.4 3.3 4.0 2.5 -3.5 6.7 3.0 -0.3 -0.4 1.0"
    }),
    C("EE", "Estonia", 2011, 0.24, 0.50, "Eesti Pank", {
      u: "5.5 13.5 16.7 12.3 10.0 8.6 7.4 6.2 6.8 5.8 5.4 4.4 6.9 6.2 5.6 6.4 7.6 7.3",
      p: "10.6 0.2 2.7 5.1 4.2 3.2 0.5 0.1 0.8 3.7 3.4 2.3 -0.6 4.5 19.4 9.1 3.7 4.7",
      d: "4.5 7.1 6.6 6.1 9.7 10.2 10.5 9.9 10.2 9.1 8.2 8.5 18.6 17.8 18.5 20.2 23.6 24.5",
      y: null,
      g: "-5.1 -14.4 2.7 7.4 3.1 1.3 3.0 1.9 3.2 5.8 3.8 3.7 -2.9 7.2 -0.5 -3.0 -0.1 0.5"
    }),
    C("CY", "Cyprus", 2008, 0.18, 0.50, "Central Bank of Cyprus", {
      u: "3.7 5.4 6.3 7.9 11.9 15.9 16.1 14.9 13.0 11.1 8.4 7.1 7.6 7.5 6.8 6.1 4.9 4.6",
      p: "4.4 0.2 2.6 3.5 3.1 0.4 -0.3 -1.5 -1.2 0.7 0.8 0.5 -1.1 2.3 8.1 3.9 2.3 0.8",
      d: "44.7 53.4 56.3 65.8 80.3 104.0 109.1 107.2 103.1 92.9 98.4 90.4 113.6 96.5 81.0 73.6 65.0 60.0",
      y: "4.6 4.6 4.6 5.8 7.0 6.5 6.0 4.5 3.8 2.6 2.3 0.6 0.3 0.1 2.4 3.7 3.2 3.0",
      g: "3.6 -1.9 1.3 0.3 -3.4 -6.6 -1.8 3.4 6.6 5.7 5.6 5.5 -3.4 9.9 7.4 2.8 3.4 3.0"
    }),
    C("MT", "Malta", 2008, 0.12, 0.30, "Central Bank of Malta", {
      u: "6.0 6.9 6.9 6.4 6.2 6.1 5.7 5.4 4.7 4.0 3.7 3.6 4.4 3.5 2.9 3.1 3.1 3.0",
      p: "4.7 1.8 2.0 2.5 3.2 1.0 0.8 1.2 0.9 1.3 1.7 1.5 0.8 0.7 6.1 5.6 2.4 2.5",
      d: "61.9 65.5 65.5 69.1 66.5 66.6 61.6 56.2 54.7 47.7 43.6 40.3 52.2 53.9 51.6 49.6 47.4 47.0",
      y: "4.8 4.5 4.2 4.5 4.1 3.4 2.6 1.5 0.9 1.3 1.4 0.6 0.4 0.3 2.1 3.6 3.3 3.3",
      g: "3.3 -2.2 5.5 0.5 4.1 5.5 7.6 9.6 3.4 11.1 6.2 5.9 -8.1 13.5 4.3 7.5 6.0 4.0"
    }),
    C("HR", "Croatia", 2023, 0.5, 0.45, "Hrvatska narodna banka", {
      u: "8.5 9.2 11.6 13.7 15.8 17.3 17.3 16.2 13.1 11.2 8.4 6.6 7.5 7.6 7.0 6.1 5.0 4.6",
      p: "5.8 2.2 1.1 2.2 3.4 2.3 0.2 -0.3 -0.6 1.3 1.6 0.8 0.0 2.7 10.7 8.4 4.0 4.4",
      d: "39.1 48.4 57.3 63.7 69.4 80.3 83.9 83.3 79.8 76.7 73.3 71.1 87.3 78.4 68.5 61.8 57.6 57.0",
      y: "6.0 7.8 6.3 6.5 6.1 4.7 4.1 3.6 3.5 2.8 2.2 1.3 0.9 0.5 2.4 3.6 3.2 3.1",
      g: "1.8 -7.3 -1.3 -0.1 -2.3 -0.4 -0.3 2.5 3.6 3.4 2.8 3.4 -8.3 13.0 7.3 3.3 3.8 3.1"
    }),
    C("BG", "Bulgaria", 2026, 0.6, 0.45, "Bulgarian National Bank", {
      u: "5.6 6.8 10.3 11.3 12.3 13.0 11.4 9.2 7.6 6.2 5.2 4.2 5.1 5.3 4.3 4.3 4.2 3.6",
      p: "12.0 2.5 3.0 3.4 2.4 0.4 -1.6 -1.1 -1.3 1.2 2.6 2.5 1.2 2.8 13.0 8.6 2.6 3.5",
      d: "13.0 13.7 15.3 15.2 16.6 17.0 26.4 25.6 27.4 24.9 22.0 20.0 24.5 23.4 22.6 22.9 24.1 26.0",
      y: "5.4 7.2 6.0 5.4 4.5 3.5 3.3 2.5 2.3 1.6 0.9 0.4 0.3 0.5 1.7 4.0 3.9 3.7",
      g: "6.0 -3.4 0.6 2.4 0.4 0.3 1.9 4.0 3.8 2.8 2.7 4.0 -4.0 7.7 4.0 1.9 2.8 3.0"
    }),
    /* EU states outside the euro in 2025. Each joins between 2027 and 2041
       when its government decides; all are members of the Federation's
       currency from 2041. Figures: 2025, start of the projection. */
    C("PL", "Poland", null, 4.5, 0.40, "Narodowy Bank Polski", { u: [2.9], p: [3.8], d: [58.0], y: [5.5], g: [3.2] }),
    C("SE", "Sweden", null, 3.9, 0.40, "Sveriges Riksbank", { u: [8.7], p: [2.5], d: [34.0], y: [2.5], g: [1.5] }),
    C("DK", "Denmark", null, 2.6, 0.35, "Danmarks Nationalbank", { u: [6.0], p: [2.0], d: [30.0], y: [2.4], g: [2.5] }),
    C("CZ", "Czechia", null, 1.9, 0.35, "Česká národní banka", { u: [2.8], p: [2.5], d: [44.0], y: [4.2], g: [2.0] }),
    C("RO", "Romania", null, 1.9, 0.40, "Banca Națională a României", { u: [5.9], p: [6.0], d: [59.0], y: [7.2], g: [1.0] }),
    C("HU", "Hungary", null, 1.2, 0.40, "Magyar Nemzeti Bank", { u: [4.4], p: [4.5], d: [74.0], y: [6.8], g: [1.0] })
  ];
  /* States outside the EU in 2025 that a run may assume to join it
     (Difficulty > EU enlargement on the form for a new game; off by
     default). Only the states the player selects take part in the run
     (S.game.states). Figures: about 2024, the start of their projection,
     rounded and approximate (DATA.md lists the sources); the weight is the
     state's 2024 output on the scale of the others. Most of them issue no
     10-year bond: their yield is an estimate from their latest bonds
     abroad. Scotland is part of the United Kingdom until a run assumes its
     independence; its debt is an assumed share of the United Kingdom's.
     In S.ACCESSION, selk: false marks a state that never joins in Selk's
     history (Every second Friday, in Selk's notes, has Scotland still in
     the United Kingdom); the form for a new game says so. */
  S.CANDIDATES = [
    C("ME", "Montenegro", null, 0.07, 0.40, "Central Bank of Montenegro", { u: [11.4], p: [3.3], d: [61.0], y: [5.4], g: [3.0] }),
    C("AL", "Albania", null, 0.21, 0.40, "Bank of Albania", { u: [9.4], p: [2.2], d: [55.0], y: [5.9], g: [4.0] }),
    C("RS", "Serbia", null, 0.69, 0.40, "National Bank of Serbia", { u: [8.6], p: [4.6], d: [47.0], y: [4.8], g: [3.9] }),
    C("MK", "North Macedonia", null, 0.13, 0.40, "National Bank of the Republic of North Macedonia", { u: [12.3], p: [3.5], d: [55.0], y: [5.5], g: [2.8] }),
    C("BA", "Bosnia and Herzegovina", null, 0.23, 0.40, "Central Bank of Bosnia and Herzegovina", { u: [12.6], p: [1.7], d: [27.0], y: [5.0], g: [2.6] }),
    C("XK", "Kosovo", null, 0.09, 0.40, "Central Bank of the Republic of Kosovo", { u: [10.8], p: [2.0], d: [17.0], y: [5.0], g: [4.4] }),
    C("MD", "Moldova", null, 0.14, 0.40, "National Bank of Moldova", { u: [4.0], p: [4.7], d: [39.0], y: [7.0], g: [0.1] }),
    C("UA", "Ukraine", null, 1.47, 0.40, "National Bank of Ukraine", { u: [14.3], p: [6.5], d: [90.0], y: [10.0], g: [2.9] }),
    C("GE", "Georgia", null, 0.26, 0.40, "National Bank of Georgia", { u: [13.9], p: [1.1], d: [36.0], y: [7.5], g: [9.4] }),
    C("IS", "Iceland", null, 0.26, 0.35, "Central Bank of Iceland", { u: [3.6], p: [5.9], d: [60.0], y: [6.6], g: [-0.7] }),
    C("SCT", "Scotland", null, 2.2, 0.40, "Scottish Central Bank", { u: [4.2], p: [2.5], d: [95.0], y: [4.6], g: [1.2] })
  ];
  /* When each joins the EU in a run that assumes it: a year set from the
     government's stated target or, without one, a projection. These are
     assumptions, not forecasts. record: where the state stood in 2025.
     euro: "unilateral" for a state that uses the euro without an
     agreement with the EU. Scotland holds a referendum, becomes
     independent and then joins. */
  S.ACCESSION = {
    ME: { eu: 2028, euro: "unilateral", record: "an EU candidate since 2010, negotiating since 2012, with 21 of the 33 chapters closed by October 2026, and using the euro since 2002 without an agreement with the EU" },
    AL: { eu: 2030, record: "an EU candidate since 2014, negotiating since 2022" },
    MD: { eu: 2030, record: "an EU candidate since 2022, negotiating since 2024" },
    IS: { eu: 2034, record: "a state that applied in 2009 and suspended its talks in 2013; on 29 August 2026 its voters decided, by 52.8% to 47.2%, not to resume them" },
    UA: { eu: 2032, record: "an EU candidate since 2022, negotiating since 2024, and at war since Russia's invasion of 2022" },
    RS: { eu: 2032, record: "an EU candidate since 2012, negotiating since 2014" },
    MK: { eu: 2033, record: "an EU candidate since 2005, negotiating since 2022" },
    BA: { eu: 2035, record: "an EU candidate since 2022, with negotiations agreed in 2024" },
    GE: { eu: 2036, record: "an EU candidate since 2023; the EU called its accession halted in 2024, and its government suspended the process until 2028" },
    XK: { eu: 2037, euro: "unilateral", record: "a state that applied in 2022, which five EU states do not recognize, using the euro since 2002 without an agreement with the EU" },
    SCT: { eu: 2033, referendum: 2028, independent: 2030, selk: false, record: "part of the United Kingdom, which left the EU in 2020; Scotland voted against independence in 2014, and the Scottish National Party won 58 of the 129 seats of the Scottish Parliament in May 2026" }
  };
  S.COUNTRY = {};
  S.COUNTRIES.forEach(function (c) { S.COUNTRY[c.code] = c; });
  S.CANDIDATES.forEach(function (c) { S.COUNTRY[c.code] = c; });

  /* The five largest economies form the first voting group of the
     Governing Council */
  S.LARGEST = ["DE", "FR", "IT", "ES", "NL"];
  /* The states the crisis hit hardest, watched in the country view and the
     Greece grade */
  S.PERIPHERY = ["GR", "IE", "PT", "ES", "IT", "CY"];

  /* Historical stress in each country's banks beyond what its bond spread
     shows, in points of the 0 to 100 stability index: Irish banks from
     2008, Spanish savings banks in 2011 to 2012, the Cypriot banks in 2013,
     Greek banks through the program years, Italian banks in 2016 to 2017,
     Banco Espírito Santo in 2014. */
  S.BANK_CRISES = {
    IE: { 2008: 25, 2009: 35, 2010: 40, 2011: 30, 2012: 15 },
    ES: { 2011: 10, 2012: 22, 2013: 8 },
    CY: { 2012: 20, 2013: 45, 2014: 20 },
    GR: { 2011: 20, 2012: 30, 2013: 20, 2014: 10, 2015: 40, 2016: 15 },
    IT: { 2016: 12, 2017: 8 },
    PT: { 2014: 10 },
    SI: { 2013: 15 },
    LV: { 2009: 15 }
  };
})();
