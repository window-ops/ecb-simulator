/* The bank's name in the 24 official languages of the EU, with its
   acronym. The Greek acronym ΕΚΤ is written EKT in Latin letters, which
   look the same in capitals. The player picks one; the game's title and
   text follow it. */
(function () {
  var S = window.ECBSIM = window.ECBSIM || {};
  S.BANK_NAMES = [
    { lang: "Bulgarian", acr: "ЕЦБ", full: "Европейска централна банка" },
    { lang: "Croatian", acr: "ESB", full: "Europska središnja banka" },
    { lang: "Czech", acr: "ECB", full: "Evropská centrální banka" },
    { lang: "Danish", acr: "ECB", full: "Den Europæiske Centralbank" },
    { lang: "Dutch", acr: "ECB", full: "Europese Centrale Bank" },
    { lang: "English", acr: "ECB", full: "European Central Bank" },
    { lang: "Estonian", acr: "EKP", full: "Euroopa Keskpank" },
    { lang: "Finnish", acr: "EKP", full: "Euroopan keskuspankki" },
    { lang: "French", acr: "BCE", full: "Banque centrale européenne" },
    { lang: "German", acr: "EZB", full: "Europäische Zentralbank" },
    { lang: "Greek", acr: "EKT", full: "Ευρωπαϊκή Κεντρική Τράπεζα" },
    { lang: "Hungarian", acr: "EKB", full: "Európai Központi Bank" },
    { lang: "Irish", acr: "BCE", full: "An Banc Ceannais Eorpach" },
    { lang: "Italian", acr: "BCE", full: "Banca centrale europea" },
    { lang: "Latvian", acr: "ECB", full: "Eiropas Centrālā banka" },
    { lang: "Lithuanian", acr: "ECB", full: "Europos Centrinis Bankas" },
    { lang: "Maltese", acr: "BĊE", full: "Il-Bank Ċentrali Ewropew" },
    { lang: "Polish", acr: "EBC", full: "Europejski Bank Centralny" },
    { lang: "Portuguese", acr: "BCE", full: "Banco Central Europeu" },
    { lang: "Romanian", acr: "BCE", full: "Banca Centrală Europeană" },
    { lang: "Slovak", acr: "ECB", full: "Európska centrálna banka" },
    { lang: "Slovene", acr: "ECB", full: "Evropska centralna banka" },
    { lang: "Spanish", acr: "BCE", full: "Banco Central Europeo" },
    { lang: "Swedish", acr: "ECB", full: "Europeiska centralbanken" }
  ];
  S.bankName = function () {
    var lang = (S.settings && S.settings.bankLang) || "English";
    for (var i = 0; i < S.BANK_NAMES.length; i++) { if (S.BANK_NAMES[i].lang === lang) { return S.BANK_NAMES[i]; } }
    return S.BANK_NAMES[5];
  };
})();
