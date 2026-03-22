/**
 * @fileoverview Nike.com product scraper for EnyoCart.
 */

(function () {
  'use strict';

  window.EnyoScrapers = window.EnyoScrapers || {};

  window.EnyoScrapers.nike = {
    hostname: ['www.nike.com', 'nike.com'],

    isProductPage() {
      return (
        window.location.pathname.includes('/t/') ||
        !!document.getElementById('pdp_product_title') ||
        !!document.querySelector('[data-test="product-name"]')
      );
    },

    isListingPage() {
      return (
        window.location.pathname.includes('/w/') ||
        !!document.querySelector('.product-card') ||
        !!document.querySelector('[data-test="product-card"]')
      );
    },

    getProductFromDetailPage() {
      try {
        const title =
          document.getElementById('pdp_product_title')?.textContent?.trim() ||
          document.querySelector('[data-test="product-name"]')?.textContent?.trim() ||
          document.querySelector('h1')?.textContent?.trim() ||
          document.title;

        const priceEl =
          document.querySelector('[data-test="product-price"]') ||
          document.querySelector('.product-price') ||
          document.querySelector('[class*="price"]');

        const priceFormatted = priceEl?.textContent?.trim() || '';
        const price = parseFloat(priceFormatted.replace(/[^\d.]/g, '')) || 0;
        const currency = this._detectCurrency(priceFormatted);

        const image = this._getMainImage();
        const url = this._cleanUrl(window.location.href);

        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] Nike detail scrape error:', err);
        return null;
      }
    },

    getProductElements() {
      return document.querySelectorAll('.product-card, [data-test="product-card"]');
    },

    getProductFromCard(element) {
      try {
        const title =
          element.querySelector('.product-card__title')?.textContent?.trim() ||
          element.querySelector('[data-test="product-card-name"]')?.textContent?.trim() ||
          element.querySelector('.product-card__subtitle')?.textContent?.trim() || '';

        if (!title) return null;

        const priceEl =
          element.querySelector('.product-card__price') ||
          element.querySelector('[data-test="product-card-price"]');
        const priceFormatted = priceEl?.textContent?.trim() || '';
        const price = parseFloat(priceFormatted.replace(/[^\d.]/g, '')) || 0;
        const currency = this._detectCurrency(priceFormatted);

        const imgEl =
          element.querySelector('.product-card__hero-image') ||
          element.querySelector('img');
        const image = imgEl?.src || imgEl?.getAttribute('data-src') || '';

        const linkEl = element.querySelector('a.product-card__link-overlay, a[href*="/t/"]');
        const href = linkEl?.getAttribute('href') || '';
        const url = href.startsWith('http') ? href : `https://www.nike.com${href}`;

        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] Nike card scrape error:', err);
        return null;
      }
    },

    getProductImageElement(element) {
      return (
        element.querySelector('.product-card__hero-image') ||
        element.querySelector('img')
      );
    },

    _getMainImage() {
      const selectors = [
        '.css-1fxwmkr img',
        '[data-test="hero-image"] img',
        '.pdp-6-up img',
        '.hero-image img',
        '.product-image img',
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el?.src) return el.src;
      }
      return '';
    },

    _detectCurrency(str) {
      if (!str) return 'USD';
      if (str.includes('£')) return 'GBP';
      if (str.includes('€')) return 'EUR';
      if (str.includes('¥')) return 'JPY';
      if (str.includes('A$')) return 'AUD';
      return 'USD';
    },

    _cleanUrl(url) {
      try {
        const u = new URL(url);
        return u.origin + u.pathname;
      } catch (_e) { return url; }
    },

    _sanitize(str) {
      if (!str) return '';
      return String(str).replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, 500);
    },

    _buildProduct({ title, price, currency, priceFormatted, image, url }) {
      const sym = { USD: '$', GBP: '£', EUR: '€', JPY: '¥', AUD: 'A$' };
      return {
        id: `nike_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: this._sanitize(title),
        price,
        currency: currency || 'USD',
        priceFormatted: priceFormatted || `${sym[currency] || '$'}${price.toFixed(2)}`,
        image,
        url: this._cleanUrl(url),
        vendor: 'Nike',
        vendorLogo: 'https://www.google.com/s2/favicons?domain=nike.com&sz=32',
        addedAt: Date.now(),
        quantity: 1,
      };
    },
  };

  console.log('[EnyoCart] Nike scraper registered');
})();
