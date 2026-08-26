/**
 * To-Let — high-craft interactions
 * Multiplayer-style floating tags, mouse parallax, spring physics, ambient motion
 * Respects prefers-reduced-motion
 */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Mobile nav ----------
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- Role toggle ----------
  let selectedRole = "renter";
  document.querySelectorAll(".role-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".role-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      selectedRole = btn.dataset.role;
    });
  });

  // ---------- Waitlist (localStorage demo) ----------
  const STORAGE_KEY = "tolet-waitlist";

  function getWaitlist() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveWaitlist(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  function refreshCount() {
    const el = document.getElementById("socialProof");
    if (!el) return;
    const n = getWaitlist().length;
    el.textContent =
      n > 0
        ? `${n} people have already joined the waitlist.`
        : "Be the first to join the waitlist.";
  }

  refreshCount();

  // ---------- Signup form ----------
  const form = document.getElementById("signupForm");
  const msg = document.getElementById("formMsg");
  const submitBtn = document.getElementById("submitBtn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const area = document.getElementById("area").value.trim();

      if (!name || !email) {
        msg.textContent = "Please fill in your name and email.";
        msg.className = "form-msg err";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Joining…";

      const entry = {
        name,
        email,
        area,
        role: selectedRole,
        joinedAt: new Date().toISOString(),
      };

      const list = getWaitlist();
      list.push(entry);
      saveWaitlist(list);

      msg.textContent = `You're on the list, ${name.split(" ")[0]}. We'll email you when To-Let is live in your area.`;
      msg.className = "form-msg ok";
      form.reset();
      document.querySelectorAll(".role-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      const renterBtn = document.querySelector('.role-btn[data-role="renter"]');
      if (renterBtn) {
        renterBtn.classList.add("active");
        renterBtn.setAttribute("aria-pressed", "true");
      }
      selectedRole = "renter";
      refreshCount();

      submitBtn.disabled = false;
      submitBtn.textContent = "Join the waitlist →";
    });
  }

  // ---------- Entrance reveals ----------
  if (!reduceMotion) {
    const cards = document.querySelectorAll(
      ".feature-card, .price-card, .pin-card, .compare-card, .float-card"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    cards.forEach((card) => observer.observe(card));
  } else {
    document.querySelectorAll(".feature-card, .price-card, .pin-card, .compare-card, .float-card")
      .forEach((c) => c.classList.add("is-visible"));
  }

  // ---------- Hero interactive layer (Putty DNA) ----------
  if (reduceMotion) return;

  const hero = document.querySelector(".hero");
  const floatStage = document.querySelector(".float-stage");
  const floatCard = document.querySelector(".float-card");

  // --- Multiplayer-style floating tags with cursor pointers ---
  const tagData = [
    { name: "Rafiul", color: "#ff2d8b", bg: "#fff0f6" },
    { name: "Shirin", color: "#2ecc71", bg: "#f0fff4" },
    { name: "Kamal", color: "#9b59b6", bg: "#f3f0ff" },
    { name: "Nadia", color: "#f39c12", bg: "#fff8eb" },
    { name: "Arif", color: "#3498db", bg: "#eef6ff" },
  ];

  // Enhance existing HTML tags with pointer arrows
  document.querySelectorAll(".float-tag").forEach((tag, i) => {
    if (!tag.querySelector(".cursor-arrow")) {
      const arrow = document.createElement("span");
      arrow.className = "cursor-arrow";
      arrow.setAttribute("aria-hidden", "true");
      tag.prepend(arrow);
    }
  });

  // Soft mouse parallax on the listing card
  if (floatStage && floatCard) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    floatStage.addEventListener("mousemove", (e) => {
      const rect = floatStage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = ((e.clientX - cx) / rect.width) * 18;
      targetY = ((e.clientY - cy) / rect.height) * 14;
    });

    floatStage.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
    });

    function parallaxLoop() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      floatCard.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${currentX * 0.08}deg)`;
      requestAnimationFrame(parallaxLoop);
    }
    requestAnimationFrame(parallaxLoop);
  }

  // Soft magnetic hover on primary buttons
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) scale(1.04)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  // Ambient floating tags that slowly roam the hero (desktop only)
  if (hero && window.innerWidth > 900) {
    const ambient = document.createElement("div");
    ambient.className = "ambient-tags";
    ambient.setAttribute("aria-hidden", "true");
    hero.appendChild(ambient);

    const positions = [
      { top: "12%", left: "6%", delay: 0 },
      { top: "28%", left: "78%", delay: 1.4 },
      { top: "62%", left: "4%", delay: 2.8 },
      { top: "18%", left: "88%", delay: 0.7 },
      { top: "70%", left: "82%", delay: 2.1 },
    ];

    tagData.forEach((t, i) => {
      const el = document.createElement("div");
      el.className = "ambient-tag";
      el.style.setProperty("--tag-bg", t.bg);
      el.style.setProperty("--tag-color", t.color);
      el.style.top = positions[i].top;
      el.style.left = positions[i].left;
      el.style.animationDelay = positions[i].delay + "s";
      el.innerHTML = `<span class="cursor-arrow"></span><span class="dot" style="background:${t.color}"></span>${t.name}`;
      ambient.appendChild(el);
    });
  }

  // Gentle continuous float on existing .float-tag elements
  document.querySelectorAll(".float-tag").forEach((tag, i) => {
    tag.style.animationDelay = i * 0.9 + "s";
  });
})();
