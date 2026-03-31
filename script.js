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

function filterData() {
  const search = normalize(elements.searchInput.value);
