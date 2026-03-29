const { MongoClient } = require('mongodb');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tesla-charge';

console.log('🔍 VÉRIFICATION CONNEXION MONGODB');
console.log('=' .repeat(50));
console.log(`📍 URI: ${mongoURI}`);

async function checkMongoDBConnection() {
    const client = new MongoClient(mongoURI);
    
    try {
        // Test connection
        await client.connect();
        console.log('✅ Connexion MongoDB réussie');
        
        const db = client.db('tesla-charge');
        console.log(`📂 Base de données: ${db.databaseName}`);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`📋 Collections trouvées: ${collections.length}`);
        
        // Check data in each collection
        for (const collection of collections) {
            const coll = db.collection(collection.name);
            const count = await coll.countDocuments();
            console.log(`   📊 ${collection.name}: ${count} documents`);
            
            // Show sample data
            if (count > 0) {
                const sample = await coll.findOne();
                console.log(`      📝 Exemple: ${JSON.stringify(sample).substring(0, 100)}...`);
            }
        }
        
        // Test write operation
        const testCollection = db.collection('test');
        await testCollection.insertOne({
            test: true,
            timestamp: new Date(),
            message: 'Test de connexion MongoDB'
        });
        
        console.log('✅ Test d\'écriture réussi');
        
        // Clean up test data
        await testCollection.deleteOne({ test: true });
        console.log('✅ Test de suppression réussi');
        
        console.log('\n🎯 Connexion MongoDB entièrement vérifiée!');
        
    } catch (error) {
        console.error('❌ Erreur connexion MongoDB:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Solution: Démarrez MongoDB service');
            console.log('   Windows: net start MongoDB');
            console.log('   macOS/Linux: mongod');
        } else if (error.message.includes('Authentication')) {
            console.log('💡 Solution: Vérifiez les identifiants MongoDB');
        } else if (error.message.includes('Network')) {
            console.log('💡 Solution: Vérifiez que MongoDB est accessible');
        }
        
    } finally {
        await client.close();
        console.log('✅ Connexion MongoDB fermée');
    }
}

checkMongoDBConnection();
