{
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let status = 'pending', rows = [], meta = { districts: [], types: [] }, editing = null;

  const api = async (url, opts = {}) => {
    const r = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) { show(false); throw new Error('Please log in again.'); }
    if (!r.ok) throw new Error(j.error || 'Request failed');
    return j;
  };
  const toast = (t, ok = true) => { const el = $('#toast'); el.className = 'msg ' + (ok ? 'ok' : 'err'); el.textContent = t; clearTimeout(toast.t); toast.t = setTimeout(() => { el.className = ''; el.textContent = ''; }, 4000); };
  const when = iso => iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  const opts = (list, v) => list.map(x => `<option${x === v ? ' selected' : ''}>${esc(x)}</option>`).join('');

  function viewCard(l) {
    const btns = {
      pending: `<button class="btn green" data-act="approved">Approve</button><button class="btn red" data-act="rejected">Reject</button>`,
      approved: `<button class="btn ghost" data-act="rejected">Unpublish</button>`,
      rejected: `<button class="btn green" data-act="approved">Approve</button><button class="btn red" data-act="delete">Delete forever</button>`
    }[status];
    return `<article class="card" data-id="${l.id}">
      <div class="tags"><span class="tag dist">${esc(l.district)}</span><span class="tag">${esc(l.type)}</span></div>
      <h3>${esc(l.name)}</h3>${l.name_ml ? `<div class="meta" lang="ml">${esc(l.name_ml)}</div>` : '<div class="meta">No Malayalam text yet – add it with Edit</div>'}
      <div><b>Where:</b> ${esc(l.place)}${l.address ? ' — ' + esc(l.address) : ''}</div>
      <div><b>When:</b> ${esc(l.timing)}</div>
      ${l.contact ? `<div><b>Phone:</b> ${esc(l.contact)}</div>` : ''}
      ${l.map_url ? `<div><b>Map:</b> ${/^https:\/\//i.test(l.map_url) ? `<a href="${esc(l.map_url)}" target="_blank" rel="noopener noreferrer">${esc(l.map_url.slice(0, 60))}</a>` : esc(l.map_url)}</div>` : ''}
      ${l.notes ? `<p class="notes">${esc(l.notes)}</p>` : ''}
      ${l.donate_info ? `<div><b>Donate:</b> ${esc(l.donate_info)}</div>` : ''}
      ${l.donate_url ? `<div><b>Donation link:</b> ${/^https:\/\//i.test(l.donate_url) ? `<a href="${esc(l.donate_url)}" target="_blank" rel="noopener noreferrer">${esc(l.donate_url.slice(0, 60))}</a>` : esc(l.donate_url)}</div>` : ''}
      <div class="meta">Submitted ${esc(when(l.created_at))}${l.submitter_name || l.submitter_contact ? ' by ' + esc([l.submitter_name, l.submitter_contact].filter(Boolean).join(', ')) : ''}</div>
      <div class="actions">${btns}<button class="btn ghost" data-act="edit">Edit</button></div>
    </article>`;
  }

  function editCard(l) {
    const inp = (k, label) => `<div class="f"><label>${label}</label><input name="${k}" value="${esc(l[k])}"></div>`;
    return `<article class="card" data-id="${l.id}"><form class="edit">
      ${inp('name', 'Name')}
      <div class="two f"><div><label>Type</label><select name="type">${opts(meta.types, l.type)}</select></div><div><label>District</label><select name="district">${opts(meta.districts, l.district)}</select></div></div>
      ${inp('place', 'Town / area')}${inp('timing', 'Timing')}${inp('address', 'Address')}${inp('contact', 'Phone')}${inp('map_url', 'Map link (https://)')}
      <div class="f"><label>Notes</label><textarea name="notes">${esc(l.notes)}</textarea></div>
      <div class="f"><label>How to donate</label><textarea name="donate_info">${esc(l.donate_info)}</textarea></div>
      ${inp('donate_url', 'Donation link (https://)')}
      <details class="f" ${l.name_ml ? 'open' : ''}><summary><b>മലയാളം (Malayalam text)</b> – optional; English is shown where empty</summary>
        ${inp('name_ml', 'പേര് (Name)')}${inp('place_ml', 'സ്ഥലം (Town / area)')}${inp('timing_ml', 'സമയം (Timing)')}
        <div class="f"><label>കുറിപ്പുകൾ (Notes)</label><textarea name="notes_ml">${esc(l.notes_ml)}</textarea></div>
        <div class="f"><label>സംഭാവന (How to donate)</label><textarea name="donate_info_ml">${esc(l.donate_info_ml)}</textarea></div>
      </details>
      <div class="actions"><button class="btn green" type="submit">Save</button><button class="btn ghost" type="button" data-act="cancel">Cancel</button></div>
    </form></article>`;
  }

  function render() {
    $('#grid').innerHTML = rows.length ? rows.map(l => l.id === editing ? editCard(l) : viewCard(l)).join('')
      : `<div class="empty" style="grid-column:1/-1">No ${status} listings.</div>`;
  }

  async function load() {
    try {
      const j = await api('/api/admin/listings?status=' + status);
      rows = j.rows;
      for (const s of ['pending', 'approved', 'rejected']) $('#n-' + s).textContent = j.counts[s] ? `(${j.counts[s]})` : '';
      render();
    } catch (e) { toast(e.message, false); }
  }

  function show(admin) {
    $('#loginBox').hidden = admin; $('#panel').hidden = !admin; $('#logout').hidden = !admin;
    if (admin) load(); else $('#pw').focus();
  }

  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
    status = b.dataset.s; editing = null; load();
  }));

  $('#grid').addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = Number(b.closest('.card').dataset.id), act = b.dataset.act;
    if (act === 'edit') { editing = id; return render(); }
    if (act === 'cancel') { editing = null; return render(); }
    b.disabled = true;
    try {
      if (act === 'delete') {
        if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Click again to delete'; b.disabled = false; return; }
        await api('/api/admin/listings/' + id, { method: 'DELETE' }); toast('Deleted.');
      } else {
        await api(`/api/admin/listings/${id}/status`, { method: 'POST', body: JSON.stringify({ status: act }) });
        toast(act === 'approved' ? 'Approved — now live on the site.' : 'Moved to rejected.');
      }
      load();
    } catch (err) { toast(err.message, false); b.disabled = false; }
  });

  $('#grid').addEventListener('submit', async e => {
    e.preventDefault();
    const id = Number(e.target.closest('.card').dataset.id);
    try {
      await api('/api/admin/listings/' + id, { method: 'PUT', body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
      editing = null; toast('Saved.'); load();
    } catch (err) { toast(err.message, false); }
  });

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const m = $('#loginMsg');
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: $('#pw').value }) });
      $('#pw').value = ''; m.className = ''; m.textContent = ''; show(true);
    } catch (err) { m.className = 'msg err'; m.textContent = err.message; }
  });

  $('#logout').addEventListener('click', async () => { await fetch('/api/admin/logout', { method: 'POST' }); show(false); });

  Promise.all([fetch('/api/meta').then(r => r.json()), fetch('/api/admin/me').then(r => r.json())])
    .then(([m, me]) => { meta = m; show(me.admin); })
    .catch(() => show(false));
}
