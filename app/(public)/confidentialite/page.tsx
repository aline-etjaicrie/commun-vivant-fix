import React from 'react';
import { Lock, Eye, Save, Trash2 } from 'lucide-react';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-memoir-bg pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">

        <header className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif text-memoir-blue italic">Politique de Confidentialité</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-memoir-gold to-memoir-neon mx-auto rounded-full" />
        </header>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-10">

          <p className="text-lg text-memoir-blue/80 leading-relaxed">
            La protection de vos données personnelles est au cœur de nos préoccupations.
            Chez <strong>Commun Vivant</strong>, nous nous engageons à traiter vos informations avec transparence et sécurité,
            conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-memoir-gold/10 rounded-xl flex-shrink-0">
                <Save className="w-6 h-6 text-memoir-gold" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-memoir-blue">1. Collecte des données</h3>
                <p className="text-memoir-blue/70 leading-relaxed">
                  Nous collectons les informations que vous nous fournissez volontairement lors de la création d'un mémorial,
                  de l'inscription à notre newsletter ou via notre formulaire de contact. Ces données incluent généralement :
                  nom, prénom, adresse email et le contenu que vous choisissez de publier.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-memoir-neon/10 rounded-xl flex-shrink-0">
                <Eye className="w-6 h-6 text-memoir-neon" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-memoir-blue">2. Utilisation des données</h3>
                <p className="text-memoir-blue/70 leading-relaxed">
                  Vos données sont utilisées exclusivement pour :
                </p>
                <ul className="list-disc list-inside text-memoir-blue/70 space-y-1 ml-2">
                  <li>La gestion de votre compte et de vos mémoriaux.</li>
                  <li>L'amélioration de nos services et de votre expérience utilisateur.</li>
                  <li>La communication concernant vos commandes ou demandes.</li>
                </ul>
                <p className="text-memoir-blue/70 mt-2 font-medium">
                  Nous ne vendons, ni ne louons, ni ne partageons vos données personnelles à des tiers à des fins commerciales.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-memoir-blue/10 rounded-xl flex-shrink-0">
                <Lock className="w-6 h-6 text-memoir-blue" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-memoir-blue">3. Sécurité</h3>
                <p className="text-memoir-blue/70 leading-relaxed">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger
                  vos données contre tout accès non autorisé, modification, divulgation ou destruction.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-stone-100 rounded-xl flex-shrink-0">
                <Trash2 className="w-6 h-6 text-stone-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-memoir-blue">4. Vos droits (Droit à l'oubli)</h3>
                <p className="text-memoir-blue/70 leading-relaxed">
                  Conformément à la loi, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                  Vous pouvez exercer ce droit à tout moment en nous contactant à : <a href="mailto:contact@etjaicrie.fr" className="text-memoir-gold hover:underline">contact@etjaicrie.fr</a>.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
