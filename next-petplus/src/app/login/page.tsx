'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Por favor, preencha todos os campos.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const message = await login(email, password);
      toast({ title: message });
      setTimeout(() => router.push('/'), 1000);
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in">
      <div className="max-w-md mx-auto py-16 px-10">
        <h2 className="text-center text-3xl font-bold text-foreground mb-10">Fazer Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wide">Senha</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-lg bg-muted/50 border-2 border-border focus:border-primary" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-bold uppercase tracking-wider rounded-lg text-base hover:-translate-y-0.5 hover:shadow-lg transition-all">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="text-center mt-6 text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">Cadastre-se aqui</Link>
        </p>
      </div>
    </div>
  );
}
