/* Home page: the "before and after" cards flip from the problem to how VIKI solves it
   as they come into view. (The office scene and its scroll video were retired on 13 Nov 2026.) */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cards = document.querySelectorAll("[data-story-card]");
  if (!cards.length) return;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var c = e.target;
        if (e.isIntersecting) setTimeout(function () { c.classList.add("flipped"); }, 300 + (+c.dataset.i || 0) * 180);
        else if (e.boundingClientRect.top > 0) c.classList.remove("flipped");
      });
    }, { rootMargin: "0px 0px -25% 0px", threshold: 0.5 });
    cards.forEach(function (c, i) { c.dataset.i = i % 2; io.observe(c); });
  } else cards.forEach(function (c) { c.classList.add("flipped"); });
})();
