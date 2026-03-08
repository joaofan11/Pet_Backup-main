'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { ServiceProvider } from '@/types';

export default function ServiceRegisterPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: '', name: '', professional: '', phone: '', address: '', description: '',
  });

  useEffect(() => {
    if (id) {
      apiFetch<ServiceProvider>(`/services/${id}`).then(s => {
        setForm({
          category: s.category, name: s.name, professional: s.professional,
          phone: s.phone, address: s.address, description: s.description,
        });
      }).catch(() => {
        toast({ title: 'Serviço não encontrado.', variant: 'destructive' });
        router.push('/services');
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.name || !form.professional || !form.phone || !form.address || !form.description) {
      toast({ title: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const endpoint = id ? `/services/${id}` : '/services';
      const method = id ? 'PUT' : 'POST';
      await apiFetch(endpoint, { method, body: JSON.stringify(form) });
      toast({ title: `Serviço ${id ? 'atualizado' : 'cadastrado'} com sucesso!` });
      setTimeout(() => router.push('/services'), 2000);
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Excluir este serviço?')) return;
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
        <h2 className="text-center text-3xl font-bold text-foreground mb-10">{id ? 'Atualizar Serviço' : 'Cadastrar Serviço'}</h2>
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
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Endereço/Área de Atendimento</label>
            <Input value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Ex: Rua das Flores, 123 - Centro" className="h-12 rounded-lg bg-muted/50 border-2 border-border" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Descrição do Serviço</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descreva os serviços oferecidos..." className="w-full min-h-[120px] px-4 py-3 rounded-lg border-2 border-border bg-muted/50 text-sm resize-y focus:border-primary focus:outline-none" required />
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
