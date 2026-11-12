(() => {
  "use strict";

  const doc = document;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header + scroll progress ---------- */
  const header = doc.getElementById("header");
  const progress = doc.querySelector(".scroll-progress span");

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);

    if (progress) {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(y / max, 1) * 100 : 0) + "%";
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealItems = doc.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && revealItems.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-in"));
  }

  /* ---------- Nav: active link ---------- */
  const navLinks = Array.from(doc.querySelectorAll('.nav a[href^="#"]'));
  const sections = navLinks
    .map((link) => doc.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => spy.observe(section));
  }

  /* ---------- Mobile menu ---------- */
  const toggle = doc.querySelector(".menu-toggle");
  const nav = doc.getElementById("nav");

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    doc.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!event.target.closest(".nav") && !event.target.closest(".menu-toggle")) {
        closeMenu();
      }
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  /* ---------- Reviews carousel ---------- */
  const track = doc.querySelector("[data-carousel]");

  if (track) {
    const cards = Array.from(track.children);
    const prevBtn = doc.querySelector("[data-prev]");
    const nextBtn = doc.querySelector("[data-next]");
    const dotsWrap = doc.querySelector("[data-dots]");
    const buttons = [];

    const stepSize = () => {
      if (cards.length < 2) return cards[0]?.offsetWidth || 1;
      return cards[1].offsetLeft - cards[0].offsetLeft;
    };

    const currentIndex = () => {
      const step = stepSize();
      if (!step) return 0;
      return Math.round(track.scrollLeft / step);
    };

    const goTo = (index) => {
      const clamped = Math.max(0, Math.min(index, cards.length - 1));
      const left = cards[clamped].offsetLeft - track.offsetLeft;
      track.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
    };

    const syncUI = () => {
      const index = currentIndex();
      buttons.forEach((button, i) => {
        button.classList.toggle("is-active", i === index);
      });
      const maxScroll = track.scrollWidth - track.clientWidth - 2;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll;
    };

    if (dotsWrap) {
      cards.forEach((_, i) => {
        const dot = doc.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Vélemény ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
        buttons.push(dot);
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(currentIndex() - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(currentIndex() + 1));

    let scrollFrame = null;
    track.addEventListener("scroll", () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        syncUI();
        scrollFrame = null;
      });
    });

    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(currentIndex() + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(currentIndex() - 1);
      }
    });

    window.addEventListener("resize", () => {
      syncUI();
    });

    syncUI();
  }

  /* ---------- Hero parallax ---------- */
  const heroPhoto = doc.querySelector(".hero-photo");
  const hero = doc.querySelector(".hero");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (heroPhoto && hero && canHover && !reduceMotion) {
    let frame = null;
    let targetX = 0;
    let targetY = 0;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * -14;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -14;

      if (frame) return;
      frame = requestAnimationFrame(() => {
        heroPhoto.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
        frame = null;
      });
    });

    hero.addEventListener("pointerleave", () => {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      heroPhoto.style.transform = "";
    });
  }

  /* ---------- Year ---------- */
  const year = doc.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
