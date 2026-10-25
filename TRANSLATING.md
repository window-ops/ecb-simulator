# Translating

The game ships in English, in US spelling. The translation layer is adapted from Selk.

1. Copy `js/lang/en.js` to `js/lang/<code>.js` and change the code in `register`.
2. Fill `ui` with the interface text, keyed by its English wording: `"End year": "..."`. Placeholders in braces stay as they are: `"Agenda for {y}": "..."`.
3. Add the code to `AVAILABLE` in `js/core/i18n.js` and a `<script>` line for the file in `index.html`, after `js/lang/en.js`.

Interface text passes through `S.t()`. Card text, advisor lines, the glossary and the proposals are data in `js/data/`; translating them needs a pack field for each, which the game does not have yet.

The bank's name in the 24 official languages is in `js/data/names.js` and does not depend on the interface language.
