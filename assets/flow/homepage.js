(() => {
  "use strict";
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const motionControl = document.getElementById("motion-control");
  const motionLabel = document.getElementById("motion-label");
  let savedMotion = null;
  try {
    savedMotion = localStorage.getItem("pf-flow-motion");
  } catch (_) {
    /* Storage is optional. */
  }
  let motionEnabled = !reducedMotion.matches && savedMotion !== "off";
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  const hero = document.getElementById("top");
  const header = document.getElementById("site-header");
  const scene = document.getElementById("hero-scene");
  const progress = document.getElementById("reading-progress");
  const revealElements = Array.from(document.querySelectorAll(".reveal"));

  function setMotion(enabled, save) {
    motionEnabled = enabled && !reducedMotion.matches;
    root.dataset.motion = motionEnabled ? "on" : "off";
    motionControl.setAttribute("aria-pressed", String(motionEnabled));
    motionControl.setAttribute(
      "aria-label",
      motionEnabled ? "Pause decorative motion" : "Enable decorative motion",
    );
    motionLabel.textContent = motionEnabled ? "Motion on" : "Motion off";
    motionControl.disabled = reducedMotion.matches;
    motionControl.title = reducedMotion.matches
      ? "Motion is paused by your system preference"
      : motionControl.getAttribute("aria-label");
    if (save) {
      try {
        localStorage.setItem("pf-flow-motion", motionEnabled ? "on" : "off");
      } catch (_) {
        /* Storage is optional. */
      }
    }
    if (!motionEnabled) {
      cancelAnimationFrame(frame);
      frame = 0;
      scene.style.transform = "";
      revealElements.forEach((element) => element.classList.add("is-visible"));
      document.querySelectorAll(".magnetic").forEach((element) => {
        element.style.transform = "";
      });
    } else {
      queueFrame();
    }
  }

  function drawFrame() {
    frame = 0;
    const scrollTop = window.scrollY;
    header.classList.toggle("is-scrolled", scrollTop > hero.offsetHeight - 100);
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform =
      "scaleX(" +
      (scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0) +
      ")";
    if (
      motionEnabled &&
      scrollTop < hero.offsetHeight + window.innerHeight * 0.2
    ) {
      currentX += (pointerX - currentX) * 0.075;
      currentY += (pointerY - currentY) * 0.075;
      const drift = Math.min(scrollTop * 0.1, hero.offsetHeight * 0.12);
      scene.style.transform =
        "translate3d(" +
        (currentX * 14).toFixed(2) +
        "px," +
        (currentY * 10 + drift).toFixed(2) +
        "px,0) scale(1.035)";
      if (Math.abs(pointerX - currentX) + Math.abs(pointerY - currentY) > 0.002)
        queueFrame();
    }
  }

  function queueFrame() {
    if (!frame) frame = requestAnimationFrame(drawFrame);
  }
  window.addEventListener("scroll", queueFrame, { passive: true });
  window.addEventListener("resize", queueFrame, { passive: true });
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (!motionEnabled || !finePointer.matches) return;
      const rect = hero.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
      queueFrame();
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    queueFrame();
  });
  motionControl.addEventListener("click", () =>
    setMotion(!motionEnabled, true),
  );
  reducedMotion.addEventListener("change", () => {
    let preference = null;
    try {
      preference = localStorage.getItem("pf-flow-motion");
    } catch (_) {
      /* Storage is optional. */
    }
    setMotion(!reducedMotion.matches && preference !== "off", false);
  });
  setMotion(motionEnabled, false);
  root.classList.add("intro-ready");
  document.getElementById("year").textContent = String(
    new Date().getFullYear(),
  );

  if ("IntersectionObserver" in window && motionEnabled) {
    root.classList.add("enhanced-motion");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -25px 0px" },
    );
    revealElements.forEach((element) => observer.observe(element));
  }

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener(
      "pointermove",
      (event) => {
        if (!motionEnabled || !finePointer.matches) return;
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
        element.style.transform =
          "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px)";
      },
      { passive: true },
    );
    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });

  const menu = document.getElementById("site-menu");
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const menuPreview = document.getElementById("menu-preview");
  let menuDestination = null;
  function closeMenu() {
    if (menu.open) menu.close();
  }
  menuToggle.addEventListener("click", () => {
    if (menu.open) return closeMenu();
    menu.showModal();
    document.body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuClose.focus();
  });
  menuClose.addEventListener("click", closeMenu);
  menu.addEventListener("close", () => {
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    if (menuDestination) {
      const target = menuDestination;
      menuDestination = null;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener(
        "blur",
        () => target.removeAttribute("tabindex"),
        { once: true },
      );
    } else {
      menuToggle.focus({ preventScroll: true });
    }
  });
  menu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      menuDestination = target;
      closeMenu();
      history.replaceState(null, "", link.getAttribute("href"));
      target.scrollIntoView({ behavior: motionEnabled ? "smooth" : "instant" });
    });
    function showPreview() {
      if (
        link.dataset.preview &&
        menuPreview.getAttribute("src") !== link.dataset.preview
      )
        menuPreview.src = link.dataset.preview;
    }
    link.addEventListener("mouseenter", showPreview);
    link.addEventListener("focus", showPreview);
  });

  const filters = Array.from(document.querySelectorAll(".filter-button"));
  const cards = Array.from(document.querySelectorAll(".work-card"));
  const workGrid = document.getElementById("work-grid");
  const filterStatus = document.getElementById("filter-status");
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      let visibleCount = 0;
      filters.forEach((filter) => {
        const active = filter === button;
        filter.classList.toggle("is-active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
      cards.forEach((card) => {
        const shown = selected === "all" || card.dataset.category === selected;
        card.hidden = !shown;
        if (shown) {
          visibleCount += 1;
          card.classList.add("is-visible");
        }
      });
      workGrid.classList.toggle("is-filtered", selected !== "all");
      filterStatus.textContent =
        "Showing " +
        visibleCount +
        " studio concept" +
        (visibleCount === 1 ? "" : "s") +
        (selected === "all" ? "." : " in " + button.textContent.trim() + ".");
      queueFrame();
    });
  });

  const moodButton = document.getElementById("mood-button");
  const moodLabel = document.getElementById("mood-label");
  moodButton.addEventListener("click", () => {
    const evening = hero.classList.toggle("is-evening");
    moodButton.setAttribute("aria-pressed", String(evening));
    moodLabel.textContent = evening ? "Back to daylight" : "Change the mood";
  });

  const comparisonRange = document.getElementById("comparison-range");
  const comparisonFrame = document.getElementById("comparison-frame");
  comparisonRange.addEventListener("input", () => {
    comparisonFrame.style.setProperty("--split", comparisonRange.value + "%");
    comparisonRange.setAttribute(
      "aria-valuetext",
      comparisonRange.value + "% redesigned website revealed",
    );
  });

  const form = document.getElementById("project-brief");
  const formStatus = document.getElementById("brief-status");
  const emailFallback = document.getElementById("email-fallback");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const business = String(values.get("business") || "").trim();
    const email = String(values.get("email") || "").trim();
    if (!business) {
      const field = document.getElementById("business-name");
      field.setCustomValidity("Please enter your business name.");
      field.reportValidity();
      field.addEventListener("input", () => field.setCustomValidity(""), {
        once: true,
      });
      return;
    }
    const body =
      "Hello Patch & Flow,\n\nI would love a free website sample for my business.\n\nBusiness name: " +
      business +
      "\nWhat we do: " +
      String(values.get("what") || "").trim() +
      "\nCurrent website or listing: " +
      String(values.get("link") || "").trim() +
      "\nMy email: " +
      email +
      "\n\nThank you!";
    const mailto =
      "mailto:patchflowstudio@gmail.com?subject=" +
      encodeURIComponent("Free website sample — " + business) +
      "&body=" +
      encodeURIComponent(body);
    emailFallback.href = mailto;
    emailFallback.hidden = false;
    formStatus.textContent =
      "Your email draft is ready. Send it from your email app. If nothing opened, use the link below or email us directly.";
    window.location.href = mailto;
  });
  queueFrame();
})();
