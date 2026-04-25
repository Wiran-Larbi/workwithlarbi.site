/** Activity terminal: typewriter lines → WOPR heatmap scan → log entries. */

// ── Utilities ────────────────────────────────────────────────────────────────

async function typeText(el: HTMLElement, text: string, speed: number, instant: boolean): Promise<void> {
  el.textContent = '';
  if (instant) { el.textContent = text; return; }
  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    await new Promise<void>((r) => setTimeout(r, speed));
  }
}

function pause(ms: number, instant: boolean): Promise<void> {
  return instant ? Promise.resolve() : new Promise((r) => setTimeout(r, ms));
}

// ── WOPR grid animation ──────────────────────────────────────────────────────

function rnd() { return Math.floor(Math.random() * 5); }
function setLevel(cell: HTMLElement, level: number) {
  cell.style.setProperty('--wopr-level', String(level));
}

function animateGrid(heatmap: HTMLElement, instant: boolean): Promise<void> {
  return new Promise((resolve) => {
    const cells = Array.from(heatmap.querySelectorAll<HTMLElement>('.wopr-cell'));
    if (!cells.length) { resolve(); return; }

    if (instant) {
      cells.forEach((c) => setLevel(c, Number(c.dataset.real ?? 0)));
      resolve();
      return;
    }

    // Group cells by week column
    const weekMap = new Map<number, HTMLElement[]>();
    cells.forEach((c) => {
      const w = Number(c.dataset.week);
      if (!weekMap.has(w)) weekMap.set(w, []);
      weekMap.get(w)!.push(c);
    });
    const weeks = [...weekMap.keys()].sort((a, b) => a - b);
    const locked = new Set<number>();

    // Phase 1: all cells flicker randomly at 50ms
    cells.forEach((c) => setLevel(c, rnd()));
    const flickerTimer = setInterval(() => {
      cells.forEach((c) => {
        if (!locked.has(Number(c.dataset.week))) setLevel(c, rnd());
      });
    }, 50);

    // Phase 2: after 700ms, scan left→right locking each column to real data
    setTimeout(() => {
      let i = 0;
      const scanTimer = setInterval(() => {
        if (i >= weeks.length) {
          clearInterval(scanTimer);
          clearInterval(flickerTimer);
          startIdleFlicker(cells);
          resolve();
          return;
        }
        const wk = weeks[i++];
        locked.add(wk);
        weekMap.get(wk)!.forEach((c) => setLevel(c, Number(c.dataset.real ?? 0)));
      }, 16);
    }, 700);
  });
}

function startIdleFlicker(cells: HTMLElement[]) {
  setInterval(() => {
    if (Math.random() > 0.25) return;
    const c = cells[Math.floor(Math.random() * cells.length)];
    const real = Number(c.dataset.real ?? 0);
    if (real === 0) return;
    setLevel(c, Math.min(4, real + 1 + Math.floor(Math.random() * 2)));
    setTimeout(() => setLevel(c, real), 80 + Math.random() * 100);
  }, 250);
}

// ── Main sequence ────────────────────────────────────────────────────────────

function initActivityTerminal() {
  const terminal = document.querySelector<HTMLElement>('[data-wopr]');
  if (!terminal) return;

  const heatmap = terminal.querySelector<HTMLElement>('[data-wopr-heatmap]');
  const log = terminal.querySelector<HTMLElement>('[data-wopr-log]');
  const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;

  async function runSequence() {
    // 1. Type header lines
    for (const el of terminal.querySelectorAll<HTMLElement>('.wopr-lines [data-wopr-line]')) {
      await typeText(el, el.dataset.woprLine ?? '', 28, instant);
      await pause(Number(el.dataset.woprDelay ?? 0), instant);
    }

    // 2. WOPR scan animation on the heatmap
    if (heatmap) await animateGrid(heatmap, instant);

    // 3. Type log entries after scan completes
    if (log) {
      await pause(200, instant);
      for (const el of log.querySelectorAll<HTMLElement>('[data-wopr-line]')) {
        await typeText(el, el.dataset.woprLine ?? '', 20, instant);
        await pause(Number(el.dataset.woprDelay ?? 0), instant);
      }
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting || started) return;
      started = true;
      io.disconnect();
      void runSequence();
    },
    { threshold: 0.12 }
  );
  io.observe(terminal);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initActivityTerminal);
} else {
  initActivityTerminal();
}
