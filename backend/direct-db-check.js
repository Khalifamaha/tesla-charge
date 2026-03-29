const sqlite3 = require('sqlite3').verbose();

function directDatabaseCheck() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 VÉRIFICATION DIRECTE DE LA BASE DE DONNÉES');
    console.log('='.repeat(60));
    
    // Connexion directe à la base de données
    const dbPath = './tesla-charge-real.db';
    console.log(`📍 Base de données: ${dbPath}`);
    
    // Vérifier si le fichier existe
    const fs = require('fs');
    if (!fs.existsSync(dbPath)) {
        console.error('❌ Fichier de base de données non trouvé!');
        console.error('💡 Création de la base de données...');
        return;
    }
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('❌ Erreur de connexion:', err.message);
            return;
        }
        
        console.log('✅ Connexion réussie');
        
        // 1. Lister toutes les tables
        console.log('\n📋 Tables disponibles:');
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                console.error('❌ Erreur:', err.message);
                return;
            }
            
            tables.forEach(table => {
                console.log(`   - ${table.name}`);
            });
            
            // 2. Vérifier si la table otp_codes existe
            const hasOTPTable = tables.some(t => t.name === 'otp_codes');
            if (!hasOTPTable) {
                console.log('\n❌ Table otp_codes non trouvée!');
                console.log('💡 Création de la table...');
                createOTPTable();
                return;
            }
            
            // 3. Compter les enregistrements dans otp_codes
            console.log('\n📊 Vérification de la table otp_codes:');
            db.get('SELECT COUNT(*) as count FROM otp_codes', (err, result) => {
                if (err) {
                    console.error('❌ Erreur de comptage:', err.message);
                    return;
                }
                
                console.log(`   📈 Total des codes OTP: ${result.count}`);
                
                if (result.count === 0) {
                    console.log('   ⚠️ Aucun code OTP trouvé dans la base');
                    console.log('   💡 Génération d\'un code de test...');
                    generateTestCode();
                    return;
                }
                
                // 4. Afficher tous les codes OTP
                console.log('\n📋 Tous les codes OTP:');
                db.all('SELECT * FROM otp_codes ORDER BY created_at DESC', (err, codes) => {
                    if (err) {
                        console.error('❌ Erreur de lecture:', err.message);
                        return;
                    }
                    
                    if (codes.length === 0) {
                        console.log('   ❌ Aucun code trouvé');
                        return;
                    }
                    
                    codes.forEach((code, index) => {
                        const now = new Date();
                        const expiresAt = new Date(code.expires_at);
                        const isExpired = expiresAt < now;
                        const isUsed = code.is_used === 1;
                        
                        let status = '❌';
                        if (!isUsed && !isExpired) {
                            status = '✅ VALIDE';
                        } else if (isUsed) {
                            status = '🔒 UTILISÉ';
                        } else if (isExpired) {
                            status = '⏰ EXPIRÉ';
                        }
                        
                        console.log(`\n   ${index + 1}. ${status}`);
                        console.log(`      ID: ${code.id}`);
                        console.log(`      Contact: ${code.contact}`);
                        console.log(`      Code: ${code.code}`);
                        console.log(`      Type: ${code.type}`);
                        console.log(`      Créé: ${code.created_at}`);
                        console.log(`      Expire: ${code.expires_at}`);
                        console.log(`      Utilisé: ${code.is_used}`);
                    });
                    
                    // 5. Trouver le dernier code valide
                    const latestValid = codes.find(code => {
                        const now = new Date();
                        const expiresAt = new Date(code.expires_at);
                        return !code.is_used && expiresAt > now;
                    });
                    
                    if (latestValid) {
                        console.log('\n🎯 DERNIER CODE VALIDE:');
                        console.log(`   🔢 Code: ${latestValid.code}`);
                        console.log(`   📧 Contact: ${latestValid.contact}`);
                        console.log(`   📅 Créé: ${latestValid.created_at}`);
                        console.log(`   ⏰ Expire: ${latestValid.expires_at}`);
                    } else {
                        console.log('\n❌ Aucun code valide trouvé');
                        console.log('💡 Génération d\'un nouveau code...');
                        generateTestCode();
                    }
                    
                    console.log('\n' + '='.repeat(60));
                    console.log('✅ VÉRIFICATION TERMINÉE');
                    console.log('='.repeat(60));
                    
                    db.close();
                });
            });
        });
    });
    
    function createOTPTable() {
        const db2 = new sqlite3.Database(dbPath);
        
        db2.run(`CREATE TABLE IF NOT EXISTS otp_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact TEXT,
            code TEXT,
            type TEXT,
            expires_at DATETIME,
            is_used BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('❌ Erreur création table:', err.message);
            } else {
                console.log('✅ Table otp_codes créée');
                generateTestCode();
            }
            
            db2.close();
        });
    }
    
    function generateTestCode() {
        const db2 = new sqlite3.Database(dbPath);
        
        const testCode = Math.floor(100000 + Math.random() * 900000).toString();
        const testContact = 'test@tesla.com';
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        
        db2.run(
            'INSERT INTO otp_codes (contact, code, type, expires_at, is_used, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [testContact, testCode, 'email', expiresAt.toISOString(), 0, new Date().toISOString()],
            function(err) {
                if (err) {
                    console.error('❌ Erreur insertion:', err.message);
                } else {
                    console.log(`✅ Code de test généré: ${testCode}`);
                    console.log(`📧 Contact: ${testContact}`);
                    console.log(`⏰ Valide jusqu'à: ${expiresAt.toLocaleString('fr-FR')}`);
                }
                
                db2.close();
            }
        );
    }
}

directDatabaseCheck();
