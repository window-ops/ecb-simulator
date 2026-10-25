/* The window: title bar, toolbar, sidebar (bottom bar on phones),
   indicator bar, status bar, toasts, dialogs and the turn transition. The
   views draw into #page (js/ui/views/*.js). */
(function () {
  var S = window.ECBSIM, el = S.el, M = S.model, Gm = S.game;
  var U = S.ui = { view: "agenda", cardIndex: 0, sel: {}, country: "EA", views: {} };
  var VIEWS = [
    ["agenda", "Agenda", "agenda"], ["council", "Governing Council", "council"], ["countries", "Countries", "countries"],
    ["advisors", "Advisors", "advisor"], ["parliament", "Parliament", "parliament"], ["proposals", "Proposals and treaties", "proposals"],
    ["archive", "Archive", "archive"], ["glossary", "Glossary", "glossary"]
  ];
  U.VIEWS = VIEWS;
  /* The Not focused pill in the title bar. After a reload the game has
     not been clicked yet: the browser's own reload button keeps the
     focus, so keys do not reach the game, and the browser lets no sound
     start before a click or a key; the pill shows until the first click,
     tap or key in the page. On every screen it also shows while the game
     does not have the focus (S.pageFocused) */
  var reloaded = false;
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    reloaded = nav ? nav.type === "reload" : !!(performance.navigation && performance.navigation.type === 1);
  } catch (e) {}
  var unfocused = reloaded && !(navigator.userActivation && navigator.userActivation.hasBeenActive);
  /* Settings > Appearance > Not focused turns the pill off */
  function showUnfocused() { return S.settings.focusPill !== false && (unfocused || !S.pageFocused()); }
  function syncUnfocused() { var p = document.getElementById("unfocused"); if (p) { p.hidden = !showUnfocused(); } }
  function focused(e) {
    if (!e.isTrusted) { return; }
    unfocused = false;
    syncUnfocused();
    ["pointerdown", "keydown"].forEach(function (k) { document.removeEventListener(k, focused, true); });
  }
  if (unfocused) { ["pointerdown", "keydown"].forEach(function (k) { document.addEventListener(k, focused, true); }); }
  S.on("focus", syncUnfocused);
  S.on("render", syncUnfocused);

  U.build = function () {
    var app = document.getElementById("app");
    S.clear(app);
    /* The title bar and the toolbar make the page's banner landmark */
    var hdr = el("header", "app-head"), tb = el("div", "titlebar");
    tb.appendChild(S.logo("logo"));
    var title = el("span", "", ""); title.id = "app-title"; tb.appendChild(title);
    var sub = el("span", "sub"); sub.id = "app-sub"; tb.appendChild(sub);
    var pill = el("span", "badge unfocused", S.t("Not focused")); pill.id = "unfocused";
    pill.title = S.t("Click the game or press a key in it: the keys and the sound start then");
    pill.setAttribute("role", "status");
    pill.hidden = !showUnfocused(); tb.appendChild(pill);
    /* The Debug tag, shown while debug mode is on, turns the debug panel on
       and brings it back if the player hid it, on every screen */
    var tag = el("button", "tag", S.t("Debug")); tag.type = "button"; tag.id = "debug-tag";
    tag.title = S.t("Show the debug panel");
    tag.addEventListener("click", function () {
      S.settings.debugPanel = true; S.saveSettings();
      S.debugHidden = false; S.sound.play("open"); S.applyDebug(); U.render();
    });
    tag.hidden = !(S.debugMode && S.debugMode()); tb.appendChild(tag);
    hdr.appendChild(tb);

    var bar = el("div", "toolbar"); bar.setAttribute("role", "toolbar"); bar.setAttribute("aria-label", S.t("Main toolbar"));
    /* data-keep ranks the actions that stay on a phone's bar while there is
       room (U.fitToolbar): 1 stays first */
    var fresh = S.button(S.t("New game"), { icon: "new", collapse: true, cls: "flat in-menu", onClick: function () { U.confirmNew(); } });
    fresh.dataset.keep = "5"; bar.appendChild(fresh);
    var save = S.button(S.t("Save"), { icon: "save", collapse: true, cls: "flat in-menu", keyAction: "window.save", press: true, hint: "title", onClick: function () { U.savesDialog("save"); } });
    save.id = "save-game"; save.hidden = !S.G; save.dataset.keep = "1"; bar.appendChild(save);
    var load = S.button(S.t("Load"), { icon: "open", collapse: true, cls: "flat in-menu", keyAction: "window.load", press: true, hint: "title", onClick: function () { U.savesDialog("load"); } });
    load.id = "load-game"; load.dataset.keep = "2"; bar.appendChild(load);
    /* Leaving saves the game and returns to the title screen and its menu */
    var leave = S.button(S.t("Leave the game"), { icon: "leave", collapse: true, cls: "flat in-menu", onClick: function () { U.leaveGame(); } });
    leave.id = "leave-game"; leave.title = S.t("Save the game and return to the title screen"); leave.dataset.keep = "7";
    bar.appendChild(leave);
    bar.appendChild(el("span", "sep"));
    var endBtn = S.button(S.t("End year"), { icon: "skip", cls: "primary", keyAction: "year.end", onClick: function () { U.endYear(); } });
    endBtn.id = "end-year"; endBtn.title = S.keyOn("year") ? S.t("End the year ({k})", { k: S.keyLabel(S.keyFor("year.end")) }) : S.t("End the year");
    bar.appendChild(endBtn);
    bar.appendChild(el("span", "spacer"));
    var snd = S.button("", { icon: S.settings.sound ? "volume" : "muted", cls: "flat", title: S.t("Sound on or off"), keyAction: "window.sound", press: true, hint: "title", onClick: function () {
      S.settings.sound = !S.settings.sound; S.saveSettings(); S.sound.apply(); U.syncSound(); U.render();
    } });
    snd.id = "sound-btn";
    snd.setAttribute("aria-label", S.settings.sound ? S.t("Sound on") : S.t("Sound off"));
    bar.appendChild(snd);
    /* Game settings, the settings of the open game, shows only while a game is open */
    [["Achievements", "achievements", "6", function () { U.achievementsDialog(); }], ["Game settings", "difficulty", "8", function () { U.gameSettingsDialog(); }, "window.game", "game-settings"],
      ["Settings", "settings", "3", function () { U.settingsDialog(); }, "window.settings"],
      ["Help", "help", "4", function () { U.helpDialog(); }, "window.help"]].forEach(function (x) {
      var b = S.button(S.t(x[0]), { icon: x[1], collapse: true, cls: "flat in-menu", keyAction: x[4], press: !!x[4], hint: "title", onClick: x[3] });
      b.dataset.keep = x[2]; bar.appendChild(b);
      if (x[5]) { b.id = x[5]; b.hidden = !S.G; }
    });
    /* On a phone the buttons marked in-menu move into this menu, as in a
       Kirigami application on a phone: the toolbar keeps End year, the
       sound and the menu, each large enough to touch */
    var menuBtn = el("button", "btn icon-only flat tool-menu"); menuBtn.type = "button";
    menuBtn.appendChild(S.icon("overflow")); menuBtn.title = S.t("Menu");
    menuBtn.addEventListener("click", function (e) {
      if (e) { e.stopPropagation(); }
      var list = el("div", "");
      Array.prototype.forEach.call(bar.querySelectorAll(".btn.in-menu"), function (orig) {
        if (orig.hidden || orig.disabled || orig.classList.contains("kept")) { return; }
        var it = el("button", "sideitem"); it.type = "button";
        it.appendChild(orig.querySelector("svg").cloneNode(true));
        it.appendChild(el("span", "", orig.getAttribute("aria-label") || orig.textContent.trim()));
        it.disabled = orig.disabled;
        it.addEventListener("click", function () { S.closePopover(true); orig.click(); });
        list.appendChild(it);
      });
      /* It opens at the right edge just under the toolbar, as More opens just above the tabs */
      var pop = S.popover(menuBtn, null, null, list);
      if (pop) {
        pop.classList.add("menu-pop", "tool-pop", "menu-down");
        pop.style.left = "";
        pop.style.top = (bar.getBoundingClientRect().bottom + 4) + "px";
      }
    });
    menuBtn.setAttribute("aria-label", S.t("Menu"));
    menuBtn.setAttribute("aria-haspopup", "menu");
    bar.appendChild(menuBtn);
    hdr.appendChild(bar);
    app.appendChild(hdr);
    setTimeout(U.fitToolbar, 0);
    /* Labels drawn in the fallback font measure differently: measure again once Noto Sans is in */
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(U.fitToolbar); }

    var body = el("div", "body");
    var side = el("nav", "sidebar"); side.id = "sidebar"; side.setAttribute("aria-label", S.t("Views"));
    body.appendChild(side);
    /* The area under the toolbar scrolls as one: the indicators scroll away
       with the page or, by Settings > Appearance > Indicators, stay at its top */
    var main = el("main", "main"); main.id = "main";
    var ind = el("div", "indicators"); ind.id = "indicators"; ind.setAttribute("aria-label", S.t("Indicators"));
    main.appendChild(ind);
    /* The page scrolls, so it takes keyboard focus and has a name */
    var page = el("div", "page"); page.id = "page"; page.tabIndex = 0;
    page.setAttribute("role", "region"); page.setAttribute("aria-label", S.t("Page"));
    main.appendChild(page);
    /* Announcements for screen readers: votes and decisions */
    var live = el("div", "sr-only"); live.id = "sr-live"; live.setAttribute("aria-live", "polite"); live.setAttribute("role", "status");
    main.appendChild(live);
    body.appendChild(main);
    app.appendChild(body);

    var st = el("footer", "statusbar"); st.id = "statusbar"; app.appendChild(st);
    var bn = el("nav", "bottomnav"); bn.id = "bottomnav"; bn.setAttribute("aria-label", S.t("Views")); app.appendChild(bn);
    S.applyTitle();
  };

  /* A toolbar too narrow for its labels shows the collapsible buttons as
     icons alone; it is measured with its labels each time the window
     changes width */
  U.fitToolbar = function () {
    var bar = document.querySelector(".toolbar");
    if (!bar) { return; }
    bar.classList.remove("tight", "all-kept");
    var acts = Array.prototype.slice.call(bar.querySelectorAll(".btn.in-menu"));
    acts.forEach(function (b) { b.classList.remove("kept"); });
    if (!(window.matchMedia && window.matchMedia("(max-width: 599px)").matches)) {
      if (bar.scrollWidth > bar.clientWidth + 1) { bar.classList.add("tight"); }
      return;
    }
    /* On a phone the actions stay on the bar as icons, in the order of
       data-keep, while the space left beside End year stays at least one
       button wide and nothing scrolls; the rest wait in the menu. An action
       that cannot be used now (Leave the game on the title screen) stays
       out of both, and the menu hides when nothing is left in it. A large
       phone keeps more actions on the bar. */
    var spacer = bar.querySelector(".spacer"), MIN = 32;
    var wanted = acts.filter(function (b) { return !b.hidden && !b.disabled; }).sort(function (a, b) { return a.dataset.keep - b.dataset.keep; });
    if (!wanted.length) { bar.classList.add("all-kept"); return; }
    for (var i = 0; i < wanted.length; i++) {
      wanted[i].classList.add("kept");
      var all = i === wanted.length - 1;
      bar.classList.toggle("all-kept", all);
      if (spacer.getBoundingClientRect().width < MIN || bar.scrollWidth > bar.clientWidth + 1) {
        wanted[i].classList.remove("kept");
        bar.classList.remove("all-kept");
        break;
      }
    }
  };
  var fitTimer = null;
  window.addEventListener("resize", function () { clearTimeout(fitTimer); fitTimer = setTimeout(U.fitToolbar, 100); });

  /* The toolbar's sound icon follows the setting without a redraw */
  U.syncSound = function () {
    var b = document.getElementById("sound-btn");
    if (b) { S.clear(b); b.appendChild(S.icon(S.settings.sound ? "volume" : "muted")); b.setAttribute("aria-label", S.settings.sound ? S.t("Sound on") : S.t("Sound off")); }
  };

  U.announce = function (text) {
    var l = document.getElementById("sr-live");
    if (!l) { return; }
    l.textContent = "";
    setTimeout(function () { l.textContent = text; }, 60);
  };

  /* The compact window class of a phone, below 600px (css/app.css) */
  U.phone = function () { return !!(window.matchMedia && window.matchMedia("(max-width: 599px)").matches); };
  /* Smaller map and charts, as Settings keeps them; a phone always draws them at their usual size */
  U.compactCharts = function () { return !!S.settings.compactCountries && !U.phone(); };

  /* The element that scrolls the page */
  U.scroller = function () { return document.getElementById("main"); };

  U.go = function (v) {
    U.view = v;
    S.sound.play("select");
    U.render();
    var p = document.getElementById("page"); if (p) { U.scroller().scrollTop = 0; p.focus({ preventScroll: true }); }
    var al = p && p.querySelector(".agenda-list"); if (al) { al.scrollLeft = 0; }
  };

  var lastCard = null, lastGame;
  /* Above every page of a finished run except the agenda, which says it
     in its own words: what happened, and the way back */
  function reviewBanner(G) {
    var b = el("div", "result review-banner" + (G.over ? " crashed" : G.finished === "post" ? " finished" : ""));
    b.appendChild(el("p", "", G.over || G.finished === "post" ? S.t("Review mode: the run ended in {y}. You can look through it; nothing can be changed.", { y: Gm.shownYear(G) }) :
      S.t("Review mode: this period has ended. You can look through it; nothing can be changed.")));
    b.appendChild(endingButton());
    return b;
  }
  function endingButton() {
    return S.button(S.t("Back to the summary"), { cls: "primary", onClick: function () { U.review = false; U.render(); } });
  }
  U.endingButton = endingButton;
  U.render = function () {
    var G = S.G;
    /* A redraw keeps the reader where they were: the page, the agenda list
       and the indicators keep their scroll positions (U.go resets them when
       the view changes) */
    var page = document.getElementById("page"), ind = document.getElementById("indicators"), sc = U.scroller();
    var keep = { top: sc ? sc.scrollTop : 0, ind: ind ? ind.scrollLeft : 0, list: 0 };
    var al = page && page.querySelector(".agenda-list");
    if (al) { keep.list = al.scrollLeft; }
    /* A new game, a loaded game or the start page starts at the top */
    if (G !== lastGame) { keep.top = 0; keep.list = 0; lastGame = G; }
    S.applyTitle();
    var sub = document.getElementById("app-sub");
    if (sub) { sub.textContent = G ? S.bankName().full + " · " + Gm.shownYear(G) : S.bankName().full; }
    renderSidebar(); renderBottom(); renderIndicators(); renderStatus();
    var lv = document.getElementById("leave-game");
    if (lv) { lv.disabled = !G; }
    var save = document.getElementById("save-game");
    if (save) { save.hidden = !G; }
    var gs = document.getElementById("game-settings");
    if (gs) { gs.hidden = !G; }
    var load = document.getElementById("load-game");
    if (load) { load.hidden = false; }
    /* Save and Load: Load stays available even with no saves (for Import) */
    U.fitToolbar();
    var end = document.getElementById("end-year");
    if (end) { end.disabled = !G || !!G.over || !!G.finished || !Gm.allDone(G) || !!G.pendingSuccession; }
    /* The title screen stays in place while it shows the same, so its motion continues */
    var keepTitle = !G && U.title && U.titleFresh(page);
    if (!keepTitle) { S.clear(page); }
    sc.onscroll = null;
    if (!U.keepTip || U.view !== "countries") { U.keepTip = false; document.querySelectorAll(".map-tip").forEach(function (t) { t.remove(); }); }
    /* A run that has ended is read-only: review mode, with a banner on
       every page. After a bad ending the crash screen covers the window
       until the player chooses to review the run. */
    if (!Gm.closed(G)) { U.review = false; }
    /* While the ending film plays, its end screen waits: the film comes
       first and leads into it */
    var kind = U.endScreenFor && U.endScreenFor(G), crash = document.querySelector(".crash"), dead = !!kind && !U.review;
    var filmOn = !!document.querySelector(".cine:not(.closing)");
    var runKey = G ? String(G.id) + kind + Gm.shownYear(G) : "";
    if (crash && (!dead || crash.dataset.run !== runKey)) { U.release(crash); crash.remove(); crash = null; }
    if (dead && !crash && !filmOn) {
      crash = kind === "finale" ? U.finaleScreen(G) : kind === "federation" ? U.federationScreen(G) : U.crashScreen(G); crash.dataset.run = runKey;
      /* Laid under a film that fades out, or loaded directly from a save:
         shown at once, so the page never shows through the fade */
      var fromLoad = U.fromLoad; U.fromLoad = false;
      if (document.querySelector(".cine.closing") || fromLoad) { crash.classList.add("led"); }
      document.body.appendChild(crash);
      U.require(crash);
      /* The screen itself takes the focus, never its first button, so an
         Enter pressed to end the film cannot act on the screen; Tab
         reaches the buttons */
      crash.tabIndex = -1; crash.focus({ preventScroll: true });
    }
    document.documentElement.classList.toggle("crash-open", !!crash);
    /* Its actions are measured again at each render, as the text size may have changed */
    if (crash) { U.fitActions(crash); }
    if (!keepTitle) {
      if (!G) { (U.deleted ? U.views.deleted : U.title ? U.views.title : U.views.start)(page); }
      else {
        if (Gm.closed(G) && U.view !== "agenda") { page.appendChild(reviewBanner(G)); }
        (U.views[U.view] || U.views.agenda)(page, G);
      }
    }
    sc.scrollTop = keep.top;
    /* A new card on the agenda starts at its top when that is above the
       view. On a phone, moving to another item brings the agenda strip and
       the new card into view, with the current item visible in the strip. */
    /* The strip: the compact and medium window classes, below 840px (css/app.css) */
    var card = page.querySelector("[data-tour=card]"), phone = window.matchMedia && window.matchMedia("(max-width: 839px)").matches;
    /* U.toCard asks for the same after a decision, which shrinks the card.
       A tap on an item in the phone's strip leaves the page and the strip
       where they are: the player is looking at them already. */
    var moved = card && ((lastCard !== null && U.cardIndex !== lastCard) || U.toCard);
    var tapped = phone && U.fromStrip && !U.toCard;
    U.toCard = false; U.fromStrip = false;
    if (tapped) { moved = false; }
    if (card && !tapped && (U.cardIndex !== lastCard || moved)) {
      /* Positions count from the top of the visible area, under the indicators when they stay */
      var pr = S.settings.stickyIndicators && !ind.hidden ? ind.getBoundingClientRect().bottom : sc.getBoundingClientRect().top;
      var top = card.getBoundingClientRect().top - pr + sc.scrollTop - 8;
      if (phone && moved) {
        var strip = page.querySelector(".agenda-list");
        top = (strip ? strip.getBoundingClientRect().top : card.getBoundingClientRect().top) - pr + sc.scrollTop - 8;
        sc.scrollTop = Math.max(0, top);
      } else if (sc.scrollTop > top) { sc.scrollTop = Math.max(0, top); }
    }
    if (ind) { ind.scrollLeft = keep.ind; }
    al = page.querySelector(".agenda-list");
    if (al) {
      al.scrollLeft = keep.list;
      var cur = al.querySelector('[aria-current="true"]');
      if (moved && cur) {
        var lr = al.getBoundingClientRect(), cr = cur.getBoundingClientRect();
        if (cr.left < lr.left || cr.right > lr.right) { al.scrollLeft += cr.left - lr.left - (lr.width - cr.width) / 2; }
      }
    }
    lastCard = U.cardIndex;
    S.levelHeadings();
    /* Before a game the music follows the title screen */
    if (!G) { if (S.music) { S.music.update(); } return; }
    S.emit("render", { view: U.view });
  };

  function renderSidebar() {
    var side = document.getElementById("sidebar"), G = S.G;
    S.clear(side);
    /* Without a game the sidebar has nothing to offer and steps aside, so
       the start page stands in the middle of the whole window */
    document.documentElement.classList.toggle("no-game", !G);
    document.documentElement.classList.toggle("logo-accent", !!S.settings.logoAccent);
    side.hidden = !G;
    if (!G) { return; }
    VIEWS.forEach(function (v) {
      var b = el("button", "sideitem"); b.type = "button";
      b.appendChild(S.icon(v[2]));
      b.appendChild(el("span", "", S.t(v[1])));
      if (v[0] === "agenda") {
        var left = G.agenda.filter(function (e) { return !e.done; }).length;
        if (left) { b.appendChild(el("span", "count", String(left))); }
      }
      if (U.view === v[0]) { b.setAttribute("aria-current", "page"); }
      b.addEventListener("click", function () { U.go(v[0]); });
      side.appendChild(b);
    });
    /* On a desktop the sidebar's foot shows what a status bar would:
       the president, the year, the term and the backstop */
    var p = G.president, foot = el("div", "side-foot");
    var who = el("div", "side-who"), nm = el("b", "", p.name); nm.title = p.name; who.appendChild(nm);
    who.appendChild(el("span", "", "(" + S.COUNTRY[p.country].name + ")" + (p.weak ? ", " + S.t("compromise candidate") : "")));
    foot.appendChild(who);
    /* Labels on the left and figures on the right, one pair a line */
    var kv = el("dl", "side-kv"), term = U.termParts(G);
    function pair(k, v) { var d = el("div"), t = el("dt", "", k); t.title = k; d.appendChild(t); d.appendChild(el("dd", "", v)); kv.appendChild(d); return d; }
    pair(S.t("Year"), String(Gm.shownYear(G)));
    pair(term[0], String(term[1]));
    pair(S.t("Backstop"), Math.round(M.backstop(G) * 100) + "%").id = "side-backstop";
    if (G.parl) { pair(S.t("Parliament confidence"), String(Math.round(G.parl.conf))); }
    foot.appendChild(kv);
    /* The player is drawn in the sidebar's foot and in the status bar; CSS
       shows the one that is visible (on a phone, the status bar) */
    if (U.eggPlaying) { foot.appendChild(U.eggPlayer()); }
    side.appendChild(foot);
  }
  function renderBottom() {
    var bn = document.getElementById("bottomnav"), G = S.G;
    S.clear(bn);
    /* Without a game there are no tabs, and the empty bar would leave a
       strip under the status bar */
    bn.hidden = !G;
    if (!G) { return; }
    var main = ["agenda", "council", "countries", "advisors"];
    VIEWS.filter(function (v) { return main.indexOf(v[0]) >= 0; }).forEach(function (v) {
      var b = el("button"); b.type = "button";
      b.appendChild(S.icon(v[2])); b.appendChild(el("span", "", S.t(v[1] === "Governing Council" ? "Council" : v[1])));
      if (U.view === v[0]) { b.setAttribute("aria-current", "page"); }
      b.addEventListener("click", function () { U.go(v[0]); });
      bn.appendChild(b);
    });
    var more = el("button"); more.type = "button";
    more.appendChild(S.icon("menu")); more.appendChild(el("span", "", S.t("More")));
    if (main.indexOf(U.view) < 0) { more.setAttribute("aria-current", "page"); }
    more.addEventListener("click", function (e) {
      e.stopPropagation();
      var list = el("div", "");
      VIEWS.filter(function (v) { return main.indexOf(v[0]) < 0; }).forEach(function (v) {
        var b = el("button", "sideitem"); b.type = "button";
        b.appendChild(S.icon(v[2])); b.appendChild(el("span", "", S.t(v[1])));
        b.addEventListener("click", function () { S.closePopover(true); U.go(v[0]); });
        list.appendChild(b);
      });
      /* On a phone the menu opens above the tabs, at the right edge */
      var menu = S.popover(more, null, null, list);
      if (menu) {
        menu.classList.add("menu-pop", "menu-up"); menu.style.left = ""; menu.style.top = "";
        /* Just above the tabs; it may cover the status bar */
        menu.style.bottom = (window.innerHeight - bn.getBoundingClientRect().top + 4) + "px";
      }
    });
    bn.appendChild(more);
  }

  /* ---------- Indicators ---------- */
  var SOURCES = {
    p: "Eurostat, prc_hicp_aind", u: "Eurostat, une_rt_a", s: "Eurostat, irt_lt_mcby_a", d: "Eurostat, gov_10dd_edpt1",
    bank: "ECB, CISS and CLIFS, rescaled", trust: "Standard Eurobarometer", fr: "European Parliament results", fy: "Model"
  };
  var DESC = {
    p: "Annual inflation of consumer prices in the euro area. The target is close to 2%.",
    u: "Unemployed people as a share of the labor force, euro area, weighted by the labor force.",
    s: "Average 10-year spread over Germany.",
    d: "General government gross debt as a share of output, euro area.",
    bank: "Stability of the banks, 0 to 100. Below 40, banks in some states face runs.",
    trust: "Share of people who tend to trust the bank. Below 20% for two years, the president must resign.",
    fr: "Far-right share of seats in the European or Federal Parliament. A majority ends the game.",
    fy: "Yield on 10-year federal bonds."
  };
  function lastElection(G, years) {
    var out = [];
    years.forEach(function (y) { if (y < G.year && G.series.EA && G.series.EA.fr && G.series.EA.fr[y] != null) { out.push(G.series.EA.fr[y]); } });
    return out;
  }
  U.farRightConcern = function (G) {
    var v = G.ea.v || {}, fr = v.fr || 0;
    var el2 = lastElection(G, S.HIST.EP_ELECTIONS.concat(S.HIST.FED_ELECTIONS));
    var rise = el2.length >= 2 ? el2[el2.length - 1] - el2[el2.length - 2] : 0;
    return fr >= 30 || rise >= 5;
  };
  var shown = {};
  function renderIndicators() {
    var box = document.getElementById("indicators"), G = S.G;
    S.clear(box);
    if (!G || !G.ea.v) { box.hidden = true; return; }
    box.hidden = false;
    var v = G.ea.v, prevY = G.year - 2, ea = G.series.EA || {};
    var maxS = null;
    M.members(G).forEach(function (k) { var c = G.c[k]; if (c.v && (!maxS || c.v.s > G.c[maxS].v.s)) { maxS = k; } });
    var list = [
      ["p", S.t("Inflation"), v.p, "%", function (x) { return x > 4 || x < 0; }],
      ["u", S.t("Unemployment"), v.u, "%", function (x) { return x > 11; }],
      G.mode === "post" ? ["fy", S.t("Federal yield"), v.fy, "%", function (x) { return x > 6; }] :
        ["s", S.t("Spreads"), v.s, " " + S.t("points"), function (x) { return x > 2.5; }, maxS ? S.t("Highest: {c}, {v} points", { c: S.COUNTRY[maxS].name, v: S.fmt(G.c[maxS].v.s) }) : ""],
      ["d", S.t("Debt"), v.d, "%", function () { return false; }],
      ["bank", S.t("Banks"), v.bank, "", function (x) { return x < 45; }],
      ["trust", S.t("Trust"), v.trust, "%", function (x) { return x < 30; }]
    ];
    if (U.farRightConcern(G)) { list.unshift(["fr", S.t("Far right"), v.fr, "% seats", function () { return true; }]); }
    var year = G.year - 1;
    list.forEach(function (it) {
      var b = el("button", "ind"); b.type = "button";
      var alert = it[4](it[2]);
      if (alert) { b.classList.add("alert"); }
      var k = el("div", "k");
      if (alert) { k.appendChild(S.icon("warning", "s16")); }
      k.appendChild(document.createTextNode(it[1] + " " + (v.seeded ? S.t("latest") : year)));
      b.appendChild(k);
      var val = el("div", "v");
      var num = el("span", "", S.fmt(it[2]));
      val.appendChild(num); val.appendChild(document.createTextNode(it[3]));
      var prev = ea[it[0]] && ea[it[0]][prevY];
      if (prev != null && it[2] != null) {
        var dlt = it[2] - prev;
        val.appendChild(el("span", "d", (dlt >= 0 ? "+" : "") + S.fmt(dlt)));
      }
      b.appendChild(val);
      /* Values count to their new figure when the year changes */
      var key = it[0] + year;
      if (!shown[key] && prev != null && it[2] != null && isFinite(prev)) {
        shown[key] = true; countTo(num, prev, it[2]);
      }
      b.addEventListener("click", function () {
        var t = DESC[it[0]];
        var extra = el("div", "small");
        /* A note the strip has no room for, such as the highest spread */
        if (it[5]) { extra.appendChild(el("div", "src", it[5])); }
        if (year <= 2025 && year >= 2008 && ["p", "u", "s", "d"].indexOf(it[0]) >= 0) {
          extra.appendChild(el("div", "dim src", S.t("Source: {s}.", { s: SOURCES[it[0]] })));
        } else if (year <= 2025 && SOURCES[it[0]]) {
          extra.appendChild(el("div", "dim src", S.t("Record: {s}.", { s: SOURCES[it[0]] })));
        } else {
          extra.appendChild(el("div", "dim src", S.t("After 2025 the figures come from the model and Selk's history.")));
        }
        S.popover(b, it[1] + " " + year + ": " + S.fmt(it[2]) + it[3], t, extra);
      });
      box.appendChild(b);
    });
  }
  function countTo(node, from, to) {
    var t0 = null, dur = 600;
    function step(t) {
      if (t0 == null) { t0 = t; }
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      node.textContent = S.fmt(from + (to - from) * e);
      if (k < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }
  function renderStatus() {
    var st = document.getElementById("statusbar"), G = S.G;
    S.clear(st);
    if (U.eggPlaying && (!G || !S.settings.sound || !S.settings.music)) {
      U.eggPlaying = false;
      U.eggPaused = false;
      S.music.stopForced();
    }
    if (!G) { st.appendChild(el("span", "", S.t("Ready"))); return; }
    var p = G.president;
    var a = el("span"); a.appendChild(el("b", "", p.name)); a.appendChild(document.createTextNode(" (" + S.COUNTRY[p.country].name + ")" + (p.weak ? ", " + S.t("compromise candidate") : "")));
    st.appendChild(a);
    st.appendChild(el("span", "", S.t("Year {y}", { y: Gm.shownYear(G) })));
    var term = U.termText(G);
    st.appendChild(el("span", "wide", term));
    /* On a phone the bar scrolls sideways, so every item stays in it */
    st.appendChild(el("span", "wide", S.t("Initiatives left: {n}", { n: G.initiatives })));
    var bs = el("span", "", S.t("Backstop: {v}%", { v: Math.round(M.backstop(G) * 100) })); bs.id = "status-backstop";
    st.appendChild(bs);
    if (G.parl) { st.appendChild(el("span", "wide", S.t("Parliament confidence: {v}", { v: Math.round(G.parl.conf) }))); }
    if (U.eggPlaying) { st.appendChild(U.eggPlayer()); }
  }
  /* The fifth quick click shows the tooltip clue by itself, then starts
     TROIKA.RUN on the next frame, provided Sound and the soundtrack are on. */
  var greeceClicks = [];
  U.countryClicked = function (code) {
    var now = Date.now();
    if (code !== "GR" || !S.settings.sound || !S.settings.music) {
      greeceClicks = []; U.greeceHint = false;
      if (document.querySelector(".map-tip .egg-hint")) { U.keepTip = false; }
      document.querySelectorAll(".map-tip .egg-hint").forEach(function (line) { line.remove(); });
      return;
    }
    /* A pause of more than a second and a half starts the count again */
    if (greeceClicks.length && now - greeceClicks[greeceClicks.length - 1] > 1500) { greeceClicks = []; }
    greeceClicks.push(now);
    if (greeceClicks.length >= 5) {
      greeceClicks = [];
      if (U.eggPlaying) { return; }
      U.greeceHint = true;
      var tip = document.querySelector(".map-tip");
      if (tip) {
        S.clear(tip);
        tip.dataset.code = "GR";
        tip.appendChild(el("div", "egg-hint", S.t("You seem obsessed with Greece and its euro crisis.")));
      }
      U.announce(S.t("You seem obsessed with Greece and its euro crisis."));
      /* Start the song as soon as the fifth click shows the clue. */
      S.music.play("troikarun");
      requestAnimationFrame(function () {
        if (!S.settings.sound || !S.settings.music) { S.music.stopForced(); U.greeceHint = false; U.render(); return; }
        U.eggPaused = false;
        U.eggPlaying = true;
        U.keepTip = true;
        U.render();
      });
    }
  };
  U.stopEgg = function () {
    U.eggPlaying = false;
    U.eggPaused = false;
    S.music.stopForced();
    U.render();
  };
  U.toggleEggPause = function () {
    U.eggPaused = !U.eggPaused;
    S.music.pauseForced(U.eggPaused);
    U.render();
  };
  /* The song player in the existing status area. */
  U.eggPlayer = function () {
    var row = el("div", "egg-player");
    var songStatus = U.eggPaused ? S.t("Paused: TROIKA.RUN") : S.t("Playing: TROIKA.RUN");
    row.title = songStatus;
    row.setAttribute("role", "group"); row.setAttribute("aria-label", songStatus);
    /* The speaker opens the song's volume, a vertical bar as in a media
       player; the level is kept with the other pieces' levels */
    /* Opening sounds with a click; pressing it again closes the volume with
       the close sound alone */
    var vol = S.button("", { icon: "volume", cls: "flat small vol-btn", title: S.t("Song volume") });
    vol.addEventListener("click", function (e) {
      if (e) { e.stopPropagation(); }
      var tr = S.settings.tracks.troikarun, box = el("div", "vol-bar"), out = el("span", "small", tr.vol + "%"), inp = el("input");
      inp.type = "range"; inp.min = 0; inp.max = 100; inp.step = 5; inp.value = tr.vol;
      inp.setAttribute("aria-label", S.t("TROIKA.RUN volume")); inp.setAttribute("aria-orientation", "vertical");
      function show() { out.textContent = inp.value + "%"; inp.style.setProperty("--fill", inp.value + "%"); }
      inp.addEventListener("input", function () { tr.vol = Number(inp.value); show(); S.saveSettings(); S.music.apply(); });
      show();
      box.appendChild(out); box.appendChild(inp);
      var pop = S.popover(vol, null, null, box);
      if (pop) { S.sound.click(); pop.classList.add("vol-pop"); }
    });
    vol.setAttribute("aria-label", S.t("Song volume"));
    vol.setAttribute("aria-haspopup", "dialog");
    row.appendChild(vol);
    row.appendChild(el("span", "egg-name", S.t("TROIKA.RUN")));
    var pauseLabel = U.eggPaused ? S.t("Resume the song") : S.t("Pause the song");
    var pause = S.button("", { icon: U.eggPaused ? "play" : "pause", cls: "flat small pause-btn", title: pauseLabel, onClick: U.toggleEggPause });
    pause.setAttribute("aria-label", pauseLabel);
    row.appendChild(pause);
    var close = S.button("", { icon: "close", cls: "flat small", title: S.t("Stop the song"), onClick: U.stopEgg });
    close.setAttribute("aria-label", S.t("Stop the song"));
    row.appendChild(close);
    return row;
  };

  /* The next date of the president's term, as [label, year] */
  U.termParts = function (G) {
    if (G.mode === "post") {
      /* After 2070 the president has no vote left to face: out */
      return [S.t("Next confirmation vote"), [2045, 2050, 2055, 2060, 2065, 2070].filter(function (y) { return y >= G.year; })[0] || S.t("out")];
    }
    return [S.t("Term ends"), Gm.TERM_ENDS.filter(function (y) { return y >= G.year; })[0] || 2040];
  };
  U.termText = function (G) {
    var t = U.termParts(G);
    return t[0] + ": " + t[1];
  };

  /* ---------- Toasts ---------- */
  /* A toast; actions are buttons [{ label, primary, onClick }] that close it */
  U.toast = function (text, kind, actions, ms) {
    var box = document.getElementById("toasts");
    var t = el("div", "toast " + (kind || ""));
    t.setAttribute("role", actions ? "alert" : "status");
    t.appendChild(S.icon(kind === "bad" ? "error" : kind === "warn" ? "warning" : kind === "award" ? "achievements" : "info", "s16"));
    var body = el("div", "toast-text");
    body.appendChild(el("div", "", text));
    if (actions) {
      var row = el("div", "toast-actions");
      actions.forEach(function (a) {
        row.appendChild(S.button(a.label, { cls: a.primary ? "primary" : "", onClick: function () { t.remove(); if (a.onClick) { a.onClick(); } } }));
      });
      body.appendChild(row);
    }
    t.appendChild(body);
    box.appendChild(t);
    /* Warnings and failures come with their own alert sound, and an
       action that played a sound, such as a save or an export, needs no
       second one */
    if (kind !== "warn" && kind !== "bad" && !S.sound.played()) { S.sound.play("notify"); }
    /* A notification under the pointer or with the focus stays */
    S.dwell(t, ms || (S.fast ? 1500 : 4200), function () { if (t.parentNode) { t.parentNode.removeChild(t); } });
  };

  /* ---------- Dialogs ---------- */
  var openDialogs = [];
  /* ---------- Required screens ----------
     A decision the game needs (continuing into the Federation, the
     successor, the end of the presidency) or a crash. They have no close
     button; a click outside them and Escape do nothing; and the window
     under them takes no input while they show, through the browser's
     inert attribute and a guard on every input event, so removing inert
     with the inspector changes nothing. A required screen removed with the
     inspector comes back at once. Ordinary dialogs, such as Settings, can
     be removed that way with no repercussion: they open again from their
     buttons. Dialogs opened from a required screen (Load a save from the
     crash screen), the film and the debug panel stay usable. */
  var required = [];
  function guardRequired() {
    var app = document.getElementById("app");
    if (app) { app.inert = required.length > 0; }
    document.documentElement.classList.toggle("required-open", required.length > 0);
  }
  U.require = function (node) { if (required.indexOf(node) < 0) { required.push(node); node.dataset.required = "1"; } guardRequired(); };
  U.release = function (node) { required = required.filter(function (n) { return n !== node; }); if (node.dataset) { delete node.dataset.required; } guardRequired(); };
  new MutationObserver(function () {
    required.forEach(function (n) { if (!n.isConnected) { document.body.appendChild(n); } });
    var app = document.getElementById("app");
    if (app && required.length && !app.inert) { app.inert = true; }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["inert"] });
  function allowed(t) {
    if (!required.length) { return true; }
    if (!t || !t.closest) { return false; }
    var top = required[required.length - 1];
    return top.contains(t) || !!t.closest(".cine, .dbg, .award-pops, .toasts") ||
      !!t.closest(".overlay:not([data-required])") && t.closest(".overlay").compareDocumentPosition(top) & Node.DOCUMENT_POSITION_PRECEDING;
  }
  ["pointerdown", "mousedown", "click", "keydown", "focusin", "wheel", "touchstart"].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (allowed(e.target)) { return; }
      /* Keys typed with the focus on the page go to the required screen */
      if (type === "keydown" && (e.target === document.body || e.target === document.documentElement)) { return; }
      e.stopPropagation(); if (type !== "focusin" && type !== "wheel" && type !== "touchstart") { e.preventDefault(); }
      if (type === "focusin") { var f = required[required.length - 1].querySelector(".btn"); if (f) { f.focus({ preventScroll: true }); } }
    }, { capture: true, passive: false });
  });

  U.dialog = function (o) {
    if (o.required) { o.closable = false; o.backdrop = false; }
    var ov = el("div", "overlay");
    var d = el("div", "dialog" + (o.wide ? " wide" : "") + (o.cls ? " " + o.cls : ""));
    d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
    var head = el("div", "dhead");
    if (o.icon) { head.appendChild(S.icon(o.icon)); }
    var h = el("span", "", o.title); h.id = "dlg-" + Date.now(); head.appendChild(h);
    d.setAttribute("aria-labelledby", h.id);
    /* Closing fades the dialog out, as Breeze does; under reduced motion
       it goes at once */
    var closing = false;
    /* close(true) closes without a sound, for dialogs closed together */
    function close(quiet) {
      if (closing) { return; }
      closing = true;
      openDialogs = openDialogs.filter(function (x) { return x !== close; });
      if (o.required) { U.release(ov); }
      if (quiet !== true) { S.sound.play("close"); }
      var gone = function () { if (ov.parentNode) { ov.parentNode.removeChild(ov); } };
      if (S.reducedMotion() || S.fast) { gone(); } else { ov.classList.add("closing"); setTimeout(gone, 160); }
      if (o.onClose) { o.onClose(); }
    }
    if (o.closable !== false) {
      var x = S.button("", { icon: "close", cls: "flat x", title: S.t("Close"), onClick: close });
      x.setAttribute("aria-label", S.t("Close")); head.appendChild(x);
    }
    d.appendChild(head);
    /* The body scrolls when long, so it takes keyboard focus */
    var body = el("div", "dbody" + (o.flush ? " flush" : "")); body.tabIndex = 0;
    body.appendChild(o.body);
    d.appendChild(body);
    function makeFoot(buttons) {
      if (!buttons || !buttons.length) { return null; }
      var f = el("div", "dfoot");
      buttons.forEach(function (bt) {
        /* cls adds a look of its own, such as danger for a button that deletes */
        var b = S.button(bt.label, { cls: (bt.primary ? "primary" : "") + (bt.cls ? " " + bt.cls : ""), icon: bt.icon, onClick: function () {
          var keep = bt.onClick ? bt.onClick() : false;
          /* true keeps the dialog open; "quiet" closes without the close sound
             (used when the action already played its own sound, e.g. save) */
          if (keep === true) { return; }
          close(keep === "quiet");
        } });
        if (bt.disabled) { b.disabled = true; }
        f.appendChild(b);
      });
      return f;
    }
    var foot = makeFoot(o.buttons);
    if (foot) { d.appendChild(foot); }
    /* A page can slide into the dialog, as in KDE and GNOME: the header
       gains a back arrow that slides the page before back in */
    var pages = [], back = null;
    function swapPage(title, node, ft, cls) {
      h.textContent = title;
      node.classList.remove("slide-in", "slide-back"); node.classList.add(cls);
      body.replaceChild(node, body.firstChild); body.scrollTop = 0;
      if (foot) { d.removeChild(foot); }
      foot = ft; if (foot) { d.appendChild(foot); }
      S.levelHeadings();
    }
    function pop() {
      var p = pages.pop(); if (!p) { return; }
      swapPage(p.title, p.body, p.foot, "slide-back");
      if (!pages.length && back) { back.remove(); back = null; }
      else if (back) { back.setAttribute("aria-label", S.t("Back to {t}", { t: pages[pages.length - 1].title })); }
      S.sound.play("pop");
    }
    ov.appendChild(d);
    /* A click on the layer behind closes the dialog, unless the dialog
       asks to stay (backdrop: false), as the year report does */
    ov.addEventListener("mousedown", function (e) { if (e.target === ov && o.closable !== false && o.backdrop !== false) { close(); } });
    document.body.appendChild(ov);
    if (o.required) { U.require(ov); }
    S.levelHeadings();
    S.sound.play("open");
    openDialogs.push(close);
    close.el = ov;
    close.closable = o.closable !== false;
    close.push = function (o2) {
      pages.push({ title: h.textContent, body: body.firstChild, foot: foot });
      if (!back) {
        back = S.button("", { icon: "back", cls: "flat dback", onClick: pop });
        head.insertBefore(back, head.firstChild);
      }
      back.setAttribute("aria-label", S.t("Back to {t}", { t: h.textContent })); back.title = back.getAttribute("aria-label");
      swapPage(o2.title, o2.body, makeFoot(o2.buttons), "slide-in");
      S.sound.play("pop");
      back.focus({ preventScroll: true });
    };
    setTimeout(function () {
      var f = d.querySelector(".dfoot .btn.primary") || d.querySelector("input, select, button:not(.x)");
      if (f) { f.focus(); }
    }, 30);
    return close;
  };
  /* Settings > Keyboard > Dialogs: Escape (or the key bound to Close the
     dialog) closes the dialog on top, and Enter (or the key bound to Press
     the main button) presses its main button unless the focus is on a
     control of its own, which already takes the key. The key stops here, so it never acts
     on the page once the dialog has closed. */
  document.addEventListener("keydown", function (e) {
    if (!openDialogs.length || !S.keyOn("dialogs") || e.ctrlKey || e.metaKey || e.altKey) { return; }
    var c = openDialogs[openDialogs.length - 1];
    if (S.keyIs(e, "dialogs.close")) {
      if (c.closable) { e.preventDefault(); c(); }
    } else if (S.keyIs(e, "dialogs.main") && !e.repeat) {
      var t = e.target;
      if (t && t.closest && t.closest("button, a, input, select, textarea, summary, [contenteditable]")) { return; }
      var main = c.el && c.el.querySelector(".dfoot .btn.primary");
      if (main && !main.disabled) { e.preventDefault(); e.stopImmediatePropagation(); main.click(); }
    }
  });
  U.dialogOpen = function () { return openDialogs.length > 0; };
  /* Closing every dialog at once makes one sound at most; closeAll(true) makes none */
  U.closeAll = function (quiet) { openDialogs.slice().forEach(function (c, i) { c(quiet === true || i > 0); }); };

  /* ---------- The turn transition ---------- */
  /* While a vote, the turn transition, the film or the crash screen
     plays, the year cannot end and debug actions wait, so two of them never
     run at once */
  /* A film counts until it has faded out, so nothing starts over its last screen */
  U.busy = function () { return !!U.voting || required.length > 0 || !!document.querySelector(".yearfx, .cine, .crash"); };
  U.yearFx = function (year, done) {
    var fx = el("div", "yearfx"); fx.setAttribute("aria-hidden", "true");
    fx.appendChild(el("div", "y", String(year)));
    document.body.appendChild(fx);
    S.sound.play("turn");
    setTimeout(function () { if (fx.parentNode) { fx.parentNode.removeChild(fx); } if (done) { done(); } }, S.fast ? 320 : 1150);
  };

  /* ---------- The end of a year ---------- */
  U.endYear = function () {
    var G = S.G;
    if (!G || G.over || G.finished || U.busy()) { return; }
    if (!Gm.allDone(G)) { U.toast(S.t("Decide every item on the agenda first."), "warn"); S.sound.play("alert"); return; }
    var report = Gm.endYear(G);
    S.saves.write("auto", G);
    S.emit("year", { ended: report && report.year, events: report ? report.events.length : 0, over: G.over, finished: G.finished });
    /* An ending goes straight into its film, which fades in from the
       window, so the year's transition and the film never play together.
       The page keeps the year that ended until the film covers it, so
       nothing changes under the fade. */
    if (G.over || G.finished) { U.playEnding(function () { U.sel = {}; U.cardIndex = 0; U.view = "agenda"; U.render(); }); return; }
    U.sel = {}; U.cardIndex = 0; U.view = "agenda";
    U.yearFx(G.over ? report.year : G.finished ? report.year + 1 : G.year, function () {
      U.render();
      /* An ending plays its film first, then the ending dialog */
      if (G.over || G.finished) { U.playEnding(); return; }
      var after = function () { if (G.pendingSuccession) { U.successionDialog(); } };
      U.reportDialog(report, after);
    });
  };
  U.leaveGame = function () {
    if (!S.G) { return; }
    S.saves.write("auto", S.G, true);
    S.G = null; U.title = true; U.view = "agenda";
    U.render();
    U.toast(S.t("The game was saved in its autosave."), "good");
  };
  U.confirmNew = function () {
    /* Without a game, from the title screen or the page after deleting
       the data, it opens the form for a new game */
    if (!S.G) { U.title = false; U.deleted = false; S.sound.play("open"); U.render(); return; }
    var p = el("p", "", S.settings.autosave === false ? S.t("Start a new game? Autosave is off, so any progress since you last saved this game is lost. Your saves stay as they are.") :
      S.t("Start a new game? This game stays in its autosave, and your saves stay as they are."));
    U.dialog({ title: S.t("New game"), icon: "new", body: p, buttons: [
      { label: S.t("Cancel") },
      { label: S.t("New game"), primary: true, onClick: function () { S.G = null; U.view = "agenda"; U.render(); } }
    ] });
  };

  /* Keyboard: 1 to 9 choose an option, Enter decides, N goes to the next
     item, E ends the year, ? opens help */
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || U.dialogOpen() || U.busy() || e.ctrlKey || e.metaKey || e.altKey) { return; }
    var tag = (e.target && e.target.tagName) || "";
    if (/INPUT|SELECT|TEXTAREA/.test(tag)) { return; }
    /* Each key works while its area of Settings > Keyboard is on (js/ui/keys.js) */
    if (S.keyIs(e, "window.help") && S.keyOn("window")) { U.helpDialog(); e.preventDefault(); return; }
    if (!S.G) { return; }
    if (S.keyIs(e, "year.end") && !e.repeat && S.keyOn("year")) { e.preventDefault(); U.endYear(); return; }
    if (U.view === "agenda" && U.agendaKey && S.keyOn("agenda")) { U.agendaKey(e); }
  });
})();
