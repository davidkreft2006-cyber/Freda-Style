#!/usr/bin/env python3
"""
FREDA STYLE - Produktbilder aufbereiten
=======================================

Erzeugt aus den Originalen in  upload/  die Fassungen in
assets/img/products/, die die Webseite laedt.

Was das Skript macht:
  1. dunkle Randstreifen abschneiden (kommen bei Screenshots vor)
  2. auf einheitliches 2:3 beschneiden, oben verankert, damit
     Gesichter und Produktdetails vollstaendig bleiben
  3. als progressives JPEG speichern - deutlich kleiner als PNG

Die Originale werden NICHT veraendert und NICHT geloescht.

Aufruf aus dem Projektordner:
    pip install Pillow
    python3 scripts/prepare-images.py

Neues Foto einbinden:
  - Datei nach upload/ legen
  - unten in JOBS eine Zeile ergaenzen: (Originalname, Zielname)
  - Skript laufen lassen
  - Pfad in assets/js/products.js eintragen
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow fehlt. Bitte "pip install Pillow" ausfuehren.')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'upload')
DST = os.path.join(ROOT, 'assets', 'img', 'products')

RATIO = 2 / 3       # einheitliches Produktformat
QUALITY = 88

# (Originaldatei in upload/, Zieldatei in assets/img/products/)
JOBS = [
    ('image (2).png',  'military-blazer-01.jpg'),
    ('image (3).png',  'military-blazer-02.jpg'),
    ('image (11).png', 'rock-taschen-01.jpg'),
    ('image (5).png',  'bluse-01.jpg'),
    ('image (6).png',  'bluse-02.jpg'),
    ('image (7).png',  'jeansjacke-01.jpg'),
    ('image (9).png',  'jeansjacke-02.jpg'),
    ('image (8).png',  'jeansjacke-03.jpg'),
]

# Zusaetzlich unbeschnitten fuer den Hero-Bereich.
# Aendert sich das Hero-Motiv, muss "ratio" in assets/js/products.js
# unter FREDA_HERO_IMAGE mitgezogen werden.
HERO = ('image (11).png', 'hero-rock.jpg')


def trim_dark_edges(im):
    """Schneidet fast schwarze Spalten an den Seitenraendern ab."""
    w, h = im.size
    px = im.load()
    rows = range(0, h, 5)

    def col_avg(x):
        return sum(sum(px[x, y]) for y in rows) / (3 * len(rows))

    middle = sorted(col_avg(x) for x in range(w // 4, 3 * w // 4))
    mid = middle[len(middle) // 2]

    left = 0
    while left < w // 5 and col_avg(left) < mid * 0.45:
        left += 1
    right = 0
    while right < w // 5 and col_avg(w - 1 - right) < mid * 0.45:
        right += 1

    if left or right:
        print(f'    dunkler Rand entfernt: links {left}px, rechts {right}px')
        return im.crop((left, 0, w - right, h))
    return im


def crop_to_ratio(im):
    """Beschneidet auf 2:3, oben verankert."""
    w, h = im.size
    if w / h > RATIO:
        new_w = round(h * RATIO)
        x = (w - new_w) // 2
        return im.crop((x, 0, x + new_w, h))
    new_h = round(w / RATIO)
    return im.crop((0, 0, w, new_h))


def save(im, name, quality):
    path = os.path.join(DST, name)
    im.save(path, 'JPEG', quality=quality, optimize=True, progressive=True)
    return os.path.getsize(path)


def main():
    os.makedirs(DST, exist_ok=True)
    done = missing = 0
    total_in = total_out = 0

    for src_name, dst_name in JOBS + [HERO]:
        src_path = os.path.join(SRC, src_name)
        if not os.path.isfile(src_path):
            print(f'  FEHLT     {src_name}  (erwartet als {dst_name})')
            missing += 1
            continue

        im = trim_dark_edges(Image.open(src_path).convert('RGB'))
        before = im.size
        if dst_name != HERO[1]:
            im = crop_to_ratio(im)
            out = save(im, dst_name, QUALITY)
        else:
            out = save(im, dst_name, 90)   # Hero bleibt unbeschnitten

        size_in = os.path.getsize(src_path)
        total_in += size_in
        total_out += out
        print(f'  {dst_name:24s} {before[0]}x{before[1]} -> {im.size[0]}x{im.size[1]}'
              f'   {size_in // 1024} KB -> {out // 1024} KB')
        done += 1

    print(f'\nFertig: {done} erzeugt, {missing} fehlen.')
    if total_in:
        print(f'Bildlast: {total_in // 1024} KB -> {total_out // 1024} KB')
    if missing:
        print('Fehlende Bilder zeigen auf der Seite einen dezenten Platzhalter.')


if __name__ == '__main__':
    main()
