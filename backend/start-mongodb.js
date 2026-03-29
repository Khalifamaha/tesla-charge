const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Arrêt des serveurs existants...');

// Kill all Node.js processes on port 3000
exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
    if (stdout) {
        const lines = stdout.split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5) {
                const pid = parts[parts.length - 1];
                exec(`taskkill /F /PID ${pid}`, (killError) => {
                    if (!killError) {
                        console.log(`✅ Processus ${pid} arrêté`);
                    }
                });
            }
        });
    }
    
    // Wait a moment then start MongoDB server
    setTimeout(() => {
        console.log('🚀 Démarrage du serveur MongoDB...');
        exec('node server-mongodb.js', { cwd: path.join(__dirname) }, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erreur démarrage MongoDB:', error);
                return;
            }
            
            console.log(stdout);
        });
    }, 2000);
});
