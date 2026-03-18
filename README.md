# Commun Vivant

Plateforme de mémoires numériques pour raconter, transmettre et honorer les histoires qui comptent.

---

## 🎯 Vision

**Commun Vivant** n'est pas un réseau social ni un "mur Facebook pour défunts".  
C'est un espace **digne, sobre et intime** pour capturer l'essence d'une vie, d'une histoire familiale ou d'un patrimoine, et le transmettre avec respect.

> *"La technique au service de la mémoire, pas l'inverse."*

---

## ✨ Concept

### Trois portes d'entrée émotionnelles

Au lieu de catégoriser froidement (Funéraire/Vivant/Objet), nous proposons une approche respectueuse de l'émotion :

1. **🎉 Fêter quelqu'un** → Célébrer une personne vivante (anniversaire, hommage, retraite)
2. **📜 Transmettre vos mémoires** → Histoire familiale, objets précieux, patrimoine
3. **🕯️ Honorer une mémoire** → Mémorial pour un proche disparu

Cette hiérarchie évite le malaise de mettre "funéraire" et "objet" au même niveau.

---

## 💰 Modèle économique

### B2C (Familles)

| Formule | Prix | Usage |
|---------|------|-------|
| **Mémoire d'Objet** | 49€ | Objet, lieu, patrimoine matériel |
| **Hommage Vivant** | 79€ | Célébration d'une personne vivante |
| **Mémorial en Ligne** | 79€ | Honorer un proche décédé |
| **Pack Transmission** | 149€ | 1 personne + 5 objets |
| **Pack Transmission Étendu** | 199€ | 1 personne + 10 objets |

**Options additionnelles :**
- Galerie photos illimitée : +15€
- Vidéo intégrée (5 min) : +20€
- Message audio (3 min) : +10€
- Thème premium : +25€
- Extension hébergement (30 ans) : +90€

### B2B (En préparation - Phase 2)

| Type | Prix/an | Usage |
|------|---------|-------|
| **Pompes Funèbres** | 499€ | Créations illimitées pour clients |
| **Notaires** | 799€ | Accompagnement transmission patrimoniale |
| **Assureurs** | 1 499€ | Intégration contrats obsèques |

---

## 🛤️ Parcours utilisateur

### 1. Homepage
L'utilisateur choisit parmi les 3 entrées émotionnelles (Fêter/Transmettre/Honorer)

### 2. Authentification
Création de compte obligatoire (Supabase Auth)

### 3. Choix de méthode
- 📝 Questionnaire guidé
- 💬 Conversation avec Alma (IA) — *Phase 2*
- ✍️ Écriture libre

### 4. Questionnaire teaser (gratuit)
5-6 questions essentielles pour créer l'envie sans tout donner

### 5. Aperçu généré
Texte court généré automatiquement → donne envie de continuer

### 6. Page tarifs (adaptative)
Affiche la formule selon le contexte détecté

### 7. Paiement (Stripe)
Récapitulatif + paiement sécurisé

### 8. Questionnaire complet (après paiement)
11 étapes approfondies :
- Upload photos/vidéos
- Liens et relations
- Talents et passions
- Réalisation ou fierté
- Goûts et signes de vie
- Message libre (texte/audio/vidéo)

### 9. Génération récit IA (Mistral)
3 styles au choix : Sobre / Narratif / Poétique
- Modification manuelle possible
- Regénération (max 3x)

### 10. Choix du template
4 templates visuels :
- **Classique** : Sobre et élégant
- **Moderne** : Coloré et dynamique
- **Intime** : Chaleureux et personnel
- **Galerie** : Focus photo

### 11. Page mémoire finale (publique)
- Texte complet généré
- Galerie photos
- Bougies virtuelles
- Livre d'or
- Export PDF
- QR code téléchargeable

---

## 🛠️ Technologies

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **IA** : Mistral AI (génération de texte)
- **Paiement** : Stripe
- **APIs externes** : The Noun Project (icônes), Coolors (palettes)
- **Déploiement** : Vercel

---

## 📂 Structure du projet
```
commun-vivant/
├── app/
│   ├── (auth)/              # Login, signup
│   ├── dashboard/           # Espace utilisateur
│   │   └── memoire/[id]/
│   │       ├── complete/    # Questionnaire complet
│   │       ├── texte/       # Édition/régénération IA
│   │       └── messages/    # Modération livre d'or
│   ├── creation/
│   │   ├── methode/         # Choix questionnaire/alma/libre
│   │   ├── questionnaire/   # Questionnaire teaser
│   │   ├── tarifs/          # Page tarifs adaptative
│   │   ├── paiement/        # Stripe checkout
│   │   └── confirmation/    # Post-paiement
│   ├── memoire/[id]/        # Page publique
│   └── api/
│       ├── generate-memorial/   # Génération IA
│       ├── regenerate-text/
│       ├── webhooks/stripe/
│       └── get-icon/            # The Noun Project
├── components/
│   ├── questionnaire/
│   ├── templates/
│   └── ui/
└── lib/
```

---

## 🚀 Installation
```bash
# Cloner le projet
git clone [url-du-repo]
cd commun-vivant

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créer un fichier .env.local avec :
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MISTRAL_API_KEY=
NOUN_PROJECT_KEY= (optionnel)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Base de données

### Tables Supabase

**memories** : Stockage complet des mémoires (teaser + complet + métadonnées)
**memory_media** : Photos, vidéos, audio uploadés
**memory_messages** : Livre d'or avec modération automatique
**memory_candles** : Bougies virtuelles

### Bucket Storage

**memory-media** : Fichiers médias (photos, vidéos, audio) - 50 MB max par fichier

---

## ✅ Décisions clés

1. **Compte obligatoire** → Dashboard utilisateur, gestion multi-mémoires
2. **Questionnaire teaser court** → Éviter copie gratuite, créer l'envie
3. **Modération automatique + manuelle** → Filtre mots suspects, validation par créateur
4. **15 photos de base, illimité en option** → Formule équilibrée
5. **Texte IA modifiable + regénérable** → Maximum 3 régénérations
6. **4 templates visuels** → Template Classique en priorité MVP
7. **Partenariats B2B** → On ne fabrique pas les plaques, on fait fabriquer

---

## 🗺️ Roadmap

### Phase 1 : MVP B2C (Mars 2026)
- ✅ Homepage Fêter/Transmettre/Honorer
- ✅ Questionnaire complet
- ✅ Paiement Stripe
- ✅ Génération IA
- ✅ Template Classique
- ✅ Page mémoire publique
- ✅ QR code PDF

**Objectif** : 50-100 mémoires créées

### Phase 2 : Enrichissement (Avril-Mai 2026)
- Templates Moderne/Intime/Galerie
- Upload photos/vidéos optimisé
- Messages audio/vidéo
- Dashboard amélioré
- Packs famille
- Modération complète

**Objectif** : 300 mémoires

### Phase 3 : B2B (Juin 2026)
- Dashboard pompes funèbres
- Système d'invitation clients
- Partenariats graveurs (plaques QR/NFC)
- API pour assureurs

**Objectif** : 5 pompes funèbres pilotes

---

## 📋 État actuel

### ✅ Fonctionnel
- Homepage (version ancienne à refondre)
- Authentification Supabase
- Dashboard utilisateur basique
- Génération IA (Mistral)
- Page mémoire publique
- Déploiement Vercel

### 🔨 En développement
- Homepage refonte (Fêter/Transmettre/Honorer)
- Questionnaire complet (6 étapes post-paiement)
- 4 templates visuels
- Intégration Stripe complète
- Modération messages
- Édition/régénération texte IA

### 📝 À faire
- Webhook Stripe
- Dashboard admin
- Emails automatiques
- Pages légales (RGPD, CGV, Mentions)
- Dashboard B2B

---

## 💭 Philosophie

> **"La technique au service de la mémoire, pas l'inverse."**

Ce projet est sensible et intime. Chaque décision technique doit servir l'intention humaine : permettre à quelqu'un de transmettre ce qui compte, avec dignité.

**Principes :**
1. Mobile-first obligatoire
2. Sobriété et dignité avant tout
3. Solutions simples et robustes > élégance technique
4. Pas d'invention par l'IA, respect des faits
5. Hiérarchie émotionnelle respectueuse

---

## 🌐 Production

**URL** : https://et-jai-crie-v2.vercel.app  
**Repository** : etjaicriev2  
**Déploiement** : Automatique via Vercel (push sur main)

---

## 📄 Licence

Propriété exclusive - Tous droits réservés.

---

**Fait avec soin, intention et respect de la mémoire humaine** 💙