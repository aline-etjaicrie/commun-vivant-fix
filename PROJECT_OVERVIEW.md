# Et j'ai crié - Mémoire
## Projet de questionnaire de transmission avec génération IA

---

## 📖 Vue d'ensemble

**Et j'ai crié - Mémoire** est une application web permettant de créer des textes de mémoire personnalisés à travers un questionnaire guidé. L'objectif est d'honorer la vie d'une personne avec dignité et humanité, en évitant les clichés et en respectant l'essence de ce qui doit être transmis.

### Concept central
Transformer des informations structurées (questionnaire) en un texte narratif élégant et respectueux, selon le style choisi par l'utilisateur.

---

## 🎯 Objectifs du projet

### Primaires
1. **Faciliter la transmission de mémoire** : Proposer un cadre pour exprimer ce qui compte
2. **Respecter la dignité** : Éviter le sensationnalisme et les formules toutes faites
3. **Offrir du choix** : 3 styles d'écriture adaptés à différentes sensibilités
4. **Simplicité d'usage** : Interface intuitive, pas de compte requis

### Secondaires
1. Archivage personnel de mémoires familiales
2. Aide à l'écriture d'hommages funéraires
3. Outil de réflexion sur l'héritage et la transmission
4. Support pour les aidants et accompagnants

---

## ✨ Fonctionnalités principales

### 1. Questionnaire structuré (9 blocs)
- **Bloc A** : Repères essentiels (identité, dates, lieux)
- **Bloc B** : Choix du style d'écriture
- **Bloc C** : Caractère et tempérament (22 adjectifs)
- **Bloc D** : Valeurs (18 valeurs proposées + champ libre)
- **Bloc E** : Liens et relations
- **Bloc F** : Talents et passions
- **Bloc G** : Réalisation ou fierté
- **Bloc H** : Goûts et signes de vie
- **Bloc I** : Message libre

### 2. Trois styles d'écriture

#### Style SOBRE (factuel)
- Ton neutre et informatif
- Phrases courtes et claires
- Construction chronologique
- Exemple : *"Né en 1958, il a traversé sa vie avec discrétion et constance."*

#### Style NARRATIF (humain)
- Ton incarné et proche
- Présent vivant
- Construction thématique
- Exemple : *"Il aimait être entouré. Les repas qui s'éternisent, les conversations qui comptent."*

#### Style POÉTIQUE (sensible)
- Ton méditatif
- Phrases lentes et rythmées
- Images et symboles
- Exemple : *"Il avançait doucement, laissant derrière lui des traces discrètes."*

### 3. Interface soignée
- Design épuré avec palette douce (beige, marron, noir)
- Navigation fluide avec barre de progression
- Sauvegarde automatique des réponses
- Responsive (mobile, tablette, desktop)

### 4. Génération IA (à venir)
- Utilisation de l'API Anthropic Claude
- Respect strict du style choisi
- Texte personnalisé basé sur les réponses
- Possibilité de régénération

---

## 🏗️ Architecture technique

### Stack technologique
- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **IA** : Anthropic Claude API (à intégrer)
- **Icônes** : Lucide React

### Structure du projet
```
et-jai-crie/
├── app/                      # Pages et routes
│   ├── page.tsx             # Landing page
│   ├── questionnaire/       # Questionnaire
│   └── api/generate/        # API de génération
├── components/              # Composants réutilisables
│   ├── Step.tsx
│   ├── Question.tsx
│   ├── StylePicker.tsx
│   └── Progress.tsx
├── lib/                     # Logique métier
│   ├── schema.ts           # Types et constantes
│   └── prompt.ts           # Prompts IA
└── public/                  # Assets statiques
```

---

## 🎨 Principes de design

### Palette de couleurs
- **Beige** (`#F5F1E8`) : Fond principal, douceur, sérénité
- **Marron** (`#8B7355`) : Accent, boutons, éléments interactifs
- **Noir** (`#2C2C2C`) : Texte, contraste, lisibilité

### Typographie
- Police serif (Georgia) pour chaleur et tradition
- Hiérarchie claire des titres
- Espacements généreux pour la respiration

### Expérience utilisateur
1. **Progressivité** : Une étape à la fois, pas de surcharge cognitive
2. **Flexibilité** : Tous les champs sont facultatifs (sauf le prénom)
3. **Réversibilité** : Navigation avant/arrière libre
4. **Persistance** : Sauvegarde automatique, reprise possible
5. **Clarté** : Instructions simples, exemples concrets

---

## 📊 État actuel du projet

### ✅ Complété (MVP)
- [x] Structure complète de l'application Next.js
- [x] Tous les blocs du questionnaire implémentés
- [x] Interface utilisateur responsive
- [x] Navigation entre étapes
- [x] Sauvegarde locale (localStorage)
- [x] Système de types TypeScript complet
- [x] Design system cohérent
- [x] Prompts IA préparés

### 🚧 En développement
- [ ] Intégration API Anthropic Claude
- [ ] Page de résultat avec texte généré
- [ ] Validation des champs
- [ ] Animations entre étapes

### 🔮 Roadmap future
- [ ] Export PDF du texte
- [ ] Système de comptes utilisateurs
- [ ] Upload audio/vidéo pour le message libre
- [ ] Partage sécurisé du questionnaire
- [ ] Édition collaborative
- [ ] Historique et versions

---

## 🧭 Principes éditoriaux

### Règles absolues pour l'IA
1. **Aucun propos insultant, violent, haineux ou diffamatoire**
2. **Respect des silences** : Ne pas combler ce qui n'est pas dit
3. **Aucune invention** : Travailler uniquement avec les données fournies
4. **Dignité et sobriété** : Pas de lyrisme excessif
5. **Pas de clichés** : Éviter "ange", "étoile", etc.

### Approche narrative
- Commencer par une ancre (nom, date, lieu)
- Intégrer naturellement les caractéristiques choisies
- Évoquer les liens sans forcer
- Terminer par une ouverture vers la transmission
- Longueur cible : 150-300 mots

---

## 💼 Cas d'usage

### Usage personnel
- Rédiger un hommage funéraire
- Archiver la mémoire d'un proche
- Préparer son propre texte de mémoire
- Réflexion sur l'héritage à transmettre

### Usage professionnel
- Outil pour les pompes funèbres
- Support pour les accompagnants de fin de vie
- Aide aux thérapeutes en deuil
- Formation des bénévoles en soins palliatifs

### Usage pédagogique
- Atelier d'écriture biographique
- Projet intergénérationnel
- Cours sur la transmission orale
- Exercice de synthèse narrative

---

## 🔒 Considérations éthiques et légales

### Protection des données
- Pas de collecte de données sans consentement
- Sauvegarde locale uniquement (pour l'instant)
- Aucune transmission à des tiers
- Possibilité de tout effacer à tout moment

### Respect de la vie privée
- Tous les champs sont facultatifs
- L'utilisateur contrôle ce qu'il partage
- Pas de tracking ou analytics intrusifs

### Sensibilité du contenu
- Attention particulière aux sujets de deuil
- Modération du contenu généré par l'IA
- Possibilité de signaler du contenu inapproprié

---

## 📈 Métriques de succès

### Quantitatives
- Taux de complétion du questionnaire (objectif : 70%+)
- Temps moyen passé (objectif : 15-20 min)
- Satisfaction utilisateur (objectif : 4/5)
- Nombre de textes générés

### Qualitatives
- Retours utilisateurs positifs
- Textes jugés respectueux et justes
- Adoption par des professionnels
- Recommandations organiques

---

## 🚀 Comment démarrer

### Pour développeurs
1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Lancer en dev : `npm run dev`
4. Consulter `QUICKSTART.md` pour les détails

### Pour contributeurs
1. Lire `DEVELOPMENT.md` pour la roadmap
2. Choisir une fonctionnalité à implémenter
3. Créer une branche de feature
4. Soumettre une pull request

### Pour utilisateurs
1. Aller sur le site (quand déployé)
2. Cliquer sur "Commencer le questionnaire"
3. Répondre aux questions à votre rythme
4. Générer le texte de mémoire

---

## 📚 Documentation complète

- **README.md** : Vue d'ensemble et installation
- **QUICKSTART.md** : Guide de démarrage rapide
- **DEVELOPMENT.md** : Guide de développement détaillé
- **Code source** : Commenté pour faciliter la compréhension

---

## 🤝 Contribution

Ce projet accueille les contributions avec bienveillance. Quelques domaines où vous pouvez aider :

- **Développement** : Nouvelles fonctionnalités, corrections de bugs
- **Design** : Amélioration de l'interface, accessibilité
- **Contenu** : Ajout d'adjectifs, de valeurs, de styles
- **Traduction** : Support de nouvelles langues
- **Documentation** : Amélioration des guides
- **Tests** : Détection de bugs, tests utilisateurs

---

## 📄 Licence

Projet personnel - Tous droits réservés

---

## 💭 Philosophie du projet

> *"Ce qui demeure, ce sont ces présences invisibles qui continuent de nous accompagner."*

L'objectif de ce projet n'est pas de créer un outil technique de plus, mais un espace de dignité pour la transmission. Chaque ligne de code doit servir ce principe : honorer la mémoire avec justesse, sans artifice ni excès.

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0 (MVP)  
**Statut** : En développement actif
