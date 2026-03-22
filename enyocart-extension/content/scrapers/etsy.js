/**
 * @fileoverview Etsy.com product scraper for EnyoCart.
 */

(function () {
  'use strict';

  window.EnyoScrapers = window.EnyoScrapers || {};

  window.EnyoScrapers.etsy = {
    hostname: ['www.etsy.com', 'etsy.com'],

    isProductPage() {
      return (
        window.location.pathname.startsWith('/listing/') ||
        !!document.querySelector('[data-buy-box-listing-title]') ||
        !!document.querySelector('.listing-page')
      );
    },

    isListingPage() {
      return (
        window.location.pathname.startsWith('/search') ||
        window.location.pathname.includes('/c/') ||
        !!document.querySelector('.v2-listing-card')
      );
    },

    getProductFromDetailPage() {
      try {
        const title =
          document.querySelector('[data-buy-box-listing-title] h1')?.textContent?.trim() ||
          document.querySelector('.wt-text-title-larger')?.textContent?.trim() ||
          document.querySelector('h1[data-buy-box-listing-title]')?.textContent?.trim() ||
          document.querySelector('h1')?.textContent?.trim() ||
          document.title;

        let price = 0;
        let priceFormatted = '';
        let currency = 'USD';

        const priceSelectors = [
          'p[class*="price"] .wt-text-title-larger',
          '[data-buy-box-region="price"] p',
          '.wt-text-title-largest',
          '[data-selector="price-only"]',
          '.notranslate',
        ];

        for (const sel of priceSelectors) {
          const el = document.querySelector(sel);
          if (el?.textContent?.trim()) {
            priceFormatted = el.textContent.trim();
            price = parseFloat(priceFormatted.replace(/[^\d.]/g, '')) || 0;
            currency = this._detectCurrency(priceFormatted);
            if (price > 0) break;
          }
        }

        const image =
          document.querySelector('img.wt-max-width-full')?.src ||
          document.querySelector('[data-testid="listing-image"] img')?.src ||
          document.querySelector('.listing-image-container img')?.src || '';

        const url = this._cleanUrl(window.location.href);
        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] Etsy detail scrape error:', err);
        return null;
      }
    },

    getProductElements() {
      return document.querySelectorAll('.v2-listing-card');
    },

    getProductFromCard(element) {
      try {
        const title =
          element.querySelector('.v2-listing-card__info h3')?.textContent?.trim() ||
          element.querySelector('[data-listing-id] h3')?.textContent?.trim() ||
          element.querySelector('h3')?.textContent?.trim() || '';

        if (!title) return null;

        const priceEl =
          element.querySelector('[data-testid="price-only"]') ||
          element.querySelector('.currency-value') ||
          element.querySelector('[class*="price"]');
        const priceFormatted = priceEl?.textContent?.trim() || '';
        const price = parseFloat(priceFormatted.replace(/[^\d.]/g, '')) || 0;
        const currency = this._detectCurrency(priceFormatted);

        const imgEl = element.querySelector('img.responsive-listing-img') || element.querySelector('img');
        const image = imgEl?.src || imgEl?.getAttribute('data-src') || '';

        const linkEl = element.querySelector('a[href*="/listing/"]');
        const href = linkEl?.getAttribute('href') || '';
        const url = href.startsWith('http') ? href.split('?')[0] : `https://www.etsy.com${href.split('?')[0]}`;

        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] Etsy card scrape error:', err);
        return null;
      }
    },

    getProductImageElement(element) {
      return (
        element.querySelector('img.responsive-listing-img') ||
        element.querySelector('img')
      );
    },

    _detectCurrency(str) {
      if (!str) return 'USD';
      if (str.includes('£')) return 'GBP';
      if (str.includes('€')) return 'EUR';
      if (str.includes('AU$') || str.includes('A$')) return 'AUD';
      if (str.includes('CA$') || str.includes('C$')) return 'CAD';
      return 'USD';
    },

    _cleanUrl(url) {
      try {
        const u = new URL(url);
        // Remove Etsy tracking params
        ['ref', 'pro', 'frs', 'etsrc', 'listing_id'].forEach((p) => u.searchParams.delete(p));
        return u.origin + u.pathname;
      } catch (_e) { return url; }
    },

    _sanitize(str) {
      if (!str) return '';
      return String(str).replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, 500);
    },

    _buildProduct({ title, price, currency, priceFormatted, image, url }) {
      const sym = { USD: '$', GBP: '£', EUR: '€', AUD: 'AU$', CAD: 'CA$' };
      return {
        id: `etsy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: this._sanitize(title),
        price,
        currency: currency || 'USD',
        priceFormatted: priceFormatted || `${sym[currency] || '$'}${price.toFixed(2)}`,
        image,
        url: this._cleanUrl(url),
        vendor: 'Etsy',
        vendorLogo: 'https://www.google.com/s2/favicons?domain=etsy.com&sz=32',
        addedAt: Date.now(),
        quantity: 1,
      };
    },
  };

  console.log('[EnyoCart] Etsy scraper registered');
})();
