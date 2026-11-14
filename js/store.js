// Armazenamento local (fase de testes): tudo fica salvo só neste aparelho.
const Store = (() => {
  const KEY = 'appdamulher_v1';
  let mem = null;
  const def = () => ({
    profile: null,          // {name, phase, look:{skin,hair,outfit}}
    entries: {},            // 'AAAA-MM-DD' -> registro do dia
    periods: [],            // datas de início da menstruação
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
