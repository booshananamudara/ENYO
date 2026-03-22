# EnyoCart Chrome Extension

**Shop Anywhere, Checkout Once.**

EnyoCart is a Google Chrome Extension that lets you add products from multiple online stores into a single unified shopping cart and check out once — with support for credit cards, cryptocurrency, local payment methods, and cash.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Generating Icons](#generating-icons)
4. [Folder Structure](#folder-structure)
5. [Supported Websites](#supported-websites)
6. [Adding a New Store Scraper](#adding-a-new-store-scraper)
7. [Architecture Overview](#architecture-overview)
8. [Design System](#design-system)
9. [Future Roadmap](#future-roadmap)

---

## Overview

EnyoCart solves the multi-store shopping problem. When you're browsing different e-commerce websites, EnyoCart overlays an **"Add to EnyoCart"** button on every product it detects. One click adds the product to your universal cart. When you're ready, open the side panel or popup and check out once — regardless of which stores your items came from.

**Key features:**
- Detects products on Amazon, eBay, Walmart, Nike, Etsy, and any website with structured data (JSON-LD / Open Graph)
- Floating "Add" button overlaid on product images — zero interference with the host site
- Unified cart in a compact popup (380px) and a full side panel
- Vendor-grouped cart view with editable quantities and per-item notes
- Full-page checkout with shipping form, payment method selection (card, crypto, local methods, cash)
- Demo checkout flow (Bankful.com integration planned for live version)
- Options page for currency, notifications, and privacy settings
- Badge showing total cart count on the extension icon

---

## Installation

### Load Unpacked (Developer Mode)

1. Clone or download this repository.
2. **Generate the icon PNG files** (see [Generating Icons](#generating-icons) below).
3. Open Chrome and navigate to `chrome://extensions`.
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **"Load unpacked"**.
6. Select the `enyocart-extension/` folder.
7. The EnyoCart icon will appear in your Chrome toolbar.

---

## Generating Icons

Chrome extensions require PNG icons at sizes 16×16, 32×32, 48×48, and 128×128. Since SVG cannot be used directly for extension icons, use the included generator:

1. Open `generate-icons.html` in your browser (double-click the file, or drag it into Chrome).
2. You will see four rendered versions of the ENYO logo — one for each required size.
3. Click the **Download** button under each icon.
4. Move the downloaded files into `assets/icons/`:
   - `icon-16.png`
   - `icon-32.png`
   - `icon-48.png`
   - `icon-128.png`
5. Reload the extension at `chrome://extensions`.

---

## Folder Structure

```
enyocart-extension/
├── manifest.json                  # Manifest V3 configuration
├── generate-icons.html            # Browser-based icon PNG generator
│
├── background/
│   └── service-worker.js          # Cart state management, badge updates, message routing
│
├── content/
│   ├── content.js                 # Product detection, ENYO button overlay, toasts
│   ├── content.css                # Overlay button, tooltip, toast styles (isolated)
│   └── scrapers/
│       ├── generic.js             # Fallback: JSON-LD, Open Graph, microdata, heuristics
│       ├── amazon.js              # Amazon product scraper
│       ├── ebay.js                # eBay product scraper
│       ├── walmart.js             # Walmart product scraper
│       ├── nike.js                # Nike product scraper
│       └── etsy.js                # Etsy product scraper
│
├── popup/
│   ├── popup.html                 # Compact 380px cart popup
│   ├── popup.js
│   └── popup.css
│
├── sidepanel/
│   ├── sidepanel.html             # Full cart — Chrome Side Panel
│   ├── sidepanel.js
│   └── sidepanel.css
│
├── checkout/
│   ├── checkout.html              # Full-page checkout (new tab)
│   ├── checkout.js
│   └── checkout.css
│
├── options/
│   ├── options.html               # Extension settings page
│   ├── options.js
│   └── options.css
│
├── assets/
│   ├── icons/
│   │   ├── icon-16.png            # (generate using generate-icons.html)
│   │   ├── icon-32.png
│   │   ├── icon-48.png
│   │   ├── icon-128.png
│   │   └── enyo-add-btn.svg       # Overlay button icon SVG
│   └── logo/
│       └── enyo-logo.svg          # Full ENYO logo SVG
│
└── utils/
    ├── storage.js                 # chrome.storage.local Promise wrapper + cart helpers
    ├── messaging.js               # chrome.runtime message helpers + MSG constants
    └── currency.js                # Price formatting, parsing, currency detection
```

---

## Supported Websites

| Store | Product Pages | Listing Pages | Notes |
|-------|---------------|---------------|-------|
| Amazon | ✅ | ✅ | All regional domains (.com, .co.uk, .de, etc.) |
| eBay | ✅ | ✅ | All regional domains |
| Walmart | ✅ | ✅ | walmart.com only |
| Nike | ✅ | ✅ | nike.com |
| Etsy | ✅ | ✅ | etsy.com |
| **Any website** | ✅* | ❌ | *Via generic JSON-LD / Open Graph fallback |

The **generic scraper** works on any e-commerce site that uses:
- `<script type="application/ld+json">` with `@type: "Product"` (Shopify, WooCommerce, etc.)
- Open Graph `product:price:amount` meta tags
- Schema.org microdata `[itemtype*="schema.org/Product"]`

---

## Adding a New Store Scraper

To add support for a new website, create a new file in `content/scrapers/` using this template:

```js
// content/scrapers/mystore.js
(function () {
  'use strict';

  window.EnyoScrapers = window.EnyoScrapers || {};

  window.EnyoScrapers.mystore = {
    // Array of hostnames this scraper handles
    hostname: ['www.mystore.com', 'mystore.com'],

    // Return true if the current page is a single product detail page
    isProductPage() {
      return window.location.pathname.startsWith('/product/');
    },

    // Return true if the current page is a search/listing/category page
    isListingPage() {
      return window.location.pathname.startsWith('/search');
    },

    // Extract product data from a detail page
    getProductFromDetailPage() {
      const title = document.querySelector('h1.product-name')?.textContent?.trim() || '';
      const priceStr = document.querySelector('.price')?.textContent?.trim() || '';
      const price = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
      const image = document.querySelector('.product-image img')?.src || '';

      return {
        id: `mystore_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title,
        price,
        currency: 'USD',
        priceFormatted: `$${price.toFixed(2)}`,
        image,
        url: window.location.href,
        vendor: 'MyStore',
        vendorLogo: `https://www.google.com/s2/favicons?domain=mystore.com&sz=32`,
        addedAt: Date.now(),
        quantity: 1,
      };
    },

    // Return all product card elements on a listing page
    getProductElements() {
      return document.querySelectorAll('.product-card');
    },

    // Extract data from one product card element
    getProductFromCard(element) {
      const title = element.querySelector('.card-title')?.textContent?.trim() || '';
      const priceStr = element.querySelector('.card-price')?.textContent?.trim() || '';
      const price = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
      const image = element.querySelector('img')?.src || '';
      const href = element.querySelector('a')?.href || '';

      return {
        id: `mystore_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title,
        price,
        currency: 'USD',
        priceFormatted: `$${price.toFixed(2)}`,
        image,
        url: href,
        vendor: 'MyStore',
        vendorLogo: `https://www.google.com/s2/favicons?domain=mystore.com&sz=32`,
        addedAt: Date.now(),
        quantity: 1,
      };
    },

    // Return the image element from a card (for button positioning)
    getProductImageElement(element) {
      return element.querySelector('img');
    },
  };

  console.log('[EnyoCart] MyStore scraper registered');
})();
```

Then add the file to `manifest.json` under `content_scripts → js` **before** `content/content.js`:

```json
"js": [
  "content/scrapers/generic.js",
  "content/scrapers/mystore.js",   // ← add here
  "content/content.js"
]
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chrome Extension                          │
│                                                                   │
│  ┌─────────────┐     Messages      ┌──────────────────────────┐  │
│  │  Content    │ ──────────────→   │  Background Service      │  │
│  │  Scripts    │ ←──────────────   │  Worker (SW)             │  │
│  │             │   ADD_TO_CART     │                           │  │
│  │  - Detect   │   REMOVE_FROM     │  - Cart state manager    │  │
│  │    products │   GET_CART        │  - chrome.storage.local  │  │
│  │  - Overlay  │   etc.            │  - Badge updates         │  │
│  │    buttons  │                   │  - Checkout routing      │  │
│  │  - Scrapers │                   └────────────┬─────────────┘  │
│  └─────────────┘                                │ storage.onChanged │
│                                                  ↓                │
│  ┌─────────────┐     Messages      ┌──────────────────────────┐  │
│  │   Popup     │ ──────────────→   │   Side Panel             │  │
│  │  (380px)    │ ←──────────────   │                           │  │
│  │             │   CART_UPDATED    │  - Vendor-grouped view   │  │
│  │  - Cart     │   (broadcast)     │  - Notes per item        │  │
│  │    overview │                   │  - Clear cart            │  │
│  │  - Qty      │                   └──────────────────────────┘  │
│  │  - Checkout │                                                   │
│  └─────────────┘                   ┌──────────────────────────┐  │
│                                    │  Checkout Page (new tab)  │  │
│  ┌─────────────┐                   │                           │  │
│  │  Options    │                   │  - Shipping form          │  │
│  │  Page       │                   │  - Payment selection      │  │
│  │             │                   │  - Order summary          │  │
│  │  - Currency │                   │  - Demo order flow        │  │
│  │  - Notifs   │                   └──────────────────────────┘  │
│  │  - Privacy  │                                                   │
│  └─────────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User visits a store** → Content scripts check `window.EnyoScrapers` for a matching hostname.
2. **Scraper detects products** → Content script overlays circular ENYO buttons on product images.
3. **User clicks ENYO button** → Scraper extracts `ProductData` → sent to background via `chrome.runtime.sendMessage({ type: 'ADD_TO_CART', payload: product })`.
4. **Background service worker** saves item to `chrome.storage.local`, updates the badge count, and broadcasts `CART_UPDATED` to open extension pages (popup, side panel).
5. **Popup / Side Panel** listens for `CART_UPDATED` and re-renders the cart instantly.
6. **Checkout** reads cart from storage, collects shipping + payment, saves demo order.

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `ADD_TO_CART` | Content → BG | Add a product to the cart |
| `REMOVE_FROM_CART` | Popup/Panel → BG | Remove by product ID |
| `UPDATE_QUANTITY` | Popup/Panel → BG | Set item quantity |
| `GET_CART` | Any → BG | Retrieve full cart array |
| `CLEAR_CART` | Popup/Panel → BG | Empty the cart |
| `CHECKOUT` | Popup/Panel → BG | Open checkout tab |
| `GET_CART_COUNT` | Any → BG | Get total item count |
| `CART_UPDATED` | BG → All | Broadcast after any cart change |

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--c-primary` | `#1B3A5C` | Dark navy — headers, primary text |
| `--c-accent` | `#2E75B6` | Bright blue — CTAs, highlights |
| `--c-success` | `#27AE60` | Success states, added animation |
| `--c-warning` | `#F39C12` | Warnings, crypto icon |
| `--c-error` | `#E74C3C` | Errors, remove actions |
| `--c-surface` | `#F5F8FB` | Card backgrounds |
| `--c-border` | `#E2EAF3` | Borders, dividers |
| Font | System font stack | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto` |
| Card radius | `8–10px` | All card elements |
| Button radius | `12px` | All buttons |

---

## Future Roadmap

- [ ] **Live Bankful.com payment integration** — real checkout with card, crypto, PromptPay, GiroPay, iDEAL, and cash
- [ ] **ENYO Widget** — embeddable "Add to EnyoCart" button for merchant websites
- [ ] **More store scrapers** — ASOS, Zara, H&M, Shopee, Lazada, Rakuten, JD.com, Target, Best Buy
- [ ] **Live exchange rates** — via Bankful.com API to display unified prices in any currency
- [ ] **Price comparison** — show the same product cheaper on another supported store
- [ ] **Wish list & price drop alerts** — save items and get notified when prices fall
- [ ] **Order tracking** — post-purchase tracking dashboard for multi-vendor orders
- [ ] **Mobile companion app** — EnyoCart iOS/Android
- [ ] **Seller dashboard** — for merchants to manage EnyoCart-sourced orders

---

*EnyoCart is built by the ENYO team. Visit [ShopEnyo.com](https://shopEnyo.com) for more information.*
