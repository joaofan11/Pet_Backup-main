'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { ServiceProvider } from '@/types';
import { getCategoryLabel } from '@/lib/helpers';

export default function ServicesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      const data = await apiFetch<ServiceProvider[]>(`/services?${params.toString()}`);
      setServices(data);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { loadServices(); }, [loadServices]);

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in">
      <div className="p-8 pb-0">
        <h2 className="text-center text-3xl font-bold text-foreground mb-8">Encontre Serviços para seu Pet</h2>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">🔍 Buscar</label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, profissional ou bairro..." className="h-11 rounded-lg border-2 border-border" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">🏷️ Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 px-3 rounded-lg border-2 border-border bg-background text-sm">
              <option value="">Todas</option>
              <option value="vet">Veterinários</option>
              <option value="sitter">Cuidadores</option>
              <option value="walker">Passeadores</option>
              <option value="transport">Transporte Pet</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">📋 Ações</label>
            <Button onClick={() => router.push('/services/new')} className="w-full h-11 gradient-primary text-primary-foreground font-semibold">
              + Cadastrar Serviço
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 p-8">
        {loading ? (
          <div className="col-span-full text-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <span className="text-5xl block mb-4">🤷</span>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum profissional encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          services.map((s) => {
            const isContactVisible = s.phone !== 'Faça login para ver';
            return (
              <div key={s.id} className="bg-card rounded-xl overflow-hidden shadow-card border border-border/50 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground">{s.name}</h3>
                  <span className="text-sm text-muted-foreground">{s.professional}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{s.description}</p>
                {isContactVisible ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4"><strong>Endereço:</strong> {s.address}</p>
                    <div className="flex flex-col gap-2">
                      <a href={`tel:${s.phone.replace(/\D/g, '')}`} className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-petplus-green text-white text-sm font-semibold hover:bg-petplus-green/90 transition-colors">
                        📞 Ligar ({s.phone})
                      </a>
                      {user && user.userId === s.ownerId && (
                        <Button size="sm" onClick={() => router.push(`/services/edit/${s.id}`)} className="bg-blue-500 hover:bg-blue-600 text-white">
                          Editar
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-muted-foreground text-sm mb-3">🔒 Faça login para ver o endereço e telefone.</p>
                    <Button size="sm" variant="secondary" onClick={() => router.push('/login')}>Fazer Login</Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
