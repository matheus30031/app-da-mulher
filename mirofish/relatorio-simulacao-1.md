# Relatório da simulação 1 — Reação ao lançamento do App da Mulher

**Pergunta simulada:** nº 1 de `requisitos-de-previsao.md` (reação geral ao lançamento)
**Método:** simulação no estilo MiroFish **feita pelo Claude**, sem o motor do MiroFish. Foram 30 agentes gerados a partir de `semente-app-da-mulher.md`: 22 usuárias potenciais (12 de 20–40 anos e 10 de 40–55 anos) e 8 atores do ecossistema (2 ginecologistas, 1 psicóloga, 2 influenciadoras, 1 especialista em LGPD, 1 jornalista e 1 marca). Cada agente passou por 3 rodadas:
1. anúncio do lançamento;
2. duas semanas de uso e posts das influenciadoras;
3. revelação dos preços e debate público sobre privacidade.

Dados de cada agente: `simulacao_claude_dados.json`. Consolidação: `simulacao_claude.py`.

> ⚠️ **Leia como ensaio, não como pesquisa.** São 30 personagens imaginados por uma IA, não pessoas reais. Simulações com IA tendem a ser **otimistas**, principalmente sobre intenção de pagar. Use os números para comparar grupos e prioridades, não como previsão de mercado.

---

## Resultado em uma frase

O app gera **curiosidade alta e vínculo real**: a personagem cria vínculo com quem tem 20–40 anos e o diário do climatério com quem tem 40–55. A barreira número 1 é a **confiança em privacidade e IA**, e não as funções.

## Números da simulação (22 usuárias)

| | Total | 20–40 anos | 40–55 anos |
|---|---:|---:|---:|
| Baixaria no lançamento | 77% | 83% | 70% |
| "Talvez" | 18% | 17% | 20% |
| Ainda usando após 2 semanas | 82% | 83% | 80% |
| Diz que pagaria premium* | 45% | 50% | 40% |
| Compraria episódio de novelinha* | 36% | 42% | 30% |
| Sentimento no lançamento (−2 a +2) | +1,05 | +1,25 | +0,80 |
| Sentimento após preços e privacidade | +0,95 | +0,92 | +1,00 |

\* Intenção declarada por agentes simulados. Na vida real, a conversão em apps gratuitos costuma ser bem menor. O dado útil aqui é a faixa de preço: **6 de 10** que pagariam escolheram **R$ 9,90**.

**Leitura:** o público mais jovem chega mais animado e esfria quando os preços e a privacidade entram em pauta. O público de 40–55 chega mais desconfiado e **melhora com o uso**, puxado pelo diário do climatério e pelo relatório para consulta.

## O que mais encantou

1. **Personagem** (6 agentes): é a função mais compartilhável, comparada a um "Pou da vida adulta". Viraliza bem no TikTok e no Instagram.
2. **Novelinhas** (4): servem de porta de entrada. Algumas usuárias baixaram pela novela e ficaram pela personagem. Fazem muito sucesso com o público 50+.
3. **Cartas de apoio, Jardim e Ajude o Próximo** (6 somados): geram o momento mais emocional da simulação ("chorei no ônibus").
4. **Diário do climatério** (3) e **relatório para consulta** (3): são o diferencial para 40–55 e o que convence as médicas.

## Principais ressalvas (agrupadas)

| Tema | Agentes | Exemplos |
|---|---:|---|
| Privacidade e IA | 7 | "Quem lê o que eu escrevo?", "Não quero que a IA leia meu humor e me venda remédio", pedido de relatório de impacto (LGPD) |
| Preço e monetização | 5 | R$ 1,90 pesa para estudante; "app de saúde vendendo novela?" |
| Credibilidade médica e previsões | 5 | Fertilidade estimada exige aviso forte; previsões erram em ciclo irregular; conteúdo precisa de revisão médica |
| Usabilidade por idade | 5 | Letra pequena; dificuldade para quem usa pouco app; "bonequinha é infantil" |
| Cuidado emocional | 3 | Sentir-se julgada pela chuva no cenário; dependência emocional; medo de golpe nas mensagens |

## Como cada ator se posicionou

- **Ginecologistas:** aprovam o relatório e o espaço para o climatério. Exigem revisão médica dos conteúdos e aviso forte de que a previsão de fertilidade não serve como contracepção.
- **Psicóloga:** vê valor no acolhimento, mas pede um protocolo para usuárias em crise e cuidado com dependência emocional.
- **Influenciadoras:** a de menopausa divulga espontaneamente. A de autocuidado só fecha parceria com uma política de privacidade clara.
- **Especialista em LGPD:** é a voz mais crítica. Pede consentimento separado para dados de saúde e para IA, transparência sobre onde a IA roda e relatório de impacto.
- **Jornalista:** a pauta positiva é "o Pou do autocuidado". O gancho crítico é privacidade e IA.
- **Marca:** quer patrocinar cenários e temporadas, sem acesso a dados de saúde.

## As 3 mudanças mais importantes antes do lançamento

1. **Privacidade visível desde o primeiro minuto:** uma tela simples "Seus dados, suas regras", consentimento separado para saúde, IA e cartas, e um selo "nunca vendemos seus dados". Publicar o relatório de impacto (LGPD).
2. **Dois "jeitos" de app:**
   - Modo personagem, lúdico, para quem quer;
   - Modo discreto, com informação séria, letra maior e personagem opcional, para quem acha infantil.
   - O diário do climatério e o relatório entram em destaque para 40–55.
3. **Monetização separada da saúde:**
   - Todo o essencial de saúde fica sempre grátis;
   - Premium testado a R$ 9,90;
   - Novelinhas com mais episódios grátis ou desbloqueio por participação (ex.: escrever cartas);
   - Personagem sem "chuva de julgamento": explicar na primeira vez que o cenário só reflete os registros.

## Próximas simulações sugeridas

- **Nº 2 (disposição para pagar):** comparar R$ 9,90 x R$ 14,90 e desbloqueio por participação.
- **Nº 5 (privacidade):** testar quais mensagens e compromissos mais aumentam a confiança.
- Repetir no **MiroFish de verdade** e comparar com esta simulação.
- Validar com **10 a 20 mulheres reais** usando o link de teste.
