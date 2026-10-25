/* Achievements in the window: earned ones are kept on this computer with
   the date, across games, and each is announced once with a notification.
   The Achievements dialog lists them all, the locked ones dimmed with how
   to earn them; Settings > Game can clear them all (U.clearAchievements). js/model/achievements.js holds
   the tests and the rules that keep them fair: no achievement in a run
   marked by debug, and in a run imported from a file only what is played
   after the import. An export never contains achievements. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui;

  function kept() { return S.store.get("achievements") || {}; }
  /* Settings > Debug > Achievement notices: an achievement the run meets
     by the rules is announced as usual but not kept. It counts the run as
     if no debug tool had touched it, since playing to an ending with the
     debug tools marks the run and would announce nothing. Each is
     announced once until the page is reloaded (dryShown), since it stays
     unearned */
  var dryShown = {};
  function dry() { return !!(S.debugMode && S.debugMode() && S.settings.debugAchieveDry); }
  /* Records what the run has earned that was not earned before, and
     announces each */
  function check(vote) {
    var G = S.G;
    if (!G || G.preview) { return; }
    var have = kept(), noKeep = dry(), fresh = (noKeep ? S.metBy(G, vote) : S.earnedBy(G, vote)).filter(function (id) { return !have[id] && !(noKeep && dryShown[id]); });
    if (!fresh.length) { return; }
    if (noKeep) {
      fresh.forEach(function (id) { dryShown[id] = true; });
    } else {
      /* The day in the player's own time, as YYYY-MM-DD; shown in the chosen format */
      var now = new Date(), day = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2);
      fresh.forEach(function (id) { have[id] = day; });
      S.store.set("achievements", have);
    }
    fresh.forEach(function (id, i) {
      var a = S.ACHIEVEMENTS.filter(function (x) { return x.id === id; })[0];
      /* An achievement waits until the year's transition, the year report,
         any other dialog, a vote and the ending film have closed, so it
         never interrupts them. The ending's screen (the crash screen or a
         period's end screen) is where the run rests, so it shows there,
         over the screen, as soon as the film has faded into it */
      function announce() {
        if (U.dialogOpen() || U.voting || document.querySelector(".yearfx, .cine")) { setTimeout(announce, 500); return; }
        pop(a);
      }
      setTimeout(announce, 600 + i * 400);
    });
  }
  /* The notice, as Steam shows one: an opaque card in the corner with the
     achievement's icon, "Achievement unlocked" and its name. A click opens
     the list. On a phone it comes at the top, clear of the page's buttons. */
  function pop(a) {
    var box = document.getElementById("award-pops");
    if (!box) { box = el("div", "award-pops"); box.id = "award-pops"; document.body.appendChild(box); }
    var card = el("button", "award-pop"); card.type = "button";
    card.setAttribute("aria-label", S.t("Achievement unlocked: {n}. Show all achievements", { n: S.t(a.name) }));
    var tile = el("span", "award-tile"); tile.appendChild(S.icon("achievements"));
    card.appendChild(tile);
    var txt = el("span", "award-text");
    txt.appendChild(el("span", "award-kicker", S.t("Achievement unlocked")));
    txt.appendChild(el("span", "award-name", S.t(a.name)));
    card.appendChild(txt);
    card.addEventListener("click", function () { card.remove(); U.achievementsDialog(); });
    box.appendChild(card);
    U.announce(S.t("Achievement unlocked: {n}", { n: S.t(a.name) }));
    S.sound.play("achievement");
    /* It stays while the pointer rests on it or it has the focus */
    S.dwell(card, S.fast ? 1500 : 5000, function () { card.classList.add("leaving"); setTimeout(function () { card.remove(); }, 300); });
  }
  /* For the debug panel's tester: shows the notice of an achievement
     without earning it, or earns or forgets one by hand */
  U.testAchievement = function (id) {
    var a = S.ACHIEVEMENTS.filter(function (x) { return x.id === id; })[0];
    if (a) { pop(a); }
  };
  U.setAchievement = function (id, on) {
    var have = kept(), now = new Date();
    if (on) { have[id] = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2); }
    else { delete have[id]; }
    S.store.set("achievements", have);
    S.emit("achievements", { id: id, on: on });
  };
  U.hasAchievement = function (id) { return !!kept()[id]; };
  S.on("vote", function (v) { check(v); });
  S.on("year", function () { check(null); });
  S.on("initiative", function () { check(null); });
  /* A debug action earns Market manipulator at once */
  S.on("debug", function () { check(null); });

  /* Clears every achievement after a question; after runs once they are gone */
  U.clearAchievements = function (after) {
    var n = S.ACHIEVEMENTS.filter(function (a) { return kept()[a.id]; }).length;
    if (!n) { return; }
    U.dialog({ title: S.t("Clear every achievement?"), icon: "delete",
      body: el("p", "", n === 1 ? S.t("The achievement earned is cleared and can be earned again by playing. This cannot be undone.") :
        S.t("The {n} achievements earned are cleared and can be earned again by playing. This cannot be undone.", { n: n })),
      buttons: [{ label: S.t("Cancel") }, { label: S.t("Clear achievements"), primary: true, onClick: function () {
        S.store.del("achievements");
        S.sound.play("delete");
        S.emit("achievements", { cleared: true });
        if (after) { after(); }
        if (U.title && !S.G) { U.render(); }
        return "quiet";
      } }] });
  };
  /* How many achievements are earned, for Settings */
  U.achievementCount = function () { var have = kept(); return S.ACHIEVEMENTS.filter(function (a) { return have[a.id]; }).length; };
  U.achievementsDialog = function () {
    var have = kept(), b = el("div", "prose"), n = S.ACHIEVEMENTS.filter(function (a) { return have[a.id]; }).length, close = null;
    b.appendChild(el("p", "dim small", S.t("{n} of {m} earned. Achievements are kept in this browser across games, and an export never contains them. Settings > Game can clear them.", { n: n, m: S.ACHIEVEMENTS.length })));
    /* What the game in progress can still earn, when a rule holds it back */
    if (S.G && S.tainted(S.G)) { b.appendChild(el("p", "small warnc", S.t("The game in progress was changed with the debug tools, so it earns no achievement other than Market manipulator."))); }
    else if (S.G && S.G.sandbox) { b.appendChild(el("p", "small", S.t("The game in progress comes from a file: it earns only what you reach after importing it, and its years count from {y}.", { y: S.G.sandbox.year }))); }
    var list = el("div", "awards");
    S.ACHIEVEMENTS.forEach(function (a) {
      var on = !!have[a.id], c = el("div", "award" + (on ? " earned" : ""));
      c.appendChild(S.icon("achievements"));
      var t = el("div");
      t.appendChild(el("div", "award-name", S.t(a.name)));
      t.appendChild(el("div", "dim small award-text", S.t(a.text)));
      if (on) { t.appendChild(el("div", "dim small award-text", S.t("Earned {d}", { d: S.fmtDate(have[a.id]) }))); }
      c.appendChild(t);
      c.setAttribute("aria-label", S.t(a.name) + ": " + (on ? S.t("earned") : S.t("not yet earned")));
      list.appendChild(c);
    });
    b.appendChild(list);
    close = U.dialog({ title: S.t("Achievements"), icon: "achievements", body: b, wide: true, buttons: [{ label: S.t("Close"), primary: true }] });
  };
})();
