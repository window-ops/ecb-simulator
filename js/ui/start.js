/* The start screen: continue a saved game or begin a new one by choosing a
   period, a president and three advisors. The president form is shared
   with the succession dialog. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui, Gm = S.game;

  var BACKGROUNDS = S.BACKGROUNDS;
  /* A president form; returns { node, value() }. An empty name shows
     what it stands for as a placeholder, and the president takes it only
     when the game starts. */
  U.presidentForm = function (year, defaults) {
    defaults = defaults || {};
    var box = el("div", "form-grid");
    /* The name field holds its two tools at its right end, as a search
       field holds its clear button: a random name and the letter keyboard */
    var nl = el("div", "name-field");
    var nlab = el("label", "", S.t("Name")), name = el("input"); name.type = "text"; name.value = defaults.name || ""; name.maxLength = 60;
    name.id = "pres-name-" + Math.random().toString(36).slice(2, 7); nlab.htmlFor = name.id;
    var wrapIn = el("div", "field-tools");
    wrapIn.appendChild(name);
    nl.appendChild(nlab); nl.appendChild(wrapIn); box.appendChild(nl);
    var cl = el("label", "", S.t("Member state"));
    var cs = el("select");
    S.COUNTRIES.filter(function (c) { var j = c.joined; return year >= 2041 || (j !== null && j <= year); })
      .sort(function (a, b) { return a.name.localeCompare(b.name); })
      .forEach(function (c) { var o = el("option", "", c.name); o.value = c.code; if (c.code === (defaults.country || "FR")) { o.selected = true; } cs.appendChild(o); });
    cl.appendChild(cs); box.appendChild(cl);
    /* The language of the name: it follows the member state, and an empty
       name takes the president's title in it, unless English is chosen */
    var ll = el("label", "", S.t("Language of the name")), ls = el("select");
    Object.keys(S.LANGS).forEach(function (k) { var o = el("option", "", S.LANGS[k].name); o.value = k; ls.appendChild(o); });
    ls.value = S.STATE_LANG[cs.value] || "en";
    ll.appendChild(ls); box.appendChild(ll);
    function title() { return (S.LANGS[ls.value] || S.LANGS.en).title; }
    function placeholder() { name.placeholder = defaults.placeholder || title(); }
    placeholder();
    /* The tools inside the field: a random name from the member state, and
       a keyboard with the letters that carry diacritics in Europe's languages */
    var randBtn = S.button("", { icon: "random", cls: "flat in-field", title: S.t("Random name"), onClick: function () { name.value = S.randomName(cs.value); name.focus(); } });
    randBtn.setAttribute("aria-label", S.t("Random name"));
    var keysBtn = S.button("", { icon: "keyboard-virtual", cls: "flat in-field", title: S.t("Letters with diacritics") });
    keysBtn.setAttribute("aria-label", S.t("Letters with diacritics"));
    keysBtn.setAttribute("aria-expanded", "false");
    wrapIn.appendChild(randBtn); wrapIn.appendChild(keysBtn);
    var pad = el("div", "letter-pad"); pad.hidden = true; pad.style.gridColumn = "1 / -1";
    var padHead = el("div", "init-row"), which = el("select"), caps = el("input"), capsL = el("label", "check");
    which.setAttribute("aria-label", S.t("Letters of"));
    var allOpt = el("option", "", S.t("All languages")); allOpt.value = "all"; which.appendChild(allOpt);
    S.LETTERS.forEach(function (g, i) { var o = el("option", "", S.t(g.name)); o.value = String(i); which.appendChild(o); });
    caps.type = "checkbox"; capsL.appendChild(caps); capsL.appendChild(document.createTextNode(S.t("Capitals")));
    padHead.appendChild(which); padHead.appendChild(capsL); pad.appendChild(padHead);
    var keys = el("div", "letter-keys"); pad.appendChild(keys);
    function langLetters() {
      var n = S.LANG_LETTERS[ls.value], i = -1;
      S.LETTERS.forEach(function (g, j) { if (g.name === n) { i = j; } });
      which.value = i >= 0 ? String(i) : "all";
    }
    function upper(ch) { return ch === "ß" ? "ẞ" : ch === "ı" || ch === "İ" ? ch : ch === "għ" ? "Għ" : ch.toUpperCase(); }
    function drawKeys() {
      S.clear(keys);
      var set = which.value === "all" ? S.LETTERS.reduce(function (a, g) { return a.concat(g.letters); }, []) : S.LETTERS[Number(which.value)].letters;
      set = set.filter(function (c, i) { return set.indexOf(c) === i; }).sort(function (a, b) { return a.localeCompare(b); });
      set.forEach(function (ch) {
        var c = caps.checked ? upper(ch) : ch;
        var k = S.button(c, { cls: "letter-key" });
        k.addEventListener("mousedown", function (e) { e.preventDefault(); });
        k.addEventListener("click", function () {
          var a = name.selectionStart == null ? name.value.length : name.selectionStart, b = name.selectionEnd == null ? a : name.selectionEnd;
          if (name.value.length - (b - a) + c.length > name.maxLength) { return; }
          name.setRangeText(c, a, b, "end"); name.focus();
        });
        keys.appendChild(k);
      });
    }
    which.addEventListener("change", drawKeys);
    caps.addEventListener("change", drawKeys);
    keysBtn.addEventListener("click", function () {
      pad.hidden = !pad.hidden; keysBtn.setAttribute("aria-expanded", String(!pad.hidden));
      if (!pad.hidden) { drawKeys(); }
    });
    ls.addEventListener("change", function () { placeholder(); langLetters(); if (!pad.hidden) { drawKeys(); } });
    cs.addEventListener("change", function () { ls.value = S.STATE_LANG[cs.value] || "en"; placeholder(); langLetters(); if (!pad.hidden) { drawKeys(); } });
    langLetters();
    keysBtn.setAttribute("aria-controls", pad.id = "letters-" + name.id);
    box.appendChild(pad);
    var bg = el("div"); bg.style.gridColumn = "1 / -1";
    bg.appendChild(el("div", "dim small field-label", S.t("Background")));
    var ch = el("div", "choice");
    var gname = "bg" + Math.random().toString(36).slice(2);
    BACKGROUNDS.forEach(function (b, i) {
      var l = el("label"), r = el("input"); r.type = "radio"; r.name = gname; r.value = b[0];
      if ((defaults.background || "central") === b[0]) { r.checked = true; }
      l.appendChild(r);
      var t = el("span"); t.appendChild(el("div", "", S.t(b[1]))); t.appendChild(el("div", "dim", S.t(b[2]))); l.appendChild(t);
      ch.appendChild(l);
    });
    bg.appendChild(ch); box.appendChild(bg);
    function picked() {
      var r = box.querySelector("input[type=radio]:checked");
      return { name: name.value.trim(), country: cs.value, background: r ? r.value : "central" };
    }
    return {
      node: box,
      /* What the player entered, with the name left empty when none was typed */
      entered: picked,
      value: function () { var v = picked(); v.name = v.name || title(); return v; }
    };
  };

  /* What a game can hide (S.game.HIDE), as the form for a new game and
     Settings > Game name it */
  U.HIDE_LABELS = [["history", "Hide the record"], ["votes", "Hide the Council vote estimate"], ["troika", "Hide the Troika label"],
    ["draghi", "Hide the Draghi measure label"], ["forecasts", "Hide the advisors' forecasts"]];
  /* The four values behind the levels of difficulty, each shown as a
     share of Normal (readiness as the chance itself): [key, name, what it
     does, lowest %, highest %, % to value, value to %] */
  U.CUSTOM_LEVERS = function () {
    var N = Gm.DIFFICULTY.normal;
    return [
      ["will", "Readiness to vote yes", "How readily a Council member votes yes before the stance gap and the relation count.", 40, 100, function (v) { return v / 100; }, function (x) { return Math.round(x * 100); }],
      ["dist", "Weight of the stance gap", "How much the gap between a member's stance and an option lowers that member's chance of voting yes.", 75, 150, function (v) { return v / 100 * N.dist; }, function (x) { return Math.round(x / N.dist * 100); }],
      ["rel", "Weight of your relations", "How much your relation with each member moves that member's vote.", 60, 250, function (v) { return N.rel * 100 / v; }, function (x) { return Math.round(N.rel / x * 100); }],
      ["gain", "Support gains kept", "The share of each rise in a proposal's support from pressuring governments, speeches, crisis pressure and trust.", 25, 150, function (v) { return v / 100; }, function (x) { return Math.round(x * 100); }]
    ];
  };
  /* One of the four values as a block: its name, its share of Normal and
     a button back to Normal on one line, the slider under them at full
     width, and a line on what it does. It writes into values and calls
     changed; the form for a new game and Game settings share it, and
     U.levers sets the blocks side by side where there is room. */
  U.leverControl = function (lv, values, changed) {
    var N = Gm.DIFFICULTY.normal, box = el("div", "lever"), head = el("div", "lever-head"), inp = el("input"), out = el("span", "lever-out");
    var id = "lever-" + lv[0] + "-" + Math.random().toString(36).slice(2, 7), name = el("label", "lever-name", S.t(lv[1]));
    inp.type = "range"; inp.min = lv[3]; inp.max = lv[4]; inp.step = 5; inp.id = id; name.htmlFor = id;
    function show() {
      out.textContent = inp.value + "%";
      inp.style.setProperty("--fill", ((inp.value - lv[3]) / (lv[4] - lv[3]) * 100) + "%");
    }
    inp.value = Math.max(lv[3], Math.min(lv[4], lv[6](values[lv[0]] != null ? values[lv[0]] : N[lv[0]])));
    inp.addEventListener("input", function () { values[lv[0]] = lv[5](Number(inp.value)); show(); changed(); });
    var rs = S.button("", { icon: "reset", cls: "flat", title: S.t("Reset to Normal"), onClick: function () { inp.value = lv[6](N[lv[0]]); values[lv[0]] = N[lv[0]]; show(); changed(); } });
    rs.setAttribute("aria-label", S.t("Reset {l} to Normal", { l: S.t(lv[1]) }));
    head.appendChild(name); head.appendChild(out); head.appendChild(rs);
    box.appendChild(head); box.appendChild(inp);
    box.appendChild(el("p", "dim small", S.t(lv[2])));
    show();
    return box;
  };
  /* The four blocks, side by side where there is room */
  U.levers = function (values, changed) {
    var g = el("div", "levers");
    U.CUSTOM_LEVERS().forEach(function (lv) { g.appendChild(U.leverControl(lv, values, changed)); });
    return g;
  };
  U.views.start = function (page) {
    var box = el("div", "start");
    /* Back to the title screen and its menu */
    box.appendChild(S.button(S.t("Back to the title screen"), { icon: "back", cls: "flat start-back", onClick: function () { U.title = true; U.render(); } }));
    /* The name and the introduction greet a first game only: with a save, the player knows the game */
    if (!S.saves.any()) {
      var hero = el("div", "hero");
      hero.appendChild(S.logo("logo"));
      var ht = el("div");
      ht.appendChild(el("h1", "", S.t("{a} Simulator", { a: S.bankName().acr })));
      ht.appendChild(el("p", "", S.t("You lead the {b}. Your task: keep the euro crisis from happening, or make it smaller and shorter than it was. Each turn is a year. Proposals reach your desk; the Governing Council votes; governments, parliaments and markets respond.", { b: S.bankName().full })));
      hero.appendChild(ht);
      box.appendChild(hero);
    }
    /* Folded by default: the history matters only to players who want it */
    var selk = el("details", "group fold");
    selk.appendChild(el("summary", "", S.t("The record, then Selk")));
    selk.appendChild(el("p", "", S.t("From 2008 to 2025 the figures and events follow the record. After 2025 events follow the history told in Selk, another browser game by the same designer, set in 2097 on Saturn's moon Titan. In that history far-right governments rise and fall by 2031, climate strikes spread from 2033, and in 2041 the European Union becomes the Federation of Europe, with one budget and one debt. You do not need to know Selk: every event is explained where it appears.")));
    selk.appendChild(S.button(S.t("What is Selk?"), { icon: "about", onClick: function () { U.selkDialog(); } }));
    box.appendChild(selk);

    var g1 = el("section", "group");
    g1.appendChild(el("h2", "", S.t("Period")));
    var per = el("div", "choice");
    var mode = "pre";
    [["pre", "Pre-federative, 2008 to 2041", "The European Union and its treaties. Save Greece and the other states where the crisis was worst. Ends with the Federal Treaty of 2041; you may then continue into the Federation."],
      ["post", "Post-federative, 2041 to 2070", "Selk's Federation of Europe: one budget, one debt, an elected Commission. From 2045 the bank reports to the Federal Parliament, which can instruct and dismiss you. Harder."]].forEach(function (m) {
      var l = el("label"), r = el("input"); r.type = "radio"; r.name = "period"; r.value = m[0]; if (m[0] === "pre") { r.checked = true; }
      r.addEventListener("change", function () { mode = m[0]; S.sound.play("select"); redrawPres(); });
      l.appendChild(r);
      var t = el("span"); t.appendChild(el("div", "", S.t(m[1]))); t.appendChild(el("div", "dim", S.t(m[2]))); l.appendChild(t);
      per.appendChild(l);
    });
    g1.appendChild(per); box.appendChild(g1);

    /* Difficulty, kept with the run */
    var gd = el("section", "group"), diff = "normal", dc = el("div", "choice");
    gd.appendChild(el("h2", "", S.t("Difficulty")));
    [["normal", "Normal", "Council members vote yes readily; a gap between a member's stance and an option, or a poor relation with you, lowers that member's chance of voting yes a little. Pressuring governments, speeches and the yearly rise from crisis pressure and trust raise a proposal's support in the European Council by the full amount."],
      ["realistic", "Realistic", "Members vote yes less readily; the stance gap and your relation with each member count more. Pressuring governments, speeches and the yearly rise from crisis pressure and trust raise a proposal's support by 70% of the Normal amount. A policy needs members on its side before it passes."],
      ["hard", "Hard", "Members vote yes least readily; the stance gap counts most, and your relation with each member decides close votes. Pressuring governments, speeches and the yearly rise from crisis pressure and trust raise a proposal's support by half the Normal amount."],
      ["custom", "Custom", "Set each of the four values yourself, from easier than Normal to harder than Hard."]].forEach(function (m) {
      var l = el("label"), r = el("input"); r.type = "radio"; r.name = "difficulty"; r.value = m[0]; if (m[0] === "normal") { r.checked = true; }
      r.addEventListener("change", function () { diff = m[0]; custom.hidden = diff !== "custom"; S.sound.play("select"); });
      l.appendChild(r);
      var t = el("span"); t.appendChild(el("div", "", S.t(m[1]))); t.appendChild(el("div", "dim", S.t(m[2]))); l.appendChild(t);
      dc.appendChild(l);
    });
    gd.appendChild(dc);
    /* A custom difficulty: the four values behind the levels, each shown
       as a share of Normal (readiness as the chance itself), kept in the
       settings for the next game and with the run once it starts */
    var cd = S.settings.customDifficulty, custom = el("div", "custom-diff");
    custom.hidden = true;
    custom.appendChild(U.levers(cd, function () { S.saveSettings(); }));
    gd.appendChild(custom);
    /* What this game hides, each choice harder than showing it: kept with
       the run (G.hide), and remembered here for the next new game */
    var hides = el("div", "hides");
    hides.appendChild(el("h3", "", S.t("Hidden in this game")));
    var hrow = el("div", "init-row switches");
    U.HIDE_LABELS.forEach(function (h) {
      var key = Gm.hideKey(h[0]);
      hrow.appendChild(sw(S.t(h[1]), !!S.settings[key], function (v) { S.settings[key] = v; }));
    });
    hides.appendChild(hrow);
    hides.appendChild(el("p", "dim small", S.t("Each makes the game harder. Game settings, in the toolbar, can change them during the game.")));
    gd.appendChild(hides);
    /* EU enlargement: the states the run assumes will join the EU, each in
       a fixed year (S.ACCESSION). None is chosen at first. A chosen state
       brings its accession, its route to the euro and, for Scotland, the
       referendum and the currency to the agenda as required items. */
    var enl = el("div", "enlarge"), accession = [];
    enl.appendChild(el("h3", "", S.t("EU enlargement")));
    enl.appendChild(el("p", "dim small", S.t("Choose the states this run assumes will join the EU. Each joins in the year shown, and its accession and its route to the euro come to your agenda as required items. In a game from 2041, a state that joins by 2041 starts as a member.")));
    var ep = el("div", "advpick");
    S.CANDIDATES.slice().sort(function (a, b) { return S.ACCESSION[a.code].eu - S.ACCESSION[b.code].eu; }).forEach(function (c) {
      var a = S.ACCESSION[c.code], l = el("label"), cb = el("input"), what;
      cb.type = "checkbox"; cb.value = c.code;
      cb.addEventListener("change", function () {
        accession = accession.filter(function (x) { return x !== c.code; });
        if (cb.checked) { accession.push(c.code); }
      });
      if (a.independent) { what = S.t("Referendum in {r}, independence in {i}, joins the EU in {y}", { r: a.referendum, i: a.independent, y: a.eu }); }
      else if (a.euro === "unilateral") { what = S.t("Joins the EU in {y}; uses the euro already, without an agreement with the EU", { y: a.eu }); }
      else { what = S.t("Joins the EU in {y}", { y: a.eu }); }
      if (a.selk === false) { what += ". " + S.t("Outside Selk's history, where it stays in the United Kingdom"); }
      l.appendChild(cb);
      var t = el("span"); t.appendChild(el("div", "", S.t(c.name))); t.appendChild(el("div", "dim", what)); l.appendChild(t);
      ep.appendChild(l);
    });
    enl.appendChild(ep);
    gd.appendChild(enl); box.appendChild(gd);

    /* The area of responsibility, beside the difficulty: how many of the
       optional decisions a year brings; the year's events and the essential
       items come at every level. It stays with the run and can change in
       Settings > Game. */
    var gs = el("section", "group"), scope = "standard", sch = el("div", "choice");
    gs.appendChild(el("h2", "", S.t("Area of responsibility")));
    [["narrow", "Narrow", "Two items in a calm year and three in a crisis, with the events of the year and every essential item."],
      ["standard", "Standard", "Three items in a calm year and four in a crisis, with the events of the year and every essential item."],
      ["broad", "Broad", "Four items in a calm year and five in a crisis: more of the bank's daily work, from supervision to cash."]].forEach(function (m) {
      var l = el("label"), r = el("input"); r.type = "radio"; r.name = "scope"; r.value = m[0]; if (m[0] === "standard") { r.checked = true; }
      r.addEventListener("change", function () { scope = m[0]; S.sound.play("select"); });
      l.appendChild(r);
      var t = el("span"); t.appendChild(el("div", "", S.t(m[1]))); t.appendChild(el("div", "dim", S.t(m[2]))); l.appendChild(t);
      sch.appendChild(l);
    });
    gs.appendChild(sch); box.appendChild(gs);

    var g2 = el("section", "group");
    g2.appendChild(el("h2", "", S.t("The president")));
    var presHolder = el("div"); g2.appendChild(presHolder);
    var pf = null;
    function redrawPres() {
      var v = pf ? pf.entered() : null;
      S.clear(presHolder);
      pf = U.presidentForm(mode === "post" ? 2041 : 2008, v);
      presHolder.appendChild(pf.node);
    }
    redrawPres();
    box.appendChild(g2);

    var g3 = el("section", "group");
    g3.appendChild(el("h2", "", S.t("Advisors")));
    g3.appendChild(el("p", "dim small", S.t("Choose three. Each school is right in some conditions and wrong in others; their forecasts differ.")));
    var pick = el("div", "advpick"), chosen = ["newk", "postk", "eurocom"];
    var count = el("p", "small pick-count");
    S.ADVISOR_ORDER.forEach(function (id) {
      var a = S.ADVISORS[id], l = el("label"), c = el("input"); c.type = "checkbox"; c.value = id; c.checked = chosen.indexOf(id) >= 0;
      c.addEventListener("change", function () {
        if (c.checked) { chosen.push(id); if (chosen.length > 3) { var drop = chosen.shift(); var d = pick.querySelector("input[value=" + drop + "]"); if (d) { d.checked = false; } } }
        else { chosen = chosen.filter(function (x) { return x !== id; }); }
        upd();
      });
      l.appendChild(c);
      var t = el("span"); t.appendChild(el("div", "", a.name + " · " + S.t(a.school))); t.appendChild(el("div", "dim", a.claims)); l.appendChild(t);
      pick.appendChild(l);
    });
    function upd() { count.textContent = S.t("{n} of 3 chosen.", { n: chosen.length }); start.disabled = chosen.length !== 3; }
    g3.appendChild(pick); g3.appendChild(count);
    box.appendChild(g3);

    /* Quick settings: the ones a player wants before the first year, and
       a way to all the others. They change the same settings as the
       Settings dialog. */
    var st = S.settings;
    function apply() { S.saveSettings(); S.applyTheme(); S.sound.apply(); }
    function sw(text, on, set) {
      var l = el("label", "switch"), cb = el("input");
      cb.type = "checkbox"; cb.checked = on;
      cb.addEventListener("change", function () { set(cb.checked); apply(); });
      l.appendChild(cb); l.appendChild(el("span", "track")); l.appendChild(el("span", "", text));
      return l;
    }
    function pickOne(label, list, value, set) {
      var l = el("label", "quick-field"), s = el("select");
      l.appendChild(el("span", "", label));
      list.forEach(function (x) { var o = el("option", "", S.t(x[1])); o.value = x[0]; if (x[0] === value) { o.selected = true; } s.appendChild(o); });
      s.addEventListener("change", function () { set(s.value); apply(); });
      l.appendChild(s);
      return l;
    }
    var quick = el("section", "group quick");
    quick.appendChild(el("h3", "", S.t("Quick settings")));
    var qs = el("div", "quick-grid");
    qs.appendChild(pickOne(S.t("Theme"), [["system", "Follow the system"], ["light", "Breeze Light"], ["dark", "Breeze Dark"]], st.theme, function (v) { st.theme = v; }));
    qs.appendChild(pickOne(S.t("Text size"), [["normal", "Normal"], ["large", "Large"]], st.size, function (v) { st.size = v; }));
    qs.appendChild(pickOne(S.t("Motion"), [["system", "Follow the system"], ["reduce", "Reduce"], ["full", "Full"]], st.motion, function (v) { st.motion = v; }));
    /* With debug mode on, a year to begin in, beside the other quick
       settings; the game plays up to it with the historical choices */
    var begin = null;
    if (S.debugMode && S.debugMode()) {
      var bl = el("label", "quick-field dbg-begin");
      bl.appendChild(el("span", "", S.t("Debug: begin in")));
      begin = el("input"); begin.type = "number"; begin.step = 1;
      begin.min = mode === "post" ? 2041 : 2008; begin.max = mode === "post" ? 2069 : 2040; begin.value = begin.min;
      bl.appendChild(begin);
      qs.appendChild(bl);
    }
    quick.appendChild(qs);
    var g5 = el("div", "init-row switches");
    /* The interface sounds and the soundtrack need Sound; while it is off
       their switches are disabled and a line says why */
    var why = el("p", "dim small", S.t("Interface sounds and the soundtrack need Sound on."));
    function soundDeps() {
      [ui, mus].forEach(function (l) { l.querySelector("input").disabled = !st.sound; });
      why.hidden = !!st.sound;
    }
    g5.appendChild(sw(S.t("Sound"), !!st.sound, function (v) { st.sound = v; U.syncSound(); soundDeps(); if (v) { S.sound.play("good"); } }));
    var ui = sw(S.t("Interface sounds"), st.uiSound !== false, function (v) { st.uiSound = v; if (v) { S.sound.play("good"); } });
    var mus = sw(S.t("Soundtrack"), !!st.music, function (v) { st.music = v; });
    g5.appendChild(ui);
    g5.appendChild(mus);
    /* All settings closes the row of switches, at its far right */
    var all = S.button(S.t("All settings"), { cls: "all-settings", icon: "settings", onClick: function () { U.settingsDialog(); } });
    g5.appendChild(all);
    quick.appendChild(g5);
    quick.appendChild(why);
    soundDeps();
    box.appendChild(quick);
    /* Start and the tour sit together */
    var foot = el("div", "start-foot");

    var g4 = el("div", "init-row");
    var tl = el("label", "check guided"), tc = el("input"); tc.type = "checkbox"; tc.checked = !S.settings.tourDone;
    tl.appendChild(tc); tl.appendChild(document.createTextNode(S.t("Guided first year (skip it if you know the game)")));
    var start = S.button(S.t("Start"), { cls: "primary", icon: "next", onClick: function () {
      if (chosen.length !== 3) { return; }
      var G = Gm.create({ mode: mode, advisors: chosen, president: pf.value(), tutorial: tc.checked, difficulty: diff, scope: scope, custom: S.settings.customDifficulty, accession: accession,
        hide: (function () { var h = {}; Gm.HIDE.forEach(function (k) { h[k] = !!S.settings[Gm.hideKey(k)]; }); return h; })(),
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) });
      /* With debug on, the game can begin at a later year, played up to it with the historical choices */
      var at = begin ? Math.max(Number(begin.min), Math.min(Number(begin.max), Math.round(Number(begin.value) || 0))) : 0;
      if (at > G.year) { S.taint(G, "Begin in " + at + ", played from " + G.startYear + " with Realistic (as a player would)"); S.auto.playTo(G, at, "realistic", true); Gm.log(G, "Debug: the game began in " + G.year + ", played from " + G.startYear + " as a player would (realistic choices).", "debug"); }
      S.saves.addAutomatic(G);
      U.loadGame(G);
      S.saves.write("auto", G, true);
      S.sound.play("turn");
      if (tc.checked) { setTimeout(function () { U.tour(); }, 300); }
    } });
    /* Start first, the guided year at the far right of the same line */
    g4.appendChild(start);
    g4.appendChild(tl);
    foot.appendChild(g4);
    box.appendChild(foot);
    upd();
    page.appendChild(box);
  };

  /* Opens a game. An autosave also names the game's slot; a manual save
     keeps the slot of the game it was made from, so the game goes on
     updating its own autosave. */
  U.loadGame = function (G, source) {
    if (source && source.kind === "automatic") { G.slot = source.id; }
    if (!G.id) { G.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
    S.G = G; U.title = false; U.view = "agenda"; U.cardIndex = 0; U.sel = {}; U.review = false;
    var first = G.agenda.findIndex(function (e) { return !e.done; });
    if (first >= 0) { U.cardIndex = first; }
    /* A finished or crashed run loaded from a save shows its end screen at
       once, with no fade-in animation: the interface should not be visible
       underneath it fading in */
    if (Gm.closed(G)) { U.fromLoad = true; }
    /* A finished run opens on its end screen (U.render); a pending
       succession asks first */
    U.render();
    if (!Gm.closed(G) && G.pendingSuccession) { U.successionDialog(); }
  };
})();
