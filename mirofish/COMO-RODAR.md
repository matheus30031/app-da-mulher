# Como rodar a simulação no MiroFish

O MiroFish (https://github.com/666ghj/MiroFish) cria milhares de "pessoas virtuais" a partir de um material-semente e simula como elas reagem. No fim, gera um relatório de previsão e permite conversar com os agentes.

> Os resultados são uma **simulação**, não uma pesquisa com pessoas reais. O projeto não publica taxa de acerto. Use como um ensaio para gerar hipóteses e depois valide com usuárias de verdade.

## O que você precisa

- Um **computador** (não roda no celular) com **Docker Desktop** instalado.
- Uma **chave de IA no formato OpenAI** (o projeto recomenda Qwen-plus, da Alibaba; também funciona com outros provedores compatíveis).
- Uma **chave da Zep Cloud** (https://www.getzep.com), com cota grátis mensal.

## Passo a passo

1. Baixe o projeto: `git clone https://github.com/666ghj/MiroFish.git` e entre na pasta.
2. Copie `.env.example` para `.env` e preencha as chaves de IA e da Zep.
3. Rode `docker compose up -d`.
4. Abra `http://localhost:3000` no navegador.
5. Envie o arquivo **semente-app-da-mulher.md** como material-semente.
6. Cole uma das perguntas de **requisitos-de-previsao.md**, começando pela nº 1.
7. Use poucas rodadas no início (menos de 40) para controlar o custo.
8. Ao final, leia o relatório e converse com os agentes (ex.: "Cláudia, por que você não pagaria o premium?").

## Depois da simulação

Traga o relatório para o Claude para transformar os achados em mudanças no app e em perguntas para testes com usuárias reais.
