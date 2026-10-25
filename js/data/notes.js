/* Footnotes: short explanations in plain words of the harder ideas on the
   cards. Each note has a title, a text, and the phrases its number attaches
   to (anchor). A note can point to other notes with [[id]]; the game numbers
   the notes in the order they appear and adds a linked note to the list when
   the reader opens it. Glossary terms in a note are linked too.

   S.CARD_NOTES lists the notes of each card. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  S.NOTES = {
    "bank-guarantee": {
      title: "A state guarantee for banks",
      anchor: ["guarantees all deposits", "guarantee"],
      text: "A government promises to pay a bank's debts if the bank cannot. Savers and lenders stop taking money out, because the state will pay if the bank cannot. The risk is that the bank's losses become the state's losses: in Ireland the guarantee covered about €400 billion, more than twice the country's yearly output, and the cost of the failed banks later raised Irish public debt from 25% to over 110% of GDP. See [[doom-loop]]."
    },
    "doom-loop": {
      title: "The loop between banks and states",
      anchor: ["doom loop", "weak banks and weak governments"],
      text: "Banks own many bonds of their own government, and the government rescues its own banks when they fail. When the government looks weak, its bonds lose value and the banks lose money. When the banks look weak, everyone expects the government to pay for them, and its bonds lose value. Each makes the other weaker. A common European fund for bank rescues, or deposit insurance shared by all states, would end this link. See [[bank-guarantee]] and [[backstop]]."
    },
    "spread": {
      title: "Why spreads matter",
      anchor: ["spreads", "spread"],
      text: "A spread is how much more a government pays than Germany to borrow for ten years. A spread of 5 points means paying 5% more interest every year on new debt. Above about 6 or 7 points, most states cannot keep borrowing for long, and they turn to other governments for a loan. See [[panic]]."
    },
    "panic": {
      title: "Why fear of default raises the risk of default",
      anchor: ["expect the euro may break up", "can no longer borrow"],
      text: "If lenders fear a state will not repay, they ask for higher interest. Higher interest makes repaying harder, so the fear comes true. A state with its own central bank can always pay in its own money, so this rarely happens to it. Euro members do not control their central bank, so it can happen to them (De Grauwe, 2011). A [[backstop|backstop]] stops it, if markets believe in it."
    },
    "backstop": {
      title: "A backstop",
      anchor: ["backstop", "common backstop"],
      text: "A promise by someone with very large funds to buy or guarantee a state's debt if markets panic. If people believe the promise, the panic stops, and the promise often never has to be used. After the bank's 2012 pledge, Spanish and Italian spreads fell although the bank never bought a bond under it. In this game the backstop rises with the bank's instruments and with what governments agree to, such as eurobonds or debt conversion."
    },
    "collateral": {
      title: "Why collateral decides who gets money",
      anchor: ["collateral", "eligible as collateral"],
      text: "When the central bank lends to a bank, the bank must pledge assets the central bank accepts, such as government bonds. If the loan is not repaid, the central bank keeps them. Banks own many bonds of their own state. If the central bank stops accepting those bonds, the state's banks can no longer borrow from it, and some may have to close. So the central bank's list of accepted bonds can decide whether a state's banks survive. See [[waiver]] and [[ela]]."
    },
    "waiver": {
      title: "A waiver for a state's bonds",
      anchor: ["waiver", "minimum rating"],
      text: "The bank's rules accept only bonds with a good enough credit rating. A waiver sets the rule aside for one state, so its bonds stay usable as [[collateral|collateral]] even after rating agencies downgrade them. Lifting the waiver, as in February 2015 for Greece, means that state's banks can no longer get normal loans from the central bank."
    },
    "no-expulsion": {
      title: "No way to expel a member from the euro",
      anchor: ["no rule expels a member from the euro", "no treaty provides for"],
      text: "A state may leave the EU if it chooses (Article 50 of the Treaty on European Union), and it then leaves the euro too. The treaties have no rule for leaving only the euro, and none for expelling a member. The exchange rates of the old currencies were fixed for good (Article 140 TFEU). So the bank has no legal basis to expel a state, and the Court of Justice can cancel acts of the bank (Article 263 TFEU)."
    },
    "article-7": {
      title: "Article 7",
      anchor: ["Article 7"],
      text: "Article 7 of the Treaty on European Union protects the Union's values, such as the rule of law. It works in two steps. First, the European Council finds a serious and lasting breach; every government except the one concerned must agree. Then the Council of the EU can suspend some of that state's rights, such as its votes, by a qualified majority. The procedure was opened against Poland in 2017 and Hungary in 2018. Neither case reached the first step, because each state could block the vote on the other."
    },
    "governor-dismissal": {
      title: "Dismissing a central bank governor",
      anchor: ["dismissed the governor", "dismissal"],
      text: "The governor of each national central bank sits on the Governing Council. A government may dismiss its governor only if the governor no longer meets the conditions of the office or is guilty of serious misconduct (Art. 14.2 of the Statute of the ESCB and the ECB). The governor, or the Governing Council, can ask the Court of Justice to cancel a dismissal. In February 2019 the Court cancelled Latvia's decision to bar its governor, Ilmārs Rimšēvičs, from office (Joined Cases C-202/18 and C-238/18). It was the first such ruling."
    },
    "ela": {
      title: "Emergency liquidity (ELA)",
      anchor: ["emergency liquidity", "liquidity"],
      text: "When a bank has no more of the [[collateral|collateral]] the central bank accepts, its national central bank can still lend to it against weaker assets. The national bank takes the risk. This is emergency liquidity assistance. The Governing Council can stop it with a two-thirds vote. When it was frozen for Greek banks on 28 June 2015, the banks had to close."
    },
    "memorandum": {
      title: "What a memorandum contains",
      anchor: ["memorandum", "conditions"],
      text: "A loan program comes with a memorandum of understanding: a list of measures the borrowing government must take, each tied to a payment. The Greek memoranda included cuts to wages, pensions and public services, tax rises, sales of public companies and changes to labor law. If a review finds a target missed, the next payment waits. See [[troika]]."
    },
    "troika": {
      title: "Why the bank sat in the Troika",
      anchor: ["Troika"],
      text: "The Commission, the IMF and the central bank set the loan conditions together and checked that they were met. Critics saw a conflict: the central bank also decides whether a country's banks get money. It could use that power to pressure the government into accepting the conditions. See [[memorandum]] and [[ela]]."
    },
    "smp": {
      title: "Buying bonds without printing money",
      anchor: ["Securities Markets Programme", "take the same amount of money back"],
      text: "Under the SMP the bank bought government bonds from investors. The treaty forbids buying them directly from governments. To keep the amount of money in the economy the same, the bank took the same amount back: it paid banks to leave deposits with it. The purchases lowered spreads for a while. They had a limit, and markets knew it."
    },
    "omt": {
      title: "Whatever it takes",
      anchor: ["whatever it takes", "without limit"],
      text: "In July 2012 the bank's president said it would do whatever it takes to preserve the euro. In September the bank explained how: it would buy, without limit, short-term bonds of any state that signs an ESM program. The promise alone lowered spreads, and it was never used. The condition, a program, comes with a [[memorandum|memorandum]]. See [[backstop]]."
    },
    "psi": {
      title: "Losses for private creditors",
      anchor: ["take a 53.5% loss", "private creditors take losses", "creditors should take losses"],
      text: "In March 2012 private owners of Greek bonds exchanged them for new bonds worth less: they lost 53.5% of the amount owed. Greek debt fell. But Greek banks and pension funds owned many of those bonds, so they had to be rescued with new public loans. The central bank did not exchange its own Greek bonds."
    },
    "deauville": {
      title: "Deauville, October 2010",
      anchor: ["Deauville"],
      text: "At a meeting in the French town of Deauville, the German chancellor and the French president agreed that private lenders should share losses in future rescues. Investors concluded that euro government bonds could lose value, and spreads in the periphery rose. See [[spread]] and [[psi]]."
    },
    "ltro": {
      title: "Long loans to banks",
      anchor: ["three years", "3-year"],
      text: "Normally the bank lends to banks for a week or three months. In December 2011 and February 2012 it lent about €1 trillion for three years at a low rate. Banks used part of it to buy their own government's bonds. Spreads fell, and banks became even more dependent on their own state. See [[doom-loop]]."
    },
    "negative": {
      title: "A negative interest rate",
      anchor: ["below zero", "negative"],
      text: "Banks keep spare money at the central bank overnight. Normally they earn a little interest on it. With a negative rate they pay a fee, so they have a reason to lend the money out. It also lowers bank profits."
    },
    "qe": {
      title: "Quantitative easing",
      anchor: ["capital key", "quantitative easing", "purchases of government bonds in proportion"],
      text: "The bank creates money to buy large amounts of bonds from investors. Long-term interest rates fall, and the investors who sold the bonds buy other assets with the money. The bank bought each state's bonds in proportion to that state's share in the bank's capital, so it bought the most German bonds."
    },
    "weiss": {
      title: "The German court and the bank",
      anchor: ["Constitutional Court"],
      text: "Germans who opposed the bank's bond purchases took the case to their Constitutional Court. In 2018 the European Court of Justice ruled that the purchases were legal (Weiss). In May 2020 the German court ruled that the bank had not shown the purchases were proportionate, that is, that their benefits outweighed their side effects. The bank answered by publishing its reasoning. The case showed that national courts can challenge the bank."
    },
    "esm": {
      title: "The stability fund",
      anchor: ["stability fund", "ESM"],
      text: "The European Stability Mechanism, in force since September 2012, is a fund owned by the euro states that lends to a member in trouble. Its loans come with a [[memorandum|memorandum]]. Before it, a temporary fund, the EFSF, and loans from each government did the same."
    },
    "fiscal-compact": {
      title: "The Fiscal Compact",
      anchor: ["balanced budgets"],
      text: "A treaty of 2012. Governments promised to write a balanced-budget rule into their own law, with automatic corrections when the deficit is too high. Supporters said it would make investors trust governments again. Critics said it forces cuts during a recession, when cuts do the most harm. See [[multiplier]]."
    },
    "multiplier": {
      title: "Why cuts can shrink the economy",
      anchor: ["multiplier", "deepens it", "deepen it"],
      text: "When a government cuts spending by one euro, the economy shrinks by some amount: that amount is the multiplier. In normal times it is about half a euro. In a deep recession, with interest rates already near zero, research found it above one (Blanchard and Leigh, 2013). Cuts then shrink the economy so much that debt as a share of output can rise."
    },
    "bail-in": {
      title: "A bail-in",
      anchor: ["large depositors", "bail-in"],
      text: "The state does not rescue a failing bank. The bank's owners and bondholders take the losses, and in Cyprus in 2013 so did depositors with more than €100,000. Deposits up to €100,000 are protected by law."
    },
    "rotation": {
      title: "Taking turns to vote",
      anchor: ["rotation", "vote by rotation"],
      text: "With 19 or more governors, not all of them vote every month. The five largest economies share four votes and the others share eleven, taking turns. The six members of the Executive Board always vote."
    },
    "convergence": {
      title: "Joining the euro",
      anchor: ["convergence report", "criteria"],
      text: "A state may adopt the euro when its inflation, interest rates, deficit and debt are close to those of the members and its currency has been stable for two years. The bank and the Commission each write a report; the Council of the EU decides."
    },
    "art123": {
      title: "Why the bank may not lend to governments",
      anchor: ["Art. 123", "first sold"],
      text: "The treaties forbid the central bank to lend to governments or to buy their bonds when they are first sold. The rule was written so that governments could not pay their bills by creating money, which can cause high inflation. The bank may buy bonds later from investors, as with the [[smp|SMP]] and quantitative easing."
    },
    "independence": {
      title: "An independent central bank",
      anchor: ["independence", "instruct the bank"],
      text: "The treaties forbid governments to give the bank orders (Art. 130 TFEU), so that governments cannot make it keep rates too low before elections. Critics on the left, and in Selk's history the European Left Alliance, answered that a body this powerful should report to an elected parliament. See [[selk]]."
    },
    "supply-shock": {
      title: "A supply shock",
      anchor: ["supply shock", "failed harvests", "Floods", "heatwave", "Drought"],
      text: "Prices can rise because people buy more (demand) or because less can be produced (supply), as after a drought or an energy cut. Higher interest rates reduce demand. They cannot replace a lost harvest, so against a supply shock they mainly cost jobs. Central banks usually make no change, unless the higher prices start to raise wages and the prices people expect."
    },
    "modest": {
      title: "The Modest Proposal",
      anchor: ["Modest Proposal", "ECB bonds"],
      text: "A plan published by Yanis Varoufakis and Stuart Holland in 2010. For each state, the bank would pay the part of its debt up to 60% of output with bonds it issues itself. Each state would repay the bank slowly, at the bank's low rate. No state would guarantee another's debt. Critics said it came close to breaking [[art123|Art. 123 TFEU]]."
    },
    "selk": {
      title: "Selk",
      anchor: ["Selk"],
      text: "Selk is a browser game by the designer of this one, set in 2097 at a research base on Saturn's moon Titan. Its archive tells a history of Europe after 2025: far-right governments until about 2031, climate strikes from 2033, the Federation of Europe in 2041 with one budget and one debt, and the 2045 reforms that make the central bank answer to the Federal Parliament. From 2026 this game follows that history."
    },
    "federation": {
      title: "The Federation of Europe",
      anchor: ["Federation", "Federal Treaty"],
      text: "In the history of [[selk|Selk]] the European Union becomes a federation in 2041 after referendums in every state: an 800-seat Federal Parliament, an upper chamber of three members per state, one federal budget and one debt. Member states keep schools, police and local planning."
    },
    "full-allotment": {
      title: "Unlimited loans to banks",
      anchor: ["full allotment"],
      text: "Normally the bank lends banks a set amount each week by auction, and banks bid for it. With full allotment at a fixed rate, every bank receives the whole amount it asks for at the main rate, if it pledges [[collateral|collateral]]. A sound bank then never fails just because it cannot borrow."
    },
    "junk": {
      title: "A rating of junk",
      anchor: ["junk"],
      text: "Rating agencies grade bonds from AAA, the safest, down to D, a default. Below BBB- a bond counts as junk. Many funds must then sell it, and under its normal rules the bank stops accepting it as collateral. See [[waiver]]."
    },
    "covered-bonds": {
      title: "Covered bonds",
      anchor: ["covered bonds"],
      text: "A covered bond is a bond a bank sells with some of its home loans set aside as security for the buyers. When investors stopped buying these bonds in 2008 and 2009, banks had less money to lend for homes. The bank's purchases let that lending continue."
    },
    "recap": {
      title: "Putting capital into a bank",
      anchor: ["capital into", "need capital", "needs capital"],
      text: "A bank's capital is its owners' money, which pays for losses first. When losses use it up, someone must put in new capital or the bank closes. If the state pays, its debt rises; if a common European fund pays, all member states share the cost. See [[doom-loop]]."
    },
    "guidance": {
      title: "Saying what comes next",
      anchor: ["for a long time", "guidance"],
      text: "If the bank says it will keep rates low for a long time, lenders expect cheap loans for years and lower the rates on long loans now. The statement costs nothing. It works only while people believe the bank will keep its word."
    },
    "stress-test": {
      title: "A stress test",
      anchor: ["stress test", "test found"],
      text: "The supervisor calculates what each bank would lose in an imagined severe recession. A bank whose capital would fall below the minimum must raise more, by selling shares or keeping its profits. A strict test finds more weak banks; a mild one leaves the problems for later."
    },
    "capital-controls": {
      title: "Closed banks and limits on withdrawals",
      anchor: ["capital controls", "closed for three weeks"],
      text: "To stop all deposits from leaving at once, a government can close the banks and limit how much each person may take out. In Greece in July 2015 the limit was €60 a day per person, and payments abroad needed approval. Some limits stayed until 2019."
    },
    "bank-run": {
      title: "A bank run",
      anchor: ["taking their deposits out"],
      text: "A bank lends out most of its deposits, so it cannot pay all depositors at once. When people fear it will fail, many take their money out together, and even a sound bank can then run out of cash. Deposit insurance and [[ela|emergency liquidity]] exist to prevent this."
    },
    "pepp": {
      title: "Pandemic purchases",
      anchor: ["Pandemic Emergency Purchase Programme", "PEPP"],
      text: "In 2020 and 2021 the bank bought government and company bonds for up to €1.85 trillion. Under [[qe|quantitative easing]] the bank had to buy each state's bonds in proportion to its share in the bank's capital. Under PEPP it could buy more of one state's bonds than that share, so it could help the states with the highest spreads."
    },
    "tpi": {
      title: "The Transmission Protection Instrument",
      anchor: ["Transmission Protection Instrument", "TPI"],
      text: "When the bank raises rates, the borrowing costs of every state should rise by about the same amount. If one state's spread rises much more, and the state's own finances do not explain it, the bank can buy that state's bonds. The state must still follow the EU's fiscal rules. By 2025 the instrument had not been used."
    },
    "ngeu": {
      title: "Borrowing together in 2020",
      anchor: ["NextGenerationEU", "joint borrowing"],
      text: "For the first time the Commission borrowed large sums for the whole EU, up to €750 billion, and paid them to member states as grants and loans. The EU repays the debt until 2058. Supporters of common debt saw it as a model for [[backstop|a common backstop]]."
    },
    "symmetric": {
      title: "A symmetric target",
      anchor: ["symmetric"],
      text: "Until 2021 the target was inflation below, but close to, 2%. Many read this as: lower is safer. Since 2021 the target is 2%, and the bank treats inflation below it as just as unwelcome as inflation above it."
    },
    "dual-mandate": {
      title: "Two tasks for the bank",
      anchor: ["full employment", "dual mandate", "employment objective"],
      text: "The treaties make stable prices the bank's first task (Art. 127 TFEU). The US Federal Reserve has two equal tasks, stable prices and maximum employment. With two equal tasks, the bank would give unemployment as much weight as inflation when it sets rates."
    },
    "digital-euro": {
      title: "A digital euro",
      anchor: ["digital euro"],
      text: "The only central bank money people can have today is cash. Money in a bank account is a debt of a private bank to the owner of the account. A digital euro would let anyone have central bank money in an app or on a card. Supporters say public money should exist for digital payments too; critics fear that savers would move deposits out of banks in a crisis."
    },
    "swap-line": {
      title: "Swap lines",
      anchor: ["Swap lines", "lend pounds"],
      text: "Two central banks agree to exchange their currencies for a set time. The bank can then lend pounds to euro area banks that need them, and the Bank of England can lend euros to British banks."
    },
    "net-purchases": {
      title: "Ending purchases",
      anchor: ["net purchases", "still buying bonds"],
      text: "When a bond the bank owns is repaid, the bank can buy a new one, so its stock of bonds stays the same size. Net purchases are the purchases beyond these replacements. Ending net purchases stops the stock from growing. Ending the replacements too makes it smaller each year."
    },
    "precautionary": {
      title: "A precautionary recapitalization",
      anchor: ["precautionary recapitalization"],
      text: "EU rules normally require a bank's shareholders and bondholders to take losses before public money is used: a [[bail-in|bail-in]]. There is an exception for a bank that is still sound but would have too little capital in a [[stress-test|stress test]]: the state may put in capital first. Italy did so for Monte dei Paschi in 2017, after the bank's junior bonds, the ones repaid last, were turned into shares."
    },
    "rate-cap": {
      title: "A legal cap on rates",
      anchor: ["cap the bank's main rate"],
      text: "In the history of [[selk|Selk]] the bank reports to the Federal Parliament from 2045, so a law can limit its rates. A cap keeps loans cheap for governments and households. It also takes away the bank's main tool against inflation."
    },
    "private-money": {
      title: "Private payment networks",
      anchor: ["own tokens", "private tokens"],
      text: "A company can let its customers pay each other in tokens it issues itself. If many people use them, the company decides the rules for those payments, and if the company fails, the tokens can become worthless."
    },
    "haircut": {
      title: "A haircut on collateral",
      anchor: ["haircuts", "haircut", "lower the value the bank gives"],
      text: "When a bank pledges an asset worth €100, the central bank may lend only €90 against it: a haircut of 10%. Riskier assets get larger haircuts, so the central bank is still repaid if their price falls."
    },
    "greek-loans": {
      title: "The Greek loans",
      anchor: ["loans of 2010 to 2018"],
      text: "From 2010 to 2018 Greece received about €290 billion in loans from euro area governments, the EFSF, the ESM and the IMF. Governments later lowered the rates and moved some payments as late as 2070, so Greece repays them for decades."
    },
    "turbo": {
      title: "Turbocapitalism",
      anchor: ["Turbocapitalist", "turbocapitalist"],
      text: "In the history of [[selk|Selk]], the factions that want private companies to own infrastructure in space, with tax havens and few rules. Their best-known company, HX Holdings, is founded in 2071 by Halvorsen Relay and Xiran Spaceports."
    }
  };

  S.CARD_NOTES = {
    rate: ["multiplier"],
    "irish-guarantee": ["bank-guarantee", "doom-loop"],
    lehman: ["ela", "full-allotment"],
    "collateral-2008": ["collateral", "junk"],
    "greek-revision": ["spread"],
    "gr-waiver": ["waiver", "collateral", "junk"],
    "gr-program": ["memorandum", "troika", "spread"],
    smp: ["smp", "art123"],
    deauville: ["deauville", "panic"],
    "ie-program": ["ela", "bank-guarantee"],
    "pt-program": ["memorandum", "troika"],
    letters: ["spread", "smp", "modest"],
    ltro3y: ["ltro", "doom-loop"],
    "gr-psi": ["psi", "memorandum"],
    "es-banks": ["doom-loop", "esm", "recap"],
    wit: ["omt", "backstop", "panic", "modest"],
    "fiscal-compact": ["fiscal-compact", "multiplier"],
    cy: ["bail-in", "ela", "recap"],
    "troika-review": ["memorandum"],
    neg: ["negative"],
    qe: ["qe", "weiss"],
    "gr-waiver-2015": ["waiver"],
    "gr-ela-2015": ["ela", "bank-run", "capital-controls"],
    "gr-third": ["memorandum", "esm"],
    "it-banks": ["bail-in", "precautionary"],
    pandemic: ["qe", "pepp"],
    program: ["memorandum", "troika", "spread", "art123"],
    "exit-crisis": ["ela", "waiver", "bank-run"],
    authoritarian: ["governor-dismissal", "article-7", "no-expulsion", "ela", "selk"],
    "auth-ruling": ["governor-dismissal"],
    "auth-article7": ["article-7"],
    "auth-squeeze": ["ela", "bank-run"],
    "auth-expulsion-court": ["no-expulsion"],
    "apply-euro": ["convergence"],
    independence: ["independence", "selk"],
    "heatwave-2033": ["supply-shock", "selk"],
    convention: ["independence", "federation", "dual-mandate"],
    confirm: ["federation", "dual-mandate"],
    "instruction-investment": ["independence"],
    "floods-2051": ["supply-shock"],
    "heat-2053": ["supply-shock"],
    "floods-2056": ["supply-shock"],
    "heat-2058": ["supply-shock"],
    "capital-flight": ["turbo"],
    energy: ["supply-shock"],
    "liquidity-review": ["full-allotment"],
    cbpp: ["covered-bonds"],
    guidance: ["guidance"],
    ssm: ["stress-test"],
    tpi: ["tpi"],
    ngeu: ["ngeu"],
    strategy: ["symmetric", "dual-mandate"],
    "digital-euro": ["digital-euro"],
    "relay-payments": ["private-money", "digital-euro"],
    brexit: ["swap-line"],
    taper: ["net-purchases"],
    "end-purchases": ["net-purchases"],
    restart: ["net-purchases"],
    "instruction-cap": ["rate-cap"],
    "collateral-review": ["haircut"],
    "green-collateral": ["haircut"],
    "spaceport-lobby": ["haircut"],
    "greek-legacy": ["greek-loans"],
    "greek-final": ["greek-loans"]
  };
})();
