const countDisplay = document.getElementById('countDisplay');
const clickBtn      = document.getElementById('clickBtn');
const resetBtn      = document.getElementById('resetBtn');
const minusBtn      = document.getElementById('minusBtn');
const bestCountEl   = document.getElementById('bestCount');
const roundCountEl  = document.getElementById('roundCount');
const beadRing      = document.getElementById('beadRing');
const counterWrap   = document.querySelector('.counter-wrap');

const BEADS = 33;
const RADIUS = 108; // px, matches .counter-wrap size (236/2 - bead margin)

let count = parseInt(localStorage.getItem('salawatCount') || '0', 10);
let best  = parseInt(localStorage.getItem('salawatBest')  || '0', 10);

/* ---- build the tasbih ring once ---- */
function buildRing() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < BEADS; i++) {
    const angle = (360 / BEADS) * i;
    const bead = document.createElement('div');
    bead.className = 'bead';
    bead.style.transform = `rotate(${angle}deg) translateY(-${RADIUS}px)`;
    frag.appendChild(bead);
  }
  // tassel marker at the top (start/end of the round)
  const tassel = document.createElement('div');
  tassel.className = 'bead tassel';
  tassel.style.transform = `rotate(0deg) translateY(-${RADIUS}px)`;
  frag.appendChild(tassel);
  beadRing.appendChild(frag);
}

function toPersianDigits(num) {
  const persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(num).replace(/\d/g, d => persian[d]);
}

function render() {
  const posInRound = count % BEADS;
  const rounds = Math.floor(count / BEADS);

  countDisplay.textContent = toPersianDigits(count);
  bestCountEl.textContent  = toPersianDigits(best);
  roundCountEl.textContent = toPersianDigits(posInRound === 0 && count > 0 ? BEADS : posInRound);

  const beads = beadRing.querySelectorAll('.bead:not(.tassel)');
  beads.forEach((b, i) => {
    b.classList.toggle('lit', i < (posInRound === 0 && count > 0 ? BEADS : posInRound));
  });

  counterWrap.classList.toggle('ring-complete', posInRound === 0 && count > 0);
}

function updateBest() {
  if (count > best) {
    best = count;
    localStorage.setItem('salawatBest', best);
  }
}

function persist() {
  localStorage.setItem('salawatCount', count);
}

function pulseCount() {
  countDisplay.classList.remove('pulse');
  void countDisplay.offsetWidth; // restart animation
  countDisplay.classList.add('pulse');
}

function spawnRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - size / 2;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - size / 2;

  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

clickBtn.addEventListener('click', (e) => {
  count++;
  updateBest();
  persist();
  render();
  pulseCount();
  spawnRipple(e);
  if (navigator.vibrate) navigator.vibrate(count % BEADS === 0 ? [30, 40, 30] : 12);
});

minusBtn.addEventListener('click', () => {
  if (count > 0) count--;
  persist();
  render();
});

resetBtn.addEventListener('click', () => {
  count = 0;
  persist();
  render();
});

buildRing();
render();
