# 🔐 Guide de Connexion - OSEAN POS

## ✅ Problèmes Résolus

### 1. Backend - Reconstruction complète
- ❌ **Problème** : Le serveur backend avait planté (fichier `dist/main` manquant)
- ✅ **Solution** : Reconstruction complète du backend avec `npm run build`
- ✅ **État** : Backend opérationnel sur http://localhost:3000/api

### 2. Utilisateurs - Réinitialisation de la base de données
- ❌ **Problème** : Aucun utilisateur n'existait dans la base de données
- ✅ **Solution** : Exécution du script de seed (`npx prisma db seed`)
- ✅ **État** : Comptes administrateur et vendeuse créés avec succès

### 3. Devise - Mise à jour globale
- ✅ Changement de **XOF** → **FCFA** dans toute l'application
- ✅ Suppression des décimales (arrondissement automatique)
- ✅ Mise à jour des paramètres par défaut

---

## 👤 Comptes de Test Disponibles

### Compte Administrateur
```
Email     : admin@osean.local
Mot de passe : Admin123!
```

**Accès** :
- Dashboard complet
- Gestion des produits (avec catégorie, taille, couleur)
- Gestion des vendeuses
- Gestion des clients
- Historique des ventes
- Historique des caisses
- Paramètres système

### Compte Vendeuse
```
Email     : vendeuse@osean.local
Mot de passe : Vendeuse123!
```

**Accès** :
- Ouverture/Fermeture de caisse
- Point de vente (avec filtres par catégorie)
- Gestion des clients
- Historique personnel des ventes

---

## 🚀 URLs de l'Application

- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000/api
- **Prisma Studio** (actuellement actif) : http://localhost:5555

---

## 📦 Nouvelles Fonctionnalités Ajoutées

### 1. Gestion des Produits Enrichie (Admin)
- ✨ **Catégorie** : Classez vos produits (Robes, Chemises, etc.)
- ✨ **Taille** : Ajoutez la taille (S, M, L, XL, 38, 40, etc.)
- ✨ **Couleur** : Spécifiez la couleur (Noir, Blanc, Rouge, etc.)

### 2. Filtres Améliorés (Vendeuse - Point de Vente)
- 🎯 Filtre rapide par **catégorie** en haut de la grille produits
- 🔍 Recherche étendue (nom, marque, catégorie)
- ⚡ Interface réactive et instantanée

### 3. Formatage Monétaire
- 💰 Devise : **FCFA** (au lieu de XOF)
- 🔢 Montants : **Sans décimales** (arrondis automatiques)

---

## 🛠️ Commandes Utiles

### Redémarrer le Backend
```bash
cd backend
npm run start:dev
```

### Redémarrer le Frontend
```bash
cd frontend
npm run dev
```

### Réinitialiser les Utilisateurs
```bash
cd backend
npx prisma db seed
```

### Ouvrir Prisma Studio (visualiser la base de données)
```bash
cd backend
npx prisma studio
```

### Créer une nouvelle Migration
```bash
cd backend
npx prisma migrate dev --name nom_de_la_migration
```

---

## 🔧 Dépannage

### "Impossible de se connecter"
1. Vérifiez que le backend est démarré (http://localhost:3000/api)
2. Utilisez les identifiants exacts : `admin@osean.local` / `Admin123!`
3. Si besoin, relancez le seed : `npx prisma db seed`

### "Impossible d'o
uvrir la caisse"
1. Vérifiez que vous êtes connecté en tant que **vendeuse**
2. Si une caisse est déjà ouverte, fermez-la d'abord depuis le tableau de bord
3. Vérifiez que la base de données PostgreSQL est active (port 5433)

### "Erreur de base de données"
1. Vérifiez que PostgreSQL est actif : `docker ps`
2. Si le conteneur n'est pas actif :
   ```bash
   cd backend
   docker-compose up -d
   ```

### "Le frontend ne charge pas"
1. Vérifiez que le serveur Next.js est actif (http://localhost:3001)
2. Vérifiez les logs dans le terminal
3. Relancez si besoin : `npm run dev`

---

## 📊 État Actuel des Services

### ✅ Services Actifs
- ✅ Backend (NestJS) : http://localhost:3000/api
- ✅ Frontend (Next.js) : http://localhost:3001
- ✅ Base de données (PostgreSQL) : localhost:5433
- ✅ Prisma Studio : http://localhost:5555

### 💾 Données Existantes
- **Caisse actuelle** : OUVERTE
- **Solde en caisse** : 161 919,94 FCFA
- **Utilisateurs** : 2 (1 admin + 1 vendeuse)

---

## 📚 Documentation de Référence

- **Next.js** : https://nextjs.org/docs
- **NestJS** : https://docs.nestjs.com
- **Prisma** : https://www.prisma.io/docs
- **React** : https://react.dev

---

## 🎯 Prochaines Étapes Recommandées

1. **Tester la connexion** sur http://localhost:3001
2. **Ajouter des produits** avec catégories, tailles et couleurs
3. **Tester le point de vente** avec les nouveaux filtres
4. **Configurer les paramètres** dans Admin → Paramètres

---

**Dernière mise à jour** : 24 janvier 2026, 00:16
**Version** : 2.0.0 - FCFA Edition
