require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

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

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tesla-charge';
const client = new MongoClient(mongoURI);

let db;
let dbConnected = false;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB database');
        db = client.db('tesla-charge');
        dbConnected = true;
        
        // Initialize collections and indexes
        await initializeMongoDB();
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}

// Initialize MongoDB collections and indexes
async function initializeMongoDB() {
    try {
        // Create collections if they don't exist
        const collections = ['users', 'vehicles', 'reservations', 'stations', 'otp_codes'];
        
        for (const collectionName of collections) {
            const collection = db.collection(collectionName);
            
            // Drop existing indexes to avoid conflicts
            try {
                await collection.dropIndexes();
                console.log(`🗑️ Dropped existing indexes for ${collectionName}`);
            } catch (error) {
                // Ignore if no indexes exist
                console.log(`ℹ️ No indexes to drop for ${collectionName}`);
            }
            
            // Create indexes for better performance
            if (collectionName === 'users') {
                await collection.createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
                // Removed phone unique index to avoid null conflicts
            } else if (collectionName === 'vehicles') {
                await collection.createIndex({ user_id: 1 });
                await collection.createIndex({ license_plate: 1 });
            } else if (collectionName === 'reservations') {
                await collection.createIndex({ user_id: 1 });
                await collection.createIndex({ created_at: -1 });
            } else if (collectionName === 'otp_codes') {
                await collection.createIndex({ contact: 1 });
                await collection.createIndex({ expires_at: 1 });
            }
            
            console.log(`✅ Collection '${collectionName}' initialized with indexes`);
        }
        
        // Seed initial data if collections are empty
        await seedInitialData();
        
    } catch (error) {
        console.error('❌ Error initializing MongoDB:', error);
    }
}

// Seed initial data
async function seedInitialData() {
    try {
        // Check if stations exist
        const stationsCount = await db.collection('stations').countDocuments();
        
        if (stationsCount === 0) {
            console.log('📍 Seeding initial stations...');
            
            const stations = [
                {
                    _id: new ObjectId(),
                    name: 'Paris - Bercy',
                    address: '12 Rue de Bercy, 75012 Paris',
                    latitude: 48.8397,
                    longitude: 2.3776,
                    total_slots: 10,
                    available_slots: 7,
                    power_kw: 250,
                    price_per_kwh: 0.35,
                    type: 'Rapide',
                    is_active: true,
                    created_at: new Date()
                },
                {
                    _id: new ObjectId(),
                    name: 'La Défense',
                    address: '1 Place de la Défense, 92800 Puteaux',
                    latitude: 48.8924,
                    longitude: 2.2360,
                    total_slots: 16,
                    available_slots: 3,
                    power_kw: 150,
                    price_per_kwh: 0.32,
                    type: 'Standard',
                    is_active: true,
                    created_at: new Date()
                },
                {
                    _id: new ObjectId(),
                    name: 'Lyon - Part-Dieu',
                    address: '15 Rue du Département, 69003 Lyon',
                    latitude: 45.7600,
                    longitude: 4.9833,
                    total_slots: 6,
                    available_slots: 6,
                    power_kw: 150,
                    price_per_kwh: 0.32,
                    type: 'Standard',
                    is_active: true,
                    created_at: new Date()
                }
            ];
            
            await db.collection('stations').insertMany(stations);
            console.log(`✅ ${stations.length} stations seeded`);
        }
        
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// OTP Routes
app.post('/api/send-otp', async (req, res) => {
    try {
        const { contact, type = 'email' } = req.body;
        
        if (!contact) {
            return res.status(400).json({ error: 'Contact is required' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Check if user exists
        const existingUser = await db.collection('users').findOne({ 
            $or: [
                { email: contact },
                { phone: contact }
            ]
        });

        if (!existingUser) {
            // Create new user
            const newUser = {
                email: type === 'email' ? contact : null,
                phone: type === 'phone' ? contact : null,
                name: contact.split('@')[0],
                is_verified: false,
                verification_method: type,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            const result = await db.collection('users').insertOne(newUser);
            console.log('✅ New user created:', contact);
        }

        // Store OTP code
        await db.collection('otp_codes').insertOne({
            contact,
            code,
            type,
            expires_at: expiresAt,
            is_used: false,
            created_at: new Date()
        });

        console.log(`📧 OTP sent to ${contact}: ${code}`);
        res.status(200).json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    try {
        const { contact, code, type = 'email' } = req.body;
        
        if (!contact || !code) {
            return res.status(400).json({ error: 'Contact and code are required' });
        }

        const otpRecord = await db.collection('otp_codes').findOne({
            contact,
            code,
            type,
            is_used: false,
            expires_at: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        // Mark OTP as used
        await db.collection('otp_codes').updateOne(
            { _id: otpRecord._id },
            { $set: { is_used: true, updated_at: new Date() } }
        );

        // Get or create user
        let user = await db.collection('users').findOne({ 
            $or: [
                { email: contact },
                { phone: contact }
            ]
        });

        if (!user) {
            user = {
                email: type === 'email' ? contact : null,
                phone: type === 'phone' ? contact : null,
                name: contact.split('@')[0],
                is_verified: true,
                verification_method: type,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            const result = await db.collection('users').insertOne(user);
            user._id = result.insertedId;
        } else {
            // Update user as verified
            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { is_verified: true, updated_at: new Date() } }
            );
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`✅ User verified: ${contact}`);
        res.status(200).json({
            message: 'OTP verified successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                is_verified: user.is_verified
            }
        });

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

        const newVehicle = {
            user_id: new ObjectId(userId),
            license_plate: license_plate.toUpperCase(),
            vin: vin.toUpperCase(),
            is_foreign: is_foreign || false,
            country: country || 'France',
            document_url: document_url,
            status: 'verified',
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('vehicles').insertOne(newVehicle);
        
        console.log(`✅ Vehicle registered for user ${userId}: ${license_plate}`);
        res.status(201).json({
            message: 'Vehicle registered successfully',
            vehicle: {
                ...newVehicle,
                id: result.insertedId
            }
        });

    } catch (error) {
        console.error('Error registering vehicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/vehicles', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const vehicles = await db.collection('vehicles').find({ 
            user_id: new ObjectId(userId) 
        }).toArray();

        res.status(200).json(vehicles);

    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Station Routes
app.get('/api/stations', authenticateToken, async (req, res) => {
    try {
        const stations = await db.collection('stations').find({ 
            is_active: true 
        }).toArray();

        res.status(200).json(stations);

    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reservation Routes
app.post('/api/reservations', authenticateToken, async (req, res) => {
    try {
        const { station_id, vehicle_id, date, start_time, end_time, charging_type, estimated_price } = req.body;
        const userId = req.user.userId;
        
        if (!station_id || !vehicle_id || !date || !start_time || !end_time || !charging_type) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Convert IDs to ObjectId safely
        let stationIdObj, vehicleIdObj;
        try {
            stationIdObj = new ObjectId(station_id);
        } catch (e) {
            stationIdObj = station_id; // Use as string if not valid ObjectId
        }
        try {
            vehicleIdObj = new ObjectId(vehicle_id);
        } catch (e) {
            vehicleIdObj = vehicle_id; // Use as string if not valid ObjectId
        }

        const newReservation = {
            user_id: new ObjectId(userId),
            station_id: stationIdObj,
            vehicle_id: vehicleIdObj,
            date,
            start_time,
            end_time,
            charging_type,
            estimated_price: parseFloat(estimated_price),
            status: 'confirmed',
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('reservations').insertOne(newReservation);
        
        console.log(`✅ Reservation created for user ${userId}: ${date} ${start_time}-${end_time}`);
        res.status(201).json({
            message: 'Reservation created successfully',
            reservation: {
                ...newReservation,
                id: result.insertedId
            }
        });

    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/reservations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const reservations = await db.collection('reservations').find({ 
            user_id: new ObjectId(userId) 
        }).sort({ created_at: -1 }).toArray();

        res.status(200).json(reservations);

    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Routes
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db.collection('users').findOne({ 
            _id: new ObjectId(userId) 
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            id: user._id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            is_verified: user.is_verified,
            created_at: user.created_at
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check route
app.get('/api/health', async (req, res) => {
    try {
        const stats = {
            mongodb: dbConnected ? 'connected' : 'disconnected',
            collections: {},
            server: 'running',
            timestamp: new Date().toISOString()
        };

        if (dbConnected) {
            const collections = ['users', 'vehicles', 'reservations', 'stations', 'otp_codes'];
            
            for (const collectionName of collections) {
                const count = await db.collection(collectionName).countDocuments();
                stats.collections[collectionName] = count;
            }
        }

        res.status(200).json(stats);

    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
connectToMongoDB().then(() => {
    server.listen(PORT, () => {
        console.log(`\n🚀 TeslaCharge Server (MongoDB) running on port ${PORT}`);
        console.log(`🔗 MongoDB URI: ${mongoURI}`);
        console.log(`🌐 Server: http://localhost:${PORT}`);
        console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
        console.log('\n✅ Ready to accept connections!');
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    
    if (dbConnected) {
        await client.close();
        console.log('✅ MongoDB connection closed');
    }
    
    process.exit(0);
});
