/* TechSocials owner desk: records visits and booking requests so the owner dashboard can show them.
   Demo mode keeps everything in this browser (localStorage). On launch this file is swapped for the
   same API backed by a real database, so the site and dashboard code stay unchanged. */
(function (w) {
  const get = k => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => ymd(new Date());

  // where this visitor came from: ?src= tag first (QR codes, ads, FB posts), then the referrer
  function source() {
    const q = new URLSearchParams(location.search).get('src');
    if (q) return ({ fb: 'Facebook', ig: 'Instagram', google: 'Google', qr: w.TSK_QR || 'QR at the gate', tiktok: 'TikTok' })[q] || q;
    const r = document.referrer;
    if (/google\./.test(r)) return 'Google';
    if (/facebook\.|fb\.|messenger\./.test(r)) return 'Facebook';
    if (/instagram\./.test(r)) return 'Instagram';
    if (/tiktok\./.test(r)) return 'TikTok';
    return 'Direct';
  }

  function visit(site) {
    const k = 'tsk-desk-visits-' + site, v = get(k) || {}, d = today(), s = source();
    try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) {}
    v[d] = v[d] || {}; v[d][s] = (v[d][s] || 0) + 1; put(k, v);
  }
  function visits(site) { return get('tsk-desk-visits-' + site) || {}; }

  function list(site) { return get('tsk-desk-' + site) || []; }
  function add(site, prefix, booking) {
    const all = list(site), n = 1041 + all.length;
    const b = Object.assign({ id: prefix + '-' + n, created: new Date().toISOString(), status: 'new', source: source(), live: true }, booking);
    all.unshift(b); put('tsk-desk-' + site, all); return b;
  }
  function update(site, id, patch) {
    const all = list(site), b = all.find(x => x.id === id); if (!b) return;
    Object.assign(b, patch); put('tsk-desk-' + site, all); return b;
  }
  function clear(site) { put('tsk-desk-' + site, []); put('tsk-desk-visits-' + site, {}); }

  w.TSKDesk = { ymd, source, visit, visits, list, add, update, clear };
})(window);
