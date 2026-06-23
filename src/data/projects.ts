import type { Lang } from '../i18n/strings';

export interface Project {
  num: string;
  name: string;
  year: string;
  url: string;
  /** Short handle used for the "window" address bar, e.g. anon://testerify */
  handle: string;
  /** Tech stack chips. Verified from each site where the platform is detectable. */
  tech: string[];
  /** One- to two-line brief, per language. */
  brief: Record<Lang, string>;
}

export const projects: Project[] = [
  {
    num: '01',
    name: 'TESTERIFY',
    year: '2026',
    url: 'https://www.testerify.com/',
    handle: 'testerify',
    tech: ['Vue 3', 'Vite', 'Vercel', 'Drizzle ORM', 'Neon Postgres', 'Claude API', 'Shopify App'],
    brief: {
      en: 'Alp\'s own SaaS product — an A/B testing platform for Shopify stores. Merchants run storefront experiments through a visual editor, and Testerify tracks impressions, conversions and revenue to call a statistically sound winner. AI-powered test suggestions and insights via the Claude API. Built end to end: native Shopify app plus a standalone Vue web panel.',
      tr: 'Alp\'ın kendi SaaS ürünü — Shopify mağazaları için bir A/B test platformu. Satıcılar görsel bir editörle vitrin deneyleri kurar; Testerify gösterim, dönüşüm ve geliri izleyerek istatistiksel olarak sağlam bir kazananı belirler. Claude API ile yapay zekâ destekli test önerileri ve içgörüler. Uçtan uca geliştirildi: yerel Shopify uygulaması ve bağımsız bir Vue web paneli.',
    },
  },
  {
    num: '02',
    name: 'YAZ EVI',
    year: '2025 — today',
    url: 'https://www.yaz-evi.com/',
    handle: 'yaz-evi',
    tech: ['Vue 3', 'TypeScript', 'Tailwind CSS', 'Firebase', 'iyzico', 'Vercel'],
    brief: {
      en: 'Boutique hotel on the island of Bozcaada, with five themed rooms named after local myth and history. A bilingual (EN/TR) site with a full direct-booking flow — real-time availability, then secure online payment with Turkish installment plans. Built end to end: Vue 3 front end, Vercel serverless functions, Firebase/Firestore data and iyzico payments, plus a separate staff admin panel.',
      tr: 'Bozcaada\'da, yerel mit ve tarihten adlar taşıyan beş temalı odalı butik otel. Gerçek zamanlı müsaitlik ve Türk taksit seçenekleriyle güvenli online ödemeye uzanan, uçtan uca doğrudan rezervasyon akışına sahip iki dilli (EN/TR) bir site. Baştan sona geliştirildi: Vue 3 arayüz, Vercel serverless fonksiyonları, Firebase/Firestore veri ve iyzico ödemeleri, ayrı bir personel yönetim paneliyle.',
    },
  },
  {
    num: '03',
    name: 'INO BEAUTY',
    year: '2026 — today',
    url: 'https://inobeauty.com.tr/',
    handle: 'ino-beauty',
    tech: ['Shopify', 'Liquid', 'JavaScript'],
    brief: {
      en: 'Cosmetics brand built on pure marine collagen, blending makeup and skincare in one step. A clean, tactile Shopify storefront.',
      tr: 'Saf deniz kolajeni üzerine kurulu, makyaj ve cilt bakımını tek adımda birleştiren kozmetik markası. Temiz, dokunsal bir Shopify vitrini.',
    },
  },
  {
    num: '04',
    name: 'URBAN CARE',
    year: '2026 — today',
    url: 'https://urbancare.com.tr/',
    handle: 'urban-care',
    tech: ['Shopify', 'Liquid', 'JavaScript'],
    brief: {
      en: '100% vegan, science-backed hair and body care brand. A campaign-driven Shopify storefront with a large, well-sorted catalog.',
      tr: '%100 vegan, bilim destekli saç ve vücut bakım markası. Geniş ve düzenli kataloglu, kampanya odaklı bir Shopify vitrini.',
    },
  },
  {
    num: '05',
    name: 'VOLTA MOTOR',
    year: '2026 — today',
    url: 'https://www.voltamotorbuyukcekmece.com/',
    handle: 'volta-motor',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    brief: {
      en: 'Authorized Volta Motor dealer in Büyükçekmece. Product catalog and showroom site for electric scooters, ATVs and e-bikes with specs and pricing.',
      tr: 'Büyükçekmece Volta Motor yetkili bayisi. Elektrikli scooter, ATV ve e-bisikletler için özellik ve fiyatlarıyla ürün kataloğu ve showroom sitesi.',
    },
  },
  {
    num: '06',
    name: 'STEPHEN WEBSTER',
    year: '2023 — today',
    url: 'https://www.stephenwebster.com/',
    handle: 'stephen-webster',
    tech: ['Shopify Plus', 'Liquid', 'JavaScript'],
    brief: {
      en: 'British luxury fine-jewellery house. A bold, editorial Shopify Plus storefront for collections, bespoke pieces and the London flagship.',
      tr: 'İngiliz lüks mücevher markası. Koleksiyonlar, bespoke parçalar ve Londra mağazası için iddialı, editoryal bir Shopify Plus vitrini.',
    },
  },
  {
    num: '07',
    name: 'STERLING HOME',
    year: '2026 — today',
    url: 'https://sterlinghome.co.uk/',
    handle: 'sterling-home',
    tech: ['Shopify', 'Liquid', 'JavaScript'],
    brief: {
      en: 'Scottish furniture and homewares retailer (formerly Sterling Furniture). A large-catalog Shopify storefront for sofas, accessories and flooring, with UK-wide delivery.',
      tr: 'İskoç mobilya ve ev ürünleri markası (eski adıyla Sterling Furniture). Kanepe, aksesuar ve döşeme için geniş kataloglu, tüm Birleşik Krallık\'a teslimatlı bir Shopify vitrini.',
    },
  },
  {
    num: '08',
    name: 'WILKINSON SWORD',
    year: '2024 — today',
    url: 'https://www.wilkinsonsword.com/',
    handle: 'wilkinson-sword',
    tech: ['Shopify Plus', 'Liquid', 'JavaScript'],
    brief: {
      en: 'Heritage shaving and grooming brand with 250+ years of history. A multi-region Shopify Plus storefront for razors, blades and a subscribe-and-save program.',
      tr: '250+ yıllık köklü tıraş ve bakım markası. Tıraş bıçakları, jiletler ve abonelik (subscribe & save) için çok bölgeli bir Shopify Plus vitrini.',
    },
  },
  {
    num: '09',
    name: 'BULLDOG SKINCARE',
    year: '2025 — today',
    url: 'https://www.bulldogskincare.com/',
    handle: 'bulldog-skincare',
    tech: ['Shopify Plus', 'Liquid', 'JavaScript'],
    brief: {
      en: 'Men\'s natural skincare and grooming brand. A multi-region Shopify Plus storefront with a playful brand voice and clean product pages.',
      tr: 'Erkekler için doğal cilt bakımı ve bakım markası. Eğlenceli marka tonu ve sade ürün sayfalarıyla çok bölgeli bir Shopify Plus vitrini.',
    },
  },
  {
    num: '10',
    name: 'NOBODY\'S CHILD',
    year: '2024 — today',
    url: 'https://www.nobodyschild.com/',
    handle: 'nobodys-child',
    tech: ['Shopify Plus', 'Liquid', 'JavaScript'],
    brief: {
      en: 'Sustainable womenswear brand. A fast, fashion-forward Shopify Plus storefront built around reduced-impact materials and frequent drops.',
      tr: 'Sürdürülebilir kadın giyim markası. Düşük etkili malzemeler ve sık koleksiyonlar etrafında kurulu, hızlı ve modaya dönük bir Shopify Plus vitrini.',
    },
  },
  {
    num: '11',
    name: 'A COLLECTED MAN',
    year: '2022 — today',
    url: 'https://www.acollectedman.com/',
    handle: 'a-collected-man',
    tech: ['Shopify', 'Liquid', 'JavaScript'],
    brief: {
      en: 'Marketplace for rare, pre-owned and independent mechanical watches. A curated, editorial Shopify storefront with deep brand stories and a refined buying flow.',
      tr: 'Nadir, ikinci el ve bağımsız mekanik saatler için pazar yeri. Derin marka hikâyeleri ve rafine bir satın alma akışıyla küratöryel, editoryal bir Shopify vitrini.',
    },
  },
];

export const contactEmail = 'anon@operator.dev';
