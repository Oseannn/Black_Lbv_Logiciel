# OSEAN - Application de Gestion de Boutique

Application web PWA de gestion de boutique physique avec facturation, caisse et stock.

## Stack Technique

### Backend
- **Framework**: NestJS
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Access + Refresh tokens)

### Frontend (à venir)
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **State**: Zustand
- **PWA**: Service Worker

## Démarrage rapide

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### 1. Installation

```bash
# Clone et installation
cd backend
npm install
```

### 2. Démarrer PostgreSQL

```bash
cd backend
docker compose up -d
```

### 3. Configurer la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Seed (créer admin et vendeuse de test)
npm run db:seed
```

### 4. Démarrer le serveur

```bash
npm run start:dev
```

L'API sera disponible sur `http://localhost:3000/api`

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@osean.local | Admin123! |
| Vendeuse | vendeuse@osean.local | Vendeuse123! |

## API Endpoints

### Auth
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `GET /api/auth/me` - Profil utilisateur (auth required)

## Structure du projet

```
backend/
├── src/
│   ├── auth/           # Module d'authentification
│   ├── prisma/         # Service Prisma
│   ├── common/         # Décorateurs, guards partagés
│   ├── app.module.ts   # Module principal
│   └── main.ts         # Point d'entrée
├── prisma/
│   ├── schema.prisma   # Schéma de la BDD
│   └── seed.ts         # Script de seed
└── docker-compose.yml  # PostgreSQL
```

## Commandes utiles

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod

# Base de données
npm run db:migrate     # Appliquer les migrations
npm run db:seed        # Seed la base
npm run db:studio      # Interface Prisma Studio
npm run db:reset       # Reset complet de la BDD
```

## Licence

Propriétaire - Tous droits réservés
