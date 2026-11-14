# Simulação no estilo MiroFish feita pelo Claude (sem o motor do MiroFish).
# Cada agente foi gerado e "jogado" pelo Claude a partir do material-semente, em 3 rodadas:
#   R1 anúncio do lançamento · R2 duas semanas de uso + posts de influenciadoras · R3 preços revelados + debate de privacidade
# Este script só consolida as decisões dos agentes e gera o relatório.
import json, collections

# campos: nome, idade, cidade, grupo, renda, baixa(R1), usa_2sem(R2), sent_r1, sent_r3, premium, episodio, favorita, ressalva, fala
A = [
 # Público B — 20 a 40
 ("Mariana",27,"São Paulo","B","média","sim","sim",2,1,"9,90","não","personagem","privacidade dos dados","A bonequinha com olheiras sou eu na segunda-feira 😂 Só quero saber onde ficam meus dados."),
 ("Bruna",22,"Porto Alegre","B","baixa","sim","sim",2,2,"não","sim","novelinhas","preço dos episódios","Viciei em Cartas para Lia. R$1,90 por episódio pesa pra estudante, mas comprei um."),
 ("Juliana",34,"Recife","B","média","sim","sim",1,2,"9,90","não","cartas de apoio","tempo","Recebi uma carta num dia horrível e chorei no ônibus. Registrar em 30s funciona pra mim."),
 ("Tainá",29,"Manaus","B","baixa","sim","não",1,0,"não","não","ciclo","app pesado/internet","Bonito, mas eu já uso outro app de ciclo e não vi motivo pra trocar."),
 ("Camila",31,"Curitiba","B","alta","sim","sim",2,1,"14,90","sim","personagem","IA em saúde","Paguei pelos cenários. Só não quero que a IA leia meu humor e me venda remédio."),
 ("Letícia",25,"Fortaleza","B","média","talvez","sim",0,1,"não","sim","novelinhas","não entendeu de cara","Baixei pela novelinha que vi no TikTok, fiquei pela personagem."),
 ("Priscila",38,"Goiânia","B","média","sim","sim",1,1,"9,90","não","diário rápido","julgamento da personagem","No 3º dia de chuva no cenário me senti meio julgada. Depois entendi que é só reflexo."),
 ("Aline",24,"Belém","B","baixa","talvez","não",0,-1,"não","não","—","monetização emocional","App de saúde vendendo novela? Achei estranho misturar."),
 ("Rafaela",33,"Rio de Janeiro","B","alta","sim","sim",2,2,"19,90","sim","Jardim de Carinho","nenhuma forte","Meu jardim já tem 9 flores. Escrever pra outras mulheres me faz bem."),
 ("Natália",28,"Florianópolis","B","média","sim","sim",1,0,"não","não","ciclo","previsão de fertilidade","Anel do ciclo lindo. Mas quero mais controle de quando o app me manda carta."),
 ("Gabriela",36,"Brasília","B","alta","sim","sim",1,1,"9,90","não","relatório p/ consulta","privacidade","Levei o relatório pra ginecologista, ela gostou. Premium só se o relatório completo for bom."),
 ("Daniela",21,"Salvador","B","baixa","sim","sim",2,1,"não","sim","personagem","preço","É meu Pou da vida adulta. Não pago assinatura, mas compro roupinha se for barato."),
 # Público A — 40 a 55
 ("Cláudia",49,"Salvador","A","média","sim","sim",2,2,"9,90","não","diário do climatério","assinatura","Finalmente um app que pergunta de onda de calor. Pagaria R$9,90, mais que isso não."),
 ("Rose",53,"Belo Horizonte","A","baixa","talvez","sim",0,1,"não","sim","novelinhas","dificuldade com app","Minha filha instalou. A novela da padaria é a minha cara. O resto ainda tô aprendendo."),
 ("Sandra",47,"Campinas","A","alta","sim","sim",1,2,"14,90","não","relatório p/ consulta","conteúdo médico confiável","Os gráficos de sono e ondas de calor ajudaram na consulta. Quero ver médicas de verdade nos vídeos."),
 ("Márcia",52,"Porto Alegre","A","média","não","não",-1,-1,"não","não","—","infantil","Bonequinha não é pra mim. Quero informação séria sobre menopausa."),
 ("Lúcia",45,"Recife","A","média","sim","sim",1,1,"não","não","cartas de apoio","privacidade","As cartas me emocionaram. Mas fiquei pensando: quem lê o que eu escrevo?"),
 ("Vera",55,"São Paulo","A","alta","sim","sim",1,2,"19,90","sim","conteúdos com médicas","letra pequena","Assinei. Precisa de letra maior e de mais conteúdo sobre sono."),
 ("Kátia",44,"Natal","A","baixa","sim","não",1,0,"não","não","ciclo irregular","previsões erradas","Meu ciclo está doido. As previsões não batem e isso me irritou."),
 ("Eliane",50,"Cuiabá","A","média","sim","sim",2,1,"9,90","não","personagem","nenhuma forte","Achei que era coisa de menina, mas me peguei cuidando dela todo dia."),
 ("Silvana",48,"Vitória","A","média","talvez","sim",0,1,"não","não","Ajude o Próximo","medo de golpe","Desconfiei de 'mensagem de desconhecida'. Depois vi que é moderado e anônimo."),
 ("Regina",51,"Teresina","A","baixa","sim","sim",1,1,"não","sim","novelinhas","preço","Assisto as grátis no almoço. Comprar só se a história prender muito."),
 # Profissionais, influenciadoras, especialistas, imprensa, marcas
 ("Dra. Patrícia",45,"São Paulo","prof","alta","sim","sim",1,1,"—","—","relatório p/ consulta","fertilidade estimada","Relatório ajuda a consulta. Previsão de fertilidade precisa de aviso forte e não pode virar contracepção."),
 ("Dra. Helena",52,"Rio de Janeiro","prof","alta","sim","sim",1,1,"—","—","diário do climatério","conteúdo sem revisão","Bom ver o climatério com espaço. Conteúdo tem que ter revisão médica antes do lançamento."),
 ("Psic. Renata",39,"Belo Horizonte","prof","alta","sim","sim",1,0,"—","—","cartas de apoio","dependência emocional","As cartas acolhem, mas é preciso cuidar de quem está em crise e evitar dependência do app."),
 ("Luana",31,"São Paulo","infl","alta","sim","sim",2,0,"—","—","personagem","risco de imagem (dados)","Divulgaria fácil, é muito 'compartilhável'. Mas só fecho parceria com política de privacidade clara."),
 ("Carol Menopausa",50,"Curitiba","infl","média","sim","sim",2,2,"—","—","diário do climatério","nenhuma forte","Meu público vive pedindo isso. Vou fazer vídeo mostrando o diário de calores."),
 ("Fernanda (LGPD)",40,"Brasília","esp","alta","sim","sim",-1,-1,"—","—","—","consentimento e IA","Dados de saúde são sensíveis. Quero ver relatório de impacto, consentimento separado e onde roda a IA."),
 ("Jornalista Tec",35,"São Paulo","imp","média","sim","sim",1,0,"—","—","personagem","IA lendo humor","Pauta boa: 'o Pou do autocuidado'. O gancho crítico é privacidade e IA."),
 ("Marca (higiene íntima)",42,"São Paulo","marca","alta","sim","sim",2,1,"—","—","Jardim de Carinho","regras de publicidade","Interesse em patrocinar cenários e temporadas, sem usar dados de saúde."),
]

K = ["nome","idade","cidade","grupo","renda","baixa","usa","s1","s3","premium","episodio","favorita","ressalva","fala"]
ag = [dict(zip(K, a)) for a in A]
users = [a for a in ag if a["grupo"] in ("A","B")]

def pct(n, d): return f"{round(100*n/d)}%"
def stats(grp):
    g = [a for a in users if a["grupo"] in grp]
    n = len(g)
    return {
      "n": n,
      "baixa": pct(sum(a["baixa"]=="sim" for a in g), n),
      "talvez": pct(sum(a["baixa"]=="talvez" for a in g), n),
      "usa": pct(sum(a["usa"]=="sim" for a in g), n),
      "premium": pct(sum(a["premium"] not in ("não","—") for a in g), n),
      "ep": pct(sum(a["episodio"]=="sim" for a in g), n),
      "s1": round(sum(a["s1"] for a in g)/n, 2), "s3": round(sum(a["s3"] for a in g)/n, 2),
    }
tot, sa, sb = stats("AB"), stats("A"), stats("B")
prem = collections.Counter(a["premium"] for a in users if a["premium"] not in ("não","—"))
fav = collections.Counter(a["favorita"] for a in ag if a["favorita"] != "—")
res = collections.Counter(a["ressalva"] for a in ag if a["ressalva"] not in ("nenhuma forte",))

out = {"total": tot, "A": sa, "B": sb, "premium": prem.most_common(), "favoritas": fav.most_common(), "ressalvas": res.most_common()}
print(json.dumps(out, ensure_ascii=False, indent=1))
json.dump({"agentes": ag, "resumo": out}, open(__file__.replace(".py", "_dados.json"), "w"), ensure_ascii=False, indent=1)
