// Home page quote marquee (`NowHomeTicker.astro`). Confucius quotes from BrainyQuote.

export type NowHomeTickerItem = {
  /** Full line shown in the marquee (quote + attribution). */
  line: string;
  /** Short label for `aria-label`, e.g. `Confucius`. */
  label: string;
  /** BrainyQuote URL for the quote. */
  href: string;
  /** Source name for link `aria-label`. */
  sourceName: string;
};

/** Order = marquee scroll order. */
export const nowHomeTickerItems: readonly NowHomeTickerItem[] = [
  {
    label: 'Confucius',
    line: `"Our greatest glory is not in never falling, but in rising every time we fall." — Confucius`,
    href: 'https://www.brainyquote.com/quotes/confucius_101164',
    sourceName: 'BrainyQuote',
  },
  {
    label: 'Confucius',
    line: `"It does not matter how slowly you go as long as you do not stop." — Confucius`,
    href: 'https://www.brainyquote.com/quotes/confucius_134858',
    sourceName: 'BrainyQuote',
  },
  {
    label: 'Confucius',
    line: `"The man who moves a mountain begins by carrying away small stones." — Confucius`,
    href: 'https://www.brainyquote.com/quotes/confucius_132314',
    sourceName: 'BrainyQuote',
  },
  {
    label: 'Confucius',
    line: `"Wheresoever you go, go with all your heart." — Confucius`,
    href: 'https://www.brainyquote.com/quotes/confucius_141110',
    sourceName: 'BrainyQuote',
  },
];
