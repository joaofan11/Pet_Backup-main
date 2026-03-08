// src/components/landing/HeroSection.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#75b2c3] to-[#99b06a] px-10 py-[100px] text-center text-white">
      {/* Overlay decorativo */}
      <div className="pointer-events-none absolute inset-0 opacity-10" />

      <h1 className="relative mb-6 text-[4rem] font-extrabold leading-tight tracking-tight drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
        Conectando Corações
      </h1>

      <p className="relative mx-auto mb-12 max-w-[600px] text-[1.4rem] opacity-95">
        A plataforma mais completa para adoção de pets e gestão da saúde dos seus animais de estimação
      </p>

      <div className="relative flex flex-wrap justify-center gap-6">
        <Link
          href="/adoption"
          className="inline-block rounded-full bg-white px-10 py-[18px] text-[1.1rem] font-bold text-[#75b2c3] shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
        >
          🐾 Adotar um Pet
        </Link>

        {!user && (
          <Link
            href="/register"
            className="inline-block rounded-full border-2 border-white bg-transparent px-10 py-[18px] text-[1.1rem] font-bold text-white transition-all duration-300 hover:-translate-y-[3px] hover:bg-white hover:text-[#75b2c3] hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
          >
            📝 Cadastrar-se
          </Link>
        )}
      </div>
    </section>
  );
}
