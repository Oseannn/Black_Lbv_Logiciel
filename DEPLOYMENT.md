# 🚀 Guide de Déploiement OSEAN

Ce guide explique comment déployer l'application OSEAN en production avec :

- **Frontend** : Vercel
- **Backend** : Railway
- **Base de données** : PostgreSQL sur Railway

---

## 📋 Prérequis

- Compte [Vercel](https://vercel.com) (gratuit)
- Compte [Railway](https://railway.app) (gratuit avec limites)
- Repository Git (GitHub, GitLab, ou Bitbucket)
- Node.js 18+ installé localement

---

## 🗄️ Étape 1 : Déployer la Base de Données sur Railway

### 1.1 Créer un projet Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Provision PostgreSQL"**
4. Railway créera automatiquement une base de données PostgreSQL

### 1.2 Récupérer les informations de connexion

1. Cliquez sur le service PostgreSQL
2. Allez dans l'onglet **"Variables"**
3. Copiez la variable `DATABASE_URL` (format : `postgresql://user:pass@host:port/db`)

---

## ⚙️ Étape 2 : Déployer le Backend sur Railway

### 2.1 Préparer le repository

Assurez-vous que votre code est poussé sur Git avec les fichiers suivants dans `/backend` :

- `railway.json` ✅
- `Procfile` ✅
- `.env.example` ✅

### 2.2 Créer le service Backend

1. Dans votre projet Railway, cliquez sur **"New"** → **"GitHub Repo"**
2. Sélectionnez votre repository
3. **Important** : Configurez le **Root Directory** sur `backend`

### 2.3 Configurer les variables d'environnement

Dans l'onglet **"Variables"** du service backend, ajoutez :

```env
# Base de données (référencer la variable PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (GÉNÉREZ DES CLÉS SÉCURISÉES!)
JWT_SECRET=votre-cle-jwt-super-secrete-64-caracteres-minimum
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=votre-cle-refresh-super-secrete-64-caracteres-minimum
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3000

# Frontend URL (à mettre à jour après déploiement Vercel)
FRONTEND_URL=https://votre-app.vercel.app
```

> 💡 **Astuce** : Générez des clés sécurisées avec :
>
> ```bash
> openssl rand -base64 64
> ```

### 2.4 Lier la base de données

1. Cliquez sur le service Backend
2. Allez dans **"Variables"** → **"Add Reference"**
3. Sélectionnez votre service PostgreSQL
4. Choisissez `DATABASE_URL`

### 2.5 Déployer

Railway déploiera automatiquement à chaque push sur la branche principale.

Le déploiement exécutera :

1. `npm ci` - Installation des dépendances
2. `npx prisma generate` - Génération du client Prisma
3. `npm run build` - Build NestJS
4. `npx prisma migrate deploy` - Application des migrations
5. `npm run start:prod` - Démarrage du serveur

### 2.6 Initialiser la base de données (première fois)

Après le premier déploiement, exécutez le seed via Railway CLI ou le shell :

```bash
# Via Railway CLI
railway run npx prisma db seed

# Ou via le shell Railway (dans l'interface web)
npx prisma db seed
```

### 2.7 Récupérer l'URL du backend

Une fois déployé, notez l'URL de votre backend :

- Format : `https://votre-projet.up.railway.app`

---

## 🌐 Étape 3 : Déployer le Frontend sur Vercel

### 3.1 Importer le projet

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre repository Git
4. **Important** : Configurez le **Root Directory** sur `frontend`

### 3.2 Configurer les variables d'environnement

Dans les paramètres du projet Vercel, ajoutez :

```env
NEXT_PUBLIC_BACKEND_URL=https://votre-backend.up.railway.app
```

> ⚠️ **Important** : Remplacez par l'URL réelle de votre backend Railway

### 3.3 Configurer le build

Vercel détectera automatiquement Next.js. Vérifiez :

- **Framework Preset** : Next.js
- **Build Command** : `npm run build`
- **Output Directory** : `.next`

### 3.4 Déployer

Cliquez sur **"Deploy"**. Vercel construira et déploiera votre frontend.

### 3.5 Récupérer l'URL du frontend

Notez l'URL de votre frontend :

- Format : `https://votre-app.vercel.app`

---

## 🔗 Étape 4 : Finaliser la Configuration

### 4.1 Mettre à jour CORS sur Railway

Retournez dans Railway et mettez à jour la variable `FRONTEND_URL` :

```env
FRONTEND_URL=https://votre-app.vercel.app
```

Railway redéploiera automatiquement.

### 4.2 Configurer le domaine personnalisé (optionnel)

#### Sur Vercel :

1. Allez dans **Settings** → **Domains**
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

#### Sur Railway :

1. Allez dans **Settings** → **Networking**
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

---

## ✅ Étape 5 : Vérification

### 5.1 Tester le backend

```bash
# Vérifier que l'API répond
curl https://votre-backend.up.railway.app/api

# Vérifier la documentation Swagger
# Ouvrir dans le navigateur : https://votre-backend.up.railway.app/api/docs
```

### 5.2 Tester le frontend

1. Ouvrez `https://votre-app.vercel.app`
2. Connectez-vous avec les identifiants de test :
   - **Admin** : `admin@osean.local` / `Admin123!`
   - **Vendeuse** : `vendeuse@osean.local` / `Vendeuse123!`

---

## 🔒 Sécurité en Production

### Checklist obligatoire :

- [ ] Générer de nouvelles clés JWT sécurisées
- [ ] Changer les mots de passe des comptes de test
- [ ] Activer HTTPS (automatique sur Vercel et Railway)
- [ ] Configurer les backups PostgreSQL sur Railway
- [ ] Surveiller les logs et métriques

### Générer des clés sécurisées :

```bash
# JWT Secret
openssl rand -base64 64

# JWT Refresh Secret
openssl rand -base64 64
```

---

## 📊 Monitoring

### Railway

- Dashboard avec métriques CPU/RAM
- Logs en temps réel
- Alertes configurables

### Vercel

- Analytics intégrés
- Logs de déploiement
- Métriques de performance

---

## 🔄 Mises à jour

### Déploiement automatique

Les deux plateformes déploient automatiquement à chaque push sur la branche principale.

### Migrations de base de données

Les migrations sont appliquées automatiquement au démarrage via `prisma migrate deploy`.

Pour ajouter une nouvelle migration :

```bash
# En local
cd backend
npx prisma migrate dev --name nom_migration

# Commit et push
git add prisma/migrations
git commit -m "Add migration: nom_migration"
git push
```

---

## 🆘 Dépannage

### Le backend ne démarre pas

1. Vérifiez les logs Railway
2. Assurez-vous que `DATABASE_URL` est correctement configuré
3. Vérifiez que les migrations ont été appliquées

### Erreur CORS

1. Vérifiez que `FRONTEND_URL` est correct sur Railway
2. Assurez-vous que l'URL inclut le protocole (`https://`)

### Images non affichées

1. Vérifiez la configuration `images.remotePatterns` dans `next.config.ts`
2. Ajoutez le domaine Railway si nécessaire

### Erreur de connexion à la base de données

1. Vérifiez que le service PostgreSQL est actif sur Railway
2. Vérifiez la variable `DATABASE_URL`
3. Testez la connexion avec Prisma Studio :
   ```bash
   railway run npx prisma studio
   ```

---

## 💰 Coûts Estimés

### Railway (Backend + PostgreSQL)

- **Gratuit** : $5 de crédit/mois (suffisant pour démarrer)
- **Pro** : $20/mois pour plus de ressources

### Vercel (Frontend)

- **Gratuit** : Parfait pour la plupart des projets
- **Pro** : $20/mois pour plus de bande passante

---

## 📞 Support

- [Documentation Railway](https://docs.railway.app)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation NestJS](https://docs.nestjs.com)
- [Documentation Next.js](https://nextjs.org/docs)

---

## ⚠️ Limitation Importante : Stockage des Fichiers

### Problème

Railway utilise un système de fichiers **éphémère**. Les fichiers uploadés (images de produits, logos) seront **perdus** à chaque redéploiement.

### Solutions Recommandées

#### Option 1 : Railway Volume (Simple)

Railway propose des volumes persistants :

1. Dans Railway, ajoutez un **Volume** à votre service backend
2. Montez-le sur `/app/uploads`
3. Les fichiers persisteront entre les déploiements

```bash
# Dans Railway Settings > Volumes
Mount Path: /app/uploads
```

#### Option 2 : Cloudinary (Recommandé pour la production)

Pour une solution robuste, utilisez un service de stockage cloud comme Cloudinary :

1. Créez un compte sur [Cloudinary](https://cloudinary.com) (gratuit)
2. Ajoutez les variables d'environnement :
   ```env
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   ```
3. Modifiez le service d'uploads pour utiliser Cloudinary

#### Option 3 : AWS S3 / Supabase Storage

Pour les projets plus importants, utilisez S3 ou Supabase Storage.

### Configuration Actuelle

Le projet utilise actuellement le stockage local (`/uploads`). Pour un déploiement en production, **configurez un volume Railway** ou migrez vers un service cloud.

---

**Dernière mise à jour** : Janvier 2026
**Version** : 1.0.0
