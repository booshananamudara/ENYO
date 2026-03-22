/**
 * @fileoverview Generic fallback scraper — extracts product data using
 * JSON-LD structured data, Open Graph meta tags, Schema.org microdata,
 * and heuristic analysis. Used for any site without a dedicated scraper.
 */

(function () {
  'use strict';

  window.EnyoScrapers = window.EnyoScrapers || {};

  /** @namespace EnyoScrapers.generic */
  window.EnyoScrapers.generic = {
    hostname: ['*'], // Matches any hostname as fallback

    /**
     * Attempt to detect if this is a product detail page using heuristics.
     * @returns {boolean}
     */
    isProductPage() {
      // Check JSON-LD for Product type
      if (this._getJsonLdProduct()) return true;
      // Check Open Graph type
      const ogType = document.querySelector('meta[property="og:type"]');
      if (ogType && ogType.content === 'product') return true;
      // Check microdata
      if (document.querySelector('[itemtype*="schema.org/Product"]')) return true;
      // Heuristic: URL contains product-like segments
      const url = window.location.pathname.toLowerCase();
      return /\/(product|item|p\/|dp\/|pdp|detail)/.test(url);
    },

    /**
     * Generic scrapers don't support listing pages well — return false.
     * @returns {boolean}
     */
    isListingPage() {
      return false;
    },

    /**
     * Extract product data from a detail page using multiple strategies.
     * @returns {Object|null} ProductData or null if extraction fails.
     */
    getProductFromDetailPage() {
      // Strategy 1: JSON-LD structured data
      const jsonLd = this._getJsonLdProduct();
      if (jsonLd) return this._productFromJsonLd(jsonLd);

      // Strategy 2: Open Graph meta tags
      const og = this._getOpenGraphData();
      if (og.title) return this._productFromOpenGraph(og);

      // Strategy 3: Schema.org microdata
      const microdata = this._getMicrodataProduct();
      if (microdata) return microdata;

      // Strategy 4: Heuristics
      return this._productFromHeuristics();
    },

    /**
     * Returns empty array — generic scraper can't reliably identify product cards.
     * @returns {Array}
     */
    getProductElements() {
      return [];
    },

    /**
     * Not used for generic scraper.
     */
    getProductFromCard(_element) {
      return null;
    },

    /**
     * Not used for generic scraper.
     */
    getProductImageElement(_element) {
      return null;
    },

    // ── Private Helpers ──────────────────────────────────────────────────

    /**
     * Find and parse the first JSON-LD block with @type "Product".
     * @returns {Object|null}
     */
    _getJsonLdProduct() {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          // Handle single object or array
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            if (item['@type'] === 'Product') return item;
            // Sometimes nested in @graph
            if (item['@graph']) {
              const found = item['@graph'].find((n) => n['@type'] === 'Product');
              if (found) return found;
            }
          }
        } catch (_e) {
          // Malformed JSON — skip
        }
      }
      return null;
    },

    /**
     * Build a ProductData from a JSON-LD Product node.
     * @param {Object} data
     * @returns {Object}
     */
    _productFromJsonLd(data) {
      let price = 0;
      let currency = 'USD';
      let priceFormatted = '';

      const offers = data.offers || data.Offer;
      if (offers) {
        const offer = Array.isArray(offers) ? offers[0] : offers;
        price = parseFloat(offer.price) || 0;
        currency = offer.priceCurrency || 'USD';
        priceFormatted = offer.price ? `${this._getSymbol(currency)}${price.toFixed(2)}` : '';
      }

      const image = this._resolveImage(
        data.image?.url || data.image?.[0]?.url || data.image?.[0] || data.image
      );

      return this._buildProduct({
        title: data.name || document.title,
        price,
        currency,
        priceFormatted: priceFormatted || `${this._getSymbol(currency)}${price.toFixed(2)}`,
        image,
        url: window.location.href,
      });
    },

    /**
     * Gather Open Graph meta tags into an object.
     * @returns {Object}
     */
    _getOpenGraphData() {
      const get = (property) =>
        document.querySelector(`meta[property="${property}"]`)?.content || '';
      return {
        title: get('og:title'),
        image: get('og:image'),
        url: get('og:url') || window.location.href,
        price: get('product:price:amount') || get('og:price:amount'),
        currency: get('product:price:currency') || get('og:price:currency') || 'USD',
        description: get('og:description'),
      };
    },

    /**
     * Build a ProductData from Open Graph data.
     * @param {Object} og
     * @returns {Object}
     */
    _productFromOpenGraph(og) {
      const price = parseFloat(og.price) || 0;
      const currency = og.currency || 'USD';
      return this._buildProduct({
        title: og.title || document.title,
        price,
        currency,
        priceFormatted: `${this._getSymbol(currency)}${price.toFixed(2)}`,
        image: og.image,
        url: og.url || window.location.href,
      });
    },

    /**
     * Extract product from Schema.org microdata in the DOM.
     * @returns {Object|null}
     */
    _getMicrodataProduct() {
      const el = document.querySelector('[itemtype*="schema.org/Product"]');
      if (!el) return null;

      const name = el.querySelector('[itemprop="name"]')?.textContent?.trim() || document.title;
      const priceEl = el.querySelector('[itemprop="price"]');
      const priceContent = priceEl?.getAttribute('content') || priceEl?.textContent?.trim() || '0';
      const price = parseFloat(priceContent.replace(/[^\d.]/g, '')) || 0;
      const currency =
        el.querySelector('[itemprop="priceCurrency"]')?.getAttribute('content') || 'USD';
      const image =
        el.querySelector('[itemprop="image"]')?.getAttribute('content') ||
        el.querySelector('[itemprop="image"]')?.src ||
        '';

      return this._buildProduct({
        title: name,
        price,
        currency,
        priceFormatted: `${this._getSymbol(currency)}${price.toFixed(2)}`,
        image,
        url: window.location.href,
      });
    },

    /**
     * Last-resort heuristic extraction using common page patterns.
     * @returns {Object}
     */
    _productFromHeuristics() {
      // Title: Try common title selectors, fallback to document.title
      const titleSelectors = [
        'h1[class*="product"]',
        'h1[class*="title"]',
        'h1[class*="name"]',
        '#product-title',
        '#productTitle',
        '.product-title',
        '.product-name',
        'h1',
      ];
      let title = document.title;
      for (const sel of titleSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim()) {
          title = el.textContent.trim();
          break;
        }
      }

      // Price: Scan for price-like text patterns
      const priceRegex = /[\$£€¥฿₹₩]?\s*\d{1,6}([,.]?\d{0,3})*(\.\d{2})?/;
      const priceSelectors = [
        '[class*="price"]',
        '[id*="price"]',
        '[data-price]',
        '.price',
        '#price',
      ];
      let price = 0;
      let currency = 'USD';
      let priceFormatted = '';

      for (const sel of priceSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.textContent.trim();
          const match = text.match(priceRegex);
          if (match) {
            priceFormatted = match[0].trim();
            price = parseFloat(priceFormatted.replace(/[^\d.]/g, '')) || 0;
            if (text.includes('£')) currency = 'GBP';
            else if (text.includes('€')) currency = 'EUR';
            else if (text.includes('¥')) currency = 'JPY';
            else if (text.includes('฿')) currency = 'THB';
            break;
          }
        }
      }

      // Image: Find the largest product-like image
      const image = this._findLargestImage();

      return this._buildProduct({
        title,
        price,
        currency,
        priceFormatted: priceFormatted || `${this._getSymbol(currency)}${price.toFixed(2)}`,
        image,
        url: window.location.href,
      });
    },

    /**
     * Find the largest meaningful image on the page (likely the product image).
     * @returns {string} Image URL or empty string.
     */
    _findLargestImage() {
      const imgs = Array.from(document.querySelectorAll('img'));
      let best = null;
      let bestSize = 0;

      for (const img of imgs) {
        const src = img.src || img.getAttribute('data-src') || '';
        if (!src || src.startsWith('data:') || src.includes('logo') || src.includes('icon')) continue;
        const size = (img.naturalWidth || img.width || 0) * (img.naturalHeight || img.height || 0);
        if (size > bestSize) {
          bestSize = size;
          best = src;
        }
      }

      return best || '';
    },

    /**
     * Resolve relative image URLs to absolute.
     * @param {string} url
     * @returns {string}
     */
    _resolveImage(url) {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      try {
        return new URL(url, window.location.origin).href;
      } catch (_e) {
        return url;
      }
    },

    /**
     * Get a basic currency symbol.
     * @param {string} code
     * @returns {string}
     */
    _getSymbol(code) {
      const map = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', THB: '฿', INR: '₹', KRW: '₩' };
      return map[code] || '$';
    },

    /**
     * Assemble a complete ProductData object with all required fields.
     * @param {Object} partial
     * @returns {Object}
     */
    _buildProduct({ title, price, currency, priceFormatted, image, url }) {
      const cleanUrl = this._cleanUrl(url);
      return {
        id: `generic_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: this._sanitize(title),
        price,
        currency: currency || 'USD',
        priceFormatted: priceFormatted || `$${price.toFixed(2)}`,
        image: image || '',
        url: cleanUrl,
        vendor: window.location.hostname.replace(/^www\./, ''),
        vendorLogo: `https://www.google.com/s2/favicons?domain=${window.location.hostname}&sz=32`,
        addedAt: Date.now(),
        quantity: 1,
      };
    },

    /**
     * Strip common tracking parameters from a URL.
     * @param {string} url
     * @returns {string}
     */
    _cleanUrl(url) {
      try {
        const u = new URL(url);
        const trackingParams = [
          'utm_source','utm_medium','utm_campaign','utm_term','utm_content',
          'ref','source','aff','affiliate','clickid','fbclid','gclid','msclkid',
        ];
        trackingParams.forEach((p) => u.searchParams.delete(p));
        return u.href;
      } catch (_e) {
        return url;
      }
    },

    /**
     * Basic text sanitization to remove script tags and dangerous content.
     * @param {string} str
     * @returns {string}
     */
    _sanitize(str) {
      if (!str) return '';
      return String(str)
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .trim()
        .slice(0, 500);
    },
  };

  console.log('[EnyoCart] Generic scraper registered');
})();
