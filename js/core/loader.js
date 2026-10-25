/* The loading screen. It runs first, before every other file, and shows
   while the stylesheets and scripts after it arrive: which file is
   loading, how many have arrived and how much they weigh, and a tip that
   changes every eight seconds. A file that fails to load is named, with a
   button to reload. On a fast connection the screen never shows: it waits
   a quarter of a second first. js/main.js calls ECBSIM.loaded() when the
   game is ready, and the screen fades away. */
(function () {
  window.ECBSIM = window.ECBSIM || {};
  var S = window.ECBSIM, self = document.currentScript;
  /* The files after this one in the page: its stylesheets and scripts.
     The parser has not reached them yet, so the page reads its own source
     (following, below) and finds them there; until then, or when the browser
     cannot read it (a page opened from disk), the bar moves without a
     total and the count says how many files have arrived */
  var TOTAL = 0;
  /* Tips: how to play, and the record behind the game. Each explains its
     terms, since the glossary has not loaded yet */
  var TIPS = [
    "Every power of the bank stays open to you, including a seat in the Troika (the lenders who set the conditions of the loan programs) and the Draghi measures (bond purchases and long loans from 2010 on). Greece can come through without either.",
    "Emergency liquidity is a loan from a national central bank to its banks when they run short of cash. Given without political conditions, it keeps a state's banks open while its government negotiates.",
    "In June 2015 the bank capped emergency liquidity to Greek banks, and the banks stayed closed for three weeks.",
    "The backstop is the support the euro area promises its weakest members. Proposals that governments adopt, such as common debt, raise it, and a strong backstop calms markets without bond purchases.",
    "Options marked \"Council vote\" go to the Governing Council, the bank's board of national governors and executives, which can reject them.",
    "Each advisor forecasts with the model of their own school, and each is right in some conditions.",
    "A treaty campaign changes the law slowly, and each stage needs broad support.",
    "Hearings in the Parliament raise trust in the bank and give political cover for hard decisions.",
    "A single state leaving the euro does not end the run; a breakup of the euro does.",
    "Yanis Varoufakis, Greek finance minister from January to July 2015, held that Greece's debt could not be repaid in full and proposed swapping part of it for bonds whose payments follow growth.",
    "On 5 July 2015 Greek voters rejected the creditors' terms by 61%. Eight days later the government accepted a third loan program.",
    "The Modest Proposal of Yanis Varoufakis, Stuart Holland and James K. Galbraith has the bank service each state's debt up to 60% of its output. It appears among the proposals to governments.",
    "In 2013 IMF economists Olivier Blanchard and Daniel Leigh found that forecasts had underestimated how much budget cuts shrink output in a recession.",
    "Greek public debt rose from 127% of output in 2009 to 180% in 2014, through years of budget cuts, as output shrank.",
    "Greek output fell by about a quarter between 2008 and 2013, and unemployment reached 27.5% in 2013.",
    "Underlined words open a short definition, and small raised numbers open a note.",
    "1 to 9 choose an option, Enter decides, and E ends the year.",
    "Help explains the concept of the game, with the record behind it."
  ];

  /* The theme, the accent and the text size the player chose, read from the
     kept settings, so the screen matches the game that follows */
  try {
    var local = window.localStorage.getItem("ecbsim-save-local") === "1";
    var st = JSON.parse(window[local ? "localStorage" : "sessionStorage"].getItem("ecbsim-settings") || "{}");
    var r = document.documentElement;
    if (st.theme && st.theme !== "system") { r.setAttribute("data-theme", st.theme); }
    if (st.size) { r.setAttribute("data-size", st.size); }
    if (st.accent) { r.style.setProperty("--accent", st.accent); }
    if (st.motion && st.motion !== "system") { r.setAttribute("data-motion", st.motion); }
  } catch (e) {}

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text != null) { e.textContent = text; }
    return e;
  }
  /* A Breeze dialog window: a header with the logo and the name, a body
     with the progress, and a footer strip with the tip, as KDE's tip of
     the day sits at the foot of its window */
  var SVG = "http://www.w3.org/2000/svg";
  function icon(cls, view, body) {
    var i = document.createElementNS(SVG, "svg");
    i.setAttribute("viewBox", view); i.setAttribute("class", cls); i.setAttribute("aria-hidden", "true");
    i.innerHTML = body;
    return i;
  }
  var LOGO = '<circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M15.6 8.2a4.6 4.6 0 1 0 0 7.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M6.8 10.6h6.4M6.8 13.4h6.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
  /* Breeze's help-hint icon, as in the game's hint buttons */
  /* Breeze's error icon, its cross cut out of the square */
  var ERROR = '<mask id="loader-err" maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="22"><rect x="3" y="3" width="16" height="16" rx="2" fill="#fff"/>' +
    '<path d="M 6.414,5 5,6.414 9.586,11 5,15.586 6.414,17 11,12.414 15.586,17 17,15.586 12.414,11 17,6.414 15.586,5 11,9.586 Z" fill="#000"/></mask>' +
    '<rect width="22" height="22" fill="currentColor" mask="url(#loader-err)"/>';
  var HINT = '<path fill="currentColor" d="M 11 3 C 6.568 3 3 6.568 3 11 C 3 15.432 6.568 19 11 19 C 15.432 19 19 15.432 19 11 C 19 6.568 15.432 3 11 3 z M 11 4 C 14.878 4 18 7.122 18 11 C 18 14.878 14.878 18 11 18 C 7.122 18 4 14.878 4 11 C 4 7.122 7.122 4 11 4 z M 10 6 L 10 8 L 12 8 L 12 6 L 10 6 z M 10 9 L 10 16 L 12 16 L 12 9 L 10 9 z"/>';
  var box = el("div", "loader"), card = el("div", "loader-win");
  box.id = "loader";
  box.setAttribute("role", "status");
  box.setAttribute("aria-live", "polite");
  var head = el("div", "loader-head");
  head.appendChild(icon("loader-head-icon", "0 0 24 24", LOGO));
  head.appendChild(el("span", "", document.title));
  card.appendChild(head);
  var body = el("div", "loader-body");
  body.appendChild(icon("loader-logo", "0 0 24 24", LOGO));
  body.appendChild(el("h1", "", "Loading"));
  var bar = el("div", "loader-bar"), fill = el("span");
  bar.setAttribute("role", "progressbar"); bar.setAttribute("aria-valuemin", "0");
  bar.appendChild(fill);
  body.appendChild(bar);
  var file = el("p", "loader-file", "Starting..."), count = el("p", "loader-count", "");
  body.appendChild(file);
  body.appendChild(count);
  card.appendChild(body);
  /* The tip: "Tip:" in bold, then the tip, on one line */
  var tipBox = el("div", "loader-tip"), tipText = el("p", "loader-tip-text"), tip = el("span", "", "");
  tipBox.appendChild(icon("loader-tip-icon", "0 0 22 22", HINT));
  tipText.appendChild(el("b", "", "Tip: "));
  tipText.appendChild(tip);
  tipBox.appendChild(tipText);
  card.appendChild(tipBox);
  box.appendChild(card);
  (document.body || document.documentElement).appendChild(box);

  var done = 0, bytes = 0, failed = false, n = Math.floor(Math.random() * TIPS.length);
  function name(node) { return (node.getAttribute("src") || node.getAttribute("href") || "").replace(/^\.\//, ""); }
  function size(url) {
    try {
      var e = performance.getEntriesByName(new URL(url, document.baseURI).href)[0];
      return e ? e.encodedBodySize || e.transferSize || 0 : 0;
    } catch (x) { return 0; }
  }
  function show() {
    var kb = bytes ? ", " + Math.round(bytes / 1024) + " KB" : "";
    bar.classList.toggle("unknown", !TOTAL);
    if (TOTAL) {
      fill.style.width = Math.min(100, done / TOTAL * 100) + "%";
      bar.setAttribute("aria-valuemax", String(TOTAL)); bar.setAttribute("aria-valuenow", String(done));
      count.textContent = done + " of " + TOTAL + " files" + kb;
    } else {
      fill.style.width = "";
      count.textContent = done + (done === 1 ? " file" : " files") + kb;
    }
  }
  /* The stylesheets and scripts that come after this file in the page's
     source, as the parser will meet them */
  function following(html) {
    var doc = new DOMParser().parseFromString(html, "text/html"), seen = false, n = 0;
    Array.prototype.forEach.call(doc.querySelectorAll("script[src], link[rel=stylesheet]"), function (node) {
      if (seen) { n++; } else if (/(^|\/)js\/core\/loader\.js$/.test(node.getAttribute("src") || "")) { seen = true; }
    });
    return seen ? n : 0;
  }
  try {
    fetch(document.URL, { cache: "force-cache" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (html) {
      var n = html ? following(html) : 0;
      if (n && !failed) { TOTAL = Math.max(n, done); show(); }
    }).catch(function () {});
  } catch (x) {}
  function nextTip() {
    tip.textContent = TIPS[n % TIPS.length]; n++;
    tip.classList.remove("in"); void tip.offsetWidth; tip.classList.add("in");
  }
  nextTip(); show();
  var tipTimer = setInterval(nextTip, 8000);
  var showTimer = setTimeout(function () { box.classList.add("show"); }, 250);

  /* Each stylesheet and script names itself as the parser reaches it, and
     counts once it has arrived */
  /* This file's own tag fires its load once it has run: it is not counted */
  function watched(node) { return node.nodeType === 1 && node !== self && (node.tagName === "SCRIPT" && node.src || node.tagName === "LINK" && node.rel === "stylesheet"); }
  var mo = new MutationObserver(function (list) {
    list.forEach(function (m) {
      m.addedNodes.forEach(function (node) { if (watched(node) && !failed) { file.textContent = "Loading " + name(node); } });
    });
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("load", function (e) {
    /* After a failure the count stops, so it never reads as complete */
    if (!watched(e.target) || failed) { return; }
    done++; bytes += size(e.target.src || e.target.href);
    show();
  }, true);
  document.addEventListener("error", function (e) {
    if (!watched(e.target) || failed) { return; }
    failed = true;
    box.classList.add("show", "failed");
    body.querySelector("h1").textContent = "Loading failed";
    /* The failure in a box of its own, as KDE's inline error message:
       the icon, the file and what to do, and the Reload button */
    file.hidden = true;
    var err = el("div", "loader-error"), msg = el("div", "loader-error-text");
    err.setAttribute("role", "alert");
    err.appendChild(icon("loader-error-icon", "0 0 22 22", ERROR));
    msg.appendChild(el("p", "loader-error-file", name(e.target)));
    msg.appendChild(el("p", "", "This file could not be loaded. The connection may have dropped; reload to try again."));
    err.appendChild(msg);
    var again = el("button", "loader-reload", "Reload");
    again.type = "button";
    again.addEventListener("click", function () { window.location.reload(); });
    err.appendChild(again);
    body.appendChild(err);
  }, true);

  /* The game is ready: the screen fades away */
  S.loaded = function () {
    mo.disconnect(); clearInterval(tipTimer); clearTimeout(showTimer);
    if (failed) { return; }
    if (!box.classList.contains("show")) { box.remove(); return; }
    if (TOTAL) { done = TOTAL; } show();
    box.classList.add("gone");
    setTimeout(function () { box.remove(); }, 400);
  };
})();
