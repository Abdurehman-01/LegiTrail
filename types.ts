
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface LawResponse {
  text: string;
  sources: GroundingChunk[];
}

export type LawCategory = 'overview' | 'prohibited' | 'conduct' | 'driving' | 'social' | 'unusual';

export interface CountryInfo {
  name: string;
  code: string;
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Iceland', code: 'IS', flag: '🇮🇸' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷' },
  { name: 'France', code: 'FR', flag: '🇫🇷' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'China', code: 'CN', flag: '🇨🇳' },
];
