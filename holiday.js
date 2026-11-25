// VIKI Systems holiday season: gentle snow in the dark sign-up panels. Off for people who prefer less motion.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  [].forEach.call(document.querySelectorAll(".final"), function (box) {
    var c = document.createElement("canvas");
    c.className = "snow"; c.setAttribute("aria-hidden", "true");
    box.insertBefore(c, box.firstChild);
    var ctx = c.getContext("2d"), flakes = [], w = 0, h = 0, run = false, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() {
      w = box.clientWidth; h = box.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(w * h / 9000);
      flakes = [];
      for (var i = 0; i < n; i++) flakes.push({ x: Math.random() * w, y: Math.random() * h, r: .8 + Math.random() * 2.2, s: .25 + Math.random() * .6, d: Math.random() * 6.28 });
    }
    function tick() {
      if (!run) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.s; f.d += .01; f.x += Math.sin(f.d) * .3;
        if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
        ctx.globalAlpha = .35 + f.r / 5;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fillStyle = "#fff"; ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    size();
    window.addEventListener("resize", size);
    new IntersectionObserver(function (es) {
      var on = es[0].isIntersecting;
      if (on && !run) { run = true; requestAnimationFrame(tick); } else if (!on) run = false;
    }).observe(box);
  });
})();
