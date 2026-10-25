/* Even line breaks. Settings > Motion and text turns them on and chooses
   the kinds of element they apply to (WRAP_PARTS). Browsers that know
   text-wrap: pretty get it from the stylesheet, and headings get balance.
   Every other browser gets the same result from a light engine here: it
   keeps the last word of a block off a line of its own by joining the last
   two words with a no-break space. It touches only the last text node of a
   block, runs on the page at start and on blocks as they are added, and
   takes its spaces back when a kind is turned off. */
(function () {
  var S = window.ECBSIM;
  /* The kinds of element, each with the blocks it covers */
  S.WRAP_PARTS = {
    text: { name: "Paragraphs and bullet points", blocks: "p, li, dd, .text, .histbox, .x, .toast-text > div, .adv .rec, .adv .quote, .adv .fc, .l, .award-text" },
    headings: { name: "Headings", blocks: "h1, h2, h3, h4, .award-name" },
    /* A button's label never wraps, so even breaks leave it alone */
    labels: { name: "Labels and switches", blocks: ":is(label, .lbl, .switch > span:last-child, .quick-field > span):not(.btn *)" },
    pills: { name: "Pills, such as the Council vote", blocks: ".badge" },
    tables: { name: "Table cells", blocks: "td:not(.num)" },
    menus: { name: "Menus and view lists", blocks: ".sideitem > span:not(.count)", style: true },
    tooltips: { name: "Tooltips and popovers", blocks: ".popover div, .popover p, .coach p, .coach div", style: true },
    lists: { name: "The agenda, saves and glossary", blocks: ".aitem .t, .aitem .a, dt, .slot-info > div", style: true },
    /* Any other text: only where a line breaks changes, never whether it may */
    other: { name: "Captions, notifications, the status bar and the rest of the window", blocks: "body *:not(script, style, textarea, select, option, kbd)", style: true }
  };
  var supports = function (v) { return !!(window.CSS && CSS.supports && CSS.supports("text-wrap", v)); };
  var pretty = supports("pretty"), balance = supports("balance");
  /* A kind marked style changes only where a line breaks (text-wrap-style),
     so it counts as native only where the browser knows that property */
  var style = !!(window.CSS && CSS.supports && CSS.supports("text-wrap-style", "pretty"));
  function partOn(k) {
    var st = S.settings;
    return !!st && st.prettyWrap !== false && !(st.wrapParts && st.wrapParts[k] === false);
  }
  /* The kinds the browser cannot do itself, so the engine does them */
  function engineParts() {
    return Object.keys(S.WRAP_PARTS).filter(function (k) { return partOn(k) && !(k === "headings" ? balance : S.WRAP_PARTS[k].style ? style : pretty); });
  }
  function lastText(node) {
    for (var c = node.lastChild; c; c = c.previousSibling) {
      if (c.nodeType === 3) { if (/\S/.test(c.data)) { return c; } }
      else if (c.nodeType === 1 && !/^(BUTTON|INPUT|SELECT|TEXTAREA|KBD)$/.test(c.tagName)) { var t = lastText(c); if (t) { return t; } }
    }
    return null;
  }
  /* The text nodes the engine changed, with their kind, so a kind turned
     off gets its ordinary spaces back */
  var changed = [];
  function fix(block, kind) {
    var t = lastText(block);
    if (!t || t.data.split(/\s+/).filter(Boolean).length < 2) { return; }
    /* A last word of up to 12 letters, with its punctuation, joins the word before it */
    var d = t.data.replace(/ (\S{1,12}\s*)$/, " $1");
    if (d !== t.data) { t.data = d; changed.push([t, kind]); }
  }
  function scan(root, kinds) {
    if (root.nodeType !== 1) { return; }
    kinds.forEach(function (k) {
      var sel = S.WRAP_PARTS[k].blocks;
      if (root.matches(sel)) { fix(root, k); }
      root.querySelectorAll(sel).forEach(function (b) { fix(b, k); });
    });
  }
  /* Called when the settings change: undo what is off, do what is on */
  S.applyWrap = function () {
    var kinds = engineParts();
    changed = changed.filter(function (c) {
      if (!c[0].isConnected) { return false; }
      if (kinds.indexOf(c[1]) >= 0) { return true; }
      c[0].data = c[0].data.replace(/ (\S{1,12}\s*)$/, " $1");
      return false;
    });
    if (kinds.length && document.body) { scan(document.body, kinds); }
  };
  S.prettyWrap = { native: pretty, balance: balance };
  if (!window.MutationObserver) { return; }
  new MutationObserver(function (list) {
    var kinds = engineParts();
    if (!kinds.length) { return; }
    list.forEach(function (m) { m.addedNodes.forEach(function (n) { scan(n, kinds); }); });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
