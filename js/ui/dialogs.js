/* Dialogs: settings (with the storage page and the debug switches), help,
   the explanation of Selk, saves, the year report, the succession of
   presidents, and the endings. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui, Gm = S.game;

  /* ---------- Settings ---------- */
  U.settingsDialog = function (cat) {
    var wrap = el("div", "settings");
    var cats = el("div", "cats"), pane = el("div", "pane");
    var CATS = [
      ["appearance", "Appearance", "palette"], ["name", "Bank name", "parliament"], ["game", "Game", "agenda"], ["keyboard", "Keyboard", "keyboard"], ["sound", "Sound", "volume"],
      ["motion", "Motion and text", "access"], ["storage", "Storage", "storage"], ["debug", "Debug", "debug"]
    ];
    cat = cat || "appearance";
    /* Without a keyboard there is nothing to set up: the Keyboard category
       is hidden (keys-only, css/app.css), as the key hints are, and a link
       to it opens Appearance. A key pressed shows it (S.hasKeyboard). */
    if (!S.hasKeyboard() && cat === "keyboard") { cat = "appearance"; }
    CATS.forEach(function (c) {
      var b = el("button", "sideitem" + (c[0] === "keyboard" ? " keys-only" : ""));
      b.type = "button";
      b.appendChild(S.icon(c[2]));
      b.appendChild(el("span", "", S.t(c[1])));
      b.addEventListener("click", function () { if (cat === "sound" && c[0] !== "sound") { S.music.stopPreview(); soundGroup = null; } cat = c[0]; S.sound.play("select"); draw(); });
      cats.appendChild(b);
    });
    wrap.appendChild(cats);
    wrap.appendChild(pane);
    function save() { S.saveSettings(); S.applyTheme(); S.sound.apply(); }
    /* Settings > Keyboard > Key bindings: the action waiting for its new
       key, and what the last change did. While it waits, the next key
       pressed goes to it alone, ahead of every other handler. */
    var capturing = null, keyMsg = "", drawn = null;
    /* Settings > Sound: the group of sounds open in Each sound */
    var soundGroup = null, soundBack = null;
    /* What scrolls: the page, and the dialog's body or the layer behind it
       when dialogs grow. A jump sets where the next drawing scrolls to and
       what takes the focus there. */
    var jump = null;
    function scrollers() { return [pane, wrap.closest(".dbody"), wrap.closest(".overlay")].filter(Boolean); }
    function capture(id) {
      capturing = capturing === id ? null : id; keyMsg = "";
      draw();
    }
    document.addEventListener("keydown", function grab(e) {
      if (!wrap.isConnected) { document.removeEventListener("keydown", grab, true); return; }
      if (!capturing || cat !== "keyboard" || /^(Shift|Control|Alt|Meta|AltGraph)$/.test(e.key)) { return; }
      e.preventDefault(); e.stopImmediatePropagation();
      var id = capturing, a = S.keyAction(id); capturing = null;
      if (e.key === "Escape") { keyMsg = S.t("No change."); draw(); return; }
      if (e.ctrlKey || e.altKey || e.metaKey) { keyMsg = S.t("Shortcuts take no Ctrl, Alt or system key."); S.sound.play("error"); draw(); return; }
      /* The key it already has: nothing changes and nothing is said */
      if (S.keyNorm(e.key) === S.keyFor(id)) { keyMsg = ""; draw(); return; }
      var r = S.keyBind(id, e.key);
      if (!r.ok) { keyMsg = r.why || S.t("This key cannot be used."); S.sound.play("error"); draw(); return; }
      keyMsg = r.swapped ? S.t("{a} now uses {k}; {b} takes {o}.", { a: S.t(a[3]), k: S.keyLabel(S.keyFor(id)), b: S.t(r.swapped[3]), o: S.keyLabel(S.keyFor(r.swapped[0])) }) :
        S.t("{a} now uses {k}.", { a: S.t(a[3]), k: S.keyLabel(S.keyFor(id)) });
      save(); U.build(); U.render(); draw();
    }, true);
    /* Rows go into the current card group, as in KDE's settings pages: a
       titled card per subject, all sharing the label column */
    var into = pane;
    /* A list of sub-pages, as KDE lists them: a row each, with its name,
       a line under it and an arrow */
    function menuList(items) {
      var menu = el("div", "set-menu");
      items.forEach(function (it) {
        var b = el("button", "set-menu-item"), t = el("span", "set-menu-text"); b.type = "button";
        t.appendChild(el("span", "", it[0]));
        t.appendChild(el("span", "dim small", it[1]));
        b.appendChild(t); b.appendChild(S.icon("next"));
        b.addEventListener("click", it[2]);
        if (it[3]) { b.dataset.key = it[3]; }
        menu.appendChild(b);
      });
      return menu;
    }
    /* The head of a sub-page, as in the notes: a button back, then the page's name */
    function subHead(title, backLabel, onBack, h) {
      var head = el("div", "set-head"), b = S.button("", { icon: "back", cls: "flat pop-back", title: backLabel, onClick: onBack });
      b.setAttribute("aria-label", backLabel);
      h = h || el("h4"); h.textContent = title;
      head.appendChild(b); head.appendChild(h);
      return head;
    }
    /* A card of settings; a title stands above it, as KDE's form headers
       do, the two in one section */
    function group(title) {
      var g = el(title ? "div" : "section", "setgroup");
      if (title) { var sec = el("section", "setblock"); sec.appendChild(el("h4", "", title)); sec.appendChild(g); pane.appendChild(sec); }
      else { pane.appendChild(g); }
      into = g;
      return g;
    }
    function note(text) { into.appendChild(el("p", "dim small", text)); }
    /* A note plain to see from the page, such as dimmed controls: said
       for screen readers only */
    function srNote(text) { into.appendChild(el("p", "sr-only", text)); }
    function row(label, node) {
      var r = el("div", "row");
      r.appendChild(el("span", "lbl", label));
      r.appendChild(node);
      into.appendChild(r);
      return r;
    }
    /* A setting that cannot apply now: its controls are disabled and its
       label dims; a short line says why, under the control or once for a
       group of them */
    function disable(r, off, why) {
      if (!off) { return r; }
      r.classList.add("off");
      Array.prototype.forEach.call(r.querySelectorAll("input, select, button"), function (c) { c.disabled = true; });
      if (why) { r.appendChild(el("span", "dim small why", why)); }
      return r;
    }
    function radios(name, list, value, on) {
      var g = el("div", "init-row");
      g.setAttribute("role", "radiogroup");
      list.forEach(function (it) {
        var l = el("label", "check"), r = el("input");
        r.type = "radio"; r.name = name; r.value = it[0]; r.checked = value === it[0];
        r.addEventListener("change", function () { S.sound.play("select"); on(it[0]); });
        l.appendChild(r);
        /* The text in an element of its own, so it can be trimmed to its ink */
        l.appendChild(el("span", "", S.t(it[1])));
        g.appendChild(l);
      });
      return g;
    }
    function toggle(text, value, on) {
      var l = el("label", "switch"), cb = el("input");
      cb.type = "checkbox"; cb.checked = value;
      cb.addEventListener("change", function () { on(cb.checked); });
      l.appendChild(cb);
      l.appendChild(el("span", "track"));
      l.appendChild(el("span", "", text));
      return l;
    }
    function slider(value, on, label) {
      var r = el("input");
      r.type = "range"; r.min = 0; r.max = 100; r.value = value;
      if (label) { r.setAttribute("aria-label", label); }
      r.style.setProperty("--fill", value + "%");
      r.addEventListener("input", function () { r.style.setProperty("--fill", r.value + "%"); on(Number(r.value)); });
      return r;
    }
    function draw() {
      setTimeout(S.levelHeadings, 0);
      /* A key binding waits only while its page shows; the pane keeps its scroll */
      if (cat !== "keyboard") { capturing = null; }
      /* The scroll and the focus are set again before the browser paints,
         so a page drawn anew does not flicker */
      var same = drawn === cat, keep = scrollers().map(function (n) { return [n, n.scrollTop]; }), j = jump;
      jump = null;
      drawn = cat;
      Array.prototype.forEach.call(cats.children, function (b, i) {
        if (CATS[i][0] === cat) { b.setAttribute("aria-current", "page"); } else { b.removeAttribute("aria-current"); }
      });
      S.clear(pane); into = pane;
      var st = S.settings;
      if (cat === "appearance") {
        pane.appendChild(el("h3", "", S.t("Appearance")));
        group(S.t("Colors"));
        row(S.t("Theme"), radios("theme", [["system", "Follow the system"], ["light", "Breeze Light"], ["dark", "Breeze Dark"]], st.theme, function (v) { st.theme = v; save(); U.render(); }));
        /* Each limit: a switch, then its width */
        function limit(label, on, set, value, min, max, setW) {
          var g = el("div", "limit");
          g.appendChild(toggle(label, on, function (v) { set(v); save(); w.disabled = !v; }));
          var line = el("div", "level"), out = el("span", "dim small limit-out", value + " px");
          var w = el("input"); w.type = "range"; w.min = min; w.max = max; w.step = 20; w.value = value; w.disabled = !on;
          w.setAttribute("aria-label", label);
          w.style.setProperty("--fill", ((value - min) / (max - min) * 100) + "%");
          w.addEventListener("input", function () { w.style.setProperty("--fill", ((w.value - min) / (max - min) * 100) + "%"); out.textContent = w.value + " px"; setW(Number(w.value)); save(); });
          line.appendChild(w); line.appendChild(out); g.appendChild(line);
          return g;
        }
        /* The accent colors */
        var sw = el("div", "swatches");
        sw.setAttribute("role", "radiogroup");
        sw.setAttribute("aria-label", S.t("Accent color"));
        S.ACCENTS.forEach(function (a) {
          var b = el("button", "swatch");
          b.type = "button"; b.style.background = a[0]; b.title = S.t(a[1]);
          b.setAttribute("role", "radio");
          b.setAttribute("aria-label", S.t(a[1]));
          b.setAttribute("aria-checked", st.accent.toLowerCase() === a[0] ? "true" : "false");
          b.addEventListener("click", function () { st.accent = a[0]; save(); S.sound.play("select"); draw(); U.render(); });
          sw.appendChild(b);
        });
        var custom = el("input");
        custom.type = "color"; custom.value = st.accent; custom.title = S.t("Custom color");
        custom.setAttribute("aria-label", S.t("Custom accent color"));
        custom.addEventListener("input", function () { st.accent = custom.value; save(); });
        custom.addEventListener("change", function () { U.render(); });
        sw.appendChild(custom);
        row(S.t("Accent color"), sw);
        /* The euro sign in the title bar and on the page for a new game */
        row(S.t("Logo"), radios("logo", [["text", "Text color"], ["accent", "Accent color"]], st.logoAccent ? "accent" : "text", function (v) {
          st.logoAccent = v === "accent"; save(); U.render();
        }));
        /* Where things show, then how wide they are */
        group(S.t("Positions"));
        /* On a phone a notification takes nearly the whole width, so only
           top or bottom applies there; the side chosen on a larger screen is kept */
        var narrow = false, corner = st.notifyCorner || "bottom-right";
        try { narrow = window.matchMedia("(max-width: 599px)").matches; } catch (e) {}
        if (narrow) {
          row(S.t("Notifications"), radios("notify", [["top", "Top"], ["bottom", "Bottom"]], corner.split("-")[0], function (v) {
            st.notifyCorner = v + "-" + (corner.split("-")[1] || "right"); save(); U.toast(S.t("Notifications open here."));
          }));
        } else {
          row(S.t("Notifications"), radios("notify", [["top-left", "Top left"], ["top-right", "Top right"], ["bottom-left", "Bottom left"], ["bottom-right", "Bottom right"]], corner, function (v) {
            st.notifyCorner = v; save(); U.toast(S.t("Notifications open here."));
          }));
        }
        row(S.t("Indicators"), radios("indicators", [["scroll", "Scroll with the page"], ["sticky", "Stay at the top"]], st.stickyIndicators ? "sticky" : "scroll", function (v) { st.stickyIndicators = v === "sticky"; save(); }));
        /* The status place, the two widths and accountant mode act only beside
           the sidebar, so the phone layout hides them */
        row(S.t("Status"), radios("status", [["side", "In the sidebar"], ["bar", "In a bar at the bottom"]], st.statusBar ? "bar" : "side", function (v) {
          st.statusBar = v === "bar"; save(); U.render();
        })).classList.add("desktop-only");
        /* The pill in the title bar while the game does not have the focus (js/ui/shell.js) */
        row(S.t("Not focused"), toggle(S.t("Show a pill in the title bar while the game does not have the focus"), st.focusPill !== false, function (v) { st.focusPill = v; save(); U.render(); }));
        group(S.t("Sizes"));
        row(S.t("Page width"), limit(S.t("Keep the page at a readable width"), st.pageLimit !== false, function (v) { st.pageLimit = v; setTimeout(draw, 0); }, st.pageMax || 1200, 700, 1800, function (v) { st.pageMax = v; })).classList.add("desktop-only");
        row(S.t("Window width"), limit(S.t("Limit the width of the whole game"), st.frame === "window", function (v) { st.frame = v ? "window" : "fill"; }, st.windowMax || 1440, 1000, 2400, function (v) { st.windowMax = v; })).classList.add("desktop-only");
        /* Accountant mode lifts the readable width, so it applies only while that width is kept */
        disable(row(S.t("Accountant mode"), toggle(S.t("Beside the sidebar, use the full width, so figures line up with the sidebar and the indicators"), st.accountant !== false, function (v) { st.accountant = v; save(); })),
          st.pageLimit === false, S.t("Applies only while the page keeps a readable width.")).classList.add("desktop-only");
        /* Fill every row, and at most so many cards in a row: six cards at
           most three a row make two rows of three */
        var cards = el("div", "stack-ctl");
        cards.appendChild(toggle(S.t("Fill every row, sharing the cards out evenly"), st.evenGrids !== false, function (v) { st.evenGrids = v; save(); draw(); }));
        var per = el("select");
        per.setAttribute("aria-label", S.t("Cards in a row"));
        [[0, "As many as fit"], [2, "At most 2 in a row"], [3, "At most 3 in a row"], [4, "At most 4 in a row"], [5, "At most 5 in a row"]].forEach(function (it) {
          var o = el("option", "", S.t(it[1])); o.value = it[0]; if ((st.cardsPerRow || 0) === it[0]) { o.selected = true; } per.appendChild(o);
        });
        per.addEventListener("change", function () { st.cardsPerRow = Number(per.value); save(); });
        /* The cap on cards in a row belongs to filling the rows, so it shows with it */
        if (st.evenGrids !== false) { cards.appendChild(per); }
        row(S.t("Rows of cards"), cards);
        /* Dialogs: their height */
        group(S.t("Dialogs"));
        row(S.t("Height"), toggle(S.t("Keep dialogs within the height of the window; off, a long dialog grows and the layer behind it scrolls"), st.dialogLimit !== false, function (v) { st.dialogLimit = v; save(); }));
        row(S.t("Guide lines"), toggle(S.t("Draw dotted lines between the settings of a card"), st.guideLines !== false, function (v) { st.guideLines = v; save(); }));
        /* The title screen, plain or in a theme loosely named after a group
           of the European Parliament; a theme's own switches show with it */
        group(S.t("Title screen"));
        var tsel = el("select");
        tsel.setAttribute("aria-label", S.t("Title screen"));
        [["plain", S.t("Plain")]].concat(U.TITLE_ORDER.map(function (k) { return [k, S.t(U.TITLE_THEMES[k].name)]; }), [["custom", S.t("Custom")]]).forEach(function (it) {
          var o = el("option", "", it[1]); o.value = it[0]; if ((st.titleTheme || "plain") === it[0]) { o.selected = true; } tsel.appendChild(o);
        });
        tsel.addEventListener("change", function () { st.titleTheme = tsel.value; save(); U.render(); draw(); });
        row(S.t("Theme"), tsel);
        if (st.titleTheme && st.titleTheme !== "plain") {
          var tc = st.titleCustom, isCustom = st.titleTheme === "custom";
          var musicOff = !st.sound || !st.music, musicWhy = !st.sound ? S.t("Sound is off.") : S.t("The soundtrack is off (Settings > Sound).");
          /* A custom theme: a color (a theme's or any other), a backdrop
             borrowed from a theme or none, and any piece of the soundtrack */
          if (isCustom) {
            var csw = el("div", "swatches");
            csw.setAttribute("role", "radiogroup");
            csw.setAttribute("aria-label", S.t("Title screen color"));
            U.TITLE_ORDER.forEach(function (k) {
              var c = U.TITLE_THEMES[k].from, b = el("button", "swatch");
              b.type = "button"; b.style.background = c; b.title = S.t(U.TITLE_THEMES[k].name);
              b.setAttribute("role", "radio"); b.setAttribute("aria-label", S.t(U.TITLE_THEMES[k].name));
              b.setAttribute("aria-checked", tc.color.toLowerCase() === c ? "true" : "false");
              b.addEventListener("click", function () { tc.color = c; save(); S.sound.play("select"); draw(); U.render(); });
              csw.appendChild(b);
            });
            var cpick = el("input");
            cpick.type = "color"; cpick.value = tc.color; cpick.title = S.t("Custom color");
            cpick.setAttribute("aria-label", S.t("Custom title screen color"));
            cpick.addEventListener("input", function () { tc.color = cpick.value; save(); });
            cpick.addEventListener("change", function () { U.render(); draw(); });
            csw.appendChild(cpick);
            row(S.t("Color"), csw);
            var bsel = el("select");
            bsel.setAttribute("aria-label", S.t("Backdrop"));
            [["none", "None, the color alone"], ["popular", "Popular: rings of stars"], ["social", "Social: roses"], ["renew", "Renew: breathing stars"], ["green", "Green: falling leaves"],
              ["conservative", "Conservative: tiles"], ["patriot", "Patriot: banners"], ["sovereign", "Sovereign: coins"], ["left", "Left: stars turning back"]].forEach(function (it) {
              var o = el("option", "", S.t(it[1])); o.value = it[0]; if ((tc.backdrop || "none") === it[0]) { o.selected = true; } bsel.appendChild(o);
            });
            bsel.addEventListener("change", function () { tc.backdrop = bsel.value; save(); U.render(); draw(); });
            row(S.t("Backdrop"), bsel);
            /* The motif's color: the borrowed theme's own, or any other */
            var mline = el("div", "level"), mpick = el("input");
            mpick.type = "color"; mpick.value = tc.ink || "#ffffff"; mpick.title = S.t("Motif color");
            mpick.setAttribute("aria-label", S.t("Motif color"));
            mpick.addEventListener("input", function () { tc.ink = mpick.value; save(); });
            mpick.addEventListener("change", function () { U.render(); draw(); });
            mline.appendChild(mpick);
            mline.appendChild(el("span", "dim small", tc.ink ? S.t("Your own color") : S.t("The theme's own color")));
            var mreset = S.button("", { icon: "reset", cls: "flat", title: S.t("Back to the theme's own color"), onClick: function () { tc.ink = ""; save(); U.render(); draw(); } });
            mreset.setAttribute("aria-label", S.t("Back to the theme's own color"));
            if (!tc.ink) { mreset.disabled = true; }
            mline.appendChild(mreset);
            disable(row(S.t("Motif color"), mline), !U.TITLE_THEMES[tc.backdrop], S.t("The backdrop has no motif."));
            var msel = el("select");
            msel.setAttribute("aria-label", S.t("Title screen music"));
            S.music.TITLE_ORDER.concat(S.music.ORDER).forEach(function (k) {
              var o = el("option", "", S.music.PIECES[k].name); o.value = k; if (tc.music === k) { o.selected = true; } msel.appendChild(o);
            });
            msel.addEventListener("change", function () { tc.music = msel.value; save(); });
            disable(row(S.t("Music"), msel), musicOff, musicWhy);
          }
          row(S.t("Card"), toggle(S.t("Set the name and the menu on a card, apart from the backdrop"), !!st.titleCard, function (v) { st.titleCard = v; save(); U.render(); }));
          /* The backdrop moves unless reduced motion or this switch stills it;
             a backdrop without a motif has nothing to move */
          var noMotif = isCustom && !U.TITLE_THEMES[tc.backdrop], reduced = S.reducedMotion();
          disable(row(S.t("Animation"), toggle(S.t("Move the backdrop"), st.titleAnimate !== false && !reduced && !noMotif, function (v) { st.titleAnimate = v; save(); U.render(); draw(); })),
            reduced || noMotif, reduced ? S.t("Reduced motion is on (Settings > Motion and text).") : S.t("The backdrop has no motif to move."));
          /* The speed of the title screen's motion, a quarter to twice the usual */
          var sp = el("div", "level"), spOut = el("span", "dim small limit-out", (st.titleSpeed || 100) + "%"), spIn = el("input");
          spIn.type = "range"; spIn.min = 25; spIn.max = 200; spIn.step = 25; spIn.value = st.titleSpeed || 100;
          spIn.setAttribute("aria-label", S.t("Speed of the title screen's motion"));
          spIn.style.setProperty("--fill", ((spIn.value - 25) / 175 * 100) + "%");
          spIn.addEventListener("input", function () { spIn.style.setProperty("--fill", ((spIn.value - 25) / 175 * 100) + "%"); spOut.textContent = spIn.value + "%"; });
          spIn.addEventListener("change", function () { st.titleSpeed = Number(spIn.value); save(); U.render(); });
          sp.appendChild(spIn); sp.appendChild(spOut);
          /* The speed sets the backdrop and the pulsing line, so it applies while either moves */
          var still = !U.titleMoving() || noMotif, noLine = st.titleSplash === false;
          disable(row(S.t("Motion speed"), sp), reduced || (still && noLine), reduced ? S.t("Reduced motion is on (Settings > Motion and text).") : S.t("Nothing moves: the backdrop is still and the line is hidden."));
          row(S.t("Pulsing line"), toggle(S.t("Show the line of yellow text beside the logo"), st.titleSplash !== false, function (v) { st.titleSplash = v; save(); U.render(); draw(); }));
          /* A custom theme names its piece above; a theme's own piece has a switch */
          if (!isCustom) {
            disable(row(S.t("Music"), toggle(S.t("Play the theme's own music on the title screen, in place of Strasbourg"), st.titleMusic !== false, function (v) { st.titleMusic = v; save(); })),
              musicOff, musicWhy);
          }
        }
        note(S.t("Shown at start-up, with the menu to continue a game or start one. The themes are named loosely after the groups of the European Parliament."));
      } else if (cat === "name") {
        pane.appendChild(el("h3", "", S.t("Bank name")));
        group(null);
        note(S.t("Choose the language in which the bank is named. The title and the text follow it. The Greek acronym is written EKT in Latin letters, which look the same as the Greek ones in capitals."));
        var sel = el("select");
        sel.setAttribute("aria-label", S.t("Bank name"));
        S.BANK_NAMES.forEach(function (n) {
          var o = el("option", "", n.acr + " · " + n.lang + " · " + n.full);
          o.value = n.lang;
          if (n.lang === st.bankLang) { o.selected = true; }
          sel.appendChild(o);
        });
        sel.addEventListener("change", function () { st.bankLang = sel.value; save(); U.build(); U.render(); });
        row(S.t("Name"), sel);
      } else if (cat === "sound") {
        pane.appendChild(el("h3", "", S.t("Sound")));
        var D = S.DEFAULT_SETTINGS, soundOff = !st.sound, musicOff = soundOff || !st.music, uiOff = soundOff || st.uiSound === false;
        var PRESETS = S.sound.PRESETS, pre = null;
        /* A level slider with a button that sets it back to its default */
        function level(value, def, on, label, extra) {
          var g = el("div", "level"), r = slider(value, on, label);
          g.appendChild(r);
          var rs = S.button("", { icon: "reset", cls: "flat", title: S.t("Reset to {v}", { v: def }), onClick: function () {
            r.value = def; r.style.setProperty("--fill", def + "%"); on(def); draw();
          } });
          rs.setAttribute("aria-label", S.t("Reset {l} to {v}", { l: label, v: def }));
          g.appendChild(rs);
          if (extra) { g.appendChild(extra); }
          return g;
        }
        function onLevel(set) { return function (v) { set(v); save(); syncPreset(); }; }
        /* Moving a level by hand turns the preset list to Custom */
        function syncPreset() {
          if (!pre || pre.value === "custom") { return; }
          var x = PRESETS[pre.value];
          var same = x.volume === st.volume && x.musicVolume === st.musicVolume && Object.keys(x.levels).every(function (l) { return x.levels[l] === st.levels[l]; });
          if (!same) { var o = el("option", "", S.t("Custom")); o.value = "custom"; pre.appendChild(o); pre.value = "custom"; }
        }
        function keepSound(id, part, value, def) {
          st.sounds = st.sounds || {};
          var o = st.sounds[id] || {};
          if (value === def) { delete o[part]; } else { o[part] = value; }
          if (Object.keys(o).length) { st.sounds[id] = o; } else { delete st.sounds[id]; }
          save();
        }
        /* Each sound: the card Groups of sounds lists the groups, as KDE
           lists sub-pages; a group opens as a page of its own, with a head
           that leads back. A group's page has a row for each sound, as the
           soundtrack's pieces have: its check box, its volume and a button
           back to the default volume, its pitch, and Play, which sounds it
           even while it is off; a note says when each sound plays. Only
           what differs from the default is kept. */
        if (soundGroup) {
          var c = SOUND_CATS.filter(function (x) { return x[0] === soundGroup; })[0];
          pane.querySelector(":scope > h3").classList.add("sr-only");
          pane.appendChild(subHead(S.t(c[3]), S.t("All groups"), function () {
            jump = { keep: soundBack || [], focus: ".set-menu-item[data-key=\"" + soundGroup + "\"]" };
            soundGroup = null; S.sound.play("select"); draw();
          }));
          group(null);
          var list = S.SOUND_LIST.filter(function (x) { return x[1] === c[0]; });
          list.forEach(function (x) {
            var id = x[0], cur = S.soundSetting(id), name = S.t(x[2]);
            var on = el("input"); on.type = "checkbox"; on.checked = cur.on;
            on.setAttribute("aria-label", S.t("{s} on", { s: name }));
            on.addEventListener("change", function () { keepSound(id, "on", on.checked, !!x[4]); });
            var pitch = el("select");
            pitch.setAttribute("aria-label", S.t("{s} pitch", { s: name }));
            for (var n = -12; n <= 12; n++) {
              var o = el("option", "", S.t("Pitch {n}", { n: (n > 0 ? "+" : "") + n })); o.value = n; if (n === cur.pitch) { o.selected = true; } pitch.appendChild(o);
            }
            pitch.addEventListener("change", function () { keepSound(id, "pitch", Number(pitch.value), 0); S.sound.play(id, true); });
            var extra = el("span", "snd-extra");
            extra.appendChild(pitch);
            extra.appendChild(S.button(S.t("Play"), { onClick: function () { S.sound.play(id, true); } }));
            var g = level(Math.min(100, cur.vol), 100, function (v) { keepSound(id, "vol", v, 100); }, S.t("{s} volume", { s: name }), extra);
            g.insertBefore(on, g.firstChild);
            disable(row(name, g), uiOff);
          });
          note(list.map(function (x) { return S.t(x[2]) + ": " + S.t(x[3]).replace(/^./, function (m) { return m.toLowerCase(); }) + "."; }).join(" ") +
            (c[0] === "typing" ? " " + S.t("Both are off at first.") : ""));
        } else {
        group(S.t("General"));
        /* General: the switch the toolbar button also sets, which covers
           everything, and the speaker presets for both kinds of sound. The
           interface sounds and the soundtrack each have a switch of their own. */
        row(S.t("Sound"), toggle(S.t("All sound"), st.sound, function (v) { st.sound = v; save(); if (v) { S.sound.play("good"); } U.syncSound(); U.render(); draw(); }));
        row(S.t("Soundtrack and interface sounds"), toggle(S.t("Enable both soundtrack and interface sounds"), !!st.music && st.uiSound !== false, function (v) {
          st.uiSound = v; st.music = v; save(); S.music.update();
          if (!v && U.eggPlaying) { U.stopEgg(); }
          if (v) { S.sound.play("good"); }
          draw();
        }));
        if (soundOff) { note(S.t("Sound is off, so the controls below have no effect. Turn it on to change them.")); }
        /* Presets for the kind of speaker: each sets the master volume, the
           four levels and the music volume; a level moved by hand shows as
           Custom */
        pre = el("select");
        pre.setAttribute("aria-label", S.t("Speakers"));
        var match = Object.keys(PRESETS).filter(function (k) {
          var x = PRESETS[k];
          return x.volume === st.volume && x.musicVolume === st.musicVolume && Object.keys(x.levels).every(function (l) { return x.levels[l] === st.levels[l]; });
        })[0] || "custom";
        Object.keys(PRESETS).concat(match === "custom" ? ["custom"] : []).forEach(function (k) {
          var o = el("option", "", k === "custom" ? S.t("Custom") : S.t(PRESETS[k].name)); o.value = k; if (k === match) { o.selected = true; } pre.appendChild(o);
        });
        pre.addEventListener("change", function () {
          var x = PRESETS[pre.value]; if (!x) { return; }
          st.volume = x.volume; st.musicVolume = x.musicVolume;
          Object.keys(x.levels).forEach(function (l) { st.levels[l] = x.levels[l]; });
          save(); draw();
        });
        disable(row(S.t("Speakers"), pre), soundOff);
        group(S.t("Interface sounds"));
        disable(row(S.t("Interface sounds"), toggle(S.t("Clicks, alerts, votes, the end of a year, saves, typing and the pointer"), st.uiSound !== false, function (v) { st.uiSound = v; save(); if (v) { S.sound.play("good"); } draw(); })), soundOff);
        if (!soundOff && uiOff) { srNote(S.t("Interface sounds are off, so their levels have no effect.")); }
        /* The master volume has no Test of its own, so its slider runs into that space */
        disable(row(S.t("Master volume"), level(st.volume, D.volume, onLevel(function (v) { st.volume = v; }), S.t("Master volume"))), uiOff);
        SOUND_CATS.forEach(function (c) {
          disable(row(S.t(c[1]), level(st.levels[c[0]], D.levels[c[0]], onLevel(function (v) { st.levels[c[0]] = v; }), S.t("{c} level", { c: S.t(c[1]) }),
            S.button(S.t("Test"), { onClick: function () { S.sound.play(c[2], true); } }))), uiOff);
        });
        /* The sound set: a seed reshapes every sound at once, the same each
           time; 0 is the set as designed */
        group(S.t("Sound set"));
        var seedIn = el("input"), seedBox = el("div", "field-in");
        seedIn.type = "number"; seedIn.min = 0; seedIn.max = 999999; seedIn.step = 1; seedIn.value = st.soundSeed | 0; seedIn.className = "seed-in";
        seedIn.setAttribute("aria-label", S.t("Seed"));
        function setSeed(v) {
          st.soundSeed = Math.max(0, Math.min(999999, Math.round(Number(v) || 0)));
          seedIn.value = st.soundSeed; save(); S.sound.play("good", true);
          ends();
        }
        seedIn.addEventListener("change", function () { setSeed(seedIn.value); });
        seedBox.appendChild(seedIn);
        /* At the field's right end, as in KDE's spin box: - and +, which
           step the seed by one; then Random and the set as designed */
        function iconButton(icon, label, on) {
          var b = S.button("", { icon: icon, cls: "flat", title: label, onClick: on });
          b.setAttribute("aria-label", label);
          seedBox.appendChild(b);
          return b;
        }
        var less = iconButton("minus", S.t("Lower the seed by 1"), function () { setSeed((st.soundSeed | 0) - 1); });
        var more = iconButton("add", S.t("Raise the seed by 1"), function () { setSeed((st.soundSeed | 0) + 1); });
        seedBox.appendChild(el("span", "sep"));
        var rnd = S.button("", { icon: "random", cls: "flat", title: S.t("Random"), onClick: function () { setSeed(S.sound.randomSeed()); } });
        rnd.setAttribute("aria-label", S.t("Random"));
        seedBox.appendChild(rnd);
        var defBtn = S.button("", { icon: "reset", cls: "flat", title: S.t("The set as designed"), onClick: function () { setSeed(0); } });
        defBtn.setAttribute("aria-label", S.t("The set as designed"));
        seedBox.appendChild(defBtn);
        /* - stops at 0, + at 999 999, and the set as designed needs a seed other than 0 */
        function ends() {
          less.disabled = st.soundSeed <= 0; more.disabled = st.soundSeed >= 999999; defBtn.disabled = !st.soundSeed;
        }
        ends();
        disable(row(S.t("Seed"), seedBox), uiOff);
        note(S.t("Each seed gives every sound its own pitch, length and tone, within set limits, the same each time it plays. Seed 0 is the set as designed. Each sound's own volume and pitch apply on top."));
        group(S.t("Groups of sounds"));
        /* Said before the list, for screen readers */
        srNote(S.t("Each group opens on a page of its own, with a switch, a volume, a pitch and Play for every sound."));
        into.appendChild(menuList(SOUND_CATS.map(function (c) {
          var list = S.SOUND_LIST.filter(function (x) { return x[1] === c[0]; }), on = list.filter(function (x) { return S.soundSetting(x[0]).on; }).length;
          return [S.t(c[3]), S.t("{n} of {m} on", { n: on, m: list.length }), function () {
              soundBack = scrollers().map(function (n) { return [n, n.scrollTop]; });
              jump = { keep: scrollers().map(function (n) { return [n, 0]; }), focus: ".set-head .btn" };
              soundGroup = c[0]; S.sound.play("select"); draw();
            }, c[0]];
        })));
        /* The soundtrack: one switch and volume, then each piece with its
           own switch, volume and a 20-second preview */
        group(S.t("Music"));
        if (!soundOff && musicOff) { srNote(S.t("The soundtrack is off, so the controls below have no effect.")); }
        disable(row(S.t("Soundtrack"), toggle(S.t("Music that follows the state of the game"), !!st.music, function (v) {
          st.music = v; save(); S.music.update();
          if (!v && U.eggPlaying) { U.stopEgg(); }
          draw();
        })), soundOff);
        disable(row(S.t("In the background"), toggle(S.t("Keep the music playing while the tab is hidden or the window is minimized"), !!st.musicHidden, function (v) {
          st.musicHidden = v; save(); S.music.update();
        })), musicOff);
        disable(row(S.t("Playlist"), radios("playlist", [["european", "European pieces"], ["resistance", "Resistance songs"]], st.playlist || "european", function (v) {
          st.playlist = v; save(); S.music.update();
        })), musicOff);
        disable(row(S.t("Music volume"), level(st.musicVolume, D.musicVolume, onLevel(function (v) { st.musicVolume = v; }), S.t("Music volume"),
          S.button(S.t("Play"), { onClick: function () { S.music.preview(S.music.playing() || "eurocrisis"); } }))), musicOff);
        function piece(k, off) {
          var tr = st.tracks[k], name = S.music.PIECES[k].name;
          var on = el("input"); on.type = "checkbox"; on.checked = tr.on;
          on.setAttribute("aria-label", S.t("Play {p}", { p: name }));
          on.addEventListener("change", function () { tr.on = on.checked; save(); });
          var g = level(tr.vol, D.tracks[k].vol, function (v) { tr.vol = v; save(); }, S.t("{p} volume", { p: name }),
            S.button(S.t("Play"), { onClick: function () { S.music.preview(k); } }));
          g.insertBefore(on, g.firstChild);
          disable(row(S.t(name), g), off);
        }
        S.music.ORDER.forEach(function (k) { piece(k, musicOff); });
        note(S.t("Eurocrisis plays by default, Draghi for three years after a Draghi measure, Troika while the bank sits in a Troika, Superbad when a Troika and a Draghi measure come together, Bankrupt when a run ends badly, Ode to Joy when a period ends no better than the record, Finally when a period ends well or in calm years, October for the move into the Federation, and Kremlin for the federal years. A piece that is off gives way to Eurocrisis. Play previews a piece for 20 seconds."));
        group(S.t("Title screen music"));
        if (!soundOff && musicOff) { srNote(S.t("The soundtrack is off, so the title screen plays no music.")); }
        S.music.TITLE_ORDER.forEach(function (k) { piece(k, musicOff); });
        note(S.t("Before a game, Strasbourg plays, or the title theme's own piece when Settings > Appearance asks for it. A theme's piece that is off defaults to Strasbourg."));
        }
      } else if (cat === "game") {
        pane.appendChild(el("h3", "", S.t("Game")));
        /* The settings of the open game have a dialog of their own (Game
           settings, U.gameSettingsDialog); this page keeps the settings for
           every game, and what a new game hides at first */
        if (S.G) {
          group(S.t("This game"));
          row(S.t("Game settings"), S.button(S.t("Open the game settings"), { icon: "difficulty", onClick: function () { U.gameSettingsDialog(); } }));
          note(S.t("The difficulty, the area of responsibility and what this game hides."));
        }
        group(S.t("During a game"));
        row(S.t("Autosave"), toggle(S.t("Update this game's automatic save after every decision and every year"), st.autosave !== false, function (v) { st.autosave = v; save(); }));
        row(S.t("Year report"), toggle(S.t("Close the year report with a click beside it"), !!st.reportClickAway, function (v) { st.reportClickAway = v; save(); }));
        group(S.t("New games"));
        U.HIDE_LABELS.forEach(function (h) {
          var key = S.game.hideKey(h[0]);
          row(S.t(HIDE_ROWS[h[0]][0]), toggle(S.t(HIDE_ROWS[h[0]][1]), !!st[key], function (v) { st[key] = v; save(); }));
        });
        note(S.t("What a new game hides at first. The form for a new game can change it, and each game keeps its own."));
        /* Achievements are kept across games, so they are cleared here */
        group(S.t("Achievements"));
        var earned = U.achievementCount(), clr = S.button(S.t("Clear achievements"), { icon: "delete", cls: "danger", onClick: function () { U.clearAchievements(function () { draw(); }); } });
        clr.disabled = !earned;
        row(S.t("Earned"), el("span", "", S.t("{n} of {m}", { n: earned, m: S.ACHIEVEMENTS.length })));
        row(S.t("Clear"), clr);
        group(S.t("Help"));
        row(S.t("Tour"), S.button(S.t("Show the guided tour again"), { onClick: function () { st.tourDone = false; save(); U.toast(S.t("The tour will run in your next new game, or open it from Help.")); } }));
      } else if (cat === "keyboard") {
        /* Where the keyboard shortcuts work (js/ui/keys.js), their hints,
           and every key in one table */
        pane.appendChild(el("h3", "", S.t("Keyboard")));
        var ks = st.keys, redraw = function () { save(); U.build(); U.render(); draw(); };
        if (!st.keyBind) { st.keyBind = {}; }
        group(S.t("Shortcuts"));
        row(S.t("Keyboard shortcuts"), toggle(S.t("Play with keys, in the areas switched on below"), ks.on !== false, function (v) { ks.on = v; redraw(); }));
        note(S.t("Tab, and Enter or Space on the button that has the focus, always work, whatever these switches say."));
        group(S.t("Where they work"));
        S.KEY_AREAS.forEach(function (a) {
          disable(row(S.t(a[1]), toggle(S.t(a[2]), ks[a[0]] !== false, function (v) { ks[a[0]] = v; redraw(); })), ks.on === false);
        });
        if (ks.on === false) { note(S.t("Turn on Keyboard shortcuts to choose the areas.")); }
        group(S.t("Hints"));
        /* The section shows only with a keyboard connected, so the hints always apply here */
        var lv = S.kbdLevel();
        var hs = el("select");
        hs.setAttribute("aria-label", S.t("Keyboard hints"));
        S.KBD_LEVELS.forEach(function (l) { var o = el("option", "", S.t(l[1])); o.value = l[0]; if (l[0] === lv) { o.selected = true; } hs.appendChild(o); });
        hs.addEventListener("change", function () { st.kbdHints = hs.value; redraw(); });
        row(S.t("Keyboard hints"), hs);
        S.KBD_LEVELS.forEach(function (l) { if (l[0] === lv) { note(S.t(l[2]) + (lv !== "off" ? " " + S.t("A toolbar button always shows its key in its tooltip.") : "")); } });
        /* Key bindings: each action with its key, area by area, as in a
           game's controls. A click on a key waits for the next key pressed
           (Escape cancels); a key another action of the same context holds
           is swapped (S.keyBind, js/ui/keys.js). */
        group(S.t("Key bindings"));
        note(S.t("Click a key, then press the new one; Esc cancels. A key that another action already uses swaps with it, so every action keeps a key. Reset brings back the default, Esc included."));
        var msg = el("p", "dim small key-msg", keyMsg); msg.setAttribute("role", "status"); msg.hidden = !keyMsg;
        into.appendChild(msg);
        var custom = Object.keys(st.keyBind || {}).length;
        var resetAll = S.button(S.t("Reset all keys"), { icon: "reset", onClick: function () { S.keyReset(); capturing = null; keyMsg = S.t("Every key is back on its default."); redraw(); } });
        resetAll.disabled = !custom;
        /* The button sits under the note at the box's own spacing, with no label column */
        var tools = el("div", "key-tools"); tools.appendChild(resetAll); into.appendChild(tools);
        /* Every area sits in the Key bindings box, as a smaller box of its
           own with its title and a table whose columns have the same widths
           in every box, so the keys line up from one area to the next */
        var keyBox = into, keyAreas = el("div", "keyareas");
        keyBox.appendChild(keyAreas);
        function keyTable(title, off) {
          var g = el("section", "keyarea" + (off ? " off" : ""));
          g.appendChild(el("h5", "", off ? S.t("{a} (off)", { a: title }) : title));
          var w = el("div", "table-wrap"), t = el("table", "keymap"), cg = el("colgroup"), tb = el("tbody");
          ["act", "key", "undo"].forEach(function (c) { cg.appendChild(el("col", "c-" + c)); });
          t.setAttribute("aria-label", title);
          t.appendChild(cg); t.appendChild(tb); w.appendChild(t); g.appendChild(w);
          keyAreas.appendChild(g);
          return tb;
        }
        function fixedRow(f) {
          var tr = el("tr", "fixed"), kc = el("td");
          tr.appendChild(el("td", "", S.t(f[2])));
          kc.appendChild(el("kbd", "kbd", S.t(f[0]))); tr.appendChild(kc);
          tr.appendChild(el("td", "dim small", S.t("Fixed")));
          return tr;
        }
        S.KEY_AREAS.forEach(function (a) {
          /* An area switched off dims its keys and says so */
          var on = S.keyOn(a[0]), kb = keyTable(S.t(a[1]), !on);
          S.KEY_FIXED.forEach(function (f) { if (f[1] === a[0]) { kb.appendChild(fixedRow(f)); } });
          S.KEY_ACTIONS.forEach(function (x) {
            if (x[1] !== a[0]) { return; }
            var tr = el("tr"), kc = el("td"), rc = el("td"), cur = S.keyFor(x[0]);
            tr.appendChild(el("td", "", S.t(x[3])));
            var waiting = capturing === x[0];
            var kbtn = S.button(waiting ? S.t("Press a key") : S.keyLabel(cur), { cls: "keycap" + (waiting ? " waiting" : ""), onClick: function () { capture(x[0]); } });
            kbtn.setAttribute("aria-label", waiting ? S.t("{a}: press the new key, or Esc to cancel", { a: S.t(x[3]) }) : S.t("{a}: {k}. Change the key", { a: S.t(x[3]), k: S.keyLabel(cur) }));
            if (waiting) { setTimeout(function () { if (kbtn.isConnected) { kbtn.focus({ preventScroll: true }); } }, 0); }
            kc.appendChild(kbtn); tr.appendChild(kc);
            var def = cur === x[2];
            var rb = S.button("", { icon: "reset", cls: "flat small", title: def ? S.t("Default key") : S.t("Back to {k}", { k: S.keyLabel(x[2]) }), onClick: function () {
              S.keyReset(x[0]); keyMsg = S.t("{a} is back on {k}.", { a: S.t(x[3]), k: S.keyLabel(x[2]) }); redraw();
            } });
            rb.setAttribute("aria-label", rb.title); rb.disabled = def;
            rc.appendChild(rb); tr.appendChild(rc);
            kb.appendChild(tr);
          });
        });
        var everywhere = S.KEY_FIXED.filter(function (f) { return !f[1]; });
        if (everywhere.length) { var eb = keyTable(S.t("Everywhere"), false); everywhere.forEach(function (f) { eb.appendChild(fixedRow(f)); }); }
      } else if (cat === "motion") {
        pane.appendChild(el("h3", "", S.t("Motion and text")));
        group(S.t("Motion"));
        row(S.t("Motion"), radios("motion", [["system", "Follow the system"], ["reduce", "Reduce"], ["full", "Full"]], st.motion, function (v) { st.motion = v; save(); U.render(); }));
        note(S.t("Reduced motion stops decorative motion. The turn transition, the Council vote and charts and values moving to their new figures always run, because they show information."));
        group(S.t("Text"));
        row(S.t("Line breaks"), toggle(S.t("Even line breaks: no word alone on the last line of a paragraph"), st.prettyWrap !== false, function (v) { st.prettyWrap = v; save(); U.render(); draw(); }));
        /* The kinds of element that break evenly, each on or off */
        var parts = el("div", "stack-ctl checks");
        Object.keys(S.WRAP_PARTS).forEach(function (k) {
          var l = el("label", "check"), cb = el("input");
          cb.type = "checkbox"; cb.checked = st.wrapParts[k] !== false;
          cb.addEventListener("change", function () { st.wrapParts[k] = cb.checked; save(); U.render(); });
          l.appendChild(cb); l.appendChild(el("span", "", S.t(S.WRAP_PARTS[k].name)));
          parts.appendChild(l);
        });
        disable(row(S.t("Apply to"), parts), st.prettyWrap === false, S.t("Even line breaks are off."));
        if (!S.prettyWrap.native) { note(S.t("This browser lacks text-wrap: pretty, so a script joins the last two words of each block in its place.")); }
        group(S.t("Glossary and footnotes"));
        row(S.t("Glossary links"), toggle(S.t("Link terms in the text to their definitions"), st.termLinks !== false, function (v) { st.termLinks = v; save(); U.render(); }));
        row(S.t("Footnotes"), toggle(S.t("Number the harder ideas on a card and explain them in notes under it"), st.footnotes !== false, function (v) { st.footnotes = v; save(); U.render(); }));
        note(S.t("With the links off, terms show as plain text, and the Glossary view still lists every term. With the footnotes off, cards show no numbers and no notes."));
        group(S.t("Text size and dates"));
        row(S.t("Text size"), radios("size", [["normal", "Normal"], ["large", "Large"]], st.size, function (v) { st.size = v; save(); }));
        /* Each format shows today's date as an example */
        var df = el("select"), today = new Date();
        df.setAttribute("aria-label", S.t("Date format"));
        S.DATE_FORMATS.forEach(function (f) {
          var keep = st.dateFormat; st.dateFormat = f[0];
          var o = el("option", "", S.fmtDate(today) + " · " + f[1] + " · " + S.t(f[2]));
          st.dateFormat = keep;
          o.value = f[0];
          if (f[0] === (st.dateFormat || "dd-mm-yyyy")) { o.selected = true; }
          df.appendChild(o);
        });
        df.addEventListener("change", function () { st.dateFormat = df.value; save(); U.render(); });
        row(S.t("Date format"), df);
      } else if (cat === "storage") {
        storagePage(pane, row, radios, toggle, draw, group);
      } else {
        pane.appendChild(el("h3", "", S.t("Debug")));
        group(null);
        note(S.t("Tools for testing the game. Adding ?debug to the page address turns debug mode and the panel on for one visit."));
        /* Debug mode grants the tools below; while it is off they are disabled and none of them acts */
        row(S.t("Debug mode"), toggle(S.t("Allow the debug tools below"), S.debugMode(), function (v) { st.debugMode = v; S.debugHidden = false; save(); S.applyDebug(); U.render(); draw(); }));
        var dbgOff = !S.debugMode();
        /* Plain to see from the dimmed tools; said for screen readers */
        if (dbgOff) { into.appendChild(el("p", "sr-only", S.t("Debug mode is off, so the tools below are disabled."))); }
        if (S.debugUrl) { note(S.t("?debug in the address keeps debug mode on for this visit.")); }
        disable(row(S.t("Debug panel"), toggle(S.t("A movable panel with the situation and buttons that act on the game"), st.debugPanel, function (v) { st.debugPanel = v; S.debugHidden = false; save(); S.applyDebug(); U.render(); })), dbgOff);
        disable(row(S.t("Debug log"), toggle(S.t("Print events to the browser console (filter by ECBSIM)"), st.debugLog, function (v) { st.debugLog = v; save(); S.applyDebug(); })), dbgOff);
        disable(row(S.t("Fast mode"), toggle(S.t("Shorten the vote, the turn transition and the charts"), st.fast, function (v) { st.fast = v; save(); S.applyDebug(); })), dbgOff);
        disable(row(S.t("Debug bar"), toggle(S.t("Show the debug bar above the agenda"), !!st.debugBarOn, function (v) { st.debugBarOn = v; save(); U.render(); })), dbgOff);
        disable(row(S.t("Jumps into an ending"), toggle(S.t("Ask before a jump that ends the period"), st.debugConfirmEnd !== false, function (v) { st.debugConfirmEnd = v; save(); })), dbgOff);
        disable(row(S.t("Intended path"), toggle(S.t("Mark the options on the intended path"), !!st.debugIntended, function (v) { st.debugIntended = v; save(); U.render(); })), dbgOff);
        disable(row(S.t("Achievement notices"), toggle(S.t("Announce the achievements a run earns by the rules without keeping them"), !!st.debugAchieveDry, function (v) { st.debugAchieveDry = v; save(); })), dbgOff);
        /* A clean start at each reload; it works with debug mode off too */
        var tbox = group(S.t("Testing"));
        row(S.t("Wipe data on refresh"), toggle(S.t("Start fresh at every reload"), S.wipeOn(), function (v) { S.setWipe(v); draw(); }));
        /* Survives every wipe: Wipe data on refresh, Delete all game data
           and Reset all settings keep the debug settings when it is on */
        row(S.t("Keep debug through wipes"), toggle(S.t("Keep the debug settings, Wipe data on refresh and the panel's position when the data or the settings are wiped"), S.debugKeep(), function (v) { S.setDebugKeep(v); draw(); }));
        wipeWarn(tbox);
      }
      /* The list of categories names the page, so its heading is for
         screen readers only; each card's bar heads its settings */
      var ph = pane.querySelector(":scope > h3");
      if (ph) { ph.classList.add("sr-only"); }
      if (j) {
        j.keep.forEach(function (k) { k[0].scrollTop = k[1]; });
        var f = j.focus && pane.querySelector(j.focus); if (f) { f.focus({ preventScroll: true }); }
      } else if (same) { keep.forEach(function (k) { k[0].scrollTop = k[1]; }); }
    }
    draw();
    /* Leaving the Sound page, or closing Settings, ends a preview at once */
    U.dialog({ title: S.t("Settings"), icon: "settings", body: wrap, cls: "settings-dialog", flush: true, onClose: function () { S.music.stopPreview(); } });
  };

  /* ---------- Storage, as in Selk ---------- */
  /* This computer with Wipe data on refresh (Settings > Debug): the two
     disagree, so both pages say so */
  function wipeWarn(box) {
    if (!(S.saveLocal() && S.wipeOn())) { return; }
    var n = el("div", "set-warn");
    n.setAttribute("role", "note");
    n.appendChild(el("p", "", S.t("These options are incompatible. This computer keeps the game in localStorage, and Wipe data on refresh erases it when you leave or reload the page.")));
    n.appendChild(el("p", "", S.t("Wipe data on refresh takes priority, so every visit starts a new game.")));
    box.appendChild(n);
  }
  function storagePage(pane, row, radios, toggle, redraw, group) {
    pane.appendChild(el("h3", "", S.t("Storage")));
    var box = group(S.t("Where the game is kept"));
    row(S.t("Save location"), radios("where", [["tab", "This tab"], ["computer", "This computer"]], S.saveLocal() ? "computer" : "tab", function (v) {
      if (v === "computer") {
        if (S.setSaveLocal(true)) { U.toast(S.t("Progress is now kept on this computer."), "good"); }
        else { U.toast(S.t("This browser does not allow saving on this computer."), "bad"); }
        redraw();
      } else {
        U.confirmTabOnly(redraw);
      }
    }));
    box.appendChild(el("p", "dim small", S.saveLocal() ? S.t("This computer: the game stays in this browser until you delete it, and nothing leaves this computer.") :
      S.t("This tab: the game stays in this browser tab, and nothing leaves this computer. Closing the tab erases the game; choose This computer to continue another day.")));
    wipeWarn(box);
    box = group(S.t("Kept data"));
    var rows = [];
    [["localStorage", S.t("This computer")], ["sessionStorage", S.t("This tab")]].forEach(function (pair) {
      S.storageKeys(pair[0]).forEach(function (k) { rows.push({ key: k, area: pair[0], where: pair[1] }); });
    });
    if (!rows.length) { box.appendChild(S.placeholder("storage", S.t("No data kept."))); }
    /* A list of the items, as the groups of sounds are listed: each with
       its name, a line under it (where, size, key), and View and Delete
       as icon buttons at its right; View opens the contents under it */
    var list = el("div", "kept-list");
    if (rows.length) { box.appendChild(list); }
    rows.forEach(function (it) {
      var v = "", name = S.t(S.KEY_NAMES[it.key] || it.key);
      try { v = window[it.area].getItem(it.key) || ""; } catch (e) {}
      var item = el("div", "kept-item"), line = el("div", "kept-line"), t = el("span", "set-menu-text");
      t.appendChild(el("span", "", name));
      t.appendChild(el("span", "dim small", it.where + ", " + (v.length > 1024 ? (v.length / 1024).toFixed(1) + " KB" : v.length + " B") + ", " + it.key));
      line.appendChild(t);
      var pre = el("div", "json"); pre.hidden = true;
      function iconButton(icon, label, on) {
        var btn = S.button("", { icon: icon, cls: "flat", title: label, onClick: on });
        btn.setAttribute("aria-label", label); line.appendChild(btn); return btn;
      }
      var view = iconButton("view", S.t("View {k}", { k: name }), function () {
        if (pre.hidden) { try { pre.textContent = JSON.stringify(JSON.parse(v), null, 2).slice(0, 20000); } catch (e) { pre.textContent = v; } }
        pre.hidden = !pre.hidden; view.setAttribute("aria-expanded", String(!pre.hidden));
      });
      view.setAttribute("aria-expanded", "false");
      iconButton("delete", S.t("Delete {k}", { k: name }), function () {
        U.dialog({ title: S.t("Delete {k}?", { k: name }), icon: "delete",
          body: el("p", "", it.key === "ecbsim-settings" ? S.t("The settings return to their defaults.") : S.t("This cannot be undone.")),
          buttons: [{ label: S.t("Cancel") }, { label: S.t("Delete"), primary: true, onClick: function () {
            try { window[it.area].removeItem(it.key); } catch (e) {}
            S.sound.play("delete");
            if (it.key === "ecbsim-settings") { S.loadSettings(); S.applyTheme(); S.sound.apply(); U.syncSound(); }
            redraw();
            return "quiet";
          } }] });
      });
      item.appendChild(line); item.appendChild(pre);
      list.appendChild(item);
    });
    /* Delete the games and keep the settings, or delete everything */
    function wipe(keep) {
      U.dialog({ title: keep ? S.t("Delete the game data?") : S.t("Delete all game data, including settings?"), icon: "delete",
        body: el("p", "", keep ? S.t("Every save and the achievements are erased in both storages, and the game in progress closes. The settings stay.") :
          (S.debugKeep() ? S.t("Every save, the achievements and every setting are erased in both storages, and the game in progress closes. The save location returns to This tab. Keep debug through wipes is on, so the debug settings stay.") :
            S.t("Every save, the achievements and every setting are erased in both storages, and the game in progress closes. The settings include the debug settings, Wipe data on refresh and the save location, which returns to This tab."))),
        buttons: [{ label: S.t("Cancel") }, { label: keep ? S.t("Delete the game data") : S.t("Delete all"), primary: true, onClick: function () {
          /* The game in progress goes with its saves: the window shows that the data is gone */
          S.wipeAll(keep, !keep); S.loadSettings(); S.applyTheme(); S.sound.apply(); S.debugHidden = false; S.applyDebug(); S.sound.play("delete");
          S.G = null; U.title = false; U.deleted = keep ? "game" : "all"; U.view = "agenda";
          setTimeout(function () { U.closeAll(true); document.querySelectorAll(".toast").forEach(function (t) { t.remove(); }); U.syncSound(); U.render(); }, 0);
          return "quiet";
        } }] });
    }
    /* File operations, last: export and import, then the two that delete
       everything */
    group(S.t("File operations"));
    var ex = el("div", "init-row");
    ex.appendChild(S.button(S.t("Export the game"), { icon: "export", disabled: !S.G, onClick: function () { U.exportGame(); } }));
    ex.appendChild(S.button(S.t("Export all games"), { icon: "export", disabled: !S.G && !S.saves.list().length, onClick: function () { U.exportAll(); } }));
    var file = el("input");
    file.type = "file"; file.accept = "application/json,.json"; file.hidden = true;
    file.addEventListener("change", function () { var f = file.files[0]; file.value = ""; if (f) { U.importGame(f); } });
    ex.appendChild(file);
    ex.appendChild(S.button(S.t("Import games"), { icon: "import", onClick: function () { file.click(); } }));
    row(S.t("Game files"), ex);
    var wr = el("div", "init-row");
    wr.appendChild(S.button(S.t("Delete the game data, keep the settings"), { cls: "danger", icon: "delete", onClick: function () { wipe(true); } }));
    wr.appendChild(S.button(S.t("Delete all game data, including settings"), { cls: "danger", icon: "delete", onClick: function () { wipe(false); } }));
    row(S.t("Delete data"), wr);
    /* Every setting back to its default, keeping the saves */
    row(S.t("Settings"), S.button(S.t("Reset all settings"), { icon: "reset", onClick: function () {
      U.dialog({ title: S.t("Reset all settings?"), icon: "warning",
        body: el("p", "", S.debugKeep() ? S.t("Every setting returns to its default. The saves, the achievements and the save location stay.") :
          S.t("Every setting returns to its default, including the debug settings and Wipe data on refresh. The saves, the achievements and the save location stay.")),
        buttons: [{ label: S.t("Cancel") }, { label: S.t("Reset all settings"), primary: true, onClick: function () {
          S.resetSettings(); S.applyTheme(); S.sound.apply(); S.debugHidden = false; S.applyDebug(); U.syncSound();
          U.toast(S.t("Every setting is back to its default."), "good");
          U.render(); redraw();
        } }] });
    } }));
  }
  /* Switching to this tab only asks first, as in Selk */
  U.confirmTabOnly = function (after) {
    U.dialog({ title: S.t("Save in this tab only?"), icon: "warning",
      body: el("p", "", S.t("Your progress moves from this computer to this browser tab. When you close the tab, all game data is deleted.")),
      buttons: [
        { label: S.t("Keep on this computer"), onClick: function () { if (after) { after(); } } },
        { label: S.t("Switch to this tab"), primary: true, onClick: function () {
          S.setSaveLocal(false); U.toast(S.t("Progress is now kept in this tab only."), "warn"); if (after) { after(); }
        } }
      ] });
  };
  /* Writes games, as S.saves.exportGames gives them, to a file */
  U.downloadExport = function (games, file) {
    var blob = new Blob([JSON.stringify({ app: "ecb-simulator", games: games }, null, 1)], { type: "application/json" });
    var a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = file;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    S.sound.play("export");
  };
  /* Settings > Storage exports the game in progress with every save of its own */
  U.exportGame = function () {
    if (!S.G) { return; }
    U.downloadExport(S.saves.exportGames([], S.G), "ecb-simulator-" + S.G.year + ".json");
  };
  /* Settings > Storage exports every save kept, with the game in progress
     as it is now */
  U.exportAll = function () {
    var ids = S.saves.list().map(function (x) { return x.slot.id; });
    if (!ids.length && !S.G) { return; }
    U.downloadExport(S.saves.exportGames(ids, S.G), "ecb-simulator-all.json");
  };
  /* A file of games becomes an import of its own (S.saves.importGames)
     after two steps. The file must be an export of this game of at most
     20 MB, and pass S.game.validateExport, which refuses malformed or
     hostile data. The player then confirms what it adds. */
  var IMPORT_MAX = 20 * 1024 * 1024;
  U.importGame = function (f, after) {
    function refuse(why) { S.sound.play("error"); U.toast(S.t("This file is not a saved game of this version: {why}.", { why: S.t(why) }), "bad"); }
    if (!f || f.size > IMPORT_MAX) { refuse("the file is larger than 20 MB"); return; }
    var r = new FileReader();
    r.onerror = function () { refuse("it cannot be read"); };
    r.onload = function () {
      var d;
      try { d = JSON.parse(String(r.result)); } catch (e) { refuse("it is not JSON"); return; }
      var res = S.game.validateExport(d);
      if (res.error) { refuse(res.error); return; }
      var games = res.games, n = games.reduce(function (t, g) { return t + g.saves.length; }, 0);
      /* A game of the file whose run is kept here (by its game ID) can be
         added to that game, which gets the saves it lacks, or added as a
         copy; the player chooses for each such game, adding to it first */
      var found = games.map(function (g) { return S.saves.findRun(g.saves[0].save.game.id); }), choice = found.map(function (f) { return f ? "into" : "copy"; });
      var box = el("div", "prose"), ul = el("ul"), nextImp = S.saves.nextImport(), tail = el("p");
      function tell() {
        var copies = choice.filter(function (c) { return c === "copy"; }).length;
        tail.textContent = !copies ? S.t("Nothing kept here changes, other than the saves added to the games named above.") :
          copies === 1 ? S.t("The copy joins your saves as import I{n}, a game of its own, with IDs such as I{n}A. Nothing else kept here changes.", { n: nextImp }) :
          S.t("The copies join your saves as import I{n}, with a number for each game and IDs such as I{n}-1A. Nothing else kept here changes.", { n: nextImp });
      }
      games.forEach(function (g, i) {
        var last = g.saves.reduce(function (m, x) { return !m || x.save.at > m.save.at ? x : m; }, null).save.game;
        var what = { i: i + 1, n: g.saves.length, p: last.president.name || S.t("a president without a name"), y: last.year, m: last.mode === "post" ? S.t("post-federative") : S.t("pre-federative") };
        /* One game has no number, as in its IDs */
        var line = g.saves.length === 1 ? S.t("1 save, {p}, {y}, {m}", what) : S.t("{n} saves, {p}, {y}, {m}", what);
        var li = el("li", "", games.length === 1 ? line : S.t("Game {i}: {l}", { i: i + 1, l: line }));
        if (found[i]) {
          var lack = S.saves.missing(found[i], g.saves).length, pick = el("select"), gname = /^I/.test(found[i].name) ? found[i].name : S.t("game {n}", { n: found[i].name });
          pick.setAttribute("aria-label", S.t("Where game {i} goes", { i: i + 1 }));
          [["into", lack === 1 ? S.t("Add the save it lacks to {g}", { g: gname }) : lack ? S.t("Add the {k} saves it lacks to {g}", { k: lack, g: gname }) : S.t("Add nothing: {g} has every save", { g: gname })],
            ["copy", S.t("Add it as a copy, a game of its own")]].forEach(function (o) { var op = el("option", "", o[1]); op.value = o[0]; pick.appendChild(op); });
          pick.addEventListener("change", function () { choice[i] = pick.value; tell(); });
          var where = el("div", "import-match");
          where.appendChild(el("div", "dim small", S.t("This is the run of {g}, kept here.", { g: gname })));
          where.appendChild(pick);
          li.appendChild(where);
        }
        ul.appendChild(li);
      });
      box.appendChild(el("p", "", games.length === 1 ? (n === 1 ? S.t("The file contains 1 game with 1 save:") : S.t("The file contains 1 game with {n} saves:", { n: n })) :
        S.t("The file contains {g} games with {n} saves in all:", { g: games.length, n: n })));
      box.appendChild(ul);
      tell();
      box.appendChild(tail);
      function add(open) {
        var made = S.saves.importGames(games, found.map(function (f, i) { return choice[i] === "into" ? f : null; }));
        if (!made) { S.sound.play("error"); U.toast(S.t("This browser does not allow saving."), "bad"); return; }
        var added = made.slots.length;
        S.sound.play("import");
        U.toast(made.imp ? S.t("Added as import I{n}.", { n: made.imp }) : added === 1 ? S.t("1 save added.") : S.t("{n} saves added.", { n: added }), "good");
        if (after) { after(); }
        if (open) {
          var latest = made.slots.map(function (slot) { return { slot: slot, save: S.saves.read(slot.id) }; }).filter(function (x) { return x.save; })
            .sort(function (x, y) { return x.save.at < y.save.at ? 1 : -1; })[0];
          if (latest) { U.closeAll(S.soundSetting("load").on); U.openSave(latest.save, latest.slot); }
        } else if (U.title && !S.G) { U.render(); }
      }
      U.dialog({ title: S.t("Import the file?"), icon: "import", body: box, buttons: [
        { label: S.t("Cancel") },
        { label: S.t("Add and open the latest"), onClick: function () { add(true); } },
        { label: S.t("Add"), primary: true, onClick: function () { add(false); } }
      ] });
    };
    r.readAsText(f);
  };

  /* After a close of the tab is canceled, offer to keep the game, once per tab */
  function nudged() { try { return sessionStorage.getItem(S.NUDGED_KEY) === "1"; } catch (e) { return true; } }
  var closePending = false;
  function offer() {
    if (!closePending) { return; }
    closePending = false;
    if (document.hidden || S.saveLocal() || S.wipeOn() || !S.G || nudged()) { return; }
    try { sessionStorage.setItem(S.NUDGED_KEY, "1"); } catch (e) {}
    U.toast(S.t("Your progress is saved in this browser tab only. Closing the tab erases it. Keep it on this computer to continue another day."), "warn", [
      { label: S.t("Keep on this computer"), primary: true, onClick: function () {
        if (S.setSaveLocal(true)) { U.toast(S.t("Progress is now kept on this computer."), "good"); }
        else { U.toast(S.t("This browser does not allow saving on this computer."), "bad"); }
      } },
      { label: S.t("Not now") }
    ], 15000);
  }
  /* A reload or close updates this game's automatic slot, if it has one.
     Manual slots remain snapshots. */
  function keep() { if (S.G && !S.wipeOn()) { S.saves.write("auto", S.G); } }
  /* The same, under a name no local variable of the settings pane hides */
  function keepGame() { keep(); }
  window.addEventListener("pagehide", keep);
  document.addEventListener("visibilitychange", function () { if (document.hidden) { keep(); } });
  window.addEventListener("focus", offer);
  document.addEventListener("visibilitychange", offer);
  window.addEventListener("beforeunload", function (e) {
    if (S.saveLocal() || S.wipeOn() || !S.G || S.G.year === S.G.startYear && S.G.agenda.every(function (x) { return !x.done; })) { return; }
    closePending = true;
    /* The browser's leave prompt cannot be changed. If the player cancels
       it, the game offers to keep the save when the page has the focus again. */
    setTimeout(offer, 250);
    e.preventDefault();
    e.returnValue = "";
  });

  /* ---------- Help and Selk ---------- */
  /* The account of Selk: its own dialog from the start screen, or a page
     that slides into the help dialog */
  U.selkBody = function () {
    var b = el("div", "prose");
    [
      ["p", "Selk is a browser game by the designer of this one. It is set in 2097 at a research and construction base in the Selk crater on Titan, the largest moon of Saturn. The player reads the base's files, follows the evidence and decides what happens to the base."],
      ["p", "Selk's archive tells a history of Europe from 2026 to 2097. This game follows it after 2025, so the two games share one future:"],
      ["ul", ""],
      ["p", "You do not need to know Selk to play. Every event from its history is explained on the card where it appears, and the glossary has an entry for each name."]
    ].forEach(function (x) {
      if (x[0] === "ul") {
        var ul = el("ul");
        [
          "2024 to 2031: far-right parties lead or support governments in 11 of the 27 member states.",
          "2033 to 2036: climate general strikes after heatwaves and failed harvests; 9 states pass a 32-hour working week.",
          "2038: the European Left Alliance is founded by the parties of The Left, the left wing of the Greens and the strike committees.",
          "2041: the European Union becomes the Federation of Europe, with one budget and one debt, after referendums in every member state.",
          "2044 and 2045: the European Left Alliance wins 432 of 800 seats; voters elect the Commission, the central bank reports to the Federal Parliament, and the debt rules are repealed.",
          "2050s: floods and heatwaves; 2052: CESEA, a space agency of Central and Eastern Europe, is founded; 2063: warming stops at 1.9 °C.",
          "2071: HX Holdings, a private space company, is founded by Halvorsen Relay and Xiran Spaceports."
        ].forEach(function (t) { ul.appendChild(el("li", "", S.t(t))); });
        b.appendChild(ul);
      } else {
        b.appendChild(el(x[0], "", S.t(x[1])));
      }
    });
    return b;
  };
  U.selkDialog = function () {
    U.dialog({ title: S.t("What is Selk?"), icon: "about", body: U.selkBody(), buttons: [{ label: S.t("Close"), primary: true }] });
  };
  /* Help, as KDE's Help Center: the sections beside the page
     (js/data/help.js), the Concept first */
  U.helpDialog = function (sec) {
    var acr = S.bankName().acr, wrap = el("div", "settings help-doc");
    var cats = el("div", "cats"), pane = el("div", "pane");
    cats.setAttribute("role", "tablist"); cats.setAttribute("aria-label", S.t("Contents"));
    wrap.appendChild(cats); wrap.appendChild(pane);
    sec = sec || S.HELP[0].id;
    function draw() {
      S.clear(pane);
      Array.prototype.forEach.call(cats.children, function (b) {
        if (b.dataset.sec === sec) { b.setAttribute("aria-current", "page"); } else { b.removeAttribute("aria-current"); }
      });
      var h = S.HELP.filter(function (x) { return x.id === sec; })[0];
      var page = el("article", "prose help-page");
      page.appendChild(el("h3", "", S.t(h.title)));
      if (h.blocks === "selk") { page.appendChild(U.selkBody()); }
      else {
        h.blocks.forEach(function (b) {
          if (b[0] === "ul") {
            var ul = el("ul", "help-list");
            b[1].forEach(function (it) {
              var li = el("li");
              li.appendChild(el("b", "", S.t(it[0]) + ": "));
              S.linkify(S.t(it[1]), li);
              ul.appendChild(li);
            });
            page.appendChild(ul);
          } else if (b[0] === "h3") {
            page.appendChild(el("h4", "", S.t(b[1])));
          } else {
            var p = el("p"); S.linkify(S.t(b[1]), p); page.appendChild(p);
          }
        });
      }
      pane.appendChild(page);
      pane.scrollTop = 0;
      setTimeout(S.levelHeadings, 0);
    }
    /* The Debug page shows only in debug mode */
    S.HELP.forEach(function (h) {
      if (h.debug && !(S.debugMode && S.debugMode())) { return; }
      var b = el("button", "sideitem" + (h.keys ? " keys-only" : ""));
      b.type = "button"; b.dataset.sec = h.id;
      b.appendChild(S.icon(h.icon));
      b.appendChild(el("span", "", S.t(h.title)));
      b.addEventListener("click", function () { sec = h.id; S.sound.play("select"); draw(); });
      cats.appendChild(b);
    });
    draw();
    U.dialog({ title: S.t("{a} Simulator: help", { a: acr }), icon: "help", body: wrap, cls: "settings-dialog help-dialog", flush: true, buttons: [
      /* The tour walks through a game, so it is offered only while one is open */
      S.G ? { label: S.t("Guided tour"), onClick: function () { setTimeout(U.tour, 100); } } : null,
      { label: S.t("Close"), primary: true }
    ].filter(Boolean) });
  };

  /* ---------- Game settings ----------
     The settings of the open game, apart from the settings for every
     game: its difficulty, with the four values of the custom level, its
     area of responsibility and what it hides. Each change applies at once
     to this game only and is saved with it. A warning at the top says that
     large changes during a game can unbalance it. A change of level is
     kept in the run (G.levelLog), since Against the odds needs a run
     played on Hard from start to end. */
  U.gameSettingsDialog = function () {
    var G = S.G;
    if (!G) { return; }
    var wrap = el("div", "settings solo"), pane = el("div", "pane"), into = pane;
    wrap.appendChild(pane);
    function group(title) { var sec = el("section", "setblock"), g = el("div", "setgroup"); sec.appendChild(el("h4", "", title)); sec.appendChild(g); pane.appendChild(sec); into = g; return g; }
    function note(text) { into.appendChild(el("p", "dim small", text)); }
    function row(label, node) { var r = el("div", "row"); r.appendChild(el("span", "lbl", label)); r.appendChild(node); into.appendChild(r); return r; }
    function toggle(text, value, on) {
      var l = el("label", "switch"), cb = el("input");
      cb.type = "checkbox"; cb.checked = value;
      cb.addEventListener("change", function () { on(cb.checked); });
      l.appendChild(cb); l.appendChild(el("span", "track")); l.appendChild(el("span", "", text));
      return l;
    }
    function changed() { keepGame(); U.render(); }
    function draw() {
      S.clear(pane); into = pane;
      var warn = el("div", "set-warn");
      warn.setAttribute("role", "note");
      warn.appendChild(el("p", "", S.t("These settings belong to this game and apply at once. Large changes during a game can unbalance it: a harder level can turn votes that passed into votes that fail, and an easier one makes the run harder to compare with others.")));
      pane.appendChild(warn);
      /* A game changed by the debug tools says so, under the warning */
      if (S.tainted(G)) {
        var tw = el("div", "set-warn caution");
        tw.setAttribute("role", "note");
        tw.appendChild(el("p", "", (G.taint.length === 1 ? S.t("This game has been changed with the debug tools once, in {y}.", { y: G.taint[0].y }) : S.t("This game has been changed with the debug tools {n} times, first in {y}.", { n: G.taint.length, y: G.taint[0].y })) + " " + S.t("It earns no achievement other than Market manipulator, and its saves show the tag Debug used, which lists each change.")));
        pane.appendChild(tw);
      }
      group(S.t("Difficulty"));
      var lv = el("select");
      lv.setAttribute("aria-label", S.t("Difficulty"));
      Object.keys(S.game.DIFFICULTY).concat(["custom"]).forEach(function (k) {
        var o = el("option", "", S.t(k === "custom" ? "Custom" : S.game.DIFFICULTY[k].name)); o.value = k; if (k === (G.difficulty || "normal")) { o.selected = true; } lv.appendChild(o);
      });
      lv.addEventListener("change", function () {
        var from = S.game.level(G);
        if (lv.value === "custom" && !G.customLevel) { G.customLevel = { will: from.will, dist: from.dist, rel: from.rel, gain: from.gain }; }
        G.difficulty = lv.value;
        G.levelLog = (G.levelLog || []).concat([{ y: G.year, d: lv.value }]);
        S.game.log(G, "The difficulty of this game changes to " + (lv.value === "custom" ? "Custom" : S.game.DIFFICULTY[lv.value].name) + ".", "news");
        changed(); draw();
      });
      row(S.t("Level"), lv);
      if (G.difficulty === "custom") {
        if (!G.customLevel) { G.customLevel = S.game.customLevel(); delete G.customLevel.name; }
        into.appendChild(U.levers(G.customLevel, changed));
      }
      note(S.t("A change counts from the next vote. Against the odds needs a run played on Hard from its first year."));
      group(S.t("Area of responsibility"));
      var scs = el("select");
      scs.setAttribute("aria-label", S.t("Area of responsibility"));
      Object.keys(S.game.SCOPE).forEach(function (k) {
        var o = el("option", "", S.t(S.game.SCOPE[k].name)); o.value = k; if (k === (G.scope || "standard")) { o.selected = true; } scs.appendChild(o);
      });
      scs.addEventListener("change", function () { G.scope = scs.value; changed(); });
      row(S.t("Items a year"), scs);
      note(S.t("How many optional decisions a year brings: Narrow, Standard or Broad. The year's events and the essential items, such as emergency liquidity or a bank in trouble, come at every level. A change applies from the next year."));
      group(S.t("Hidden in this game"));
      if (!G.hide) { G.hide = {}; S.game.HIDE.forEach(function (k) { G.hide[k] = S.game.hides(null, k); }); }
      U.HIDE_LABELS.forEach(function (h) {
        row(S.t(HIDE_ROWS[h[0]][0]), toggle(S.t(HIDE_ROWS[h[0]][1]), !!G.hide[h[0]], function (v) { G.hide[h[0]] = v; changed(); }));
      });
    }
    draw();
    U.dialog({ title: S.t("Game settings"), icon: "difficulty", body: wrap, cls: "game-settings-dialog", flush: true, buttons: [{ label: S.t("Close"), primary: true }] });
  };

  /* ---------- Saves ---------- */
  /* When a save was made, in the player's own time and date format */
  U.saveDate = function (at) { return S.fmtDate(at, true); };
  /* One line on what a save holds */
  U.saveSummary = function (save) {
    return S.t("{p}, {y}, {m}, saved {d}", { p: save.president, y: save.year, m: save.mode === "post" ? S.t("post-federative") : S.t("pre-federative"), d: U.saveDate(save.at) });
  };
  /* A field for the name of a save; Enter presses the dialog's main button */
  function saveNameField(value, placeholder) {
    var l = el("label", "save-name"), input = el("input");
    input.type = "text"; input.maxLength = S.SAVE_NAME_MAX; input.value = value || ""; input.placeholder = placeholder;
    input.setAttribute("aria-label", S.t("Name of the save"));
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") { return; }
      e.preventDefault();
      var main = l.closest(".dialog, .save-section").querySelector(".save-go, .dfoot .btn.primary");
      if (main) { main.click(); }
    });
    l.appendChild(input);
    return { node: l, input: input };
  }
  U.renameSave = function (slot, after) {
    var box = el("div", "prose"), f = saveNameField(slot.name, S.saves.title({ kind: slot.kind }));
    box.appendChild(el("p", "", S.t("A name helps you find the save again. The ID {id} stays.", { id: S.saves.label(slot) })));
    box.appendChild(f.node);
    U.dialog({ title: S.t("Rename save {id}", { id: S.saves.label(slot) }), icon: "proposals", body: box, buttons: [
      { label: S.t("Cancel") },
      { label: S.t("Rename"), primary: true, onClick: function () { S.saves.rename(slot.id, f.input.value); if (after) { after(); } } }
    ] });
    setTimeout(function () { f.input.focus(); f.input.select(); }, 0);
  };
  /* Opens a save. Without autosave the game in progress may have changed
     since it was last saved, so the player confirms first. */
  U.openSave = function (save, slot, done) {
    /* The load sound, when on, stands in for the close of the dialog and
       the click of Load; when off, the close and the click play as usual */
    function go() { if (done) { done(S.soundSetting("load").on); } U.loadGame(save.game, slot); S.sound.play("load"); }
    if (!S.G || S.settings.autosave !== false) { go(); return; }
    U.dialog({ title: S.t("Load save {id}?", { id: S.saves.label(slot) }), icon: "warning",
      body: el("p", "", S.t("Autosave is off, so any progress since you last saved this game is lost.")),
      buttons: [{ label: S.t("Cancel") }, { label: S.t("Load"), primary: true, onClick: function () { go(); return "quiet"; } }] });
  };
  /* The groups of interface sounds: [group, name, the sound its Test plays] */
  var SOUND_CATS = [["clicks", "Clicks", "click", "Click sounds"], ["alerts", "Alerts", "alert", "Alert sounds"], ["votes", "Votes", "yes", "Vote sounds"],
    ["turn", "End of a year", "turn", "End of a year sound"], ["saves", "Saves", "save", "Save sounds"], ["typing", "Typing and pointer", "type", "Typing and pointer sounds"]];
  /* The row names of what a game hides, in Settings > Game */
  var HIDE_ROWS = {
    history: ["The record", "Hide the historical choice and the \"In history\" box on each card"],
    votes: ["Council votes", "Hide the expected vote on each option"],
    troika: ["Troika", "Hide the Troika label on each option"],
    draghi: ["Draghi measures", "Hide the Draghi measure label on each option"],
    forecasts: ["Forecasts", "Hide the advisors' forecasts"]
  };
  var SORT_NAMES = { newest: "Newest first", oldest: "Oldest first", year: "Year in the game", president: "President", name: "Name" };
  var GROUP_NAMES = { none: "No groups", game: "Game", kind: "Kind", period: "Period" };
  /* The group a save falls in, as [key, heading]; groups keep the order
     of their first save in the sorted list, except that the game in
     progress comes first */
  function saveGroup(by, x) {
    if (by === "kind") { return x.slot.kind === "automatic" ? ["0", S.t("Autosaves")] : ["1", S.t("Manual saves")]; }
    if (by === "period") { return x.save.mode === "post" ? ["1", S.t("Post-federative")] : ["0", S.t("Pre-federative")]; }
    /* An import is one group, so it can be selected and deleted at once */
    if (x.slot.imp) { return ["I" + x.slot.imp, S.t("Import I{n}", { n: x.slot.imp })]; }
    var n = S.saves.game(x.slot);
    return [String(n), S.t("Game {n}", { n: n })];
  }
  /* Save and Load share one list of every save, sorted as the player
     chose. Saving makes a new save at once; a manual save can also be
     overwritten. Every save can be renamed and deleted. Import and Select
     are actions at the left of the dialog's foot. Select turns on
     selection, as on a phone: each save and each group gets a check box,
     and a bar at the top holds a check box for all, the count, Export and
     Delete for the saves chosen, and Cancel. Cancel, or an export or a
     delete, turns selection off. Import adds the saves of a file as an
     import of their own. */
  U.savesDialog = function (mode) {
    if (mode === "save" && !S.G) { return; }
    var G = S.G, b = el("div", "prose saves"), close = null, selecting = false, chosen = {};
    function redraw(focusId) {
      S.clear(listBox); drawList(); drawSelect();
      if (focusId) { var f = listBox.querySelector("[data-pick=\"" + focusId + "\"]"); if (f) { f.focus({ preventScroll: true }); } }
    }
    if (mode === "save") {
      var made = el("section", "save-section");
      made.appendChild(el("h3", "", S.t("New save")));
      var row = el("div", "save-new"), f = saveNameField("", S.t("Name (optional)"));
      row.appendChild(f.node);
      row.appendChild(S.button(S.t("Save"), { icon: "save", cls: "primary save-go", onClick: function () {
        var slot = S.saves.saveNew(G, f.input.value);
        if (!slot) { S.sound.play("error"); U.toast(S.t("This browser does not allow saving."), "bad"); return; }
        S.sound.play("save");
        U.toast(S.t("Saved as {id}.", { id: S.saves.label(slot) }), "good");
        f.input.value = "";
        redraw();
      } }));
      made.appendChild(row);
      b.appendChild(made);
      setTimeout(function () { if (f.input.isConnected && window.matchMedia && window.matchMedia("(pointer: fine)").matches) { f.input.focus({ preventScroll: true }); } }, 0);
    }
    /* The list needs no visible heading: the dialog's title says what it
       holds. Screen readers still find the section by its heading. */
    var sec = el("section", "save-section"), secHead = el("h3", "sr-only", S.t("Saves"));
    secHead.id = "saves-head-" + Date.now();
    sec.setAttribute("aria-labelledby", secHead.id);
    sec.appendChild(secHead);
    var tools = el("div", "save-tools"), sl = el("label", "save-sort"), sort = el("select");
    sl.appendChild(el("span", "", S.t("Sort by")));
    S.saves.SORTS.forEach(function (k) { var o = el("option", "", S.t(SORT_NAMES[k])); o.value = k; o.selected = k === S.settings.saveSort; sort.appendChild(o); });
    sort.addEventListener("change", function () { S.settings.saveSort = sort.value; S.saveSettings(); redraw(); });
    sl.appendChild(sort);
    /* Splitting the list into groups belongs to its order, beside Sort by */
    var gl = el("label", "save-sort"), group = el("select");
    gl.appendChild(el("span", "", S.t("Group by")));
    Object.keys(GROUP_NAMES).forEach(function (k) { var o = el("option", "", S.t(GROUP_NAMES[k])); o.value = k; o.selected = k === S.settings.saveGroup; group.appendChild(o); });
    group.addEventListener("change", function () { S.settings.saveGroup = group.value; S.saveSettings(); redraw(); });
    gl.appendChild(group);
    var order = el("div", "save-order");
    order.appendChild(sl); order.appendChild(gl);
    tools.appendChild(order);
    /* Import and Select are actions of the dialog, at the left of its foot
       (the buttons of U.dialog below); the file field stays in the body */
    var file = el("input"), selBtn = null, impBtn = null;
    file.type = "file"; file.accept = "application/json,.json"; file.hidden = true;
    file.addEventListener("change", function () { var f = file.files[0]; file.value = ""; if (f) { U.importGame(f, function () { redraw(); }); } });
    tools.appendChild(file);
    sec.appendChild(tools);
    /* The bar of selection: a check box for all (named for screen readers;
       its place says what it does), the count, then the actions on the
       saves chosen and Cancel. It stays at the top while the list scrolls. */
    var selBar = el("div", "select-bar"), allBox = el("input"), allLbl = el("label", "check select-all"), count = el("span", "select-count");
    allBox.type = "checkbox";
    allLbl.title = S.t("All");
    allLbl.appendChild(allBox); allLbl.appendChild(el("span", "sr-only", S.t("All")));
    allBox.addEventListener("change", function () {
      chosen = {};
      if (allBox.checked) { S.saves.list().forEach(function (x) { chosen[x.slot.id] = true; }); }
      S.sound.play("select"); redraw();
    });
    count.setAttribute("aria-live", "polite");
    selBar.appendChild(allLbl); selBar.appendChild(count);
    sec.appendChild(selBar);
    var listBox = el("div");
    sec.appendChild(listBox);
    var expBtn = S.button(S.t("Export"), { icon: "export", onClick: function () {
      var ids = picked();
      if (!ids.length) { return; }
      U.downloadExport(S.saves.exportGames(ids), "ecb-simulator-saves.json");
      U.toast(ids.length === 1 ? S.t("1 save exported.") : S.t("{n} saves exported.", { n: ids.length }), "good");
      selecting = false; chosen = {}; redraw();
    } });
    var delBtn = S.button(S.t("Delete"), { icon: "delete", cls: "danger", onClick: function () {
      var ids = picked();
      if (!ids.length) { return; }
      var body = el("div", "prose"), labels = ids.map(function (id) { return S.saves.label(S.saves.get(id)); });
      body.appendChild(el("p", "", S.t("This deletes {list}. It cannot be undone.", { list: labels.length > 12 ? labels.slice(0, 12).join(", ") + " " + S.t("and {n} more", { n: labels.length - 12 }) : labels.join(", ") })));
      if (G && G.slot && ids.indexOf(G.slot) >= 0) { body.appendChild(el("p", "dim small", S.t("This game recreates its autosave at its next autosave point."))); }
      U.dialog({ title: ids.length === 1 ? S.t("Delete 1 save?") : S.t("Delete {n} saves?", { n: ids.length }), icon: "delete", body: body,
        buttons: [{ label: S.t("Cancel") }, { label: S.t("Delete"), primary: true, onClick: function () {
          S.saves.removeMany(ids);
          S.sound.play("delete");
          selecting = false; chosen = {}; redraw();
          if (U.title && !S.G) { U.render(); }
          return "quiet";
        } }] });
    } });
    selBar.appendChild(expBtn); selBar.appendChild(delBtn);
    selBar.appendChild(S.button(S.t("Cancel"), { cls: "flat", onClick: function () { selecting = false; chosen = {}; redraw(); } }));
    b.appendChild(sec);
    function picked() { return S.saves.list().map(function (x) { return x.slot.id; }).filter(function (id) { return chosen[id]; }); }
    function drawSelect() {
      var all = S.saves.list(), n = picked().length;
      selBar.hidden = !selecting;
      /* Sort/group only when two or more saves; hide the whole tools bar otherwise (and while selecting) */
      tools.hidden = selecting || all.length < 2;
      /* While choosing, Import and Select give way to the bar */
      if (impBtn) { impBtn.hidden = selBtn.hidden = selecting; }
      count.textContent = n === 1 ? S.t("1 selected") : S.t("{n} selected", { n: n });
      allBox.checked = !!all.length && n === all.length;
      allBox.indeterminate = n > 0 && n < all.length;
      expBtn.disabled = delBtn.disabled = !n;
      if (selBtn) { selBtn.disabled = !all.length; }
    }
    function slotRow(x) {
      var slot = x.slot, save = x.save, id = S.saves.label(slot), mine = !!(G && G.id && save.game.id === G.id);
      /* The tag tells the games apart, so it shows only beside saves of other games */
      var r = el("div", "slot" + (mine && mixed ? " mine" : "") + (selecting ? " picking" : "") + (selecting && chosen[slot.id] ? " picked" : "")), info = el("div", "slot-info"), name = el("div", "slot-name");
      /* While selecting, a check box leads the row, and a click anywhere on it chooses the save */
      if (selecting) {
        var cb = el("input"); cb.type = "checkbox"; cb.checked = !!chosen[slot.id]; cb.dataset.pick = slot.id;
        cb.setAttribute("aria-label", S.t("Select {id}", { id: id }));
        cb.addEventListener("change", function () { if (cb.checked) { chosen[slot.id] = true; } else { delete chosen[slot.id]; } redraw(slot.id); });
        r.appendChild(cb);
        r.addEventListener("click", function (e) { if (e.target !== cb) { cb.click(); } });
      }
      name.appendChild(el("span", "", S.saves.title(slot)));
      name.appendChild(el("span", "slot-id", id));
      if (mine && mixed && S.settings.saveGroup !== "game") { name.appendChild(el("span", "badge", S.t("This game"))); }
      /* The marks a run has: debug use, with each action, and the
         sandbox of a run from a file, with what it holds back. A mark
         opens its details, except while selecting. */
      function mark(text, cls, title, detail) {
        if (selecting) { name.appendChild(el("span", "badge " + cls, text)); return; }
        var m = el("button", "badge " + cls, text); m.type = "button";
        m.addEventListener("click", function (e) { e.stopPropagation(); S.popover(m, title, null, detail()); });
        name.appendChild(m);
      }
      if (S.tainted(save.game)) {
        mark(S.t("Debug used"), "mark-debug", S.t("Debug used in this run"), function () {
          var box = el("div"), ul = el("ul", "mark-list");
          ul.tabIndex = 0; ul.setAttribute("aria-label", S.t("Changes by debug"));
          box.appendChild(el("p", "small", S.t("The debug tools changed this run, so it earns no achievement other than Market manipulator. Each change, by year in the game:")));
          save.game.taint.slice(-50).forEach(function (t) { ul.appendChild(el("li", "small", S.t("{y}: {a}, on {d}", { y: t.y, a: t.a, d: S.fmtDate(t.at, true) }))); });
          if (save.game.taint.length > 50) { box.appendChild(el("p", "dim small", S.t("The last 50 of {n} changes.", { n: save.game.taint.length }))); }
          box.appendChild(ul);
          return box;
        });
      }
      if (save.game.sandbox) {
        mark(S.t("From a file"), "mark-file", S.t("A run from a file"), function () {
          var box = el("div"), sb = save.game.sandbox;
          box.appendChild(el("p", "small", S.t("Imported on {d}, in {y}. It earns only what is reached after the import, and counts its years from {y}.", { d: S.fmtDate(sb.at, true), y: sb.year })));
          var names = sb.met.map(function (id) { var a = S.ACHIEVEMENTS.filter(function (x) { return x.id === id; })[0]; return a ? S.t(a.name) : id; });
          box.appendChild(el("p", "small", names.length ? S.t("Out of reach, met before the import: {l}.", { l: names.join(", ") }) : S.t("No achievement was met before the import.")));
          return box;
        });
      }
      info.appendChild(name);
      /* The period and the date each keep to one line */
      var when = el("div", "dim small", S.t("{p}, {y}", { p: save.president, y: save.year }) + ", ");
      when.appendChild(el("span", "nowrap", save.mode === "post" ? S.t("post-federative") : S.t("pre-federative")));
      when.appendChild(document.createTextNode(", "));
      when.appendChild(el("span", "nowrap", S.t("saved {d}", { d: U.saveDate(save.at) })));
      info.appendChild(when);
      r.appendChild(info);
      var acts = el("div", "slot-acts");
      if (mode === "save" && slot.kind === "manual") {
        acts.appendChild(S.button(S.t("Overwrite"), { icon: "save", onClick: function () {
          U.dialog({ title: S.t("Overwrite save {id}?", { id: id }), icon: "warning",
            body: el("p", "", S.t("This replaces {n}: {s}. The save then contains this game as it is now.", { n: S.saves.title(slot), s: U.saveSummary(save) })),
            buttons: [{ label: S.t("Cancel") }, { label: S.t("Overwrite"), primary: true, onClick: function () {
              if (!S.saves.overwrite(slot.id, G)) { S.sound.play("error"); U.toast(S.t("This browser does not allow saving."), "bad"); return; }
              S.sound.play("save");
              U.toast(S.t("Saved as {id}.", { id: S.saves.label(S.saves.get(slot.id)) }), "good");
              /* The list stays open, showing the save as it is now */
              redraw();
              return "quiet";
            } }] });
        } }));
      } else if (mode !== "save") {
        acts.appendChild(S.button(S.t("Load"), { icon: "open", onClick: function () { U.openSave(save, slot, close); } }));
      }
      var rn = S.button("", { icon: "proposals", cls: "flat", title: S.t("Rename {id}", { id: id }), onClick: function () { U.renameSave(slot, redraw); } });
      rn.setAttribute("aria-label", S.t("Rename {id}", { id: id }));
      /* Export writes this save alone to a file, without selecting it first */
      var exp = S.button("", { icon: "export", cls: "flat", title: S.t("Export {id}", { id: id }), onClick: function () {
        U.downloadExport(S.saves.exportGames([slot.id]), "ecb-simulator-save-" + id + ".json");
        U.toast(S.t("1 save exported."), "good");
      } });
      exp.setAttribute("aria-label", S.t("Export {id}", { id: id }));
      /* Rename, Export and Delete sit apart from the main action, so a phone can
         keep them beside the name */
      var tools = el("div", "slot-tools");
      tools.appendChild(rn);
      tools.appendChild(exp);
      var del = S.button("", { icon: "delete", cls: "flat", title: S.t("Delete {id}", { id: id }), onClick: function () {
        var body = el("div", "prose");
        body.appendChild(el("p", "", S.t("This deletes {n}: {s}. It cannot be undone.", { n: S.saves.title(slot), s: U.saveSummary(save) })));
        if (mine && slot.kind === "automatic") { body.appendChild(el("p", "dim small", S.t("This game recreates autosave {id} at its next autosave point.", { id: id }))); }
        U.dialog({ title: S.t("Delete save {id}?", { id: id }), icon: "delete", body: body,
          buttons: [{ label: S.t("Cancel") }, { label: S.t("Delete"), primary: true, onClick: function () {
            S.saves.remove(slot.id);
            S.sound.play("delete");
            redraw();
            if (U.title && !S.G) { U.render(); }
            return "quiet";
          } }] });
      } });
      del.setAttribute("aria-label", S.t("Delete {id}", { id: id }));
      tools.appendChild(del);
      if (selecting) { return r; }
      if (acts.firstChild) { r.appendChild(acts); }
      r.appendChild(tools);
      return r;
    }
    var mixed = false;
    function drawList() {
      var all = S.saves.list(S.settings.saveSort);
      mixed = all.some(function (x) { return !G || x.save.game.id !== G.id; });
      /* Sorting and grouping need two saves; Import is there from none */
      sl.hidden = gl.hidden = all.length < 2;
      if (!all.length) { listBox.appendChild(S.placeholder("save", S.t("No saves yet."))); return; }
      var by = S.settings.saveGroup || "none";
      if (by === "none") {
        var list = el("div", "slots");
        all.forEach(function (x) { list.appendChild(slotRow(x)); });
        listBox.appendChild(list);
        return;
      }
      var groups = [], byKey = {};
      all.forEach(function (x) {
        var g = saveGroup(by, x);
        if (!byKey[g[0]]) { byKey[g[0]] = { key: g[0], title: g[1], items: [], mine: false }; groups.push(byKey[g[0]]); }
        byKey[g[0]].items.push(x);
        if (G && G.id && x.save.game.id === G.id) { byKey[g[0]].mine = true; }
      });
      /* Kinds and periods keep a fixed order; games follow the sort, the game in progress first */
      if (by !== "game") { groups.sort(function (a, b) { return a.key < b.key ? -1 : 1; }); }
      else { groups.sort(function (a, b) { return (b.mine ? 1 : 0) - (a.mine ? 1 : 0); }); }
      groups.forEach(function (g) {
        var box = el("section", "save-group"), list = el("div", "slots");
        var gh = el("h4", "", S.t("{g} ({n})", { g: g.title, n: g.items.length }) + (by === "game" && g.mine && mixed ? ", " + S.t("this game") : ""));
        /* While selecting, the group's check box chooses all its saves */
        if (selecting) {
          var gcb = el("input"), on = g.items.filter(function (x) { return chosen[x.slot.id]; }).length;
          gcb.type = "checkbox"; gcb.checked = on === g.items.length; gcb.indeterminate = on > 0 && on < g.items.length; gcb.dataset.pick = "group-" + g.key;
          gcb.setAttribute("aria-label", S.t("Select {g}", { g: g.title }));
          gcb.addEventListener("change", function () {
            g.items.forEach(function (x) { if (gcb.checked) { chosen[x.slot.id] = true; } else { delete chosen[x.slot.id]; } });
            S.sound.play("select"); redraw("group-" + g.key);
          });
          var ghl = el("label", "check group-pick"); ghl.appendChild(gcb); ghl.appendChild(gh.firstChild); gh.appendChild(ghl);
        }
        box.appendChild(gh);
        g.items.forEach(function (x) { list.appendChild(slotRow(x)); });
        box.appendChild(list);
        listBox.appendChild(box);
      });
    }
    drawList();
    drawSelect();
    b.appendChild(el("p", "dim small slots-note", (S.settings.autosave === false ? S.t("Autosave is off.") : S.t("Each game updates its autosave as you play.")) + " " +
      (S.saveLocal() ? S.t("Saves are kept on this computer.") : S.t("Saves are kept in this tab only. Settings > Storage can be used to enable keeping them on this computer."))));
    close = U.dialog({ title: mode === "save" ? S.t("Save the game") : S.t("Load a game"), icon: mode === "save" ? "save" : "open", body: b, buttons: [
      { label: S.t("Import"), icon: "import", onClick: function () { file.click(); return true; } },
      { label: S.t("Select"), icon: "tasks", cls: "foot-split", onClick: function () { selecting = true; chosen = {}; redraw(); return true; } },
      { label: S.t("Close") }
    ] });
    var footBtns = close.el.querySelectorAll(".dfoot .btn");
    impBtn = footBtns[0]; selBtn = footBtns[1];
    drawSelect();
  };

  /* ---------- Year report ---------- */
  U.reportDialog = function (report, after) {
    var G = S.G, b = el("div", "prose"), ea = G.series.EA || {}, y = report.year;
    /* The dialog's title is the only heading: the year's events, then its figures */
    if (report.events.length) {
      var list = el("ul", "report-events");
      list.setAttribute("aria-label", S.t("Events"));
      report.events.forEach(function (e) {
        list.appendChild(el("li", e.k === "bad" ? "bad" : e.k === "good" ? "good" : "", e.t));
        if (e.k === "bad") { S.sound.play("bad"); }
      });
      b.appendChild(list);
    }
    /* The events come first, then the table of figures; the dialog's title
       names the year, so the table needs no heading of its own */
    var fold = el("section", "report-figures");
    fold.setAttribute("aria-label", S.t("The euro area in {y}", { y: y }));
    var rows = [], prev = y - 1;
    [["u", "hu", S.t("Unemployment, %")], ["p", "hp", S.t("Inflation, %")], ["s", "hs", S.t("Spread, points")], ["g", "hg", S.t("Growth, %")],
      ["trust", "ht", S.t("Trust in the bank, %")], ["fr", "hf", S.t("Far-right seats, %")]].forEach(function (k) {
      if (y >= 2041 && k[0] === "s") { return; }
      var tr = el("tr"), v = ea[k[0]] ? ea[k[0]][y] : null, pv = ea[k[0]] ? ea[k[0]][prev] : null, h = ea[k[1]] ? ea[k[1]][y] : null;
      tr.appendChild(el("td", "", k[2]));
      tr.appendChild(el("td", "num", v != null ? S.fmt(v) : ""));
      tr.appendChild(el("td", "num", v != null && pv != null ? (v - pv >= 0 ? "+" : "") + S.fmt(v - pv) : ""));
      tr.appendChild(el("td", "num", h != null ? S.fmt(h) : ""));
      rows.push(tr);
    });
    var w = el("div", "table-wrap"), t = el("table"), th = el("tr");
    [S.t("Indicator"), S.t("This run"), S.t("Change"), y <= 2025 ? S.t("Record") : S.t("Without your changes")].forEach(function (h, i) { th.appendChild(el("th", i ? "num" : "", h)); });
    var thead = el("thead"); thead.appendChild(th); t.appendChild(thead);
    var tb = el("tbody"); rows.forEach(function (r) { tb.appendChild(r); }); t.appendChild(tb);
    w.appendChild(t);
    fold.appendChild(w);
    b.appendChild(fold);
    /* A click beside the report leaves it open, so it is not dismissed by
       accident; Settings > Game can let such a click close it */
    U.dialog({ title: S.t("{y} in review", { y: y }), icon: "calendar", body: b, onClose: after, backdrop: !!S.settings.reportClickAway, buttons: [{ label: S.t("Continue to {y}", { y: G.year }), primary: true }] });
  };

  /* ---------- Succession ---------- */
  U.successionDialog = function () {
    var G = S.G, ps = G.pendingSuccession, b = el("div", "prose");
    b.appendChild(el("p", "", S.t("The term of {n} ends. A president serves one term of 8 years, which cannot be renewed (Art. 283(2) TFEU).", { n: G.president.name })));
    b.appendChild(el("p", ps.accepted ? "good" : "warnc", ps.accepted ? S.t("The European Council accepts your chosen successor.") :
      S.t("The European Council rejects your candidate and appoints a compromise candidate. You continue as this president, with weaker relations in the Council and lower trust.")));
    b.appendChild(el("p", "dim small", S.t("Name the next president. Your record stays.")));
    /* Left empty, the name follows the first president's, numbered: A II, A III */
    var next = S.auto.successorName(G), pf = U.presidentForm(G.year + 1, { country: G.president.country, placeholder: next });
    b.appendChild(pf.node);
    U.dialog({ title: S.t("A new president for {y}", { y: G.year }), icon: "advisor", body: b, required: true, buttons: [
      { label: S.t("Take office"), primary: true, onClick: function () { var v = pf.entered(); v.name = v.name || next; Gm.succeed(G, v); S.saves.write("auto", G); U.render(); } }
    ] });
  };

})();
