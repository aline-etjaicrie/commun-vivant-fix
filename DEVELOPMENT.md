# Guide de développement - Et j'ai crié Mémoire

## 🎯 Phase actuelle : MVP (Minimum Viable Product)

### ✅ Fonctionnalités implémentées

1. **Structure complète de l'application**
   - Configuration Next.js 15 avec App Router
   - TypeScript pour la sécurité des types
   - Tailwind CSS pour le styling
   - Architecture modulaire et maintenable

2. **Questionnaire complet (9 blocs)**
   - Bloc A : Repères essentiels (identité, dates, lieux)
   - Bloc B : Choix du style d'écriture (3 exemples)
   - Bloc C : Caractère et tempérament (22 adjectifs)
   - Bloc D : Valeurs (18 valeurs proposées)
   - Bloc E : Liens et relations
   - Bloc F : Talents et passions
   - Bloc G : Réalisation ou fierté
   - Bloc H : Goûts et signes de vie
   - Bloc I : Message libre

3. **Interface utilisateur**
   - Page d'accueil élégante
   - Navigation fluide entre étapes
   - Barre de progression visuelle
   - Design responsive (mobile, tablette, desktop)
   - Sauvegarde locale dans le navigateur

4. **Composants réutilisables**
   - `Step` : Affichage d'une étape
   - `Question` : Gestion des différents types de questions
   - `StylePicker` : Sélection du style d'écriture
   - `Progress` : Barre de progression

5. **Système de types**
   - Schéma TypeScript complet
   - Constantes (adjectifs, valeurs, styles)
   - Interface de données structurée

## 🚀 Prochaines étapes (par priorité)

### Phase 1 : Génération IA (court terme)

#### 1.1 Intégration API Anthropic Claude
```typescript
// Dans app/api/generate/route.ts
- Configurer la clé API
- Implémenter l'appel à Claude 3.5 Sonnet
- Gérer les erreurs et retry
- Ajouter un système de rate limiting
```

**Fichiers à modifier :**
- `app/api/generate/route.ts` : Remplacer la fonction d'exemple par l'API réelle
- Créer `.env.local` avec `ANTHROPIC_API_KEY`

**Test :**
```bash
# Tester l'API
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"data": {...}, "style": "sobre"}'
```

#### 1.2 Page de résultat
Créer `app/resultat/page.tsx` pour afficher le texte généré :
- Affichage du texte avec mise en forme élégante
- Bouton de copie dans le presse-papiers
- Option de régénération
- Export en format texte

### Phase 2 : Améliorations UX (moyen terme)

#### 2.1 Validation des champs
```typescript
// lib/validation.ts
- Validation côté client (React Hook Form ou Zod)
- Messages d'erreur clairs
- Champs obligatoires marqués
- Vérification en temps réel
```

#### 2.2 Animations
```typescript
// Utiliser Framer Motion
- Transitions entre étapes
- Feedback visuel sur actions
- Chargement élégant pendant génération
```

#### 2.3 Amélioration de la sauvegarde
- Migration de localStorage vers IndexedDB
- Auto-sauvegarde toutes les 30 secondes
- Indicateur visuel de sauvegarde
- Récupération en cas d'erreur

### Phase 3 : Fonctionnalités avancées (long terme)

#### 3.1 Export PDF
```typescript
// lib/pdf-generator.ts
- Utiliser react-pdf ou jsPDF
- Template élégant
- Options de typographie
- Choix de la mise en page
```

#### 3.2 Système de comptes utilisateurs
- Authentification (NextAuth.js)
- Sauvegarde cloud des questionnaires
- Gestion de plusieurs mémoires
- Historique des versions

#### 3.3 Upload média
```typescript
// Pour le Bloc I (Message libre)
- Upload audio (enregistrement ou fichier)
- Upload vidéo
- Transcription automatique
- Stockage sécurisé
```

#### 3.4 Partage
- Génération de lien sécurisé
- Protection par mot de passe
- Durée de validité configurable
- Statistiques de consultation

#### 3.5 Édition collaborative
- Inviter d'autres personnes à contribuer
- Fusion des réponses
- Gestion des conflits
- Notifications

## 🛠️ Structure technique recommandée

### Base de données (quand nécessaire)
```
Option 1 : Supabase (recommandé pour MVP)
- PostgreSQL hébergé
- Authentification intégrée
- Storage pour médias
- API REST automatique

Option 2 : Prisma + PostgreSQL
- Plus de contrôle
- Type-safety
- Migrations gérées
```

### Architecture de données
```typescript
// Schema Prisma (exemple futur)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  memoires  Memoire[]
}

model Memoire {
  id        String   @id @default(cuid())
  userId    String
  data      Json
  style     String
  texte     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
}
```

### Tests (à ajouter progressivement)
```typescript
// __tests__/
- Unit tests : composants individuels (Jest + React Testing Library)
- Integration tests : flux utilisateur complet (Playwright)
- E2E tests : scénarios critiques
```

## 📊 Métriques à suivre

### Performance
- Temps de chargement initial
- Temps de génération du texte IA
- Taille des bundles JavaScript

### Utilisation
- Taux de complétion du questionnaire
- Étapes où les utilisateurs abandonnent
- Styles les plus choisis
- Longueur moyenne des réponses

### Qualité
- Satisfaction utilisateur
- Feedback sur les textes générés
- Bugs reportés

## 🔒 Sécurité

### À implémenter
1. **Validation côté serveur** : Ne jamais faire confiance aux données client
2. **Rate limiting** : Limiter les appels API
3. **Sanitization** : Nettoyer toutes les entrées utilisateur
4. **CSRF protection** : Protéger contre les attaques cross-site
5. **Encryption** : Chiffrer les données sensibles au repos

### Variables sensibles
```bash
# Ne JAMAIS commiter dans git
ANTHROPIC_API_KEY=
DATABASE_URL=
NEXTAUTH_SECRET=
```

## 📝 Conventions de code

### Nommage
- Composants : PascalCase (`StylePicker.tsx`)
- Fonctions : camelCase (`handleSubmit`)
- Constantes : UPPER_SNAKE_CASE (`PROMPT_SYSTEME`)
- Fichiers utils : kebab-case (`pdf-generator.ts`)

### Organisation des imports
```typescript
// 1. Imports externes
import { useState } from 'react';
import Link from 'next/link';

// 2. Imports internes
import { Question } from '@/lib/schema';
import Progress from '@/components/Progress';

// 3. Types
import type { QuestionnaireData } from '@/lib/schema';
```

### Documentation
```typescript
/**
 * Génère un texte de mémoire à partir des données du questionnaire
 * @param data - Données complètes du questionnaire
 * @param style - Style d'écriture choisi (sobre, narratif, poetique)
 * @returns Promise contenant le texte généré
 */
export async function generateMemoire(
  data: QuestionnaireData,
  style: string
): Promise<string> {
  // ...
}
```

## 🎨 Design system (à étoffer)

### Couleurs
```css
memoir-beige: #F5F1E8  /* Fond principal */
memoir-dark: #2C2C2C   /* Texte */
memoir-accent: #8B7355 /* Accents, boutons */
```

### Espacement
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

### Typographie
```
Headings: font-serif (Georgia)
Body: font-serif (Georgia)
Taille de base: 16px
Line height: 1.6 (corps), 1.2 (titres)
```

## 📚 Ressources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Anthropic API](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Inspiration design
- Calligraphe (outil de condoléances)
- Memory Box (albums photo personnalisés)
- Tribute (obituaires en ligne)

---

**Important** : Ce projet traite de sujets sensibles. Chaque décision technique doit être prise en gardant à l'esprit le respect, la dignité et la sensibilité nécessaires.
