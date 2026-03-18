# Architecture modulaire cible

## Position

Le bon compromis pour Commun Vivant n'est pas de cloner tout le produit en plusieurs repos ou plusieurs apps tout de suite.
La meilleure trajectoire est un monolithe modulaire :

- une seule base Next.js
- une auth commune
- un design system partage
- des domaines metier clairement separes

## Domaines a isoler

### Journeys publics

- `honorer`
- `feter`
- `transmettre`
- plus tard : `memoire-objet`

Chaque journey doit porter son propre :

- point d'entree
- questionnaire
- parcours Alma
- ecriture libre
- templates par defaut
- ton editorial
- regles metier

### Espaces applicatifs

- `pro-dashboard`
- `user-dashboard`
- `admin`

### Modules transverses

- `publication-urls`
- `payments-billing`
- `artisan-shop`
- `media-generation`
- `templates-rendering`

## Principe de migration

### Phase 1

Ajouter des routes dediees par journey sans casser l'existant :

- `/honorer`
- `/feter`
- `/transmettre`

Ces routes servent de facade. Elles permettent de reorganiser le produit par intention metier avant de deplacer toute la logique.

### Phase 2

Extraire la logique par domaine :

- config des journeys
- composants de creation
- prompts et templates
- stockage local et finalisation

### Phase 3

Isoler les modules a fort risque produit :

- URLs sur mesure
- paiement Stripe / Alma
- facturation
- e-shop artisans
- dashboards pro

## Arborescence cible

```text
app/
  (public)/
  (creation)/
    honorer/
    feter/
    transmettre/
    create/
  (user)/
  (pro)/
  admin/
  api/

domains/
  journeys/
    honorer/
    feter/
    transmettre/
  publication/
  billing/
  artisans/
  pro/
  user/
```

## Regle de decision

Quand une fonctionnalite ne sert qu'un seul parcours, elle doit vivre dans le domaine de ce parcours.
Quand elle sert plusieurs parcours, elle reste dans un module transverse clairement nomme.

## Decision prise maintenant

Le repo garde une seule app, mais les 3 journeys publics deviennent des points d'entree dedies.
On evite ainsi :

- le mega flux unique rempli de conditions
- la duplication complete du repo
- la casse sur auth, paiement et design system
