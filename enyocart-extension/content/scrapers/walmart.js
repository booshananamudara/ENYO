/**
 * @fileoverview Walmart.com product scraper for EnyoCart.
 */

(function () {
  'use strict';

  window.EnyoScrapers = window.EnyoScrapers || {};

  window.EnyoScrapers.walmart = {
    hostname: ['www.walmart.com', 'walmart.com'],

    isProductPage() {
      return (
        window.location.pathname.startsWith('/ip/') ||
        !!document.querySelector('[itemprop="name"][data-automation-id]') ||
        !!document.querySelector('[data-testid="product-title"]')
      );
    },

    isListingPage() {
      return (
        window.location.pathname.startsWith('/search') ||
        window.location.pathname.startsWith('/browse') ||
        !!document.querySelector('[data-item-id]')
      );
    },

    getProductFromDetailPage() {
      try {
        const title =
          document.querySelector('h1[itemprop="name"]')?.textContent?.trim() ||
          document.querySelector('[data-automation-id="product-title"]')?.textContent?.trim() ||
          document.querySelector('h1')?.textContent?.trim() ||
          document.title;

        let price = 0;
        let priceFormatted = '';
        let currency = 'USD';

        const priceSelectors = [
          '[itemprop="price"]',
          '[data-automation-id="product-price"] span',
          '.price-characteristic',
          '[data-testid="price-wrap"] span',
        ];

        for (const sel of priceSelectors) {
          const el = document.querySelector(sel);
          if (el) {
            const content = el.getAttribute('content') || el.textContent?.trim() || '';
            if (content) {
              priceFormatted = content;
              price = parseFloat(content.replace(/[^\d.]/g, '')) || 0;
              if (price > 0) break;
            }
          }
        }

        const image =
          document.querySelector('[data-testid="hero-image"] img')?.src ||
          document.querySelector('.hero-image img')?.src ||
          document.querySelector('[data-testid="product-image"] img')?.src ||
          document.querySelector('img[data-automation-id="product-image"]')?.src || '';

        const url = this._cleanUrl(window.location.href);
        return this._buildProduct({ title, price, currency, priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] Walmart detail scrape error:', err);
        return null;
      }
    },

    getProductElements() {
      return document.querySelectorAll('[data-item-id]:not([data-item-id=""])');
    },

    getProductFromCard(element) {
      try {
        const itemId = element.getAttribute('data-item-id');
        if (!itemId) return null;

        const title =
          element.querySelector('[data-automation-id="product-title"]')?.textContent?.trim() ||
          element.querySelector('.product-title-link span')?.textContent?.trim() ||
          element.querySelector('a[link-identifier] span')?.textContent?.trim() || '';

        if (!title) return null;

        const priceEl =
          element.querySelector('[data-automation-id="product-price"]') ||
          element.querySelector('.price-main');
        const priceFormatted = priceEl?.textContent?.trim()?.match(/\$[\d,.]+/)?.[0] || '';
        const price = parseFloat(priceFormatted.replace(/[^\d.]/g, '')) || 0;

        const imgEl = element.querySelector('img');
        const image = imgEl?.src || imgEl?.getAttribute('data-src') || '';

        const linkEl = element.querySelector('a[href*="/ip/"]');
        const href = linkEl?.getAttribute('href') || '';
        const url = href.startsWith('http') ? href : `https://www.walmart.com${href.split('?')[0]}`;

        return this._buildProduct({ title, price, currency: 'USD', priceFormatted, image, url });
      } catch (err) {
        console.error('[EnyoCart] Walmart card scrape error:', err);
        return null;
      }
    },

    getProductImageElement(element) {
      return element.querySelector('img');
    },

    _cleanUrl(url) {
      try {
        const u = new URL(url);
        ['from', 'athbdg', 'athcpid', 'athena', 'adsRedirect'].forEach((p) => u.searchParams.delete(p));
        return u.origin + u.pathname;
      } catch (_e) { return url; }
    },

    _sanitize(str) {
      if (!str) return '';
      return String(str).replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, 500);
    },

    _buildProduct({ title, price, currency, priceFormatted, image, url }) {
      return {
        id: `walmart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: this._sanitize(title),
        price,
        currency: currency || 'USD',
        priceFormatted: priceFormatted || `$${price.toFixed(2)}`,
        image,
        url: this._cleanUrl(url),
        vendor: 'Walmart',
        vendorLogo: 'https://www.google.com/s2/favicons?domain=walmart.com&sz=32',
        addedAt: Date.now(),
        quantity: 1,
      };
    },
  };

  console.log('[EnyoCart] Walmart scraper registered');
})();
