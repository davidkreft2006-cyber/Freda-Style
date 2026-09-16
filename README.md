# Freda Style – Demo-Webseite

Hochwertige, vollständig responsive Demo-Webseite für die Damenmode-Boutique
**Freda Style**. Die Seite ist als überzeugende Präsentation für den
Kundentermin gebaut und so strukturiert, dass sie später mit wenig Aufwand in
ein Shopify-Online-Store-2.0-Theme überführt werden kann.

> Diese Demo enthält bewusst **keinen echten Checkout und keine echte Zahlung**.
> Bestellanfragen laufen über WhatsApp. Details zur Überführung nach Shopify
> stehen in [`SHOPIFY_MIGRATION.md`](SHOPIFY_MIGRATION.md).

---

## Starten

Die Seite ist reines HTML, CSS und Vanilla JavaScript – kein Build-Schritt,
keine Abhängigkeiten.

```bash
cd freda-style

# Variante 1: Python (auf den meisten Systemen vorhanden)
python3 -m http.server 4000

# Variante 2: Node
npx serve . -l 4000
```

Danach im Browser öffnen: <http://localhost:4000>

Ein Doppelklick auf `index.html` funktioniert ebenfalls, ein lokaler Server ist
aber die zuverlässigere Variante.

---

## Produktbilder einbinden

Die Originalfotos gehören in den Ordner `upload/` (siehe `upload/README.md`).
Danach:

```bash
bash scripts/import-images.sh
```

Das Skript legt verständlich benannte **Kopien** unter
`assets/img/products/` ab. Die Originale bleiben unverändert.

| Datei | Produkt | Format |
| --- | --- | --- |
| `military-blazer-01.jpg` | Military Blazer, getragen | 2:3 |
| `military-blazer-02.jpg` | Military Blazer, Bügel | 2:3 |
| `rock-taschen-01.jpg` | Weiter Rock mit Taschen | 2:3 |
| `hero-rock.jpg` | dasselbe Motiv, unbeschnitten – nur für den Hero | Original |
| `bluse-01.jpg` | Bluse, Detailansicht | 2:3 |
| `bluse-02.jpg` | Bluse, ganzer Look | 2:3 |
| `jeansjacke-01.jpg` | Oversize-Jeansjacke | 2:3 |
| `jeansjacke-02.jpg` | Oversize-Jeansjacke | 2:3 |
| `jeansjacke-03.jpg` | Oversize-Jeansjacke, Detail | 2:3 |

Die Originale liegen unverändert in `upload/`. Die Fassungen in
`assets/img/products/` sind daraus erzeugt: auf ein einheitliches Format 2:3
beschnitten (Gesichter und Produktdetails bleiben vollständig) und als
progressives JPEG gespeichert. Das reduziert die Bildlast von rund 3,4 MB auf
etwa 0,5 MB.

**Neue Bilder ergänzen:** Datei in `assets/img/products/` legen und den Pfad in
`assets/js/products.js` eintragen. Das Zuschneiden übernimmt sonst der Browser
per `object-fit: cover`.

**Fehlt eine Bilddatei**, zeigt die Seite an dieser Stelle einen dezenten
Platzhalter im Markendesign („Bild folgt“) statt eines kaputten Bildsymbols.
Die Seite läuft dadurch immer fehlerfrei.

---

## Was wo geändert wird

### 1. Kontaktdaten und Markentexte → `assets/js/config.js`

```js
window.FREDA_CONFIG = {
  brandName:     'Freda Style',
  announcement:  'Persönlich ausgewählte Mode aus Italien',
  instagramUrl:  'https://www.instagram.com/freda_style/',
  instagramHandle: '@freda_style',
  whatsappNumber: '',   // <-- HIER eintragen
  …
};
```

**WhatsApp-Nummer:** Ländervorwahl ohne `+` und ohne Leerzeichen, z. B.
`4915112345678`.

Solange das Feld leer ist, öffnet die Seite bewusst **keinen fehlerhaften
Link**, sondern zeigt einen Hinweis, wo die Nummer ergänzt werden muss.

### 2. Produkte → `assets/js/products.js`

Alle Produktdaten stehen in dieser einen Datei: Name, Preis, Material, Farbe,
Größen, Beschreibung, Bilder und Verfügbarkeit.

```js
{
  handle: 'emo-bluse',           // eindeutige Kennung (wie in Shopify)
  title:  'EMO Bluse',
  price:  6500,                  // Preis in CENT → 65,00 €
  material: '80 % Baumwolle',
  description: '…',
  images: ['assets/img/products/bluse-01.png', '…'],
  options:  ['Farbe', 'Größe'],
  variants: [
    { id: 'bluse-weiss-m',   options: ['Weiß', 'M'],    available: true, image: null },
    { id: 'bluse-schwarz-s', options: ['Schwarz', 'S'], available: true, image: null }
  ],
  available: true
}
```

* `price` ist **immer in Cent** – das vermeidet Rundungsfehler.
* `options` und die `options`-Liste jeder Variante haben dieselbe Reihenfolge.
* `image` in einer Variante ist optional: Index aus `images`, damit beim
  Wechsel der Farbe direkt das passende Bild erscheint. `null` = keine Zuordnung.
* `imageNote` ist ein optionaler Hinweis für Varianten, zu denen noch kein
  eigenes Foto vorliegt. Er erscheint in der Produktansicht nur, wenn genau
  diese Variante gewählt ist. Sobald ein Foto da ist: bei `image` den Index
  eintragen und `imageNote` löschen. Aktuell genutzt bei der **weißen Bluse**.
* Ein Produkt mit **mehreren** Varianten lässt sich erst in den Warenkorb legen,
  wenn Farbe und Größe gewählt sind.

In derselben Datei stehen außerdem:

| Variable | Zweck |
| --- | --- |
| `FREDA_HERO_IMAGE` | Bild im Hero-Bereich |
| `FREDA_LOOKBOOK` | Bilder im Editorial-Lookbook (`size`: `tall`, `wide`, `small`) |
| `FREDA_INSTAGRAM_TILES` | Bilder im Instagram-Bereich |

> **Später in Shopify** pflegt die Betreiberin Produkte, Preise, Varianten,
> Bilder und Verfügbarkeit selbstständig im **Shopify Admin**. Diese Datei
> entfällt dann – sie ist ausschließlich für die Demo da.

### 3. Design → `assets/css/base.css`

Farben, Typografie, Abstände und Animationen stehen als CSS-Variablen ganz oben
in `:root`:

```css
--c-ink:    #111111;   /* Schwarz          */
--c-cream:  #f7f3ec;   /* warmes Off-White */
--c-gold:   #b08d4f;   /* Goldakzent       */
--f-display: 'Cormorant Garamond', …;  /* Headlines */
--f-body:    'Jost', …;                /* Fließtext */
```

### 4. Texte der Seite → `index.html`

Alle Überschriften und Absätze stehen direkt im HTML, klar mit
Sektions-Kommentaren getrennt.

---

## Aufbau

```
freda-style/
├── index.html                  alle Sektionen, klar kommentiert
├── assets/
│   ├── css/
│   │   ├── base.css            Design-Variablen, Reset, Typografie
│   │   ├── components.css      Buttons, Karten, Drawer, Formulare
│   │   └── layout.css          Sektionen (= spätere Shopify Sections)
│   ├── js/
│   │   ├── config.js           Marke, Instagram, WhatsApp
│   │   ├── products.js         zentrale Produktdatei
│   │   └── app.js              Rendering, Warenkorb, Produktansicht
│   └── img/
│       ├── logo-freda-style.svg   Wortmarke
│       ├── monogram-fs.svg        FS-Monogramm
│       ├── favicon.svg            vereinfachtes Monogramm
│       └── products/              importierte Produktbilder
├── scripts/import-images.sh
├── upload/                     Originalfotos
├── README.md
└── SHOPIFY_MIGRATION.md
```

## Sektionen der Seite

1. Announcement Bar · 2. Header · 3. Hero · 4. Featured Collection /
Product Grid · 5. Produktansicht (Overlay) · 6. Brand Story ·
7. Editorial Lookbook · 8. Instagram · 9. WhatsApp-Beratung ·
10. Newsletter · 11. Footer

Jeder Bereich ist als eigenständige Sektion angelegt und wird später zu einer
Shopify Section.

---

## Markenauftritt

| Datei | Verwendung |
| --- | --- |
| `assets/img/logo-freda-style.svg` | Wortmarke **FREDA STYLE** – Header, Footer |
| `assets/img/monogram-fs.svg` | ineinandergreifendes **FS**-Monogramm – Footer, leerer Warenkorb, Bildplatzhalter |
| `assets/img/favicon.svg` | vereinfachtes Monogramm für den Browser-Tab |

Gestaltung: klassische Serife, weit gesperrt, Schwarz auf warmem Creme mit einer
sehr zurückhaltenden Goldlinie. Das Monogramm funktioniert einfarbig und bleibt
auch bei 16 px lesbar.

---

## Warenkorb (Demo)

* Produkte hinzufügen, entfernen, Menge ändern
* gewählte Größe und Farbe werden gespeichert
* Zwischensumme, sichtbarer Zähler im Header
* Speicherung in `localStorage` (Schlüssel `freda-style:cart:v1`)
* **kein echter Checkout** – „Zur Kasse“ zeigt einen ehrlichen Hinweis
* zusätzlicher Button fasst den gesamten Warenkorb als WhatsApp-Nachricht zusammen

## Newsletter (Demo)

Die E-Mail-Adresse wird im Browser validiert. Es werden **keine Daten
versendet**; die Bestätigung weist ausdrücklich darauf hin, dass der Versand
erst in der finalen Version eingerichtet wird.

## Noch offen

* [ ] WhatsApp-Nummer in `assets/js/config.js` eintragen
* [ ] Produktbilder über `scripts/import-images.sh` importieren
* [ ] **TODO:** Impressum, Datenschutz sowie Versand & Rückgabe ergänzen
      (im Footer als Platzhalter markiert – es wurden bewusst keine
      Rechtstexte erfunden)
* [ ] Foto der **weißen Bluse** ergänzen (siehe `imageNote` oben)

---

## Browser-Unterstützung

Aktuelle Versionen von Chrome, Edge, Firefox und Safari (Desktop und Mobil).
Die Seite ist **mobile first** gebaut und respektiert
`prefers-reduced-motion`.
