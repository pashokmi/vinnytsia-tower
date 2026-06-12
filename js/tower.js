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

  var sections = [];

  navLinks.forEach(function (link) {
    var id = link.hash ? link.hash.slice(1) : "";
    if (!id) return;
    var section = document.getElementById(id);
    if (!section) return;
    sections.push(section);
  });

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      var linkId = link.hash ? link.hash.slice(1) : "";
      var isActive = linkId === id;
      link.classList.toggle("tower-nav__link--active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateActiveNav() {
    if (!sections.length) return;

    var marker = window.scrollY + window.innerHeight * 0.28;
    var activeId = null;

    sections.forEach(function (section) {
      if (section.offsetTop <= marker) {
        activeId = section.id;
      }
    });

    setActiveNav(activeId || "");
  }

  var scrollTicking = false;

  window.addEventListener(
    "scroll",
    function () {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(function () {
        updateActiveNav();
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", updateActiveNav, { passive: true });
  updateActiveNav();

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

  var lightbox = document.getElementById("tower-lightbox");
  var lightboxImage = document.getElementById("tower-lightbox-image");
  var lightboxStage = document.getElementById("tower-lightbox-stage");
  var lightboxTitle = document.getElementById("tower-lightbox-title");
  var lightboxCredit = document.getElementById("tower-lightbox-credit");
  var lightboxCounter = document.getElementById("tower-lightbox-counter");
  var galleryTriggers = document.querySelectorAll(".tower-gallery__trigger");

  if (lightbox && lightboxImage && lightboxStage && galleryTriggers.length) {
    var slides = [];
    var activeIndex = 0;
    var lastFocus = null;
    var view = { scale: 1, x: 0, y: 0 };
    var drag = { active: false, startX: 0, startY: 0, originX: 0, originY: 0 };
    var touch = { startX: 0, startY: 0, moved: false };

    galleryTriggers.forEach(function (trigger, index) {
      var figure = trigger.closest(".tower-gallery__figure");
      if (!figure) return;

      var img = trigger.querySelector("img");
      var titleEl = figure.querySelector(".tower-gallery__caption-title");
      var creditEl = figure.querySelector(".tower-gallery__credit");

      slides.push({
        src: img ? img.getAttribute("src") : "",
        alt: img ? img.getAttribute("alt") : "",
        title: titleEl ? titleEl.textContent : img ? img.getAttribute("alt") : "",
        creditHtml: creditEl ? creditEl.innerHTML : "",
      });

      trigger.addEventListener("click", function () {
        openLightbox(index);
      });
    });

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function applyView() {
      lightboxImage.style.transform =
        "translate(calc(-50% + " + view.x + "px), calc(-50% + " + view.y + "px)) scale(" + view.scale + ")";
    }

    function resetView() {
      view.scale = 1;
      view.x = 0;
      view.y = 0;
      applyView();
    }

    function setZoom(nextScale) {
      view.scale = clamp(nextScale, 1, 4);
      if (view.scale === 1) {
        view.x = 0;
        view.y = 0;
      }
      applyView();
    }

    function renderSlide(index) {
      var slide = slides[index];
      if (!slide) return;

      activeIndex = index;
      lightboxImage.src = slide.src;
      lightboxImage.alt = slide.alt;
      lightboxTitle.textContent = slide.title;
      lightboxCredit.innerHTML = slide.creditHtml;
      lightboxCounter.textContent = index + 1 + " / " + slides.length;
      resetView();
    }

    function openLightbox(index) {
      lastFocus = document.activeElement;
      renderSlide(index);
      lightbox.hidden = false;
      lightbox.classList.add("tower-lightbox--open");
      document.body.classList.add("tower-page--lightbox-open");
      lightbox.querySelector(".tower-lightbox__close").focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.classList.remove("tower-lightbox--open");
      document.body.classList.remove("tower-page--lightbox-open");
      resetView();
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function showPrev() {
      var next = activeIndex - 1;
      if (next < 0) next = slides.length - 1;
      renderSlide(next);
    }

    function showNext() {
      var next = activeIndex + 1;
      if (next >= slides.length) next = 0;
      renderSlide(next);
    }

    lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });

    lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", showPrev);
    lightbox.querySelector("[data-lightbox-next]").addEventListener("click", showNext);
    lightbox.querySelector("[data-lightbox-zoom-in]").addEventListener("click", function () {
      setZoom(view.scale + 0.35);
    });
    lightbox.querySelector("[data-lightbox-zoom-out]").addEventListener("click", function () {
      setZoom(view.scale - 0.35);
    });
    lightbox.querySelector("[data-lightbox-zoom-reset]").addEventListener("click", resetView);

    lightboxStage.addEventListener(
      "wheel",
      function (event) {
        event.preventDefault();
        setZoom(view.scale + (event.deltaY < 0 ? 0.2 : -0.2));
      },
      { passive: false }
    );

    lightboxStage.addEventListener("pointerdown", function (event) {
      if (view.scale <= 1) return;
      drag.active = true;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.originX = view.x;
      drag.originY = view.y;
      lightboxStage.classList.add("tower-lightbox__stage--dragging");
      lightboxStage.setPointerCapture(event.pointerId);
    });

    lightboxStage.addEventListener("pointermove", function (event) {
      if (!drag.active) return;
      view.x = drag.originX + (event.clientX - drag.startX);
      view.y = drag.originY + (event.clientY - drag.startY);
      applyView();
    });

    function endDrag(event) {
      if (!drag.active) return;
      drag.active = false;
      lightboxStage.classList.remove("tower-lightbox__stage--dragging");
      if (event.pointerId) {
        try {
          lightboxStage.releasePointerCapture(event.pointerId);
        } catch (error) {
          /* ignore */
        }
      }
    }

    lightboxStage.addEventListener("pointerup", endDrag);
    lightboxStage.addEventListener("pointercancel", endDrag);

    lightboxStage.addEventListener(
      "touchstart",
      function (event) {
        if (event.touches.length !== 1) return;
        touch.startX = event.touches[0].clientX;
        touch.startY = event.touches[0].clientY;
        touch.moved = false;
      },
      { passive: true }
    );

    lightboxStage.addEventListener(
      "touchend",
      function (event) {
        if (view.scale > 1 || !event.changedTouches.length) return;
        var deltaX = event.changedTouches[0].clientX - touch.startX;
        var deltaY = event.changedTouches[0].clientY - touch.startY;
        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
        if (deltaX > 0) showPrev();
        else showNext();
      },
      { passive: true }
    );

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;

      if (event.key === "Escape") {
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrev();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    });
  }
})();
