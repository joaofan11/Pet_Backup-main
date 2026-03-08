// src/app/my-pets/page.tsx
'use client'

import { AuthGuard } from '@/components/auth/AuthGuard'

export default function MyPetsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Meus Pets</h1>
        {/* conteúdo */}
      </div>
    </AuthGuard>
  )
}
