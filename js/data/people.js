/* Names for the president, by member state: given names for men (m) and
   women (f), and family names. A family name written "Kowalski/Kowalska"
   has a form for men and one for women; "_" stands for a space. order
   "family" puts the family name first, as in Romania and Hungary
   (Popescu Andrei, Nagy László). S.LANGS gives the language of each state,
   with the president's title in it, used when the name is left empty;
   LETTERS lists the letters with diacritics of each language, for the
   keyboard under the name. */
(function () {
  var S = window.ECBSIM;
  function list(s) { return s.trim().split(/\s+/).map(function (w) { return w.replace(/_/g, " "); }); }
  var P = {
    DE: { m: "Lukas Matthias Stefan Jürgen Felix Tobias Michael Andreas Frank Moritz Jan Christian Thomas Sebastian Uwe",
      f: "Katharina Sabine Jana Ute Miriam Julia Anja Claudia Petra Lena Franziska Susanne Birgit Nicole Hannah",
      s: "Becker Schäfer Hoffmann Krüger Wagner Lehmann Schulz Fischer Weber Meyer Richter Wolf Neumann Schwarz Zimmermann Braun Hartmann Lange Werner Köhler Böhm Schröder Vogel Engel Seidel" },
    FR: { m: "Julien Benoît Olivier Rémi Thierry Nicolas Guillaume Antoine François Hugo Mathieu Laurent Sébastien Yves Jérôme",
      f: "Camille Élodie Nathalie Margaux Céline Isabelle Sophie Aurélie Claire Hélène Manon Delphine Chloé Valérie Agnès",
      s: "Lefèvre Moreau Girard Rousseau Fontaine Chevalier Bernard Dubois Laurent Mercier Lambert Bonnet Faure Garnier Perrin Robin Clément Gauthier Roux Lemoine Picard Brunet Masson Lacroix Durand" },
    IT: { m: "Marco Giuseppe Alessandro Davide Niccolò Matteo Lorenzo Andrea Stefano Riccardo Federico Antonio Simone Emanuele Fabio",
      f: "Giulia Francesca Elena Martina Silvia Chiara Valentina Sara Alessandra Federica Roberta Ilaria Paola Beatrice Caterina",
      s: "Romano Esposito Colombo Ricci Marino Greco Bruno Gallo Conti De_Luca Mancini Costa Giordano Rizzo Lombardi Moretti Barbieri Fontana Santoro Mariani Rinaldi Caruso Leone Longo Galli" },
    ES: { m: "Pablo Sergio Íñigo Álvaro Jorge Javier Alejandro Rubén Daniel Carlos Manuel Raúl Adrián Óscar Fernando",
      f: "María Carmen Lucía Begoña Nuria Ana Elena Pilar Sonia Marta Rocío Inmaculada Cristina Ainhoa Montserrat",
      s: "García Fernández Martínez Núñez Ortega Muñoz López Sánchez Pérez Gómez Díaz Jiménez Ruiz Hernández Moreno Álvarez Romero Navarro Torres Domínguez Vázquez Ramos Gil Serrano Blanco" },
    NL: { m: "Daan Bram Sjoerd Thijs Maarten Jeroen Ruud Joris Sander Wouter Koen Bas Rutger Niels Gijs",
      f: "Femke Anouk Sanne Lieke Ingrid Esther Marloes Inge Annelies Floor Loes Mirjam Eva Noor Wendy",
      s: "de_Vries Bakker Visser Smit Mulder van_Dijk Jansen de_Jong Meijer de_Boer Bos Vos Peters Hendriks Dekker Brouwer de_Groot Kok Jacobs van_Leeuwen Verhoeven Kuipers Postma Schouten Willems" },
    BE: { m: "Wouter Jean-Luc Bart Olivier Kris Pieter Geert Thomas Arnaud Jeroen Frédéric Stijn Benoît Koen Didier",
      f: "Els Nathalie Ann Valérie Katrien Sofie Hilde Anne-Sophie Lieve Caroline An Griet Isabelle Inge Martine",
      s: "Peeters Janssens Dubois Maes Lambert Wouters Mertens Willems Claes Goossens Jacobs Lemaire Dupont Desmet Vermeulen Hermans Michel Martens Vandenberghe De_Smet Leclercq Renard Van_Damme Verstraete Cools" },
    AT: { m: "Florian Andreas Lukas Wolfgang Stefan Markus Christoph Martin Thomas Harald Gernot Clemens Bernhard Georg Johannes",
      f: "Johanna Theresa Barbara Magdalena Sabine Katharina Elisabeth Anna Verena Andrea Birgit Christina Monika Eva Ingrid",
      s: "Gruber Huber Bauer Wagner Pichler Moser Steiner Mayer Hofer Leitner Berger Fuchs Eder Fischer Schmid Winkler Weber Schwarz Maier Reiter Mayr Brunner Lang Baumgartner Auer" },
    IE: { m: "Seán Cian Pádraig Eoin Niall Conor Darragh Ronan Fionn Colm Diarmuid Liam Ciarán Donal Brendan",
      f: "Siobhán Niamh Aisling Clodagh Gráinne Orla Sinéad Róisín Caoimhe Áine Deirdre Maeve Úna Saoirse Nuala",
      s: "Murphy Kelly O'Sullivan Walsh Byrne Ó_Briain Ryan O'Connor O'Neill Doyle McCarthy Gallagher Lynch Quinn Kennedy Fitzgerald Ó_Ceallaigh Nolan Hayes Daly Brady Dunne Moloney Ó_Súilleabháin Keane" },
    FI: { m: "Mikko Juhani Antti Tapio Ville Jukka Timo Petri Sami Lauri Heikki Matti Olli Eero Pekka",
      f: "Aino Riikka Satu Johanna Päivi Anna-Maija Tiina Hanna Leena Minna Katja Sirpa Elina Outi Venla",
      s: "Virtanen Mäkinen Nieminen Hämäläinen Laine Koskinen Korhonen Järvinen Lehtonen Heinonen Salminen Turunen Lehtinen Kinnunen Salonen Laaksonen Hiltunen Ahonen Tuominen Rantanen Karjalainen Jokinen Mattila Savolainen Väisänen" },
    PT: { m: "João Tiago Gonçalo António Luís Pedro Rui Nuno Miguel Duarte Francisco Henrique Filipe Vasco Sérgio",
      f: "Inês Beatriz Joana Conceição Mariana Ana Rita Catarina Sofia Leonor Margarida Teresa Filipa Patrícia Susana",
      s: "Silva Gonçalves Magalhães Araújo Simões Santos Pereira Oliveira Costa Rodrigues Martins Fernandes Sousa Lopes Marques Ribeiro Pinto Carvalho Teixeira Moreira Correia Mendes Nunes Soares Vieira" },
    GR: { m: "Giorgos Nikos Kostas Stavros Alexandros Dimitris Yannis Panagiotis Christos Vasilis Michalis Thanasis Spyros Manolis Apostolos",
      f: "Maria Eleni Katerina Sofia Despina Georgia Dimitra Vasiliki Ioanna Anastasia Christina Angeliki Eirini Paraskevi Zoi",
      s: "Papadopoulos/Papadopoulou Nikolaidis/Nikolaidou Georgiou Vlachos/Vlachou Karagiannis/Karagianni Antoniou Papadakis/Papadaki Oikonomou Makris/Makri Konstantinidis/Konstantinidou Dimitriou Pappas/Pappa Alexiou Ioannidis/Ioannidou Theodorou Kotsis/Kotsi Lambrou Stavropoulos/Stavropoulou Michailidis/Michailidou Angelopoulos/Angelopoulou Zervas/Zerva Panagiotou Christodoulou Sarris/Sarri Galanis/Galani" },
    SK: { m: "Martin Tomáš Ľubomír Juraj Michal Peter Marek Jozef Miroslav Rastislav Ondrej Ivan Matúš Dušan Branislav",
      f: "Zuzana Katarína Lucia Jana Ľudmila Mária Eva Andrea Monika Veronika Simona Dominika Silvia Lenka Petra",
      s: "Horváth/Horváthová Kováč/Kováčová Varga/Vargová Tóth/Tóthová Baláž/Balážová Šimko/Šimková Nagy/Nagyová Molnár/Molnárová Szabó/Szabová Lukáč/Lukáčová Kollár/Kollárová Novák/Nováková Polák/Poláková Kráľ/Kráľová Gajdoš/Gajdošová Hudák/Hudáková Oravec/Oravcová Mikuš/Mikušová Kubiš/Kubišová Benko/Benková Rusnák/Rusnáková Michalík/Michalíková Krajčovič/Krajčovičová Bartoš/Bartošová Hrušovský/Hrušovská" },
    LU: { m: "Luc Marc Jeff Gilles Claude Paul Yves Laurent Tom Pit Serge Romain Christophe Michel Fernand",
      f: "Martine Carole Nathalie Josiane Lynn Sandra Anne Nadine Danielle Isabelle Joëlle Monique Michèle Sylvie Tessy",
      s: "Schmit Muller Weber Wagner Hoffmann Thill Schmitz Klein Reuter Kremer Hansen Becker Faber Kieffer Theis Welter Steffen Majerus Ries Schroeder Weis Wirtz Lux Back Feller" },
    SI: { m: "Luka Matej Žiga Gregor Rok Andraž Jure Blaž Primož Boštjan Matjaž Aleš Uroš Tilen Janez",
      f: "Nina Špela Urška Mojca Tjaša Maja Petra Katja Barbara Nataša Mateja Alenka Polona Vesna Sabina",
      s: "Novak Horvat Krajnc Kovačič Zupančič Potočnik Kovač Mlakar Kos Vidmar Golob Turk Božič Kralj Zupan Bizjak Hribar Kavčič Rozman Medved Korošec Žagar Petek Kolar Oblak" },
    LT: { m: "Mantas Tomas Žygimantas Andrius Darius Vytautas Mindaugas Rimantas Gediminas Lukas Saulius Paulius Ignas Arūnas Kęstutis",
      f: "Rūta Eglė Aistė Jurgita Ieva Gintarė Vaida Inga Laura Rasa Dalia Austėja Kristina Neringa Giedrė",
      s: "Kazlauskas/Kazlauskienė Jankauskas/Jankauskienė Petrauskas/Petrauskienė Stankevičius/Stankevičienė Vasiliauskas/Vasiliauskienė Žukauskas/Žukauskienė Butkus/Butkienė Paulauskas/Paulauskienė Urbonas/Urbonienė Kavaliauskas/Kavaliauskienė Navickas/Navickienė Ramanauskas/Ramanauskienė Pocius/Pocienė Šimkus/Šimkienė Savickas/Savickienė Rimkus/Rimkienė Lukoševičius/Lukoševičienė Baranauskas/Baranauskienė Sakalauskas/Sakalauskienė Adomaitis/Adomaitienė Valentinavičius/Valentinavičienė Mockus/Mockienė Kairys/Kairienė Bložė/Bložienė Vaitkus/Vaitkienė" },
    LV: { m: "Jānis Andris Mārtiņš Kārlis Edgars Rihards Aivars Gints Valdis Raimonds Artūrs Dāvis Uldis Krišjānis Normunds",
      f: "Ilze Līga Inese Dace Kristīne Anda Santa Zane Baiba Gunta Laura Sandra Agnese Evija Inga",
      s: "Bērziņš/Bērziņa Kalniņš/Kalniņa Ozoliņš/Ozoliņa Liepiņš/Liepiņa Krūmiņš/Krūmiņa Zariņš/Zariņa Jansons/Jansone Ozols/Ozola Balodis/Balode Pētersons/Pētersone Vītols/Vītola Kļaviņš/Kļaviņa Lapiņš/Lapiņa Siliņš/Siliņa Eglītis/Eglīte Grīnbergs/Grīnberga Jākobsons/Jākobsone Kārkliņš/Kārkliņa Lācis/Lāce Rozenbergs/Rozenberga Vilks/Vilka Avotiņš/Avotiņa Sproģis/Sproģe Strazdiņš/Strazdiņa Upītis/Upīte" },
    EE: { m: "Andres Mart Priit Tõnu Rasmus Siim Taavi Margus Jaan Rein Kristjan Tarmo Urmas Indrek Peeter",
      f: "Kadri Kristiina Triin Mari Ülle Kersti Merike Piret Liina Maarja Helen Tiiu Anneli Reet Kaja",
      s: "Tamm Saar Sepp Mägi Kask Kukk Rebane Ilves Pärn Koppel Lepik Kuusk Karu Vaher Lill Raudsepp Kõiv Põder Laur Jõgi Teder Org Luik Kallas Sild" },
    CY: { m: "Andreas Christos Michalis Panayiotis Giorgos Kyriakos Stelios Savvas Charalambos Loizos Nicos Costas Antonis Petros Demetris",
      f: "Maria Eleni Andri Christina Despo Androulla Stella Marina Katerina Elena Georgia Anna Myria Chrystalla Panayiota",
      s: "Georgiou Ioannou Charalambous Constantinou Kyriakou Michael Neophytou Savva Antoniou Demetriou Nicolaou Papadopoulos/Papadopoulou Christofi Louca Pavlou Hadjigeorgiou Theodorou Stylianou Andreou Evangelou Panayi Kyprianou Socratous Zenonos Philippou" },
    MT: { m: "Joseph Mark Kurt Ġorġ Matthew Clayton Jean_Paul Luke Karl Owen Ryan Christian Neil Glenn Jason",
      f: "Maria Rebecca Claire Doreen Marija Roberta Charlene Josette Rita Daniela Graziella Miriam Ruth Sharon Antoinette",
      s: "Borg Vella Farrugia Zammit Galea Micallef Grech Attard Spiteri Azzopardi Mifsud Agius Pace Cassar Sammut Fenech Debono Bonnici Camilleri Caruana Abela Muscat Schembri Xuereb Ellul" },
    HR: { m: "Ivan Luka Marko Dražen Tomislav Josip Ante Matej Davor Krešimir Zoran Hrvoje Mario Dario Goran",
      f: "Ana Ivana Petra Marija Željka Martina Vesna Mirela Sanja Nikolina Lucija Iva Snježana Dubravka Tihana",
      s: "Horvat Kovačević Babić Marić Jurić Novak Knežević Vuković Marković Petrović Matić Tomić Pavlović Kovač Božić Blažević Grgić Pavić Radić Perić Šarić Lovrić Vidović Perković Bilić" },
    BG: { m: "Georgi Dimitar Ivan Nikolay Stoyan Petar Todor Hristo Kaloyan Vasil Martin Krasimir Plamen Boris Atanas",
      f: "Elena Maria Desislava Radostina Tsvetelina Ivanka Gergana Teodora Milena Yana Vesela Nadezhda Silvia Boryana Ralitsa",
      s: "Petrov/Petrova Ivanov/Ivanova Dimitrov/Dimitrova Georgiev/Georgieva Stoyanov/Stoyanova Todorov/Todorova Nikolov/Nikolova Hristov/Hristova Kolev/Koleva Angelov/Angelova Atanasov/Atanasova Iliev/Ilieva Marinov/Marinova Petkov/Petkova Yordanov/Yordanova Mihaylov/Mihaylova Popov/Popova Vasilev/Vasileva Kostov/Kostova Dimov/Dimova Stefanov/Stefanova Pavlov/Pavlova Zhelev/Zheleva Tsvetkov/Tsvetkova Genchev/Gencheva" },
    PL: { m: "Piotr Tomasz Krzysztof Paweł Łukasz Michał Marcin Grzegorz Jakub Andrzej Wojciech Rafał Mateusz Bartosz Sławomir",
      f: "Agnieszka Małgorzata Katarzyna Joanna Ewa Anna Magdalena Monika Beata Dorota Aleksandra Justyna Marta Żaneta Grażyna",
      s: "Nowak Kowalski/Kowalska Wiśniewski/Wiśniewska Wójcik Zieliński/Zielińska Kamiński/Kamińska Lewandowski/Lewandowska Szymański/Szymańska Woźniak Dąbrowski/Dąbrowska Kozłowski/Kozłowska Jankowski/Jankowska Mazur Kwiatkowski/Kwiatkowska Krawczyk Piotrowski/Piotrowska Grabowski/Grabowska Nowakowski/Nowakowska Pawłowski/Pawłowska Michalski/Michalska Król Wieczorek Jabłoński/Jabłońska Majewski/Majewska Olszewski/Olszewska" },
    SE: { m: "Erik Lars Johan Anders Björn Magnus Fredrik Per Henrik Mikael Oskar Gustav Nils Mattias Stefan",
      f: "Karin Anna Ingrid Sofia Åsa Lena Maria Elin Eva Kristina Linnea Malin Birgitta Ulrika Helena",
      s: "Andersson Johansson Lindqvist Nyström Bergström Åkesson Karlsson Nilsson Eriksson Larsson Olsson Persson Svensson Gustafsson Pettersson Jonsson Lindberg Lindström Axelsson Holmberg Sundberg Ekström Hedlund Sjöberg Wallin" },
    DK: { m: "Mads Søren Jens Rasmus Anders Mikkel Frederik Christian Lars Morten Henrik Jesper Thomas Kasper Niels",
      f: "Mette Line Sofie Birgitte Pernille Camilla Louise Anne Signe Ida Charlotte Trine Lene Malene Karen",
      s: "Jensen Nielsen Hansen Pedersen Møller Sørensen Andersen Christensen Larsen Rasmussen Jørgensen Madsen Kristensen Olsen Thomsen Poulsen Johansen Knudsen Mortensen Østergaard Lund Holm Dahl Bach Skov" },
    CZ: { m: "Jan Petr Jiří Tomáš Ondřej Martin Pavel Jakub Lukáš Michal Vojtěch Radek Zdeněk Miroslav Václav",
      f: "Jana Lenka Petra Kateřina Tereza Eva Lucie Markéta Hana Veronika Zuzana Barbora Alena Michaela Ivana",
      s: "Novák/Nováková Svoboda/Svobodová Dvořák/Dvořáková Černý/Černá Procházka/Procházková Kučera/Kučerová Veselý/Veselá Horák/Horáková Němec/Němcová Pokorný/Pokorná Marek/Marková Pospíšil/Pospíšilová Hájek/Hájková Jelínek/Jelínková Král/Králová Růžička/Růžičková Beneš/Benešová Fiala/Fialová Sedláček/Sedláčková Doležal/Doležalová Zeman/Zemanová Kolář/Kolářová Navrátil/Navrátilová Čermák/Čermáková Vaněk/Vaňková" },
    RO: { order: "family", m: "Andrei Mihai Ștefan Radu Bogdan Alexandru Cristian Adrian Vlad Sorin Florin Cătălin Răzvan Ionuț Dragoș",
      f: "Ioana Elena Andreea Raluca Ileana Ana Maria Cristina Mihaela Alina Oana Simona Roxana Bianca Corina",
      s: "Popescu Ionescu Constantinescu Dumitrescu Stan Munteanu Popa Rusu Matei Stoica Moldovan Lungu Ene Ciobanu Marin Toma Florea Diaconu Nistor Georgescu Lazăr Crăciun Tănase Mocanu Pătrașcu" },
    HU: { order: "family", m: "László Gábor Zoltán Péter Bence Attila Balázs Csaba Tamás Dániel Levente Gergely Ádám Márton Zsolt",
      f: "Eszter Katalin Zsófia Ildikó Réka Anna Judit Krisztina Orsolya Ágnes Andrea Dóra Erzsébet Noémi Tünde",
      s: "Nagy Kovács Tóth Szabó Horváth Varga Kiss Molnár Németh Farkas Balogh Papp Takács Juhász Lakatos Mészáros Oláh Simon Rácz Fekete Szilágyi Török Fehér Balázs Gál" }
  };
  /* The people of the Governing Council, with their gender ("f" or "m"):
     three governors for each central bank, one for each term, and three
     candidates for each seat of the Executive Board, as [name, state,
     hawkishness, conservatism, gender]. js/model/council.js builds the
     Council from them; the card on women in the Council counts them. */
  S.GOVERNORS = {
    DE: [["Matthias Kröger", "m"], ["Annette Vogler", "f"], ["Jonas Hartwig", "m"]],
    FR: [["Hélène Duvivier", "f"], ["Marc Delorme", "m"], ["Sandrine Aubry", "f"]],
    IT: [["Paolo Ventresca", "m"], ["Chiara Morandi", "f"], ["Luca Benedetti", "m"]],
    ES: [["Javier Olmedo", "m"], ["Lucía Arranz", "f"], ["Andrés Quintana", "m"]],
    NL: [["Willem Hofstede", "m"], ["Marieke de Rooij", "f"], ["Joost Verbeek", "m"]],
    BE: [["Luc Vandamme", "m"], ["Sophie Lemmens", "f"], ["Pieter Claeys", "m"]],
    AT: [["Gerhard Pichler", "m"], ["Elisabeth Wallner", "f"], ["Florian Moser", "m"]],
    IE: [["Declan Moran", "m"], ["Aoife Brennan", "f"], ["Ciarán Doyle", "m"]],
    FI: [["Juha Lindqvist", "m"], ["Sanna Heikkilä", "f"], ["Mikko Rantala", "m"]],
    PT: [["João Sequeira", "m"], ["Inês Barreto", "f"], ["Rui Carvalhal", "m"]],
    GR: [["Dimitris Papadakos", "m"], ["Katerina Lioudaki", "f"], ["Yannis Sotiriou", "m"]],
    SK: [["Peter Hudák", "m"], ["Zuzana Kováčová", "f"], ["Martin Bielik", "m"]],
    LU: [["Paul Hoffmann", "m"], ["Anne Kieffer", "f"], ["Tom Schmit", "m"]],
    SI: [["Andrej Novak", "m"], ["Maja Kranjc", "f"], ["Tomaž Zupan", "m"]],
    LT: [["Tomas Jankauskas", "m"], ["Rūta Kazlauskienė", "f"], ["Darius Petrauskas", "m"]],
    LV: [["Jānis Ozols", "m"], ["Ilze Bērziņa", "f"], ["Andris Kalniņš", "m"]],
    EE: [["Kaido Tamm", "m"], ["Liis Saar", "f"], ["Marko Kask", "m"]],
    CY: [["Andreas Christodoulou", "m"], ["Eleni Georgiou", "f"], ["Marios Ioannou", "m"]],
    MT: [["Joseph Camilleri", "m"], ["Maria Vella", "f"], ["Mark Farrugia", "m"]],
    HR: [["Ivan Babić", "m"], ["Ana Horvat", "f"], ["Tomislav Kovačević", "m"]],
    BG: [["Georgi Petrov", "m"], ["Elena Dimitrova", "f"], ["Nikolai Ivanov", "m"]],
    PL: [["Tomasz Wójcik", "m"], ["Agnieszka Lewandowska", "f"], ["Piotr Zieliński", "m"]],
    SE: [["Erik Lindgren", "m"], ["Karin Holm", "f"], ["Anders Nyberg", "m"]],
    DK: [["Mads Kristensen", "m"], ["Line Mortensen", "f"], ["Søren Holt", "m"]],
    CZ: [["Pavel Dvořák", "m"], ["Lenka Svobodová", "f"], ["Jakub Černý", "m"]],
    RO: [["Andrei Popescu", "m"], ["Ioana Dumitrescu", "f"], ["Mihai Stanciu", "m"]],
    HU: [["Gábor Kovács", "m"], ["Eszter Nagy", "f"], ["Péter Szabó", "m"]],
    /* The states a run may assume to join the EU (S.CANDIDATES) */
    ME: [["Milan Đurović", "m"], ["Jelena Vuković", "f"], ["Nikola Radonjić", "m"]],
    AL: [["Arben Hoxha", "m"], ["Elira Kola", "f"], ["Gentian Shehu", "m"]],
    RS: [["Dragan Petković", "m"], ["Milica Stanković", "f"], ["Vladimir Ilić", "m"]],
    MK: [["Goran Stojanovski", "m"], ["Ana Trajkovska", "f"], ["Petar Nikolovski", "m"]],
    BA: [["Emir Hadžić", "m"], ["Lejla Kovačević", "f"], ["Damir Begić", "m"]],
    XK: [["Driton Krasniqi", "m"], ["Arta Berisha", "f"], ["Besnik Gashi", "m"]],
    MD: [["Ion Rusu", "m"], ["Elena Ciobanu", "f"], ["Andrei Munteanu", "m"]],
    UA: [["Oleksandr Bondarenko", "m"], ["Iryna Kovalenko", "f"], ["Taras Melnyk", "m"]],
    GE: [["Giorgi Beridze", "m"], ["Nino Kapanadze", "f"], ["Levan Gelashvili", "m"]],
    IS: [["Gunnar Sigurðsson", "m"], ["Katrín Jónsdóttir", "f"], ["Einar Magnússon", "m"]],
    SCT: [["Alasdair Campbell", "m"], ["Morag MacLeod", "f"], ["Euan Fraser", "m"]]
  };
  S.BOARD = [
    ["Vice-President", ["Teresa Galvão", "PT", -0.2, 0.4, "f"], ["Ingrid Sørlie", "DK", 0.2, 0.5, "f"], ["Carmen Ruiz Albar", "ES", -0.3, 0.4, "f"]],
    ["Chief Economist", ["Rainer Stiehl", "DE", 0.6, 0.8, "m"], ["Laura Benassi", "IT", -0.2, 0.4, "f"], ["Henrik Aalberg", "NL", 0.4, 0.6, "m"]],
    ["Member, markets", ["Laurent Picard", "FR", 0.0, 0.5, "m"], ["Hanna Kowal", "PL", 0.2, 0.5, "f"], ["Bruno Esteves", "PT", -0.3, 0.4, "m"]],
    ["Member, supervision", ["Margit Huber", "AT", 0.3, 0.6, "f"], ["Siobhra Nolan", "IE", -0.1, 0.5, "f"], ["Viktor Hallik", "EE", 0.4, 0.6, "m"]],
    ["Member, payments", ["Kristiina Aalto", "FI", 0.4, 0.6, "f"], ["Nikos Vardakis", "GR", -0.5, 0.3, "m"], ["Anna Lehner", "DE", 0.5, 0.7, "f"]]
  ];

  S.PEOPLE = {};
  Object.keys(P).forEach(function (k) {
    S.PEOPLE[k] = { order: P[k].order || "given", m: list(P[k].m), f: list(P[k].f), s: list(P[k].s).map(function (w) { return w.split("/"); }) };
  });

  /* The language of each member state, and English; title is the president's
     title in it, the name a president takes when none is typed */
  S.LANGS = {
    en: { name: "English", title: "The president" },
    bg: { name: "Български", title: "Председателят" },
    cs: { name: "Čeština", title: "Prezident" },
    da: { name: "Dansk", title: "Formanden" },
    de: { name: "Deutsch", title: "Der Präsident" },
    el: { name: "Ελληνικά", title: "Ο πρόεδρος" },
    es: { name: "Español", title: "El presidente" },
    et: { name: "Eesti", title: "President" },
    fi: { name: "Suomi", title: "Pääjohtaja" },
    fr: { name: "Français", title: "Le président" },
    ga: { name: "Gaeilge", title: "An tUachtarán" },
    hr: { name: "Hrvatski", title: "Predsjednik" },
    hu: { name: "Magyar", title: "Az elnök" },
    it: { name: "Italiano", title: "Il presidente" },
    lb: { name: "Lëtzebuergesch", title: "De President" },
    lt: { name: "Lietuvių", title: "Pirmininkas" },
    lv: { name: "Latviešu", title: "Priekšsēdētājs" },
    mt: { name: "Malti", title: "Il-President" },
    nl: { name: "Nederlands", title: "De president" },
    pl: { name: "Polski", title: "Prezes" },
    pt: { name: "Português", title: "O presidente" },
    ro: { name: "Română", title: "Președintele" },
    sk: { name: "Slovenčina", title: "Prezident" },
    sl: { name: "Slovenščina", title: "Predsednik" },
    sv: { name: "Svenska", title: "Ordföranden" }
  };
  S.STATE_LANG = { AT: "de", BE: "nl", BG: "bg", HR: "hr", CY: "el", CZ: "cs", DK: "da", EE: "et", FI: "fi", FR: "fr", DE: "de", GR: "el",
    HU: "hu", IE: "ga", IT: "it", LV: "lv", LT: "lt", LU: "lb", MT: "mt", NL: "nl", PL: "pl", PT: "pt", RO: "ro", SK: "sk", SI: "sl", ES: "es", SE: "sv" };

  /* Letters with diacritics, by language: the official languages of the EU
     and the other languages of Europe written in the Latin or Greek
     alphabet, with the Cyrillic letters that carry a diacritic */
  S.LETTERS = [
    ["Albanian", "ç ë"], ["Basque", "ñ ü"], ["Bulgarian", "й ѝ"], ["Catalan", "à ç è é í ï ŀ ò ó ú ü"],
    ["Croatian", "č ć đ š ž"], ["Czech", "á č ď é ě í ň ó ř š ť ú ů ý ž"], ["Danish", "æ ø å"],
    ["Dutch", "é è ë ï ö ü"], ["Estonian", "õ ä ö ü š ž"], ["Faroese", "á ð í ó ú ý æ ø"], ["Finnish", "ä ö å š ž"],
    ["French", "à â æ ç é è ê ë î ï ô œ ù û ü ÿ"], ["Galician", "á é í ñ ó ú"], ["German", "ä ö ü ß"],
    ["Greek", "ά έ ή ί ό ύ ώ ϊ ϋ ΐ ΰ"], ["Hungarian", "á é í ó ö ő ú ü ű"], ["Icelandic", "á ð é í ó ú ý þ æ ö"],
    ["Irish", "á é í ó ú"], ["Italian", "à è é ì í î ò ó ù ú"], ["Latvian", "ā č ē ģ ī ķ ļ ņ š ū ž"],
    ["Lithuanian", "ą č ę ė į š ų ū ž"], ["Luxembourgish", "ä ë é"], ["Maltese", "à ċ è ġ għ ħ ì ò ù ż"],
    ["Norwegian", "æ ø å"], ["Polish", "ą ć ę ł ń ó ś ź ż"], ["Portuguese", "á â ã à ç é ê í ó ô õ ú"],
    ["Romanian", "ă â î ș ț"], ["Sami", "á č đ ŋ š ŧ ž"], ["Serbian (Latin)", "č ć đ š ž"],
    ["Slovak", "á ä č ď é í ĺ ľ ň ó ô ŕ š ť ú ý ž"], ["Slovene", "č š ž"], ["Spanish", "á é í ñ ó ú ü"],
    ["Swedish", "å ä ö"], ["Turkish", "ç ğ ı İ ö ş ü"], ["Ukrainian and Belarusian", "ї є ґ ў"], ["Welsh", "â ê î ô û ŵ ŷ"]
  ].map(function (x) { return { name: x[0], letters: x[1].split(" ") }; });
  /* The language each language code above is called in the keyboard */
  S.LANG_LETTERS = { bg: "Bulgarian", cs: "Czech", da: "Danish", de: "German", el: "Greek", es: "Spanish", et: "Estonian", fi: "Finnish",
    fr: "French", ga: "Irish", hr: "Croatian", hu: "Hungarian", it: "Italian", lb: "Luxembourgish", lt: "Lithuanian", lv: "Latvian",
    mt: "Maltese", nl: "Dutch", pl: "Polish", pt: "Portuguese", ro: "Romanian", sk: "Slovak", sl: "Slovene", sv: "Swedish" };

  /* A random name for a president from a member state, never the name of
     an advisor nor one with an advisor's family name */
  S.randomName = function (code, rnd) {
    rnd = rnd || Math.random;
    var p = S.PEOPLE[code] || S.PEOPLE.FR, taken = {};
    Object.keys(S.ADVISORS || {}).forEach(function (k) { taken[S.ADVISORS[k].name] = true; });
    var advisorNames = Object.keys(taken).join(" ");
    var family = p.s.filter(function (s) { return s.every(function (f) { return advisorNames.indexOf(f) < 0; }); });
    for (var i = 0; i < 20; i++) {
      var woman = rnd() < 0.5, given = (woman ? p.f : p.m)[Math.floor(rnd() * (woman ? p.f : p.m).length)];
      var fam = family[Math.floor(rnd() * family.length)], last = woman && fam[1] ? fam[1] : fam[0];
      var full = p.order === "family" ? last + " " + given : given + " " + last;
      if (!taken[full]) { return full; }
    }
    return full;
  };
})();
