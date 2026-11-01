#!/usr/bin/env python3
"""
FREDA STYLE - Vorschaubild fuer geteilte Links erzeugen
=======================================================

Legt assets/img/og-share.jpg an (1200 x 630). Dieses Bild erscheint,
wenn der Link ueber WhatsApp, Instagram oder aehnliche Dienste
verschickt wird.

Aufruf aus dem Projektordner:
    pip install Pillow
    python3 scripts/make-share-image.py

Soll ein anderes Foto erscheinen, unten PHOTO anpassen.
"""
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit('Pillow fehlt. Bitte "pip install Pillow" ausfuehren.')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTO = os.path.join(ROOT, 'assets', 'img', 'products', 'hero-rock.jpg')
OUT = os.path.join(ROOT, 'assets', 'img', 'og-share.jpg')

W, H, PW = 1200, 630, 430
CREAM, INK, GOLD, MUTED = (247, 243, 236), (17, 17, 17), (176, 141, 79), (119, 112, 106)

SERIF = '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'
SANS = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'


def spaced(draw, xy, text, font, fill, tracking):
    """Schreibt Text mit zusaetzlichem Buchstabenabstand."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x - tracking


def main():
    card = Image.new('RGB', (W, H), CREAM)
    draw = ImageDraw.Draw(card)

    photo = Image.open(PHOTO).convert('RGB')
    scale = max(PW / photo.width, H / photo.height)
    photo = photo.resize((round(photo.width * scale), round(photo.height * scale)),
                         Image.LANCZOS)
    left = (photo.width - PW) // 2
    top = (photo.height - H) // 2
    card.paste(photo.crop((left, top, left + PW, top + H)), (W - PW, 0))

    f_mark = ImageFont.truetype(SERIF, 60)
    f_small = ImageFont.truetype(SANS, 18)
    f_claim = ImageFont.truetype(SERIF, 48)

    margin = 84
    end = spaced(draw, (margin, 96), 'FREDA STYLE', f_mark, INK, 13)
    w_mark = end - margin

    line_y, mid = 182, margin + w_mark / 2
    draw.line([(margin, line_y), (mid - 28, line_y)], fill=GOLD, width=2)
    draw.line([(mid + 28, line_y), (margin + w_mark, line_y)], fill=GOLD, width=2)
    draw.ellipse([mid - 4, line_y - 4, mid + 4, line_y + 4], fill=GOLD)

    bw = sum(draw.textlength(c, font=f_small) + 7 for c in 'BOUTIQUE') - 7
    spaced(draw, (mid - bw / 2, 198), 'BOUTIQUE', f_small, MUTED, 7)

    draw.text((margin, 306), 'Mode, die in', font=f_claim, fill=INK)
    draw.text((margin, 364), 'Erinnerung bleibt.', font=f_claim, fill=INK)
    spaced(draw, (margin, 492), 'PERSÖNLICH AUSGEWÄHLTE MODE AUS ITALIEN',
           f_small, MUTED, 2)

    card.save(OUT, 'JPEG', quality=86, optimize=True, progressive=True)
    print(f'{os.path.relpath(OUT, ROOT)}  {W}x{H}  {os.path.getsize(OUT) // 1024} KB')


if __name__ == '__main__':
    main()
