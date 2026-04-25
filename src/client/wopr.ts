type Cell = 'X' | 'O' | null;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function winner(board: Cell[]): 'X' | 'O' | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  return null;
}

function boardFull(board: Cell[]): boolean {
  return board.every((c) => c !== null);
}

function minimax(board: Cell[], depth: number, isMax: boolean): number {
  const w = winner(board);
  if (w === 'O') return 10 - depth;
  if (w === 'X') return depth - 10;
  if (boardFull(board)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== null) continue;
      board[i] = 'O';
      const score = minimax(board, depth + 1, false);
      board[i] = null;
      best = Math.max(best, score);
    }
    return best;
  }
  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    board[i] = 'X';
    const score = minimax(board, depth + 1, true);
    board[i] = null;
    best = Math.min(best, score);
  }
  return best;
}

function getBestMove(board: Cell[]): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    board[i] = 'O';
    const score = minimax(board, 0, false);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

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

function isTypingContext(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  return !!target.closest('input, textarea, select, [contenteditable="true"]');
}

function initWopr() {
  const root = document.querySelector<HTMLElement>('[data-wopr]');
  const section = root?.closest('.wopr-section');
  const terminal = root;
  const gamePanel = section?.querySelector<HTMLElement>('[data-wopr-game]');
  if (!terminal || !gamePanel || !section) return;

  const heatmap = qs<HTMLElement>('[data-wopr-heatmap]', terminal);
  const log = qs<HTMLElement>('[data-wopr-log]', terminal);
  const promptEl = qs<HTMLElement>('[data-wopr-prompt]', terminal);
  const promptTextEl = qs<HTMLElement>('[data-wopr-prompt-text]', terminal);
  const promptCursor = qs<HTMLElement>('[data-wopr-cursor]', terminal);
  const ynButtons = terminal.querySelectorAll<HTMLButtonElement>('.wopr-yn');

  const gameLines = qs<HTMLElement>('[data-wopr-game-lines]', gamePanel);
  const boardEl = qs<HTMLElement>('[data-wopr-board]', gamePanel);
  const statusEl = qs<HTMLElement>('[data-wopr-status]', gamePanel);
  const resetBtn = qs<HTMLButtonElement>('[data-wopr-reset]', gamePanel);
  const squares = boardEl?.querySelectorAll<HTMLButtonElement>('.wopr-square') ?? [];

  if (!heatmap || !log || !promptEl || !promptTextEl || !promptCursor || !gameLines || !statusEl || !resetBtn || !boardEl) {
    return;
  }

  /**
   * When OS / browser has “Reduce motion” on, typing is instant and board FX are skipped
   * (CSS @media (prefers-reduced-motion) also disables grid animations).
   */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const instant = reducedMotion;

  let sequenceStarted = false;
  let promptReady = false;
  let gameActive = false;
  let startingGame = false;
  let board: Cell[] = Array(9).fill(null);
  let humanLocked = false;
  /** Focused cell for arrow-key navigation (0–8). */
  let kbdFocusIdx = 0;

  function setHeatmapVisible(on: boolean) {
    heatmap.classList.toggle('wopr-heatmap--visible', on);
    if (instant) heatmap.style.opacity = on ? '1' : '0';
  }

  function showPromptChrome(show: boolean) {
    ynButtons.forEach((b) => {
      b.hidden = !show;
    });
    promptCursor.hidden = !show;
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
    if (!instant) await shortPause(320, false);
    else await shortPause(0, true);

    const entries = log.querySelectorAll<HTMLElement>('.wopr-log-entry');
    for (const entry of entries) {
      const text = entry.dataset.woprLine ?? '';
      const delayAfter = Number(entry.dataset.woprDelay ?? 0);
      await typeText(entry, text, 28, instant);
      await shortPause(delayAfter, instant);
    }

    await shortPause(1500, instant);

    promptEl.hidden = false;
    showPromptChrome(false);
    promptCursor.hidden = true;
    await typeText(promptTextEl, '> SHALL WE PLAY A GAME? ', 28, instant);
    showPromptChrome(true);
    terminal.tabIndex = 0;
    promptReady = true;
  }

  function updateKbdHighlight() {
    const show = gameActive && !humanLocked;
    squares.forEach((sq, i) => {
      sq.classList.toggle('wopr-square--kbd', show && i === kbdFocusIdx);
    });
  }

  function renderBoard() {
    squares.forEach((sq, i) => {
      const v = board[i];
      sq.textContent = v ?? '';
      sq.disabled = v !== null || humanLocked || gameActive === false;
      sq.tabIndex = -1;
    });
    updateKbdHighlight();
  }

  function setTerminalVisible(on: boolean) {
    terminal.hidden = !on;
    if (on) terminal.removeAttribute('hidden');
    else terminal.setAttribute('hidden', '');
  }

  function setGameVisible(on: boolean) {
    gamePanel.hidden = !on;
    if (on) gamePanel.removeAttribute('hidden');
    else gamePanel.setAttribute('hidden', '');
    gameActive = on;
  }

  async function appendGameLine(text: string) {
    const row = document.createElement('div');
    row.className = 'wopr-game-line';
    gameLines.appendChild(row);
    await typeText(row, text, 28, instant);
  }

  let bootAnimTimer: ReturnType<typeof setTimeout> | undefined;

  function runBoardBootAnimation() {
    if (instant || !boardEl) return;
    boardEl.classList.remove('wopr-board--boot');
    if (bootAnimTimer) window.clearTimeout(bootAnimTimer);
    requestAnimationFrame(() => {
      boardEl!.classList.add('wopr-board--boot');
      bootAnimTimer = window.setTimeout(() => {
        boardEl!.classList.remove('wopr-board--boot');
        bootAnimTimer = undefined;
      }, 1020);
    });
  }

  function flashSquare(i: number) {
    if (instant) return;
    const sq = squares[i];
    if (!sq) return;
    sq.classList.remove('wopr-square--flash');
    void sq.offsetWidth;
    sq.classList.add('wopr-square--flash');
    window.setTimeout(() => sq.classList.remove('wopr-square--flash'), 450);
  }

  async function startGame() {
    if (startingGame || !promptReady || gameActive) return;
    startingGame = true;
    promptReady = false;
    try {
      setTerminalVisible(false);
      setGameVisible(true);
      gameLines.textContent = '';
      statusEl.textContent = '';
      resetBtn.hidden = true;
      board = Array(9).fill(null);
      humanLocked = false;
      kbdFocusIdx = 0;

      await appendGameLine('> GREETINGS, PROFESSOR FALKEN.');
      await appendGameLine('> LET US PLAY TIC-TAC-TOE.');
      await appendGameLine('> YOU ARE X. I AM O. YOUR MOVE.');
      renderBoard();
      runBoardBootAnimation();
      gamePanel.focus();
    } finally {
      startingGame = false;
    }
  }

  function endGame() {
    humanLocked = true;
    resetBtn.hidden = false;
    squares.forEach((sq) => {
      sq.disabled = true;
    });
    updateKbdHighlight();
  }

  async function woprThinkingLine(show: boolean) {
    const row = qs<HTMLElement>('[data-wopr-calc-line]', gameLines);
    if (!show) {
      row?.remove();
      return;
    }
    const line = document.createElement('div');
    line.className = 'wopr-game-line';
    line.setAttribute('data-wopr-calc-line', '');
    gameLines.appendChild(line);
    await typeText(line, '> CALCULATING...', 28, instant);
  }

  async function onHumanMove(idx: number) {
    if (board[idx] !== null || humanLocked || !gameActive) return;
    board[idx] = 'X';
    renderBoard();
    flashSquare(idx);

    if (winner(board) === 'X') {
      await appendGameLine('> ERROR: UNEXPECTED OUTCOME.');
      endGame();
      return;
    }
    if (boardFull(board)) {
      await appendGameLine('> A STRANGE GAME. THE ONLY WINNING MOVE IS NOT TO PLAY.');
      endGame();
      return;
    }

    humanLocked = true;
    squares.forEach((sq) => {
      sq.disabled = true;
    });

    await woprThinkingLine(true);
    if (!instant) await new Promise((r) => setTimeout(r, 420));
    await woprThinkingLine(false);

    const move = getBestMove(board);
    if (move >= 0) board[move] = 'O';
    renderBoard();
    if (move >= 0) flashSquare(move);

    const w = winner(board);
    if (w === 'O') {
      await appendGameLine('> GAME OVER. JOSHUA WINS.');
      endGame();
      return;
    }
    if (boardFull(board)) {
      await appendGameLine('> A STRANGE GAME. THE ONLY WINNING MOVE IS NOT TO PLAY.');
      endGame();
      return;
    }

    humanLocked = false;
    renderBoard();
  }

  function declineOrExitGame() {
    setGameVisible(false);
    gameLines.textContent = '';
    statusEl.textContent = '';
    resetBtn.hidden = true;
    board = Array(9).fill(null);
    humanLocked = false;
    setTerminalVisible(true);
    promptReady = true;
    terminal.tabIndex = 0;
    terminal.focus();
  }

  gamePanel.tabIndex = 0;

  /** Y / N work without focusing the terminal; ignores keys while typing in form fields. */
  function onGlobalKeydown(e: KeyboardEvent) {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTypingContext(e.target)) return;

    if (gameActive && (e.key === 'n' || e.key === 'N' || e.key === 'Escape')) {
      e.preventDefault();
      declineOrExitGame();
      return;
    }

    if (gameActive && !humanLocked) {
      const arrows =
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight';
      const place = e.key === 'Enter' || e.key === ' ';
      if (arrows || place) {
        if (e.target === resetBtn) return;
        if (!gamePanel.contains(e.target as Node)) return;
        e.preventDefault();
        if (place) {
          void onHumanMove(kbdFocusIdx);
          return;
        }
        let i = kbdFocusIdx;
        if (e.key === 'ArrowLeft' && i % 3 > 0) i--;
        if (e.key === 'ArrowRight' && i % 3 < 2) i++;
        if (e.key === 'ArrowUp' && i >= 3) i -= 3;
        if (e.key === 'ArrowDown' && i <= 5) i += 3;
        kbdFocusIdx = i;
        updateKbdHighlight();
        return;
      }
    }

    if (!promptReady || gameActive) return;

    if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      void startGame();
      return;
    }
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
    }
  }

  document.addEventListener('keydown', onGlobalKeydown);

  ynButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!promptReady) return;
      const yn = btn.dataset.yn;
      if (yn === 'Y') void startGame();
      if (yn === 'N') {
        /* stay on terminal — no-op beyond aesthetic */
      }
    });
  });

  squares.forEach((sq) => {
    sq.addEventListener('click', () => {
      const idx = Number(sq.dataset.idx);
      if (Number.isNaN(idx)) return;
      kbdFocusIdx = idx;
      void onHumanMove(idx);
    });
  });

  resetBtn.addEventListener('click', () => {
    void (async () => {
      gameLines.textContent = '';
      statusEl.textContent = '';
      resetBtn.hidden = true;
      board = Array(9).fill(null);
      humanLocked = false;
      kbdFocusIdx = 0;
      await appendGameLine('> NEW GAME. YOUR MOVE.');
      renderBoard();
      runBoardBootAnimation();
      gamePanel.focus();
    })();
  });

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
  document.addEventListener('DOMContentLoaded', initWopr);
} else {
  initWopr();
}
