{
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ICON = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
  };
  let all = [];

  const fill = (sel, items) => { for (const v of items) { const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o); } };

  function card(l) {
    const map = /^https:\/\//i.test(l.map_url || '') ? l.map_url : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([l.name, l.place, 'Kerala'].join(', '));
    const tel = (l.contact || '').replace(/[^\d+]/g, '');
    return `<article class="card">
      <div class="tags"><span class="tag dist">${esc(l.district)}</span><span class="tag">${esc(l.type)}</span></div>
      <h3>${esc(l.name)}</h3>
      <div class="row">${ICON.pin}<span>${esc(l.place)}${l.address ? ' — ' + esc(l.address) : ''}</span></div>
      <div class="row">${ICON.time}<span>${esc(l.timing)}</span></div>
      ${l.contact ? `<div class="row">${ICON.phone}<span>${esc(l.contact)}</span></div>` : ''}
      ${l.notes ? `<p class="notes">${esc(l.notes)}</p>` : ''}
      <div class="actions"><a href="${esc(map)}" target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>${tel.length >= 6 ? `<a href="tel:${esc(tel)}">Call</a>` : ''}</div>
    </article>`;
  }

  function render() {
    const q = $('#q').value.trim().toLowerCase(), d = $('#fDist').value, t = $('#fType').value;
    const list = all.filter(l => (!d || l.district === d) && (!t || l.type === t) &&
      (!q || [l.name, l.place, l.address, l.notes, l.type, l.district].join(' ').toLowerCase().includes(q)));
    $('#count').textContent = `${list.length} of ${all.length} place${all.length === 1 ? '' : 's'}`;
    $('#grid').innerHTML = list.length ? list.map(card).join('') :
      `<div class="empty" style="grid-column:1/-1">${all.length ? 'Nothing matches those filters. Try another district or clear the search.' : 'No places listed yet. Be the first to <a href="#submit">add one</a>.'}</div>`;
  }

  async function load() {
    try {
      const [meta, rows] = await Promise.all([fetch('/api/meta').then(r => r.json()), fetch('/api/listings').then(r => r.json())]);
      fill($('#fDist'), meta.districts); fill($('#district'), meta.districts);
      fill($('#fType'), meta.types); fill($('#type'), meta.types);
      all = rows;
      $('#stCount').textContent = rows.length;
      $('#stDist').textContent = new Set(rows.map(r => r.district)).size;
      render();
    } catch (e) {
      $('#count').textContent = '';
      $('#grid').innerHTML = '<div class="empty" style="grid-column:1/-1">Could not load the list. Please refresh in a moment.</div>';
    }
  }

  ['#q', '#fDist', '#fType'].forEach(s => $(s).addEventListener('input', render));

  $('#form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, msg = $('#formMsg'), btn = $('#sendBtn');
    const body = Object.fromEntries(new FormData(f));
    const missing = ['name', 'type', 'district', 'place', 'timing'].filter(k => !String(body[k] || '').trim());
    if (missing.length) { msg.className = 'msg err'; msg.textContent = 'Please fill in name, type, district, town and timing.'; f.querySelector('#' + missing[0]).focus(); return; }
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const r = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Something went wrong.');
      f.reset();
      msg.className = 'msg ok'; msg.textContent = 'Thank you! Your listing was sent for review. It will appear once an admin approves it.';
    } catch (err) {
      msg.className = 'msg err'; msg.textContent = err.message;
    } finally { btn.disabled = false; btn.textContent = 'Send for review'; msg.scrollIntoView({ block: 'nearest' }); }
  });

  load();
}
