/* The agenda: the year's items on the left, the open item on the right with
   its options, the advisors' advice and forecasts, the expected Council vote,
   and below them the year's initiatives. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui, Gm = S.game, K = S.council;
  /* The labels on an option; Settings > Game > Troika and Draghi measures hide the first two */
  var TAGS = {
    draghi: ["Draghi measure", "draghi"], troika: ["Troika", "troika"],
    /* Shown only when Settings > Debug asks for it */
    intended: ["Intended path", "intended"]
  };
  var fcCache = {};
  /* While the Council's vote is shown, Enter waits for it to end */
  var voting = false;

  /* While debug is on, a bar above the agenda holds the actions used most:
     decide every item, end the year, play to a year (the keys D, Y and P);
     the debug panel keeps the rest */
  function debugBar(G) {
    var bar = el("div", "dbg-bar");
    bar.setAttribute("role", "toolbar"); bar.setAttribute("aria-label", S.t("Debug"));
    bar.appendChild(el("span", "dbg-bar-tag", S.t("Debug")));
    bar.appendChild(S.debugTimeControls(G, "bar"));
    return bar;
  }

  U.views.agenda = function (page, G) {
    var head = el("div", "page-head");
    head.appendChild(el("h1", "", Gm.closed(G) ? (G.over ? S.t("The run ended in {y}", { y: G.over.year }) : S.t("The period ended in {y}", { y: Gm.shownYear(G) })) : S.t("Agenda for {y}", { y: G.year })));
    var left = G.agenda.filter(function (e) { return !e.done; }).length;
    if (!Gm.closed(G)) { head.appendChild(el("span", "dim", left ? S.t("{n} of {m} items to decide", { n: left, m: G.agenda.length }) : S.t("Every item is decided. End the year when ready."))); }
    page.appendChild(head);
    if (G.over || G.finished) {
      var p = el("div", "result");
      p.appendChild(el("p", "", G.over ? Gm.OVER[G.over.reason] : S.t("This period has ended.")));
      p.appendChild(el("p", "dim small", S.t("Review mode: you can look through the run; nothing can be changed.")));
      p.appendChild(U.endingButton());
      page.appendChild(p);
      return;
    }
    if (S.debugBarOn && S.debugBarOn()) { page.appendChild(debugBar(G)); }
    if (U.cardIndex >= G.agenda.length) { U.cardIndex = 0; }
    if (U.ratePillFor != null && U.ratePillFor !== U.cardIndex) { U.ratePillFor = null; }
    var wrap = el("div", "agenda");
    var list = el("div", "agenda-list"); list.setAttribute("role", "group"); list.setAttribute("aria-label", S.t("Items on the agenda"));
    G.agenda.forEach(function (e, i) {
      var c = Gm.card(G, e);
      var b = el("button", "aitem" + (e.done ? (e.result === "rejected" ? " rejected done" : " done") : ""));
      b.type = "button";
      b.dataset.tour = "item" + i;
      /* A decided item shows Breeze's apply mark, a rejected one its cancel mark */
      var stn = el("span", "st"); stn.appendChild(e.done ? S.icon(e.result === "rejected" ? "cancel" : "done", "s16") : document.createTextNode(String(i + 1)));
      if (e.done) { stn.setAttribute("aria-label", e.result === "rejected" ? S.t("Rejected") : S.t("Decided")); }
      b.appendChild(stn);
      var tx = el("span");
      tx.appendChild(el("div", "t", c.title));
      tx.appendChild(el("div", "a", c.date + " · " + c.actor));
      b.appendChild(tx);
      if (i === U.cardIndex) { b.setAttribute("aria-current", "true"); }
      b.addEventListener("click", function () { if (U.busy()) { return; } U.cardIndex = i; U.fromStrip = true; S.sound.play("select"); U.render(); });
      list.appendChild(b);
    });
    wrap.appendChild(list);
    var right = el("div", "card");
    right.dataset.tour = "card";
    var notes = renderCard(right, G, U.cardIndex);
    wrap.appendChild(right);
    page.appendChild(wrap);
    /* A thin line sets the year's initiatives apart from the agenda */
    page.appendChild(el("hr", "divider"));
    page.appendChild(initiatives(G));
    /* The card's notes close the page */
    page.appendChild(notes.el);
  };

  function renderCard(box, G, idx) {
    var entry = G.agenda[idx], card = Gm.card(G, entry);
    var meta = el("div", "meta");
    meta.appendChild(el("span", "", card.date));
    meta.appendChild(el("span", "", "·"));
    meta.appendChild(el("span", "", card.actor));
    box.appendChild(meta);
    var h = el("h2", "", card.title);
    /* The rate item shows the main rate as a small pill in its title: the
       current rate while it is open, the rate set for the year once decided.
       In 2008 the rate set waits until the item is opened again, so it is
       not on the same screen as the decision just taken */
    var pillRate = null, pillLabel = "";
    if (entry.done && entry.rate && (G.year !== 2008 || U.ratePillFor !== idx)) {
      pillRate = entry.rate.to; pillLabel = S.t("Main rate set at {r}%", { r: pillRate.toFixed(2) });
    } else if (!entry.done && entry.id === "rate") {
      pillRate = G.pol.rate; pillLabel = S.t("Main rate now {r}%", { r: pillRate.toFixed(2) });
    }
    if (pillRate != null) {
      var pill = el("span", "badge rate-pill", pillRate.toFixed(2) + "%");
      pill.setAttribute("aria-label", pillLabel);
      h.appendChild(document.createTextNode(" ")); h.appendChild(pill);
    }
    box.appendChild(h);
    /* Footnotes: each of the card's notes takes its number at the first
       phrase it explains; a note that finds no phrase is numbered at the end
       of the text. Settings > Motion and text can turn them off */
    var notes = S.notesBox(), ids = S.settings.footnotes === false ? [] : (S.CARD_NOTES[entry.id] || []);
    var txt = el("div", "text");
    S.linkify(card.text, txt, { notes: notes, anchors: ids });
    box.appendChild(txt);
    /* Settings > Game can hide the record, which makes the game harder */
    if (card.history && !S.game.hides(S.G, "history")) {
      var hb = el("div", "histbox"), ht = el("div");
      hb.setAttribute("role", "note");
      hb.appendChild(S.icon("info"));
      ht.appendChild(el("b", "", S.t("In history") + ": "));
      S.linkify(card.history, ht, { notes: notes, anchors: ids });
      hb.appendChild(ht);
      box.appendChild(hb);
    }
    ids.forEach(function (id) {
      if (S.NOTES[id] && !notes.placed(id)) { txt.appendChild(notes.ref(id)); notes.markPlaced(id); }
    });
    if (entry.done) { box.appendChild(resultBox(G, entry, card)); return notes; }
    var sel = U.sel[idx];
    if (sel == null || !card.options[sel] || card.options[sel].disabled) {
      sel = null;
    }
    var opts = el("div", "options"); opts.setAttribute("role", "radiogroup"); opts.setAttribute("aria-label", S.t("Options"));
    opts.dataset.tour = "options";
    card.options.forEach(function (o, i) {
      /* The option is a card; its letter is the radio button, so the
         glossary buttons in its text sit beside the radio, not inside it */
      var b = el("div", "opt" + (sel === i ? " checked" : "") + (o.disabled ? " disabled" : ""));
      var letter = String.fromCharCode(65 + i), bodyId = "opt-" + idx + "-" + i;
      var r = el("button", "letter", letter); r.type = "button"; r.setAttribute("role", "radio"); r.dataset.opt = i;
      r.setAttribute("aria-checked", sel === i ? "true" : "false");
      r.setAttribute("aria-label", letter + ": " + o.label);
      r.setAttribute("aria-describedby", bodyId);
      if (o.disabled) { r.disabled = true; r.setAttribute("aria-disabled", "true"); }
      b.appendChild(r);
      var body = el("span", "body"); body.id = bodyId;
      body.appendChild(el("span", "l", o.label));
      if (o.text) { var x = el("span", "x"); S.linkify(o.text, x); body.appendChild(x); }
      var tags = el("span", "tags");
      /* Settings > Game can hide the Troika label and the Draghi label, each on its own, as it hides the expected vote */
      (o.tags || []).forEach(function (t) { if (TAGS[t] && (t === "intended" ? S.debugMode() && S.settings.debugIntended : !(t === "troika" ? S.game.hides(S.G, "troika") : S.game.hides(S.G, "draghi")))) { tags.appendChild(el("span", "badge " + TAGS[t][1], S.t(TAGS[t][0]))); } });
      if (o.hist && !S.game.hides(S.G, "history")) { tags.appendChild(el("span", "badge hist", S.t("Historical choice"))); }
      if (o.vote) {
        var rule = o.rule === "twothirds" ? S.t("an objection needs two thirds") : o.rule === "restrict" ? S.t("needs two thirds") : S.t("simple majority");
        if (S.game.hides(S.G, "votes")) { tags.appendChild(el("span", "badge vote", S.t("Council vote ({r})", { r: rule }))); }
        else {
          var pv = K.preview(G, o);
          tags.appendChild(el("span", "badge vote", S.t("Council vote: about {y} for, {n} against ({r})", { y: pv.yes, n: pv.no, r: rule })));
        }
      }
      if (tags.childNodes.length) { body.appendChild(tags); }
      if (o.disabled) {
        var law = el("span", "law"); law.appendChild(S.icon("error", "s16")); law.appendChild(document.createTextNode(o.disabled)); body.appendChild(law);
      }
      b.appendChild(body);
      /* After the redraw the chosen radio keeps the focus, for keyboard and screen reader users */
      if (!o.disabled) { b.addEventListener("click", function () {
        if (U.busy()) { return; }
        U.sel[idx] = i; S.sound.play("select"); U.render();
        var f = document.querySelector('.options .letter[data-opt="' + i + '"]'); if (f) { f.focus({ preventScroll: true }); }
      }); }
      opts.appendChild(b);
    });
    box.appendChild(opts);
    box.appendChild(adviceBox(G, card, idx, sel));
    var row = el("div", "decide-row");
    var dec = S.button(S.t("Decide"), { cls: "primary", icon: "ok", keyAction: "agenda.decide", onClick: function () { decide(G, idx, sel); } });
    dec.dataset.tour = "decide";
    if (sel == null) { dec.disabled = true; }
    row.appendChild(dec);
    /* Before a choice the option keys show as key caps, as Decide shows
       Enter, while Settings > Keyboard > Hints shows keys beside buttons */
    if (sel == null && (S.kbdLevel() === "all" || S.kbdLevel() === "main") && S.keyOn("agenda")) {
      var keys = el("span", "dim small keys-only opt-keys");
      keys.appendChild(document.createTextNode(S.t("Choose an option:") + " "));
      keys.appendChild(S.kbd("1"));
      if (card.options.length > 1) {
        keys.appendChild(document.createTextNode(" " + S.t("to") + " "));
        keys.appendChild(S.kbd(String(Math.min(9, card.options.length))));
      }
      row.appendChild(keys);
    }
    box.appendChild(row);
    return notes;
  }

  /* The advisors' section can be collapsed; the choice holds for every card */
  function adviceBox(G, card, idx, sel) {
    var wrap = el("section", "advice-wrap"); wrap.dataset.tour = "advice";
    var h = el("h3", "advice-head", S.t("Advisors"));
    /* Hide and Show work as the notes' button does: in place, with the
       sounds of folding and unfolding, the choice kept for every card */
    var tg = S.button("", { cls: "small", onClick: function () { setHidden(!U.adviceHidden); S.sound.play(U.adviceHidden ? "fold" : "unfold"); } });
    function setHidden(v) {
      U.adviceHidden = v; box.hidden = v;
      tg.textContent = v ? S.t("Show") : S.t("Hide");
      tg.setAttribute("aria-expanded", v ? "false" : "true");
    }
    tg.classList.remove("icon-only");
    h.appendChild(tg);
    wrap.appendChild(h);
    var box = el("div", "advice");
    setHidden(!!U.adviceHidden);
    wrap.appendChild(box);
    var focus = card.focus && S.COUNTRY[card.focus] ? card.focus : null;
    G.advisors.forEach(function (id) {
      var a = S.ADVISORS[id], rec = S.advise.recommend(G, id, card);
      var d = el("div", "adv");
      var who = el("div", "who");
      who.appendChild(el("span", "avatar", S.initials(a.name)));
      var nm = el("div"); nm.appendChild(el("div", "", a.name)); nm.appendChild(el("div", "dim small", S.t(a.school))); who.appendChild(nm);
      d.appendChild(who);
      if (rec.index >= 0) {
        d.appendChild(el("div", "rec", S.t("Recommends {l}: {t}", { l: String.fromCharCode(65 + rec.index), t: card.options[rec.index].label })));
        d.appendChild(el("div", "quote", "\"" + rec.line + "\""));
      }
      var show = sel != null ? sel : rec.index;
      if (show >= 0 && !S.game.hides(S.G, "forecasts")) {
        var key = G.year + ":" + idx + ":" + show + ":" + id + ":" + G.log.length;
        var f = fcCache[key] || (fcCache[key] = S.advise.forecast(G, id, card, show));
        if (f) {
          var parts = [S.t("unemployment {v}%", { v: S.fmt(f.u) }), S.t("inflation {v}%", { v: S.fmt(f.p) })];
          if (f.focus && f.fs != null && G.year < 2041) { parts.push(S.t("{c} spread {v}", { c: S.COUNTRY[f.focus].name, v: S.fmt(f.fs) })); }
          d.appendChild(el("div", "fc", S.t("Forecast if {l}, {y}: ", { l: String.fromCharCode(65 + show), y: G.year }) + parts.join(", ") + "."));
        }
      }
      box.appendChild(d);
    });
    return wrap;
  }

  /* The rate set for the year and its change: "Set at 2.25%, up 0.25 points" */
  U.rateSet = function (r) {
    var d = Math.round((r.to - r.from) * 100) / 100;
    return d === 0 ? S.t("Set at {r}%, unchanged", { r: r.to.toFixed(2) }) :
      S.t(d > 0 ? "Set at {r}%, up {d} points" : "Set at {r}%, down {d} points", { r: r.to.toFixed(2), d: Math.abs(d).toFixed(2) });
  };
  function resultBox(G, entry, card) {
    var box = el("div", "result");
    /* The decision as taken (js/model/game.js), or, for an older save, the option at its index */
    var o = card.options[entry.choice], label = entry.label || (o ? o.label : "");
    box.appendChild(el("p", "", S.t("Decision: {l}", { l: label })));
    if (entry.rate) { box.appendChild(el("p", "", S.t("The main rate: {s}.", { s: U.rateSet(entry.rate).toLowerCase() }))); }
    if (entry.vote) {
      box.appendChild(voteDots(G, entry.vote, false));
      box.appendChild(el("p", entry.vote.passed ? "good" : "bad", (entry.vote.passed ? S.t("Passed") : S.t("Rejected")) + ": " +
        S.t("{y} for, {n} against", { y: entry.vote.yes, n: entry.vote.no })));
    }
    var next = G.agenda.findIndex(function (e) { return !e.done; });
    var row = el("div", "decide-row");
    if (next >= 0) { row.appendChild(S.button(S.t("Next item"), { icon: "next", cls: "primary", keyAction: "agenda.decide", onClick: function () { U.cardIndex = next; U.render(); } })); }
    else { row.appendChild(S.button(S.t("End year"), { icon: "skip", cls: "primary", onClick: function () { U.endYear(); } })); }
    box.appendChild(row);
    return box;
  }

  function voteDots(G, vote, animate, done) {
    /* One label tells the result; the dots are for the eye */
    var yes = 1 + vote.list.filter(function (v) { return v[1]; }).length, no = vote.list.length + 1 - yes;
    var wrap = el("div", "vote"); wrap.setAttribute("role", "img");
    wrap.setAttribute("aria-label", S.t("Council vote: {y} for, {n} against", { y: yes, n: no }));
    var byId = {};
    G.council.forEach(function (m) { byId[m.id] = m; });
    /* Each dot's tooltip names the member, the post and the member state */
    function where(code) { return S.COUNTRY[code] ? S.COUNTRY[code].name : code; }
    function boardMark(role) {
      if (role === "Vice-President") { return "EB-VP"; }
      if (role === "Chief Economist") { return "EB-CE"; }
      if (role === "Member, markets") { return "EB-MM"; }
      if (role === "Member, supervision") { return "EB-MS"; }
      if (role === "Member, payments") { return "EB-MP"; }
      return "EB";
    }
    function boardRole(role) {
      if (role === "Member, markets") { return S.t("Member (markets)"); }
      if (role === "Member, supervision") { return S.t("Member (supervision)"); }
      if (role === "Member, payments") { return S.t("Member (payments)"); }
      return role;
    }
    var pres = el("span", "dot yes pres", "P");
    pres.title = S.t("{n}, President of the bank ({c}): for", { n: G.president.name, c: where(G.president.country) });
    var dots = [pres];
    vote.list.forEach(function (v) {
      var m = byId[v[0]];
      var d = el("span", "dot " + (v[1] ? "yes" : "no") + (m && m.board ? " board" : ""), m ? (m.board ? boardMark(m.role) : m.country) : "?");
      d.title = (m ? m.name + ", " + (m.board ? S.t("{r}, Executive Board", { r: boardRole(m.role) }) : m.role) + " (" + where(m.country) + ")" : "") + ": " + (v[1] ? S.t("for") : S.t("against"));
      dots.push(d);
    });
    if (!animate) { dots.forEach(function (d) { wrap.appendChild(d); }); return wrap; }
    /* Essential animation: the votes appear one by one */
    var i = 0;
    (function next() {
      if (i >= dots.length) { if (done) { done(); } return; }
      var d = dots[i++]; d.classList.add("cast"); wrap.appendChild(d);
      S.sound.play(d.classList.contains("yes") ? "yes" : "no");
      setTimeout(next, S.fast ? 10 : 70);
    })();
    return wrap;
  }

  function decide(G, idx, sel) {
    if (sel == null || U.busy() || Gm.closed(G)) { return; }
    var card = Gm.card(G, G.agenda[idx]);
    var vote = Gm.decide(G, idx, sel);
    fcCache = {};
    S.emit("decide", { year: G.year, card: card.id, option: card.options[sel].label, vote: vote ? { yes: vote.yes, no: vote.no, passed: vote.passed } : null });
    if (!vote) { S.sound.play("click"); U.announce(S.t("Decided: {l}", { l: card.options[sel].label })); afterDecide(G); return; }
    /* Show the vote before redrawing */
    var holder = document.querySelector("[data-tour=card]");
    var box = el("div", "result");
    box.appendChild(el("p", "", S.t("The Governing Council votes on: {l}", { l: card.options[sel].label })));
    voting = U.voting = true;
    box.appendChild(voteDots(G, G.agenda[idx].vote, true, function () {
      S.sound.play("gavel");
      U.announce(vote.passed ? S.t("The Council passed it: {y} for, {n} against.", { y: vote.yes, n: vote.no }) : S.t("The Council rejected it: {y} for, {n} against.", { y: vote.yes, n: vote.no }));
      setTimeout(function () {
        voting = U.voting = false;
        if (!vote.passed) { U.toast(S.t("The Governing Council rejected the proposal."), "warn"); }
        afterDecide(G);
      }, S.fast ? 50 : 450);
    }));
    if (holder) {
      var opts = holder.querySelector(".options"), adv = holder.querySelector(".advice-wrap"), row = holder.querySelector(".decide-row");
      [opts, adv, row].forEach(function (n) { if (n) { n.remove(); } });
      holder.appendChild(box);
    } else { afterDecide(G); }
  }
  function afterDecide(G) {
    var next = G.agenda.findIndex(function (e) { return !e.done; });
    S.saves.write("auto", G);
    U.toCard = true;
    if (G.year === 2008) { U.ratePillFor = U.cardIndex; }
    U.render();
    if (next < 0) { U.toast(S.t("Every item is decided. Use your initiatives, then end the year."), "good"); }
  }

  /* ---------- Initiatives ---------- */
  function initiatives(G) {
    var box = el("section", "group section initiatives"); box.dataset.tour = "initiatives";
    var h = el("h3", "", S.t("Initiatives: {n} left this year", { n: G.initiatives }));
    box.appendChild(h);
    box.appendChild(el("p", "dim small", S.t("Each year leaves time for one to three initiatives; a busy agenda leaves fewer.")));
    var none = G.initiatives <= 0;
    function row(label, info, controls) {
      var r = el("div", "init-row");
      controls.forEach(function (c) { r.appendChild(c); });
      var i = el("button", "btn flat icon-only info"); i.type = "button"; i.appendChild(S.icon("hint")); i.setAttribute("aria-label", S.t("About: {l}", { l: label }));
      i.addEventListener("click", function () { S.popover(i, label, info); });
      r.appendChild(i);
      box.appendChild(r);
    }
    function act(kind, arg) {
      if (U.busy()) { return; }
      if (Gm.initiative(G, kind, arg)) { S.emit("initiative", { kind: kind, arg: arg }); S.sound.play("good"); U.toast(G.log[G.log.length - 1].t, "good"); S.saves.write("auto", G); }
      else { S.sound.play("alert"); U.toast(S.t("That initiative is not available now."), "warn"); }
      U.render();
    }
    var I = Gm.INITIATIVES;
    row(I.hearing.name, I.hearing.text, [S.button(G.parl ? S.t("Report to the Federal Parliament") : S.t(I.hearing.name), { icon: "parliament", disabled: none, onClick: function () { act("hearing"); } })]);
    var bloc = el("select"); bloc.setAttribute("aria-label", S.t("Bloc"));
    Object.keys(K.BLOCS).forEach(function (k) { var o = el("option", "", S.t(K.BLOCS[k])); o.value = k; bloc.appendChild(o); });
    row(I.persuade.name, I.persuade.text, [bloc, S.button(S.t("Persuade"), { icon: "council", disabled: none, onClick: function () { act("persuade", bloc.value); } })]);
    var sp = el("select"); sp.setAttribute("aria-label", S.t("Speech"));
    [["guidance", S.t("Forward guidance")], ["austerity", S.t("Against cuts in a recession")]].forEach(function (x) { var o = el("option", "", x[1]); o.value = x[0]; sp.appendChild(o); });
    row(I.speech.name, I.speech.text, [sp, S.button(S.t("Give the speech"), { icon: "speech", disabled: none, onClick: function () { act("speech", sp.value); } })]);
    var pr = el("select"); pr.setAttribute("aria-label", S.t("Proposal"));
    Object.keys(S.PROPOSALS).forEach(function (k) {
      var p = G.proposals[k], d = S.PROPOSALS[k];
      if (p.passed || G.year < d.from) { return; }
      var o = el("option", "", d.name + " (" + Math.round(p.support) + "%)"); o.value = k; pr.appendChild(o);
    });
    if (pr.options.length) {
      row(I.push.name, I.push.text, [pr, S.button(S.t("Pressure"), { icon: "proposals", disabled: none, onClick: function () { act("push", pr.value); } })]);
    }
    if (G.year < 2041) {
      var tg = el("select"); tg.setAttribute("aria-label", S.t("Treaty goal"));
      if (G.treaty.goal) {
        var o2 = el("option", "", S.TREATY_GOALS[G.treaty.goal].name + " · " + S.t(S.TREATY_STAGES[G.treaty.stage])); o2.value = G.treaty.goal; tg.appendChild(o2);
      } else {
        Object.keys(S.TREATY_GOALS).forEach(function (k) {
          if (G.treaty.done.indexOf(k) >= 0) { return; }
          var o3 = el("option", "", S.TREATY_GOALS[k].name); o3.value = k; tg.appendChild(o3);
        });
      }
      if (tg.options.length) {
        row(I.treaty.name, I.treaty.text, [tg, S.button(G.treaty.goal ? S.t("Advance") : S.t("Start"), { icon: "treaty", disabled: none, onClick: function () { act("treaty", tg.value); } })]);
      }
    }
    return box;
  }

  U.agendaKey = function (e) {
    var G = S.G, idx = U.cardIndex, entry = G.agenda[idx];
    if (!entry) { return; }
    if (/^[1-9]$/.test(e.key) && !entry.done) {
      var i = Number(e.key) - 1, c = Gm.card(G, entry);
      if (c.options[i] && !c.options[i].disabled) { U.sel[idx] = i; S.sound.play("select"); U.render(); }
    } else if (S.keyIs(e, "agenda.decide") && !entry.done && U.sel[idx] != null && document.activeElement && !/BUTTON/.test(document.activeElement.tagName)) {
      decide(G, idx, U.sel[idx]);
    } else if (S.keyIs(e, "agenda.decide") && entry.done && !voting && !e.repeat && document.activeElement && !/BUTTON/.test(document.activeElement.tagName)) {
      /* On a decided item Enter moves on, as the Next item button does;
         the last item leaves ending the year to E or the button */
      var after = G.agenda.findIndex(function (x) { return !x.done; });
      if (after >= 0) { U.cardIndex = after; S.sound.play("select"); U.render(); }
    } else if (S.keyIs(e, "agenda.next")) {
      var next = G.agenda.findIndex(function (x, j) { return !x.done && j !== idx; });
      if (next >= 0) { U.cardIndex = next; U.render(); }
    } else if ((S.keyIs(e, "agenda.prev") || S.keyIs(e, "agenda.after")) && !voting) {
      /* The item before or after, decided or not, as in the agenda's strip */
      var to = idx + (S.keyIs(e, "agenda.after") ? 1 : -1);
      if (to >= 0 && to < G.agenda.length) { e.preventDefault(); U.cardIndex = to; U.toCard = true; S.sound.play("select"); U.render(); }
    }
  };
})();
