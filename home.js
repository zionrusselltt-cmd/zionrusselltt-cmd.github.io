/* Home page scroll story: the Port of Spain office tidies itself while VIKI does the work.
   Uses the browser's own scrolling, nothing is pinned. Later, the scroll video can replace the two frames. */
(function () {
  "use strict";
  var V = window.VIKI || {}, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var story = document.getElementById("story"), sceneEnd = document.getElementById("sceneEnd"), scene = document.getElementById("scene");
  var fx = document.getElementById("fx"), dash = document.getElementById("fxDash"), cal = document.getElementById("fxCal");
  var money = document.getElementById("fxMoney");
  var rcpts = fx ? fx.querySelectorAll(".fx__rcpt") : [], notes = fx ? fx.querySelectorAll(".fx__note") : [];
  var rows = fx ? fx.querySelectorAll(".fx__row") : [], calRows = cal ? cal.querySelectorAll("div") : [];
  var desktop = matchMedia("(min-width: 901px)");
  if (!story) return;

  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var ease = function (e) { return e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2; };
  var seg = function (p, a, b) { return ease(clamp((p - a) / (b - a))); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  var moneyShown = false;

  function render() {
    queued = false;
    var r = story.getBoundingClientRect(), vh = innerHeight, vw = innerWidth;
    var p = reduce ? 1 : clamp(-r.top / Math.max(1, r.height - vh));

    // the office: the scroll video when it is loaded, otherwise the two frames cross-fade with a slow push-in
    if (videoReady) {
      requestSeek(clamp(p / 0.92) * (video.duration - 0.05));
    } else {
      var tidy = seg(p, 0.2, 0.85);
      sceneEnd.style.opacity = tidy.toFixed(3);
      scene.style.setProperty("--zoom", (1 + 0.07 * seg(p, 0, 1)).toFixed(4));
    }
    // after the story, darken the office so the rest of the page reads cleanly
    var after = clamp((vh * 0.6 - r.bottom) / (vh * 0.6));
    scene.style.setProperty("--dim", after.toFixed(3));

    if (!fx || !desktop.matches) return;
    fx.style.opacity = (1 - after).toFixed(3);

    // dashboard rises out of the laptop and turns to face you
    var d = seg(p, 0.3, 0.52);
    var dx = mix(vw * 0.86, vw * 0.70, d), dy = mix(vh * 0.86, vh * 0.15, d);
    dash.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0) translate(-50%,0) perspective(900px) rotateX(" + mix(55, 0, d).toFixed(2) + "deg) scale(" + mix(0.22, 1, d).toFixed(3) + ")";
    dash.style.opacity = clamp(d * 3).toFixed(3);

    // receipts lift off the desk, get read, then fly into the dashboard
    var target = { x: vw * 0.70, y: vh * 0.32 };
    rcpts.forEach(function (el, i) {
      var cs = el.style;
      var sx = parseFloat(cs.getPropertyValue("--sx")) * vw, sy = parseFloat(cs.getPropertyValue("--sy")) * vh;
      var fxp = parseFloat(cs.getPropertyValue("--fx")) * vw, fyp = parseFloat(cs.getPropertyValue("--fy")) * vh;
      var rot = parseFloat(cs.getPropertyValue("--r"));
      var lift = seg(p, 0.08 + i * 0.04, 0.3 + i * 0.04);
      var into = seg(p, 0.5 + i * 0.025, 0.62 + i * 0.025);
      var x = mix(mix(sx, fxp, lift), target.x, into), y = mix(mix(sy, fyp, lift), target.y, into);
      var s = mix(mix(0.35, 1, lift), 0.2, into);
      el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%) perspective(800px) rotateX(" + mix(62, 0, lift).toFixed(2) + "deg) rotateZ(" + mix(rot, rot * 0.3, lift).toFixed(2) + "deg) scale(" + s.toFixed(3) + ")";
      el.style.opacity = (lift < 0.02 ? 0 : into > 0.8 ? (1 - into) / 0.2 : clamp(lift * 4)).toFixed(3);
      el.classList.toggle("read", lift > 0.96 && into < 0.1);
    });

    // sticky notes peel off and drop into the deadline calendar
    notes.forEach(function (el, i) {
      var cs = el.style;
      var sx = parseFloat(cs.getPropertyValue("--sx")) * vw, sy = parseFloat(cs.getPropertyValue("--sy")) * vh, rot = parseFloat(cs.getPropertyValue("--r"));
      var t = seg(p, 0.62 + i * 0.04, 0.76 + i * 0.04);
      var tx = vw * 0.70, ty = vh * 0.62;
      el.style.transform = "translate3d(" + mix(sx, tx, t).toFixed(1) + "px," + mix(sy, ty, t).toFixed(1) + "px,0) translate(-50%,-50%) perspective(800px) rotateX(" + mix(60, 0, Math.min(1, t * 2)).toFixed(2) + "deg) rotateZ(" + mix(rot, 0, t).toFixed(2) + "deg) scale(" + mix(0.45, 0.25, t).toFixed(3) + ")";
      el.style.opacity = (p < 0.55 ? 0 : t > 0.85 ? (1 - t) / 0.15 : clamp((p - 0.55) * 12)).toFixed(3);
    });

    // dashboard rows and calendar tick on in order
    var rowAt = [0.66, 0.72, 0.78, 0.84];
    rows.forEach(function (row, i) { row.classList.toggle("on", p > rowAt[i]); });
    cal.style.opacity = seg(p, 0.6, 0.7).toFixed(3);
    calRows.forEach(function (c, i) { c.classList.toggle("on", p > 0.74 + i * 0.035); });
    dash.classList.toggle("done", p > 0.9);
    if (p > 0.45 && !moneyShown && V.animateNumber) { moneyShown = true; V.animateNumber(money, 710339.67, { decimals: 2, prefix: "", from: 0, duration: 1600 }); }
  }

  /* ---- scroll video: loaded as a Blob on desktop only, gated seeks so it never piles up ---- */
  var video = document.getElementById("sceneVideo"), videoReady = false;
  var seekBusy = false, pendingTime = null, lastT = -1;
  function requestSeek(t) {
    if (Math.abs(t - lastT) < 0.02) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true; lastT = t; video.currentTime = t;
  }
  if (video) {
    video.addEventListener("seeked", function () { seekBusy = false; if (pendingTime !== null) { var t = pendingTime; pendingTime = null; requestSeek(t); } });
    video.addEventListener("error", function () { seekBusy = false; pendingTime = null; videoReady = false; scene.classList.remove("has-video"); });
    if (desktop.matches && !reduce) {
      fetch("assets/office.mp4").then(function (res) { if (!res.ok) throw 0; return res.blob(); }).then(function (b) {
        video.src = URL.createObjectURL(b);
        video.addEventListener("loadedmetadata", function () { videoReady = true; scene.classList.add("has-video"); scene.style.setProperty("--zoom", 1); render(); }, { once: true });
        video.load();
      }).catch(function () { /* the two frames stay */ });
    }
  }
  window.__sceneVideo = video;

  var queued = false;
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(render); } }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  render();

  // problem cards flip to "VIKI solves it" as they reach the middle of the screen
  var cards = document.querySelectorAll("[data-story-card]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var c = e.target; setTimeout(function () { c.classList.add("flipped"); }, 350); }
        else if (e.boundingClientRect.top > 0) e.target.classList.remove("flipped");
      });
    }, { rootMargin: "0px 0px -45% 0px", threshold: 0.6 });
    cards.forEach(function (c) { io.observe(c); });
  } else cards.forEach(function (c) { c.classList.add("flipped"); });
})();
