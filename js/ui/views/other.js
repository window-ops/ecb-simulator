/* The views other than the agenda: Governing Council, countries, advisors,
   Parliament, proposals and treaties, archive, glossary. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui, M = S.model, Gm = S.game, K = S.council;

  function head(page, title, sub) {
    var h = el("div", "page-head");
    h.appendChild(el("h1", "", title));
    if (sub) { h.appendChild(el("span", "dim", sub)); }
    page.appendChild(h);
    return h;
  }
  function table(cols, rows) {
    var w = el("div", "table-wrap"), t = el("table"), th = el("thead"), tr = el("tr");
    cols.forEach(function (c) { tr.appendChild(el("th", c[1] ? "num" : "", c[0])); });
    th.appendChild(tr); t.appendChild(th);
    var tb = el("tbody"); rows.forEach(function (r) { tb.appendChild(r); }); t.appendChild(tb);
    w.appendChild(t); return w;
  }
  function td(text, num) { return el("td", num ? "num" : "", text); }

  /* ---------- Council ---------- */
  /* What each bloc wants, for the help button beside its name */
  var BLOC_HELP = {
    hawks: "Governors whose central banks have long prioritized low inflation, such as those of Germany, the Netherlands and Austria. They favor higher interest rates to bring inflation down and oppose new instruments more than the others.",
    center: "Governors who stand between the other two blocs on inflation and interest rates, such as those of France and Belgium. They favor moderate rates.",
    periphery: "Governors of the states hit hardest by the euro crisis (Greece, Ireland, Portugal, Spain, Italy and Cyprus) and of other states that favor lower interest rates. They prioritize employment and support help for states with high spreads.",
    board: "The six members of the Executive Board, the president among them. They always vote, and their relation with the president starts higher than the governors'."
  };
  U.views.council = function (page, G) {
    head(page, S.t("Governing Council"), S.t("{n} members; {v} vote this year", { n: G.council.length + 1, v: K.voters(G).length + 1 }));
    page.appendChild(el("p", "dim", S.t("Monetary policy decisions need a simple majority. When the votes for and against are equal, the president's vote decides. An objection to emergency liquidity needs two thirds (ECB Statute, Art. 10.2 and 14.4). From 2015 governors vote by rotation.")));
    var blocs = {};
    G.council.forEach(function (m) { var b = K.bloc(m); (blocs[b] = blocs[b] || []).push(m); });
    var g = el("div", "grid3");
    Object.keys(K.BLOCS).forEach(function (b) {
      var list = blocs[b] || [];
      var c = el("div", "group stack"), ft = el("div", "card-foot");
      /* The bloc's name, with a square "?" button at the far right that
         explains who belongs to it (Breeze has no question mark icon) */
      var bh = el("div", "bloc-head"), name = S.t(K.BLOCS[b]);
      bh.appendChild(el("h4", "", name));
      /* It sounds as a glossary term does: the popover's own sounds, no click */
      var help = S.button("?", { cls: "small help-q", title: S.t("About the bloc: {b}", { b: name }) });
      help.addEventListener("click", function () { S.popover(help, name, S.t(BLOC_HELP[b])); });
      help.setAttribute("aria-label", help.title);
      bh.appendChild(help);
      c.appendChild(bh);
      var rel = list.length ? list.reduce(function (a, m) { return a + m.rel; }, 0) / list.length : 0;
      ft.appendChild(el("p", "", S.t("{n} members, average relation {r}", { n: list.length, r: Math.round(rel) })));
      var mt = el("div", "meter"); var sp = el("span"); sp.style.width = Math.round((rel + 100) / 2) + "%"; mt.appendChild(sp); ft.appendChild(mt);
      c.appendChild(ft);
      g.appendChild(c);
    });
    page.appendChild(g);
    /* Each member has two stances, and the table shows the one chosen here:
       on interest rates (h, from -1 for lower to 1 for higher rates) or on
       new instruments (c, from 0, open to them, to 1, against them) */
    var on = U.stanceOn === "c" ? "c" : "h";
    var tools = el("div", "map-tools"), sel = el("select");
    tools.appendChild(el("label", "dim", S.t("Stance on")));
    sel.setAttribute("aria-label", S.t("Stance on"));
    [["h", "Interest rates"], ["c", "New instruments"]].forEach(function (x) {
      var o = el("option", "", S.t(x[1])); o.value = x[0]; if (x[0] === on) { o.selected = true; } sel.appendChild(o);
    });
    sel.addEventListener("change", function () { U.stanceOn = sel.value; U.render(); });
    tools.appendChild(sel);
    page.appendChild(tools);
    page.appendChild(el("p", "dim", on === "h"
      ? S.t("The stance on interest rates shows how strongly a member favors higher interest rates, to prioritize bringing inflation down, or lower interest rates, to prioritize jobs and the states with high spreads. A governor's stance follows the record of their national central bank; each Executive Board member has their own. It decides how a member votes on the rate and on each option put to a vote. The president's stance comes from the options you put to a vote, and shows after the first one.")
      : S.t("The stance on new instruments shows how strongly a member opposes tools the bank has not used before, such as large bond purchases. A governor's stance follows the record of their national central bank; each Executive Board member has their own. The more a member opposes new instruments, the less likely they are to vote for one. The president's stance comes from your choices on cards that offer a new instrument, and shows after the first one.")));
    var voting = {};
    K.voters(G).forEach(function (m) { voting[m.id] = true; });
    var rows = [];
    var pr = el("tr");
    pr.appendChild(td(G.president.name)); pr.appendChild(td(S.t("President"))); pr.appendChild(td(S.COUNTRY[G.president.country].name));
    /* The chosen stance on its bar, with its word; none shows a note */
    function stance(v, none) {
      var st = el("td"), cell = el("div", "stance-cell"), bar = el("div", "stance");
      if (v == null) { cell.appendChild(el("span", "dim small", none)); st.appendChild(cell); return st; }
      var i = el("i"); i.style.left = Math.round((on === "h" ? (v + 1) / 2 : v) * 86) + "px"; bar.appendChild(i);
      bar.title = on === "h" ? (v > 0.3 ? S.t("for higher rates") : v < -0.3 ? S.t("for lower rates") : S.t("center"))
        : (v >= 0.65 ? S.t("against new instruments") : v <= 0.35 ? S.t("for new instruments") : S.t("center"));
      cell.appendChild(bar); cell.appendChild(el("span", "dim small", bar.title)); st.appendChild(cell);
      return st;
    }
    /* The president's stances come from the player's choices: on rates from
       the options put to a vote, on new instruments from the choices on
       cards that offer one. The relation is the player's own */
    pr.appendChild(td(S.t("Executive Board")));
    pr.appendChild(stance(on === "h" ? K.presidentStance(G) : K.presidentCaution(G), S.t("not yet known")));
    pr.appendChild(td(S.t("You"), true)); pr.appendChild(td(S.t("yes")));
    rows.push(pr);
    G.council.forEach(function (m) {
      var tr = el("tr");
      tr.appendChild(td(m.name)); tr.appendChild(td(m.role)); tr.appendChild(td(S.COUNTRY[m.country].name)); tr.appendChild(td(S.t(K.BLOCS[K.bloc(m)])));
      tr.appendChild(stance(m[on]));
      tr.appendChild(td(String(m.rel), true));
      tr.appendChild(td(voting[m.id] ? S.t("yes") : S.t("not this year")));
      rows.push(tr);
    });
    page.appendChild(table([[S.t("Name")], [S.t("Role")], [S.t("State")], [S.t("Bloc")], [on === "h" ? S.t("Stance on rates") : S.t("Stance on new instruments")], [S.t("Relation"), 1], [S.t("Votes")]], rows));
  };

  /* ---------- Countries ---------- */
  U.views.countries = function (page, G) {
    var hd = head(page, S.t("Countries"), G.ea.v && G.ea.v.seeded ? S.t("Latest figures") : S.t("Figures for {y}", { y: G.year - 1 }));
    /* The map can be hidden from the heading row; hidden, its tools and flow table go with it */
    var mh = S.button(U.mapHidden ? S.t("Show the map") : S.t("Hide the map"), { icon: U.mapHidden ? "view" : "map", collapse: true, cls: "small head-action", onClick: function () { U.mapHidden = !U.mapHidden; U.render(); } });
    mh.setAttribute("aria-expanded", U.mapHidden ? "false" : "true");
    /* Smaller map and charts, kept in the settings; a phone has no such
       button, its map and charts being small already */
    var small = U.compactCharts();
    if (!U.phone()) {
      var cb = S.button(small ? S.t("Larger map and charts") : S.t("Smaller map and charts"), { icon: "view", cls: "small head-action", onClick: function () { S.settings.compactCountries = !small; S.saveSettings(); S.applyTheme(); U.render(); } });
      cb.setAttribute("aria-pressed", small ? "true" : "false");
      hd.appendChild(cb);
    }
    hd.appendChild(mh);
    var post = G.year >= 2041;
    var rows = [];
    var codes = ["EA"].concat(M.members(G).sort(function (a, b) { return S.COUNTRY[b].weight - S.COUNTRY[a].weight; }));
    Object.keys(G.c).forEach(function (k) { if (G.c[k].exited) { codes.push(k); } });
    codes.forEach(function (k) {
      var v = k === "EA" ? G.ea.v : G.c[k].v;
      /* A state that has just joined has no figures from the game yet: last year's record stands in */
      if (!v && k !== "EA" && !G.c[k].exited) { v = M.recordFigures(k, G.year - 1); }
      var tr = el("tr" + "");
      if (U.country === k) { tr.className = "sel"; }
      var name = k === "EA" ? (post ? S.t("Federation") : S.t("Euro area")) : S.COUNTRY[k].name;
      var c = G.c[k] || {};
      var status = k === "EA" ? "" : c.exited ? S.t("left in {y}", { y: c.exited }) : G.programs[k] && G.programs[k].active ? S.t("program") : v && v.record ? S.t("joined in {y}", { y: c.joined }) : "";
      var b = el("button", "btn flat cell", name); b.type = "button";
      b.addEventListener("click", function () { U.country = k; S.sound.play("select"); U.countryClicked(k); U.render(); });
      var t0 = el("td"); t0.appendChild(b); tr.appendChild(t0);
      if (!v) { tr.appendChild(td("")); rows.push(tr); return; }
      tr.appendChild(td(S.fmt(v.u), true)); tr.appendChild(td(S.fmt(v.p), true));
      if (!post) { tr.appendChild(td(S.fmt(v.s), true)); }
      tr.appendChild(td(S.fmt(v.d, 0), true)); tr.appendChild(td(S.fmt(v.g), true)); tr.appendChild(td(S.fmt(v.bank, 0), true));
      tr.appendChild(td(status));
      rows.push(tr);
    });
    /* Column names in full words */
    var cols = [[S.t("State")], [S.t("Unemployment, %"), 1], [S.t("Inflation, %"), 1]];
    if (!post) { cols.push([S.t("Spread, points"), 1]); }
    cols = cols.concat([[S.t("Debt, % of output"), 1], [S.t("Growth, %"), 1], [S.t("Bank stability"), 1], [S.t("Status")]]);
    /* The table takes the full width; the chosen state's charts follow it */
    if (!U.mapHidden) { page.appendChild(S.mapView(G)); }
    page.appendChild(table(cols, rows));
    var charts = countryCharts(G, U.country); charts.classList.add("section");
    page.appendChild(charts);
  };
  function countryCharts(G, k) {
    var box = el("div");
    var name = k === "EA" ? (G.year >= 2041 ? S.t("Federation") : S.t("Euro area")) : S.COUNTRY[k].name;
    box.appendChild(el("h2", "", name));
    /* A state outside the euro, or a year not yet run, has nothing to chart: a message says why */
    var c = k === "EA" ? null : G.c[k];
    if (k !== "EA" && (!c || !c.joined || c.joined > G.year)) {
      var j = c && c.joined || S.COUNTRY[k].joined;
      box.appendChild(S.placeholder("chart", j && j > G.year ? S.t("{n} joins the euro in {y}. Its charts start after its first year in the euro.", { n: name, y: j }) : S.t("{n} is not in the euro, so there are no figures for it.", { n: name })));
      return box;
    }
    /* A state's charts start with the run, so a state that has just joined shows its record before it joined */
    var from = G.startYear, to = G.year - 1;
    if (G.startYear >= 2041) { from = 2041; }
    if (to < from) { box.appendChild(S.placeholder("chart", S.t("The charts start once the first year has ended."))); return box; }
    /* A state that was never in the euro in history (one that joins in the
       run) has no record of its own before the data ends: its line starts
       with the projection */
    var noRecord = k !== "EA" && S.COUNTRY[k].joined == null, firstRec = noRecord ? Math.max(from, S.LAST_DATA_YEAR + 1) : from;
    var recLabel = noRecord ? S.t("Without your changes") : to <= 2025 ? S.t("Record") : from > 2025 ? S.t("Without your changes") : S.t("Record, then projection");
    var run = (G.series[k] || {});
    function rec(key) {
      var o = {};
      for (var y = firstRec; y <= to; y++) {
        if (k === "EA") {
          var hk = { u: "hu", p: "hp", s: "hs", g: "hg" }[key];
          if (hk && G.series.EA[hk]) { o[y] = G.series.EA[hk][y]; }
          else if (key === "d") { o[y] = M.histEA(y, M.members(G)).d; }
        } else if (key === "s") { o[y] = y >= 2041 ? 0 : M.baseSpread(k, y); }
        else if (key === "bank") { o[y] = M.baseBank(k, y); }
        else { o[y] = M.base(k, key, y); }
      }
      return o;
    }
    var list = [["u", S.t("Unemployment, %"), "%"], ["p", S.t("Inflation, %"), "%"], ["d", S.t("Debt, % of output"), "%"], ["g", S.t("Growth, %"), "%"]];
    if (G.year < 2042 || from < 2041) { list.splice(2, 0, ["s", S.t("Spread over Germany, points"), " " + S.t("points")]); }
    if (k !== "EA") { list.push(["bank", S.t("Bank stability, 0 to 100"), ""]); }
    /* Wide, low charts; smaller still when the heading row asks for smaller ones */
    var cg = el("div", "chart-grid"), small = U.compactCharts();
    list.forEach(function (it) {
      if (k === "DE" && it[0] === "s") { return; }
      cg.appendChild(S.chart({ title: it[1], unit: it[2], run: run[it[0]] || {}, rec: rec(it[0]), recLabel: recLabel, from: from, to: to, width: small ? 260 : 380, height: small ? 90 : 120 }));
    });
    box.appendChild(cg);
    if (to <= 2025 || from <= 2025) {
      box.appendChild(el("p", "dim small", S.t("Record: Eurostat series une_rt_a, prc_hicp_aind, gov_10dd_edpt1, irt_lt_mcby_a and nama_10_gdp, rounded and modified slightly, as the Eurostat of the game's world reports them.")));
    }
    return box;
  }

  /* ---------- Advisors ---------- */
  U.views.advisors = function (page, G) {
    head(page, S.t("Advisors"), G.swapYear === G.year ? S.t("You have replaced an advisor this year.") : S.t("You may replace one advisor a year."));
    page.appendChild(el("h3", "", S.t("Your advisors")));
    var g = el("div", "grid3");
    G.advisors.forEach(function (id, seat) { g.appendChild(advCard(G, id, true, seat)); });
    page.appendChild(g);
    page.appendChild(el("h3", "", S.t("Other schools")));
    var g2 = el("div", "grid3");
    S.ADVISOR_ORDER.forEach(function (id) { if (G.advisors.indexOf(id) < 0) { g2.appendChild(advCard(G, id, false)); } });
    page.appendChild(g2);
  };
  function advCard(G, id, seated, seat) {
    var a = S.ADVISORS[id], c = el("div", "advcard" + (seated ? " seated" : ""));
    var who = el("div", "who"); who.appendChild(el("span", "avatar", S.initials(a.name)));
    var n = el("div"); n.appendChild(el("div", "", a.name)); n.appendChild(el("div", "dim small", S.t(a.school) + " · " + S.t(a.from))); who.appendChild(n);
    c.appendChild(who);
    /* The card's text at the default size; the sources, secondary, in the small one */
    c.appendChild(el("p", "", a.bio));
    var holds = el("p"); holds.appendChild(el("b", "", S.t("Supports") + ": ")); holds.appendChild(document.createTextNode(a.claims));
    c.appendChild(holds);
    c.appendChild(el("p", "small dim", a.evidence));
    if (!seated) {
      /* The appoint controls sit in a footer of their own at the bottom of
         the card, so every card in a row ends at the same line */
      var foot = el("div", "advfoot");
      c.appendChild(foot);
      var row = el("div", "init-row appoint");
      var sel = el("select"); sel.setAttribute("aria-label", S.t("Seat"));
      G.advisors.forEach(function (sid, i) { var o = el("option", "", S.t("Replace {n}", { n: S.ADVISORS[sid].name })); o.value = i; sel.appendChild(o); });
      row.appendChild(sel);
      row.appendChild(S.button(S.t("Appoint"), { icon: "advisor", disabled: G.swapYear === G.year || Gm.closed(G), onClick: function () {
        if (U.busy()) { return; }
        if (Gm.swapAdvisor(G, Number(sel.value), id)) { U.toast(S.t("{n} joins your advisors.", { n: a.name }), "good"); }
        U.render();
      } }));
      foot.appendChild(row);
    }
    return c;
  }

  /* ---------- Parliament ---------- */
  U.views.parliament = function (page, G) {
    var ea = G.series.EA || {};
    if (G.parl) {
      head(page, S.t("Federal Parliament"), S.t("800 seats"));
      var seats = G.parl.seats, NAMES = { ela: "European Left Alliance", sdg: "Social Democrats and Greens", lcb: "Liberal and Conservative Bloc", far: "Far right" };
      var bar = el("div", "bar"), leg = el("div", "legend"), i = 1;
      Object.keys(NAMES).forEach(function (k) {
        var sp = el("span"); sp.style.width = (seats[k] / 8) + "%"; sp.style.background = "var(--party-" + i + ")"; sp.title = S.t(NAMES[k]) + ": " + seats[k];
        bar.appendChild(sp);
        var it = el("span"); var sw = el("span", "sw"); sw.style.background = "var(--party-" + i + ")"; it.appendChild(sw);
        it.appendChild(document.createTextNode(S.t(NAMES[k]) + ": " + seats[k])); leg.appendChild(it);
        i++;
      });
      page.appendChild(bar); page.appendChild(leg);
      var g = el("div", "grid2 section");
      var c1 = el("div", "group stack");
      c1.appendChild(el("h3", "", S.t("Confidence in the president: {v} of 100", { v: Math.round(G.parl.conf) })));
      var mt = el("div", "meter"); var s1 = el("span"); s1.style.width = Math.round(G.parl.conf) + "%"; mt.appendChild(s1);
      var m30 = el("i", "mark"); m30.style.left = "30%"; mt.appendChild(m30); var m50 = el("i", "mark"); m50.style.left = "50%"; mt.appendChild(m50);
      c1.appendChild(mt);
      c1.appendChild(el("p", "small dim", S.t("Below 30 from 2045, the Parliament votes on a motion of no confidence. The president needs about 50 to be re-elected in 2045, 2050, 2055, 2060 and 2065.")));
      var f1 = el("div", "card-foot"); f1.appendChild(el("p", "small", S.t("Instructions followed: {a}. Refused: {b}.", { a: G.parl.complied, b: G.parl.refused }))); c1.appendChild(f1);
      g.appendChild(c1);
      var c2 = el("div", "group stack");
      c2.appendChild(el("h3", "", S.t("The bank and the Parliament")));
      c2.appendChild(el("p", "small", G.year >= 2045 ? S.t("Since the 2045 reforms the bank reports to the Federal Parliament, which can instruct it by law. The Federal Council can delay a law by up to a year.") :
        S.t("Until 2045 the bank keeps the independence it had before 2041. The 2045 reforms will make it report to the Federal Parliament.")));
      g.appendChild(c2);
      page.appendChild(g);
    } else {
      head(page, S.t("European Parliament"), S.t("Elections in 2009, 2014, 2019, 2024, 2029, 2034, 2039"));
      var c = el("div", "group");
      c.appendChild(el("p", "", S.t("The president answers the Parliament's economic committee in Monetary Dialogue hearings (Art. 284(3) TFEU). Hearings raise trust and public support; they cost an initiative.")));
      c.appendChild(el("p", "", S.t("Hearings this year: {n}.", { n: G.cover })));
      page.appendChild(c);
    }
    var from = G.startYear, to = G.year - 1;
    if (to >= from) {
      /* Wide, low charts side by side, as in Countries, and smaller by the
         same switch in the heading row */
      var small = U.compactCharts(), hd = page.querySelector(".page-head");
      if (hd && !U.phone()) {
        var cb = S.button(small ? S.t("Larger charts") : S.t("Smaller charts"), { icon: "view", cls: "small head-action", onClick: function () { S.settings.compactCountries = !small; S.saveSettings(); S.applyTheme(); U.render(); } });
        cb.setAttribute("aria-pressed", small ? "true" : "false");
        hd.appendChild(cb);
      }
      var w = small ? 260 : 380, h = small ? 90 : 120, cg = el("div", "chart-grid section");
      var rec = {}, run = ea.fr || {};
      for (var y = from; y <= to; y++) { rec[y] = M.histFarRight(y); }
      cg.appendChild(S.chart({ title: S.t("Far-right share of seats, %"), unit: "%", run: run, rec: rec, recLabel: to <= 2025 ? S.t("Record") : S.t("Selk's history"), from: from, to: to, width: w, height: h }));
      var tr = {}; for (y = from; y <= to; y++) { tr[y] = M.histTrust(y); }
      cg.appendChild(S.chart({ title: S.t("Trust in the bank, %"), unit: "%", run: ea.trust || {}, rec: tr, recLabel: to <= 2025 ? S.t("Record") : S.t("Record, then projection"), from: from, to: to, width: w, height: h }));
      page.appendChild(cg);
    }
  };

  /* ---------- Proposals and treaties ---------- */
  U.views.proposals = function (page, G) {
    head(page, S.t("Proposals and treaties"), S.t("Backstop: {v}%", { v: Math.round(M.backstop(G) * 100) }) + " · " + S.t("Difficulty: {d}", { d: S.t(Gm.level(G).name) }));
    page.appendChild(el("p", "dim", S.t("The bank cannot create a common debt or a stability fund. It proposes; the governments decide. Support rises when you pressure governments, with crisis pressure and with trust; it falls with each year of resistance and with the far right's strength.")));
    var g = el("div", "grid2");
    Object.keys(S.PROPOSALS).forEach(function (k) {
      var d = S.PROPOSALS[k], p = G.proposals[k], c = el("div", "group stack");
      c.appendChild(el("h3", "", d.name));
      var t = el("p", "small"); S.linkify(d.text, t); c.appendChild(t);
      c.appendChild(el("p", "small", S.t("For: ") + d.pro));
      c.appendChild(el("p", "small", S.t("Against: ") + d.con));
      /* The state of the proposal ends the card, so every card in a row ends at the same line */
      var ft = el("div", "card-foot");
      if (p.passed) {
        var ok = el("p", "good"); ok.appendChild(S.icon("ok", "s16")); ok.appendChild(document.createTextNode(" " + S.t("Adopted in {y}", { y: p.year || G.startYear }))); ft.appendChild(ok);
      } else {
        var thr = d.threshold - (k === "eurobonds" && G.treaty.done.indexOf("debt") >= 0 ? 20 : 0) - (G.ngeu && k === "eurobonds" ? 10 : 0);
        ft.appendChild(el("p", "small", S.t("Support at {s}% of the European Council; {t}% needed", { s: Math.round(p.support), t: thr })));
        var mt = el("div", "meter"); var sp = el("span"); sp.style.width = Math.round(p.support) + "%"; mt.appendChild(sp);
        var mk = el("i", "mark"); mk.style.left = thr + "%"; mt.appendChild(mk);
        ft.appendChild(mt);
        if (G.year < d.from) { ft.appendChild(el("p", "dim small", S.t("Available from {y}.", { y: d.from }))); }
      }
      c.appendChild(ft);
      g.appendChild(c);
    });
    page.appendChild(g);
    page.appendChild(el("h2", "", S.t("Treaty campaign")));
    var tc = el("div", "group");
    if (G.year >= 2041) {
      tc.appendChild(el("p", "", S.t("The Federal Treaty of 2041 replaced the old treaties.")));
    } else if (G.treaty.goal) {
      tc.appendChild(el("h3", "", S.TREATY_GOALS[G.treaty.goal].name));
      tc.appendChild(el("p", "small", S.TREATY_GOALS[G.treaty.goal].text));
      tc.appendChild(el("p", "", S.t("Stage {n} of 4: {s}. Progress {p} of 100.", { n: G.treaty.stage + 1, s: S.t(S.TREATY_STAGES[G.treaty.stage]), p: Math.round(G.treaty.progress) })));
      var mt2 = el("div", "meter"); var s2 = el("span"); s2.style.width = Math.min(100, (G.treaty.stage * 100 + G.treaty.progress) / 4) + "%"; mt2.appendChild(s2); tc.appendChild(mt2);
      tc.appendChild(el("p", "small dim", S.t("Ratification needs every member state; a referendum can reject it.")));
    } else {
      tc.appendChild(el("p", "", S.t("No campaign under way. Start one with an initiative on the agenda page (Art. 48 TEU).")));
    }
    if (G.treaty.done.length) {
      tc.appendChild(el("p", "good", S.t("Ratified: {l}", { l: G.treaty.done.map(function (k) { return S.TREATY_GOALS[k].name; }).join(", ") })));
    }
    page.appendChild(tc);
    page.appendChild(el("h2", "", S.t("Instruments in use")));
    var rows = [];
    Object.keys(S.INSTRUMENTS).forEach(function (k) {
      var I = S.INSTRUMENTS[k], on = k === "broad" ? G.pol.collateral === "broad" : k === "waiver" ? Object.keys(G.pol.waiver).some(function (x) { return G.pol.waiver[x]; }) :
        k === "elaOpen" ? G.pol.elaOpen : k === "eib" ? G.pol.eib > 0 : !!G.pol[k];
      /* Every row has a state and a kind, each a pill of its own color */
      var tr = el("tr"), now = el("td"), kind = el("td");
      now.appendChild(el("span", "badge " + (on ? "on" : G.year < I.from ? "later" : "off"), on ? S.t("in use") : G.year < I.from ? S.t("from {y}", { y: I.from }) : S.t("not in use")));
      kind.appendChild(el("span", "badge " + ({ draghi: "draghi", intended: "alt" }[I.tag] || "std"), I.tag === "draghi" ? S.t("Draghi measure") : I.tag === "intended" ? S.t("Alternative") : S.t("Standard")));
      tr.appendChild(td(I.name)); tr.appendChild(now); tr.appendChild(kind);
      tr.appendChild(td(I.basis));
      rows.push(tr);
    });
    page.appendChild(table([[S.t("Instrument")], [S.t("Now")], [S.t("Kind")], [S.t("Legal basis")]], rows));
    page.appendChild(el("p", "dim small", S.t("Standard instruments are the bank's ordinary tools. Draghi measures are the exceptional ones the historical bank used from 2010. Alternatives are tools the historical bank did not use.")));
  };

  /* ---------- Archive ---------- */
  U.views.archive = function (page, G) {
    head(page, S.t("Archive"), S.t("Since {y}", { y: G.startYear }));
    var tabs = el("div", "tabs"); tabs.setAttribute("role", "tablist");
    var cur = U.archiveTab || "log";
    [["log", S.t("Log")], ["figures", S.t("Figures")], ["path", S.t("Your path")]].forEach(function (t) {
      var b = S.button(t[1], { onClick: function () { U.archiveTab = t[0]; U.render(); } });
      b.setAttribute("role", "tab"); b.setAttribute("aria-selected", cur === t[0] ? "true" : "false");
      tabs.appendChild(b);
    });
    page.appendChild(tabs);
    if (cur === "log") {
      var byYear = {};
      G.log.forEach(function (l) { (byYear[l.y] = byYear[l.y] || []).push(l); });
      Object.keys(byYear).map(Number).sort(function (a, b) { return b - a; }).forEach(function (y) {
        page.appendChild(el("h3", "", String(y)));
        var ul = el("ul");
        byYear[y].forEach(function (l) {
          var li = el("li", l.k === "bad" ? "bad" : l.k === "good" ? "good" : "");
          if (l.k === "news") { li.appendChild(el("span", "dim", S.t("News: "))); }
          /* A debug action carries a tag, so a run that used one is easy to tell */
          if (l.k === "debug") { li.appendChild(el("span", "badge debug-mark", S.t("Debug"))); li.appendChild(document.createTextNode(" ")); }
          li.appendChild(document.createTextNode(l.k === "debug" ? l.t.replace(/^Debug: /, "") : l.t)); ul.appendChild(li);
        });
        page.appendChild(ul);
      });
    } else if (cur === "figures") {
      var ea = G.series.EA || {}, rows = [];
      for (var y = G.startYear; y < G.year; y++) {
        if (!ea.u || ea.u[y] == null) { continue; }
        var tr = el("tr");
        tr.appendChild(td(String(y)));
        ["u", "p", "s", "d", "g", "bank", "trust", "fr", "rate"].forEach(function (k) { tr.appendChild(td(ea[k] && ea[k][y] != null ? S.fmt(ea[k][y]) : "", true)); });
        rows.push(tr);
      }
      page.appendChild(table([[S.t("Year")], [S.t("Unemployment, %"), 1], [S.t("Inflation, %"), 1], [S.t("Spread, points"), 1], [S.t("Debt, % of output"), 1], [S.t("Growth, %"), 1], [S.t("Bank stability"), 1], [S.t("Trust, %"), 1], [S.t("Far right, %"), 1], [S.t("Rate, %"), 1]], rows));
    } else {
      var path = Gm.path(G), c = el("div", "group");
      c.appendChild(el("p", "", path.noDraghi ? S.t("No Draghi measures used.") : S.t("Draghi measures used: {l}.", { l: path.draghi.map(function (k) { return k + " (" + G.used.draghi[k] + ")"; }).join(", ") })));
      c.appendChild(el("p", "", path.noTroika ? S.t("The bank never sat in the Troika.") : S.t("Troika membership: {l}.", { l: path.troika.map(function (k) { return (S.COUNTRY[k] ? S.COUNTRY[k].name : k) + " (" + G.used.troika[k] + ")"; }).join(", ") })));
      page.appendChild(c);
      page.appendChild(el("h3", "", S.t("Presidents")));
      var ul = el("ul");
      G.presidents.forEach(function (p) { ul.appendChild(el("li", "", S.t("{n} ({c}), from {y}", { n: p.name, c: S.COUNTRY[p.country].name, y: p.start }) + (p.weak ? ", " + S.t("compromise candidate") : ""))); });
      page.appendChild(ul);
    }
  };

  /* ---------- Glossary ---------- */
  U.views.glossary = function (page) {
    head(page, S.t("Glossary"));
    var q = el("input", "search"); q.type = "search"; q.placeholder = S.t("Search"); q.setAttribute("aria-label", S.t("Search the glossary"));
    q.value = U.glossaryQ || "";
    /* The search takes the width; a list beside it sorts the terms */
    var bar = el("div", "glossary-tools"), sort = el("select");
    sort.setAttribute("aria-label", S.t("Sort the glossary"));
    [["az", "A to Z"], ["za", "Z to A"]].forEach(function (x) { var o = el("option", "", S.t(x[1])); o.value = x[0]; if ((U.glossarySort || "az") === x[0]) { o.selected = true; } sort.appendChild(o); });
    sort.addEventListener("change", function () { U.glossarySort = sort.value; draw(); });
    /* The categories (js/data/glossary.js): both, each under its heading,
       or one alone. The basics for readers outside the EU come first. */
    var cat = el("select");
    cat.setAttribute("aria-label", S.t("Glossary category"));
    [["all", S.t("All categories")]].concat(S.GLOSSARY_CATS.map(function (c) { return [c[0], S.t(c[1])]; })).forEach(function (x) {
      var o = el("option", "", x[1]); o.value = x[0]; if ((U.glossaryCat || "all") === x[0]) { o.selected = true; } cat.appendChild(o);
    });
    cat.addEventListener("change", function () { U.glossaryCat = cat.value; draw(); });
    bar.appendChild(q); bar.appendChild(cat); bar.appendChild(sort);
    page.appendChild(bar);
    var out = el("div", "glossary-cats");
    function catOf(g) { return g[3] || "eu"; }
    function draw() {
      S.clear(out);
      var s = q.value.toLowerCase(), dir = sort.value === "za" ? -1 : 1, shown = 0;
      S.GLOSSARY_CATS.forEach(function (c) {
        if (cat.value !== "all" && cat.value !== c[0]) { return; }
        var list = S.GLOSSARY.filter(function (g) { return catOf(g) === c[0] && (!s || (g[0] + " " + g[1].join(" ") + " " + g[2]).toLowerCase().indexOf(s) >= 0); });
        if (!list.length) { return; }
        var sec = el("section", "glossary-cat");
        sec.appendChild(el("h3", "", S.t(c[1])));
        var dl = el("dl", "glossary section");
        list.sort(function (a, b) { return dir * a[0].localeCompare(b[0]); }).forEach(function (g) {
          dl.appendChild(el("dt", "", g[0]));
          var dd = el("dd");
          S.linkify(g[2], dd, { skip: S.GLOSSARY.indexOf(g) });
          dl.appendChild(dd);
          shown++;
        });
        sec.appendChild(dl); out.appendChild(sec);
      });
      if (!shown) { out.appendChild(S.placeholder("glossary", S.t("No term matches the search."))); }
      S.levelHeadings();
    }
    q.addEventListener("input", function () { U.glossaryQ = q.value; draw(); });
    draw();
    page.appendChild(out);
  };
})();
