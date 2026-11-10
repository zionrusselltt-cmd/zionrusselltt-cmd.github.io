/* Home page: scroll-scrubbed hero video on the browser's own scrolling (no smooth-scroll library) */
(function () {
  "use strict";
  var bgVideo = document.getElementById("bgv");
  var STATIC_HERO = matchMedia("(max-width: 768px), (hover: none), (prefers-reduced-motion: reduce)");
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  function scrollLimit() { return Math.max(1, document.documentElement.scrollHeight - innerHeight); }

  /* ---- gated seeks (deadlock-safe) ---- */
  var seekBusy = false, pendingTime = null, lastVideoT = -1;
  function requestSeek(t) {
    if (!bgVideo.duration) return;
    if (Math.abs(t - lastVideoT) < 0.02) return;   // under half a frame: skip the seek
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true; lastVideoT = t; bgVideo.currentTime = t;
  }
  bgVideo.addEventListener("seeked", function () {
    seekBusy = false;
    if (pendingTime !== null) { var t = pendingTime; pendingTime = null; requestSeek(t); }
  });
  bgVideo.addEventListener("error", function () {
    seekBusy = false; pendingTime = null;
    document.body.classList.add("video-failed");
  });

  // one seek per painted frame at most, never inside the scroll event itself
  var queued = false;
  function scrubVideo() {
    if (!bgVideo.duration) return;
    var p = Math.min(1, Math.max(0, window.scrollY / scrollLimit()));
    requestSeek(p * (bgVideo.duration - 0.05));
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; scrubVideo(); });
  }

  async function initVideo() {
    document.querySelector(".mobile-poster").style.backgroundImage = "url('assets/img/poster.jpg')";
    if (STATIC_HERO.matches) return;
    try {
      var res = await fetch("assets/bg.mp4");
      if (!res.ok) throw new Error("video " + res.status);
      bgVideo.src = URL.createObjectURL(await res.blob());
      bgVideo.load();
      bgVideo.addEventListener("loadedmetadata", function () { scrubVideo(); document.body.classList.add("video-ready"); }, { once: true });
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll, { passive: true });
    } catch (e) { document.body.classList.add("video-failed"); }
  }
  initVideo();
  window.__bgv = bgVideo;

  /* ---- hero copy drifts away as you scroll ---- */
  if (hasGsap && !STATIC_HERO.matches) {
    gsap.to("#heroCopy", { opacity: 0, y: -80, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 20%", scrub: true } });
    gsap.to(".scroll-cue", { opacity: 0, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "20% top", scrub: true } });
    addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
})();
