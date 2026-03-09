'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Pet, Vaccine } from '@/types';
import { getSpeciesIcon, getAgeLabel, getSizeLabel, formatDate, isVaccineUpcoming } from '@/lib/helpers';

export default function MyPetsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [vaccineModal, setVaccineModal] = useState<{ petId: number; vaccine?: Vaccine } | null>(null);
  const [vaccineForm, setVaccineForm] = useState({ name: '', date: '', nextDate: '', vet: '', notes: '' });

  const loadPets = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Pet[]>('/pets/mypets');
      setPets(data);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPets(); }, []);

  const handleVaccineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineModal || !vaccineForm.name || !vaccineForm.date) return;

    try {
      const data = {
        name: vaccineForm.name,
        date: vaccineForm.date,
        nextDate: vaccineForm.nextDate || null,
        vet: vaccineForm.vet || null,
        notes: vaccineForm.notes || null,
      };

      if (vaccineModal.vaccine) {
        await apiFetch(`/pets/vaccines/${vaccineModal.vaccine.id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await apiFetch(`/pets/${vaccineModal.petId}/vaccines`, { method: 'POST', body: JSON.stringify(data) });
      }

      setVaccineModal(null);
      setVaccineForm({ name: '', date: '', nextDate: '', vet: '', notes: '' });
      await loadPets();
      toast({ title: 'Vacina salva com sucesso!' });
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const deleteVaccine = async (vaccineId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta vacina?')) return;
    try {
      await apiFetch(`/pets/vaccines/${vaccineId}`, { method: 'DELETE' });
      await loadPets();
      if (selectedPet) {
        const updated = pets.find(p => p.id === selectedPet.id);
        if (updated) setSelectedPet(updated);
      }
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const markAsAdopted = async (petId: number) => {
    if (!confirm('Marcar este pet como adotado?')) return;
    try {
      await apiFetch(`/pets/${petId}/adopt`, { method: 'PUT' });
      await loadPets();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const openVaccineModal = (petId: number, vaccine?: Vaccine) => {
    setVaccineModal({ petId, vaccine });
    if (vaccine) {
      setVaccineForm({
        name: vaccine.name,
        date: vaccine.date.split('T')[0],
        nextDate: vaccine.nextDate?.split('T')[0] || '',
        vet: vaccine.vet || '',
        notes: vaccine.notes || '',
      });
    } else {
      setVaccineForm({ name: '', date: '', nextDate: '', vet: '', notes: '' });
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-foreground">Meus Pets</h2>
        <Button onClick={() => router.push('/pets/new')} className="gradient-primary text-primary-foreground font-semibold px-8">
          + Adicionar Pet
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🐾</span>
          <h3 className="text-xl font-bold text-foreground mb-2">Você ainda não tem pets cadastrados</h3>
          <p className="text-muted-foreground mb-6">Cadastre seu primeiro pet para começar a usar a carteira de vacinação digital.</p>
          <Button onClick={() => router.push('/pets/new')} className="gradient-primary text-primary-foreground">Cadastrar Meu Primeiro Pet</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-card rounded-xl overflow-hidden shadow-card border border-border/50 hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300">
              <div className="w-full h-52 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-6xl overflow-hidden">
                {pet.photoUrl ? <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" /> : getSpeciesIcon(pet.species)}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-3">{pet.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  <div className="flex justify-between"><span>Espécie:</span><span>{getSpeciesIcon(pet.species)} {pet.species === 'dog' ? 'Cão' : 'Gato'}</span></div>
                  <div className="flex justify-between"><span>Idade:</span><span>{getAgeLabel(pet.age)}</span></div>
                  <div className="flex justify-between"><span>Porte:</span><span>{getSizeLabel(pet.size)}</span></div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{pet.description}</p>

                {pet.vaccines?.some(v => isVaccineUpcoming(v.nextDate)) && (
                  <div className="bg-petplus-orange/10 p-2.5 rounded-lg mb-3 border-l-3 border-petplus-orange">
                    <small className="text-petplus-orange font-semibold text-xs">
                      ⚠️ {pet.vaccines.filter(v => isVaccineUpcoming(v.nextDate)).length} vacina(s) próxima(s) do vencimento
                    </small>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => setSelectedPet(pet)} className="flex-1">Ver Perfil</Button>
                  <Button size="sm" onClick={() => router.push(`/pets/edit/${pet.id}`)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">Editar</Button>
                  {pet.type === 'personal' && (
                    <Button size="sm" onClick={() => openVaccineModal(pet.id)} className="flex-1 bg-petplus-orange hover:bg-petplus-orange/90 text-white">+ Vacina</Button>
                  )}
                  {pet.type === 'adoption' && pet.status === 'available' && (
                    <Button size="sm" onClick={() => markAsAdopted(pet.id)} className="flex-1 bg-petplus-green hover:bg-petplus-green/90 text-white">Adotado</Button>
                  )}
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${pet.type === 'personal' ? 'bg-primary/10 text-primary' : 'bg-petplus-green/10 text-petplus-green'}`}>
                    {pet.type === 'personal' ? '👤 Meu Pet' : '🏠 Disponível'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pet Profile Modal */}
      <Dialog open={!!selectedPet} onOpenChange={() => setSelectedPet(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedPet && (
            <>
              <DialogHeader>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto bg-muted flex items-center justify-center text-5xl mb-4">
                    {selectedPet.photoUrl ? <Image src={selectedPet.photoUrl} alt={selectedPet.name} fill className="object-cover" /> : getSpeciesIcon(selectedPet.species)}
                  </div>
                  <DialogTitle className="text-2xl">{selectedPet.name}</DialogTitle>
                  <p className="text-muted-foreground text-sm">Cadastrado em {formatDate(selectedPet.createdAt)}</p>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-2">📝 Sobre {selectedPet.name}</h4>
                <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg">{selectedPet.description}</p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-foreground">💉 Carteira de Vacinação</h4>
                  {user && selectedPet.ownerId === user.userId && (
                    <Button size="sm" onClick={() => openVaccineModal(selectedPet.id)}>+ Vacina</Button>
                  )}
                </div>
                {selectedPet.vaccines?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPet.vaccines.map((v) => (
                      <div key={v.id} className={`p-3 rounded-lg border flex items-center justify-between ${isVaccineUpcoming(v.nextDate) ? 'border-petplus-orange bg-petplus-orange/5' : 'border-border'}`}>
                        <div>
                          <h5 className="font-semibold text-sm">💉 {v.name}</h5>
                          <p className="text-xs text-muted-foreground">Aplicada em {formatDate(v.date)}</p>
                          <span className="text-xs text-muted-foreground">{v.nextDate ? `Próxima: ${formatDate(v.nextDate)}` : 'Dose única'}</span>
                        </div>
                        {user && selectedPet.ownerId === user.userId && (
                          <div className="flex gap-1">
                            <button onClick={() => openVaccineModal(selectedPet.id, v)} className="text-lg hover:scale-110 transition-transform" title="Editar">✏️</button>
                            <button onClick={() => deleteVaccine(v.id)} className="text-lg hover:scale-110 transition-transform" title="Excluir">🗑️</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">Nenhuma vacina registrada.</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Vaccine Modal */}
      <Dialog open={!!vaccineModal} onOpenChange={() => setVaccineModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{vaccineModal?.vaccine ? 'Editar Vacina' : 'Adicionar Vacina'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVaccineSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Nome da Vacina</label>
              <Input value={vaccineForm.name} onChange={(e) => setVaccineForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ex: V10, Antirrábica..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Data de Aplicação</label>
              <Input type="date" value={vaccineForm.date} onChange={(e) => setVaccineForm(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Próxima Dose (opcional)</label>
              <Input type="date" value={vaccineForm.nextDate} onChange={(e) => setVaccineForm(p => ({ ...p, nextDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Veterinário</label>
              <Input value={vaccineForm.vet} onChange={(e) => setVaccineForm(p => ({ ...p, vet: e.target.value }))} placeholder="Nome do veterinário" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Observações</label>
              <textarea value={vaccineForm.notes} onChange={(e) => setVaccineForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observações adicionais..." className="w-full min-h-[80px] px-3 py-2 rounded-lg border-2 border-border bg-background text-sm resize-y" />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-bold">
              {vaccineModal?.vaccine ? 'Salvar Alterações' : 'Adicionar Vacina'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
