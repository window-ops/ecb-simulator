/* Start-up: apply the settings, build the window, show the start screen,
   and turn on the debug tools if they were left on. */
(function () {
  var S = window.ECBSIM;
  S.G = null;
  S.applyTheme();
  S.ui.build();
  /* The title screen and its menu come first; the form for a new game
     comes when the player asks for it */
  S.ui.title = true;
  S.ui.render();
  S.applyDebug();
  /* The loading screen (js/core/loader.js) fades away */
  if (S.loaded) { S.loaded(); }
  if (S.wiped) { S.ui.toast(S.t("Wipe data on refresh is on: the saved game and settings were erased."), "warn"); }
})();
