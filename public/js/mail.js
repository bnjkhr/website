// Setzt Mailadressen erst im Browser zusammen, damit sie nicht im Quelltext stehen.
// Markup: <a data-mail-u="mail" data-mail-d="benkohler.de" data-mail-text>…Fallback…</a>
// Mit data-mail-text wird auch der sichtbare Text ersetzt, sonst nur der Link.
(function () {
  var nodes = document.querySelectorAll("[data-mail-u][data-mail-d]");
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    var address = el.getAttribute("data-mail-u") + String.fromCharCode(64) + el.getAttribute("data-mail-d");
    el.setAttribute("href", "mailto:" + address);
    if (el.hasAttribute("data-mail-text")) el.textContent = address;
  }
})();
