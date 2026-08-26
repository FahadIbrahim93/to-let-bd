/**
 * To-Let — high-craft interactions
 * Organic multiplayer tags, spring physics, mouse parallax, magnetic buttons
 */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // ---------- Waitlist ----------
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
        ? n + " people have already joined the waitlist."
        : "Be the first to join the waitlist.";
  }
  refreshCount();

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
      const entry = { name: name, email: email, area: area, role: selectedRole, joinedAt: new Date().toISOString() };
      const list = getWaitlist();
      list.push(entry);
      saveWaitlist(list);
      msg.textContent = "You're on the list, " + name.split(" ")[0] + ". We'll email you when To-Let is live in your area.";
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

  if (reduced) return;

  // ---------- Organic multiplayer tags ----------
  const stage = document.querySelector(".hero");
  const tags = document.querySelectorAll(".mp-tag");
  if (stage && tags.length) {
    const motions = Array.from(tags).map(function (el, i) {
      return {
        el: el,
        x: 8 + Math.random() * 70,
        y: 12 + Math.random() * 55,
        vx: (Math.random() - 0.5) * 0.035,
        vy: (Math.random() - 0.5) * 0.028,
        rot: (Math.random() - 0.5) * 8,
        rotV: (Math.random() - 0.5) * 0.04,
        phase: Math.random() * Math.PI * 2
      };
    });

    function tickTags() {
      motions.forEach(function (m, i) {
        m.phase += 0.008 + i * 0.001;
        m.x += m.vx + Math.sin(m.phase) * 0.012;
        m.y += m.vy + Math.cos(m.phase * 0.9) * 0.01;
        m.rot += m.rotV;
        if (m.x < 2 || m.x > 88) m.vx *= -1;
        if (m.y < 4 || m.y > 72) m.vy *= -1;
        m.x = Math.max(2, Math.min(88, m.x));
        m.y = Math.max(4, Math.min(72, m.y));
        m.el.style.left = m.x + "%";
        m.el.style.top = m.y + "%";
        m.el.style.transform = "rotate(" + m.rot + "deg)";
      });
      requestAnimationFrame(tickTags);
    }
    requestAnimationFrame(tickTags);
  }

  // ---------- Mouse parallax on float card ----------
  const floatCard = document.querySelector(".float-card");
  if (floatCard && stage) {
    stage.addEventListener("mousemove", function (e) {
      const r = stage.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      floatCard.style.transform =
        "perspective(900px) rotateY(" + cx * 8 + "deg) rotateX(" + -cy * 6 + "deg) translateY(-4px)";
    });
    stage.addEventListener("mouseleave", function () {
      floatCard.style.transform = "";
    });
  }

  // ---------- Magnetic primary buttons ----------
  document.querySelectorAll(".btn-primary").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = "translate(" + x * 0.18 + "px, " + y * 0.22 + "px) scale(1.03)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
    });
  });

  // ---------- Staggered reveal ----------
  const revealEls = document.querySelectorAll(
    ".feature-card, .price-card, .pin-card, .compare-card, .float-card, .section-head, .hero-stats > *"
  );
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
  );
  revealEls.forEach(function (el, i) {
    el.style.setProperty("--delay", (i % 6) * 0.07 + "s");
    el.classList.add("will-reveal");
    io.observe(el);
  });

  // ---------- Soft cursor trail (desktop only) ----------
  if (window.matchMedia("(pointer: fine)").matches) {
    const trail = document.createElement("div");
    trail.className = "cursor-trail";
    document.body.appendChild(trail);
    var mx = 0, my = 0, tx = 0, ty = 0;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      trail.style.opacity = "1";
    });
    document.addEventListener("mouseleave", function () {
      trail.style.opacity = "0";
    });
    function trailLoop() {
      tx += (mx - tx) * 0.18;
      ty += (my - ty) * 0.18;
      trail.style.transform = "translate(" + tx + "px, " + ty + "px)";
      requestAnimationFrame(trailLoop);
    }
    requestAnimationFrame(trailLoop);
  }
})();
