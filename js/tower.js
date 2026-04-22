(function () {
  "use strict";

  var navToggle = document.querySelector(".tower-nav__toggle");
  var navList = document.querySelector(".tower-nav__list");
  var navLinks = document.querySelectorAll(".tower-nav__link");

  function closeNav() {
    if (!navToggle || !navList) return;
    navToggle.classList.remove("tower-nav__toggle--open");
    navList.classList.remove("tower-nav__list--open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navList.classList.toggle("tower-nav__list--open");
      navToggle.classList.toggle("tower-nav__toggle--open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      closeNav();
    });
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".tower-reveal");
    var titleEls = document.querySelectorAll(".tower-section__title--observe");

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("tower-reveal--in");
          io.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });

    var titleIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("tower-section__title--animated");
          titleIo.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.35, rootMargin: "0px" }
    );

    titleEls.forEach(function (el) {
      titleIo.observe(el);
    });
  } else {
    document.querySelectorAll(".tower-reveal").forEach(function (el) {
      el.classList.add("tower-reveal--in");
    });
    document.querySelectorAll(".tower-section__title--observe").forEach(function (el) {
      el.classList.add("tower-section__title--animated");
    });
  }
})();
