const http = require('http');

async function generateOTP() {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('🔐 GÉNÉRATION DE CODE OTP');
        console.log('='.repeat(60));
        
        const emailData = JSON.stringify({
            contact: 'test@tesla.com',
            type: 'email'
        });
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/send-otp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(emailData)
            }
        };
        
        const response = await new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve({
                            status: res.statusCode,
                            data: JSON.parse(data)
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            data: data
                        });
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.write(emailData);
            req.end();
        });
        
        console.log(`📡 Status: ${response.status}`);
        console.log(`📋 Réponse: ${JSON.stringify(response.data, null, 2)}`);
        console.log(`✅ Succès: ${response.status === 200 ? 'OUI' : 'NON'}`);
        
        console.log('\n💡 Le code OTP s\'affiche dans la console du serveur!');
        console.log('🔗 Allez sur: http://localhost:3000');
        console.log('📧 Utilisez: test@tesla.com');
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération du code OTP:', error.message);
    }
}

generateOTP();
