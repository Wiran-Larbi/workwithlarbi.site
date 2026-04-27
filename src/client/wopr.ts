/** Activity terminal: typewriter lines → WOPR heatmap scan → log entries. */

import { relativeTimeFromIso } from '../lib/relativeTime';

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
    const allWeeks = [...weekMap.keys()].sort((a, b) => a - b);

    // Measure how many columns are actually visible in the clip container
    const clipEl = heatmap.closest<HTMLElement>('.wopr-heatmap-clip');
    const containerW = clipEl?.clientWidth ?? heatmap.clientWidth;
    const colW = 9 + 3; // cell width + gap
    const visibleCount = Math.floor((containerW + 3) / colW);
    const startIdx = Math.max(0, allWeeks.length - visibleCount);
    const visibleWeeks = allWeeks.slice(startIdx);

    // Silently resolve hidden (clipped) cells to their real values
    allWeeks.slice(0, startIdx).forEach((wk) =>
      weekMap.get(wk)!.forEach((c) => setLevel(c, Number(c.dataset.real ?? 0)))
    );

    const visibleCells = visibleWeeks.flatMap((wk) => weekMap.get(wk)!);
    const locked = new Set<number>();

    // Phase 1: rapid random flicker on visible cells
    visibleCells.forEach((c) => setLevel(c, rnd()));
    const flickerTimer = setInterval(() => {
      visibleCells.forEach((c) => {
        if (!locked.has(Number(c.dataset.week))) setLevel(c, rnd());
      });
    }, 50);

    // Phase 2: after 700ms, scan left→right locking each column to real data
    setTimeout(() => {
      let i = 0;
      const scanTimer = setInterval(() => {
        if (i >= visibleWeeks.length) {
          clearInterval(scanTimer);
          clearInterval(flickerTimer);
          startIdleFlicker(visibleCells);
          resolve();
          return;
        }
        const wk = visibleWeeks[i++];
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

// ── Main sequence ─────────────────────────────────────────────────────────────

function initActivityTerminal() {
  const terminal = document.querySelector<HTMLElement>('[data-wopr]');
  if (!terminal) return;

  const log = terminal.querySelector<HTMLElement>('[data-wopr-log]');
  const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;

  async function runSequence() {
    // 1. Type header lines (recompute "last push" from ISO so SSG does not freeze "just now")
    for (const el of terminal.querySelectorAll<HTMLElement>('.wopr-lines [data-wopr-line]')) {
      const pushIso = el.dataset.woprPushIso;
      const line =
        pushIso !== undefined && pushIso !== ''
          ? `> LAST COMMIT: ${relativeTimeFromIso(pushIso)}`
          : (el.dataset.woprLine ?? '');
      await typeText(el, line, 28, instant);
      await pause(Number(el.dataset.woprDelay ?? 0), instant);
    }

    // 2. WOPR heatmap animation (flicker → scan → idle)
    const heatmap = terminal.querySelector<HTMLElement>('[data-wopr-heatmap]');
    if (heatmap) await animateGrid(heatmap, instant);

    // 3. Type log entries after scan resolves
    if (log) {
      await pause(200, instant);
      for (const el of log.querySelectorAll<HTMLElement>('[data-wopr-line]')) {
        await typeText(el, el.dataset.woprLine ?? '', 20, instant);
        await pause(60, instant);
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
