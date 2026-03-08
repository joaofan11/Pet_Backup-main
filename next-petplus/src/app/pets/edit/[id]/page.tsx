'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Pet } from '@/types';

export default function PetRegisterPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: '', name: '', species: '', breed: '', age: '', size: '', gender: '', description: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('');

  useEffect(() => {
    if (id) {
      apiFetch<Pet>(`/pets/${id}`).then(pet => {
        setForm({
          type: pet.type, name: pet.name, species: pet.species, breed: pet.breed,
          age: pet.age, size: pet.size, gender: pet.gender, description: pet.description,
        });
        if (pet.photoUrl) setExistingPhotoUrl(pet.photoUrl);
      }).catch(() => {
        toast({ title: 'Pet não encontrado.', variant: 'destructive' });
        router.push('/my-pets');
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.name || !form.species || !form.breed || !form.age || !form.size || !form.gender || !form.description) {
      toast({ title: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (photoFile) formData.append('photo', photoFile);
      if (existingPhotoUrl) formData.append('photoUrl', existingPhotoUrl);

      const endpoint = id ? `/pets/${id}` : '/pets';
      const method = id ? 'PUT' : 'POST';

      const result = await apiFetch<Pet>(endpoint, { method, body: formData, isFormData: true });
      toast({ title: `${result.name} foi ${id ? 'atualizado' : 'cadastrado'} com sucesso!` });
      setTimeout(() => router.push(result.type === 'adoption' ? '/adoption' : '/my-pets'), 1500);
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Tem certeza que deseja excluir este pet?')) return;
    try {
      await apiFetch(`/pets/${id}`, { method: 'DELETE' });
      toast({ title: 'Pet excluído com sucesso.' });
      router.push('/my-pets');
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const selectClass = "w-full h-12 px-4 rounded-lg border-2 border-border bg-muted/50 text-sm focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in">
      <div className="max-w-md mx-auto py-16 px-10">
        <h2 className="text-center text-3xl font-bold text-foreground mb-10">{id ? 'Atualizar Pet' : 'Cadastrar Pet'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Foto do Pet</label>
            <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="h-12 rounded-lg" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tipo de Cadastro</label>
            <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} className={selectClass} required>
              <option value="">Selecione...</option>
              <option value="adoption">Para Adoção</option>
              <option value="personal">Pet Pessoal</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nome do Pet</label>
            <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome do seu pet" className="h-12 rounded-lg bg-muted/50 border-2 border-border" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Espécie</label>
            <select value={form.species} onChange={(e) => setForm(p => ({ ...p, species: e.target.value }))} className={selectClass} required>
              <option value="">Selecione...</option>
              <option value="dog">Cão</option>
              <option value="cat">Gato</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Raça</label>
            <Input value={form.breed} onChange={(e) => setForm(p => ({ ...p, breed: e.target.value }))} placeholder="Raça do pet" className="h-12 rounded-lg bg-muted/50 border-2 border-border" required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Idade</label>
            <select value={form.age} onChange={(e) => setForm(p => ({ ...p, age: e.target.value }))} className={selectClass} required>
              <option value="">Selecione...</option>
              <option value="puppy">Filhote (0-1 ano)</option>
              <option value="young">Jovem (1-3 anos)</option>
              <option value="adult">Adulto (3-7 anos)</option>
              <option value="senior">Idoso (7+ anos)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Porte</label>
            <select value={form.size} onChange={(e) => setForm(p => ({ ...p, size: e.target.value }))} className={selectClass} required>
              <option value="">Selecione...</option>
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sexo</label>
            <select value={form.gender} onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))} className={selectClass} required>
              <option value="">Selecione...</option>
              <option value="male">Macho</option>
              <option value="female">Fêmea</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Conte sobre a personalidade, cuidados especiais..." className="w-full min-h-[120px] px-4 py-3 rounded-lg border-2 border-border bg-muted/50 text-sm resize-y focus:border-primary focus:outline-none" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg text-base">
            {loading ? 'Salvando...' : id ? 'Atualizar Pet' : 'Cadastrar Pet'}
          </Button>
          {id && (
            <Button type="button" variant="destructive" onClick={handleDelete} className="w-full h-12 font-bold uppercase tracking-wider rounded-lg text-base mt-4">
              Excluir Pet
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
