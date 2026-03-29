const sqlite3 = require('sqlite3').verbose();

function debugOTPInsertion() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 DÉBOGAGE DE L\'INSERTION DES CODES OTP');
    console.log('='.repeat(60));
    
    // Connexion à la base de données
    const db = new sqlite3.Database('./tesla-charge-real.db', (err) => {
        if (err) {
            console.error('❌ Erreur de connexion:', err.message);
            return;
        }
        console.log('✅ Base de données connectée');
        
        // 1. Vérifier la structure de la table otp_codes
        console.log('\n📋 Structure de la table otp_codes...');
        db.all("PRAGMA table_info(otp_codes)", (err, columns) => {
            if (err) {
                console.error('❌ Erreur structure:', err);
                return;
            }
            
            console.log('Colonnes trouvées:');
            columns.forEach(col => {
                console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.pk ? 'PRIMARY KEY' : ''}`);
            });
            
            // 2. Vérifier les codes existants
            console.log('\n📊 Codes OTP existants...');
            db.all('SELECT * FROM otp_codes ORDER BY created_at DESC LIMIT 3', (err, codes) => {
                if (err) {
                    console.error('❌ Erreur lecture codes:', err);
                    return;
                }
                
                if (codes.length === 0) {
                    console.log('   ℹ️ Aucun code OTP trouvé');
                } else {
                    codes.forEach((code, index) => {
                        console.log(`   ${index + 1}. ID: ${code.id}, Contact: ${code.contact}, Code: ${code.code}, Type: ${code.type}`);
                        console.log(`      Créé: ${code.created_at}, Expire: ${code.expires_at}, Utilisé: ${code.is_used}`);
                    });
                }
                
                // 3. Test d'insertion manuelle
                console.log('\n✏️ Test d\'insertion manuelle...');
                const testCode = '123456';
                const testContact = 'debug.test@tesla.com';
                const testType = 'email';
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                const createdAt = new Date();
                
                console.log(`   📝 Insertion du code: ${testCode} pour ${testContact}`);
                
                db.run(
                    'INSERT INTO otp_codes (contact, code, type, expires_at, is_used, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [testContact, testCode, testType, expiresAt.toISOString(), 0, createdAt.toISOString()],
                    function(err) {
                        if (err) {
                            console.error('   ❌ Erreur insertion:', err.message);
                            console.error('   💡 Vérifiez:');
                            console.error('      - Types de données compatibles');
                            console.error('      - Colonnes obligatoires');
                            console.error('      - Contraintes UNIQUE');
                            return;
                        }
                        
                        console.log(`   ✅ Code inséré avec ID: ${this.lastID}`);
                        
                        // 4. Vérifier l'insertion
                        console.log('\n🔍 Vérification de l\'insertion...');
                        db.get('SELECT * FROM otp_codes WHERE id = ?', [this.lastID], (err, row) => {
                            if (err) {
                                console.error('   ❌ Erreur vérification:', err);
                                return;
                            }
                            
                            if (row) {
                                console.log('   ✅ Code trouvé dans la base:');
                                console.log(`      ID: ${row.id}`);
                                console.log(`      Contact: ${row.contact}`);
                                console.log(`      Code: ${row.code}`);
                                console.log(`      Type: ${row.type}`);
                                console.log(`      Créé: ${row.created_at}`);
                                console.log(`      Expire: ${row.expires_at}`);
                                console.log(`      Utilisé: ${row.is_used}`);
                                
                                // 5. Test de suppression
                                console.log('\n🗑️ Test de suppression...');
                                db.run('DELETE FROM otp_codes WHERE id = ?', [this.lastID], (err) => {
                                    if (err) {
                                        console.error('   ❌ Erreur suppression:', err.message);
                                    } else {
                                        console.log('   ✅ Code supprimé avec succès');
                                    }
                                    
                                    // 6. Simulation de l'API
                                    console.log('\n🌐 Simulation de l\'API /api/send-otp...');
                                    simulateAPICall();
                                });
                            } else {
                                console.error('   ❌ Code non trouvé après insertion!');
                            }
                        });
                    }
                );
            });
        });
    });
    
    function simulateAPICall() {
        const http = require('http');
        
        const data = JSON.stringify({
            contact: 'simulation.api@tesla.com',
            type: 'email'
        });
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/send-otp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log(`   📡 Status: ${res.statusCode}`);
                console.log(`   📋 Réponse: ${responseData}`);
                
                if (res.statusCode === 200) {
                    console.log('   ✅ API répond correctement');
                    
                    // Vérifier si le code a été inséré
                    setTimeout(() => {
                        checkLatestInsertion();
                    }, 1000);
                } else {
                    console.log('   ❌ API retourne une erreur');
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('   ❌ Erreur API:', error.message);
            console.log('   💡 Assurez-vous que le serveur tourne sur le port 3000');
        });
        
        req.write(data);
        req.end();
    }
    
    function checkLatestInsertion() {
        console.log('\n🔍 Vérification du dernier code inséré par l\'API...');
        
        const db2 = new sqlite3.Database('./tesla-charge-real.db');
        
        db2.get(
            'SELECT * FROM otp_codes WHERE contact = ? ORDER BY created_at DESC LIMIT 1',
            ['simulation.api@tesla.com'],
            (err, row) => {
                if (err) {
                    console.error('   ❌ Erreur vérification:', err);
                } else if (row) {
                    console.log('   ✅ Code trouvé après appel API:');
                    console.log(`      Contact: ${row.contact}`);
                    console.log(`      Code: ${row.code}`);
                    console.log(`      Créé: ${row.created_at}`);
                    console.log(`      Expire: ${row.expires_at}`);
                    
                    // Nettoyer
                    db2.run('DELETE FROM otp_codes WHERE contact = ?', ['simulation.api@tesla.com']);
                    console.log('   🧹 Code de test nettoyé');
                } else {
                    console.log('   ❌ Aucun code trouvé après appel API!');
                    console.log('   💡 Le problème vient probablement du serveur');
                }
                
                db2.close();
                
                console.log('\n' + '='.repeat(60));
                console.log('✅ DÉBOGAGE TERMINÉ');
                console.log('='.repeat(60));
            }
        );
    }
}

debugOTPInsertion();
