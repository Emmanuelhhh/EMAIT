/* ══════════════════════════════════════════════════════════
   timer.js — Temporizador de sesión de estudio
   EMAIT Solutions
   ══════════════════════════════════════════════════════════ */

let _timerInterval = null;
let _timerSeconds  = 0;
let _timerRunning  = false;

function timerClick() {
  // Cada clic agrega 5 minutos
  _timerSeconds += 300;

  if (!_timerRunning) {
    _timerRunning = true;
    document.getElementById('timerBtn').classList.add('timer-running');
    _timerInterval = setInterval(_timerTick, 1000);
  }

  _timerRender();
}

function _timerTick() {
  _timerSeconds--;

  if (_timerSeconds <= 0) {
    _timerSeconds = 0;
    _timerRunning = false;
    clearInterval(_timerInterval);
    _timerInterval = null;
    _timerDone();
    return;
  }

  _timerRender();
}

function _timerRender() {
  const min = Math.floor(_timerSeconds / 60);
  const sec = _timerSeconds % 60;
  const label = document.getElementById('timerLabel');
  if (label) label.textContent = min + ':' + String(sec).padStart(2, '0');
}

function _timerDone() {
  const btn   = document.getElementById('timerBtn');
  const label = document.getElementById('timerLabel');

  if (label) label.textContent = '&#x2713; Listo';
  if (btn) {
    btn.classList.remove('timer-running');
    btn.classList.add('timer-done');
  }

  // Parpadeo de aviso
  btn.animate([
    { background: 'rgba(76,175,80,0.55)' },
    { background: 'rgba(76,175,80,0.15)' },
    { background: 'rgba(76,175,80,0.55)' },
    { background: 'rgba(76,175,80,0.15)' },
    { background: 'rgba(76,175,80,0.55)' }
  ], { duration: 1200, easing: 'ease-in-out' });

  // Resetear display tras 4 s (a menos que el usuario ya haya pulsado de nuevo)
  setTimeout(() => {
    if (!_timerRunning) {
      _timerSeconds = 0;
      const l = document.getElementById('timerLabel');
      const b = document.getElementById('timerBtn');
      if (l) l.textContent = '5:00';
      if (b) b.classList.remove('timer-done');
    }
  }, 4000);
}
