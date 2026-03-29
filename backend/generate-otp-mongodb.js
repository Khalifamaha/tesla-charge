const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/tesla-charge';

async function generateAndShowOTP() {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('🔐 GÉNÉRATION CODE OTP - MONGODB');
        console.log('='.repeat(60));
        
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db('tesla-charge');
        const otpCollection = db.collection('otp_codes');
        
        // Générer un code OTP aléatoire
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const contact = 'test@tesla.com';
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Insérer dans MongoDB
        const result = await otpCollection.insertOne({
            contact: contact,
            code: code,
            type: 'email',
            is_used: false,
            expires_at: expiresAt,
            created_at: new Date()
        });
        
        console.log('\n✅ Code OTP généré avec succès !');
        console.log('='.repeat(40));
        console.log('📧 Email:', contact);
        console.log('🔢 Code:', code);
        console.log('⏰ Expire:', expiresAt.toLocaleString());
        console.log('🆔 ID:', result.insertedId);
        
        await client.close();
        
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 MongoDB n\'est pas démarré !');
        }
    }
}

generateAndShowOTP();
