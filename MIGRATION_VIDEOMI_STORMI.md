# Migration Videomi → Stormi

Ce document liste les étapes pour finaliser la migration vers **Stormi** (stormi.uk).

## 1. Créer le bucket R2 "stormi"

Si vous aviez des données dans le bucket `videomi`, créez le bucket `stormi` et migrez si besoin :

```bash
# Créer le bucket stormi dans Cloudflare Dashboard
# R2 Object Storage > Create bucket > Nom : stormi

# Ou via wrangler
npx wrangler r2 bucket create stormi
```

Pour migrer les données de `videomi` vers `stormi`, utilisez les outils Cloudflare ou un script de copie.

## 2. Configurer le domaine stormi.uk

1. Dans Cloudflare Dashboard : **Workers & Pages** > **stormi** > **Settings** > **Domains & Routes**
2. Ajoutez `stormi.uk` comme custom domain
3. Vérifiez que le DNS pointe correctement

## 3. Mettre à jour Google OAuth

Dans [Google Cloud Console](https://console.cloud.google.com/apis/credentials) :

1. **APIs & Services** > **Credentials** > votre OAuth 2.0 Client
2. **Authorized redirect URIs** : remplacez `https://videomi.uk/oauth-callback` par `https://stormi.uk/oauth-callback`
3. **Authorized JavaScript origins** : ajoutez `https://stormi.uk` si nécessaire

## 4. Déployer

```bash
npm run build
npm run deploy
# ou
wrangler deploy
```

## 5. Note sur les utilisateurs existants

Les clés localStorage ont changé (`videomi_token` → `stormi_token`, etc.). Les utilisateurs devront **se reconnecter** après la migration.
