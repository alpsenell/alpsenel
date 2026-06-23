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
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    brief: {
      en: 'QA and test-management platform. Marketing site plus an app dashboard, built for speed and clarity.',
      tr: 'QA ve test yönetim platformu. Hız ve sadelik için kurulmuş tanıtım sitesi ve uygulama paneli.',
    },
  },
  {
    num: '02',
    name: 'YAZ EVI',
    year: '2025',
    url: 'https://www.yaz-evi.com/',
    handle: 'yaz-evi',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP'],
    brief: {
      en: 'Boutique hotel on Bozcaada, set in a restored historic stone house. An editorial site for the rooms, island experiences and direct booking.',
      tr: 'Bozcaada\'da, restore edilmiş tarihi bir taş evdeki butik otel. Odalar, ada deneyimleri ve doğrudan rezervasyon için editoryal bir site.',
    },
  },
  {
    num: '03',
    name: 'INO BEAUTY',
    year: '2025',
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
    year: '2025',
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
    year: '2024',
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
    year: '2021–2024',
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
    year: '2021–2024',
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
    year: '2021–2024',
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
    year: '2021–2024',
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
    year: '2021–2024',
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
    year: '2021–2024',
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
