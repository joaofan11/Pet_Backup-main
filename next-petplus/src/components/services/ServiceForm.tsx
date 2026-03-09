'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import type { ServiceProvider } from '@/types';

export default function ServiceRegisterPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [form, setForm] = useState({
    category: '', name: '', professional: '', phone: '',
    address: '', description: '', latitude: '', longitude: '',
  });

  useEffect(() => {
    if (id) {
      apiFetch<ServiceProvider>(`/services/${id}`).then(s => {
        setForm({
          category: s.category, name: s.name, professional: s.professional,
          phone: s.phone, address: s.address, description: s.description,
          latitude: s.latitude?.toString() || '',
          longitude: s.longitude?.toString() || '',
        });
      }).catch(() => {
        toast({ title: 'Serviço não encontrado.', variant: 'destructive' });
        router.push('/services');
      });
    } else {
      // Ao criar novo serviço, tenta obter localização automaticamente
      getGeolocation();
    }
  }, [id]);

  const getGeolocation = () => {
    if (!navigator.geolocation) return;

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(p => ({ ...p, latitude: latitude.toString(), longitude: longitude.toString() }));
        // Tenta fazer geocoding reverso para preencher o endereço
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then(r => r.json())
          .then(data => {
            if (data?.display_name) {
              const addr = data.address;
              const parts = [
                addr.road,
                addr.house_number,
                addr.suburb || addr.neighbourhood,
                addr.city || addr.town,
              ].filter(Boolean);
              const formattedAddress = parts.join(', ');
              setForm(p => ({ ...p, address: formattedAddress || data.display_name }));
              toast({ title: '📍 Localização detectada!' });
            }
          })
          .catch(() => {
            toast({ title: '📍 Coordenadas salvas. Preencha o endereço manualmente.' });
          })
          .finally(() => setGeoLoading(false));
      },
      (error) => {
        setGeoLoading(false);
        console.warn('Geolocation error:', error.message);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.name || !form.professional || !form.phone || !form.address || !form.description) {
      toast({ title: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      const endpoint = id ? `/services/${id}` : '/services';
      const method = id ? 'PUT' : 'POST';
      await apiFetch(endpoint, { method, body: JSON.stringify(payload) });
      toast({ title: `Serviço ${id ? 'atualizado' : 'cadastrado'} com sucesso!` });
      setTimeout(() => router.push('/services'), 2000);
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm('Excluir este serviço permanentemente?', { title: 'Excluir Serviço' });
    if (!id || !ok) return;
    try {
      await apiFetch(`/services/${id}`, { method: 'DELETE' });
      toast({ title: 'Serviço excluído.' });
      router.push('/services');
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const selectClass = "w-full h-12 px-4 rounded-lg border-2 border-border bg-muted/50 text-sm focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in">
      <div className="max-w-md mx-auto py-16 px-10">
        <h2 className="text-center text-3xl font-bold text-foreground mb-10">
          {id ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Categoria</label>
            <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className={selectClass} required>
              <option value="">Selecione...</option>
              <option value="vet">🩺 Veterinários</option>
              <option value="sitter">❤️ Cuidadores</option>
              <option value="walker">🐕 Passeadores</option>
              <option value="transport">🚐 Transporte Pet</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nome do Serviço/Empresa</label>
            <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Clínica Veterinária PetSaúde" className="h-12 rounded-lg bg-muted/50 border-2 border-border" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nome do Profissional</label>
            <Input value={form.professional} onChange={(e) => setForm(p => ({ ...p, professional: e.target.value }))} placeholder="Ex: Dr. João Silva" className="h-12 rounded-lg bg-muted/50 border-2 border-border" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Telefone</label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(00) 00000-0000" className="h-12 rounded-lg bg-muted/50 border-2 border-border" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Endereço/Área de Atendimento
              </label>
              <button
                type="button"
                onClick={getGeolocation}
                disabled={geoLoading}
                className="text-xs text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {geoLoading ? '📍 Detectando...' : '📍 Usar minha localização'}
              </button>
            </div>
            <Input
              value={form.address}
              onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder={geoLoading ? 'Obtendo localização...' : 'Ex: Rua das Flores, 123 - Centro'}
              className="h-12 rounded-lg bg-muted/50 border-2 border-border"
              required
            />
            {form.latitude && form.longitude && (
              <p className="text-xs text-petplus-teal font-medium">
                ✅ Coordenadas salvas — serviço aparecerá no mapa
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Descrição do Serviço</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descreva os serviços oferecidos..."
              className="w-full min-h-[120px] px-4 py-3 rounded-lg border-2 border-border bg-muted/50 text-sm resize-y focus:border-primary focus:outline-none"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg text-base">
            {loading ? 'Salvando...' : id ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
          </Button>
          {id && (
            <Button type="button" variant="destructive" onClick={handleDelete} className="w-full h-12 font-bold uppercase tracking-wider rounded-lg text-base mt-4">
              Excluir Serviço
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}