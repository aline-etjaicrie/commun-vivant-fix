'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get('token');
  const googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true';
  const appleEnabled = process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === 'true';
  const returnUrlRaw = searchParams?.get('returnUrl');
  const returnUrl = returnUrlRaw ? decodeURIComponent(returnUrlRaw) : null;
  const emailFromQuery = searchParams?.get('email');
  const authError = searchParams?.get('error');

  const initialMode = searchParams?.get('mode') === 'signup' ? 'signup' :
    inviteToken ? 'invite' : 'login_selection';

  const [mode, setMode] = useState<'login_selection' | 'login_email' | 'signup' | 'invite'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery.trim().toLowerCase());
    }
  }, [emailFromQuery]);

  useEffect(() => {
    if (!authError) return;
    setError(`Erreur d'authentification: ${authError}`);
  }, [authError]);

  useEffect(() => {
    const redirectIfAlreadyLogged = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        router.replace(returnUrl || '/dashboard');
      }
    };
    redirectIfAlreadyLogged();
  }, [returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login_email') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;

        const { data: userData } = await supabase
          .from('users')
          .select('role, funeral_home_id')
          .eq('id', data.user.id)
          .single();

        if (userData?.role === 'admin') {
          router.push('/admin');
        } else if (userData?.role === 'funeral_partner') {
          router.push('/dashboard-pro');
        } else {
          if (returnUrl) {
            router.push(returnUrl);
          } else {
            router.push('/dashboard');
          }
        }

      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl || '/dashboard')}`,
          }
        });

        if (error) throw error;

        alert('Compte créé ! Regardez vos e-mails (et vos spams !) pour confirmer.');
        setMode('login_email');

      } else if (mode === 'invite') {
        if (!inviteToken) throw new Error('Token manquant');

        const { data: invitation } = await supabase
          .from('invitations')
          .select('*')
          .eq('token', inviteToken)
          .eq('used', false)
          .single();

        if (!invitation || new Date(invitation.expires_at) < new Date()) {
          throw new Error('Lien invalide ou expiré');
        }

        const { data, error } = await supabase.auth.signUp({
          email: invitation.email,
          password,
          options: {
            data: {
              name,
              funeral_home_id: invitation.funeral_home_id
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl || '/dashboard')}`,
          }
        });

        if (error) throw error;

        await supabase
          .from('invitations')
          .update({ used: true })
          .eq('id', invitation.id);

        alert('Compte créé ! Regardez vos e-mails (et vos spams !) pour confirmer.');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let msg = error.message || 'Une erreur est survenue';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = "Identifiants invalides. Verifie l'email, le mot de passe, et utilise le meme mode de connexion qu'a l'inscription (email, Google ou Apple).";
      }
      if (msg.toLowerCase().includes('unsupported provider')) {
        msg = "Ce mode de connexion n'est pas active sur Supabase. Active le provider dans Auth > Providers, ou connecte-toi par email.";
      }
      if (msg.toLowerCase().includes('email not confirmed')) {
        msg = "Email non confirme. Ouvre le mail de confirmation Supabase puis reconnecte-toi.";
      }
      if (msg.includes('Failed to fetch')) {
        msg = 'Erreur de connexion au serveur (Failed to fetch). Vérifiez votre connexion internet et la configuration Supabase.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-memoir-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-memoir-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="/logo.png"
              alt="Commun Vivant"
              width={100}
              height={100}
              className="w-24 h-24 mx-auto mb-6 rounded-full shadow-xl border-2 border-white"
            />
          </Link>
          <h1 className="text-memoir-blue text-4xl font-serif italic mb-2">
            {mode === 'login_selection' || mode === 'login_email' ? 'Bienvenue' : mode === 'invite' ? 'Créer votre compte' : 'Nous rejoindre'}
          </h1>
          {mode === 'invite' ? (
            <p className="text-memoir-blue/40 text-sm italic">
              Vous avez été invité à créer un mémorial
            </p>
          ) : (
            <p className="text-memoir-blue/40 text-sm italic tracking-wide">
              Espace de mémoire sensible & éclairée
            </p>
          )}
        </div>

        {/* Mode sélection pour login */}
        {mode === 'login_selection' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Boutons OAuth */}
            <button
              onClick={() => setMode('login_email')}
              className="w-full bg-memoir-blue text-white py-4 rounded-full font-bold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-md"
            >
              <Mail className="w-5 h-5 text-memoir-gold" />
              Continuer avec mon Email
            </button>

            {googleEnabled && (
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl || '/dashboard')}` }
                  });
                  if (error) setError(error.message);
                }}
                className="w-full bg-white text-memoir-blue py-4 rounded-full font-bold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 border border-memoir-blue/5 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuer avec Google
              </button>
            )}

            {appleEnabled && (
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'apple',
                    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl || '/dashboard')}` }
                  });
                  if (error) setError(error.message);
                }}
                className="w-full bg-black text-white py-4 rounded-full font-bold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continuer avec Apple
              </button>
            )}

            <div className="text-center mt-8">
              <p className="text-memoir-blue/40 text-sm font-light">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-memoir-gold font-bold hover:underline"
                >
                  S'inscrire
                </button>
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-10 shadow-2xl shadow-memoir-gold/5 border border-memoir-gold/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {(mode === 'signup' || mode === 'invite') && (
                <div>
                  <label className="block text-memoir-blue text-[10px] items-center gap-2 uppercase tracking-widest font-bold mb-2 ml-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-memoir-bg/30 border border-memoir-blue/5 rounded-2xl text-memoir-blue placeholder:text-memoir-blue/20 focus:ring-2 focus:ring-memoir-gold/20 focus:outline-none transition-all"
                    placeholder="Votre nom"
                  />
                </div>
              )}

              <div>
                <label className="block text-memoir-blue text-[10px] items-center gap-2 uppercase tracking-widest font-bold mb-2 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={mode === 'invite'}
                  className="w-full px-6 py-4 bg-memoir-bg/30 border border-memoir-blue/5 rounded-2xl text-memoir-blue placeholder:text-memoir-blue/20 focus:ring-2 focus:ring-memoir-gold/20 focus:outline-none transition-all disabled:opacity-50"
                  placeholder="votre@email.fr"
                />
              </div>

              <div>
                <label className="block text-memoir-blue text-[10px] items-center gap-2 uppercase tracking-widest font-bold mb-2 ml-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-6 py-4 bg-memoir-bg/30 border border-memoir-blue/5 rounded-2xl text-memoir-blue placeholder:text-memoir-blue/20 focus:ring-2 focus:ring-memoir-gold/20 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
                <p className="text-memoir-blue/30 text-[10px] mt-2 ml-1 italic">Minimum 6 caractères</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-memoir-blue text-white py-4 rounded-full font-bold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-md mt-4"
              >
                {loading ? 'Chargement...' : mode === 'login_email' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </div>

            <div className="text-center mt-8 space-y-4">
              {mode === 'login_email' ? (
                <>
                  <div>
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-memoir-blue/40 hover:text-memoir-gold transition-colors text-xs font-medium"
                    >
                      Pas encore de compte ? <span className="text-memoir-gold font-bold">Inscrivez-vous</span>
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => router.push('/mot-de-passe-oublie')}
                      className="text-memoir-blue/20 hover:text-memoir-blue transition-colors text-[10px] uppercase tracking-widest font-bold"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </>
              ) : mode === 'signup' ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setMode('login_email')}
                    className="text-memoir-blue/40 hover:text-memoir-gold transition-colors text-xs font-medium"
                  >
                    Déjà un compte ? <span className="text-memoir-gold font-bold">Connectez-vous</span>
                  </button>
                </div>
              ) : null}

              {mode !== 'invite' && (
                <div className="pt-4 border-t border-memoir-bg">
                  <button
                    type="button"
                    onClick={() => setMode('login_selection')}
                    className="text-memoir-blue/20 hover:text-memoir-blue transition-colors text-[10px] uppercase tracking-widest font-bold"
                  >
                    Autre méthode de connexion
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Retour */}
        <div className="text-center mt-10">
          <button
            onClick={() => router.push('/')}
            className="text-memoir-blue/40 hover:text-memoir-blue transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F2A44] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C9A24D] border-t-transparent rounded-full" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
