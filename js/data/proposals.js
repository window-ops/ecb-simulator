/* Proposals to the Council and the Eurogroup, and the goals of a treaty
   campaign. The bank cannot create a common debt or a stability fund; it
   proposes, and the governments decide.

   Each proposal has a starting support (the share of the European Council
   that backs it, weighted by votes), a threshold to pass, a yearly drift
   (the resistance of the governments that oppose it), its weight in the
   backstop once passed, and the share of program tightening it removes. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  S.PROPOSALS = {
    eurobonds: {
      name: "Eurobonds", from: 2008, support: 12, threshold: 90, drift: -6, backstop: 0.45, relief: 0.5,
      text: "Bonds that the euro area governments sell together. Each government must pay the whole debt if the others do not.",
      pro: "Every member would borrow at the same rate, and the euro area would have a safe bond of its own.",
      con: "Governments that borrow cheaply would share the risk of states with more debt. Several national constitutions limit such promises."
    },
    modest: {
      name: "ECB bonds for national debt (\"Modest Proposal\")", from: 2008, support: 18, threshold: 75, drift: -6, backstop: 0.35, relief: 0.5,
      text: "The bank pays the interest on each state's debt up to 60% of its output, the Maastricht limit, with money it raises by selling its own bonds. The state pays the bank back over time. Yanis Varoufakis and Stuart Holland published the plan in November 2010; version 4.0, written with James K. Galbraith, followed in July 2013.",
      pro: "States pay less interest, no state pays for another, and no government gives new guarantees. It uses institutions that already exist.",
      con: "Critics said it bends Art. 123 TFEU and leaves the bank with the risk that a state does not pay."
    },
    conversion: {
      name: "Longer, cheaper rescue loans", from: 2010, support: 30, threshold: 70, drift: -3, backstop: 0.15, relief: 0.25,
      text: "The rescue loans of the program states become long loans at low fixed rates. Each year's payment rises and falls with growth.",
      pro: "States pay less in the first years of a recovery, when payments do the most harm.",
      con: "Lenders would wait longer to be repaid, and some would earn less interest than they pay on their own borrowing."
    },
    eibPlan: {
      name: "EIB investment program", from: 2008, support: 40, threshold: 60, drift: -2, backstop: 0.04, relief: 0,
      text: "Governments give the European Investment Bank more capital and agree on a common investment plan. The bank buys the EIB bonds that pay for approved projects.",
      pro: "Investment creates work now and more capacity later, and it does not count in national deficits.",
      con: "Projects take years to start, and every government must pay into a larger EIB."
    },
    directRecap: {
      name: "Stability fund rescues of banks", from: 2010, support: 35, threshold: 70, drift: -3, backstop: 0.06, relief: 0.15,
      text: "The stability fund puts money straight into failing banks, so the cost is not added to the debt of their home state.",
      pro: "The cost of failing banks no longer adds to the debt of their home state, which ends the doom loop.",
      con: "Lending states would pay for losses in banks they never supervised."
    },
    depositInsurance: {
      name: "Common deposit insurance", from: 2010, support: 25, threshold: 75, drift: -4, backstop: 0.06, relief: 0,
      text: "One common fund guarantees bank deposits up to €100,000 in every member state.",
      pro: "Money in a bank is equally safe in every member state, so a run on one bank does not spread to others.",
      con: "States whose banks have more bad loans would draw on a fund that others paid into."
    }
  };

  /* Treaty campaign goals (Art. 48 TEU). Each stage needs progress points;
     ratification can fail in a referendum. */
  S.TREATY_GOALS = {
    dual: { name: "Price stability and full employment", text: "The bank's task adds full employment beside stable prices, as for the US Federal Reserve." },
    debt: { name: "Common borrowing", text: "The treaties let the euro area borrow together, which makes eurobonds easier to agree on." },
    art123: { name: "Buying new government bonds in emergencies", text: "Art. 123 TFEU changes so the bank may buy government bonds as they are first sold, in an emergency that a parliament declares by vote." }
  };
  S.TREATY_STAGES = ["Proposal", "Convention", "Conference of governments", "Ratification"];
})();
