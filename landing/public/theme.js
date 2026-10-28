// Se carga en <head> antes de pintar: aplica el tema elegido sin parpadeo y decide si
// mostrar la intro (solo la primera vez por visita y sin "reducir movimiento").
(function () {
  var root = document.documentElement;
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') root.dataset.theme = t;
  } catch (e) {}
  try {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && !sessionStorage.getItem('intro-visto')) {
      root.classList.add('intro-on');
      sessionStorage.setItem('intro-visto', '1');
    }
  } catch (e) {}
})();
