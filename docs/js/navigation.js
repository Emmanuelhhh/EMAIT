/* ══════════════════════════════════════════════════════════
   navigation.js — Routing, sidebar y modo programa
   EMAIT Solutions
   ══════════════════════════════════════════════════════════ */

/* ─── Mostrar sección (landing index.html) ─── */
function showSection(id) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');

  // Marcar link activo en topbar nav
  document.querySelectorAll('.topbar-nav-link').forEach(a => {
    a.classList.remove('active');
    if (a.dataset.section === id) a.classList.add('active');
  });

  // Marcar link activo en sidebar (si existe — solo en programa.html)
  document.querySelectorAll('.sidebar-link, .sidebar-sub-link').forEach(a => {
    a.classList.remove('active');
    if (a.dataset.section === id) a.classList.add('active');
  });

  // Si es una subsección (p.ej. "s7-lunes"), auto-expandir la semana padre
  const weekMatch = id.match(/^(s\d+)-/);
  if (weekMatch) _openWeekMenu(weekMatch[1]);

  // En móvil cerrar el sidebar al navegar (si existe)
  if (window.innerWidth <= 768) closeSidebar();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Ir al programa (redirige a programa.html) ─── */
function activarPrograma() {
  window.location.href = 'programa-java.html';
}

/* ─── Navegar a semana + toggle submenu ─── */
function navWeek(weekId) {
  showSection(weekId);
  const menu = document.getElementById('sub-' + weekId);
  const link = document.querySelector('[data-week="' + weekId + '"]');
  if (!menu) return;

  const willOpen = !menu.classList.contains('open');

  document.querySelectorAll('.week-submenu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.sidebar-link[data-week]').forEach(l => l.classList.remove('submenu-open'));

  if (willOpen) {
    menu.classList.add('open');
    if (link) link.classList.add('submenu-open');
  }
}

/* ─── Abrir submenú de una semana (solo abre, sin toggle) ─── */
function _openWeekMenu(weekId) {
  const menu = document.getElementById('sub-' + weekId);
  const link = document.querySelector('[data-week="' + weekId + '"]');
  if (!menu) return;

  document.querySelectorAll('.week-submenu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.sidebar-link[data-week]').forEach(l => l.classList.remove('submenu-open'));

  menu.classList.add('open');
  if (link) link.classList.add('submenu-open');
}

/* ─── Toggle del sidebar (null-safe — solo en programa.html) ─── */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const overlay  = document.getElementById('sidebarOverlay');
    const isNowOpen = sidebar.classList.toggle('sidebar-open');
    if (overlay) overlay.classList.toggle('visible', isNowOpen);
  } else {
    document.body.classList.toggle('sidebar-collapsed');
  }
}

/* ─── Cerrar sidebar (null-safe) ─── */
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.remove('sidebar-open');
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.classList.remove('visible');
}

/* ─── Resize: limpiar estado incorrecto ─── */
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (window.innerWidth > 768) {
    sidebar.classList.remove('sidebar-open');
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.remove('visible');
  }
});
