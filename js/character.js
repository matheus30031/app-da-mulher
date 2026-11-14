// Personagem virtual: reflete os registros recentes (não é avaliação clínica).
const Character = (() => {
  function analyze(entries) {
    const recent = entries.slice(0, 7);
    if (!recent.length) return { energy: 3, sleep: 3, mood: 3, painv: 0, tired: false, happy: false, sad: false, pain: false, irregular: false, n: 0 };
    const w = recent.map((_, i) => i < 3 ? 2 : 1);
    const W = w.reduce((a, b) => a + b, 0);
    const avg = (k, d) => recent.reduce((s, e, i) => s + ((e[k] ?? d) * w[i]), 0) / W;
    const energy = avg('energy', 3), sleep = avg('sleep', 3), mood = avg('mood', 3), painv = avg('pain', 0);
    const sl = recent.map(e => e.sleep || 3);
    const mean = sl.reduce((a, b) => a + b, 0) / sl.length;
    const sd = Math.sqrt(sl.reduce((s, x) => s + (x - mean) ** 2, 0) / sl.length);
    return {
      energy, sleep, mood, painv,
      tired: energy < 2.6 || sleep < 2.6,
      happy: mood >= 3.8,
      sad: mood <= 2.3,
      pain: painv >= 1.5,
      irregular: sl.length >= 4 && sd >= 1.1,
      n: entries.length
    };
  }

  function phrase(st, name) {
    const n = name ? ', ' + name : '';
    if (!st.n) return `Oi${n}! Me conta como você está hoje? 🌸`;
    if (st.tired && st.happy) return 'Tô cansadinha, mas feliz! Que tal uma pausa gostosa hoje? ☕';
    if (st.sad) return 'Dias cinzas também passam. Tô aqui com você. 💜';
    if (st.tired) return 'Estou precisando descansar… e tudo bem! 😴';
    if (st.pain) return 'Um pouquinho de calor e carinho ajudam hoje. 🌷';
    if (st.happy) return 'Que dia bonito! Obrigada por cuidar de nós duas! ✨';
    return 'Que bom te ver por aqui! 🌼';
  }

  function svg(st, look, env, decor, opts) {
    opts = opts || {};
    const skin = look.skin, hair = look.hair, outfit = look.outfit;
    const ink = '#3b2f3a';
    let s1, s2;
    if (st.sad) { s1 = '#94a0b5'; s2 = '#d3d9e2'; }
    else if (st.tired) { s1 = '#b3a1d6'; s2 = '#f3d9e6'; }
    else if (st.happy) { s1 = '#78c4f0'; s2 = '#ffe1c2'; }
    else { s1 = '#a8d8f0'; s2 = '#eef7fb'; }
    const spd = Math.max(1.6, Math.min(4, 2.9 - (st.energy - 3) * 0.55)).toFixed(2);
    const nFlowers = Math.min(12, Math.floor(st.n / 3) + (st.happy ? 3 : 0) + (st.energy >= 3.5 ? 2 : 0));
    const p = [];
    p.push(`<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient>
      <clipPath id="win"><rect x="210" y="52" width="120" height="105" rx="8"/></clipPath></defs>`);

    const sun = (x, y) => `<circle cx="${x}" cy="${y}" r="20" fill="#ffd36b"/><circle cx="${x}" cy="${y}" r="28" fill="#ffd36b" opacity=".25"/>`;
    const cloud = (x, y, c) => `<g fill="${c}"><ellipse cx="${x}" cy="${y}" rx="26" ry="13"/><ellipse cx="${x + 18}" cy="${y - 8}" rx="18" ry="13"/><ellipse cx="${x - 16}" cy="${y - 4}" rx="14" ry="10"/></g>`;
    const rain = (x0, x1, y0) => { let r = '<g class="rain" stroke="#ffffff" stroke-width="2" opacity=".7" stroke-linecap="round">'; for (let x = x0; x < x1; x += 18) r += `<line x1="${x}" y1="${y0 + (x * 7) % 30}" x2="${x - 4}" y2="${y0 + 12 + (x * 7) % 30}" style="animation-delay:${((x * 13) % 9) / 10}s"/>`; return r + '</g>'; };
    const weather = (x0, x1, y0) => {
      let w = '';
      if (st.happy && !st.sad) w += sun(x1 - 40, y0 + 35);
      if (st.sad) { w += cloud(x0 + 40, y0 + 30, '#eef0f4') + cloud(x1 - 50, y0 + 45, '#e3e6ec') + rain(x0 + 10, x1 - 5, y0 + 50); }
      else if (st.tired) { w += `<circle cx="${x1 - 35}" cy="${y0 + 32}" r="14" fill="#fff6d8"/><circle cx="${x1 - 29}" cy="${y0 + 28}" r="12" fill="${s1}"/>`; }
      else w += cloud(x0 + 45, y0 + 35, '#ffffff');
      return w;
    };
    const flower = (x, y, c, k) => `<g class="float" style="animation-delay:${(k % 5) / 3}s"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 16}" stroke="#5c9e5c" stroke-width="2.5"/>
      <circle cx="${x - 5}" cy="${y}" r="5" fill="${c}"/><circle cx="${x + 5}" cy="${y}" r="5" fill="${c}"/><circle cx="${x}" cy="${y - 5}" r="5" fill="${c}"/><circle cx="${x}" cy="${y + 5}" r="5" fill="${c}"/><circle cx="${x}" cy="${y}" r="3.5" fill="#ffd36b"/></g>`;
    const fcolors = ['#ff8fb1', '#ffb36b', '#c9a2ff', '#ff6f91', '#ffe066', '#8fd3ff'];

    if (env === 'quarto') {
      p.push(`<rect width="360" height="420" fill="#fbe9ef"/>`);
      p.push(`<rect x="210" y="52" width="120" height="105" rx="8" fill="url(#sky)"/><g clip-path="url(#win)">${weather(210, 330, 52)}</g>
        <rect x="210" y="52" width="120" height="105" rx="8" fill="none" stroke="#fff" stroke-width="7"/><line x1="270" y1="52" x2="270" y2="157" stroke="#fff" stroke-width="5"/>`);
      p.push(`<rect y="330" width="360" height="90" fill="#e9cdb4"/><rect y="328" width="360" height="5" fill="#d9b897"/>`);
      if (decor.tapete) p.push(`<ellipse cx="180" cy="392" rx="130" ry="20" fill="#c9b6ee" opacity=".7"/>`);
      if (decor.quadro) p.push(`<rect x="40" y="70" width="70" height="55" rx="4" fill="#fff" stroke="#c98c62" stroke-width="5"/><path d="M48 118 L68 92 L84 110 L92 100 L104 118 Z" fill="#9bd39b"/><circle cx="92" cy="84" r="6" fill="#ffd36b"/>`);
      if (decor.luminaria) p.push(`<rect x="316" y="250" width="5" height="80" fill="#8a7a88"/><path d="M296 252 L340 252 L330 222 L306 222 Z" fill="#ffe2a8"/><ellipse cx="318" cy="262" rx="30" ry="10" fill="#ffe8b0" opacity="${st.tired ? .6 : .25}"/>`);
      if (decor.planta) p.push(`<path d="M42 300 L70 300 L66 330 L46 330 Z" fill="#c98c62"/><path d="M56 300 C40 280 38 262 50 258 C54 272 56 284 56 300 C58 280 66 262 78 262 C76 280 66 292 56 300" fill="#6fbf73"/>`);
      if (decor.caixa) p.push(`<g id="memBox" style="cursor:pointer"><rect x="270" y="300" width="44" height="30" rx="4" fill="#f2a6be"/><rect x="266" y="294" width="52" height="10" rx="3" fill="#e46f9a"/><text x="292" y="321" text-anchor="middle" font-size="12" fill="#fff" font-weight="700">${opts.saved || 0}</text></g>`);
      if (nFlowers > 0) { p.push(`<path d="M20 352 L44 352 L40 380 L24 380 Z" fill="#9b87d6"/>`); for (let i = 0; i < Math.min(nFlowers, 4); i++) p.push(flower(24 + i * 6, 330 - (i % 2) * 8, fcolors[i % 6], i)); }
    } else {
      p.push(`<rect width="360" height="420" fill="url(#sky)"/>`);
      p.push(weather(0, 360, 10));
      if (env === 'floresta') {
        for (let i = 0; i < 6; i++) { const x = 20 + i * 64; p.push(`<rect x="${x - 5}" y="250" width="10" height="70" fill="#7a5537"/><path d="M${x - 34} 270 L${x} ${170 + (i % 2) * 20} L${x + 34} 270 Z" fill="${st.sad ? '#5f7f6a' : '#4f9a64'}"/>`); }
        p.push(`<path d="M0 320 Q180 295 360 320 L360 420 L0 420 Z" fill="${st.sad ? '#7fa58a' : '#86c98a'}"/>`);
      } else if (env === 'praia') {
        p.push(`<rect y="250" width="360" height="70" fill="#5fb3c9"/><path d="M0 300 Q180 280 360 300 L360 420 L0 420 Z" fill="#f3dcae"/>`);
      } else {
        p.push(`<path d="M0 300 Q90 270 180 292 Q270 270 360 300 L360 420 L0 420 Z" fill="${st.sad ? '#9cbf9f' : '#a8dba0'}"/>`);
        p.push(`<path d="M300 300 C300 260 330 240 345 250 C340 270 330 285 300 300" fill="#6fbf73"/>`);
      }
      if (decor.gatinho) p.push(`<g transform="translate(290 360)"><ellipse cx="0" cy="12" rx="20" ry="12" fill="#f2a65a"/><circle cx="-14" cy="0" r="10" fill="#f2a65a"/><path d="M-22 -6 L-20 -16 L-14 -8 Z M-10 -8 L-6 -16 L-4 -5 Z" fill="#f2a65a"/><circle cx="-17" cy="0" r="1.5" fill="${ink}"/><circle cx="-11" cy="0" r="1.5" fill="${ink}"/></g>`);
      for (let i = 0; i < nFlowers; i++) { const x = 20 + ((i * 53) % 320); const y = 330 + ((i * 29) % 60); if (Math.abs(x - 180) < 60 && y < 395) continue; p.push(flower(x, y, fcolors[i % 6], i)); }
    }
    if (env === 'quarto' && decor.gatinho) p.push(`<g transform="translate(110 375)"><ellipse cx="0" cy="12" rx="20" ry="12" fill="#f2a65a"/><circle cx="-14" cy="0" r="10" fill="#f2a65a"/><path d="M-22 -6 L-20 -16 L-14 -8 Z M-10 -8 L-6 -16 L-4 -5 Z" fill="#f2a65a"/></g>`);

    // ----- Personagem -----
    const eyesY = 216;
    let eyes = '', brows = '', mouth = '', extra = '';
    if (st.tired) {
      eyes = [160, 200].map(x => `<path d="M${x - 8} ${eyesY} Q${x} ${eyesY + 7} ${x + 8} ${eyesY} Z" fill="${ink}"/><line x1="${x - 9}" y1="${eyesY}" x2="${x + 9}" y2="${eyesY}" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M${x - 8} ${eyesY + 10} Q${x} ${eyesY + 15} ${x + 8} ${eyesY + 10}" stroke="#a487b8" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`).join('');
    } else if (st.happy) {
      eyes = [160, 200].map(x => `<path d="M${x - 8} ${eyesY + 3} Q${x} ${eyesY - 8} ${x + 8} ${eyesY + 3}" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`).join('');
    } else {
      eyes = [160, 200].map(x => `<ellipse cx="${x}" cy="${eyesY}" rx="6" ry="8" fill="${ink}"/><circle cx="${x + 2}" cy="${eyesY - 3}" r="2.2" fill="#fff"/>`).join('');
    }
    if (st.sad) brows = `<path d="M150 197 L167 191 M210 197 L193 191" stroke="${hair}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (st.happy) mouth = `<path d="M167 238 Q180 252 193 238 Z" fill="#c4466f"/>`;
    else if (st.sad) mouth = `<path d="M170 246 Q180 238 190 246" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    else mouth = `<path d="M171 240 Q180 246 189 240" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const blush = `<ellipse cx="146" cy="232" rx="9" ry="5" fill="#ff8fa8" opacity="${st.happy ? .55 : .25}"/><ellipse cx="214" cy="232" rx="9" ry="5" fill="#ff8fa8" opacity="${st.happy ? .55 : .25}"/>`;
    if (st.pain) extra += `<rect x="164" y="330" width="32" height="22" rx="7" fill="#ff9db5" stroke="#fff" stroke-width="2"/><path d="M180 346 l-6 -6 a3.5 3.5 0 0 1 6 -4 a3.5 3.5 0 0 1 6 4 z" fill="#fff"/>`;
    if (st.irregular) extra += `<g class="float"><circle cx="252" cy="140" r="11" fill="#fff6d8"/><circle cx="257" cy="136" r="9" fill="${env === 'quarto' ? '#fbe9ef' : s1}"/><text x="266" y="128" font-size="15" fill="#6c5a8a" font-weight="700">z</text><text x="276" y="116" font-size="11" fill="#6c5a8a" font-weight="700">z</text></g>`;
    const arms = st.happy && !st.tired
      ? `<path d="M138 312 Q110 290 104 262" stroke="${skin}" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M222 312 Q250 290 256 262" stroke="${skin}" stroke-width="15" fill="none" stroke-linecap="round"/>`
      : `<path d="M140 310 Q122 334 126 360" stroke="${skin}" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M220 310 Q238 334 234 360" stroke="${skin}" stroke-width="15" fill="none" stroke-linecap="round"/>`;

    p.push(`<ellipse cx="180" cy="398" rx="62" ry="8" fill="#000" opacity=".1"/>`);
    p.push(`<g class="char" id="charHit" style="--spd:${spd}s;cursor:pointer">
      ${arms}
      <path d="M128 396 Q130 300 180 292 Q230 300 232 396 Z" fill="${outfit}"/>
      <path d="M150 300 Q180 318 210 300" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>
      <rect x="170" y="262" width="20" height="34" fill="${skin}"/>
      <circle cx="180" cy="206" r="66" fill="${hair}"/>
      <circle cx="180" cy="140" r="24" fill="${hair}"/>
      <circle cx="180" cy="214" r="56" fill="${skin}"/>
      <path d="M124 206 Q126 152 180 150 Q234 152 236 206 Q214 176 186 180 Q160 170 124 206 Z" fill="${hair}"/>
      ${st.irregular ? `<path d="M150 152 q-6 -14 4 -20 M206 152 q8 -12 -2 -20" stroke="${hair}" stroke-width="4" fill="none"/>` : ''}
      ${blush}${brows}${eyes}${mouth}${extra}
    </g>`);
    if (opts.envelope) { const ex = env === 'quarto' ? 56 : 38, ey = env === 'quarto' ? 345 : 330;
      p.push(`<g id="envelope" class="float" style="cursor:pointer"><rect x="${ex}" y="${ey}" width="56" height="38" rx="5" fill="#fff" stroke="#e46f9a" stroke-width="2.5"/><path d="M${ex} ${ey + 2} L${ex + 28} ${ey + 24} L${ex + 56} ${ey + 2}" stroke="#e46f9a" stroke-width="2.5" fill="none"/><path d="M${ex + 28} ${ey + 34} l-6 -6 a3.5 3.5 0 0 1 6 -4 a3.5 3.5 0 0 1 6 4 z" fill="#e46f9a"/></g>`); }
    return `<svg viewBox="0 0 360 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sua personagem">${p.join('')}</svg>`;
  }

  // Mini personagem para prévia na configuração
  return { analyze, phrase, svg };
})();
