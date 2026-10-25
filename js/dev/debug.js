/* Debug mode, as in Selk: Settings > Debug has three switches.

   - Debug panel: a movable panel with the current situation and buttons
     that act on the game: decide every item by a strategy, end the year,
     play to a chosen year, adopt a proposal, start a loan program, make a
     state leave, put an EU enlargement item on the agenda, start a
     succession, end the period or the run, set the
     main rate, the initiatives and the Parliament's confidence, advance a
     treaty, run the tour, and a table of the model's hidden values.
   - Debug log: prints decisions, votes, years, saves and settings to the
     browser console. Filter the console by ECBSIM.
   - Fast mode: shortens the vote, the turn transition and the charts.

   Adding ?debug to the address turns the panel on for that visit. */
(function () {
  var S = window.ECBSIM, el = S.el, M = S.model, Gm = S.game;
  var panel = null, showModel = false;

  /* ---------- Log ---------- */
  S.on("*", function (data, name) {
    if (!S.debugMode() || !S.settings.debugLog || !window.console) { return; }
    console.log("%cECBSIM%c " + name, "color:#da4453;font-weight:bold", "color:inherit", data == null ? "" : data);
  });

  /* ---------- Debug mode ---------- */
  /* Settings > Debug > Debug mode grants every debug tool; while it is off
     none of them acts, whatever its own switch. ?debug in the address turns
     debug mode and the panel on for one visit. */
  try { S.debugUrl = /[?&]debug\b/.test(window.location.search); } catch (e) { S.debugUrl = false; }
  S.debugMode = function () { return !!(S.settings.debugMode || S.debugUrl); };

  /* ---------- Fast mode ---------- */
  Object.defineProperty(S, "fast", { get: function () { return S.debugMode() && !!S.settings.fast; } });
  S.applyDebug = function () {
    document.documentElement.classList.toggle("fast", S.fast);
    /* The panel's X only hides the panel; Settings > Debug turns it off */
    if (S.debugOn() && !S.debugHidden) { open(); } else { close(); }
    var tag = document.getElementById("debug-tag");
    if (tag) { tag.hidden = !S.debugMode(); }
  };

  /* ---------- Actions shared by the panel, the agenda's bar and the keys ---------- */
  /* Debug is on while debug mode and the panel are on, or ?debug is in the address */
  S.debugOn = function () { return S.debugMode() && !!(S.settings.debugPanel || S.debugUrl); };
  /* The bar above the agenda has its own switch, off by default, and shows
     whether the panel is open or not */
  S.debugBarOn = function () { return S.debugMode() && !!S.settings.debugBarOn; };
  /* The strategy and the target year the bar and the keys use */
  S.debugState = { strategy: "realistic", to: null };
  /* Runs a debug action: the run is marked as changed by debug (S.taint),
     the archive notes it with a Debug tag, the game is saved, and the window moves on as in play: a new year with its
     transition, an ending with its film, a succession with its dialog */
  S.debugRun = function (label, fn) {
    var G = S.G, U = S.ui;
    if (!G) { U.toast(S.t("Start a game first."), "warn"); return; }
    if (U.busy && U.busy()) { U.toast(S.t("Wait for the vote or the transition to finish."), "warn"); return; }
    /* A run that has ended is only reviewed: an action on it would play
       its ending again */
    if (Gm.closed(G)) { U.toast(S.t("The run has ended, so it can only be reviewed."), "warn"); return; }
    var year = G.year, n = G.log.length;
    /* The action marks the run before it acts, so no achievement counts
       what it does (js/model/achievements.js) */
    S.taint(G, label);
    fn(G);
    if (!G.log.slice(n).some(function (l) { return l.k === "debug"; })) { Gm.log(G, "Debug: " + label + ".", "debug"); }
    S.emit("debug", { action: label, year: G.year });
    S.saves.write("auto", G);
    function after() {
      if (G.over || G.finished) { U.playEnding(function () { U.render(); }); return; }
      U.render();
      if (G.pendingSuccession) { U.successionDialog(); }
    }
    if (G.year !== year && !G.over && !G.finished) { U.cardIndex = 0; U.sel = {}; U.view = "agenda"; U.yearFx(G.year, after); } else { after(); }
  };
  /* The first year after the period: playing to it ends the period */
  S.debugPeriodEnd = function (G) { return G.mode === "pre" ? 2041 : 2071; };
  var STRATEGIES = [["realistic", "Realistic (as a player would)"], ["history", "Historical choices"], ["intended", "Intended path"], ["first", "First option"], ["random", "Random"]];
  function strategyName() { var s = STRATEGIES.filter(function (x) { return x[0] === S.debugState.strategy; })[0]; return S.t(s ? s[1] : "Historical choices"); }
  /* Every jump plays the years in between as a player would with the
     chosen strategy: each item decided, initiatives used when asked, each
     succession taken, each year ended. A jump that would end the period
     asks first, since an ending reached at full speed skips what the game
     shows on the way; the year before is the safe stop. */
  function jump(year, press) {
    var G = S.G;
    if (!G) { S.ui.toast(S.t("Start a game first."), "warn"); return; }
    if (S.ui.busy && S.ui.busy()) { S.ui.toast(S.t("Wait for the vote or the transition to finish."), "warn"); return; }
    if (Gm.closed(G)) { S.ui.toast(S.t("The run has ended, so it can only be reviewed."), "warn"); return; }
    var end = S.debugPeriodEnd(G);
    function go(y) { S.debugRun(S.t("Play to {y} with {s}", { y: y, s: strategyName() }), function (G2) { S.auto.playTo(G2, y, S.debugState.strategy, press !== false); }); }
    if (year < end || S.settings.debugConfirmEnd === false) { go(year); return; }
    var b = el("div", "prose"), ask = el("label", "check"), cb = el("input");
    b.appendChild(el("p", "", S.t("Playing to {y} ends the period: the game is played at full speed into its ending.", { y: year })));
    b.appendChild(el("p", "", S.t("An ending reached this way skips the year report and the steps the game shows on the way, and can leave the run in a state play never reaches. It is safer to stop at {s}, the last year of the period, and end it with End year.", { s: end - 1 })));
    b.appendChild(el("p", "dim small", S.t("The years in between are played with: {s}.", { s: strategyName() })));
    cb.type = "checkbox"; ask.appendChild(cb); ask.appendChild(document.createTextNode(S.t("Do not ask again (Settings > Debug)")));
    b.appendChild(ask);
    function remember() { if (cb.checked) { S.settings.debugConfirmEnd = false; S.saveSettings(); } }
    S.ui.dialog({ title: S.t("Play into the ending?"), icon: "warning", body: b, buttons: [
      { label: S.t("Cancel"), onClick: remember },
      { label: S.t("Play into the ending"), onClick: function () { remember(); setTimeout(function () { go(year); }, 200); } },
      { label: S.t("Stop at {y}", { y: end - 1 }), primary: true, onClick: function () { remember(); setTimeout(function () { go(end - 1); }, 200); } }
    ] });
  }
  S.debugActions = {
    decide: function () { S.debugRun(S.t("Decide all with {s}", { s: strategyName() }), function (G) { S.auto.decideAll(G, S.debugState.strategy); }); },
    endYear: function () {
      var G = S.G;
      if (G && G.year + 1 >= S.debugPeriodEnd(G)) { jump(G.year + 1, true); return; }
      S.debugRun(S.t("End {y} with {s}", { y: G ? G.year : "", s: strategyName() }), function (G2) { S.auto.decideAll(G2, S.debugState.strategy); Gm.endYear(G2); });
    },
    playTo: jump
  };
  /* Keys while debug is on: D decides every item, Y ends the year, P plays
     to the target year; never while typing or while a dialog is open, and
     only while Settings > Keyboard > Debug is on */
  document.addEventListener("keydown", function (e) {
    if (!(S.debugOn() || S.debugBarOn()) || !S.keyOn("debug") || !S.G || e.ctrlKey || e.metaKey || e.altKey || e.repeat || (S.ui.dialogOpen && S.ui.dialogOpen())) { return; }
    if (/INPUT|SELECT|TEXTAREA/.test((e.target && e.target.tagName) || "") || document.querySelector(".coach") || (S.ui.busy && S.ui.busy())) { return; }
    if (S.keyIs(e, "debug.decide")) { e.preventDefault(); S.debugActions.decide(); }
    else if (S.keyIs(e, "debug.year")) { e.preventDefault(); S.debugActions.endYear(); }
    else if (S.keyIs(e, "debug.play")) { e.preventDefault(); S.debugActions.playTo(S.debugState.to || Math.min(2071, S.G.year + 5)); }
  });

  /* ---------- Panel ---------- */
  function open() {
    if (panel) { draw(); return; }
    panel = el("div", "dbg");
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", S.t("Debug panel"));
    var head = el("div", "dbg-head");
    head.appendChild(S.icon("debug", "s16"));
    head.appendChild(el("span", "", S.t("Debug")));
    var x = S.button("", { icon: "close", cls: "flat", title: S.t("Hide the debug panel"), onClick: function () {
      S.debugHidden = true; S.applyDebug();
    } });
    x.setAttribute("aria-label", S.t("Hide the debug panel"));
    head.appendChild(x);
    panel.appendChild(head);
    panel.appendChild(el("div", "dbg-body"));
    document.body.appendChild(panel);
    drag(head);
    var pos = S.store.get("debug-pos");
    /* The panel can be resized from its corner; its size is kept with its place */
    if (pos && pos.w) { panel.style.width = pos.w + "px"; panel.style.height = pos.h + "px"; }
    if (pos) { place(pos.x, pos.y); }
    if (window.ResizeObserver) {
      var saveTimer = null;
      new ResizeObserver(function () {
        if (!panel) { return; }
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function () { if (panel) { savePos(); } }, 300);
      }).observe(panel);
    }
    draw();
  }
  /* The browser writes a size into the panel's style only when the player
     drags its corner, so only that size is kept */
  function savePos() {
    var r = panel.getBoundingClientRect(), pos = { x: r.left, y: r.top };
    if (panel.style.height) { pos.w = Math.round(r.width); pos.h = Math.round(r.height); }
    S.store.set("debug-pos", pos);
  }
  function close() {
    if (panel && panel.parentNode) { panel.parentNode.removeChild(panel); }
    panel = null;
  }
  function place(x, y) {
    var w = panel.offsetWidth, h = panel.offsetHeight;
    x = Math.max(0, Math.min(window.innerWidth - w, x));
    y = Math.max(0, Math.min(window.innerHeight - Math.min(h, 60), y));
    panel.style.left = x + "px"; panel.style.top = y + "px"; panel.style.right = "auto"; panel.style.bottom = "auto";
  }
  function drag(handle) {
    var sx, sy, ox, oy, on = false;
    handle.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) { return; }
      on = true; sx = e.clientX; sy = e.clientY;
      var r = panel.getBoundingClientRect(); ox = r.left; oy = r.top;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", function (e) { if (on) { place(ox + e.clientX - sx, oy + e.clientY - sy); } });
    handle.addEventListener("pointerup", function () {
      if (!on) { return; }
      on = false;
      savePos();
    });
  }
  window.addEventListener("resize", function () {
    if (panel && panel.style.left) { var r = panel.getBoundingClientRect(); place(r.left, r.top); }
  });

  function kv(pairs) {
    var dl = el("dl", "dbg-kv");
    pairs.forEach(function (p) { dl.appendChild(el("dt", "", p[0])); dl.appendChild(el("dd", "", String(p[1]))); });
    return dl;
  }
  /* A labeled row: what the controls act on, then the controls */
  function row(label) {
    var r = el("div", "dbg-row");
    var lbl = el("span", "dbg-lbl", label || "");
    if (label) { lbl.title = label; }
    r.appendChild(lbl);
    var c = el("div", "dbg-ctl"); r.appendChild(c);
    r.appendChild = function (n) { return c.appendChild(n); };
    return r;
  }
  /* The panel is in tabs, as game debug overlays are, so it works at
     300px wide; the tabs stay at the top while a tab scrolls */
  var tab = "time";
  function tabs(body) {
    var bar = el("div", "dbg-tabs"); bar.setAttribute("role", "tablist");
    [["sit", S.t("Situation")], ["time", S.t("Time")], ["force", S.t("Events")], ["adjust", S.t("Adjust")], ["inspect", S.t("Inspect")]].forEach(function (t) {
      var b = el("button", "dbg-tab", t[1]); b.type = "button"; b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(tab === t[0]));
      b.addEventListener("click", function () { tab = t[0]; S.sound.play("select"); draw(); });
      bar.appendChild(b);
    });
    body.appendChild(bar);
  }
  function sec(body, title, key) {
    if (tab !== key) { return el("div"); }
    var inner = el("div", "dbg-sec-body"); inner.setAttribute("role", "tabpanel"); inner.setAttribute("aria-label", title);
    body.appendChild(inner);
    return inner;
  }
  /* told, when given, says in the log what the action did, where the
     button's label alone would not */
  function act(label, fn, icon, danger, told) {
    var b = S.button(label, { icon: danger ? "warning" : icon, cls: danger ? "danger" : "", onClick: function () { S.debugRun(told ? told() : label, fn); } });
    /* An ended run, under review, takes no action that changes it */
    if (S.G && Gm.closed(S.G)) { b.disabled = true; b.title = S.t("The run has ended, so it can only be reviewed."); }
    return b;
  }
  /* A list is as narrow as its chosen label allows, never its longest
     option, so the buttons after it stay on its line whenever they fit */
  var ruler = null;
  function fit(s) {
    var o = s.options[s.selectedIndex]; if (!o || !s.isConnected) { return; }
    var cs = getComputedStyle(s);
    ruler = ruler || document.createElement("canvas").getContext("2d");
    ruler.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    s.style.minWidth = Math.ceil(ruler.measureText(o.text).width + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) + 2) + "px";
  }
  function select(list) {
    var s = el("select");
    list.forEach(function (it) { var o = el("option", "", it[1]); o.value = it[0]; s.appendChild(o); });
    s.addEventListener("change", function () { fit(s); });
    requestAnimationFrame(function () { fit(s); });
    return s;
  }
  /* The strategy list, shared by the panel and the bar, which keep one choice */
  S.debugStrategySelect = function () {
    var s = select(STRATEGIES.map(function (x) { return [x[0], S.t(x[1])]; }));
    s.value = S.debugState.strategy;
    s.setAttribute("aria-label", S.t("Play with"));
    s.addEventListener("change", function () { S.debugState.strategy = s.value; S.emit("debug", {}); });
    return s;
  };
  /* The time controls, the same in the bar and the panel, in three
     groups: how the game is played, this year, and jumps. Each button says
     the year it goes to; the jump that ends the period is marked. */
  S.debugTimeControls = function (G, where) {
    var box = el("div", "dbg-time at-" + where), end = S.debugPeriodEnd(G);
    function group(label) {
      var g = el("div", "dbg-group"); g.setAttribute("role", "group"); g.setAttribute("aria-label", label);
      g.appendChild(el("span", "dbg-glabel", label));
      box.appendChild(g); return g;
    }
    var g1 = group(S.t("Play with"));
    g1.appendChild(S.debugStrategySelect());
    var press = null;
    if (where === "panel") {
      var pl = el("label", "check"); press = el("input"); press.type = "checkbox"; press.checked = true;
      pl.appendChild(press); pl.appendChild(document.createTextNode(S.t("Use initiatives to pressure governments"))); g1.appendChild(pl);
    }
    var closed = Gm.closed(G);
    var g2 = group(S.t("This year"));
    g2.appendChild(S.button(S.t("Decide all"), { icon: "ok", cls: "small", keyAction: "debug.decide", onClick: S.debugActions.decide }));
    g2.appendChild(S.button(S.t("End {y}", { y: G.year }), { icon: "skip", cls: "small" + (G.year + 1 >= end ? " danger" : ""), keyAction: "debug.year", onClick: S.debugActions.endYear }));
    var g3 = group(S.t("Jump"));
    var five = Math.min(end - 1, G.year + 5);
    var to = el("input"); to.type = "number"; to.min = G.year + 1; to.max = end; to.className = "dbg-year";
    to.value = Math.max(G.year + 1, Math.min(end, S.debugState.to || five || G.year + 1));
    to.setAttribute("aria-label", S.t("Year to go to"));
    var goBtn = S.button(S.t("Go to {y}", { y: to.value }), { icon: "next", cls: "small", keyAction: "debug.play", onClick: function () { jump(Number(to.value), press ? press.checked : true); } });
    to.addEventListener("input", function () { S.debugState.to = Number(to.value); goBtn.querySelector("span").textContent = S.t("Go to {y}", { y: to.value }); goBtn.classList.toggle("danger", Number(to.value) >= end); });
    goBtn.classList.toggle("danger", Number(to.value) >= end);
    g3.appendChild(to); g3.appendChild(goBtn);
    g3.appendChild(S.button(S.t("End the period"), { icon: "warning", cls: "small danger", title: S.t("Play to {y}, which ends the period", { y: end }), onClick: function () { jump(end, press ? press.checked : true); } }));
    if (closed) { box.querySelectorAll("button, input, select").forEach(function (c) { c.disabled = true; }); }
    return box;
  };

  function draw() {
    if (!panel) { return; }
    var body = panel.querySelector(".dbg-body"), G = S.G;
    S.clear(body);
    if (!G) {
      body.appendChild(S.placeholder("debug", S.t("No game in progress. Start one to use the debug tools.")));
      return;
    }
    var done = G.agenda.filter(function (e) { return e.done; }).length;
    var risks = M.members(G).map(function (k) { return [k, G.c[k].exitRisk || 0]; })
      .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 3)
      .map(function (r) { return r[0] + " " + r[1].toFixed(2); }).join(", ");
    var top = el("div", "dbg-top");
    tabs(top); body.appendChild(top);
    /* Under review the actions that change the run are disabled; the
       ending film, the achievement tester and Inspect still work */
    if (Gm.closed(G)) { body.appendChild(el("p", "dim small", S.t("The run has ended, so it can only be reviewed: the actions that change it are disabled."))); }
    var cur = sec(body, S.t("Situation"), "sit");
    cur.appendChild(kv([
      [S.t("Year"), G.year + " (" + G.mode + ")" + (Gm.closed(G) ? ", " + S.t("ended") : "")],
      [S.t("Agenda"), done + "/" + G.agenda.length + ", initiatives " + G.initiatives],
      [S.t("Backstop"), M.backstop(G).toFixed(2) + ", history " + M.histBackstop(Math.min(G.year, 2026)).toFixed(2)],
      [S.t("Main rate"), G.pol.rate.toFixed(2) + "%, history " + M.histRate(G.year).toFixed(2) + "%"],
      [S.t("Highest exit risk"), risks || "none"],
      [S.t("Trust, far right"), S.fmt(G.ea.v && G.ea.v.trust) + "%, " + S.fmt(G.ea.v && G.ea.v.fr) + "%"],
      [S.t("Ethics"), (G.ethics || 0).toFixed(2)],
      [S.t("Parliament"), G.parl ? Math.round(G.parl.conf) + " confidence" : "none"],
      /* The states the run assumes will join the EU: the year each is due,
         the year it joined, its date for the euro and, for Scotland,
         independence */
      [S.t("EU enlargement"), (G.accession || []).length ? G.accession.map(function (k) {
        var a = S.ACCESSION[k], c = G.c[k];
        return k + " EU " + (c.eu != null ? c.eu : "due " + a.eu) + ", euro " + (c.joined != null ? c.joined : c.applied ? "applies " + c.applied : "none") +
          (a.independent ? ", independent " + (c.independent != null ? c.independent : "due " + a.independent) : "");
      }).join("; ") : "none chosen"],
      /* Achievements: how many are kept, what the run earns, and what it
         meets by the rules alone (which Achievement notices announces) */
      [S.t("Achievements"), (function () {
        var kept = S.ACHIEVEMENTS.filter(function (a) { return S.ui.hasAchievement(a.id); }).length, earns = S.earnedBy(G, null), meets = S.metBy(G, null);
        return kept + "/" + S.ACHIEVEMENTS.length + " kept; earns " + (earns.join(", ") || "none") + "; meets by the rules " + (meets.join(", ") || "none");
      })()],
      [S.t("Random state"), G.rng]
    ]));

    cur = sec(body, S.t("Time"), "time");
    cur.appendChild(S.debugTimeControls(G, "panel"));

    cur = sec(body, S.t("Force events"), "force");
    var prop = select(Object.keys(S.PROPOSALS).filter(function (k) { return !G.proposals[k].passed; }).map(function (k) { return [k, S.PROPOSALS[k].name]; }));
    if (prop.options.length) {
      var r3 = row(S.t("Proposal")); r3.appendChild(prop);
      r3.appendChild(act(S.t("Adopt"), function (G2) { G2.proposals[prop.value].passed = true; G2.proposals[prop.value].year = G2.year; Gm.log(G2, "Debug: " + S.PROPOSALS[prop.value].name + " (" + prop.value + ") adopted in " + G2.year + ".", "debug"); },
        null, false, function () { return "Adopt " + S.PROPOSALS[prop.value].name + " (" + prop.value + ") in " + S.G.year; }));
      cur.appendChild(r3);
    }
    var ctry = select(M.members(G).map(function (k) { return [k, S.COUNTRY[k].name]; }));
    var r4 = row(S.t("State")); r4.appendChild(ctry);
    /* The state chosen, by name and code, for the log and the run's mark */
    function state() { return S.COUNTRY[ctry.value].name + " (" + ctry.value + ")"; }
    r4.appendChild(act(S.t("Start a loan program"), function (G2) { S.startProgram(G2, ctry.value, "full"); Gm.log(G2, "Debug: a full loan program for " + state() + " begins in " + G2.year + ".", "debug"); },
      null, false, function () { return "Start a full loan program for " + state() + " in " + S.G.year; }));
    r4.appendChild(act(S.t("Make it leave the euro"), function (G2) {
      var c = G2.c[ctry.value], spread = c.v && c.v.s != null ? ", at a spread of " + S.fmt(c.v.s) : "";
      c.exited = G2.year; S.council.sync(G2);
      Gm.log(G2, "Debug: " + state() + " leaves the euro in " + G2.year + spread + "; its governor leaves the Governing Council, which now has " + M.members(G2).length + " member states.", "debug");
    }, null, true, function () { return "Make " + state() + " leave the euro in " + S.G.year; }));
    cur.appendChild(r4);
    /* EU enlargement: an item of a state the run may assume will join the
       EU, put on this year's agenda now. A state the run did not choose
       joins the run first; Scotland's accession and currency make it
       independent first, as the referendum would. */
    var ENL = { "eu-accession": "accession", "unilateral-euro": "the euro it uses", "scotland-referendum": "referendum", "scotland-currency": "currency" };
    var enl = [];
    S.CANDIDATES.forEach(function (c) {
      var a = S.ACCESSION[c.code];
      ["eu-accession", "unilateral-euro", "scotland-referendum", "scotland-currency"].forEach(function (id) {
        if (id === "unilateral-euro" && a.euro !== "unilateral") { return; }
        if (/^scotland/.test(id) && !a.independent) { return; }
        enl.push([id + ":" + c.code, c.name + ": " + S.t(ENL[id])]);
      });
    });
    var enlSel = select(enl);
    enlSel.setAttribute("aria-label", S.t("EU enlargement item"));
    var rE = row(S.t("EU enlargement")); rE.appendChild(enlSel);
    rE.appendChild(act(S.t("Put it on the agenda"), function (G2) {
      var v = enlSel.value.split(":"), id = v[0], k = v[1], c, added = Gm.addCandidate(G2, k, false);
      c = G2.c[k];
      if (added) { Gm.log(G2, "Debug: " + S.COUNTRY[k].name + " joins the run's EU enlargement.", "debug"); }
      if ((id === "eu-accession" || id === "scotland-currency") && S.ACCESSION[k].independent && c.independent == null) { c.independent = G2.year; }
      if (id === "eu-accession" && c.eu != null) { S.ui.toast(S.t("{s} is already in the EU.", { s: S.COUNTRY[k].name }), "warn"); return; }
      if (G2.agenda.some(function (e) { return e.id === id && e.args && e.args.code === k; })) { S.ui.toast(S.t("The item is already on the agenda."), "warn"); return; }
      G2.agenda.push({ id: id, args: { code: k }, done: false, choice: null, vote: null, result: "" });
      Gm.log(G2, "Debug: the item \"" + id + "\" for " + S.COUNTRY[k].name + " is put on the agenda of " + G2.year + ".", "debug");
    }, "add", false, function () { var v = enlSel.value.split(":"); return "Put the " + ENL[v[0]] + " item (" + v[0] + ") of " + S.COUNTRY[v[1]].name + " (" + v[1] + ") on the agenda of " + S.G.year; }));
    cur.appendChild(rE);
    var r5 = row(S.t("This run"));
    r5.appendChild(act(S.t("Start a succession"), function (G2) { G2.pendingSuccession = { accepted: true, chance: 1 }; }));
    cur.appendChild(r5);
    var ENDINGS = { breakup: "The euro breaks up", removal: "Removal by the Court", expulsion: "An expulsion annulled by the Court", noconfidence: "No confidence", notreelected: "Not re-elected",
      trust: "Trust collapses", farright: "Far-right majority", dissolution: "The bank is dissolved" };
    var why = select(Object.keys(Gm.OVER).map(function (k) { return [k, S.t(ENDINGS[k] || k)]; }));
    var r6 = row(S.t("Bad ending")); r6.appendChild(why);
    /* The log names the ending, its code and its reason */
    function ending() { return "the bad ending \"" + (ENDINGS[why.value] || why.value) + "\" (" + why.value + ")"; }
    r6.appendChild(act(S.t("End the run with it"), function (G2) {
      G2.over = { reason: why.value, year: G2.year };
      Gm.log(G2, "Debug: the run ends in " + G2.year + " with " + ending() + ": " + Gm.OVER[why.value], "debug");
    }, null, true, function () { return "End the run with " + ending() + " in " + S.G.year; }));
    cur.appendChild(r6);
    /* The ending film of any ending, played over the run without ending it */
    var film = select([["federation", S.t("The Federation, 2041")], ["loans", S.t("The last payment, 2070")], ["over", S.t("A run that ends early")]]);
    var r7 = row(S.t("Ending film, without ending")); r7.appendChild(film);
    r7.appendChild(S.button(S.t("Watch it"), { icon: "play", title: S.t("Plays the film over the run, which goes on"), onClick: function () {
      var G2 = S.G;
      if (!G2) { S.ui.toast(S.t("Start a game first."), "warn"); return; }
      var shown = film.value === "over" && !G2.over ? Object.assign({}, G2, { over: { reason: why.value, year: G2.year } }) : G2;
      S.ui.cinema(shown, film.value, null);
    } }));
    cur.appendChild(r7);

    /* Values to set by hand, for testing a situation without playing to it */
    cur = sec(body, S.t("Adjust"), "adjust");
    function num(value, step, min, max) {
      var n = el("input"); n.type = "number"; n.step = step; n.min = min; n.max = max; n.value = value; n.style.width = "90px";
      return n;
    }
    var rate = num(G.pol.rate.toFixed(2), 0.25, -1, 10); rate.setAttribute("aria-label", S.t("Main rate, %"));
    var r8 = row(S.t("Main rate, %")); r8.appendChild(rate);
    r8.appendChild(act(S.t("Set"), function (G2) { G2.pol.rate = Number(rate.value); }, "ok"));
    cur.appendChild(r8);
    var r9 = row(S.t("Initiatives"));
    r9.appendChild(act(S.t("Add one to initiative limit"), function (G2) { G2.initiatives++; }, "add"));
    r9.appendChild(act(S.t("Allow another advisor change"), function (G2) { G2.swapYear = null; }, "advisor"));
    cur.appendChild(r9);
    if (G.parl) {
      var conf = num(Math.round(G.parl.conf), 1, 0, 100); conf.setAttribute("aria-label", S.t("Parliament confidence"));
      var r10 = row(S.t("Parliament")); r10.appendChild(conf);
      r10.appendChild(act(S.t("Set the confidence"), function (G2) { G2.parl.conf = Math.max(0, Math.min(100, Number(conf.value))); }, "ok"));
      cur.appendChild(r10);
    }
    if (G.treaty.goal && G.year < 2041) {
      var r11 = row(S.t("Treaty"));
      r11.appendChild(act(S.t("Advance a stage"), function (G2) {
        if (G2.treaty.stage < 3) { G2.treaty.stage++; G2.treaty.progress = 0; } else { G2.treaty.progress = 100; }
      }, "next"));
      cur.appendChild(r11);
    }
    var r12 = row(S.t("Interface"));
    r12.appendChild(S.button(S.t("Run the tour"), { icon: "help", disabled: Gm.closed(G), onClick: function () { S.ui.tour(); } }));
    cur.appendChild(r12);
    /* The achievement tester: shows an achievement's notice without
       earning it, or earns or forgets it by hand. Achievements are kept
       across games, not in the run, so neither marks the run */
    var r13 = row(S.t("Achievements")), ach = select(S.ACHIEVEMENTS.map(function (a) { return [a.id, S.t(a.name)]; }));
    ach.setAttribute("aria-label", S.t("Achievement"));
    if (S.debugState.achievement) { ach.value = S.debugState.achievement; }
    ach.addEventListener("change", function () { S.debugState.achievement = ach.value; draw(); });
    r13.appendChild(ach);
    r13.appendChild(S.button(S.t("Show the notice"), { icon: "achievements", onClick: function () { S.ui.testAchievement(ach.value); } }));
    var earned = S.ui.hasAchievement(ach.value);
    r13.appendChild(S.button(earned ? S.t("Forget") : S.t("Earn"), { icon: earned ? "delete" : "ok", onClick: function () {
      S.ui.setAchievement(ach.value, !earned);
      S.sound.play(earned ? "delete" : "achievement");
      draw();
    } }));
    cur.appendChild(r13);
    /* The same switch as Settings > Debug > Achievement notices */
    var r14 = row(S.t("Achievement notices")), nl = el("label", "check"), nb = el("input");
    nb.type = "checkbox"; nb.checked = !!S.settings.debugAchieveDry;
    nb.addEventListener("change", function () { S.settings.debugAchieveDry = nb.checked; S.saveSettings(); });
    nl.appendChild(nb); nl.appendChild(document.createTextNode(S.t("Announce what the run earns without keeping it")));
    r14.appendChild(nl);
    cur.appendChild(r14);

    cur = sec(body, S.t("Inspect"), "inspect");
    var r7 = row(S.t("Data"));
    r7.appendChild(S.button(showModel ? S.t("Hide model values") : S.t("Show model values"), { icon: "table", onClick: function () { showModel = !showModel; draw(); } }));
    r7.appendChild(S.button(S.t("Copy the game data"), { icon: "copy", onClick: function () {
      try { navigator.clipboard.writeText(JSON.stringify(S.G)); S.ui.toast(S.t("The game data is copied.")); } catch (e) { S.ui.toast(S.t("The browser refused the clipboard."), "warn"); }
    } }));
    cur.appendChild(r7);
    if (showModel) {
      var t = el("table"), th = el("tr");
      [S.t("State"), S.t("Spread"), S.t("Spread in history"), S.t("Exit risk"), S.t("Fiscal loosening"), S.t("Output gap change"), S.t("Bank stability")].forEach(function (h, i) { th.appendChild(el("th", i ? "num" : "", h)); });
      var thead = el("thead"); thead.appendChild(th); t.appendChild(thead);
      var tb = el("tbody");
      M.members(G).forEach(function (k) {
        var c = G.c[k], v = c.v || {}, tr = el("tr");
        [k, S.fmt(v.s), S.fmt(M.baseSpread(k, Math.max(G.year - 1, 2008))), (c.exitRisk || 0).toFixed(2), S.fmt(c.L, 2), S.fmt(c.dGap, 2), S.fmt(v.bank, 0)]
          .forEach(function (x, i) { tr.appendChild(el("td", i ? "num" : "", x)); });
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      var w = el("div", "table-wrap"); w.appendChild(t); cur.appendChild(w);
    }
  }
  ["decide", "year", "render", "debug", "initiative"].forEach(function (n) { S.on(n, function () { draw(); }); });
})();
