/* =============================================================
   FREDA STYLE – Demo-Logik (Vanilla JS, keine Abhaengigkeiten)
   -------------------------------------------------------------
   Bewusst schlank und framework-frei gehalten, damit die Struktur
   spaeter 1:1 nach Shopify Liquid uebertragen werden kann.
   ============================================================= */
(function () {
  'use strict';

  var CFG      = window.FREDA_CONFIG;
  var PRODUCTS = window.FREDA_PRODUCTS || [];
  var CART_KEY = 'freda-style:cart:v1';

  /* ==========================================================
     Hilfsfunktionen
     ========================================================== */
  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var money = new Intl.NumberFormat(CFG.locale, {
    style: 'currency',
    currency: CFG.currency
  });
  function formatPrice(cents) { return money.format(cents / 100); }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function productByHandle(handle) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].handle === handle) return PRODUCTS[i];
    }
    return null;
  }

  function variantById(product, id) {
    for (var i = 0; i < product.variants.length; i++) {
      if (product.variants[i].id === id) return product.variants[i];
    }
    return null;
  }

  /* Lesbare Variantenbezeichnung, z. B. "Schwarz · Größe M" */
  function variantLabel(product, variant) {
    if (!variant) return '';
    return variant.options
      .map(function (value, i) {
        var name = product.options[i];
        return name === 'Größe' ? 'Größe ' + value : value;
      })
      .join(' · ');
  }

  /* Variantentext fuer die WhatsApp-Nachricht: " in Schwarz, Größe M" */
  function variantSentence(product, variant) {
    if (!variant) return '';
    var parts = variant.options.map(function (value, i) {
      return product.options[i] === 'Größe' ? 'Größe ' + value : value;
    });
    return ' in ' + parts.join(', ');
  }

  /* ==========================================================
     Bilder: elegante Rueckfallebene, wenn eine Datei fehlt
     ========================================================== */
  var MONOGRAM = '<svg class="monogram" viewBox="0 0 100 100" aria-hidden="true">' +
    '<g fill="none" stroke="currentColor" stroke-width="4.4">' +
    '<path d="M30 20 V80"/><path d="M30 20 H66"/><path d="M30 48 H55"/>' +
    '<path d="M74 36 C74 24 50 24 50 36 C50 47 74 47 74 60 C74 73 49 73 49 60"/>' +
    '</g></svg>';

  function mediaMarkup(src, alt, opts) {
    opts = opts || {};
    var cls = opts.imgClass ? ' class="' + opts.imgClass + '"' : '';
    var loading = opts.eager ? 'eager' : 'lazy';
    var sizes = opts.sizes ? ' sizes="' + opts.sizes + '"' : '';
    return '' +
      '<div class="media"' + (opts.ratio ? ' style="--media-ratio:' + opts.ratio + '"' : '') + '>' +
        '<img' + cls + ' src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt || '') + '"' +
          ' loading="' + loading + '" decoding="async"' + sizes + ' data-img>' +
        '<div class="media__fallback" aria-hidden="true">' + MONOGRAM +
          '<span>Bild folgt</span>' +
        '</div>' +
      '</div>';
  }

  /* Fehlende Bilddateien werden abgefangen, statt ein kaputtes Icon zu zeigen. */
  document.addEventListener('error', function (event) {
    var el = event.target;
    if (el && el.tagName === 'IMG' && el.hasAttribute('data-img')) {
      var media = el.closest('.media');
      if (media) media.classList.add('is-missing');
    }
  }, true);

  /* ==========================================================
     WhatsApp
     ========================================================== */
  function hasWhatsApp() {
    return typeof CFG.whatsappNumber === 'string' && /^\d{8,15}$/.test(CFG.whatsappNumber.trim());
  }

  function waUrl(message) {
    if (!hasWhatsApp()) return null;
    return 'https://wa.me/' + CFG.whatsappNumber.trim() +
           '?text=' + encodeURIComponent(message);
  }

  /* WhatsApp-Aktionen sind echte Links, keine window.open-Aufrufe.
     window.open wird von Vorschau-Rahmen und Popup-Blockern verschluckt,
     ein <a target="_blank"> funktioniert dagegen ueberall - und laesst
     sich zusaetzlich per Rechtsklick oder langem Tippen oeffnen. */
  function makeWhatsAppLink(el, message) {
    var url = waUrl(message);
    if (!url) return;                       /* ohne Nummer bleibt es ein Button */
    if (el.tagName === 'A') {
      el.href = url;
      return;
    }
    var link = document.createElement('a');
    link.className = el.className;
    link.textContent = el.textContent.trim();
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    Array.prototype.forEach.call(el.attributes, function (attr) {
      if (attr.name.indexOf('data-') === 0) link.setAttribute(attr.name, attr.value);
    });
    el.parentNode.replaceChild(link, el);
  }

  /* Nur noch fuer den Fall ohne hinterlegte Nummer. */
  function openWhatsApp(message) {
    var url = waUrl(message);
    if (!url) {
      toast(CFG.whatsappMissingHint, 'gold');
      return false;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  function productMessage(product, variant) {
    /* Ohne hinterlegten Artikel neutral formulieren - "den EMO Bluse"
       waere schlicht falsch. */
    var name = product.article
      ? product.article + ' ' + product.title
      : 'den Artikel „' + product.title + '“';
    return 'Hallo, ich interessiere mich für ' + name +
           variantSentence(product, variant) +
           ' für ' + formatPrice(product.price) +
           '. Ist der Artikel noch verfügbar?';
  }

  function cartMessage() {
    var items = Cart.items();
    if (!items.length) return '';
    var lines = items.map(function (item) {
      return '• ' + item.title +
             (item.variantLabel ? ' (' + item.variantLabel + ')' : '') +
             ' – ' + item.qty + ' × ' + formatPrice(item.price);
    });
    return 'Hallo Freda Style, ich möchte folgende Artikel anfragen:\n\n' +
           lines.join('\n') +
           '\n\nZwischensumme: ' + formatPrice(Cart.subtotal()) +
           '\n\nSind die Artikel noch verfügbar?';
  }

  var BERATUNG_MSG = 'Hallo Freda Style, ich hätte gerne eine persönliche Beratung ' +
                     'zu Größe und Kombination.';

  /* ==========================================================
     Hinweise (Toast)
     ========================================================== */
  var toastStack;
  function toast(text, variant) {
    if (!toastStack) return;
    var el = document.createElement('div');
    el.className = 'toast' + (variant === 'gold' ? ' toast--gold' : '');
    el.setAttribute('role', 'status');
    el.textContent = text;
    toastStack.appendChild(el);
    window.setTimeout(function () {
      el.classList.add('is-out');
      window.setTimeout(function () { el.remove(); }, 400);
    }, variant === 'gold' ? 6500 : 3800);
  }

  /* ==========================================================
     Warenkorb (localStorage)
     ========================================================== */
  var Cart = (function () {
    var items = [];

    function load() {
      try {
        var raw = window.localStorage.getItem(CART_KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        items = Array.isArray(parsed) ? parsed.filter(function (i) {
          return i && i.key && typeof i.qty === 'number' && i.qty > 0;
        }) : [];
      } catch (err) {
        items = [];
      }
    }

    function save() {
      try {
        window.localStorage.setItem(CART_KEY, JSON.stringify(items));
      } catch (err) { /* privater Modus: Warenkorb bleibt nur in der Sitzung */ }
      document.dispatchEvent(new CustomEvent('cart:change'));
    }

    return {
      init: load,
      items: function () { return items.slice(); },
      count: function () {
        return items.reduce(function (sum, i) { return sum + i.qty; }, 0);
      },
      subtotal: function () {
        return items.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
      },
      add: function (product, variant, qty) {
        var key = product.handle + '::' + (variant ? variant.id : 'default');
        var found = null;
        for (var i = 0; i < items.length; i++) {
          if (items[i].key === key) { found = items[i]; break; }
        }
        if (found) {
          found.qty += qty;
        } else {
          items.push({
            key: key,
            handle: product.handle,
            variantId: variant ? variant.id : null,
            title: product.title,
            variantLabel: variantLabel(product, variant),
            price: product.price,
            image: product.images[0] || '',
            qty: qty
          });
        }
        save();
      },
      setQty: function (key, qty) {
        items = items.map(function (i) {
          if (i.key === key) i.qty = Math.max(1, Math.min(99, qty));
          return i;
        });
        save();
      },
      remove: function (key) {
        items = items.filter(function (i) { return i.key !== key; });
        save();
      }
    };
  })();

  /* ==========================================================
     Panels: Drawer, Modal, mobiles Menue (mit Fokus-Handling)
     ========================================================== */
  var Panels = (function () {
    var overlay, open = null, lastFocus = null;

    function trap(event) {
      if (!open || event.key !== 'Tab') return;
      var focusables = $$(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
        open
      ).filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }

    function onKey(event) {
      if (event.key === 'Escape') close();
      trap(event);
    }

    function show(panel) {
      if (open === panel) return;
      if (open) hide(true);
      lastFocus = document.activeElement;
      open = panel;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-open');
      document.body.classList.add('is-locked');
      document.addEventListener('keydown', onKey);
      window.setTimeout(function () {
        var target = panel.querySelector('[data-autofocus]') || panel.querySelector('button');
        if (target) target.focus();
      }, 60);
    }

    function hide(silent) {
      if (!open) return;
      open.classList.remove('is-open');
      open.setAttribute('aria-hidden', 'true');
      open = null;
      if (!silent) {
        overlay.classList.remove('is-open');
        document.body.classList.remove('is-locked');
        document.removeEventListener('keydown', onKey);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }
    }

    function close() { hide(false); }

    return {
      init: function (overlayEl) {
        overlay = overlayEl;
        overlay.addEventListener('click', close);
      },
      show: show,
      close: close
    };
  })();

  /* ==========================================================
     Rendering: Hero, Produktraster, Lookbook, Instagram
     ========================================================== */
  function renderHero() {
    var slot = $('[data-hero-media]');
    if (!slot || !window.FREDA_HERO_IMAGE) return;
    slot.innerHTML = mediaMarkup(
      window.FREDA_HERO_IMAGE.src,
      window.FREDA_HERO_IMAGE.alt,
      { eager: true, sizes: '(min-width: 900px) 50vw, 100vw' }
    );
  }

  function cardMarkup(product) {
    var main = product.images[0] || '';
    var alt  = product.images[1];
    var sizeValues = optionValues(product, product.options.indexOf('Größe'));
    var meta = sizeValues.length ? sizeValues.join(' · ') : '';

    return '' +
      '<article class="card" data-handle="' + escapeHtml(product.handle) + '">' +
        '<div class="card__media">' +
          mediaMarkup(main, product.title, {
            imgClass: 'card__img--main',
            sizes: '(min-width: 1100px) 25vw, (min-width: 768px) 33vw, 50vw'
          }) +
          (alt
            ? '<img class="card__img--alt" src="' + escapeHtml(alt) + '" alt="" ' +
              'loading="lazy" decoding="async" aria-hidden="true">'
            : '') +
          '<button class="card__quick" type="button" data-quickview="' +
            escapeHtml(product.handle) + '">Quick View</button>' +
        '</div>' +
        '<div class="card__body">' +
          '<h3 class="card__title">' +
            '<a href="#produkt-' + escapeHtml(product.handle) + '" data-open="' +
              escapeHtml(product.handle) + '">' + escapeHtml(product.title) + '</a>' +
          '</h3>' +
          '<p class="card__price">' + formatPrice(product.price) + '</p>' +
          (meta ? '<p class="card__meta">' + escapeHtml(meta) + '</p>' : '') +
        '</div>' +
      '</article>';
  }

  /* Groessen erscheinen in der gewohnten Reihenfolge, nicht in Datenreihenfolge. */
  var SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNI'];

  function optionValues(product, index) {
    if (index < 0) return [];
    var seen = [];
    product.variants.forEach(function (v) {
      if (seen.indexOf(v.options[index]) === -1) seen.push(v.options[index]);
    });
    if (product.options[index] === 'Größe') {
      seen.sort(function (a, b) {
        var ia = SIZE_ORDER.indexOf(a);
        var ib = SIZE_ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });
    }
    return seen;
  }

  function renderGrid() {
    var grid = $('[data-product-grid]');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(function (product, i) {
      return '<div data-reveal style="--reveal-delay:' + (i * 90) + 'ms">' +
             cardMarkup(product) + '</div>';
    }).join('');
  }

  function renderLookbook() {
    var grid = $('[data-lookbook]');
    if (!grid || !window.FREDA_LOOKBOOK) return;
    grid.innerHTML = window.FREDA_LOOKBOOK.map(function (item, i) {
      return '<figure class="lookbook__item lookbook__item--' + item.size + '" ' +
             'data-reveal style="--reveal-delay:' + (i % 3) * 110 + 'ms">' +
               mediaMarkup(item.src, item.alt, { sizes: '(min-width: 768px) 40vw, 100vw' }) +
               '<figcaption>' + escapeHtml(item.alt) + '</figcaption>' +
             '</figure>';
    }).join('');
  }

  function renderInstagram() {
    var grid = $('[data-insta]');
    if (!grid || !window.FREDA_INSTAGRAM_TILES) return;
    grid.innerHTML = window.FREDA_INSTAGRAM_TILES.map(function (tile, i) {
      return '<a class="insta__tile" href="' + CFG.instagramUrl + '" target="_blank" ' +
             'rel="noopener noreferrer" data-reveal style="--reveal-delay:' + (i * 80) + 'ms" ' +
             'aria-label="Freda Style auf Instagram ansehen">' +
               mediaMarkup(tile.src, tile.alt, { sizes: '(min-width: 768px) 25vw, 50vw' }) +
             '</a>';
    }).join('');
  }

  function renderStoryMedia() {
    var slot = $('[data-story-media]');
    if (!slot) return;
    var picks = (window.FREDA_LOOKBOOK || []).slice(0, 2);
    slot.innerHTML = picks.map(function (item) {
      return '<div data-reveal>' +
             mediaMarkup(item.src, item.alt, { sizes: '(min-width: 900px) 25vw, 50vw' }) +
             '</div>';
    }).join('');
  }

  /* ==========================================================
     Produktansicht
     ========================================================== */
  var Detail = (function () {
    var panel, body, state = { product: null, variant: null, qty: 1, image: 0, selection: [] };

    function open(handle) {
      var product = productByHandle(handle);
      if (!product) return;
      state.product = product;
      state.qty = 1;
      state.image = 0;
      state.selection = product.options.map(function () { return null; });

      /* Eindeutige Optionen vorbelegen: bei nur einer Variante alles,
         sonst jede Option, die ohnehin nur einen Wert hat (z. B. die Farbe). */
      if (product.variants.length === 1) {
        state.selection = product.variants[0].options.slice();
      } else {
        product.options.forEach(function (name, i) {
          var values = optionValues(product, i);
          if (values.length === 1) state.selection[i] = values[0];
        });
      }
      state.variant = matchVariant();
      render();
      Panels.show(panel);
    }

    function matchVariant() {
      var p = state.product;
      for (var i = 0; i < p.variants.length; i++) {
        var ok = true;
        for (var j = 0; j < p.options.length; j++) {
          if (state.selection[j] !== p.variants[i].options[j]) { ok = false; break; }
        }
        if (ok) return p.variants[i];
      }
      return null;
    }

    /* Ein Wert ist waehlbar, wenn es mit der uebrigen Auswahl eine Variante gibt. */
    function valueAvailable(optionIndex, value) {
      return state.product.variants.some(function (v) {
        if (v.options[optionIndex] !== value || !v.available) return false;
        return state.selection.every(function (sel, j) {
          return j === optionIndex || sel === null || sel === v.options[j];
        });
      });
    }

    function galleryMarkup() {
      var p = state.product;
      var images = p.images.length ? p.images : [''];
      var current = images[Math.min(state.image, images.length - 1)];
      return '' +
        '<div class="pd__gallery">' +
          '<div class="pd__stage">' +
            mediaMarkup(current, p.title, { eager: true, sizes: '(min-width: 900px) 50vw, 100vw' }) +
          '</div>' +
          (images.length > 1
            ? '<div class="pd__thumbs" role="tablist" aria-label="Weitere Produktbilder">' +
                images.map(function (src, i) {
                  return '<button class="pd__thumb" type="button" role="tab" ' +
                         'aria-current="' + (i === state.image) + '" ' +
                         'aria-label="Bild ' + (i + 1) + ' anzeigen" data-thumb="' + i + '">' +
                           mediaMarkup(src, '', {}) +
                         '</button>';
                }).join('') +
              '</div>'
            : '') +
        '</div>';
    }

    function optionsMarkup() {
      var p = state.product;
      if (p.variants.length <= 1) {
        var only = p.variants[0];
        return '<dl class="pd__facts">' +
          p.options.map(function (name, i) {
            return '<div class="pd__fact"><dt>' + escapeHtml(name) + '</dt><dd>' +
                   escapeHtml(only.options[i]) +
                   (name === 'Größe' && only.note ? ', ' + escapeHtml(only.note) : '') +
                   '</dd></div>';
          }).join('') +
        '</dl>';
      }
      return p.options.map(function (name, i) {
        var values = optionValues(p, i);
        return '<div class="opt">' +
          '<span class="opt__label">' + escapeHtml(name) +
            (state.selection[i] ? ': ' + escapeHtml(state.selection[i]) : '') + '</span>' +
          '<div class="opt__list">' +
            values.map(function (value) {
              var enabled = valueAvailable(i, value);
              return '<button class="opt__btn" type="button" data-option="' + i + '" ' +
                     'data-value="' + escapeHtml(value) + '" ' +
                     'aria-pressed="' + (state.selection[i] === value) + '"' +
                     (enabled ? '' : ' disabled') + '>' + escapeHtml(value) + '</button>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('');
    }

    function render() {
      var p = state.product;
      var needsChoice = p.variants.length > 1 && !state.variant;
      var available = p.available && (!state.variant || state.variant.available !== false);

      body.innerHTML = '' +
        '<div class="pd">' +
          galleryMarkup() +
          '<div class="pd__info">' +
            '<p class="u-eyebrow">Freda Style</p>' +
            '<h2 class="pd__title" id="pd-title">' + escapeHtml(p.title) + '</h2>' +
            '<p class="pd__price">' + formatPrice(p.price) + '</p>' +
            '<p class="status' + (available ? '' : ' status--out') + '">' +
              (available ? 'Verfügbar' : 'Derzeit nicht verfügbar') + '</p>' +
            '<p class="pd__desc">' + escapeHtml(p.description) + '</p>' +
            (p.material
              ? '<dl class="pd__facts"><div class="pd__fact"><dt>Material</dt><dd>' +
                escapeHtml(p.material) + '</dd></div></dl>'
              : '') +
            optionsMarkup() +
            (state.variant && state.variant.imageNote
              ? '<p class="opt__note">' + escapeHtml(state.variant.imageNote) + '</p>'
              : '') +
            (needsChoice
              ? '<p class="opt__hint">Bitte ' +
                escapeHtml(p.options.filter(function (name, i) {
                  return state.selection[i] === null;
                }).join(' und ')) + ' auswählen.</p>'
              : '') +
            '<div class="opt">' +
              '<span class="opt__label">Menge</span>' +
              '<div class="qty">' +
                '<button type="button" data-qty="-1" aria-label="Menge verringern">−</button>' +
                '<output aria-live="polite">' + state.qty + '</output>' +
                '<button type="button" data-qty="1" aria-label="Menge erhöhen">+</button>' +
              '</div>' +
            '</div>' +
            '<button class="btn btn--block" type="button" data-add' +
              (needsChoice || !available ? ' disabled' : '') + '>In den Warenkorb</button>' +
            (function () {
              var url = waUrl(productMessage(p, state.variant));
              return url
                ? '<a class="btn btn--wa btn--block" href="' + escapeHtml(url) + '" ' +
                  'target="_blank" rel="noopener noreferrer" data-wa-product>' +
                  'Über WhatsApp anfragen</a>'
                : '<button class="btn btn--wa btn--block" type="button" data-wa-product>' +
                  'Über WhatsApp anfragen</button>';
            })() +
          '</div>' +
        '</div>';
    }

    function onClick(event) {
      var thumb = event.target.closest('[data-thumb]');
      if (thumb) { state.image = parseInt(thumb.dataset.thumb, 10); render(); return; }

      var opt = event.target.closest('[data-option]');
      if (opt) {
        var index = parseInt(opt.dataset.option, 10);
        state.selection[index] =
          state.selection[index] === opt.dataset.value ? null : opt.dataset.value;
        state.variant = matchVariant();
        if (state.variant && state.variant.image !== null &&
            state.variant.image !== undefined) {
          state.image = state.variant.image;
        }
        render();
        return;
      }

      var qty = event.target.closest('[data-qty]');
      if (qty) {
        state.qty = Math.max(1, Math.min(99, state.qty + parseInt(qty.dataset.qty, 10)));
        render();
        return;
      }

      if (event.target.closest('[data-add]')) {
        Cart.add(state.product, state.variant, state.qty);
        Panels.close();
        toast(state.product.title + ' wurde in den Warenkorb gelegt.');
        return;
      }

      var wa = event.target.closest('[data-wa-product]');
      if (wa && wa.tagName !== 'A') {
        openWhatsApp(productMessage(state.product, state.variant));
      }
    }

    return {
      init: function (panelEl) {
        panel = panelEl;
        body = $('[data-detail-body]', panel);
        panel.addEventListener('click', onClick);
      },
      open: open
    };
  })();

  /* ==========================================================
     Warenkorb-Drawer
     ========================================================== */
  var Drawer = (function () {
    var panel, list, foot;

    function render() {
      var items = Cart.items();

      if (!items.length) {
        list.innerHTML =
          '<div class="cart__empty">' + MONOGRAM +
            '<p>Dein Warenkorb ist noch leer.</p>' +
            '<button class="btn btn--ghost" type="button" data-close-panel>Kollektion ansehen</button>' +
          '</div>';
        foot.hidden = true;
        return;
      }

      foot.hidden = false;
      list.innerHTML = '<div class="cart__list">' + items.map(function (item) {
        return '<div class="cart__item">' +
            mediaMarkup(item.image, item.title, {}) +
            '<div>' +
              '<div class="cart__row">' +
                '<div>' +
                  '<p class="cart__name">' + escapeHtml(item.title) + '</p>' +
                  (item.variantLabel
                    ? '<p class="cart__variant">' + escapeHtml(item.variantLabel) + '</p>'
                    : '') +
                '</div>' +
                '<p class="cart__price">' + formatPrice(item.price * item.qty) + '</p>' +
              '</div>' +
              '<div class="cart__row" style="margin-top:.75rem">' +
                '<div class="qty">' +
                  '<button type="button" data-cart-qty="-1" data-key="' + escapeHtml(item.key) +
                    '" aria-label="Menge verringern">−</button>' +
                  '<output>' + item.qty + '</output>' +
                  '<button type="button" data-cart-qty="1" data-key="' + escapeHtml(item.key) +
                    '" aria-label="Menge erhöhen">+</button>' +
                '</div>' +
                '<button class="cart__remove" type="button" data-cart-remove="' +
                  escapeHtml(item.key) + '">Entfernen</button>' +
              '</div>' +
            '</div>' +
          '</div>';
      }).join('') + '</div>';

      $('[data-cart-subtotal]').textContent = formatPrice(Cart.subtotal());

      var waButton = $('[data-wa-cart]', panel);
      if (waButton) makeWhatsAppLink(waButton, cartMessage());
    }

    function onClick(event) {
      var step = event.target.closest('[data-cart-qty]');
      if (step) {
        var item = Cart.items().filter(function (i) { return i.key === step.dataset.key; })[0];
        if (item) Cart.setQty(item.key, item.qty + parseInt(step.dataset.cartQty, 10));
        return;
      }

      var remove = event.target.closest('[data-cart-remove]');
      if (remove) { Cart.remove(remove.dataset.cartRemove); return; }

      if (event.target.closest('[data-checkout]')) {
        toast('Der sichere Online-Checkout wird in der finalen Shopify-Version ' +
              'eingerichtet. Aktuell kannst du deine Bestellung direkt über ' +
              'WhatsApp anfragen.', 'gold');
        return;
      }

      var waCart = event.target.closest('[data-wa-cart]');
      if (waCart && waCart.tagName !== 'A') {
        var message = cartMessage();
        if (message) openWhatsApp(message);
      }
    }

    return {
      init: function (panelEl) {
        panel = panelEl;
        list = $('[data-cart-list]', panel);
        foot = $('[data-cart-foot]', panel);
        panel.addEventListener('click', onClick);
        document.addEventListener('cart:change', render);
        render();
      },
      open: function () { Panels.show(panel); }
    };
  })();

  /* ==========================================================
     Warenkorb-Zaehler
     ========================================================== */
  function renderCount() {
    var count = Cart.count();
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.classList.toggle('is-on', count > 0);
      el.setAttribute('aria-label', count + ' Artikel im Warenkorb');
    });
  }

  /* ==========================================================
     Scroll-Reveal und kompakter Header
     ========================================================== */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('[data-reveal]').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    function observeAll() {
      $$('[data-reveal]:not(.is-visible)').forEach(function (el) { observer.observe(el); });
    }
    observeAll();
    document.addEventListener('reveal:refresh', observeAll);
  }

  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==========================================================
     Newsletter (Demo, keine Datenuebertragung)
     ========================================================== */
  function initNewsletter() {
    var form = $('[data-newsletter]');
    if (!form) return;
    var input = $('input[type="email"]', form);
    var msg = $('[data-newsletter-msg]', form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value);

      if (!valid) {
        input.setAttribute('aria-invalid', 'true');
        msg.dataset.state = 'error';
        msg.textContent = 'Bitte eine gültige E-Mail-Adresse eingeben.';
        input.focus();
        return;
      }

      input.removeAttribute('aria-invalid');
      msg.dataset.state = 'ok';
      /* Ehrlicher Demo-Hinweis: es werden bewusst keine Daten versendet. */
      msg.textContent = 'Danke! In dieser Demo wird noch nichts versendet – ' +
                        'der Newsletter-Versand wird in der finalen Version eingerichtet.';
      form.reset();
    });
  }

  /* ==========================================================
     Globale Klicks
     ========================================================== */
  function initGlobalClicks() {
    document.addEventListener('click', function (event) {
      var open = event.target.closest('[data-open], [data-quickview]');
      if (open) {
        event.preventDefault();
        Detail.open(open.dataset.open || open.dataset.quickview);
        return;
      }

      if (event.target.closest('[data-open-cart]')) {
        event.preventDefault(); Drawer.open(); return;
      }

      var menu = event.target.closest('[data-open-menu]');
      if (menu) { Panels.show($('[data-mobilenav]')); return; }

      if (event.target.closest('[data-close-panel]')) { Panels.close(); return; }

      var beratung = event.target.closest('[data-wa-beratung]');
      if (beratung && beratung.tagName !== 'A') {
        event.preventDefault();
        openWhatsApp(BERATUNG_MSG);
        return;
      }

      var legal = event.target.closest('[data-legal-todo]');
      if (legal) {
        event.preventDefault();
        /* TODO: Sobald die Rechtstexte vorliegen, hier auf die echten Seiten verlinken. */
        toast('Dieser Bereich wird mit den rechtlichen Texten der Betreiberin ergänzt.', 'gold');
        return;
      }

      /* Anker im mobilen Menue schliessen das Menue. */
      var anchor = event.target.closest('.mobilenav a[href^="#"]');
      if (anchor) Panels.close();
    });
  }

  /* ==========================================================
     Start
     ========================================================== */
  function init() {
    toastStack = $('[data-toasts]');
    Cart.init();

    Panels.init($('[data-overlay]'));
    Detail.init($('[data-detail]'));
    Drawer.init($('[data-drawer]'));

    /* Markendaten aus der zentralen Konfiguration einsetzen. */
    $$('[data-cfg-announcement]').forEach(function (el) { el.textContent = CFG.announcement; });
    $$('[data-cfg-instagram]').forEach(function (el) { el.href = CFG.instagramUrl; });
    $$('[data-cfg-handle]').forEach(function (el) { el.textContent = CFG.instagramHandle; });
    $$('[data-cfg-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
    $$('[data-cfg-brand]').forEach(function (el) { el.textContent = CFG.brandName; });

    $$('[data-wa-beratung]').forEach(function (el) {
      makeWhatsAppLink(el, BERATUNG_MSG);
    });

    renderHero();
    renderGrid();
    renderStoryMedia();
    renderLookbook();
    renderInstagram();

    document.addEventListener('cart:change', renderCount);
    renderCount();

    initHeader();
    initReveal();
    initNewsletter();
    initGlobalClicks();

    document.dispatchEvent(new CustomEvent('reveal:refresh'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
