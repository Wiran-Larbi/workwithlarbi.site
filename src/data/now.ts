// Home page verse marquee (`NowHomeTicker.astro`). NLT via bible.com URLs.

/** YouVersion Bible.com reader id for NLT (same as bible.com/bible/116/…). */
export const BIBLE_COM_NLT_READER_ID = 116;

/** `//bible.com/…` — protocol-relative, no `www` (inherits https on this site). */
function bibleComNltPassage(slug: string): string {
  return `//bible.com/bible/${BIBLE_COM_NLT_READER_ID}/${slug}.NLT`;
}

export type NowHomeTickerItem = {
  /** Full line shown in the marquee (quote + reference). */
  line: string;
  /** Short label for `aria-label`, e.g. `Proverbs 25:2`. */
  verseLabel: string;
  /** Bible.com / YouVersion passage (NLT); protocol-relative `//bible.com/…`, no `www`. */
  href: string;
};

/** NLT — order = marquee scroll order. Verse text per Bible Gateway NLT; URLs per bible.com. */
export const nowHomeTickerItems: readonly NowHomeTickerItem[] = [
  {
    verseLabel: 'Proverbs 25:2',
    line: `"It is God's privilege to conceal things and the king's privilege to discover them." Proverbs 25:2`,
    href: bibleComNltPassage('PRO.25.2'),
  },
  {
    verseLabel: 'Ephesians 2:10',
    line: `"For we are God's masterpiece. He has created us anew in Christ Jesus, so we can do the good things he planned for us long ago." Ephesians 2:10`,
    href: bibleComNltPassage('EPH.2.10'),
  },
  {
    verseLabel: 'Hebrews 11:1',
    line: `"Faith shows the reality of what we hope for; it is the evidence of things we cannot see." Hebrews 11:1`,
    href: bibleComNltPassage('HEB.11.1'),
  },
];
