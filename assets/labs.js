// ModoForge Labs — Interactive Hero Ripples, Live Launcher Simulator, Playground & Scroll Reveal
// Like our Android apps, animations run only when visible and pause when the tab is hidden.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Hero Interactive Ripple & Horizon Canvas ----------
  const canvas = document.getElementById("forge-canvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    // Palette blends ModoForge Launcher (peach, lavender, mint) & VibeFluid (cyan, violet)
    const colors = ["255,201,168", "208,188,255", "180,240,210", "34,228,255", "123,92,255"];
    const rings = [];
    let width = 0, height = 0, dpr = 1, running = false, lastMove = 0, last = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drop(x, y, strength) {
      if (rings.length > 36) rings.shift();
      rings.push({
        x, y, t: 0,
        life: 2.3 + Math.random() * 0.8,
        max: 130 + strength * 120,
        c: colors[rings.length % colors.length]
      });
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      }
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, width, height);
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.t += dt;
        const p = r.t / r.life;
        if (p >= 1) { rings.splice(i, 1); continue; }
        const ease = 1 - Math.pow(1 - p, 3);
        for (let k = 0; k < 3; k++) {
          const radius = r.max * ease - k * 18;
          if (radius <= 0) continue;
          ctx.beginPath();
          ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r.c},${(1 - p) * (0.5 - k * 0.14)})`;
          ctx.lineWidth = 2 - k * 0.5;
          ctx.stroke();
        }
      }
      if (rings.length && !document.hidden) requestAnimationFrame(frame);
      else running = false;
    }

    const hero = canvas.parentElement;
    function point(e) {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
    hero.addEventListener("pointerdown", (e) => {
      const [x, y] = point(e);
      drop(x, y, 1);
    });
    hero.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastMove < 135) return;
      lastMove = now;
      const [x, y] = point(e);
      drop(x, y, 0.28);
    });

    window.addEventListener("resize", resize);
    resize();

    if (!reduceMotion) {
      let ambient = 0;
      const timer = setInterval(() => {
        if (document.hidden) return;
        drop(width * (0.12 + Math.random() * 0.55), height * (0.2 + Math.random() * 0.6), 0.48);
        if (++ambient >= 7) clearInterval(timer);
      }, 1350);
    }
  }

  // ---------- 2. Hero Dual-Phone 3D Tilt on Pointer Move ----------
  const stage = document.querySelector(".hero-stage");
  const tiltBox = document.querySelector(".stage-tilt");
  if (stage && tiltBox && !reduceMotion) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tiltBox.style.transform = `rotateY(${nx * 10}deg) rotateX(${-ny * 8}deg)`;
    });
    stage.addEventListener("pointerleave", () => {
      tiltBox.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  }

  // ---------- 3. Live Hero Launcher Home Modes Simulator ----------
  const MODES = {
    morning: {
      time: "07:30",
      date: "19°C · Clear dawn",
      event: "Morning walk · 08:00",
      goal: "Goal: Ship ModoForge 1.0",
      focus: false,
      apps: [
        { name: "Weather", usage: "4m" },
        { name: "Calendar", count: "2", usage: "8m" },
        { name: "Notes", usage: "6m" },
        { name: "Podcasts", usage: "22m" },
        { name: "Maps", usage: "" }
      ]
    },
    work: {
      time: "09:41",
      date: "22°C · Sunny",
      event: "In 15m · Design review",
      goal: "Goal: Ship ModoForge 1.0",
      focus: false,
      apps: [
        { name: "Messages", count: "3", usage: "14m", reply: "Alice · running late" },
        { name: "Calendar", count: "1", usage: "11m" },
        { name: "Notes", usage: "18m" },
        { name: "Gmail", count: "4", usage: "24m / 45m" },
        { name: "Camera", usage: "" }
      ]
    },
    evening: {
      time: "19:15",
      date: "18°C · Dusk",
      event: "Digest · 14 held alerts ready",
      goal: "Goal: Read 20 pages ✓",
      focus: false,
      apps: [
        { name: "Music", usage: "42m" },
        { name: "Kindle", usage: "35m" },
        { name: "Photos", usage: "9m" },
        { name: "Messages", count: "1", usage: "19m" },
        { name: "Phone", usage: "" }
      ]
    },
    focus: {
      time: "14:20",
      date: "Focus · until 16:00",
      event: "6 distracting apps paused",
      goal: "Deep work session active",
      focus: true,
      apps: [
        { name: "Notes", usage: "31m" },
        { name: "Calendar", usage: "12m" },
        { name: "Clock", usage: "" },
        { name: "Phone", usage: "" }
      ]
    }
  };

  const simEl = document.getElementById("hero-launcher-sim");
  const modeBtns = document.querySelectorAll("[data-sim-mode]");
  if (simEl && modeBtns.length) {
    const clockEl = document.getElementById("sim-clock");
    const dateEl = document.getElementById("sim-date");
    const eventEl = document.getElementById("sim-event");
    const goalEl = document.getElementById("sim-goal");
    const appsEl = document.getElementById("sim-apps");
    let userPickedMode = false;

    function renderMode(key) {
      const m = MODES[key] || MODES.work;
      modeBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.simMode === key)));
      simEl.classList.toggle("is-focus", !!m.focus);
      clockEl.textContent = m.time;
      dateEl.textContent = m.date;
      eventEl.textContent = m.event;
      goalEl.textContent = m.goal;
      appsEl.innerHTML = m.apps.map((a, idx) => `
        <li class="sim-app" style="animation-delay:${idx * 35}ms">
          <div class="sim-app-row">
            <span>${a.name}${a.count ? `<span class="sim-badge">${a.count}</span>` : ""}</span>
            ${a.usage ? `<span class="sim-usage">${a.usage}</span>` : ""}
          </div>
          ${a.reply ? `
            <div class="sim-reply-pill" role="button" tabindex="0" aria-label="Quick reply to Alice">
              <span>${a.reply}</span>
              <span class="reply-action">Reply ↵</span>
            </div>` : ""}
        </li>
      `).join("");

      const replyPill = appsEl.querySelector(".sim-reply-pill");
      if (replyPill) {
        replyPill.addEventListener("click", () => {
          replyPill.innerHTML = `<span>✓ Sent “On my way!” inline</span><span class="reply-action" style="color:var(--mint)">Done</span>`;
        });
      }
    }

    modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        userPickedMode = true;
        renderMode(btn.dataset.simMode);
      });
    });

    renderMode("work");

    if (!reduceMotion) {
      const order = ["work", "evening", "focus", "morning"];
      let idx = 0;
      setInterval(() => {
        if (userPickedMode || document.hidden) return;
        idx = (idx + 1) % order.length;
        renderMode(order[idx]);
      }, 4800);
    }
  }

  // ---------- 4. Interactive Launcher Playground Tabs ----------
  const pgTabs = document.querySelectorAll("[data-pg-tab]");
  const pgPanels = document.querySelectorAll("[data-pg-panel]");
  const pgViews = document.querySelectorAll("[data-pg-view]");

  pgTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.pgTab;
      pgTabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      pgPanels.forEach((p) => p.classList.toggle("active", p.dataset.pgPanel === target));
      pgViews.forEach((v) => v.classList.toggle("active", v.dataset.pgView === target));
    });
  });

  // Appearance playground live controls (Type Preset + Color Swatches)
  const previewSurface = document.getElementById("pg-look-surface");
  const typeBtns = document.querySelectorAll("[data-type-preset]");
  const colorBtns = document.querySelectorAll("[data-ink-color]");

  const TYPE_STYLES = {
    calm:      { family: 'system-ui, -apple-system, sans-serif', weight: '300', clockWeight: '200', spacing: '0em' },
    editorial: { family: 'Georgia, "Times New Roman", serif',    weight: '400', clockWeight: '300', spacing: '0.01em' },
    mono:      { family: 'ui-monospace, "SFMono-Regular", Menlo, monospace', weight: '400', clockWeight: '300', spacing: '0.04em' },
    bold:      { family: 'system-ui, -apple-system, sans-serif', weight: '600', clockWeight: '700', spacing: '-0.02em' },
    airy:      { family: 'system-ui, -apple-system, sans-serif', weight: '200', clockWeight: '100', spacing: '0.12em' }
  };

  if (previewSurface) {
    typeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = TYPE_STYLES[btn.dataset.typePreset] || TYPE_STYLES.calm;
        typeBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        previewSurface.style.fontFamily = preset.family;
        previewSurface.style.fontWeight = preset.weight;
        previewSurface.style.letterSpacing = preset.spacing;
        const clk = previewSurface.querySelector(".pg-clock");
        if (clk) clk.style.fontWeight = preset.clockWeight;
      });
    });

    colorBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const col = btn.dataset.inkColor;
        colorBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        previewSurface.style.color = col;
      });
    });
  }

  // Search Beyond Apps interactive command chips
  const cmdBtns = document.querySelectorAll("[data-search-cmd]");
  const omniInput = document.getElementById("omni-query");
  const omniResult = document.getElementById("omni-primary-result");
  const COMMAND_DEMOS = {
    math:  { q: "12 * 7",         title: "= 84",                       sub: "Instant calculator · Tap to copy result" },
    timer: { q: "timer 10",       title: "Set a timer for 10 minutes", sub: "Runs immediately in background · Enter to run" },
    call:  { q: "call Mom",       title: "Call Mom (Mobile)",          sub: "On-device contact match · Tap to dial or SMS" },
    note:  { q: "note Flight 6pm", title: "Save note: Flight 6pm",     sub: "Saved to Quick Notes on this phone" }
  };

  cmdBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = COMMAND_DEMOS[btn.dataset.searchCmd];
      if (!data || !omniInput || !omniResult) return;
      cmdBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      omniInput.textContent = data.q;
      omniResult.innerHTML = `<strong>${data.title}</strong><span>${data.sub}</span>`;
    });
  });

  // ---------- 5. Scroll-Reveal Observer ----------
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in-view"));
  }
})();
