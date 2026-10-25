/* The advisors: nine schools, one fictional character each. The player
   fills three seats and can replace one advisor a year.

   Each school has:
   - weights: how it values an option's attributes (js/data/cards*.js give
     each option attributes such as hawk, purchases, troika, fiscal, public,
     democratic, green, discipline, restructure, novelty);
   - params: the model parameters it believes, used for its forecasts. The
     true parameters are in S.model.TRUE. Each school is right in some
     conditions: the ordoliberal and Austrian advisors expect tightening to
     restore confidence (a lower multiplier and a confidence effect on
     spreads), the post-Keynesian and MMT advisors expect a high multiplier
     in every condition, the New Keynesian advisor is close to the true
     model in a recession and expects less panic than the model has.
   - rule: how the school sets rates: the change it wants is
     0.5 x (inflation - 2) - u x (rise in unemployment) + bias, so hawkish
     schools have a positive bias and weigh unemployment less;
   - lines: plain-language reasons, chosen by the attribute that decided
     the recommendation;
   - context: what the school says of the year's situation (a state's
     debt, banks, high or falling prices, a slump, a climate disaster, a
     calm year), with the year's figures; it opens the advice, so the same
     reason reads differently from year to year. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  S.ADVISORS = {
    ordo: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "{state}'s spread is {s} points. Help must come with conditions, or the reforms stop.",
        banks: "Banks that cannot raise capital should close in an orderly way. Cheap loans only delay it.",
        prices: "Inflation is {p}%. Every month of delay makes it harder to bring down.",
        deflation: "Prices fall at {p}%. Lower energy prices explain most of it, and it will pass.",
        slump: "Unemployment is {u}%. Governments must change their rules on work and spending; the bank cannot do that for them.",
        climate: "Governments must pay for the damage of the disaster. The bank's task stays the same.",
        calm: "Inflation is {p}% and steady. Calm years are the time to keep the rules strict."
      },
      rule: { bias: 0.5, u: 0.2 },
      name: "Henrike Albers", from: "Germany", school: "Ordoliberal",
      bio: "Former head of the monetary policy department of a national central bank. Writes on rules-based policy.",
      claims: "Price stability, strict rules, no central bank money for governments, conditions on every loan.",
      evidence: "Cites the German record of low inflation after 1948 and the moral hazard that rescues create.",
      weights: { hawk: 1.4, purchases: -1.6, troika: 1.2, discipline: 1.4, fiscal: -1.0, public: -1.2, novelty: -1.4, restructure: -0.5, democratic: 0.2 },
      params: { mult: 0.6, multCalm: 0.4, panic: 1.0, infl: 0.35, rate: 0.45, confidence: 0.6 },
      lines: {
        hawk: "Once people expect high inflation, it takes years to change that. Higher interest rates now cost less than a rescue later.",
        dove: "Inflation is falling on its own. A small cut keeps rates neutral; it must not be repeated every year.",
        purchases: "Buying government bonds comes close to what Art. 123 forbids. Governments will expect us to do it again next time.",
        troika: "Money without conditions changes nothing. Conditions make the reforms happen.",
        discipline: "High spreads show that investors doubt these governments. We should not hide that by buying their bonds.",
        novelty: "Every new instrument stays once it exists. We should do only what the Statute clearly allows.",
        fiscal: "Deficits are the problem. They cannot be the answer.",
        other: "This keeps the bank within its mandate."
      }
    },
    mon: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "Money is leaving the banks of {state}. Steady money growth in every member keeps the euro together.",
        banks: "When banks stop lending, money stops growing. The bank must go on lending to sound banks.",
        prices: "Inflation is {p}% after years of fast money growth. Money growth must slow.",
        deflation: "Prices fall at {p}%. Money growth has stopped, and the bank must restart it.",
        slump: "Unemployment is {u}%. Steady money growth helps more than any single measure.",
        climate: "A disaster raises prices for a time. Money growth has not changed, and money growth is what counts.",
        calm: "Money grows at a steady pace. Nothing needs to change."
      },
      rule: { bias: 0.2, u: 0.3 },
      name: "Pieter van Doorn", from: "Netherlands", school: "Monetarist",
      bio: "Professor of monetary economics. Tracks money and credit growth in every member state.",
      claims: "The quantity of money drives prices over time. Keep money growth steady.",
      evidence: "Cites the link between money growth and inflation over long periods, and Milton Friedman's advice to Japan in the 1990s.",
      weights: { hawk: 0.6, purchases: 0.4, troika: 0.4, discipline: 0.6, fiscal: -0.6, public: -0.6, novelty: -0.3 },
      dynamic: function (G, w) {
        var p = G.ea.v ? G.ea.v.p : 2;
        if (p < 1) { w.hawk = -1.2; w.purchases = 1.4; }
        if (p > 3) { w.hawk = 1.6; w.purchases = -1.2; }
        return w;
      },
      params: { mult: 0.8, multCalm: 0.5, panic: 1.3, infl: 0.4, rate: 0.55, confidence: 0.2 },
      lines: {
        hawk: "Money is growing much faster than output. We need to slow it before prices rise.",
        dove: "Money and credit are falling. Lower interest rates bring back steady money growth.",
        purchases: "Money and credit are falling. Purchases bring back money growth; this is what Friedman told Japan.",
        discipline: "Prices and spreads hold information. We should not override them without cause.",
        other: "Steady money growth is the safest guide we have."
      }
    },
    newk: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "{state}'s spread is {s} points, more than its debt explains. Investors fear a default that need not happen, and the bank can stop that fear.",
        banks: "A run on sound banks is what a lender of last resort exists to stop.",
        prices: "Inflation is {p}%. Expectations decide where it goes, and the bank must show it will act.",
        deflation: "Prices fall at {p}%. With rates near zero, the bank needs a promise to keep them low, and purchases.",
        slump: "Unemployment is {u}%. Demand is too low, and rates alone may not be enough.",
        climate: "The weather has cut supply. Raising rates against that costs jobs and does not bring the harvest back.",
        calm: "Inflation is {p}%, close to the target. Small steps keep it there."
      },
      rule: { bias: 0.0, u: 0.5 },
      name: "Élise Marchand", from: "France", school: "New Keynesian",
      bio: "Former research director at an international organization. Builds forecasting models for central banks.",
      claims: "Interest rates and what people expect decide demand; a central bank must be a lender of last resort, with conditions.",
      evidence: "Cites the research on interest rates that cannot fall much below zero, and the record of central banks in 2008 and 2009.",
      weights: { hawk: -0.6, purchases: 1.2, troika: 0.6, fiscal: 0.5, discipline: 0.2, novelty: 0.2, democratic: 0.3 },
      dynamic: function (G, w) {
        var p = G.ea.v ? G.ea.v.p : 2;
        if (p > 3) { w.hawk = 1.4; w.purchases = -0.4; }
        return w;
      },
      params: { mult: 1.3, multCalm: 0.6, panic: 1.2, infl: 0.25, rate: 0.5, confidence: 0 },
      lines: {
        hawk: "Inflation is above target, and people are starting to expect more of it. We should act before those expectations rise further.",
        dove: "Inflation is below target and output is falling. Rates should come down, and stay low until the recovery is certain.",
        purchases: "With rates near zero, purchases are the tool we have left. A backstop works best when markets believe it.",
        troika: "Support works when it comes with a plan. Conditions keep our support from being abused.",
        fiscal: "Government spending has a larger effect than usual with rates near zero.",
        other: "This keeps demand close to what the economy can produce."
      }
    },
    postk: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "{state} pays {s} points more than Germany because the euro area has no common treasury. That is the problem to fix.",
        banks: "Banks are in trouble because the economy is weak. Growth repairs them.",
        prices: "Inflation is {p}%. Energy and profits drive it, and wages follow; higher interest rates cost jobs.",
        deflation: "Prices fall at {p}%. Demand is missing, and public investment brings it back.",
        slump: "Unemployment is {u}%. Each euro of spending cut now lowers output by more than a euro.",
        climate: "Rebuilding after the disaster is investment. Public money should pay for it, with the bank's support.",
        calm: "Unemployment is {u}%. There is room to aim for full employment."
      },
      rule: { bias: -0.5, u: 0.9 },
      name: "Tomás Ferreira", from: "Portugal", school: "Post-Keynesian",
      bio: "Labor economist. Studies wages and trade imbalances inside the euro area.",
      claims: "Demand and wages drive output; the imbalances between members caused the crisis.",
      evidence: "Cites the gap in labor costs per unit of output between Germany and the south after 1999, and the IMF's own estimates of fiscal multipliers.",
      weights: { hawk: -1.6, purchases: 0.8, troika: -1.6, fiscal: 1.8, democratic: 0.8, public: 0.6, discipline: -1.0, restructure: 0.6 },
      params: { mult: 1.8, multCalm: 1.2, panic: 1.8, infl: 0.15, rate: 0.5, confidence: -0.3 },
      lines: {
        dove: "Raising rates in a recession would make it worse. Unemployment is the emergency.",
        hawk: "The economy is producing near its limit; a small rise is reasonable now.",
        troika: "The programs cut demand in a recession. Every cut shrinks output faster than it shrinks debt.",
        fiscal: "Public spending keeps demand up when households and firms spend less. The multiplier is large right now.",
        purchases: "A central bank that guarantees the debt in its own currency ends a panic. This one should.",
        other: "This protects jobs and wages."
      }
    },
    aus: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "{state} cannot repay all it owes. Reducing its debt now costs less than lending it more.",
        banks: "Banks that lent badly should bear their losses. Rescues teach them to lend badly again.",
        prices: "Inflation is {p}%: the cost of years of cheap money.",
        deflation: "Falling prices end bad investments. The bank should let it happen.",
        slump: "Unemployment is {u}%. The slump corrects the boom; cheap credit would start the next one.",
        climate: "After the disaster, savers should choose where credit goes. Cheap loans would waste it.",
        calm: "Rates are low and the economy is calm. This is when bad investments build up."
      },
      rule: { bias: 0.8, u: 0.1 },
      name: "Lukas Ebner", from: "Austria", school: "Austrian",
      bio: "Economic historian. Writes on banking crises and the history of money.",
      claims: "Cheap credit creates bad investment; rescues create moral hazard; debtors who cannot pay should have their debt reduced.",
      evidence: "Cites the fast growth of credit in Ireland and Spain before 2008, and the cost of keeping failed banks open.",
      weights: { hawk: 1.6, purchases: -2.0, troika: -0.8, discipline: 1.6, restructure: 1.8, fiscal: -1.6, public: -1.8, novelty: -1.2 },
      params: { mult: 0.5, multCalm: 0.3, panic: 0.9, infl: 0.4, rate: 0.4, confidence: 0.7 },
      lines: {
        hawk: "Rates at zero let bad investments continue. Interest rates should show the real cost of borrowing.",
        dove: "The cut is small. The real question is which debts are unpayable.",
        purchases: "Each purchase hides losses that someone will have to take later.",
        troika: "Lending to a state that cannot pay only moves its losses to taxpayers in other states.",
        restructure: "A debtor who cannot pay should have its debt reduced early, with losses for the creditors who lent unwisely.",
        discipline: "Let markets set the interest rate for each risk. Rescues teach lenders to be careless.",
        other: "This lets prices adjust on their own."
      }
    },
    mmt: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "{state} borrows in a currency it does not issue. The bank must guarantee its debt, or investors decide its future.",
        banks: "The bank can always supply euro to banks. Deposits should never be at risk.",
        prices: "Inflation is {p}%. Scarce energy and goods cause it; spending on supply lowers it.",
        deflation: "Prices fall at {p}%. Governments should spend more, and the bank should finance it.",
        slump: "Unemployment is {u}%. A public job guarantee would end it.",
        climate: "The bank can finance the rebuilding at once. Money is no limit; workers and materials are.",
        calm: "Unemployment is {u}%. People who want work still cannot find it."
      },
      rule: { bias: -0.8, u: 0.8 },
      name: "Siobhán Kerrigan", from: "Ireland", school: "MMT",
      bio: "Economist at a public policy institute. Writes on job guarantees and public finance.",
      claims: "A state that issues its own currency cannot be forced into default; the euro members can, so the central bank must guarantee their debt.",
      evidence: "Cites the low rates paid by states with their own currency and high debt, such as Japan, against the spreads paid by euro members.",
      weights: { hawk: -1.6, purchases: 1.8, troika: -1.8, fiscal: 2.0, public: 0.8, democratic: 0.4, discipline: -1.4 },
      params: { mult: 1.8, multCalm: 1.0, panic: 2.0, infl: 0.15, rate: 0.4, confidence: -0.3 },
      lines: {
        purchases: "The bank issues the currency. If it guarantees every member's debt, the panic ends.",
        troika: "Cuts in a recession mean fewer jobs and less tax revenue. The deficit hardly changes.",
        fiscal: "Unemployment is idle capacity. A job guarantee would use it.",
        dove: "There is no inflation to fight. Higher interest rates only add to interest bills.",
        hawk: "Prices are rising because workers, machines and materials are short; a rise can help until supply increases.",
        other: "The real limit is labor, machines and materials."
      }
    },
    socmmt: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "{state} needs a guarantee of its debt and controls on capital leaving the country.",
        banks: "Banks rescued with public money should become public banks.",
        prices: "Inflation is {p}%. Price controls on energy and rents work faster than rate rises.",
        deflation: "Prices fall at {p}%. Public banks should lend for public investment now.",
        slump: "Unemployment is {u}%. The state should direct credit to public investment.",
        climate: "Public banks should finance the rebuilding, and the bank should cancel the debt it holds for it.",
        calm: "Calm years are the time to build public banks, before the next crisis."
      },
      rule: { bias: -0.8, u: 0.8 },
      name: "Eleni Vrettou", from: "Greece", school: "Socialist MMT",
      bio: "Former official at a public development bank. Writes on public credit and debt.",
      claims: "The MMT case, with public control of credit: public banks, credit directed to public investment, capital controls in a crisis, cancellation of debt the bank holds.",
      evidence: "Cites postwar credit guidance in France and Italy and the public development banks of several member states.",
      weights: { hawk: -1.8, purchases: 1.6, troika: -2.2, fiscal: 2.0, public: 2.2, restructure: 1.2, democratic: 0.8, discipline: -1.8 },
      params: { mult: 1.9, multCalm: 1.1, panic: 2.0, infl: 0.15, rate: 0.4, confidence: -0.4 },
      lines: {
        public: "Credit should go where the public needs it. Private banks lent to property; public banks can lend to production.",
        troika: "The memoranda sold public assets when prices were lowest. That transfers public wealth to the creditors.",
        restructure: "Debt that cannot be paid will not be paid. Better to cancel it in an orderly way.",
        fiscal: "Public investment brings in more than it costs when a third of young people are out of work.",
        purchases: "The bank can hold this debt for as long as it chooses.",
        dove: "Cheaper credit for public investment and for households in debt.",
        hawk: "Prices are rising faster than wages; a rise is acceptable if credit to public investment continues.",
        other: "This puts credit under public direction."
      }
    },
    eurocom: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "The people of {state} should vote on their loan program. Conditions set by creditors have no mandate.",
        banks: "Banks that need public money should belong to the public.",
        prices: "Inflation is {p}%. Public ownership of energy would set its price by need.",
        deflation: "Prices fall at {p}%. The Parliament should instruct the bank to support jobs.",
        slump: "Unemployment is {u}%. Workers' representatives should sit on the bank's boards.",
        climate: "The regions hit by the disaster should plan the rebuilding themselves.",
        calm: "The bank should answer to elected representatives in calm years too."
      },
      rule: { bias: -0.5, u: 0.7 },
      name: "Giulia Ferrante", from: "Italy", school: "Eurocommunist",
      bio: "Political economist and former trade union adviser. Close to the movements that in Selk's history become the European Left Alliance.",
      claims: "Democratic control of the bank and public ownership of energy and rail.",
      evidence: "Cites the objections to the Union's institutions that Selk's 2045 reforms answer: an unelected executive, a central bank outside democratic control, rules that impose austerity.",
      weights: { hawk: -1.0, troika: -2.4, democratic: 2.4, public: 1.8, fiscal: 1.4, purchases: 0.2, discipline: -1.2, novelty: 0.4 },
      params: { mult: 1.6, multCalm: 0.8, panic: 1.5, infl: 0.2, rate: 0.5, confidence: -0.2 },
      lines: {
        democratic: "The bank reports to no one. Go to the Parliament, explain, and let elected people share the choice.",
        troika: "A seat in the Troika makes the bank work for the creditors. That is not the task of a central bank.",
        public: "Energy and rail should be publicly owned. The bank should not oppose it.",
        fiscal: "Austerity is a political choice presented as a calculation.",
        dove: "Lower interest rates reduce the payments of working households and of the states in crisis.",
        hawk: "Inflation hurts wage earners first; a measured rise protects them.",
        other: "This keeps power with the people affected."
      }
    },
    eco: {
      /* What the school says of the year's situation, with its figures */
      context: {
        debt: "{state}'s borrowing should pay for insulation and grids. Cuts would stop the work the climate needs.",
        banks: "Banks' losses on loans to coal, oil and gas firms are a risk the bank must count.",
        prices: "Inflation is {p}%. Fossil fuel prices drive it; using less of them lowers it.",
        deflation: "Prices fall at {p}%. Cheap credit for clean energy would put idle workers to use.",
        slump: "Unemployment is {u}%. Renovation and rail employ many people.",
        climate: "This disaster is the cost of past emissions. The bank must stop financing new ones.",
        calm: "Climate risk grows every year, calm or not. Calm years are for preparing."
      },
      rule: { bias: -0.3, u: 0.5 },
      name: "Katarzyna Wilk", from: "Poland", school: "Ecological",
      bio: "Climate economist. Studies how floods, droughts and heat move prices and bank losses.",
      claims: "Climate risk is financial risk, and growth has physical limits.",
      evidence: "Cites the losses insurers and banks took after the floods and heatwaves of the 2020s, and research on assets that lose their value as the climate changes.",
      weights: { green: 2.6, hawk: -0.4, fiscal: 0.8, troika: -0.8, purchases: 0.3, discipline: -0.6, public: 0.6, democratic: 0.4 },
      params: { mult: 1.2, multCalm: 0.6, panic: 1.4, infl: 0.25, rate: 0.5, confidence: 0 },
      lines: {
        green: "Every euro lent now to coal, oil and gas firms may become a loss in the next heatwave.",
        fiscal: "Investment in insulation and grids creates jobs and cuts future costs.",
        dove: "Raising rates against a supply shock from the weather hurts jobs and leaves the weather as it is.",
        hawk: "Demand is growing faster than the economy can supply without harm to the climate; a rise is prudent.",
        troika: "Cuts fall first on maintenance and adaptation, which cost more later.",
        other: "This takes the climate into account."
      }
    }
  };
  S.ADVISOR_ORDER = ["ordo", "mon", "newk", "postk", "aus", "mmt", "socmmt", "eurocom", "eco"];
})();
