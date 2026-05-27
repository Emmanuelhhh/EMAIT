/* ══════════════════════════════════════════════════════════
   frases.js — Modal de frase aleatoria
   Depende de: data.js (BANCO_FRASES, CAT_COLORS, CAT_LABELS)
   EMAIT Solutions
   ══════════════════════════════════════════════════════════ */

let _ultimaFraseIdx = -1;

function _fraseAleatoria() {
  let idx;
  do { idx = Math.floor(Math.random() * BANCO_FRASES.length); }
  while (idx === _ultimaFraseIdx && BANCO_FRASES.length > 1);
  _ultimaFraseIdx = idx;
  return BANCO_FRASES[idx];
}

function mostrarFrase() {
  const f     = _fraseAleatoria();
  const color = CAT_COLORS[f.categoria] || '#1565C0';

  // Badge categoría
  const badge = document.getElementById('fraseBadge');
  badge.textContent  = CAT_LABELS[f.categoria] || f.categoria;
  badge.style.background = color;

  // Título (solo categoría neurociencia)
  const tituloEl = document.getElementById('fraseTitulo');
  if (f.titulo) {
    tituloEl.textContent = f.titulo;
    tituloEl.style.display = 'block';
  } else {
    tituloEl.style.display = 'none';
  }

  // Texto principal
  document.getElementById('fraseTexto').textContent = f.texto;

  // Autor
  const autorEl = document.getElementById('fraseAutor');
  if (f.autor) {
    autorEl.textContent  = '— ' + f.autor;
    autorEl.style.display = 'block';
  } else {
    autorEl.style.display = 'none';
  }

  // Referencia del autor
  const refEl = document.getElementById('fraseRef');
  if (f.referencia) {
    refEl.textContent  = f.referencia;
    refEl.style.display = 'block';
  } else {
    refEl.style.display = 'none';
  }
}

function abrirFrase() {
  mostrarFrase();
  document.getElementById('fraseOverlay').classList.add('open');
  document.addEventListener('keydown', _fraseKeyClose);
}

function cerrarFrase() {
  document.getElementById('fraseOverlay').classList.remove('open');
  document.removeEventListener('keydown', _fraseKeyClose);
}

function cerrarFraseSiOverlay(e) {
  if (e.target === document.getElementById('fraseOverlay')) cerrarFrase();
}

function _fraseKeyClose(e) {
  if (e.key === 'Escape') cerrarFrase();
}
