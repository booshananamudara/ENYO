/**
 * @fileoverview eBay product scraper for EnyoCart.
 */

(function () {
  'use strict';

  window.EnyoScrapers = window.EnyoScrapers || {};

  window.EnyoScrapers.ebay = {
    hostname: ['www.ebay.com', 'ebay.com', 'www.ebay.co.uk', 'www.ebay.de',
               'www.ebay.fr', 'www.ebay.com.au', 'www.ebay.ca'],

    isProductPage() {
      return (
        window.location.pathname.startsWith('/itm/') ||
        !!document.querySelector('.x-item-title') ||
        !!document.querySelector('[data-testid="x-item-title-label"]')
      );
    },

    isListingPage() {
      return (
        window.location.pathname.startsWith('/sch/') ||
        !!document.querySelector('.s-item__wrapper') ||
        !!document.querySelector('.srp-results')
      );
    },

    getProductFromDetailPage() {
      try {
        const title =
          document.querySelector('.x-item-title__mainTitle span')?.textContent?.trim() ||
          document.querySelector('[data-testid="x-item-title-label"]')?.textContent?.trim() ||
          document.querySelector('h1.it-ttl')?.textContent?.trim() ||
          document.title;

        let priceFormatted = '';
        let price = 0;
        let currency = 'USD';

        const priceSelectors = [
          '.x-price-primary .ux-textspans',
          '.x-bin-price__content .ux-textspans',
          '#prcIsum',
          '#prcIsum_bidPrice',
          '.notranslate[itemprop="price"]',
        ];

        for (const sel of priceSelectors) {
          const el = document.querySelector(sel);
          if (el?.textContent?.trim()) {
            priceFormatted = el.textContent.trim();
            price = this._parsePrice(priceFormatted);
            currency = this._detectCurrency(priceFormatted);
            if (price > 0) break;
          }
        }

        const image = this._getMainImage();
        const url = this._cleanUrl(window.location.href);

        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] eBay detail scrape error:', err);
        return null;
      }
    },

    getProductElements() {
      return document.querySelectorAll('.s-item:not(.s-item--placeholder)');
    },

    getProductFromCard(element) {
      try {
        const title =
          element.querySelector('.s-item__title')?.textContent?.trim()?.replace('New listing', '')?.trim() || '';
        if (!title || title === 'Shop on eBay') return null;

        const priceEl = element.querySelector('.s-item__price');
        const priceFormatted = priceEl?.textContent?.trim() || '';
        const price = this._parsePrice(priceFormatted);
        const currency = this._detectCurrency(priceFormatted);

        const imgEl = element.querySelector('.s-item__image-img');
        const image = imgEl?.src || imgEl?.getAttribute('data-src') || '';

        const linkEl = element.querySelector('.s-item__link');
        const url = this._cleanUrl(linkEl?.href || '');

        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] eBay card scrape error:', err);
        return null;
      }
    },

    getProductImageElement(element) {
      return element.querySelector('.s-item__image-img') || element.querySelector('img');
    },

    // ── Private Helpers ──────────────────────────────────────────────────

    _getMainImage() {
      const selectors = [
        '.ux-image-carousel-item.active img',
        '.ux-image-carousel-item img',
        '#icImg',
        '.vi-image-gallery img',
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el?.src) return el.src;
      }
      return '';
    },

    _parsePrice(str) {
      if (!str) return 0;
      // Handle price ranges — take the lower value
      const parts = str.split(/\s*to\s*/i);
      const cleaned = parts[0].replace(/[^\d.,]/g, '');
      const normalized = cleaned.includes(',') && cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
      return parseFloat(normalized) || 0;
    },

    _detectCurrency(str) {
      if (!str) return 'USD';
      if (str.includes('£')) return 'GBP';
      if (str.includes('€')) return 'EUR';
      if (str.includes('AU $') || str.includes('A $')) return 'AUD';
      if (str.includes('C $') || str.includes('CA $')) return 'CAD';
      return 'USD';
    },

    _cleanUrl(url) {
      try {
        const u = new URL(url);
        ['_trkparms', '_trksid', 'hash', 'amdata', 'var'].forEach((p) => u.searchParams.delete(p));
        // Keep only the item path, remove tracking suffixes
        return u.origin + u.pathname;
      } catch (_e) { return url; }
    },

    _sanitize(str) {
      if (!str) return '';
      return String(str).replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, 500);
    },

    _buildProduct({ title, price, currency, priceFormatted, image, url }) {
      const sym = { USD: '$', GBP: '£', EUR: '€', AUD: 'AU $', CAD: 'C $' };
      return {
        id: `ebay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: this._sanitize(title),
        price,
        currency: currency || 'USD',
        priceFormatted: priceFormatted || `${sym[currency] || '$'}${price.toFixed(2)}`,
        image,
        url: this._cleanUrl(url),
        vendor: 'eBay',
        vendorLogo: 'https://www.google.com/s2/favicons?domain=ebay.com&sz=32',
        addedAt: Date.now(),
        quantity: 1,
      };
    },
  };

  console.log('[EnyoCart] eBay scraper registered');
})();
