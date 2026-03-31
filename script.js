// Achador BNCC
// 1) Os dados ficam no arquivo externo ./dados.json
// 2) Os espaços de anúncio estão no HTML com comentários indicando onde inserir código real
// 3) O JSON é carregado com fetch ao abrir a página

const state = {
  data: [],
  filtered: []
};

const elements = {
  searchInput: document.getElementById('searchInput'),
  yearFilter: document.getElementById('yearFilter'),
  componentFilter: document.getElementById('componentFilter'),
  clearFilters: document.getElementById('clearFilters'),
  copyAllButton: document.getElementById('copyAllButton'),
  resultsCount: document.getElementById('resultsCount'),
  results: document.getElementById('results'),
  loadingMessage: document.getElementById('loadingMessage'),
  noResultsMessage: document.getElementById('noResultsMessage')
};

function normalizeText(value) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return (value || '')
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
}

function populateFilters(data) {
  const years = uniqueSorted(data.map(item => item.ano));
  const components = uniqueSorted(data.map(item => item.componente));

  for (const year of years) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    elements.yearFilter.appendChild(option);
  }

  for (const component of components) {
    const option = document.createElement('option');
    option.value = component;
    option.textContent = component;
    elements.componentFilter.appendChild(option);
  }
}

function buildSearchBlob(item) {
  return normalizeText([
    item.codigo,
    item.ano,
    item.componente,
    item.texto
  ].join(' '));
}

function filterData() {
  const query = normalizeText(elements.searchInput.value);
  const year = normalizeText(elements.yearFilter.value);
  const component = normalizeText(elements.componentFilter.value);

  state.filtered = state.data.filter(item => {
    const matchesQuery = !query || buildSearchBlob(item).includes(query);
    const matchesYear = !year || normalizeText(item.ano) === year;
    const matchesComponent = !component || normalizeText(item.componente) === component;

    return matchesQuery && matchesYear && matchesComponent;
  });

  renderResults();
}

function updateCount() {
  const total = state.filtered.length;
  const base = total === 1 ? '1 resultado encontrado' : `${total} resultados encontrados`;
  elements.resultsCount.textContent = `${base} • base atual: ${state.data.length} habilidades`;
}

function createCard(item) {
  const itemJson = JSON.stringify(item)
    .replaceAll('&', '&amp;')
    .replaceAll("'", '&#39;');

  return `
    <article class="result-card">
      <div class="meta-row">
        <span class="badge code-badge">${escapeHtml(item.codigo)}</span>
        <span class="badge">${escapeHtml(item.ano)}</span>
        <span class="badge">${escapeHtml(item.componente)}</span>
      </div>
      <p class="skill-text">${escapeHtml(item.texto)}</p>
      <div class="card-actions">
        <button class="button secondary copy-code-button" type="button" data-item='${itemJson}'>Copiar código</button>
        <button class="button copy-full-button" type="button" data-item='${itemJson}'>Copiar código + habilidade</button>
      </div>
    </article>
  `;
}

function renderResults() {
  elements.loadingMessage.classList.add('hidden');
  updateCount();

  if (!state.filtered.length) {
    elements.results.innerHTML = '';
    elements.noResultsMessage.classList.remove('hidden');
    return;
  }

  elements.noResultsMessage.classList.add('hidden');
  elements.results.innerHTML = state.filtered.map(createCard).join('');
}

async function copyText(text, successLabel, button) {
  try {
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = successLabel;
    setTimeout(() => {
      button.textContent = original;
    }, 1600);
  } catch (error) {
    alert('Não foi possível copiar automaticamente. Seu navegador resolveu dificultar o básico.');
  }
}

async function copyAllResults() {
  if (!state.filtered.length) {
    alert('Não há resultados filtrados para copiar.');
    return;
  }

  const combined = state.filtered
    .map(item => `${item.codigo} - ${item.texto}`)
    .join('\n\n');

  await copyText(combined, 'Tudo copiado', elements.copyAllButton);
}

function handleResultButtons(event) {
  const button = event.target.closest('button[data-item]');
  if (!button) return;

  const item = JSON.parse(button.dataset.item);

  if (button.classList.contains('copy-code-button')) {
    copyText(item.codigo, 'Código copiado', button);
  }

  if (button.classList.contains('copy-full-button')) {
    copyText(`${item.codigo} - ${item.texto}`, 'Conteúdo copiado', button);
  }
}

function clearFilters() {
  elements.searchInput.value = '';
  elements.yearFilter.value = '';
  elements.componentFilter.value = '';
  filterData();
}

async function loadData() {
  try {
    const response = await fetch('./dados.json');
    if (!response.ok) {
      throw new Error(`Falha ao carregar o JSON: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('O arquivo dados.json não está em formato de lista.');
    }

    state.data = data;
    populateFilters(data);
    filterData();
  } catch (error) {
    elements.loadingMessage.classList.remove('hidden');
    elements.loadingMessage.textContent = 'Erro ao carregar os dados da BNCC. Verifique se o arquivo dados.json está na raiz do projeto e se o GitHub Pages foi publicado corretamente.';
    elements.resultsCount.textContent = 'Falha ao carregar resultados';
    console.error(error);
  }
}

elements.searchInput.addEventListener('input', filterData);
elements.yearFilter.addEventListener('change', filterData);
elements.componentFilter.addEventListener('change', filterData);
elements.clearFilters.addEventListener('click', clearFilters);
elements.copyAllButton.addEventListener('click', copyAllResults);
elements.results.addEventListener('click', handleResultButtons);

loadData();
