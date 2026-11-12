/* VIKI product demos: builds the faux VIKI Books / VIKI Bookings screens into any
   <div class="vs-stage" data-vs="books|bookings"> and acts out a short story on a loop.
   Plays only while on screen; reduced motion shows the finished frame. No libraries. */
(function () {
  // ?vs=poster shows each demo's finished frame (the same frame reduced-motion visitors get)
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]vs=poster/.test(location.search);
  var TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
  var TICKW = TICK.replace('currentColor', '#fff');
  var CUR = '<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M5 3l15.5 9.6-6.8 1.5-3.7 6.3z" fill="#fff" stroke="#1A1F36" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var IN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></svg>';
  var OUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M16 17l5-5-5-5M21 12H9"/></svg>';
  var BED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/></svg>';
  var CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';

  var T = {};
  T.books =
    '<div class="vs-win">' +
      '<div class="vb-bar"><span class="vb-logo">viki<i>.</i>books</span><span class="vb-co"><b>CC</b>Coral Cove Guest House</span>' +
        '<span class="vb-tabs"><span class="on">Today</span><span>Sell</span><span>Spend</span><span>Bank</span><span>Taxes</span></span><span class="vb-new">+ New</span></div>' +
      '<div class="vb-body"><div class="vb-main">' +
        '<p class="vb-date">Wednesday 21 October · Coral Cove Guest House</p>' +
        '<p class="vb-hello">Morning Anjali. Coral Cove has <span class="bl">TT$710,340</span> in the bank, and <u>2 invoices are late</u>.</p>' +
        '<div class="vb-acts"><span class="pri">+ New invoice</span><span>Receive a payment</span><span data-t="expense">Record an expense</span></div>' +
        '<p class="vb-h">Your list for this week</p><p class="vb-sub">Worked out from your books. Tick a line when it is done.</p>' +
        '<div class="vb-row" data-t="row"><i class="ck">' + TICKW + '</i><span class="tx"><b>Chase Tobago Wedding Planners</b><small>INV-1032 · TT$8,775.00 · 1 day late</small></span><span class="lnk" data-t="remind"><em>Send a reminder</em><em>Reminder sent</em></span></div>' +
        '<div class="vb-row"><i class="ck">' + TICKW + '</i><span class="tx"><b>Pay PAYE and NIS for October</b><small>Due on the 15th</small></span><span class="lnk"><em>Open the pay run</em></span></div>' +
      '</div><div class="vb-side"><h6>At a glance</h6>' +
        '<div class="vb-card"><span>Money in the bank</span><b><s>TT$</s>710,339<em>.67</em></b><i class="bar"></i></div>' +
        '<div class="vb-card"><span>Customers owe you</span><b class="o2"><s>TT$</s>21,791<em>.25</em></b><i class="bar" style="width:58%"></i></div>' +
        '<div class="vb-card vb-card--vat" data-t="vat"><span>Your VAT return</span><span class="st"><i>Due in 35 days</i><i>Ready to check</i></span><small>Every box filled in, in the order of the BIR form</small></div>' +
      '</div></div>' +
    '</div>' +
    '<div class="vs-sat vs-rcpt" data-t="rcpt"><b>ISLAND HARDWARE</b><div class="c">22/10/2026 · #11902</div>' +
      '<div class="l"><span>PAINT 1GAL</span><span>245.00</span></div><div class="l"><span>BRUSH SET</span><span>6.56</span></div><div class="l"><span>VAT 12.5%</span><span>31.44</span></div>' +
      '<div class="t"><span>TOTAL</span><span>283.00</span></div><div class="scan"></div><div class="chip">' + TICK + 'Read: supplier, date and VAT</div></div>' +
    '<div class="vs-toast" data-t="toast"><i>' + TICKW + '</i>Expense saved: Island Hardware, TT$283.00</div>' +
    '<div class="vs-cur">' + CUR + '</div>';

  T.bookings =
    '<div class="vs-win vk-win">' +
      '<div class="vk-side"><div class="vk-hotel"><b>S</b>Sea Breeze Guest House</div>' +
        '<div class="vk-sec">Front desk</div>' +
        '<div class="vk-nav on" style="--c:#1E8FFF"><i></i>Today</div><div class="vk-nav" style="--c:#2BC46A"><i></i>Check-ins &amp; check-outs</div>' +
        '<div class="vk-nav" style="--c:#FF4D4F"><i></i>Room calendar</div><div class="vk-nav" style="--c:#FF9A1F"><i></i>Bookings</div>' +
        '<div class="vk-sec">Money</div>' +
        '<div class="vk-nav" style="--c:#2BC46A"><i></i><span class="bar" style="--w:70px"></span></div><div class="vk-nav" style="--c:#2BB0D6"><i></i><span class="bar" style="--w:96px"></span></div><div class="vk-nav" style="--c:#FF4D6D"><i></i><span class="bar" style="--w:58px"></span></div>' +
        '<div class="vk-sec">Restaurant &amp; bar</div>' +
        '<div class="vk-nav" style="--c:#FFA41F"><i></i>Restaurant &amp; bar</div><div class="vk-nav" style="--c:#7A5CFA"><i></i><span class="bar" style="--w:84px"></span></div>' +
      '</div>' +
      '<div class="vk-main">' +
        '<div class="vk-head"><div><h5>Good evening</h5><p>Thu, 5 Nov 2026 · Sea Breeze Guest House</p></div><span class="vk-btn">New booking</span></div>' +
        '<div class="vk-stats">' +
          '<div class="vk-stat" data-t="arr"><i style="--c:#2BC46A">' + IN + '</i><div><span class="n"><em>3</em><em>2</em></span><small>arriving today</small></div></div>' +
          '<div class="vk-stat"><i style="--c:#FF9A1F">' + OUT + '</i><div><span class="n"><em>1</em></span><small>leaving today</small></div></div>' +
          '<div class="vk-stat" data-t="occ"><i style="--c:#1E8FFF">' + BED + '</i><div><span class="n"><em>7</em><em>8</em></span><small>rooms occupied tonight</small></div></div>' +
        '</div>' +
        '<div class="vk-card"><h6>Arriving <a>Check-ins &amp; check-outs</a></h6>' +
          '<div class="vk-guest" data-t="g1"><div><b>Ravi Persad</b><small>Room 5 · 1 adult · owes TT$865.00</small></div><span class="vk-ci" data-t="ci"><em>Check in</em><em>' + TICK + 'Checked in</em></span></div>' +
          '<div class="vk-guest"><div><b>Andre Joseph</b><small>Room 6 · 1 adult · owes TT$940.00</small></div><span class="vk-ci"><em>Check in</em></span></div>' +
          '<div class="vk-guest"><div><b>Daniel Mohammed</b><span class="bar"></span></div><span class="vk-ci"><em>Check in</em></span></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="vs-sat vs-book" data-t="book"><span class="k"><i>' + CAL + '</i>New booking from your booking page</span><span class="nm">Kelly-Ann Joseph</span><span class="dt">Room 4 · 12 to 15 Nov · 2 adults</span>' +
      '<span class="go" data-t="confirm"><em>Confirm</em><em>' + TICK + 'Confirmed, email sent</em></span></div>' +
    '<div class="vs-cur">' + CUR + '</div>';

  // the story for each screen: [time in ms, action]. Loop length in L.
  var STORY = {
    books: { L: 14200, rest: [520, 690], steps: function (a) { return [
      [500, a.cur(true)],
      [1100, a.move("remind", .8, 1.25)],
      [2100, a.press(function () { a.on("row", "done"); })],
      [3200, a.move("expense", .9, .7)],
      [4200, a.press(function () { a.on("expense", "hit"); a.on("rcpt", "in"); })],
      [4500, function () { a.off("expense", "hit"); }],
      [5300, a.add("rcpt", "scan")],
      [6600, function () { a.on("rcpt", "read"); a.on("toast", "in"); }],
      [8000, a.move("vat", .88, .3)],
      [9000, a.press(function () { a.on("vat", "ready"); })],
      [9900, a.rest()],
      [12000, function () { a.cur(false)(); a.on("rcpt", "out"); a.off("toast", "in"); }],
      [12500, a.reset]
    ]; }, payoff: function (a) { a.on("row", "done"); a.on("rcpt", "in"); a.on("rcpt", "read"); a.on("toast", "in"); a.on("vat", "ready"); } },
    bookings: { L: 13600, rest: [640, 700], steps: function (a) { return [
      [500, a.cur(true)],
      [1100, a.move("ci", .9, .72)],
      [2100, a.press(function () { a.on("g1", "done"); a.on("arr", "roll"); a.on("occ", "roll"); })],
      [3200, a.rest()],
      [4000, a.add("book", "in")],
      [5600, a.move("confirm", .9, .7)],
      [6600, a.press(function () { a.on("book", "ok"); })],
      [7500, a.rest()],
      [11400, function () { a.cur(false)(); a.on("book", "out"); }],
      [11900, a.reset]
    ]; }, payoff: function (a) { a.on("g1", "done"); a.on("arr", "roll"); a.on("occ", "roll"); a.on("book", "in"); a.on("book", "ok"); } }
  };

  function setup(stage) {
    var kind = stage.getAttribute("data-vs");
    if (!T[kind]) return;
    stage.classList.add(kind === "bookings" ? "vs-stage--bk" : "vs-stage--b");
    var canvas = document.createElement("div");
    canvas.className = "vs-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.innerHTML = T[kind];
    stage.innerHTML = "";
    stage.appendChild(canvas);

    var cur = canvas.querySelector(".vs-cur"), story = STORY[kind], timers = [], running = false, visible = false;
    function el(k) { return canvas.querySelector('[data-t="' + k + '"]'); }
    function designW() { return stage.classList.contains("compact") ? 440 : 860; }
    function fit() {
      var w = stage.clientWidth;
      stage.classList.toggle("compact", w < 520);
      stage.style.setProperty("--s", (w / designW()).toFixed(4));
    }
    function setCur(x, y) { cur.style.transform = "translate(" + x + "px," + y + "px)"; }
    var a = {
      on: function (k, c) { var e = el(k); if (e) { e.classList.remove("out"); e.classList.add(c); } },
      off: function (k, c) { var e = el(k); if (e) e.classList.remove(c); },
      add: function (k, c) { return function () { a.on(k, c); }; },
      cur: function (show) { return function () { cur.classList.toggle("on", show); }; },
      // aim inside the target but off its words
      move: function (k, fx, fy) { return function () {
        var e = el(k); if (!e) return;
        var r = e.getBoundingClientRect(), c = canvas.getBoundingClientRect(), s = c.width / designW();
        setCur((r.left - c.left + r.width * fx) / s - 5, (r.top - c.top + r.height * fy) / s - 3);
      }; },
      press: function (fn) { return function () {
        cur.classList.add("press");
        setTimeout(function () { cur.classList.remove("press"); fn(); }, 150);
      }; },
      rest: function () { return function () { setCur(story.rest[0], story.rest[1]); }; },
      reset: function () {
        stage.classList.add("resetting");
        canvas.querySelectorAll(".done,.ready,.roll,.read,.scan,.ok,.in,.hit").forEach(function (n) {
          n.classList.remove("done", "ready", "roll", "read", "scan", "ok", "hit");
          if (n.classList.contains("vs-sat")) { n.classList.remove("in"); n.classList.add("out"); } else n.classList.remove("in");
        });
        setTimeout(function () { stage.classList.remove("resetting"); }, 400);
      }
    };
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function play() {
      clear();
      a.reset();
      cur.classList.remove("on");
      setCur(story.rest[0], story.rest[1]);
      setTimeout(function () { canvas.querySelectorAll(".vs-sat.out").forEach(function (n) { n.classList.remove("out"); }); }, 500);
      story.steps(a).forEach(function (s) { timers.push(setTimeout(s[1], s[0])); });
      timers.push(setTimeout(play, story.L));
    }
    function start() { if (running || reduce) return; running = true; play(); }
    function stop() { if (!running) return; running = false; clear(); }

    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(stage); else addEventListener("resize", fit);
    if (reduce) { story.payoff(a); return; }
    setCur(story.rest[0], story.rest[1]);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: .2 }).observe(stage);
    } else start();
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (visible) start(); });
  }

  document.querySelectorAll(".vs-stage[data-vs]").forEach(setup);
})();
