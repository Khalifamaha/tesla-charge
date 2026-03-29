const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database('./tesla-charge-real.db', (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
        testDatabaseOperations();
    }
});

async function testDatabaseOperations() {
    console.log('\n🔍 TEST DE CONNEXION ET ENREGISTREMENT DES DONNÉES');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Check if tables exist
        console.log('\n📋 Test 1: Vérification des tables...');
        await checkTables();
        
        // Test 2: Test user registration
        console.log('\n👤 Test 2: Enregistrement utilisateur...');
        await testUserRegistration();
        
        // Test 3: Test vehicle registration
        console.log('\n🚗 Test 3: Enregistrement véhicule...');
        await testVehicleRegistration();
        
        // Test 4: Test reservation creation
        console.log('\n🎫 Test 4: Création réservation...');
        await testReservationCreation();
        
        // Test 5: Verify data persistence
        console.log('\n📊 Test 5: Vérification persistence des données...');
        await verifyDataPersistence();
        
        console.log('\n✅ TOUS LES TESTS TERMINÉS AVEC SUCCÈS!');
        
    } catch (error) {
        console.error('\n❌ ERREUR PENDANT LES TESTS:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Erreur fermeture DB:', err.message);
            } else {
                console.log('✅ Database fermée correctement');
            }
        });
    }
}

function checkTables() {
    return new Promise((resolve, reject) => {
        const tables = ['users', 'vehicles', 'reservations', 'stations', 'otp_codes'];
        
        let completed = 0;
        
        tables.forEach(tableName => {
            db.all(`SELECT count(*) as count FROM ${tableName}`, (err, result) => {
                if (err) {
                    console.error(`❌ Erreur table ${tableName}:`, err.message);
                    reject(err);
                    return;
                }
                
                console.log(`📋 Table '${tableName}': ${result[0].count} enregistrements`);
                completed++;
                
                if (completed === tables.length) {
                    resolve();
                }
            });
        });
    });
}

function testUserRegistration() {
    return new Promise((resolve, reject) => {
        const testUser = {
            email: 'test-' + Date.now() + '@tesla.com',
            name: 'Test User',
            is_verified: 1,
            verification_method: 'email',
            created_at: new Date().toISOString()
        };
        
        db.run(
            'INSERT INTO users (email, name, is_verified, verification_method, created_at) VALUES (?, ?, ?, ?, ?)',
            [testUser.email, testUser.name, testUser.is_verified, testUser.verification_method, testUser.created_at],
            function(err) {
                if (err) {
                    console.error('❌ Erreur enregistrement utilisateur:', err.message);
                    reject(err);
                    return;
                }
                
                console.log(`✅ Utilisateur enregistré: ID=${this.lastID}, Email=${testUser.email}`);
                resolve(this.lastID);
            }
        );
    });
}

function testVehicleRegistration() {
    return new Promise((resolve, reject) => {
        const testVehicle = {
            user_id: 1,
            license_plate: 'TEST-' + Date.now(),
            vin: 'TESTVIN' + Date.now().toString().slice(-10),
            is_foreign: 0,
            country: 'France',
            status: 'verified',
            created_at: new Date().toISOString()
        };
        
        db.run(
            'INSERT INTO vehicles (user_id, license_plate, vin, is_foreign, country, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [testVehicle.user_id, testVehicle.license_plate, testVehicle.vin, testVehicle.is_foreign, testVehicle.country, testVehicle.status, testVehicle.created_at],
            function(err) {
                if (err) {
                    console.error('❌ Erreur enregistrement véhicule:', err.message);
                    reject(err);
                    return;
                }
                
                console.log(`✅ Véhicule enregistré: ID=${this.lastID}, Plaque=${testVehicle.license_plate}`);
                resolve(this.lastID);
            }
        );
    });
}

function testReservationCreation() {
    return new Promise((resolve, reject) => {
        const testReservation = {
            user_id: 1,
            station_id: 1,
            vehicle_id: 1,
            date: new Date().toISOString().split('T')[0],
            start_time: '09:00',
            end_time: '10:00',
            charging_type: 'standard',
            estimated_price: 25.50,
            status: 'confirmed',
            created_at: new Date().toISOString()
        };
        
        db.run(
            'INSERT INTO reservations (user_id, station_id, vehicle_id, date, start_time, end_time, charging_type, estimated_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [testReservation.user_id, testReservation.station_id, testReservation.vehicle_id, testReservation.date, testReservation.start_time, testReservation.end_time, testReservation.charging_type, testReservation.estimated_price, testReservation.status, testReservation.created_at],
            function(err) {
                if (err) {
                    console.error('❌ Erreur création réservation:', err.message);
                    reject(err);
                    return;
                }
                
                console.log(`✅ Réservation créée: ID=${this.lastID}, Prix=${testReservation.estimated_price}`);
                resolve(this.lastID);
            }
        );
    });
}

function verifyDataPersistence() {
    return new Promise((resolve, reject) => {
        // Vérifier que les données sont bien persistées
        const queries = [
            { name: 'Utilisateurs', sql: 'SELECT COUNT(*) as count FROM users' },
            { name: 'Véhicules', sql: 'SELECT COUNT(*) as count FROM vehicles' },
            { name: 'Réservations', sql: 'SELECT COUNT(*) as count FROM reservations' },
            { name: 'Stations', sql: 'SELECT COUNT(*) as count FROM stations' }
        ];
        
        let completed = 0;
        
        queries.forEach(query => {
            db.get(query.sql, (err, result) => {
                if (err) {
                    console.error(`❌ Erreur vérification ${query.name}:`, err.message);
                    reject(err);
                    return;
                }
                
                console.log(`📊 ${query.name}: ${result.count} enregistrements trouvés`);
                completed++;
                
                if (completed === queries.length) {
                    resolve();
                }
            });
        });
    });
}

console.log('🚀 Démarrage du test de base de données...');
console.log('📂 Fichier DB:', path.join(__dirname, 'tesla-charge-real.db'));
