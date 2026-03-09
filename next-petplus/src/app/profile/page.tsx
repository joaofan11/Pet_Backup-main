'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userData = await apiFetch<User>('/auth/me');
        setName(userData.name);
        setEmail(userData.email);
        setPhone(userData.phone);
        setPhotoUrl(userData.photoUrl);
      } catch {
        if (user) {
          setName(user.name);
          setEmail(user.email);
          setPhone(user.phone);
          setPhotoUrl(user.photoUrl);
        }
      }
    }
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast({ title: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      if (password) formData.append('password', password);
      if (photoFile) formData.append('photo', photoFile);

      await updateProfile(formData);
      toast({ title: 'Perfil atualizado com sucesso!' });
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in">
      <div className="max-w-md mx-auto py-16 px-10">
        <h2 className="text-center text-3xl font-bold text-foreground mb-8">Meu Perfil</h2>

        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
            {photoUrl ? (
              <Image src={photoUrl} alt="Profile" fill className="object-cover" />
            ) : (
              name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <label className="inline-block mt-4 cursor-pointer">
            <span className="gradient-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold">
              Alterar Foto
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPhotoFile(file);
                  setPhotoUrl(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nome Completo</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Telefone</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nova Senha (opcional)</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Confirmar Nova Senha</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg text-base">
            {loading ? 'Atualizando...' : 'Atualizar Perfil'}
          </Button>
        </form>
      </div>
    </div>
  );
}
