"""Builds js/ui/icons.js from the Breeze icons in vendor/breeze-icons/.

Every icon is rewritten to draw in currentColor, in one color as KDE draws
icons in toolbars and lists, so it follows the theme; Breeze's accent and
status colors are dropped. Icons listed in CUT, which Breeze fills with a
status color and marks in white, keep their shape with the mark cut out of
it. Icons listed in RAW keep their own colors (none at present), with their
ids prefixed so two of them on one page do not clash.

    python3 tools/build-icons.py
"""
import json
import math
import os
import re

SRC = "vendor/breeze-icons"
NAMES = {
    "new": "actions_22_document-new", "save": "actions_22_document-save", "open": "actions_22_document-open",
    "next": "actions_22_go-next", "skip": "actions_22_media-skip-forward", "settings": "actions_22_configure",
    "help": "actions_22_help-contents", "agenda": "actions_22_view-calendar-agenda", "council": "actions_22_user-group-new",
    "countries": "actions_22_map-globe", "advisor": "actions_22_im-user", "parliament": "actions_22_view-bank",
    "proposals": "actions_22_document-edit", "treaty": "actions_22_story-editor", "archive": "actions_22_view-history",
    "glossary": "actions_22_tools-check-spelling", "chart": "actions_22_office-chart-line", "ok": "actions_22_dialog-ok",
    "cancel": "actions_22_dialog-cancel", "close": "actions_22_window-close", "back": "actions_22_go-previous",
    "about": "actions_22_help-about", "warning": "status_22_data-warning", "error": "status_22_data-error",
    "info": "actions_22_help-about", "volume": "status_22_audio-volume-high", "muted": "status_22_audio-volume-muted",
    "menu": "actions_22_application-menu", "home": "actions_22_go-home",
    "hint": "actions_22_help-hint", "list": "actions_22_view-list-details", "flag": "actions_22_flag",
    "news": "actions_22_news-subscribe", "table": "actions_22_view-list-text", "speech": "actions_22_mail-send",
    "tasks": "actions_22_view-task", "bars": "actions_22_office-chart-bar", "score": "actions_22_games-highscores",
    "delete": "actions_22_edit-delete", "add": "actions_22_list-add", "calendar": "actions_22_view-calendar",
    "palette": "actions_22_draw-brush", "debug": "actions_22_debug-run", "map": "actions_22_map-flat",
    "footnote": "actions_22_insert-footnote", "export": "actions_22_document-export", "import": "actions_22_document-import",
    "storage": "actions_22_database-index", "view": "actions_22_view-visible", "find": "actions_22_edit-find",
    "done": "actions_22_dialog-ok-apply", "copy": "actions_22_edit-copy",
    "access": "actions_22_preferences-desktop-accessibility-mono", "leave": "actions_22_application-exit",
    "reset": "actions_22_edit-reset", "achievements": "actions_22_games-achievements", "notify": "actions_22_notifications",
    "keyboard": "devices_22_input-keyboard", "keyboard-virtual": "devices_22_input-keyboard-virtual", "week": "actions_22_view-calendar-week", "license": "actions_22_license", "play": "actions_22_media-playback-start", "pause": "actions_22_media-playback-pause",
    "difficulty": "actions_22_games-difficult", "overflow": "actions_22_overflow-menu",
    "bias": "custom_22_bias", "minus": "custom_22_minus", "random": "actions_22_media-playlist-shuffle", "crash": "actions_22_tools-report-bug"
}
RAW = set()
CUT = {"warning", "error"}

def mono(svg):
    body = re.sub(r"<defs.*?</defs>", "", svg, flags=re.S)
    body = re.sub(r"<style.*?</style>", "", body, flags=re.S)
    body = re.search(r"<svg[^>]*>(.*)</svg>", body, flags=re.S).group(1)
    body = re.sub(r'class="ColorScheme-[A-Za-z]+"', "", body)
    body = re.sub(r"(?<![-\w])color:#[0-9a-fA-F]{6};?", "", body)
    body = re.sub(r"fill:#[0-9a-fA-F]{6}", "fill:currentColor", body)
    body = re.sub(r'fill="#[0-9a-fA-F]{3,6}"', 'fill="currentColor"', body)
    return re.sub(r"\s+", " ", body).strip()

def cut(svg, key):
    """A shape in one color with its white mark cut out, through a mask."""
    body = re.sub(r"<style.*?</style>", "", svg, flags=re.S)
    shapes = re.findall(r"<(?:path|rect)\b[^>]*/>", body, flags=re.S)
    mask = []
    for el in shapes:
        el = re.sub(r'\s(class|style)="[^"]*"', "", el)
        if 'fill="#fff"' in el:
            mask.append(el.replace('fill="#fff"', 'fill="#000"'))
        else:
            mask.append(re.sub(r'fill="[^"]*"', 'fill="#fff"', el))
    mid = "icm-" + key
    out = ('<mask id="%s" maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="22">%s</mask>'
           '<rect width="22" height="22" fill="currentColor" mask="url(#%s)"/>') % (mid, "".join(mask), mid)
    return re.sub(r"\s+", " ", out).strip()

def raw(svg, prefix):
    body = re.search(r"<svg[^>]*>(.*)</svg>", svg, flags=re.S).group(1)
    ids = re.findall(r'id="([^"]+)"', body)
    for i in sorted(ids, key=len, reverse=True):
        body = body.replace('id="%s"' % i, 'id="%s-%s"' % (prefix, i))
        body = body.replace("#%s\"" % i, "#%s-%s\"" % (prefix, i)).replace("#%s)" % i, "#%s-%s)" % (prefix, i))
    return re.sub(r"\s+", " ", body).strip()

# ---------- Trimming ----------
# Breeze draws a 22px icon within a 16px square, 3px from each edge. An
# icon whose drawing is narrower leaves more space on one side or both, so
# in a button its label stands further off than beside other icons. The
# drawing's extent is measured from its shapes, and the empty columns past
# the usual 3px are cut from the viewBox; the height stays, so every icon
# keeps its size and baseline.
PAD = 3
NUM = r"[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?"

def mat_mul(m, n):
    a, b, c, d, e, f = m
    a2, b2, c2, d2, e2, f2 = n
    return (a * a2 + c * b2, b * a2 + d * b2, a * c2 + c * d2, b * c2 + d * d2, a * e2 + c * f2 + e, b * e2 + d * f2 + f)

def parse_transform(t):
    m = (1, 0, 0, 1, 0, 0)
    for kind, args in re.findall(r"(\w+)\s*\(([^)]*)\)", t or ""):
        v = [float(x) for x in re.findall(NUM, args)]
        if kind == "translate":
            n = (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0)
        elif kind == "matrix":
            n = tuple(v[:6])
        elif kind == "scale":
            n = (v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0)
        elif kind == "rotate":
            r = math.radians(v[0]); cx, cy = (v[1], v[2]) if len(v) > 2 else (0, 0)
            n = mat_mul(mat_mul((1, 0, 0, 1, cx, cy), (math.cos(r), math.sin(r), -math.sin(r), math.cos(r), 0, 0)), (1, 0, 0, 1, -cx, -cy))
        else:
            continue
        m = mat_mul(m, n)
    return m

def arc_points(x1, y1, rx, ry, phi, large, sweep, x2, y2):
    """Points along an SVG arc, by its center parameterization."""
    if rx == 0 or ry == 0:
        return [(x2, y2)]
    rx, ry, p = abs(rx), abs(ry), math.radians(phi)
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    xp = math.cos(p) * dx + math.sin(p) * dy
    yp = -math.sin(p) * dx + math.cos(p) * dy
    lam = xp * xp / (rx * rx) + yp * yp / (ry * ry)
    if lam > 1:
        rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp
    den = rx * rx * yp * yp + ry * ry * xp * xp
    co = math.sqrt(max(0, num / den)) if den else 0
    if large == sweep:
        co = -co
    cxp, cyp = co * rx * yp / ry, -co * ry * xp / rx
    cx = math.cos(p) * cxp - math.sin(p) * cyp + (x1 + x2) / 2
    cy = math.sin(p) * cxp + math.cos(p) * cyp + (y1 + y2) / 2
    def ang(ux, uy, vx, vy):
        a = math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
        return a
    t1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry)
    dt = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry)
    if not sweep and dt > 0:
        dt -= 2 * math.pi
    elif sweep and dt < 0:
        dt += 2 * math.pi
    out = []
    for i in range(1, 33):
        t = t1 + dt * i / 32
        out.append((cx + rx * math.cos(t) * math.cos(p) - ry * math.sin(t) * math.sin(p),
                    cy + rx * math.cos(t) * math.sin(p) + ry * math.sin(t) * math.cos(p)))
    return out

def path_points(d):
    """Points on a path's outline: its ends, and samples along curves and arcs."""
    toks = re.findall(r"[MmLlHhVvCcSsQqTtAaZz]|" + NUM, d)
    pts, i, cmd = [], 0, None
    x = y = sx = sy = 0.0
    lc = None  # the last control point, for S and T
    def num():
        nonlocal i
        v = float(toks[i]); i += 1
        return v
    def flag():
        nonlocal i
        t = toks[i]
        # Flags may run into the next number: "01.5" is 0, 1 and .5
        if len(t) > 1 and t[0] in "01" and not t.startswith(("0.", "1.")):
            toks[i] = t[1:]
            return int(t[0])
        i += 1
        return int(float(t))
    while i < len(toks):
        if re.match(r"[A-Za-z]", toks[i]):
            cmd = toks[i]; i += 1
            if cmd in "Zz":
                x, y = sx, sy; pts.append((x, y)); lc = None
                continue
        rel = cmd.islower()
        ox, oy = (x, y) if rel else (0, 0)
        c = cmd.upper()
        if c == "M":
            x, y = ox + num(), oy + num(); sx, sy = x, y; pts.append((x, y)); lc = None
            cmd = "l" if rel else "L"
        elif c == "L":
            x, y = ox + num(), oy + num(); pts.append((x, y)); lc = None
        elif c == "H":
            x = (x if rel else 0) + num(); pts.append((x, y)); lc = None
        elif c == "V":
            y = (y if rel else 0) + num(); pts.append((x, y)); lc = None
        elif c in "CS":
            if c == "C":
                x1, y1 = ox + num(), oy + num()
            else:
                x1, y1 = (2 * x - lc[0], 2 * y - lc[1]) if lc else (x, y)
            x2, y2 = ox + num(), oy + num()
            ex, ey = ox + num(), oy + num()
            for k in range(1, 17):
                t = k / 16; u = 1 - t
                pts.append((u ** 3 * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * ex,
                            u ** 3 * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * ey))
            lc = (x2, y2); x, y = ex, ey
        elif c in "QT":
            if c == "Q":
                x1, y1 = ox + num(), oy + num()
            else:
                x1, y1 = (2 * x - lc[0], 2 * y - lc[1]) if lc else (x, y)
            ex, ey = ox + num(), oy + num()
            for k in range(1, 17):
                t = k / 16; u = 1 - t
                pts.append((u * u * x + 2 * u * t * x1 + t * t * ex, u * u * y + 2 * u * t * y1 + t * t * ey))
            lc = (x1, y1); x, y = ex, ey
        elif c == "A":
            rx, ry, phi = num(), num(), num()
            large, sweep = flag(), flag()
            ex, ey = ox + num(), oy + num()
            pts.extend(arc_points(x, y, rx, ry, phi, large, sweep, ex, ey))
            x, y = ex, ey; lc = None
    return pts

def ink(svg):
    """The horizontal extent of an icon's drawing, in viewBox units."""
    import xml.etree.ElementTree as ET
    root = ET.fromstring(re.sub(r"<style.*?</style>", "", svg, flags=re.S))
    xs = []
    def walk(node, m):
        m = mat_mul(m, parse_transform(node.get("transform")))
        tag = node.tag.split("}")[-1]
        pts = []
        if tag == "path":
            pts = path_points(node.get("d", ""))
        elif tag == "rect":
            x, y = float(node.get("x", 0)), float(node.get("y", 0))
            w, h = float(node.get("width", 0)), float(node.get("height", 0))
            pts = [(x, y), (x + w, y), (x, y + h), (x + w, y + h)]
        for px, py in pts:
            xs.append(m[0] * px + m[2] * py + m[4])
        if tag not in ("defs", "mask", "clipPath", "style"):
            for ch in node:
                walk(ch, m)
    walk(root, (1, 0, 0, 1, 0, 0))
    return (min(xs), max(xs)) if xs else (0, 22)

def trimmed(svg, vb):
    """The viewBox with the empty columns cut, or vb when there are none to cut."""
    x0, y0, w, h = [float(v) for v in vb.split()]
    if (w, h) != (22, 22):
        return vb
    a, b = ink(svg)
    left = max(0, math.floor(a + 0.05) - PAD)
    right = min(22, math.ceil(b - 0.05) + PAD)
    if right - left > 22 - 2:
        return vb
    return "%g 0 %g 22" % (left, right - left)

def main():
    out = {}
    for key, name in NAMES.items():
        svg = open(os.path.join(SRC, name + ".svg"), encoding="utf-8").read()
        vb = re.search(r'viewBox="([^"]+)"', svg)
        vb = vb.group(1) if vb else "0 0 22 22"
        out[key] = [trimmed(svg, vb), raw(svg, "i" + key) if key in RAW else cut(svg, key) if key in CUT else mono(svg)]
        if key in RAW:
            out[key].append(1)
    js = ("/* Breeze icons (KDE breeze-icons, LGPL-3.0-or-later; vendor/breeze-icons/\n"
          "   holds the original files and their license). Each entry is [viewBox,\n"
          "   inner SVG] and, for an icon that keeps its own colors, a third value 1.\n"
          "   Generated by tools/build-icons.py; do not edit by hand. */\n"
          "window.ECBSIM = window.ECBSIM || {};\nECBSIM.ICONS = " + json.dumps(out, indent=0, ensure_ascii=False) + ";\n")
    open("js/ui/icons.js", "w", encoding="utf-8").write(js)
    print(len(out), "icons")

if __name__ == "__main__":
    main()
