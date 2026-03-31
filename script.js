const state = {
  data: [],
  filtered: []
};

const elements = {
  searchInput: document.getElementById('searchInput'),
  results: document.getElementById('results')
};

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function renderResults() {
  elements.results.innerHTML = '';

  if (!state.filtered.length) {
    elements.results.innerHTML = '<p>Nenhum resultado encontrado</p>';
    return;
  }

  state.filtered.forEach(item => {
    const div = document.createElement('div');
    div.style.marginBottom = '10px';

    div.innerHTML = `
      <strong>${item.codigo}</strong> - ${item.ano} - ${item.componente}<br>
      ${item.texto}
    `;

    elements.results.appendChild(div);
  });
}

function filterData() {
  const search = normalize(elements.searchInput.value);

  state.filtered = state.data.filter(item =>
    normalize(item.texto).includes(search) ||
    normalize(item.codigo).includes(search) ||
    normalize(item.componente).includes(search)
  );

  renderResults();
}

function init() {
  fetch('dados.json')
    .then(res => res.json())
    .then(data => {
      state.data = data;
      state.filtered = data;
      renderResults();
    })
    .catch(err => {
      console.error(err);
      elements.results.innerHTML = 'Erro ao carregar dados';
    });

  elements.searchInput.addEventListener('input', filterData);
}

init();
