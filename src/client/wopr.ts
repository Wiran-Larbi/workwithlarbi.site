// WOPR grid animation — randomize → scan → idle flicker

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function rndLevel() {
  return Math.floor(Math.random() * 5);
}

function setLevel(cell: HTMLElement, level: number) {
  cell.style.setProperty('--wopr-level', String(level));
}

function animateGrid(heatmap: HTMLElement) {
  const cells = Array.from(heatmap.querySelectorAll<HTMLElement>('.wopr-cell'));
  if (!cells.length) return;

  if (reducedMotion) {
    cells.forEach((c) => setLevel(c, Number(c.dataset.real ?? 0)));
    return;
  }

  // Build week → cells map (order matches data-week attrs)
  const weekMap = new Map<number, HTMLElement[]>();
  cells.forEach((c) => {
    const w = Number(c.dataset.week);
    if (!weekMap.has(w)) weekMap.set(w, []);
    weekMap.get(w)!.push(c);
  });
  const weeks = [...weekMap.keys()].sort((a, b) => a - b);

  const locked = new Set<number>();

  // Phase 1: rapid random flicker across all cells
  cells.forEach((c) => setLevel(c, rndLevel()));

  const flickerTimer = setInterval(() => {
    cells.forEach((c) => {
      if (!locked.has(Number(c.dataset.week))) setLevel(c, rndLevel());
    });
  }, 50);

  // Phase 2: scan left→right after 700ms, locking each column to real data
  setTimeout(() => {
    let i = 0;
    const scanTimer = setInterval(() => {
      if (i >= weeks.length) {
        clearInterval(scanTimer);
        clearInterval(flickerTimer);
        startIdleFlicker(cells);
        return;
      }
      const wk = weeks[i++];
      locked.add(wk);
      weekMap.get(wk)!.forEach((c) => setLevel(c, Number(c.dataset.real ?? 0)));
    }, 16);
  }, 700);
}

function startIdleFlicker(cells: HTMLElement[]) {
  // Occasionally spike a random populated cell for a brief moment
  setInterval(() => {
    if (Math.random() > 0.25) return;
    const c = cells[Math.floor(Math.random() * cells.length)];
    const real = Number(c.dataset.real ?? 0);
    if (real === 0) return;
    setLevel(c, Math.min(4, real + 1 + Math.floor(Math.random() * 2)));
    setTimeout(() => setLevel(c, real), 80 + Math.random() * 100);
  }, 250);
}

function init() {
  const heatmap = document.querySelector<HTMLElement>('[data-wopr-heatmap]');
  if (!heatmap) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        animateGrid(heatmap);
      }
    },
    { threshold: 0.15 }
  );
  observer.observe(heatmap);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
