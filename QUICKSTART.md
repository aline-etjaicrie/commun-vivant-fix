# 🚀 Guide de démarrage rapide - Et j'ai crié Mémoire

## Installation et premier lancement (5 minutes)

### 1. Prérequis
- Node.js 18+ installé ([télécharger ici](https://nodejs.org/))
- Un éditeur de code (VS Code recommandé)

### 2. Installation

```bash
# Aller dans le dossier du projet
cd et-jai-crie

# Installer les dépendances
npm install
```

### 3. Lancement

```bash
# Démarrer le serveur de développement
npm run dev
```

Ouvrir votre navigateur à l'adresse : **http://localhost:3000**

✅ **C'est tout !** L'application devrait maintenant fonctionner.

---

## 🎯 Test rapide de l'application

### 1. Page d'accueil
- Vérifier que la page s'affiche correctement
- Cliquer sur "Commencer le questionnaire"

### 2. Tester le questionnaire
1. **Étape 1 - Identité** : Entrer un prénom
2. **Étape 2 - Style** : Choisir un style (ex: Sobre)
3. **Étape 3 - Caractère** : Cocher quelques adjectifs
4. Continuer à travers les étapes
5. Cliquer sur "Sauvegarder" pour tester la persistance
6. Rafraîchir la page → les données doivent être conservées

### 3. Tester la navigation
- Boutons "Précédent" et "Suivant"
- Barre de progression
- Sauvegarde automatique

---

## 📝 Prochaines étapes pour développer

### Option A : Ajouter la génération IA (recommandé)

1. **Obtenir une clé API Anthropic**
   - Aller sur https://console.anthropic.com/
   - Créer un compte
   - Générer une clé API

2. **Configurer l'environnement**
   ```bash
   # Créer .env.local
   echo "ANTHROPIC_API_KEY=votre_cle_ici" > .env.local
   ```

3. **Modifier le code**
   - Ouvrir `app/api/generate/route.ts`
   - Décommenter le code d'appel à l'API Claude
   - Tester avec un questionnaire complété

### Option B : Personnaliser le design

1. **Couleurs** : Modifier dans `tailwind.config.js`
   ```javascript
   colors: {
     'memoir-beige': '#F5F1E8',  // Changer ici
     'memoir-dark': '#2C2C2C',
     'memoir-accent': '#8B7355',
   }
   ```

2. **Typographie** : Modifier dans `app/globals.css`

3. **Textes** : Modifier dans les fichiers de composants

### Option C : Ajouter des fonctionnalités

Consulter le fichier `DEVELOPMENT.md` pour les idées et la roadmap complète.

---

## 🔧 Commandes utiles

```bash
# Développement
npm run dev          # Lance le serveur de dev

# Production
npm run build        # Compile l'app pour la production
npm start            # Lance l'app en mode production

# Qualité
npm run lint         # Vérifie le code
```

---

## 🐛 Résolution de problèmes courants

### Erreur : "Port 3000 already in use"
```bash
# Solution 1 : Tuer le processus
killall -9 node

# Solution 2 : Utiliser un autre port
npm run dev -- -p 3001
```

### Les styles ne s'appliquent pas
```bash
# Forcer la reconstruction des styles Tailwind
rm -rf .next
npm run dev
```

### LocalStorage ne persiste pas
- Vérifier que vous êtes bien en HTTP (pas file://)
- Vérifier les paramètres du navigateur (cookies autorisés)
- Ouvrir la console (F12) pour voir les erreurs

---

## 📚 Ressources

### Documentation du projet
- `README.md` : Vue d'ensemble complète
- `DEVELOPMENT.md` : Guide de développement détaillé
- Code commenté dans chaque fichier

### Documentation externe
- [Next.js](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic API](https://docs.anthropic.com/)

---

## 💡 Conseils

1. **Commencez simple** : Testez d'abord l'application telle quelle
2. **Modifiez progressivement** : Un changement à la fois
3. **Testez souvent** : Après chaque modification
4. **Consultez la console** : Les erreurs y apparaissent (F12 dans le navigateur)
5. **Sauvegardez régulièrement** : Utilisez git pour versionner votre code

---

## ✉️ Besoin d'aide ?

- Vérifier les fichiers README.md et DEVELOPMENT.md
- Consulter les commentaires dans le code
- Chercher dans la documentation Next.js
- Stack Overflow pour des questions spécifiques

---

Bon développement ! 🎨
