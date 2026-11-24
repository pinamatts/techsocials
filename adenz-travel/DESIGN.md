# AdenZ Travel sample (built 2026-11-24)

| What | Value | Where it came from |
|---|---|---|
| Palette | green #1F8060, gold #B78B43, navy #183443, red #D7474D, warm #F7F8F5, soft #EAF3EE, border #D9E2E0 | atoztravel.vn `styles.css` custom properties, read 2026-11-24 |
| Logo | `img/logo.png` | atoztravel.vn `/assets/logo-adenz-horizontal-v2.png` |
| Photos | 9 destination photos | atoztravel.vn `/images/*.jpg` (their own destinations page) |
| Type | Fraunces 500 for display, DM Sans for text | Mine. Their site is Arial throughout |
| Journeys, routes, "from" prices | 6 journeys | atoztravel.vn `products.html` and each tour page |
| Central Vietnam 5 days | Hue 1 night, Da Nang 3 nights | The programme AdenZ ran 19-23 Nov 2026 (Cebu Express itinerary PDF). No guest names |
| Rate card | USD 160 a day at 4 star, with level and group factors | SAMPLE. Derived from their published from-prices (about USD 157 to 174 a day). Matt's own net rate is NOT used or shown |
| Transfer times | Hue to Da Nang 2.5 h, and so on | Approximate, general knowledge. Flights are flagged as "quoted separately" |

Feature: trip builder (`plan/`), agent mode with markup and own logo, client proposal (print to PDF), share link in the URL hash, team desk (`owner/`) with requests and an editable rate card. Demo data lives in localStorage.
