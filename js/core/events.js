/* Game events: code announces what happened with S.emit(name, data), and
   the debug panel and the debug log listen with S.on(name, fn).
   S.on("*", fn) receives every event. The page's focus is kept here too,
   for the sound, the music and the title bar. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  var subs = {};
  S.on = function (name, fn) {
    (subs[name] = subs[name] || []).push(fn);
  };
  S.emit = function (name, data) {
    (subs[name] || []).concat(subs["*"] || []).forEach(function (fn) {
      try {
        fn(data, name);
      } catch (e) {
        if (window.console) { console.error(e); }
      }
    });
  };
  /* Whether the game has the focus: its tab shown and its window
     focused. It follows the events, since document.hasFocus() can still
     say true while the window is losing the focus, as when the tab
     changes. A click, a tap or a key in the page means it has the focus.
     Each change emits "focus" with the new state */
  var focused = !document.hidden && (!document.hasFocus || document.hasFocus());
  function set(v) { if (v !== focused) { focused = v; S.emit("focus", { focused: v }); } }
  S.pageFocused = function () { return focused; };
  window.addEventListener("blur", function () { set(false); });
  window.addEventListener("pagehide", function () { set(false); });
  window.addEventListener("focus", function () { set(!document.hidden); });
  document.addEventListener("visibilitychange", function () { set(!document.hidden && (!document.hasFocus || document.hasFocus())); });
  ["pointerdown", "keydown"].forEach(function (k) {
    document.addEventListener(k, function (e) { if (e.isTrusted && !document.hidden) { set(true); } }, true);
  });
})();
