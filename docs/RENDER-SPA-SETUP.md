# Render – SPA (Single Page App)

Pour que les routes comme `/profile`, `/login`, `/deals` ne renvoient pas 404 après un déploiement statique, il faut une **règle de rewrite** dans le Dashboard Render.

## Étapes (Dashboard Render)

1. Ouvre ton **service** (ex. TEKH-1) sur [dashboard.render.com](https://dashboard.render.com).
2. Dans le menu de gauche : **Redirects/Rewrites** (ou **Headers** selon l’interface).
3. **Add Rule** (ou **Add Redirect/Rewrite**).
4. Remplis :
   - **Action** : **Rewrite**
   - **Source** : `/*`
   - **Destination** : `/index.html`
5. Enregistre, puis **redéploie** le service si besoin.

Résultat : toute requête vers un chemin (ex. `/profile`, `/login`) sert `index.html`, et React Router gère la route côté client. L’URL dans le navigateur ne change pas (contrairement à un redirect).
