# Von der Demo zum Shopify-Theme

Diese Demo ist bewusst framework-frei gebaut (semantisches HTML, modulares CSS,
Vanilla JavaScript), damit sie ohne Umbau in ein **Shopify-Online-Store-2.0-Theme**
überführt werden kann. Dieses Dokument beschreibt den Weg dorthin.

---

## 1. Welche Bereiche zu Shopify Sections werden

Jeder Bereich in `index.html` ist als eigenständige Sektion ausgezeichnet und
wird zu einer Liquid-Section unter `sections/`. Alles, was die Betreiberin
später im **Theme-Editor** ändern können soll, wird zu einem `setting` im
`{% schema %}`-Block der jeweiligen Section.

| Bereich der Demo | Shopify Section | Vorlage | Bearbeitbare Settings |
| --- | --- | --- | --- |
| Announcement Bar | `sections/announcement-bar.liquid` | Header-Group | Text, Sichtbarkeit |
| Header | `sections/header.liquid` | Header-Group | Logo, Menü, Instagram-Link |
| Hero | `sections/hero.liquid` | `templates/index.json` | Bild, Headline, Subheadline, zwei Buttons |
| Featured Collection | `sections/featured-collection.liquid` | `templates/index.json` | Collection, Überschrift, Anzahl |
| Product Grid | `sections/main-collection-product-grid.liquid` | `templates/collection.json` | Spalten, Filter, Sortierung |
| Produktansicht | `sections/main-product.liquid` | `templates/product.json` | Galerie, Variantenauswahl, Buttons |
| Brand Story | `sections/brand-story.liquid` | `templates/page.about.json` | Überschrift, Text, drei Markenwerte |
| Lookbook | `sections/lookbook.liquid` | `templates/index.json` | Bilder als `blocks` (beliebig viele) |
| Instagram | `sections/instagram.liquid` | `templates/index.json` | Handle, Link, Bilder als `blocks` |
| Newsletter | `sections/newsletter.liquid` | `templates/index.json` | Überschrift, Text |
| Footer | `sections/footer.liquid` | Footer-Group | Menüs, Logo, Rechtliches |
| WhatsApp-Beratung | `sections/whatsapp-advice.liquid` | `templates/index.json` | Texte, Button-Beschriftung |
| Warenkorb-Drawer | `snippets/cart-drawer.liquid` | global | – |

**Übernahme des CSS:** `assets/css/base.css`, `components.css` und `layout.css`
wandern unverändert nach `assets/` und werden im `theme.liquid` per
`{{ 'base.css' | asset_url | stylesheet_tag }}` eingebunden. Die CSS-Klassen
bleiben gleich, es ändert sich nur, woher die Inhalte kommen.

**Zentrale Markendaten:** Was heute in `assets/js/config.js` steht (Markenname,
Instagram-Link, WhatsApp-Nummer, Announcement-Text), wird zu Einträgen in
`config/settings_schema.json` und ist dann im Shopify-Theme-Editor unter
*Theme-Einstellungen* pflegbar – ohne Code:

```liquid
{% assign wa = settings.whatsapp_number %}
```

---

## 2. Lokale Produktdaten durch Shopify-Produkte ersetzen

Heute liest die Demo alles aus `assets/js/products.js`. In Shopify liefert
Liquid dieselben Felder direkt aus dem Shop:

| Demo (`products.js`) | Shopify Liquid |
| --- | --- |
| `product.handle` | `product.handle` |
| `product.title` | `product.title` |
| `product.price` (Cent) | `product.price` (ebenfalls in Cent → `{{ product.price | money }}`) |
| `product.description` | `product.description` |
| `product.material` | Metafeld `product.metafields.custom.material` |
| `product.images[]` | `product.images` / `product.media` |
| `product.options[]` | `product.options_with_values` |
| `product.variants[]` | `product.variants` |
| `variant.available` | `variant.available` |

Die Preise sind in der Demo bereits **in Cent** hinterlegt – genau wie in
Shopify. Dadurch entfällt bei der Migration jede Umrechnung.

Aus dem Produktraster wird eine Schleife:

```liquid
{%- for product in collections.all.products -%}
  {% render 'product-card', product: product %}
{%- endfor -%}
```

Die Markup-Struktur der Karte (`.card`, `.card__media`, `.card__body`) wird
1:1 nach `snippets/product-card.liquid` übernommen.

**Material** ist in Shopify kein Standardfeld. Dafür wird ein Metafeld angelegt:
*Einstellungen → Benutzerdefinierte Daten → Produkte → Definition hinzufügen*,
Namespace `custom`, Schlüssel `material`, Typ „Einzeiliger Text“. Die
Betreiberin füllt es danach bei jedem Produkt selbst aus.

---

## 3. Größen und Farben als Varianten anlegen

Shopify kennt bis zu drei Optionen pro Produkt. Die Demo nutzt bereits genau
dieselbe Struktur (`options: ['Farbe', 'Größe']`).

Im Shopify Admin unter *Produkte → Produkt → Varianten*:

| Produkt | Option 1 „Farbe“ | Option 2 „Größe“ | Varianten |
| --- | --- | --- | --- |
| EMO Military Blazer | Schwarz | M | 1 |
| EMO weiter Rock mit Taschen | Schwarz | UNI | 1 |
| EMO Bluse | Weiß, Schwarz | S, M | 3 (Weiß/M, Schwarz/S, Schwarz/M) |
| EMO Jeansjacke Oversize | Hellblau | S, M, L | 3 |

Hinweise:

* Shopify erzeugt zunächst **alle** Kombinationen. Nicht vorhandene
  Kombinationen (z. B. Weiß/S bei der Bluse) werden gelöscht.
* Der Zusatz „passend bis Größe L“ beim Rock gehört in die Beschreibung oder in
  ein Metafeld – nicht in den Variantennamen.
* Jeder Variante lässt sich ein Bild zuordnen. Die Demo bildet das über
  `variant.image` ab; in Shopify übernimmt das `variant.featured_media`.
* Die Bestandsverfolgung ersetzt das Feld `available`. Bei Einzelstücken:
  Bestand `1`, „Verkauf bei Nichtverfügbarkeit stoppen“ aktivieren.

Die Auswahl-Logik der Demo (nicht kombinierbare Werte werden deaktiviert)
entspricht dem Verhalten von `variant_selection` in Shopify-Themes und wird
durch die Section-Logik bzw. die Web-Komponente `variant-selects` ersetzt.

---

## 4. Warenkorb und Shopify Checkout

Der Demo-Warenkorb liegt in `localStorage`. In Shopify übernimmt das die
**Cart AJAX API**. Die Oberfläche (Drawer, Mengenwahl, Zwischensumme) bleibt
bestehen, nur die Datenquelle ändert sich:

| Demo | Shopify |
| --- | --- |
| `Cart.add(...)` | `POST /cart/add.js` mit `{ id: variantId, quantity }` |
| `Cart.setQty(...)` | `POST /cart/change.js` |
| `Cart.remove(...)` | `POST /cart/change.js` mit `quantity: 0` |
| `Cart.items()` | `GET /cart.js` |
| `Cart.subtotal()` | `cart.items_subtotal_price` |
| `localStorage` | Shopify-Cart-Cookie (serverseitig) |

Die Variant-ID aus Shopify ersetzt das Feld `variant.id` der Demo.

**Checkout:** Der Button „Zur Kasse“ zeigt in der Demo bewusst einen Hinweis.
In Shopify wird daraus ein echtes Formular:

```liquid
<form action="{{ routes.cart_url }}" method="post">
  <button type="submit" name="checkout" class="btn btn--block">Zur Kasse</button>
</form>
```

Damit landet die Kundin im gehosteten, PCI-konformen Shopify Checkout. Ein
eigener Checkout wird weder gebaut noch benötigt.

Der WhatsApp-Button im Warenkorb kann erhalten bleiben – er ist auch im fertigen
Shop ein sinnvoller zweiter Weg für persönliche Anfragen.

---

## 5. Zahlungsarten aktivieren

Zahlungen werden **nicht im Theme programmiert**, sondern im Shopify Admin
aktiviert. Der Checkout zeigt danach automatisch die passenden Methoden.

*Einstellungen → Zahlungen*:

| Zahlungsart | Weg zur Aktivierung |
| --- | --- |
| Kreditkarte (Visa, Mastercard, Amex) | **Shopify Payments** aktivieren |
| Apple Pay | über Shopify Payments; erscheint automatisch in Safari / iOS |
| Google Pay | über Shopify Payments; erscheint automatisch in Chrome / Android |
| PayPal | *Zusätzliche Zahlungsmethoden → PayPal*, mit PayPal-Konto verbinden |
| Klarna, Sofort, Giropay u. a. | je nach Land über Shopify Payments oder Drittanbieter |

Voraussetzungen für Shopify Payments: abgeschlossene Geschäftsverifizierung,
Bankverbindung und hinterlegte Unternehmensdaten der Betreiberin.

**Beschleunigter Checkout auf der Produktseite:** Apple Pay und Google Pay
lassen sich zusätzlich als Direkt-Buttons anzeigen:

```liquid
{{ form | payment_button }}
```

Sichtbar sind sie nur auf Geräten, die die jeweilige Methode unterstützen –
deshalb ist der reguläre Weg über den Warenkorb weiterhin nötig.

---

## 6. Produktpflege durch die Betreiberin

Nach dem Umzug braucht es für neue Produkte **keinen Entwickler mehr**. Im
Shopify Admin unter *Produkte → Produkt hinzufügen* werden gepflegt:

* Produktname, Beschreibung, Preis
* Bilder (per Drag & Drop, beliebig viele, Reihenfolge frei sortierbar)
* Varianten für Farbe und Größe
* Bestand und Verfügbarkeit
* Material über das Metafeld `custom.material`
* Zuordnung zu Kategorien (Collections), z. B. „Neuheiten“

Die Startseite aktualisiert sich dadurch automatisch, weil die Featured
Collection auf eine Collection verweist und nicht auf einzelne Produkte.
Texte, Bilder und Reihenfolge der Sektionen ändert die Betreiberin im
**Theme-Editor** per Drag & Drop.

Die Datei `assets/js/products.js` wird zu diesem Zeitpunkt nicht mehr
benötigt und entfällt.

---

## 7. Empfohlene Reihenfolge

1. Shopify-Store anlegen, Basis-Theme (z. B. Dawn) als Ausgangspunkt wählen
2. CSS-Dateien und SVG-Logos nach `assets/` übernehmen
3. `theme.liquid` mit Header, Footer und Announcement Bar aufbauen
4. `snippets/product-card.liquid` aus dem Karten-Markup der Demo erstellen
5. Die vier Produkte samt Varianten und Bildern im Admin anlegen
6. Startseiten-Sections ergänzen: Hero, Featured Collection, Brand Story,
   Lookbook, Instagram, WhatsApp-Beratung, Newsletter
7. `main-product.liquid` und Cart-Drawer auf die Cart AJAX API umstellen
8. Zahlungsarten aktivieren und mit einer Testbestellung prüfen
9. Rechtstexte ergänzen: Impressum, Datenschutz, Widerruf, Versand & Rückgabe,
   AGB. **Diese Texte müssen von der Betreiberin bzw. rechtlich geprüft
   bereitgestellt werden – in der Demo stehen dafür bewusst nur Platzhalter.**
10. Newsletter an Shopify Email oder einen Anbieter wie Klaviyo anbinden

---

## 8. Was bewusst nicht in der Demo steckt

* kein echter Checkout und keine echte Zahlung
* keine Kundenkonten, keine Bestellhistorie
* keine Versandberechnung und keine Steuerlogik
* keine Rechtstexte (weder erfunden noch platzhalterhaft ausformuliert)
* keine Admin-Oberfläche – die Produktpflege übernimmt später Shopify Admin
