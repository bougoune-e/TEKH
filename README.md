# TEKH+ : L'Éco-calculateur Intelligent & Hub de Swap de Smartphones

> **TEKH+** redéfinit le cycle de vie du smartphone en Afrique de l'Ouest. Grâce à un diagnostic embarqué assisté par vision artificielle (Edge AI) et un système d'échange (Swap) sécurisé par des contrats financiers intelligents (Swap Gap), TEKH+ permet d'estimer, d'échanger et de recycler des appareils tout en maximisant l'impact écologique.

---

## 🚀 Architecture & Stack Technique

L'écosystème TEKH+ est conçu selon une architecture hautement résiliente, modulaire et optimisée pour des connexions réseau fluctuantes.

### 1. Frontend & Mobile (PWA & React Native)
* **Vite + React + TypeScript + Tailwind CSS** : Une interface utilisateur fluide, respectant une charte graphique premium (glassmorphisme, mode sombre adaptatif) et structurée pour s'exécuter comme une Progressive Web App (PWA) installable.
* **React Native** : La structure des composants partagés (`src/shared/`) est pensée pour une transition directe vers une application mobile native multiplateforme (iOS & Android).
* **Computer Vision en local (TensorFlow.js & COCO-SSD)** : Chargement asynchrone des modèles IA pour détecter l'appareil et diagnostiquer les bris d'écran à 30 FPS directement dans le navigateur, éliminant les coûts de bande passante serveur.

### 2. Services Backend (FastAPI & Node.js/Next.js)
* **FastAPI (Python)** : Le cœur algorithmique de pricing et d'ingestion d'images. Gère l'évaluation de valeur résiduelle technique (VRT) et l'endpoint `/api/v1/catalog/image/{brand}/{model_slug}` pour récupérer dynamiquement les visuels constructeurs officiels (Apple, Samsung).
* **Node.js / Next.js (Transition en cours)** : Passerelle d'API pour les services web, l'envoi de notifications push via web-push, et l'orchestration des tâches d'administration.

### 3. Base de Données & Sécurité (Supabase / PostgreSQL)
* **Supabase** sert de backend-as-a-service sécurisé et réactif.
* **Sécurité RLS (Row Level Security)** : Chaque table (`profiles`, `device_transactions`, `referrals`, `tekh_point_credits`) dispose de politiques d'accès durcies au niveau de la ligne, empêchant l'accès non autorisé aux données sensibles.
* **Automatisation Transactionnelle (Triggers PL/pgSQL)** :
  * La complétion d'une transaction logistique (`Terminé`) met à jour automatiquement le parrainage lié à `converted`.
  * La conversion du parrainage incrémente le compteur CO2 et débloque le statut de récompense (`eligible_reward`) au-delà de 5 parrainages valides, garantissant l'intégrité financière et écologique du programme.

---

## ⚡ Composants Majeurs & Capacités d'Ingénierie Full-Stack

L'excellence technique du projet repose sur trois composants structurants :
1. **`src/features/simulator/components/CameraScanModal.tsx` (Edge AI Vision)** : Intègre TensorFlow.js pour le scan visuel haute performance côté client, démontrant notre capacité à exploiter le matériel de l'appareil utilisateur pour réduire les coûts d'infrastructure cloud.
2. **`src/features/simulator/EstimatorPage.tsx` (Moteur d'Orchestration)** : Résout des arbres de décision logiques pour fusionner le diagnostic déclaratif, le diagnostic automatique de l'IA et le calcul régional de Swap Gap, tout en persistant le résultat via le SDK Supabase.
3. **`src/core/api/supabaseApi.ts` (Orchestration des Données & Cache)** : Gère le cache local avec TTL et le mécanisme hors ligne (stale-while-revalidate), prouvant notre capacité à maintenir une UX irréprochable même en conditions de réseau 2G/3G dégradées.

---

## 🔍 Note de Transition Stratégique (Strategic Transition Note)

### MEST AI Startup Program Jury Review

> [!NOTE]
> **Operational Field Transition & User Testing Phase**
>
> Please be advised that active software development in this repository is temporarily paused. The engineering and product teams are currently deployed in the field (Lomé, Togo) to conduct **operational validation**, **live user testing**, and **real-world diagnostic data collection**.
>
> During this phase, we are:
> 1. Testing the Edge AI screen detection model against a diverse set of real-world cracked screens under variable local lighting conditions.
> 2. Verifying the local logistics swap pipelines ("Estimé" -> "Déposé" -> "Expertise" -> "Terminé") directly with partner repair shops and pick-up stations.
> 3. Tuning the regional Africa Swap Pricing Algorithm (Swap Gap & Africa Factor) based on actual market transaction margins.
> 4. Gathering direct qualitative feedback from our target user base to refine the PWA installer and push notifications onboarding flow.
>
> This empirical validation is critical to feed high-fidelity training data back into our pricing engine and computer vision models before we resume the final codebase hardening.

---

## 🛠️ Installation & Démarrage Local

1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Configurez les variables d'environnement dans un fichier `.env` (à copier depuis `.env.example`) :
   ```env
   VITE_SUPABASE_URL=https://votre-url-supabase.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-cle-anon
   VITE_PYTHON_API_URL=http://127.0.0.1:8000
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
