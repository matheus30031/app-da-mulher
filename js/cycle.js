// Ciclo menstrual: cálculos e visualizações (anel, faixa de dias e calendário).
// Previsões são estimativas e não servem como método contraceptivo.
const Cycle = (() => {
  const pad = n => String(n).padStart(2, '0');
  const toStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => toStr(new Date());
  const add = (ds, n) => { const d = new Date(ds + 'T12:00:00'); d.setDate(d.getDate() + n); return toStr(d); };
  const diff = (a, b) => Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 864e5);
  const fmt = ds => { const [, m, d] = ds.split('-'); return `${d}/${m}`; };
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const SEM = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const PH = {
    menstrual: { name: 'Menstruação', color: '#e8547f', soft: '#fbd3df', text: 'A energia pode estar mais baixa. Calor na barriga, descanso e água ajudam.' },
    folicular: { name: 'Fase folicular', color: '#f4a7c0', soft: '#fde7ee', text: 'Muitas mulheres sentem a energia e a disposição voltando aos poucos.' },
    fertil: { name: 'Janela fértil', color: '#7fd0c6', soft: '#dff4f1', text: 'Dias com maior chance de gravidez. Muitas se sentem mais sociáveis e confiantes.' },
    ovulacao: { name: 'Ovulação estimada', color: '#2fa79c', soft: '#cdeeea', text: 'O dia estimado da ovulação, o pico da janela fértil.' },
    lutea: { name: 'Fase lútea', color: '#bba5e6', soft: '#ece5fa', text: 'Perto do fim do ciclo podem aparecer inchaço, sensibilidade e TPM.' }
  };

  function days() { return [...new Set(Store.get().periodDays || [])].sort(); }
  function starts(d) { d = d || days(); const set = new Set(d); return d.filter(x => !set.has(add(x, -1))); }

  function stats() {
    const d = days(); const set = new Set(d); const st = starts(d);
    if (!st.length) return null;
    const lens = st.map(s0 => { let n = 0; while (set.has(add(s0, n))) n++; return n; });
    const lastLens = lens.slice(-6);
    let P = Math.round(lastLens.reduce((a, b) => a + b, 0) / lastLens.length);
    if (lens.length === 1 && lens[0] < 3) P = 5; // só o 1º dia registrado: assume 5
    P = Math.max(2, Math.min(P, 10));
    const gaps = []; for (let i = 1; i < st.length; i++) { const g = diff(st[i], st[i - 1]); if (g >= 15 && g <= 90) gaps.push(g); }
    const g6 = gaps.slice(-6);
    const L = g6.length ? Math.round(g6.reduce((a, b) => a + b, 0) / g6.length) : 28;
    const sd = g6.length >= 2 ? Math.sqrt(g6.reduce((s, x) => s + (x - L) ** 2, 0) / g6.length) : 0;
    const last = st[st.length - 1];
    const day = diff(today(), last) + 1;
    const late = day > L ? day - L : 0;
    const next = late ? today() : add(last, L);
    const O = ovuDay(L, P);
    return { P, L, last, day, late, next, estimated: !g6.length, irregular: sd > 7, starts: st, set,
      fertileStart: add(last, O - 6), fertileEnd: add(last, O), ovulation: add(last, O - 1), phase: phaseOf(Math.min(day, L), L, P) };
  }
  function ovuDay(L, P) { return Math.max(P + 3, L - 14); }
  function phaseOf(n, L, P) {
    const O = ovuDay(L, P);
    if (n <= P) return 'menstrual';
    if (n === O) return 'ovulacao';
    if (n >= O - 5 && n <= O + 1) return 'fertil';
    if (n < O - 5) return 'folicular';
    return 'lutea';
  }

  // Classifica uma data para o calendário
  function info(date, st) {
    if (!st) return { logged: false };
    const logged = st.set.has(date);
    if (date < st.last) return { logged };
    const k = Math.floor(diff(date, st.last) / st.L);
    // ciclo atual atrasado: não projeta nada até a menstruação vir
    if (st.late && k >= 1 && date <= today()) return { logged };
    const base = st.late && k >= 1 ? add(today(), (k - 1) * st.L) : add(st.last, k * st.L);
    const n = diff(date, base) + 1;
    if (n < 1) return { logged };
    const ph = phaseOf(n, st.L, st.P);
    const future = date > today();
    return { logged, n, phase: ph, pred: !logged && future && ph === 'menstrual', fert: ph === 'fertil' || ph === 'ovulacao', ovu: ph === 'ovulacao' };
  }

  // ---------- Anel do ciclo ----------
  function polar(cx, cy, r, a) { const t = (a - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
  function arc(cx, cy, r, a0, a1) { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; }

  function ring(st) {
    const cx = 150, cy = 150, r = 116, w = 22;
    if (!st) {
      return `<svg viewBox="0 0 300 300" class="ring"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f6e3ea" stroke-width="${w}" stroke-dasharray="6 6"/>
        <text x="150" y="140" text-anchor="middle" class="r-sm">Vamos começar?</text>
        <text x="150" y="172" text-anchor="middle" class="r-md">Toque em</text><text x="150" y="196" text-anchor="middle" class="r-md">“Registrar menstruação”</text></svg>`;
    }
    const { L, P } = st; let segs = '';
    const step = 360 / L, gap = L > 40 ? 0.4 : 0.9;
    for (let i = 1; i <= L; i++) {
      const ph = phaseOf(i, L, P);
      const past = i < Math.min(st.day, L + 1);
      segs += `<path class="seg" style="animation-delay:${i * 18}ms" d="${arc(cx, cy, r, (i - 1) * step + gap, i * step - gap)}" stroke="${PH[ph].color}" stroke-width="${w}" fill="none" opacity="${past ? .38 : 1}"/>`;
    }
    // marcas de início e de hoje
    const dShow = Math.min(st.day, L);
    const [mx, my] = polar(cx, cy, r, (dShow - 0.5) * step);
    const col = st.late ? '#e8547f' : PH[st.phase].color;
    const marker = `<circle class="pulse" cx="${mx}" cy="${my}" r="15" fill="${col}"/><circle cx="${mx}" cy="${my}" r="15" fill="#fff" stroke="${col}" stroke-width="4"/><text x="${mx}" y="${my + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${col}">${st.day}</text>`;
    let top, big, bottom;
    if (st.late) { top = 'Menstruação atrasada'; big = `${st.late} ${st.late === 1 ? 'dia' : 'dias'}`; bottom = 'atrasos acontecem'; }
    else if (st.phase === 'menstrual') { top = 'Menstruação'; big = `Dia ${st.day}`; bottom = `de ~${P} dias`; }
    else { const n = diff(st.next, today()); top = 'Menstruação em'; big = n === 0 ? 'hoje' : `${n} ${n === 1 ? 'dia' : 'dias'}`; bottom = PH[st.phase].name; }
    return `<svg viewBox="0 0 300 300" class="ring" role="img" aria-label="Anel do ciclo">
      <circle cx="${cx}" cy="${cy}" r="${r - w / 2 - 14}" fill="url(#rg)"/>
      <defs><radialGradient id="rg"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${PH[st.late ? 'menstrual' : st.phase].soft}"/></radialGradient></defs>
      ${segs}${marker}
      <text x="150" y="122" text-anchor="middle" class="r-sm">${top}</text>
      <text x="150" y="166" text-anchor="middle" class="r-big">${big}</text>
      <text x="150" y="192" text-anchor="middle" class="r-sm" fill="${col}">${bottom}</text>
      <text x="150" y="214" text-anchor="middle" class="r-xs">dia ${st.day} de ${L}</text>
    </svg>`;
  }

  // ---------- Faixa de dias (−6 a +14) ----------
  function strip(st) {
    let h = '';
    for (let i = -6; i <= 14; i++) {
      const d = add(today(), i); const inf = info(d, st);
      const dt = new Date(d + 'T12:00:00');
      let dot = 'transparent', cls = '';
      if (inf.logged) { dot = PH.menstrual.color; cls = 'per'; }
      else if (inf.pred) { dot = PH.menstrual.color; cls = 'pred'; }
      else if (inf.ovu) dot = PH.ovulacao.color;
      else if (inf.fert) dot = PH.fertil.color;
      h += `<button class="sd ${cls} ${i === 0 ? 'today' : ''}" data-d="${d}"><span>${i === 0 ? 'Hoje' : SEM[dt.getDay()]}</span><b>${dt.getDate()}</b><i style="background:${dot};${dot === 'transparent' ? 'box-shadow:none' : ''}"></i></button>`;
    }
    return `<div class="strip" id="strip">${h}</div>`;
  }

  // ---------- Calendário do mês ----------
  function calendar(y, m, st, edit) {
    const first = new Date(y, m, 1), nDays = new Date(y, m + 1, 0).getDate();
    let h = SEM.map(s => `<div class="wd">${s}</div>`).join('');
    for (let i = 0; i < first.getDay(); i++) h += '<div></div>';
    const set = new Set(days());
    for (let dd = 1; dd <= nDays; dd++) {
      const d = `${y}-${pad(m + 1)}-${pad(dd)}`;
      const inf = st ? info(d, st) : { logged: set.has(d) };
      const c = [];
      if (inf.logged || set.has(d)) c.push('per');
      else if (!edit && inf.pred) c.push('pred');
      else if (!edit && inf.ovu) c.push('ovu');
      else if (!edit && inf.fert) c.push('fert');
      if (d === today()) c.push('today');
      if (edit && d > today()) c.push('dis');
      h += `<button class="d ${c.join(' ')}" data-d="${d}" ${edit && d > today() ? 'disabled' : ''}>${dd}</button>`;
    }
    return `<div class="cal-head"><button class="nav" data-mv="-1" aria-label="Mês anterior">‹</button><b>${MESES[m]} ${y}</b><button class="nav" data-mv="1" aria-label="Próximo mês">›</button></div><div class="cal">${h}</div>`;
  }

  function toggleDay(d) {
    const s = Store.get(); s.periodDays = s.periodDays || [];
    const i = s.periodDays.indexOf(d);
    if (i >= 0) s.periodDays.splice(i, 1); else s.periodDays.push(d);
    s.periodDays.sort(); Store.save();
  }
  function markStart(d, P) { // marca vários dias a partir do início
    const s = Store.get(); s.periodDays = s.periodDays || [];
    for (let i = 0; i < P; i++) { const x = add(d, i); if (x <= today() && !s.periodDays.includes(x)) s.periodDays.push(x); }
    s.periodDays.sort(); Store.save();
  }

  const legend = `<div class="legend"><span><i style="background:${PH.menstrual.color}"></i>Menstruação</span><span><i class="dash"></i>Prevista</span><span><i style="background:${PH.fertil.color}"></i>Janela fértil</span><span><i style="background:${PH.ovulacao.color}"></i>Ovulação</span><span><i style="background:${PH.lutea.color}"></i>Lútea</span></div>`;

  return { PH, stats, info, ring, strip, calendar, toggleDay, markStart, legend, phaseOf, fmt, add, diff, MESES };
})();
