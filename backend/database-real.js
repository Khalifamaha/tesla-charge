const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class Database {
    constructor(dbPath = './tesla-charge.db') {
        this.dbPath = dbPath;
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE,
                    phone TEXT UNIQUE,
                    name TEXT,
                    password_hash TEXT,
                    is_verified BOOLEAN DEFAULT 0,
                    verification_method TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createVehiclesTable = `
                CREATE TABLE IF NOT EXISTS vehicles (
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
                )
            `;

            const createOTPCodesTable = `
                CREATE TABLE IF NOT EXISTS otp_codes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contact TEXT,
                    code TEXT,
                    type TEXT,
                    expires_at DATETIME,
                    is_used BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createStationsTable = `
                CREATE TABLE IF NOT EXISTS stations (
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
                )
            `;

            this.db.serialize(() => {
                this.db.run(createUsersTable);
                this.db.run(createVehiclesTable);
                this.db.run(createOTPCodesTable);
                this.db.run(createStationsTable, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database tables created successfully');
                        this.seedInitialData().then(resolve).catch(reject);
                    }
                });
            });
        });
    }

    async seedInitialData() {
        return new Promise((resolve, reject) => {
            // Check if stations already exist
            this.db.get('SELECT COUNT(*) as count FROM stations', (err, row) => {
                if (err) {
                    reject(err);
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

                    const stmt = this.db.prepare('INSERT INTO stations (name, address, latitude, longitude, total_slots, available_slots, power_kw, price_per_kwh) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                    
                    stations.forEach(station => {
                        stmt.run(station);
                    });
                    
                    stmt.finalize((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('Stations seeded successfully');
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    async run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }
}

module.exports = Database;
