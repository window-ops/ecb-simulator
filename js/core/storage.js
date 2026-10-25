/* Settings and saved games in the browser, with the save choices of Selk.

   Where the game is kept:
   - THIS TAB (sessionStorage, the default): closing the tab erases it.
   - THIS COMPUTER (localStorage): it stays until deleted. The choice itself
     is kept in localStorage under ecbsim-save-local.
   Wipe data on refresh (ecbsim-wipe-on-refresh, in localStorage) erases
   every game key at each load, for testing; it takes priority over THIS
   COMPUTER, and the settings warn when both are on.

   Every access is wrapped: in a private window, with blocked site data, or
   in a preview, storage may be missing or throw, and the game then runs
   without it. */
(function () {
  var S = window.ECBSIM;
  var PREFIX = "ecbsim-";
  S.LOCAL_KEY = PREFIX + "save-local";
  S.WIPE_KEY = PREFIX + "wipe-on-refresh";
  S.NUDGED_KEY = PREFIX + "save-nudged";
  /* Keep debug through wipes (Settings > Debug > Testing), in localStorage */
  S.DEBUG_KEEP_KEY = PREFIX + "debug-keep";
  /* Keys that are not game data and never move between the two storages */
  var CONTROL = [S.LOCAL_KEY, S.WIPE_KEY, S.NUDGED_KEY, S.DEBUG_KEEP_KEY];

  function raw(area, k) {
    try { return window[area].getItem(k); } catch (e) { return null; }
  }
  S.saveLocal = function () { return raw("localStorage", S.LOCAL_KEY) === "1"; };
  S.wipeOn = function () { return raw("localStorage", S.WIPE_KEY) === "1"; };
  S.debugKeep = function () { return raw("localStorage", S.DEBUG_KEEP_KEY) === "1"; };
  S.setDebugKeep = function (on) {
    try { if (on) { localStorage.setItem(S.DEBUG_KEEP_KEY, "1"); } else { localStorage.removeItem(S.DEBUG_KEEP_KEY); } return true; } catch (e) { return false; }
  };
  /* The settings of Settings > Debug, which Keep debug through wipes keeps */
  S.DEBUG_SETTINGS = ["debugMode", "debugPanel", "debugLog", "fast", "debugIntended", "debugBarOn", "debugConfirmEnd", "debugAchieveDry"];
  /* Runs a wipe; with Keep debug through wipes on, the debug settings, the
     debug panel's position, Wipe data on refresh and the switch itself
     are as they were after it */
  function keepingDebug(wipe) {
    if (!S.debugKeep()) { wipe(); return; }
    var saved = S.store.get("settings") || {}, kept = {}, pos = S.store.get("debug-pos"), wiping = S.wipeOn();
    S.DEBUG_SETTINGS.forEach(function (k) { if (k in saved) { kept[k] = saved[k]; } });
    wipe();
    /* The storage may have changed (the save location goes with
       everything): the kept values go where the game is kept now */
    var now = S.store.get("settings") || {};
    Object.keys(kept).forEach(function (k) { now[k] = kept[k]; });
    if (Object.keys(kept).length) { S.store.set("settings", now); }
    if (pos) { S.store.set("debug-pos", pos); }
    S.setWipe(wiping);
    S.setDebugKeep(true);
  }
  function area() { return S.saveLocal() ? "localStorage" : "sessionStorage"; }
  S.storeArea = area;

  S.store = {
    get: function (k) {
      var v = raw(area(), PREFIX + k);
      if (v == null) { return null; }
      try { return JSON.parse(v); } catch (e) { return null; }
    },
    set: function (k, v) {
      try { window[area()].setItem(PREFIX + k, JSON.stringify(v)); S.emit("save", { key: k }); return true; } catch (e) { return false; }
    },
    del: function (k) {
      try { window[area()].removeItem(PREFIX + k); } catch (e) {}
    }
  };

  /* The game keys in one storage */
  S.storageKeys = function (which) {
    var out = [];
    try {
      var st = window[which];
      for (var i = 0; i < st.length; i++) {
        var k = st.key(i);
        if (k.indexOf(PREFIX) === 0) { out.push(k); }
      }
    } catch (e) {}
    return out.sort();
  };
  /* Moves the game between this tab and this computer. Returns false when
     the browser refuses. */
  S.setSaveLocal = function (on) {
    try {
      var from = on ? sessionStorage : localStorage, to = on ? localStorage : sessionStorage;
      S.storageKeys(on ? "sessionStorage" : "localStorage").forEach(function (k) {
        if (CONTROL.indexOf(k) >= 0) { return; }
        to.setItem(k, from.getItem(k));
        from.removeItem(k);
      });
      if (on) { localStorage.setItem(S.LOCAL_KEY, "1"); } else { localStorage.removeItem(S.LOCAL_KEY); }
      S.emit("storage", { local: on });
      return true;
    } catch (e) {
      return false;
    }
  };
  S.setWipe = function (on) {
    try {
      if (on) { localStorage.setItem(S.WIPE_KEY, "1"); } else { localStorage.removeItem(S.WIPE_KEY); }
      return true;
    } catch (e) {
      return false;
    }
  };
  /* Erases every game key in both storages; the control keys stay */
  /* Erases every kept key but the storage choices; keepSettings spares the settings too */
  /* Erases the game keys in both storages. keepSettings keeps the
     settings; everything also erases the keys that are not game data (the
     save location, Wipe data on refresh, the save reminder), for Delete all
     game data, including settings. Wipe data on refresh itself never
     passes everything, so it stays on */
  S.wipeAll = function (keepSettings, everything) {
    keepingDebug(function () {
      ["localStorage", "sessionStorage"].forEach(function (a) {
        S.storageKeys(a).forEach(function (k) {
          if (keepSettings && k === "ecbsim-settings") { return; }
          if (everything || CONTROL.indexOf(k) < 0) { try { window[a].removeItem(k); } catch (e) {} }
        });
      });
    });
  };
  /* Every setting back to its default: the settings, Wipe data on refresh
     and the debug panel's position. The saves, the achievements and the
     save location stay, since the save location says where they are kept */
  S.resetSettings = function () {
    keepingDebug(function () {
      ["localStorage", "sessionStorage"].forEach(function (a) {
        ["ecbsim-settings", S.WIPE_KEY, "ecbsim-debug-pos", S.DEBUG_KEEP_KEY].forEach(function (k) { try { window[a].removeItem(k); } catch (e) {} });
      });
    });
    S.loadSettings();
  };
  if (S.wipeOn()) { S.wipeAll(); S.wiped = true; }

  /* Readable names for the keys, for the Storage page */
  S.KEY_NAMES = {
    "ecbsim-settings": "Settings",
    "ecbsim-save-slots": "Save slots",
    "ecbsim-save-local": "Save location choice",
    "ecbsim-wipe-on-refresh": "Wipe data on refresh",
    "ecbsim-save-nudged": "Save reminder shown",
    "ecbsim-debug-pos": "Debug panel position",
    "ecbsim-debug-keep": "Keep debug through wipes",
    "ecbsim-achievements": "Achievements"
  };

  S.DEFAULT_SETTINGS = {
    theme: "system", accent: "#3daee9", bankLang: "English", size: "normal", motion: "system", focusPill: true,
    sound: true, uiSound: true, volume: 70, levels: { clicks: 60, alerts: 80, votes: 60, turn: 80, saves: 60, typing: 55 }, sounds: {}, soundSeed: 0, tourDone: false,
    music: false, musicVolume: 50, musicHidden: false, playlist: "european", logoAccent: false,
    tracks: { eurocrisis: { on: true, vol: 80 }, draghi: { on: true, vol: 80 }, troika: { on: true, vol: 80 }, superbad: { on: true, vol: 80 }, bankrupt: { on: true, vol: 80 }, ode: { on: true, vol: 80 }, finally: { on: true, vol: 80 }, october: { on: true, vol: 80 }, kremlin: { on: true, vol: 80 },
      strasbourg: { on: true, vol: 80 }, popular: { on: true, vol: 80 }, social: { on: true, vol: 80 }, renew: { on: true, vol: 80 }, green: { on: true, vol: 80 }, conservative: { on: true, vol: 80 }, patriot: { on: true, vol: 80 }, sovereign: { on: true, vol: 80 }, left: { on: true, vol: 80 }, troikarun: { on: true, vol: 80 } },
    prettyWrap: true, termLinks: true, footnotes: true, wrapParts: { text: true, headings: true, labels: true, pills: true, tables: true, menus: true, tooltips: true, lists: true, other: true }, frame: "fill", windowMax: 1440, statusBar: false, stickyIndicators: false, accountant: true, evenGrids: true, cardsPerRow: 0, titleTheme: "plain", titleCard: false, titleSplash: true, titleMusic: true, titleSpeed: 100, notifyCorner: "bottom-right", titleAnimate: true, titleCustom: { color: "#3daee9", backdrop: "popular", ink: "", music: "strasbourg" }, compactCountries: false, dialogLimit: true, guideLines: true, pageLimit: true, pageMax: 1200, hideHistory: false, hideVotes: false, hideTroika: false, hideDraghi: false, hideForecasts: false, autosave: true, dateFormat: "dd-mm-yyyy", saveSort: "newest", saveGroup: "none", reportClickAway: false, kbdHints: "all", customDifficulty: { will: 0.9, dist: 0.8, rel: 150, gain: 1 },
    debugMode: false, debugPanel: false, debugLog: false, fast: false, debugIntended: false, debugBarOn: false, debugConfirmEnd: true, debugAchieveDry: false,
    /* Settings > Keyboard: all shortcuts, then each area (js/ui/keys.js) */
    keys: { on: true, agenda: true, year: true, views: true, window: true, dialogs: true, film: true, end: true, title: true, debug: true },
    /* Settings > Keyboard > Key bindings: the keys the player changed, by action */
    keyBind: {}
  };
  S.loadSettings = function () {
    var saved = S.store.get("settings") || {};
    S.settings = JSON.parse(JSON.stringify(S.DEFAULT_SETTINGS));
    Object.keys(saved).forEach(function (k) {
      if (k === "levels" && saved.levels) {
        Object.keys(saved.levels).forEach(function (l) { S.settings.levels[l] = saved.levels[l]; });
      } else if (k === "keyBind" && saved.keyBind && typeof saved.keyBind === "object") {
        /* The player's keys, by action: kept whole, since the defaults hold none */
        S.settings.keyBind = JSON.parse(JSON.stringify(saved.keyBind));
      } else if (k === "sounds" && saved.sounds && typeof saved.sounds === "object") {
        /* Each sound's own settings, kept only where the player changed them:
           on, volume from 0 to 100%, pitch from -12 to 12 semitones */
        S.settings.sounds = {};
        Object.keys(saved.sounds).forEach(function (id) {
          var o = saved.sounds[id], c = {};
          if (!o || typeof o !== "object" || /^(__proto__|constructor|prototype)$/.test(id)) { return; }
          if (typeof o.on === "boolean") { c.on = o.on; }
          if (typeof o.vol === "number" && isFinite(o.vol)) { c.vol = Math.max(0, Math.min(100, Math.round(o.vol))); }
          if (typeof o.pitch === "number" && isFinite(o.pitch)) { c.pitch = Math.max(-12, Math.min(12, Math.round(o.pitch))); }
          S.settings.sounds[id] = c;
        });
      } else if (k === "tracks" && saved.tracks) {
        Object.keys(saved.tracks).forEach(function (t) { if (S.settings.tracks[t]) { S.settings.tracks[t] = saved.tracks[t]; } });
      } else if (S.settings[k] && typeof S.settings[k] === "object" && saved[k] && typeof saved[k] === "object") {
        /* A group of settings keeps the defaults of the keys it lacks */
        Object.keys(saved[k]).forEach(function (x) { if (S.settings[k][x] !== undefined) { S.settings[k][x] = saved[k][x]; } });
      } else if (S.settings[k] !== undefined) {
        S.settings[k] = saved[k];
      }
    });
    /* Settings saved before debug mode existed keep their debug tools on */
    if (saved.debugMode === undefined && (saved.debugPanel || saved.debugLog || saved.fast || saved.debugIntended)) { S.settings.debugMode = true; }
  };
  S.loadSettings();
  S.saveSettings = function () { S.store.set("settings", S.settings); S.emit("settings", S.settings); };

  /* Saves, as in most games. Each game has one autosave, its automatic
     slot, which the game rewrites as it goes. The player adds manual saves
     at any time; each one is written the moment it is made, and keeps its
     game until the player overwrites or deletes it. Every save has an ID
     (2A for the autosave of the second game, 2A-3M for its third manual
     save) and may also have a name of the player's choosing. Saves
     imported from a file form an import of their own, numbered as games
     are (the lowest number free). An import of one game is named as a
     game is: I1A is its autosave, I1A-3M its third manual save. In an
     import of several games each game has a number: I1-2A is the autosave
     of the second game of import I1, I1-2A-3M its third manual save.

     The list of slots is read from storage at each use, so it stays right
     when the game data moves between this tab and this computer, or when
     Settings > Storage deletes it. */
  /* Imported saves take IDs of their own (iauto-, imanual-), so they never
     use up the numbers of the games played here */
  var SLOT_ID = /^(?:i?auto|i?manual)-\d+$/;
  S.SAVE_NAME_MAX = 40;
  function readSlots() {
    var list = S.store.get("save-slots");
    if (!Array.isArray(list)) { return []; }
    return list.filter(function (slot, i, all) {
      return slot && SLOT_ID.test(slot.id) && (slot.kind === "automatic" || slot.kind === "manual") &&
        (slot.kind === "automatic" || SLOT_ID.test(slot.automatic || "") && slot.number > 0) &&
        (slot.imp === undefined || (slot.imp > 0 && slot.inner >= 0)) &&
        all.slice(0, i).every(function (before) { return before.id !== slot.id; });
    });
  }
  function keepSlots(list) { list.forEach(setKeyName); return S.store.set("save-slots", list); }
  function find(list, id) { return list.filter(function (slot) { return slot.id === id; })[0]; }
  function idNumber(id) { return Number(String(id).replace(/^.*-/, "")); }
  /* A new ID is the lowest one free. A deleted autosave keeps its ID while
     a manual save or the game in progress still names it, so the game can
     recreate it under that ID; once a game has no save left and is not
     open, its ID is free again. */
  function nextId(list, prefix) {
    var taken = {}, n = 1;
    function take(id) { if (id && id.indexOf(prefix) === 0) { taken[idNumber(id)] = true; } }
    list.forEach(function (slot) { take(slot.id); take(slot.automatic); });
    take(S.G && S.G.slot);
    while (taken[n]) { n++; }
    return prefix + n;
  }
  function label(slot) {
    /* inner is 0 in an import of one game, which has no game number */
    var head = slot.imp ? "I" + slot.imp + (slot.inner ? "-" + slot.inner : "") : String(idNumber(slot.kind === "automatic" ? slot.id : slot.automatic));
    return slot.kind === "automatic" ? head + "A" : head + "A-" + slot.number + "M";
  }
  /* The name the player gave, or what the save is */
  function title(slot) { return slot.name || (slot.kind === "automatic" ? S.t("Autosave") : S.t("Manual save")); }
  function setKeyName(slot) { S.KEY_NAMES["ecbsim-save-" + slot.id] = S.t("Save {id}", { id: label(slot) }) + (slot.name ? ": " + slot.name : ""); }
  function cleanName(name) { return String(name || "").replace(/\s+/g, " ").trim().slice(0, S.SAVE_NAME_MAX); }
  function payload(G) {
    return { at: new Date().toISOString(), year: G.year, mode: G.mode, president: G.president && G.president.name, game: G };
  }
  function read(id) {
    var s = S.store.get("save-" + id);
    return s && s.game && s.game.v === 1 ? s : null;
  }
  /* The automatic slot of a game: its own; its own again, under the same
     ID, when the player deleted it, so the next autosave point recreates
     it; or a new one when the game has none yet or its ID now belongs to
     another game */
  function automaticFor(list, G) {
    var slot = G.slot && find(list, G.slot), held = slot && read(slot.id);
    if (slot && slot.kind === "automatic" && (!held || !G.id || !held.game.id || held.game.id === G.id)) { return slot; }
    if (!slot && G.slot && /^auto-\d+$/.test(G.slot)) {
      slot = { id: G.slot, kind: "automatic" };
      list.push(slot);
      return slot;
    }
    /* An imported game stays in its import while a manual save of it
       still holds its import and game number; with none left, it goes on
       as a game of its own */
    var mate = !slot && G.slot && /^iauto-\d+$/.test(G.slot) && list.filter(function (x) { return x.kind === "manual" && x.automatic === G.slot && x.imp; })[0];
    if (mate) {
      slot = { id: G.slot, kind: "automatic", imp: mate.imp, inner: mate.inner };
      list.push(slot);
      return slot;
    }
    slot = { id: nextId(list, "auto-"), kind: "automatic" };
    list.push(slot);
    G.slot = slot.id;
    return slot;
  }
  function manualNumber(list, automatic) {
    var n = 1;
    while (list.some(function (slot) { return slot.kind === "manual" && slot.automatic === automatic && slot.number === n; })) { n++; }
    return n;
  }
  readSlots().forEach(setKeyName);

  /* Orders for the list of saves; each breaks ties by the newest */
  function newest(a, b) { return a.save.at < b.save.at ? 1 : a.save.at > b.save.at ? -1 : 0; }
  var SORTS = {
    newest: newest,
    oldest: function (a, b) { return -newest(a, b); },
    year: function (a, b) { return (b.save.year - a.save.year) || newest(a, b); },
    president: function (a, b) { return String(a.save.president).localeCompare(String(b.save.president)) || newest(a, b); },
    name: function (a, b) { return title(a.slot).localeCompare(title(b.slot)) || label(a.slot).localeCompare(label(b.slot), undefined, { numeric: true }); }
  };

  S.saves = {
    SORTS: ["newest", "oldest", "year", "president", "name"],
    /* write("auto", G) updates the game's autosave, unless Settings >
       Game turned autosave off and force is not set */
    write: function (id, G, force) {
      if (!G) { return false; }
      var list = readSlots();
      if (id === "auto") {
        if (S.settings.autosave === false && !force) { return true; }
        var slot = automaticFor(list, G);
        return keepSlots(list) && S.store.set("save-" + slot.id, payload(G));
      }
      return !!find(list, id) && S.store.set("save-" + id, payload(G));
    },
    read: read,
    /* Every save that holds a game, as { slot, save }, in the order asked
       for (newest first by default) */
    list: function (order) {
      var out = readSlots().map(function (slot) { return { slot: slot, save: read(slot.id) }; }).filter(function (x) { return x.save; });
      return out.sort(SORTS[order] || newest);
    },
    any: function () { return S.saves.list().length > 0; },
    latest: function () { return S.saves.list()[0] || null; },
    /* A new game's autosave slot, written at once by the caller */
    addAutomatic: function (G) {
      var list = readSlots(), slot = { id: nextId(list, "auto-"), kind: "automatic" };
      list.push(slot);
      keepSlots(list);
      G.slot = slot.id;
      return slot.id;
    },
    /* A new manual save of the game, written at once; null when the
       browser refuses */
    saveNew: function (G, name) {
      var list = readSlots(), auto = automaticFor(list, G);
      var slot = { id: nextId(list, auto.imp ? "imanual-" : "manual-"), kind: "manual", automatic: auto.id, number: manualNumber(list, auto.id) };
      if (auto.imp) { slot.imp = auto.imp; slot.inner = auto.inner; }
      name = cleanName(name);
      if (name) { slot.name = name; }
      list.push(slot);
      if (!keepSlots(list) || !S.store.set("save-" + slot.id, payload(G))) {
        S.store.del("save-" + slot.id);
        keepSlots(list.filter(function (x) { return x !== slot; }));
        return null;
      }
      return slot;
    },
    /* Replaces a manual save with the game. A save of another game takes
       the ID that game's next manual save would have. */
    overwrite: function (id, G) {
      var list = readSlots(), slot = find(list, id);
      if (!slot || slot.kind !== "manual") { return false; }
      var auto = automaticFor(list, G);
      if (slot.automatic !== auto.id) {
        slot.automatic = auto.id; slot.number = manualNumber(list, auto.id);
        if (auto.imp) { slot.imp = auto.imp; slot.inner = auto.inner; } else { delete slot.imp; delete slot.inner; }
      }
      return keepSlots(list) && S.store.set("save-" + id, payload(G));
    },
    rename: function (id, name) {
      var list = readSlots(), slot = find(list, id);
      if (!slot) { return false; }
      name = cleanName(name);
      if (name) { slot.name = name; } else { delete slot.name; }
      return keepSlots(list);
    },
    /* Deletes a save of either kind. The game whose autosave is deleted
       recreates it, with the same ID, at its next autosave point. */
    remove: function (id) {
      var list = readSlots(), slot = find(list, id);
      if (!slot) { return false; }
      S.store.del("save-" + id);
      delete S.KEY_NAMES["ecbsim-save-" + id];
      keepSlots(list.filter(function (x) { return x !== slot; }));
      return true;
    },
    get: function (id) { return find(readSlots(), id) || null; },
    /* The number of the game a save belongs to: 2 for 2A and 2A-3M */
    game: function (slot) { return idNumber(slot.kind === "automatic" ? slot.id : slot.automatic); },
    /* The automatic slot that names a save's game: its own, or the one its manual save belongs to */
    gameSlot: function (slot) { return slot.kind === "automatic" ? slot.id : slot.automatic; },
    /* Deletes several saves at once; returns how many went */
    removeMany: function (ids) {
      var list = readSlots(), gone = 0;
      var keep = list.filter(function (slot) {
        if (ids.indexOf(slot.id) < 0) { return true; }
        S.store.del("save-" + slot.id); delete S.KEY_NAMES["ecbsim-save-" + slot.id]; gone++;
        return false;
      });
      keepSlots(keep);
      return gone;
    },
    /* The saves to export, as the file holds them: a game each, with its
       saves. ids are the slots chosen; open, the game in progress, comes
       with every save of its own and its state now as its autosave. */
    exportGames: function (ids, open) {
      var list = readSlots(), games = [], byGame = {};
      function add(slot, save) {
        var key = slot.kind === "automatic" ? slot.id : slot.automatic;
        if (!byGame[key]) { byGame[key] = { saves: [] }; games.push(byGame[key]); }
        var out = { kind: slot.kind, save: { at: save.at, game: save.game } };
        if (slot.kind === "manual") { out.number = slot.number; }
        if (slot.name) { out.name = slot.name; }
        if (!byGame[key].saves.some(function (x) { return x.kind === out.kind && x.number === out.number; })) { byGame[key].saves.push(out); }
      }
      if (open) {
        var auto = open.slot && find(list, open.slot);
        add(auto || { id: open.slot || "open", kind: "automatic" }, { at: new Date().toISOString(), game: open });
        list.forEach(function (slot) { var sv; if (slot.kind === "manual" && slot.automatic === open.slot && (sv = read(slot.id))) { add(slot, sv); } });
      }
      (ids || []).forEach(function (id) { var slot = find(list, id), sv = slot && read(id); if (sv) { add(slot, sv); } });
      return games;
    },
    /* The kept game a run belongs to, found by the run's game ID: the
       automatic slot ID that names it, its label without the save part
       (2, I1, I1-2) and its saves; null when no kept save holds the run */
    findRun: function (gameId) {
      if (!gameId) { return null; }
      var saves = S.saves.list().filter(function (x) { return x.save.game.id === gameId; });
      if (!saves.length) { return null; }
      var key = S.saves.gameSlot(saves[0].slot);
      saves = S.saves.list().filter(function (x) { return S.saves.gameSlot(x.slot) === key; });
      return { key: key, name: label(saves[0].slot).replace(/A(-\d+M)?$/, ""), saves: saves };
    },
    /* The saves of a file's game that a kept game lacks: a save is there
       already when one of the game has the same date and year */
    missing: function (found, fileSaves) {
      return fileSaves.filter(function (sv) {
        return !found.saves.some(function (x) { return x.save.at === sv.save.at && x.save.year === sv.save.game.year; });
      });
    },
    /* The number the next import takes: the lowest one free */
    nextImport: function () {
      var taken = {}, n = 1;
      readSlots().forEach(function (slot) { if (slot.imp) { taken[slot.imp] = true; } });
      while (taken[n]) { n++; }
      return n;
    },
    /* Adds the games of a file (checked by the caller). A game the player
       chose to add to a kept game (into) gives it the saves it lacks. The
       others are copies, which form a new import: the lowest import number
       free, a game number for each copy in the order of the file when
       there are several, and each copy's saves under new IDs. Each copy
       gets a game ID of its own, so it never takes over the autosave of a
       game kept here. Returns { imp, slots }, imp null when the file added
       no copy, or null when the browser refuses, in which case nothing is
       kept. */
    importGames: function (games, into) {
      var list = readSlots(), before = list.slice(), imp = S.saves.nextImport(), made = [];
      var ok = true;
      /* into[i], when set, is a kept game the player chose to add the
         i-th game to (S.saves.findRun): only the saves it lacks join it,
         as manual saves of that game, with its game ID */
      into = into || [];
      var copies = games.filter(function (g, gi) { return !into[gi]; }), k = 0;
      games.forEach(function (g, gi) {
        if (into[gi]) {
          var found = into[gi], key = found.key, head = list.filter(function (x) { return x.id === key || x.automatic === key; })[0] || {};
          S.saves.missing(found, g.saves).forEach(function (sv) {
            var G = sv.save.game, slot = { id: nextId(list, head.imp ? "imanual-" : "manual-"), kind: "manual", automatic: key, number: manualNumber(list, key) };
            if (head.imp) { slot.imp = head.imp; slot.inner = head.inner; }
            var name = cleanName(sv.name);
            if (name) { slot.name = name; }
            G.id = found.saves[0].save.game.id; G.slot = key;
            if (S.sandbox) { S.sandbox(G); }
            list.push(slot); made.push(slot);
            if (ok && !S.store.set("save-" + slot.id, { at: sv.save.at, year: G.year, mode: G.mode, president: G.president && G.president.name, game: G })) { ok = false; }
          });
          return;
        }
        k++;
        var inner = copies.length > 1 ? k : 0, autoId = nextId(list, "iauto-"), gid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        /* The automatic ID is reserved from the start, so a game with manual saves only keeps it */
        list.push({ id: autoId, kind: "automatic", imp: imp, inner: inner, held: true });
        g.saves.forEach(function (sv) {
          var slot, G = sv.save.game;
          if (sv.kind === "automatic") {
            slot = list.filter(function (x) { return x.id === autoId; })[0]; delete slot.held;
          } else {
            var n = sv.number > 0 && !list.some(function (x) { return x.kind === "manual" && x.automatic === autoId && x.number === sv.number; }) ? sv.number : manualNumber(list, autoId);
            slot = { id: nextId(list, "imanual-"), kind: "manual", automatic: autoId, number: n, imp: imp, inner: inner };
            list.push(slot);
          }
          var name = cleanName(sv.name);
          if (name) { slot.name = name; }
          G.id = gid; G.slot = autoId;
          /* A run from a file earns only what is played after the import */
          if (S.sandbox) { S.sandbox(G); }
          made.push(slot);
          if (ok && !S.store.set("save-" + slot.id, { at: sv.save.at, year: G.year, mode: G.mode, president: G.president && G.president.name, game: G })) { ok = false; }
        });
      });
      list = list.filter(function (x) { if (x.held) { delete x.held; return false; } return true; });
      if (!ok || !keepSlots(list)) {
        made.forEach(function (slot) { S.store.del("save-" + slot.id); });
        keepSlots(before);
        return null;
      }
      return { imp: copies.length ? imp : null, slots: made };
    },
    label: label,
    title: title
  };
})();
