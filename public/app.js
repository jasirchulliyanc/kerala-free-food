{
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const DIST_ML = {
    Thiruvananthapuram: 'തിരുവനന്തപുരം', Kollam: 'കൊല്ലം', Pathanamthitta: 'പത്തനംതിട്ട', Alappuzha: 'ആലപ്പുഴ',
    Kottayam: 'കോട്ടയം', Idukki: 'ഇടുക്കി', Ernakulam: 'എറണാകുളം', Thrissur: 'തൃശ്ശൂർ', Palakkad: 'പാലക്കാട്',
    Malappuram: 'മലപ്പുറം', Kozhikode: 'കോഴിക്കോട്', Wayanad: 'വയനാട്', Kannur: 'കണ്ണൂർ', Kasaragod: 'കാസർഗോഡ്'
  };
  const TYPE_ML = {
    'Temple annadanam': 'ക്ഷേത്ര അന്നദാനം', 'Mosque / iftar': 'പള്ളി / ഇഫ്താർ', 'Church': 'ക്രിസ്ത്യൻ ദേവാലയം',
    'Gurudwara langar': 'ഗുരുദ്വാര ലങ്കർ', 'Community kitchen': 'സാമൂഹിക അടുക്കള', 'NGO / charity': 'സന്നദ്ധ സംഘടന / ചാരിറ്റി',
    'Hospital food': 'ആശുപത്രി ഭക്ഷണം', 'Restaurant / shop': 'ഹോട്ടൽ / കട', 'Other': 'മറ്റുള്ളവ'
  };
  const T = {
    en: {
      title: 'Free Food Kerala', brand: 'Free Food Kerala', navAdd: 'Add a place →',
      h1: 'Free meals across Kerala, shared by people who know', tag: 'സൗജന്യ ഭക്ഷണം — എല്ലാവർക്കും',
      intro: 'Temple annadanam, community kitchens, langars and charity meals in all 14 districts. Anyone can add a place; every listing is checked before it appears.',
      stPlaces: 'places listed', stDist: 'districts covered', search: 'Search by name, town or food…',
      allDist: 'All districts', allTypes: 'All types', listH: 'Places serving free food',
      count: (n, t) => `${n} of ${t} place${t === 1 ? '' : 's'}`, loading: 'Loading…',
      noMatch: 'Nothing matches those filters. Try another district or clear the search.',
      empty: 'No places listed yet. Be the first to <a href="#submit">add one</a>.',
      loadErr: 'Could not load the list. Please refresh in a moment.',
      maps: 'Open in Maps ↗', call: 'Call', give: 'Support this place', giveBtn: 'Donate on their site ↗',
      subH: 'Know a place? Add it.', subP: 'Help someone find a meal today. Your listing goes to an admin, who checks it before it shows here.',
      step1: 'Fill in what you know — name, town and timing are enough.', step2: 'An admin checks the details.', step3: 'Once approved, it appears in the list.',
      subNote: 'Timings change during festivals and seasons. If you can, add a phone number so people can check before travelling.',
      fName: 'Name of the place', phName: 'e.g. Sree Krishna Temple annadanam', fType: 'Type', fDist: 'District', choose: 'Choose…',
      fPlace: 'Town / area', phPlace: 'e.g. Guruvayur', fTiming: 'When is food served?', phTiming: 'e.g. Daily, 11:30 am – 2 pm',
      fAddr: 'Address or landmark', opt: '(optional)', fPhone: 'Phone', fMap: 'Google Maps link',
      fNotes: 'Notes', fNotesHint: "(optional — who it's for, what's served, anything to know)",
      fGive: 'Do they accept donations?', fGiveHow: 'How to donate', phGive: "e.g. UPI ID, bank details, or 'donate at the temple counter'",
      fGiveUrl: 'Official donation page', fYou: 'Your name', fYouC: 'Your phone or email', optAdmin: '(optional, admin only)',
      send: 'Send for review', sending: 'Sending…',
      missing: 'Please fill in name, type, district, town and timing.',
      thanks: 'Thank you! Your listing was sent for review. It will appear once an admin approves it.',
      foot: 'Free Food Kerala — a community list. Please check timings before you travel.', admin: 'Admin'
    },
    ml: {
      title: 'സൗജന്യ ഭക്ഷണം കേരളം', brand: 'സൗജന്യ ഭക്ഷണം കേരളം', navAdd: 'സ്ഥലം ചേർക്കുക →',
      h1: 'കേരളത്തിലുടനീളം സൗജന്യ ഭക്ഷണം – അറിയുന്നവർ പങ്കുവയ്ക്കുന്നു', tag: 'Free food for everyone',
      intro: 'ക്ഷേത്ര അന്നദാനം, സാമൂഹിക അടുക്കളകൾ, ലങ്കർ, സന്നദ്ധ സംഘടനകളുടെ ഭക്ഷണം – 14 ജില്ലകളിലും. ആർക്കും ഒരു സ്ഥലം ചേർക്കാം; ഓരോന്നും പരിശോധിച്ച ശേഷമേ പ്രസിദ്ധീകരിക്കൂ.',
      stPlaces: 'സ്ഥലങ്ങൾ', stDist: 'ജില്ലകൾ', search: 'പേര്, സ്ഥലം അല്ലെങ്കിൽ ഭക്ഷണം തിരയുക…',
      allDist: 'എല്ലാ ജില്ലകളും', allTypes: 'എല്ലാ തരങ്ങളും', listH: 'സൗജന്യ ഭക്ഷണം ലഭിക്കുന്ന സ്ഥലങ്ങൾ',
      count: (n, t) => `${t}-ൽ ${n} സ്ഥലങ്ങൾ`, loading: 'ലോഡ് ചെയ്യുന്നു…',
      noMatch: 'ഈ തിരച്ചിലിന് ഫലങ്ങളൊന്നുമില്ല. മറ്റൊരു ജില്ല നോക്കുക അല്ലെങ്കിൽ തിരച്ചിൽ മായ്ക്കുക.',
      empty: 'ഇതുവരെ സ്ഥലങ്ങളൊന്നും ചേർത്തിട്ടില്ല. ആദ്യമായി <a href="#submit">ഒന്ന് ചേർക്കൂ</a>.',
      loadErr: 'പട്ടിക ലോഡ് ചെയ്യാനായില്ല. അൽപ്പം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.',
      maps: 'മാപ്പിൽ തുറക്കുക ↗', call: 'വിളിക്കുക', give: 'ഈ സ്ഥലത്തെ സഹായിക്കാം', giveBtn: 'സംഭാവന നൽകുക ↗',
      subH: 'ഒരു സ്ഥലം അറിയാമോ? ചേർക്കൂ.', subP: 'ഇന്ന് ഒരാൾക്ക് ഭക്ഷണം കണ്ടെത്താൻ സഹായിക്കൂ. നിങ്ങൾ ചേർക്കുന്ന വിവരം അഡ്മിൻ പരിശോധിച്ച ശേഷം ഇവിടെ കാണിക്കും.',
      step1: 'അറിയാവുന്നത് പൂരിപ്പിക്കുക – പേര്, സ്ഥലം, സമയം മതി.', step2: 'അഡ്മിൻ വിവരങ്ങൾ പരിശോധിക്കും.', step3: 'അംഗീകരിച്ചാൽ പട്ടികയിൽ കാണിക്കും.',
      subNote: 'ഉത്സവങ്ങളിലും സീസണുകളിലും സമയം മാറാം. കഴിയുമെങ്കിൽ ഫോൺ നമ്പർ ചേർക്കുക, യാത്രയ്ക്കു മുൻപ് ആളുകൾക്ക് ഉറപ്പാക്കാം.',
      fName: 'സ്ഥലത്തിന്റെ പേര്', phName: 'ഉദാ: ശ്രീകൃഷ്ണ ക്ഷേത്രം അന്നദാനം', fType: 'തരം', fDist: 'ജില്ല', choose: 'തിരഞ്ഞെടുക്കുക…',
      fPlace: 'പട്ടണം / പ്രദേശം', phPlace: 'ഉദാ: ഗുരുവായൂർ', fTiming: 'ഭക്ഷണം എപ്പോൾ?', phTiming: 'ഉദാ: ദിവസവും, 11:30 – 2 മണി',
      fAddr: 'വിലാസം അല്ലെങ്കിൽ അടയാളം', opt: '(നിർബന്ധമില്ല)', fPhone: 'ഫോൺ', fMap: 'ഗൂഗിൾ മാപ്സ് ലിങ്ക്',
      fNotes: 'കുറിപ്പുകൾ', fNotesHint: '(നിർബന്ധമില്ല – ആർക്കുവേണ്ടി, എന്ത് ഭക്ഷണം, അറിയേണ്ട കാര്യങ്ങൾ)',
      fGive: 'അവർ സംഭാവന സ്വീകരിക്കുന്നുണ്ടോ?', fGiveHow: 'എങ്ങനെ സംഭാവന നൽകാം', phGive: 'ഉദാ: UPI ഐഡി, ബാങ്ക് വിവരങ്ങൾ, അല്ലെങ്കിൽ \'ക്ഷേത്ര കൗണ്ടറിൽ നൽകാം\'',
      fGiveUrl: 'ഔദ്യോഗിക സംഭാവന പേജ്', fYou: 'നിങ്ങളുടെ പേര്', fYouC: 'നിങ്ങളുടെ ഫോൺ അല്ലെങ്കിൽ ഇമെയിൽ', optAdmin: '(നിർബന്ധമില്ല, അഡ്മിന് മാത്രം)',
      send: 'പരിശോധനയ്ക്ക് അയയ്ക്കുക', sending: 'അയയ്ക്കുന്നു…',
      missing: 'പേര്, തരം, ജില്ല, സ്ഥലം, സമയം എന്നിവ പൂരിപ്പിക്കുക.',
      thanks: 'നന്ദി! നിങ്ങളുടെ വിവരം പരിശോധനയ്ക്ക് അയച്ചു. അഡ്മിൻ അംഗീകരിച്ചാൽ ഇവിടെ കാണിക്കും.',
      foot: 'സൗജന്യ ഭക്ഷണം കേരളം – ഒരു കൂട്ടായ്മ പട്ടിക. യാത്രയ്ക്കു മുൻപ് സമയം ഉറപ്പാക്കുക.', admin: 'അഡ്മിൻ'
    }
  };
  let lang = 'ml';
  try { const s = localStorage.getItem('kff_lang'); if (s === 'en' || s === 'ml') lang = s; } catch {}
  const t = k => T[lang][k];
  const distLabel = d => lang === 'ml' ? (DIST_ML[d] || d) : d;
  const typeLabel = x => lang === 'ml' ? (TYPE_ML[x] || x) : x;
  const pick = (l, f) => (lang === 'ml' && l[f + '_ml']) ? l[f + '_ml'] : l[f];

  const ICON = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
  };
  let all = [], meta = { districts: [], types: [] };

  function fillSelect(sel, items, labeler, firstKey) {
    const cur = sel.value;
    sel.innerHTML = `<option value="">${esc(t(firstKey))}</option>` + items.map(v => `<option value="${esc(v)}">${esc(labeler(v))}</option>`).join('');
    sel.value = cur;
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach(el => { const v = t(el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    fillSelect($('#fDist'), meta.districts, distLabel, 'allDist');
    fillSelect($('#district'), meta.districts, distLabel, 'choose');
    fillSelect($('#fType'), meta.types, typeLabel, 'allTypes');
    fillSelect($('#type'), meta.types, typeLabel, 'choose');
    render();
  }

  function card(l) {
    const map = /^https:\/\//i.test(l.map_url || '') ? l.map_url : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([l.name, l.place, 'Kerala'].join(', '));
    const tel = (l.contact || '').replace(/[^\d+]/g, '');
    const donate = /^https:\/\//i.test(l.donate_url || '') ? l.donate_url : '';
    const place = pick(l, 'place'), notes = pick(l, 'notes'), giveInfo = pick(l, 'donate_info');
    return `<article class="card">
      <div class="tags"><span class="tag dist">${esc(distLabel(l.district))}</span><span class="tag">${esc(typeLabel(l.type))}</span></div>
      <h3>${esc(pick(l, 'name'))}</h3>
      <div class="row">${ICON.pin}<span>${esc(place)}${l.address && !(lang === 'ml' && l.place_ml) ? ' — ' + esc(l.address) : ''}</span></div>
      <div class="row">${ICON.time}<span>${esc(pick(l, 'timing'))}</span></div>
      ${l.contact ? `<div class="row">${ICON.phone}<span>${esc(l.contact)}</span></div>` : ''}
      ${notes ? `<p class="notes">${esc(notes)}</p>` : ''}
      ${giveInfo || donate ? `<div class="give"><b>${esc(t('give'))}</b>${giveInfo ? `<span>${esc(giveInfo)}</span>` : ''}${donate ? `<a class="btn give-btn" href="${esc(donate)}" target="_blank" rel="noopener noreferrer">${esc(t('giveBtn'))}</a>` : ''}</div>` : ''}
      <div class="actions"><a href="${esc(map)}" target="_blank" rel="noopener noreferrer">${esc(t('maps'))}</a>${tel.length >= 6 ? `<a href="tel:${esc(tel)}">${esc(t('call'))}</a>` : ''}</div>
    </article>`;
  }

  function render() {
    if (!meta.districts.length) return;
    const q = $('#q').value.trim().toLowerCase(), d = $('#fDist').value, ty = $('#fType').value;
    const list = all.filter(l => (!d || l.district === d) && (!ty || l.type === ty) &&
      (!q || [l.name, l.place, l.address, l.notes, l.type, l.district, l.name_ml, l.place_ml, l.notes_ml, DIST_ML[l.district], TYPE_ML[l.type]].join(' ').toLowerCase().includes(q)));
    $('#count').textContent = t('count')(list.length, all.length);
    $('#grid').innerHTML = list.length ? list.map(card).join('') :
      `<div class="empty" style="grid-column:1/-1">${all.length ? esc(t('noMatch')) : t('empty')}</div>`;
  }

  async function load() {
    $('#count').textContent = t('loading');
    try {
      const [m, rows] = await Promise.all([fetch('/api/meta').then(r => r.json()), fetch('/api/listings').then(r => r.json())]);
      meta = m; all = rows;
      $('#stCount').textContent = rows.length;
      $('#stDist').textContent = new Set(rows.map(r => r.district)).size;
      applyLang();
    } catch (e) {
      $('#count').textContent = '';
      $('#grid').innerHTML = `<div class="empty" style="grid-column:1/-1">${esc(t('loadErr'))}</div>`;
    }
  }

  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    try { localStorage.setItem('kff_lang', lang); } catch {}
    applyLang();
  }));
  ['#q', '#fDist', '#fType'].forEach(s => $(s).addEventListener('input', render));

  $('#form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, msg = $('#formMsg'), btn = $('#sendBtn');
    const body = Object.fromEntries(new FormData(f));
    const missing = ['name', 'type', 'district', 'place', 'timing'].filter(k => !String(body[k] || '').trim());
    if (missing.length) { msg.className = 'msg err'; msg.textContent = t('missing'); f.querySelector('#' + missing[0]).focus(); return; }
    btn.disabled = true; btn.textContent = t('sending');
    try {
      const r = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Something went wrong.');
      f.reset();
      msg.className = 'msg ok'; msg.textContent = t('thanks');
    } catch (err) {
      msg.className = 'msg err'; msg.textContent = err.message;
    } finally { btn.disabled = false; btn.textContent = t('send'); msg.scrollIntoView({ block: 'nearest' }); }
  });

  applyLang();
  load();
}
