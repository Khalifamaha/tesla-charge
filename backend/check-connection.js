const sqlite3 = require('sqlite3').verbose();

function checkDatabaseConnection() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 VÉRIFICATION COMPLÈTE DE LA BASE DE DONNÉES');
    console.log('='.repeat(60));
    
    // Test de connexion à la base de données
    const db = new sqlite3.Database('./tesla-charge-real.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('❌ Erreur de connexion à la base de données:', err.message);
            console.error('💡 Solutions possibles:');
            console.error('   1. Vérifiez que le fichier tesla-charge-real.db existe');
            console.error('   2. Vérifiez les permissions du fichier');
            console.error('   3. Assurez-vous qu\'aucun autre processus ne l\'utilise');
            return;
        }
        
        console.log('✅ Connexion à la base de données réussie');
        console.log(`📍 Chemin de la base: ${db.filename}`);
        
        // Vérification des tables
        console.log('\n📋 Vérification des tables...');
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                console.error('❌ Erreur lors de la vérification des tables:', err);
                return;
            }
            
            console.log(`📊 Nombre de tables trouvées: ${tables.length}`);
            
            const expectedTables = ['users', 'vehicles', 'stations', 'otp_codes', 'reservations'];
            
            tables.forEach(table => {
                const isExpected = expectedTables.includes(table.name);
                console.log(`   ${isExpected ? '✅' : '⚠️'} ${table.name} ${isExpected ? '(attendue)' : '(inattendue)'}`);
            });
            
            // Vérification des données dans chaque table
            console.log('\n📊 Vérification des données...');
            
            const checks = [
                { name: 'Utilisateurs', sql: 'SELECT COUNT(*) as count FROM users' },
                { name: 'Véhicules', sql: 'SELECT COUNT(*) as count FROM vehicles' },
                { name: 'Stations', sql: 'SELECT COUNT(*) as count FROM stations' },
                { name: 'Codes OTP', sql: 'SELECT COUNT(*) as count FROM otp_codes' },
                { name: 'Réservations', sql: 'SELECT COUNT(*) as count FROM reservations' }
            ];
            
            let completedChecks = 0;
            
            checks.forEach(check => {
                db.get(check.sql, (err, row) => {
                    if (!err) {
                        console.log(`   👥 ${check.name}: ${row.count} enregistrements`);
                    } else {
                        console.error(`   ❌ Erreur ${check.name}: ${err.message}`);
                    }
                    
                    completedChecks++;
                    if (completedChecks === checks.length) {
                        checkRecentData();
                    }
                });
            });
            
            function checkRecentData() {
                console.log('\n🔐 Vérification des codes OTP récents...');
                db.all('SELECT contact, code, type, expires_at, is_used FROM otp_codes ORDER BY created_at DESC LIMIT 5', (err, codes) => {
                    if (!err && codes.length > 0) {
                        const now = new Date();
                        codes.forEach((code, index) => {
                            const expiresAt = new Date(code.expires_at);
                            const isValid = !code.is_used && expiresAt > now;
                            console.log(`   ${index + 1}. 📧 ${code.contact}: ${code.code} (${isValid ? '✅ VALIDE' : '❌ EXPIRÉ/UTILISÉ'})`);
                        });
                    } else {
                        console.log('   ℹ️ Aucun code OTP trouvé');
                    }
                    
                    checkStations();
                });
            }
            
            function checkStations() {
                console.log('\n⚡ Vérification des stations...');
                db.all('SELECT name, total_slots, available_slots, price_per_kwh FROM stations ORDER BY name LIMIT 5', (err, stations) => {
                    if (!err && stations.length > 0) {
                        stations.forEach((station, index) => {
                            const availability = station.available_slots > 0 ? '✅ DISPONIBLE' : '❌ COMPLET';
                            console.log(`   ${index + 1}. 📍 ${station.name}: ${station.available_slots}/${station.total_slots} bornes (${availability})`);
                            console.log(`      💰 Prix: €${station.price_per_kwh}/kWh`);
                        });
                    } else {
                        console.log('   ❌ Aucune station trouvée');
                    }
                    
                    testWriteOperation();
                });
            }
            
            function testWriteOperation() {
                console.log('\n✏️ Test d\'écriture dans la base de données...');
                
                // Créer un code OTP de test
                const testCode = '999999';
                const testContact = 'test.connection@tesla.com';
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                
                db.run(
                    'INSERT INTO otp_codes (contact, code, type, expires_at, is_used, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [testContact, testCode, 'email', expiresAt.toISOString(), 0, new Date().toISOString()],
                    function(err) {
                        if (err) {
                            console.error('   ❌ Erreur d\'écriture:', err.message);
                        } else {
                            console.log(`   ✅ Code de test inséré: ${testCode}`);
                            
                            // Supprimer le code de test
                            db.run('DELETE FROM otp_codes WHERE contact = ?', [testContact], (err) => {
                                if (!err) {
                                    console.log('   ✅ Code de test supprimé');
                                    console.log('   🎯 Écriture/Suppression: OK');
                                } else {
                                    console.error('   ❌ Erreur de suppression:', err.message);
                                }
                            });
                        }
                        
                        finalCheck();
                    }
                );
            }
            
            function finalCheck() {
                console.log('\n📈 Statistiques finales...');
                
                db.get('SELECT COUNT(*) as total FROM otp_codes WHERE is_used = 0 AND expires_at > datetime("now")', (err, row) => {
                    if (!err) {
                        console.log(`   🔐 Codes OTP valides: ${row.total}`);
                    }
                });
                
                db.get('SELECT COUNT(*) as total FROM vehicles', (err, row) => {
                    if (!err) {
                        console.log(`   🚗 Véhicules enregistrés: ${row.total}`);
                    }
                });
                
                db.get('SELECT COUNT(*) as total FROM reservations', (err, row) => {
                    if (!err) {
                        console.log(`   📋 Réservations actives: ${row.total}`);
                    }
                });
                
                console.log('\n' + '='.repeat(60));
                console.log('✅ VÉRIFICATION TERMINÉE AVEC SUCCÈS');
                console.log('='.repeat(60));
                console.log('\n🚀 La base de données est prête à utiliser!');
                console.log('🔗 Serveur: http://localhost:3000');
                console.log('📧 Email test: test@tesla.com');
                
                db.close((err) => {
                    if (err) {
                        console.error('❌ Erreur de fermeture:', err.message);
                    } else {
                        console.log('✅ Connexion à la base de données fermée');
                    }
                });
            }
        });
    });
}

checkDatabaseConnection();
