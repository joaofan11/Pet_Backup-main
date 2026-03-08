// src/app/page.tsx

import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';

export default function HomePage() {
  return (
    <main className="overflow-hidden rounded-[20px] bg-white shadow-[0_25px_50px_rgba(0,0,0,0.15)]">
      <HeroSection />
      <FeaturesGrid />
    </main>
  );
}
