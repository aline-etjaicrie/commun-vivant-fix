'use client';

import { useState } from 'react';
import { X, Send, ChevronRight, ChevronLeft, Building2, User, Target, Calendar } from 'lucide-react';

interface ProContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject?: string;
}

export default function ProContactModal({ isOpen, onClose, subject = "Projet Stratégique" }: ProContactModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [formData, setFormData] = useState({
        // Step 1: Profil
        profileType: '',
        profileOther: '',

        // Step 1.5: Artisan
        artisanType: [] as string[],
        artisanVolume: '',
        artisanGoals: [] as string[],

        // Step 2: Structure
        structureName: '',
        city: '',
        sitesCount: '1',
        volume: 'À définir',

        // Step 3: Objectifs
        objectives: [] as string[],
        objectiveOther: '',

        // Step 4: Collaboration
        collabType: 'Test pilote',
        timeline: 'Exploration sans calendrier',

        // Step 5: Coordonnées
        fullName: '',
        function: '',
        email: '',
        phone: '',
        website: '',

        // Step 6: Message
        message: ''
    });

    if (!isOpen) return null;

    // Reset status when reopening
    if (isOpen && submitStatus === 'success' && !isSubmitting) {
        // Optional: Reset form or keep state? Usually reset.
    }

    const handleObjectiveChange = (obj: string) => {
        setFormData(prev => {
            const exists = prev.objectives.includes(obj);
            if (exists) return { ...prev, objectives: prev.objectives.filter(o => o !== obj) };
            return { ...prev, objectives: [...prev.objectives, obj] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, subject })
            });

            if (response.ok) {
                setSubmitStatus('success');
                // Auto close after 3 seconds or let user close? 
                // Let's show success state in modal.
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error(error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    if (submitStatus === 'success') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-memoir-blue/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-lg p-12 text-center shadow-2xl animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <Send className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-serif text-memoir-blue mb-4">Message envoyé !</h3>
                    <p className="text-stone-600 mb-8">
                        Merci pour votre intérêt. Notre équipe a bien reçu votre demande et reviendra vers vous sous 48h.
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-memoir-gold text-white px-8 py-3 rounded-full hover:bg-[#b8941f] transition-all font-bold shadow-lg"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-memoir-blue/80 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-[#FDFBF7] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white border-b border-stone-100 p-6 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h3 className="text-2xl font-serif text-memoir-blue">Définissons votre projet</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-memoir-gold' : 'w-2 bg-stone-200'}`} />
                            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-memoir-gold' : 'w-2 bg-stone-200'}`} />
                            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 3 ? 'w-8 bg-memoir-gold' : 'w-2 bg-stone-200'}`} />
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-stone-100 p-2 rounded-full transition-colors text-stone-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8">

                    {submitStatus === 'error' && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                            Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter directement par email.
                        </div>
                    )}

                    {/* STEP 1: CONTEXTE */}
                    {step === 1 && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Question 1 */}
                            <section>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-memoir-blue mb-6">
                                    <span className="w-8 h-8 rounded-full bg-memoir-blue text-white flex items-center justify-center text-sm">1</span>
                                    Vous êtes...
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        "Pompe funèbre indépendante", "Réseau / groupe multi-agences",
                                        "Assureur / prévoyance", "Collectivité territoriale",
                                        "Bailleur social", "Entreprise / RH / communication",
                                        "Artisan / antiquaire / créateur"
                                    ].map(opt => (
                                        <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.profileType === opt ? 'bg-memoir-blue/5 border-memoir-blue ring-1 ring-memoir-blue' : 'border-stone-200 hover:border-memoir-gold'}`}>
                                            <input
                                                type="radio"
                                                name="profile"
                                                value={opt}
                                                checked={formData.profileType === opt}
                                                onChange={e => setFormData({ ...formData, profileType: e.target.value })}
                                                className="text-memoir-gold focus:ring-memoir-gold"
                                            />
                                            <span className="text-stone-700">{opt}</span>
                                        </label>
                                    ))}
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.profileType === 'Autre' ? 'bg-memoir-blue/5 border-memoir-blue' : 'border-stone-200'}`}>
                                        <input
                                            type="radio"
                                            name="profile"
                                            value="Autre"
                                            checked={formData.profileType === 'Autre'}
                                            onChange={e => setFormData({ ...formData, profileType: e.target.value })}
                                            className="text-memoir-gold focus:ring-memoir-gold"
                                        />
                                        <span className="text-stone-700">Autre</span>
                                        {formData.profileType === 'Autre' && (
                                            <input
                                                type="text"
                                                placeholder="Précisez..."
                                                className="ml-2 bg-transparent border-b border-stone-300 focus:border-memoir-gold outline-none text-sm w-full"
                                                value={formData.profileOther}
                                                onChange={e => setFormData({ ...formData, profileOther: e.target.value })}
                                            />
                                        )}
                                    </label>
                                </div>
                            </section>

                            {/* Question 2 */}
                            <section>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-memoir-blue mb-6">
                                    <span className="w-8 h-8 rounded-full bg-memoir-blue text-white flex items-center justify-center text-sm">2</span>
                                    Informations sur votre structure
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-2">Nom de la structure *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none transition-all"
                                            value={formData.structureName}
                                            onChange={e => setFormData({ ...formData, structureName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-2">Ville principale</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none transition-all"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-2">Nombre de sites / agences</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none bg-white"
                                            value={formData.sitesCount}
                                            onChange={e => setFormData({ ...formData, sitesCount: e.target.value })}
                                        >
                                            <option value="1">1</option>
                                            <option value="2-5">2 – 5</option>
                                            <option value="6-20">6 – 20</option>
                                            <option value="20+">20+</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-2">Volume estimé (annuel)</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none bg-white"
                                            value={formData.volume}
                                            onChange={e => setFormData({ ...formData, volume: e.target.value })}
                                        >
                                            <option value="À définir">À définir</option>
                                            <option value="0-10">0 – 10 projets</option>
                                            <option value="10-50">10 – 50 projets</option>
                                            <option value="50-200">50 – 200 projets</option>
                                            <option value="200+">200+ projets</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 1.5: ARTISAN SPECIFIC FIELDS */}
                    {step === 1 && formData.profileType === "Artisan / antiquaire / créateur" && (
                        <div className="space-y-8 animate-fadeIn mt-8 pt-8 border-t border-stone-200">
                            <div className="bg-memoir-gold/5 p-6 rounded-2xl border border-memoir-gold/20">
                                <h4 className="flex items-center gap-2 text-lg font-bold text-memoir-blue mb-6">
                                    <span className="text-2xl">🪵</span> Spécial Artisan & Créateur
                                </h4>

                                {/* Type de création */}
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-memoir-blue mb-3">Type de création</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {["Meubles", "Plaques / gravure", "Bijoux", "Objets d'art", "Céramique", "Métal", "Bois", "Autre"].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={type}
                                                    checked={formData.artisanType?.includes(type)}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData(prev => {
                                                            const current = prev.artisanType || [];
                                                            return {
                                                                ...prev,
                                                                artisanType: current.includes(val) ? current.filter(t => t !== val) : [...current, val]
                                                            };
                                                        });
                                                    }}
                                                    className="text-memoir-gold rounded focus:ring-memoir-gold"
                                                />
                                                <span className="text-sm text-stone-700">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Volume */}
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-memoir-blue mb-3">Volume estimé</label>
                                    <div className="flex flex-wrap gap-4">
                                        {["Pièce unique", "Petite série", "Production régulière"].map(vol => (
                                            <label key={vol} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="artisanVolume"
                                                    value={vol}
                                                    checked={formData.artisanVolume === vol}
                                                    onChange={e => setFormData({ ...formData, artisanVolume: e.target.value })}
                                                    className="text-memoir-gold focus:ring-memoir-gold"
                                                />
                                                <span className="text-sm text-stone-700">{vol}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Objectifs Artisan */}
                                <div>
                                    <label className="block text-sm font-bold text-memoir-blue mb-3">Vous cherchez à...</label>
                                    <div className="space-y-2">
                                        {["Associer un QR à mes créations", "Être référencé dans un futur catalogue", "Co-créer une gamme dédiée", "Proposer mes produits aux partenaires"].map(goal => (
                                            <label key={goal} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={goal}
                                                    checked={formData.artisanGoals?.includes(goal)}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData(prev => {
                                                            const current = prev.artisanGoals || [];
                                                            return {
                                                                ...prev,
                                                                artisanGoals: current.includes(val) ? current.filter(g => g !== val) : [...current, val]
                                                            };
                                                        });
                                                    }}
                                                    className="text-memoir-gold rounded focus:ring-memoir-gold"
                                                />
                                                <span className="text-sm text-stone-700">{goal}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: OBJECTIFS */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Question 3 */}
                            <section>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-memoir-blue mb-6">
                                    <span className="w-8 h-8 rounded-full bg-memoir-blue text-white flex items-center justify-center text-sm">3</span>
                                    Votre objectif principal
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        "Différencier notre offre", "Proposer un service numérique",
                                        "Intégrer une option mémoire", "Valoriser un territoire / patrimoine",
                                        "Valoriser des parcours pro", "Projet spécifique"
                                    ].map(opt => (
                                        <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.objectives.includes(opt) ? 'bg-memoir-blue/5 border-memoir-blue ring-1 ring-memoir-blue' : 'border-stone-200 hover:border-memoir-gold'}`}>
                                            <input
                                                type="checkbox"
                                                value={opt}
                                                checked={formData.objectives.includes(opt)}
                                                onChange={() => handleObjectiveChange(opt)}
                                                className="text-memoir-gold rounded focus:ring-memoir-gold"
                                            />
                                            <span className="text-stone-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            {/* Question 4 */}
                            <section>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-memoir-blue mb-6">
                                    <span className="w-8 h-8 rounded-full bg-memoir-blue text-white flex items-center justify-center text-sm">4</span>
                                    Type de collaboration
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-2xl">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-3">Format envisagé</label>
                                        <div className="space-y-2">
                                            {["Test pilote", "Déploiement local", "Déploiement national", "Étude exploratoire"].map(opt => (
                                                <label key={opt} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="collab"
                                                        value={opt}
                                                        checked={formData.collabType === opt}
                                                        onChange={e => setFormData({ ...formData, collabType: e.target.value })}
                                                        className="text-memoir-gold focus:ring-memoir-gold"
                                                    />
                                                    <span className="text-sm text-stone-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-3">Délai</label>
                                        <div className="space-y-2">
                                            {["Immédiat (1-3 mois)", "Court terme (3-6 mois)", "Moyen terme (6-12 mois)", "Exploration sans calendrier"].map(opt => (
                                                <label key={opt} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="timeline"
                                                        value={opt}
                                                        checked={formData.timeline === opt}
                                                        onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                                                        className="text-memoir-gold focus:ring-memoir-gold"
                                                    />
                                                    <span className="text-sm text-stone-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* STEP 3: CONTACT & MESSAGE */}
                    {step === 3 && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Question 5 */}
                            <section>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-memoir-blue mb-6">
                                    <span className="w-8 h-8 rounded-full bg-memoir-blue text-white flex items-center justify-center text-sm">5</span>
                                    Vos coordonnées
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-2">Nom & Prénom *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-2">Fonction</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none"
                                            value={formData.function}
                                            onChange={e => setFormData({ ...formData, function: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-2">Email Pro *</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-600 mb-2">Mobile</label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Question 6 */}
                            <section>
                                <h4 className="flex items-center gap-3 text-lg font-bold text-memoir-blue mb-6">
                                    <span className="w-8 h-8 rounded-full bg-memoir-blue text-white flex items-center justify-center text-sm">6</span>
                                    Votre besoin
                                </h4>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-memoir-gold focus:border-transparent outline-none h-32 resize-none"
                                    placeholder="Décrivez brièvement votre projet ou votre problématique..."
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </section>
                        </div>
                    )}

                </form>

                {/* Footer Navigation */}
                <div className="p-6 bg-white border-t border-stone-100 flex justify-between items-center sticky bottom-0 z-10">
                    {step > 1 ? (
                        <button
                            onClick={prevStep}
                            className="flex items-center text-stone-500 hover:text-memoir-blue transition-colors font-medium px-4 py-2"
                            disabled={isSubmitting}
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" /> Retour
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center bg-memoir-blue text-white px-8 py-3 rounded-full hover:bg-memoir-blue/90 transition-all font-bold shadow-lg transform hover:scale-105"
                        >
                            Suivant <ChevronRight className="w-5 h-5 ml-1" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex items-center bg-memoir-gold text-white px-8 py-3 rounded-full hover:bg-[#b8941f] transition-all font-bold shadow-lg transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Envoi...' : 'Envoyer ma demande'} <Send className="w-4 h-4 ml-2" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
