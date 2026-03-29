# TeslaCharge - Station de Recharge Électrique

## Description
Système complet de réservation de bornes de recharge Tesla avec authentification OTP, gestion des véhicules, et interface moderne.

## 🏗️ Structure du Projet

```
tesla-charge/
├── backend/                 # Serveur Node.js
│   ├── server-final.js     # Serveur principal
│   ├── database-real.js    # Gestion base de données
│   ├── package.json        # Dépendances backend
│   ├── .env                # Variables d'environnement
│   ├── tesla-charge-real.db # Base de données SQLite
│   └── README.md           # Documentation backend
├── frontend/               # Application web
│   ├── index.html         # Page principale
│   ├── app-simple.js      # Logique JavaScript
│   ├── manifest.json      # Configuration PWA
│   └── README.md          # Documentation frontend
└── README.md              # Documentation du projet
```

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend
```bash
cd backend
npm install
node server-final.js
```

### 2. Accéder à l'Application
Ouvrez votre navigateur sur: `http://localhost:3000`

### 3. Connexion Test
- **Email**: `test@tesla.com`
- **Code OTP**: Regardez la console du serveur

## ✨ Fonctionnalités

### 🔐 Authentification
- Système OTP par email/SMS
- Tokens JWT sécurisés
- Gestion multi-utilisateurs

### 🚗 Gestion des Véhicules
- Enregistrement manuel
- Scanner OCR (simulation)
- Véhicules étrangers
- Base de données persistante

### ⚡ Stations de Recharge
- 10 stations réelles en France
- Disponibilité en temps réel
- Prix variables par station
- Interface cartographique

### 📋 Réservation
- Formulaire complet
- Calcul automatique du prix
- Types de recharge (Standard/Supercharge)
- Impression des reçus

### 🎨 Interface
- Design inspiré Tesla
- Responsive design
- Animations fluides
- Accessibilité

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage mots de passe

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Tailwind CSS
- **JavaScript ES6+** - Logique client
- **Font Awesome** - Icônes

## 📊 Base de Données

### Tables
- **users** - Utilisateurs authentifiés
- **vehicles** - Véhicules enregistrés
- **stations** - Bornes de recharge
- **otp_codes** - Codes de vérification
- **reservations** - Réservations clients

### Relations
- Users → Vehicles (1:N)
- Users → Reservations (1:N)
- Stations → Reservations (1:N)

## 🔧 Configuration

### Variables d'Environnement
```env
PORT=3000
JWT_SECRET=tesla-charge-super-secret-2024
DB_PATH=./tesla-charge-real.db
```

### Ports
- **Serveur**: 3000
- **Base de données**: SQLite local

## 🧪 Tests

### Emails de Test
- `john.tesla@tesla.com`
- `alice.driver@tesla.com`
- `bob.owner@tesla.com`
- `sarah.fan@tesla.com`
- `mike.tech@tesla.com`

### Générer Code OTP
```bash
node generate-otp.js
```

## 📱 Fonctionnalités PWA

- Installation sur mobile
- Mode hors ligne limité
- Notifications push (futur)
- Interface adaptative

## 🔒 Sécurité

- Tokens JWT avec expiration
- Validation des entrées
- Protection XSS
- HTTPS recommandé en production

## 🚀 Déploiement

### Développement
```bash
cd backend && node server-final.js
```

### Production
- Utiliser PM2 pour la gestion des processus
- Configurer Nginx comme reverse proxy
- Activer HTTPS avec Let's Encrypt

## 📈 Performances

- Base de données SQLite optimisée
- Cache des stations
- Compression des assets
- CDN pour les images

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche de fonctionnalité
3. Commit les changements
4. Push vers la branche
5. Créer une Pull Request

## 📄 Licence

MIT License - Voir fichier LICENSE

## 📞 Support

Pour toute question ou support technique:
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**TeslaCharge** - La recharge électrique simplifiée ⚡
