/* The guided first year: a few coach marks over the parts of the window.
   Each can be skipped; the tour can be reopened from Help. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui;
  var STEPS = [
    { sel: "#indicators", title: "Indicators", text: "Last year's figures for the euro area. Click any of them for its definition and source. The far-right share appears here when it becomes a concern." },
    { sel: "[data-tour=item0]", title: "The agenda", text: "Each year brings 3 to 6 items. The first is always the rate decision. Items from the record say what the historical bank did." },
    { sel: "[data-tour=card]", title: "An item", text: "Read the situation, then choose an option. Underlined terms open the glossary. Tags show Draghi measures, the Troika and the historical choice." },
    { sel: "[data-tour=options]", title: "Options and the Council", text: "Options marked \"Council vote\" go to the Governing Council. The badge shows the expected count; the Council can reject you. Options the treaties forbid show the article." },
    { sel: "[data-tour=advice]", title: "Advisors", text: "Your three advisors recommend an option and forecast its effect with their school's own model. Compare them; none of them is always right." },
    { sel: "[data-tour=initiatives]", title: "Initiatives", text: "Hearings, persuasion, speeches, proposals to governments and treaty campaigns. Proposals adopted by governments raise the backstop, which lowers spreads without bond purchases." },
    { sel: "#status-backstop, #side-backstop", title: "The backstop", text: "Backstop: the support the euro area promises its weakest members, from 0 to 100%. Higher is better. It rises with the bank's tools, the common funds and the proposals governments adopt. When it is high, investors stop expecting a state to leave the euro, and that state's borrowing costs fall without the bank buying its bonds." },
    { sel: "#end-year", title: "End the year", text: "When every item is decided, end the year. The model runs, events and elections follow, and the year report opens." }
  ];
  U.tour = function () {
    if (!S.G) { return; }
    U.view = "agenda"; U.render();
    var i = 0, hole = el("div", "coach-hole"), box = el("div", "coach");
    box.setAttribute("role", "dialog"); box.setAttribute("aria-live", "polite");
    document.body.appendChild(hole); document.body.appendChild(box);
    /* While the tour runs the page stays still, so the marked part stays
       under its mark; the tour itself scrolls each part into view */
    document.documentElement.classList.add("touring");
    function still(e) { if (!box.contains(e.target)) { e.preventDefault(); } }
    document.addEventListener("wheel", still, { passive: false });
    document.addEventListener("touchmove", still, { passive: false });
    function end() {
      document.documentElement.classList.remove("touring");
      document.removeEventListener("wheel", still);
      document.removeEventListener("touchmove", still);
      if (hole.parentNode) { hole.parentNode.removeChild(hole); }
      if (box.parentNode) { box.parentNode.removeChild(box); }
      S.settings.tourDone = true; S.saveSettings();
      var pg = S.ui.scroller(); if (pg) { pg.scrollTop = 0; }
      window.removeEventListener("resize", place);
    }
    function place() {
      /* A step can name places for phone and desktop; the visible one is used */
      var st = STEPS[i], t = [].filter.call(document.querySelectorAll(st.sel), function (e) { return e.getClientRects().length; })[0];
      if (!t || !t.getClientRects().length) { hole.style.display = "none"; box.style.left = "16px"; box.style.top = "80px"; return; }
      t.scrollIntoView({ block: "nearest" });
      var r = t.getBoundingClientRect();
      hole.style.display = "";
      hole.style.left = (r.left - 4) + "px"; hole.style.top = (r.top - 4) + "px";
      hole.style.width = (r.width + 8) + "px"; hole.style.height = Math.min(r.height + 8, window.innerHeight - r.top) + "px";
      var bw = Math.min(340, window.innerWidth - 32), x = Math.min(Math.max(16, r.left), window.innerWidth - bw - 16);
      /* Below the part when the box fits there, else above it, else as low
         as the window allows; a box taller than the window scrolls, so its
         buttons stay in reach */
      var bh = box.offsetHeight, y = r.bottom + 12;
      if (y + bh > window.innerHeight - 8) { y = r.top - bh - 12 >= 8 ? r.top - bh - 12 : Math.max(8, window.innerHeight - bh - 8); }
      box.style.left = x + "px"; box.style.top = y + "px";
    }
    function draw() {
      S.clear(box);
      var st = STEPS[i];
      box.appendChild(el("h4", "", S.t(st.title) + " (" + (i + 1) + "/" + STEPS.length + ")"));
      S.levelHeadings();
      box.appendChild(el("div", "", S.t(st.text)));
      var f = el("div", "foot");
      f.appendChild(S.button(S.t("Skip the tour"), { cls: "flat", onClick: end }));
      if (i > 0) { f.appendChild(S.button(S.t("Back"), { onClick: function () { i--; draw(); } })); }
      f.appendChild(S.button(i === STEPS.length - 1 ? S.t("Done") : S.t("Next"), { cls: "primary", onClick: function () {
        if (i === STEPS.length - 1) { end(); return; } i++; draw();
      } }));
      box.appendChild(f);
      place();
      var nb = box.querySelector(".btn.primary"); if (nb) { nb.focus(); }
    }
    window.addEventListener("resize", place);
    draw();
  };
})();
