const root = document.documentElement;
root.classList.add("js");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const motionButton = document.getElementById("motion-control");
const motionLabel = document.getElementById("motion-label");
const header = document.getElementById("site-header");
const hero = document.getElementById("top");
const progress = document.getElementById("reading-progress");
const indicator = document.getElementById("chapter-indicator");
const reveals = [...document.querySelectorAll(".reveal")];
let storedMotion = null;
try {
  storedMotion = localStorage.getItem("pf-flow-motion");
} catch {
  /* Optional storage. */
}
let motion = !reduced.matches && storedMotion !== "off";
let world = null;
let frame = 0;
let evening = false;

function setMotion(value, save = false) {
  motion = value && !reduced.matches;
  root.dataset.motion = motion ? "on" : "off";
  motionButton.setAttribute("aria-pressed", String(motion));
  motionButton.setAttribute(
    "aria-label",
    motion ? "Pause decorative motion" : "Enable decorative motion",
  );
  motionLabel.textContent = motion ? "Motion on" : "Motion off";
  motionButton.disabled = reduced.matches;
  motionButton.title = reduced.matches
    ? "Paused by your system motion preference"
    : motionButton.getAttribute("aria-label");
  world?.setMotion(motion);
  if (!motion) {
    reveals.forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.style.transform = "";
    });
  }
  if (save) {
    try {
      localStorage.setItem("pf-flow-motion", motion ? "on" : "off");
    } catch {
      /* Optional storage. */
    }
  }
}
setMotion(motion);
motionButton.addEventListener("click", () => setMotion(!motion, true));
reduced.addEventListener("change", () => {
  let preference = null;
  try {
    preference = localStorage.getItem("pf-flow-motion");
  } catch {
    /* Optional storage. */
  }
  setMotion(!reduced.matches && preference !== "off");
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -20px 0px" },
  );
  reveals.forEach((el) => observer.observe(el));
} else reveals.forEach((el) => el.classList.add("is-visible"));

function updateScroll() {
  frame = 0;
  const y = scrollY;
  const total = root.scrollHeight - innerHeight;
  progress.style.transform =
    "scaleX(" + (total > 0 ? Math.min(y / total, 1) : 0) + ")";
  header.classList.toggle("is-scrolled", y > hero.offsetHeight - 120);
  const contact = document.getElementById("contact").getBoundingClientRect();
  const work = document.getElementById("work").getBoundingClientRect();
  if (contact.top < innerHeight * 0.5) {
    indicator.innerHTML = 'Back to our world <span aria-hidden="true">↑</span>';
    indicator.setAttribute("href", "#top");
  } else if (work.top < innerHeight * 0.5 && work.bottom > innerHeight * 0.3) {
    indicator.innerHTML =
      'Your next little world <span aria-hidden="true">↗</span>';
    indicator.setAttribute("href", "#contact");
  } else {
    indicator.innerHTML =
      'Explore the possibilities <span aria-hidden="true">↘</span>';
    indicator.setAttribute("href", "#work");
  }
}
function queueScroll() {
  if (!frame) frame = requestAnimationFrame(updateScroll);
}
window.addEventListener("scroll", queueScroll, { passive: true });
window.addEventListener("resize", queueScroll, { passive: true });
queueScroll();
document.getElementById("year").textContent = String(new Date().getFullYear());

import("./world.js")
  .then(({ createWorld }) => {
    try {
      world = createWorld({
        canvas: document.getElementById("world-canvas"),
        enabled: motion,
      });
      world.setMood(evening);
    } catch {
      document.getElementById("world").dataset.renderer = "fallback";
      root.classList.remove("webgl-ready");
      document
        .querySelectorAll(".webgl-media")
        .forEach((el) => el.classList.remove("webgl-media"));
    }
  })
  .catch(() => {
    document.getElementById("world").dataset.renderer = "fallback";
  });

document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener(
    "pointermove",
    (event) => {
      if (!motion || !finePointer.matches) return;
      const r = el.getBoundingClientRect();
      el.style.transform =
        "translate(" +
        ((event.clientX - r.left - r.width / 2) * 0.12).toFixed(2) +
        "px," +
        ((event.clientY - r.top - r.height / 2) * 0.16).toFixed(2) +
        "px)";
    },
    { passive: true },
  );
  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });
});
document.getElementById("mood-button").addEventListener("click", () => {
  evening = !evening;
  document
    .getElementById("mood-button")
    .setAttribute("aria-pressed", String(evening));
  document.getElementById("mood-label").textContent = evening
    ? "Back to daylight"
    : "A change of light";
  root.classList.toggle("is-evening", evening);
  world?.setMood(evening);
});

const menu = document.getElementById("site-menu");
const menuToggle = document.getElementById("menu-toggle");
let destination = null;
menuToggle.addEventListener("click", () => {
  menu.showModal();
  document.body.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");
  document.getElementById("menu-close").focus();
});
document
  .getElementById("menu-close")
  .addEventListener("click", () => menu.close());
menu.addEventListener("close", () => {
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  if (destination) {
    const target = destination;
    destination = null;
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
      once: true,
    });
  } else menuToggle.focus({ preventScroll: true });
});
menu.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    destination = target;
    menu.close();
    history.replaceState(null, "", link.getAttribute("href"));
    target.scrollIntoView({ behavior: motion ? "smooth" : "instant" });
  });
});

const filters = [...document.querySelectorAll(".filter-button")];
const cards = [...document.querySelectorAll(".work-card")];
let filterTimer = 0,
  arrivalTimer = 0;
filters.forEach((button) =>
  button.addEventListener("click", () => {
    clearTimeout(filterTimer);
    clearTimeout(arrivalTimer);
    const selected = button.dataset.filter;
    filters.forEach((filter) => {
      filter.classList.toggle("is-active", filter === button);
      filter.setAttribute("aria-pressed", String(filter === button));
    });
    cards.forEach((card) => {
      card.classList.remove("is-arriving");
      if (!card.hidden) card.classList.add("is-leaving");
    });
    filterTimer = setTimeout(
      () => {
        let count = 0;
        cards.forEach((card, index) => {
          const shown =
            selected === "all" || card.dataset.category === selected;
          card.hidden = !shown;
          card.classList.remove("is-leaving");
          if (shown) {
            count++;
            card.style.animationDelay = motion ? index * 50 + "ms" : "0ms";
            card.classList.add("is-arriving");
          }
        });
        document.getElementById("filter-status").textContent =
          "Showing " +
          count +
          " studio concept" +
          (count === 1 ? "" : "s") +
          (selected === "all"
            ? "."
            : " in " + button.childNodes[0].textContent.trim() + ".");
        world?.refresh();
        queueScroll();
        arrivalTimer = setTimeout(
          () => {
            cards.forEach((card) => card.classList.remove("is-arriving"));
            world?.refresh();
          },
          motion ? 1000 : 0,
        );
      },
      motion ? 230 : 0,
    );
  }),
);

const range = document.getElementById("comparison-range");
range.addEventListener("input", () => {
  document
    .getElementById("comparison-frame")
    .style.setProperty("--split", range.value + "%");
  range.setAttribute(
    "aria-valuetext",
    range.value + "% redesigned website revealed",
  );
});
document.querySelectorAll(".project-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (
      !motion ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    root.classList.add("is-navigating");
    setTimeout(() => location.assign(link.href), 450);
  });
});
window.addEventListener("pageshow", () =>
  root.classList.remove("is-navigating"),
);

const form = document.getElementById("project-brief");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const business = String(values.get("business") || "").trim();
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
    String(values.get("email") || "").trim() +
    "\n\nThank you!";
  const mailto =
    "mailto:patchflowstudio@gmail.com?subject=" +
    encodeURIComponent("Free website sample — " + business) +
    "&body=" +
    encodeURIComponent(body);
  const fallback = document.getElementById("email-fallback");
  fallback.href = mailto;
  fallback.hidden = false;
  document.getElementById("brief-status").textContent =
    "Your draft is ready. Send it from your email app. If nothing opened, use the link below or email us directly.";
  location.href = mailto;
});
