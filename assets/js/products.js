/* =============================================================
   FREDA STYLE – Zentrale Produktdatei (Demo)
   -------------------------------------------------------------
   In der Demo werden ALLE Produkte ausschliesslich aus dieser
   Datei geladen. Es gibt bewusst kein Backend und keine
   Admin-Oberflaeche.

   Spaeter uebernimmt Shopify diese Rolle: Die Betreiberin pflegt
   Produkte, Preise, Varianten und Bilder selbststaendig im
   Shopify Admin. Details dazu in SHOPIFY_MIGRATION.md.

   Feldreferenz
   ------------
   handle        eindeutige URL-taugliche Kennung (wie in Shopify)
   title         Produktname
   price         Preis in Cent (139,00 EUR -> 13900)
   material      Materialangabe oder null
   description   Beschreibungstext
   badge         kurzer Hinweis auf der Karte oder null
   article       Artikel im Akkusativ fuer die WhatsApp-Nachricht:
                 'den', 'die' oder 'das'. Fehlt der Wert, wird neutral
                 "den Artikel ..." formuliert.
   images        Bildpfade, das erste Bild ist das Hauptbild
   options       Namen der Auswahlfelder, z. B. ['Farbe','Groesse']
   variants      je Variante: { id, options, available, image, imageNote }
                 options   entspricht der Reihenfolge von "options"
                 image     optionaler Index aus "images"
                 imageNote optionaler ehrlicher Hinweis, wenn fuer diese
                           Variante noch kein eigenes Foto vorliegt
   available     Verfuegbarkeit des Produkts insgesamt
   ============================================================= */

window.FREDA_PRODUCTS = [
  {
    handle: 'emo-military-blazer',
    article: 'den',
    title: 'EMO Military Blazer',
    price: 13900,
    material: null,
    description:
      'Eleganter Military Blazer mit markanten goldfarbenen Knöpfen und ' +
      'dekorativen Details. Ein ausdrucksstarkes Statement-Piece für ' +
      'elegante und moderne Looks.',
    badge: null,
    images: [
      'assets/img/products/military-blazer-01.jpg',
      'assets/img/products/military-blazer-02.jpg'
    ],
    options: ['Farbe', 'Größe'],
    variants: [
      { id: 'blazer-schwarz-m', options: ['Schwarz', 'M'], available: true, image: 0 }
    ],
    available: true
  },

  {
    handle: 'emo-weiter-rock-mit-taschen',
    article: 'den',
    title: 'EMO weiter Rock mit Taschen',
    price: 6900,
    material: 'Baumwolle',
    description:
      'Weit geschnittener Baumwollrock mit praktischen Taschen und ' +
      'fließender Silhouette. Lässt sich elegant oder lässig kombinieren.',
    badge: null,
    /* TODO: Foto fuer den Rock ergaenzen. Bis dahin zeigt die Seite an
       dieser Stelle den Platzhalter im Markendesign. */
    images: [],
    options: ['Farbe', 'Größe'],
    variants: [
      {
        id: 'rock-schwarz-uni',
        options: ['Schwarz', 'UNI'],
        available: true,
        image: 0,
        note: 'passend bis Größe L'
      }
    ],
    available: true
  },

  {
    handle: 'emo-bluse',
    article: 'die',
    title: 'EMO Bluse',
    price: 6500,
    material: '80 % Baumwolle',
    description:
      'Feminine Bluse mit ausdrucksstarker Silhouette und besonderen ' +
      'Ärmeldetails. Ein vielseitiges Boutique-Piece für elegante Outfits.',
    badge: null,
    images: [
      'assets/img/products/bluse-01.jpg',
      'assets/img/products/bluse-02.jpg'
    ],
    options: ['Farbe', 'Größe'],
    variants: [
      {
        id: 'bluse-weiss-m',
        options: ['Weiß', 'M'],
        available: true,
        image: null,
        /* Fuer die weisse Bluse liegt noch kein eigenes Foto vor.
           Sobald eines da ist: hier den Bildindex bei "image" eintragen
           und diesen Hinweis loeschen. */
        imageNote: 'Für diese Farbe liegt noch kein eigenes Foto vor – ' +
                   'die Abbildung zeigt die schwarze Variante.'
      },
      { id: 'bluse-schwarz-s', options: ['Schwarz', 'S'], available: true, image: null },
      { id: 'bluse-schwarz-m', options: ['Schwarz', 'M'], available: true, image: null }
    ],
    available: true
  },

  {
    handle: 'emo-jeansjacke-oversize',
    article: 'die',
    title: 'EMO Jeansjacke Oversize',
    price: 10900,
    material: '100 % Baumwolle',
    description:
      'Hellblaue Oversize-Jeansjacke aus reiner Baumwolle mit modernem ' +
      'Schnitt und auffälligen Details. Ideal als lässiges Statement-Piece.',
    badge: null,
    images: [
      'assets/img/products/jeansjacke-01.jpg',
      'assets/img/products/jeansjacke-02.jpg',
      'assets/img/products/jeansjacke-03.jpg'
    ],
    options: ['Farbe', 'Größe'],
    variants: [
      { id: 'jeansjacke-hellblau-s', options: ['Hellblau', 'S'], available: true, image: null },
      { id: 'jeansjacke-hellblau-m', options: ['Hellblau', 'M'], available: true, image: null },
      { id: 'jeansjacke-hellblau-l', options: ['Hellblau', 'L'], available: true, image: null }
    ],
    available: true
  }
];

/* -------------------------------------------------------------
   Lookbook-Auswahl (Editorial)
   Es werden ausschliesslich vorhandene Produktbilder verwendet.
   ------------------------------------------------------------- */
window.FREDA_LOOKBOOK = [
  { src: 'assets/img/products/jeansjacke-02.jpg',      alt: 'Oversize-Jeansjacke',          size: 'tall'  },
  { src: 'assets/img/products/military-blazer-01.jpg', alt: 'Military Blazer',              size: 'wide'  },
  { src: 'assets/img/products/bluse-01.jpg',           alt: 'Bluse mit Ärmeldetails',       size: 'small' },
  { src: 'assets/img/products/jeansjacke-01.jpg',      alt: 'Oversize-Jeansjacke',          size: 'tall'  },
  { src: 'assets/img/products/military-blazer-02.jpg', alt: 'Military Blazer, Detailblick', size: 'small' },
  { src: 'assets/img/products/bluse-02.jpg',           alt: 'Bluse im Look',                size: 'wide'  }
];

/* Instagram-inspirierter Bereich: echte Produktbilder, kein Fake-Feed. */
window.FREDA_INSTAGRAM_TILES = [
  { src: 'assets/img/products/jeansjacke-02.jpg',      alt: 'Oversize-Jeansjacke' },
  { src: 'assets/img/products/bluse-02.jpg',           alt: 'Bluse' },
  { src: 'assets/img/products/military-blazer-01.jpg', alt: 'Military Blazer' },
  { src: 'assets/img/products/jeansjacke-03.jpg',      alt: 'Oversize-Jeansjacke, Detail' }
];

/* Hero-Bild: bevorzugt die Aufnahme mit dem schwarzen Rock. */
window.FREDA_HERO_IMAGE = {
  src: 'assets/img/products/jeansjacke-01.jpg',
  alt: 'Look mit Oversize-Jeansjacke von Freda Style'
};
