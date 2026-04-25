// Home page verse marquee (`NowHomeTicker.astro`). Mostly NLT; Ephesians 2:10 is NIV. bible.com URLs.

/** YouVersion Bible.com reader id for NLT (same as bible.com/bible/116/…). */
export const BIBLE_COM_NLT_READER_ID = 116;

/** YouVersion Bible.com reader id for NIV (same as bible.com/bible/111/…). */
export const BIBLE_COM_NIV_READER_ID = 111;

/** `//bible.com/…` — protocol-relative, no `www` (inherits https on this site). */
function bibleComNltPassage(slug: string): string {
  return `//bible.com/bible/${BIBLE_COM_NLT_READER_ID}/${slug}.NLT`;
}

function bibleComNivPassage(slug: string): string {
  return `//bible.com/bible/${BIBLE_COM_NIV_READER_ID}/${slug}.NIV`;
}

export type NowHomeTickerItem = {
  /** Full line shown in the marquee (quote + reference). */
  line: string;
  /** Short label for `aria-label`, e.g. `Proverbs 25:2`. */
  verseLabel: string;
  /** Bible.com / YouVersion passage; protocol-relative `//bible.com/…`, no `www`. */
  href: string;
  /** Translation name for link `aria-label`, e.g. `English Standard Version`. */
  translationName: string;
};

/** Order = marquee scroll order. Verse text matches linked translation; URLs per bible.com. */
export const nowHomeTickerItems: readonly NowHomeTickerItem[] = [
  {
    verseLabel: 'Proverbs 25:2',
    line: `"It is God's privilege to conceal things and the king's privilege to discover them." Proverbs 25:2`,
    href: bibleComNltPassage('PRO.25.2'),
    translationName: 'New Living Translation',
  },
  {
    verseLabel: 'Ephesians 2:10',
    line: `"For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." Ephesians 2:10`,
    href: bibleComNivPassage('EPH.2.10'),
    translationName: 'New International Version',
  },
  {
    verseLabel: 'Hebrews 11:1',
    line: `"Faith shows the reality of what we hope for; it is the evidence of things we cannot see." Hebrews 11:1`,
    href: bibleComNltPassage('HEB.11.1'),
    translationName: 'New Living Translation',
  },
];
