'use strict';

// =====================================================================
// Ficha de pesquisa do candidato
// Stefani Transporte e Logística · RH
//
// O que este arquivo faz, na ordem:
//   1. Guarda o roteiro de consultas (nome, link e dica de cada site).
//   2. Lê a planilha dados/exemplo.csv.
//   3. Mostra os números do topo e a tabela de pesquisas.
//   4. Monta o checklist na tela.
//   5. Resume, de um jeito simples, o texto colado em cada consulta.
//   6. Salva a pesquisa no navegador (localStorage).
//   7. Monta a ficha e abre a janela de impressão ("Salvar como PDF").
//
// Tudo em JavaScript simples, sem biblioteca externa.
// =====================================================================


// ---------- 1. Roteiro de consultas ----------
// Confira esta lista com o RH e o jurídico.
// Para trocar um site, mude aqui o nome, o link (url) e a dica.

const ROTEIRO = [
  {
    nome: 'Receita Federal · situação do CPF',
    url: 'https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp',
    dica: 'Confirma se o CPF está regular. Precisa do CPF e da data de nascimento.'
  },
  {
    nome: 'TRT-15 · Justiça do Trabalho (interior de SP)',
    url: 'https://pje.trt15.jus.br/consultaprocessual/',
    dica: 'Pesquise pelo nome completo. Cole o resultado da lista, mesmo que esteja vazio.'
  },
  {
    nome: 'TRT-2 · Justiça do Trabalho (Grande São Paulo)',
    url: 'https://pje.trt2.jus.br/consultaprocessual/',
    dica: 'Pesquise pelo nome completo.'
  },
  {
    nome: 'TRT-3 · Justiça do Trabalho (Minas Gerais)',
    url: 'https://pje.trt3.jus.br/consultaprocessual/',
    dica: 'Pesquise pelo nome completo.'
  },
  {
    nome: 'TJSP · Justiça comum de São Paulo',
    url: 'https://esaj.tjsp.jus.br/cpopg/open.do',
    dica: 'Escolha "Nome da parte" e digite o nome completo.'
  },
  {
    nome: 'TJMG · Justiça comum de Minas Gerais',
    url: 'https://www.tjmg.jus.br/portal-tjmg/processos/andamento-processual/',
    dica: 'Escolha "Nome da parte" e digite o nome completo.'
  },
  {
    nome: 'SENATRAN · situação da CNH (só para motoristas)',
    url: 'https://portalservicos.senatran.serpro.gov.br/',
    dica: 'Confira validade, categoria e se o curso MOPP está em dia.'
  }
];

// Nome usado para guardar as pesquisas no navegador
const CHAVE_STORAGE = 'pesquisa-candidato-rh:fichas';


// ---------- 2. Estado da tela ----------

let pesquisasPlanilha = [];          // linhas lidas do CSV
let fichasSalvas = carregarFichas();  // pesquisas salvas neste navegador, por CPF
let cpfSelecionado = '';              // linha selecionada na tabela


// ---------- Atalhos ----------

function $(id) {
  return document.getElementById(id);
}

// Troca caracteres que quebrariam o HTML (segurança básica)
function escapar(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Deixa só os números do CPF
function somenteNumeros(texto) {
  return String(texto || '').replace(/\D/g, '');
}

// Coloca pontos e traço no CPF: 00000000000 vira 000.000.000-00
function formatarCpf(texto) {
  const n = somenteNumeros(texto).slice(0, 11);
  let saida = n;
  if (n.length > 9) {
    saida = n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6, 9) + '-' + n.slice(9);
  } else if (n.length > 6) {
    saida = n.slice(0, 3) + '.' + n.slice(3, 6) + '.' + n.slice(6);
  } else if (n.length > 3) {
    saida = n.slice(0, 3) + '.' + n.slice(3);
  }
  return saida;
}

// 2026-09-04 vira 04/09/2026
function formatarData(iso) {
  if (!iso) return '';
  const partes = iso.split('-');
  if (partes.length !== 3) return iso;
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

// Data de hoje no formato 2026-09-04
function hojeIso() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mes + '-' + dia;
}

// Mostra a faixa de aviso no topo. Passe texto vazio para esconder.
function mostrarAviso(html) {
  const caixa = $('aviso');
  if (!html) {
    caixa.classList.add('escondido');
    caixa.innerHTML = '';
    return;
  }
  caixa.innerHTML = html;
  caixa.classList.remove('escondido');
}


// ---------- 3. Planilha (CSV) ----------

// Transforma o texto do CSV numa lista de objetos.
// O separador é ponto e vírgula, igual ao Excel em português.
function lerCsv(texto) {
  const linhas = texto.trim().split(/\r?\n/);
  const cabecalho = linhas[0].split(';').map(function (c) { return c.trim(); });

  return linhas.slice(1)
    .filter(function (linha) { return linha.trim() !== ''; })
    .map(function (linha) {
      const partes = linha.split(';');
      const obj = {};
      cabecalho.forEach(function (coluna, i) {
        obj[coluna] = (partes[i] || '').trim();
      });
      return obj;
    });
}

// Busca o arquivo dados/exemplo.csv.
// Se o navegador bloquear (arquivo aberto com dois cliques), avisa.
async function carregarPlanilha() {
  try {
    const resposta = await fetch('dados/exemplo.csv');
    if (!resposta.ok) throw new Error('Resposta ' + resposta.status);
    const texto = await resposta.text();
    pesquisasPlanilha = lerCsv(texto);
  } catch (erro) {
    pesquisasPlanilha = [];
    mostrarAviso(
      '<strong>Não consegui ler a planilha dados/exemplo.csv.</strong> ' +
      'Se você abriu o arquivo com dois cliques, o navegador bloqueia a leitura. ' +
      'Abra o terminal nesta pasta, rode <code>npx serve .</code> e entre no endereço que aparecer ' +
      '(normalmente http://localhost:3000). A tela da pesquisa continua funcionando sem a planilha.'
    );
  }
}


// ---------- Lista combinada: planilha + o que foi salvo no navegador ----------

// Cada linha da tabela tem o mesmo formato, venha da planilha ou do navegador.
function registroDaPlanilha(linha) {
  return {
    cpf: linha.cpf,
    nome: linha.candidato,
    vaga: linha.vaga,
    cidade: linha.cidade + (linha.uf ? '/' + linha.uf : ''),
    responsavel: linha.responsavel,
    data: linha.data_pesquisa,
    feitas: Number(linha.consultas_feitas) || 0,
    total: Number(linha.total_consultas) || ROTEIRO.length,
    situacao: linha.situacao,
    resumo: linha.resumo,
    origem: 'planilha'
  };
}

function registroDaFicha(ficha) {
  return {
    cpf: ficha.cpf,
    nome: ficha.nome,
    vaga: ficha.vaga,
    cidade: ficha.cidade,
    responsavel: ficha.responsavel,
    data: ficha.data,
    feitas: ficha.consultas.filter(function (c) { return c.feita; }).length,
    total: ROTEIRO.length,
    situacao: ficha.situacao,
    resumo: ficha.resumo,
    origem: 'navegador'
  };
}

// Junta as duas fontes. Se o mesmo CPF estiver nas duas, vale o que foi salvo no navegador.
function listaCombinada() {
  const porCpf = {};

  pesquisasPlanilha.forEach(function (linha) {
    porCpf[somenteNumeros(linha.cpf)] = registroDaPlanilha(linha);
  });

  Object.keys(fichasSalvas).forEach(function (cpf) {
    porCpf[cpf] = registroDaFicha(fichasSalvas[cpf]);
  });

  // Mais recente primeiro
  return Object.values(porCpf).sort(function (a, b) {
    return (b.data || '').localeCompare(a.data || '');
  });
}


// ---------- Números do topo ----------

function atualizarNumeros(lista) {
  function contar(situacao) {
    return lista.filter(function (r) { return r.situacao === situacao; }).length;
  }
  $('num-total').textContent = lista.length;
  $('num-concluidas').textContent = contar('Ficha concluída');
  $('num-andamento').textContent = contar('Em andamento');
  $('num-juridico').textContent = contar('Aguardando jurídico');
}


// ---------- Tabela de pesquisas ----------

function classeDaSituacao(situacao) {
  if (situacao === 'Ficha concluída') return 'concluida';
  if (situacao === 'Aguardando jurídico') return 'juridico';
  return 'andamento';
}

function desenharTabela() {
  const lista = listaCombinada();
  atualizarNumeros(lista);

  const busca = $('busca').value.trim().toLowerCase();
  const buscaNumeros = somenteNumeros(busca);
  const filtro = $('filtro-situacao').value;

  const filtrada = lista.filter(function (r) {
    const bateNome = !busca || r.nome.toLowerCase().indexOf(busca) !== -1;
    const bateCpf = buscaNumeros.length > 0 && somenteNumeros(r.cpf).indexOf(buscaNumeros) !== -1;
    const bateSituacao = !filtro || r.situacao === filtro;
    return (bateNome || bateCpf) && bateSituacao;
  });

  const corpo = $('tabela-corpo');

  if (filtrada.length === 0) {
    corpo.innerHTML = '<tr><td colspan="6" class="vazio">Nenhuma pesquisa encontrada.</td></tr>';
    return;
  }

  corpo.innerHTML = filtrada.map(function (r) {
    const selecionada = somenteNumeros(r.cpf) === cpfSelecionado ? ' class="selecionada"' : '';
    return (
      '<tr data-cpf="' + escapar(somenteNumeros(r.cpf)) + '"' + selecionada + '>' +
        '<td>' + escapar(formatarData(r.data)) + '</td>' +
        '<td><strong>' + escapar(r.nome) + '</strong></td>' +
        '<td>' + escapar(r.vaga) + '</td>' +
        '<td>' + r.feitas + ' de ' + r.total + '</td>' +
        '<td><span class="etiqueta ' + classeDaSituacao(r.situacao) + '">' + escapar(r.situacao) + '</span></td>' +
        '<td>' + escapar(r.responsavel) + '</td>' +
      '</tr>'
    );
  }).join('');
}

// Clique numa linha: abre a pesquisa daquele candidato na tela
function abrirPesquisa(cpf) {
  cpfSelecionado = cpf;

  const ficha = fichasSalvas[cpf];
  if (ficha) {
    // Tem tudo salvo no navegador: preenche a tela inteira
    preencherFormulario(ficha);
    mostrarAviso('');
  } else {
    // Só está na planilha: preenche os dados básicos e deixa o checklist vazio
    const linha = pesquisasPlanilha.find(function (l) { return somenteNumeros(l.cpf) === cpf; });
    if (!linha) return;
    const r = registroDaPlanilha(linha);
    preencherFormulario({
      nome: r.nome,
      cpf: r.cpf,
      vaga: r.vaga,
      cidade: r.cidade,
      responsavel: r.responsavel,
      consultas: []
    });
    mostrarAviso(
      '<strong>' + escapar(r.nome) + '</strong> veio da planilha. Resumo registrado: "' + escapar(r.resumo) + '". ' +
      'As consultas ainda não estão nesta tela. Se quiser refazer a pesquisa, marque e cole aqui.'
    );
  }

  desenharTabela();
}


// ---------- 4. Checklist (roteiro na tela) ----------

function montarChecklist() {
  const lista = $('checklist');

  lista.innerHTML = ROTEIRO.map(function (item, i) {
    return (
      '<li class="item" data-i="' + i + '">' +
        '<div class="item-cabeca">' +
          '<label class="marca-check">' +
            '<input type="checkbox" class="check" data-i="' + i + '">' +
            '<span>' + (i + 1) + '. ' + escapar(item.nome) + '</span>' +
          '</label>' +
          '<a href="' + escapar(item.url) + '" target="_blank" rel="noopener">Abrir site</a>' +
        '</div>' +
        '<p class="dica">' + escapar(item.dica) + '</p>' +
        '<textarea class="texto" data-i="' + i + '" rows="2" placeholder="Cole aqui o resultado da consulta"></textarea>' +
        '<p class="resumo" data-i="' + i + '"></p>' +
      '</li>'
    );
  }).join('');

  atualizarProgresso();
}

// Conta quantas consultas estão marcadas e mostra "3 de 7 feitas"
function atualizarProgresso() {
  const checks = document.querySelectorAll('.check');
  let feitas = 0;
  checks.forEach(function (c) {
    if (c.checked) feitas++;
    c.closest('.item').classList.toggle('feita', c.checked);
  });
  $('progresso').textContent = feitas + ' de ' + ROTEIRO.length + ' feitas';
}


// ---------- 5. Resumo simples do texto colado ----------
//
// Isto NÃO é o Claude. É uma leitura simples por palavras-chave, para a
// pessoa enxergar rápido se apareceu alguma coisa. A leitura de verdade e a
// decisão continuam com o RH e o jurídico.

function resumirTexto(texto) {
  const t = String(texto || '').trim();
  if (!t) return { frase: '', achouAlgo: false };

  const baixo = t.toLowerCase();

  // Frases que os sites mostram quando não há nada
  const sinaisDeNada = [
    'nada consta', 'nenhum registro', 'nenhum processo', 'nenhum resultado',
    'não foram encontrados', 'nao foram encontrados', 'não há registros', 'nao ha registros',
    'não foi encontrado', 'nao foi encontrado', 'situação cadastral: regular', 'situacao cadastral: regular',
    'cpf regular'
  ];

  // Número de processo no padrão da Justiça: 0000000-00.0000.0.00.0000
  const numerosProcesso = t.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g) || [];

  const pistas = [];
  if (numerosProcesso.length > 0) pistas.push(numerosProcesso.length + ' número(s) de processo');
  if (baixo.indexOf('trabalhista') !== -1) pistas.push('assunto trabalhista');
  if (baixo.indexOf('reclamante') !== -1) pistas.push('aparece "reclamante"');
  if (baixo.indexOf('reclamad') !== -1) pistas.push('aparece "reclamada"');
  if (baixo.indexOf('arquivad') !== -1) pistas.push('aparece "arquivado"');
  if (baixo.indexOf('em andamento') !== -1 || baixo.indexOf('tramita') !== -1) pistas.push('aparece "em andamento"');
  if (baixo.indexOf('acordo') !== -1) pistas.push('aparece "acordo"');
  if (baixo.indexOf('suspens') !== -1 || baixo.indexOf('cassad') !== -1) pistas.push('aparece "suspensa" ou "cassada"');
  if (baixo.indexOf('vencid') !== -1) pistas.push('aparece "vencida"');

  const temSinalDeNada = sinaisDeNada.some(function (s) { return baixo.indexOf(s) !== -1; });

  if (temSinalDeNada && numerosProcesso.length === 0) {
    return { frase: 'Nada consta nesta consulta.', achouAlgo: false };
  }

  if (pistas.length === 0) {
    const palavras = t.split(/\s+/).length;
    return {
      frase: 'Texto colado com ' + palavras + ' palavras. Nada de destaque foi reconhecido. Leia o texto.',
      achouAlgo: false
    };
  }

  return {
    frase: 'Encontrado: ' + pistas.join(', ') + '. Leia o texto e leve ao jurídico.',
    achouAlgo: true
  };
}

// Atualiza o resumo embaixo de uma consulta
function atualizarResumo(i) {
  const textarea = document.querySelector('.texto[data-i="' + i + '"]');
  const caixa = document.querySelector('.resumo[data-i="' + i + '"]');
  const resultado = resumirTexto(textarea.value);

  caixa.textContent = resultado.frase;
  caixa.classList.remove('achou', 'limpo');
  if (resultado.achouAlgo) caixa.classList.add('achou');
  if (resultado.frase === 'Nada consta nesta consulta.') caixa.classList.add('limpo');
}


// ---------- Ler e preencher o formulário ----------

// Junta tudo que está na tela num objeto "ficha"
function lerFormulario() {
  const consultas = ROTEIRO.map(function (item, i) {
    const feita = document.querySelector('.check[data-i="' + i + '"]').checked;
    const texto = document.querySelector('.texto[data-i="' + i + '"]').value.trim();
    const resumo = resumirTexto(texto);
    return {
      nome: item.nome,
      url: item.url,
      feita: feita,
      texto: texto,
      resumo: resumo.frase,
      achouAlgo: resumo.achouAlgo
    };
  });

  return {
    nome: $('nome').value.trim(),
    cpf: formatarCpf($('cpf').value),
    vaga: $('vaga').value,
    cidade: $('cidade').value.trim(),
    responsavel: $('responsavel').value.trim(),
    consultas: consultas
  };
}

// Coloca uma ficha salva de volta na tela
function preencherFormulario(ficha) {
  $('nome').value = ficha.nome || '';
  $('cpf').value = formatarCpf(ficha.cpf || '');
  $('cidade').value = ficha.cidade || '';
  $('responsavel').value = ficha.responsavel || '';

  // Se a vaga não está na lista, escolhe "Outra"
  const select = $('vaga');
  const existe = Array.from(select.options).some(function (o) { return o.value === ficha.vaga; });
  select.value = existe ? ficha.vaga : 'Outra';

  ROTEIRO.forEach(function (item, i) {
    const consulta = (ficha.consultas || [])[i] || {};
    document.querySelector('.check[data-i="' + i + '"]').checked = !!consulta.feita;
    document.querySelector('.texto[data-i="' + i + '"]').value = consulta.texto || '';
    atualizarResumo(i);
  });

  atualizarProgresso();
}

function limparTela() {
  cpfSelecionado = '';
  preencherFormulario({ consultas: [] });
  $('vaga').selectedIndex = 0;
  mostrarAviso('');
  desenharTabela();
  $('nome').focus();
}


// ---------- 6. Salvar no navegador ----------

function carregarFichas() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || {};
  } catch (erro) {
    return {};
  }
}

function guardarFichas() {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(fichasSalvas));
}

// Confere os campos obrigatórios. Devolve o texto do erro ou vazio se está tudo certo.
function validar(ficha) {
  if (!ficha.nome) return 'Digite o nome do candidato.';
  if (somenteNumeros(ficha.cpf).length !== 11) return 'Digite o CPF completo, com 11 números.';
  if (!ficha.responsavel) return 'Digite quem está fazendo a pesquisa.';
  return '';
}

// Define a situação da pesquisa e um resumo geral, a partir das consultas
function calcularSituacao(ficha) {
  const feitas = ficha.consultas.filter(function (c) { return c.feita; }).length;
  const comAchado = ficha.consultas.filter(function (c) { return c.feita && c.achouAlgo; });

  if (feitas < ROTEIRO.length) {
    ficha.situacao = 'Em andamento';
    ficha.resumo = 'Faltam ' + (ROTEIRO.length - feitas) + ' consulta(s)';
  } else if (comAchado.length > 0) {
    ficha.situacao = 'Aguardando jurídico';
    ficha.resumo = 'Há registros para o jurídico avaliar em: ' +
      comAchado.map(function (c) { return c.nome.split(' · ')[0]; }).join(', ');
  } else {
    ficha.situacao = 'Ficha concluída';
    ficha.resumo = 'Nada consta em todas as consultas';
  }
}

// Salva a pesquisa. Se "imprimir" for true, também gera a ficha em PDF.
function salvarFicha(imprimir) {
  const ficha = lerFormulario();

  const erro = validar(ficha);
  if (erro) {
    mostrarAviso('<strong>' + erro + '</strong>');
    return;
  }

  ficha.data = hojeIso();
  calcularSituacao(ficha);

  const cpf = somenteNumeros(ficha.cpf);
  fichasSalvas[cpf] = ficha;
  guardarFichas();

  cpfSelecionado = cpf;
  desenharTabela();

  if (imprimir) {
    montarFicha(ficha);
    mostrarAviso(
      'Ficha pronta. Na janela de impressão escolha <strong>"Salvar como PDF"</strong> e guarde na pasta do candidato.'
    );
    window.print();
  } else {
    mostrarAviso('Pesquisa de <strong>' + escapar(ficha.nome) + '</strong> salva neste navegador. Situação: ' + escapar(ficha.situacao) + '.');
  }
}


// ---------- 7. Ficha para o PDF ----------

// Monta o HTML da ficha. Ela fica escondida na tela e aparece só na impressão.
function montarFicha(ficha) {
  const feitas = ficha.consultas.filter(function (c) { return c.feita; }).length;

  const linhasConsultas = ficha.consultas.map(function (c, i) {
    return (
      '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + escapar(c.nome) + '</td>' +
        '<td>' + (c.feita ? 'Sim' : 'Não') + '</td>' +
        '<td>' + escapar(c.resumo || (c.feita ? 'Sem texto colado' : '')) + '</td>' +
        '<td class="ficha-texto">' + escapar(c.texto ? c.texto.slice(0, 600) : '') + (c.texto && c.texto.length > 600 ? ' (...)' : '') + '</td>' +
      '</tr>'
    );
  }).join('');

  $('ficha').innerHTML =
    '<div class="ficha-cabeca">' +
      '<h1>Ficha de pesquisa do candidato</h1>' +
      '<p>Stefani Transporte e Logística · Recursos Humanos</p>' +
    '</div>' +

    '<table class="ficha-dados">' +
      '<tr><th>Candidato</th><td>' + escapar(ficha.nome) + '</td><th>CPF</th><td>' + escapar(ficha.cpf) + '</td></tr>' +
      '<tr><th>Vaga</th><td>' + escapar(ficha.vaga) + '</td><th>Cidade</th><td>' + escapar(ficha.cidade) + '</td></tr>' +
      '<tr><th>Data da pesquisa</th><td>' + escapar(formatarData(ficha.data)) + '</td><th>Quem pesquisou</th><td>' + escapar(ficha.responsavel) + '</td></tr>' +
      '<tr><th>Consultas feitas</th><td>' + feitas + ' de ' + ROTEIRO.length + '</td><th>Situação</th><td>' + escapar(ficha.situacao) + '</td></tr>' +
      '<tr><th>Resumo geral</th><td colspan="3">' + escapar(ficha.resumo) + '</td></tr>' +
    '</table>' +

    '<table class="ficha-consultas">' +
      '<thead><tr><th>#</th><th>Consulta</th><th>Feita?</th><th>Resumo</th><th>Texto colado (início)</th></tr></thead>' +
      '<tbody>' + linhasConsultas + '</tbody>' +
    '</table>' +

    '<p class="ficha-aviso">' +
      'Esta ficha só registra o que foi encontrado nas consultas listadas. Ela não é parecer e não decide a contratação. ' +
      'A avaliação é do RH junto com o jurídico. Ter movido processo trabalhista, por si só, não pode ser motivo de recusa.' +
    '</p>' +

    '<p class="ficha-rodape">Ficha gerada em ' + escapar(formatarData(hojeIso())) + ' pela Ficha de pesquisa do candidato. O resumo de cada consulta é automático e simples; leia sempre o texto original.</p>';
}


// ---------- Ligações da tela (eventos) ----------

function ligarEventos() {
  // CPF ganha pontos e traço enquanto digita
  $('cpf').addEventListener('input', function () {
    this.value = formatarCpf(this.value);
  });

  // Checkbox marcada: atualiza o contador
  $('checklist').addEventListener('change', function (evento) {
    if (evento.target.classList.contains('check')) atualizarProgresso();
  });

  // Texto colado: mostra o resumo e marca a consulta como feita
  $('checklist').addEventListener('input', function (evento) {
    if (!evento.target.classList.contains('texto')) return;
    const i = evento.target.dataset.i;
    atualizarResumo(i);
    if (evento.target.value.trim() !== '') {
      document.querySelector('.check[data-i="' + i + '"]').checked = true;
      atualizarProgresso();
    }
  });

  // Botões de copiar nome e CPF, para colar nos sites
  $('copiar-nome').addEventListener('click', function () { copiar($('nome').value.trim(), 'Nome copiado.'); });
  $('copiar-cpf').addEventListener('click', function () { copiar($('cpf').value.trim(), 'CPF copiado.'); });

  // Botões de ação
  $('btn-salvar').addEventListener('click', function () { salvarFicha(false); });
  $('btn-ficha').addEventListener('click', function () { salvarFicha(true); });
  $('btn-limpar').addEventListener('click', limparTela);

  // Busca e filtro da tabela
  $('busca').addEventListener('input', desenharTabela);
  $('filtro-situacao').addEventListener('change', desenharTabela);

  // Clique numa linha da tabela
  $('tabela-corpo').addEventListener('click', function (evento) {
    const linha = evento.target.closest('tr[data-cpf]');
    if (linha) abrirPesquisa(linha.dataset.cpf);
  });
}

// Copia um texto para a área de transferência
function copiar(texto, mensagem) {
  if (!texto) {
    mostrarAviso('<strong>Preencha o campo antes de copiar.</strong>');
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(function () { mostrarAviso(mensagem); });
  } else {
    mostrarAviso('Copie à mão: <strong>' + escapar(texto) + '</strong>');
  }
}


// ---------- Início ----------

async function iniciar() {
  montarChecklist();
  ligarEventos();
  await carregarPlanilha();
  desenharTabela();
  $('nome').focus();
}

iniciar();
