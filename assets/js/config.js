/* =============================================================
   FREDA STYLE – Zentrale Marken- und Kontaktdaten
   -------------------------------------------------------------
   Alles, was die Betreiberin ohne Code-Kenntnisse aendern koennte,
   steht in dieser Datei. Beim Umzug nach Shopify werden diese
   Werte zu Theme-Settings (settings_schema.json).
   ============================================================= */

window.FREDA_CONFIG = {
  brandName: 'Freda Style',
  brandNameLogo: 'FREDA STYLE',

  /* --- Announcement Bar ------------------------------------ */
  announcement: 'Persönlich ausgewählte Mode aus Italien',

  /* --- Instagram ------------------------------------------- */
  instagramUrl: 'https://www.instagram.com/freda_style/',
  instagramHandle: '@freda_style',

  /* -------------------------------------------------------------
     WhatsApp-Nummer HIER eintragen.
     Format: Laendervorwahl ohne "+" und ohne Leerzeichen.
     Beispiel Deutschland: '4915112345678'
     Solange der Wert leer ist, oeffnet die Seite bewusst KEINEN
     fehlerhaften Link, sondern zeigt einen Hinweis an.
     ------------------------------------------------------------- */
    whatsappNumber: '4915112345678',

  /* Sichtbarer Hinweis, solange keine Nummer hinterlegt ist. */
  whatsappMissingHint:
    'Die WhatsApp-Nummer ist noch nicht hinterlegt. Sie wird in ' +
    'assets/js/config.js unter "whatsappNumber" eingetragen.',

  /* --- Waehrung / Formatierung ----------------------------- */
  locale: 'de-DE',
  currency: 'EUR',

  /* --- Rechtliche Platzhalter ------------------------------ */
  /* TODO: Rechtstexte ergaenzen. Bis dahin bleiben die Links
     bewusst als Platzhalter gekennzeichnet – es werden keine
     Rechtstexte erfunden. */
  legal: {
    imprintUrl: '',
    privacyUrl: '',
    shippingUrl: ''
  }
};
