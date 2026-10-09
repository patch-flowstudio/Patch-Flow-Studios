const root = document.documentElement;
root.classList.add("js");
if (
  location.hash ||
  performance.getEntriesByType("navigation")[0]?.type === "back_forward"
) {
  root.classList.add("has-entered");
}
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
let currentChapter = "";
let evening = false;
document
  .querySelector(".title-line:last-child")
  ?.addEventListener("animationend", () => root.classList.add("has-entered"), {
    once: true,
  });

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
    root.classList.add("has-entered");
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
  // Read together before any style writes, then update only a changed chapter.
  const y = scrollY;
  const total = root.scrollHeight - innerHeight;
  const heroHeight = hero.offsetHeight;
  const contact = document.getElementById("contact").getBoundingClientRect();
  const work = document.getElementById("work").getBoundingClientRect();
  const chapter =
    contact.top < innerHeight * 0.5
      ? "contact"
      : work.top < innerHeight * 0.5 && work.bottom > innerHeight * 0.3
        ? "work"
        : "home";
  progress.style.transform =
    "scaleX(" + (total > 0 ? Math.min(y / total, 1) : 0) + ")";
  header.classList.toggle("is-scrolled", y > heroHeight - 120);
  if (chapter !== currentChapter) {
    const labels = {
      contact: ['Back to our world <span aria-hidden="true">↑</span>', "#top"],
      work: [
        'Your next little world <span aria-hidden="true">↗</span>',
        "#contact",
      ],
      home: [
        'Explore the possibilities <span aria-hidden="true">↘</span>',
        "#work",
      ],
    };
    indicator.innerHTML = labels[chapter][0];
    indicator.setAttribute("href", labels[chapter][1]);
    currentChapter = chapter;
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
      document.querySelectorAll(".webgl-media, .webgl-card").forEach((el) => {
        el.classList.remove("webgl-media", "webgl-card");
      });
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
window.addEventListener("pageshow", (event) => {
  root.classList.remove("is-navigating");
  if (event.persisted) root.classList.add("has-entered");
});

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
