'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost } from '@/types';
import Image from 'next/image';
import { formatDateTime } from '@/lib/helpers';

export default function BlogPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<BlogPost[]>('/blog');
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) {
      toast({ title: 'O conteúdo não pode estar vazio.', variant: 'destructive' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (location) formData.append('location', location);
      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (existingPhotoUrl) {
        // Preserva a foto existente quando editando sem trocar a foto
        formData.append('photoUrl', existingPhotoUrl);
      }

      const endpoint = editId ? `/blog/${editId}` : '/blog';
      const method = editId ? 'PUT' : 'POST';

      await apiFetch(endpoint, { method, body: formData, isFormData: true });
      toast({ title: `Post ${editId ? 'atualizado' : 'publicado'} com sucesso!` });
      resetForm();
      loadPosts();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setContent('');
    setLocation('');
    setPhotoFile(null);
    setExistingPhotoUrl('');
  };

  const startEdit = (post: BlogPost) => {
    setEditId(post.id);
    setContent(post.content);
    setLocation(post.location || '');
    setExistingPhotoUrl(post.photoUrl || '');
    setPhotoFile(null);
    setShowForm(true);
  };

  const deletePost = async (postId: number) => {
    if (!confirm('Excluir este post?')) return;
    try {
      await apiFetch(`/blog/${postId}`, { method: 'DELETE' });
      loadPosts();
      resetForm();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const toggleLike = async (postId: number) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      await apiFetch(`/blog/${postId}/like`, { method: 'POST' });
      loadPosts();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  const submitComment = async (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push('/login'); return; }
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const commentContent = input.value.trim();
    if (!commentContent) return;

    try {
      await apiFetch(`/blog/${postId}/comment`, { method: 'POST', body: JSON.stringify({ content: commentContent }) });
      input.value = '';
      loadPosts();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-in p-8">
      <h2 className="text-center text-3xl font-bold text-foreground mb-8">Blog PetPlus</h2>

      {isAuthenticated && !showForm && (
        <div className="text-center mb-8">
          <Button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground font-semibold">
            + Escrever Novo Post
          </Button>
        </div>
      )}

      {showForm && (
        <div className="max-w-2xl mx-auto mb-10 p-8 border border-border rounded-xl bg-muted/30">
          <h3 className="text-xl font-bold text-foreground mb-6">{editId ? 'Editar Post' : 'Novo Post'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">O que está acontecendo?</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva seu post aqui... (estilo tweet)"
                maxLength={280}
                className="w-full min-h-[100px] px-4 py-3 rounded-lg border-2 border-border bg-background text-sm resize-y focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">
                  {existingPhotoUrl && !photoFile ? '📷 Trocar Foto' : 'Adicionar Foto'}
                </label>
                {existingPhotoUrl && !photoFile && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Image src={existingPhotoUrl} alt="Foto atual" width={40} height={40} className="w-10 h-10 rounded object-cover" />
                    <span>Foto atual (selecione uma nova para trocar)</span>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Localização</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Manaus, AM"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="gradient-primary text-primary-foreground font-bold flex-1">
                {editId ? 'Atualizar' : 'Publicar'}
              </Button>
              {editId && (
                <Button type="button" variant="destructive" onClick={() => deletePost(editId)} className="flex-1">
                  Excluir Post
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">📣</span>
          <h3 className="text-xl font-bold text-foreground mb-2">Ainda não há posts</h3>
          <p className="text-muted-foreground">Seja o primeiro a postar! Faça login e compartilhe algo.</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {posts.map((post) => {
            const isOwner = user && user.userId === post.ownerId;
            const userHasLiked = user && post.likes.includes(user.userId);
            const likeCount = post.likes.length;

            return (
              <div key={post.id} className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
                <div className="flex items-center justify-between p-5 pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {post.authorPhoto ? (
                        <Image src={post.authorPhoto!} alt={post.ownerName} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        (post.ownerName || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground text-sm">{post.ownerName || 'Usuário'}</span>
                      <span className="block text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</span>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(post)}
                        className="text-sm text-primary font-semibold hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-sm text-destructive font-semibold hover:underline"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.location && (
                    <p className="text-sm text-muted-foreground mt-2">📍 {post.location}</p>
                  )}
                  {post.photoUrl && (
                      <Image
                        src={post.photoUrl}
                        alt="Post"
                        width={800}
                        height={600}
                        className="mt-4 rounded-lg w-full max-h-[600px] object-contain bg-muted/30"
                      />
                  )}
                </div>

                <div className="px-5 py-3 border-t border-border flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`text-sm font-semibold transition-colors ${userHasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                  >
                    ❤️ Curtir
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {likeCount} {likeCount === 1 ? 'curtida' : 'curtidas'}
                  </span>
                </div>

                <div className="px-5 pb-5 space-y-3">
                  {post.comments.map((c) => (
                    <div key={c.id} className="bg-muted/50 p-3 rounded-lg border-l-2 border-petplus-teal">
                      <strong className="text-sm text-foreground block">{c.ownerName || 'Usuário'}</strong>
                      <p className="text-sm text-muted-foreground">{c.content}</p>
                    </div>
                  ))}
                  {post.comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">Seja o primeiro a comentar!</p>
                  )}
                  {isAuthenticated && (
                    <form onSubmit={(e) => submitComment(e, post.id)} className="flex gap-2 mt-2">
                      <Input placeholder="Escreva um comentário..." className="flex-1 h-9 text-sm" />
                      <Button type="submit" size="sm" className="gradient-primary text-primary-foreground">Enviar</Button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}