const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tesla-charge-real.db');

console.log('🔐 TOUS LES CODES OTP RÉCENTS (test@tesla.com):');
console.log('=' .repeat(60));

db.all('SELECT code, expires_at, is_used, created_at FROM otp_codes WHERE contact = ? ORDER BY created_at DESC LIMIT 5', ['test@tesla.com'], (err, rows) => {
    if (err) {
        console.error('❌ Erreur:', err);
    } else {
        rows.forEach((otp, i) => {
            const status = otp.is_used ? '❌ UTILISÉ' : '✅ VALIDE';
            const expired = new Date(otp.expires_at) < new Date() ? ' ⏰ EXPIRÉ' : '';
            console.log(`${i+1}. Code: ${otp.code} | ${status}${expired}`);
        });
        
        // Trouver un code valide
        const validOtp = rows.find(otp => !otp.is_used && new Date(otp.expires_at) > new Date());
        if (validOtp) {
            console.log('\n🎯 CODE OTP À UTILISER:');
            console.log(`   📧 Email: test@tesla.com`);
            console.log(`   🔢 Code: ${validOtp.code}`);
            console.log(`   ⏰ Valide jusqu'à: ${validOtp.expires_at}`);
        } else {
            console.log('\n⚠️ Aucun code valide trouvé - Générez-en un nouveau');
        }
    }
    db.close();
});
