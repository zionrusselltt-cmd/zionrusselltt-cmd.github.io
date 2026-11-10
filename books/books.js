/* VIKI Books page: 3D hero, receipt reader, live feature demos, course player */
(function () {
  "use strict";
  var V = window.VIKI, reduce = V.reduce, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };

  /* ---- hero: layers lift off the screen as you scroll ---- */
  var hero = $("#hero3d");
  if (hero && !reduce) {
    var tick = false;
    var upd = function () {
      var p = Math.min(1, Math.max(0, window.scrollY / (innerHeight * 0.75)));
      hero.style.setProperty("--e", (0.35 + p * 0.85).toFixed(3));
      tick = false;
    };
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---- receipts: scan, then type the fields in ---- */
  var rc = $("#rcpt");
  if (rc) {
    var lines = $$(".paper .ln", rc), outs = $$(".fill output", rc), save = $(".fill__save span", rc);
    var running = false, visible = false, gen = 0;
    var typeInto = async function (el, text, g) {
      el.classList.add("typing");
      for (var i = 1; i <= text.length; i++) { if (g !== gen) return; el.textContent = text.slice(0, i); await wait(26); }
      el.classList.remove("typing");
    };
    var cycle = async function () {
      if (running) return; running = true;
      while (visible) {
        var g = ++gen;
        lines.forEach(function (l) { l.classList.remove("hit"); });
        outs.forEach(function (o) { o.textContent = ""; o.classList.remove("typing"); });
        save.classList.remove("ok"); save.textContent = "Check and save";
        if (reduce) { outs.forEach(function (o) { o.textContent = o.dataset.v; }); save.classList.add("ok"); save.textContent = "Saved"; break; }
        rc.classList.add("run");
        await wait(500);
        for (var i = 0; i < lines.length; i++) { if (g !== gen || !visible) break; lines[i].classList.add("hit"); await wait(230); }
        for (var j = 0; j < outs.length; j++) { if (g !== gen || !visible) break; await typeInto(outs[j], outs[j].dataset.v, g); await wait(120); }
        rc.classList.remove("run");
        if (!visible) break;
        await wait(500); save.classList.add("ok"); save.textContent = "✓ Saved";
        await wait(3200);
      }
      running = false;
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { visible = e.isIntersecting; if (visible) cycle(); else rc.classList.remove("run"); });
      }, { threshold: 0.3 }).observe(rc);
    } else { visible = true; cycle(); }
  }

  /* ---- feature demos ---- */
  var timers = [];
  var later = function (fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); };
  var clearTimers = function () { timers.forEach(clearTimeout); timers = []; };
  var auto = true;

  var demos = {
    bank: function (p) {
      var rows = $$(".bk__row", p), btn = $("[data-bk-accept]", p), left = $("[data-bk-left]", p), diff = $("[data-bk-diff]", p);
      rows.forEach(function (r) { r.classList.remove("sug", "done"); });
      btn.disabled = true; btn.classList.remove("ok"); btn.textContent = "Accept 5 suggested matches";
      left.textContent = "5"; diff.textContent = "TT$12,517.57"; diff.dataset.cur = 12517.57;
      rows.forEach(function (r, i) { later(function () { r.classList.add("sug"); }, 300 + i * 260); });
      later(function () { btn.disabled = false; }, 300 + rows.length * 260);
      btn.onclick = function () {
        btn.disabled = true;
        rows.forEach(function (r, i) {
          setTimeout(function () { r.classList.add("done"); left.textContent = String(rows.length - i - 1); }, reduce ? 0 : i * 220);
        });
        V.animateNumber(diff, 0, { decimals: 2, prefix: "TT$", duration: rows.length * 220 + 300 });
        setTimeout(function () { btn.classList.add("ok"); btn.textContent = "✓ Reconciled to zero"; }, reduce ? 0 : rows.length * 220 + 200);
      };
      if (auto) later(function () { btn.onclick(); }, 300 + rows.length * 260 + 1400);
    },
    qip: function (p) {
      var q = $("[data-qip]", p), btn = $("[data-qip-next]", p), title = $("[data-qip-title]", p), chip = $("[data-qip-chip]", p), terms = $("[data-qip-terms]", p), steps = $$(".qip__steps span", p);
      var state = 0;
      var set = function (s) {
        state = s;
        q.classList.toggle("s1", s >= 1); q.classList.toggle("s2", s === 2);
        title.textContent = s === 0 ? "Quote QU-0214" : "Invoice INV-1047";
        chip.textContent = ["Quote", "Invoice", "Paid"][s];
        terms.textContent = s === 0 ? "Valid for 30 days" : "Due in 14 days";
        steps.forEach(function (st, i) { st.classList.toggle("on", i === s); });
        btn.textContent = ["They said yes: make it the invoice", "Record the payment", "Start again"][s];
      };
      set(0);
      btn.onclick = function () { set((state + 1) % 3); };
      if (auto) { later(function () { set(1); }, 1600); later(function () { set(2); }, 3600); }
    },
    pay: function (p) {
      var cells = $$(".pr__c", p), sums = $$("[data-pr]", p), btn = $("[data-pr-post]", p);
      cells.forEach(function (c) { c.classList.remove("on"); });
      sums.forEach(function (s) { s.textContent = "TT$0.00"; s.dataset.cur = 0; });
      btn.disabled = true; btn.classList.remove("ok"); btn.textContent = "Post to the books";
      cells.forEach(function (c, i) { later(function () { c.classList.add("on"); }, 250 + i * 90); });
      later(function () { sums.forEach(function (s) { V.animateNumber(s, parseFloat(s.dataset.pr), { decimals: 2, prefix: "TT$", from: 0 }); }); }, 250 + cells.length * 90);
      later(function () { btn.disabled = false; }, 250 + cells.length * 90 + 1200);
      btn.onclick = function () { btn.disabled = true; btn.classList.add("ok"); btn.textContent = "✓ Posted to the books"; };
      if (auto) later(function () { btn.onclick(); }, 250 + cells.length * 90 + 2400);
    },
    vat: function (p) {
      var rows = $$(".vat__row", p), btn = $("[data-vat-filed]", p);
      rows.forEach(function (r) { r.classList.remove("lit"); var b = $("b", r); b.textContent = "0.00"; b.dataset.cur = 0; });
      btn.disabled = true; btn.classList.remove("ok"); btn.textContent = "Mark filed and paid";
      rows.forEach(function (r, i) {
        later(function () {
          rows.forEach(function (x) { x.classList.remove("lit"); }); r.classList.add("lit");
          var b = $("b", r); V.animateNumber(b, parseFloat(b.dataset.vat), { decimals: 2, prefix: "", from: 0, duration: 600 });
        }, 300 + i * 420);
      });
      later(function () { rows.forEach(function (x) { x.classList.remove("lit"); }); btn.disabled = false; }, 300 + rows.length * 420 + 300);
      btn.onclick = function () { btn.disabled = true; btn.classList.add("ok"); btn.textContent = "✓ Filed and paid, off your list"; };
      if (auto) later(function () { btn.onclick(); }, 300 + rows.length * 420 + 1600);
    },
    rt: function (p) {
      var lines = $$(".rt__line", p);
      var calc = function () {
        var sub = 0, sc = 0, rt = 0;
        lines.forEach(function (l) {
          var a = parseFloat(l.dataset.amt); sub += a;
          if ($("[data-t=sc]", l).getAttribute("aria-pressed") === "true") sc += a * 0.1;
          if ($("[data-t=rt]", l).getAttribute("aria-pressed") === "true") rt += a * 0.1;
        });
        var o = { decimals: 2, prefix: "", duration: 500 };
        V.animateNumber($("[data-rt=sub]", p), sub, o);
        V.animateNumber($("[data-rt=sc]", p), sc, o);
        V.animateNumber($("[data-rt=rt]", p), rt, o);
        V.animateNumber($("[data-rt=tot]", p), sub + sc + rt, { decimals: 2, prefix: "TT$", duration: 500 });
      };
      $$(".tog", p).forEach(function (t) {
        t.onclick = function () { t.setAttribute("aria-pressed", t.getAttribute("aria-pressed") === "true" ? "false" : "true"); calc(); };
      });
      calc();
      if (auto) {
        var dinnerRt = $$(".rt__line", p)[1].querySelector("[data-t=rt]");
        later(function () { dinnerRt.click(); }, 1800);
        later(function () { dinnerRt.click(); }, 3600);
      }
    },
    firm: function (p) {
      var cards = $$(".firm__c", p), tot = $("[data-firm-tot]", p), n = $("[data-firm-n]", p);
      var calc = function () {
        var s = 0, c = 0;
        cards.forEach(function (k) { if (k.getAttribute("aria-pressed") === "true") { s += parseFloat(k.dataset.p); c++; } });
        n.textContent = c;
        V.animateNumber(tot, s, { decimals: 2, prefix: "TT$", duration: 600 });
      };
      cards.forEach(function (k) {
        k.onclick = function () { k.setAttribute("aria-pressed", k.getAttribute("aria-pressed") === "true" ? "false" : "true"); k.classList.toggle("sel"); calc(); };
        k.style.outline = "none";
      });
      tot.dataset.cur = 0; calc();
      if (auto) { later(function () { cards[3].click(); }, 1800); later(function () { cards[3].click(); }, 3800); }
    },
    imp: function (p) {
      var steps = $$(".imp__step", p), tb = $("[data-imp-tb]", p), diff = $(".imp__diff", p);
      steps.forEach(function (s) { s.classList.remove("on", "ok"); });
      tb.textContent = "TT$0.00"; tb.dataset.cur = 0; diff.classList.remove("on");
      steps.forEach(function (s, i) {
        later(function () { s.classList.add("on"); }, 200 + i * 520);
        later(function () { s.classList.remove("on"); s.classList.add("ok"); }, 200 + i * 520 + 420);
      });
      later(function () { V.animateNumber(tb, 1284553.20, { decimals: 2, prefix: "TT$", from: 0, duration: 1400 }); }, 200 + steps.length * 520);
      later(function () { diff.classList.add("on"); }, 200 + steps.length * 520 + 1500);
    }
  };
  // selected state for firm cards that start on
  $$(".firm__c[aria-pressed=true]").forEach(function (k) { k.classList.add("sel"); });

  var feat = $("#feat");
  if (feat) {
    var tabs = $$(".feat__tab", feat), panels = $$(".feat__panel", feat), cur = 0, autoTimer = null, seen = false;
    var DUR = 9000;
    var activate = function (i, focus) {
      clearTimers();
      tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i ? "true" : "false"); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) {
        p.hidden = k !== i; p.classList.remove("show");
        var fl = p.querySelector(".flip"); if (fl) fl.classList.remove("flipped");
      });
      cur = i;
      var p = panels[i];
      void p.offsetWidth; p.classList.add("show");
      demos[p.dataset.demo](p);
      if (focus) tabs[i].focus();
      if (window.innerWidth < 1040) tabs[i].scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
      scheduleAuto();
    };
    var scheduleAuto = function () {
      clearTimeout(autoTimer);
      if (!auto || reduce) return;
      feat.style.setProperty("--dur", DUR + "ms");
      autoTimer = setTimeout(function () { activate((cur + 1) % tabs.length); }, DUR);
    };
    var stopAuto = function () {
      if (!auto) return;
      auto = false; clearTimeout(autoTimer); feat.classList.add("paused");
      $$(".prog", feat).forEach(function (pr) { pr.style.display = "none"; });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { stopAuto(); activate(i); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (k) { e.preventDefault(); stopAuto(); activate((i + k + tabs.length) % tabs.length, true); }
      });
    });
    $$(".stage", feat).forEach(function (s) { s.addEventListener("pointerdown", stopAuto); });
    $$(".flipbtn", feat).forEach(function (b) { b.addEventListener("click", stopAuto); });
    if (reduce) auto = false;
    V.onVisible(feat, function () { if (!seen) { seen = true; activate(0); } }, { threshold: 0.25 });
    // pause autoplay while off screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!seen) return; if (e.isIntersecting) scheduleAuto(); else clearTimeout(autoTimer); });
      }, { threshold: 0 }).observe(feat);
    }
  }

  /* ---- course player: loads YouTube only when asked ---- */
  var player = $("#player");
  if (player) {
    var play = function (t) {
      player.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/DyGMU4hZ6CI?autoplay=1&rel=0&start=' + t + '" title="VIKI Books: the full course" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    };
    $$("#course [data-t]").forEach(function (b) {
      b.addEventListener("click", function () {
        play(parseInt(b.dataset.t, 10) || 0);
        if (window.innerWidth < 1000) player.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      });
    });
  }
})();
