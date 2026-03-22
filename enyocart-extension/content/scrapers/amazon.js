/**
 * @fileoverview Amazon.com product scraper for EnyoCart.
 * Handles both search/listing pages and individual product detail pages.
 */

(function () {
  'use strict';

  window.EnyoScrapers = window.EnyoScrapers || {};

  window.EnyoScrapers.amazon = {
    hostname: ['www.amazon.com', 'amazon.com', 'www.amazon.co.uk', 'www.amazon.de',
               'www.amazon.fr', 'www.amazon.co.jp', 'www.amazon.ca', 'www.amazon.com.au'],

    /**
     * Detect if this is an Amazon product detail page.
     * @returns {boolean}
     */
    isProductPage() {
      return (
        !!document.getElementById('productTitle') ||
        !!document.getElementById('dp-container') ||
        /\/dp\/[A-Z0-9]{10}/.test(window.location.pathname)
      );
    },

    /**
     * Detect if this is an Amazon search or listing page.
     * @returns {boolean}
     */
    isListingPage() {
      const path = window.location.pathname;
      return (
        path === '/s' ||
        path.startsWith('/s/') ||
        path.startsWith('/s?') ||
        /^\/s(\?|$)/.test(path) ||
        !!document.querySelector('[data-component-type="s-search-results"]') ||
        !!document.querySelector('div[data-component-type="s-search-result"]')
      );
    },

    /**
     * Extract product data from an Amazon detail page.
     * @returns {Object|null} ProductData
     */
    getProductFromDetailPage() {
      try {
        const title = document.getElementById('productTitle')?.textContent?.trim() || document.title;

        // Price: Try multiple selectors in order of preference
        let price = 0;
        let priceFormatted = '';
        let currency = this._detectCurrency();

        const priceSelectors = [
          '.a-price .a-offscreen',
          '#priceblock_ourprice',
          '#priceblock_dealprice',
          '#priceblock_saleprice',
          '.priceToPay .a-offscreen',
          '#apex_offerDisplay_desktop .a-price .a-offscreen',
          '.a-price[data-a-size="xl"] .a-offscreen',
        ];

        for (const sel of priceSelectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim()) {
            priceFormatted = el.textContent.trim();
            price = this._parsePrice(priceFormatted);
            if (price > 0) break;
          }
        }

        // Image
        const image = this._getMainImage();

        // Product URL (clean of tracking)
        const asin = this._extractAsin(window.location.pathname);
        const url = asin
          ? `https://${window.location.hostname}/dp/${asin}`
          : this._cleanUrl(window.location.href);

        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] Amazon detail scrape error:', err);
        return null;
      }
    },

    /**
     * Get all product card elements on a listing page.
     * Uses the specific s-search-result component type to avoid matching
     * the hundreds of nested elements that also carry data-asin.
     * @returns {NodeList}
     */
    getProductElements() {
      // Primary: actual search result divs (most reliable)
      let els = document.querySelectorAll(
        'div[data-component-type="s-search-result"][data-asin]:not([data-asin=""])'
      );
      if (els.length > 0) return els;

      // Fallback: s-result-item rows (older layout)
      els = document.querySelectorAll(
        '.s-result-item[data-asin]:not([data-asin=""]):not(.AdHolder)'
      );
      if (els.length > 0) return els;

      // Last resort: any top-level data-asin div with an image
      return document.querySelectorAll(
        'div[data-asin]:not([data-asin=""]):not(.AdHolder)'
      );
    },

    /**
     * Extract product data from a single Amazon search result card.
     * @param {HTMLElement} element - Product card element.
     * @returns {Object|null} ProductData
     */
    getProductFromCard(element) {
      try {
        const asin = element.getAttribute('data-asin');
        if (!asin) return null;

        const title =
          element.querySelector('h2 a span')?.textContent?.trim() ||
          element.querySelector('.a-size-medium')?.textContent?.trim() ||
          element.querySelector('h2')?.textContent?.trim() || '';

        if (!title) return null;

        const priceEl = element.querySelector('.a-price .a-offscreen');
        const priceFormatted = priceEl?.textContent?.trim() || '';
        const price = this._parsePrice(priceFormatted);
        const currency = this._detectCurrency();

        const imgEl = element.querySelector('img.s-image') || element.querySelector('img');
        const image = imgEl?.src || imgEl?.getAttribute('data-src') || '';

        const linkEl = element.querySelector('h2 a') || element.querySelector('a.a-link-normal');
        const href = linkEl?.getAttribute('href') || '';
        const url = href ? `https://${window.location.hostname}${href.split('?')[0]}` : `https://${window.location.hostname}/dp/${asin}`;

        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] Amazon card scrape error:', err);
        return null;
      }
    },

    /**
     * Get the image element from a product card (for button positioning).
     * @param {HTMLElement} element
     * @returns {HTMLElement|null}
     */
    getProductImageElement(element) {
      return element.querySelector('img.s-image') || element.querySelector('img');
    },

    // ── Private Helpers ──────────────────────────────────────────────────

    _getMainImage() {
      const selectors = [
        '#landingImage',
        '#imgBlkFront',
        '#main-image',
        '.a-dynamic-image[data-old-hires]',
        '#imageBlock img',
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          return (
            el.getAttribute('data-old-hires') ||
            el.getAttribute('data-a-dynamic-image')?.match(/"(https[^"]+)"/)?.[1] ||
            el.src || ''
          );
        }
      }
      return '';
    },

    _extractAsin(pathname) {
      const match = pathname.match(/\/dp\/([A-Z0-9]{10})/);
      return match ? match[1] : null;
    },

    _detectCurrency() {
      const priceEl = document.querySelector('.a-price-symbol');
      const symbol = priceEl?.textContent?.trim() || '$';
      const map = { '$': 'USD', '£': 'GBP', '€': 'EUR', '¥': 'JPY', 'A$': 'AUD', 'C$': 'CAD' };
      return map[symbol] || 'USD';
    },

    _parsePrice(str) {
      if (!str) return 0;
      const cleaned = str.replace(/[^\d.,]/g, '');
      const normalized = cleaned.includes(',') && cleaned.indexOf(',') > cleaned.indexOf('.')
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
      return parseFloat(normalized) || 0;
    },

    _cleanUrl(url) {
      try {
        const u = new URL(url);
        ['ref', 'tag', 'linkCode', 'linkId', 'th', 'psc'].forEach((p) => u.searchParams.delete(p));
        return u.href;
      } catch (_e) { return url; }
    },

    _sanitize(str) {
      if (!str) return '';
      return String(str).replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, 500);
    },

    _buildProduct({ title, price, currency, priceFormatted, image, url }) {
      const sym = { USD: '$', GBP: '£', EUR: '€', JPY: '¥', AUD: 'A$', CAD: 'C$' };
      return {
        id: `amazon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: this._sanitize(title),
        price,
        currency: currency || 'USD',
        priceFormatted: priceFormatted || `${sym[currency] || '$'}${price.toFixed(2)}`,
        image,
        url: this._cleanUrl(url),
        vendor: 'Amazon',
        vendorLogo: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
        addedAt: Date.now(),
        quantity: 1,
      };
    },
  };

  console.log('[EnyoCart] Amazon scraper registered');
})();
