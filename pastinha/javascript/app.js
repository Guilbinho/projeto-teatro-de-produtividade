/* =====================================================================
   PARTE II — Recursos copilotados com IA (Claude)
   Teatro de Produtividade
   1) Dados e contrato de dados   2) Tema claro/escuro (localStorage)
   3) Gráficos Chart.js           4) Teste interativo
   Auditoria e refatorações: ver AUDITORIA_IA.md
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- 1. DADOS (contrato documentado no README) ---------- */
  const DADOS = {
    // Fonte: BambooHR (2024), citada pela Forbes Brasil (21/06/2024). Amostra: EUA.
    taticas: [
      { rotulo: 'Andar pelo escritório para serem vistos', grupo: 'Presencial', valor: 37 },
      { rotulo: 'Marcar reuniões entre quem está no escritório', grupo: 'Presencial', valor: 35 },
      { rotulo: 'Chegar antes ou sair depois do gerente', grupo: 'Presencial', valor: 33 },
      { rotulo: 'Conversar socialmente no chat do trabalho', grupo: 'Remoto', valor: 39 },
      { rotulo: 'Agendar o envio de e-mails', grupo: 'Remoto', valor: 31 },
      { rotulo: 'Manter o status "ativo" sem trabalhar', grupo: 'Remoto', valor: 64 }
    ],
    // Em um turno de 8h, 76% é trabalho efetivo (~2h sem trabalhar).
    turno: { trabalho: 76, semTrabalho: 24 }
  };

  const PERGUNTAS = [
    { texto: 'Você já deixou o app de mensagens do trabalho com status "ativo" mesmo sem estar trabalhando?',
      ref: 'Na pesquisa, 64% dos profissionais remotos admitem isso (BambooHR).' },
    { texto: 'Você já chegou mais cedo ou saiu mais tarde que seu gerente só para ser visto?',
      ref: 'Na pesquisa, 33% dos profissionais presenciais fazem isso (BambooHR).' },
    { texto: 'Você já marcou ou aceitou uma reunião mais para ser visto do que por necessidade?',
      ref: 'Na pesquisa, 35% dos profissionais presenciais fazem isso (BambooHR).' },
    { texto: 'Você já agendou o envio de e-mails para parecer online em outro horário?',
      ref: 'Na pesquisa, 31% dos profissionais remotos fazem isso (BambooHR).' },
    { texto: 'Você já entrou em conversas sociais no chat do trabalho só para marcar presença?',
      ref: 'Na pesquisa, 39% dos profissionais remotos fazem isso (BambooHR).' },
    { texto: 'Você já respondeu rápido aos colegas ou deixou a tela ligada só para mostrar que estava presente?',
      ref: 'Na pesquisa, 75% dos funcionários admitem isso (Visier).' }
  ];

  const FAIXAS = [
    { max: 1, titulo: 'Bastidores',
      texto: 'Você parece manter o foco em entregas e não em aparência. Isso protege seu tempo de trabalho profundo.',
      dicas: ['Continue medindo seu dia por entregas, não por horas online.',
              'Se você lidera pessoas, compartilhe essa postura: metas claras reduzem a necessidade de "aparecer".'] },
    { max: 4, titulo: 'Em cena de vez em quando',
      texto: 'Você usa algumas táticas de visibilidade, como boa parte dos profissionais da pesquisa. Não é incomum, mas vale observar quanto tempo isso consome.',
      dicas: ['Escolha uma tática para abandonar esta semana (por exemplo, o status sempre verde).',
              'Combine com sua equipe horários de foco sem interrupções.',
              'Registre suas entregas da semana para mostrar resultado em vez de presença.'] },
    { max: 6, titulo: 'Protagonista do teatro',
      texto: 'Muitas das táticas de aparência fazem parte da sua rotina. A pesquisa mostra que isso é comum, mas também que gera cansaço e desperdício de tempo.',
      dicas: ['Converse com seu gestor sobre medir resultados e não disponibilidade.',
              'Reserve blocos de foco na agenda e desative notificações nesse período.',
              'Se a pressão para "aparecer" estiver pesando, vale conversar com alguém de confiança ou com o RH.'] }
  ];

  /* ---------- 2. TEMA CLARO/ESCURO ---------- */
  const CHAVE_TEMA = 'tema-teatro-produtividade';
  const PALETA = {
    escuro: { texto: '#f2efff', grade: 'rgba(255,255,255,0.15)', fundo: '#1b1433' },
    claro:  { texto: '#1b1530', grade: 'rgba(27,21,48,0.15)',   fundo: '#ffffff' }
  };

  function lerTemaSalvo() {
    try {
      const t = window.localStorage.getItem(CHAVE_TEMA);
      return t === 'claro' || t === 'escuro' ? t : null;
    } catch (e) {
      return null; // localStorage indisponível (modo privado, bloqueio)
    }
  }

  function salvarTema(tema) {
    try { window.localStorage.setItem(CHAVE_TEMA, tema); } catch (e) { /* ignora */ }
  }

  function temaAtual() {
    return document.documentElement.getAttribute('data-tema') === 'claro' ? 'claro' : 'escuro';
  }

  function aplicarTema(tema) {
    const html = document.documentElement;
    html.setAttribute('data-tema', tema);
    html.setAttribute('data-bs-theme', tema === 'claro' ? 'light' : 'dark'); // Bootstrap 5.3
    const btn = document.getElementById('btnTema');
    if (btn) {
      btn.setAttribute('aria-pressed', String(tema === 'claro'));
      const rotulo = btn.querySelector('#btnTemaTexto');
      if (rotulo) rotulo.textContent = tema === 'claro' ? 'Modo escuro' : 'Modo claro';
    }
  }

  function iniciarTema() {
    aplicarTema(lerTemaSalvo() || 'escuro');
    const btn = document.getElementById('btnTema');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const novo = temaAtual() === 'claro' ? 'escuro' : 'claro';
      aplicarTema(novo);
      salvarTema(novo);
      montarGraficos(); // recria os gráficos com as cores do novo tema
    });
  }

  /* ---------- 3. GRÁFICOS (Chart.js) ---------- */
  let graficos = [];

  function montarGraficos() {
    const canvasBarras = document.getElementById('graficoTaticas');
    const canvasRosca = document.getElementById('graficoTurno');
    if (!canvasBarras && !canvasRosca) return;

    if (typeof Chart === 'undefined') {
      console.warn('Chart.js não foi carregado. Verifique o <script> da CDN.');
      return;
    }

    graficos.forEach((g) => g.destroy());
    graficos = [];

    const cores = PALETA[temaAtual()];
    Chart.defaults.color = cores.texto;
    Chart.defaults.borderColor = cores.grade;
    Chart.defaults.font.family = 'Poppins, system-ui, sans-serif';

    if (canvasBarras) {
      graficos.push(new Chart(canvasBarras, {
        type: 'bar',
        data: {
          labels: DADOS.taticas.map((t) => t.rotulo),
          datasets: [
            { label: 'Presencial',
              data: DADOS.taticas.map((t) => (t.grupo === 'Presencial' ? t.valor : null)),
              backgroundColor: '#4fd1c5', borderRadius: 6 },
            { label: 'Remoto',
              data: DADOS.taticas.map((t) => (t.grupo === 'Remoto' ? t.valor : null)),
              backgroundColor: '#9b7bff', borderRadius: 6 }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, min: 0, max: 100,
                 ticks: { callback: (v) => v + '%' }, grid: { color: cores.grade } },
            y: { stacked: true, grid: { display: false } }
          },
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (c) => ' ' + c.dataset.label + ': ' + c.parsed.x + '%' } }
          }
        }
      }));
    }

    if (canvasRosca) {
      graficos.push(new Chart(canvasRosca, {
        type: 'doughnut',
        data: {
          labels: ['Trabalho efetivo', 'Sem trabalhar (socializar, procrastinar, outras tarefas)'],
          datasets: [{
            data: [DADOS.turno.trabalho, DADOS.turno.semTrabalho],
            backgroundColor: ['#9b7bff', '#f6ad55'],
            borderColor: cores.fundo,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (c) => ' ' + c.label + ': ' + c.parsed + '%' } }
          }
        }
      }));
    }
  }

  /* ---------- 4. TESTE INTERATIVO ---------- */
  const estado = { indice: 0, respostas: [] };

  function el(id) { return document.getElementById(id); }

  function atualizarProgresso() {
    const total = PERGUNTAS.length;
    const pct = Math.round((estado.indice / total) * 100);
    const barra = el('quizProgresso');
    const caixa = el('quizProgressoBox');
    if (barra) barra.style.width = pct + '%';
    if (caixa) caixa.setAttribute('aria-valuenow', String(pct));
    if (el('quizPct')) el('quizPct').textContent = pct + '%';
  }

  function mostrarPergunta() {
    const total = PERGUNTAS.length;
    const p = PERGUNTAS[estado.indice];
    el('quizContador').textContent = 'Pergunta ' + (estado.indice + 1) + ' de ' + total;
    el('quizPergunta').textContent = p.texto;
    el('quizRef').textContent = p.ref;
    el('quizVoltar').disabled = estado.indice === 0;
    atualizarProgresso();
    const bloco = el('quizPergunta').parentElement;
    bloco.classList.remove('anima-surgir');
    void bloco.offsetWidth; // reinicia a animação CSS
    bloco.classList.add('anima-surgir');
  }

  function responder(sim) {
    estado.respostas[estado.indice] = sim;
    estado.indice += 1;
    if (estado.indice >= PERGUNTAS.length) {
      mostrarResultado();
    } else {
      mostrarPergunta();
    }
  }

  function voltar() {
    if (estado.indice === 0) return;
    estado.indice -= 1;
    estado.respostas.length = estado.indice;
    mostrarPergunta();
  }

  function criar(tag, texto, classe) {
    const n = document.createElement(tag);
    if (texto) n.textContent = texto;
    if (classe) n.className = classe;
    return n;
  }

  function mostrarResultado() {
    const total = PERGUNTAS.length;
    const pontos = estado.respostas.filter(Boolean).length;
    const faixa = FAIXAS.find((f) => pontos <= f.max);

    el('quizProgresso').style.width = '100%';
    el('quizProgressoBox').setAttribute('aria-valuenow', '100');
    el('quizCorpo').hidden = true;

    const area = el('quizResultado');
    area.replaceChildren();
    area.classList.remove('anima-surgir');
    void area.offsetWidth;
    area.classList.add('anima-surgir');

    area.appendChild(criar('p', 'Seu resultado', 'small text-uppercase mb-1'));
    area.appendChild(criar('h3', pontos + ' de ' + total + ' táticas: ' + faixa.titulo, 'h4'));
    area.appendChild(criar('p', faixa.texto));

    const marcadas = PERGUNTAS.filter((_, i) => estado.respostas[i]);
    if (marcadas.length > 0) {
      area.appendChild(criar('h4', 'Como isso se compara à pesquisa', 'h6 mt-3'));
      const lista = criar('ul', null, 'small');
      marcadas.forEach((p) => lista.appendChild(criar('li', p.ref)));
      area.appendChild(lista);
    }

    area.appendChild(criar('h4', 'O que fazer a partir daqui', 'h6 mt-3'));
    const dicas = criar('ul', null, 'small');
    faixa.dicas.forEach((d) => dicas.appendChild(criar('li', d)));
    area.appendChild(dicas);

    const btn = criar('button', 'Refazer o teste', 'btn btn-primary mt-3');
    btn.type = 'button';
    btn.addEventListener('click', reiniciar);
    area.appendChild(btn);

    area.hidden = false;
    area.setAttribute('tabindex', '-1');
    area.focus();
  }

  function reiniciar() {
    estado.indice = 0;
    estado.respostas = [];
    el('quizResultado').hidden = true;
    el('quizCorpo').hidden = false;
    mostrarPergunta();
    el('quizPergunta').focus();
  }

  function iniciarQuiz() {
    if (!el('quiz')) return;
    el('quizSim').addEventListener('click', () => responder(true));
    el('quizNao').addEventListener('click', () => responder(false));
    el('quizVoltar').addEventListener('click', voltar);
    mostrarPergunta();
  }

  /* ---------- INICIALIZAÇÃO ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    iniciarTema();
    montarGraficos();
    iniciarQuiz();
  });
})();
