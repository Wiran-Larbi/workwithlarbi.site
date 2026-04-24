const KONAMI: string[] = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
];

let konamiIndex = 0;
let orangeModeTimer = 0;

async function playFanfare(): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ac = new AudioContext();
  await ac.resume();
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  const now = ac.currentTime;
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sine';
    const t = now + i * 0.1;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.start(t);
    osc.stop(t + 0.1);
  });
}

function showToast(): void {
  document.getElementById('orange-mode-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'orange-mode-toast';
  toast.textContent = '🍊 My favorite color is orange';
  document.body.appendChild(toast);
  void toast.offsetWidth; // force reflow
  toast.classList.add('orange-mode-toast--visible');
  window.setTimeout(() => {
    toast.classList.remove('orange-mode-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4500);
}

function activateOrangeMode(): void {
  window.clearTimeout(orangeModeTimer);
  document.documentElement.classList.add('orange-mode');
  playFanfare();
  showToast();
  orangeModeTimer = window.setTimeout(() => {
    document.documentElement.classList.remove('orange-mode');
  }, 5000);
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === KONAMI[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === KONAMI.length) {
      konamiIndex = 0;
      activateOrangeMode();
    }
  } else {
    konamiIndex = e.key === KONAMI[0] ? 1 : 0;
  }
});
