/* VIKI Systems — shared interactions (no libraries) */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function fmt(n, dec, prefix) {
    dec = dec || 0;
    return (prefix === undefined ? "TT$" : prefix) + Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function animateNumber(el, to, opts) {
    opts = opts || {};
    var dec = opts.decimals || 0, prefix = opts.prefix === undefined ? "" : opts.prefix, suffix = opts.suffix || "";
    var from = opts.from !== undefined ? opts.from : (parseFloat(el.dataset.cur) || 0);
    el.dataset.cur = to;
    if (reduce || opts.instant) { el.textContent = fmt(to, dec, prefix) + suffix; return; }
    var dur = opts.duration || 1200, t0 = performance.now();
    cancelAnimationFrame(el._raf);
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(from + (to - from) * e, dec, prefix) + suffix;
      if (p < 1) el._raf = requestAnimationFrame(step);
    })(t0);
  }
  function onVisible(el, cb, opts) {
    if (!("IntersectionObserver" in window)) { cb(el); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { cb(e.target); if (!(opts && opts.repeat)) io.unobserve(e.target); } });
    }, { threshold: (opts && opts.threshold) || 0.2, rootMargin: (opts && opts.rootMargin) || "0px 0px -8% 0px" });
    io.observe(el);
    return io;
  }
  window.VIKI = { fmt: fmt, animateNumber: animateNumber, onVisible: onVisible, reduce: reduce, finePointer: finePointer };

  /* ---- nav ---- */
  var nav = doc.querySelector(".nav");
  if (nav) {
    var setScrolled = function () { nav.classList.toggle("scrolled", window.scrollY > 30); };
    setScrolled(); addEventListener("scroll", setScrolled, { passive: true });
    var burger = nav.querySelector(".nav__burger");
    if (burger) {
      burger.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll(".nav__menu a").forEach(function (a) {
        a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); });
      });
    }
  }

  /* ---- entrances ---- */
  doc.querySelectorAll(".stagger").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); });
  });
  doc.querySelectorAll(".reveal, .stagger").forEach(function (el) {
    onVisible(el, function (t) {
      t.classList.add("in");
      if (t.classList.contains("stagger")) setTimeout(function () { t.classList.add("done"); }, 1400);
    }, { threshold: 0.12 });
  });

  /* ---- 3D tilt ---- */
  if (finePointer && !reduce) {
    doc.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 8, raf = null;
      var hit = el.closest(".tilt-scene") || el;
      var baseX = parseFloat(el.dataset.rx || 0), baseY = parseFloat(el.dataset.ry || 0);
      el.style.setProperty("--rx", baseX + "deg"); el.style.setProperty("--ry", baseY + "deg");
      hit.addEventListener("pointermove", function (e) {
        var r = hit.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.classList.add("tilting");
          el.style.setProperty("--ry", (baseY + (px - 0.5) * max * 2).toFixed(2) + "deg");
          el.style.setProperty("--rx", (baseX + (0.5 - py) * max * 2).toFixed(2) + "deg");
          el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
          el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        });
      });
      hit.addEventListener("pointerleave", function () {
        cancelAnimationFrame(raf);
        el.classList.remove("tilting");
        el.style.setProperty("--rx", baseX + "deg"); el.style.setProperty("--ry", baseY + "deg");
      });
    });
    doc.querySelectorAll("[data-spot]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---- counters ---- */
  doc.querySelectorAll("[data-count]").forEach(function (el) {
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    el.textContent = fmt(reduce ? to : 0, dec, prefix);
    onVisible(el, function () { animateNumber(el, to, { decimals: dec, prefix: prefix, from: 0, duration: 1600 }); });
  });

  /* ---- deadlines: live countdowns + timeline ---- */
  doc.querySelectorAll("[data-deadlines]").forEach(function (wrap) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var DAY = 864e5, horizon = 0, items = [];
    wrap.querySelectorAll("[data-kind]").forEach(function (card) {
      var k = card.dataset.kind, next = null, label = card.querySelector(".dl__count");
      if (k === "monthly") {
        var d = parseInt(card.dataset.day, 10);
        next = new Date(today.getFullYear(), today.getMonth(), d);
        if (next < today) next = new Date(today.getFullYear(), today.getMonth() + 1, d);
      } else if (k === "yearly") {
        var md = card.dataset.md.split("-");
        next = new Date(today.getFullYear(), +md[0] - 1, +md[1]);
        if (next < today) next = new Date(today.getFullYear() + 1, +md[0] - 1, +md[1]);
      } else if (k === "date") {
        var p = card.dataset.date.split("-");
        next = new Date(+p[0], +p[1] - 1, +p[2]);
        if (next < today) { if (label) label.innerHTML = "<span class='dot'></span>In force since " + card.dataset.since; next = null; }
      }
      if (next && label) {
        var days = Math.round((next - today) / DAY);
        label.innerHTML = "<span class='dot'></span>" + (days === 0 ? "Today" : days === 1 ? "Tomorrow" : "In " + days + " days");
        label.classList.toggle("soon", days <= 14);
        items.push({ card: card, days: days, name: card.dataset.short, date: next });
        horizon = Math.max(horizon, days);
      }
    });
    var tl = wrap.querySelector(".timeline");
    if (tl && items.length) {
      horizon = Math.max(30, Math.ceil((horizon + 6) / 10) * 10);
      var end = tl.querySelector(".timeline__end");
      if (end) end.textContent = "Next " + horizon + " days";
      items.forEach(function (it) {
        var m = doc.createElement("div");
        m.className = "timeline__mark";
        m.style.left = Math.max(2, Math.min(98, (it.days / horizon) * 100)) + "%";
        m.innerHTML = "<span>" + it.name + "</span><i></i>";
        tl.appendChild(m);
        var hot = function (on) { m.classList.toggle("hot", on); it.card.classList.toggle("hot", on); };
        it.card.addEventListener("pointerenter", function () { hot(true); });
        it.card.addEventListener("pointerleave", function () { hot(false); });
        m.addEventListener("pointerenter", function () { hot(true); });
        m.addEventListener("pointerleave", function () { hot(false); });
      });
    }
  });

  /* ---- savings calculator (figures from the live VIKI Books page) ---- */
  doc.querySelectorAll("[data-calc]").forEach(function (c) {
    var QB_PER_CLIENT = 38 * 6.8, VK_PER_CLIENT = 79, QB_BIZ = 952, VK_BIZ = 599;
    var range = c.querySelector("input[type=range]"), num = c.querySelector("input[type=number]");
    var qbEl = c.querySelector("[data-out=qb]"), vkEl = c.querySelector("[data-out=vk]");
    var qbLbl = c.querySelector("[data-out=qbl]"), vkLbl = c.querySelector("[data-out=vkl]");
    var vkSmall = c.querySelector("[data-out=vks]");
    var saveM = c.querySelector("[data-out=savem]"), saveY = c.querySelector("[data-out=savey]");
    var extra = c.querySelector("[data-out=extra]"), nRow = c.querySelector(".calc__n");
    var barQ = c.querySelector(".bar3d--qb"), barV = c.querySelector(".bar3d--vk");
    var mode = "firm";
    function render(instant) {
      var qb, vk;
      if (mode === "firm") {
        var n = Math.max(1, Math.min(2000, parseInt(num.value, 10) || 1));
        qb = n * QB_PER_CLIENT; vk = n * VK_PER_CLIENT;
        qbLbl.textContent = "QuickBooks, cheapest plan"; vkLbl.textContent = "VIKI Books";
        vkSmall.textContent = "a month, payroll and VAT included";
        extra.textContent = "";
      } else {
        qb = QB_BIZ; vk = VK_BIZ;
        qbLbl.textContent = "QuickBooks Plus (5 users)"; vkLbl.textContent = "VIKI Books (5 people)";
        vkSmall.textContent = "a month, payroll, VAT and Read receipts included";
        extra.textContent = " before QuickBooks' payroll charges. And QuickBooks cannot read receipts in Trinidad and Tobago.";
      }
      var o = { decimals: 0, prefix: "TT$", instant: instant, duration: 700 };
      animateNumber(qbEl, Math.round(qb), o); animateNumber(vkEl, Math.round(vk), o);
      animateNumber(saveM, Math.round(qb - vk), { decimals: 0, prefix: "TT$", suffix: " a month", instant: instant, duration: 700 });
      animateNumber(saveY, Math.round((qb - vk) * 12), { decimals: 0, prefix: "TT$", suffix: " a year", instant: instant, duration: 700 });
      if (barQ) { barQ.style.setProperty("--h", "88%"); barV.style.setProperty("--h", Math.max(6, (vk / qb) * 88).toFixed(1) + "%"); }
    }
    function syncRange() { range.style.setProperty("--p", ((range.value - range.min) / (range.max - range.min) * 100) + "%"); }
    range.addEventListener("input", function () { num.value = range.value; syncRange(); render(true); });
    num.addEventListener("input", function () { var v = parseInt(num.value, 10) || 1; range.value = Math.min(range.max, v); syncRange(); render(true); });
    c.querySelectorAll(".seg button").forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.dataset.who;
        c.querySelectorAll(".seg button").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        nRow.hidden = mode !== "firm";
        render(false);
      });
    });
    syncRange(); render(true);
    onVisible(c, function () { render(false); });
  });

  /* ---- contact forms: email + WhatsApp, nothing stored ---- */
  var EMAIL = "vikisystem.live@gmail.com", WA = "18687877871";
  function formText(f) {
    var g = function (n) { var el = f.querySelector("[name=" + n + "]"); return el ? el.value.trim() : ""; };
    var lines = ["Name: " + g("name")];
    if (g("business")) lines.push("Business: " + g("business"));
    if (g("product")) lines.push("Interested in: " + g("product"));
    if (g("phone")) lines.push("Phone: " + g("phone"));
    lines.push("", g("message"));
    return lines.join("\n");
  }
  doc.querySelectorAll("[data-mailform]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var subject = "Website message from " + (f.querySelector("[name=name]").value.trim() || "a visitor");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(formText(f));
      f.classList.add("sent");
    });
    var waBtn = f.querySelector("[data-wa]");
    if (waBtn) waBtn.addEventListener("click", function () {
      if (!f.reportValidity()) return;
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(formText(f)), "_blank", "noopener");
      f.classList.add("sent");
    });
    var again = f.querySelector("[data-again]");
    if (again) again.addEventListener("click", function () { f.reset(); f.classList.remove("sent"); });
  });

  /* ---- flip cards ---- */
  doc.querySelectorAll("[data-flip]").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = doc.getElementById(b.dataset.flip) || b.closest(".flip");
      var on = f.classList.toggle("flipped");
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var lbl = b.querySelector("[data-lbl]");
      if (lbl) lbl.textContent = on ? b.dataset.off : b.dataset.on;
    });
  });
  doc.querySelectorAll(".pain").forEach(function (p) {
    var t = function () { p.classList.toggle("flipped"); };
    p.addEventListener("click", t);
    p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t(); } });
  });

  /* ---- parallax image bands ---- */
  var bands = doc.querySelectorAll("[data-parallax]");
  if (bands.length && !reduce) {
    var tick = false;
    var upd = function () {
      bands.forEach(function (b) {
        var r = b.parentElement.getBoundingClientRect();
        var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        b.style.setProperty("--py", (p * -60).toFixed(1) + "px");
      });
      tick = false;
    };
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  doc.querySelectorAll("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
