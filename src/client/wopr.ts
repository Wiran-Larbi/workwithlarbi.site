/** Activity terminal: typewriter lines + heatmap reveal (no game). */

async function typeText(el: HTMLElement, text: string, speed = 28, instant: boolean): Promise<void> {
  el.textContent = '';
  if (instant) {
    el.textContent = text;
    return;
  }
  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    await new Promise((r) => setTimeout(r, speed));
  }
}

async function shortPause(ms: number, instant: boolean) {
  if (instant) return;
  await new Promise((r) => setTimeout(r, ms));
}

function qs<T extends HTMLElement>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector(sel) as T | null;
}

function initActivityTerminal() {
  const terminal = document.querySelector<HTMLElement>('[data-wopr]');
  if (!terminal) return;

  const heatmap = qs<HTMLElement>('[data-wopr-heatmap]', terminal);
  const log = qs<HTMLElement>('[data-wopr-log]', terminal);
  if (!log) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const instant = reducedMotion;

  let sequenceStarted = false;

  function setHeatmapVisible(on: boolean) {
    if (!heatmap) return;
    heatmap.classList.toggle('wopr-heatmap--visible', on);
    if (instant) heatmap.style.opacity = on ? '1' : '0';
  }

  async function runIntroSequence() {
    const lineEls = terminal.querySelectorAll<HTMLElement>('.wopr-lines [data-wopr-line]');
    for (const lineEl of lineEls) {
      const text = lineEl.dataset.woprLine ?? '';
      const delayAfter = Number(lineEl.dataset.woprDelay ?? 0);
      await typeText(lineEl, text, 28, instant);
      await shortPause(delayAfter, instant);
    }

    setHeatmapVisible(true);
    if (heatmap) {
      if (!instant) await shortPause(320, false);
      else await shortPause(0, true);
    }

    const entries = log.querySelectorAll<HTMLElement>('.wopr-log-entry');
    for (const entry of entries) {
      const text = entry.dataset.woprLine ?? '';
      const delayAfter = Number(entry.dataset.woprDelay ?? 0);
      await typeText(entry, text, 28, instant);
      await shortPause(delayAfter, instant);
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting || sequenceStarted) return;
      sequenceStarted = true;
      io.disconnect();
      void runIntroSequence();
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
