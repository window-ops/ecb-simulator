/* Decision cards that recur: the yearly rate decision, a request for a
   loan program, a state close to leaving the euro, an application to join,
   and the quieter items that fill a calm year. Helpers shared by every card
   file are defined here.

   A card: { title, actor, date, text, history, focus, options }. Text and
   options may be functions of the game (G) and the card's arguments. An
   option: { label, text, tags, draghi, lean (hawkishness, -2 to 2),
   novelty (legal newness, 0 to 2), help (for the periphery, -1 to 1),
   attr (attributes the advisors and the Parliament weigh), vote (needs the
   Governing Council), rule ("simple", "twothirds" for an objection to
   emergency liquidity, "restrict" for a restriction that needs two thirds
   in favor), onFail (the option applied when the vote fails), lawful (a
   function returning true or the legal reason it is unavailable), apply }. */
(function () {
  var S = window.ECBSIM, M = S.model;
  S.CARDS = {}; S.SCRIPT = {}; S.NEWS = {};
  S.card = function (id, def) { S.CARDS[id] = def; };
  S.script = function (year, ids) { S.SCRIPT[year] = (S.SCRIPT[year] || []).concat(ids); };
  S.news = function (year, text, apply, when) { (S.NEWS[year] = S.NEWS[year] || []).push({ text: text, apply: apply, when: when }); };
  function log(G, t, k) { S.game.log(G, t, k); }
  S.cardKit = { log: log };

  function pct(v) { return v == null ? "n/a" : (Math.round(v * 10) / 10).toFixed(1) + "%"; }
  S.pct = pct;
  function name(code) { return S.COUNTRY[code].name; }

  /* ---------- Programs ---------- */
  S.startProgram = function (G, code, role, terms) {
    var h = S.HIST.programs[code];
    var len = h && G.year <= h.start + 1 ? h.end - h.start : 3;
    G.programs[code] = { start: G.year, end: G.year + len, role: role, terms: terms == null ? 1 : terms, active: true, size: 1 };
    /* In history a program came with a collateral waiver for the state's bonds */
    if (role !== "refuse") { G.pol.waiver[code] = true; }
    log(G, name(code) + " receives a loan program" + (role === "full" ? " with the bank in the Troika." : role === "advisory" ? "; the bank advises." : "; the bank takes no part."), "news");
  };
  S.programOptions = function (code, extra) {
    var c = name(code), list = [
      { label: "Join the Troika as a full member", text: "The bank sets and checks the loan conditions with the Commission and the IMF, as the historical bank did. Conditions are spending cuts, tax rises, sales of public assets and changes to labor law.",
        tags: ["troika"], troikaCode: code, lean: 1, attr: { troika: 1, discipline: 1 }, apply: function (G) { S.startProgram(G, code, "full"); } },
      { label: "Take an advisory role", text: "The bank publishes its opinion and takes no part in the talks. The conditions are somewhat milder.",
        tags: ["neutral"], lean: 0.3, attr: { troika: 0.3 }, apply: function (G) { S.startProgram(G, code, "advisory"); } },
      { label: "Stay out of the program", text: "The bank takes no part. Governments lend with the Commission and the IMF on their own terms.",
        tags: ["neutral"], lean: -0.2, attr: { troika: -1, democratic: 0.6 }, apply: function (G) { S.startProgram(G, code, "refuse"); } },
      { label: "Offer the bank's own support instead", text: "Keep accepting " + c + "'s bonds as collateral whatever their rating, keep emergency liquidity available to its banks, and ask governments for a smaller loan with milder conditions and no bank in the Troika. Needs the Governing Council.",
        tags: ["intended"], lean: -1, novelty: 0.6, help: 1, attr: { troika: -1, fiscal: 0.6 }, vote: true, onFail: 0,
        apply: function (G) {
          G.pol.waiver[code] = true; G.pol.ela[code] = "open"; G.pol.elaOpen = true;
          S.startProgram(G, code, "refuse", 0.55);
          G.c[code].bankBonus = (G.c[code].bankBonus || 0) + 6;
        } }
    ];
    return extra ? list.concat(extra) : list;
  };

  /* Buying a government's bonds when they are first sold: unlawful under Art. 123 TFEU
     unless a treaty campaign changed it. Shown so the player sees where the
     law stands. */
  S.directPurchase = function (code) {
    return {
      label: "Buy " + name(code) + "'s new bonds from the government", text: "The bank lends to the government directly by buying its bonds when they are first sold.",
      tags: ["neutral"], lean: -1.8, novelty: 2, help: 1, attr: { purchases: 1.4, fiscal: 1 }, vote: true, onFail: 2,
      lawful: function (G) {
        return G.treaty.done.indexOf("art123") >= 0 ? true : "Art. 123 TFEU forbids the bank to buy government bonds when they are first sold. A treaty campaign could change this.";
      },
      apply: function (G) { G.bonus.backstop += 0.15; G.c[code].bankBonus = 10; G.bonus.infl += 0.2; }
    };
  };

  /* ---------- The rate decision ---------- */
  var RATE_NOTES = {
    2008: "In July 2008 the historical bank raised the main rate to 4.25%, and cut it from October after Lehman Brothers failed (ECB press release, 3 July 2008).",
    2009: "In history the main rate fell to 1% by May 2009 and stayed there until April 2011.",
    2011: "In April and July 2011 the historical bank raised the rate twice, to 1.50%, and cut it again in November and December.",
    2014: "In June 2014 the historical bank cut the main rate to 0.15% and took the deposit rate below zero.",
    2022: "From July 2022 the historical bank raised its rates ten times, the main rate reaching 4.50% in September 2023.",
    2024: "In June 2024 the historical bank began to cut rates."
  };
  S.card("rate", {
    title: "Interest rates for the year",
    actor: "Governing Council",
    date: function (G) { return "January to December " + G.year; },
    text: function (G, a) {
      var v = G.ea.v || {};
      /* Once decided, the card still tells the rate as it stood before the decision */
      var r0 = a && a.rateFrom != null ? a.rateFrom : G.pol.rate;
      /* The opening follows the year's situation, so the yearly card reads differently */
      var lead = v.p > 4 ? "Prices are rising fast. " : v.p != null && v.p < 1 ? "Prices are barely rising. " : v.g != null && v.g < 0 ? "Output is falling. " :
        v.u > 10 ? "Unemployment is high. " : ["", "The Council meets in Frankfurt. ", "The Council meets outside Frankfurt this time, as it does twice a year. "][G.year % 3];
      /* Where inflation stands against the target: until the target is made
         symmetric, inflation below, but close to, 2% (from 1.5% to under
         2%); after, 2% itself (from 1.9% to 2.1% counts as at it) */
      var p = v.p, where;
      if (p == null) { where = ""; }
      else if (G.flags.symmetric) { where = p > 2.1 ? ", above the target of 2%" : p < 1.9 ? ", under the target of 2%" : ", at the target of 2%"; }
      else { where = p >= 2 ? ", above the target of inflation below, but close to, 2%" : p >= 1.5 ? ", in line with the target of inflation below, but close to, 2%" : ", under the target of inflation below, but close to, 2%"; }
      return lead + "Inflation last year: " + pct(v.p) + where + ". Unemployment: " + pct(v.u) +
        ". Growth: " + pct(v.g) + ". The main refinancing rate stands at " + r0.toFixed(2) + "%. Set its average level for " + G.year + ".";
    },
    history: function (G) {
      var h = G.year <= 2025 ? "The main rate averaged " + M.histRate(G.year).toFixed(2) + "% this year. " : "";
      return (h + (RATE_NOTES[G.year] || "")) || null;
    },
    options: function (G) {
      /* Larger rises appear when inflation is high: +2 above 3%, +3 above 5% */
      var r0 = G.pol.rate, p = (G.ea.v && G.ea.v.p) || 2, steps = [3.0, 2.0, 1.0, 0.5, 0.25, 0, -0.25, -0.5, -1.0, -2.0, -3.0], out = [];
      var LEAN = { "3": 2, "2": 1.9, "1": 1.8, "0.5": 1.6, "0.25": 1.0, "0": 0.1, "-0.25": -0.5, "-0.5": -0.8, "-1": -1.3, "-2": -1.7, "-3": -2 };
      steps.forEach(function (d) {
        var r = Math.round((r0 + d) * 100) / 100;
        if (r < 0) { return; }
        if (d === 3.0 && p <= 5) { return; }
        if (d === 2.0 && p <= 3) { return; }
        if (d === 1.0 && p <= 2.5) { return; }
        if (d === -3.0 && r0 < 3) { return; }
        if (d === -2.0 && r0 < 2) { return; }
        if (d === -1.0 && r0 < 1.0) { return; }
        if (d === -0.25 && r0 >= 1.5) { return; }
        var hike = d > 0, histHike = [2008, 2011].indexOf(G.year) >= 0;
        out.push({
          label: d === 0 ? "Keep at " + r.toFixed(2) + "%" : (hike ? "Raise" : "Cut") + " to " + r.toFixed(2) + "%",
          text: d === 0 ? "Borrowing costs stay the same." : (hike ? "Borrowing costs more: inflation falls, and so do output and jobs." : "Borrowing costs less: more output and jobs, with some risk of higher inflation."),
          tags: histHike && !hike ? ["intended"] : ["neutral"], lean: LEAN[String(d)], vote: true, onFail: "hold", rateTo: r,
          attr: { discipline: hike ? 0.4 : 0 },
          lawful: function (G2) {
            return G2.flags.rateCap && G2.year <= G2.flags.rateCap && r > 2 ? "A federal law caps the main rate at 2% until " + G2.flags.rateCap + "." : true;
          },
          apply: function (G2) { G2.pol.rate = r; }
        });
      });
      var hold = 0;
      out.forEach(function (o, i) { if (o.label.indexOf("Keep at") === 0) { hold = i; } });
      out.forEach(function (o) { if (o.onFail === "hold") { o.onFail = hold; } });
      return out;
    }
  });

  /* ---------- A request for a loan program ---------- */
  S.card("program", {
    title: function (G, a) { return name(a.code) + " asks for a loan"; },
    actor: function (G, a) { return "Government of " + name(a.code) + ", Eurogroup"; },
    text: function (G, a) {
      var sp = M.expectedSpread(G, a.code).toFixed(1);
      /* Three wordings, so a request that comes back does not read the same */
      return [
        name(a.code) + " can no longer borrow at rates it can pay: its 10-year spread over Germany is rising toward " + sp + " points. Governments are ready to lend through the stability fund, with conditions. Which role does the bank take?",
        "Investors ask " + sp + " points more from " + name(a.code) + " than from Germany. Its finance minister writes to the Eurogroup for a loan, and governments are ready to lend with conditions. Which role does the bank take?",
        "The government of " + name(a.code) + " can no longer sell its bonds at a price it can pay; its spread is heading toward " + sp + " points. The stability fund can lend, with conditions. Which role does the bank take?"
      ][(G.year + a.code.charCodeAt(0)) % 3];
    },
    focus: function (G, a) { return a.code; },
    options: function (G, a) {
      return S.programOptions(a.code, [S.directPurchase(a.code), {
        label: "Let the government decline the loan", text: "No program this year. If spreads keep rising, investors may stop lending to the government.",
        tags: ["neutral"], lean: 0.5, attr: { discipline: 1, restructure: 0.5 },
        apply: function (G2) { G2.c[a.code].declined = true; G2.c[a.code].refusedProgram = true; }
      }]);
    }
  });

  /* ---------- A state close to leaving ---------- */
  S.card("exit-crisis", {
    title: function (G, a) { return name(a.code) + " prepares to leave the euro"; },
    actor: function (G, a) { return "Government of " + name(a.code); },
    text: function (G, a) {
      var v = G.c[a.code].v || {};
      return "Savers are taking their deposits out of " + name(a.code) + "'s banks. Unemployment is " + pct(v.u) + " and bank stability " + Math.round(v.bank || 0) +
        " of 100. The government has prepared plans for a national currency. What does the bank do?";
    },
    focus: function (G, a) { return a.code; },
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "Keep accepting its bonds and lending to its banks", text: "A collateral waiver, and emergency liquidity without political conditions. Needs the Governing Council.",
          tags: ["intended"], lean: -1.2, novelty: 0.4, help: 1, attr: { fiscal: 0.4, troika: -0.5 }, vote: true, onFail: 1,
          apply: function (G2) { G2.pol.waiver[k] = true; G2.pol.ela[k] = "open"; G2.c[k].exitRisk = Math.max(0, G2.c[k].exitRisk - 0.35); G2.c[k].bankBonus = 15; } },
        { label: "Leave the decision to its voters", text: "The bank keeps its current terms and says the choice belongs to the state's citizens.",
          tags: ["neutral"], lean: 0, attr: { democratic: 1 }, apply: function () {} },
        { label: "Limit emergency liquidity unless it accepts a program", text: "Cap emergency liquidity until the government signs a memorandum. Needs two thirds of the Governing Council.",
          tags: ["troika"], troikaCode: k, lean: 1.6, attr: { troika: 1, discipline: 1.2 }, vote: true, rule: "restrict", onFail: 1,
          apply: function (G2, rng) {
            G2.pol.ela[k] = "capped";
            G2.c[k].exitRisk = Math.min(1, G2.c[k].exitRisk + 0.1);
            if ((rng || Math.random)() < 0.6) { S.startProgram(G2, k, "full"); G2.c[k].exitRisk = Math.max(0, G2.c[k].exitRisk - 0.3); }
          } }
      ];
    }
  });

  /* ---------- An application to join ---------- */
  S.card("apply-euro", {
    title: function (G, a) { return name(a.code) + " applies to adopt the currency"; },
    actor: function (G, a) { return "Government of " + name(a.code) + ", Council of the EU"; },
    /* A state that already has a date for the currency, as every EU state
       has from 2040, does not apply */
    when: function (G, a) { return !a || !G.c[a.code] || G.c[a.code].joined == null; },
    text: function (G, a) {
      var c = S.COUNTRY[a.code];
      return name(a.code) + " asks to join. Its debt is about " + Math.round(M.base(a.code, "d", G.year)) + "% of GDP and inflation about " +
        pct(M.base(a.code, "p", G.year)) + ". The bank's convergence report counts for much in the Council's decision.";
    },
    options: function (G, a) {
      return [
        { label: "Report that it meets the criteria", text: "The state joins on 1 January next year; its governor joins the Governing Council.",
          tags: ["neutral"], lean: -0.2, attr: { democratic: 0.3 }, apply: function (G2) { G2.c[a.code].joined = G2.year + 1; log(G2, name(a.code) + " will adopt the currency on 1 January " + (G2.year + 1) + ".", "good"); } },
        { label: "Ask for two more years of convergence", text: "The state may apply again later.", tags: ["neutral"], lean: 0.8, attr: { discipline: 0.8 },
          apply: function (G2) { G2.c[a.code].applied = null; G2.c[a.code].delay = G2.year + 2; } }
      ];
    }
  });

  /* ---------- Quieter items ---------- */
  S.card("annual-report", {
    title: "The annual report", actor: "Executive Board",
    variants: [{},
      { text: "The Parliament's resolution on last year's report asked how the bank's decisions affect households. Which theme leads this year's report?" },
      { text: "The annual report is due before the Parliament in Strasbourg. Members criticized the last report for saying little about the bank's own risks. Which theme leads it?" }],
    text: "The bank presents its annual report to the Parliament (Art. 284(3) TFEU). Which theme leads it?",
    options: [
      { label: "Price stability", text: "The report stresses the bank's first goal, stable prices.", tags: ["neutral"], lean: 0.8, attr: { discipline: 0.5 },
        apply: function () {} },
      { label: "Jobs and the periphery", text: "The report stresses unemployment in the states where the crisis was worst.", tags: ["neutral"], lean: -0.6, attr: { democratic: 0.6, fiscal: 0.4 },
        apply: function (G) { G.bonus.trust += 0.8; } },
      { label: "Climate risk", text: "The report sets out the bank's risks from floods, droughts and heat.", tags: ["neutral"], lean: 0, attr: { green: 1 },
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 0.5; } }
    ]
  });
  S.card("collateral-review", {
    title: "Review of the collateral rules", actor: "Executive Board, Governing Council",
    variants: [{},
      { text: function (G) { return "National central banks ask to accept bank loans to small firms as collateral, with larger haircuts. The rules are now " + G.pol.collateral + "."; } },
      { text: function (G) { return "A rating agency changes its method, and many bonds backed by mortgages would no longer be accepted. The rules are now " + G.pol.collateral + "."; } }],
    text: function (G) { return "Every year the bank reviews which assets banks may pledge for its loans. The rules are now " + G.pol.collateral + "."; },
    options: [
      { label: "Broaden the rules", text: "Lower minimum ratings and smaller haircuts. Banks borrow more easily; the bank takes on more risk.", tags: ["intended"], lean: -0.8, novelty: 0.3, help: 0.6, vote: true, onFail: 1,
        attr: { fiscal: 0.2 }, apply: function (G) { G.pol.collateral = "broad"; } },
      { label: "Keep the standard rules", text: "No change.", tags: ["neutral"], lean: 0.2, apply: function (G) { if (G.pol.collateral === "strict") { G.pol.collateral = "standard"; } } },
      { label: "Make the rules stricter", text: "Higher minimum ratings and larger haircuts. The bank takes on less risk; weaker banks can borrow less.", tags: ["neutral"], lean: 1.2, vote: true, onFail: 1,
        attr: { discipline: 1 }, apply: function (G) { G.pol.collateral = "strict"; } }
    ]
  });
  S.card("speech-topic", {
    title: "An invitation to speak", actor: "A university in Frankfurt",
    variants: [{},
      { title: "A speech at Jackson Hole", actor: "Federal Reserve Bank of Kansas City", text: "The president is invited to speak at the yearly meeting of central bankers in Jackson Hole, Wyoming. What is the speech about?" },
      { title: "A speech to the unions", actor: "European Trade Union Confederation", text: "The president is invited to speak at the congress of the European trade unions. What is the speech about?" }],
    text: "The president is invited to give the year's main lecture. What is it about?",
    options: [
      { label: "The limits of interest rates", text: "Interest rates and bond purchases cannot do the work of reforms by governments.", tags: ["neutral"], lean: 0.8, attr: { discipline: 0.8 },
        apply: function (G) { G.council.forEach(function (m) { if (m.h > 0.3) { m.rel = Math.min(100, m.rel + 4); } }); } },
      { label: "The case for common investment", text: "The euro area needs a common investment plan through the EIB.", tags: ["intended"], lean: -0.5, attr: { fiscal: 1, green: 0.4 },
        apply: function (G) { G.proposals.eibPlan.support = Math.min(100, G.proposals.eibPlan.support + 5); } },
      { label: "A bank that answers to the public", text: "The bank should explain itself to elected representatives more often.", tags: ["neutral"], lean: -0.3, attr: { democratic: 1.2 },
        apply: function (G) { G.bonus.trust += 1; G.council.forEach(function (m) { if (m.c > 0.7) { m.rel = Math.max(-100, m.rel - 4); } }); } }
    ]
  });
  S.card("liquidity-review", {
    title: "Review of loans to banks", actor: "Executive Board",
    variants: [{},
      { text: function (G) { return "Banks hold large amounts of money at the bank and lend little to firms. Banks currently " + (G.pol.fullAllot ? "can borrow as much as they ask for at the main rate (full allotment)." : "bid at auction for a limited amount of loans."); } },
      { text: function (G) { return "Rates between banks drift away from the main rate. Banks currently " + (G.pol.fullAllot ? "can borrow as much as they ask for at the main rate (full allotment)." : "bid at auction for a limited amount of loans."); } }],
    text: function (G) { return "Banks currently " + (G.pol.fullAllot ? "can borrow as much as they ask for at the main rate (full allotment)." : "bid at auction for a limited amount of loans."); },
    options: [
      { label: "Unlimited loans at the main rate", text: "Banks can borrow as much as they ask for, if they pledge collateral the bank accepts.", tags: ["neutral"], lean: -0.5, vote: true, onFail: 1,
        apply: function (G) { G.pol.fullAllot = true; } },
      { label: "No change", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} },
      { label: "Return to limited auctions", text: "Banks can borrow less from the bank; weaker banks pay more to borrow elsewhere.", tags: ["neutral"], lean: 1.2, vote: true, onFail: 1,
        apply: function (G) { G.pol.fullAllot = false; } }
    ]
  });
  /* ---------- Quieter items of other kinds: supervision, payments, staff,
     communication, the courts. Some choices bring a follow-up card in a
     later year (S.game.followUp). ---------- */
  function rel(G, test, n) { G.council.forEach(function (m) { if (test(m)) { m.rel = Math.max(-100, Math.min(100, m.rel + n)); } }); }
  S.card("supervision-fine", {
    title: "A bank breaks the reporting rules", actor: "Supervisory Board",
    variants: [{},
      { text: "A supervised bank lent more than the legal limit to a single client for two years. The Supervisory Board proposes a fine." },
      { text: "A supervised bank paid its managers bonuses above the limit in its licence. The Supervisory Board proposes a fine." }],
    when: function (G) { return G.year >= 2015; },
    text: "One of the largest banks under the bank's supervision reported its risks wrongly for three years. The Supervisory Board proposes a fine.",
    options: [
      { label: "Fine the bank in full", text: "The fine is public; the bank may appeal.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.8 },
        apply: function (G) { G.bonus.trust += 0.6; S.game.followUp(G, "fine-appeal", 2); } },
      { label: "A warning and a deadline", text: "No fine this time; the bank must correct its reports within a year.", tags: ["neutral"], lean: -0.2,
        apply: function (G) { G.bonus.trust -= 0.3; } },
      { label: "Ask for stricter law", text: "The bank asks the Council of the EU for higher fines in the supervision rules.", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 },
        apply: function (G) { G.bonus.trust += 0.3; } }
    ]
  });
  S.card("fine-appeal", {
    title: "The fined bank appeals", actor: "Court of Justice",
    text: function (G, a) { return "The bank fined in " + a.from + " asks the Court of Justice to cancel the fine. The case will take a year."; },
    options: [
      { label: "Defend the fine", text: "The bank's lawyers argue the case in full.", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Settle at half the fine", text: "The case ends at once.", tags: ["neutral"], lean: -0.2, apply: function (G) { G.bonus.trust -= 0.4; } }
    ]
  });
  S.card("payment-outage", {
    title: "The payment system stops", actor: "Market Infrastructure",
    variants: [{},
      { text: function (G) { return "A software update stops " + (G.year >= 2023 ? "T2" : "TARGET2") + ", the system that moves payments between banks, for six hours on the last working day of the month. Some pensions arrive late."; } },
      { text: function (G) { return "A fire at a data centre takes " + (G.year >= 2023 ? "T2" : "TARGET2") + ", the system that moves payments between banks, offline for a morning. The backup systems start two hours late."; } }],
    text: function (G) { return (G.year >= 2023 ? "T2" : "TARGET2") + ", the system that moves payments between banks, stopped for eleven hours. Wages and invoices in several states were paid a day late."; },
    options: [
      { label: "Publish a full report", text: "The causes, the costs and the fixes, within a month.", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 },
        apply: function (G) { G.bonus.trust += 0.5; } },
      { label: "Repair it without a full report", text: "A short statement; the review stays internal.", tags: ["neutral"], lean: 0.2,
        apply: function (G) { S.game.followUp(G, "outage-again", 1); } },
      { label: "Build a second site", text: "A backup centre in another member state, ready in two years.", tags: ["neutral"], lean: -0.2, attr: { public: 0.6 }, done: "secondSite",
        apply: function (G) { G.bonus.trust += 0.3; } }
    ]
  });
  S.card("outage-again", {
    title: "A second outage", actor: "Market Infrastructure",
    text: function (G, a) { return "The payment system stops again, for four hours. The press links it to the outage of " + a.from + ", whose review was never published."; },
    options: [
      { label: "Publish both reviews", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Replace the head of the service", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.3; } }
    ]
  });
  S.card("staff-hiring", {
    title: "New economists", actor: "Directorate General Economics",
    variants: [{},
      { text: "Twenty economists retire this year. Where should the bank hire the new ones?" },
      { text: "The bank opens fifteen posts in its research department. Where should they come from?" }],
    text: "The bank hires twenty economists this year. Where should they come from?",
    /* The research unit is set up once; later hires join it */
    options: function (G) {
      var set = G.flags["done:researchUnit"], unit = set && set < G.year;
      return [
        { label: "From national central banks", text: "Experienced staff who share the bank's methods.", tags: ["neutral"], lean: 0.4,
          apply: function (G) { rel(G, function (m) { return m.h > 0.3; }, 3); } },
        unit
          ? { label: "From many schools of economics", text: "They join the research unit set up in " + set + ".", tags: ["neutral"], lean: -0.4, attr: { democratic: 0.4 },
            apply: function (G) { G.bonus.trust += 0.2; } }
          : { label: "From many schools of economics", text: "A research unit that tests the bank's models against others.", tags: ["neutral"], lean: -0.4, attr: { democratic: 0.4 }, done: "researchUnit",
            apply: function (G) { G.bonus.trust += 0.2; S.game.followUp(G, "research-unit", 3); } },
        { label: "Hire none this year", text: "The budget goes to supervision.", tags: ["neutral"], lean: 0.2, apply: function () {} }
      ];
    }
  });
  S.card("research-unit", {
    title: "The research unit reports", actor: "Directorate General Economics",
    text: function (G, a) { return "The research unit set up in " + a.from + " finds that the bank's models underestimated how much budget cuts reduce output."; },
    options: [
      { label: "Publish it under the bank's name", text: "", tags: ["neutral"], lean: -0.6, attr: { fiscal: 0.6 },
        apply: function (G) { G.bonus.trust += 0.6; rel(G, function (m) { return m.h > 0.3; }, -4); } },
      { label: "Publish it as a staff paper", text: "The views are the authors' own.", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.2; } }
    ]
  });
  S.card("press-question", {
    title: "A question at the press conference", actor: "Press conference",
    variants: [{},
      { text: "After the rate decision a journalist asks whether the bank's rates have made housing too expensive for young people.",
        options: [
          { label: "Answer that housing is for governments", text: "The bank stays within its mandate.", tags: ["neutral"], lean: 0, attr: { democratic: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } },
          { label: "Call for stricter limits on mortgages", text: "Lower loan-to-value limits in states where prices rise fastest.", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 }, apply: function (G) { G.bonus.trust += 0.2; } },
          { label: "Call for public housing", text: "", tags: ["neutral"], lean: -0.6, attr: { public: 1, fiscal: 0.6 },
            apply: function (G) { G.bonus.trust += 0.3; rel(G, function (m) { return m.h > 0.3; }, -3); } }
        ] },
      { text: "After the rate decision a journalist asks whether a member state could leave the euro.",
        options: [
          { label: "Answer that the euro is irreversible", text: "", tags: ["neutral"], lean: 0.2, attr: { discipline: 0.4 }, apply: function (G) { G.bonus.backstop += 0.01; } },
          { label: "Answer that it is for each state's citizens", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 1 }, apply: function (G) { G.bonus.backstop -= 0.01; G.bonus.trust += 0.2; } },
          { label: "Decline to answer", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
        ] }],
    text: function (G) { return "After the rate decision a journalist asks whether governments in the euro area spend too much. The answer will lead the news" + (G.year >= 2041 ? " in every member state." : " in several capitals."); },
    options: [
      { label: "Answer that it is for governments", text: "The bank stays within its mandate.", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Call for lower deficits", text: "", tags: ["neutral"], lean: 1, attr: { discipline: 1 },
        apply: function (G) { rel(G, function (m) { return m.h > 0.3; }, 4); G.bonus.far += 0.2; } },
      { label: "Call for public investment", text: "", tags: ["neutral"], lean: -0.8, attr: { fiscal: 1 },
        apply: function (G) { rel(G, function (m) { return m.h > 0.3; }, -4); if (G.proposals.eibPlan) { G.proposals.eibPlan.support = Math.min(100, G.proposals.eibPlan.support + 3); } } }
    ]
  });
  S.card("court-case", {
    title: "A case at the Court of Justice", actor: "Court of Justice",
    once: true,
    when: function (G) { return G.year >= 2012; },
    text: "A group of citizens asks the Court of Justice to rule that the bank's collateral rules favor some member states over others.",
    options: [
      { label: "Defend the rules in court", text: "The ruling comes in two years.", tags: ["neutral"], lean: 0.2, apply: function (G) { S.game.followUp(G, "court-ruling", 2); } },
      { label: "Publish the reasons for the rules", text: "The group withdraws the case.", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.4; } }
    ]
  });
  S.card("court-ruling", {
    title: "The Court rules", actor: "Court of Justice",
    text: function (G, a) { return "The Court of Justice rules on the case brought in " + a.from + ": the collateral rules are lawful, but the bank must publish how it sets them."; },
    options: [
      { label: "Publish the method", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.5; } },
      { label: "Publish the minimum the ruling asks", text: "", tags: ["neutral"], lean: 0.4, apply: function () {} }
    ]
  });
  S.card("climate-reporting", {
    title: "Banks' climate reports", actor: "Supervisory Board",
    variants: [{},
      { text: "The extra time given to banks has passed. Half of the supervised banks still report their loans to coal, oil and gas firms only in part." },
      { text: "A study by the bank's staff finds that banks' loans to coal, oil and gas firms are a third larger than the banks report." }],
    settled: function (G) { return G.flags["done:climateReports"]; },
    when: function (G) { return G.year >= 2016; },
    text: "Most supervised banks report their loans to coal, oil and gas firms only in part.",
    options: [
      { label: "Require full reports", text: "Banks that do not comply pay a fine.", tags: ["neutral"], lean: 0.2, attr: { green: 1.2 }, done: "climateReports",
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 0.5; } },
      { label: "Give the banks two more years", text: "", tags: ["neutral"], lean: 0, attr: { green: -0.4 }, apply: function () {} }
    ]
  });
  S.card("cash-shortage", {
    title: "Not enough cash", actor: "National central banks",
    variants: [{},
      { text: "Before Christmas, several national central banks run short of 20-euro notes." },
      { text: "A strike at a cash transport firm leaves cash machines empty in two member states for a week.",
        options: [
          { label: "Send notes from other central banks", text: "", tags: ["neutral"], lean: 0, attr: { public: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; } },
          { label: "Leave it to the banks", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.2; } }
        ] }],
    text: "Before the summer, cash machines in several tourist regions run out of banknotes for days.",
    options: [
      { label: "Print and send more notes", text: "", tags: ["neutral"], lean: 0, attr: { public: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Leave it to the banks", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.2; } }
    ]
  });
  S.card("data-leak", {
    title: "Internal emails leak", actor: "Press",
    variants: [{},
      { title: "A forecast leaks", text: "A newspaper publishes the draft of the staff forecast a week before the rate decision.",
        options: [
          { label: "Publish the forecast at once", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.3; } },
          { label: "Open an internal inquiry", text: "Its findings follow next year.", tags: ["neutral"], lean: 0.2, apply: function (G) { S.game.followUp(G, "leak-findings", 1); } }
        ] },
      { title: "Notes from a dinner leak", text: "A newspaper publishes notes from a dinner of the Governing Council at which governors discussed a member state's government.",
        options: [
          { label: "Publish an account of the dinner", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 1 }, apply: function (G) { G.bonus.trust += 0.3; rel(G, function (m) { return m.c > 0.7; }, -2); } },
          { label: "Open an internal inquiry", text: "Its findings follow next year.", tags: ["neutral"], lean: 0.2, apply: function (G) { S.game.followUp(G, "leak-findings", 1); } }
        ] }],
    text: "A newspaper publishes internal emails in which staff discuss how to answer a government before a Council meeting.",
    options: [
      { label: "Publish the whole exchange", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 1 }, apply: function (G) { G.bonus.trust += 0.4; G.ethics = Math.max(0, (G.ethics || 0) - 0.1); } },
      { label: "Open an internal inquiry", text: "Its findings follow next year.", tags: ["neutral"], lean: 0.2, apply: function (G) { S.game.followUp(G, "leak-findings", 1); } }
    ]
  });
  S.card("leak-findings", {
    title: "The inquiry into the leak", actor: "Ethics Committee",
    text: function (G, a) { return "The inquiry into the emails of " + a.from + " finds no rule broken, but asks for written records of contacts with governments."; },
    options: [
      { label: "Keep the records, and publish them", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 1 }, apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Keep the records internally", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  /* ---------- More quieter items: law, cash and coins, payments, the
     bank's own accounts and staff, supervision, statistics ---------- */
  S.card("law-opinion", {
    title: "A draft national law", actor: "Legal Services",
    once: true,
    text: "A member state asks the bank's opinion on a draft law that lets its finance ministry set the pay of the central bank governor (Art. 127(4) TFEU).",
    options: [
      { label: "Object in a public opinion", text: "The opinion says the law weakens the governor's independence.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 },
        apply: function (G) { G.bonus.trust += 0.3; rel(G, function (m) { return m.c > 0.7; }, 3); } },
      { label: "Ask for changes in private", text: "", tags: ["neutral"], lean: 0, apply: function () {} },
      { label: "No objection", text: "Pay is a matter for the government.", tags: ["neutral"], lean: -0.4, attr: { democratic: 0.4 },
        apply: function (G) { rel(G, function (m) { return m.c > 0.7; }, -3); } }
    ]
  });
  S.card("counterfeits", {
    title: "More false banknotes", actor: "Banknotes Directorate",
    variants: [{},
      { title: "A false-note print shop", text: "Police find a print shop that made false 20-euro notes of high quality for three years.",
        options: [
          { label: "Work with Europol", text: "Shared data and a joint operation against the network.", tags: ["neutral"], lean: 0, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.3; } },
          { label: "Train shop staff", text: "Leaflets and short courses through the national central banks.", tags: ["neutral"], lean: 0.2, apply: function () {} }
        ] },
      { title: "False coins", actor: "European Commission", text: "False 2-euro coins turn up in vending machines in several member states. Coins are issued by the states.",
        options: [
          { label: "Ask the Commission to coordinate checks", text: "", tags: ["neutral"], lean: 0, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.2; } },
          { label: "Leave it to the states", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
        ] }],
    text: "The number of false 50-euro notes found in shops doubled in a year. Most come from one printing operation.",
    options: [
      { label: "Work with Europol", text: "Shared data and a joint operation against the printers.", tags: ["neutral"], lean: 0, attr: { public: 0.4 },
        apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Issue a new 50-euro note sooner", text: "More security features, at a higher printing cost.", tags: ["neutral"], lean: -0.2, done: "new50",
        apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Train shop staff", text: "Leaflets and short courses through the national central banks.", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("banknote-design", {
    title: "New banknote designs", actor: "Banknotes Directorate",
    once: true,
    when: function (G) { return G.year >= 2021; },
    text: "The next series of euro banknotes needs a theme. A panel has proposed two.",
    options: [
      { label: "European culture", text: "Writers, composers and scientists from every member state.", tags: ["neutral"], lean: 0, attr: { public: 0.4 },
        apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Rivers and birds", text: "Rivers and birds found in several member states.", tags: ["neutral"], lean: 0, attr: { green: 0.4 },
        apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Let the public vote", text: "An online vote open to all residents of the euro area.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.8 },
        apply: function (G) { G.bonus.trust += 0.5; } }
    ]
  });
  S.card("small-coins", {
    title: "The 1 and 2 cent coins", actor: "European Commission",
    once: true,
    text: "The Commission asks the bank's opinion on ending the 1 and 2 cent coins. Each costs more to make than it is worth; prices would be rounded to 5 cents at the till.",
    options: [
      { label: "Support rounding", text: "", tags: ["neutral"], lean: 0, apply: function () {} },
      { label: "Keep the coins", text: "Rounding could raise some prices.", tags: ["neutral"], lean: 0.2, attr: { public: 0.4 },
        apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Leave it to each state", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("cash-acceptance", {
    title: "Shops that refuse cash", actor: "Banknotes Directorate",
    once: true,
    when: function (G) { return G.year >= 2018; },
    text: "More shops, cafés and car parks accept cards only. Older people and people without a bank account complain to their national central banks.",
    options: [
      { label: "Ask for a law on cash", text: "Shops would have to accept cash, with exceptions for small firms.", tags: ["neutral"], lean: -0.2, attr: { public: 0.8 },
        apply: function (G) { G.bonus.trust += 0.5; } },
      { label: "Publish a recommendation", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Leave it to the market", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.3; } }
    ]
  });
  S.card("instant-payments", {
    title: "Payments in ten seconds", actor: "Market Infrastructure",
    once: true,
    when: function (G) { return G.year >= 2017; },
    text: "The bank can run a service that settles payments between people within ten seconds, at any hour. Banks would have to join it.",
    options: [
      { label: "Build it and require it", text: "All banks join within three years.", tags: ["neutral"], lean: -0.4, attr: { public: 1 },
        apply: function (G) { G.bonus.trust += 0.4; rel(G, function (m) { return m.h > 0.3; }, -2); } },
      { label: "Build it and let banks choose", text: "", tags: ["neutral"], lean: 0, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Leave it to private firms", text: "", tags: ["neutral"], lean: 0.6, apply: function () {} }
    ]
  });
  S.card("stablecoin", {
    title: "A private digital coin", actor: "Market Infrastructure",
    once: true,
    when: function (G) { return G.year >= 2019; },
    text: "A large technology firm plans a digital coin backed by euro deposits, for use by its two billion users.",
    /* The second option follows the digital euro decision of 2025 */
    options: function (G) {
      var pub = G.year < 2025
        ? { label: "Prepare a digital euro sooner", text: "The digital euro is ready a year earlier." }
        : G.flags.digitalEuro
          ? { label: "Promote the digital euro", text: "Public money for the same payments, free of charge." }
          : { label: "Ask legislators again for a digital euro", text: "" };
      return [
        { label: "Ask for strict EU rules", text: "Reserves held at the central bank, a cap on the amount in use.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 },
          apply: function (G) { G.bonus.trust += 0.3; } },
        { label: pub.label, text: pub.text, tags: ["neutral"], lean: -0.4, attr: { public: 0.8 },
          apply: function (G) { G.bonus.trust += 0.2; } },
        { label: "No action for now", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
      ];
    }
  });
  S.card("annual-accounts", {
    essential: true,
    title: "The bank's accounts show a loss", actor: "Executive Board",
    variants: [{},
      { title: "A second loss", text: "The bank's accounts show a loss again. A member of the Parliament asks whether the member states will have to cover it.",
        options: [
          { label: "Explain that they will not", text: "The bank covers the loss from its future income.", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; } },
          { label: "Cover it from the bank's provisions", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
        ] },
      { title: "Profits again", text: "The losses of past years are covered, and the bank makes a profit again.",
        options: [
          { label: "Pay it to the national central banks", text: "They pass it on to their governments.", tags: ["neutral"], lean: -0.2, attr: { fiscal: 0.4 }, apply: function (G) { G.bonus.trust += 0.2; } },
          { label: "Keep it as a buffer", text: "", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 }, apply: function () {} }
        ] }],
    when: function (G) { return G.year >= 2016 && G.pol.rate >= 2; },
    text: "With higher interest rates, the bank pays more interest on bank deposits than it earns on the bonds it bought at low yields. This year's accounts show a loss.",
    options: [
      { label: "Explain it in public", text: "A loss does not limit what a central bank can do; profits in later years cover it.", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 },
        apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Publish the accounts without comment", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.2; } },
      { label: "Pay less interest on deposits", text: "Part of the reserves earns no interest. Banks object.", tags: ["neutral"], lean: -0.4, vote: true, onFail: 1, done: "tiering",
        apply: function (G) { rel(G, function (m) { return m.h > 0.3; }, -3); } }
    ]
  });
  S.card("staff-pay", {
    title: "Staff protest over pay", actor: "Staff union",
    variants: [{},
      { title: "A pay review", text: "The staff union asks for staff pay to be reviewed each year by an outside body.",
        options: [
          { label: "Agree to an outside review", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 }, apply: function () {} },
          { label: "Keep the review internal", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.1; } }
        ] },
      { title: "Long hours in supervision", text: "Sick leave among supervisors rose by a third in two years. The staff union links it to long hours.",
        options: [
          { label: "Hire more supervisors", text: "", tags: ["neutral"], lean: 0, apply: function () {} },
          { label: "Limit overtime", text: "Some inspections take longer.", tags: ["neutral"], lean: 0, attr: { public: 0.2 }, apply: function () {} },
          { label: "No change", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.2; } }
        ] }],
    text: "The staff union calls a two-hour stoppage. Pay rose less than prices for two years, and many posts are filled on short contracts.",
    options: [
      { label: "Raise pay with prices", text: "", tags: ["neutral"], lean: -0.2, apply: function (G) { G.bonus.trust -= 0.1; } },
      { label: "Fewer short contracts", text: "Permanent posts for staff with three years of service.", tags: ["neutral"], lean: 0, attr: { public: 0.4 }, done: "contracts", apply: function () {} },
      { label: "Keep the budget", text: "The press reports the stoppage.", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.3; } }
    ]
  });
  S.card("own-emissions", {
    title: "The bank's own emissions", actor: "Executive Board",
    once: true,
    when: function (G) { return G.year >= 2019; },
    text: "Staff travel, the buildings in Frankfurt and the printing of banknotes give off about 30 000 tonnes of carbon dioxide a year.",
    options: [
      { label: "Halve them by 2030", text: "Fewer flights, renewable power, recycled cotton for the notes.", tags: ["neutral"], lean: 0, attr: { green: 0.8 },
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 0.3; } },
      { label: "Report them each year", text: "", tags: ["neutral"], lean: 0, attr: { green: 0.2 }, apply: function () {} }
    ]
  });
  S.card("climate-stress", {
    title: "A climate stress test", actor: "Supervisory Board",
    once: true,
    when: function (G) { return G.year >= 2020; },
    text: "The bank can test how supervised banks would cope with floods, droughts and a quick rise in carbon prices.",
    options: [
      { label: "Test all banks and publish", text: "", tags: ["neutral"], lean: 0.2, attr: { green: 1 },
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 0.4; G.bonus.trust += 0.2; } },
      { label: "Test the largest banks", text: "Results stay with the supervisors.", tags: ["neutral"], lean: 0, attr: { green: 0.4 }, apply: function () {} },
      { label: "Wait for better data", text: "", tags: ["neutral"], lean: 0.2, attr: { green: -0.4 }, apply: function () {} }
    ]
  });
  S.card("cyber-test", {
    title: "A cyberattack exercise", actor: "Supervisory Board",
    variants: [{},
      { title: "An attack on a central bank", text: "Attackers entered the systems of a national central bank and read staff emails for three weeks.",
        options: [
          { label: "Publish what happened", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.2; } },
          { label: "Common defences for every central bank", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.1; } }
        ] },
      { title: "An attack on a cloud provider", text: "A cloud provider used by many banks is attacked, and one large bank loses customer data.",
        options: [
          { label: "Ask for EU rules on cloud providers", text: "", tags: ["neutral"], lean: 0.2, attr: { discipline: 0.4 }, apply: function (G) { G.bonus.trust += 0.2; } },
          { label: "Leave it to national authorities", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
        ] }],
    when: function (G) { return G.year >= 2018; },
    text: "In an exercise, a simulated attack stops the payments of a large bank for two days. A third of the banks tested could not restore their systems in time.",
    options: [
      { label: "Set deadlines for the banks", text: "Banks that miss them hold more capital.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 },
        apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Publish the results by name", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 },
        apply: function (G) { G.bonus.trust += 0.2; rel(G, function (m) { return m.c > 0.7; }, -2); } },
      { label: "Repeat the test next year", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
    ]
  });
  S.card("dividends", {
    title: "Bank dividends", actor: "Supervisory Board",
    variants: [{},
      { title: "Share buybacks", text: "Supervised banks plan to buy back their own shares with most of this year's profits." },
      { title: "A tax on bank profits", actor: "Legal Services",
        text: function (G) { return (G.pol.rate >= 2 ? "Higher interest rates lift bank profits to a record. " : "Bank profits grow while wages stand still. ") + "Several governments plan a tax on bank profits and ask the bank's opinion."; },
        options: [
          { label: "Raise no objection", text: "Taxes are for governments.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 }, apply: function (G) { G.bonus.trust += 0.2; } },
          { label: "Ask that banks keep enough capital", text: "", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 }, apply: function () {} }
        ] }],
    when: function (G) { return G.year >= 2015; },
    text: function (G) { return "Supervised banks plan to pay out most of this year's profits to shareholders." + (G.ea.v ? " Unemployment in the euro area is " + G.ea.v.u.toFixed(1) + "%." : ""); },
    options: [
      { label: "Ask banks to keep the profits", text: "More capital for lending in a downturn.", tags: ["neutral"], lean: 0.2, attr: { discipline: 0.4 },
        apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Leave it to the banks", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("bank-merger", {
    title: "A merger across borders", actor: "Supervisory Board",
    variants: [{},
      { title: "A merger at home", text: "Two banks in the same member state plan to merge. The new bank would hold half of the state's deposits.",
        options: [
          { label: "Approve it", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} },
          { label: "Approve with a higher capital charge", text: "A bank this large holds more capital.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } },
          { label: "Delay the decision", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust -= 0.1; } }
        ] },
      { title: "A buyer from outside the EU", text: "A bank from outside the EU wants to buy a supervised bank.",
        options: [
          { label: "Approve it", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} },
          { label: "Approve if it keeps a head office in the EU", text: "", tags: ["neutral"], lean: 0, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } },
          { label: "Refuse", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
        ] }],
    when: function (G) { return G.year >= 2015; },
    text: "A bank in one member state wants to buy a bank in another. The government of the second state opposes the sale.",
    options: [
      { label: "Approve it", text: "Supervisors judge only the capital and the risks.", tags: ["neutral"], lean: 0.2, attr: { discipline: 0.4 },
        apply: function (G) { rel(G, function (m) { return m.c > 0.7; }, 2); } },
      { label: "Approve with conditions", text: "Jobs and lending in the second state are kept for five years.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 },
        apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Delay the decision", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust -= 0.1; } }
    ]
  });
  S.card("money-laundering", {
    title: "Money laundering at a bank", actor: "Supervisory Board",
    once: true,
    when: function (G) { return G.year >= 2015; },
    text: "A small bank moved several billion euro for clients from outside the EU without the checks the law requires. National authorities did not act.",
    options: [
      { label: "Withdraw the licence", text: "The bank closes; deposits up to 100 000 euro are protected.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.6 },
        apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Call for an EU authority", text: "One authority for money laundering checks in every member state.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 },
        apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Leave it to the national authority", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.3; } }
    ]
  });
  S.card("housing-costs", {
    title: "Housing in the price index", actor: "Directorate General Statistics",
    once: true,
    when: function (G) { return G.year >= 2018; },
    text: "The price index leaves out the cost of owning a home. Staff estimate that including it would add 0.2 to 0.3 points to inflation.",
    options: [
      { label: "Ask Eurostat to include it", text: "The change takes several years.", tags: ["neutral"], lean: 0.2, attr: { public: 0.4 },
        apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Publish a separate measure", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Keep the index as it is", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
    ]
  });
  S.card("data-revision", {
    title: "Growth figures revised", actor: "Directorate General Statistics",
    variants: [{},
      { title: "Inflation figures revised", text: "Eurostat revises last year's inflation up by 0.3 points. The bank's last rate decision was based on the old figure." },
      { title: "Deficit figures revised", text: "A member state's statistics office revises its deficits for the past three years upward by a point of output." }],
    text: "Eurostat revises last year's growth down by half a point. The bank's forecasts, and the reasons for its last rate decision, were based on the old figures.",
    options: [
      { label: "Explain the effect in public", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Update the forecasts quietly", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("trust-survey", {
    title: "A survey on trust", actor: "European Commission",
    variants: [{},
      { text: "A survey finds that most people in the euro area cannot say what the bank does." },
      { text: function (G) { return "The Eurobarometer survey puts trust in the bank at " + Math.round(G.ea.v ? G.ea.v.trust : 40) + "%. Among people under 25 it is lower."; } }],
    text: function (G) { return "The Eurobarometer survey puts trust in the bank at " + Math.round(G.ea.v ? G.ea.v.trust : 40) + "%. In several member states fewer than a third of people trust it."; },
    settled: function (G) { return G.flags["done:meetings"] && G.flags["done:plainText"]; },
    options: [
      { label: "Hold public meetings", text: "Meetings with citizens, unions and firms in every member state.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.8 }, done: "meetings",
        apply: function (G) { G.bonus.trust += 0.5; } },
      { label: "Write in simpler language", text: "Short summaries of each decision for the general public.", tags: ["neutral"], lean: 0, attr: { public: 0.4 }, done: "plainText",
        apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "No change", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("hearing", {
    title: "A hearing in the Parliament", actor: function (G) { return G.year >= 2041 ? "Federal Parliament" : "European Parliament"; },
    variants: [{},
      /* The accounts of the Council's meetings exist only once the bank
         publishes them (the item "meeting-accounts") */
      { text: function (G) {
          return "At the quarterly hearing in the Parliament's economic committee, a member asks why " +
            (G.flags["done:meetingAccounts"] ? "the accounts of the Council's meetings appear four weeks later." : "the bank answers the committee's written questions only after six weeks.");
        },
        options: function (G) {
          var acc = !!G.flags["done:meetingAccounts"];
          return [
            { label: acc ? "Publish them after two weeks" : "Answer within three weeks", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.6 }, apply: function (G2) { G2.bonus.trust += 0.2; } },
            { label: acc ? "Keep four weeks" : "Keep six weeks", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
          ];
        } },
      { text: "At the quarterly hearing, a member asks the president to publish the diary of meetings with bankers.",
        options: [
          { label: "Publish the diaries of the whole Board", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.3; } },
          { label: "Publish the president's diary", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } }
        ] }],
    text: "At the quarterly hearing in the Parliament's economic committee, a member asks why the bank publishes no record of how each governor voted.",
    options: [
      { label: "Publish the votes after five years", text: "", tags: ["neutral"], lean: -0.4, attr: { democratic: 1 }, done: "votes",
        apply: function (G) { G.bonus.trust += 0.4; rel(G, function (m) { return m.c > 0.7; }, -3); } },
      { label: "Defend secret votes", text: "Governors vote for the euro area, without pressure from home.", tags: ["neutral"], lean: 0.4,
        apply: function (G) { rel(G, function (m) { return m.c > 0.7; }, 2); } }
    ]
  });
  S.card("new-building", {
    title: "The new building", actor: "Executive Board",
    once: true,
    /* The cost was known from 2013; the building opened in 2015 */
    when: function (G) { return G.year >= 2013 && G.year <= 2016; },
    text: "The bank's new offices in Frankfurt cost about 1.3 billion euro, half as much again as planned. The European Court of Auditors asks why.",
    options: [
      { label: "Publish the full costs", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Answer the auditors only", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.1; } }
    ]
  });
  S.card("student-contest", {
    title: "A contest for schools", actor: "Communications",
    once: true,
    /* The contest began in 2011 */
    when: function (G) { return G.year >= 2011; },
    text: "Each year, teams of secondary school students set the euro area's interest rate in a contest run by the bank and the national central banks.",
    options: [
      { label: "Open it to every member state", text: "", tags: ["neutral"], lean: 0, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Keep it as it is", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
    ]
  });
  /* ---------- More of the bank's routine work, each with several versions,
     so a broad area of responsibility has enough to fill a calm year ---------- */
  function someState(G, salt) {
    var list = M.members(G).slice().sort();
    return list.length ? { code: list[(G.year * 7 + salt) % list.length] } : null;
  }
  S.card("draft-law", {
    title: function (G, a) { return "A draft law in " + name(a.code); }, actor: "Legal Services",
    pick: function (G) { return someState(G, 3); },
    focus: function (G, a) { return a.code; },
    variants: [
      { text: function (G, a) { return "The government of " + name(a.code) + " plans a special tax on bank profits and asks the bank's opinion, as member states must before a law on banks."; },
        options: [
          { label: "No objection, if banks keep enough capital", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 }, apply: function () {} },
          { label: "Warn that it may cut lending", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.4 }, apply: function () {} }
        ] },
      { text: function (G, a) { return "A draft law in " + name(a.code) + " would make banks cut the rates on old mortgages. The bank is asked for its opinion."; },
        options: [
          { label: "Object: contracts should hold", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 }, apply: function (G) { G.bonus.trust -= 0.1; } },
          { label: "Ask for help paid by the state", text: "Relief for households in difficulty, without changing every contract.", tags: ["neutral"], lean: -0.2, attr: { fiscal: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } }
        ] },
      { text: function (G, a) { return "The parliament of " + name(a.code) + " debates a law to use part of its central bank's reserves for the budget. Art. 123 TFEU forbids central banks to finance governments."; },
        options: [
          { label: "Object in a public opinion", text: "", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } },
          { label: "Ask for changes in private", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
        ] },
      { text: function (G, a) { return name(a.code) + " plans a limit on cash payments above 3 000 euro and asks the bank's opinion."; },
        options: [
          { label: "Accept a limit of 10 000 euro", text: "", tags: ["neutral"], lean: 0, apply: function () {} },
          { label: "Object: cash is legal tender", text: "", tags: ["neutral"], lean: 0.2, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } }
        ] }
    ]
  });
  S.card("state-visit", {
    title: function (G, a) { return "A visit to " + name(a.code); }, actor: "Communications",
    pick: function (G) { return someState(G, 11); },
    focus: function (G, a) { return a.code; },
    variants: [
      { text: function (G, a) { return "The president visits " + name(a.code) + ". The national parliament invites the president to a hearing."; } },
      { text: function (G, a) { return "The president visits " + name(a.code) + ". Unions ask for a meeting on wages and prices."; } },
      { text: function (G, a) { return "The president visits " + name(a.code) + " to open a school programme on money and prices."; } }
    ],
    options: [
      { label: "Speak to the national parliament", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Meet unions and employers", text: "", tags: ["neutral"], lean: -0.2, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Meet the government only", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("reserves", {
    title: "Minimum reserves", actor: "Market Operations",
    variants: [
      { text: function (G) { return "Banks must hold " + (G.year >= 2012 ? "1% of their deposits at the bank (2% before 2012)" : "2% of their deposits at the bank") + ". A national central bank proposes to raise the ratio to reduce the money banks hold beyond it."; } },
      { text: function (G) {
        return G.year >= 2024 ? "Since September 2023 the bank has paid no interest on the reserves banks must hold. Banks ask for the interest back; they say the rule now works as a tax on them." :
          "The bank pays interest on the reserves banks must hold. A member of the Parliament asks why banks earn interest on money they must deposit by law.";
      } },
      { text: "The bank pays interest on the deposits governments keep with national central banks. Staff propose to lower it so governments keep their money in the market." }
    ],
    options: [
      { label: "Change the rule", text: "", tags: ["neutral"], lean: 0.4, vote: true, onFail: 1, apply: function (G) { rel(G, function (m) { return m.h > 0.3; }, 2); } },
      { label: "Keep the rule", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
    ]
  });
  S.card("loan-data", {
    title: "New data from banks", actor: "Directorate General Statistics",
    when: function (G) { return G.year >= 2014; },
    variants: [
      { text: function (G) { return "Staff propose to collect the details of every loan to a firm above 25 000 euro" + (G.year > 2018 ? ", as the historical bank did from 2018 (AnaCredit)" : "") + ". Small banks object to the cost."; } },
      { text: "Staff propose that banks report the energy use of the buildings their mortgages finance." },
      { text: "Staff propose to collect data on card and phone payments, to follow spending week by week." }
    ],
    options: [
      { label: "Collect it", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Start with the largest banks", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} },
      { label: "Drop the plan", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("own-portfolio", {
    title: "The bank's own investments", actor: "Executive Board",
    variants: [
      { text: "The staff pension fund holds shares in coal and oil firms. Staff ask that it sell them." },
      { text: "The bank's own funds portfolio is invested in government bonds. Staff propose to put part of it in green bonds of the EU and the EIB." },
      { text: function (G) { return "When the bank buys bonds of firms, it buys them in proportion to the market. Staff propose to favor firms with lower emissions" + (G.year > 2022 ? ", as the historical bank did from 2022." : "."); } }
    ],
    options: [
      { label: "Make the change", text: "", tags: ["neutral"], lean: -0.2, attr: { green: 0.8 }, apply: function (G) { G.flags.green = (G.flags.green || 0) + 0.2; } },
      { label: "Keep the rules", text: "", tags: ["neutral"], lean: 0.2, attr: { green: -0.2 }, apply: function () {} }
    ]
  });
  S.card("supervision-priorities", {
    title: "Supervisory priorities", actor: "Supervisory Board",
    when: function (G) { return G.year >= 2015; },
    variants: [
      { text: "The Supervisory Board sets the priorities for the next three years. Staff propose bad loans and the loans to commercial property." },
      { text: "The Supervisory Board sets its priorities. Staff propose the banks' old computer systems and their reliance on a few cloud providers." },
      { text: "The Supervisory Board sets its priorities. Staff propose the boards of banks, where few members are women and few know information technology." }
    ],
    options: [
      { label: "Adopt the staff proposal", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Prioritize climate risk", text: "", tags: ["neutral"], lean: 0, attr: { green: 0.6 }, apply: function () {} }
    ]
  });
  S.card("swap-line", {
    title: "A request for euro", actor: "Central banks outside the euro area",
    variants: [
      { text: function (G) {
          return G.year >= 2041 ? "The central bank of a European state outside the Federation asks for a line to borrow euro against its own currency." :
            "The central bank of an EU state outside the euro area asks for a line to borrow euro against its own currency, as Hungary and Poland received in 2008.";
        } },
      { text: function (G) {
          var balkans = ["ME", "AL", "RS", "MK", "BA", "XK"].some(function (k) { return !S.game.inEU(G, k); });
          return "The central bank of " + (balkans ? "a Western Balkan state" : "a state outside the EU") + ", where most loans are in euro, asks for a line to borrow euro.";
        } },
      { text: function (G) {
          return "A large central bank outside Europe proposes a permanent line to swap currencies with the bank, " +
            (G.year > 2013 ? "as with the People's Bank of China from 2013." : "as the US Federal Reserve has had with the bank since 2007.");
        } }
    ],
    options: [
      { label: "Open the line", text: "", tags: ["neutral"], lean: -0.2, apply: function (G) { G.bonus.backstop += 0.005; } },
      { label: "Open it against collateral in euro", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} },
      { label: "Refuse", text: "", tags: ["neutral"], lean: 0.4, apply: function () {} }
    ]
  });
  S.card("euro-abroad", {
    title: "The euro outside the EU", actor: "European Commission",
    when: function (G) { return G.year < 2041; },
    variants: [
      /* A state the run assumes will join the EU has its own items from
         two years before it joins (S.ACCESSION), so this one speaks of
         another state */
      { text: function (G) {
          return near(G, "ME") ? "San Marino asks to revise its monetary agreement so its banks may borrow from the bank." :
            "Montenegro has used the euro since 2002 without an agreement with the EU. It asks for one.";
        } },
      { text: function (G) {
          return G.year >= 2011 ? "Andorra, which signed a monetary agreement in 2011, asks for more time to apply the EU's rules on banks that the agreement requires." :
            "Andorra asks for a monetary agreement to issue its own euro coins, as Monaco, San Marino and the Vatican do.";
        } },
      { text: function (G) {
          return near(G, "XK") ? "A state outside the EU whose currency is fixed to the euro asks for its banks to have access to the euro area's payment system." :
            "Kosovo, which uses the euro, asks for its banks to have access to the euro area's payment system.";
        } }
    ],
    options: [
      { label: "Support the request", text: "", tags: ["neutral"], lean: -0.2, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Ask for banking rules first", text: "", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 }, apply: function () {} }
    ]
  });
  S.card("ethics-rules", {
    title: "Ethics rules", actor: "Ethics Committee",
    variants: [
      { text: "A member of the Executive Board who left last year now works for a bank the bank supervises. The Ethics Committee proposes a longer wait before such a move." },
      { text: "A governor bought shares of a bank a week before a decision that raised their price. The governor says it was a fund managed by others." },
      { text: "The Ethics Committee proposes to publish every gift and invitation above 50 euro received by members of the Board." }
    ],
    options: [
      { label: "Adopt stricter rules", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Keep the current rules", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.2; } }
    ]
  });
  S.card("council-diversity", {
    title: "Women in the Governing Council", actor: function (G) { return G.year >= 2041 ? "Federal Parliament" : "European Parliament"; },
    /* Only while women are fewer than a third of the Council; the text
       counts them */
    when: function (G) { return S.council.women(G) * 3 < (G.council || []).length; },
    variants: [
      { text: function (G) { return S.council.women(G) + " of the " + G.council.length + " members of the Governing Council are women. The Parliament asks the bank to pressure governments to name more women governors."; } },
      { text: function (G) { return "The Parliament delays its opinion on a candidate for the Executive Board because the shortlist held no women" + (G.year > 2012 ? ", as it did in 2012" : "") + ". Women hold " + S.council.women(G) + " of the Council's " + G.council.length + " seats."; },
        options: [
          { label: "Ask governments for shortlists with women on them", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.2; } },
          { label: "Leave it to the Parliament and the governments", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
        ] },
      { text: "Staff ask for targets for women in senior posts at the bank.",
        options: [
          { label: "Set targets for senior posts", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 }, apply: function (G) { G.bonus.trust += 0.2; } },
          { label: "No targets", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
        ] }
    ],
    options: [
      { label: "Pressure governments to name more women", text: "At the next appointments, a state with a woman among its candidates names her.", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.6 }, done: "womenGovernors",
        apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Say appointments are for governments", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("blind-users", {
    title: "Banknotes for blind people", actor: "European Blind Union",
    variants: [
      { text: function (G) { return "Blind people find " + (G.year >= 2013 ? "the notes of the new series" : "some of the notes") + " hard to tell apart. The European Blind Union asks for stronger raised marks."; } },
      { text: "The European Blind Union asks the bank for a free phone app that reads banknotes aloud." },
      { text: "Older people in rural areas say they can no longer find cash machines nearby." }
    ],
    options: [
      { label: "Make the change", text: "", tags: ["neutral"], lean: -0.2, attr: { public: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Study it first", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
    ]
  });
  S.card("research-conference", {
    title: "A research conference", actor: "Directorate General Research",
    variants: [
      { text: "The bank holds its yearly research conference. Which question leads it?" },
      { text: "The bank's research network on household finance plans its next survey. Which question leads it?" },
      { text: "The bank's research department sets its programme for the next two years. Which question leads it?" }
    ],
    options: [
      { label: "How inequality changes the effect of rates", text: "", tags: ["neutral"], lean: -0.2, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "How climate change affects prices", text: "", tags: ["neutral"], lean: 0, attr: { green: 0.6 }, apply: function () {} },
      { label: "How budget rules affect growth", text: "", tags: ["neutral"], lean: 0, attr: { fiscal: 0.4 }, apply: function () {} }
    ]
  });
  /* ---------- Crisis items: they fill a crisis year, and each fits a kind
     of crisis (S.game.crisisKinds). A crisis item that names a state picks
     the one in the worst position. ---------- */
  function kinds(G) { return G.kinds || S.game.crisisKinds(G); }
  function worst(G, test, score) {
    var best = null, bs = -1e9;
    M.members(G).forEach(function (k) { if (test(k)) { var v = score(k); if (v > bs) { bs = v; best = k; } } });
    return best;
  }
  function bankOf(G, k) { var v = G.c[k].v || {}; return v.bank == null ? 100 : v.bank; }
  function spreadOf(G, k) { return G.year < 2041 ? M.expectedSpread(G, k) : 0; }
  function weakBank(G, limit) {
    var k = worst(G, function (c) { return bankOf(G, c) < limit; }, function (c) { return -bankOf(G, c); });
    return k ? { code: k } : null;
  }
  function conf(G, n) { if (G.parl) { G.parl.conf = Math.max(0, Math.min(100, G.parl.conf + n)); } }
  function parl(G) { return G.year >= 2041 ? "the Federal Parliament" : "the European Parliament"; }
  function meps(G) { return G.year >= 2041 ? "Members of the Federal Parliament" : "Members of the European Parliament"; }
  /* Whether a state the run assumes will join the EU has its own items by now */
  function near(G, k) { return !!G.c[k] && G.year >= S.ACCESSION[k].eu - 2; }
  S.card("ela-request", {
    essential: true,
    title: function (G, a) { return "Emergency liquidity for " + name(a.code); }, actor: function (G, a) { return "Central bank of " + name(a.code); },
    pick: function (G) { return G.pol.ela && Object.keys(G.pol.ela).length > 6 ? null : weakBank(G, 50); },
    focus: function (G, a) { return a.code; },
    variants: [
      { text: function (G, a) { return "The central bank of " + name(a.code) + " plans emergency liquidity (ELA) for two of its banks that can no longer pledge enough collateral. It lends at its own risk. Two thirds of the Governing Council can restrict it (ECB Statute, Art. 14.4)."; } },
      { text: function (G, a) { return "Savers keep leaving the banks of " + name(a.code) + ", and its central bank asks the Governing Council to raise the ceiling on emergency liquidity. Two thirds of the Council can refuse."; } },
      { text: function (G, a) { return "The central bank of " + name(a.code) + " asks to extend its emergency liquidity for six more months. Two thirds of the Governing Council can refuse."; } }
    ],
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "Raise no objection", text: "The banks keep their deposits paid out.", tags: ["neutral"], lean: -0.4, help: 0.6,
          apply: function (G2) { G2.pol.ela[k] = "open"; G2.pol.elaOpen = true; G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) + 4; } },
        { label: "Allow it for three months, then review", text: "", tags: ["neutral"], lean: 0.2,
          apply: function (G2) { G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) + 2; } },
        { label: "Restrict the lending", text: "Needs two thirds of the Governing Council. Some of the banks may have to close.", tags: ["neutral"], lean: 1.2, attr: { discipline: 1 }, vote: true, rule: "restrict", onFail: 0,
          apply: function (G2) { G2.pol.ela[k] = "capped"; G2.c[k].exitRisk = Math.min(1, G2.c[k].exitRisk + 0.1); } }
      ];
    }
  });
  S.card("bank-run", {
    essential: true,
    title: function (G, a) { return "Savers leave the banks of " + name(a.code); }, actor: "Banks, savers",
    pick: function (G) { return weakBank(G, 40); },
    focus: function (G, a) { return a.code; },
    variants: [
      { text: function (G, a) { return "Queues form at cash machines in " + name(a.code) + ". In a week, savers took out about a tenth of their deposits. Deposits up to " + (G.year >= 2011 ? "100 000" : "50 000") + " euro are guaranteed by national schemes."; } },
      { text: function (G, a) { return "Firms in " + name(a.code) + " move their accounts to banks in other member states. The outflow forms no queues, and it is larger than the queues at cash machines would show."; } },
      { text: function (G, a) { return "In " + name(a.code) + " a rumour on social media sends savers to the cash machines of one bank."; } }
    ],
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "State that insured deposits are safe", text: "", tags: ["neutral"], lean: 0, apply: function (G2) { G2.bonus.trust += 0.3; G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) + 2; } },
        { label: "Call for common deposit insurance", text: "One scheme for the whole euro area, so a guarantee does not depend on one state's budget.", tags: ["neutral"], lean: -0.4, attr: { fiscal: 0.6 },
          apply: function (G2) { if (G2.proposals.depositInsurance) { G2.proposals.depositInsurance.support = Math.min(100, G2.proposals.depositInsurance.support + 5); } G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) + 1; } },
        { label: "Ask the government to limit withdrawals", text: "Capital controls, as in Cyprus in 2013 and Greece in 2015.", tags: ["neutral"], lean: 0.6,
          apply: function (G2) { G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) + 3; G2.c[k].exitRisk = Math.min(1, G2.c[k].exitRisk + 0.05); G2.bonus.trust -= 0.3; } }
      ];
    }
  });
  S.card("bank-rescue", {
    essential: true,
    title: function (G, a) { return "A bank in " + name(a.code) + " needs capital"; }, actor: "Supervisory Board",
    pick: function (G) { return weakBank(G, 45); },
    focus: function (G, a) { return a.code; },
    variants: [
      { text: function (G, a) { return "A large bank in " + name(a.code) + " lost much of its capital on bad loans and cannot raise more from investors." + (G.year >= 2016 ? " Under the EU rules of 2016 its shareholders and bondholders bear losses first (bail-in)." : ""); } },
      { text: function (G, a) { return "A second bank in " + name(a.code) + " fails the stress test. Its bonds are held by many small savers." + (G.year >= 2016 ? " Under the EU rules of 2016 they would bear losses before any public money." : ""); } },
      { text: function (G, a) { return "A savings bank in " + name(a.code) + ", owned by local governments, has lost its capital on loans to builders."; } }
    ],
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "Let the state put in capital", text: "The bank stays open; the state's debt rises.", tags: ["neutral"], lean: -0.2,
          apply: function (G2) { G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) + 5; G2.bonus.far += 0.2; } },
        { label: "Make shareholders and bondholders pay first", text: "Losses follow the order set in law, shares first.", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 },
          apply: function (G2) { G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) + 3; G2.bonus.trust += 0.2; } },
        { label: "Give it a year to raise capital", text: "", tags: ["neutral"], lean: 0.2, apply: function (G2) { G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) - 2; } }
      ];
    }
  });
  S.card("downgrade", {
    essential: true,
    title: function (G, a) { return name(a.code) + " loses its investment grade"; }, actor: "Rating agencies",
    when: function (G) { return G.year < 2041; },
    pick: function (G) {
      var k = worst(G, function (c) { return spreadOf(G, c) > 4 && !G.pol.waiver[c]; }, function (c) { return spreadOf(G, c); });
      return k ? { code: k } : null;
    },
    focus: function (G, a) { return a.code; },
    variants: [
      { text: function (G, a) { return "A rating agency cuts the bonds of " + name(a.code) + " below investment grade. Under the normal rules, banks can no longer pledge them for the bank's loans." + (G.year > 2010 ? " In May 2010 the historical bank set the rule aside for Greece." : ""); } },
      { text: function (G, a) { return "A second agency cuts " + name(a.code) + "'s rating. Banks in the state hold most of its bonds and pledge them for the bank's loans."; } },
      { text: function (G, a) { return "The last agency that kept " + name(a.code) + " at investment grade cuts it too."; } }
    ],
    options: function (G, a) {
      var k = a.code;
      return [
        { label: "Keep accepting its bonds", text: "The rating rule is set aside for this state until further notice.", tags: ["neutral"], lean: -0.6, help: 0.8,
          apply: function (G2) { G2.pol.waiver[k] = true; } },
        { label: "Apply the normal rules", text: "Its banks lose access to the bank's loans; its spread rises.", tags: ["neutral"], lean: 0.8, attr: { discipline: 0.8 },
          apply: function (G2) { G2.c[k].bankBonus = (G2.c[k].bankBonus || 0) - 4; } }
      ];
    }
  });
  S.card("short-selling", {
    title: "Bets against government bonds", actor: "Markets",
    once: true,
    when: function (G) { return G.year >= 2009 && G.year < 2041 && kinds(G).debt; },
    text: "Funds buy credit default swaps on the bonds of states under pressure without holding the bonds, a bet that the state will not pay.",
    options: [
      { label: "Ask for an EU ban", text: "A ban on buying these swaps without the bonds, as the EU adopted in 2012.", tags: ["neutral"], lean: 0.2, attr: { public: 0.4 }, apply: function (G) { G.bonus.backstop += 0.01; G.bonus.trust += 0.2; } },
      { label: "Leave it to the market supervisors", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("youth-jobs", {
    title: function (G, a) { return "Young people without work in " + name(a.code); }, actor: function (G, a) { return "Government of " + name(a.code); },
    pick: function (G) {
      var k = worst(G, function (c) { return (G.c[c].v || {}).u > 12; }, function (c) { return G.c[c].v.u; });
      return k ? { code: k } : null;
    },
    focus: function (G, a) { return a.code; },
    variants: [
      { text: function (G, a) { return "Unemployment in " + name(a.code) + " is " + pct(G.c[a.code].v.u) + ", and among people under 25 about twice that. Many leave for other member states."; } },
      { text: function (G, a) { return "In " + name(a.code) + " a generation has finished school in a slump. Unemployment is " + pct(G.c[a.code].v.u) + "."; } },
      { text: function (G, a) { return "Young people from " + name(a.code) + " are a large share of those who left for other member states this year. Unemployment there is " + pct(G.c[a.code].v.u) + "."; } }
    ],
    options: [
      { label: "Support a guarantee of work or training", text: "As the EU youth guarantee of 2013, paid from the EU budget.", tags: ["neutral"], lean: -0.6, attr: { fiscal: 0.6, public: 0.4 },
        apply: function (G) { G.bonus.trust += 0.3; rel(G, function (m) { return m.h > 0.3; }, -2); } },
      { label: "Say it is for governments", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.4 }, apply: function () {} },
      { label: "Call for lower wages for young workers", text: "", tags: ["neutral"], lean: 1, attr: { discipline: 1 }, apply: function (G) { G.bonus.trust -= 0.3; G.bonus.far += 0.2; } }
    ]
  });
  S.card("deflation", {
    title: "Falling prices", actor: "Directorate General Economics",
    when: function (G) { return kinds(G).deflation; },
    variants: [
      { text: "Prices fell last year. Firms delay purchases, and debts weigh more as wages stop rising." },
      { text: "Prices fell again. Staff warn that people begin to expect lower prices, which makes the fall last longer." },
      { text: "Prices fall for a third year. Wages are cut in several member states." }
    ],
    options: [
      { label: "Wait for energy prices to recover", text: "", tags: ["neutral"], lean: 0.6, apply: function () {} },
      { label: "Promise low rates for a long time", text: "", tags: ["neutral"], lean: -0.6, apply: function (G) { G.bonus.infl += 0.1; G.bonus.gap += 0.1; } },
      { label: "Call on governments to invest", text: "", tags: ["neutral"], lean: -0.6, attr: { fiscal: 1 },
        apply: function (G) { if (G.proposals.eibPlan) { G.proposals.eibPlan.support = Math.min(100, G.proposals.eibPlan.support + 4); } rel(G, function (m) { return m.h > 0.3; }, -2); } }
    ]
  });
  S.card("price-surge", {
    title: "Wages and prices", actor: "Unions, employers",
    when: function (G) { return kinds(G).prices; },
    variants: [
      { text: function (G) { return "Inflation was " + pct(G.ea.v.p) + " last year. Unions in several states ask for wages tied to prices, as in Belgium, where wages follow the price index by law."; } },
      { title: "Rents and food", text: function (G) { return "Inflation was " + pct(G.ea.v.p) + ". Rents and food rise fastest, and households with low incomes spend most of their money on them."; } },
      { title: "Prices in shops", text: function (G) { return "Inflation was " + pct(G.ea.v.p) + ". Supermarkets raised prices more than their costs, and their profits grew."; } }
    ],
    options: [
      { label: "Warn against tying wages to prices", text: "", tags: ["neutral"], lean: 1, attr: { discipline: 0.8 }, apply: function (G) { G.bonus.infl -= 0.1; G.bonus.trust -= 0.2; } },
      { label: "Say wages are for unions and employers", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function () {} },
      { label: "Support targeted help for households", text: "Help for low incomes, paid by governments, without lowering prices for all.", tags: ["neutral"], lean: -0.4, attr: { fiscal: 0.6 },
        apply: function (G) { G.bonus.trust += 0.3; } }
    ]
  });
  S.card("insurance-gap", {
    title: "Insurers leave the flood zones", actor: "Supervisory Board",
    when: function (G) { return kinds(G).climate; },
    variants: [
      { text: "After the disaster, insurers stop covering homes in the worst-hit regions. Banks there stop giving mortgages." },
      { text: "Insurance premiums in the hottest regions double in a year. Banks ask whether loans there need more capital." },
      { text: "An insurer in a coastal region fails after paying for two disasters in one year." }
    ],
    options: [
      { label: "Call for public reinsurance", text: "A federal scheme that covers the largest losses.", tags: ["neutral"], lean: -0.4, attr: { public: 0.8, green: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Raise capital charges on these loans", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.4, green: 0.4 }, apply: function (G) { G.bonus.gap -= 0.1; } },
      { label: "No action", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.2; } }
    ]
  });
  S.card("farm-loans", {
    title: "Farmers cannot repay", actor: "Banks, farmers",
    when: function (G) { return kinds(G).climate; },
    variants: [
      { text: "After the failed harvest, many farmers cannot repay their loans. Banks ask whether they may give them more time without counting the loans as bad." },
      { text: "A second bad harvest. Small banks in farming regions have a fifth of their loans to farms." },
      { text: "Farm incomes fell for the third year. Banks ask to spread loans to farms over twenty years." }
    ],
    options: [
      { label: "Allow a year's delay", text: "The loans are not counted as bad for a year.", tags: ["neutral"], lean: -0.4, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Apply the normal rules", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 }, apply: function () {} }
    ]
  });
  S.card("rebuild-bonds", {
    title: "Bonds for rebuilding", actor: "Federal government",
    when: function (G) { return kinds(G).climate && G.year >= 2041; },
    variants: [
      { text: "The federal government issues bonds to rebuild the regions hit by the disaster, and asks whether the bank will buy them." },
      { text: "A second issue of rebuilding bonds is due. Investors ask a higher rate than on other federal bonds." },
      { text: "Rebuilding takes longer than planned, and the government plans a third issue of bonds." }
    ],
    options: [
      { label: "Buy them within a yearly cap", text: "", tags: ["neutral"], lean: -0.6, attr: { public: 0.8, green: 0.8 }, apply: function (G) { G.bonus.gap += 0.2; G.bonus.infl += 0.1; conf(G, 3); } },
      { label: "Treat them as any federal bond", text: "", tags: ["neutral"], lean: 0, apply: function () {} },
      { label: "Refuse; it is for the budget", text: "", tags: ["neutral"], lean: 0.8, attr: { discipline: 0.8 }, apply: function (G) { conf(G, -3); } }
    ]
  });
  S.card("relocation-loans", {
    title: "Mortgages on abandoned homes", actor: "Banks, households",
    when: function (G) { return kinds(G).climate; },
    variants: [
      { text: "Emergency laws order some towns to move away from the rivers. Owners still owe mortgages on homes they must leave." },
      { text: "Homes in the coastal towns marked for relocation have lost most of their value. Banks hold the mortgages." },
      { text: "Owners in a relocated town take their bank to court over their mortgages." }
    ],
    options: [
      { label: "Ask for a public fund to buy the loans", text: "", tags: ["neutral"], lean: -0.4, attr: { public: 0.8 }, apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Let banks write them off over ten years", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Apply the normal rules", text: "Owners remain liable.", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 }, apply: function (G) { G.bonus.trust -= 0.4; G.bonus.far += 0.2; } }
    ]
  });
  S.card("river-transport", {
    title: "Low water on the Rhine", actor: "Shipping firms",
    when: function (G) { return kinds(G).climate; },
    variants: [
      { text: function (G) { return "The Rhine is too low for full barges" + (G.year > 2022 ? ", as in the summers of 2018 and 2022" : G.year > 2018 ? ", as in the summer of 2018" : "") + ". Coal, oil and grain move by rail and road at higher cost, and prices rise."; } },
      { text: "The Danube is too low for barges for two months. Factories along it cut output." },
      { title: "Rivers too warm", text: "Rivers are too warm and too low to cool power plants. Several plants cut output, and power prices rise." }
    ],
    options: [
      { label: "Treat the price rise as temporary", text: "It should end when the water returns.", tags: ["neutral"], lean: -0.4, apply: function (G) { G.bonus.infl += 0.1; } },
      { label: "Warn that it may last", text: "", tags: ["neutral"], lean: 0.6, apply: function (G) { G.bonus.infl -= 0.05; } }
    ]
  });
  S.card("energy-bills", {
    title: "Energy bills", actor: "Governments",
    when: function (G) { return kinds(G).prices; },
    variants: [
      { text: "Gas and power prices have doubled. Governments plan caps on bills and ask whether the bank sees a risk to prices." },
      { text: "The caps on energy bills are due to end. Ending them would add to inflation for a year." },
      { text: "Households in the poorer member states spend a fifth of their income on energy. Governments ask whether their help can continue." }
    ],
    options: [
      { label: "Support caps for households that need them", text: "", tags: ["neutral"], lean: -0.4, attr: { fiscal: 0.6, public: 0.4 }, apply: function (G) { G.bonus.trust += 0.3; G.bonus.infl -= 0.1; } },
      { label: "Ask for caps that end within a year", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 }, apply: function () {} },
      { label: "Ask for money spent on insulation and grids", text: "", tags: ["neutral"], lean: -0.2, attr: { green: 1 }, apply: function (G) { G.flags.green = (G.flags.green || 0) + 0.3; } }
    ]
  });
  S.card("rate-pressure", {
    title: "Governments criticize the rate rises", actor: "Heads of government",
    when: function (G) { return kinds(G).prices && G.pol.rate >= 2; },
    variants: [
      { text: "Two heads of government say in public that the bank's rate rises will cause a recession, and ask it to stop." },
      { text: "A finance minister says the bank is raising rates to fight prices it cannot control." },
      { text: "A national parliament votes a motion asking the bank to stop raising rates." }
    ],
    options: [
      { label: "Answer that the bank's task is stable prices", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 }, apply: function (G) { G.bonus.far += 0.1; } },
      { label: "Explain the decisions in a public letter", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "No comment", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("mortgage-stress", {
    title: "Mortgages reset", actor: "Banks, households",
    when: function (G) { return kinds(G).prices && G.pol.rate >= 2; },
    variants: [
      { text: "In states where most mortgages have variable rates, monthly payments rose by a third. More households fall behind." },
      { text: "Banks report the first rise in unpaid mortgages since the rate rises began." },
      { text: "Banks in two member states begin to repossess homes. The governments ask for a pause." }
    ],
    options: [
      { label: "Ask banks to offer longer terms", text: "", tags: ["neutral"], lean: -0.2, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Ask banks to hold more capital", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.6 }, apply: function () {} }
    ]
  });
  S.card("press-slip", {
    title: "A sentence at the press conference", actor: "Press conference",
    when: function (G) { return kinds(G).any; },
    variants: [
      { text: function (G) { return "Asked about spreads, the president says the bank is not there to close them. Markets fall" + (G.year > 2020 ? ", as they did after such a remark in March 2020." : "."); } },
      { text: "A Board member says in an interview that the bank will do nothing more this year. Markets take it as the bank's view." },
      { text: "A governor tells a national newspaper that rates will rise again soon, against the line agreed in the Council." }
    ],
    options: [
      { label: "Correct it the same day", text: "", tags: ["neutral"], lean: -0.2, apply: function (G) { G.bonus.backstop += 0.01; } },
      { label: "Leave the remark uncorrected", text: "", tags: ["neutral"], lean: 0.6, apply: function (G) { G.bonus.backstop -= 0.01; } }
    ]
  });
  S.card("savers", {
    title: "Savers lose", actor: "Savers' associations",
    when: function (G) { return kinds(G).prices; },
    variants: [
      { text: "Banks pay little interest on savings while prices rise fast. Savers' associations ask the bank to make banks pass on its rates." },
      { text: "Pensioners' groups say their savings lost a tenth of their value in two years." },
      { text: "A consumer group finds that half of the banks still pay no interest on savings accounts." }
    ],
    options: [
      { label: "Ask banks to pass on higher interest rates", text: "", tags: ["neutral"], lean: 0.2, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Answer that the best help is lower inflation", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.4 }, apply: function () {} }
    ]
  });
  S.card("price-caps", {
    title: "Caps on food prices",
    when: function (G) { return kinds(G).prices; },
    variants: [
      { text: function (G) { return "A member state caps the prices of bread, milk and eggs" + (G.year > 2022 ? ", as Hungary did in 2022" : "") + ". Shops run short of the capped goods, and other prices rise faster."; } },
      { text: "Two more states plan caps on food prices and ask the bank's opinion." }
    ],
    actor: "Governments",
    options: [
      { label: "Advise against caps", text: "Help to households works without shortages.", tags: ["neutral"], lean: 0.4, apply: function () {} },
      { label: "No objection to short caps", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.4 }, apply: function (G) { G.bonus.trust += 0.1; } }
    ]
  });
  S.card("forecast-miss", {
    title: "The forecasts were wrong", actor: "Directorate General Economics",
    when: function (G) { return kinds(G).any; },
    variants: [
      { text: "For two years running, the staff forecasts missed inflation by more than a point. Members of the Parliament ask why." },
      { text: "An outside review finds that the bank's models gave too little weight to energy prices and supply shortages." },
      { text: "The staff forecast is wrong again. A national central bank publishes its own forecast, which differs." }
    ],
    options: [
      { label: "Publish a review of the errors", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Show a range of forecasts", text: "Scenarios in place of a single number.", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "No change", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.2; } }
    ]
  });
  S.card("crisis-hearing", {
    title: "An extra hearing", actor: function (G) { return G.year >= 2041 ? "Federal Parliament" : "European Parliament"; },
    when: function (G) { return kinds(G).any; },
    variants: [
      { text: function (G) { return "The economic committee of " + parl(G) + " calls the president to an extra hearing on the crisis."; } },
      { text: "National parliaments in three states invite the president to explain the bank's part in the crisis." },
      { text: "The committee asks the president to come back every month while the crisis lasts." }
    ],
    options: [
      { label: "Attend and publish the bank's analysis", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 1 }, apply: function (G) { G.bonus.trust += 0.5; G.bonus.far -= 0.2; } },
      { label: "Send a member of the Board", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Decline", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.3; } }
    ]
  });
  S.card("protest", {
    title: "Protests in Frankfurt", actor: "Unions, protest groups",
    when: function (G) { return kinds(G).any; },
    variants: [
      { text: function (G) { return "Thousands march to the bank in Frankfurt against the cuts in the states under loan programs." + (G.year > 2015 ? " In March 2015 such a protest met the opening of the bank's new building." : ""); } },
      { title: "A day of strikes", text: "Unions in several member states hold a day of strikes. Their banners name the bank." },
      { title: "A camp outside the bank", text: "Students set up a camp outside the bank's building in Frankfurt and say they will stay until the crisis ends." }
    ],
    options: [
      { label: "Meet the organizers", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.4; G.bonus.far -= 0.2; } },
      { label: "Publish the bank's letters to governments", text: "", tags: ["neutral"], lean: -0.2, attr: { democratic: 1 },
        apply: function (G) { G.bonus.trust += 0.3; rel(G, function (m) { return m.c > 0.7; }, -2); } },
      { label: "Leave it to the police", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.3; G.bonus.far += 0.1; } }
    ]
  });

  /* ---------- More quieter items, and their follow-ups ----------
     Each comes back with a new variant, or once, as the other fillers do;
     some choices bring a follow-up card in a later year. */
  S.card("payment-access", {
    title: "Payment firms ask for access", actor: "Payment firms",
    when: function (G) { return G.year >= 2018; },
    settled: function (G) { return !!G.flags["done:paymentAccess"]; },
    variants: [{},
      { text: "A second group of payment firms asks for accounts at the national central banks, so their payments settle in central bank money as banks' payments do." },
      { text: "Payment firms say the banks they must pay through charge them more each year. They ask again for direct access to the payment system." }],
    text: "Firms that run card and phone payments, but are not banks, ask to settle their payments directly in the bank's payment system. Today they must pay through a bank.",
    options: [
      { label: "Grant access under strict conditions", text: "The firms keep their clients' money separate from their own and pass the same checks as banks.", tags: ["neutral"], lean: -0.2, novelty: 0.4, done: "paymentAccess",
        apply: function (G) { G.bonus.trust += 0.2; S.game.followUp(G, "payment-firm-fails", 2); } },
      { label: "Keep access for banks only", text: "", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 }, apply: function () {} },
      { label: "Ask for a law on access", text: "The bank asks the Commission to set the conditions in EU law.", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.1; } }
    ]
  });
  S.card("payment-firm-fails", {
    title: "A payment firm fails", actor: "Market Infrastructure",
    text: function (G, a) { return "One of the payment firms given access in " + a.from + " stops paying out. Its clients' money was kept separate, but two days of payments have not reached their recipients."; },
    options: [
      { label: "Pay the delayed payments first", text: "The national central bank lends the money and recovers it from the firm's assets.", tags: ["neutral"], lean: -0.4, apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Make the conditions stricter", text: "Every firm with access must hold a reserve in central bank money.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.6 }, apply: function (G) { G.bonus.trust += 0.1; } }
    ]
  });
  S.card("visitor-centre", {
    title: "Open the bank to visitors", actor: "Communications",
    once: true,
    when: function (G) { return G.year >= 2015; },
    text: "The bank's new building in Frankfurt has room for a visitor centre. Staff propose guided tours, an exhibition on the euro and evenings where the public can question Board members.",
    options: [
      { label: "Open a visitor centre", text: "Free entry, with tours in the official languages.", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.5; } },
      { label: "Hold open days twice a year", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Keep the building closed to the public", text: "For security.", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.1; } }
    ]
  });
  S.card("languages", {
    title: "Decisions in every language", actor: function (G) { return meps(G); },
    variants: [{},
      { text: function (G) { return meps(G) + " note that the bank's opinions on draft laws appear in English first and in other languages weeks later."; } },
      { text: "A survey finds that most people in the euro area cannot read the bank's decisions in their own language on the day they are taken." }],
    settled: function (G) { return !!G.flags["done:languages"]; },
    text: function (G) { return meps(G) + " ask the bank to publish its monetary policy decisions and their reasons in all the official languages on the day of the decision."; },
    options: [
      { label: "Publish every decision in all languages", text: "Translators work overnight after each meeting.", tags: ["neutral"], lean: 0, attr: { democratic: 1 }, done: "languages", apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Publish a short summary in all languages", text: "The full text stays in English first.", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Keep publishing in English first", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.2; } }
    ]
  });
  S.card("whistleblower", {
    title: "A whistleblower writes", actor: "Staff",
    variants: [{},
      { text: "A member of staff reports that a supervisor accepted gifts from a bank under that supervisor's oversight." },
      { text: "An employee of a national central bank reports that its managers traded bonds days before the bank announced purchases." }],
    text: "A member of staff reports that inspection findings on a large bank were made less severe before they reached the Supervisory Board.",
    options: [
      { label: "Appoint an outside inquiry", text: "Its findings come next year; the whistleblower's name stays protected.", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 },
        apply: function (G) { G.bonus.trust += 0.2; S.game.followUp(G, "inquiry-findings", 1); } },
      { label: "Handle it inside the bank", text: "The compliance office reviews the case.", tags: ["neutral"], lean: 0.2, apply: function (G) { G.ethics += 0.1; } }
    ]
  });
  S.card("inquiry-findings", {
    title: "The inquiry reports", actor: "Outside inquiry",
    text: function (G, a) { return "The inquiry appointed in " + a.from + " confirms the report in part: two managers acted against the rules; no decision of the Governing Council was affected."; },
    options: [
      { label: "Publish the report in full", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, apply: function (G) { G.bonus.trust += 0.5; G.ethics = Math.max(0, G.ethics - 0.1); } },
      { label: "Publish a summary and dismiss the managers", text: "", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust += 0.2; } }
    ]
  });
  S.card("card-payments", {
    title: "A European payment scheme", actor: "European banks",
    when: function (G) { return G.year >= 2020; },
    settled: function (G) { return !!G.flags["done:cardScheme"]; },
    variants: [{},
      { text: "Banks from five member states ask again for the bank's support for a common European payment app. Most card payments in the euro area still run through two firms based in the United States." },
      { text: "A failure at a card company based outside the EU stops card payments in several member states for an afternoon. The banks' common payment project asks for support." }],
    text: "Most card payments in the euro area run through two firms based in the United States. A group of European banks plans a common scheme for card and phone payments and asks the bank to support it.",
    options: [
      { label: "Support the banks' scheme", text: "The bank chairs its talks and sets technical standards.", tags: ["neutral"], lean: -0.2, novelty: 0.4, attr: { public: 0.6 }, done: "cardScheme",
        apply: function (G) { G.bonus.trust += 0.3; S.game.followUp(G, "scheme-launch", 2); } },
      { label: "Rely on the digital euro instead", text: "A public means of payment, from the bank itself.", tags: ["neutral"], lean: -0.4, attr: { public: 1 }, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Leave payments to the market", text: "", tags: ["neutral"], lean: 0.4, attr: { public: -0.4 }, apply: function () {} }
    ]
  });
  S.card("scheme-launch", {
    title: "The payment scheme starts", actor: "European banks",
    text: function (G, a) { return "The scheme the bank supported in " + a.from + " starts in four member states. Shops in the others have not signed up, and many say its fees are too high."; },
    options: [
      { label: "Ask banks to cut its fees", text: "", tags: ["neutral"], lean: -0.2, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Make no request to the banks", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("bond-tilt", {
    title: "Climate and the bank's bonds", actor: "Governing Council",
    when: function (G) { return G.year >= 2016 && !!(G.pol.qe || G.year >= 2022); },
    settled: function (G) { return !!G.flags["done:bondTilt"]; },
    variants: [{},
      { text: "Firms with the highest emissions still make up a large share of the company bonds the bank holds, because they borrow most." },
      { text: "Climate groups publish a list of the bank's largest holdings of company bonds. Coal, oil and gas firms are among the largest." }],
    text: "The bank buys company bonds in proportion to what each firm has issued, so the firms with the highest emissions are among its largest holdings. Staff propose to favor firms with lower emissions.",
    options: [
      { label: "Favor firms with lower emissions", text: "Purchases shift toward firms with lower emissions and better climate reports.", tags: ["neutral"], lean: 0, novelty: 0.4, attr: { green: 1.4 }, vote: true, onFail: 1, done: "bondTilt",
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 0.8; S.game.followUp(G, "tilt-review", 2); } },
      { label: "Keep buying in proportion to issuance", text: "", tags: ["neutral"], lean: 0.4, attr: { green: -0.4 }, apply: function () {} }
    ]
  });
  S.card("tilt-review", {
    title: "The climate rule reviewed", actor: "Governing Council",
    text: function (G, a) { return "Two years after the decision of " + a.from + ", the emissions of the firms whose bonds the bank holds have fallen by a quarter. Some governors say the bank now makes industrial policy, which is a task for governments."; },
    options: [
      { label: "Extend it to collateral", text: "Bonds of high-emission firms count for less when banks borrow.", tags: ["neutral"], lean: 0.2, novelty: 0.4, attr: { green: 1 }, vote: true, onFail: 1,
        apply: function (G) { G.flags.green = (G.flags.green || 0) + 0.6; } },
      { label: "Keep it as it is", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
    ]
  });
  S.card("cash-resilience", {
    title: "Cash for emergencies", actor: "National central banks",
    when: function (G) { return G.year >= 2022; },
    variants: [{},
      { text: "A power cut stops card payments across two member states for a day; shops that took cash stayed open." },
      { text: "A cyberattack stops card payments at a large bank for a weekend. Its customers queue at cash machines until the machines have no cash left." }],
    text: "Several governments ask households to keep some cash at home in case of power cuts and attacks on payment systems. They ask the bank how much cash the system should hold in reserve.",
    options: [
      { label: "Raise the banknote reserves", text: "National central banks hold more notes near each region.", tags: ["neutral"], lean: 0, attr: { public: 0.4 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Advise households to keep some cash", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Leave reserves as they are", text: "", tags: ["neutral"], lean: 0.2, apply: function () {} }
    ]
  });
  S.card("auditors", {
    title: "The Court of Auditors asks", actor: "European Court of Auditors",
    when: function (G) { return G.year >= 2015; },
    variants: [{},
      { text: "The Court of Auditors returns to the bank's supervision of banks and asks for the files of the inspections it could not see last time." },
      { text: "The Court of Auditors asks for the files of the bank's decisions on failing banks." }],
    text: "The European Court of Auditors reviews how efficiently the bank supervises banks. It asks for the files of inspections, including documents the bank says are confidential.",
    options: [
      { label: "Grant full access to the files", text: "The auditors report next year.", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 },
        apply: function (G) { G.bonus.trust += 0.2; S.game.followUp(G, "audit-report", 1); } },
      { label: "Grant what the Statute requires", text: "Access to the files on efficiency only (Art. 27.2 of the Statute).", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.1; } }
    ]
  });
  S.card("audit-report", {
    title: "The auditors report", actor: "European Court of Auditors",
    text: function (G, a) { return "The Court of Auditors reports on the files it saw in " + a.from + ": inspections are thorough, but large banks wait too long to hear their results, and the bank has too few supervisors."; },
    options: [
      { label: "Hire more supervisors", text: "", tags: ["neutral"], lean: 0.2, attr: { discipline: 0.4 }, apply: function (G) { G.bonus.trust += 0.3; } },
      { label: "Publish an answer to each finding", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; } }
    ]
  });
  S.card("outside-forum", {
    title: "A private forum", actor: "European Ombudsman",
    once: true,
    when: function (G) { return G.year >= 2012; },
    text: "The president is a member of a private forum of central bankers and the heads of large banks. A transparency group complains to the European Ombudsman that the membership harms the bank's independence from the banks it supervises.",
    options: [
      { label: "Leave the forum", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.4; G.ethics = Math.max(0, G.ethics - 0.1); } },
      { label: "Stay and publish the meetings", text: "The agendas and the president's speeches there are published.", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Stay without changes", text: "The Ombudsman's finding comes next year.", tags: ["neutral"], lean: 0.4,
        apply: function (G) { G.ethics += 0.15; S.game.followUp(G, "ombudsman-finding", 1); } }
    ]
  });
  S.card("ombudsman-finding", {
    title: "The Ombudsman's finding", actor: "European Ombudsman",
    text: function (G, a) { return "The European Ombudsman finds maladministration in the president's membership of the forum, as complained in " + a.from + ", and recommends leaving it. The finding is not binding."; },
    options: [
      { label: "Leave the forum now", text: "", tags: ["neutral"], lean: 0, attr: { democratic: 0.6 }, apply: function (G) { G.bonus.trust += 0.3; G.ethics = Math.max(0, G.ethics - 0.15); } },
      { label: "Reject the finding", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.4; G.ethics += 0.1; } }
    ]
  });
  S.card("meeting-accounts", {
    title: "Publish what the Council said", actor: function (G) { return meps(G); },
    when: function (G) { return G.year >= 2013; },
    settled: function (G) { return !!G.flags["done:meetingAccounts"]; },
    variants: [{},
      { text: "A newspaper prints what it says was said at the last Council meeting. The bank cannot confirm or deny it without publishing its own account." },
      { text: function (G) { return meps(G) + " ask again for accounts of the Council's meetings, as the US Federal Reserve and the Bank of England publish."; } }],
    text: function (G) { return meps(G) + " ask the bank to publish what was said at each meeting of the Governing Council. Today only the decisions are public."; },
    options: [
      { label: "Publish accounts without names", text: "Four weeks after each meeting.", tags: ["neutral"], lean: 0, attr: { democratic: 0.8 }, done: "meetingAccounts", apply: function (G) { G.bonus.trust += 0.4; } },
      { label: "Publish each member's vote", text: "Governors may then face pressure from their own governments.", tags: ["neutral"], lean: -0.2, attr: { democratic: 1.4 }, done: "meetingAccounts",
        apply: function (G) { G.bonus.trust += 0.6; rel(G, function (m) { return m.c > 0.6; }, -3); } },
      { label: "Keep the meetings confidential", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.2; } }
    ]
  });
  S.card("hybrid-work", {
    title: "Staff working from home", actor: "Staff committee",
    once: true,
    when: function (G) { return G.year >= 2021; },
    text: "After the pandemic, staff ask to keep working from home two days a week. Managers say teams meet too rarely.",
    options: [
      { label: "Allow two days a week at home", text: "", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.1; } },
      { label: "Allow it team by team", text: "", tags: ["neutral"], lean: 0, apply: function () {} },
      { label: "Ask staff back to the office", text: "Some staff leave for other employers.", tags: ["neutral"], lean: 0.2, apply: function (G) { G.bonus.trust -= 0.1; } }
    ]
  });
  S.card("frozen-assets", {
    title: "Frozen reserves of Russia", actor: "European Council",
    when: function (G) { return G.year >= 2022 && G.year <= 2030; },
    variants: [{},
      { text: "Governments ask again whether the reserves of Russia's central bank frozen in the EU could pay for Ukraine's reconstruction." },
      { text: "A larger group of governments proposes to lend to Ukraine against the frozen reserves of Russia's central bank." }],
    text: "Since 2022 the reserves of Russia's central bank held in the EU are frozen, most of them at a clearing house in Belgium. Governments discuss using them for Ukraine and ask for the bank's view.",
    options: [
      { label: "Support using only the interest earned", text: "The reserves stay frozen; the profits they earn go to Ukraine.", tags: ["neutral"], lean: 0, apply: function (G) { G.bonus.trust += 0.2; } },
      { label: "Warn against seizing the reserves", text: "Other central banks may hold fewer reserves in euro.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.4 }, apply: function () {} },
      { label: "Support seizing the reserves", text: "", tags: ["neutral"], lean: -0.4, novelty: 0.6, apply: function (G) { G.bonus.trust += 0.1; G.bonus.backstop -= 0.01; } }
    ]
  });
  S.card("fund-run", {
    title: "Investors leave money funds", actor: "Investment funds",
    when: function (G) { return kinds(G).banks || kinds(G).slump; },
    variants: [
      { text: "Investors take money out of money market funds faster than the funds can sell their assets. Some funds stop paying out for a day." },
      { text: "Funds that invest in property stop paying out to investors. Banks that lent to them report losses." },
      { text: "Bond funds sell government bonds to pay departing investors, and spreads rise for a week." }],
    options: [
      { label: "Lend more to banks that lend to funds", text: "", tags: ["neutral"], lean: -0.6, attr: { fiscal: 0.2 }, apply: function (G) { G.bonus.backstop += 0.01; } },
      { label: "Ask for stricter rules for funds", text: "The Commission's proposal comes in two years.", tags: ["neutral"], lean: 0.4, attr: { discipline: 0.6 },
        apply: function (G) { S.game.followUp(G, "fund-rules", 2); } },
      { label: "Leave the funds to their supervisors", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.backstop -= 0.01; } }
    ]
  });
  S.card("fund-rules", {
    title: "New rules for funds", actor: "European Commission",
    text: function (G, a) { return "The Commission proposes the rules the bank asked for in " + a.from + ": funds must hold more cash and may charge investors who take their money out within days."; },
    options: [
      { label: "Support the proposal", text: "", tags: ["neutral"], lean: 0.2, attr: { discipline: 0.4 }, apply: function (G) { G.bonus.backstop += 0.01; } },
      { label: "Ask for a larger cash buffer", text: "", tags: ["neutral"], lean: 0.6, attr: { discipline: 0.8 }, apply: function (G) { G.bonus.backstop += 0.015; G.bonus.gap -= 0.05; } }
    ]
  });
  S.card("strong-euro", {
    title: "The euro rises fast", actor: "Exporters",
    when: function (G) { return kinds(G).slump || kinds(G).deflation; },
    variants: [
      { text: "The euro has risen by a tenth against the dollar in six months. Exporters lose orders, and imports become cheaper." },
      { text: "Investors buy euro as a safe currency, and the euro reaches its highest level in years. Industry associations ask the bank to act." },
      { text: "Other central banks cut their rates, and the euro rises against their currencies. Prices of imports fall." }],
    options: [
      { label: "Say the exchange rate counts in its decisions", text: "The bank has no target for the exchange rate; it considers the exchange rate's effect on prices.", tags: ["neutral"], lean: -0.2, apply: function (G) { G.bonus.gap += 0.05; } },
      { label: "Cut rates by a quarter point", text: "", tags: ["neutral"], lean: -1, vote: true, onFail: 0, apply: function (G) { G.pol.rate = Math.max(0, G.pol.rate - 0.25); G.bonus.gap += 0.1; } },
      { label: "Make no statement", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.gap -= 0.05; } }
    ]
  });
  S.card("wildfire-region", {
    title: "Fires destroy a region", actor: "Regional banks",
    when: function (G) { return kinds(G).climate; },
    variants: [
      { text: "Forest fires destroy homes and farms across a region. Local banks hold many of its loans and lose their value." },
      { text: "A summer of fires closes hotels in a tourist region. Its savings banks report that many loans will not be repaid." },
      { text: "Fires destroy a region's forests and two factories. Insurers pay for less than half of the damage." }],
    options: [
      { label: "Accept the region's loans as collateral", text: "For one year, at a larger haircut. Needs the Governing Council.", tags: ["neutral"], lean: -0.6, novelty: 0.6, attr: { green: 0.6 }, vote: true, onFail: 1,
        apply: function (G) { G.bonus.backstop += 0.01; G.bonus.trust += 0.3; } },
      { label: "Raise EIB lending for rebuilding", text: "", tags: ["neutral"], lean: -0.4, attr: { green: 1, fiscal: 0.6 }, apply: function (G) { G.pol.eib = Math.min(3, G.pol.eib + 1); G.bonus.trust += 0.2; } },
      { label: "Leave it to governments and insurers", text: "", tags: ["neutral"], lean: 0.4, apply: function (G) { G.bonus.trust -= 0.2; } }
    ]
  });
  S.card("wage-claims", {
    title: "Unions ask for higher wages", actor: "Trade unions",
    when: function (G) { return kinds(G).prices; },
    variants: [
      { text: "Unions in the largest member states ask for wage rises that match last year's inflation." },
      { text: "Public sector unions strike for wage rises in line with prices. Governments ask the bank what it thinks." },
      { text: "Unions in industry sign agreements with rises above inflation for two years." }],
    options: [
      { label: "Say wages may rise as much as prices did", text: "Real wages fell last year.", tags: ["neutral"], lean: -0.6, attr: { public: 0.6, democratic: 0.4 },
        apply: function (G) { G.bonus.trust += 0.4; G.bonus.infl += 0.1; S.game.followUp(G, "wage-deals", 1); } },
      { label: "Warn that large wage rises raise prices further", text: "", tags: ["neutral"], lean: 1, attr: { discipline: 1 }, apply: function (G) { G.bonus.trust -= 0.4; G.bonus.infl -= 0.1; } },
      { label: "Make no statement", text: "", tags: ["neutral"], lean: 0, apply: function () {} }
    ]
  });
  S.card("wage-deals", {
    title: "The wage agreements", actor: "Trade unions, employers",
    text: function (G, a) { return "The wage agreements signed since the bank spoke in " + a.from + " raise pay by about as much as prices rose. Firms raise some of their prices again."; },
    options: [
      { label: "Treat the price rises as temporary", text: "", tags: ["neutral"], lean: -0.4, apply: function (G) { G.bonus.infl += 0.1; G.bonus.trust += 0.2; } },
      { label: "Raise rates by a quarter point", text: "", tags: ["neutral"], lean: 1, vote: true, onFail: 0, apply: function (G) { G.pol.rate += 0.25; G.bonus.infl -= 0.1; } }
    ]
  });
})();
