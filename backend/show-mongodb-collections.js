const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/tesla-charge';

async function showCollections() {
    try {
        console.log('🔌 Connexion à MongoDB...');
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db('tesla-charge');
        console.log('✅ Connecté à MongoDB');
        
        // Lister les collections
        const collections = await db.listCollections().toArray();
        console.log(`\n📁 Collections trouvées (${collections.length}):`);
        console.log('=' .repeat(50));
        
        for (const collection of collections) {
            const coll = db.collection(collection.name);
            const count = await coll.countDocuments();
            console.log(`   • ${collection.name}: ${count} documents`);
        }
        
        await client.close();
        console.log('\n🔒 Connexion fermée');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 MongoDB n\'est pas démarré !');
            console.log('   Démarrer MongoDB et réessayez.');
        }
    }
}

showCollections();
