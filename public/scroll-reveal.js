(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  // Soft parallax drift on full-bleed photos: elements opt in with
  // data-parallax="<px amplitude>" and get a small translateY tied to
  // their position in the viewport. Their CSS gives them ~15-18%
  // overscan so the shift never reveals an edge.
  function initParallax() {
    if (reduceMotion) return;
    var items = document.querySelectorAll("[data-parallax]");
    if (!items.length) return;

    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return; // skip offscreen work
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) / vh;
        var strength = parseFloat(el.getAttribute("data-parallax")) || 20;
        el.style.transform = "translateY(" + (offset * strength).toFixed(1) + "px)";
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  // Thin gradient bar under the nav that fills with scroll progress —
  // a light-touch way to give the long homepage a sense of momentum.
  function initScrollProgress() {
    var bar = document.getElementById("nav-progress");
    if (!bar) return;

    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, progress)) + ")";
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  function init() {
    initReveal();
    initParallax();
    initScrollProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
