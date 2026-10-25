/* Keyboard shortcuts. Settings > Keyboard turns them on or off as a whole
   and area by area; S.keyOn(area) (js/core/dom.js) says whether an area's
   keys work, and every handler asks it: the agenda and the end of the year
   (js/ui/shell.js, js/ui/views/agenda.js), dialogs (js/ui/shell.js), the
   film and the time-lapse (js/ui/cinema.js, js/ui/finale.js) and debug
   (js/dev/debug.js). This file holds the list of areas, which Settings
   shows as switches and as a table of every key, and the keys of the other
   areas: switching views, the toolbar, the end screens and the title
   screens. Those press a button that carries its action's key
   (data-shortcut, set by S.button), so a key does exactly what a click
   does, and only while the button is there. Every key can be changed in
   Settings > Keyboard > Key bindings (S.keyBind). No shortcut takes Ctrl, Alt or the system key, and
   none acts while the player types in a field. Tab, and Enter or Space on
   a focused button, always work. */
(function () {
  var S = window.ECBSIM, U = S.ui;

  /* The areas, as Settings > Keyboard shows them: [key in settings, name,
     what the switch says]. Each area works in one context (game, dialogs,
     film, end, title): two actions there cannot share a key. The toolbar's
     keys also work on the title screen, where the title menu's own keys
     come first. */
  S.KEY_AREAS = [
    ["agenda", "Agenda", "Choose, decide and move between items", "game"],
    ["year", "End of the year", "End the year from anywhere in the game", "game"],
    ["views", "Views", "Move through the views of the sidebar", "game"],
    ["window", "Toolbar", "Help, settings, game settings, saves and sound", "game"],
    ["dialogs", "Dialogs", "Close a dialog or press its main button", "dialogs"],
    ["film", "Ending film and time-lapse", "Read, move on, skip and speed up", "film"],
    ["end", "End screens", "The actions of the crash, Federation and finale screens", "end"],
    ["title", "Title and new game", "The title menu and the form for a new game", "title"],
    ["debug", "Debug", "The debug keys, while the debug tools are on", "game"]
  ];
  /* Every action a key can do: [id, area, default key, what it does].
     Settings > Keyboard > Key bindings changes any of them; the player's
     keys are kept in settings.keyBind, by id, and only where they differ.
     A key is e.key, with letters in lower case. */
  S.KEY_ACTIONS = [
    ["agenda.decide", "agenda", "Enter", "Decide, then go to the next item"],
    ["agenda.next", "agenda", "n", "Next item still to decide"],
    ["agenda.prev", "agenda", "ArrowLeft", "Previous item"],
    ["agenda.after", "agenda", "ArrowRight", "Next item"],
    ["year.end", "year", "e", "End the year"],
    ["views.prev", "views", "[", "Previous view"],
    ["views.next", "views", "]", "Next view"],
    ["window.help", "window", "?", "Help"],
    ["window.settings", "window", ",", "Settings"],
    ["window.game", "window", "g", "Game settings"],
    ["window.save", "window", "s", "Save"],
    ["window.load", "window", "l", "Load"],
    ["window.sound", "window", "m", "Sound on or off"],
    ["dialogs.close", "dialogs", "Escape", "Close the dialog"],
    ["dialogs.main", "dialogs", "Enter", "Press the main button"],
    ["film.read", "film", "r", "Read: hold the screen"],
    ["film.next", "film", "ArrowRight", "Next screen of the film (Space too)"],
    ["film.speed", "film", "f", "Speed of the time-lapse"],
    ["film.skip", "film", "Escape", "Skip to the title or the coda"],
    ["film.summary", "film", "Enter", "Skip, then show the summary"],
    ["end.continue", "end", "c", "Continue into the Federation"],
    ["end.timelapse", "end", "t", "Watch the time-lapse"],
    ["end.again", "end", "w", "Watch the ending again"],
    ["end.review", "end", "v", "Review the run"],
    ["end.new", "end", "n", "New game"],
    ["end.load", "end", "l", "Load a save"],
    ["title.continue", "title", "c", "Continue the latest game"],
    ["title.load", "title", "l", "Load a game"],
    ["title.new", "title", "n", "Start a new game"],
    ["title.achievements", "title", "a", "Achievements"],
    ["title.back", "title", "b", "Back to the title screen"],
    ["title.start", "title", "Enter", "Start, on the form for a new game"],
    ["debug.decide", "debug", "d", "Decide every item"],
    ["debug.year", "debug", "y", "End the year"],
    ["debug.play", "debug", "p", "Play to the target year"]
  ];
  /* Keys no action can take: Tab moves the focus, and 1 to 9 choose an
     option on the agenda, so the game's context keeps them */
  S.KEY_FIXED = [["1 to 9", "agenda", "Choose an option"], ["Tab", null, "Move the focus, everywhere"]];
  var ACT = {};
  S.KEY_ACTIONS.forEach(function (a) { ACT[a[0]] = a; });
  var CTX = {};
  S.KEY_AREAS.forEach(function (a) { CTX[a[0]] = a[3]; });
  S.keyAction = function (id) { return ACT[id]; };
  /* A key as stored and compared: letters in lower case */
  S.keyNorm = function (k) { return k && k.length === 1 ? k.toLowerCase() : k; };
  S.keyFor = function (id) {
    var b = S.settings.keyBind || {};
    return b[id] != null ? b[id] : ACT[id] ? ACT[id][2] : null;
  };
  /* Whether the key pressed is the one bound to the action. Space stands
     in for the film's Next, unless the player has given Space to another
     action of the film. */
  S.keyIs = function (e, id) {
    var k = S.keyNorm(e.key);
    if (k === S.keyFor(id)) { return true; }
    return id === "film.next" && k === " " && !S.KEY_ACTIONS.some(function (a) { return a[1] === "film" && S.keyFor(a[0]) === " "; });
  };
  /* The key as the player reads it */
  S.keyLabel = function (k) {
    var N = { Escape: "Esc", Enter: S.t("Enter"), " ": S.t("Space"), ArrowLeft: "←", ArrowRight: "→", ArrowUp: "↑", ArrowDown: "↓", Backspace: S.t("Backspace"), Delete: S.t("Delete"), Home: S.t("Home"), End: S.t("End"), PageUp: S.t("Page Up"), PageDown: S.t("Page Down"), Insert: S.t("Insert") };
    return N[k] || (k && k.length === 1 ? k.toUpperCase() : k || "");
  };
  /* Binds key k to an action. A key no action can take is refused (the
     reason comes back); a key another action of the same context holds
     goes to this action, and that one takes this action's old key, so
     every action keeps a key. Returns { ok, swapped, why }. */
  S.keyBind = function (id, k) {
    k = S.keyNorm(k);
    var a = ACT[id]; if (!a || !k) { return { ok: false }; }
    if (k === "Tab" || /^(Shift|Control|Alt|Meta|AltGraph|CapsLock|NumLock|ScrollLock|Fn|OS|ContextMenu|Dead|Unidentified|Process)$/.test(k)) { return { ok: false, why: S.t("This key cannot be used.") }; }
    if (CTX[a[1]] === "game" && /^[1-9]$/.test(k)) { return { ok: false, why: S.t("1 to 9 choose the options on the agenda.") }; }
    var old = S.keyFor(id), swapped = null;
    S.settings.keyBind = S.settings.keyBind || {};
    S.KEY_ACTIONS.forEach(function (b) {
      if (b[0] !== id && CTX[b[1]] === CTX[a[1]] && S.keyFor(b[0]) === k) { swapped = b; setKey(b[0], old); }
    });
    setKey(id, k);
    return { ok: true, swapped: swapped };
  };
  /* Stores only what differs from the default, so a key set back to its default is forgotten */
  function setKey(id, k) {
    var bind = S.settings.keyBind;
    if (k === ACT[id][2]) { delete bind[id]; } else { bind[id] = k; }
  }
  S.keyReset = function (id) {
    var bind = S.settings.keyBind || {};
    if (!id) { S.settings.keyBind = {}; return; }
    /* Another action holding this default gives it back and takes its own default */
    var k = ACT[id][2];
    S.KEY_ACTIONS.forEach(function (b) { if (b[0] !== id && CTX[b[1]] === CTX[ACT[id][1]] && S.keyFor(b[0]) === k) { delete bind[b[0]]; } });
    delete bind[id];
  };

  /* Typing in a field keeps every letter */
  function typing(t) {
    if (!t || !t.tagName) { return false; }
    return /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable;
  }
  /* Presses the button in scope that carries the key, if it shows and is enabled */
  function press(scope, k) {
    if (!scope) { return false; }
    var b = Array.prototype.filter.call(scope.querySelectorAll("[data-shortcut]"), function (x) {
      return x.dataset.shortcut === k && !x.disabled && !x.closest("[hidden], [inert]");
    })[0];
    if (!b) { return false; }
    b.click();
    return true;
  }
  /* The view before or after the current one, in the sidebar's order */
  function step(d) {
    var list = U.VIEWS.map(function (v) { return v[0]; }), i = list.indexOf(U.view);
    U.go(list[(i + d + list.length) % list.length]);
  }

  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat || !S.keyOn()) { return; }
    /* The film and the time-lapse keep their keys (js/ui/cinema.js), and the tour its own */
    if (document.querySelector(".cine, .coach")) { return; }
    var k = S.keyNorm(e.key), G = S.G;
    /* An open dialog takes Escape and Enter only (js/ui/shell.js) */
    if (U.dialogOpen()) { return; }
    /* An end screen: its own actions */
    var end = document.querySelector(".crash");
    if (end) {
      if (S.keyOn("end") && !typing(e.target) && press(end, k)) { e.preventDefault(); }
      return;
    }
    if (U.busy()) { return; }
    /* Before a game: the title screens and the form for a new game */
    if (!G && S.keyOn("title")) {
      var page = document.getElementById("page");
      var form = page && page.querySelector(".start");
      if (form && S.keyIs(e, "title.start") && (!typing(e.target) || e.target.type === "text") && !(e.target.closest && e.target.closest("button, a, summary"))) {
        var go = form.querySelector(".start-foot .btn.primary");
        if (go && !go.disabled) { e.preventDefault(); go.click(); }
        return;
      }
      if (!form && !typing(e.target) && press(page, k)) { e.preventDefault(); return; }
    }
    if (typing(e.target)) { return; }
    /* Views, in a game */
    if (G && S.keyOn("views") && (S.keyIs(e, "views.prev") || S.keyIs(e, "views.next"))) { e.preventDefault(); step(S.keyIs(e, "views.next") ? 1 : -1); return; }
    /* The toolbar */
    if (S.keyOn("window") && press(document.querySelector(".toolbar"), k)) { e.preventDefault(); }
  });
})();
