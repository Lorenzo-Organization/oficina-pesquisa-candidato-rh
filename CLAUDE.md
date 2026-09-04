# Ficha de pesquisa do candidato

## O que é e para quem

Tela para o RH da Stefani Transporte e Logística pesquisar candidato sempre no
mesmo roteiro e sair com uma ficha em PDF igual para todos. Usada pelas 2 pessoas
do RH que fazem a pesquisa antes de cada contratação. Quem usa não é de tecnologia.

## Como rodar

Abrir `index.html` no navegador. Se a planilha não carregar, rodar `npx serve .`
nesta pasta e abrir o endereço que aparecer. Não precisa instalar nada.

## Onde ficam as coisas

- `index.html`: a tela.
- `estilo.css`: cores e tamanhos.
- `app.js`: o roteiro de consultas (lista `ROTEIRO` no topo), a leitura da
  planilha, o resumo simples e a montagem da ficha.
- `dados/exemplo.csv`: planilha fictícia. Trocar pela real.
- `TAREFAS.md`: o que fazer nos 60 minutos.
- `DIARIO.md`: o que foi feito em cada sessão.

## O que nunca mexer

- A ficha nunca dá parecer, nota ou "aprovado/reprovado". Ela só registra o que
  foi encontrado. A decisão é do RH com o jurídico.
- O aviso no rodapé da ficha ("esta ficha não decide a contratação") fica sempre.
- Ter movido processo trabalhista, sozinho, nunca vira motivo de recusa no app.
- CPF e nome de candidato só vão para os sites oficiais de consulta. Nunca para
  outro serviço.
- Não usar dados reais de candidato nos exemplos.
- A lista de sites do roteiro só muda com o RH e o jurídico de acordo.
- **O grupo deve preencher aqui** o que só a empresa sabe: quais consultas são
  obrigatórias por vaga, o que o jurídico disse que pode ou não pesar, e onde
  a ficha é guardada.

## Como a gente fala

- Laranja da marca: `#FF8A1F`.
- Textos em português, simples, sem jargão.
- Chamamos de "entrega", nunca de "pedido".
- Tela legível de longe: letras grandes, poucos elementos, cabe em 1280 por 720.
