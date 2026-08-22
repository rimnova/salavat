const countDisplay = document.getElementById('countDisplay');
const clickBtn = document.getElementById('clickBtn');
const resetBtn = document.getElementById('resetBtn');
const minusBtn = document.getElementById('minusBtn');
const bestCount = document.getElementById('bestCount');

let count = 0;
let best = parseInt(localStorage.getItem('clickBest') || '0', 10);

function toPersianDigits(num) {
  const persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(num).replace(/\d/g, d => persian[d]);
}

function render() {
  countDisplay.textContent = toPersianDigits(count);
  bestCount.textContent = toPersianDigits(best);
}

function updateBest() {
  if (count > best) {
    best = count;
    localStorage.setItem('clickBest', best);
  }
}

clickBtn.addEventListener('click', () => {
  count++;
  updateBest();
  render();
});

minusBtn.addEventListener('click', () => {
  if (count > 0) count--;
  render();
});

resetBtn.addEventListener('click', () => {
  count = 0;
  render();
});

render();
