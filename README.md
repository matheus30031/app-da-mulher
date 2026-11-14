# App da Mulher — versão de teste 0.1

App de saúde e autocuidado feminino com personagem virtual, comunidade anônima de apoio, novelinhas e conteúdos educativos.

Esta é a **versão de testes**: roda no navegador do celular, sem servidor e sem banco de dados. Todos os dados ficam salvos **só no aparelho**.

## O que já funciona

| Área | O que tem |
|---|---|
| **Início / Personagem** | Personagem que muda de expressão, movimento e cenário conforme os registros dos últimos 7 dias (cansaço, humor, dor, sono irregular). Pode estar cansada e feliz ao mesmo tempo. Ambientes (quarto, jardim, floresta, praia premium), decorações liberadas por participação e conquistas sem punição. |
| **Registro rápido (30s)** | Sono, energia, humor e dor em toques. Opcional: menstruação, sintomas (ciclo e climatério), autocuidado e anotação. |
| **Minha Saúde** | Ciclo com previsão, gráficos de 14 dias, sintomas mais frequentes, resumo com IA (ou local), histórico e relatório para consulta (imprimir/PDF). |
| **Ajude o Próximo** | Mensagens anônimas com moderação por IA (ou regras locais), limite diário, reincidência (orientação → advertência → suspensão → bloqueio), casos graves, contestação e painel de revisão humana simulado. |
| **Jardim de Carinho** | Cada mensagem entregue vira uma flor; árvores aparecem com 10 e 20 flores. |
| **Minhas Cartas** | Cartas de apoio chegam quando há dias difíceis (se autorizado). Guardar, filtrar por categoria e excluir. |
| **Novelinhas** | 2 séries originais em formato vertical (stories). 2 episódios grátis; créditos, temporada e premium **simulados**. Geração de episódio extra com IA. |
| **Conteúdos e Cuidados** | 8 conteúdos provisórios (aguardando revisão de profissionais de saúde) e contatos de ajuda (CVV 188, SAMU 192, Ligue 180). |
| **Perfil** | Personalização, premium simulado, privacidade, exportar/apagar dados e configuração da IA. |

## Como testar

**Opção 1 — Codespaces (grátis, sem publicar):** no GitHub, toque em **Code → Codespaces → Create codespace**. O app abre na porta 8080.

**Opção 2 — no computador:** baixe o projeto e rode `python3 -m http.server 8080` na pasta. Acesse `http://localhost:8080`.

## IA

A IA (Claude) é opcional. Em **Perfil → IA**, cole a chave da API da Anthropic. Ela fica salva **apenas no aparelho** e nunca deve ser colocada no código ou no repositório.

> ⚠️ Chamar a API direto do navegador serve só para testes. Na versão real, a IA precisa passar por um servidor próprio para proteger a chave.

Sem chave, o app usa regras locais para moderação e resumos.

## Estrutura

```
index.html            página única do app
css/style.css         visual
js/data.js            conteúdo fixo (cartas de exemplo, séries, conteúdos)
js/store.js           salvamento local
js/ai.js              IA + alternativas locais
js/character.js       desenho e lógica da personagem
js/app.js             telas e navegação
```

## Próximos passos (depois dos testes)

- Validar com usuárias reais (uso diário, retenção, interesse em pagar)
- Revisão dos conteúdos por profissionais de saúde
- Servidor + banco de dados com segurança e LGPD
- Comunidade real entre usuárias e moderação no servidor
- Pagamentos reais e publicação nas lojas
