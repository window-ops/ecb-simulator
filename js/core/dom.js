/* DOM helpers: element creation, icons, number formatting, glossary links. */
(function () {
  var S = window.ECBSIM;
  S.el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text != null) { e.textContent = text; }
    return e;
  };
  /* Screen readers move by heading level, so levels must not skip. The
     views pick heading sizes for their looks; this gives each heading an
     aria-level one step at most below the heading before it, across the
     window, its dialogs and its popovers. It runs after every redraw and
     whenever a dialog or popover opens. */
  S.levelHeadings = function () {
    var prev = 0;
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(function (h) {
      if (!h.getClientRects().length) { return; }
      var tag = Number(h.tagName.charAt(1)), lvl = Math.min(tag, prev + 1);
      if (lvl !== tag) { h.setAttribute("aria-level", String(lvl)); } else { h.removeAttribute("aria-level"); }
      prev = lvl;
    });
  };
  /* An empty state: an icon and a line in the middle of the space */
  S.placeholder = function (icon, text) {
    var p = S.el("div", "placeholder");
    p.appendChild(S.icon(icon));
    p.appendChild(S.el("div", "", text));
    return p;
  };
  /* Takes a notice away after ms, unless the pointer rests on it or it
     has the focus; the time starts again when they leave it */
  S.dwell = function (node, ms, remove) {
    var timer = null, hover = false, focus = false;
    function start() { clearTimeout(timer); timer = setTimeout(function () { if (!hover && !focus) { remove(); } }, ms); }
    node.addEventListener("mouseenter", function () { hover = true; clearTimeout(timer); });
    node.addEventListener("mouseleave", function () { hover = false; start(); });
    node.addEventListener("focusin", function () { focus = true; clearTimeout(timer); });
    node.addEventListener("focusout", function () { focus = false; start(); });
    start();
  };
  S.clear = function (e) { while (e.firstChild) { e.removeChild(e.firstChild); } return e; };

  /* Rows of cards that fill (Settings > Appearance > Rows of cards, on by
     default). As many columns fit as the grid's least card width allows
     (--tile-min); the cards are then shared out evenly over the rows, and
     the last row's cards widen to its full width, so the grid ends in a
     rectangle. The grid takes as many columns as both row lengths divide.
     Settings > Appearance can also cap the cards in a row (cardsPerRow)
     while the rows are filled. */
  var TILED = ".grid2, .grid3, .chart-grid, .options";
  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  S.tile = function (g) {
    var fill = S.settings.evenGrids !== false, cap = fill ? S.settings.cardsPerRow || 0 : 0;
    var kids = [].filter.call(g.children, function (k) { return !k.hidden; });
    [].forEach.call(g.children, function (k) { k.style.gridColumn = ""; });
    g.style.gridTemplateColumns = "";
    if ((!fill && !cap) || !kids.length) { return; }
    var cs = getComputedStyle(g), gap = parseFloat(cs.columnGap) || 0, min = parseFloat(cs.getPropertyValue("--tile-min")) || 200;
    var w = g.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    if (w <= 0) { return; }
    var n = kids.length, cols = Math.min(n, Math.max(1, Math.floor((w + gap) / (min + gap))));
    if (cap) { cols = Math.min(cols, cap); }
    if (!fill) { g.style.gridTemplateColumns = "repeat(" + cols + ", minmax(0, 1fr))"; return; }
    var rows = Math.ceil(n / cols);
    cols = Math.ceil(n / rows);
    var last = n - (rows - 1) * cols, all = cols * last / gcd(cols, last);
    g.style.gridTemplateColumns = "repeat(" + all + ", minmax(0, 1fr))";
    kids.forEach(function (k, i) { k.style.gridColumn = "span " + (i >= (rows - 1) * cols ? all / last : all / cols); });
  };
  var sized = window.ResizeObserver ? new ResizeObserver(function (list) { list.forEach(function (x) { S.tile(x.target); }); }) : null;
  function watch(root) {
    if (!sized || !root.querySelectorAll) { return; }
    var found = [].slice.call(root.querySelectorAll(TILED));
    if (root.matches && root.matches(TILED)) { found.push(root); }
    found.forEach(function (g) { sized.observe(g); });
  }
  if (window.MutationObserver) {
    new MutationObserver(function (list) { list.forEach(function (m) { [].forEach.call(m.addedNodes, watch); }); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }
  S.on("settings", function () { document.querySelectorAll(TILED).forEach(S.tile); });
  S.icon = function (name, cls) {
    var d = S.ICONS[name];
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon" + (d && d[2] ? " raw" : "") + (cls ? " " + cls : ""));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", d ? d[0] : "0 0 22 22");
    /* An icon cut to its drawing (tools/build-icons.py) is narrower than
       it is tall; in a button it takes that width, so its label sits as
       close as beside any other icon */
    var vb = d ? d[0].split(" ").map(Number) : null;
    if (vb && vb[2] !== vb[3]) { svg.classList.add("trim"); svg.style.aspectRatio = vb[2] + " / " + vb[3]; }
    if (d) { svg.innerHTML = d[1]; }
    return svg;
  };
  /* The game's logo: a euro sign in a circle */
  S.logo = function (cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", cls || "logo");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M15.6 8.2a4.6 4.6 0 1 0 0 7.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M6.8 10.6h6.4M6.8 13.4h6.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
    return svg;
  };
  S.button = function (label, opts) {
    opts = opts || {};
    var b = S.el("button", "btn" + (label ? "" : " icon-only") + (opts.collapse ? " collapse" : "") + (opts.cls ? " " + opts.cls : ""));
    b.type = "button";
    if (opts.icon) { b.appendChild(S.icon(opts.icon)); }
    if (label) {
      var l = S.el("span", opts.icon && opts.collapse ? "lbl" : "", label);
      b.appendChild(l);
      if (opts.collapse) { b.setAttribute("aria-label", label); b.title = label; }
    }
    if (opts.title) { b.title = opts.title; }
    /* keyAction: the action of Settings > Keyboard (js/ui/keys.js) whose
       key the button shows, as the player has bound it; with press, that
       key presses the button. key alone shows a fixed key. The hint shows
       while the action's area is on, beside the label or in the tooltip,
       as Settings > Keyboard > Hints sets (S.kbdLevel); a toolbar button
       (hint: "title") shows it in its tooltip only. */
    var act = opts.keyAction && S.keyAction ? S.keyAction(opts.keyAction) : null;
    if (act && opts.press) { b.dataset.shortcut = S.keyFor(opts.keyAction); }
    var area = act ? act[1] : null, hint = act ? S.keyLabel(S.keyFor(opts.keyAction)) : opts.key, level = S.kbdLevel();
    var beside = level === "all" || (level === "main" && /(^|\s)primary(\s|$)/.test(opts.cls || ""));
    if (hint && level !== "off" && S.keyOn(area)) {
      if (opts.hint === "title" || !beside) { var base = b.title || label; b.title = base ? base + " (" + hint + ")" : hint; }
      else { var k = S.kbd(hint, area); if (k) { b.appendChild(k); } }
    }
    /* The click sound waits for the action: one that makes its own sound,
       such as opening a dialog or a view, plays that one alone (S.sound.play
       cancels the click). Disabled buttons must not react (sound or action). */
    if (opts.onClick) {
      b.addEventListener("click", function (e) {
        if (b.disabled) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        S.sound.click();
        opts.onClick(e);
      });
    }
    if (opts.disabled) { b.disabled = true; }
    return b;
  };
  /* Whether a keyboard is connected. No browser says so directly: a
     screen with a mouse or a trackpad is taken to have one, and a touch
     screen without either is taken to have none until a key is pressed
     outside a text field (where only the on-screen keyboard types). The
     page then carries the class no-keyboard, which hides every part that
     only a keyboard can use (keys-only: the Keyboard settings, the key
     hints, Help's Keyboard section); a key pressed later shows them at once. */
  var keySeen = false, touchOnly = null;
  try { touchOnly = window.matchMedia("(hover: none) and (pointer: coarse)"); } catch (e) {}
  S.hasKeyboard = function () { return keySeen || !(touchOnly && touchOnly.matches); };
  function markKeyboard() { document.documentElement.classList.toggle("no-keyboard", !S.hasKeyboard()); }
  markKeyboard();
  if (touchOnly && touchOnly.addEventListener) { touchOnly.addEventListener("change", markKeyboard); }
  document.addEventListener("keydown", function (e) {
    if (keySeen) { return; }
    var t = e.target, typing = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
    if (typing || e.key === "Unidentified" || e.key === "Process") { return; }
    keySeen = true; markKeyboard();
  }, true);
  /* Whether keyboard shortcuts work in an area of Settings > Keyboard
     (js/ui/keys.js); without an area, whether they work at all */
  S.keyOn = function (area) {
    var k = S.settings.keys || {};
    return k.on !== false && (!area || k[area] !== false);
  };
  /* How far Settings > Keyboard > Hints shows the keys: "all" beside every
     button that has one and with the options of the agenda, "main" beside
     the main button of each screen and with the options, the others in
     their tooltips, "tooltips" in the tooltips only, "off" nowhere. Older
     settings kept true or false. */
  S.KBD_LEVELS = [
    ["all", "Beside every button", "Every key beside its button, and the keys for the options of the agenda."],
    ["main", "Beside the main buttons", "The key of each screen's main button beside it, and the keys for the options; every other key in its button's tooltip."],
    ["tooltips", "In tooltips only", "Every key in its button's tooltip, shown when the pointer rests on the button."],
    ["off", "Off", "No key hints. The keys still work."]
  ];
  S.kbdLevel = function () {
    var v = S.settings.kbdHints;
    if (v === false) { return "off"; }
    return S.KBD_LEVELS.some(function (l) { return l[0] === v; }) ? v : "all";
  };
  /* A key to press, shown beside a button or a hint while Settings >
     Keyboard > Hints shows keys beside buttons; touch screens without a
     mouse leave it out */
  S.kbd = function (key, area) {
    var level = S.kbdLevel();
    if (level === "off" || level === "tooltips" || !S.keyOn(area)) { return null; }
    var k = S.el("kbd", "kbd keys-only", key);
    k.setAttribute("aria-hidden", "true");
    return k;
  };
  /* Dates in the formats used in Europe, chosen in Settings > Motion and text > Text; the
     time, where shown, has 24 hours. Each: [id, pattern, where it is used] */
  S.DATE_FORMATS = [
    ["dd-mm-yyyy", "DD-MM-YYYY", "International, understood across the EU; Netherlands"],
    ["dd.mm.yyyy", "DD.MM.YYYY", "Germany, Austria, Poland, Romania, Bulgaria, Estonia, Latvia, Denmark"],
    ["dd/mm/yyyy", "DD/MM/YYYY", "France, Italy, Spain, Portugal, Belgium, Greece, Ireland, Luxembourg, Malta, Cyprus"],
    ["d. m. yyyy", "D. M. YYYY", "Czechia, Slovakia, Slovenia"],
    ["d. m. yyyy.", "D. M. YYYY.", "Croatia"],
    ["d.m.yyyy", "D.M.YYYY", "Finland"],
    ["yyyy-mm-dd", "YYYY-MM-DD", "ISO 8601; Sweden, Lithuania"],
    ["yyyy. mm. dd.", "YYYY. MM. DD.", "Hungary"]
  ];
  /* A date (a Date, an ISO time, or a day as YYYY-MM-DD) in the chosen format, with the time when asked */
  S.fmtDate = function (when, withTime) {
    var d = when instanceof Date ? when : /^\d{4}-\d{2}-\d{2}$/.test(String(when)) ? new Date(String(when) + "T00:00") : new Date(when);
    if (isNaN(d.getTime())) { return ""; }
    function two(n) { return (n < 10 ? "0" : "") + n; }
    var D = d.getDate(), M = d.getMonth() + 1, Y = d.getFullYear(), out;
    switch (S.settings && S.settings.dateFormat) {
      case "dd.mm.yyyy": out = two(D) + "." + two(M) + "." + Y; break;
      case "dd/mm/yyyy": out = two(D) + "/" + two(M) + "/" + Y; break;
      case "d. m. yyyy": out = D + ". " + M + ". " + Y; break;
      case "d. m. yyyy.": out = D + ". " + M + ". " + Y + "."; break;
      case "d.m.yyyy": out = D + "." + M + "." + Y; break;
      case "yyyy-mm-dd": out = Y + "-" + two(M) + "-" + two(D); break;
      case "yyyy. mm. dd.": out = Y + ". " + two(M) + ". " + two(D) + "."; break;
      default: out = two(D) + "-" + two(M) + "-" + Y;
    }
    return withTime ? out + " " + two(d.getHours()) + ":" + two(d.getMinutes()) : out;
  };
  S.fmt = function (v, d) {
    if (v == null || !isFinite(v)) { return "n/a"; }
    return (Math.round(v * Math.pow(10, d == null ? 1 : d)) / Math.pow(10, d == null ? 1 : d)).toFixed(d == null ? 1 : d);
  };
  S.initials = function (name) { return name.split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase(); };

  /* Glossary links and footnote numbers.

     S.linkify(text, container, opts) writes text into container. The first
     mention of each glossary term becomes a button that opens its
     definition. opts.skip leaves one term out (a definition does not link to
     itself). opts.notes, a notes box from S.notesBox, and opts.anchors, a
     list of note ids, put a footnote number after the first phrase of each
     note found in the text; the ids that found a place are returned. */
  var termIndex = null;
  function buildIndex() {
    termIndex = [];
    S.GLOSSARY.forEach(function (g, i) {
      [g[0]].concat(g[1]).forEach(function (form) { termIndex.push({ form: form, id: i }); });
    });
    termIndex.sort(function (a, b) { return b.form.length - a.form.length; });
  }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function splitAt(parts, i, start, end, mid) {
    var p = parts[i];
    parts.splice(i, 1, { t: p.t.slice(0, start) }, mid, { t: p.t.slice(end) });
  }
  S.linkify = function (text, container, opts) {
    opts = opts || {};
    if (!termIndex) { buildIndex(); }
    var parts = [{ t: String(text) }], used = {}, placed = [];
    /* Settings > Motion and text can turn the footnotes off: no number is
       placed, so the notes box under the card stays empty and hidden */
    var footnotes = !(S.settings && S.settings.footnotes === false);
    (opts.anchors || []).forEach(function (id) {
      var note = S.NOTES[id];
      if (!footnotes || !note || !opts.notes || opts.notes.placed(id)) { return; }
      var done = false;
      note.anchor.forEach(function (phrase) {
        if (done) { return; }
        var re = new RegExp(esc(phrase), "i");
        for (var i = 0; i < parts.length && !done; i++) {
          if (parts[i].t == null) { continue; }
          var m = re.exec(parts[i].t);
          if (!m) { continue; }
          var end = m.index + m[0].length;
          var p = parts[i];
          parts.splice(i, 1, { t: p.t.slice(0, end) }, { fn: id }, { t: p.t.slice(end) });
          done = true;
        }
      });
      if (done) { placed.push(id); opts.notes.markPlaced(id); }
    });
    /* Settings > Motion and text can turn the links to the glossary off;
       footnote numbers have a switch of their own */
    var links = !(S.settings && S.settings.termLinks === false);
    termIndex.forEach(function (ti) {
      if (!links || used[ti.id] || ti.id === opts.skip) { return; }
      var re = new RegExp("(^|[^\\w])(" + esc(ti.form) + ")(?=[^\\w]|$)", "i");
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.t == null || p.id != null) { continue; }
        var m = re.exec(p.t);
        if (!m) { continue; }
        var start = m.index + m[1].length, end = start + m[2].length;
        splitAt(parts, i, start, end, { t: p.t.slice(start, end), id: ti.id });
        used[ti.id] = true;
        break;
      }
    });
    /* A term keeps the punctuation that touches it, an opening bracket
       before or a comma or stop after, on its line */
    parts.forEach(function (p, i) {
      if (p.id == null) { return; }
      var before = parts[i - 1], after = parts[i + 1];
      if (before && before.t != null && before.id == null) {
        var lead = /["(]+$/.exec(before.t);
        if (lead) { p.lead = lead[0]; before.t = before.t.slice(0, -lead[0].length); }
      }
      if (after && after.t != null && after.id == null) {
        var trail = /^[,.;:!?)"]+/.exec(after.t);
        if (trail) { p.trail = trail[0]; after.t = after.t.slice(trail[0].length); }
      }
    });
    parts.forEach(function (p) {
      if (p.fn) { container.appendChild(opts.notes.ref(p.fn)); return; }
      if (p.id == null) { if (p.t) { container.appendChild(document.createTextNode(p.t)); } return; }
      var holder = container;
      if (p.lead || p.trail) {
        holder = S.el("span", "term-hold");
        container.appendChild(holder);
        if (p.lead) { holder.appendChild(document.createTextNode(p.lead)); }
      }
      var b = S.el("button", "term", p.t);
      b.type = "button";
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var def = S.el("div");
        S.linkify(S.GLOSSARY[p.id][2], def, { skip: p.id });
        /* A term inside a popover opens in the same popover, as in GNOME */
        var host = b.closest(".popover");
        if (host) { S.popoverPush(host, S.GLOSSARY[p.id][0], def); } else { S.popover(b, S.GLOSSARY[p.id][0], null, def); }
      });
      holder.appendChild(b);
      if (p.trail) { holder.appendChild(document.createTextNode(p.trail)); }
    });
    return placed;
  };

  /* A list of numbered footnotes. ref(id) returns the number to place in
     the text; the note joins the list the first time it is referred to.
     A note's text can point to another note with [[id]]. */
  var notesHidden = false;
  S.notesBox = function () {
    var box = S.el("section", "notes"), order = [], items = {}, placedIds = {};
    box.setAttribute("aria-label", S.t("Notes"));
    var h = S.el("h4");
    h.appendChild(S.icon("footnote", "s16"));
    h.appendChild(document.createTextNode(S.t("Notes")));
    box.appendChild(h);
    var ol = S.el("ol");
    /* The player can hide the notes; the choice holds for every card until
       a footnote number is pressed */
    var hideBtn = S.button("", { cls: "small", onClick: function () { setHidden(!notesHidden); S.sound.play(notesHidden ? "fold" : "unfold"); } });
    function setHidden(v) {
      notesHidden = v; ol.hidden = v;
      hideBtn.textContent = v ? S.t("Show") : S.t("Hide");
      hideBtn.setAttribute("aria-expanded", v ? "false" : "true");
    }
    hideBtn.classList.remove("icon-only");
    h.appendChild(hideBtn);
    setHidden(notesHidden);
    box.appendChild(ol);
    box.hidden = true;
    function add(id) {
      if (items[id]) { return order.indexOf(id) + 1; }
      order.push(id);
      var li = S.el("li");
      li.id = "note-" + id + "-" + Math.random().toString(36).slice(2, 7);
      items[id] = li;
      ol.appendChild(li);
      box.hidden = false;
      var n = S.NOTES[id];
      li.appendChild(S.el("b", "", n.title + ": "));
      String(n.text).split(/(\[\[[a-z0-9-]+(?:\|[^\]]+)?\]\])/).forEach(function (part) {
        var m = /^\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]$/.exec(part);
        if (m && S.NOTES[m[1]]) {
          var other = m[1], num = add(other);
          if (m[2]) {
            li.appendChild(document.createTextNode(m[2]));
            li.appendChild(api.ref(other));
          } else {
            var link = S.el("button", "term", S.t("note {n}", { n: num }));
            link.type = "button";
            link.addEventListener("click", function (e) { e.stopPropagation(); api.open(other); });
            li.appendChild(link);
          }
        } else if (part) {
          S.linkify(part, li);
        }
      });
      return order.indexOf(id) + 1;
    }
    var api = {
      el: box,
      ref: function (id) {
        var n = add(id), b = S.el("button", "fnref", String(n));
        b.type = "button";
        b.setAttribute("aria-label", S.t("Note {n}: {t}", { n: n, t: S.NOTES[id].title }));
        b.addEventListener("click", function (e) { e.stopPropagation(); api.open(id); });
        return b;
      },
      open: function (id) {
        add(id);
        if (notesHidden) { setHidden(false); }
        var li = items[id];
        li.scrollIntoView({ block: "nearest" });
        li.classList.add("flash");
        setTimeout(function () { li.classList.remove("flash"); }, 1600);
      },
      placed: function (id) { return !!placedIds[id]; },
      markPlaced: function (id) { placedIds[id] = true; },
      count: function () { return order.length; }
    };
    return api;
  };

  /* Popovers next to an element. A term inside a popover branches as
     GNOME's popover menus do: its definition slides in over the same
     popover, with a back button that slides back to the page before
     (S.popoverPush). A click outside every popover, or a scroll of the
     page, closes them; Escape closes the newest. A second press of the
     element that opened a popover closes it, with the close sound. A menu (class menu-pop,
     such as the phone's More and toolbar menus) sounds as it closes, as
     it sounds as it opens; quiet leaves the sound out, when a choice in
     the menu or the next popover makes its own. */
  var stack = [];
  function closeFrom(i, quiet) {
    var menu = false;
    while (stack.length > i) {
      var p = stack.pop();
      if (p.ro) { p.ro.disconnect(); p.ro = null; }
      if (p.el.classList.contains("menu-pop")) { menu = true; }
      if (p.el.parentNode) { p.el.parentNode.removeChild(p.el); }
    }
    if (menu && !quiet) { S.sound.play("close"); }
  }
  function inside(node) {
    for (var i = stack.length - 1; i >= 0; i--) { if (stack[i].el.contains(node)) { return i; } }
    return -1;
  }
  S.popover = function (anchor, title, text, extra) {
    var again = -1;
    stack.forEach(function (p, i) { if (p.anchor === anchor) { again = i; } });
    /* Pressing what opened a popover again closes it, with the close sound */
    if (again >= 0) { closeFrom(again, true); S.sound.play("close"); return null; }
    closeFrom(inside(anchor) + 1, true);
    var pop = S.el("div", "popover");
    S.sound.play("pop");
    pop.setAttribute("role", "dialog");
    /* The popover is named by its title, or by what opened it */
    var page = S.el("div", "pop-page");
    if (title) { var h = S.el("h4", "", title); h.id = "pop-" + Math.random().toString(36).slice(2, 8); page.appendChild(h); pop.setAttribute("aria-labelledby", h.id); }
    else { pop.setAttribute("aria-label", anchor.getAttribute("aria-label") || anchor.textContent.trim()); }
    if (text) { page.appendChild(S.el("div", "", text)); }
    if (extra) { page.appendChild(extra); }
    pop.appendChild(page);
    pop.style.zIndex = String(60 + stack.length);
    pop.style.left = "0px";
    pop.style.top = "0px";
    document.body.appendChild(pop);
    var entry = { el: pop, anchor: anchor, back: [] };
    stack.push(entry);
    if (window.ResizeObserver) {
      entry.ro = new ResizeObserver(function () { placePop(pop, anchor); });
      entry.ro.observe(pop);
    }
    S.levelHeadings();
    placePop(pop, anchor);
    return pop;
  };
  /* Place a popover beside its anchor; prefer below, flip above when needed */
  function placePop(pop, anchor) {
    if (!anchor || !anchor.isConnected || !pop.isConnected) { return; }
    var r = anchor.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    var x = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    var y = r.bottom + 6;
    if (y + h > window.innerHeight - 8) { y = Math.max(8, r.top - h - 6); }
    pop.style.left = x + "px"; pop.style.top = y + "px";
  }
  /* After a size change, re-anchor so the box still sits by its term */
  function keepIn(pop) {
    var e = entry(pop);
    if (e && e.anchor && e.anchor.isConnected) { placePop(pop, e.anchor); return; }
    var pr = pop.getBoundingClientRect();
    if (pr.bottom > window.innerHeight - 8) { pop.style.top = Math.max(8, window.innerHeight - pr.height - 8) + "px"; }
    if (pr.top < 8) { pop.style.top = "8px"; }
    if (pr.right > window.innerWidth - 8) { pop.style.left = Math.max(8, window.innerWidth - pr.width - 8) + "px"; }
  }
  function entry(pop) { return stack.filter(function (p) { return p.el === pop; })[0]; }
  function swap(pop, page, cls) {
    var old = pop.querySelector(".pop-page");
    page.classList.add(cls);
    pop.replaceChild(page, old);
    keepIn(pop);
    return old;
  }
  S.popoverPush = function (pop, title, node) {
    var e = entry(pop); if (!e) { return; }
    var cur = pop.querySelector(".pop-page"), prevTitle = (cur.querySelector("h4") || {}).textContent || "";
    /* A term whose page is already open further back, such as the first
       term again from inside its own definition, goes back to that page,
       as the back button would; it adds no page and no back arrow */
    var at = -1;
    /* Titles compare with their spaces made plain: the even line breaks
       (js/core/wrap.js) join a heading's last two words with a no-break
       space where the browser cannot balance headings itself */
    function plain(t) { return String(t).replace(/\s+/g, " ").trim(); }
    e.back.forEach(function (pg, i) { var ph = pg.querySelector("h4"); if (ph && plain(ph.textContent) === plain(title)) { at = i; } });
    if (at >= 0) {
      var to = e.back[at];
      e.back.length = at;
      to.classList.remove("slide-in", "slide-back");
      swap(pop, to, "slide-back");
      var th = to.querySelector("h4"); if (th && th.id) { pop.setAttribute("aria-labelledby", th.id); }
      S.levelHeadings();
      S.sound.play("pop");
      var tb = to.querySelector(".pop-back"); if (tb) { tb.focus({ preventScroll: true }); }
      return;
    }
    var page = S.el("div", "pop-page");
    /* The header holds the back button and the title, as in GNOME */
    /* Going back is a step through the notes, as a term is: it sounds as
       a term does, without the button click */
    var back = S.button("", { icon: "back", cls: "flat pop-back" });
    back.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var prev = e.back.pop();
      if (!prev) { return; }
      prev.classList.remove("slide-in", "slide-back");
      swap(pop, prev, "slide-back");
      var ph = prev.querySelector("h4"); if (ph && ph.id) { pop.setAttribute("aria-labelledby", ph.id); }
      S.sound.play("pop");
    });
    back.setAttribute("aria-label", S.t("Back to {t}", { t: prevTitle }));
    back.title = S.t("Back to {t}", { t: prevTitle });
    var head = S.el("div", "pop-head"), h = S.el("h4", "", title);
    h.id = "pop-" + Math.random().toString(36).slice(2, 8);
    pop.removeAttribute("aria-label"); pop.setAttribute("aria-labelledby", h.id);
    head.appendChild(back);
    head.appendChild(h);
    page.appendChild(head);
    page.appendChild(node);
    cur.classList.remove("slide-in", "slide-back");
    e.back.push(swap(pop, page, "slide-in"));
    S.levelHeadings();
    S.sound.play("pop");
    back.focus({ preventScroll: true });
  };
  S.closePopover = function (quiet) { closeFrom(0, quiet); };
  document.addEventListener("click", function (e) {
    if (!stack.length || stack.some(function (p) { return p.anchor.contains(e.target); })) { return; }
    closeFrom(inside(e.target) + 1);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && stack.length) { closeFrom(stack.length - 1); } });
  window.addEventListener("scroll", function (e) { if (stack.length && inside(e.target) < 0) { closeFrom(0); } }, true);
  /* After the window changes size the page goes on settling: S.tile
     spans the rows of cards again in a ResizeObserver, and the toolbar is
     fitted again 100 ms later. Either can move what opened a popover, so
     every open popover is placed again on the next two frames and once
     the toolbar has been fitted */
  function placeAll() { stack.forEach(function (p) { if (p.anchor && p.anchor.isConnected) { placePop(p.el, p.anchor); } }); }
  var placeTimer = 0;
  window.addEventListener("resize", function () {
    placeAll();
    requestAnimationFrame(function () { placeAll(); requestAnimationFrame(placeAll); });
    clearTimeout(placeTimer); placeTimer = setTimeout(placeAll, 150);
  });
})();
