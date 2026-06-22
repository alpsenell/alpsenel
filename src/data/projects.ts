export interface Project {
  num: string;
  name: string;
  year: string;
  url: string;
}

export const projects: Project[] = [
  { num: '01', name: 'TESTERIFY', year: '2026', url: 'https://www.testerify.com/' },
  { num: '02', name: 'YAZ EVI', year: '2025', url: 'https://www.yaz-evi.com/' },
  { num: '03', name: 'INO BEAUTY', year: '2025', url: 'https://inobeauty.com.tr/' },
  { num: '04', name: 'URBAN CARE', year: '2025', url: 'https://urbancare.com.tr/' },
  { num: '05', name: 'VOLTA MOTOR', year: '2024', url: 'https://www.voltamotorbuyukcekmece.com/' },
];

export const contactEmail = 'anon@operator.dev';
