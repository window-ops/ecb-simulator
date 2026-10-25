/* Decision cards after 2025: Selk's history to the Federation (2026 to
   2040), then the post-federative period (2041 to 2070). The events and
   their dates follow Selk's CESEA archive (history/2026-FAR-RIGHT to
   history/2071-HX-HOLDINGS); their size depends on the run. */
(function () {
  var S = window.ECBSIM, M = S.model, log = S.cardKit.log, pct = S.pct;
  function conf(G, n) { if (G.parl) { G.parl.conf = Math.max(0, Math.min(100, G.parl.conf + n)); } }

  /* ---------- 2026 to 2040 ---------- */
  S.news(2026, "Bulgaria adopts the euro on 1 January 2026. The euro area has 21 members.");
  S.script(2026, ["independence"]);
  S.card("independence", {
    title: "Governments question the bank", actor: "Far-right governments", date: "2026",
    text: function (G) {
      return "Far-right parties now lead or support governments in several member states (Selk: 11 of 27 between 2024 and 2031). Some of their ministers call for national control over interest rates and criticize the bank in public. The far-right groups hold " + Math.round(G.ea.v.fr) + "% of the European Parliament.";
    },
    options: [
      { label: "Defend the bank's independence in public", text: "Art. 130 TFEU forbids governments to instruct the bank.", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.4 },
        apply: function (G) { G.bonus.trust += 0.5; G.bonus.far += 0.3; } },
      { label: "Answer in the Parliament", text: "The president holds extra hearings and publishes the reasons for every decision.", tags: ["neutral"], lean: -0.2, attr: { democratic: 1.6 },
        apply: function (G) { G.bonus.trust += 1.5; G.bonus.far -= 0.6; } },
      { label: "Make no statement", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.far += 0.4; } }
    ]
  });
  S.script(2028, ["council-block"]);
  S.card("council-block", {
    title: "A blocked Council", actor: "Council of the EU", date: "2028",
    text: "Several governments block common positions on climate and on the reception of refugees. A common investment plan makes no progress.",
    options: [
      { label: "Raise EIB purchases for climate projects", text: "Investment continues through the EIB, which the bank can support within its rules.", tags: ["intended"], lean: -0.6, novelty: 0.4, attr: { green: 1.4, fiscal: 0.6 }, vote: true, onFail: 1,
        apply: function (G) { G.pol.eib = Math.min(3, G.pol.eib + 1); G.flags.green = (G.flags.green || 0) + 1; } },
      { label: "Stay within monetary policy", text: "", tags: ["neutral"], lean: 0.6, apply: function () {} }
    ]
  });
  /* ---------- An authoritarian government, 2029 ----------
     In 2029, when the far right is strongest in Selk's history, the
     government of one member state jails journalists and takes control of
     its courts and its central bank, and other governments ask the bank to
     force it out of the euro. The state
     is one where the far right governed, or came close to it, by 2025
     (AUTH_STATES), drawn once a run among those still in the euro. No
     treaty lets anyone expel a member from the euro: the bank can go to
     the Court of Justice, ask governments for a lawful way, limit or stop
     lending to the state's banks, or expel it without a legal basis, which
     the Court annuls and which can end the run ("expulsion" in
     js/data/rules.js; the Court's rulings are in js/model/game.js). */
  var AUTH_STATES = [
    ["IT", "Brothers of Italy has led the government since October 2022"],
    ["FI", "the Finns Party has been in the government since June 2023"],
    ["SK", "the Slovak National Party has been in the government since October 2023"],
    ["HR", "the Homeland Movement has been in the government since April 2024"],
    ["NL", "the Party for Freedom was in the government from July 2024 to June 2025"],
    ["AT", "the Freedom Party came first in the election of September 2024"],
    ["FR", "the National Rally has been the largest group in the National Assembly since July 2024"],
    ["PT", "Chega came second in the election of May 2025"]
  ];
  S.AUTH_STATES = AUTH_STATES;
  function nm(k) { return S.COUNTRY[k].name; }
  /* The state of this run, drawn from the run's seed the first time it is asked for */
  function auth(G) {
    if (G.flags.authState === undefined) {
      var list = AUTH_STATES.filter(function (x) { var c = G.c[x[0]]; return c && c.joined !== null && c.joined <= G.year && !c.exited; });
      G.flags.authState = list.length ? list[(Math.abs(G.rng | 0) + G.year) % list.length][0] : null;
    }
    return G.flags.authState;
  }
  S.authState = auth;
  function why(k) { var x = AUTH_STATES.filter(function (y) { return y[0] === k; })[0]; return x ? x[1] : ""; }
  /* Losing one of the three largest economies breaks up the euro (js/model/game.js) */
  function big(k) { return ["DE", "FR", "IT"].indexOf(k) >= 0; }
  S.script(2029, ["authoritarian"]);
  S.card("authoritarian", {
    title: function (G) { return "Force " + nm(auth(G)) + " out of the euro?"; },
    actor: "Governments of twelve member states", date: "2029",
    when: function (G) { return G.mode === "pre" && !!auth(G) && !G.c[auth(G)].exited; },
    focus: function (G) { return auth(G); },
    text: function (G) {
      var k = auth(G);
      return "In the record, " + why(k) + ". Now the far-right government of " + nm(k) + " has jailed journalists, replaced the judges of its constitutional court and dismissed the governor of its central bank, who sits on the Governing Council. " +
        "Twelve governments ask the bank to force " + nm(k) + " out of the euro. No treaty provides a way: a state may leave the EU of its own will, and Article 7 can suspend its votes in the Council of the EU, but no rule expels a member from the euro.";
    },
    options: function (G) {
      var k = auth(G);
      return [
        { label: "Challenge the governor's dismissal at the Court of Justice", text: "The Statute lets the governor and the Governing Council ask the Court to annul a dismissal (Art. 14.2). The ruling comes in two years.",
          tags: ["intended"], lean: 0, attr: { democratic: 1.2 },
          apply: function (G2) { G2.bonus.trust += 0.6; G2.bonus.far += 0.2; S.game.followUp(G2, "auth-ruling", 2, { code: k }); } },
        { label: "Ask governments for a lawful way", text: "The bank asks governments to use Article 7 and to write a suspension from the euro into the treaties. Their answer comes in two years.",
          tags: ["neutral"], lean: 0, attr: { democratic: 1 },
          apply: function (G2) { G2.bonus.trust += 0.3; S.game.followUp(G2, "auth-article7", 2, { code: k }); } },
        { label: "Limit lending to its banks", text: "Cap emergency liquidity for its banks and stop accepting its government's bonds as collateral until its central bank is independent again. Needs two thirds of the Governing Council.",
          tags: ["neutral"], lean: 0.8, novelty: 0.6, against: k, attr: { discipline: 0.8 }, vote: true, rule: "restrict", onFail: 5,
          apply: function (G2) {
            G2.pol.ela[k] = "capped"; G2.pol.waiver[k] = false;
            G2.c[k].exitRisk = Math.min(1, (G2.c[k].exitRisk || 0) + 0.15);
            G2.flags.authSqueeze = "reduce"; S.game.followUp(G2, "auth-squeeze", 1, { code: k });
          } },
        { label: "Stop lending to its banks", text: "No emergency liquidity and no monetary operations for its central bank: its banks can no longer borrow from the Eurosystem. Contested in law; its government will go to the Court. Needs two thirds of the Governing Council.",
          tags: ["neutral"], lean: 1.4, novelty: 1.4, against: k, attr: { discipline: 1.2, troika: 0.6 }, vote: true, rule: "restrict", onFail: 5,
          apply: function (G2) {
            G2.pol.ela[k] = "frozen"; G2.pol.waiver[k] = false;
            G2.c[k].exitRisk = Math.min(1, (G2.c[k].exitRisk || 0) + 0.45); G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) - 20;
            G2.ethics += 0.15; G2.bonus.far += 0.4;
            G2.flags.authSqueeze = "halt"; S.game.followUp(G2, "auth-squeeze", 1, { code: k }); S.game.followUp(G2, "auth-halt-court", 2, { code: k });
          } },
        { label: "Expel it from the euro", text: "No treaty allows it, and the Court of Justice will hear the case next year." + (big(k) ? " " + nm(k) + " is one of the three largest economies of the euro area: its departure breaks up the euro." : "") + " Needs two thirds of the Governing Council.",
          tags: ["neutral"], lean: 0.4, novelty: 2, against: k, attr: { democratic: -1.2, discipline: 0.6 }, vote: true, rule: "restrict", onFail: 5,
          apply: function (G2) {
            G2.c[k].exited = G2.year; G2.flags.expelled = { code: k, year: G2.year };
            S.council.sync(G2);
            G2.ethics += 0.3; G2.bonus.trust -= 1.5; G2.bonus.far += 0.6;
            log(G2, nm(k) + " is expelled from the euro by a decision of the Governing Council that no treaty provides for.", "bad");
            S.game.followUp(G2, "auth-expulsion-court", 1, { code: k });
          } },
        { label: "Leave it to governments", text: "The bank says the rule of law is a matter for the Council of the EU and the Commission.", tags: ["neutral"], lean: 0, apply: function (G2) { G2.bonus.far += 0.3; } }
      ];
    }
  });
  S.card("auth-ruling", {
    title: function (G, a) { return "The Court rules on " + nm(a.code) + "'s governor"; }, actor: "Court of Justice", date: function (G) { return String(G.year); },
    focus: function (G, a) { return a.code; },
    text: function (G, a) { return "The Court of Justice annuls the dismissal of " + nm(a.code) + "'s central bank governor, as it annulled Latvia's suspension of its governor in 2019. The governor may return to the Governing Council; the government says it will appoint a second governor of its own."; },
    options: function (G, a) {
      return [
        { label: "Seat the governor the Court reinstated", text: "Only the governor the Court reinstated votes in the Governing Council.", tags: ["intended"], lean: 0, attr: { democratic: 1 },
          apply: function (G2) { G2.bonus.trust += 0.8; G2.bonus.far -= 0.2; } },
        { label: "Ask the Commission to take the government to court", text: "An infringement procedure, if the government defies the ruling.", tags: ["neutral"], lean: 0.2, attr: { democratic: 0.6 },
          apply: function (G2) { G2.bonus.trust += 0.4; G2.bonus.far -= 0.3; } }
      ];
    }
  });
  S.card("auth-article7", {
    title: function (G, a) { return "Governments answer on " + nm(a.code); }, actor: "European Council", date: function (G) { return String(G.year); },
    focus: function (G, a) { return a.code; },
    text: function (G, a) {
      /* Article 7(2) needs every other government: with the far right strong, one of them blocks it */
      return G.ea.v.fr >= 24 ? "Two governments block the finding of a serious breach under Article 7, which needs the votes of every other member state. A clause to suspend a member from the euro has no majority for a treaty change." :
        "The European Council finds a serious and persistent breach of the rule of law in " + nm(a.code) + ", and the Council of the EU suspends its votes. Governments propose a treaty clause that would let them suspend a member from the euro by unanimity of the others.";
    },
    options: function (G, a) {
      return [
        { label: "Support the clause in public", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 },
          apply: function (G2) { G2.bonus.trust += 0.4; if (G2.ea.v.fr < 24) { G2.flags.suspensionClause = G2.year; G2.bonus.far -= 0.3; } else { G2.bonus.far += 0.2; } } },
        { label: "Make no statement on the treaty change", text: "Treaty changes are for governments and voters.", tags: ["neutral"], lean: 0, apply: function () {} }
      ];
    }
  });
  S.card("auth-squeeze", {
    title: function (G, a) { return nm(a.code) + "'s banks lack euros"; }, actor: function (G, a) { return "Government of " + nm(a.code); }, date: function (G) { return String(G.year); },
    focus: function (G, a) { return a.code; },
    when: function (G, a) { return !G.c[a.code].exited; },
    text: function (G, a) {
      var c = G.c[a.code];
      return (G.flags.authSqueeze === "halt" ? "With no loans from the Eurosystem, " : "With emergency liquidity capped, ") + nm(a.code) + "'s banks limit withdrawals, and savers queue at cash machines. Bank stability is " + Math.round((c.v || {}).bank || 0) +
        " of 100. The government offers to reinstate the governor and the judges if the bank removes the limits; its ministers also speak of a national currency.";
    },
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "Remove the limits once the governor and judges return", text: "", tags: ["intended"], lean: -0.2, attr: { democratic: 1 },
          apply: function (G2) { G2.pol.ela[k] = "open"; G2.c[k].exitRisk = Math.max(0, G2.c[k].exitRisk - 0.35); G2.bonus.trust += 0.6; G2.flags.authSqueeze = "lifted"; } },
        { label: "Keep the limits", text: "For another year; emergency liquidity is decided year by year.", tags: ["neutral"], lean: 1, attr: { discipline: 1 },
          apply: function (G2) { G2.pol.ela[k] = G2.flags.authSqueeze === "halt" ? "frozen" : "capped"; G2.c[k].exitRisk = Math.min(1, G2.c[k].exitRisk + 0.15); G2.bonus.far += 0.3; } },
        { label: "Remove them with no conditions", text: "", tags: ["neutral"], lean: -1, help: 1,
          apply: function (G2) { G2.pol.ela[k] = "open"; G2.c[k].exitRisk = Math.max(0, G2.c[k].exitRisk - 0.4); G2.bonus.trust -= 0.4; G2.flags.authSqueeze = "lifted"; } }
      ];
    }
  });
  S.card("auth-halt-court", {
    title: function (G, a) { return nm(a.code) + " takes the bank to court"; }, actor: "Court of Justice", date: function (G) { return String(G.year); },
    focus: function (G, a) { return a.code; },
    /* Only while the decision to stop lending stands: once removed or withdrawn, the Court has nothing to rule on */
    when: function (G, a) { return G.flags.authSqueeze === "halt" && !G.c[a.code].exited; },
    text: function (G, a) { return "The government of " + nm(a.code) + " asks the Court of Justice to annul the decision to stop lending to its banks: one monetary policy for the whole euro area, it argues, cannot exclude one member. The Court rules this year."; },
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "Defend the decision before the Court", text: "If the Court finds it disproportionate, it annuls the decision and the president's conduct is questioned.", tags: ["neutral"], lean: 1, attr: { discipline: 1 },
          apply: function (G2) { G2.flags.haltDefended = { code: k, year: G2.year }; } },
        { label: "Withdraw the decision before the ruling", text: "The bank starts lending to its banks again, and the case ends.", tags: ["neutral"], lean: -0.4,
          apply: function (G2) { G2.flags.authSqueeze = "withdrawn"; G2.bonus.trust -= 0.3; } }
      ];
    }
  });
  S.card("auth-expulsion-court", {
    title: function (G, a) { return nm(a.code) + " takes its expulsion to the Court"; }, actor: "Court of Justice", date: function (G) { return String(G.year); },
    focus: function (G, a) { return a.code; },
    when: function (G, a) { return !!G.flags.expelled && G.flags.expelled.code === a.code && !!G.c[a.code].exited; },
    text: function (G, a) { return "The government of " + nm(a.code) + " asks the Court of Justice to annul its expulsion from the euro, which no treaty provides for. The Court rules this year. A complaint over the president's conduct is joined to the case."; },
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "Defend the expulsion", text: "The bank argues that a government that ends the rule of law has left the treaties itself. If the Court finds misconduct, it retires the president.", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6, democratic: -0.6 },
          apply: function (G2) { G2.flags.expulsionDefended = G2.year; } },
        { label: "Readmit " + nm(k) + " before the ruling", text: "The bank withdraws its decision; " + nm(k) + " returns to the euro and its governor to the Governing Council.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.6 },
          apply: function (G2) {
            G2.c[k].exited = null; G2.flags.expelled = null; S.council.sync(G2);
            G2.bonus.trust -= 0.8; G2.ethics += 0.2;
            log(G2, nm(k) + " returns to the euro after the bank withdraws its expulsion.", "news");
          } }
      ];
    }
  });
  /* ---------- EU enlargement, when a run assumes it ----------
     The items the game places for each candidate the player chose on the
     form for a new game (S.ACCESSION, js/model/game.js startYear): its
     accession, the euro it already uses without an agreement, and
     Scotland's referendum and currency. The euro follows by the treaties'
     route: membership of the EU, the convergence criteria and two years
     in the exchange rate mechanism (ERM II), then the bank's convergence
     report (the card "apply-euro"). */
  function joinEU(G, k) {
    G.c[k].eu = G.year;
    log(G, nm(k) + " joins the EU on 1 January " + G.year + ". Its central bank joins the European System of Central Banks.", "good");
  }
  S.card("eu-accession", {
    title: function (G, a) { return nm(a.code) + " joins the EU"; }, actor: "European Council",
    focus: function (G, a) { return a.code; },
    when: function (G, a) { return !!G.c[a.code] && G.c[a.code].eu == null; },
    text: function (G, a) {
      var r = S.ACCESSION[a.code];
      return "In the record, " + nm(a.code) + " was " + r.record + ". This run assumes it joins the EU on 1 January " + G.year + ". Its central bank joins the European System of Central Banks, and its governor the General Council. " +
        (G.year >= 2041 ? "In the Federation, a new member takes the common currency once its central bank is ready." :
          "The euro comes later: the state must meet the convergence criteria and spend two years in the exchange rate mechanism (ERM II), and the bank reports on it.");
    },
    options: function (G, a) {
      var k = a.code;
      if (G.year >= 2041) {
        return [
          { label: "Adopt the common currency next year", text: "Its central bank joins the Governing Council.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 },
            apply: function (G2) { joinEU(G2, k); G2.c[k].joined = G2.year + 1; } },
          { label: "Prepare its central bank for three years", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 },
            apply: function (G2) { joinEU(G2, k); G2.c[k].joined = G2.year + 3; } }
        ];
      }
      return [
        { label: "Offer help to prepare for the euro", text: "The bank's staff work with its central bank; it may apply for the euro in three years.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 },
          apply: function (G2) { joinEU(G2, k); G2.bonus.trust += 0.2; S.game.followUp(G2, "apply-euro", 3, { code: k }); G2.c[k].applied = G2.year + 3; } },
        { label: "Ask it to wait until it meets the criteria", text: "It may apply for the euro in five years.", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.8 },
          apply: function (G2) { joinEU(G2, k); S.game.followUp(G2, "apply-euro", 5, { code: k }); G2.c[k].applied = G2.year + 5; } }
      ];
    }
  });
  S.card("unilateral-euro", {
    title: function (G, a) { return nm(a.code) + " and the euro it uses"; }, actor: function (G, a) { return "European Commission, Government of " + nm(a.code); },
    focus: function (G, a) { return a.code; },
    when: function (G, a) { return !!G.c[a.code] && G.c[a.code].eu == null; },
    text: function (G, a) {
      return nm(a.code) + " has used the euro since 2002 without an agreement with the EU: its central bank issues no euro and cannot borrow from the bank. It is due to join the EU in " + S.ACCESSION[a.code].eu +
        ". The treaties provide one way into the euro: membership of the EU, the convergence criteria and two years in ERM II. The Commission asks the bank for its view.";
    },
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "Ask for the treaties' route after it joins", text: "It keeps using the euro meanwhile, as now.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 }, apply: function () {} },
        { label: "Propose an agreement on its use of the euro", text: "As the EU has with Andorra, Monaco, San Marino and the Vatican: it may issue euro coins and must apply the EU's rules on banks.", tags: ["neutral"], lean: -0.2, novelty: 0.6, attr: { democratic: 0.4 },
          apply: function (G2) { G2.flags["euroAgreement:" + k] = G2.year; G2.bonus.trust += 0.2; } },
        { label: "Ask it to issue its own currency first", text: "Savers would hold a new currency until the state joins the euro.", tags: ["neutral"], lean: 1, attr: { discipline: 1 }, apply: function (G2) { G2.bonus.trust -= 0.3; } }
      ];
    }
  });
  S.card("scotland-referendum", {
    title: "Scotland votes on independence", actor: "Scottish Government, UK Government", date: "September 2028",
    focus: function () { return null; },
    text: function (G, a) {
      return "This run assumes a second referendum on Scottish independence, agreed with the UK government, in which Scotland votes to leave the United Kingdom. In 2014 it voted to stay, by 55% to 45%. Scotland is to become independent on 1 January " +
        S.ACCESSION[a.code].independent + " and to apply to join the EU. Both sides ask whether an independent Scotland could use the euro.";
    },
    options: function (G, a) {
      var k = a.code, ind = S.ACCESSION[k].independent;
      function vote(G2) { G2.c[k].independent = ind; log(G2, "Scotland votes for independence. It is to leave the United Kingdom on 1 January " + ind + ".", "news"); }
      return [
        { label: "Say the euro requires EU membership first", text: "It must also meet the convergence criteria, as every member must.", tags: ["neutral"], lean: 0.2, attr: { discipline: 0.4 }, apply: function (G2) { vote(G2); } },
        { label: "Make no statement on the referendum", text: "The vote belongs to Scotland's voters.", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G2) { vote(G2); G2.bonus.trust += 0.2; } },
        { label: "Say Scotland may apply like any member", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 }, apply: function (G2) { vote(G2); G2.bonus.far += 0.1; } }
      ];
    }
  });
  S.card("scotland-currency", {
    title: "Scotland's currency", actor: "Government of Scotland",
    focus: function (G, a) { return a.code; },
    when: function (G, a) { return !!G.c[a.code] && G.c[a.code].independent != null && G.c[a.code].eu == null; },
    text: function (G, a) {
      return "Scotland is independent from 1 January " + G.year + ". It keeps using the pound for now, without the Bank of England's support, and sets up the Scottish Central Bank to issue a Scottish pound. It has applied to join the EU, which the run assumes it does in " +
        S.ACCESSION[a.code].eu + ". Its government asks the bank for help.";
    },
    options: function (G, a) {
      return [
        { label: "Offer a swap line to the Scottish Central Bank", text: "Euro in exchange for Scottish pounds, as the bank offers other central banks. Needs the Governing Council.", tags: ["neutral"], lean: -0.4, novelty: 0.4, vote: true, onFail: 1,
          apply: function (G2) { G2.flags.scotlandSwap = G2.year; G2.bonus.trust += 0.2; } },
        { label: "Offer technical help for its central bank", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.4 }, apply: function (G2) { G2.bonus.trust += 0.1; } },
        { label: "Make no offer before it joins the EU", text: "", tags: ["neutral"], lean: 0.4, apply: function () {} }
      ];
    }
  });

  S.script(2030, ["green-collateral"]);
  S.card("green-collateral", {
    title: "Climate and collateral", actor: "Governing Council", date: "2030",
    text: "Floods and droughts have cut the value of assets that banks pledge to the bank. Rules could lower the value the bank gives to assets of coal, oil and gas firms and to buildings in flood zones.",
    options: [
      { label: "Value high-risk assets lower", text: "", tags: ["neutral"], lean: 0.2, novelty: 0.6, attr: { green: 2 }, vote: true, onFail: 1,
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 1.5; G.flags.greenCollateral = true; } },
      { label: "Keep rules based on ratings", text: "", tags: ["neutral"], lean: 0.4, attr: { green: -0.6 }, apply: function () {} }
    ]
  });
  S.script(2033, ["heatwave-2033"]);
  S.card("heatwave-2033", {
    crisis: "climate",
    title: "Heatwaves and failed harvests", actor: "Markets, governments", date: "Summer 2033",
    text: "Heatwaves and failed harvests across southern Europe raise food prices and cut output. Strike committees form in several states.",
    options: [
      { label: "Wait for prices to fall", text: "Food prices fall again once harvests return to normal.", tags: ["neutral"], lean: -0.6, attr: { green: 0.4 }, apply: function (G) { G.bonus.infl += 0.3; } },
      { label: "Raise rates against inflation", text: "", tags: ["neutral"], lean: 1.4, apply: function (G) { G.pol.rate += 0.5; G.bonus.far += 0.8; } },
      { label: "EIB lending for water and heat protection", text: "", tags: ["intended"], lean: -0.6, attr: { green: 1.6, fiscal: 0.8 },
        apply: function (G) { G.pol.eib = Math.min(3, G.pol.eib + 1); G.flags.green = (G.flags.green || 0) + 1; G.bonus.gap += 0.2; } }
    ]
  });
  S.script(2035, ["general-strike"]);
  S.card("general-strike", {
    crisis: true,
    title: "A five-day general strike", actor: "Strike committees in 14 states", date: "March 2035",
    text: function (G) { return "Transport, energy supply and schools stop for five days. The committees demand binding emission cuts, a 32-hour week and public control of energy. Unemployment is " + pct(G.ea.v.u) + "."; },
    options: [
      { label: "Say wages and hours are for governments and unions", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Warn that shorter hours raise inflation", text: "", tags: ["neutral"], lean: 1.2, attr: { discipline: 1 }, apply: function (G) { G.bonus.trust -= 1; G.bonus.far += 0.3; } },
      { label: "Meet the committees", text: "The president meets strike delegates and the unions.", tags: ["neutral"], lean: -0.6, attr: { democratic: 1.6, public: 0.6 }, apply: function (G) { G.bonus.trust += 1.2; G.council.forEach(function (m) { if (m.h > 0.4) { m.rel -= 5; } }); } }
    ]
  });
  S.news(2036, "Nine member states have passed a 32-hour working week; several return their energy grids to public ownership.");
  S.news(2038, "The European Left Alliance is founded by the parties of The Left, the left wing of the Greens and the strike committees.");
  S.script(2039, ["convention"]);
  S.card("convention", {
    title: "The constitutional convention", actor: "Constitutional convention", date: "2039",
    text: "An elected convention drafts a Federal Treaty. It asks the bank how the central bank of a federation should be governed.",
    options: [
      { label: "A bank that reports to the parliament", text: "As the European Left Alliance proposes.", tags: ["neutral"], lean: -0.6, attr: { democratic: 2, public: 0.8 },
        apply: function (G) { G.flags.conventionView = "parliament"; G.bonus.trust += 1; } },
      { label: "Keep full independence", text: "", tags: ["neutral"], lean: 1, attr: { discipline: 1 }, apply: function (G) { G.flags.conventionView = "independent"; } },
      { label: "Independence with a dual mandate", text: "Price stability and full employment, with independence kept.", tags: ["neutral"], lean: 0, attr: { fiscal: 0.6, democratic: 0.6 }, apply: function (G) { G.flags.conventionView = "dual"; } }
    ]
  });
  S.news(2040, "Referendums on the Federal Treaty are held in every member state.");
  S.news(2040, "The treaty is approved in every state.", null, function () { return true; });

  /* ---------- 2041 to 2070 ---------- */
  S.news(2041, "The Federal Treaty enters into force. The Federation of Europe has one budget and one debt shared by its member states.", function (G) {
    G.proposals.eurobonds.passed = true;
  });
  S.script(2041, ["confirm", "greek-legacy"]);
  S.card("confirm", {
    title: "Confirmation by the Parliament", actor: "Parliament elected in 2039", date: "2041",
    text: "Until the first Federal Parliament election in 2044, the Parliament elected in 2039 sits as the Federal Parliament. It holds a confirmation hearing for the bank's president.",
    options: [
      { label: "Promise independence and accountability", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { conf(G, 4); } },
      { label: "Promise full employment alongside price stability", text: "", tags: ["neutral"], lean: -0.8, attr: { fiscal: 0.8, democratic: 0.6 }, apply: function (G) { conf(G, 6); } },
      { label: "Promise price stability above all", text: "", tags: ["neutral"], lean: 1.2, attr: { discipline: 1 }, apply: function (G) { conf(G, -2); } }
    ]
  });
  S.card("greek-legacy", {
    title: "The Greek loans", actor: "Federal government", date: "2041",
    when: function (G) { return !!G.flags.greekLegacy || !!(G.programs.GR); },
    text: "Greece is still repaying the loans of 2010 to 2018, on terms set to run until 2070. The federal government asks whether the federal debt should take them over.",
    options: [
      { label: "Support conversion into federal debt", text: "Greek payments end; the federal debt rises.", tags: ["intended"], lean: -0.8, attr: { fiscal: 1, democratic: 0.6 },
        apply: function (G) { G.flags.greekSettled = G.year; conf(G, 3); G.c.GR.bonusGap = 0.6; } },
      { label: "Keep the original terms", text: "Repayments continue until 2070.", tags: ["neutral"], lean: 0.8, attr: { discipline: 1 }, apply: function () {} }
    ]
  });
  S.news(2044, "The first Federal Parliament is elected in May 2044, with a turnout of 71%.");
  S.script(2044, ["new-majority"]);
  S.card("new-majority", {
    title: "The new majority's program", actor: "European Left Alliance", date: "2044",
    text: "The European Left Alliance wins 432 of the 800 seats. Its program makes the bank accountable to the Federal Parliament and repeals the federal debt rules. The new government asks how the bank will report.",
    options: [
      { label: "Propose regular reports and hearings", text: "The Parliament sets the goals; the Governing Council keeps the rate decisions.", tags: ["intended"], lean: -0.2, attr: { democratic: 1.4 },
        apply: function (G) { conf(G, 6); G.bonus.trust += 0.5; } },
      { label: "Accept instructions from the Parliament", text: "", tags: ["neutral"], lean: -1, attr: { democratic: 1.6, fiscal: 0.8 }, apply: function (G) { conf(G, 9); G.bonus.infl += 0.2; } },
      { label: "Defend the bank's independence", text: "", tags: ["neutral"], lean: 1, attr: { discipline: 1, democratic: -1 }, apply: function (G) { conf(G, -10); } }
    ]
  });
  S.news(2045, "The 2045 reforms take effect: voters elect the Commission, the bank reports to the Federal Parliament, and the federal debt rules are repealed.", function (G) { G.fedRulesRepealed = true; });
  S.script(2045, ["instruction-investment"]);
  S.card("instruction-investment", {
    title: "The Parliament's first instruction", actor: "Federal Parliament", date: "2045",
    text: "A federal law instructs the bank to support public investment in energy and rail, now in public ownership, by buying the bonds of the federal investment bank.",
    options: [
      { label: "Comply in full", text: "Large purchases. Investment rises; inflation risk rises with it.", tags: ["neutral"], lean: -1.2, attr: { public: 1.6, green: 1.2, fiscal: 1, democratic: 1 },
        apply: function (G) { conf(G, 8); G.pol.eib = 3; G.bonus.infl += 0.6; G.bonus.gap += 0.5; G.flags.green = (G.flags.green || 0) + 1; G.parl.complied++; } },
      { label: "Comply within a yearly cap", text: "The bank proposes a cap tied to approved projects, and the Parliament accepts it.", tags: ["intended"], lean: -0.4, attr: { public: 1, green: 1, democratic: 0.8 },
        apply: function (G) { conf(G, 4); G.pol.eib = Math.max(G.pol.eib, 2); G.bonus.gap += 0.3; G.flags.green = (G.flags.green || 0) + 0.6; G.parl.complied++; } },
      { label: "Refuse, citing price stability", text: "", tags: ["neutral"], lean: 1.4, attr: { discipline: 1.2, democratic: -1 },
        apply: function (G) { conf(G, -14); G.parl.refused++; } }
    ]
  });
  S.script(2047, ["eastern-grants"]);
  S.card("eastern-grants", {
    title: "Investment in Central and Eastern Europe", actor: "Federal government", date: "2047",
    text: "The Federation directs investment grants to Central and Eastern Europe: high-speed rail, the renovation of panel housing estates, research centers in Bucharest, Brno, Kraków and Debrecen. Wages in the region stand at 58% of the federal average.",
    options: [
      { label: "Keep rates low while the grants are spent", text: "", tags: ["neutral"], lean: -0.8, attr: { fiscal: 1, public: 0.6 }, apply: function (G) { conf(G, 3); G.bonus.gap += 0.2; } },
      { label: "Warn that fast spending may raise prices", text: "", tags: ["neutral"], lean: 1, attr: { discipline: 1 }, apply: function (G) { conf(G, -3); } }
    ]
  });
  S.script(2049, ["instruction-housing"]);
  S.card("instruction-housing", {
    title: "Credit for renovation", actor: "Federal Parliament", date: "2049",
    text: "The Parliament asks the bank to lend to banks at a lower rate for loans that insulate homes.",
    options: [
      { label: "Create the cheaper loans", text: "", tags: ["neutral"], lean: -0.6, attr: { green: 1.6, public: 0.6, democratic: 0.6 }, apply: function (G) { conf(G, 5); G.flags.green = (G.flags.green || 0) + 1; G.bonus.gap += 0.15; G.parl.complied++; } },
      { label: "Decline", text: "", tags: ["neutral"], lean: 0.8, attr: { discipline: 0.8 }, apply: function (G) { conf(G, -8); G.parl.refused++; } }
    ]
  });
  function climateCard(id, year, title, text) {
    S.script(year, [id]);
    S.card(id, {
      crisis: "climate",
      title: title, actor: "Weather, markets", date: String(year), text: text,
      options: [
        { label: "Wait for prices to fall", text: "Prices rise for a year; the bank keeps its rates.", tags: ["neutral"], lean: -0.6, attr: { green: 0.4 }, apply: function (G) { G.bonus.infl += 0.4; } },
        { label: "Raise rates", text: "Keeps inflation lower, and costs jobs in the affected regions.", tags: ["neutral"], lean: 1.4, apply: function (G) { G.pol.rate += 0.5; conf(G, -3); } },
        { label: "Emergency lending for reconstruction", text: "Cheap loans to banks for rebuilding and for protection against floods and heat in the affected regions.", tags: ["intended"], lean: -0.8, attr: { green: 1.6, public: 0.8, fiscal: 0.8 },
          apply: function (G) { G.flags.green = (G.flags.green || 0) + 1; G.bonus.gap += 0.4; G.bonus.infl += 0.1; conf(G, 4); } }
      ]
    });
  }
  climateCard("floods-2051", 2051, "Floods", "Rivers flood across central Europe. Insured losses are the largest on record, and banks with mortgages in the flood zones lose capital.");
  S.news(2052, "CESEA, the Central-European Space Exploration Agency, is founded and funded from the federal budget.");
  S.script(2052, ["cesea-funding"]);
  S.card("cesea-funding", {
    title: "Paying for CESEA", actor: "Federal government", date: "2052",
    text: "The federal budget funds CESEA's construction robots and its first launcher. The government plans to borrow for it with federal bonds and asks whether the bank will count them like other federal bonds.",
    options: [
      { label: "Count them like other federal bonds", text: "", tags: ["neutral"], lean: 0, attr: { public: 0.8 }, apply: function (G) { conf(G, 3); } },
      { label: "Buy them within the yearly cap for public investment", text: "", tags: ["neutral"], lean: -0.6, attr: { public: 1.2, fiscal: 0.6 }, apply: function (G) { conf(G, 5); G.bonus.gap += 0.1; G.bonus.infl += 0.05; } },
      { label: "Ask the Parliament to fund it from taxes", text: "", tags: ["neutral"], lean: 0.8, attr: { discipline: 0.8 }, apply: function (G) { conf(G, -3); } }
    ]
  });
  climateCard("heat-2053", 2053, "A summer of heat", "A heatwave across the south cuts harvests and power output. Food and electricity prices rise sharply.");
  S.news(2054, "CESEA's first launcher flies.");
  climateCard("floods-2056", 2056, "Floods again", "Floods cover parts of the Danube and the Rhine basins. Emergency laws order some towns and factories to move.");
  climateCard("heat-2058", 2058, "Drought", "Drought lowers rivers below the level barges and power plants need.");
  S.script(2055, ["instruction-cap"]);
  S.card("instruction-cap", {
    title: "A cap on rates", actor: "Federal Parliament", date: "2055",
    text: function (G) { return "After the climate shocks, a majority moves a law to cap the bank's main rate at 2% for five years. Inflation last year was " + pct(G.ea.v.p) + "."; },
    options: [
      { label: "Accept the cap", text: "", tags: ["neutral"], lean: -1.4, attr: { democratic: 1, fiscal: 0.8 }, apply: function (G) { conf(G, 7); G.pol.rate = Math.min(G.pol.rate, 2); G.flags.rateCap = 2060; G.parl.complied++; } },
      { label: "Negotiate a review clause", text: "The cap lapses if inflation exceeds 4%.", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { conf(G, 2); G.pol.rate = Math.min(G.pol.rate, 2.5); } },
      { label: "Oppose the law", text: "", tags: ["neutral"], lean: 1.4, attr: { discipline: 1.2, democratic: -0.8 }, apply: function (G) { conf(G, -12); G.parl.refused++; } }
    ]
  });
  S.script(2058, ["capital-flight"]);
  S.card("capital-flight", {
    crisis: true,
    title: "Capital leaves for tax havens", actor: "Turbocapitalist factions", date: "2058",
    text: "Turbocapitalist factions in several member parliaments support moving private capital to tax havens. As money leaves, the euro loses value.",
    options: [
      { label: "Report the outflows to the Parliament and ask for rules", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 1.2, public: 0.8 }, apply: function (G) { conf(G, 5); } },
      { label: "Raise rates so capital stays", text: "", tags: ["neutral"], lean: 1.4, attr: { discipline: 1 }, apply: function (G) { G.pol.rate += 0.5; conf(G, -4); } },
      { label: "Leave it to governments", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.infl += 0.2; } }
    ]
  });
  S.news(2063, "The global mean temperature stops rising, at 1.9 °C above the pre-industrial level.");
  S.script(2062, ["relay-payments"]);
  S.card("relay-payments", {
    title: "Private payments over radio relays", actor: "Halvorsen Relay (Singapore)", date: "2062",
    text: "Halvorsen Relay, a radio relay operator based in Singapore, launches a payment network for its customers, who pay in its own tokens. Federal firms in space and shipping start to use it.",
    options: [
      { label: "Extend the digital euro to relay networks", text: "Public money on the same networks.", tags: ["neutral"], lean: -0.2, attr: { public: 1.6, democratic: 0.4 }, apply: function (G) { conf(G, 4); G.flags.digitalEuro = true; } },
      { label: "Ask the Parliament to regulate private tokens", text: "", tags: ["neutral"], lean: 0.2, attr: { democratic: 1, public: 0.8 }, apply: function (G) { conf(G, 3); } },
      { label: "Allow it", text: "", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.6, public: -1 }, apply: function (G) { conf(G, -5); G.bonus.backstop -= 0.02; } }
    ]
  });
  S.script(2066, ["spaceport-lobby"]);
  S.card("spaceport-lobby", {
    title: "Spaceport finance", actor: "Xiran Spaceports (Delaware)", date: "2066",
    text: "Xiran Spaceports, a launch operator based in Delaware, asks federal deputies to let banks pledge its bonds as collateral at the bank, on the same terms as federal bonds.",
    options: [
      { label: "Refuse; private launch bonds are not federal debt", text: "", tags: ["neutral"], lean: 0.4, attr: { public: 1.2 }, apply: function (G) { conf(G, 3); } },
      { label: "Accept them with a large haircut", text: "", tags: ["neutral"], lean: -0.2, attr: { public: -0.6 }, apply: function (G) { conf(G, -2); } }
    ]
  });
  S.script(2068, ["greek-final"]);
  S.card("greek-final", {
    title: "The last Greek repayment", actor: "Federal government", date: "2068",
    when: function (G) { return !G.flags.greekSettled; },
    text: "Two years remain on the Greek loans of 2010 to 2018. The government of Greece asks whether the last payments can be waived.",
    options: [
      { label: "Support the waiver", text: "", tags: ["neutral"], lean: -0.6, attr: { democratic: 0.6, fiscal: 0.6 }, apply: function (G) { G.flags.greekSettled = G.year; conf(G, 3); } },
      { label: "Complete the repayments", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.8 }, apply: function () {} }
    ]
  });
  S.script(2070, ["relay-spaceport"]);
  S.card("relay-spaceport", {
    title: "A company in the Cayman Islands", actor: "Halvorsen Relay, Xiran Spaceports", date: "2070",
    text: "Halvorsen Relay and Xiran Spaceports plan a joint company in the Cayman Islands to contract building and mining work away from Earth. Federal banks ask to lend to it.",
    options: [
      { label: "Require full capital against the loans", text: "Banks hold one euro of capital for each euro lent to it.", tags: ["neutral"], lean: 0.4, attr: { public: 1, discipline: 0.6 }, apply: function (G) { conf(G, 4); } },
      { label: "Ask the Parliament for rules on off-world contractors", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 1, public: 0.6 }, apply: function (G) { conf(G, 3); } },
      { label: "Treat it as any foreign firm", text: "", tags: ["neutral"], lean: 0.2, attr: { public: -1 }, apply: function (G) { conf(G, -5); } }
    ]
  });
  S.news(2070, "The last payment on the Greek loans of 2010 to 2018 falls due this year.", null, function (G) { return !G.flags.greekSettled; });
})();
