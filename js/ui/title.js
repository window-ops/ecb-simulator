/* The title screen. At start-up it comes first, before the form for a new
   game, and holds the menu, as in other games: continue the latest game,
   load another save, or start a new game.
   Settings > Appearance > Title screen leaves it plain (the default) or
   dresses it in a theme loosely named after a group of the European
   Parliament: a backdrop whose motif moves in the theme's own way, and a
   line of yellow text at an angle beside the logo that pulses, picked at
   random at each start, as on the title screen of Minecraft. Reduced
   motion stills both, and a switch stills the backdrop alone. A custom
   theme takes its color, backdrop and music from Settings. */
(function () {
  var S = window.ECBSIM, el = S.el, U = S.ui;

  /* A five-pointed star of radius r at (x, y), as an SVG polygon */
  function star(x, y, r, fill) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r;
      pts.push((x + rr * Math.cos(a)).toFixed(2) + "," + (y + rr * Math.sin(a)).toFixed(2));
    }
    return '<polygon points="' + pts.join(" ") + '" fill="' + fill + '"/>';
  }
  /* Twelve stars in a ring, as on the flag of Europe */
  function ring(cx, cy, R, r, fill) {
    var out = "";
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6;
      out += star(cx + R * Math.sin(a), cy - R * Math.cos(a), r, fill);
    }
    return out;
  }
  /* SVG animation inside the tile, so each motif moves in place: a turn
     about (cx, cy), a scale or a skew that swings and returns, an opacity
     that comes and goes. Without motion the tile is still. */
  /* Settings > Appearance > Title screen sets the speed, from a quarter to
     twice the usual; slow stretches every duration */
  var slow = 1;
  function secs(x) { return (x * slow).toFixed(2); }
  function spin(cx, cy, dur, dir) {
    return '<animateTransform attributeName="transform" type="rotate" from="0 ' + cx + " " + cy + '" to="' + (360 * dir) + " " + cx + " " + cy + '" dur="' + secs(dur) + 's" repeatCount="indefinite"/>';
  }
  function swing(type, values, dur, begin) {
    return '<animateTransform attributeName="transform" type="' + type + '" values="' + values + '" dur="' + secs(dur) + 's" begin="' + secs(begin || 0) + 's" repeatCount="indefinite"/>';
  }
  function fade(dur, begin) {
    return '<animate attributeName="opacity" values=".35;1;.35" dur="' + secs(dur) + 's" begin="' + secs(begin) + 's" repeatCount="indefinite"/>';
  }
  /* The tile of each backdrop, 120 by 120, repeated. Each theme moves in
     its own way (t.anim): Popular's rings of stars turn slowly, Renew's
     turn and breathe, the Left's turn the other way and faster, Social's
     roses bloom, Green's leaves sway as they fall, Conservative's tiles
     light in turn, Patriot's banners wave, Sovereign's coins spin. */
  var MOTIFS = {
    ring: function (c, a, anim) {
      var stars = ring(60, 60, 34, 6, c);
      if (!a) { return stars; }
      if (anim === "breathe") {
        return '<g transform="translate(60 60)"><g>' + swing("scale", "0.88;1.05;0.88", 8) + '<g transform="translate(-60 -60)"><g>' + stars + spin(60, 60, 30, 1) + "</g></g></g></g>";
      }
      return "<g>" + stars + spin(60, 60, anim === "back" ? 18 : 48, anim === "back" ? -1 : 1) + "</g>";
    },
    roses: function (c, a) {
      var out = "";
      [[30, 30, 0], [90, 90, 3]].forEach(function (p) {
        var petals = "";
        for (var i = 0; i < 5; i++) {
          var an = i * 2 * Math.PI / 5;
          petals += '<circle cx="' + (8 * Math.cos(an)).toFixed(1) + '" cy="' + (8 * Math.sin(an)).toFixed(1) + '" r="8" fill="' + c + '"/>';
        }
        out += '<g transform="translate(' + p[0] + " " + p[1] + ')"><g>' + (a ? swing("scale", "0.8;1.1;0.8", 6, p[2]) : "") + petals + "</g></g>";
      });
      return out;
    },
    leaves: function (c, a) {
      return '<g><path d="M30 50c0-18 14-30 32-30 0 18-14 30-32 30z" fill="' + c + '"/>' + (a ? swing("rotate", "-18 46 35;18 46 35;-18 46 35", 4) : "") + "</g>" +
        '<g><path d="M78 100c0-16 12-27 28-27 0 16-12 27-28 27z" fill="' + c + '"/>' + (a ? swing("rotate", "16 92 86;-16 92 86;16 92 86", 5, 1) : "") + "</g>" +
        star(95, 30, 5, c) + star(25, 95, 5, c);
    },
    tiles: function (c, a) {
      return [[8, 8, 0], [64, 8, 1.5], [64, 64, 3], [8, 64, 4.5]].map(function (r, i) {
        return '<rect x="' + r[0] + '" y="' + r[1] + '" width="48" height="48" rx="4" fill="' + c + '"' + (a ? ">" + fade(6, r[2]) + "</rect>" : ' opacity="' + (i % 2 ? ".6" : "1") + '"/>');
      }).join("");
    },
    banners: function (c, a) {
      return [[20, 15, 0], [75, 65, 1.2]].map(function (b) {
        return '<g transform="translate(' + b[0] + " " + b[1] + ')"><g>' + (a ? swing("skewX", "-10;10;-10", 2.4, b[2]) : "") + '<path d="M0 0h30v40l-15-10-15 10z" fill="' + c + '"/></g></g>';
      }).join("");
    },
    coins: function (c, a) {
      return [[32, 32, 0, true], [88, 88, 1.5, false]].map(function (k) {
        var mark = k[3] ? '<circle r="6" fill="' + c + '"/>' : '<rect x="-6" y="-6" width="12" height="12" fill="' + c + '"/>';
        return '<g transform="translate(' + k[0] + " " + k[1] + ')"><g>' + (a ? swing("scale", "1 1;0.08 1;1 1", 3, k[2]) : "") + '<circle r="20" fill="none" stroke="' + c + '" stroke-width="4"/>' + mark + "</g></g>";
      }).join("");
    }
  };
  /* The themes: name, the two colors of the backdrop, the motif and its
     color, and the lines the yellow text picks from. Names and lines
     loosely follow each group's program; every theme also draws from the
     shared lines. */
  U.TITLE_THEMES = {
    popular: { name: "Popular", group: "European People's Party", from: "#0b4f9c", to: "#062a55", motif: "ring", anim: "turn", ink: "rgba(255, 255, 255, 0.16)",
      lines: ["Stability first!", "Social market economy!", "Also try subsidiarity!", "Fiscal rules with a human face!", "The center holds!", "Christian democracy edition!"] },
    social: { name: "Social", group: "Socialists and Democrats", from: "#c8102e", to: "#6e0a19", motif: "roses", ink: "rgba(255, 255, 255, 0.14)",
      lines: ["Solidarity included!", "Jobs before deficits!", "Also try the social pillar!", "Fair wages edition!", "Now with collective bargaining!", "Social Europe!"] },
    renew: { name: "Renew", group: "Renew Europe", from: "#1d3f9e", to: "#0d1f55", motif: "ring", anim: "breathe", ink: "rgba(255, 204, 0, 0.32)",
      lines: ["More Europe!", "Ever closer union!", "Also try the single market!", "Erasmus edition!", "Now with fewer borders!", "The status quo, renewed!"] },
    green: { name: "Green", group: "Greens and European Free Alliance", from: "#2f7d32", to: "#173f19", motif: "leaves", anim: "fall", ink: "rgba(255, 255, 255, 0.15)",
      lines: ["Now carbon neutral!", "Also try the Green Deal!", "Powered by wind and sun!", "Climate risk is financial risk!", "Rail edition!", "Greener bonds!"] },
    conservative: { name: "Conservative", group: "European Conservatives and Reformists", from: "#1769a6", to: "#0b3557", motif: "tiles", ink: "rgba(255, 255, 255, 0.1)",
      lines: ["A Europe of nations!", "Reform, not more powers!", "Also try national parliaments!", "Balanced budgets included!", "Subsidiarity edition!", "Common sense edition!"] },
    patriot: { name: "Patriot", group: "Patriots for Europe", from: "#30296e", to: "#16123a", motif: "banners", ink: "rgba(255, 255, 255, 0.13)",
      lines: ["Nations first!", "Borders included!", "Also try a referendum!", "Sovereignty edition!", "Made at home!", "Exit sold separately!"] },
    sovereign: { name: "Sovereign", group: "Europe of Sovereign Nations", from: "#23394d", to: "#101c27", motif: "coins", ink: "rgba(255, 255, 255, 0.13)",
      lines: ["Every nation its own currency!", "National banks first!", "Also try a national currency!", "Own money, own rules!", "Sovereign nations edition!", "Printed at home!"] },
    left: { name: "Left", group: "The Left", from: "#9b1b1f", to: "#4d0b0e", motif: "ring", anim: "back", ink: "rgba(255, 120, 120, 0.3)",
      lines: ["People before banks!", "Another Europe is possible!", "Also try debt relief!", "Public banks edition!", "Austerity not included!", "Now with public ownership!"] }
  };
  U.TITLE_ORDER = ["popular", "social", "renew", "green", "conservative", "patriot", "sovereign", "left"];
  var SHARED = ["Whatever it takes!", "Now in 24 languages!", "Below, but close to, 2%!", "Also try Selk!", "Spreads not included!", "One rate fits all!", "Made in Frankfurt!"];

  function backdrop(t, moving) {
    var grad = "linear-gradient(160deg, " + t.from + ", " + t.to + ")";
    /* Without a motif the first layer stays empty, so the tile size never
       falls on the gradient and cuts it into squares */
    if (!t.motif) { return "none, " + grad; }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' + MOTIFS[t.motif](t.ink, moving, t.anim) + "</svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '"), ' + grad;
  }

  /* A custom theme: the player's color, one of the themes' backdrops or
     none, and the shared lines. The deep color is the chosen one at 45%,
     as each theme's second color is a darker shade of its first */
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    return "#" + [n >> 16, (n >> 8) & 255, n & 255].map(function (c) { return ("0" + Math.round(c * f).toString(16)).slice(-2); }).join("");
  }
  U.customTheme = function () {
    var c = S.settings.titleCustom || {}, color = /^#[0-9a-f]{6}$/i.test(c.color || "") ? c.color : "#3daee9", base = U.TITLE_THEMES[c.backdrop];
    var ink = base ? base.ink : "rgba(255, 255, 255, 0.14)";
    /* A motif color of the player's own keeps the faintness of the borrowed motif */
    if (/^#[0-9a-f]{6}$/i.test(c.ink || "")) {
      var n = parseInt(c.ink.slice(1), 16), alpha = (ink.match(/([\d.]+)\)$/) || [0, "0.14"])[1];
      ink = "rgba(" + [n >> 16, (n >> 8) & 255, n & 255].join(", ") + ", " + alpha + ")";
    }
    return { name: "Custom", from: color, to: shade(color, 0.45), motif: base ? base.motif : null, anim: base ? base.anim : null, ink: ink, lines: [] };
  };
  /* The theme the title screen shows, or none when it is plain */
  U.titleTheme = function () {
    var k = S.settings.titleTheme;
    return k === "custom" ? U.customTheme() : U.TITLE_THEMES[k] || null;
  };
  /* Whether the backdrop moves: Settings > Appearance can still it, and
     reduced motion always does */
  U.titleMoving = function () { return !S.reducedMotion() && S.settings.titleAnimate !== false; };

  /* What the title screen shows. While it stays the same, a redraw (a
     setting changed, a switch checked) leaves the screen in place, so its
     motion and its line of text continue */
  function shownKey() {
    var st = S.settings, saves = S.saves.list().map(function (x) { return x.slot.id + (x.slot.name || "") + x.save.at; });
    return [st.titleTheme, JSON.stringify(st.titleCustom), !!st.titleCard, st.titleSplash !== false, st.titleSpeed || 100, st.evenGrids !== false, S.reducedMotion(), U.titleMoving(), S.bankName().full, saves.join(",")].join("|");
  }
  U.titleFresh = function (page) {
    var n = page.firstChild;
    return !!n && n.classList.contains("title-screen") && n.dataset.key === shownKey();
  };
  /* After Settings > Storage > Delete all game data: the window says so
     and offers a new game, or the title screen */
  U.views.deleted = function (page) {
    var box = el("div", "title-screen deleted"), mid = el("div", "title-mid");
    mid.appendChild(S.icon("delete", "title-logo"));
    mid.appendChild(el("h1", "", S.t("Game data deleted")));
    mid.appendChild(el("p", "", U.deleted === "game" ? S.t("Every save and the achievements are gone from this browser. The settings stay.") : S.t("Every save, the achievements and the settings are gone from this browser.")));
    var menu = el("div", "title-menu");
    var b = S.button(S.t("Start a new game"), { icon: "new", cls: "primary", keyAction: "title.new", press: true, onClick: function () { U.deleted = false; U.title = false; U.render(); } });
    menu.appendChild(b);
    menu.appendChild(S.button(S.t("Back to the title screen"), { icon: "back", keyAction: "title.back", press: true, onClick: function () { U.deleted = false; U.title = true; U.render(); } }));
    mid.appendChild(menu);
    box.appendChild(mid);
    page.appendChild(box);
    setTimeout(function () { if (b.isConnected) { b.focus({ preventScroll: true }); } }, 0);
  };
  U.views.title = function (page) {
    var key = S.settings.titleTheme, t = U.titleTheme(), moving = U.titleMoving();
    slow = 100 / (S.settings.titleSpeed || 100);
    var box = el("div", "title-screen" + (t ? " themed t-" + key : ""));
    box.dataset.key = shownKey();
    if (t) {
      box.style.setProperty("--t-from", t.from); box.style.setProperty("--t-to", t.to); box.style.setProperty("--t-slow", slow);
      var pan = el("div", "title-pan" + (t.anim === "fall" ? " fall" : "") + (moving ? "" : " still")); pan.setAttribute("aria-hidden", "true");
      pan.style.backgroundImage = backdrop(t, moving);
      box.appendChild(pan);
      /* With Settings > Appearance > Rows of cards filled, the backdrop's
         tiles fill the screen as cards fill a row: a whole number across
         and down, each about 120px, so no tile is cut at an edge */
      if (S.settings.evenGrids !== false && window.ResizeObserver) {
        new ResizeObserver(function () {
          var w = pan.clientWidth, h = pan.clientHeight;
          if (!w || !h) { return; }
          var tw = w / Math.max(1, Math.round(w / 120)), th = h / Math.max(1, Math.round(h / 120));
          pan.style.backgroundSize = tw.toFixed(2) + "px " + th.toFixed(2) + "px, cover";
          pan.style.setProperty("--tile-h", th.toFixed(2) + "px");
        }).observe(pan);
      }
    }
    /* Settings > Appearance can set the name and the menu on a card, apart from the backdrop */
    var mid = el("div", "title-mid" + (S.settings.titleCard ? " card" : ""));
    var badge = el("div", "title-badge");
    badge.appendChild(S.logo("title-logo"));
    if (t && S.settings.titleSplash !== false) {
      var pool = t.lines.concat(SHARED);
      var sp = el("span", "splash", S.t(pool[Math.floor(Math.random() * pool.length)]));
      sp.setAttribute("aria-hidden", "true");
      badge.appendChild(sp);
    }
    mid.appendChild(badge);
    var name = el("div", "title-name");
    name.appendChild(el("h1", "", S.t("{a} Simulator", { a: S.bankName().acr })));
    mid.appendChild(name);
    mid.appendChild(el("p", "", S.bankName().full));
    /* The menu, as in most games: continue the latest save, load another,
       or start a new game */
    var menu = el("div", "title-menu"), first = null, saves = S.saves.list();
    if (saves.length) {
      var last = saves[0];
      first = S.button(S.t("Continue: {p}, {y}", { p: last.save.president, y: last.save.year }), { icon: "next", cls: "primary", keyAction: "title.continue", press: true, onClick: function () { U.loadGame(last.save.game, last.slot); } });
      first.title = S.t("{n} {id}, saved {d}", { n: S.saves.title(last.slot), id: S.saves.label(last.slot), d: U.saveDate(last.save.at) });
      menu.appendChild(first);
    }
    /* Show Load as soon as there is at least one save (not only when there are two) */
    if (saves.length) { menu.appendChild(S.button(S.t("Load a game"), { icon: "open", keyAction: "title.load", press: true, onClick: function () { U.savesDialog("load"); } })); }
    /* Without a save, starting a game is the first choice */
    var fresh = S.button(S.t("Start a new game"), { icon: "new", cls: first ? "" : "primary", keyAction: "title.new", press: true, onClick: function () { U.title = false; U.render(); } });
    menu.appendChild(fresh);
    menu.appendChild(S.button(S.t("Achievements"), { icon: "achievements", keyAction: "title.achievements", press: true, onClick: function () { U.achievementsDialog(); } }));
    mid.appendChild(menu);
    box.appendChild(mid);
    /* No button takes the focus by itself, so the page shows none until
       the player clicks or presses a key, as the Not focused pill says */
    page.appendChild(box);
  };
})();
