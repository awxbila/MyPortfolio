// ── Intro splash overlay ──────────────────────────────────────────
(function () {
  const overlay = document.getElementById("intro-overlay");
  if (!overlay) return;

  const isReloadNavigation = (() => {
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (Array.isArray(navEntries) && navEntries.length > 0) {
        return navEntries[0].type === "reload";
      }
    } catch {
      // fallback handled below
    }

    try {
      return performance.navigation.type === 1;
    } catch {
      return false;
    }
  })();

  const jumpToHashTarget = () => {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;

    let target = null;
    const id = decodeURIComponent(hash.slice(1));
    if (id) target = document.getElementById(id);
    if (!target) {
      try {
        target = document.querySelector(hash);
      } catch {
        target = null;
      }
    }

    if (!target) return;

    const navbar = document.querySelector(".navbar");
    const navOffset = navbar
      ? Math.ceil(navbar.getBoundingClientRect().height) + 8
      : 0;
    const top =
      target.getBoundingClientRect().top + window.pageYOffset - navOffset;

    window.scrollTo({
      top: Math.max(0, Math.round(top)),
      left: 0,
      behavior: "auto",
    });
  };

  const skipIntroOnceKey = "awxbila:skip-intro-once";
  let skipIntroOnce = false;

  try {
    skipIntroOnce = sessionStorage.getItem(skipIntroOnceKey) === "1";
    if (skipIntroOnce) {
      sessionStorage.removeItem(skipIntroOnceKey);
    }
  } catch {
    skipIntroOnce = false;
  }

  // Skip intro only when user navigates back from project detail pages.
  const cameFromProjectPage = (() => {
    if (!document.referrer) return false;
    try {
      const referrerUrl = new URL(document.referrer);
      return (
        referrerUrl.origin === window.location.origin &&
        referrerUrl.pathname.includes("/projects/")
      );
    } catch {
      return false;
    }
  })();

  if (isReloadNavigation) {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  if (!isReloadNavigation && (cameFromProjectPage || skipIntroOnce)) {
    document.body.style.overflow = "hidden";

    // Keep overlay visible until hash landing is stable to avoid profile flash.
    requestAnimationFrame(() => {
      jumpToHashTarget();
      requestAnimationFrame(() => {
        jumpToHashTarget();
        overlay.remove();
        document.body.style.overflow = "";
        window.dispatchEvent(new Event("intro:finished"));
      });
    });

    return;
  }

  // lock scroll while intro plays
  document.body.style.overflow = "hidden";
  // shorter intro timing to keep the opening snappy
  setTimeout(() => {
    if (isReloadNavigation) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    }

    overlay.remove();
    document.body.style.overflow = "";
    window.dispatchEvent(new Event("intro:finished"));
  }, 3900);
})();

// Portfolio section is now swe only
const btnBD = document.getElementById("btn-bd");

// Typewriter replay every time profile section enters viewport
(function () {
  const profileSection = document.getElementById("profile");
  const typewriterSpan = document.querySelector(".typewriter-text");

  if (!profileSection || !typewriterSpan) return;

  const isIntroActive = () => Boolean(document.getElementById("intro-overlay"));

  // Freeze the typewriter while intro plays so the CSS animation never pre-completes.
  // Without this the animation finishes during the 3.9 s intro and the full text
  // flashes into view the moment the overlay is removed.
  if (isIntroActive()) {
    typewriterSpan.style.animation = "none";
  }

  const isProfileMostlyVisible = () => {
    const rect = profileSection.getBoundingClientRect();
    const visiblePx =
      Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    return visiblePx >= rect.height * 0.5;
  };

  function replayTypewriter() {
    typewriterSpan.style.animation = "none";
    typewriterSpan.offsetWidth; // force reflow
    // Play immediately (no delay) so it starts right when profile becomes visible
    typewriterSpan.style.animation =
      "typewriter 1.6s steps(19, end) forwards, cursor-blink 0.7s step-end 5";
  }

  window.addEventListener(
    "intro:finished",
    () => {
      if (isProfileMostlyVisible()) replayTypewriter();
    },
    { once: true },
  );

  if ("IntersectionObserver" in window) {
    const profileObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isIntroActive()) replayTypewriter();
        });
      },
      { threshold: 0.5 },
    );
    profileObserver.observe(profileSection);
  } else if (!isIntroActive()) {
    replayTypewriter();
  }
})();

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  const body = document.body;

  menu.classList.toggle("active");

  //toggle menu buka tutup dan pengguliran body
  if (menu.classList.contains("active")) {
    body.classList.add("menu-open");
    body.classList.remove("menu-closed");
    const menuHeight = menu.scrollHeight;
    body.style.marginTop = `${menuHeight}px`;
  } else {
    body.classList.remove("menu-open");
    body.classList.add("menu-closed");
    body.style.marginTop = "0";
  }
}

// Auto close menu saat link diklik
document.querySelectorAll("#mobileMenu a").forEach((link) => {
  link.addEventListener("click", () => {
    const menu = document.getElementById("mobileMenu");
    const body = document.body;

    menu.classList.remove("active");
    body.classList.remove("menu-open");
    body.classList.add("menu-closed");
    body.style.marginTop = "0";
  });
});

const aboutSection = document.getElementById("about");

if (aboutSection) {
  document.body.classList.add("about-scroll-ready");

  if ("IntersectionObserver" in window) {
    const aboutObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            aboutSection.classList.add("is-visible");
          } else {
            aboutSection.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.35,
      },
    );

    aboutObserver.observe(aboutSection);
  } else {
    aboutSection.classList.add("is-visible");
  }
}

const aboutImageWrap = document.querySelector(".about-img");
const aboutImage = aboutImageWrap?.querySelector("img");

if (aboutImageWrap && aboutImage) {
  const updateAboutImageSource = () => {
    aboutImageWrap.style.setProperty(
      "--about-image",
      `url("${aboutImage.src}")`,
    );
  };

  const updateSpotlightPosition = (event) => {
    const rect = aboutImageWrap.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    aboutImageWrap.style.setProperty(
      "--spot-x",
      `${Math.max(0, Math.min(100, x))}%`,
    );
    aboutImageWrap.style.setProperty(
      "--spot-y",
      `${Math.max(0, Math.min(100, y))}%`,
    );
  };

  updateAboutImageSource();

  if (!aboutImage.complete) {
    aboutImage.addEventListener("load", updateAboutImageSource, { once: true });
  }

  aboutImageWrap.addEventListener("pointerenter", (event) => {
    aboutImageWrap.classList.add("is-spotlight");
    updateSpotlightPosition(event);
  });

  aboutImageWrap.addEventListener("pointermove", updateSpotlightPosition);

  aboutImageWrap.addEventListener("pointerleave", () => {
    aboutImageWrap.classList.remove("is-spotlight");
  });
}

// experience section ------
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");
const filterButtons = document.querySelectorAll(".filter");
const filterSection = document.querySelector(".experience-filter");
const experienceEntries = document.querySelectorAll(
  "#experiences .experience-entry",
);

function updateExperienceFilter(filter) {
  experienceEntries.forEach((entry) => {
    entry.hidden = !entry.classList.contains(filter);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((btn) => btn.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.tab;

    contents.forEach((content) => {
      content.classList.remove("active");

      if (content.id === target) {
        content.classList.add("active");
      }
    });

    if (target === "experiences") {
      filterSection.style.display = "flex";
      const activeFilter =
        document.querySelector(".filter.active")?.dataset.filter;
      if (activeFilter) updateExperienceFilter(activeFilter);
    } else {
      filterSection.style.display = "none";
    }
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.dataset.filter;
    updateExperienceFilter(filter);
  });
});

const defaultExperienceFilter =
  document.querySelector(".filter.active")?.dataset.filter;
if (defaultExperienceFilter) {
  updateExperienceFilter(defaultExperienceFilter);
}

// ── Tool cards staggered scroll-in ──────────────────────────────
if ("IntersectionObserver" in window) {
  const toolCards = document.querySelectorAll(".tool-card");
  const pendingTimers = new Map();
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        const idx = parseInt(card.dataset.cardIdx, 10) || 0;
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            card.classList.add("card-visible");
            pendingTimers.delete(card);
          }, idx * 90);
          pendingTimers.set(card, timer);
        } else {
          const pending = pendingTimers.get(card);
          if (pending !== undefined) {
            clearTimeout(pending);
            pendingTimers.delete(card);
          }
          card.classList.remove("card-visible");
        }
      });
    },
    { threshold: 0.15 },
  );
  toolCards.forEach((card, i) => {
    card.dataset.cardIdx = i;
    cardObserver.observe(card);
  });
} else {
  document
    .querySelectorAll(".tool-card")
    .forEach((c) => c.classList.add("card-visible"));
}

const performaSection = document.getElementById("performa");
if (performaSection) {
  document.body.classList.add("performa-anim-ready");
  if ("IntersectionObserver" in window) {
    const performaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            performaSection.classList.add("is-visible");
          } else {
            performaSection.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.2 },
    );
    performaObserver.observe(performaSection);
  } else {
    performaSection.classList.add("is-visible");
  }
}

const softSkillsGrid = document.querySelector(".soft-skills-grid");
if (softSkillsGrid) {
  document.body.classList.add("soft-skills-anim-ready");

  if ("IntersectionObserver" in window) {
    const softSkillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            softSkillsGrid.classList.add("soft-visible");
          } else {
            softSkillsGrid.classList.remove("soft-visible");
          }
        });
      },
      { threshold: 0.32 },
    );

    softSkillsObserver.observe(softSkillsGrid);
  } else {
    softSkillsGrid.classList.add("soft-visible");
  }
}

// ── Project page section reveal ─────────────────────────────────
(function () {
  const projectWrap = document.querySelector("main.wrap");
  const projectTitle = projectWrap?.querySelector(".proj-title");

  if (!projectWrap || !projectTitle) return;

  const revealTargets = Array.from(
    projectWrap.querySelectorAll(".screenshots-grid, .desc-card, .proj-links"),
  );

  if (!revealTargets.length) return;

  document.body.classList.add("project-scroll-ready");

  const revealGroups = revealTargets.map((target, index) => {
    const sectionLabel = target.previousElementSibling?.classList.contains(
      "section-label",
    )
      ? target.previousElementSibling
      : null;

    const baseDelay = Math.min(index * 140, 280);

    target.classList.add("project-reveal-target");
    target.style.setProperty("--project-reveal-delay", `${baseDelay + 120}ms`);

    if (sectionLabel) {
      sectionLabel.classList.add("project-reveal-label");
      sectionLabel.style.setProperty(
        "--project-reveal-delay",
        `${baseDelay}ms`,
      );
    }

    target.dataset.projectRevealIndex = String(index);

    return {
      target,
      sectionLabel,
    };
  });

  if (!("IntersectionObserver" in window)) {
    revealGroups.forEach(({ target, sectionLabel }) => {
      sectionLabel?.classList.add("is-visible");
      target.classList.add("is-visible");
    });
    return;
  }

  const pendingTimers = new Map();

  const projectObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const groupIndex = parseInt(
          target.dataset.projectRevealIndex || "0",
          10,
        );
        const group = revealGroups[groupIndex];

        if (!group) return;

        const { sectionLabel } = group;

        if (entry.isIntersecting) {
          const timer = window.setTimeout(() => {
            sectionLabel?.classList.add("is-visible");
            target.classList.add("is-visible");
            pendingTimers.delete(target);
          }, 60);

          pendingTimers.set(target, timer);
        } else {
          const pending = pendingTimers.get(target);
          if (pending !== undefined) {
            clearTimeout(pending);
            pendingTimers.delete(target);
          }

          sectionLabel?.classList.remove("is-visible");
          target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.24,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  revealGroups.forEach(({ target }) => {
    projectObserver.observe(target);
  });
})();

// ── Experience / Certificates / Projects staggered scroll-reveal ─
(function () {
  if (!("IntersectionObserver" in window)) return;

  const allExpCards = Array.from(
    document.querySelectorAll(
      "#experiences .work-item, #experiences .org-item",
    ),
  );
  const allCertCards = Array.from(
    document.querySelectorAll("#certificates .certificate-card"),
  );
  const allProjCards = Array.from(
    document.querySelectorAll("#projects .certificate-card"),
  );

  const pendingTimers = new Map();

  function initCards(cards) {
    cards.forEach((card, i) => {
      card.dataset.expIdx = i;
      card.classList.add("exp-reveal");
    });
  }

  initCards(allExpCards);
  initCards(allCertCards);
  initCards(allProjCards);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        const idx = parseInt(card.dataset.expIdx, 10) || 0;
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            card.classList.add("is-visible");
            pendingTimers.delete(card);
          }, idx * 150);
          pendingTimers.set(card, timer);
        } else {
          const pending = pendingTimers.get(card);
          if (pending !== undefined) {
            clearTimeout(pending);
            pendingTimers.delete(card);
          }
          card.classList.remove("is-visible");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );

  [...allExpCards, ...allCertCards, ...allProjCards].forEach((card) =>
    observer.observe(card),
  );

  // Helper: re-animate a set of cards (called on tab/filter switch)
  function reAnimateCards(cards) {
    requestAnimationFrame(() => {
      cards.forEach((card, i) => {
        const pending = pendingTimers.get(card);
        if (pending !== undefined) {
          clearTimeout(pending);
          pendingTimers.delete(card);
        }
        card.classList.remove("is-visible");
        card.dataset.expIdx = i;
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const timer = setTimeout(() => {
            card.classList.add("is-visible");
            pendingTimers.delete(card);
          }, i * 150);
          pendingTimers.set(card, timer);
        }
      });
    });
  }

  // Re-animate experience cards when filter switches
  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const visibleExpCards = allExpCards.filter((card) => {
        const entry = card.closest(".experience-entry");
        return entry && !entry.hidden;
      });
      reAnimateCards(visibleExpCards);
    });
  });

  // Re-animate tab content when tab switches
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      if (target === "certificates") reAnimateCards(allCertCards);
      if (target === "projects") reAnimateCards(allProjCards);
      if (target === "experiences") {
        const activeFilter =
          document.querySelector(".filter.active")?.dataset.filter;
        const visibleExpCards = activeFilter
          ? allExpCards.filter((card) => {
              const entry = card.closest(".experience-entry");
              return entry && !entry.hidden;
            })
          : allExpCards;
        reAnimateCards(visibleExpCards);
      }
    });
  });
})();

// ── Download CV button reveal ──────────────────────────────────
(function () {
  if (!("IntersectionObserver" in window)) return;
  const btn = document.querySelector(".cv-btn-group");
  if (!btn) return;
  btn.classList.add("cv-reveal");
  const obs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
    },
    { threshold: 0.3 },
  );
  obs.observe(btn);
})();

// ── Contact grid left/right reveal ────────────────────────────
(function () {
  if (!("IntersectionObserver" in window)) return;
  const left = document.querySelector(".contact-left");
  const right =
    document.querySelector(".contact-form-wrap") ||
    document.querySelector(".contact-right") ||
    document.querySelector(".contact-grid > *:last-child");
  if (left) {
    left.classList.add("contact-side-reveal", "from-left");
  }
  if (right) {
    right.classList.add("contact-side-reveal", "from-right");
  }
  const targets = [left, right].filter(Boolean);
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // slight stagger: right side 120ms after left
          const delay = entry.target === right ? 120 : 0;
          setTimeout(() => entry.target.classList.add("is-visible"), delay);
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { threshold: 0.12 },
  );
  targets.forEach((el) => obs.observe(el));
})();

// ── Contact form submission ─────────────────────────────────────
(function () {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  const submitButton = contactForm.querySelector(".contact-submit");
  const submitText = submitButton?.querySelector("span");
  const successNotice = document.getElementById("contact-form-status");
  const errorNotice = document.getElementById("contact-form-error");
  const errorNoticeText = errorNotice?.querySelector("span");
  const defaultButtonText = submitText?.textContent || "Send Message";
  const defaultErrorText =
    errorNoticeText?.textContent ||
    "Sorry, your message couldn't be sent right now. Please try again in a moment.";

  const hideNotices = () => {
    successNotice?.setAttribute("hidden", "");
    errorNotice?.setAttribute("hidden", "");

    if (errorNoticeText) {
      errorNoticeText.textContent = defaultErrorText;
    }
  };

  const showErrorNotice = (message) => {
    if (errorNoticeText && message) {
      errorNoticeText.textContent = message;
    }

    errorNotice?.removeAttribute("hidden");
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!submitButton) return;

    hideNotices();

    if (window.location.protocol === "file:") {
      showErrorNotice(
        "This form cannot send from a local HTML file. Please run it through Live Server or open your deployed website URL.",
      );
      return;
    }

    submitButton.disabled = true;
    if (submitText) submitText.textContent = "Sending...";

    const formData = new FormData(contactForm);
    const senderEmail = String(formData.get("email") || "").trim();
    const senderSubject = String(formData.get("subject") || "").trim();

    if (senderEmail) {
      formData.append("_replyto", senderEmail);
    }

    if (senderSubject) {
      formData.set("_subject", `New portfolio message: ${senderSubject}`);
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      const requestSucceeded =
        response.ok && (!result || result.success !== "false");

      if (!requestSucceeded) {
        throw new Error(result?.message || "Request failed");
      }

      contactForm.reset();
      successNotice?.removeAttribute("hidden");
    } catch (error) {
      const rawMessage = String(error?.message || "").trim();

      if (/Activate Form/i.test(rawMessage)) {
        showErrorNotice(
          "Your FormSubmit form is not active yet. Please open nablahnur54@gmail.com inbox and click the 'Activate Form' link from FormSubmit.",
        );
      } else if (
        /open this page through a web server|browsed as HTML files/i.test(
          rawMessage,
        )
      ) {
        showErrorNotice(
          "This form cannot send when opened as a local HTML file. Please run it with Live Server or use your deployed website URL.",
        );
      } else if (/Failed to fetch|NetworkError/i.test(rawMessage)) {
        showErrorNotice(
          "Network error while sending the message. Please check your internet connection and try again.",
        );
      } else {
        showErrorNotice(defaultErrorText);
      }
    } finally {
      submitButton.disabled = false;
      if (submitText) submitText.textContent = defaultButtonText;
    }
  });
})();
