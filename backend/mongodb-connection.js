const { MongoClient } = require('mongodb');

// Configuration MongoDB
const mongoConfig = {
    // Connexion locale (votre setup actuel)
    local: {
        uri: 'mongodb://localhost:27017/tesla-charge',
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },
    
    // Connexion MongoDB Atlas (pour production)
    atlas: {
        uri: process.env.MONGODB_ATLAS_URI || 'mongodb+srv://username:password@cluster.mongodb.net/tesla-charge?retryWrites=true&w=majority',
        options: {
            maxPoolSize: 50,
            w: 'majority',
            retryWrites: true,
        }
    }
};

class MongoDBConnection {
    constructor(config = 'local') {
        this.config = mongoConfig[config];
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    // Connexion à MongoDB
    async connect() {
        try {
            console.log('🔌 Connexion à MongoDB...');
            console.log(`📍 URI: ${this.config.uri}`);
            
            this.client = new MongoClient(this.config.uri, this.config.options);
            await this.client.connect();
            
            this.db = this.client.db('tesla-charge');
            this.isConnected = true;
            
            console.log('✅ Connexion MongoDB établie avec succès!');
            console.log(`📂 Base de données: ${this.db.databaseName}`);
            
            // Vérifier les collections
            await this.verifyCollections();
            
            return this.db;
            
        } catch (error) {
            console.error('❌ Erreur de connexion MongoDB:', error.message);
            throw error;
        }
    }

    // Vérifier et créer les collections
    async verifyCollections() {
        const requiredCollections = ['users', 'vehicles', 'reservations', 'stations', 'otp_codes'];
        
        for (const collectionName of requiredCollections) {
            try {
                const collections = await this.db.listCollections({ name: collectionName }).toArray();
                
                if (collections.length === 0) {
                    console.log(`📁 Création de la collection: ${collectionName}`);
                    await this.db.createCollection(collectionName);
                    
                    // Créer les index
                    await this.createIndexes(collectionName);
                } else {
                    console.log(`✅ Collection existante: ${collectionName}`);
                }
            } catch (error) {
                console.error(`❌ Erreur collection ${collectionName}:`, error.message);
            }
        }
    }

    // Créer les index
    async createIndexes(collectionName) {
        const collection = this.db.collection(collectionName);
        
        switch (collectionName) {
            case 'users':
                await collection.createIndex({ email: 1 }, { unique: true });
                await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
                console.log('   📇 Index users: email, phone créés');
                break;
                
            case 'vehicles':
                await collection.createIndex({ user_id: 1 });
                await collection.createIndex({ license_plate: 1 });
                console.log('   📇 Index vehicles: user_id, license_plate créés');
                break;
                
            case 'reservations':
                await collection.createIndex({ user_id: 1 });
                await collection.createIndex({ created_at: -1 });
                console.log('   📇 Index reservations: user_id, created_at créés');
                break;
                
            case 'otp_codes':
                await collection.createIndex({ contact: 1 });
                await collection.createIndex({ expires_at: 1 });
                await collection.createIndex({ is_used: 1 });
                console.log('   📇 Index otp_codes: contact, expires_at, is_used créés');
                break;
                
            case 'stations':
                await collection.createIndex({ is_active: 1 });
                console.log('   📇 Index stations: is_active créé');
                break;
        }
    }

    // Obtenir une collection
    getCollection(name) {
        if (!this.isConnected) {
            throw new Error('Non connecté à MongoDB. Appelez connect() d\'abord.');
        }
        return this.db.collection(name);
    }

    // Fermer la connexion
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            console.log('🔒 Connexion MongoDB fermée');
        }
    }

    // Health check
    async healthCheck() {
        try {
            const admin = this.client.db('admin');
            const result = await admin.command({ ping: 1 });
            return result.ok === 1;
        } catch (error) {
            return false;
        }
    }
}

// Fonction de test
async function testMongoDBConnection() {
    console.log('🧪 TEST DE CONNEXION MONGODB');
    console.log('=' .repeat(50));
    
    const mongo = new MongoDBConnection('local');
    
    try {
        // Connexion
        await mongo.connect();
        
        // Test d'écriture
        const testCollection = mongo.getCollection('test');
        const testDoc = {
            test: true,
            message: 'Test de connexion MongoDB',
            timestamp: new Date(),
            server: 'localhost:27017'
        };
        
        const insertResult = await testCollection.insertOne(testDoc);
        console.log(`✅ Document inséré: ID ${insertResult.insertedId}`);
        
        // Test de lecture
        const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
        console.log(`✅ Document lu: ${foundDoc.message}`);
        
        // Nettoyage
        await testCollection.deleteOne({ _id: insertResult.insertedId });
        console.log('✅ Document de test supprimé');
        
        // Stats
        const stats = await mongo.db.stats();
        console.log(`\n📊 Stats base de données:`);
        console.log(`   📁 Collections: ${stats.collections}`);
        console.log(`   📄 Documents: ${stats.objects}`);
        console.log(`   💾 Taille données: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        
        console.log('\n✅ Test MongoDB réussi!');
        
    } catch (error) {
        console.error('❌ Test échoué:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 SOLUTIONS:');
            console.log('   1. Vérifiez que MongoDB est démarré:');
            console.log('      Windows: services.msc → MongoDB Server');
            console.log('      macOS: brew services start mongodb-community');
            console.log('      Linux: sudo systemctl start mongod');
            console.log('   2. Vérifiez le port 27017:');
            console.log('      netstat -ano | findstr 27017');
            console.log('   3. Redémarrez MongoDB si nécessaire');
        }
        
    } finally {
        await mongo.disconnect();
    }
}

// Export pour utilisation
module.exports = {
    MongoDBConnection,
    testMongoDBConnection,
    mongoConfig
};

// Si exécuté directement
if (require.main === module) {
    testMongoDBConnection();
}
