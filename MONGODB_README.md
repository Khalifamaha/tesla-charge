# 🔌 Connexion MongoDB - TeslaCharge

## ✅ Test Réussi

La connexion MongoDB fonctionne parfaitement !

```
✅ Collection existante: users
✅ Collection existante: vehicles  
✅ Collection existante: reservations
✅ Collection existante: stations
✅ Collection existante: otp_codes
✅ Document inséré: ID 69c5ae98d3b6246fc2109547
✅ Test MongoDB réussi!
```

## 🚀 Utilisation

### 1. Connexion Simple

```javascript
const { MongoDBConnection } = require('./mongodb-connection');

async function main() {
    const mongo = new MongoDBConnection('local');
    await mongo.connect();
    
    // Utiliser la base de données
    const users = mongo.getCollection('users');
    const allUsers = await users.find({}).toArray();
    
    console.log('Utilisateurs:', allUsers);
    
    await mongo.disconnect();
}

main();
```

### 2. Test de Connexion

```bash
cd backend
node mongodb-connection.js
```

### 3. Dans le Serveur

```javascript
const { MongoDBConnection } = require('./mongodb-connection');

// Au démarrage du serveur
const mongo = new MongoDBConnection('local');
await mongo.connect();

// Accès aux collections
const db = {
    users: mongo.getCollection('users'),
    vehicles: mongo.getCollection('vehicles'),
    reservations: mongo.getCollection('reservations'),
    stations: mongo.getCollection('stations'),
    otp_codes: mongo.getCollection('otp_codes')
};

// Utilisation dans les routes
app.get('/api/users', async (req, res) => {
    const users = await db.users.find({}).toArray();
    res.json(users);
});
```

## 📊 Configuration

### Connexion Locale (Actuelle)
```javascript
{
    uri: 'mongodb://localhost:27017/tesla-charge',
    options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
    }
}
```

### Connexion Atlas (Production)
```javascript
{
    uri: 'mongodb+srv://username:password@cluster.mongodb.net/tesla-charge',
    options: {
        maxPoolSize: 50,
        w: 'majority',
        retryWrites: true
    }
}
```

## 🗂️ Collections Créées

| Collection | Index | Description |
|------------|-------|-------------|
| `users` | email (unique), phone | Utilisateurs inscrits |
| `vehicles` | user_id, license_plate | Véhicules enregistrés |
| `reservations` | user_id, created_at | Réservations de charge |
| `stations` | is_active | Stations de recharge |
| `otp_codes` | contact, expires_at | Codes OTP temporaires |

## 🔧 Méthodes Disponibles

### `MongoDBConnection`

| Méthode | Description |
|---------|-------------|
| `connect()` | Établit la connexion |
| `disconnect()` | Ferme la connexion |
| `getCollection(name)` | Retourne une collection |
| `healthCheck()` | Vérifie la santé de la connexion |

## 🧪 Exemples d'Utilisation

### Insérer un document
```javascript
const users = mongo.getCollection('users');
await users.insertOne({
    email: 'test@tesla.com',
    name: 'Test User',
    created_at: new Date()
});
```

### Rechercher des documents
```javascript
const vehicles = mongo.getCollection('vehicles');
const userVehicles = await vehicles
    .find({ user_id: userId })
    .toArray();
```

### Mettre à jour un document
```javascript
const reservations = mongo.getCollection('reservations');
await reservations.updateOne(
    { _id: reservationId },
    { $set: { status: 'confirmed' } }
);
```

## ⚠️ Dépannage

### Erreur `ECONNREFUSED`
```bash
# Vérifier si MongoDB est démarré
netstat -ano | findstr 27017

# Démarrer MongoDB (Windows)
net start MongoDB

# Démarrer MongoDB (macOS)
brew services start mongodb-community

# Démarrer MongoDB (Linux)
sudo systemctl start mongod
```

### Erreur d'authentification
```bash
# Vérifier les identifiants dans l'URI
mongodb://username:password@localhost:27017/tesla-charge
```

## 📈 Statistiques Actuelles

```
📁 Collections: 6
📄 Documents: 12
💾 Taille: 0.00 MB
🔗 Host: localhost:27017
```

## 🎯 Prochaines Étapes

1. **Migrer les données SQLite → MongoDB** (optionnel)
2. **Utiliser MongoDB comme base principale**
3. **Configurer MongoDB Atlas pour production**

## 🔗 Fichiers Liés

- `mongodb-connection.js` - Classe de connexion
- `server-mongodb.js` - Serveur avec MongoDB
- `check-mongodb-connection.js` - Vérification

---

**MongoDB est prêt à être utilisé !** 🚀
