// VIKI Systems: product tours. Tabs switch between real VIKI screens; it moves on by itself until someone taps.
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DUR = 6500;

  function init(root) {
    var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
    var panes = [].slice.call(root.querySelectorAll(".xp__slide"));
    var txts = [].slice.call(root.querySelectorAll(".xp__txt"));
    var row = root.querySelector(".xp__tabs");
    var cur = 0, timer = null, auto = !reduce, seen = false;

    root.style.setProperty("--dur", DUR + "ms");
    panes.concat(txts).forEach(function (el) { el.hidden = false; });
    mark();
    if (auto) root.classList.add("is-auto");

    function mark() {
      panes.forEach(function (p, j) { p.inert = j !== cur; p.setAttribute("aria-hidden", j !== cur); });
      txts.forEach(function (t, j) { t.setAttribute("aria-hidden", j !== cur); });
    }
    function show(i, focus) {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, j) { t.setAttribute("aria-selected", j === cur); t.tabIndex = j === cur ? 0 : -1; });
      panes.forEach(function (p, j) { p.classList.toggle("is-on", j === cur); });
      txts.forEach(function (t, j) { t.classList.toggle("is-on", j === cur); });
      mark();
      var t = tabs[cur];
      if (row.scrollWidth > row.clientWidth + 2) row.scrollTo({ left: t.offsetLeft - (row.clientWidth - t.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
      if (focus) t.focus();
      restart();
    }
    function restart() {
      var bar = tabs[cur].querySelector("i");
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
      clearTimeout(timer);
      if (auto && seen) timer = setTimeout(function () { show(cur + 1); }, DUR);
    }
    function stop() { auto = false; clearTimeout(timer); root.classList.remove("is-auto"); }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { stop(); show(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); stop(); show(cur + (e.key === "ArrowRight" ? 1 : -1), true); }
      });
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { seen = en.isIntersecting; if (seen) { root.classList.add("is-live"); restart(); } else clearTimeout(timer); });
      }, { threshold: 0.45 }).observe(root.querySelector(".xp__screen"));
    } else { seen = true; root.classList.add("is-live"); restart(); }
  }

  [].forEach.call(document.querySelectorAll("[data-xp]"), init);
})();
