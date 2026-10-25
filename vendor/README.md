# Third-party files

Everything the game uses from other projects is kept in this folder, so the game runs without a network connection.

| Folder | What | Source | License |
| --- | --- | --- | --- |
| `breeze-icons/` | The original SVG files of the icons the game uses. `tools/build-icons.py` turns them into `js/ui/icons.js`. `actions_22_tools-report-bug.svg`, the face of KDE's crash dialog, is drawn inline in `index.html` for the screen shown without JavaScript. `custom_22_bias.svg`, a tilted balance for the Bias disclosure page in Help, is drawn for this game in the Breeze style and is not part of breeze-icons; it falls under the game's GPL-3.0. | KDE breeze-icons, `icons/` | LGPL-3.0-or-later (`COPYING-ICONS`, `LGPL-3.0.txt`) |
| `noto-sans/` | Noto Sans, the default font of KDE Plasma, cut down to Latin, Greek and Cyrillic letters and kept as one variable font with weights 300 to 700. | google/fonts, `ofl/notosans/NotoSans[wdth,wght].ttf` | SIL Open Font License 1.1 (`OFL.txt`) |
| `hack/` | Hack, the fixed-width font of KDE Plasma, as its web subset in regular and bold, for the debug panel and the Storage page. | source-foundry/Hack, `build/web/fonts/hack-regular-subset.woff2` and `hack-bold-subset.woff2` | MIT License and Bitstream Vera License (`LICENSE.md`) |
| `natural-earth/` | The license of the map data. `tools/build-map.py` turns Natural Earth's 1:50m country outlines into `js/data/map.js`. | Natural Earth, `ne_50m_admin_0_countries` | Public domain (`LICENSE.md`) |

The Breeze colors in `css/breeze.css` and Plasma's accent colors in `js/core/theme.js` are copied from KDE's color schemes (KDE/breeze, `colors/`) and from Plasma's Colors settings (plasma-workspace, `kcms/colors/ui/AccentColorUI.qml`).

To cut the font again from the original file:

```sh
pip install fonttools brotli
python3 -m fontTools.varLib.instancer "NotoSans[wdth,wght].ttf" wdth=100 wght=300:700 -o NotoSans-wght.ttf
python3 -m fontTools.subset NotoSans-wght.ttf --flavor=woff2 --layout-features='*' \
  --unicodes="U+0000-024F,U+0370-03FF,U+0400-04FF,U+1E00-1EFF,U+2000-206F,U+20AC,U+2100-218F,U+2190-21FF,U+2212,U+2264,U+2265,U+25CF,U+2713" \
  --output-file=vendor/noto-sans/NotoSans-Variable.woff2
```
