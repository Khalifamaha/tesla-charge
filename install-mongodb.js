const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📦 Installation de MongoDB pour TeslaCharge...');

// Install MongoDB driver
exec('npm install mongodb', { cwd: path.join(__dirname, 'backend') }, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Erreur installation MongoDB:', error);
        return;
    }
    
    console.log('✅ MongoDB driver installé avec succès');
    console.log('📋 Output:', stdout);
    
    // Copy MongoDB package.json
    const packageSource = path.join(__dirname, 'package-mongodb.json');
    const packageDest = path.join(__dirname, 'backend', 'package.json');
    
    try {
        fs.copyFileSync(packageSource, packageDest);
        console.log('✅ package.json MongoDB copié');
    } catch (copyError) {
        console.error('❌ Erreur copie package.json:', copyError);
    }
    
    // Copy .env file
    const envSource = path.join(__dirname, '.env-mongodb');
    const envDest = path.join(__dirname, 'backend', '.env');
    
    try {
        fs.copyFileSync(envSource, envDest);
        console.log('✅ .env MongoDB copié');
    } catch (copyError) {
        console.error('❌ Erreur copie .env:', copyError);
    }
    
    console.log('\n🚀 Installation MongoDB terminée!');
    console.log('📂 Fichiers créés:');
    console.log('   - backend/server-mongodb.js');
    console.log('   - backend/package.json (mis à jour)');
    console.log('   - backend/.env (mis à jour)');
    console.log('\n🔗 Pour démarrer avec MongoDB:');
    console.log('   cd backend && node server-mongodb.js');
    console.log('\n⚠️ Assurez-vous que MongoDB est en cours d\'exécution sur localhost:27017');
});
