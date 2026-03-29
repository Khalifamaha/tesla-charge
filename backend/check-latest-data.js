const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tesla-charge-real.db');

console.log('🔍 VÉRIFICATION DES DONNÉES APRÈS TEST...');
console.log('=' .repeat(50));

// Vérifier les derniers véhicules enregistrés
db.all('SELECT * FROM vehicles ORDER BY created_at DESC LIMIT 5', (err, vehicles) => {
    if (err) {
        console.error('❌ Erreur:', err);
    } else {
        console.log('🚗 Derniers véhicules enregistrés:');
        vehicles.forEach((v, i) => {
            console.log(`${i+1}. ID: ${v.id}, Plaque: ${v.license_plate}, VIN: ${v.vin}, Pays: ${v.country}, User: ${v.user_id}, Date: ${v.created_at}`);
        });
    }
});

// Vérifier les derniers utilisateurs
db.all('SELECT * FROM users ORDER BY created_at DESC LIMIT 3', (err, users) => {
    if (err) {
        console.error('❌ Erreur:', err);
    } else {
        console.log('\n👤 Derniers utilisateurs enregistrés:');
        users.forEach((u, i) => {
            console.log(`${i+1}. ID: ${u.id}, Email: ${u.email}, Vérifié: ${u.is_verified}, Date: ${u.created_at}`);
        });
    }
});

// Vérifier les dernières réservations
db.all('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 3', (err, reservations) => {
    if (err) {
        console.error('❌ Erreur:', err);
    } else {
        console.log('\n🎫 Dernières réservations créées:');
        reservations.forEach((r, i) => {
            console.log(`${i+1}. ID: ${r.id}, User: ${r.user_id}, Station: ${r.station_id}, Prix: ${r.estimated_price}, Date: ${r.created_at}`);
        });
    }
});

db.close();
