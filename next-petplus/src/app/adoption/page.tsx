'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Pet } from '@/types';
import { getSpeciesIcon, getAgeLabel, getSizeLabel, formatDate, isVaccineUpcoming } from '@/lib/helpers';

export default function AdoptionPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [size, setSize] = useState('');
  const [age, setAge] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [contactPet, setContactPet] = useState<Pet | null>(null);

  const loadPets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (species) params.append('species', species);
      if (size) params.append('size', size);
      if (age) params.append('age', age);
      const data = await apiFetch<Pet[]>(`/pets/adoption?${params.toString()}`);
      setPets(data);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, [search, species, size, age]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in">
      <div className="p-8 pb-0">
        <h2 className="text-center text-3xl font-bold text-foreground mb-8">Pets Disponíveis para Adoção</h2>

        {/* Filters */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border/50 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">🔍 Buscar</label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome ou raça..." className="h-11 rounded-lg border-2 border-border" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">🐾 Espécie</label>
            <select value={species} onChange={(e) => setSpecies(e.target.value)} className="w-full h-11 px-3 rounded-lg border-2 border-border bg-background text-sm">
              <option value="">Todas</option>
              <option value="dog">Cão</option>
              <option value="cat">Gato</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">📏 Porte</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full h-11 px-3 rounded-lg border-2 border-border bg-background text-sm">
              <option value="">Todos</option>
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">🎂 Idade</label>
            <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full h-11 px-3 rounded-lg border-2 border-border bg-background text-sm">
              <option value="">Todas</option>
              <option value="puppy">Filhote</option>
              <option value="young">Jovem</option>
              <option value="adult">Adulto</option>
              <option value="senior">Idoso</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">📋 Ações</label>
            <Button onClick={() => router.push('/pets/new')} className="w-full h-11 gradient-primary text-primary-foreground font-semibold">
              + Cadastrar Pet
            </Button>
          </div>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 p-8">
        {loading ? (
          <div className="col-span-full text-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : pets.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <span className="text-5xl block mb-4">🐾</span>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum pet disponível</h3>
            <p className="text-muted-foreground">No momento, não há pets para adoção. Volte em breve!</p>
          </div>
        ) : (
          pets.map((pet) => (
            <div key={pet.id} className="bg-card rounded-xl overflow-hidden shadow-card border border-border/50 hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300">
              <div className="w-full h-52 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-6xl overflow-hidden">
                {pet.photoUrl ? (
                  <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  getSpeciesIcon(pet.species)
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-3">{pet.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  <div className="flex justify-between"><span>Espécie:</span><span>{getSpeciesIcon(pet.species)} {pet.species === 'dog' ? 'Cão' : 'Gato'}</span></div>
                  <div className="flex justify-between"><span>Idade:</span><span>{getAgeLabel(pet.age)}</span></div>
                  <div className="flex justify-between"><span>Porte:</span><span>{getSizeLabel(pet.size)}</span></div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{pet.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedPet(pet)} className="flex-1">Ver Perfil</Button>
                  {isAuthenticated ? (
                    <Button size="sm" onClick={() => setContactPet(pet)} className="flex-1 bg-petplus-green hover:bg-petplus-green/90 text-white">
                      Contato
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => router.push('/login')} className="flex-1">
                      Logar para Contato
                    </Button>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-petplus-green/10 text-petplus-green font-semibold">
                    🏠 Disponível
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pet Profile Modal */}
      <Dialog open={!!selectedPet} onOpenChange={() => setSelectedPet(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedPet && (
            <>
              <DialogHeader>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto bg-muted flex items-center justify-center text-5xl mb-4">
                    {selectedPet.photoUrl ? (
                      <img src={selectedPet.photoUrl} alt={selectedPet.name} className="w-full h-full object-cover" />
                    ) : (
                      getSpeciesIcon(selectedPet.species)
                    )}
                  </div>
                  <DialogTitle className="text-2xl">{selectedPet.name}</DialogTitle>
                  <p className="text-muted-foreground text-sm">Cadastrado em {formatDate(selectedPet.createdAt)}</p>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-2">📝 Sobre {selectedPet.name}</h4>
                <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg leading-relaxed">{selectedPet.description}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-2">💉 Carteira de Vacinação</h4>
                {selectedPet.vaccines?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPet.vaccines.map((v) => (
                      <div key={v.id} className={`p-3 rounded-lg border ${isVaccineUpcoming(v.nextDate) ? 'border-petplus-orange bg-petplus-orange/5' : 'border-border'}`}>
                        <h5 className="font-semibold">💉 {v.name}</h5>
                        <p className="text-sm text-muted-foreground">Aplicada em {formatDate(v.date)}</p>
                        <span className="text-xs text-muted-foreground">{v.nextDate ? `Próxima: ${formatDate(v.nextDate)}` : 'Dose única'}</span>
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

      {/* Contact Modal */}
      <Dialog open={!!contactPet} onOpenChange={() => setContactPet(null)}>
        <DialogContent>
          {contactPet && (
            <>
              <DialogHeader>
                <div className="text-center">
                  <span className="text-5xl block mb-4">👤</span>
                  <DialogTitle>{contactPet.ownerName}</DialogTitle>
                  <p className="text-muted-foreground">Responsável pelo pet</p>
                </div>
              </DialogHeader>
              <div className="bg-muted/50 rounded-lg p-6 mt-4 space-y-3">
                <h4 className="font-semibold text-foreground">📞 Informações de Contato</h4>
                <p><strong className="text-muted-foreground">Email:</strong>{' '}
                  <a href={`mailto:${contactPet.ownerEmail}`} className="text-primary hover:underline">{contactPet.ownerEmail}</a>
                </p>
                <p><strong className="text-muted-foreground">Telefone:</strong>{' '}
                  <a href={`tel:${contactPet.ownerPhone?.replace(/\D/g, '')}`} className="text-primary hover:underline">{contactPet.ownerPhone}</a>
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
