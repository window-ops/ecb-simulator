/* Help, in sections, as KDE's Help Center lists the chapters of a manual
   beside the page. Each section has an id, a title, an icon and its
   blocks: ["p", text], ["h3", text], or ["ul", [[label, text], ...]], a
   list whose items start with a label in bold. Text goes through the
   glossary, so its terms open their definitions. The Selk section shows
   the explanation of Selk, and the Keyboard section shows only where a
   keyboard is at hand. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  S.HELP = [
    { id: "concept", title: "Concept", icon: "about", blocks: [
      ["p", "You are the president of the European Central Bank from January 2008. The office has powers that no elected government in the euro area has alone, and the euro crisis showed how large they are. You have the same powers, under the same law. The premise is a president who could use them as the bank did and uses none of them to impose the Troika, the Draghi measures or other conditions that lower people's quality of life."],
      ["h3", "The powers of the bank"],
      ["ul", [
        ["Interest rates", "The bank sets the interest rates of the whole euro area (Art. 127 TFEU; ECB Statute, Art. 18)."],
        ["Collateral", "It decides which assets banks may pledge to borrow from it. When it refuses a state's bonds, that state's banks can borrow much less from it."],
        ["Emergency liquidity", "A national central bank may lend to its own banks when they run short of cash. The Governing Council can limit that lending by a two-thirds majority (ECB Statute, Art. 14.4), and banks that lose it must close."],
        ["Bond purchases", "The bank may not lend to governments (Art. 123 TFEU), and it may buy their bonds from investors. It can set conditions for those purchases."],
        ["Independence", "Neither the bank nor its members may take instructions from governments or from the Union's bodies (Art. 130 TFEU). Its first aim is stable prices; as long as prices stay stable, the bank supports the Union's general economic policies, whose aims include full employment and social progress (Art. 127(1) TFEU, Art. 3 TEU)."]
      ]],
      ["h3", "How the bank used them, 2010 to 2015"],
      ["ul", [
        ["May 2010", "The first loan program for Greece, 110 billion euros, came with a memorandum set by the Troika: the European Commission, the bank and the IMF. Programs for Ireland (November 2010), Portugal (May 2011) and Cyprus (March 2013) followed. Their conditions included cuts to wages, pensions, public jobs and health spending, higher taxes and sales of public assets."],
        ["19 November 2010", "President Jean-Claude Trichet wrote to the Irish finance minister that further emergency liquidity for Irish banks depended on Ireland asking for a program. Ireland applied two days later. The letter was published in 2014."],
        ["August 2011", "Trichet and his successor, Mario Draghi, wrote to the governments of Italy and Spain with a list of labor, pension and budget measures, as the bank began to buy their bonds."],
        ["July and September 2012", "Draghi said the bank would do \"whatever it takes\" to preserve the euro, and the bank announced Outright Monetary Transactions: unlimited purchases of a state's short-term bonds, open only to states in a program with strict conditions."],
        ["21 March 2013", "The bank announced that emergency liquidity for Cypriot banks would end on 25 March unless an EU and IMF program was in place. Cyprus agreed that night to a program that closed one bank and imposed losses on large deposits."],
        ["4 February 2015", "A week after a Greek government elected against the memoranda took office, the bank stopped accepting Greek government bonds as collateral. Yanis Varoufakis, the new finance minister, proposed swapping part of the debt for bonds whose payments follow growth."],
        ["28 June 2015", "After the government called a referendum on the creditors' terms, the bank held emergency liquidity for Greek banks at its cap. The banks closed the next day and stayed closed until 20 July; withdrawals stayed limited after that. Voters rejected the terms on 5 July by 61%; on 13 July the government accepted a third program."]
      ]],
      ["h3", "What followed"],
      ["ul", [
        ["Greece", "Output fell by about a quarter between 2008 and 2013. Unemployment reached 27.5% in 2013, and more than half of people under 25 who wanted work had no job. Public debt rose from 127% of output in 2009 to 180% in 2014."],
        ["Spain", "Unemployment passed 26% in 2013."],
        ["The forecasts", "In 2013 IMF economists Olivier Blanchard and Daniel Leigh found that forecasts during the crisis had underestimated how much budget cuts shrink output. The IMF's own evaluation of the first Greek program, the same year, found that it had underestimated the fall in output."],
        ["The Parliament", "On 13 March 2014 the European Parliament adopted a report on the Troika that questioned its democratic accountability and the bank's part in it."],
        ["The Court", "In 2016, in Ledra Advertising, the Court of Justice held that the Commission remains bound by the Charter of Fundamental Rights when it acts under the ESM Treaty, the memoranda included."]
      ]],
      ["h3", "The president you play"],
      ["p", "You have every power above, and you may use every lawful tool, the seat in the Troika and the Draghi measures included. The president you play keeps that power and does not use it against the people of a member state: no seat in a Troika, no bond purchases tied to a memorandum, no emergency liquidity used to pressure an elected government, and no letters that set a government's budget."],
      ["p", "The question is whether Greece and the rest of the euro area could have ended the crisis that way, with the tools the law allows: interest rates and collateral, emergency liquidity without political conditions, proposals to governments such as common debt and the Modest Proposal, and investment through the European Investment Bank. The grades at the end compare your run with the record."],
      ["h3", "The window"],
      ["p", "The window follows KDE's Breeze style, as an office program on the computers of a European public institution would. Several public administrations in Europe run Linux desktops or are moving to them: the French Gendarmerie since 2008, the German state of Schleswig-Holstein by a plan announced in 2024, and the city of Munich, whose LiMux system ran KDE from 2006 to 2017."],
      ["h3", "A game in constant beta"],
      ["p", "The game is in constant beta: it may change from one version to the next, or stay as it is, and its figures and texts may contain errors. A new version may not open the saves of an older one. This happened once already: the saves of the unpublished first versions, three fixed slots, could not be opened after the change to the current saves, an automatic save for each game and any number of manual ones."]
    ] },
    { id: "play", title: "How to play", icon: "agenda", blocks: [
      ["p", "Each turn is a year. The agenda lists 3 to 6 items: the yearly rate decision, events from the record or from Selk's history, and crises your own choices cause. Choose an option on each item."],
      ["ul", [
        ["The agenda", "Items from the record say what the historical bank did, in the \"In history\" box, unless Settings > Game hides it."],
        ["The advisors", "Your three advisors recommend an option and forecast its effect with the model of their own school. They disagree, and each is right in some conditions."],
        ["Decisions are final", "A decision cannot be taken back. Read the options, the advisors and the expected vote first."],
        ["The year", "End the year with the button in the toolbar, or in the agenda's heading once every item is decided. The model runs, elections and events follow, and the year report opens with the year's events; its table of figures opens with a tap. A line under the agenda's heading sums up last year."],
        ["Saving", "Each game has an autosave, which it updates after every decision and every year. Save, in the toolbar, makes a new save of the game at once, with a name if you type one; it can also overwrite one of your earlier saves. Each save has an ID, such as 2A for the autosave of the second game and 2A-3M for its third save. Save and Load list every save, sorted by date, year, president or name and, if you choose, grouped by game, kind or period. Each save can be renamed or deleted. Loading a save goes on updating that game's autosave. Leave the game, in the toolbar, saves the game and returns to the title screen."]
      ]]
    ] },
    { id: "council", title: "Council and law", icon: "council", blocks: [
      ["p", "Options marked \"Council vote\" go to the Governing Council, which can reject them. The badge shows the expected count. Your relation with each member and the gap between their stance and the option decide their vote."],
      ["p", "Options the treaties forbid are shown with the article that forbids them. A treaty campaign can change the law, slowly. Tags show which options are Draghi measures and which put the bank in the Troika."],
      ["p", "From 2045 the bank reports to the Federal Parliament, which can instruct it by law and remove its president."]
    ] },
    { id: "initiatives", title: "Initiatives", icon: "proposals", blocks: [
      ["p", "Each year leaves time for one to three initiatives: hearings in the Parliament, persuading a bloc of the Council, speeches, pressuring governments on a proposal, or a treaty campaign."],
      ["p", "Proposals such as eurobonds, the Modest Proposal or investment through the European Investment Bank raise the backstop when governments adopt them. The backstop is the support the euro area promises its weakest members; when it is strong, spreads fall without bond purchases."]
    ] },
    { id: "ending", title: "Winning and losing", icon: "score", blocks: [
      ["p", "A run ends badly if the euro breaks up, if you are removed from office, if trust stays below 20% for two years, if the far right wins a majority, or if inflation or unemployment become catastrophic. A single state leaving the euro does not end the game."],
      ["p", "A complete run ends with a short film and four grades compared with history. The grades are from A to F, as on the EU energy label: A is the best, C is as in history, and F is the worst. Achievements, kept on this computer across games, mark milestones on the way."]
    ] },
    { id: "saves", title: "Saves", icon: "save", blocks: [
      ["p", "The game keeps your saves in this browser, with no account and no server. Settings > Storage chooses where: in this tab only, which closing the tab erases, or on this computer. To keep saves somewhere else, or to move them to another browser or computer, export them to a file and import the file there."],
      ["h3", "Autosaves and manual saves"],
      ["p", "Each game has one autosave, which the game updates after every decision, every initiative and every year, and when the page is left or reloaded. Settings > Game can turn it off. Save, in the toolbar, adds a manual save at once; it keeps that moment of the game until you overwrite or delete it."],
      ["h3", "IDs"],
      ["ul", [
        ["2A", "The autosave of game 2."],
        ["2A-3M", "The third manual save made from game 2."],
        ["I1A", "The autosave of import 1, a file with one game."],
        ["I1-2A-3M", "The third manual save of the second game of import 1, a file with several games."]
      ]],
      ["p", "A new game or import takes the lowest number free. Any save can have a name of up to 40 characters."],
      ["h3", "Backups: export and import"],
      ["p", "Export, in Settings > Storage, writes the game in progress with all its saves to a file. In Load or Save, Select chooses saves one by one, or a whole game or import with the box of its group; Export then writes them to one file, and Delete removes them at once. The file is plain JSON: keep it with your other files, and import it in any browser that runs this version of the game."],
      ["p", "Import checks a file before it keeps anything. A file of another format, with unknown or malformed data, or larger than 20 MB is refused with the reason. The saves of a file join as an import of their own, numbered I1, I2. When a game of the file is a run you already have, you choose whether it adds the saves that game lacks or comes in as a copy. An import changes no save you already have."],
      ["h3", "Achievements"],
      ["p", "Achievements are kept in this browser, apart from the saves. An export never contains them, and an import never changes them. Settings > Game can clear them all."],
      ["p", "A game imported from a file plays in a sandbox: it earns only what you reach after importing it. Achievements its run had already met stay out of reach for that run, and achievements that count years, such as five years close to 2%, count only the years played after the import. Load and Save mark its saves From a file."],
      ["h3", "The debug mark"],
      ["p", "Opening the debug tools changes nothing. An action of the debug tools that changes the run, such as deciding every item, ending a year, a jump or the field Debug: begin in on the form for a new game, marks the run. The mark lists each change with the year in the game and the date, stays with the run in every save, export and import, and keeps the run from earning any achievement other than Market manipulator, which records the use. Load and Save show it as Debug used, and the tag opens the list."]
    ] },
    { id: "reading", title: "Notes and glossary", icon: "glossary", blocks: [
      ["p", "The game explains its harder words in two ways: links to the glossary and footnotes. Settings > Motion and text has a switch for each, in the group Glossary and footnotes."],
      ["h3", "Glossary links"],
      ["p", "An underlined word opens a short definition beside it. A block of text links each term once, at its first use. A term inside a definition opens in the same box, with a back button that returns to the definition before. Pressing the word again closes the box with the close sound; a click outside the box, a scroll of the page or Escape also closes it."],
      ["p", "The everyday words of economics have entries too, such as output, inflation, bond, deficit and interest rate, so every figure on a card leads to a definition. With the links off, the words show as plain text."],
      ["h3", "Footnotes"],
      ["p", "A small raised number in a card's text opens a note in the list under the card. A note explains a harder idea in plain words, often with the dates and figures of the record. A note can point to other notes; a note it points to joins the list when you open it."],
      ["p", "Hide closes the list on every card until you press a number again. With the footnotes off, cards show no numbers and no list."],
      ["h3", "The Glossary view"],
      ["ul", [
        ["Categories", "The terms come in five groups: for readers outside the EU, about the EU, the bank's tools, economics and finance, and the game and Selk's history. A list shows one group or all of them."],
        ["Search", "Finds a term by its name, its other forms or the words of its definition."],
        ["Order", "A to Z or Z to A."],
        ["Links off", "The view still lists every term, so the definitions stay available."]
      ]]
    ] },
    { id: "selk", title: "Selk", icon: "archive", blocks: "selk" },
    { id: "keyboard", title: "Keyboard", icon: "keyboard", keys: true, blocks: [
      ["ul", [
        ["1 to 9", "Choose an option."],
        ["Enter", "Decide, then go to the next item."],
        ["N", "Go to the next item."],
        ["Left and right arrows", "Go to the item before or after."],
        ["E", "End the year."],
        ["[ and ]", "Go to the view before or after, in the sidebar's order."],
        ["?", "Open this help."],
        [",", "Open the settings."],
        ["G", "Open the settings of the game in progress."],
        ["S and L", "Save or load."],
        ["M", "Turn the sound on or off."],
        ["Escape", "Close a dialog or a popover."],
        ["Enter in a dialog", "Press its main button."],
        ["Letters on the end screens and the title screen", "Press the button that shows the letter."]
      ]],
      ["p", "These are the default keys. Settings > Keyboard turns the shortcuts on or off, as a whole or area by area, and changes the key of any action under Key bindings."]
    ] },
    /* Shown only in debug mode (Settings > Debug), as Keyboard shows only with a keyboard */
    { id: "debug", title: "Debug", icon: "debug", debug: true, blocks: [
      ["p", "This page shows while debug mode is on (Settings > Debug). The debug tools change a run in ways play cannot; the archive marks each change with a Debug tag, and the game saves after each one."],
      ["h3", "Play with"],
      ["p", "Decide all, End the year and the jumps choose an option on every open item by the strategy chosen here."],
      ["ul", [
        ["Realistic (as a player would)", "The historical choice where the card has one. Otherwise the option the first of the run's three advisors recommends, then the second's, then the third's. Otherwise the first option allowed."],
        ["Historical choices", "The historical choice where the card has one. On a rate decision without one, the rate closest to the historical rate of the year. Otherwise the first option allowed."],
        ["Intended path", "The option marked as the intended path. Without one, the option nearest to a slightly expansionary stance (a lean of -0.4), leaving out Draghi measures and seats in a Troika."],
        ["First option", "The first option allowed."],
        ["Random", "Any option allowed, drawn from the run's own random numbers, so a loaded save draws the same way again."]
      ]],
      ["p", "Use initiatives to pressure governments spends each year's initiatives on the first proposal not yet adopted, in this order: ECB bonds for national debt, stability fund rescues of banks, Eurobonds, the EIB investment program, longer and cheaper rescue loans, common deposit insurance. When no proposal can take one, the initiative goes to a hearing in the Parliament."],
      ["h3", "Time"],
      ["ul", [
        ["Decide all", "Decides every open item of the year with the strategy."],
        ["End the year", "Ends the year as the End year button does."],
        ["Go to", "Plays every year up to the year given: each item decided, initiatives used if the box is checked, each succession taken by a president with the first president's name and a number (II, III), each year ended."],
        ["End the period", "Plays to the end of the period: the end of 2040, or of 2070 in the Federation. A jump that would end the period asks first."]
      ]],
      ["h3", "The other tabs"],
      ["ul", [
        ["Situation", "The year, the agenda, the backstop and the main rate beside the record, the three highest exit risks, trust, the far right, and, for EU enlargement, each state the run assumes will join: its year in the EU, its date for the euro and, for Scotland, independence."],
        ["Events", "Adopts a proposal, starts a loan program, makes a state leave the euro, starts a succession, ends the run with a bad ending, or plays an ending film over the run. EU enlargement puts an item of a state that may join the EU on this year's agenda: its accession, the euro it uses, Scotland's referendum or its currency. A state the run did not choose joins the run first, and Scotland's accession and currency make it independent first."],
        ["Adjust", "Sets the main rate, adds an initiative, allows another advisor change, sets the Parliament's confidence, advances a treaty campaign, or runs the tour."],
        ["Inspect", "Copies the game data, or shows the model's values for each euro state: its spread beside the record, its exit risk, how far its government has loosened its budget, the change in its output gap, and the stability of its banks out of 100."]
      ]]
    ] },
    { id: "figures", title: "Figures and sources", icon: "chart", blocks: [
      ["h3", "Where the figures come from"],
      ["p", "Figures from 2008 to 2025 start from Eurostat series, rounded. As in Democracy\u00a04 and other policy simulations, figures change with the policies played, so the game's world has its own Eurostat. It reports slightly different figures from the published series, the record included, and then what your own choices produce. Each indicator names its source. After 2025 the figures come from the model and Selk's history."],
      ["h3", "The model in brief"],
      ["p", "For technical readers: the model runs once a year for every member state, in js/model/model.js."],
      ["h3", "The baseline"],
      ["p", "From 2008 to 2025 each state has a recorded value for each figure. The model computes only the change your choices cause and adds it to the record, so a run that repeats every historical decision shows the recorded history. After 2025 the baseline is a neutral projection with the climate shocks of Selk's history."],
      ["h3", "One year of a member state"],
      ["ul", [
        ["Rates", "The change from the historical rate enters with a lag: 60% in the year and 40% the next. A negative rate counts as 0.35 points lower."],
        ["Spreads", "Each state's spread has two parts: one explained by its debt, and one caused by fear. The second part falls as the backstop rises above its historical level, and rises with the far-right share, emergency liquidity that is capped or kept at its cap, and the risk of leaving the euro."],
        ["Budget cuts", "The year's budget cuts are those of the record, or the size a loan program sets, reduced by the proposals governments adopt. Their difference from the record falls by 10% a year."],
        ["Output", "The change in output adds the budget cuts times a multiplier (1.2 in a recession with rates near zero, 0.6 otherwise), the rate and spread changes, investment through the EIB, bond purchases and shocks."],
        ["Unemployment, inflation and debt", "Unemployment follows output through each state's Okun coefficient, with a small term that keeps it high after a long recession. Inflation follows its own past and the output gap. Debt follows deficits, interest costs and nominal growth."],
        ["Banks and exit risk", "Bank stability falls with spreads and rises with open emergency liquidity, collateral waivers and the banking proposals. Exit risk rises with spreads, weaker banks, unemployment above the record and emergency liquidity kept at its cap; a backstop above 0.6 lowers it."]
      ]],
      ["h3", "The backstop"],
      ["p", "The weights of the instruments in use, the adopted proposals, the common funds, treaty changes and initiatives add up to a sum S, and the backstop is 1 - exp(-1.3 S), a share from 0 to 1."],
      ["h3", "Money between states"],
      ["p", "A TARGET2 balance is the record plus a gap: each point of spread above the record moves 1.2% of output out a year, each point of bank stability lost 0.2%, and the gap falls by 15% a year."],
      ["h3", "The euro area"],
      ["p", "Euro area figures weigh the members by output, with shares of about 2019 rescaled to the members of each year; unemployment is weighted by the labor force. Trust in the bank falls with unemployment, inflation above target and a seat in the Troika; the far-right share rises with unemployment and falls with lower interest rates and more support for the periphery."],
      ["h3", "The advisors' forecasts"],
      ["p", "Each school forecasts by running the same model on a copy of your run with its own beliefs about the parameters, so it is right in the conditions its beliefs fit."],
      ["h3", "Further reading"],
      ["p", "The game's files hold the full description: docs/model.md for the model and DATA.md for every source."]
    ] },
    { id: "real", title: "The real bank", icon: "week", blocks: [
      ["p", "The European Central Bank publishes no program like this game. Its website, ecb.europa.eu, explains its tasks and publishes its decisions. This section describes, from those public sources, how the work of the bank and of its president is done, and where the game differs."],
      ["h3", "How decisions are made"],
      ["ul", [
        ["Many people decide", "The Governing Council takes the decisions: the six members of the Executive Board and the governors of the national central banks of the euro area, 26 people in 2025. The president chairs it and has one vote."],
        ["Rotation", "Since 2015 the governors take turns to vote. The governors of the five largest economies share four votes, the other governors share eleven, and the six members of the Executive Board always vote."],
        ["Agreement", "Most decisions are reached by agreement after discussion, without a formal vote. How each member voted is not published; the accounts of each monetary policy meeting appear four weeks later, without names."],
        ["Meetings", "The Council meets every six weeks to set monetary policy, and holds further meetings on supervision, payments and the bank's own management."],
        ["Preparation", "Staff of the bank and of the national central banks prepare each decision for weeks, in committees. Four times a year they publish projections of growth and inflation, in March, June, September and December."]
      ]],
      ["h3", "The president's work"],
      ["ul", [
        ["Term", "Eight years, which cannot be renewed (Art. 283 TFEU). The European Council appoints the president by qualified majority, after consulting the European Parliament and the Governing Council."],
        ["Press conferences", "After each monetary policy meeting, the president and the vice-president explain the decision at a press conference and answer journalists' questions. In the week before each meeting, members of the Council make no statements on monetary policy."],
        ["The Parliament", "The president appears four times a year before the committee on economic and monetary affairs of the European Parliament, in the Monetary Dialogue, and presents the bank's annual report to the full Parliament."],
        ["Other meetings", "The president is invited to meetings of the Council of the EU that discuss the bank's tasks (Art. 284 TFEU), attends the Eurogroup, and meets other central bankers at the G20 and at the Bank for International Settlements in Basel."],
        ["Most of the time", "Reading briefings, chairing meetings and speaking with governors, ministers and other central bankers. A decision is rarely taken by one person at one moment."]
      ]],
      ["h3", "The bank as a workplace"],
      ["ul", [
        ["Staff", "About 5,000 people from every member state work for the bank, most of them in Frankfurt. Its working language is English."],
        ["Supervision", "Since November 2014 the bank also supervises the largest banks of the euro area directly, through its Supervisory Board. Staff of the national supervisors work in joint teams with its staff."],
        ["Rules for staff", "Staff and members of the Council follow a code of conduct, with rules on their own investments, on gifts and on work after they leave."]
      ]],
      ["h3", "Where the game differs"],
      ["ul", [
        ["Time", "A turn is a year. In reality a decision is prepared over weeks, and its effects on prices and jobs show over one to two years."],
        ["One player", "The game gives you choices that, in reality, the Governing Council, governments and supervisors share. No president can act alone."],
        ["Figures", "The model is simpler than the economy it describes; Figures and sources explains how."],
        ["After 2025", "Events follow Selk's history, which is fiction, not a forecast."]
      ]],
      ["p", "The bank's website publishes every decision, the accounts of the Council's meetings, the president's speeches and the press conferences with their recordings."]
    ] },
    { id: "bias", title: "Bias disclosure", icon: "bias", blocks: [
      ["p", "The game has a point of view. This page states it, so that players can weigh the game's choices against it."],
      ["h3", "The designer's position"],
      ["p", "The designer is eurosceptic and in favor of more Europe at the same time. The scepticism concerns the Union as it works today and how it handled the euro crisis: decisions taken outside elected bodies, conditions imposed on states through the Troika, and the central bank's powers used to pressure governments. The support for more Europe concerns common debt, a common budget and democratic control of the common institutions."],
      ["h3", "How the position shapes the game"],
      ["ul", [
        ["The intended path", "It avoids the Troika and the Draghi measures and uses other tools the law allows. Every lawful tool stays open, those two included."],
        ["After 2025", "Events follow the history told in Selk, in which the Union becomes the Federation of Europe in 2041."],
        ["The model", "The economic model, the advisors' schools and the events after 2025 are the designer's choices. Among the advisors are schools that disagree with the designer, such as the Ordoliberal and Austrian ones, and each school is right in some situations."],
        ["The figures", "From 2008 to 2025 the events and figures follow the published record. DATA.md lists the sources and how far to trust them."]
      ]],
      ["h3", "Why hard euroscepticism is not playable"],
      ["p", "A hard eurosceptic position, one that aims to end the euro or the Union, has no place in the game, because the player is the president of the European Central Bank. The treaties created the office to run the euro, and its powers exist only inside the common currency. A president who worked to end the euro would act against the office itself. The game therefore counts the breakup of the euro as a loss, and a single state leaving as a setback."]
    ] },
    { id: "eula", title: "A fictional license", icon: "license", blocks: [
      ["p", "The agreement below is fiction, written for the game. The European Central Bank did not write it and does not issue it. It shows the terms that the bank of the game could set for the program its president uses, drawn from the bank's real rules. None of them applies to you: the last part of this page states the license that does."],
      ["h3", "End-user license agreement"],
      ["ul", [
        ["1. Parties", "This agreement is made between the European Central Bank (the bank) and the person who holds the office of its president (the user). The program is licensed to the office, not to the person, and passes to the next president."],
        ["2. Term", "The license runs for the user's term of office, eight years, and cannot be renewed (ECB Statute, Art. 11.2). It ends earlier if the user resigns or is retired by the Court of Justice (Art. 11.4)."],
        ["3. Independence", "The user takes no instructions on the use of the program from any government or body of the Union (Art. 130 TFEU), and lets no government use the program on the user's behalf."],
        ["4. Confidentiality", "The deliberations shown in the program are confidential (ECB Statute, Art. 10.4). The user does not publish the expected votes of the members of the Governing Council or how each member voted."],
        ["5. Professional secrecy", "The user keeps secret the information covered by professional secrecy, also after leaving office (ECB Statute, Art. 37)."],
        ["6. Statements", "The user makes no statement on monetary policy in the week before a monetary policy meeting."],
        ["7. Financial dealings", "The user does not use information from the program to buy or sell financial assets, and lets no one else do so, under the code of conduct for high-level officials of the bank."],
        ["8. Records", "Every decision taken in the program is kept in its archive and may be made public under the bank's rules on public access to its documents (Decision ECB/2004/3)."],
        ["9. Responsibility", "The bank is not liable for the economic results of the user's decisions. The user accounts for them to the European Parliament, to which the bank reports (Art. 284 TFEU)."],
        ["10. Disputes", "Disputes under this agreement go to the Court of Justice of the European Union (ECB Statute, Art. 35)."],
        ["11. Changes", "The bank may change this agreement by a decision of the Governing Council."]
      ]],
      ["h3", "The license that applies"],
      ["p", "This program does not belong to the European Central Bank, and none of the terms above applies to you. Its code is free software under the GNU General Public License, version 3: you may run it, study it, share it and change it. Its texts and data are under the Creative Commons Attribution-ShareAlike 4.0 license: you may share and adapt them, naming the source and sharing the result under the same license. The licenses are in the licenses folder; files from other projects keep their own, listed in vendor/README.md."]
    ] }
  ];
})();
