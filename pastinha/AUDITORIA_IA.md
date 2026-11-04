# AUDITORIA_IA.md — Prompt Logbook

Projeto: **Teatro de Produtividade**
Dupla: **Guilherme Nere** e **[NOME DO PARCEIRO]**
Ferramenta de IA utilizada: **Claude (Anthropic), modelo Sonnet 5.5**

> Este arquivo documenta as 3 iterações de copilotagem da Parte II.
> Tudo que está entre **[COLCHETES]** deve ser preenchido pela dupla com o que realmente aconteceu.

---

## Ficha 1 — Microaplicação interativa: teste "Quanto teatro tem na sua rotina?"

### 1. Engenharia de prompt (entrada)
- **Ferramenta:** Claude (Anthropic), Sonnet 5.5
- **Prompt completo enviado:**
  > [COLE AQUI o prompt que vocês realmente enviaram. Inclua: contexto do projeto, restrições (JavaScript puro, Bootstrap 5.3, sem innerHTML com dados do usuário), formato esperado e o contrato de dados das perguntas.]

### 2. Resposta bruta da IA (trecho)
```js
// Trecho do app.js entregue pela IA (função de resultado)
const faixa = FAIXAS.find((f) => pontos <= f.max);
// ...
marcadas.forEach((p) => lista.appendChild(criar('li', p.ref)));
```

### 3. Auditoria crítica da dupla
Candidatos a verificar (testem e registrem **somente o que confirmarem**, com suas palavras):
- A pergunta 6 junta dois comportamentos em uma só ("responder rápido" **ou** "deixar a tela ligada"), o que torna a resposta ambígua.
- Os limites das faixas (0–1, 2–4, 5–6) são arbitrários, não vêm de escala psicológica validada.
- Os percentuais da pesquisa estão escritos em dois lugares (`PERGUNTAS.ref` e `DADOS`): risco de ficarem inconsistentes.
- Acessibilidade: o foco vai para o resultado? O leitor de tela anuncia a mudança de pergunta?
- **[O QUE MAIS VOCÊS ENCONTRARAM AO TESTAR: teclado, celular, console F12]**

### 4. Refatoração manual e intervenção da dupla
- **Correção feita por vocês:** [DESCREVA e COLE o código final que vocês alteraram]
- **Justificativa técnica:** [POR QUE a mudança foi necessária]
- **Aprendizado:** [O QUE VOCÊS APRENDERAM]

---

## Ficha 2 — Visualização de dados com Chart.js

### 1. Engenharia de prompt (entrada)
- **Ferramenta:** Claude (Anthropic), Sonnet 5.5
- **Prompt completo enviado:**
  > [COLE AQUI o prompt real. Inclua: dados em JSON, tipos de gráfico (barras horizontais e rosca), versão do Chart.js, requisitos de acessibilidade.]

### 2. Resposta bruta da IA (trecho)
```js
datasets: [
  { label: 'Presencial', data: DADOS.taticas.map((t) => (t.grupo === 'Presencial' ? t.valor : null)), backgroundColor: '#4fd1c5' },
  { label: 'Remoto',     data: DADOS.taticas.map((t) => (t.grupo === 'Remoto' ? t.valor : null)),     backgroundColor: '#9b7bff' }
]
```

### 3. Auditoria crítica da dupla
Candidatos a verificar:
- Os rótulos longos do eixo Y ficam cortados ou ilegíveis em tela de celular (testem em ~375px)?
- A cor de baixo contraste entre as barras e o fundo no tema claro?
- O script da CDN não tem o atributo `integrity` (SRI): risco se a CDN for comprometida.
- O gráfico é recriado a cada troca de tema e `Chart.defaults` é alterado globalmente: isso é a melhor abordagem?
- Há alternativa em texto para quem não enxerga o gráfico (`aria-label` e texto dentro do `<canvas>`)?
- **[O QUE MAIS VOCÊS ENCONTRARAM]**

### 4. Refatoração manual e intervenção da dupla
- **Correção feita por vocês:** [DESCREVA e COLE o código final]
- **Justificativa técnica:** [...]
- **Aprendizado:** [...]

---

## Ficha 3 — Tema claro/escuro, glassmorphism e animações

### 1. Engenharia de prompt (entrada)
- **Ferramenta:** Claude (Anthropic), Sonnet 5.5
- **Prompt completo enviado:**
  > [COLE AQUI o prompt real. Inclua: persistência em localStorage, uso de variáveis CSS do :root, compatibilidade com data-bs-theme do Bootstrap 5.3, backdrop-filter, @keyframes, prefers-reduced-motion.]

### 2. Resposta bruta da IA (trecho)
```js
function aplicarTema(tema) {
  html.setAttribute('data-tema', tema);
  html.setAttribute('data-bs-theme', tema === 'claro' ? 'light' : 'dark');
}
```

### 3. Auditoria crítica da dupla
Candidatos a verificar:
- O tema só é aplicado depois do carregamento do script: a página "pisca" no tema escuro antes de aplicar o claro salvo? (FOUC)
- Dois atributos (`data-tema` e `data-bs-theme`) guardam a mesma informação: há risco de ficarem fora de sincronia?
- A classe `.card` do seu CSS conflita com a `.card` do Bootstrap?
- O seletor global `button { width: 80px }` quebrava os botões do Bootstrap?
- `backdrop-filter` funciona em Safari/Firefox antigos? Há prefixo `-webkit-`?
- **[O QUE MAIS VOCÊS ENCONTRARAM]**

### 4. Refatoração manual e intervenção da dupla
- **Correção feita por vocês:** [DESCREVA e COLE o código final]
- **Justificativa técnica:** [...]
- **Aprendizado:** [...]
