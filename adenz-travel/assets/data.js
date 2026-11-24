/* AdenZ Travel sample: destinations, experiences, journeys and the sample rate card.
   Destinations, journeys and "from" prices are AdenZ Travel's own, as published on atoztravel.vn (Nov 2026).
   The Central Vietnam programme is one AdenZ operated in November 2026 for a private group of ten.
   Rates below are a SAMPLE card derived from those published starting prices; the owner desk overrides them. */
window.AZ = (function () {
  const WA = '84938146118', EMAIL = 'cskh@atoztravel.vn';

  const CITIES = {
    hanoi:   { name: 'Hanoi', region: 'North', tag: 'Heritage Capital', img: 'hanoi',
      blurb: 'Historic quarters, lakeside calm, colonial charm and one of Asia’s most compelling food cultures.',
      acts: ['Old Quarter walk and street food', 'Hoan Kiem Lake and Ngoc Son Temple', 'Temple of Literature', 'Ho Chi Minh Mausoleum complex', 'Water puppet show', 'St Joseph’s Cathedral'] },
    halong:  { name: 'Ha Long Bay', region: 'North', tag: 'Iconic Seascape', img: 'halong',
      blurb: 'Limestone islands, misty horizons and an overnight cruise among them.',
      acts: ['Overnight cruise on the bay', 'Kayaking among the islands', 'Sung Sot cave visit', 'Sunset on deck and cooking demo'] },
    ninhbinh:{ name: 'Ninh Binh', region: 'North', tag: 'Scenic Countryside', img: 'ninhbinh',
      blurb: 'River landscapes, limestone peaks and ancient temples at a slower pace.',
      acts: ['Trang An boat ride', 'Bai Dinh Pagoda', 'Hoa Lu ancient capital', 'Mua Cave viewpoint', 'Phat Diem Cathedral'] },
    hue:     { name: 'Hue', region: 'Central', tag: 'Imperial Legacy', img: 'hue',
      blurb: 'The former imperial capital: royal heritage, riverside beauty and Hue cuisine.',
      acts: ['Imperial City', 'Thien Mu Pagoda', 'Khai Dinh’s Tomb', 'Incense Village', 'Perfume River boat', 'Dinner of Hue specialties', 'Our Lady of La Vang (pilgrimage day)'],
      stay: 'Huong Giang Riverside Hotel' },
    danang:  { name: 'Da Nang', region: 'Central', tag: 'Coastal Convenience', img: 'danang',
      blurb: 'Coastline, resort comfort and an easy base for Ba Na Hills and Hoi An.',
      acts: ['Ba Na Hills and the Golden Bridge', 'Da Nang Cathedral', 'Son Tra Peninsula and Linh Ung Pagoda', 'Han Market', 'Marble Mountains', 'Beach time', 'Seafood farewell dinner'],
      stay: 'Sandy Beach Non Nuoc Resort' },
    hoian:   { name: 'Hoi An', region: 'Central', tag: 'Timeless Charm', img: 'hoian',
      blurb: 'Lantern-lit evenings, preserved architecture and a riverfront old town.',
      acts: ['Bay Mau Coconut Forest basket boat', 'Old Town and the Japanese Covered Bridge', 'Lantern streets and night market', 'Cooking class', 'Tailor visit', 'My Son Sanctuary'] },
    hcmc:    { name: 'Ho Chi Minh City', region: 'South', tag: 'Urban Energy', img: 'hcmc',
      blurb: 'History, contemporary dining and a modern pulse entirely distinct from the North.',
      acts: ['Notre-Dame Cathedral and Central Post Office', 'War Remnants Museum', 'Reunification Palace', 'Cu Chi Tunnels', 'Ben Thanh Market', 'Evening food tour'] },
    mekong:  { name: 'Mekong Delta', region: 'South', tag: 'River Life', img: 'mekong',
      blurb: 'Waterways, orchards and floating markets at a gentle pace.',
      acts: ['My Tho and Ben Tre boat trip', 'Cai Rang floating market', 'Orchard and coconut workshop visit', 'Sampan ride through the canals'] },
    phuquoc: { name: 'Phu Quoc', region: 'South', tag: 'Island Retreat', img: 'phuquoc',
      blurb: 'Vietnam’s leading tropical island: beach, resort comfort and an easy finale.',
      acts: ['Beach and resort day', 'Island hopping and snorkelling', 'Hon Thom cable car', 'Night market', 'Sunset dinner'] }
  };

  // d = [city, [activity indexes], 'BLD' meals]
  const J = (id, o) => Object.assign({ id }, o);
  const JOURNEYS = [
    J('central5', { name: '5 Days Central Vietnam', tag: 'Operated Nov 2026', days: 5, level: 4,
      route: 'Hue → Da Nang → Hoi An → Ba Na Hills', from: null,
      note: 'Operated in November 2026 for a private group of ten, with an English-speaking guide and a 29-seat vehicle.',
      plan: [['hue', [5], 'D'], ['hue', [0, 1, 2, 3], 'BLD'], ['hoian', [0, 1, 2], 'BLD'], ['danang', [1, 0, 6], 'BLD'], ['danang', [2, 3], 'BL']],
      base: { 1: 'danang', 2: 'danang' } }),
    J('highlights10', { name: '10 Days Vietnam Highlights', tag: 'LATAM Collection', days: 10, level: 4, from: 1590,
      route: 'Hanoi → Ha Long Bay → Hue → Hoi An → Ho Chi Minh City',
      note: 'A polished first introduction to Vietnam with a comfortable travel rhythm.',
      plan: [['hanoi', [0], 'D'], ['hanoi', [1, 2, 3], 'BL'], ['halong', [0, 1], 'BLD'], ['halong', [2], 'BL'], ['hue', [0, 1], 'BL'], ['hoian', [1, 2], 'BL'], ['hoian', [0], 'BL'], ['hcmc', [0, 1], 'BL'], ['hcmc', [3], 'BL'], ['hcmc', [], 'B']] }),
    J('discovery12', { name: '12 Days Vietnam Discovery', tag: 'LATAM Collection', days: 12, level: 4, from: 1890,
      route: 'Hanoi → Ninh Binh → Ha Long Bay → Hue → Hoi An → Ho Chi Minh City',
      note: 'More breathing space, deeper cultural encounters and a gentler pace.',
      plan: [['hanoi', [0], 'D'], ['hanoi', [1, 2, 3], 'BL'], ['ninhbinh', [0, 2], 'BLD'], ['halong', [0, 1], 'BLD'], ['halong', [2], 'BL'], ['hue', [0, 1, 2], 'BL'], ['hoian', [1, 2], 'BL'], ['hoian', [0, 3], 'BL'], ['hcmc', [0, 1], 'BL'], ['hcmc', [3], 'BL'], ['hcmc', [4, 5], 'B'], ['hcmc', [], 'B']] }),
    J('grand14', { name: '14 Days Grand Vietnam Journey', tag: 'LATAM Collection', days: 14, level: 4, from: 2290,
      route: 'Hanoi → Ninh Binh → Ha Long Bay → Hue → Hoi An → Ho Chi Minh City → Mekong',
      note: 'A fuller picture of the country, with a softer southern ending.',
      plan: [['hanoi', [0], 'D'], ['hanoi', [1, 2, 3], 'BL'], ['ninhbinh', [0, 1], 'BLD'], ['halong', [0, 1], 'BLD'], ['halong', [2], 'BL'], ['hue', [0, 1, 2], 'BL'], ['hoian', [1, 2], 'BL'], ['hoian', [0, 3], 'BL'], ['hcmc', [0, 1], 'BL'], ['hcmc', [3], 'BL'], ['hcmc', [4, 5], 'B'], ['mekong', [0, 2], 'BLD'], ['mekong', [1, 3], 'BL'], ['hcmc', [], 'B']] }),
    J('pilgrimage8', { name: '8 Days Catholic Pilgrimage', tag: 'Pilgrimage', days: 8, level: 4, from: 1290,
      route: 'Ho Chi Minh City → Hue → La Vang → Hoi An / Da Nang',
      note: 'Catholic landmarks with selected heritage, for parish groups and associations.',
      plan: [['hcmc', [0], 'D'], ['hcmc', [1, 2], 'BL'], ['hue', [0, 1], 'BLD'], ['hue', [2, 4], 'BL'], ['hue', [6], 'BLD'], ['hoian', [1, 2], 'BL'], ['danang', [1, 2], 'BL'], ['danang', [], 'B']] }),
    J('phuquoc6', { name: '6 Days Phu Quoc Island Escape', tag: 'Island Escape', days: 6, level: 4, from: 990,
      route: 'Phu Quoc Island',
      note: 'A stylish tropical break, or an add-on after a culture-led mainland itinerary.',
      plan: [['phuquoc', [0], 'D'], ['phuquoc', [0], 'B'], ['phuquoc', [4], 'B'], ['phuquoc', [1, 2], 'BL'], ['phuquoc', [3], 'B'], ['phuquoc', [], 'B']] })
  ];
  const BY_REQUEST = { name: '8 Days Northwest Vietnam Adventure', tag: 'Adventure', days: 8, from: 1390,
    route: 'Hanoi → Sapa → Northwest Highlands → Hanoi', note: 'Mountain scenery and highland culture. Built with you on request.' };

  // Approximate transfers between stops (shown as a note between two days in different places).
  const HOP = {
    'hanoi|halong': 'By road, about 2.5 hours', 'hanoi|ninhbinh': 'By road, about 2 hours', 'ninhbinh|halong': 'By road, about 3 hours',
    'hue|danang': 'By road over the Hai Van Pass, about 2.5 hours', 'hue|hoian': 'By road via Da Nang, about 3 hours',
    'danang|hoian': 'By road, about 45 minutes', 'hcmc|mekong': 'By road, about 2 hours'
  };
  function hop(a, b) {
    if (a === b) return null;
    const k = HOP[a + '|' + b] || HOP[b + '|' + a]; if (k) return { text: k, flight: false };
    return { text: 'Domestic flight between ' + CITIES[a].name + ' and ' + CITIES[b].name + ' (quoted separately)', flight: true };
  }

  // SAMPLE rate card. Per person per day, twin sharing, USD. Built from AdenZ's published "from" prices
  // (USD 1,590 for 10 days and so on, about USD 160 a day at 4 star). The owner desk saves its own card.
  const RATES = { day: 160, level: { 3: 0.85, 4: 1, 5: 1.4 }, group: [[2, 1], [4, 0.88], [6, 0.8], [10, 0.72], [16, 0.66], [26, 0.62]], single: 38 };
  function rates() { try { return Object.assign({}, RATES, JSON.parse(localStorage.getItem('adenz-rates')) || {}); } catch (e) { return RATES; } }
  function groupFactor(r, pax) { let f = r.group[0][1]; for (const [n, v] of r.group) if (pax >= n) f = v; return f; }
  function estimate(days, pax, level) {
    const r = rates(); const pp = days * r.day * (r.level[level] || 1) * groupFactor(r, pax);
    return Math.round(pp / 10) * 10;
  }

  const INCLUDED = ['Accommodation with daily breakfast, twin or double sharing', 'Private transport as per the confirmed itinerary',
    'Sightseeing and entrance tickets as stated', 'English-speaking guide on touring days', 'Meals as marked on each day', 'Operational support before and during travel'];
  const EXCLUDED = ['International and domestic flights', 'Visa fees', 'Personal expenses and tips', 'Anything not stated in the confirmed programme'];
  const CONDITIONS = 'Rates are indicative and subject to reconfirmation based on travel dates, final hotel level, group size and supplier availability. Exact payment, amendment and cancellation terms are restated in the final quotation.';

  return { WA, EMAIL, CITIES, JOURNEYS, BY_REQUEST, hop, RATES, rates, groupFactor, estimate, INCLUDED, EXCLUDED, CONDITIONS,
    usd: n => 'USD ' + Math.round(n).toLocaleString('en-US') };
})();
