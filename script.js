const state = {
  data: [],
  filtered: []
};

const elements = {
  searchInput: document.getElementById('searchInput'),
  results: document.getElementById('results'),
  resultsCount: document.getElementById('resultsCount'),
  noResultsMessage: document.getElementById('noResultsMessage')
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function renderResults() {
  elements.results.innerHTML = '';

  elements.resultsCount.textContent = `${state.filtered.length} resultados encontrados`;

  if (state.filtered.length === 0) {
    elements.noResultsMessage.style.display = 'block';
    return;
  } else {
    elements.noResultsMessage.style.display = 'none';
  }

  state.filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';

    div.innerHTML = `
      <strong>${item.codigo}</strong><br>
      <small>${item.ano} • ${item.componente}</small>
      <p>${item.texto}</p>
    `;

    elements.results.appendChild(div);
  });
}

function filterData() {
  const search = normalize(elements.searchInput.value);

  state.filtered = state.data.filter(item =>
    normalize(item.texto).includes(search) ||
    normalize(item.codigo).includes(search)
  );

  renderResults();
}

elements.searchInput.addEventListener('input', filterData);

fetch('dados.json')
  .then(response => response.json())
  .then(data => {
    state.data = data;
    state.filtered = data;
    renderResults();
  })
  .catch(error => {
    console.error('Erro ao carregar dados:', error);
  });
init();
