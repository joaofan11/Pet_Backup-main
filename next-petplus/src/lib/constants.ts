// src/lib/constants.ts

export const API_URL = 'https://petplus-backend.onrender.com/api';

export const SPECIES_ICONS: Record<string, string> = {
  dog: '🐕',
  cat: '🐱',
};

export const AGE_LABELS: Record<string, string> = {
  puppy: 'Filhote',
  young: 'Jovem',
  adult: 'Adulto',
  senior: 'Idoso',
};

export const SIZE_LABELS: Record<string, string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'Macho',
  female: 'Fêmea',
};

export const SERVICE_CATEGORIES: Record<string, { label: string; icon: string }> = {
  vet: { label: 'Veterinários', icon: '🩺' },
  sitter: { label: 'Cuidadores', icon: '❤️' },
  walker: { label: 'Passeadores', icon: '🐕' },
  transport: { label: 'Transporte Pet', icon: '🚐' },
};

export const NAV_LINKS = {
  public: [
    { href: '/', label: 'Home' },
    { href: '/adoption', label: 'Adotar' },
    { href: '/services', label: 'Serviços' },
    { href: '/blog', label: 'Blog' },
  ],
  authenticated: [
    { href: '/my-pets', label: 'Meus Pets' },
    { href: '/profile', label: 'Perfil' },
  ],
} as const;
