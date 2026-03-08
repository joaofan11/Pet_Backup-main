// src/app/layout.tsx

import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'PetPlus - Conectando Corações',
  description:
    'Plataforma completa para adoção de pets, carteira de vacinação digital, serviços e comunidade.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-[#75b2c3] to-[#99b06a] font-sans leading-relaxed text-[#1a202c]">
        <AuthProvider>
          <div className="mx-auto max-w-[1400px] p-5">
            <Navbar />
            {children}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
