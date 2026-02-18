# 📁 Assets Directory Guide

Ce dossier contient toutes les ressources graphiques du projet **SWAP** (images, icônes, logos, illustrations, etc.).

## 🧭 Structure générale

assets/
├── icons/ # Petites icônes SVG (navigation, actions, marques)
│   ├── actions/ # Icônes pour les interactions utilisateur (swap, share, edit, delete)
│   ├── navigation/ # Icônes pour la navbar, footer, menus
│   ├── status/ # Icônes d’état (success, error, info, warning)
│   └── brands/ # Logos de marques (Apple, Samsung, etc.)
│
├── illustrations/ # Images illustratives des pages et fonctionnalités
│   ├── homepage/ # Hero banner, illustrations de confiance, sécurité, écologie
│   ├── deals/ # Illustrations pour les offres et échanges
│   ├── simulator/ # Visuels pour l’estimation / calculateur de valeur
│   ├── auth/ # Login, inscription, vérification
│   ├── profile/ # Avatar, notifications, paramètres
│   └── misc/ # États vides, maintenance, 404
│
├── logos/ # Logos du site et favicon
│   ├── app-logo.svg
│   ├── app-logo-dark.svg
│   ├── favicon.ico
│   └── splash-screen.png
│
└── backgrounds/ # Arrière-plans et textures
    ├── gradient-dark.png
    ├── gradient-light.png
    ├── pattern-dots.png
    └── abstract-waves.png

## 🎨 Bonnes pratiques
- Nomme tous les fichiers en **anglais** et en **kebab-case** (ex: `phone-swap.png`).
- Préfère le **format SVG** pour les icônes (plus légères et redimensionnables).
- Utilise **PNG ou WebP** pour les illustrations et fonds.
- Optimise les images avant de les ajouter :
  - https://tinypng.com
  - https://squoosh.app
- Pour des illustrations gratuites et cohérentes :
  - https://undraw.co/illustrations
  - https://storyset.com
  - https://icons8.com/illustrations
  - https://flaticon.com

## 💡 Astuce développeur
Tu peux importer une image depuis React ainsi :
```tsx
import heroImage from "@/assets/illustrations/homepage/hero-exchange.png";

// Et l’utiliser :
<img src={heroImage} alt="Échange de téléphone" />
```
