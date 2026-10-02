# Sri Rajarajeswara Poultry Farm — Website

Static, dependency-free marketing + bulk-order website for a 25,000-bird layer farm
producing 20,000 eggs per day in Telangana, India.

**No build step. No frameworks. No database. Open `index.html` and it works.**

---

## Structure

```
index.html                  Single-page site (all sections)
404.html                    Custom not-found page
manifest.webmanifest        PWA manifest (add to home screen)
robots.txt / sitemap.xml    SEO crawler files
assets/css/styles.css       Full design system (light + dark themes)
assets/js/data.js           ⭐ All editable business data (prices, phone, hours…)
assets/js/app.js            All interactivity (calculator, gallery, admin, sliders)
assets/img/*.svg            Vector artwork — logo, farm scenes, egg tray, delivery
```

---

## Quick edits (no coding knowledge needed)

Open **`assets/js/data.js`** and change any value, then commit + push. The page
updates instantly everywhere.

| What | Where in `data.js` |
|---|---|
| Phone number shown on site | `phone`, `phoneDisplay` |
| WhatsApp number (with 91) | `whatsapp` |
| Email | `email` |
| Address / service area | `addressLine`, `serviceArea` |
| Founder name | `founder` |
| Trays / cartons / bulk rates (₹ per egg) | `products` |
| Bulk slab rate card | `slabs` |
| Delivery charge + free-delivery limit | `deliveryFee`, `freeDeliveryAbove` |
| Office hours | `hours` |
| Farm film video | `youtube` (paste a YouTube ID) |
| Admin panel PIN | `adminPin` (default `7095` — change it!) |

### Live pricing table in HTML

The rate card in section `#pricing` is plain HTML — update those four rows if
your slab prices change.

---

## Owner Admin panel (in the browser)

Click **Admin** in the footer → enter the PIN (default **7095**) → you get:

* **Business** — phone, WhatsApp, email, address, founder, video ID
* **Pricing** — all four per-egg rates, delivery fee, free-delivery limit
* **Leads** — enquiries saved on your device, export/copy as CSV for Excel
* **Tools** — toggle capacity bar / animations / floating buttons, copy the
  WhatsApp order link, print the rate card, reset to defaults

Settings are stored in this browser's `localStorage`, so they are private to
your device. For changes that every visitor sees, put them in `data.js` and push.

---

## Photos & video (recommended next step)

All artwork is vector illustration so the site is fast and never breaks. To use
**real farm photographs**:

1. Drop JPGs into `assets/img/` (e.g. `assets/img/farm-real.jpg`)
2. In `index.html`, swap the `src` of any `<img>` — e.g. the gallery items:

```html
<figure class="gal-item" data-full="assets/img/farm-real.jpg"
        data-cap="Front shed" data-sub="25,000 layer birds">
  <img src="assets/img/farm-real.jpg" alt="Front shed of our layer house">
</figure>
```

3. For the hero, replace `assets/img/hero-farm.svg` with a wide photo and keep
   the same `width`/`height` attributes (e.g. 1600×900).

For video: paste a YouTube ID into `data.js` → `youtube: "yourId"`. The play
button then becomes a real video player. With the field empty it plays the
4-chapter animated story tour instead (no dead buttons, no errors).

---

## SEO checklist already done

* Title, description and keywords optimised for **bulk eggs / wholesale eggs
  Telangana / egg trays / poultry farm near me**
* JSON-LD: `PoultryFarm` + `LocalBusiness` + `FoodEstablishment`, `WebSite`,
  `FAQPage` and an offer catalogue — this is what makes rich results eligible
* Canonical + `hreflang`, Open Graph and Twitter cards, geo meta for Telangana
* `robots.txt`, `sitemap.xml`, semantic landmarks, alt text on every image
* Mobile-first, WCAG-minded contrast, keyboard support, `prefers-reduced-motion`
* PWA manifest so buyers can "Add to Home Screen" and order from their phone

**After launch:** submit the sitemap in
[Google Search Console](https://search.google.com/search-console) and create a
Google Business Profile — that is what puts you in the Google Maps pack for
"poultry farm near me".

---

## Local preview

```bash
npx serve .          # or: python -m http.server 8080
```

Then open `http://localhost:8080`.

---

## Deploy (GitHub Pages)

Settings → Pages → Deploy from branch → `main` / root. The site is served from
`https://<user>.github.io/<repo>/`.

## Deploy (Netlify)

Drag the folder onto <https://app.netlify.com/drop>, or connect the repo
(build command: empty; publish directory: `/`).
