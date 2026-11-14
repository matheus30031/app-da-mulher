// App da Mulher — versão de teste (tudo local no aparelho)
const D = window.DATA;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = () => Store.get();
const save = () => Store.save();
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = n => String(n).padStart(2, '0');
const toStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => toStr(new Date());
const addDays = (ds, n) => { const d = new Date(ds + 'T12:00:00'); d.setDate(d.getDate() + n); return toStr(d); };
const diffDays = (a, b) => Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 864e5);
const fmt = ds => { const [y, m, d] = ds.split('-'); return `${d}/${m}`; };
const fmtFull = ds => { const [y, m, d] = ds.split('-'); return `${d}/${m}/${y}`; };
const entriesDesc = () => Object.values(S().entries).sort((a, b) => b.date.localeCompare(a.date));
const view = html => { $('#view').innerHTML = html; };
const setTitle = t => { $('#title').textContent = t; };
const HELP = `<div class="help"><b>Precisa de ajuda agora?</b><br>💬 CVV — apoio emocional, 24h, gratuito: <a href="tel:188">188</a><br>🚑 SAMU — emergências: <a href="tel:192">192</a><br>💜 Violência contra a mulher — Ligue <a href="tel:180">180</a></div>`;

function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2800); }
function sheet(html, onMount) {
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  bg.innerHTML = `<div class="sheet">${html}</div>`;
  const close = () => bg.remove();
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  document.body.appendChild(bg);
  onMount && onMount(bg.querySelector('.sheet'), close);
  return close;
}
function confirmSheet(msg, okLabel, fn) {
  sheet(`<h3>${msg}</h3><button class="btn block" id="ok">${okLabel}</button><button class="btn sec block" id="no">Cancelar</button>`,
    (el, close) => { el.querySelector('#ok').onclick = () => { close(); fn(); }; el.querySelector('#no').onclick = close; });
}

// ---------------- Progresso / desbloqueios ----------------
const checkins = () => Object.keys(S().entries).length;
function decorUnlocked() {
  const s = S(), n = checkins(), o = {};
  D.decor.forEach(d => { if (d.premium ? s.premium : n >= d.need) o[d.id] = true; });
  return o;
}
function envAllowed(e) { return e.premium ? S().premium : checkins() >= e.need; }
function achievements() {
  const s = S(), n = checkins();
  return [
    { icon: '🌱', name: 'Primeiro registro', done: n >= 1 },
    { icon: '🗓️', name: '7 registros (sem pressa)', done: n >= 7 },
    { icon: '🌸', name: '30 registros', done: n >= 30 },
    { icon: '💌', name: 'Primeira carta guardada', done: s.letters.some(l => l.saved) },
    { icon: '🌷', name: 'Primeira flor no jardim', done: s.garden.length >= 1 },
    { icon: '🌳', name: '10 flores de carinho', done: s.garden.length >= 10 },
    { icon: '🎬', name: 'Primeiro episódio', done: Object.keys(s.watched).length >= 1 }
  ];
}

// ---------------- Cartas de apoio ----------------
function maybeDeliverLetter() {
  const s = S();
  if (!s.settings.letters || s.lastLetterDate === today()) return false;
  const last = entriesDesc().slice(0, 3);
  const lowE = last.filter(e => e.energy <= 2 || e.sleep <= 2).length;
  const lowM = last.filter(e => e.mood <= 2).length;
  let cat = null;
  if (lowM >= 2) cat = last[0].mood <= 1 ? 'tristeza' : 'desanimo';
  else if (lowE >= 2) cat = 'cansaco';
  else if (!s.letters.length) cat = 'apoio'; // carta de boas-vindas
  if (!cat) return false;
  const pool = D.seedLetters.filter(l => l.cat === cat);
  const used = new Set(s.letters.map(l => l.srcId));
  const avail = pool.filter(l => !used.has(l.id));
  const list = avail.length ? avail : pool;
  const pick = list[Math.floor(Math.random() * list.length)];
  s.letters.unshift({ id: uid(), srcId: pick.id, text: pick.text, cat, date: today(), opened: false, saved: false });
  s.lastLetterDate = today(); save();
  return true;
}
function openLetter(l) {
  l.opened = true; save();
  sheet(`<p class="muted">Uma mulher anônima escreveu para você · ${D.categories[l.cat]}</p>
    <div class="letter">${esc(l.text)}</div>
    <button class="btn block" id="keep">${l.saved ? '✓ Guardada na coleção' : '💌 Guardar em Minhas Cartas'}</button>
    <button class="btn sec block" id="cl">Fechar</button>`, (el, close) => {
    el.querySelector('#keep').onclick = () => { l.saved = true; save(); toast('Carta guardada 💌'); close(); render(); };
    el.querySelector('#cl').onclick = () => { close(); render(); };
  });
}

// ---------------- Registro rápido ----------------
function phaseSymptoms() {
  const ph = S().profile.phase;
  if (ph === 'ciclo') return D.symptoms.ciclo;
  if (ph === 'climaterio') return D.symptoms.climaterio;
  return [...new Set([...D.symptoms.ciclo, ...D.symptoms.climaterio])];
}
function checkin(date) {
  const s = S(); const t = date || today();
  const e = Object.assign({ date: t, sleep: null, energy: null, mood: null, pain: 0, flow: null, symptoms: [], selfcare: [], note: '' }, JSON.parse(JSON.stringify(s.entries[t] || {})));
  const scale = (k, icons, labels) => `<div class="scale ${labels ? 'txt' : ''}" data-k="${k}">${icons.map((ic, i) => {
    const v = labels ? i : i + 1; return `<button type="button" data-v="${v}" class="${e[k] === v ? 'on' : ''}">${ic}</button>`; }).join('')}</div>`;
  const chips = (k, list) => `<div class="chips" data-k="${k}">${list.map(x => `<button type="button" class="chip ${e[k].includes(x) ? 'on' : ''}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
  const flows = ['Nenhuma', 'Leve', 'Moderada', 'Intensa'];
  sheet(`<h3>${t === today() ? 'Como você está hoje?' : 'Registro de ' + fmtFull(t)}</h3>
    <label class="f">😴 Como dormiu?</label>${scale('sleep', ['😫', '😪', '😐', '🙂', '😌'])}
    <label class="f">⚡ Energia</label>${scale('energy', ['🪫', '😮‍💨', '😐', '🙂', '⚡'])}
    <label class="f">💗 Humor</label>${scale('mood', ['😢', '😔', '😐', '🙂', '😄'])}
    <label class="f">🌡️ Dor ou desconforto</label>${scale('pain', ['Nenhuma', 'Leve', 'Média', 'Forte'], true)}
    <details><summary class="muted" style="cursor:pointer;margin:6px 0 10px">+ Mais detalhes (opcional)</summary>
      ${true ? `<label class="f">🩸 Menstruação</label><div class="chips" data-k="flow">${flows.map(f => `<button type="button" class="chip ${e.flow === f ? 'on' : ''}" data-v="${f}">${f}</button>`).join('')}</div>` : ''}
      <label class="f">Sintomas</label>${chips('symptoms', phaseSymptoms())}
      <label class="f">Autocuidado de hoje</label>${chips('selfcare', D.selfcare)}
      <label class="f">Anotação (só você vê)</label><textarea id="note" placeholder="Algo que queira lembrar…">${esc(e.note)}</textarea>
    </details>
    <button class="btn block" id="sv">Salvar registro</button>`, (el, close) => {
    el.querySelectorAll('.scale').forEach(sc => sc.onclick = ev => {
      const b = ev.target.closest('button'); if (!b) return;
      e[sc.dataset.k] = Number(b.dataset.v);
      sc.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    });
    el.querySelectorAll('.chips').forEach(ch => ch.onclick = ev => {
      const b = ev.target.closest('button'); if (!b) return; const k = ch.dataset.k, v = b.dataset.v;
      if (k === 'flow') { e.flow = e.flow === v ? null : v; ch.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.v === e.flow)); return; }
      e[k] = e[k].includes(v) ? e[k].filter(x => x !== v) : [...e[k], v]; b.classList.toggle('on');
    });
    el.querySelector('#sv').onclick = () => {
      if (!e.sleep || !e.energy || !e.mood) { toast('Escolha sono, energia e humor 🙂'); return; }
      e.note = el.querySelector('#note').value.trim();
      s.entries[t] = e;
      if (e.flow && e.flow !== 'Nenhuma' && !s.periods.some(p => Math.abs(diffDays(t, p)) <= 7)) { s.periods.push(t); s.periods.sort(); }
      save();
      const got = maybeDeliverLetter();
      close();
      toast(got ? 'Registro salvo! Chegou uma carta para você 💌' : 'Registro salvo! 🌸');
      render();
    };
  });
}

// ---------------- Rotas ----------------
const routes = {};

routes.onboarding = () => {
  const look = { skin: D.looks.skin[1], hair: D.looks.hair[1], outfit: D.looks.outfit[0] };
  const st = { energy: 4, sleep: 4, mood: 4, painv: 0, tired: false, happy: true, sad: false, pain: false, irregular: false, n: 6 };
  const swatches = (k, list) => `<div class="row" data-k="${k}">${list.map(c => `<button type="button" data-v="${c}" style="width:36px;height:36px;border-radius:50%;background:${c};border:3px solid ${look[k] === c ? '#3b2f3a' : '#fff'};box-shadow:0 1px 4px rgba(0,0,0,.15);cursor:pointer"></button>`).join('')}</div>`;
  view(`<div class="wrap" style="padding-top:20px">
    <h2 style="font-size:24px">Bem-vinda 🌸</h2>
    <p class="muted">Este é um espaço para você se conhecer melhor, registrar como está e receber (e oferecer) carinho.</p>
    <div class="scene" id="prev">${Character.svg(st, look, 'jardim', {}, {})}</div>
    <div class="card">
      <label class="f">Como quer ser chamada?</label><input id="nm" placeholder="Seu nome ou apelido" maxlength="30">
      <label class="f">O que você quer acompanhar?</label>
      <select id="ph"><option value="ciclo">Ciclo menstrual</option><option value="climaterio">Climatério / menopausa</option><option value="ambos">Um pouco de tudo / não sei</option></select>
      <label class="f">Tom de pele</label>${swatches('skin', D.looks.skin)}
      <label class="f" style="margin-top:12px">Cabelo</label>${swatches('hair', D.looks.hair)}
      <label class="f" style="margin-top:12px">Roupa</label>${swatches('outfit', D.looks.outfit)}
    </div>
    <div class="card">
      <h3>Privacidade</h3>
      <p class="muted">Na fase de testes, tudo fica salvo só neste aparelho. Nada é enviado para servidores, exceto quando você usa recursos de IA com sua chave.</p>
      <label class="check"><input type="checkbox" id="c1"> Entendo que a personagem é uma representação lúdica dos meus registros e não um diagnóstico.</label>
      <label class="check"><input type="checkbox" id="c2" checked> Quero receber cartas anônimas de apoio quando o app perceber dias difíceis.</label>
    </div>
    <button class="btn block" id="go">Começar</button><br>
  </div>`);
  $$('[data-k]').forEach(r => r.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return; look[r.dataset.k] = b.dataset.v;
    r.querySelectorAll('button').forEach(x => x.style.borderColor = x === b ? '#3b2f3a' : '#fff');
    $('#prev').innerHTML = Character.svg(st, look, 'jardim', {}, {});
  });
  $('#go').onclick = () => {
    if (!$('#c1').checked) { toast('Confirme o primeiro item para continuar'); return; }
    const s = S();
    s.profile = { name: $('#nm').value.trim(), phase: $('#ph').value, look };
    s.settings.letters = $('#c2').checked; save();
    location.hash = '#/home';
  };
};

routes.home = () => {
  const s = S(); const ents = entriesDesc(); const st = Character.analyze(ents);
  const td = s.entries[today()];
  const pending = s.letters.find(l => !l.opened);
  const decor = decorUnlocked();
  const saved = s.letters.filter(l => l.saved).length;
  setTitle(`Olá${s.profile.name ? ', ' + s.profile.name : ''} 🌸`);
  const lowRun = ents.slice(0, 5).filter(e => e.mood <= 1).length >= 3;
  const ach = achievements();
  view(`<div class="wrap">
    <div class="scene" id="scene">${Character.svg(st, s.profile.look, s.env, decor, { envelope: !!pending, saved })}</div>
    ${td ? `<div class="card between"><div><b>Registro de hoje ✓</b><div class="muted">Sono ${td.sleep}/5 · Energia ${td.energy}/5 · Humor ${td.mood}/5</div></div><button class="btn ghost small" id="ck">Editar</button></div>`
         : `<button class="btn block" id="ck">Como você está hoje? · 30s</button>`}
    ${pending ? `<button class="btn sec block" id="openL">💌 Chegou uma carta para você</button>` : ''}
    ${lowRun ? `<div class="help">Percebemos alguns dias difíceis seguidos. Você não precisa passar por isso sozinha: conversar com alguém de confiança ou com uma profissional pode ajudar.<br>CVV (24h, gratuito): <a href="tel:188">188</a></div>` : ''}
    <div class="card"><h3>Ambiente</h3><div class="chips" id="envs">${D.environments.map(e => `<button class="chip ${s.env === e.id ? 'on' : ''} ${envAllowed(e) ? '' : 'lock'}" data-v="${e.id}">${e.name}${envAllowed(e) ? '' : ' 🔒'}</button>`).join('')}</div>
      <p class="muted">Decorações: ${D.decor.map(d => decor[d.id] ? d.name : `🔒 ${d.name} (${d.premium ? 'premium' : d.need + ' registros'})`).join(' · ')}</p></div>
    <div class="card"><h3>Conquistas</h3><div class="chips">${ach.map(a => `<span class="chip ${a.done ? 'on' : 'lock'}">${a.icon} ${a.name}</span>`).join('')}</div>
      <p class="muted">Sem pressão: pular dias não tira nada de você.</p></div>
    <div class="grid2"><a class="tile" href="#/conteudos"><b>📚</b>Conteúdos e Cuidados</a><a class="tile" href="#/perfil"><b>⚙️</b>Perfil</a></div>
  </div>`);
  $('#ck').onclick = () => checkin();
  if (pending) { $('#openL').onclick = () => openLetter(pending); }
  const env = $('#envelope'); if (env) env.onclick = () => openLetter(pending);
  const mb = $('#memBox'); if (mb) mb.onclick = () => location.hash = '#/cartas';
  $('#charHit').onclick = () => {
    $$('.bubble').forEach(b => b.remove());
    const b = document.createElement('div'); b.className = 'bubble'; b.textContent = Character.phrase(st, s.profile.name);
    $('#scene').appendChild(b); setTimeout(() => b.remove(), 3500);
  };
  $('#envs').onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return; const e = D.environments.find(x => x.id === b.dataset.v);
    if (!envAllowed(e)) { toast(e.premium ? 'Disponível no Premium (simulado no Perfil)' : `Libera com ${e.need} registros`); return; }
    s.env = e.id; save(); render();
  };
};

function bars(list, k, color, max) {
  return `<div class="chart">${list.map(d => { const e = S().entries[d]; const v = e ? e[k] : 0; return `<div title="${fmt(d)}: ${v || '-'}" style="height:${v ? (v / max) * 100 : 2}%;background:${v ? color : '#f0e4ea'}"></div>`; }).join('')}</div>`;
}
function cycleInfo() {
  const p = S().periods;
  if (!p.length) return null;
  const last = p[p.length - 1];
  const gaps = []; for (let i = 1; i < p.length; i++) { const g = diffDays(p[i], p[i - 1]); if (g >= 15 && g <= 60) gaps.push(g); }
  const avg = gaps.length ? Math.round(gaps.slice(-6).reduce((a, b) => a + b, 0) / gaps.slice(-6).length) : 28;
  return { last, avg, day: diffDays(today(), last) + 1, next: addDays(last, avg), estimated: !gaps.length };
}

routes.saude = () => {
  const s = S(); setTitle('Minha Saúde');
  const ents = entriesDesc();
  const days14 = Array.from({ length: 14 }, (_, i) => addDays(today(), i - 13));
  const last30 = ents.filter(e => diffDays(today(), e.date) < 30);
  const freq = {}; last30.forEach(e => (e.symptoms || []).forEach(x => freq[x] = (freq[x] || 0) + 1));
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const ci = cycleInfo();
  view(`<div class="wrap">
    <div class="card"><h3>🩸 Ciclo</h3>
      ${ci ? `<p>Dia <b>${ci.day}</b> do ciclo · última menstruação em ${fmtFull(ci.last)}<br>Próxima prevista: <b>${fmtFull(ci.next)}</b> <span class="muted">(${ci.estimated ? 'estimativa padrão de 28 dias' : 'média de ' + ci.avg + ' dias'})</span></p>`
            : `<p class="muted">${s.profile.phase === 'climaterio' ? 'No climatério o ciclo pode ficar irregular. Registrar ajuda a acompanhar.' : 'Registre o início da menstruação para ver previsões.'}</p>`}
      <div class="row"><button class="btn small" id="pToday">Menstruação começou hoje</button><input type="date" id="pDate" style="width:auto;margin:0" max="${today()}"><button class="btn sec small" id="pAdd">Adicionar data</button></div>
      ${s.periods.length ? `<p class="muted">Datas registradas: ${s.periods.slice(-6).map(fmt).join(', ')}</p>` : ''}
      <p class="muted">Previsões são estimativas e não servem como método contraceptivo.</p>
    </div>
    <div class="card"><h3>Últimos 14 dias</h3>
      <div class="muted">😴 Sono</div>${bars(days14, 'sleep', '#9b87d6', 5)}
      <div class="muted">⚡ Energia</div>${bars(days14, 'energy', '#f6c945', 5)}
      <div class="muted">💗 Humor</div>${bars(days14, 'mood', '#e46f9a', 5)}
      <div class="muted">🌡️ Dor</div>${bars(days14, 'pain', '#f2a65a', 3)}
      <div class="between muted"><span>${fmt(days14[0])}</span><span>hoje</span></div>
    </div>
    <div class="card"><h3>Sintomas mais frequentes (30 dias)</h3>
      ${top.length ? top.map(([k, v]) => `<div class="between"><span>${esc(k)}</span><span class="badge">${v}x</span></div>`).join('') : '<p class="muted">Nenhum sintoma registrado ainda.</p>'}
    </div>
    <div class="card"><h3>✨ Resumo dos seus registros</h3>
      <p class="muted">${AI.enabled() ? 'Resumo feito pela IA a partir dos números (suas anotações não são enviadas).' : 'Sem chave de IA: o resumo é feito no próprio aparelho. Configure a IA no Perfil.'}</p>
      <div id="sumOut"></div><button class="btn sec block" id="sum" ${ents.length ? '' : 'disabled'}>Gerar resumo</button>
    </div>
    <a class="btn block" href="#/relatorio">📄 Relatório para a consulta</a>
    <h2>Histórico</h2>
    ${ents.slice(0, 30).map(e => `<div class="card between hist" data-d="${e.date}" style="cursor:pointer"><div><b>${fmtFull(e.date)}</b><div class="muted">Sono ${e.sleep} · Energia ${e.energy} · Humor ${e.mood} · Dor ${['nenhuma', 'leve', 'média', 'forte'][e.pain || 0]}${e.symptoms.length ? ' · ' + esc(e.symptoms.join(', ')) : ''}</div></div><span>›</span></div>`).join('') || '<p class="muted">Seus registros vão aparecer aqui.</p>'}
    <button class="btn ghost block" id="past">+ Registrar um dia anterior</button>
  </div>`);
  const addP = d => { if (!d) return; if (!s.periods.includes(d)) { s.periods.push(d); s.periods.sort(); save(); } toast('Data registrada'); render(); };
  $('#pToday').onclick = () => addP(today());
  $('#pAdd').onclick = () => addP($('#pDate').value);
  $$('.hist').forEach(h => h.onclick = () => checkin(h.dataset.d));
  $('#past').onclick = () => sheet(`<h3>Qual dia?</h3><input type="date" id="pd" max="${today()}"><button class="btn block" id="okd">Continuar</button>`, (el, close) => {
    el.querySelector('#okd').onclick = () => { const d = el.querySelector('#pd').value; if (!d) return; close(); checkin(d); };
  });
  $('#sum').onclick = async () => {
    const list = ents.slice(0, 14); const out = $('#sumOut'); const b = $('#sum');
    if (AI.enabled()) {
      b.disabled = true; b.textContent = 'Gerando…';
      try { out.innerHTML = `<div class="info">${esc(await AI.summarize(list))}<br><span class="badge">feito pela IA</span></div>`; }
      catch (e) { out.innerHTML = `<div class="info">${esc(AI.localSummary(list))}<br><span class="badge warn">IA indisponível (${esc(e.message)}). Resumo local.</span></div>`; }
      b.disabled = false; b.textContent = 'Gerar novamente';
    } else out.innerHTML = `<div class="info">${esc(AI.localSummary(list))}</div>`;
  };
};

routes.relatorio = () => {
  const s = S(); setTitle('Relatório');
  const ents = entriesDesc().filter(e => diffDays(today(), e.date) < 30);
  const avg = k => ents.length ? (ents.reduce((a, e) => a + (e[k] || 0), 0) / ents.length).toFixed(1) : '-';
  const freq = {}; ents.forEach(e => (e.symptoms || []).forEach(x => freq[x] = (freq[x] || 0) + 1));
  const ci = cycleInfo();
  view(`<div class="wrap">
    <div class="card">
      <h3>Relatório de autocuidado — últimos 30 dias</h3>
      <p class="muted">${esc(s.profile.name || '')} · gerado em ${fmtFull(today())} · ${ents.length} registros</p>
      <p>Médias (1 a 5): sono <b>${avg('sleep')}</b> · energia <b>${avg('energy')}</b> · humor <b>${avg('mood')}</b> · dor (0 a 3) <b>${avg('pain')}</b></p>
      ${ci ? `<p>Ciclo: última menstruação ${fmtFull(ci.last)} · duração média ${ci.avg} dias · datas: ${s.periods.slice(-6).map(fmtFull).join(', ')}</p>` : ''}
      <p>Sintomas: ${Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k)} (${v}x)`).join(', ') || 'nenhum registrado'}</p>
      <table><tr><th>Data</th><th>Sono</th><th>Energia</th><th>Humor</th><th>Dor</th><th>Menstr.</th><th>Sintomas</th></tr>
      ${ents.map(e => `<tr><td>${fmt(e.date)}</td><td>${e.sleep}</td><td>${e.energy}</td><td>${e.mood}</td><td>${e.pain || 0}</td><td>${esc(e.flow || '-')}</td><td>${esc(e.symptoms.join(', '))}</td></tr>`).join('')}</table>
      <p class="muted">Dados registrados pela própria usuária. Não é um laudo nem um diagnóstico.</p>
    </div>
    <button class="btn block noprint" onclick="window.print()">🖨️ Imprimir / salvar em PDF</button>
    <a class="btn sec block noprint" href="#/saude">Voltar</a>
  </div>`);
};

// ---------------- Ajude o Próximo + Jardim ----------------
function gardenSVG() {
  const g = S().garden;
  let p = `<rect width="360" height="220" fill="#eaf7ff"/><circle cx="310" cy="40" r="20" fill="#ffd36b"/><path d="M0 150 Q180 120 360 150 L360 220 L0 220 Z" fill="#a8dba0"/>`;
  if (!g.length) p += `<path d="M180 170 L180 150" stroke="#5c9e5c" stroke-width="3"/><path d="M180 155 q-12 -10 -16 0 q8 6 16 0 M180 152 q12 -12 16 -2 q-8 6 -16 2" fill="#6fbf73"/><text x="180" y="200" text-anchor="middle" font-size="13" fill="#3b2f3a">Seu jardim começa com a primeira mensagem entregue</text>`;
  g.slice(0, 60).forEach((f, i) => {
    const x = 18 + (i % 12) * 28 + ((i / 12 | 0) % 2) * 12; const y = 150 + (i / 12 | 0) * 13 + (i % 3) * 3; const c = D.catColors[f.cat] || '#e46f9a';
    p += `<g class="float" style="animation-delay:${(i % 6) / 4}s"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 14}" stroke="#5c9e5c" stroke-width="2"/>
      <circle cx="${x - 4}" cy="${y}" r="4.5" fill="${c}"/><circle cx="${x + 4}" cy="${y}" r="4.5" fill="${c}"/><circle cx="${x}" cy="${y - 4}" r="4.5" fill="${c}"/><circle cx="${x}" cy="${y + 4}" r="4.5" fill="${c}"/><circle cx="${x}" cy="${y}" r="3" fill="#ffd36b"/></g>`;
  });
  if (g.length >= 10) p += `<rect x="40" y="95" width="10" height="55" fill="#7a5537"/><circle cx="45" cy="85" r="30" fill="#6fbf73"/>`;
  if (g.length >= 20) p += `<rect x="300" y="100" width="10" height="50" fill="#7a5537"/><circle cx="305" cy="90" r="28" fill="#86c98a"/><circle cx="295" cy="85" r="4" fill="#ff6f91"/><circle cx="315" cy="95" r="4" fill="#ff6f91"/>`;
  return `<svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">${p}</svg>`;
}
function penaltyStatus() {
  const st = S().strikes;
  if (st.blocked) return { blocked: true, msg: 'Sua participação no Ajude o Próximo está bloqueada após violações repetidas. Você pode contestar as decisões no histórico.' };
  if (st.suspendedUntil && Date.now() < st.suspendedUntil) return { suspended: true, msg: `Envio suspenso temporariamente até ${new Date(st.suspendedUntil).toLocaleString('pt-BR')}.` };
  return null;
}
function applyStrike(sev) {
  const st = S().strikes;
  if (sev === 'severe') { st.count += 2; st.suspendedUntil = Date.now() + 72 * 3600e3; st.log.push({ d: today(), a: 'suspensão preventiva + revisão' }); return 'Caso grave: suspensão preventiva de 72h e encaminhamento para revisão humana.'; }
  st.count += 1;
  if (st.count === 1) { st.log.push({ d: today(), a: 'orientação' }); return 'Primeira ocorrência: a mensagem não foi enviada. Veja a orientação abaixo.'; }
  if (st.count === 2) { st.log.push({ d: today(), a: 'advertência' }); return '⚠️ Advertência: nova violação pode levar à suspensão temporária.'; }
  if (st.count <= 4) { st.suspendedUntil = Date.now() + 24 * 3600e3; st.log.push({ d: today(), a: 'suspensão 24h' }); return 'Violações repetidas: envio suspenso por 24 horas.'; }
  st.blocked = true; st.log.push({ d: today(), a: 'bloqueio' }); return 'Violações contínuas: participação bloqueada. Você pode contestar no histórico.';
}
function deliver(m) {
  m.status = 'entregue'; m.deliveredAt = today();
  S().garden.push({ id: uid(), cat: m.cat, date: today() });
}

routes.ajudar = () => {
  const s = S(); setTitle('Ajude o Próximo');
  const pen = penaltyStatus();
  const sentToday = s.sent.filter(m => m.date === today()).length;
  const delivered = s.sent.filter(m => m.status === 'entregue').length;
  const badge = m => ({ entregue: '<span class="badge ok">entregue 🌷</span>', rejeitada: '<span class="badge no">não enviada</span>', em_revisao: '<span class="badge warn">em revisão</span>', contestada: '<span class="badge warn">contestada</span>' }[m.status] || '');
  view(`<div class="wrap">
    <div class="scene">${gardenSVG()}</div>
    <div class="between"><b>🌷 Jardim de Carinho</b><span class="muted">${s.garden.length} flor${s.garden.length === 1 ? '' : 'es'} · ${delivered} mensagens entregues</span></div>
    <div class="card">
      <h3>Escreva para uma mulher que precisa</h3>
      <p class="muted">É anônimo: ela não sabe quem você é, e você não vê os dados dela. Cada mensagem passa por moderação ${AI.enabled() ? 'com IA' : '(regras locais — configure a IA no Perfil para moderação completa)'}.</p>
      ${pen ? `<div class="help">${pen.msg}</div>` : `
      <label class="f">Para quem está passando por…</label>
      <select id="cat">${Object.entries(D.categories).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
      <label class="f">Sua mensagem</label>
      <textarea id="msg" maxlength="400" placeholder="Escreva algo gentil, sem dados pessoais, links ou orientações médicas."></textarea>
      <div class="between"><span class="muted" id="cnt">0/400</span><span class="muted">${sentToday}/3 hoje</span></div>
      <button class="btn block" id="send" ${sentToday >= 3 ? 'disabled' : ''}>${sentToday >= 3 ? 'Limite de hoje atingido' : 'Enviar com carinho'}</button>`}
      <div id="res"></div>
    </div>
    <div class="info">Na fase de testes, a entrega é simulada: mensagens aprovadas viram flor na hora. Para evitar spam, há limite de 3 envios por dia.</div>
    <h2>Suas mensagens</h2>
    ${s.sent.slice().reverse().map(m => `<div class="card"><div class="between"><span class="muted">${fmtFull(m.date)} · ${D.categories[m.cat]}</span>${badge(m)}</div>
      <p>${esc(m.text)}</p>
      ${m.reasons && m.reasons.length && m.status !== 'entregue' ? `<p class="muted">Motivo: ${esc(m.reasons.join('; '))}</p>` : ''}
      ${m.status === 'rejeitada' ? `<button class="btn ghost small contest" data-id="${m.id}">Contestar decisão</button>` : ''}
      <span class="muted" style="font-size:11px">moderação: ${esc(m.via || '')}</span></div>`).join('') || '<p class="muted">Você ainda não enviou mensagens.</p>'}
    ${s.strikes.log.length ? `<p class="muted">Histórico de moderação: ${s.strikes.log.map(l => `${fmt(l.d)} ${l.a}`).join(' · ')}</p>` : ''}
  </div>`);
  $$('.contest').forEach(b => b.onclick = () => {
    const m = s.sent.find(x => x.id === b.dataset.id); m.status = 'contestada'; save();
    toast('Contestação enviada para revisão humana'); render();
  });
  if (pen) return;
  const ta = $('#msg'); ta.oninput = () => $('#cnt').textContent = ta.value.length + '/400';
  $('#send').onclick = async () => {
    const text = ta.value.trim(), cat = $('#cat').value, out = $('#res'), b = $('#send');
    if (text.length < 1) { toast('Escreva sua mensagem'); return; }
    b.disabled = true; b.textContent = 'Analisando…';
    let r;
    if (s.sent.some(m => AI.norm(m.text) === AI.norm(text))) r = { decision: 'reject', severity: 'light', reasons: ['Mensagem repetida'], orientation: 'Que tal escrever algo novo?', via: 'regras locais' };
    else if (AI.enabled()) { try { r = await AI.moderate(text, cat); } catch (e) { r = AI.localModerate(text, cat); r.via += ' (IA indisponível: ' + e.message.slice(0, 60) + ')'; } }
    else r = AI.localModerate(text, cat);
    const m = { id: uid(), text, cat, date: today(), reasons: r.reasons, via: r.via };
    let msg = '';
    if (r.decision === 'approve') { deliver(m); msg = '<div class="info">🌷 Mensagem aprovada e entregue! Uma nova flor nasceu no seu jardim.</div>'; }
    else if (r.decision === 'review') { m.status = 'em_revisao'; msg = '<div class="info">Sua mensagem foi para revisão humana antes de ser entregue.</div>'; }
    else {
      m.status = 'rejeitada';
      const pmsg = applyStrike(r.severity);
      if (r.severity === 'severe') m.status = 'em_revisao';
      msg = `<div class="help"><b>${esc(pmsg)}</b><br>${esc(r.orientation || '')}${r.reasons.length ? '<br><span class="muted">Motivo: ' + esc(r.reasons.join('; ')) + '</span>' : ''}</div>`;
    }
    if (r.risk) msg += `<div class="help">${esc(r.orientation || 'Parece que você também está passando por um momento difícil.')} Você merece apoio.</div>` + HELP;
    s.sent.push(m); save();
    render();
    $('#res').innerHTML = msg;
    $('#res').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
};

// Painel de revisão humana (simulado para os testes)
routes.revisao = () => {
  const s = S(); setTitle('Revisão humana (teste)');
  const list = s.sent.filter(m => m.status === 'em_revisao' || m.status === 'contestada');
  view(`<div class="wrap">
    <div class="info">Simula a equipe de moderação. Na versão real, só moderadoras autorizadas veem esta tela.</div>
    ${list.map(m => `<div class="card"><div class="between"><span class="muted">${D.categories[m.cat]}</span><span class="badge warn">${m.status === 'contestada' ? 'contestação' : 'revisão'}</span></div>
      <p>${esc(m.text)}</p>${m.reasons && m.reasons.length ? `<p class="muted">IA/regras: ${esc(m.reasons.join('; '))}</p>` : ''}
      <div class="row"><button class="btn small rv-ok" data-id="${m.id}">Aprovar e entregar</button><button class="btn sec small rv-no" data-id="${m.id}">Manter rejeição</button></div></div>`).join('') || '<p class="muted">Nada aguardando revisão.</p>'}
    ${s.strikes.count ? `<div class="card"><p>Ocorrências: ${s.strikes.count}${s.strikes.blocked ? ' · bloqueada' : ''}${s.strikes.suspendedUntil > Date.now() ? ' · suspensa' : ''}</p><button class="btn ghost small" id="clr">Zerar penalidades (teste)</button></div>` : ''}
    <a class="btn sec block" href="#/perfil">Voltar</a>
  </div>`);
  $$(".rv-ok").forEach(b => b.onclick = () => {
    const m = s.sent.find(x => x.id === b.dataset.id);
    if (m.status === 'contestada' || (m.reasons || []).length) {
      const st = s.strikes; st.count = Math.max(0, st.count - 1); if (st.count < 5) st.blocked = false; if (st.count < 3) st.suspendedUntil = 0; st.log.push({ d: today(), a: 'revisão: decisão revertida' });
    }
    deliver(m); save(); toast('Aprovada e entregue 🌷'); render();
  });
  $$(".rv-no").forEach(b => b.onclick = () => { const m = s.sent.find(x => x.id === b.dataset.id); m.status = 'rejeitada'; m.reviewed = true; save(); render(); });
  const c = $('#clr'); if (c) c.onclick = () => { s.strikes = { count: 0, suspendedUntil: 0, blocked: false, log: [] }; save(); render(); };
};

// ---------------- Minhas Cartas ----------------
let letterFilter = 'todas';
routes.cartas = () => {
  const s = S(); setTitle('Minhas Cartas');
  const opened = s.letters.filter(l => l.opened);
  const saved = opened.filter(l => l.saved && (letterFilter === 'todas' || l.cat === letterFilter));
  const recent = opened.filter(l => !l.saved);
  const pending = s.letters.filter(l => !l.opened);
  view(`<div class="wrap">
    <div class="card" style="text-align:center"><div style="font-size:44px">📦💌</div><b>Caixa de lembranças</b><div class="muted">${opened.filter(l => l.saved).length} cartas guardadas</div></div>
    ${pending.length ? `<button class="btn block" id="openP">💌 Abrir carta nova (${pending.length})</button>` : ''}
    <div class="chips" id="flt"><button class="chip ${letterFilter === 'todas' ? 'on' : ''}" data-v="todas">Todas</button>${Object.entries(D.categories).map(([k, v]) => `<button class="chip ${letterFilter === k ? 'on' : ''}" data-v="${k}">${v}</button>`).join('')}</div>
    ${saved.map(l => `<div class="letter">${esc(l.text)}<div class="between" style="margin-top:8px;font-family:sans-serif"><span class="muted">${fmtFull(l.date)} · ${D.categories[l.cat]}</span><button class="btn ghost small del" data-id="${l.id}">Excluir</button></div></div>`).join('') || '<p class="muted">As cartas que você guardar aparecem aqui. Elas chegam quando o app percebe dias difíceis nos seus registros (você pode desligar isso no Perfil).</p>'}
    ${recent.length ? `<h2>Recebidas e não guardadas</h2>${recent.map(l => `<div class="card"><p>${esc(l.text)}</p><div class="row"><button class="btn small keep" data-id="${l.id}">Guardar</button><button class="btn sec small del" data-id="${l.id}">Excluir</button></div></div>`).join('')}` : ''}
  </div>`);
  if (pending.length) $('#openP').onclick = () => openLetter(pending[0]);
  $('#flt').onclick = ev => { const b = ev.target.closest('button'); if (!b) return; letterFilter = b.dataset.v; render(); };
  $$('.del').forEach(b => b.onclick = () => confirmSheet('Excluir esta carta?', 'Excluir', () => { s.letters = s.letters.filter(l => l.id !== b.dataset.id); save(); render(); }));
  $$('.keep').forEach(b => b.onclick = () => { s.letters.find(l => l.id === b.dataset.id).saved = true; save(); render(); });
};

// ---------------- Novelinhas ----------------
const FREE_EPS = 2;
function allEpisodes(serie) { return [...serie.episodes, ...(S().aiEpisodes[serie.id] || [])]; }
function isUnlocked(sid, i) { const s = S(); return i < FREE_EPS || s.premium || s.seasons[sid] || s.unlocked[sid + ':' + i] || i >= D.series.find(x => x.id === sid).episodes.length; }

routes.novelas = () => {
  const s = S(); setTitle('Novelinhas');
  view(`<div class="wrap">
    <div class="between"><span class="muted">Episódios de 1 a 3 minutos · os ${FREE_EPS} primeiros são grátis</span><span class="badge">🪙 ${s.credits} créditos</span></div>
    ${D.series.map(se => { const w = allEpisodes(se).filter((_, i) => s.watched[se.id + ':' + i]).length; return `<a class="cover" href="#/serie/${se.id}" style="background:linear-gradient(135deg,${se.colors[0]},${se.colors[1]})"><h3>${esc(se.title)}</h3><div>${esc(se.desc)}</div><div style="margin-top:10px;font-size:13px;opacity:.9">${allEpisodes(se).length} episódios · ${w} assistidos</div></a>`; }).join('')}
    <div class="info">Pagamentos simulados para teste: episódio R$ 1,90 (1 crédito) · temporada R$ 9,90 · Premium libera tudo.</div>
  </div>`);
};

routes.serie = sid => {
  const s = S(); const se = D.series.find(x => x.id === sid); if (!se) { location.hash = '#/novelas'; return; }
  setTitle('Novelinhas');
  const eps = allEpisodes(se);
  view(`<div class="wrap">
    <div class="cover" style="background:linear-gradient(135deg,${se.colors[0]},${se.colors[1]});cursor:default"><h3>${esc(se.title)}</h3><div>${esc(se.desc)}</div></div>
    <div class="between"><span class="badge">🪙 ${s.credits} créditos</span>${!s.seasons[sid] && !s.premium ? `<button class="btn ghost small" id="season">Temporada · R$ 9,90</button>` : '<span class="badge ok">temporada liberada</span>'}</div>
    <div class="card">${eps.map((e, i) => `<div class="ep"><div><b>${i + 1}. ${esc(e.title)}</b><div class="muted">${i >= se.episodes.length ? '✨ extra gerado por IA · ' : ''}${i < FREE_EPS ? 'grátis' : isUnlocked(sid, i) ? 'liberado' : '1 crédito'}${s.watched[sid + ':' + i] ? ' · ✓ assistido' : ''}</div></div>
      <button class="btn small ${isUnlocked(sid, i) ? '' : 'sec'} play" data-i="${i}">${isUnlocked(sid, i) ? '▶ Assistir' : '🔒 Liberar'}</button></div>`).join('')}</div>
    <button class="btn sec block" id="gen">✨ Criar próximo episódio com IA (teste)</button>
    <button class="btn ghost block" id="buy">Comprar 5 créditos · R$ 8,90 (simulado)</button>
    <a class="btn ghost block" href="#/novelas">Voltar</a>
  </div>`);
  $$('.play').forEach(b => b.onclick = () => {
    const i = Number(b.dataset.i);
    if (isUnlocked(sid, i)) return play(se, i);
    if (s.credits < 1) { toast('Sem créditos. Compre um pacote (simulado).'); return; }
    confirmSheet(`Liberar o episódio ${i + 1} por 1 crédito (R$ 1,90)?`, 'Liberar', () => { s.credits--; s.unlocked[sid + ':' + i] = true; s.purchases.push({ d: today(), item: `${se.title} ep ${i + 1}`, v: 1.9 }); save(); render(); });
  });
  const sb = $('#season'); if (sb) sb.onclick = () => confirmSheet('Comprar a temporada completa por R$ 9,90? (simulado)', 'Comprar', () => { s.seasons[sid] = true; s.purchases.push({ d: today(), item: `${se.title} temporada`, v: 9.9 }); save(); render(); });
  $('#buy').onclick = () => confirmSheet('Comprar 5 créditos por R$ 8,90? (simulado, nada é cobrado)', 'Comprar', () => { s.credits += 5; s.purchases.push({ d: today(), item: '5 créditos', v: 8.9 }); save(); render(); });
  $('#gen').onclick = async () => {
    if (!AI.enabled()) { toast('Configure a chave de IA no Perfil'); return; }
    const b = $('#gen'); b.disabled = true; b.textContent = 'Escrevendo episódio…';
    try { const ep = await AI.episode(se, S().aiEpisodes[sid]); (s.aiEpisodes[sid] = s.aiEpisodes[sid] || []).push(ep); save(); toast('Novo episódio criado ✨'); render(); }
    catch (e) { toast('Não foi possível gerar: ' + e.message.slice(0, 80)); b.disabled = false; b.textContent = '✨ Criar próximo episódio com IA (teste)'; }
  };
};

function play(se, i) {
  const ep = allEpisodes(se)[i]; let k = 0;
  const el = document.createElement('div'); el.className = 'story';
  el.style.background = `linear-gradient(160deg,${se.colors[0]},${se.colors[1]})`;
  const draw = () => {
    const sc = ep.scenes[k];
    el.innerHTML = `<div class="bars">${ep.scenes.map((_, j) => `<i class="${j <= k ? 'on' : ''}"></i>`).join('')}</div><button class="close">×</button>
      <div>${sc.who ? `<span class="who">${esc(sc.who)}</span>` : ''}${esc(sc.text)}</div><div class="hint">${k === 0 ? esc(`Ep. ${i + 1} · ${ep.title}`) + ' · ' : ''}toque para continuar</div>`;
    el.querySelector('.close').onclick = ev => { ev.stopPropagation(); el.remove(); render(); };
  };
  el.onclick = () => { k++; if (k >= ep.scenes.length) { S().watched[se.id + ':' + i] = true; save(); el.remove(); render(); return; } draw(); };
  draw(); document.body.appendChild(el);
}

// ---------------- Conteúdos ----------------
routes.conteudos = () => {
  setTitle('Conteúdos e Cuidados');
  view(`<div class="wrap">
    <div class="info">⚠️ Conteúdo provisório da fase de testes, aguardando revisão de profissionais de saúde. Não substitui consulta médica.</div>
    ${D.contents.map(c => `<div class="card ct" data-id="${c.id}" style="cursor:pointer"><span class="badge">${c.tag}</span><h3 style="margin-top:8px">${c.title}</h3><div class="muted">${c.body[0].slice(0, 90)}…</div></div>`).join('')}
    ${HELP}
  </div>`);
  $$('.ct').forEach(b => b.onclick = () => { const c = D.contents.find(x => x.id === b.dataset.id); sheet(`<span class="badge">${c.tag}</span><h3 style="margin-top:8px">${c.title}</h3>${c.body.map(p => `<p>${p}</p>`).join('')}<p class="muted">Conteúdo provisório · aguardando revisão especializada.</p><button class="btn sec block" id="x">Fechar</button>`, (el, close) => el.querySelector('#x').onclick = close); });
};

// ---------------- Perfil ----------------
routes.perfil = () => {
  const s = S(); setTitle('Perfil');
  const look = s.profile.look;
  const outfits = [...D.looks.outfit, ...D.looks.outfitPremium];
  const sw = (k, list) => `<div class="row" data-k="${k}">${list.map(c => { const lock = k === 'outfit' && D.looks.outfitPremium.includes(c) && !s.premium; return `<button type="button" data-v="${c}" data-lock="${lock ? 1 : ''}" style="width:34px;height:34px;border-radius:50%;background:${c};border:3px solid ${look[k] === c ? '#3b2f3a' : '#fff'};box-shadow:0 1px 4px rgba(0,0,0,.15);cursor:pointer;opacity:${lock ? .4 : 1}">${lock ? '🔒' : ''}</button>`; }).join('')}</div>`;
  const reviewCount = s.sent.filter(m => m.status === 'em_revisao' || m.status === 'contestada').length;
  view(`<div class="wrap">
    <div class="card">
      <label class="f">Nome</label><input id="nm" value="${esc(s.profile.name)}" maxlength="30">
      <label class="f">Acompanhar</label><select id="ph">${[['ciclo', 'Ciclo menstrual'], ['climaterio', 'Climatério / menopausa'], ['ambos', 'Um pouco de tudo']].map(([v, t]) => `<option value="${v}" ${s.profile.phase === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
      <label class="f">Personagem</label>${sw('skin', D.looks.skin)}<div style="height:8px"></div>${sw('hair', D.looks.hair)}<div style="height:8px"></div>${sw('outfit', outfits)}
      <button class="btn block" id="svp" style="margin-top:14px">Salvar perfil</button>
    </div>
    <div class="card">
      <h3>⭐ Premium <span class="badge">simulado</span></h3>
      <p class="muted">Cenários e decorações exclusivas, roupas especiais, catálogo de novelinhas liberado. Preço em teste: R$ 9,90 a R$ 19,90/mês.</p>
      <label class="check"><input type="checkbox" id="prem" ${s.premium ? 'checked' : ''}> Ativar Premium (teste, sem cobrança)</label>
    </div>
    <div class="card">
      <h3>🔒 Privacidade</h3>
      <label class="check"><input type="checkbox" id="lt" ${s.settings.letters ? 'checked' : ''}> Receber cartas de apoio quando houver dias difíceis</label>
      <label class="check"><input type="checkbox" id="aiOn" ${s.settings.ai ? 'checked' : ''}> Usar IA (moderação, resumos e novelinhas)</label>
      <p class="muted">Seus dados ficam só neste aparelho. Para a IA, são enviados apenas os números dos registros (sem anotações) ou o texto da mensagem a moderar.</p>
      <div class="row"><button class="btn sec small" id="exp">Exportar meus dados</button><button class="btn ghost small" id="wipe">Apagar tudo</button></div>
    </div>
    <div class="card">
      <h3>🤖 IA (Claude)</h3>
      <p class="muted">Cole sua chave da API da Anthropic. Ela fica salva somente neste aparelho e não vai para o GitHub.</p>
      <input id="key" type="password" placeholder="sk-ant-…" value="${esc(s.settings.apiKey)}" autocomplete="off">
      <label class="f">Modelo</label><select id="model">${['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5'].map(m => `<option ${s.settings.model === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
      <div class="row"><button class="btn small" id="svk">Salvar chave</button><button class="btn sec small" id="tst">Testar conexão</button></div><div id="tstOut"></div>
    </div>
    <div class="card"><h3>🛡️ Moderação</h3><a class="btn sec block" href="#/revisao">Painel de revisão humana (teste)${reviewCount ? ' · ' + reviewCount : ''}</a></div>
    ${s.purchases.length ? `<div class="card"><h3>Compras simuladas</h3>${s.purchases.slice(-8).reverse().map(p => `<div class="between muted"><span>${esc(p.item)}</span><span>R$ ${p.v.toFixed(2).replace('.', ',')}</span></div>`).join('')}</div>` : ''}
    ${HELP}
    <p class="muted" style="text-align:center">App da Mulher · versão de teste 0.1</p>
  </div>`);
  $$('[data-k]').forEach(r => r.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.lock) { toast('Roupa exclusiva do Premium'); return; }
    look[r.dataset.k] = b.dataset.v; r.querySelectorAll('button').forEach(x => x.style.borderColor = x === b ? '#3b2f3a' : '#fff');
  });
  $('#svp').onclick = () => { s.profile.name = $('#nm').value.trim(); s.profile.phase = $('#ph').value; save(); toast('Perfil salvo'); render(); };
  $('#prem').onchange = e => { s.premium = e.target.checked; if (!s.premium && D.looks.outfitPremium.includes(look.outfit)) look.outfit = D.looks.outfit[0]; if (!s.premium && s.env === 'praia') s.env = 'quarto'; save(); toast(s.premium ? 'Premium ativado (teste) ⭐' : 'Premium desativado'); render(); };
  $('#lt').onchange = e => { s.settings.letters = e.target.checked; save(); };
  $('#aiOn').onchange = e => { s.settings.ai = e.target.checked; save(); };
  $('#svk').onclick = () => { s.settings.apiKey = $('#key').value.trim(); s.settings.model = $('#model').value; save(); toast('Chave salva neste aparelho'); };
  $('#model').onchange = () => { s.settings.model = $('#model').value; save(); };
  $('#tst').onclick = async () => {
    s.settings.apiKey = $('#key').value.trim(); s.settings.model = $('#model').value; save();
    const o = $('#tstOut'); o.innerHTML = '<p class="muted">Testando…</p>';
    try { await AI.test(); o.innerHTML = '<p><span class="badge ok">Conectado ✓</span></p>'; }
    catch (e) { o.innerHTML = `<p><span class="badge no">Falhou</span> <span class="muted">${esc(e.message)}</span></p>`; }
  };
  $('#exp').onclick = () => {
    const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'meus-dados-app-da-mulher.json'; a.click();
  };
  $('#wipe').onclick = () => confirmSheet('Apagar todos os seus dados deste aparelho? Isso não pode ser desfeito.', 'Apagar tudo', () => { Store.reset(); location.hash = '#/onboarding'; render(); });
};

// ---------------- Roteador ----------------
function render() {
  const s = S();
  let [, name, ...args] = (location.hash || '#/home').split('/');
  if (!s.profile && name !== 'onboarding') { location.hash = '#/onboarding'; return; }
  if (s.profile && name === 'onboarding') { location.hash = '#/home'; return; }
  if (!routes[name]) name = 'home';
  const tab = { home: 'home', saude: 'saude', relatorio: 'saude', ajudar: 'ajudar', cartas: 'cartas', novelas: 'novelas', serie: 'novelas' }[name];
  $$('nav.tabs a').forEach(a => a.classList.toggle('on', a.dataset.t === tab));
  const ob = name === 'onboarding';
  $('nav.tabs').style.display = ob ? 'none' : 'flex';
  $('header.top').style.display = ob ? 'none' : 'flex';
  routes[name](...args);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);
render();
