/* VIKI Systems v5: menu, products dropdown, gentle entrances, contact form. No libraries. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* nav: hairline once scrolled */
  var nav = doc.querySelector(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("is-scrolled", scrollY > 8); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* mobile sheet */
  var burger = doc.querySelector(".nav__burger");
  var setOpen = function (open) {
    doc.body.classList.toggle("nav-open", open);
    if (burger) { burger.setAttribute("aria-expanded", open ? "true" : "false"); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu"); }
  };
  if (burger) burger.addEventListener("click", function () { setOpen(!doc.body.classList.contains("nav-open")); });
  doc.querySelectorAll(".sheet a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); closeDrops(); } });
  addEventListener("resize", function () { if (innerWidth >= 960) setOpen(false); });

  /* products dropdown (click and keyboard; hover on desktop) */
  var drops = doc.querySelectorAll(".nav__drop");
  function closeDrops() { drops.forEach(function (d) { d.classList.remove("open"); var b = d.querySelector("button"); if (b) b.setAttribute("aria-expanded", "false"); }); }
  drops.forEach(function (d) {
    var b = d.querySelector("button"), t;
    b.addEventListener("click", function (e) { e.stopPropagation(); var o = !d.classList.contains("open"); closeDrops(); d.classList.toggle("open", o); b.setAttribute("aria-expanded", o ? "true" : "false"); });
    d.addEventListener("mouseenter", function () { if (matchMedia("(hover: hover)").matches) { clearTimeout(t); closeDrops(); d.classList.add("open"); b.setAttribute("aria-expanded", "true"); } });
    d.addEventListener("mouseleave", function () { if (matchMedia("(hover: hover)").matches) { t = setTimeout(closeDrops, 160); } });
  });
  doc.addEventListener("click", closeDrops);

  /* current page in the menu */
  var here = location.pathname.replace(/index\.html$/, "");
  doc.querySelectorAll(".nav__links > a, .sheet__links a").forEach(function (a) {
    var p = new URL(a.getAttribute("href"), location.href).pathname.replace(/index\.html$/, "");
    if (p === here && p !== "/") a.setAttribute("aria-current", "page");
  });

  /* entrances: everything is visible if this never runs */
  var els = doc.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("in"); });

  /* year */
  doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* contact forms: open WhatsApp or email with the message filled in; nothing is stored */
  var EMAIL = "info@vikisystems.live", WA = "18687877871";
  function val(f, n) {
    var el = f.querySelector("[name=" + n + "]:checked") || f.querySelector("[name=" + n + "]:not([type=radio])");
    return el ? el.value.trim() : "";
  }
  function text(f) {
    var lines = [];
    if (val(f, "topic")) lines.push("About: " + val(f, "topic"));
    lines.push("Name: " + val(f, "name"));
    if (val(f, "business")) lines.push("Business: " + val(f, "business"));
    if (val(f, "product")) lines.push("Interested in: " + val(f, "product"));
    if (val(f, "phone")) lines.push("Phone: " + val(f, "phone"));
    lines.push("", val(f, "message"));
    return lines.join("\n");
  }
  doc.querySelectorAll("[data-mailform]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var subj = (val(f, "topic") || "Website message") + ": " + (val(f, "name") || "a visitor");
      location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(text(f));
      f.classList.add("sent");
    });
    var wa = f.querySelector("[data-wa]");
    if (wa) wa.addEventListener("click", function () {
      if (!f.reportValidity()) return;
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text(f)), "_blank", "noopener");
      f.classList.add("sent");
    });
    var again = f.querySelector("[data-again]");
    if (again) again.addEventListener("click", function () { f.reset(); f.classList.remove("sent"); });
  });
})();
