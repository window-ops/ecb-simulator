/* Money flows between the euro states, for the flow map in the Countries
   view (js/ui/map.js) and the model (js/model/model.js).

   S.HIST_T2: each central bank's TARGET2 balance at the end of each year,
   2008 to 2025, in billions of euros: a claim on the Eurosystem is
   positive, a liability negative. Rounded estimates after the ECB's TGB
   series (DATA.md); states not listed are close to zero. The model adds
   the player's changes to these figures and continues them after 2025.

   S.EA_LENDING: the Eurosystem's lending to euro area banks at the end of
   each year (main and longer-term refinancing operations), in billions of
   euros, rounded.

   S.EA_GDP: euro area output at current prices, in billions of euros,
   rounded; after 2025 it grows by 3% a year. */
(function () {
  var S = window.ECBSIM;
  function row(s) { return s.split(" ").map(Number); }
  S.HIST_T2 = {
    DE: row("115 178 326 463 656 510 461 586 754 907 942 895 1068 1261 1140 1020 1080 1030"),
    NL: row("20 20 15 155 125 55 25 25 85 100 105 20 65 45 40 40 40 35"),
    LU: row("20 60 70 125 120 90 110 160 190 195 210 215 250 270 250 230 230 225"),
    FI: row("10 20 25 65 55 25 25 30 55 75 60 45 75 70 40 25 20 20"),
    FR: row("-10 -20 -15 -40 -35 -15 -35 -80 -65 -25 -50 -25 -15 40 -90 -60 -40 -50"),
    BE: row("-15 -20 -20 -50 -30 -20 -15 -20 -5 0 -30 -40 -50 -65 -70 -50 -40 -40"),
    AT: row("-30 -30 -30 -35 -40 -35 -35 -35 -35 -40 -50 -45 -60 -65 -60 -55 -50 -50"),
    IT: row("-15 -10 -30 -190 -255 -230 -210 -250 -355 -430 -480 -440 -535 -590 -685 -520 -450 -420"),
    ES: row("-35 -45 -50 -175 -335 -215 -190 -255 -330 -375 -400 -400 -460 -520 -460 -430 -390 -380"),
    GR: row("-35 -50 -85 -105 -100 -50 -50 -100 -70 -60 -25 -30 -65 -90 -110 -100 -100 -100"),
    PT: row("-20 -25 -60 -60 -60 -55 -60 -70 -75 -80 -75 -75 -75 -80 -70 -60 -55 -55"),
    IE: row("-5 -60 -140 -120 -95 -50 -25 -20 -10 0 15 35 55 25 10 0 0 0"),
    CY: row("0 0 -5 -10 -10 -5 -5 -5 -5 -5 -5 -5 -5 -5 -5 -5 -5 -5")
  };
  S.EA_LENDING = row("860 750 545 880 1130 690 630 560 595 765 735 625 1795 2200 1320 410 85 40");
  S.EA_GDP = row("9600 9250 9500 9800 9850 9950 10150 10500 10800 11200 11550 11900 11400 12300 13500 14400 15000 15500");
})();
