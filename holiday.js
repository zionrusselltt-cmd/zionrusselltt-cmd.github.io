// VIKI Systems holiday season: gentle snow in the dark sign-up panels, and (where a section has data-snow="light")
// soft blue-grey flakes on a white background. Off for people who prefer less motion.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  [].forEach.call(document.querySelectorAll(".final, [data-snow]"), function (box) {
    var light = box.getAttribute("data-snow") === "light";
    var c = document.createElement("canvas");
    c.className = "snow" + (light ? " snow--light" : ""); c.setAttribute("aria-hidden", "true");
    if (light) box.appendChild(c); else box.insertBefore(c, box.firstChild);
    var ctx = c.getContext("2d"), flakes = [], w = 0, h = 0, run = false, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() {
      w = box.clientWidth; h = box.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(w * h / (light ? 14000 : 9000));
      flakes = [];
      for (var i = 0; i < n; i++) flakes.push({ x: Math.random() * w, y: Math.random() * h, r: (light ? 1.2 : .8) + Math.random() * 2.2, s: .2 + Math.random() * .5, d: Math.random() * 6.28 });
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        ctx.globalAlpha = light ? .35 + f.r / 7 : .35 + f.r / 5;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fillStyle = light ? "#A9BDD8" : "#fff"; ctx.fill();
      }
    }
    function tick() {
      if (!run) return;
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.s; f.d += .01; f.x += Math.sin(f.d) * .3;
        if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
      }
      draw();
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
