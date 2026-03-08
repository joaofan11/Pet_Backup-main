'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in">
      {/* Hero */}
      <div className="gradient-hero text-center py-24 px-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_50%),radial-gradient(circle_at_80%_50%,white_0%,transparent_50%)]" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 relative drop-shadow-lg tracking-tight">
          Conectando Corações
        </h1>
        <p className="text-lg md:text-xl text-white/95 mb-12 max-w-xl mx-auto relative">
          A plataforma mais completa para adoção de pets e gestão da saúde dos seus animais de estimação
        </p>
        <div className="flex gap-6 justify-center flex-wrap relative">
          <Link
            href="/adoption"
            className="bg-white text-petplus-teal px-10 py-4 rounded-full text-lg font-bold shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            🐾 Adotar um Pet
          </Link>
          {!isAuthenticated && (
            <Link
              href="/register"
              className="bg-transparent text-white border-2 border-white px-10 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-petplus-teal transition-all duration-300"
            >
              ✨ Cadastrar-se
            </Link>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-12 md:p-16 bg-gradient-to-b from-muted/50 to-muted">
        {[
          { icon: '🏠', title: 'Encontre um Lar', desc: 'Milhares de animais esperando uma família amorosa. Use nossos filtros avançados para encontrar o companheiro perfeito para você e sua família.' },
          { icon: '❤️', title: 'Doe com Amor', desc: 'Ajude um animal a encontrar uma nova família. Cadastre pets para adoção de forma simples e acompanhe todo o processo.' },
          { icon: '📱', title: 'Carteira Digital', desc: 'Mantenha o histórico completo de vacinas, consultas e medicamentos dos seus pets sempre organizado e acessível.' },
          { icon: '🩺', title: 'Serviços', desc: 'Encontre tudo o que seu pet precisa em um só lugar: hospedagem, creche, pet sitter, banho e tosa profissionais e clínicas.' },
        ].map((feature) => (
          <div
            key={feature.title}
            className="text-center p-10 rounded-xl bg-card shadow-card border border-border/50 hover:-translate-y-2.5 hover:shadow-card-hover transition-all duration-300"
          >
            <span className="text-5xl block mb-6">{feature.icon}</span>
            <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
