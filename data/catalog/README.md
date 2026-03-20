# Catalogue central TEKH

Ce dossier est la source unique des données catalogue utilisées par le backend, le simulateur et les scripts GSMArena.

## Fichiers

- `tab.csv` : source brute
- `tab_cleaned.csv` : source opérationnelle (utilisée en production)

## Pipeline recommandé

1. Mettre à jour `tab.csv`
2. Nettoyer vers `tab_cleaned.csv`
3. Exécuter la normalisation: `npm run catalog:normalize`
4. Valider la qualité: `npm run catalog:validate`

## Règles de qualité

- pas de doublons par `(marque, modèle, stockage, ram)`
- années raisonnables (<= année courante + 1)
- stockage et prix strictement positifs
- marque/modèle obligatoires
