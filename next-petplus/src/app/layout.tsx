import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetPlus - Conectando Corações",
  description:
    "Plataforma completa para adoção de pets, carteira de vacinação digital, serviços e comunidade.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-petplus-teal/20 to-petplus-green/20 font-sans leading-relaxed text-foreground">
        <AuthProvider>
          <div className="mx-auto max-w-[1400px] p-5">
            <Navbar />
            {children}
            <Footer />
          </div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}