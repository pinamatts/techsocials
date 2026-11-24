/* AdenZ Travel trip builder (sample by TechSocials). State lives in S; the day cards are real DOM nodes
   that are moved, not rebuilt, when the order changes (see modern-web-guidance: dynamic-sort). */
(function () {
  const A = window.AZ, $ = s => document.querySelector(s), C = A.CITIES;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  let uid = 1;
  const S = { j: '', title: '', pax: 2, level: 4, start: '', lang: 'English', days: [] };
  const AG = load('adenz-agent') || { name: '', contact: '', mark: 15, client: '', logo: '' };
  function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- plan <-> link ---------- */
  function pack() {
    return { t: S.title, p: S.pax, l: S.level, s: S.start, g: S.lang, j: S.j,
      d: S.days.map(d => [d.city, d.acts.map(a => C[d.city].acts.indexOf(a)).filter(i => i >= 0), d.meals, d.note || '', d.sleep || '']) };
  }
  function unpack(o) {
    S.title = o.t || ''; S.pax = +o.p || 2; S.level = +o.l || 4; S.start = o.s || ''; S.lang = o.g || 'English'; S.j = o.j || '';
    S.days = (o.d || []).filter(d => C[d[0]]).map(d => ({ id: uid++, city: d[0], acts: (d[1] || []).map(i => C[d[0]].acts[i]).filter(Boolean), meals: d[2] || '', note: d[3] || '', sleep: C[d[4]] ? d[4] : '' }));
  }
  const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));
  const link = () => location.origin + location.pathname + '#p=' + enc(pack());

  function fromJourney(id) {
    const j = A.JOURNEYS.find(x => x.id === id); if (!j) return false;
    S.j = id; S.title = j.name; S.level = j.level;
    S.days = j.plan.map((d, i) => ({ id: uid++, city: d[0], acts: d[1].map(k => C[d[0]].acts[k]), meals: d[2], note: '', sleep: (j.base && j.base[i]) || '' }));
    return true;
  }
  function blank(city) {
    S.j = ''; S.title = city ? C[city].name + ' journey' : 'My Vietnam journey';
    const c = city || 'hanoi';
    S.days = [0, 1, 2].map(i => ({ id: uid++, city: c, acts: i === 1 ? C[c].acts.slice(0, 2) : [], meals: i ? 'B' : '', note: '', sleep: '' }));
  }

  /* ---------- helpers ---------- */
  const sleepOf = d => d.sleep || d.city;
  function dateOf(i) {
    if (!S.start) return ''; const d = new Date(S.start + 'T00:00:00'); if (isNaN(d)) return '';
    d.setDate(d.getDate() + i); return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function titleOf(i) {
    const d = S.days[i], n = C[d.city].name, prev = i ? S.days[i - 1] : null;
    if (i === 0) return 'Arrive in ' + n;
    if (i === S.days.length - 1) return (sleepOf(prev) !== d.city ? C[sleepOf(prev)].name + ' to ' + n : n) + ', and departure';
    return sleepOf(prev) !== d.city ? C[sleepOf(prev)].name + ' to ' + n : n;
  }
  function stays() { // consecutive nights grouped by where the group sleeps
    const out = []; S.days.slice(0, -1).forEach(d => { const c = sleepOf(d), l = out[out.length - 1]; if (l && l.c === c) l.n++; else out.push({ c, n: 1 }); }); return out;
  }
  function hops() { const h = []; for (let i = 1; i < S.days.length; i++) { const x = A.hop(sleepOf(S.days[i - 1]), S.days[i].city); if (x) h.push(Object.assign({ i }, x)); } return h; }
  const net = () => A.estimate(S.days.length, S.pax, S.level);
  const agentOn = () => $('#agent').open && (AG.name || AG.mark > 0);
  const sell = () => Math.round(net() * (1 + (+AG.mark || 0) / 100) / 10) * 10;

  /* ---------- day cards ---------- */
  const MEAL = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' };
  function dayNode(d) {
    const el = document.createElement('article'); el.className = 'card day'; el.dataset.id = d.id;
    el.innerHTML = `<div class="ph"><img alt="" loading="lazy"><b></b></div><div class="bd">
      <div class="hop" hidden></div>
      <div class="row1"><div style="flex:1;min-width:180px"><div class="when"></div><h3 class="serif"></h3></div>
        <select class="city" aria-label="City for this day">${Object.entries(C).map(([k, c]) => `<option value="${k}">${c.name}</option>`).join('')}</select>
        <div class="tools"><button class="ib" type="button" data-a="up" aria-label="Move this day earlier">↑</button><button class="ib" type="button" data-a="down" aria-label="Move this day later">↓</button><button class="ib" type="button" data-a="del" aria-label="Remove this day">×</button></div></div>
      <div class="acts" role="group" aria-label="Experiences"></div>
      <input class="nt" type="text" maxlength="120" placeholder="Add a note for this day (optional)" aria-label="Note for this day">
      <div class="row3"><span>Meals</span><span class="meals">${Object.keys(MEAL).map(m => `<button class="chip" type="button" data-m="${m}" aria-pressed="false" aria-label="${MEAL[m]}">${m}</button>`).join('')}</span>
        <label>Overnight in <select class="sleep"></select></label></div></div>`;
    fill(el, d); return el;
  }
  function fill(el, d) {
    const c = C[d.city];
    el.querySelector('img').src = '../img/' + c.img + '-s.jpg';
    el.querySelector('select.city').value = d.city;
    el.querySelector('.acts').innerHTML = c.acts.map(a => `<button class="chip" type="button" data-act="${esc(a)}" aria-pressed="${d.acts.includes(a)}">${esc(a)}</button>`).join('');
    el.querySelector('.nt').value = d.note || '';
    el.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', d.meals.includes(b.dataset.m)));
    el.querySelector('.sleep').innerHTML = `<option value="">${esc(c.name)}</option>` + Object.entries(C).filter(([k]) => k !== d.city).map(([k, x]) => `<option value="${k}"${d.sleep === k ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
  }
  function labels() { // numbers, dates, titles and transfer notes depend on order, so refresh them in place
    const hs = hops();
    S.days.forEach((d, i) => {
      const el = $('#days').querySelector(`[data-id="${d.id}"]`); if (!el) return;
      el.querySelector('.ph b').textContent = 'Day ' + (i + 1);
      el.querySelector('.when').textContent = dateOf(i) || 'Day ' + (i + 1);
      el.querySelector('h3').textContent = titleOf(i);
      const h = hs.find(x => x.i === i), hop = el.querySelector('.hop');
      hop.hidden = !h; if (h) { hop.textContent = (h.flight ? '✈ ' : '→ ') + h.text; hop.classList.toggle('fl', h.flight); }
      el.querySelector('[data-a=up]').disabled = i === 0; el.querySelector('[data-a=down]').disabled = i === S.days.length - 1;
      el.querySelector('[data-a=del]').disabled = S.days.length < 2;
      el.querySelector('.row3 label').hidden = i === S.days.length - 1;
    });
  }
  function drawDays() { const box = $('#days'); box.replaceChildren(...S.days.map(dayNode)); labels(); }
  function reorder(say) {
    const box = $('#days'), nodes = S.days.map(d => box.querySelector(`[data-id="${d.id}"]`));
    const run = () => { for (const n of nodes) box.moveBefore ? box.moveBefore(n, null) : box.appendChild(n); labels(); };
    const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!quiet && document.startViewTransition) { const t = document.startViewTransition(run); t.ready.catch(() => {}); t.finished.catch(() => {}); } else run();
    $('#live').textContent = say; summary();
  }

  /* ---------- summary ---------- */
  function summary() {
    const n = S.days.length, st = stays(), hs = hops(), fl = hs.filter(h => h.flight).length;
    $('#sTitle').textContent = S.title || 'My Vietnam journey';
    $('#sMeta').textContent = `${n} day${n > 1 ? 's' : ''} · ${Math.max(n - 1, 0)} night${n === 2 ? '' : 's'} · ${S.pax} traveller${S.pax > 1 ? 's' : ''} · ${S.level} star`;
    $('#sRoute').innerHTML = st.length ? st.map(s => `<div>${esc(C[s.c].name)}<span>${s.n} night${s.n > 1 ? 's' : ''}</span></div>`).join('') : `<div>${esc(C[S.days[0].city].name)}<span>day visit</span></div>`;
    const pp = net();
    $('#pPP').textContent = A.usd(pp); $('#mPP').textContent = A.usd(pp); $('#pTot').textContent = `${A.usd(pp * S.pax)} for ${S.pax}, twin sharing`;
    const ao = agentOn(); $('#pSell').hidden = !ao; $('#pLabel').textContent = ao ? 'Your net price per person (indicative)' : 'Indicative price per person';
    if (ao) { $('#pSellPP').textContent = A.usd(sell()); $('#pSellTot').textContent = `${A.usd(sell() * S.pax)} for the group · ${+AG.mark || 0}% markup`; }
    const acts = S.days.reduce((a, d) => a + d.acts.length, 0);
    $('#sFlags').innerHTML = `<div><b>${acts}</b> experience${acts === 1 ? '' : 's'} chosen · guide in ${esc(S.lang)}</div>` +
      (fl ? `<div><b>${fl}</b> domestic flight${fl > 1 ? 's' : ''} needed, quoted separately</div>` : '<div>No domestic flights on this route</div>');
    document.querySelectorAll('#starts .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.j === S.j));
    save('adenz-plan', pack());
  }
  function fields() {
    $('#fTitle').value = S.title; $('#fPax').value = S.pax; $('#fStart').value = S.start; $('#fLang').value = S.lang;
    document.querySelectorAll('#fLevel button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.l === S.level));
  }
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }

  /* ---------- events ---------- */
  $('#starts').innerHTML = A.JOURNEYS.map(j => `<button class="chip" type="button" data-j="${j.id}" aria-pressed="false">${esc(j.name)}</button>`).join('');
  $('#starts').addEventListener('click', e => { const b = e.target.closest('[data-j]'); if (!b) return; fromJourney(b.dataset.j); fields(); drawDays(); summary(); $('#live').textContent = 'Loaded ' + S.title; });
  $('#fTitle').addEventListener('input', e => { S.title = e.target.value; summary(); });
  $('#fPax').addEventListener('input', e => { S.pax = Math.min(60, Math.max(1, parseInt(e.target.value, 10) || 1)); summary(); });
  $('#fStart').addEventListener('input', e => { S.start = e.target.value; labels(); summary(); });
  $('#fLang').addEventListener('change', e => { S.lang = e.target.value; summary(); });
  $('#fLevel').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (!b) return; S.level = +b.dataset.l; fields(); summary(); });
  $('#addDay').addEventListener('click', () => {
    const last = S.days[S.days.length - 1], d = { id: uid++, city: last ? sleepOf(last) : 'hanoi', acts: [], meals: 'B', note: '', sleep: '' };
    S.days.push(d); $('#days').appendChild(dayNode(d)); labels(); summary(); $('#live').textContent = 'Day ' + S.days.length + ' added';
    $('#days').lastElementChild.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  $('#clearAll').addEventListener('click', () => { blank(); fields(); drawDays(); summary(); });
  $('#days').addEventListener('click', e => {
    const card = e.target.closest('.day'); if (!card) return; const i = S.days.findIndex(d => d.id == card.dataset.id), d = S.days[i];
    const a = e.target.closest('[data-a]'), act = e.target.closest('[data-act]'), m = e.target.closest('[data-m]');
    if (a) {
      if (a.dataset.a === 'del') { S.days.splice(i, 1); card.remove(); labels(); summary(); $('#live').textContent = 'Day removed, ' + S.days.length + ' days left'; return; }
      const k = a.dataset.a === 'up' ? i - 1 : i + 1; if (k < 0 || k >= S.days.length) return;
      [S.days[i], S.days[k]] = [S.days[k], S.days[i]]; reorder(`${C[d.city].name} is now day ${k + 1} of ${S.days.length}`);
      const keep = card.querySelector(`[data-a=${a.dataset.a}]`); (keep.disabled ? card.querySelector('[data-a]:not([disabled])') : keep).focus();
    } else if (act) {
      const v = act.dataset.act, on = !d.acts.includes(v); d.acts = on ? d.acts.concat(v) : d.acts.filter(x => x !== v); act.setAttribute('aria-pressed', on); summary();
    } else if (m) {
      const v = m.dataset.m, on = !d.meals.includes(v); d.meals = 'BLD'.split('').filter(x => x === v ? on : d.meals.includes(x)).join(''); m.setAttribute('aria-pressed', on); summary();
    }
  });
  $('#days').addEventListener('change', e => {
    const card = e.target.closest('.day'); if (!card) return; const d = S.days.find(x => x.id == card.dataset.id);
    if (e.target.matches('select.city')) { d.city = e.target.value; d.acts = []; d.sleep = ''; fill(card, d); labels(); summary(); }
    if (e.target.matches('select.sleep')) { d.sleep = e.target.value; labels(); summary(); }
  });
  $('#days').addEventListener('input', e => { if (!e.target.matches('.nt')) return; const d = S.days.find(x => x.id == e.target.closest('.day').dataset.id); d.note = e.target.value; save('adenz-plan', pack()); });

  async function copyLink() { const u = link(); history.replaceState(null, '', '#p=' + enc(pack())); try { await navigator.clipboard.writeText(u); toast('Plan link copied'); } catch (e) { prompt('Copy this link', u); } }
  $('#copy').addEventListener('click', copyLink); $('#copyTop').addEventListener('click', copyLink);

  /* agent mode */
  const ag = { name: '#aName', contact: '#aContact', mark: '#aMark', client: '#aClient' };
  Object.entries(ag).forEach(([k, s]) => { $(s).value = AG[k]; $(s).addEventListener('input', e => { AG[k] = e.target.value; save('adenz-agent', AG); summary(); }); });
  if (AG.logo) { $('#aPrev').src = AG.logo; $('#aPrev').hidden = false; }
  $('#aLogo').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return; if (f.size > 600000) { toast('Please use a logo under 600 KB'); e.target.value = ''; return; }
    const r = new FileReader(); r.onload = () => { AG.logo = r.result; save('adenz-agent', AG); $('#aPrev').src = AG.logo; $('#aPrev').hidden = false; }; r.readAsDataURL(f);
  });
  $('#agent').addEventListener('toggle', summary);

  /* send to AdenZ */
  function brief() {
    const st = stays(), fl = hops().filter(h => h.flight).length;
    return [`${S.title || 'Vietnam journey'}`, `${S.days.length} days, ${S.pax} travellers, ${S.level} star, guide in ${S.lang}` + (S.start ? `, arriving ${dateOf(0)}` : ''),
      'Route: ' + (st.map(s => `${C[s.c].name} ${s.n}N`).join(' > ') || C[S.days[0].city].name), '',
      ...S.days.map((d, i) => `Day ${i + 1} ${C[d.city].name}: ${d.acts.join('; ') || 'at leisure'}${d.meals ? ' [' + d.meals + ']' : ''}${d.note ? ' (' + d.note + ')' : ''}`), '',
      fl ? `${fl} domestic flight(s) to quote` : '', `Indicative shown: ${A.usd(net())} per person`, 'Plan link: ' + link()].filter(x => x !== '').join('\n');
  }
  $('#send').addEventListener('click', () => $('#sendDlg').showModal());
  $('#sendDlg').addEventListener('close', () => {
    const v = $('#sendDlg').returnValue; if (v !== 'wa' && v !== 'mail') return;
    const name = $('#qName').value.trim(), org = $('#qOrg').value.trim(), note = $('#qNote').value.trim();
    const rec = window.TSKDesk ? TSKDesk.add('adenz-travel', 'AZ', { name, org, note, title: S.title, days: S.days.length, pax: S.pax, level: S.level, start: S.start, est: net(), route: stays().map(s => C[s.c].name + ' ' + s.n + 'N').join(' › '), plan: enc(pack()), via: v === 'wa' ? 'WhatsApp' : 'Email' }) : { id: '' };
    const text = `Hello AdenZ Travel, this is ${name}${org ? ' from ' + org : ''}. Please quote this plan${rec.id ? ' (ref ' + rec.id + ')' : ''}:\n\n${brief()}${note ? '\n\nNotes: ' + note : ''}`;
    location.href = v === 'wa' ? `https://wa.me/${A.WA}?text=${encodeURIComponent(text)}` : `mailto:${A.EMAIL}?subject=${encodeURIComponent('Quotation request: ' + (S.title || 'Vietnam journey'))}&body=${encodeURIComponent(text)}`;
  });

  /* client proposal */
  function proposal() {
    const ao = agentOn(), st = stays(), hs = hops(), first = C[S.days[0].city], price = ao ? sell() : net();
    const brand = ao && AG.name ? (AG.logo ? `<img src="${AG.logo}" alt="">` : '') + `<span>${esc(AG.name)}</span>` : `<img src="../img/logo.png" alt="AdenZ Travel">`;
    const contact = ao && AG.name ? esc(AG.contact || AG.name) : 'AdenZ Travel · cskh@atoztravel.vn · WhatsApp +84 938 146 118';
    const end = S.start ? dateOf(0) + ' to ' + dateOf(S.days.length - 1) : S.days.length + ' days';
    $('#proposal').innerHTML = `<div class="pbar"><button class="btn ghost sm" id="pBack" type="button">← Back to editing</button><span style="font-weight:600">${ao && AG.name ? 'Showing your agency brand and selling price' : 'Showing AdenZ Travel’s brand'}</span><button class="btn gold sm" id="pPrint" type="button">Print or save as PDF</button></div>
    <div class="sheetp"><div class="pcover"><img class="bg" src="../img/${first.img}.jpg" alt=""><div class="pbrand">${brand}</div>
      <div class="k">Private journey${ao && AG.client ? ' · prepared for ' + esc(AG.client) : ''}</div><h1 class="serif">${esc(S.title || 'Vietnam journey')}</h1>
      <div class="meta">${end} · ${S.days.length} days, ${S.days.length - 1} nights · ${S.pax} guest${S.pax > 1 ? 's' : ''} · ${S.level} star stays</div></div>
    <div class="pbody"><h2 class="serif">Your route</h2><div class="proute">${(st.length ? st : [{ c: S.days[0].city, n: 0 }]).map(s => `<span>${esc(C[s.c].name)}${s.n ? ' · ' + s.n + ' night' + (s.n > 1 ? 's' : '') : ''}</span>`).join('')}</div>
      <h2 class="serif">Day by day</h2>${S.days.map((d, i) => { const h = hs.find(x => x.i === i); return `<div class="pday"><img src="../img/${C[d.city].img}-s.jpg" alt="${esc(C[d.city].name)}"><div>
        <div class="w">Day ${i + 1}${dateOf(i) ? ' · ' + dateOf(i) : ''}</div><h3 class="serif">${esc(titleOf(i))}</h3>
        ${h ? `<div class="m">${esc(h.text)}</div>` : ''}${d.acts.length ? `<ul>${d.acts.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : '<div>At leisure.</div>'}${d.note ? `<div style="margin-top:4px">${esc(d.note)}</div>` : ''}
        <div class="m">${d.meals ? 'Meals: ' + d.meals.split('').map(m => MEAL[m]).join(', ') : 'No meals included'}${i < S.days.length - 1 ? ' · Overnight in ' + esc(C[sleepOf(d)].name) : ''}</div></div></div>`; }).join('')}
      <h2 class="serif">What is included</h2><div class="ptwo"><ul>${A.INCLUDED.map(x => `<li>${x}</li>`).join('')}<li>Guide language: ${esc(S.lang)}</li></ul><div><b>Not included</b><ul>${A.EXCLUDED.map(x => `<li>${x}</li>`).join('')}</ul></div></div>
      <div class="pprice"><div><div style="font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:#bcd0d6;font-weight:700">Indicative price per person, twin sharing</div><b>${A.usd(price)}</b></div><div style="text-align:right">${A.usd(price * S.pax)} for ${S.pax} guest${S.pax > 1 ? 's' : ''}<br><span style="color:#bcd0d6;font-size:13.5px">${S.level} star hotels · land arrangements only</span></div></div>
      <p class="pfoot">${A.CONDITIONS}</p><p class="pfoot"><b>${contact}</b></p></div></div>`;
    $('#pBack').onclick = () => { document.body.classList.remove('preview'); scrollTo(0, 0); };
    $('#pPrint').onclick = () => print();
    document.body.classList.add('preview'); scrollTo(0, 0);
  }
  $('#preview').addEventListener('click', proposal);

  /* ---------- start ---------- */
  const q = new URLSearchParams(location.search), h = location.hash.match(/#p=([\w-]+)/);
  let ok = false;
  if (h) { try { unpack(dec(h[1])); ok = S.days.length > 0; } catch (e) {} }
  if (!ok && q.get('j') !== null && q.get('j') !== '') ok = fromJourney(q.get('j'));
  if (!ok && q.has('j')) { blank(); ok = true; }
  if (!ok && C[q.get('c')]) { blank(q.get('c')); ok = true; }
  if (!ok) { const sv = load('adenz-plan'); if (sv) { try { unpack(sv); ok = S.days.length > 0; } catch (e) {} } }
  if (!ok) fromJourney('highlights10');
  if (q.get('p')) S.pax = Math.min(60, Math.max(1, parseInt(q.get('p'), 10) || 2));
  if (q.get('l')) S.level = [3, 4, 5].includes(+q.get('l')) ? +q.get('l') : S.level;
  if (q.get('s')) S.start = q.get('s');
  if (q.get('agent')) $('#agent').open = true;
  if (window.TSKDesk) TSKDesk.visit('adenz-travel');
  fields(); drawDays(); summary();
  if (q.get('view') === 'proposal') proposal();
})();
