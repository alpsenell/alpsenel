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
  /** Trusted static markup for the hero headline — word spans drive the magnetic effect. */
  h1html: string;
  metaBasedLabel: string;
  metaBasedValue: string;
  metaChannelLabel: string;
  scrollLabel: string;
  workLabel: string;
  channelLabel: string;
  signal: string;
  signed: string;
  footLeft: string;
  footRight: string;
  /** Project "window" modal labels. */
  briefLabel: string;
  stackLabel: string;
  openLive: string;
  closeLabel: string;
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
    h1html: '<span data-word>Distinctive</span><br /><span data-word>sites,</span> <span data-word data-accent>shipped.</span>',
    metaBasedLabel: 'BASED',
    metaBasedValue: 'remote / İstanbul',
    metaChannelLabel: 'CHANNEL',
    scrollLabel: 'SCROLL TO EXPLORE',
    workLabel: '// the work',
    channelLabel: '// open a channel',
    signal: 'send a signal ↗',
    signed: 'signed',
    footLeft: '© 2026 — name withheld',
    footRight: 'built in the dark',
    briefLabel: '// brief',
    stackLabel: 'STACK',
    openLive: 'OPEN LIVE ↗',
    closeLabel: 'close',
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
    h1html: '<span data-word>Özgün</span><br /><span data-word>siteler,</span> <span data-word data-accent>yayında.</span>',
    metaBasedLabel: 'KONUM',
    metaBasedValue: 'remote / İstanbul',
    metaChannelLabel: 'KANAL',
    scrollLabel: 'AŞAĞI KAYDIR',
    workLabel: '// işler',
    channelLabel: '// kanal aç',
    signal: 'sinyal gönder ↗',
    signed: 'imzalı',
    footLeft: '© 2026 — isim gizli',
    footRight: 'karanlıkta üretildi',
    briefLabel: '// özet',
    stackLabel: 'TEKNOLOJİ',
    openLive: 'CANLI AÇ ↗',
    closeLabel: 'kapat',
    otherLangLabel: 'EN',
    otherLangHref: '/',
  },
};
