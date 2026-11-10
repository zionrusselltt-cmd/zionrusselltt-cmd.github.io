/* VIKI Bookings page: 3D hero, front desk, room calendar, channels, till, recon, real-screen ring */
(function () {
  "use strict";
  var V = window.VIKI, reduce = V.reduce;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "TT$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  /* ---- hero layers lift as you scroll ---- */
  var hero = $("#hero3d");
  if (hero && !reduce) {
    var tick = false;
    var upd = function () { var p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.75))); hero.style.setProperty("--e", (0.35 + p * 0.85).toFixed(3)); tick = false; };
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---- front desk ---- */
  var fd = $("#fd");
  if (fd) {
    var bump = function (key, d) {
      var b = $("[data-fd=" + key + "]", fd); b.textContent = String(parseInt(b.textContent, 10) + d);
      b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); setTimeout(function () { b.classList.remove("bump"); }, 350);
    };
    $$("[data-fd-in]", fd).forEach(function (btn) {
      btn.addEventListener("click", function () { var g = btn.closest(".guest"); g.classList.add("done"); btn.textContent = "✓ Checked in"; btn.setAttribute("aria-disabled", "true"); bump("arr", -1); bump("in", 1); });
    });
    $$("[data-fd-out]", fd).forEach(function (btn) {
      btn.addEventListener("click", function () { var g = btn.closest(".guest"); g.classList.add("done"); btn.textContent = "✓ Checked out"; btn.setAttribute("aria-disabled", "true"); bump("lea", -1); bump("in", -1); });
    });
  }

  /* ---- room calendar ---- */
  var grid = $("#calGrid"), msg = $("#calMsg");
  if (grid) {
    var DAYS = 14;
    var rooms = [["Apartment 1", "Apartment"], ["Apartment 2", "Apartment"], ["Deluxe 5", "Deluxe room"], ["Deluxe 6", "Deluxe room"], ["Deluxe 7", "Deluxe room"], ["Penthouse 9", "Penthouse"]];
    var bookings = [
      [0, 0, 3, "Rohan Singh", ""], [0, 6, 4, "Emma Clarke", ""], [0, 11, 3, "Tariq Hosein", ""],
      [1, 2, 3, "Ravi Persad", ""], [1, 9, 2, "Leah Thompson", "web"],
      [2, 1, 2, "Camille Baptiste", "p"], [2, 5, 3, "Kevin Ali", ""],
      [3, 3, 3, "Grace Bishop", ""], [3, 8, 4, "Natalie Brathwaite", ""],
      [4, 0, 2, "Andre Joseph", ""], [4, 4, 2, "Sophie Laurent", "p"], [4, 10, 3, "Owen Phillips", ""],
      [5, 1, 4, "Keisha Alleyne", ""], [5, 7, 3, "Daniel Mohammed", ""]
    ].map(function (b) { return { room: b[0], start: b[1], nights: b[2], name: b[3], type: b[4] }; });
    var newGuests = ["Priya Ramdial", "James Whitfield", "Marcus Charles", "Aaliyah Ramsaran", "Jonathan Lee", "Shanice Edwards", "Kerry-Ann Joseph"];
    var gi = 0;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var dayDate = function (d) { var x = new Date(today); x.setDate(x.getDate() + d); return x; };
    var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var label = function (d) { var x = dayDate(d); return DOW[x.getDay()] + " " + x.getDate() + " " + MON[x.getMonth()]; };

    var html = '<div></div>';
    for (var d = 0; d < DAYS; d++) {
      var dt = dayDate(d), we = dt.getDay() === 0 || dt.getDay() === 6;
      html += '<div class="cal__d' + (d === 0 ? " today" : "") + (we ? " we" : "") + '">' + DOW[dt.getDay()] + '<b>' + dt.getDate() + '</b></div>';
    }
    rooms.forEach(function (r, ri) {
      html += '<div class="cal__room" style="grid-row:' + (ri + 2) + '">' + r[0] + '<small>' + r[1] + '</small></div>';
      for (var d2 = 0; d2 < DAYS; d2++) html += '<button type="button" class="cal__cell" style="grid-row:' + (ri + 2) + ';grid-column:' + (d2 + 2) + '" data-r="' + ri + '" data-d="' + d2 + '" aria-label="' + r[0] + ", " + label(d2) + '"></button>';
      html += '<div class="cal__lane" style="grid-row:' + (ri + 2) + ';grid-column:2 / -1;position:relative;pointer-events:none" data-lane="' + ri + '"></div>';
    });
    grid.innerHTML = html;

    var place = function (b) {
      var lane = $('[data-lane="' + b.room + '"]', grid);
      var el = document.createElement("div");
      el.className = "cal__bk" + (b.type ? " " + b.type : "");
      el.style.left = "calc(" + (b.start / DAYS * 100) + "% + 2px)";
      el.style.width = "calc(" + (b.nights / DAYS * 100) + "% - 4px)";
      el.style.top = "5px";
      el.innerHTML = b.name + "<small>" + (b.type === "p" ? "Pending" : b.type === "web" ? "From a booking site" : b.type === "n" ? "Just booked · " + b.nights + (b.nights > 1 ? " nights" : " night") : "Confirmed") + "</small>";
      lane.appendChild(el); b.el = el;
      return el;
    };
    bookings.forEach(place);
    var taken = function (room, day) { return bookings.filter(function (b) { return b.room === room && day >= b.start && day < b.start + b.nights; })[0]; };
    var say = function (cls, text) { msg.className = "cal__msg " + cls; msg.innerHTML = text; };

    grid.addEventListener("click", function (e) {
      var c = e.target.closest(".cal__cell"); if (!c) return;
      var r = +c.dataset.r, d = +c.dataset.d, hit = taken(r, d);
      if (hit) {
        hit.el.classList.remove("no"); void hit.el.offsetWidth; hit.el.classList.add("no");
        setTimeout(function () { hit.el.classList.remove("no"); }, 700);
        say("no", "✕ <b>" + rooms[r][0] + "</b> is already taken on " + label(d) + " by " + hit.name + ". VIKI won't double-book it.");
        return;
      }
      var nights = 1;
      while (nights < 3 && d + nights < DAYS && !taken(r, d + nights)) nights++;
      var b = { room: r, start: d, nights: nights, name: newGuests[gi++ % newGuests.length], type: "n" };
      bookings.push(b); place(b);
      say("ok", "✓ Booked <b>" + rooms[r][0] + "</b> for " + b.name + ", " + label(d) + ", " + nights + (nights > 1 ? " nights" : " night") + ". A confirmation email goes out by itself.");
    });
  }

  /* ---- channels: bookings fly in ---- */
  var chan = $("#chan"), list = $("#chanList");
  if (chan && list) {
    var srcs = $$(".chan__src span", chan);
    var feed = [
      [0, "Priya Ramdial", "Deluxe 5 · 2 nights"], [1, "Emma Clarke", "Apartment 1 · 4 nights"], [2, "Kevin Ali", "Deluxe 5 · 3 nights"],
      [3, "Owen Phillips", "Deluxe 7 · 3 nights"], [0, "Grace Bishop", "Deluxe 6 · 3 nights"], [4, "Leah Thompson", "Apartment 2 · 2 nights"],
      [2, "Tariq Hosein", "Apartment 1 · 3 nights"], [0, "Keisha Alleyne", "Penthouse 9 · 4 nights"]
    ];
    var fi = 0, timer = null;
    var add = function (animate) {
      var f = feed[fi++ % feed.length], s = srcs[f[0]], color = getComputedStyle(s).getPropertyValue("--c").trim();
      var push = function () {
        var it = document.createElement("div");
        it.className = "chan__item"; it.style.setProperty("--c", color);
        it.innerHTML = "<span><b>" + f[1] + "</b><small>" + f[2] + " · from " + s.textContent.trim() + "</small></span><em>Confirmation sent</em>";
        list.insertBefore(it, list.firstChild);
        while (list.children.length > 5) list.removeChild(list.lastChild);
      };
      s.classList.add("ping"); setTimeout(function () { s.classList.remove("ping"); }, 700);
      if (!animate || reduce || innerWidth < 700) { push(); return; }
      var cr = chan.getBoundingClientRect(), sr = s.getBoundingClientRect(), lr = list.getBoundingClientRect();
      var fl = document.createElement("i"); fl.className = "flyer"; fl.style.setProperty("--c", color);
      fl.style.left = (sr.right - cr.left - 10) + "px"; fl.style.top = (sr.top - cr.top + sr.height / 2 - 7) + "px";
      chan.appendChild(fl);
      var dx = lr.left - sr.right + 40, dy = (lr.top + 20) - (sr.top + sr.height / 2);
      var anim = fl.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 40) + "px) scale(1.3)", opacity: 1 }, { transform: "translate(" + dx + "px," + dy + "px) scale(.6)", opacity: 0 }], { duration: 800, easing: "cubic-bezier(.4,0,.2,1)" });
      anim.onfinish = function () { fl.remove(); push(); };
    };
    for (var k = 0; k < 3; k++) add(false);
    if ("IntersectionObserver" in window && !reduce) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { clearInterval(timer); if (e.isIntersecting) timer = setInterval(function () { add(true); }, 2200); });
      }, { threshold: 0.3 }).observe(chan);
    }
  }

  /* ---- restaurant and bar till ---- */
  var till = $("#tillApp");
  if (till) {
    var cur = 1, orders = {}, sent = {};
    var title = $("#tillTitle"), ticket = $("#ticket"), totEl = $("#tillTot"), send = $("#tillSend"), payBtns = $$("[data-pay]", till);
    var kitchen = $("#kitchen"), kmsg = $("#kitchenMsg"), ktimer = null;
    var toast = function (t) { kmsg.textContent = t; kitchen.classList.add("on"); clearTimeout(ktimer); ktimer = setTimeout(function () { kitchen.classList.remove("on"); }, 2600); };
    var render = function () {
      var o = orders[cur] || [], tot = 0;
      title.textContent = "Table " + cur;
      if (!o.length) ticket.innerHTML = '<div class="empty">Tap items to add them</div>';
      else ticket.innerHTML = o.map(function (x) { tot += x.p; return "<div><span>" + x.name + "</span><span>" + money(x.p) + "</span></div>"; }).join("");
      ticket.scrollTop = ticket.scrollHeight;
      totEl.textContent = money(tot);
      send.disabled = !o.length || sent[cur] === o.length;
      payBtns.forEach(function (b) { b.disabled = !o.length; });
    };
    $$(".tbl", till).forEach(function (t) {
      t.addEventListener("click", function () {
        $$(".tbl", till).forEach(function (x) { x.classList.remove("sel"); });
        t.classList.add("sel"); cur = +t.dataset.tbl; render();
      });
    });
    $$("#menu-items button", till).forEach(function (b) {
      b.addEventListener("click", function () {
        var s = +b.dataset.s; if (s <= 0) return;
        b.dataset.s = s - 1; $("small span", b).textContent = s - 1;
        (orders[cur] = orders[cur] || []).push({ name: b.dataset.item, p: +b.dataset.p });
        render();
      });
    });
    send.addEventListener("click", function () {
      var o = orders[cur] || []; sent[cur] = o.length;
      var t = $('.tbl[data-tbl="' + cur + '"]', till); t.className = "tbl" + (t.classList.contains("round") ? " round" : "") + " eat sel";
      $("span", t).innerHTML = "<b>" + cur + "</b>" + money(o.reduce(function (a, x) { return a + x.p; }, 0)).replace("TT", "") + " · eating";
      toast("Kitchen screen: Table " + cur + ", " + o.length + (o.length > 1 ? " items" : " item"));
      render();
    });
    payBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var o = orders[cur] || [], tot = o.reduce(function (a, x) { return a + x.p; }, 0);
        var t = $('.tbl[data-tbl="' + cur + '"]', till), round = t.classList.contains("round");
        var how = b.dataset.pay;
        if (how === "tab") {
          t.className = "tbl" + (round ? " round" : "") + " tab sel";
          $("span", t).innerHTML = "<b>" + cur + "</b>" + money(tot).replace("TT", "") + " · on a tab";
          toast("Tab kept open for Table " + cur + ": " + money(tot));
        } else {
          t.className = "tbl" + (round ? " round" : "") + " sel";
          $("span", t).innerHTML = "<b>" + cur + "</b>Free";
          toast(how === "room" ? money(tot) + " charged to Room 5. It shows on the guest's bill." : "Paid: " + money(tot) + ". The recon has it already.");
        }
        orders[cur] = []; sent[cur] = 0; render();
      });
    });
    $('.tbl[data-tbl="1"]', till).classList.add("sel");
    render();
  }

  /* ---- recon ---- */
  var rec = $("#reconApp");
  if (rec) {
    var shifts = {
      pm: { total: 1785, totals: "5 transactions", hotel: 950, hotels: "2 payments", bar: 835, bars: "3 bills · 5 guests", exp: 775, cash: "817.00" },
      am: { total: 2140, totals: "7 transactions", hotel: 1600, hotels: "3 payments", bar: 540, bars: "4 bills · 6 guests", exp: 410, cash: "400.00" }
    };
    var shift = "pm", input = $("#cash", rec), res = $("#reconRes", rec);
    var calc = function () {
      var v = parseFloat(String(input.value).replace(/[^0-9.]/g, ""));
      var s = shifts[shift];
      if (isNaN(v)) { res.className = "recon__res even"; res.innerHTML = "<b>–</b><span>Type the cash you counted</span>"; return; }
      var diff = Math.round((v - s.exp) * 100) / 100;
      if (diff > 0) { res.className = "recon__res over"; res.innerHTML = "<b>+" + money(diff) + "</b><span>Over: more cash than expected</span>"; }
      else if (diff < 0) { res.className = "recon__res short"; res.innerHTML = "<b>−" + money(-diff) + "</b><span>Short: the drawer is missing cash</span>"; }
      else { res.className = "recon__res even"; res.innerHTML = "<b>" + money(0) + "</b><span>Spot on. The drawer balances.</span>"; }
    };
    var setShift = function (k) {
      shift = k; var s = shifts[k];
      $$(".recon__seg button", rec).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.shift === k ? "true" : "false"); });
      ["total", "hotel", "bar", "exp"].forEach(function (f) { V.animateNumber($("[data-r=" + f + "]", rec), s[f], { decimals: 2, prefix: "TT$", duration: 600 }); });
      $("[data-r=totals]", rec).textContent = s.totals; $("[data-r=hotels]", rec).textContent = s.hotels; $("[data-r=bars]", rec).textContent = s.bars;
      input.value = s.cash; calc();
    };
    $$("[data-r]", rec).forEach(function (el) { var n = parseFloat(el.textContent.replace(/[^0-9.]/g, "")); if (!isNaN(n)) el.dataset.cur = n; });
    $$(".recon__seg button", rec).forEach(function (b) { b.addEventListener("click", function () { setShift(b.dataset.shift); }); });
    input.addEventListener("input", calc);
    calc();
  }

  /* ---- real screens ring ---- */
  var ring = $("#ring");
  if (ring) {
    var inner = $(".ring__in", ring), items = $$(".ring__item", ring), cap = $("#ringCap");
    var n = items.length, step = 360 / n, idx = 0, angle = 0, autoT = null, interacted = false;
    var size = function () {
      var w = items[0].getBoundingClientRect().width || 500;
      ring.style.setProperty("--r", Math.round(w / (2 * Math.tan(Math.PI / n)) + 40) + "px");
      items.forEach(function (it) { it.style.setProperty("--r", Math.round(w / (2 * Math.tan(Math.PI / n)) + 40) + "px"); });
    };
    var show = function () {
      inner.style.setProperty("--a", angle + "deg");
      idx = ((Math.round(-angle / step) % n) + n) % n;
      items.forEach(function (it, i) { it.classList.toggle("front", i === idx); });
      cap.innerHTML = items[idx].dataset.cap + "<small>" + items[idx].dataset.sub + "</small>";
    };
    var go = function (dir) { angle -= dir * step; show(); };
    var stop = function () { interacted = true; clearInterval(autoT); };
    $("#ringNext").addEventListener("click", function () { stop(); go(1); });
    $("#ringPrev").addEventListener("click", function () { stop(); go(-1); });
    var sx = 0, sa = 0, dragging = false;
    ring.addEventListener("pointerdown", function (e) { stop(); dragging = true; sx = e.clientX; sa = angle; ring.classList.add("drag"); ring.setPointerCapture(e.pointerId); });
    ring.addEventListener("pointermove", function (e) { if (!dragging) return; angle = sa + (e.clientX - sx) * 0.25; inner.style.setProperty("--a", angle + "deg"); });
    var end = function () { if (!dragging) return; dragging = false; ring.classList.remove("drag"); angle = Math.round(angle / step) * step; show(); };
    ring.addEventListener("pointerup", end); ring.addEventListener("pointercancel", end);
    ring.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { stop(); go(1); } if (e.key === "ArrowLeft") { stop(); go(-1); } });
    size(); show(); addEventListener("resize", size);
    if (!reduce && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { clearInterval(autoT); if (e.isIntersecting && !interacted) autoT = setInterval(function () { go(1); }, 3800); });
      }, { threshold: 0.4 }).observe(ring);
    }
  }
})();
