'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, Building2 } from 'lucide-react';

export default function AdminSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    funeralHomeName: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'admin'
          }
        }
      });

      if (authError) throw authError;

      // 2. Créer l'entrée pompes funèbres
      const { data: funeralHome, error: fhError } = await supabase
        .from('funeral_homes')
        .insert({
          name: formData.funeralHomeName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        })
        .select()
        .single();

      if (fhError) throw fhError;

      // 3. Mettre à jour l'utilisateur avec le funeral_home_id
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            role: 'admin',
            funeral_home_id: funeralHome.id
          });

        if (updateError) throw updateError;
      }

      alert('Compte admin créé ! Vérifiez votre email pour confirmer votre inscription.');
      router.push('/login');

    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2A44] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image 
            src="/logo.png" 
            alt="Et j'ai crie" 
            width={120} 
            height={120}
            className="w-28 h-28 mx-auto mb-4 rounded-full"
          />
          <h1 className="text-[#C9A24D] text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Inscription Pompes Funèbres
          </h1>
          <p className="text-[#F5F4F2]/60 text-sm">
            Créez votre compte administrateur pour gérer les invitations
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-[#C9A24D]/20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-[#C9A24D] text-lg mb-4 font-medium">Vos informations</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#C9A24D] text-sm mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-[#C9A24D]/30 rounded-lg text-white placeholder-white/40 focus:border-[#C9A24D] focus:outline-none"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-[#C9A24D] text-sm mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-[#C9A24D]/30 rounded-lg text-white placeholder-white/40 focus:border-[#C9A24D] focus:outline-none"
                    placeholder="contact@pompesfunebres.fr"
                  />
                </div>

                <div>
                  <label className="block text-[#C9A24D] text-sm mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white/10 border border-[#C9A4D]/30 rounded-lg text-white placeholder-white/40 focus:border-[#C9A24D] focus:outline-none"
                    placeholder="••••••••"
                  />
                  <p className="text-white/50 text-xs mt-2">Minimum 6 caractères</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#C9A24D]/20"></div>

            {/* Informations pompes funèbres */}
            <div>
              <h3 className="text-[#C9A24D] text-lg mb-4 font-medium flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informations de l'entreprise
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#C9A24D] text-sm mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.funeralHomeName}
                    onChange={(e) => setFormData({...formData, funeralHomeName: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-[#C9A24D]/30 rounded-lg text-white placeholder-white/40 focus:border-[#C9A24D] focus:outline-none"
                    placeholder="Pompes Funèbres Martin"
                  />
                </div>

                <div>
                  <label className="block text-[#C9A24D] text-sm mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-[#C9A24D]/30 rounded-lg text-white placeholder-white/40 focus:border-[#C9A24D] focus:outline-none"
                    placeholder="01 23 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-[#C9A24D] text-sm mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-[#C9A24D]/30 rounded-lg text-white placeholder-white/40 focus:border-[#C9A24D] focus:outline-none"
                    placeholder="123 Rue de la Paix, 75001 Paris"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A24D] text-[#0F2A44] py-4 rounded-lg font-medium hover:bg-[#E1C97A] transition-colors disabled:opacity-50 text-lg"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {loading ? 'Création du compte...' : 'Créer mon compte admin'}
            </button>
          </div>
        </form>

        {/* Liens */}
        <div className="text-center mt-6 space-y-2">
          <button
            onClick={() => router.push('/login')}
            className="text-white/60 hover:text-[#C9A24D] transition-colors text-sm block w-full"
          >
            Déjà un compte ? Connectez-vous
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-white/60 hover:text-[#C9A24D] transition-colors text-sm block w-full"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
