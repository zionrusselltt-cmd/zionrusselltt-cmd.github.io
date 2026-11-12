/* VIKI Systems v4: the hero console (VIKI Books / VIKI Bookings tabs that take turns on their own
   until a visitor picks one). Accessible tabs with arrow keys. No libraries. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-console]").forEach(function (c) {
    var tabs = [].slice.call(c.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var nodes = [].slice.call(c.querySelectorAll("[data-nodes]"));
    var DUR = +c.getAttribute("data-dur") || 14500;
    var i = 0, auto = !reduce, timer = null, visible = true;
    c.style.setProperty("--dur", DUR + "ms");

    function schedule() {
      clearTimeout(timer);
      if (!auto) return;
      timer = setTimeout(function () { if (visible && !document.hidden) show((i + 1) % tabs.length); else schedule(); }, DUR);
    }
    function show(n, byUser) {
      i = n;
      if (byUser) auto = false;
      tabs.forEach(function (t, k) {
        var on = k === n;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (panels[k]) panels[k].hidden = !on;
        t.classList.remove("auto");
        if (on && auto) { void t.offsetWidth; t.classList.add("auto"); }
      });
      nodes.forEach(function (nd) { nd.hidden = nd.getAttribute("data-nodes") !== tabs[n].getAttribute("data-k"); });
      schedule();
    }
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { show(k, true); });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var n = (k + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        show(n, true); tabs[n].focus();
      });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .15 }).observe(c);
    }
    show(0);
  });

  // mark the current page in the menu
  var here = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav__links a, .nav__menu a").forEach(function (a) {
    var p = new URL(a.getAttribute("href"), location.href).pathname.replace(/index\.html$/, "");
    if (p === here && p !== "/") a.setAttribute("aria-current", "page");
  });
})();
