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
    whatsappNumber: '4917661171406',

  /* Sichtbarer Hinweis, solange keine Nummer hinterlegt ist. */
  whatsappMissingHint:
    'Die WhatsApp-Nummer ist noch nicht hinterlegt. Sie wird in ' +
    'assets/js/config.js unter "whatsappNumber" eingetragen.',

  /* --- Waehrung / Formatierung ----------------------------- */
  locale: 'de-DE',
  currency: 'EUR',

  /* --- Lieferung -------------------------------------------
     Steuert den Ablauf-Hinweis in der Produktansicht.

     Solange "enabled" auf false steht, zeigt die Seite nur den
     Ablauf (Anfrage, Beratung, Versand) OHNE Datumsangaben.
     Das ist Absicht: Lieferzeiten, die nicht zugesagt werden
     koennen, duerfen nicht behauptet werden.

     Sobald die Betreiberin verbindliche Zeiten nennt:
       enabled          auf true setzen
       cutoffHour       Stunde des Bestellschlusses, z. B. 16
       handlingDays     Werktage von Bestellung bis Versand
       shippingDaysMin  schnellste Zustellung in Werktagen
       shippingDaysMax  langsamste Zustellung in Werktagen
     Erst dann erscheinen Termine und der Countdown.
     ------------------------------------------------------------- */
  delivery: {
    enabled: false,
    cutoffHour: null,
    handlingDays: null,
    shippingDaysMin: null,
    shippingDaysMax: null,
    /* Wird im Ablauf genannt, wenn keine Termine hinterlegt sind. */
    hint: 'Versand und Abholung stimmt Freda Style persönlich mit dir ab.'
  },

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
