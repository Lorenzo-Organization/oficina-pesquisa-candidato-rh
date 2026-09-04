# Pesquisa de candidato organizada

## O que é este projeto

Uma tela simples para o RH da Stefani Transporte e Logística fazer a pesquisa
de candidato sempre do mesmo jeito e terminar com uma ficha pronta em PDF.

## Para quem

As 2 pessoas do RH que pesquisam cada candidato antes da contratação.
Hoje são cerca de 10 pesquisas por semana.

## O problema em uma frase

Antes de contratar, a gente pesquisa processos do candidato na mão, site por site,
e o resultado não fica registrado do mesmo jeito para todo candidato.

## O diagnóstico

A consulta é feita site por site, sem roteiro fixo. Cada pessoa faz de um jeito.
O resultado não fica guardado num formato único. Isso toma tempo e dificulta
mostrar ao gestor o que foi encontrado.

Um cuidado importante: no Brasil, recusar candidato só porque ele moveu processo
trabalhista pode ser considerado discriminação e gerar ação contra a empresa.
Por isso a ferramenta só organiza e registra a pesquisa. A decisão continua
com o RH e o jurídico.

## A solução: Ficha de pesquisa do candidato

**O que faz.** A pessoa digita nome e CPF numa tela e vê a lista de consultas que
precisa fazer, com o link de cada uma. Marca o que consultou, cola o resultado,
e a tela monta uma ficha em PDF no mesmo formato para todo candidato, com data e
quem pesquisou. Nada de decidir sozinha: a ficha só resume o que foi encontrado.

**O fluxo, passo a passo**

1. RH digita nome e CPF.
2. A tela lista as consultas do roteiro, com os links.
3. RH abre cada link, faz a consulta e cola o resultado na tela.
4. A tela resume o que foi colado em linguagem simples.
5. RH clica em "Gerar ficha em PDF" e salva a ficha na pasta do candidato.

**O que a ferramenta automatiza**

- Lembrar quais sites consultar.
- Montar a ficha no mesmo formato para todo candidato.
- Resumir o texto colado em linguagem simples.
- Registrar data e responsável pela pesquisa.

**O que continua manual**

- Abrir cada site e fazer a consulta.
- Decidir, junto com o jurídico, o que pesa.
- Guardar a ficha no processo seletivo.

**O ganho.** As 2 pessoas do RH fazem as 10 pesquisas por semana seguindo o mesmo
roteiro e terminam com a ficha pronta.

**Como usar amanhã.** Digita nome e CPF, segue a lista de links, cola os
resultados e salva a ficha. Pronto para mostrar ao gestor.

## As outras propostas

| Proposta | O que é | Esforço | Impacto |
|---|---|---|---|
| Ficha de pesquisa do candidato | Tela com checklist, campo para colar cada resultado e botão que gera a ficha em PDF. É a proposta principal e o que está nesta pasta. | 3 | 2 |
| Resumidor de processo | Cola o texto de uma consulta e recebe um resumo em 5 linhas: quem são as partes, o assunto e a situação. | 2 | 2 |
| Roteiro de pesquisa em uma página | Documento com passo a passo, links e o que pode ou não ser considerado, combinado com o jurídico. | 1 | 1 |

Esforço e impacto vão de 1 (menor) a 3 (maior).

## A entrega mínima de hoje

Uma tela com nome e CPF, o checklist das consultas com links, um campo para
colar o resultado de cada uma e um botão que gera a ficha em PDF.

Isso já está funcionando nesta pasta. O trabalho do grupo é conferir o roteiro,
ajustar o que está diferente da rotina real e melhorar o que der no tempo.

## Como rodar

1. Abra o arquivo `index.html` no navegador (Chrome ou Edge).
2. Se aparecer uma mensagem dizendo que a planilha não carregou, o navegador
   bloqueou a leitura do arquivo. Nesse caso, abra o terminal nesta pasta e rode:

```
npx serve .
```

3. Entre no endereço que aparecer no terminal (normalmente `http://localhost:3000`).

Para gerar o PDF, o botão abre a janela de impressão do navegador.
Escolha "Salvar como PDF" e guarde na pasta do candidato.

## Sobre os dados

A planilha `dados/exemplo.csv` é **fictícia**. Nomes, CPFs, placas e valores
foram inventados só para a tela funcionar. O grupo deve trocar pela planilha de
verdade quando for usar de fato.

Na oficina, **não use dados reais de candidatos**. Use nomes inventados.

O que a ferramenta guarda fica só no navegador deste computador. Nada é enviado
para fora, a não ser as consultas que o RH faz nos sites oficiais.

## O que a ferramenta ainda não faz

- O resumo do texto colado é simples: procura palavras como "nada consta",
  "arquivado", "em andamento" e números de processo. Um resumo mais inteligente,
  feito pelo Claude, é um próximo passo.
- A lista de sites é um ponto de partida. O RH e o jurídico precisam confirmar.

## Dados que o grupo precisa levantar

- A lista dos sites que o RH consulta hoje.
- O modelo de como o resultado é registrado hoje, se houver.
- A orientação do jurídico sobre o que pode ou não pesar na decisão.

## Como pedir para a IA

Copie e cole um destes pedidos no Claude Code. Troque o que estiver entre colchetes.

**Pedido 1: ajustar o roteiro**

> Na nossa rotina a gente consulta estes sites, nesta ordem: [lista dos sites].
> Troca a lista de consultas do app.js para ficar igual à nossa. Mantém o link
> de cada um e uma dica curta de como pesquisar.

**Pedido 2: ajustar a ficha**

> A ficha em PDF precisa ter também [o que falta, por exemplo: o nome da vaga,
> o nome do gestor que pediu a contratação, um campo de observações]. Coloca
> isso na ficha sem tirar o aviso de que ela não decide a contratação.

**Pedido 3: resumo melhor**

> Quando a gente cola o resultado de uma consulta, quero um resumo de até 5
> linhas dizendo: quem são as partes, qual é o assunto e qual é a situação do
> processo. Se não tiver nada, escreve só "Nada consta". Não pode dar opinião
> nem dizer se contrata ou não.
