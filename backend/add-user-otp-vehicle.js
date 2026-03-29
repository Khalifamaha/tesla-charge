const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database connection
const db = new sqlite3.Database('./tesla-charge-real.db');

console.log('🔧 AJOUT UTILISATEUR + OTP + VOITURE');
console.log('=' .repeat(50));

async function addUserWithOTPAndVehicle() {
    try {
        // 1. Add User
        const newUser = {
            email: 'new-user@tesla.com',
            name: 'New Test User',
            is_verified: 1,
            verification_method: 'email',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        db.run(
            'INSERT INTO users (email, name, is_verified, verification_method, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [newUser.email, newUser.name, newUser.is_verified, newUser.verification_method, newUser.created_at, newUser.updated_at],
            function(err) {
                if (err) {
                    console.error('❌ Erreur ajout utilisateur:', err.message);
                    return;
                }
                
                const userId = this.lastID;
                console.log(`✅ Utilisateur ajouté: ID=${userId}, Email=${newUser.email}`);
                
                // 2. Add OTP Code
                const otpCode = '123456'; // Fixed code for testing
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
                
                db.run(
                    'INSERT INTO otp_codes (contact, code, type, expires_at, is_used, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [newUser.email, otpCode, 'email', expiresAt.toISOString(), 0, new Date().toISOString()],
                    function(err) {
                        if (err) {
                            console.error('❌ Erreur ajout OTP:', err.message);
                            return;
                        }
                        
                        console.log(`✅ Code OTP ajouté: ${otpCode} pour ${newUser.email}`);
                        
                        // 3. Add Vehicle
                        const newVehicle = {
                            user_id: userId,
                            license_plate: 'NEW-999-XYZ',
                            vin: 'NEWVIN999999999',
                            is_foreign: 0,
                            country: 'France',
                            status: 'verified',
                            created_at: new Date().toISOString()
                        };
                        
                        db.run(
                            'INSERT INTO vehicles (user_id, license_plate, vin, is_foreign, country, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [newVehicle.user_id, newVehicle.license_plate, newVehicle.vin, newVehicle.is_foreign, newVehicle.country, newVehicle.status, newVehicle.created_at],
                            function(err) {
                                if (err) {
                                    console.error('❌ Erreur ajout véhicule:', err.message);
                                    return;
                                }
                                
                                console.log(`✅ Véhicule ajouté: ID=${this.lastID}, Plaque=${newVehicle.license_plate}`);
                                
                                // 4. Verify all data
                                verifyAddedData(userId, newUser.email, otpCode);
                            }
                        );
                    }
                );
            }
        );
        
    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

function verifyAddedData(userId, email, otpCode) {
    console.log('\n🔍 VÉRIFICATION DES DONNÉES AJOUTÉES...');
    
    // Verify user
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('❌ Erreur vérification utilisateur:', err);
            return;
        }
        
        if (user) {
            console.log(`✅ Utilisateur vérifié: ${user.email} (ID: ${user.id})`);
        } else {
            console.log('❌ Utilisateur non trouvé');
        }
    });
    
    // Verify OTP
    db.get('SELECT * FROM otp_codes WHERE contact = ? AND code = ?', [email, otpCode], (err, otp) => {
        if (err) {
            console.error('❌ Erreur vérification OTP:', err);
            return;
        }
        
        if (otp) {
            console.log(`✅ OTP vérifié: ${otp.code} pour ${otp.contact}`);
            console.log(`   ⏰ Expire: ${otp.expires_at}`);
            console.log(`   📊 Utilisé: ${otp.is_used ? 'Oui' : 'Non'}`);
        } else {
            console.log('❌ OTP non trouvé');
        }
    });
    
    // Verify vehicle
    db.get('SELECT * FROM vehicles WHERE user_id = ?', [userId], (err, vehicle) => {
        if (err) {
            console.error('❌ Erreur vérification véhicule:', err);
            return;
        }
        
        if (vehicle) {
            console.log(`✅ Véhicule vérifié: ${vehicle.license_plate} (ID: ${vehicle.id})`);
            console.log(`   🆔 VIN: ${vehicle.vin}`);
            console.log(`   🌍 Pays: ${vehicle.country}`);
            console.log(`   📊 Statut: ${vehicle.status}`);
        } else {
            console.log('❌ Véhicule non trouvé');
        }
        
        // Show summary
        console.log('\n📋 RÉCAPITULATIF:');
        console.log(`👤 Utilisateur: ${email}`);
        console.log(`🔐 Code OTP: ${otpCode}`);
        console.log(`🚗 Véhicule: NEW-999-XYZ`);
        console.log('\n🎯 TEST DANS L\'APPLICATION:');
        console.log(`1. Allez sur: http://localhost:3001`);
        console.log(`2. Email: ${email}`);
        console.log(`3. Code OTP: ${otpCode}`);
        console.log(`4. Vérifiez que le véhicule apparaît dans le dashboard`);
        
        db.close((err) => {
            if (err) {
                console.error('❌ Erreur fermeture DB:', err.message);
            } else {
                console.log('\n✅ Base de données fermée - Test prêt!');
            }
        });
    });
}

// Start the process
addUserWithOTPAndVehicle();
