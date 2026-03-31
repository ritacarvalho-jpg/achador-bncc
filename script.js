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
  return (value ||
