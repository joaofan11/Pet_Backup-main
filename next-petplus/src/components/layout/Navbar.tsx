'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 border-2 border-transparent ${
      isActive(path)
        ? 'gradient-primary text-primary-foreground shadow-md'
        : 'text-muted-foreground hover:gradient-primary hover:text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg'
    }`;

  return (
    <nav className="bg-card/95 backdrop-blur-md px-6 py-4 rounded-xl mb-6 flex justify-between items-center flex-wrap border border-border/20 shadow-card">
      <Link href="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo PetPlus" width={42} height={42} />
        <span className="text-2xl font-extrabold bg-gradient-to-r from-petplus-teal to-petplus-green bg-clip-text text-transparent">
          PetPlus
        </span>
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        {isAuthenticated && user && (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-accent rounded-full">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary text-primary-foreground font-bold text-sm cursor-pointer">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-sm font-semibold text-accent-foreground">
              {user.name.split(' ')[0]}
            </span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Link href="/" className={navLinkClass('/')}>Home</Link>
          <Link href="/adoption" className={navLinkClass('/adoption')}>Adotar</Link>
          <Link href="/services" className={navLinkClass('/services')}>Serviços</Link>
          <Link href="/blog" className={navLinkClass('/blog')}>Blog</Link>

          {isAuthenticated ? (
            <>
              <Link href="/my-pets" className={navLinkClass('/my-pets')}>Meus Pets</Link>
              <Link href="/profile" className={navLinkClass('/profile')}>Perfil</Link>
              <button
                onClick={logout}
                className="px-5 py-2.5 rounded-full font-semibold text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass('/login')}>Entrar</Link>
              <Link href="/register" className={navLinkClass('/register')}>Cadastrar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
