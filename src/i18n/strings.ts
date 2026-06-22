export type Lang = 'en' | 'tr';

export interface Strings {
  htmlLang: string;
  ogLocale: string;
  ogLocaleAlt: string;
  /** Title shown in the browser tab and Google results — carries the name for SEO. */
  title: string;
  description: string;
  brand: string;
  lightsOn: string;
  lightsOff: string;
  kicker: string;
  /** Trusted static markup for the hero headline (includes the accent span). */
  h1html: string;
  sub: string;
  scrollhint: string;
  workLabel: string;
  channelLabel: string;
  signal: string;
  signed: string;
  footLeft: string;
  footRight: string;
  /** Label + href of the OTHER language, for the header toggle. */
  otherLangLabel: string;
  otherLangHref: string;
}

export const strings: Record<Lang, Strings> = {
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    ogLocaleAlt: 'tr_TR',
    title: 'Alp Senel — Web Developer & Designer',
    description:
      'Alp Senel is an independent web developer and designer building fast, distinctive e-commerce and brand websites. Selected work, quietly shipped.',
    brand: 'anon://operator',
    lightsOn: 'LIGHTS ON',
    lightsOff: 'LIGHTS OFF',
    kicker: '// identity withheld',
    h1html: 'I ship in<br />the <span class="accent">dark.</span>',
    sub: 'no name &nbsp;·&nbsp; no face &nbsp;·&nbsp; only the work',
    scrollhint: '↓ &nbsp; FIVE ENTRIES',
    workLabel: '// the work',
    channelLabel: '// open a channel',
    signal: 'send a signal ↗',
    signed: 'signed',
    footLeft: '© 2026 — name withheld',
    footRight: 'built in the dark',
    otherLangLabel: 'TR',
    otherLangHref: '/tr/',
  },
  tr: {
    htmlLang: 'tr',
    ogLocale: 'tr_TR',
    ogLocaleAlt: 'en_US',
    title: 'Alp Senel — Web Geliştirici & Tasarımcı',
    description:
      'Alp Senel; hızlı ve özgün e-ticaret ve marka siteleri kuran bağımsız web geliştirici ve tasarımcı. Seçili işler, sessizce yayında.',
    brand: 'anon://operator',
    lightsOn: 'IŞIKLAR AÇIK',
    lightsOff: 'IŞIKLAR KAPALI',
    kicker: '// kimlik gizli',
    h1html: '<span class="accent">Karanlıkta</span><br />üretirim.',
    sub: 'ne isim &nbsp;·&nbsp; ne yüz &nbsp;·&nbsp; yalnızca iş',
    scrollhint: '↓ &nbsp; BEŞ KAYIT',
    workLabel: '// işler',
    channelLabel: '// kanal aç',
    signal: 'sinyal gönder ↗',
    signed: 'imzalı',
    footLeft: '© 2026 — isim gizli',
    footRight: 'karanlıkta üretildi',
    otherLangLabel: 'EN',
    otherLangHref: '/',
  },
};
