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

function uniqueSorted(values) {
  return Array.from(new Set(values)).sort(function (a, b) {
    return a.localeCompare(b, 'pt-BR', { numeric: true });
  });
}

function escapeHtml(value) {
  return (value || '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function populateFilters(data) {
  elements.yearFilter.innerHTML = '<option value="">Todos</option>';
  elements.componentFilter.innerHTML = '<option value="">Todos</option>';

  var years = uniqueSorted(data.map(function (item) { return item.ano; }));
  var components = uniqueSorted(data.map(function (item) { return item.componente; }));

  years.forEach(function (year) {
    var option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    elements.yearFilter.appendChild(option);
  });

  components.forEach(function (component) {
    var option = document.createElement('option');
    option.value = component;
    option.textContent = component;
    elements.componentFilter.appendChild(option);
  });
}

function buildSearchBlob(item) {
  return normalizeText(
    [item.codigo, item.ano, item.componente, item.texto].join(' ')
  );
}

function updateCount() {
  var total = state.filtered.length;
  var base = total === 1 ? '1 resultado encontrado' : total + ' resultados encontrados';
  elements.resultsCount.textContent = base + ' • base atual: ' + state.data.length + ' habilidades';
}

function createCard(item) {
  var safeItem = encodeURIComponent(JSON.stringify(item));

  return (
    '<article class="result-card">' +
      '<div class="meta-row">' +
        '<span class="badge code-badge">' + escapeHtml(item.codigo) + '</span>' +
        '<span class="badge">' + escapeHtml(item.ano) + '</span>' +
        '<span class="badge">' + escapeHtml(item.componente) + '</span>' +
      '</div>' +
      '<p class="skill-text">' + escapeHtml(item.texto) + '</p>' +
      '<div class="card-actions">' +
        '<button class="button secondary copy-code-button" type="button" data-item="' + safeItem + '">Copiar código</button>' +
        '<button class="button copy-full-button" type="button" data-item="' + safeItem + '">Copiar código + habilidade</button>' +
      '</div>' +
    '</article>'
  );
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

function filterData() {
  var query = normalizeText(elements.searchInput.value);
  var year = normalizeText(elements.yearFilter.value);
  var component = normalizeText(elements.componentFilter.value);
  var terms = query ? query.split(/\s+/).filter(Boolean) : [];

  state.filtered = state.data.filter(function (item) {
    var searchBlob = buildSearchBlob(item);
    var matchesQuery = !terms.length || terms.every(function (term) {
      return searchBlob.indexOf(term) !== -1;
    });
    var matchesYear = !year || normalizeText(item.ano) === year;
    var matchesComponent = !component || normalizeText(item.componente) === component;

    return matchesQuery && matchesYear && matchesComponent;
  });

  renderResults();
}

function copyText(text, successLabel, button) {
  navigator.clipboard.writeText(text).then(function () {
    var original = button.textContent;
    button.textContent = successLabel;
    setTimeout(function () {
      button.textContent = original;
    }, 1600);
  }).catch(function () {
    alert('Não foi possível copiar automaticamente.');
  });
}

function copyAllResults() {
  if (!state.filtered.length) {
    alert('Não há resultados filtrados para copiar.');
    return;
  }

  var combined = state.filtered.map(function (item) {
    return item.codigo + ' - ' + item.texto;
  }).join('\n\n');

  copyText(combined, 'Tudo copiado', elements.copyAllButton);
}

function handleResultButtons(event) {
  var button = event.target.closest('button[data-item]');
  if (!button) return;

  var item = JSON.parse(decodeURIComponent(button.getAttribute('data-item')));

  if (button.classList.contains('copy-code-button')) {
    copyText(item.codigo, 'Código copiado', button);
  }

  if (button.classList.contains('copy-full-button')) {
    copyText(item.codigo + ' - ' + item.texto, 'Conteúdo copiado', button);
  }
}

function clearFilters() {
  elements.searchInput.value = '';
  elements.yearFilter.value = '';
  elements.componentFilter.value = '';
  filterData();
}

function loadData() {
  fetch('./dados.json')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Falha ao carregar o JSON: ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) {
        throw new Error('O arquivo dados.json não está em formato de lista.');
      }

      state.data = data;
      populateFilters(data);
      state.filtered = data.slice();
      renderResults();
    })
    .catch(function (error) {
      elements.loadingMessage.classList.remove('hidden');
      elements.loadingMessage.textContent = 'Erro ao carregar os dados da BNCC.';
      elements.resultsCount.textContent = 'Falha ao carregar resultados';
      console.error(error);
    });
}

elements.searchInput.addEventListener('input', filterData);
elements.yearFilter.addEventListener('change', filterData);
elements.componentFilter.addEventListener('change', filterData);
elements.clearFilters.addEventListener('click', clearFilters);
elements.copyAllButton.addEventListener('click', copyAllResults);
elements.results.addEventListener('click', handleResultButtons);

loadData();


 
  
   
 

