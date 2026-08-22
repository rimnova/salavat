(() => {
  "use strict";

  const TOTAL_BEADS = 33;
  const STORAGE_KEY = "salavat_state_v1";

  const faDigits = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];
  const toFa = (n) => String(n).split("").map(ch => (ch >= "0" && ch <= "9") ? faDigits[ch] : ch).join("");

  const countDisplay = document.getElementById("countDisplay");
  const roundCountEl = document.getElementById("roundCount");
  const bestCountEl = document.getElementById("bestCount");
  const beadRing = document.getElementById("beadRing");
  const clickBtn = document.getElementById("clickBtn");
  const minusBtn = document.getElementById("minusBtn");
  const resetBtn = document.getElementById("resetBtn");
  const counterWrap = document.querySelector(".counter-wrap");
  const salawatText = document.getElementById("salawatText");

  // ---- spoken salawat ----
  // Preferred: a real recorded voice at ./salawat.mp3 (add this file yourself —
  // see the README for where to get one). Falls back to on-device text-to-speech
  // automatically if the file isn't present.
  const SALAWAT_SPOKEN = "اللَّهُمَّ صَلِّ عَلَی مُحَمَّدٍ وَ آلِ مُحَمَّد وَ عَجِّل فَرَجَهُم";
  const salawatAudio = new Audio("salawat.mp3");
  salawatAudio.preload = "none";
  let audioFileUsable = true; // becomes false if salawat.mp3 fails to load

  let arabicVoice = null;
  function pickArabicVoice() {
    if (!("speechSynthesis" in window)) return;
    const voices = speechSynthesis.getVoices();
    arabicVoice = voices.find(v => /^ar/i.test(v.lang)) || null;
  }
  if ("speechSynthesis" in window) {
    pickArabicVoice();
    speechSynthesis.addEventListener("voiceschanged", pickArabicVoice);
  }

  function speakFallback() {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(SALAWAT_SPOKEN);
    utter.lang = arabicVoice ? arabicVoice.lang : "ar-SA";
    if (arabicVoice) utter.voice = arabicVoice;
    utter.rate = 0.82;
    utter.pitch = 1.0;
    salawatText.classList.add("playing");
    utter.onend = () => salawatText.classList.remove("playing");
    utter.onerror = () => salawatText.classList.remove("playing");
    speechSynthesis.speak(utter);
  }

  function playSalawat() {
    vibrate(10);
    if (audioFileUsable) {
      salawatAudio.currentTime = 0;
      salawatText.classList.add("playing");
      const playPromise = salawatAudio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
          audioFileUsable = false;
          salawatText.classList.remove("playing");
          speakFallback();
        });
      }
      return;
    }
    speakFallback();
  }

  salawatAudio.addEventListener("ended", () => salawatText.classList.remove("playing"));
  salawatAudio.addEventListener("error", () => { audioFileUsable = false; });

  salawatText.addEventListener("click", playSalawat);
  salawatText.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      playSalawat();
    }
  });

  // ---- state ----
  let state = {
    total: 0,      // all-time count within current round-cycle tracking
    inRound: 0,    // 0..32 progress within current round
    rounds: 0,     // completed rounds
    best: 0        // best total ever recorded
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed);
      }
    } catch (e) { /* ignore corrupt storage */ }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* storage unavailable */ }
  }

  // ---- build the bead ring ----
  const beads = [];
  function buildBeadRing() {
    beadRing.innerHTML = "";
    beads.length = 0;
    const radius = beadRing.parentElement.querySelector("#countDisplay") ?
      (beadRing.clientWidth / 2) : 110;
    const r = beadRing.clientWidth / 2 || 118;
    for (let i = 0; i < TOTAL_BEADS; i++) {
      const angle = (i / TOTAL_BEADS) * Math.PI * 2 - Math.PI / 2;
      const x = r + r * Math.cos(angle);
      const y = r + r * Math.sin(angle);
      const bead = document.createElement("div");
      bead.className = "bead";
      if (i === TOTAL_BEADS - 1) bead.classList.add("tassel");
      bead.style.left = x + "px";
      bead.style.top = y + "px";
      beadRing.appendChild(bead);
      beads.push(bead);
    }
  }

  function renderBeads() {
    beads.forEach((bead, i) => {
      bead.classList.toggle("lit", i < state.inRound);
    });
  }

  function vibrate(ms) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  function render() {
    countDisplay.textContent = toFa(state.total);
    roundCountEl.textContent = toFa(state.rounds);
    bestCountEl.textContent = toFa(state.best);
    renderBeads();
  }

  function pulseCount() {
    countDisplay.classList.remove("pulse");
    // force reflow to restart animation
    void countDisplay.offsetWidth;
    countDisplay.classList.add("pulse");
  }

  function flashRingComplete() {
    counterWrap.classList.add("ring-complete");
    setTimeout(() => counterWrap.classList.remove("ring-complete"), 550);
  }

  function spawnRipple(evt) {
    const rect = clickBtn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const size = Math.max(rect.width, rect.height);
    let x, y;
    if (evt && evt.touches && evt.touches[0]) {
      x = evt.touches[0].clientX - rect.left;
      y = evt.touches[0].clientY - rect.top;
    } else if (evt && typeof evt.clientX === "number" && evt.clientX !== 0) {
      x = evt.clientX - rect.left;
      y = evt.clientY - rect.top;
    } else {
      x = rect.width / 2;
      y = rect.height / 2;
    }
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (x - size / 2) + "px";
    ripple.style.top = (y - size / 2) + "px";
    clickBtn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  }

  function increment(evt) {
    state.total += 1;
    state.inRound += 1;
    if (state.inRound >= TOTAL_BEADS) {
      state.inRound = 0;
      state.rounds += 1;
      flashRingComplete();
      vibrate([15, 40, 15]);
    } else {
      vibrate(12);
    }
    if (state.total > state.best) state.best = state.total;
    saveState();
    render();
    pulseCount();
    spawnRipple(evt);
  }

  function decrement() {
    if (state.total <= 0) return;
    state.total -= 1;
    if (state.inRound > 0) {
      state.inRound -= 1;
    } else if (state.rounds > 0) {
      state.rounds -= 1;
      state.inRound = TOTAL_BEADS - 1;
    }
    saveState();
    render();
    vibrate(8);
  }

  function reset() {
    state.total = 0;
    state.inRound = 0;
    state.rounds = 0;
    // best score is preserved intentionally
    saveState();
    render();
  }

  // ---- events ----
  clickBtn.addEventListener("click", increment);
  minusBtn.addEventListener("click", decrement);
  resetBtn.addEventListener("click", () => {
    if (state.total === 0) { reset(); return; }
    const ok = window.confirm("شمارش فعلی صفر شود؟");
    if (ok) reset();
  });

  window.addEventListener("resize", () => {
    buildBeadRing();
    renderBeads();
  });

  // ---- init ----
  loadState();
  buildBeadRing();
  render();

  // ---- register service worker for offline use ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
})();
