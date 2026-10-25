/* Decision cards from the record, 2008 to 2025. Each card states what the
   historical bank did, so the player can follow or depart from it. Cards
   whose cause the player removed do not appear: a card's "when" checks the
   state of the run. */
(function () {
  var S = window.ECBSIM, M = S.model, log = S.cardKit.log, pct = S.pct;
  function spread(G, k) { return M.expectedSpread(G, k); }
  function member(G, k) { return M.isMember(G, k); }
  function inProgram(G, k) { var p = G.programs[k]; return !!(p && p.active); }

  /* The option the historical bank chose on each card, marked in the game
     as the historical choice. "last" is the last option. */
  S.HIST_CHOICE = {
    lehman: 0, "irish-guarantee": 0, "collateral-2008": 0, cbpp: 0, "greek-revision": 0, "gr-waiver": 0, "gr-program": 0, smp: 0,
    deauville: 0, "ie-program": 0, "pt-program": 0, letters: 0, "gr-referendum": 1, ltro3y: 0, "gr-psi": 0, "es-banks": 0, wit: 0,
    "fiscal-compact": 0, cy: 0, "troika-review": 0, guidance: 0, neg: 0, ssm: 0, qe: 0, "gr-waiver-2015": 0, "gr-ela-2015": 0,
    "gr-third": 0, "speech-leak": 1, brexit: 0, "it-banks": 0, "note-500": 0, taper: 0, "it-budget": 0, restart: 0, pandemic: 0, ngeu: 1,
    strategy: 0, energy: 0, "end-purchases": 0, tpi: 0, program: "last", "exit-crisis": 1
  };

  /* ---------- 2008 ---------- */
  S.script(2008, ["lehman", "irish-guarantee", "collateral-2008"]);
  S.news(2008, "Cyprus and Malta adopt the euro on 1 January 2008. The euro area has 15 members.");
  S.card("lehman", {
    crisis: true,
    title: "Lehman Brothers fails", actor: "Money markets", date: "15 September 2008",
    text: "The US investment bank Lehman Brothers files for bankruptcy. Banks stop lending to each other, and interbank rates rise far above the main rate. Banks in every member state ask the central bank for loans.",
    history: "On 8 October 2008 the historical bank began to lend banks as much as they asked for at a fixed rate (full allotment), and in 2009 it added 1-year loans.",
    options: [
      { label: "Full allotment and 1-year loans", text: "Banks can borrow as much as they ask for at the main rate, for up to a year.", tags: ["neutral"], lean: -0.8, novelty: 0.4, vote: true, onFail: 1,
        apply: function (G) { G.pol.fullAllot = true; G.pol.ltro1y = true; } },
      { label: "Full allotment only", text: "As the historical bank did in October 2008.", tags: ["neutral"], lean: -0.4, vote: true, onFail: 2,
        apply: function (G) { G.pol.fullAllot = true; } },
      { label: "Keep the auctions as they are", text: "Loans to banks stay limited. Weaker banks may fail.", tags: ["neutral"], lean: 1.2, attr: { discipline: 1.2, restructure: 0.6 },
        apply: function (G) { Object.keys(G.c).forEach(function (k) { G.c[k].bankBonus = -12; G.c[k].shock = -0.8; }); } }
    ]
  });
  S.card("irish-guarantee", {
    title: "Ireland guarantees its banks", actor: "Government of Ireland", date: "30 September 2008",
    text: "The Irish government guarantees all deposits and most debts of six domestic banks, about €400 billion, more than twice the country's output. The bank is asked for its opinion.",
    history: "The historical bank did not oppose the guarantee. The Irish state later paid the cost of the Irish banks.",
    focus: "IE",
    options: [
      { label: "Accept the guarantee", text: "Irish depositors stop taking their money out. The Irish state will pay for the banks' losses.", tags: ["neutral"], lean: 0.2,
        apply: function (G) { G.flags.irishGuarantee = true; } },
      { label: "Call for a European fund for failing banks", text: "The bank argues that losses of banks this size need a common fund. Raises support for stability fund rescues of banks.", tags: ["intended"], lean: -0.6, novelty: 0.4, attr: { fiscal: 0.4 },
        apply: function (G) { G.proposals.directRecap.support += 12; G.flags.irishGuarantee = true; } },
      { label: "Warn that creditors should share losses", text: "The bank says the bondholders of failed banks should take losses before taxpayers.", tags: ["neutral"], lean: 0.8, attr: { restructure: 1.4, discipline: 0.8 },
        apply: function (G) { G.c.IE.rescue = -3; G.c.IE.bankBonus = -8; } }
    ]
  });
  S.card("collateral-2008", {
    title: "Collateral after Lehman", actor: "Governing Council", date: "October 2008",
    text: "Banks do not have enough of the assets the bank accepts for its loans. Lowering the minimum rating from A- to BBB- would let them pledge more assets.",
    history: "In October 2008 the historical bank lowered the minimum rating to BBB- for most assets.",
    options: [
      { label: "Broaden the collateral rules", text: "A minimum rating of BBB- and a longer list of assets.", tags: ["intended"], lean: -0.6, novelty: 0.3, vote: true, onFail: 1,
        apply: function (G) { G.pol.collateral = "broad"; } },
      { label: "Keep the rules", text: "No change.", tags: ["neutral"], lean: 0.6, apply: function () {} }
    ]
  });

  /* ---------- 2009 ---------- */
  S.script(2009, ["cbpp", "greek-revision"]);
  S.news(2009, "Slovakia adopts the euro on 1 January 2009. The euro area has 16 members.");
  S.card("cbpp", {
    title: "Covered bonds", actor: "Governing Council", date: "May 2009",
    text: "Investors have stopped buying covered bonds, which banks sell with home loans as security. The bank could buy €60 billion of them.",
    history: "The historical bank bought €60 billion of covered bonds from July 2009 to June 2010.",
    options: [
      { label: "Buy covered bonds", text: "Banks can again raise money for home loans.", tags: ["neutral"], lean: -0.6, attr: { purchases: 0.4 }, vote: true, onFail: 1,
        apply: function (G) { G.pol.cbpp = true; } },
      { label: "Do not buy", text: "", tags: ["neutral"], lean: 0.6, apply: function () {} }
    ]
  });
  S.card("greek-revision", {
    title: "Greece revises its deficit", actor: "Government of Greece", date: "21 October 2009",
    text: "The new Greek government reports a deficit for 2009 of 12.5% of GDP, against 3.7% reported in the spring, and revises 2008 from 5.0% to 7.7%. Rating agencies start to downgrade Greece. The bank is asked how the euro area should respond.",
    history: "The historical bank urged rapid cuts. Greek spreads rose through 2010 (Commission report on Greek government deficit and debt statistics, January 2010).",
    focus: "GR",
    options: [
      { label: "Urge rapid cuts", text: "The bank calls for a credible plan to cut the deficit at once.", tags: ["neutral"], lean: 1.2, attr: { discipline: 1.4 },
        apply: function (G) { G.c.GR.forcedCut = 0; G.flags.urgedCuts = true; } },
      { label: "Call for a common European response", text: "The bank says the problem of one member is a problem for the currency, and asks governments to prepare a common instrument now.", tags: ["intended"], lean: -0.8, novelty: 0.5, help: 0.8, attr: { fiscal: 0.6 },
        apply: function (G) { G.proposals.modest.support += 8; G.proposals.eurobonds.support += 5; G.proposals.conversion.support += 6; G.bonus.backstop += 0.03; } },
      { label: "Make no public statement", text: "The bank leaves the matter to the Eurogroup.", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });

  /* ---------- 2010 ---------- */
  S.script(2010, ["gr-waiver", "gr-program", "smp", "deauville", "ie-program"]);
  S.card("gr-waiver", {
    title: "Greek bonds near junk", actor: "Governing Council", date: "3 May 2010",
    text: "Greece's ratings are falling toward junk. Under the rules, Greek bonds would stop being accepted as collateral, and Greek banks, which hold many of them, could no longer borrow from the bank.",
    history: "On 3 May 2010 the historical bank suspended the minimum rating for Greek government bonds.",
    focus: "GR", focusCode: "GR",
    options: [
      { label: "Suspend the minimum rating for Greek bonds", text: "The bank keeps accepting Greek bonds whatever their rating.", tags: ["intended"], lean: -0.8, novelty: 0.4, help: 1, vote: true, onFail: 1,
        apply: function (G) { G.pol.waiver.GR = true; } },
      { label: "Apply the rules", text: "Greek banks can borrow much less from the bank.", tags: ["neutral"], lean: 1.2, attr: { discipline: 1.4 },
        apply: function (G) { G.pol.waiver.GR = false; G.c.GR.bankBonus = -15; } }
    ]
  });
  S.card("gr-program", {
    title: "Greece asks for a loan", actor: "Government of Greece, Eurogroup, IMF", date: "May 2010",
    when: function (G) { return spread(G, "GR") > 4.5 && !inProgram(G, "GR"); },
    text: function (G) {
      return "Greek 10-year spreads are rising toward " + spread(G, "GR").toFixed(1) + " points. Euro area governments and the IMF prepare loans of €110 billion: €80 billion from the governments, €30 billion from the IMF. In return, a memorandum lists spending cuts, tax rises, sales of public assets and changes to labor law.";
    },
    history: "The historical bank joined the Commission and the IMF in the Troika and helped set and check the conditions.",
    focus: "GR", focusCode: "GR",
    options: function () { return S.programOptions("GR"); }
  });
  S.card("smp", {
    title: "Investors stop buying bonds", actor: "Governing Council", date: "10 May 2010",
    text: "Spreads of Greece, Ireland and Portugal are rising together. The bank could buy their bonds from investors and take the same amount of money back from banks.",
    history: "On 10 May 2010 the historical bank launched the Securities Markets Programme (SMP). Axel Weber of the Bundesbank and Jürgen Stark of the Executive Board later resigned, in 2011, partly over these purchases.",
    options: [
      { label: "Launch the Securities Markets Programme", text: "A Draghi measure in this game's terms: bond purchases to lower spreads.", tags: ["draghi"], draghi: "SMP", lean: -1.0, novelty: 1.2, help: 1, attr: { purchases: 1 }, vote: true, onFail: 2,
        apply: function (G) { G.pol.smp = true; } },
      { label: "Buy EIB bonds for approved projects", text: "The bank buys European Investment Bank bonds that pay for approved projects, up to a limit set by the EIB program. Investment in the periphery grows, and the bank buys no government bonds.", tags: ["intended"], lean: -0.6, novelty: 0.6, help: 0.6, attr: { fiscal: 0.6, green: 0.3 }, vote: true, onFail: 2,
        apply: function (G) { G.pol.eib = Math.max(G.pol.eib, 1); G.proposals.eibPlan.support += 6; } },
      { label: "No purchases", text: "Spreads are left to markets and governments.", tags: ["neutral"], lean: 1.0, attr: { discipline: 1 }, apply: function () {} }
    ]
  });
  S.card("deauville", {
    title: "Losses for private creditors", actor: "Governments of Germany and France", date: "18 October 2010",
    text: "Meeting in Deauville, the German and French leaders agree that private creditors should take losses in future rescues. Spreads rise across the periphery. The bank is asked for its view.",
    history: "The historical bank opposed losses for private creditors in 2010.",
    options: [
      { label: "Oppose creditor losses", text: "The bank warns that talk of losses will make investors sell the bonds of every weak state.", tags: ["neutral"], lean: 0.6, apply: function () {} },
      { label: "Support rules for debt restructuring", text: "A clear procedure for lowering a state's debt, decided in advance.", tags: ["neutral"], lean: 0.4, novelty: 0.4, attr: { restructure: 1.6, discipline: 0.6 },
        apply: function (G) { G.contagion = (G.contagion || 0) + 0.6; G.flags.restructureRules = true; } },
      { label: "Answer with a common instrument", text: "The bank says losses can be avoided if governments guarantee each other's debt.", tags: ["intended"], lean: -0.8, novelty: 0.6, attr: { fiscal: 0.8 },
        apply: function (G) { G.proposals.eurobonds.support += 6; G.proposals.modest.support += 6; } }
    ]
  });
  S.card("ie-program", {
    title: "Ireland's banks", actor: "Government of Ireland, Governing Council", date: "November 2010",
    when: function (G) { return member(G, "IE") && !inProgram(G, "IE") && (spread(G, "IE") > 3 || M.expectedBank(G, "IE") < 50); },
    text: function (G) {
      return "Irish banks depend on emergency liquidity from the Central Bank of Ireland. Irish spreads are rising toward " + spread(G, "IE").toFixed(1) + " points. Governments prepare €85 billion of loans, including €17.5 billion of Ireland's own funds. The bank must decide whether its emergency liquidity depends on Ireland accepting a program.";
    },
    history: "In November 2010 the historical bank wrote to the Irish finance minister that continued emergency liquidity required a program.",
    focus: "IE", focusCode: "IE",
    options: function () {
      return [
        { label: "Lend only if Ireland accepts a program", text: "As the historical bank did. Ireland enters a program with the bank in the Troika.", tags: ["troika"], troikaCode: "IE", lean: 1.2, attr: { troika: 1, discipline: 1 },
          apply: function (G) { S.startProgram(G, "IE", "full"); } },
        { label: "Keep lending without political conditions", text: "Emergency liquidity continues for sound banks. Governments decide on a loan without the bank in the Troika. Two thirds of the Governing Council would have to object to stop it.", tags: ["intended"], lean: -1, novelty: 0.4, help: 1, vote: true, rule: "twothirds", onFail: 0,
          apply: function (G) { G.pol.ela.IE = "open"; G.pol.elaOpen = true; S.startProgram(G, "IE", "refuse", 0.6); } },
        { label: "Take an advisory role in the program", text: "Ireland enters a program; the bank publishes its opinion.", tags: ["neutral"], lean: 0.3, attr: { troika: 0.3 },
          apply: function (G) { S.startProgram(G, "IE", "advisory"); } }
      ];
    }
  });

  /* ---------- 2011 ---------- */
  S.script(2011, ["pt-program", "letters", "gr-referendum", "ltro3y"]);
  S.news(2011, "Estonia adopts the euro on 1 January 2011.");
  S.card("pt-program", {
    title: "Portugal asks for a loan", actor: "Government of Portugal, Eurogroup, IMF", date: "May 2011",
    when: function (G) { return !inProgram(G, "PT") && spread(G, "PT") > 4; },
    text: function (G) { return "Portuguese spreads are rising toward " + spread(G, "PT").toFixed(1) + " points. Governments and the IMF prepare €78 billion of loans with a memorandum of conditions."; },
    history: "The historical bank sat in the Troika for the Portuguese program, May 2011 to May 2014.",
    focus: "PT", focusCode: "PT",
    options: function () { return S.programOptions("PT"); }
  });
  S.card("letters", {
    title: "Italy and Spain", actor: "Governing Council", date: "August 2011",
    when: function (G) { return spread(G, "IT") > 2.5 || spread(G, "ES") > 2.5; },
    text: function (G) { return "Italian and Spanish spreads are rising: about " + spread(G, "IT").toFixed(1) + " and " + spread(G, "ES").toFixed(1) + " points. Together the two make up a quarter of the euro area economy."; },
    history: "On 5 August 2011 the historical bank sent letters to the Italian and Spanish governments listing reforms, and extended the SMP to their bonds two days later.",
    focus: "IT",
    options: [
      { label: "Letters with conditions, then purchases", text: "Private letters list reforms; the SMP buys their bonds.", tags: ["draghi", "troika"], draghi: "SMP", troikaCode: "IT", lean: 0.2, novelty: 1, help: 0.6, attr: { purchases: 1, troika: 0.8, discipline: 0.8 }, vote: true, onFail: 3,
        apply: function (G) { G.pol.smp = true; } },
      { label: "Purchases without letters", text: "The SMP buys their bonds, with no conditions.", tags: ["draghi"], draghi: "SMP", lean: -1, novelty: 1.2, help: 1, attr: { purchases: 1 }, vote: true, onFail: 3,
        apply: function (G) { G.pol.smp = true; } },
      { label: "Pressure governments for common borrowing", text: "The president asks governments for the Modest Proposal and eurobonds, and raises EIB purchases.", tags: ["intended"], lean: -0.7, novelty: 0.5, help: 0.6, attr: { fiscal: 0.8 },
        apply: function (G) { G.proposals.modest.support += 10; G.proposals.eurobonds.support += 6; G.pol.eib = Math.max(G.pol.eib, 2); } },
      { label: "No action", text: "", tags: ["neutral"], lean: 0.8, attr: { discipline: 1 }, apply: function () {} }
    ]
  });
  S.card("gr-referendum", {
    title: "A Greek referendum", actor: "Government of Greece", date: "31 October 2011",
    when: function (G) { return member(G, "GR") && inProgram(G, "GR"); },
    text: "The Greek prime minister announces a referendum on the new loan agreement. Other governments warn that a no vote would mean leaving the euro. The bank is asked to comment.",
    history: "The referendum was withdrawn within days, and a new prime minister took office on 11 November 2011.",
    focus: "GR",
    options: [
      { label: "Say the vote belongs to Greek citizens", text: "The bank keeps lending to Greek banks on the same terms during the campaign.", tags: ["neutral"], lean: -0.4, attr: { democratic: 1.6 },
        apply: function (G) { G.bonus.trust += 1; G.flags.grReferendum2011 = true; } },
      { label: "Warn that a no vote means leaving", text: "The bank takes the side of the lending governments.", tags: ["neutral"], lean: 1.0, attr: { troika: 0.8, democratic: -1 },
        apply: function () {} },
      { label: "No comment", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("ltro3y", {
    title: "Banks need long loans", actor: "Governing Council", date: "December 2011",
    text: "Banks must repay large debts in 2012, and investors will not buy their new bonds. They are cutting lending.",
    history: "In December 2011 and February 2012 the historical bank lent about €1 trillion for three years, before banks repaid older loans.",
    options: [
      { label: "Three-year loans", text: "A Draghi measure in this game's terms.", tags: ["draghi"], draghi: "3-year LTRO", lean: -1, novelty: 0.8, help: 0.8, vote: true, onFail: 2,
        apply: function (G) { G.pol.ltro3y = true; } },
      { label: "Broader collateral and 1-year loans", text: "The bank accepts more kinds of assets, and lends for up to a year.", tags: ["intended"], lean: -0.6, novelty: 0.3, help: 0.6, vote: true, onFail: 2,
        apply: function (G) { G.pol.collateral = "broad"; G.pol.ltro1y = true; } },
      { label: "No new operations", text: "", tags: ["neutral"], lean: 0.8, apply: function () {} }
    ]
  });

  /* ---------- 2012 ---------- */
  S.script(2012, ["gr-psi", "es-banks", "wit", "fiscal-compact"]);
  S.news(2012, "The European Stability Mechanism enters into force on 27 September 2012.", function (G) { G.esm = true; });
  S.card("gr-psi", {
    title: "Greek debt restructuring", actor: "Eurogroup, Government of Greece", date: "March 2012",
    when: function (G) { return member(G, "GR") && (inProgram(G, "GR") || G.c.GR.v && G.c.GR.v.d > 150); },
    text: "Private holders of Greek bonds are asked to take a 53.5% loss on the amount owed, with a second program of up to €130 billion. The bank holds Greek bonds bought earlier; it can exempt them or share the loss.",
    history: "The historical bank exchanged its Greek bonds for new ones exempt from the loss.",
    focus: "GR",
    options: [
      { label: "Exempt the bank's holdings", text: "As in history. The second program continues with the bank in the Troika.", tags: ["troika"], troikaCode: "GR", lean: 0.8, attr: { troika: 1, discipline: 0.6 },
        apply: function (G) { if (G.programs.GR) { G.programs.GR.role = "full"; G.programs.GR.end = Math.max(G.programs.GR.end, 2018); } } },
      { label: "Share the loss on the bank's holdings", text: "Greece's debt falls further; the bank records a loss.", tags: ["neutral"], lean: -0.6, novelty: 1.4, help: 1, attr: { restructure: 1.6 }, vote: true, onFail: 0,
        apply: function (G) { G.c.GR.rescue = -6; G.bonus.trust -= 0.5; } },
      { label: "Propose converting Greece's loans", text: "Long loans at low fixed rates, with payments that rise and fall with growth; the second program becomes smaller.", tags: ["intended"], lean: -0.8, novelty: 0.6, help: 1, attr: { fiscal: 0.8, troika: -0.6 },
        apply: function (G) { G.proposals.conversion.support += 14; if (G.programs.GR) { G.programs.GR.terms *= 0.85; } } }
    ]
  });
  S.card("es-banks", {
    crisis: true,
    title: "Spain's savings banks", actor: "Government of Spain, Eurogroup", date: "June 2012",
    when: function (G) { return M.expectedBank(G, "ES") < 55 || spread(G, "ES") > 3.5; },
    text: "Spanish savings banks need capital after house prices fell. Governments offer up to €100 billion for the banks, with conditions on the banking sector.",
    history: "The historical bank took part in the review of the Spanish bank program, 2012 to 2014.",
    focus: "ES", focusCode: "ES",
    options: [
      { label: "Review the bank program with the Commission", text: "A Troika role for the banking sector only.", tags: ["troika"], troikaCode: "ES", lean: 0.6, attr: { troika: 0.8 },
        apply: function () {} },
      { label: "Ask the stability fund to rescue the banks", text: "The stability fund should put capital into the banks directly, so Spain's debt does not rise.", tags: ["intended"], lean: -0.6, novelty: 0.6, help: 0.8, attr: { fiscal: 0.6 },
        apply: function (G) { G.proposals.directRecap.support += 15; G.c.ES.bankBonus = 6; G.c.ES.rescue = 2; } },
      { label: "Leave it to Spain", text: "Spain borrows to put capital into its banks.", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.8 },
        apply: function (G) { G.c.ES.rescue = 4; } }
    ]
  });
  S.card("wit", {
    title: "Investors fear the end of the euro", actor: "Governing Council", date: "July 2012",
    when: function (G) { return spread(G, "ES") > 3 || spread(G, "IT") > 3 || spread(G, "GR") > 8; },
    text: function (G) { return "Spanish spreads are rising toward " + spread(G, "ES").toFixed(1) + " points and Italian toward " + spread(G, "IT").toFixed(1) + ". Investors charge more interest because they expect the euro may break up."; },
    history: "On 26 July 2012 Mario Draghi said the bank would do \"whatever it takes\" to preserve the euro. In September the bank announced Outright Monetary Transactions (OMT). Spreads fell without a single purchase.",
    options: [
      { label: "\"Whatever it takes\" and OMT", text: "A promise to buy, without limit, the short-term bonds of any state in an ESM program.", tags: ["draghi"], draghi: "OMT", lean: -1.2, novelty: 1.6, help: 1, attr: { purchases: 1, troika: 0.6 }, vote: true, onFail: 2,
        apply: function (G) { G.pol.omt = true; } },
      { label: "Ask governments for a common backstop", text: "The president goes to the European Council and asks for eurobonds or the Modest Proposal now.", tags: ["intended"], lean: -0.8, novelty: 0.5, help: 0.8, attr: { fiscal: 1, democratic: 0.4 },
        apply: function (G) { G.proposals.eurobonds.support += 10; G.proposals.modest.support += 12; G.proposals.depositInsurance.support += 6; } },
      { label: "No new instrument", text: "The bank relies on what it already has.", tags: ["neutral"], lean: 1.0, attr: { discipline: 1 }, apply: function () {} }
    ]
  });
  S.card("fiscal-compact", {
    title: "The Fiscal Compact", actor: "Governments of the EU", date: "2 March 2012",
    text: "Twenty-five governments sign a treaty requiring balanced budgets in national law, with an automatic correction when deficits exceed the limit. The bank is asked for its opinion.",
    history: "The historical bank supported the Fiscal Compact.",
    options: [
      { label: "Support the treaty", text: "The fiscal rules become stricter.", tags: ["neutral"], lean: 1, attr: { discipline: 1.4 },
        apply: function () {} },
      { label: "Ask for an investment rule", text: "Public investment would be excluded from the deficit limit.", tags: ["neutral"], lean: -0.6, attr: { fiscal: 1, green: 0.4 },
        apply: function (G) { G.proposals.eibPlan.support += 8; Object.keys(G.c).forEach(function (k) { G.c[k].forcedCut = -0.15; }); } },
      { label: "Warn against cuts in a recession", text: "The bank says automatic cuts in a recession make it worse.", tags: ["neutral"], lean: -1, attr: { fiscal: 1.4 },
        apply: function (G) { G.council.forEach(function (m) { if (m.h > 0.4) { m.rel -= 6; } }); G.bonus.far -= 0.5; } }
    ]
  });

  /* ---------- 2013 ---------- */
  S.script(2013, ["cy", "troika-review", "guidance"]);
  S.card("cy", {
    crisis: true,
    title: "Cyprus's banks", actor: "Governing Council, Eurogroup", date: "March 2013",
    when: function (G) { return member(G, "CY") && M.expectedBank(G, "CY") < 50; },
    text: "Cyprus's two largest banks lost large sums on Greek bonds. The Eurogroup offers €10 billion if large depositors take losses. The bank must decide whether emergency liquidity continues without a program.",
    history: "On 21 March 2013 the historical bank said emergency liquidity would end after 25 March unless a program was in place. Large depositors in the Bank of Cyprus lost much of their deposits above €100,000.",
    focus: "CY", focusCode: "CY",
    options: [
      { label: "Set a deadline for emergency liquidity", text: "As in history. Cyprus accepts a program with the bank in the Troika.", tags: ["troika"], troikaCode: "CY", lean: 1.2, attr: { troika: 1, discipline: 1, restructure: 0.8 },
        apply: function (G) { G.pol.ela.CY = "capped"; S.startProgram(G, "CY", "full"); } },
      { label: "Keep lending and ask the stability fund to rescue the banks", text: "Insured deposits stay safe; the stability fund is asked to put capital into the banks. Two thirds of the Council would have to object to stop it.", tags: ["intended"], lean: -0.8, novelty: 0.6, help: 1, vote: true, rule: "twothirds", onFail: 0,
        apply: function (G) { G.pol.ela.CY = "open"; G.proposals.directRecap.support += 10; S.startProgram(G, "CY", "refuse", 0.6); } }
    ]
  });
  S.card("troika-review", {
    title: "A Troika review", actor: "Commission, IMF", date: "2013",
    when: function (G) { return Object.keys(G.programs).some(function (k) { var p = G.programs[k]; return p.active && p.role === "full"; }); },
    text: "The quarterly review finds missed targets for public sector job cuts. In Greece the government closes the public broadcaster ERT in June to cut costs. The next payment depends on the review.",
    history: "The historical Troika insisted on its targets.",
    options: [
      { label: "Insist on the targets", text: "Payments continue once the targets are met.", tags: ["troika"], lean: 1, attr: { troika: 1, discipline: 1 }, apply: function () {} },
      { label: "Ask for milder terms", text: "The bank argues the targets are making the recession worse.", tags: ["neutral"], lean: -0.6, attr: { fiscal: 0.8 },
        apply: function (G) { Object.keys(G.programs).forEach(function (k) { G.programs[k].terms *= 0.85; }); } },
      { label: "Leave the Troika and only advise", text: "The bank stops negotiating conditions.", tags: ["neutral"], lean: -0.8, attr: { troika: -1, democratic: 0.6 },
        apply: function (G) { Object.keys(G.programs).forEach(function (k) { if (G.programs[k].role === "full") { G.programs[k].role = "advisory"; } }); } }
    ]
  });
  S.card("guidance", {
    title: "Forward guidance", actor: "Governing Council", date: "July 2013",
    text: "The bank could say it expects rates to stay at present or lower levels for a long time.",
    history: "The historical bank gave this guidance on 4 July 2013.",
    options: [
      { label: "Announce low rates for a long time", text: "", tags: ["neutral"], lean: -0.5, vote: true, onFail: 1, apply: function (G) { G.pol.guidance = true; } },
      { label: "Make no announcement", text: "", tags: ["neutral"], lean: 0.5, apply: function () {} }
    ]
  });

  /* ---------- 2014 ---------- */
  S.script(2014, ["neg", "ssm"]);
  S.news(2014, "Latvia adopts the euro on 1 January 2014.");
  S.card("neg", {
    title: "Inflation falls toward zero", actor: "Governing Council", date: "June 2014",
    text: function (G) { return "Inflation was " + pct(G.ea.v.p) + " last year and is falling. The main rate is " + G.pol.rate.toFixed(2) + "%."; },
    history: "In June 2014 the historical bank took the deposit rate below zero and announced targeted long-term loans (TLTROs).",
    options: [
      { label: "Negative deposit rate and TLTROs", text: "Two Draghi measures in this game's terms.", tags: ["draghi"], draghi: "Negative rates", lean: -1.4, novelty: 1.2, vote: true, onFail: 3,
        apply: function (G) { G.pol.neg = true; G.pol.tltro = true; G.used.draghi.TLTRO = G.used.draghi.TLTRO || G.year; } },
      { label: "TLTROs only", text: "Cheap long loans to banks that lend to firms and households.", tags: ["draghi"], draghi: "TLTRO", lean: -0.8, novelty: 0.8, vote: true, onFail: 3,
        apply: function (G) { G.pol.tltro = true; } },
      { label: "Larger EIB purchases", text: "Raise purchases of EIB bonds for approved projects to the cap of the EIB program.", tags: ["intended"], lean: -0.6, novelty: 0.4, attr: { fiscal: 0.8, green: 0.5 }, vote: true, onFail: 3,
        apply: function (G) { G.pol.eib = Math.min(3, (G.pol.eib || 0) + 1); } },
      { label: "Make no change for now", text: "", tags: ["neutral"], lean: 0.8, apply: function () {} }
    ]
  });
  S.card("ssm", {
    title: "Banking supervision begins", actor: "Supervisory Board", date: "4 November 2014",
    text: "The bank becomes the supervisor of the largest banks in the euro area. Its first stress test shows how strict it will be.",
    history: "The historical bank's 2014 test found that 25 banks lacked €25 billion of capital in all.",
    options: [
      { label: "A strict test", text: "Weak banks must raise capital at once.", tags: ["neutral"], lean: 1, attr: { discipline: 1.2 },
        apply: function () {} },
      { label: "A gradual test", text: "Weak banks get time; more of them stay weak.", tags: ["neutral"], lean: -0.4, apply: function (G) { Object.keys(G.c).forEach(function (k) { G.c[k].bankBonus = -3; G.c[k].shock = 0.1; }); } },
      { label: "Add climate risk to the test", text: "Banks report their loans to coal, oil and gas firms and their mortgages in flood zones.", tags: ["neutral"], lean: 0, attr: { green: 1.4 },
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 1; } }
    ]
  });

  /* ---------- 2015 ---------- */
  S.script(2015, ["qe", "gr-waiver-2015", "gr-ela-2015", "gr-third", "speech-leak"]);
  S.news(2015, "Lithuania adopts the euro on 1 January 2015. With 19 governors, voting in the Governing Council now rotates.");
  S.card("qe", {
    title: "Quantitative easing", actor: "Governing Council", date: "22 January 2015",
    text: function (G) { return "Inflation was " + pct(G.ea.v.p) + " last year. Purchases of government bonds, shared among the states by their capital key, could raise inflation toward 2%."; },
    history: "On 22 January 2015 the historical bank announced purchases of €60 billion a month, including government bonds (PSPP), from March 2015.",
    options: [
      { label: "Begin quantitative easing", text: "A Draghi measure in this game's terms.", tags: ["draghi"], draghi: "QE", lean: -1.4, novelty: 1.2, attr: { purchases: 1 }, vote: true, onFail: 2,
        apply: function (G) { G.pol.qe = true; } },
      { label: "Raise EIB purchases to the cap", text: "", tags: ["intended"], lean: -0.6, novelty: 0.4, attr: { fiscal: 0.6, green: 0.4 }, vote: true, onFail: 2,
        apply: function (G) { G.pol.eib = 3; } },
      { label: "No purchases", text: "", tags: ["neutral"], lean: 1, apply: function () {} }
    ]
  });
  S.card("gr-waiver-2015", {
    title: "A new Greek government", actor: "Governing Council", date: "4 February 2015",
    when: function (G) { return member(G, "GR"); },
    text: "A government elected against the memoranda takes office in Greece. Greek bonds are accepted as collateral only under the waiver.",
    history: "On 4 February 2015 the historical bank lifted the waiver for Greek bonds.",
    focus: "GR",
    options: [
      { label: "Lift the waiver", text: "As in history. Greek banks must borrow through emergency liquidity.", tags: ["neutral"], lean: 1.2, attr: { discipline: 1, troika: 0.6 }, vote: true, onFail: 1,
        apply: function (G) { G.pol.waiver.GR = false; } },
      { label: "Keep the waiver", text: "The bank keeps accepting Greek bonds during the talks.", tags: ["intended"], lean: -0.8, help: 1, attr: { democratic: 0.6 },
        apply: function (G) { G.pol.waiver.GR = true; } }
    ]
  });
  S.card("gr-ela-2015", {
    title: "Greek banks in June 2015", actor: "Governing Council", date: "28 June 2015",
    when: function (G) { return member(G, "GR") && M.expectedBank(G, "GR") < 50; },
    text: "Talks with the lenders ended without agreement, and the Greek government called a referendum for 5 July. Savers are taking their deposits out of Greek banks. Their emergency liquidity is near its cap.",
    history: "On 28 June 2015 the historical bank froze the cap. Greek banks closed for three weeks, with capital controls. On 5 July 61% voted no; a third program followed in August.",
    focus: "GR",
    options: [
      { label: "Keep the cap where it is", text: "As in history.", tags: ["neutral"], lean: 1.2, attr: { discipline: 1, troika: 0.6 },
        apply: function (G) { G.pol.ela.GR = "capped"; } },
      { label: "Raise the cap without conditions", text: "Emergency liquidity continues for the sound banks until the referendum. Two thirds of the Council could object.", tags: ["intended"], lean: -1, novelty: 0.4, help: 1, attr: { democratic: 1 }, vote: true, rule: "twothirds", onFail: 0,
        apply: function (G) { G.pol.ela.GR = "open"; G.pol.elaOpen = true; } },
      { label: "Cut emergency liquidity", text: "Greek banks would fail.", tags: ["neutral"], lean: 2, attr: { discipline: 1.6 }, vote: true, rule: "restrict", onFail: 0,
        apply: function (G) { G.pol.ela.GR = "frozen"; } }
    ]
  });
  S.card("gr-third", {
    title: "A third Greek program", actor: "Eurogroup, ESM", date: "August 2015",
    when: function (G) { return member(G, "GR") && (inProgram(G, "GR") || spread(G, "GR") > 6); },
    text: "Governments offer up to €86 billion from the ESM, with new conditions.",
    history: "The historical bank took part in the third program, August 2015 to August 2018.",
    focus: "GR",
    options: function () {
      return S.programOptions("GR").map(function (o) {
        var a = o.apply;
        o.apply = function (G, r) { a(G, r); G.programs.GR.end = Math.max(G.programs.GR.end, 2018); };
        return o;
      });
    }
  });
  S.card("speech-leak", {
    title: "A speech before publication", actor: "Executive Board", date: "May 2015",
    text: "A member of the Executive Board is to speak at a private event for investors the evening before the text is published. The speech announces faster purchases.",
    history: "In May 2015 a speech by a historical Executive Board member reached investors hours before its publication. The bank changed its rules on speeches afterward.",
    options: [
      { label: "Publish the speech at once", text: "Everyone hears it at the same time.", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function () {} },
      { label: "Allow the event", text: "Risky: a few investors hear news that moves prices before everyone else.", tags: ["neutral"], lean: 0, apply: function (G) { G.ethics += 0.35; S.game.followUp(G, "ombudsman", 1); } }
    ]
  });
  S.card("ombudsman", {
    title: "The Ombudsman asks questions", actor: "European Ombudsman",
    text: function (G, a) { return "The European Ombudsman opens an inquiry into the speech given to investors in " + a.from + ", before its publication."; },
    options: [
      { label: "Answer in full and change the rules", text: "Speeches are published before any private event.", tags: ["neutral"], lean: 0, attr: { democratic: 1 },
        apply: function (G) { G.ethics = Math.max(0, G.ethics - 0.25); G.bonus.trust += 0.4; } },
      { label: "Answer in writing only", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.3; } }
    ]
  });

  /* ---------- 2016 to 2019 ---------- */
  S.script(2016, ["brexit", "it-banks"]);
  S.card("brexit", {
    title: "The United Kingdom votes to leave", actor: "Markets", date: "24 June 2016",
    text: "The United Kingdom votes to leave the EU. The pound falls and bank shares fall across Europe.",
    history: "The historical bank said it was ready to lend to banks as needed.",
    options: [
      { label: "Offer loans to banks, including in pounds", text: "Swap lines with the Bank of England let the bank lend pounds.", tags: ["neutral"], lean: -0.4, apply: function () {} },
      { label: "No statement", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { Object.keys(G.c).forEach(function (k) { G.c[k].shock = -0.3; }); G.bonus.backstop -= 0.02; } }
    ]
  });
  S.card("it-banks", {
    crisis: true,
    title: "Italian banks", actor: "Supervisory Board, Government of Italy", date: "December 2016",
    when: function (G) { return member(G, "IT"); },
    text: "Monte dei Paschi di Siena, the oldest bank in the world, needs capital. The government proposes a precautionary recapitalization: public capital for a bank that is still sound.",
    history: "The historical bank approved the precautionary recapitalization, completed in 2017.",
    focus: "IT",
    options: [
      { label: "Approve state capital", text: "Households that hold the bank's bonds keep their money.", tags: ["neutral"], lean: -0.2, apply: function () {} },
      { label: "Require a bail-in", text: "Bondholders, many of them households, take losses.", tags: ["neutral"], lean: 1, attr: { restructure: 1.4, discipline: 1 },
        apply: function (G) { G.c.IT.bankBonus = -12; G.c.IT.rescue = -0.3; G.bonus.trust -= 1; G.bonus.far += 0.6; } },
      { label: "Pressure governments for common deposit insurance", text: "", tags: ["intended"], lean: -0.6, attr: { fiscal: 0.4 }, apply: function (G) { G.proposals.depositInsurance.support += 10; G.c.IT.bankBonus = 3; } }
    ]
  });
  S.script(2016, ["note-500"]);
  S.card("note-500", {
    title: "The 500-euro note", actor: "Governing Council", date: "May 2016",
    text: "Police forces and the Commission say the 500-euro note is used mostly to move and hide large sums, by criminals among others. Others answer that cash protects privacy and that savers keep large notes at home.",
    history: "On 4 May 2016 the historical bank decided to stop producing the 500-euro note and to stop issuing it around the end of 2018. Most national central banks stopped on 27 January 2019; the Deutsche Bundesbank and the Oesterreichische Nationalbank issued the last notes on 26 April 2019. The notes remain legal tender and can be exchanged without a time limit.",
    options: [
      { label: "Stop producing and issuing the note", text: "Notes already issued stay legal tender.", tags: ["neutral"], lean: 0.2, attr: { public: 0.4 },
        apply: function (G) { G.flags.note500 = "ended"; } },
      { label: "Keep the note", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.flags.note500 = "kept"; G.bonus.trust -= 0.2; } },
      { label: "Keep the note and ask for an EU limit on cash payments", text: "Payments in cash above a set amount would be unlawful, as the EU later set at 10 000 euro.", tags: ["neutral"], lean: 0, attr: { democratic: 0.4 },
        apply: function (G) { G.flags.note500 = "kept"; G.bonus.trust += 0.1; } }
    ]
  });
  S.news(2019, "From 27 April 2019 no central bank in the euro area issues the 500-euro note. The notes already issued remain legal tender.", null, function (G) { return G.flags.note500 === "ended"; });
  S.script(2017, ["taper"]);
  S.card("taper", {
    title: "Purchases and recovery", actor: "Governing Council", date: "October 2017",
    when: function (G) { return G.pol.qe || G.pol.smp; },
    text: function (G) { return "Growth was " + pct(G.ea.v.g) + " last year and inflation " + pct(G.ea.v.p) + ". The bank's purchase programs are still running."; },
    history: "The historical bank halved its purchases in 2018 and stopped net purchases, purchases beyond replacing repaid bonds, in December 2018.",
    options: [
      { label: "End purchases by the end of next year", text: "Purchases halve next year and stop in December.", tags: ["neutral"], lean: 1, vote: true, onFail: 1, apply: function (G) { G.flags.qeEnds = G.year + 1; G.pol.smp = false; } },
      { label: "End purchases now", text: "", tags: ["neutral"], lean: 1.4, vote: true, onFail: 2, apply: function (G) { G.pol.qe = false; G.pol.smp = false; } },
      { label: "Continue the purchases", text: "", tags: ["neutral"], lean: -0.8, apply: function () {} }
    ]
  });
  S.script(2018, ["it-budget"]);
  S.news(2018, "Greece completes its third program in August 2018.", null, function (G) { return G.programs.GR && G.programs.GR.active; });
  S.card("it-budget", {
    title: "An Italian budget dispute", actor: "Government of Italy, Commission", date: "October 2018",
    when: function (G) { return member(G, "IT"); },
    text: "The Commission rejects Italy's draft budget for the first time. Italian spreads rise.",
    history: "The historical bank said its role was not to finance deficits.",
    focus: "IT",
    options: [
      { label: "Say the bank does not finance deficits", text: "", tags: ["neutral"], lean: 1, attr: { discipline: 1 }, apply: function (G) { G.contagion = (G.contagion || 0) + 0.3; } },
      { label: "Stay out of the dispute", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function () {} }
    ]
  });
  S.script(2019, ["restart"]);
  S.card("restart", {
    title: "A slowing economy", actor: "Governing Council", date: "September 2019",
    text: function (G) { return "Inflation was " + pct(G.ea.v.p) + " last year and growth is slowing."; },
    history: "In September 2019 the historical bank restarted net purchases and cut the deposit rate to -0.50%.",
    options: [
      { label: "Restart purchases", text: "", tags: ["draghi"], draghi: "QE", lean: -1.2, novelty: 0.6, attr: { purchases: 1 }, vote: true, onFail: 2, apply: function (G) { G.pol.qe = true; } },
      { label: "Raise EIB purchases", text: "", tags: ["intended"], lean: -0.6, attr: { fiscal: 0.6, green: 0.6 }, vote: true, onFail: 2, apply: function (G) { G.pol.eib = Math.min(3, G.pol.eib + 1); } },
      { label: "No change", text: "", tags: ["neutral"], lean: 0.8, apply: function () {} }
    ]
  });

  /* ---------- 2020 to 2025 ---------- */
  S.script(2020, ["pandemic", "ngeu"]);
  S.news(2020, "The coronavirus pandemic closes much of the economy from March 2020.", function (G) {
    Object.keys(G.c).forEach(function (k) { G.c[k].shock = 0; });
  });
  S.news(2020, "On 5 May 2020 the German Federal Constitutional Court rules that the bank's 2015 purchases were not shown to be proportionate (2 BvR 859/15).", null, function (G) { return G.used.draghi.QE != null; });
  S.card("pandemic", {
    crisis: true,
    title: "The pandemic", actor: "Governing Council", date: "March 2020",
    text: "Lockdowns close much of the economy. Spreads rise fast, and governments borrow large sums to pay wages and keep firms in business.",
    history: "In March 2020 the historical bank launched the Pandemic Emergency Purchase Programme (PEPP), €750 billion, later €1.85 trillion.",
    options: [
      { label: "Pandemic purchases (PEPP)", text: "A Draghi measure in this game's terms.", tags: ["draghi"], draghi: "PEPP", lean: -1.4, novelty: 1, attr: { purchases: 1 }, vote: true, onFail: 1,
        apply: function (G) { G.pol.pepp = true; } },
      { label: "Broad collateral and cheap long loans to banks", text: "The bank buys no government bonds.", tags: ["intended"], lean: -0.8, novelty: 0.4, vote: true, onFail: 2,
        apply: function (G) { G.pol.collateral = "broad"; G.pol.ltro1y = true; G.bonus.backstop += 0.04; } },
      { label: "No new measures", text: "", tags: ["neutral"], lean: 1, apply: function (G) { Object.keys(G.c).forEach(function (k) { G.c[k].shock = -0.8; }); } }
    ]
  });
  S.card("ngeu", {
    title: "Joint borrowing for the recovery", actor: "European Council", date: "July 2020",
    text: "Governments agree that the Commission will borrow up to €750 billion for the recovery (NextGenerationEU), the first large joint borrowing. The bank is asked for its view.",
    history: "The historical bank welcomed the agreement.",
    options: [
      { label: "Welcome it and call for a permanent instrument", text: "", tags: ["intended"], lean: -0.6, attr: { fiscal: 1 }, apply: function (G) { G.ngeu = true; G.proposals.eurobonds.support += 12; } },
      { label: "Welcome it as a one-off", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.ngeu = true; } }
    ]
  });
  S.script(2021, ["strategy"]);
  S.card("strategy", {
    title: "The strategy review", actor: "Governing Council", date: "July 2021",
    text: "The bank reviews its strategy for the first time since 2003.",
    history: "In July 2021 the historical bank adopted a symmetric 2% target and a climate action plan.",
    options: [
      { label: "A symmetric 2% target and a climate plan", text: "", tags: ["neutral"], lean: -0.2, attr: { green: 1 }, apply: function (G) { G.flags.symmetric = true; G.flags.green = (G.flags.green || 0) + 1; } },
      { label: "Keep \"below but close to 2%\"", text: "", tags: ["neutral"], lean: 0.8, apply: function () {} },
      { label: "Ask for an employment objective", text: "The bank asks governments to add full employment to its mandate. Starts or advances a treaty campaign.", tags: ["neutral"], lean: -0.8, attr: { democratic: 1, fiscal: 0.6 },
        apply: function (G) { if (!G.treaty.goal) { G.treaty.goal = "dual"; } G.treaty.progress += 20; } }
    ]
  });
  S.script(2022, ["energy", "end-purchases", "tpi"]);
  S.card("end-purchases", {
    title: "Purchases as inflation rises", actor: "Governing Council", date: "June 2022",
    when: function (G) { return G.pol.qe || G.pol.pepp; },
    text: function (G) { return "Inflation was " + pct(G.ea.v.p) + " last year and is rising fast. The bank is still buying bonds and adding money to the economy."; },
    history: "The historical bank ended net purchases under PEPP in March 2022 and under its main program on 1 July 2022.",
    options: [
      { label: "End net purchases", text: "The bank keeps the bonds it holds and stops adding new ones.", tags: ["neutral"], lean: 1, vote: true, onFail: 1,
        apply: function (G) { G.pol.qe = false; G.pol.pepp = false; } },
      { label: "Continue the purchases", text: "", tags: ["neutral"], lean: -1, apply: function (G) { G.bonus.infl += 0.3; } }
    ]
  });
  S.card("energy", {
    crisis: true,
    title: "Energy prices", actor: "Governing Council", date: "Spring 2022",
    text: "After Russia's invasion of Ukraine, gas and electricity prices rise to record levels. Inflation rises across the euro area.",
    history: "Euro area inflation peaked at 10.6% in October 2022 (Eurostat, 17 November 2022).",
    options: [
      { label: "Treat it as a supply shock and wait", text: "Higher interest rates cannot lower gas prices.", tags: ["neutral"], lean: -0.6, attr: { green: 0.4 }, apply: function () {} },
      { label: "Announce rate rises soon", text: "", tags: ["neutral"], lean: 1.2, apply: function (G) { G.bonus.infl -= 0.6; G.bonus.gap -= 0.3; } },
      { label: "Support public spending on energy savings", text: "The bank argues for targeted energy support and EIB investment in grids and insulation.", tags: ["intended"], lean: -0.4, attr: { green: 1.4, fiscal: 0.8 },
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 1; G.proposals.eibPlan.support += 6; G.bonus.infl -= 0.2; } }
    ]
  });
  S.card("tpi", {
    title: "Spreads as rates rise", actor: "Governing Council", date: "July 2022",
    text: "As the bank raises rates, Italian spreads rise.",
    history: "On 21 July 2022 the historical bank announced the Transmission Protection Instrument (TPI).",
    options: [
      { label: "Create the TPI", text: "A Draghi measure in this game's terms.", tags: ["draghi"], draghi: "TPI", lean: -1, novelty: 1.2, attr: { purchases: 1 }, vote: true, onFail: 1,
        apply: function (G) { G.pol.tpi = true; } },
      { label: "Rely on existing tools", text: "", tags: ["neutral"], lean: 0.8, apply: function () {} }
    ]
  });
  S.news(2023, "Croatia adopts the euro on 1 January 2023.");
  S.script(2025, ["digital-euro"]);
  S.card("digital-euro", {
    title: "A digital euro", actor: "Council of the EU, European Parliament", date: "2025",
    text: "Legislators debate a digital euro: central bank money that anyone can hold and use for payments, alongside cash.",
    options: [
      { label: "Pressure legislators for it", text: "Public money for digital payments.", tags: ["neutral"], lean: -0.2, attr: { public: 1.4, democratic: 0.4 }, apply: function (G) { G.flags.digitalEuro = true; } },
      { label: "Delay the digital euro", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.4 }, apply: function () {} }
    ]
  });
})();
