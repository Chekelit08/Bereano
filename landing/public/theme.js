// Se carga en <head> antes de pintar para aplicar el tema elegido sin parpadeo.
try {
  var t = localStorage.getItem('theme');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) {}
