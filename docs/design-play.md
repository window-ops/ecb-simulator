# Design: actors, instruments and advisors

[Back to the design document](design.md)

## 7. Actors

### 7.1 Governing Council

Members: the six members of the Executive Board, including the president, and the governor of each national central bank in the euro area. From January 2015, when Lithuania joined as the 19th member, governors vote by rotation: the five largest economies share 4 votes and the others share 11, with the Executive Board's 6 votes always held.

Each member has:

| Attribute | Range | Meaning |
| --- | --- | --- |
| Stance | Hawk to dove | Preference for tight or loose policy |
| Legal caution | Low to high | Resistance to new instruments |
| Home concern | Low to high | Weight given to their own country's banks and economy |
| Relation with the president | -100 to 100 | Changes with the president's choices and with persuasion |

Members gather in blocs (in 2008: the Bundesbank and its allies, the periphery governors, the Executive Board). Before a vote the player can see each member's leaning and spend an initiative to persuade one bloc. Members resign when the president's policy moves far from their views, as Axel Weber and Jürgen Stark did in 2011.

The difficulty, chosen with each new game and kept with the run (`Gm.DIFFICULTY` in `js/model/game.js`), sets how readily members follow:

| Level | Willingness | Weight of the stance gap | Relation that moves a vote by one | Rise in a proposal's support, against Normal |
| --- | --- | --- | --- | --- |
| Normal | 0.9 | 0.8 | 150 | 100% |
| Realistic | 0.65 | 1 | 100 | 70% |
| Hard | 0.6 | 1.05 | 90 | 50% |

In automatic play over the first twelve years, Normal passes every vote. Realistic passes the historical choices but rejects about two in five of the most extreme options. Hard rejects about one historical choice in eight and nearly two in three of the extreme options.

### 7.2 Others

| Actor | Role in the game |
| --- | --- |
| Governments of the member states | Set national budgets, request programs, accept or refuse proposals, hold elections |
| Eurogroup and European Council | Decide on loans, ESM, common debt, treaty change, the appointment of the president |
| European Commission | Runs the fiscal rules, takes part in programs |
| IMF | Lends with conditions, takes part in the Troika |
| European Parliament | Hearings, resolutions, elections in 2009, 2014, 2019, 2024, 2029, 2034, 2039 |
| Courts | The Court of Justice and national constitutional courts |
| Markets | Set bond yields, spreads and bank funding costs |
| Public | Trust in the bank, votes in national and European elections |

After 2041 the Federal Parliament, the Federal Council and the elected Commission replace most of these roles. Turbocapitalist factions, which in Selk sit in several member parliaments and back private control of off-world infrastructure, push for low regulation, move capital to tax havens and back private payment networks.

## 8. Instruments

Each instrument has a tag: **intended** (one of the four intended paths), **Draghi** (one of the Draghi measures), **Troika**, or **neutral**.

| Instrument | Legal basis | From | Tag |
| --- | --- | --- | --- |
| Policy rates (main refinancing, deposit facility) above zero | Statute Art. 18 | 2008 | intended when used to avoid the July 2008 and 2011 rises, neutral otherwise |
| Negative deposit rate | Statute Art. 18 | 2008 | Draghi |
| Unlimited loans at the main rate (full allotment) | Statute Art. 18 | 2008 | neutral |
| Longer refinancing operations, up to 1 year | Statute Art. 18 | 2008 | neutral |
| Targeted long loans to banks (TLTRO) | Statute Art. 18 | 2008 | Draghi |
| Collateral rules: rating thresholds, haircuts, waivers for program countries | Statute Art. 18 | 2008 | intended |
| Not objecting to emergency liquidity (ELA), raising its cap, without political conditions | Statute Art. 14.4 | 2008 | intended |
| Restricting or freezing ELA | Statute Art. 14.4 | 2008 | neutral |
| Covered bond purchases | Statute Art. 18 | 2009 | neutral |
| Purchases of EIB bonds in the secondary market | Statute Art. 18 | 2008 | intended (see open question 3) |
| Securities Markets Programme (SMP) | Statute Art. 18 | 2010 | Draghi |
| "Whatever it takes" pledge and OMT | Statute Art. 18 | 2012 | Draghi |
| Quantitative easing (PSPP) | Statute Art. 18 | 2015 | Draghi |
| Joining Troika missions | Program regulations, ESM Treaty Art. 13 | 2010 | Troika |
| Letters to governments | None; political | 2008 | neutral, costs trust |
| Opinions on draft Union law | Art. 127(4) TFEU | 2008 | neutral |
| Proposals to the Council and the Eurogroup | None; the governments decide | 2008 | intended |
| Monetary Dialogue hearings | Art. 284(3) TFEU | 2008 | neutral |
| Forward guidance and speeches | None | 2008 | neutral |
| Banking supervision: stress tests, capital demands | Art. 127(6) TFEU, SSM Regulation | Nov 2014 | neutral |
| Treaty campaign | Art. 48 TEU | 2008 | neutral |

The player can use every instrument. The tags feed the ending ([section 15](design-model.md)) and the advisors' comments, and never block an action.

## 9. The Troika and memoranda

A program country receives loans from euro area governments (later the EFSF and the ESM) and the IMF. In return the government signs a memorandum of understanding that lists conditions attached to each payment: spending cuts, tax rises, sales of public assets and changes to labor law. In history the ECB took part in the negotiation and review of these conditions with the Commission and the IMF.

When a memorandum reaches the agenda, the player chooses the bank's role:

| Option | Effect |
| --- | --- |
| Full Troika member | The historical role: the bank negotiates and reviews the conditions |
| Advisory only | The bank publishes an opinion and stays out of the negotiation |
| Refuse | The bank takes no part; governments may still lend with the Commission and the IMF |

Governments, the Commission and the IMF decide whether a program goes ahead. The bank's role changes the terms, the bank's standing with each side, and public trust in the program country. Memoranda that appear in the game reproduce the terms on public record:

| Program | Date | Size |
| --- | --- | --- |
| Greece, first | May 2010 | €110 billion: €80 billion from euro area governments, €30 billion from the IMF |
| Ireland | November 2010 | €85 billion, including €17.5 billion of Ireland's own funds |
| Portugal | May 2011 | €78 billion |
| Greece, second | March 2012 | €130 billion, with private creditors taking a 53.5% loss on the face value of their bonds |
| Spain, banks | July 2012 | Up to €100 billion |
| Cyprus | March 2013 | €10 billion, with losses imposed on large depositors |
| Greece, third | August 2015 | Up to €86 billion from the ESM |

## 10. Proposals to governments

The bank cannot create a common debt or a stability fund. The player can propose them, and the governments decide. Each proposal has a support level in the Eurogroup and the European Council, which rises with the player's standing, the support of Parliament, and the pressure of the crisis.

Proposals available before 2041:

| Proposal | Content |
| --- | --- |
| Eurobonds | Common bonds issued jointly by the euro area governments |
| The "Modest Proposal" | Published by Yanis Varoufakis and Stuart Holland in November 2010, version 4.0 with James K. Galbraith in July 2013. Four programs: a case-by-case bank program (the ESM recapitalizes banks directly), a limited debt conversion program (the bank services the part of each state's debt within the 60% Maastricht limit through its own bonds), an investment-led recovery and convergence program led by the EIB, and an emergency social solidarity program for food and energy |
| Debt conversion | Exchange of program loans for long bonds at low rates |
| EIB investment program | A larger capital base for the EIB and a common investment plan |
| Stability fund rescues of banks | Breaks the link between national debt and national banks |
| Common deposit insurance | Deposits in every member state backed by a common fund |

Several of these proposals were contested in law and in politics. The game shows the case made for each and the case made against it.

## 11. Advisors

The player fills 3 seats from 9 schools and can replace one advisor a year. The advisors are fictional characters. The names below are placeholders.

| School | Placeholder name | Main claims | Typical advice in the crisis | Where the school's forecasts go wrong in the model |
| --- | --- | --- | --- | --- |
| Ordoliberal | Henrike Albers, German | Price stability, firm rules, no monetary financing, conditions for every loan | Raise rates against inflation, back the Troika, oppose bond purchases | Underestimates the cost of spending cuts in a recession |
| Monetarist | Pieter van Doorn, Dutch | The money supply drives prices | Keep money growth steady; purchases against deflation | Misreads demand collapses where the money supply stays steady |
| New Keynesian | Élise Marchand, French | Rates, expectations, a lender of last resort with conditions | Cut rates, give guidance, a backstop tied to programs | Underestimates the political cost of conditions |
| Post-Keynesian | Tomás Ferreira, Portuguese | Demand and wages drive output, imbalances between members | Common debt, wage growth in surplus countries, an unconditional backstop | Underestimates inflation once the economy is near capacity |
| Austrian | Lukas Ebner, Austrian | Cheap credit creates bad investment, rescues create moral hazard | Higher rates, no bailouts, early Greek restructuring with losses for creditors | Overestimates how fast markets recover after a bank failure |
| MMT | Siobhán Kerrigan, Irish | A state that issues its own currency cannot be forced into default; the euro members can | The bank guarantees all member debt, a job guarantee | Underestimates the legal limits and inflation from supply shocks |
| Socialist MMT | Eleni Vrettou, Greek | The MMT case plus public control of credit | Public banks, credit directed to public investment, capital controls in a crisis, cancellation of debt held by the bank | Underestimates capital flight and the legal cost |
| Eurocommunist | Giulia Ferrante, Italian | Democratic control of the bank, public ownership of energy and rail | Refuse the Troika, work with Parliament, campaign for treaty change | Overestimates how fast governments accept proposals |
| Ecological | Katarzyna Wilk, Polish | Climate risk is financial risk; growth has physical limits | Green collateral rules, EIB climate investment, preparation for climate shocks | Underestimates short-term unemployment costs |

Each advisor forecasts with the school's own parameters. The fiscal multiplier is one example: the ordoliberal advisor assumes a low one, the post-Keynesian a high one, and the model uses a multiplier that is low in normal times and high in a recession with rates near zero (Blanchard and Leigh, 2013). Each school is right in some conditions, and the player learns when to trust each one.

The advisors explain their advice in plain words, and each one names the evidence the school cites. Advisors can recommend Draghi measures and Troika membership; the monetarist and New Keynesian advisors recommend some of them.
