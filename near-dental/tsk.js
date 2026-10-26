/* TechSocials sample-site helpers: booking slots, order cart, SMS hand-off, open status, reveal. */
(function (w) {
  const peso = n => '₱' + Number(n).toLocaleString('en-PH');
  const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return (((h + 11) % 12) + 1) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h >= 12 ? ' pm' : ' am'); };
  const manila = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

  // open = {weekday: [openMin, closeMin]} ; closeMin may exceed 1440 (after midnight)
  function status(open) {
    const now = manila(), d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    const t = open[d], y = open[(d + 6) % 7];
    if (t && m >= t[0] && m < t[1]) return { open: true, text: 'Open now until ' + fmt(t[1]) };
    if (y && y[1] > 1440 && m < y[1] - 1440) return { open: true, text: 'Open now until ' + fmt(y[1]) };
    for (let i = 0; i < 7; i++) { const dd = (d + i) % 7, o = open[dd]; if (!o) continue; if (i === 0 && m < o[0]) return { open: false, text: 'Opens today ' + fmt(o[0]) }; if (i > 0) return { open: false, text: 'Opens ' + (i === 1 ? 'tomorrow' : DN[dd]) + ' ' + fmt(o[0]) }; }
    return { open: false, text: 'Closed' };
  }

  // slot picker: renders day buttons into daysEl, time buttons into slotsEl
  function slots({ daysEl, slotsEl, open, step = 60, onPick }) {
    const now = manila(); const picked = { day: '', time: '' };
    for (let i = 0; i < 7; i++) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i), o = open[dt.getDay()];
      const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<span>' + (i === 0 ? 'Today' : DN[dt.getDay()]) + '</span><small>' + MN[dt.getMonth()] + ' ' + dt.getDate() + '</small>';
      if (!o) b.disabled = true;
      b.onclick = () => {
        daysEl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
        picked.day = DN[dt.getDay()] + ', ' + MN[dt.getMonth()] + ' ' + dt.getDate(); picked.time = ''; slotsEl.innerHTML = '';
        let any = false; const close = Math.min(o[1], 1440);
        for (let t = o[0]; t + step <= close; t += step) {
          if (i === 0 && t <= now.getHours() * 60 + now.getMinutes() + 30) continue; any = true;
          const s = document.createElement('button'); s.type = 'button'; s.textContent = fmt(t);
          s.onclick = () => { slotsEl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false')); s.setAttribute('aria-pressed', 'true'); picked.time = fmt(t); onPick && onPick(picked); };
          slotsEl.appendChild(s);
        }
        if (!any) slotsEl.innerHTML = '<p class="noslot">No more slots today. Pick another day.</p>';
        onPick && onPick(picked);
      };
      daysEl.appendChild(b);
    }
    for (const b of daysEl.querySelectorAll('button')) { if (b.disabled) continue; b.click(); if (slotsEl.querySelector('button')) break; }
    return picked;
  }

  // tiny cart
  function cart(onChange) {
    const items = new Map();
    const api = {
      add(name, price, qty = 1) { const c = items.get(name) || { p: price, q: 0 }; c.q += qty; items.set(name, c); onChange && onChange(api); },
      set(name, q) { const c = items.get(name); if (!c) return; c.q = q; if (q <= 0) items.delete(name); onChange && onChange(api); },
      count() { let q = 0; items.forEach(v => q += v.q); return q; },
      total() { let t = 0; items.forEach(v => t += v.q * v.p); return t; },
      lines() { const L = []; items.forEach((v, k) => L.push(v.q + 'x ' + k + (v.p ? ' (' + peso(v.p * v.q) + ')' : ''))); return L; },
      each(fn) { items.forEach((v, k) => fn(k, v)); }, items
    };
    return api;
  }

  function sms(phone, lines) { location.href = 'sms:' + phone + '?&body=' + encodeURIComponent(lines.join('\n')); }
  async function copyOpen(url, lines) { try { await navigator.clipboard.writeText(lines.join('\n')); } catch (e) {} w.open(url, '_blank', 'noopener'); }
  function formLines(form) { const L = []; new FormData(form).forEach((v, k) => { if (String(v).trim()) L.push(k + ': ' + v); }); return L; }

  function reveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in w)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
    els.forEach(e => io.observe(e));
  }

  w.TSK = { peso, fmt, status, slots, cart, sms, copyOpen, formLines, reveal };
})(window);
