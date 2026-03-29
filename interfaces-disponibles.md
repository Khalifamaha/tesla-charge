# 📋 TeslaCharge - Interfaces Disponibles

## 🎯 Interfaces Principales

### 1. 🔐 Interface OTP (Authentification)
- **URL**: `http://localhost:3000` (par défaut)
- **Fonction**: Vérification par email/code OTP
- **Éléments**:
  - Logo Tesla (bouclier rouge)
  - Formulaire email avec icône enveloppe
  - Bouton "Recevoir le code"
  - Section de vérification (6 champs)
  - Bouton "Changer d'email"

### 2. 🚗 Interface Véhicule
- **Fonction**: Identification et enregistrement de véhicule
- **Éléments**:
  - Logo Tesla (voiture rouge)
  - Scanner OCR avec bouton "Démarrer le Scanner"
  - Formulaire véhicule français (immatriculation + VIN)
  - Formulaire véhicule étranger (avec pays)
  - Toggle pour afficher/masquer véhicule étranger

### 3. 📊 Interface Dashboard
- **Fonction**: Espace utilisateur principal
- **Éléments**:
  - Header avec nom utilisateur et déconnexion
  - Section "Mes Véhicules" (grille 3 colonnes)
  - Section "Bornes de Recharge" (stations disponibles)
  - Section "Mes Réservations" (historique)

## 🎯 Interfaces Modales (Popups)

### 4. 📷 Modal Scanner OCR
- **Déclenchement**: Clic sur "Démarrer le Scanner"
- **Éléments**:
  - Interface immersive avec fond noir
  - Cadre de scan avec bordures blanches
  - Ligne de scan animée (rouge)
  - Bouton capture (cercle rouge)
  - Status text en temps réel

### 5. 🎫 Modal Réservation
- **Déclenchement**: Clic sur "Réserver" sur une station
- **Éléments**:
  - Formulaire de réservation
  - Sélection de station (dropdown)
  - Sélection de véhicule (dropdown)
  - Boutons "Annuler" et "Confirmer"

## 🔄 Flux de Navigation

```
1. Interface OTP (départ)
   ↓ (après authentification)
2. Interface Véhicule
   ↓ (après enregistrement véhicule)
3. Interface Dashboard
   ↓ (déconnexion possible)
   ↺ Retour à Interface OTP
```

## 🎨 Caractéristiques Communes

### Design Tesla
- **Couleurs**: Rouge Tesla (#dc2626 → #ef4444)
- **Effets**: Glass morphism (fond flou)
- **Animations**: SlideIn, transitions fluides
- **Icônes**: Font Awesome 6.4.0
- **Responsive**: Mobile-first design

### Interactions
- **Toast notifications**: Messages de succès/erreur
- **Formulaires**: Validation en temps réel
- **Modals**: Ouverture/fermeture fluide
- **Navigation**: Logique et intuitive

## 🔧 Éléments Techniques

### Frontend
- **HTML**: Sémantique et accessible
- **CSS**: Tailwind CSS + custom styles
- **JavaScript**: Vanilla JS (ES6+)
- **API**: Fetch avec gestion d'erreurs

### Backend
- **Serveur**: Node.js + Express
- **Database**: SQLite avec persistance
- **Auth**: JWT tokens sécurisés
- **API REST**: Routes complètes

## 📱 Points d'Accès

### URLs
- **Principal**: `http://localhost:3000`
- **API Stations**: `http://localhost:3000/api/stations`
- **API OTP**: `http://localhost:3000/api/send-otp`
- **API Véhicules**: `http://localhost:3000/api/vehicles`

### Fonctions Globales
- `startOCRScanner()` - Ouvre le scanner
- `toggleForeignVehicle()` - Affiche véhicule étranger
- `backToOTPForm()` - Retour formulaire OTP
- `reserveStation(id)` - Réserve une station
- `closeOCRScanner()` - Ferme le scanner
- `openReservationModal()` - Ouvre réservation
- `closeReservationModal()` - Ferme réservation

## 🎯 État Actuel

- ✅ **Interface OTP**: Visible et fonctionnelle
- ✅ **Interface Véhicule**: Complète avec scanner
- ✅ **Interface Dashboard**: Toutes sections actives
- ✅ **Modals**: Scanner et réservation fonctionnels
- ✅ **Navigation**: Flux logique implémenté
- ✅ **Design**: Cohérent Tesla style
- ✅ **Performance**: Optimisée et réactive
