const sqlite3 = require('sqlite3').verbose();

function verifyLatestOTP() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 VÉRIFICATION DU DERNIER CODE OTP');
    console.log('='.repeat(60));
    
    const db = new sqlite3.Database('./tesla-charge-real.db');
    
    // Récupérer tous les codes OTP triés par date de création
    db.all('SELECT * FROM otp_codes ORDER BY created_at DESC LIMIT 10', (err, codes) => {
        if (err) {
            console.error('❌ Erreur:', err.message);
            return;
        }
        
        console.log(`\n📊 ${codes.length} derniers codes OTP:`);
        
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
            
            console.log(`\n${index + 1}. ${status} ${code.code}`);
            console.log(`   📧 Contact: ${code.contact}`);
            console.log(`   📅 Créé: ${new Date(code.created_at).toLocaleString('fr-FR')}`);
            console.log(`   ⏰ Expire: ${expiresAt.toLocaleString('fr-FR')}`);
            console.log(`   📊 ID: ${code.id}`);
        });
        
        // Vérifier spécifiquement les codes pour test@tesla.com
        console.log('\n📧 Codes spécifiques pour test@tesla.com:');
        db.all('SELECT * FROM otp_codes WHERE contact = ? ORDER BY created_at DESC LIMIT 5', ['test@tesla.com'], (err, testCodes) => {
            if (!err && testCodes.length > 0) {
                testCodes.forEach((code, index) => {
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
                    
                    console.log(`   ${index + 1}. ${status} ${code.code} (ID: ${code.id})`);
                });
                
                // Trouver le code le plus récent qui est valide
                const latestValid = testCodes.find(code => {
                    const now = new Date();
                    const expiresAt = new Date(code.expires_at);
                    return !code.is_used && expiresAt > now;
                });
                
                if (latestValid) {
                    console.log('\n🎯 CODE ACTUEL À UTILISER:');
                    console.log(`   🔢 Code: ${latestValid.code}`);
                    console.log(`   📧 Email: test@tesla.com`);
                    console.log(`   ⏰ Valide jusqu'à: ${new Date(latestValid.expires_at).toLocaleString('fr-FR')}`);
                    console.log(`   🔗 Allez sur: http://localhost:3000`);
                } else {
                    console.log('\n❌ Aucun code valide trouvé pour test@tesla.com');
                    console.log('💡 Générez un nouveau code avec: node generate-otp.js');
                }
            } else {
                console.log('   ❌ Aucun code trouvé pour test@tesla.com');
            }
            
            // Statistiques finales
            console.log('\n📈 Statistiques globales:');
            db.get('SELECT COUNT(*) as total FROM otp_codes', (err, row) => {
                if (!err) {
                    console.log(`   📊 Total codes: ${row.total}`);
                }
            });
            
            db.get('SELECT COUNT(*) as valid FROM otp_codes WHERE is_used = 0 AND expires_at > datetime("now")', (err, row) => {
                if (!err) {
                    console.log(`   ✅ Codes valides: ${row.valid}`);
                }
            });
            
            db.get('SELECT COUNT(*) as used FROM otp_codes WHERE is_used = 1', (err, row) => {
                if (!err) {
                    console.log(`   🔒 Codes utilisés: ${row.used}`);
                }
            });
            
            console.log('\n' + '='.repeat(60));
            console.log('✅ VÉRIFICATION TERMINÉE');
            console.log('='.repeat(60));
            
            db.close();
        });
    });
}

verifyLatestOTP();
