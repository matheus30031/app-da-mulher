// Armazenamento local (fase de testes): tudo fica salvo só neste aparelho.
const Store = (() => {
  const KEY = 'appdamulher_v1';
  let mem = null;
  const def = () => ({
    profile: null,          // {name, phase, look:{skin,hair,outfit}}
    entries: {},            // 'AAAA-MM-DD' -> registro do dia
    periodDays: [],         // dias em que houve menstruação
    env: 'quarto',
    letters: [],            // cartas recebidas
    lastLetterDate: null,
    sent: [],               // mensagens enviadas em "Ajude o Próximo"
    garden: [],             // flores do Jardim de Carinho
    strikes: { count: 0, suspendedUntil: 0, blocked: false, log: [] },
    unlocked: {},           // episódios liberados  'serie:n' -> true
    seasons: {},            // temporadas compradas
    watched: {},            // 'serie:n' -> true
    aiEpisodes: {},         // episódios extras gerados com IA
    credits: 3,
    premium: false,
    purchases: [],
    settings: { apiKey: '', model: 'claude-sonnet-5-5', letters: true, ai: true }
  });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const d = def();
      mem = raw ? Object.assign(d, JSON.parse(raw)) : d;
      mem.settings = Object.assign(def().settings, mem.settings || {});
      mem.strikes = Object.assign(def().strikes, mem.strikes || {});
      if (mem.periods && mem.periods.length && !mem.periodDays.length) { // migração da versão 0.1
        const pad = n => String(n).padStart(2, '0'); const now = new Date();
        mem.periods.forEach(p => { for (let i = 0; i < 5; i++) { const d = new Date(p + 'T12:00:00'); d.setDate(d.getDate() + i); if (d <= now) mem.periodDays.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`); } });
        mem.periodDays = [...new Set(mem.periodDays)].sort(); delete mem.periods;
      }
    } catch (e) { mem = def(); }
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
  return {
    get() { return mem || load(); },
    save,
    reset() { mem = def(); save(); },
    exportJSON() { const c = JSON.parse(JSON.stringify(this.get())); c.settings.apiKey = c.settings.apiKey ? '(oculta)' : ''; return JSON.stringify(c, null, 2); }
  };
})();
