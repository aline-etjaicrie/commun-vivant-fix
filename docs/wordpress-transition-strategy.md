# WordPress Transition Strategy

## Position franche

WordPress peut devenir une bonne couche de gestion simple pour le contenu editorial, mais ce n'est pas la bonne cible immediate pour tout le produit.

Le coeur actuel contient des sujets applicatifs sensibles:

- paiement
- memorials prives et publics
- multi-contributeur
- roles et permissions
- logs d'activite
- generation IA
- webhook Stripe
- QR et publication

Ces briques doivent rester dans une application metier controlee.

## Ce qui peut aller sur WordPress plus tard

- pages marketing
- FAQ
- a propos
- partenaires
- articles et conseils
- pages SEO
- contenus de marque

## Ce qui ne devrait pas partir sur WordPress dans un premier temps

- funnel de creation complet
- gestion du paiement
- dashboards usagers
- dashboards pros
- collaboration memorial
- publication securisee
- generation IA

## Strategie recommandee

### Phase 1 - maintenant

Garder le produit dans l'application actuelle.

Objectif:

- stabiliser les parcours
- finir la securite
- valider le produit avec les testeurs

### Phase 2 - WordPress en facade contenu

Brancher WordPress uniquement pour le contenu editable facilement par l'equipe.

Deux options saines:

- WordPress sur un sous-domaine type `journal.communvivant.fr`
- WordPress en headless pour alimenter certaines pages marketing

### Phase 3 - front public hybride

Une fois le produit stabilise:

- WordPress gere les pages marketing
- l'app gere les parcours metier et les comptes
- la navigation entre les deux est harmonisee

## Pourquoi cette approche est la bonne

- moins de risque sur un produit sensible
- moins de dette securite
- moins de plugins critiques a maintenir
- plus simple a faire evoluer sans casser paiement et memorials

## Cible ideale a terme

### WordPress

- contenu marketing
- SEO
- blog
- pages institutionnelles

### App produit

- creation de memorials
- dashboards
- roles
- collaboration
- paiement
- facturation
- publication

## Decision recommandee

Ne pas migrer le produit vers WordPress.
Migrer seulement la couche marketing et contenu quand la preprod testeurs sera stable.
