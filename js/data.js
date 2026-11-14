// Conteúdo fixo da versão de teste (mensagens de exemplo, novelinhas, conteúdos).
window.DATA = {
  categories: {
    cansaco: 'Cansaço', desanimo: 'Desânimo', autoestima: 'Autoestima baixa',
    tristeza: 'Tristeza', motivacao: 'Motivação', apoio: 'Apoio geral'
  },
  catColors: {
    cansaco: '#9b87d6', desanimo: '#5fb3c9', autoestima: '#f2a65a',
    tristeza: '#7aa6e0', motivacao: '#f6c945', apoio: '#e46f9a'
  },

  // Mensagens de exemplo (simulam a comunidade durante os testes)
  seedLetters: [
    { id: 's1', cat: 'cansaco', text: 'Ei, você que está cansada: descansar também é cuidar de si. Não precisa dar conta de tudo hoje. Um passo de cada vez já é muito.' },
    { id: 's2', cat: 'cansaco', text: 'Sei como é acordar já sem energia. Hoje, tente fazer só o essencial e ser gentil com você. Amanhã é um novo dia.' },
    { id: 's3', cat: 'cansaco', text: 'Seu corpo está pedindo pausa, e ouvir isso é sabedoria, não fraqueza. Um abraço de alguém que também passa por isso.' },
    { id: 's4', cat: 'desanimo', text: 'Tem dias que tudo parece pesado. Mas você já atravessou dias difíceis antes e chegou até aqui. Estou torcendo por você.' },
    { id: 's5', cat: 'desanimo', text: 'Mesmo que hoje pareça cinza, você não está sozinha. Tem muita mulher do outro lado da tela pensando em você.' },
    { id: 's6', cat: 'desanimo', text: 'Pequenas coisas contam: um café quente, uma música, uma janela aberta. Que você encontre uma delas hoje.' },
    { id: 's7', cat: 'autoestima', text: 'Você é muito mais do que o espelho mostra num dia ruim. Sua história, sua força e seu jeito são únicos.' },
    { id: 's8', cat: 'autoestima', text: 'Fale com você como falaria com sua melhor amiga. Você merece esse carinho também.' },
    { id: 's9', cat: 'autoestima', text: 'Cada fase da vida tem sua beleza. A sua está aí, mesmo quando você não consegue enxergar.' },
    { id: 's10', cat: 'tristeza', text: 'Tudo bem não estar bem. Chorar alivia, conversar ajuda. Se puder, procure alguém de confiança hoje.' },
    { id: 's11', cat: 'tristeza', text: 'Mando daqui um abraço apertado. A tristeza não é para sempre, e você merece ser cuidada.' },
    { id: 's12', cat: 'motivacao', text: 'Você está fazendo mais do que imagina. Só de cuidar de si já é um ato de coragem.' },
    { id: 's13', cat: 'motivacao', text: 'Comemore as pequenas vitórias: beber água, sair da cama, pedir ajuda. Tudo conta!' },
    { id: 's14', cat: 'apoio', text: 'Não sei quem você é, mas desejo que hoje alguém sorria para você. E que você sorria de volta.' },
    { id: 's15', cat: 'apoio', text: 'Você importa. Simples assim. Que seu dia tenha um pouquinho mais de leveza.' },
    { id: 's16', cat: 'apoio', text: 'Uma mulher ajudando a outra: é assim que a gente segue. Conte comigo, mesmo de longe.' }
  ],

  symptoms: {
    ciclo: ['Cólica', 'Inchaço', 'Dor de cabeça', 'Seios sensíveis', 'Acne', 'Vontade de doce', 'Irritabilidade'],
    climaterio: ['Ondas de calor', 'Suor noturno', 'Insônia', 'Irritabilidade', 'Ressecamento', 'Dor nas articulações', 'Névoa mental', 'Palpitações']
  },
  selfcare: ['💧 Água', '🚶‍♀️ Caminhada', '🧘‍♀️ Alongamento', '🌬️ Respiração', '📖 Leitura', '🛁 Banho relaxante', '🥗 Boa alimentação', '👭 Tempo com amigas'],

  looks: {
    skin: ['#f6d3b8', '#e8b48f', '#c98c62', '#9b6340', '#6e4228'],
    hair: ['#2b1d16', '#5b3a29', '#a0612f', '#d9a95b', '#b8b0ad', '#7b3f6e'],
    outfit: ['#e46f9a', '#9b87d6', '#5fb3c9', '#7cc49a'],
    outfitPremium: ['#f2a65a', '#3b2f3a', '#d4af37']
  },

  environments: [
    { id: 'quarto', name: '🛏️ Quarto', need: 0 },
    { id: 'jardim', name: '🌼 Jardim', need: 0 },
    { id: 'floresta', name: '🌲 Floresta', need: 7 },
    { id: 'praia', name: '🏖️ Praia', premium: true }
  ],
  decor: [
    { id: 'planta', name: 'Plantinha', need: 1 },
    { id: 'luminaria', name: 'Luminária', need: 3 },
    { id: 'quadro', name: 'Quadro', need: 5 },
    { id: 'tapete', name: 'Tapete', need: 8 },
    { id: 'caixa', name: 'Caixa de lembranças', need: 10 },
    { id: 'gatinho', name: 'Gatinho', premium: true }
  ],

  series: [
    {
      id: 'acacias', title: 'Recomeço na Rua das Acácias',
      desc: 'Aos 48 anos, Helena decide abrir a padaria que sempre sonhou.',
      colors: ['#f6a57c', '#e46f9a'],
      episodes: [
        { title: 'A placa de aluga-se', scenes: [
          { who: 'Narradora', text: 'Helena tem 48 anos, dois filhos crescidos e uma pasta cheia de receitas da avó.' },
          { who: 'Helena', text: '“Todo dia eu passo por essa loja vazia. E todo dia ela parece me chamar.”' },
          { who: 'Marta, a vizinha', text: '“Você ainda fala dessa padaria? Então liga logo pro número da placa, mulher!”' },
          { who: 'Narradora', text: 'Com as mãos tremendo, Helena pega o telefone.' },
          { who: '', text: 'Continua…' } ] },
        { title: 'O primeiro não', scenes: [
          { who: 'Gerente do banco', text: '“Infelizmente, o empréstimo não foi aprovado, dona Helena.”' },
          { who: 'Narradora', text: 'Ela sai do banco segurando o choro até a esquina.' },
          { who: 'Bia, a filha', text: '“Mãe, e se a gente começar vendendo pela internet? Eu cuido das fotos.”' },
          { who: 'Helena', text: '“Pela internet? Pão de queijo da vovó… no celular?”' },
          { who: '', text: 'Continua…' } ] },
        { title: 'Fogo no forno', scenes: [
          { who: 'Narradora', text: 'Primeira fornada de encomendas. A cozinha está quente. Helena também.' },
          { who: 'Helena', text: '“Marta, é o forno ou sou eu? Essa onda de calor veio na pior hora!”' },
          { who: 'Marta', text: '“Respira, abre a janela e senta um minuto. Eu tiro a forma.”' },
          { who: 'Narradora', text: 'No fim da tarde, as 40 encomendas estão entregues. E a primeira avaliação diz: “Gosto de infância”.' },
          { who: '', text: 'Continua…' } ] },
        { title: 'Quem diria', scenes: [
          { who: 'Roberto, o ex-marido', text: '“Padaria, Helena? Na sua idade? Isso não vai dar certo.”' },
          { who: 'Narradora', text: 'Por um segundo, ela ouve a voz que a fez desistir tantas vezes.' },
          { who: 'Helena', text: '“Roberto, eu não te perguntei. Mas pode levar um pão de queijo, é por conta da casa.”' },
          { who: 'Narradora', text: 'Ele vai embora mastigando. E calado.' },
          { who: '', text: 'Continua…' } ] },
        { title: 'Portas abertas', scenes: [
          { who: 'Narradora', text: 'Seis meses depois, a placa de aluga-se virou uma placa nova: “Padaria da Vó Ditinha”.' },
          { who: 'Bia', text: '“Mãe, olha a fila! Tem gente até a esquina!”' },
          { who: 'Helena', text: '“Vó, a sua receita deu certo. E eu também.”' },
          { who: '', text: 'Fim da 1ª temporada 💛' } ] }
      ]
    },
    {
      id: 'lia', title: 'Cartas para Lia',
      desc: 'Lia, 27, começa a receber cartas anônimas que mudam a sua semana.',
      colors: ['#9b87d6', '#5fb3c9'],
      episodes: [
        { title: 'Segunda-feira cinza', scenes: [
          { who: 'Narradora', text: 'Lia chega do trabalho exausta pela quinta noite seguida.' },
          { who: 'Lia', text: '“Eu não aguento mais fingir que está tudo bem.”' },
          { who: 'Narradora', text: 'Debaixo da porta, um envelope sem remetente.' },
          { who: 'A carta', text: '“Você não precisa ser perfeita para ser incrível.”' },
          { who: '', text: 'Continua…' } ] },
        { title: 'A caligrafia', scenes: [
          { who: 'Narradora', text: 'Na semana seguinte, mais duas cartas. A mesma letra redonda e caprichada.' },
          { who: 'Lia', text: '“Quem no prédio ainda escreve à mão?”' },
          { who: 'Rafa, o porteiro', text: '“Eu não vi ninguém. Mas a dona Célia, do 302, vive comprando envelope…”' },
          { who: '', text: 'Continua…' } ] },
        { title: 'Dona Célia', scenes: [
          { who: 'Narradora', text: 'Lia bate no 302. Uma senhora de 72 anos abre a porta com um sorriso.' },
          { who: 'Dona Célia', text: '“Eu vi você chorando no elevador. Na minha idade, a gente aprende que uma palavra boa muda um dia.”' },
          { who: 'Lia', text: '“A senhora não imagina o quanto mudou o meu.”' },
          { who: 'Narradora', text: 'Elas tomam café até tarde. Lia não se sentia ouvida assim fazia meses.' },
          { who: '', text: 'Continua…' } ] },
        { title: 'A resposta', scenes: [
          { who: 'Narradora', text: 'Lia decide fazer duas coisas difíceis no mesmo dia.' },
          { who: 'Lia', text: '“Chefe, eu preciso conversar sobre a minha carga de trabalho.”' },
          { who: 'Narradora', text: 'À noite, ela escreve sua primeira carta. Para a moça nova do 105, que vive de olhos baixos.' },
          { who: '', text: 'Continua…' } ] },
        { title: 'Corrente do bem', scenes: [
          { who: 'Narradora', text: 'É aniversário da dona Célia. O hall do prédio amanhece cheio de envelopes.' },
          { who: 'Dona Célia', text: '“Tudo isso… pra mim?”' },
          { who: 'Lia', text: '“Foi a senhora que começou. A gente só continuou.”' },
          { who: '', text: 'Fim da 1ª temporada 💜' } ] }
      ]
    }
  ],

  contents: [
    { id: 'c1', tag: 'Climatério', title: 'O que é o climatério?', body: [
      'O climatério é a fase de transição entre o período reprodutivo e o não reprodutivo da mulher. Costuma começar por volta dos 40 anos e pode durar vários anos.',
      'A menopausa é a última menstruação. Ela só é confirmada depois de 12 meses seguidos sem menstruar.',
      'Sinais comuns: mudanças no ciclo, ondas de calor, alterações no sono e no humor, ressecamento vaginal e menor disposição. Cada mulher vive essa fase de um jeito.',
      'Existem cuidados e tratamentos que podem ajudar bastante. Converse com sua ginecologista e leve o relatório do app para a consulta.' ] },
    { id: 'c2', tag: 'Climatério', title: 'Ondas de calor: cuidados do dia a dia', body: [
      'Roupas em camadas, ambientes ventilados e água por perto ajudam a atravessar os momentos de calor.',
      'Algumas mulheres percebem gatilhos como bebida alcoólica, cafeína, comidas muito apimentadas e estresse. Registrar no diário ajuda a descobrir os seus.',
      'Se as ondas de calor atrapalham o sono ou a rotina, procure sua médica: há opções de tratamento que precisam de avaliação individual.' ] },
    { id: 'c3', tag: 'Ciclo', title: 'Cólica: quando procurar atendimento', body: [
      'Cólica leve a moderada durante a menstruação é comum. Calor local, movimento leve e descanso costumam aliviar.',
      'Procure uma profissional se a dor impede suas atividades, piora com o passar dos meses, aparece fora da menstruação ou na relação sexual.',
      'Também é sinal de atenção um sangramento muito intenso (precisar trocar o absorvente a cada uma ou duas horas) ou dor acompanhada de febre.' ] },
    { id: 'c4', tag: 'Sono', title: 'Sono: pequenos hábitos que ajudam', body: [
      'Tente dormir e acordar em horários parecidos, inclusive no fim de semana.',
      'Diminua telas e luz forte perto da hora de dormir e evite cafeína no fim da tarde.',
      'Quarto escuro, silencioso e fresco faz diferença, principalmente para quem tem suor noturno.',
      'Se a dificuldade para dormir dura semanas e afeta seu dia, vale procurar ajuda profissional.' ] },
    { id: 'c5', tag: 'Ciclo', title: 'Conhecendo as fases do ciclo', body: [
      'O ciclo começa no primeiro dia da menstruação e passa pelas fases menstrual, folicular, ovulação e lútea.',
      'Em adultas, ciclos entre 21 e 35 dias costumam ser considerados dentro do esperado, e pequenas variações de um mês para outro são normais.',
      'Energia, humor e apetite podem mudar ao longo das fases. Registrar no diário ajuda a entender o seu padrão.' ] },
    { id: 'c6', tag: 'Emocional', title: 'Saúde emocional também é saúde', body: [
      'Oscilações de humor podem ter relação com hormônios, sono, sobrecarga e estresse. Você não está exagerando.',
      'Fique atenta se a tristeza ou a falta de interesse estiverem presentes na maior parte dos dias por mais de duas semanas.',
      'Psicólogas e médicas podem ajudar. Se precisar conversar agora, o CVV atende de graça pelo 188, 24 horas.' ] },
    { id: 'c7', tag: 'Atenção', title: 'Quando procurar atendimento com urgência', body: [
      'Dor no peito, falta de ar, sangramento muito intenso com tontura, dor abdominal forte e repentina ou febre alta com dor pélvica pedem atendimento imediato.',
      'Em emergência, ligue para o SAMU (192) ou vá ao pronto-atendimento mais próximo.',
      'Se estiver pensando em se machucar, procure ajuda agora: CVV 188 ou SAMU 192.' ] },
    { id: 'c8', tag: 'Prevenção', title: 'Exames preventivos', body: [
      'O preventivo (Papanicolau) e a mamografia são exames importantes de rastreamento.',
      'A idade e a frequência recomendadas variam e foram atualizadas recentemente. Combine com sua médica o que é indicado para você.',
      'Pressão, glicemia, colesterol e densitometria óssea também podem fazer parte do acompanhamento, conforme sua idade e histórico.' ] }
  ]
};
