// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NAV_LINKS } from '@/lib/constants';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="mx-auto mb-6 flex max-w-[1400px] flex-wrap items-center justify-between gap-4 rounded-[20px] border border-white/20 bg-white/95 px-8 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-[15px]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo.png" alt="Logo PetPlus" width={50} height={50} />
        <span className="bg-gradient-to-r from-[#75b2c3] to-[#99b06a] bg-clip-text text-2xl font-extrabold text-transparent">
          PetPlus
        </span>
      </Link>

      {/* Nav + User */}
      <div className="flex flex-wrap items-center gap-5">
        {/* Avatar (logado) */}
        {user && (
          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-[20px] bg-[#75b2c3]/10 px-4 py-2 text-sm font-semibold text-[#75b2c3]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75b2c3] text-sm font-bold text-white">
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span>{user.name.split(' ')[0]}</span>
          </Link>
        )}

        {/* Links de navegação */}
        <div className="flex flex-wrap gap-3">
          {NAV_LINKS.public.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[30px] border-2 border-transparent px-6 py-3 text-[0.95rem] font-semibold transition-all duration-300 ${
                isActive(link.href)
                  ? 'bg-gradient-to-r from-[#75b2c3] to-[#80b37a] text-white shadow-[0_4px_15px_rgba(117,178,195,0.3)]'
                  : 'text-[#4a5568] hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-[#75b2c3] hover:to-[#80b37a] hover:text-white hover:shadow-[0_8px_25px_rgba(117,178,195,0.4)]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Links autenticados */}
          {user &&
            NAV_LINKS.authenticated.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[30px] border-2 border-transparent px-6 py-3 text-[0.95rem] font-semibold transition-all duration-300 ${
                  isActive(link.href)
                    ? 'bg-gradient-to-r from-[#75b2c3] to-[#80b37a] text-white shadow-[0_4px_15px_rgba(117,178,195,0.3)]'
                    : 'text-[#4a5568] hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-[#75b2c3] hover:to-[#80b37a] hover:text-white hover:shadow-[0_8px_25px_rgba(117,178,195,0.4)]'
                }`}
              >
                {link.label}
              </Link>
            ))}

          {/* Auth buttons */}
          {!user ? (
            <>
              <Link
                href="/login"
                className={`rounded-[30px] border-2 border-transparent px-6 py-3 text-[0.95rem] font-semibold transition-all duration-300 ${
                  isActive('/login')
                    ? 'bg-gradient-to-r from-[#75b2c3] to-[#80b37a] text-white'
                    : 'text-[#4a5568] hover:bg-gradient-to-r hover:from-[#75b2c3] hover:to-[#80b37a] hover:text-white'
                }`}
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className={`rounded-[30px] border-2 border-transparent px-6 py-3 text-[0.95rem] font-semibold transition-all duration-300 ${
                  isActive('/register')
                    ? 'bg-gradient-to-r from-[#75b2c3] to-[#80b37a] text-white'
                    : 'text-[#4a5568] hover:bg-gradient-to-r hover:from-[#75b2c3] hover:to-[#80b37a] hover:text-white'
                }`}
              >
                Cadastrar
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="rounded-[30px] border-2 border-transparent px-6 py-3 text-[0.95rem] font-semibold text-[#4a5568] transition-all duration-300 hover:bg-gradient-to-r hover:from-[#75b2c3] hover:to-[#80b37a] hover:text-white"
            >
              Sair
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
