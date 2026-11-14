// Integração com a IA (Claude) + alternativas locais quando não há chave ou internet.
// IMPORTANTE: a chave fica salva só neste aparelho e nunca vai para o repositório.
const AI = (() => {
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function enabled() { const s = Store.get().settings; return !!(s.ai && s.apiKey); }

  async function call(system, user, maxTokens = 700) {
    const s = Store.get().settings;
    if (!s.apiKey) throw new Error('sem-chave');
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': s.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: s.model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] })
    });
    if (!r.ok) { const t = await r.text(); throw new Error('Erro ' + r.status + ': ' + t.slice(0, 160)); }
    const j = await r.json();
    return (j.content || []).map(c => c.text || '').join('').trim();
  }

  function parseJSON(txt) {
    const a = txt.indexOf('{'), b = txt.lastIndexOf('}');
    const c = txt.indexOf('['), d = txt.lastIndexOf(']');
    if (c !== -1 && (a === -1 || c < a)) return JSON.parse(txt.slice(c, d + 1));
    return JSON.parse(txt.slice(a, b + 1));
  }

  // ---------- Moderação ----------
  const MOD_SYSTEM = `Você é o moderador de mensagens anônimas de apoio entre mulheres em um app de saúde e autocuidado.
Analise a mensagem e responda SOMENTE com JSON neste formato:
{"decisao":"aprovar|rejeitar|revisao","gravidade":"nenhuma|leve|grave","motivos":["..."],"orientacao":"frase curta e gentil para a remetente","risco_remetente":false}
Regras:
- Rejeite: linguagem ofensiva, assédio, discriminação, ameaças, conteúdo perigoso, manipulação emocional, conselhos médicos (remédios, doses, tratamentos, dietas), dados pessoais (telefone, e-mail, redes sociais, endereço, links), propaganda/spam, ou mensagem que não combina com a categoria.
- "grave" = ameaça, assédio, discriminação ou conteúdo perigoso. Erros pequenos são "leve".
- Use "revisao" quando houver dúvida real.
- Se a própria remetente parecer estar em sofrimento intenso ou risco, use risco_remetente=true, decisao="revisao" e gravidade="nenhuma" (ela não deve ser punida).
- Mensagens gentis, respeitosas e genéricas devem ser aprovadas.`;

  async function moderate(text, cat) {
    const out = await call(MOD_SYSTEM, `Categoria escolhida: ${DATA.categories[cat]}\nMensagem: """${text}"""`, 400);
    const j = parseJSON(out);
    return {
      decision: { aprovar: 'approve', rejeitar: 'reject', revisao: 'review' }[j.decisao] || 'review',
      severity: { nenhuma: 'none', leve: 'light', grave: 'severe' }[j.gravidade] || 'none',
      reasons: j.motivos || [], orientation: j.orientacao || '', risk: !!j.risco_remetente, via: 'IA'
    };
  }

  function localModerate(text, cat) {
    const t = norm(text);
    const reasons = []; let severity = 'none'; let risk = false;
    const has = list => list.some(w => t.includes(w));
    const crise = ['quero morrer', 'me matar', 'nao aguento mais viver', 'acabar com tudo', 'tirar minha vida', 'sumir pra sempre', 'sumir para sempre'];
    const ameaca = ['vou te matar', 'te matar', 'se mata', 'mate-se', 'vou te pegar', 'acabar com voce', 'vou te achar'];
    const ofensa = ['idiota', 'burra', 'imbecil', 'otaria', 'vagabunda', 'puta', 'merda', 'nojenta', 'vadia', 'retardada', 'cala a boca', 'escrota', 'vaca', 'gorda feia', 'ridicula'];
    const discrim = ['macaca', 'sapatao', 'viado', 'favelada', 'velha inutil'];
    const medico = ['tome ', 'tomar remedio', 'pare de tomar', ' mg', 'dose', 'antidepressivo', 'anticoncepcional', 'hormonio', 'remedio caseiro', 'cha de ', 'suplemento', 'dieta', 'jejum'];
    const manip = ['se voce nao', 'so eu entendo voce', 'ninguem mais vai', 'voce me deve', 'sua obrigacao', 'a culpa e sua'];
    if (has(crise)) { risk = true; }
    if (has(ameaca)) { reasons.push('Ameaça ou conteúdo perigoso'); severity = 'severe'; }
    if (has(discrim)) { reasons.push('Discriminação'); severity = 'severe'; }
    if (has(ofensa)) { reasons.push('Linguagem ofensiva'); if (severity !== 'severe') severity = 'light'; }
    if (has(medico)) { reasons.push('Parece conter conselho médico'); if (severity === 'none') severity = 'light'; }
    if (has(manip)) { reasons.push('Possível manipulação emocional'); if (severity === 'none') severity = 'light'; }
    if (/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/.test(text) || /[\w.-]+@[\w-]+\.\w+/.test(text) || /@\w{3,}/.test(text)) { reasons.push('Contém dados pessoais ou contato'); if (severity === 'none') severity = 'light'; }
    if (/(https?:\/\/|www\.|\.com\b|\.br\b)/i.test(text)) { reasons.push('Links não são permitidos'); if (severity === 'none') severity = 'light'; }
    const letters = text.replace(/[^A-Za-zÀ-ú]/g, '');
    if (letters.length > 15 && letters.replace(/[^A-ZÀ-Ý]/g, '').length / letters.length > 0.6) { reasons.push('Excesso de letras maiúsculas (parece spam)'); if (severity === 'none') severity = 'light'; }
    if (/(.)\1{5,}/.test(text)) { reasons.push('Texto repetitivo'); if (severity === 'none') severity = 'light'; }
    if (text.trim().length < 20) { reasons.push('Mensagem muito curta'); if (severity === 'none') severity = 'light'; }

    if (risk && severity === 'none') return { decision: 'review', severity: 'none', reasons: ['Encaminhada para revisão com cuidado'], orientation: 'Percebemos que você pode estar passando por um momento difícil. Você também merece apoio.', risk, via: 'regras locais' };
    if (severity === 'none') return { decision: 'approve', severity, reasons: [], orientation: 'Obrigada por espalhar carinho!', risk, via: 'regras locais' };
    return { decision: 'reject', severity, reasons, orientation: 'Mensagens de apoio devem ser gentis, sem dados pessoais, links ou orientações médicas.', risk, via: 'regras locais' };
  }

  // ---------- Resumo dos registros ----------
  const SUM_SYSTEM = `Você ajuda uma mulher a entender os próprios registros de autocuidado em um app.
Escreva em português do Brasil, em tom acolhedor, com no máximo 130 palavras.
Descreva tendências de sono, energia, humor, dor e sintomas de forma apenas descritiva.
Não faça diagnósticos, não cite remédios nem tratamentos.
Termine sugerindo levar o relatório a uma profissional de saúde se algo persistir ou preocupar.`;

  async function summarize(entries) {
    const data = entries.map(e => ({ data: e.date, sono: e.sleep, energia: e.energy, humor: e.mood, dor: e.pain, menstruacao: e.flow, sintomas: e.symptoms, autocuidado: e.selfcare }));
    return call(SUM_SYSTEM, 'Escalas: sono/energia/humor de 1 (pior) a 5 (melhor); dor de 0 (nenhuma) a 3 (forte).\nRegistros:\n' + JSON.stringify(data), 500);
  }

  function localSummary(entries) {
    if (!entries.length) return 'Ainda não há registros suficientes.';
    const avg = k => (entries.reduce((s, e) => s + (e[k] || 0), 0) / entries.length);
    const word = v => v >= 4 ? 'boa' : v >= 3 ? 'média' : 'mais baixa';
    const freq = {};
    entries.forEach(e => (e.symptoms || []).forEach(s => freq[s] = (freq[s] || 0) + 1));
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0].toLowerCase());
    let txt = `Nos últimos ${entries.length} registros, seu sono ficou em média ${word(avg('sleep'))} (${avg('sleep').toFixed(1)}/5), a energia ${word(avg('energy'))} (${avg('energy').toFixed(1)}/5) e o humor ${word(avg('mood'))} (${avg('mood').toFixed(1)}/5).`;
    if (top.length) txt += ` Os sintomas mais registrados foram: ${top.join(', ')}.`;
    txt += ' Se algo persistir ou preocupar você, leve o relatório para uma profissional de saúde.';
    return txt;
  }

  // ---------- Episódio extra de novelinha ----------
  async function episode(serie, done) {
    const prev = serie.episodes.map((e, i) => `Ep ${i + 1} - ${e.title}: ` + e.scenes.map(s => (s.who ? s.who + ': ' : '') + s.text).join(' ')).join('\n');
    const extra = (done || []).map((e, i) => `Extra ${i + 1} - ${e.title}: ` + e.scenes.map(s => s.text).join(' ')).join('\n');
    const out = await call(
      'Você escreve novelinhas originais, curtas e verticais para um app feminino brasileiro. Personagens próprios, linguagem simples, emocionante e respeitosa, sem conteúdo sexual ou violento. Responda SOMENTE com JSON.',
      `Série: ${serie.title}\nResumo dos episódios:\n${prev}\n${extra}\n\nEscreva o próximo episódio com 5 cenas curtas (máx. 30 palavras cada), terminando com gancho.\nFormato: {"title":"...","scenes":[{"who":"Nome ou Narradora","text":"..."}]}`,
      900);
    const j = parseJSON(out);
    if (!j.scenes || !j.scenes.length) throw new Error('Resposta inválida');
    j.scenes.push({ who: '', text: 'Continua…' });
    return j;
  }

  async function test() { return call('Responda apenas: ok', 'teste', 10); }

  return { enabled, moderate, localModerate, summarize, localSummary, episode, test, norm };
})();
