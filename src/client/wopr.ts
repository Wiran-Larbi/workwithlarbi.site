/** Activity terminal: typewriter sequence for lines + log entries. */

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

function initActivityTerminal() {
  const terminal = document.querySelector<HTMLElement>('[data-wopr]');
  if (!terminal) return;

  const log = terminal.querySelector<HTMLElement>('[data-wopr-log]');
  const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;

  async function runSequence() {
    // Type header lines
    for (const el of terminal.querySelectorAll<HTMLElement>('.wopr-lines [data-wopr-line]')) {
      await typeText(el, el.dataset.woprLine ?? '', 28, instant);
      await pause(Number(el.dataset.woprDelay ?? 0), instant);
    }

    // Type log entries
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
