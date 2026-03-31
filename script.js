const input = document.getElementById('search');
const results = document.getElementById('results');

let dados = [];

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function render(lista) {
  results.innerHTML = '';

  if (!lista.length) {
    results.innerHTML = '<p>Nenhum resultado</p>';
    return;
  }

  lista.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <strong>${item.codigo}</strong> - ${item.ano} - ${item.componente}<br>
      ${item.texto}
    `;
    results.appendChild(div);
  });
}

input.addEventListener('input', () => {
  const busca = normalize(input.value);

  const filtrado = dados.filter(item =>
    normalize(item.codigo).includes(busca) ||
    normalize(item.texto).includes(busca) ||
    normalize(item.componente).includes(busca)
  );

  render(filtrado);
});

fetch('dados.json')
  .then(res => res.json())
  .then(data => {
    dados = data;
    render(dados);
  })
  .catch(() => {
    results.innerHTML = 'Erro ao carregar dados';
  });
