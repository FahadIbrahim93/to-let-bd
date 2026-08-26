/**
 * To-Let landing — light interactions
 * Floating tags, smooth scroll anchors, form, mobile nav, micro-polish
 */

(function () {
  "use strict";

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
      document.querySelectorAll(".role-btn").forEach((b) => b.classList.remove("active"));
      document.querySelector('.role-btn[data-role="renter"]').classList.add("active");
      selectedRole = "renter";
      refreshCount();

      submitBtn.disabled = false;
      submitBtn.textContent = "Join the waitlist →";
    });
  }

  // ---------- Subtle card entrance (IntersectionObserver) ----------
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const cards = document.querySelectorAll(
      ".feature-card, .price-card, .pin-card, .compare-card, .float-card"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = entry.target.style.transform || "";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transition = "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      observer.observe(card);
    });
  }
})();
