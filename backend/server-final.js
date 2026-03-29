require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tesla-charge-super-secret-2024';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// SQLite Database with real persistence
const db = new sqlite3.Database('./tesla-charge-real.db', (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create tables
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            name TEXT,
            password_hash TEXT,
            is_verified BOOLEAN DEFAULT 0,
            verification_method TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Vehicles table
        db.run(`CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            license_plate TEXT,
            vin TEXT,
            is_foreign BOOLEAN DEFAULT 0,
            country TEXT DEFAULT 'France',
            document_url TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // OTP codes table
        db.run(`CREATE TABLE IF NOT EXISTS otp_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact TEXT,
            code TEXT,
            type TEXT,
            expires_at DATETIME,
            is_used BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Reservations table
        db.run(`CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            station_id INTEGER,
            vehicle_id INTEGER,
            date TEXT,
            start_time TEXT,
            end_time TEXT,
            charging_type TEXT,
            estimated_price TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (station_id) REFERENCES stations (id),
            FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
        )`);

        // Stations table
        db.run(`CREATE TABLE IF NOT EXISTS stations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            address TEXT,
            latitude REAL,
            longitude REAL,
            total_slots INTEGER,
            available_slots INTEGER,
            power_kw INTEGER,
            price_per_kwh REAL,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed initial data
        seedData();
    });
}

function seedData() {
    // Check if stations already exist
    db.get('SELECT COUNT(*) as count FROM stations', (err, row) => {
        if (err) {
            console.error('Error checking stations:', err);
            return;
        }

        if (row.count === 0) {
            const stations = [
                ['Paris - Bercy', '12 Rue de Bercy, 75012 Paris', 48.8400, 2.3749, 12, 8, 250, 0.35],
                ['La Défense', '1 Place de la Défense, 92800 Puteaux', 48.8927, 2.2362, 16, 3, 250, 0.35],
                ['Lyon - Part-Dieu', '15 Rue du Département, 69003 Lyon', 45.7640, 4.8357, 10, 6, 150, 0.32],
                ['Marseille - Prado', '58 Avenue du Prado, 13008 Marseille', 43.2765, 5.3844, 8, 5, 150, 0.32],
                ['Nice - Promenade', '45 Promenade des Anglais, 06000 Nice', 43.6949, 7.2684, 6, 4, 120, 0.30],
                ['Toulouse - Compans', '15 Rue de Compans, 31000 Toulouse', 43.6047, 1.4442, 8, 6, 120, 0.30],
                ['Bordeaux - Mériadeck', 'Cours de la Marne, 33000 Bordeaux', 44.8378, -0.5792, 10, 7, 150, 0.32],
                ['Lille - Grand Place', 'Grand Place, 59000 Lille', 50.6372, 3.0635, 6, 3, 120, 0.30],
                ['Strasbourg - Place Kléber', 'Place Kléber, 67000 Strasbourg', 48.5846, 7.7507, 8, 5, 120, 0.30],
                ['Nantes - Cité des Congrès', '5 Cité des Congrès, 44000 Nantes', 47.2174, -1.5536, 10, 8, 150, 0.32]
            ];

            const stmt = db.prepare('INSERT INTO stations (name, address, latitude, longitude, total_slots, available_slots, power_kw, price_per_kwh) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            
            stations.forEach(station => {
                stmt.run(station);
            });
            
            stmt.finalize((err) => {
                if (err) {
                    console.error('Error seeding stations:', err);
                } else {
                    console.log('✅ Stations seeded successfully');
                }
            });
        }
    });

    // Create test users
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) {
            console.error('Error checking users:', err);
            return;
        }

        if (row.count === 0) {
            const testUsers = [
                ['john.tesla@tesla.com', 'John Tesla'],
                ['alice.driver@tesla.com', 'Alice Driver'],
                ['bob.owner@tesla.com', 'Bob Owner'],
                ['sarah.fan@tesla.com', 'Sarah Fan'],
                ['mike.tech@tesla.com', 'Mike Tech']
            ];

            testUsers.forEach(async ([email, name]) => {
                const hashedPassword = await bcrypt.hash('password123', 10);
                db.run('INSERT INTO users (email, name, password_hash, is_verified, verification_method) VALUES (?, ?, ?, ?, ?)',
                    [email, name, hashedPassword, 1, 'email']);
            });

            console.log('✅ Test users created successfully');
        }
    });
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateEmailOTP() {
    const codes = [
        '123456', '789012', '345678', '901234', '567890',
        '234567', '890123', '456789', '012345', '678901'
    ];
    return codes[Math.floor(Math.random() * codes.length)];
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

async function sendOTP(contact, type) {
    const code = type === 'email' ? generateEmailOTP() : generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO otp_codes (contact, code, type, expires_at) VALUES (?, ?, ?, ?)',
            [contact, code, type, expiresAt.toISOString()],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Display in console for testing
                    console.log('\n' + '='.repeat(60));
                    console.log('🔐 NOUVEAU CODE DE VÉRIFICATION GÉNÉRÉ');
                    console.log('='.repeat(60));
                    console.log(`📧 Contact: ${contact}`);
                    console.log(`🔢 Code: ${code}`);
                    console.log(`⏰ Expires: ${expiresAt.toLocaleString('fr-FR')}`);
                    console.log(`📱 Type: ${type}`);
                    console.log(`🗄️ Database: SQLite (tesla-charge-real.db)`);
                    console.log('='.repeat(60) + '\n');
                    
                    console.log(`📧 ${type === 'email' ? 'Email' : 'SMS'} sent to ${contact} with code: ${code}`);
                    console.log('💡 Use the displayed OTP code for testing');
                    
                    resolve(code);
                }
            }
        );
    });
}

// OTP Routes
app.post('/api/send-otp', async (req, res) => {
    try {
        const { contact, type } = req.body;
        
        if (!contact || !type) {
            return res.status(400).json({ error: 'Contact and type are required' });
        }
        
        // Validate email format
        if (type === 'email' && !contact.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        await sendOTP(contact, type);
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { contact, code, type } = req.body;
        
        if (!contact || !code || !type) {
            return res.status(400).json({ error: 'Contact, code, and type are required' });
        }
        
        // Find valid OTP
        db.get(
            'SELECT * FROM otp_codes WHERE contact = ? AND code = ? AND type = ? AND is_used = 0 AND expires_at > datetime("now")',
            [contact, code, type],
            async (err, otpRecord) => {
                if (err) {
                    console.error('Error finding OTP:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                
                if (!otpRecord) {
                    return res.status(400).json({ error: 'Invalid or expired OTP' });
                }
                
                // Mark OTP as used
                db.run('UPDATE otp_codes SET is_used = 1 WHERE id = ?', [otpRecord.id]);
                
                // Find or create user
                db.get(
                    'SELECT * FROM users WHERE email = ? OR phone = ?',
                    [contact, contact],
                    async (err, user) => {
                        if (err) {
                            console.error('Error finding user:', err);
                            return res.status(500).json({ error: 'Internal server error' });
                        }
                        
                        if (!user) {
                            const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
                            db.run(
                                'INSERT INTO users (email, phone, name, password_hash, is_verified, verification_method) VALUES (?, ?, ?, ?, ?, ?)',
                                [
                                    type === 'email' ? contact : null,
                                    type === 'phone' ? contact : null,
                                    'Tesla User',
                                    hashedPassword,
                                    1,
                                    type
                                ],
                                function(err) {
                                    if (err) {
                                        console.error('Error creating user:', err);
                                        return res.status(500).json({ error: 'Internal server error' });
                                    }
                                    
                                    const newUser = {
                                        id: this.lastID,
                                        email: type === 'email' ? contact : null,
                                        phone: type === 'phone' ? contact : null,
                                        name: 'Tesla User'
                                    };
                                    
                                    const token = jwt.sign(
                                        { userId: newUser.id, email: newUser.email, phone: newUser.phone, name: newUser.name },
                                        JWT_SECRET,
                                        { expiresIn: '24h' }
                                    );
                                    
                                    res.json({
                                        message: 'Verification successful',
                                        token,
                                        user: { id: newUser.id, email: newUser.email, phone: newUser.phone, name: newUser.name }
                                    });
                                }
                            );
                        } else {
                            // Update existing user
                            db.run('UPDATE users SET is_verified = 1, updated_at = datetime("now") WHERE id = ?', [user.id]);
                            
                            const token = jwt.sign(
                                { userId: user.id, email: user.email, phone: user.phone, name: user.name },
                                JWT_SECRET,
                                { expiresIn: '24h' }
                            );
                            
                            res.json({
                                message: 'Verification successful',
                                token,
                                user: { id: user.id, email: user.email, phone: user.phone, name: user.name }
                            });
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Vehicle Routes
app.post('/api/vehicles', authenticateToken, async (req, res) => {
    try {
        const { license_plate, vin, is_foreign, country, document_url } = req.body;
        const userId = req.user.userId;
        
        if (!license_plate || !vin) {
            return res.status(400).json({ error: 'License plate and VIN are required' });
        }
        
        db.run(
            'INSERT INTO vehicles (user_id, license_plate, vin, is_foreign, country, document_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, license_plate.toUpperCase(), vin.toUpperCase(), is_foreign || 0, country || 'France', document_url, 'verified'],
            function(err) {
                if (err) {
                    console.error('Error registering vehicle:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                
                const newVehicle = {
                    id: this.lastID,
                    user_id: userId,
                    license_plate: license_plate.toUpperCase(),
                    vin: vin.toUpperCase(),
                    is_foreign: is_foreign || 0,
                    country: country || 'France',
                    document_url: document_url,
                    status: 'verified',
                    created_at: new Date().toISOString()
                };
                
                res.status(201).json({
                    message: 'Vehicle registered successfully',
                    vehicle: newVehicle
                });
            }
        );
    } catch (error) {
        console.error('Error registering vehicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/vehicles', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        db.all('SELECT * FROM vehicles WHERE user_id = ?', [userId], (err, vehicles) => {
            if (err) {
                console.error('Error fetching vehicles:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(vehicles);
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/ocr-scan', authenticateToken, (req, res) => {
    try {
        // Mock OCR response
        const mockOCRResult = {
            license_plate: 'AB-123-CD',
            vin: '5YJ3E7EA1J1234567',
            confidence: 0.95
        };
        
        res.json({
            message: 'OCR scan successful',
            data: mockOCRResult
        });
    } catch (error) {
        console.error('Error in OCR scan:', error);
        res.status(500).json({ error: 'OCR scan failed' });
    }
});

// Station Routes
app.get('/api/stations', authenticateToken, (req, res) => {
    try {
        db.all('SELECT * FROM stations WHERE is_active = 1', (err, stations) => {
            if (err) {
                console.error('Error fetching stations:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(stations);
        });
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reservation Routes
app.post('/api/reservations', authenticateToken, (req, res) => {
    try {
        const { station_id, vehicle_id, date, start_time, end_time, charging_type, estimated_price } = req.body;
        const userId = req.user.userId;
        
        if (!station_id || !vehicle_id || !date || !start_time || !end_time || !charging_type) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Create reservation
        db.run(
            'INSERT INTO reservations (user_id, station_id, vehicle_id, date, start_time, end_time, charging_type, estimated_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, station_id, vehicle_id, date, start_time, end_time, charging_type, estimated_price, 'confirmed', new Date().toISOString()],
            function(err) {
                if (err) {
                    console.error('Error creating reservation:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                
                res.status(201).json({
                    message: 'Reservation created successfully',
                    reservation: {
                        id: this.lastID,
                        user_id: userId,
                        station_id: station_id,
                        vehicle_id: vehicle_id,
                        date: date,
                        start_time: start_time,
                        end_time: end_time,
                        charging_type: charging_type,
                        estimated_price: estimated_price,
                        status: 'confirmed',
                        created_at: new Date().toISOString()
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/reservations', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        db.all('SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, reservations) => {
            if (err) {
                console.error('Error fetching reservations:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(reservations);
        });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Routes
app.get('/api/user', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        db.get('SELECT id, email, phone, name, is_verified, created_at FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('User connected to socket');
    
    socket.on('disconnect', () => {
        console.log('User disconnected from socket');
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
server.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚗 TeslaCharge Server Started Successfully');
    console.log('='.repeat(60));
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🔗 Open http://localhost:${PORT} in your browser`);
    console.log('🗄️ Database: SQLite (tesla-charge-real.db)');
    console.log('🔐 OTP System: Active (console display)');
    console.log('='.repeat(60));
    
    // Display available test accounts
    console.log('\n📧 Test Accounts Available:');
    console.log('├── john.tesla@tesla.com');
    console.log('├── alice.driver@tesla.com');
    console.log('├── bob.owner@tesla.com');
    console.log('├── sarah.fan@tesla.com');
    console.log('└── mike.tech@tesla.com');
    console.log('\n💡 Use any of these emails to get real OTP codes!');
    console.log('🗄️ All data is now stored in a real SQLite database!\n');
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
    });
    process.exit(0);
});
