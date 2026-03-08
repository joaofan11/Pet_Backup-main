'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast({ title: 'Por favor, preencha todos os campos.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const message = await register({ name, email, phone, password, confirmPassword });
      toast({ title: message });
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in">
      <div className="max-w-md mx-auto py-16 px-10">
        <h2 className="text-center text-3xl font-bold text-foreground mb-10">Criar Conta</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nome Completo</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Telefone</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Senha</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Confirmar Senha</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg text-base hover:-translate-y-0.5 hover:shadow-lg transition-all">
            {loading ? 'Criando...' : 'Criar Conta'}
          </Button>
        </form>
        <p className="text-center mt-6 text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">Faça login aqui</Link>
        </p>
      </div>
    </div>
  );
}
