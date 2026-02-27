# Google Cloud Vision API – TEKH+

Référence et configuration pour l’analyse d’images (état de l’écran) dans TEKH+.

## Référence

- Tutoriel : [codingmoney/google-cloud-vision-api-tutorial](https://github.com/codingmoney/google-cloud-vision-api-tutorial)
- [Documentation Cloud Vision API](https://cloud.google.com/vision/docs)

## Utilisation dans TEKH+

- **Source** : ce dossier (à la racine). Le backend charge `google-vision-api/analyzeScreen.js`. Faire `cd google-vision-api && npm install` pour que le backend puisse l'utiliser.
- **Backend** : route `POST /api/vision/analyze-image`
- **Frontend** : page Publication → bouton « Analyser l’état de l’écran » après ajout de photos

## Configuration

1. Créer un projet Google Cloud et activer **Cloud Vision API**.
2. Créer une clé de compte de service (JSON) et la placer **dans ce dossier** (`google-vision-api/` à la racine de TEKH) :
   - soit sous le nom `service-account-key.json`,
   - soit avec le nom fourni par GCP (ex. `emerald-griffin-488621-u4-2042ca3edfe7.json`).  
   Le code détecte automatiquement tout fichier `.json` de type compte de service dans ce dossier (hors `package.json`).  
   Si ta clé est ailleurs (ex. `Images/google vision api/`), **copie-la** dans `TEKH/google-vision-api/`.
3. **Backend (Railway / serveur)** :
   - Soit : variable d’environnement `GOOGLE_APPLICATION_CREDENTIALS` = chemin vers le fichier JSON.
   - Soit : variable `GOOGLE_VISION_KEY_JSON` = contenu JSON du fichier de clé (pratique en cloud sans disque).

## Lancer le script de test

```bash
cd google-vision-api
npm install
# Remplacer 'service-account-key.json' dans index.js si besoin
node index.js
```

## MVP Phase 1

- Analyse de la **première photo** uploadée pour suggérer un état d’écran (Bon / À vérifier) à partir des labels Vision (crack, scratch, smartphone, etc.).
- Plus tard : extension à d’autres critères, vidéos, scoring de sévérité.
