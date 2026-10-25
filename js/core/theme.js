/* Theme, accent, text size and motion, applied to the root element. */
(function () {
  var S = window.ECBSIM;
  /* Plasma's accent colors (plasma-workspace, kcms/colors/ui/AccentColorUI.qml) */
  S.ACCENTS = [
    ["#e93a9a", "Pink"], ["#e93d58", "Red"], ["#e9643a", "Orange"], ["#e8cb2d", "Yellow"], ["#3dd425", "Green"],
    ["#00d3b8", "Teal"], ["#3daee9", "Blue"], ["#b875dc", "Purple"], ["#926ee4", "Violet"], ["#686b6f", "Gray"]
  ];
  function lum(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if (!m) { return 0.4; }
    var n = parseInt(m[1], 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  var lastReduced = null;
  S.applyTheme = function () {
    var r = document.documentElement, st = S.settings;
    if (st.theme === "system") { r.removeAttribute("data-theme"); } else { r.setAttribute("data-theme", st.theme); }
    r.style.setProperty("--accent", st.accent);
    /* Text on the accent: white, or Breeze's dark text on a light accent */
    r.style.setProperty("--on-accent", lum(st.accent) > 0.45 ? "#232629" : "#ffffff");
    r.setAttribute("data-size", st.size);
    r.setAttribute("data-wrap", st.prettyWrap === false ? "normal" : "pretty");
    /* Each kind of element Settings > Motion and text can wrap evenly */
    Object.keys(st.wrapParts || {}).forEach(function (k) { r.setAttribute("data-wrap-" + k, st.wrapParts[k] === false ? "off" : "on"); });
    if (S.applyWrap) { S.applyWrap(); }
    r.setAttribute("data-frame", st.frame === "window" ? "window" : "fill");
    r.setAttribute("data-page", st.pageLimit === false ? "full" : "limit");
    r.setAttribute("data-status", st.statusBar ? "bar" : "side");
    r.setAttribute("data-notify", st.notifyCorner || "bottom-right");
    r.setAttribute("data-indicators", st.stickyIndicators ? "sticky" : "scroll");
    r.setAttribute("data-accountant", st.accountant === false ? "off" : "on");
    r.setAttribute("data-compact", st.compactCountries ? "on" : "off");
    r.setAttribute("data-dialogs", st.dialogLimit === false ? "grow" : "limit");
    r.setAttribute("data-guides", st.guideLines === false ? "off" : "on");
    r.style.setProperty("--window-max", (st.windowMax || 1440) + "px");
    r.style.setProperty("--page-max", (st.pageMax || 1200) + "px");
    if (st.motion === "system") { r.removeAttribute("data-motion"); } else { r.setAttribute("data-motion", st.motion); }
    /* A change between reduced and full motion would start the opening
       animation of what is already open, such as the Settings window
       itself: those stay as they are (settled, css/motion.css) */
    var reduced = S.reducedMotion();
    if (lastReduced !== null && reduced !== lastReduced) {
      document.querySelectorAll(".toast, .award-pop, .dialog, .pop-page, .dbody > *").forEach(function (n) { n.classList.add("settled"); });
    }
    lastReduced = reduced;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute("content", getComputedStyle(r).getPropertyValue("--header").trim() || "#dee0e2"); }
    S.applyTitle();
  };
  S.applyTitle = function () {
    var acr = S.bankName().acr;
    document.title = acr + " Simulator";
    var t = document.getElementById("app-title");
    if (t) { t.textContent = acr + " Simulator"; }
  };
  S.reducedMotion = function () {
    var m = S.settings.motion;
    if (m === "reduce") { return true; }
    if (m === "full") { return false; }
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  };
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { S.applyTheme(); if (S.ui && S.ui.render) { S.ui.render(); } });
    /* The title screen's backdrop has its motion in its drawing, so a
       change of the system's motion setting draws it again */
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function () { S.applyTheme(); if (S.ui && S.ui.render) { S.ui.render(); } });
  } catch (e) {}
})();
