# Inabowt Prototype

Inabowt is a prototype social discovery and activity-planning app focused on Las Vegas. This initial version delivers a polished Discover screen with map-based storytelling, searchable activity cards, category filters, event detail modals, and placeholder screens for My Plans and Profile.

## Run locally

Because this is a static HTML/CSS/JavaScript prototype, you can run it without installing a framework or package manager.

### Option 1: Open directly

Open the following file in a browser:

- index.html

### Option 2: Use a local web server

From the project folder, run:

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000/

## Files

- index.html — main app structure
- css/styles.css — visual system, dark map background, responsive layout
- js/data.js — sample Las Vegas outing data
- js/app.js — rendering logic, search, filters, navigation, modal behavior
- assets/images/logo.png — Inabowt brand mark
- assets/images/background.png — atmospheric Las Vegas map background

## Prototype features

- Premium dark-tech visual system inspired by the supplied logo
- Map-based atmospheric background with darkened overlays and subtle fades
- Discover hero section with CTA buttons
- Functional search and category filters
- 12 sample outing cards in fictional demo data
- Event detail modal with proof-of-concept participation interaction
- Create an Outing placeholder modal
- Discover, My Plans, and Profile navigation states
- Responsive mobile layout with bottom navigation

## Notes

This is intentionally a prototype foundation, not a complete production app. Private invitations, real authentication, backend storage, and full outing creation workflows are out of scope for this pass.

## Quick verification checklist

- Confirm the logo loads from assets/images/logo.png
- Confirm the map background is visible behind the content
- Test category filters and search
- Open and close an outing detail modal
- Switch between Discover, My Plans, and Profile
- Resize the browser to desktop and mobile widths
