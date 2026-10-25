/* The Governing Council: the six members of the Executive Board, the
   president among them, and the governor of each member's central bank.

   Every member is fictional. Each has a stance (h, from -1 for a dove to 1
   for a hawk), a legal caution (c, 0 to 1, resistance to new instruments)
   and a relation with the president (-100 to 100). Stances follow the
   record of each national bank; names change with each 8-year term.

   Voting (ECB Statute, Art. 10.2): simple majority; when the votes for and
   against are equal, the president's vote decides. Restricting emergency liquidity needs two thirds of the
   votes cast (Art. 14.4). From 2015, when the governors exceed 18, they vote
   by rotation: the five largest economies share 4 votes and the others 11;
   above 22 governors there are three groups (5 with 4 votes, half of the
   rest with 8, the others with 3). The Executive Board always votes. */
(function () {
  var S = window.ECBSIM, K = S.council = {};
  var STANCE = {
    DE: [0.9, 0.9], NL: [0.7, 0.7], AT: [0.6, 0.6], FI: [0.5, 0.6], LU: [0.4, 0.6], BE: [0.1, 0.5], FR: [0.0, 0.5],
    IT: [-0.5, 0.3], ES: [-0.4, 0.4], PT: [-0.6, 0.3], GR: [-0.8, 0.3], IE: [-0.3, 0.4], CY: [-0.5, 0.3], MT: [-0.1, 0.5],
    SI: [0.1, 0.5], SK: [0.4, 0.6], EE: [0.5, 0.6], LV: [0.5, 0.6], LT: [0.4, 0.6], HR: [-0.1, 0.5], BG: [0.0, 0.6],
    PL: [0.3, 0.6], SE: [0.3, 0.5], DK: [0.4, 0.6], CZ: [0.5, 0.6], RO: [-0.2, 0.5], HU: [0.0, 0.5]
  };

  K.STANCE = STANCE;
  /* A member's gender comes with the data (js/data/people.js) */
  K.isWoman = function (m) { return (m.gender || genderOf(m.name)) === "f"; };
  function genderOf(name) {
    var g = null;
    Object.keys(S.GOVERNORS).forEach(function (k) { S.GOVERNORS[k].forEach(function (p) { if (p[0] === name) { g = p[1]; } }); });
    S.BOARD.forEach(function (b) { b.slice(1).forEach(function (p) { if (p[0] === name) { g = p[4]; } }); });
    return g;
  }
  K.women = function (G) { return (G.council || []).filter(K.isWoman).length; };

  /* A council for the given term index (0 for 2008 to 2015, and so on) */
  K.build = function (G) {
    var term = Math.min(2, Math.floor((G.year - 2008) / 8) % 3), list = [];
    S.BOARD.forEach(function (b, i) {
      var p = b[1 + ((term + i) % 3)];
      list.push({ id: "eb" + i, name: p[0], country: p[1], role: b[0], h: p[2], c: p[3], gender: p[4], rel: 10, board: true });
    });
    S.model.members(G).forEach(function (code) { list.push(governor(G, code, term)); });
    return list;
  };
  function governor(G, code, term) {
    var st = STANCE[code] || [0, 0.5], cand = S.GOVERNORS[code], pick = cand[term % 3];
    /* After the bank pressured governments to name more women, a state with a
       woman among its candidates names her */
    if (G.flags && G.flags["done:womenGovernors"] && pick[1] !== "f") {
      pick = cand.filter(function (p) { return p[1] === "f"; })[0] || pick;
    }
    return { id: "gov" + code, name: pick[0], gender: pick[1], country: code, role: "Governor, " + S.COUNTRY[code].bank,
      h: st[0], c: st[1], rel: 0, board: false };
  }
  K.governor = governor;
  /* Keeps the council in step with membership: adds the governor of a new
     member and removes the governor of a state that left */
  K.sync = function (G) {
    var have = {};
    G.council.forEach(function (m) { if (!m.board) { have[m.country] = true; } });
    var term = Math.min(2, Math.floor((G.year - 2008) / 8) % 3);
    S.model.members(G).forEach(function (code) { if (!have[code]) { G.council.push(governor(G, code, term)); } });
    G.council = G.council.filter(function (m) { return m.board || S.model.isMember(G, m.country); });
  };
  /* New names for every member at the start of a term */
  K.renew = function (G) {
    var old = {};
    G.council.forEach(function (m) { old[m.id] = m.rel; });
    G.council = K.build(G);
    G.council.forEach(function (m) { if (old[m.id] != null) { m.rel = Math.round(old[m.id] * 0.4); } });
  };

  K.bloc = function (m) {
    if (m.board) { return "board"; }
    if (m.h >= 0.4) { return "hawks"; }
    if (S.PERIPHERY.indexOf(m.country) >= 0 || m.h < -0.2) { return "periphery"; }
    return "center";
  };
  K.BLOCS = { hawks: "Hawks", center: "Center", periphery: "Periphery", board: "Executive Board" };

  /* Which governors vote this year */
  K.voters = function (G) {
    var govs = G.council.filter(function (m) { return !m.board; });
    var board = G.council.filter(function (m) { return m.board; });
    if (govs.length <= 18 || G.year < 2015) { return board.concat(govs); }
    var order = S.LARGEST.slice();
    var g1 = govs.filter(function (m) { return order.indexOf(m.country) >= 0; });
    var rest = govs.filter(function (m) { return order.indexOf(m.country) < 0; })
      .sort(function (a, b) { return S.COUNTRY[b.country].weight - S.COUNTRY[a.country].weight; });
    var groups;
    if (govs.length <= 22) {
      groups = [[g1, 4], [rest, 11]];
    } else {
      var half = Math.ceil(rest.length / 2);
      groups = [[g1, 4], [rest.slice(0, half), 8], [rest.slice(half), 3]];
    }
    var out = board.slice(), shift = G.year - 2015;
    groups.forEach(function (gr) {
      var list = gr[0], seats = Math.min(gr[1], list.length);
      for (var i = 0; i < seats; i++) { out.push(list[(i + shift * (list.length - seats)) % list.length]); }
    });
    return out;
  };

  /* How a member leans on an option: positive for yes. lean is the
     option's hawkishness (-2 to 2), novelty its legal newness (0 to 2),
     help how much it helps the periphery (-1 to 1), against the member
     state it acts against, whose governor votes no. */
  K.utility = function (G, m, opt) {
    var lean = opt.lean || 0, nov = opt.novelty || 0, help = opt.help || 0, L = S.game.level(G);
    var u = L.will - Math.abs(m.h - lean / 2) * L.dist - m.c * nov * 0.3;
    var per = S.PERIPHERY.indexOf(m.country) >= 0;
    u += per ? help * 0.35 : -help * 0.15;
    u += (m.rel || 0) / L.rel;
    if (opt.against && m.country === opt.against) { u -= 3; }
    if (G.president && G.president.weak) { u -= 0.08; }
    return u;
  };
  /* The vote on an option. Returns { yes, no, voters: [{member, yes}],
     passed }. The president votes for the option chosen. */
  K.vote = function (G, opt, rng) {
    var voters = K.voters(G), yes = 0, no = 0, list = [];
    voters.forEach(function (m) {
      var u = K.utility(G, m, opt) + (rng ? (rng() - 0.5) * 0.12 : 0);
      var y = u > 0;
      if (y) { yes++; } else { no++; }
      list.push({ member: m, yes: y });
    });
    yes++;
    var rule = opt.rule || "simple", total = yes + no, passed;
    if (rule === "twothirds") {
      /* The vote is on an objection: it stands only with two thirds */
      passed = no < total * 2 / 3;
    } else if (rule === "restrict") {
      /* A restriction of national tasks needs two thirds in favor */
      passed = yes >= total * 2 / 3;
    } else {
      passed = yes >= no;
    }
    return { yes: yes, no: no, voters: list, passed: passed, rule: rule };
  };
  /* The expected count before the vote, without noise */
  K.preview = function (G, opt) { return K.vote(G, opt, null); };

  /* Relations move with the president's choices: members whose stance is
     close to the option warm, the others cool */
  K.react = function (G, opt) {
    G.council.forEach(function (m) {
      var u = K.utility(G, m, opt) - (m.rel || 0) / S.game.level(G).rel;
      m.rel = Math.max(-100, Math.min(100, (m.rel || 0) + Math.round(u * 8)));
    });
  };
  /* The president's stance on the members' scale (-1 dove to 1 hawk), from
     the options the president put to a vote; null before the first */
  K.presidentStance = function (G) {
    var t = G.tally;
    return t && t.n ? Math.max(-1, Math.min(1, t.s / t.n)) : null;
  };
  /* The president's stance on new instruments on the members' scale (0
     open to them, 1 against them), from the choices on cards that offer a
     new instrument; null before the first */
  K.presidentCaution = function (G) {
    var t = G.tallyC;
    return t && t.n ? Math.max(0, Math.min(1, t.s / t.n)) : null;
  };
  K.resignations = function (G) {
    var out = [];
    G.council.forEach(function (m, i) {
      if (m.rel <= -60) {
        out.push(m.name);
        var n = m.board ? { id: m.id, name: "Acting " + m.role.toLowerCase(), country: m.country, role: m.role, h: m.h * 0.5, c: m.c, rel: 0, board: true }
          : governor(G, m.country, Math.min(2, Math.floor((G.year - 2008) / 8) % 3) + 1);
        n.rel = 0;
        G.council[i] = n;
      }
    });
    return out;
  };
})();
