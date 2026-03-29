class TeslaChargeApp {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.currentUser = null;
        this.currentContactType = 'email';
        this.stations = [];
        this.vehicles = [];
        this.reservations = [];
        
        this.init();
    }

    init() {
        console.log('🚀 Initialisation de TeslaCharge App...');
        
        // Force show OTP section first
        const otpSection = document.getElementById('otpSection');
        const vehicleSection = document.getElementById('vehicleSection');
        const dashboardSection = document.getElementById('dashboardSection');
        const otpVerifySection = document.getElementById('otpVerifySection');
        
        console.log('📋 Éléments trouvés:', {
            otpSection: !!otpSection,
            vehicleSection: !!vehicleSection,
            dashboardSection: !!dashboardSection,
            otpVerifySection: !!otpVerifySection
        });
        
        if (otpSection) {
            otpSection.classList.remove('hidden');
            otpSection.style.display = 'flex';
            console.log('✅ Section OTP rendue visible');
        }
        
        if (vehicleSection) {
            vehicleSection.classList.add('hidden');
            vehicleSection.style.display = 'none';
        }
        
        if (dashboardSection) {
            dashboardSection.classList.add('hidden');
            dashboardSection.style.display = 'none';
        }
        
        if (otpVerifySection) {
            otpVerifySection.classList.add('hidden');
            otpVerifySection.style.display = 'none';
        }
        
        this.setupEventListeners();
        this.checkAuthStatus();
        
        // Make methods globally accessible
        window.startOCRScanner = () => this.startOCRScanner();
        window.toggleForeignVehicle = () => this.toggleForeignVehicle();
        window.showManualForm = () => this.showManualForm();
        window.backToVehicleOptions = () => this.backToVehicleOptions();
        window.closeOCRScanner = () => this.closeOCRScanner();
        window.captureImage = () => this.captureImage();
        window.backToOTPForm = () => this.backToOTPForm();
        window.closeReservationModal = () => this.closeReservationModal();
        window.openReservationModal = () => this.openReservationModal();
        window.reserveStation = (stationId) => this.reserveStation(stationId);
        window.resendOTP = () => this.resendOTP();
        
        console.log('🎯 Initialisation terminée');
    }

    setupEventListeners() {
        // OTP Forms
        const otpSendForm = document.getElementById('otpSendForm');
        const otpVerifyForm = document.getElementById('otpVerifyForm');
        
        if (otpSendForm) {
            otpSendForm.addEventListener('submit', (e) => this.handleSendOTP(e));
        }
        
        if (otpVerifyForm) {
            otpVerifyForm.addEventListener('submit', (e) => this.handleVerifyOTP(e));
        }
        
        // Vehicle Forms
        const manualVehicleForm = document.getElementById('manualVehicleForm');
        const foreignVehicleForm = document.getElementById('foreignVehicleForm');
        
        if (manualVehicleForm) {
            manualVehicleForm.addEventListener('submit', (e) => this.handleVehicleRegistration(e));
        }
        
        if (foreignVehicleForm) {
            foreignVehicleForm.addEventListener('submit', (e) => this.handleForeignVehicleRegistration(e));
        }
        
        // Dashboard
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Reservation Form
        const reservationForm = document.getElementById('reservationForm');
        if (reservationForm) {
            reservationForm.addEventListener('submit', (e) => this.handleReservation(e));
        }
        
        // OTP Input handling
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => this.handleOTPInput(e, index));
            input.addEventListener('keydown', (e) => this.handleOTPKeydown(e, index));
        });
    }

    // OCR Scanner Methods
    startOCRScanner() {
        console.log('🎬 Démarrage du scanner OCR...');
        
        const modal = document.getElementById('ocrModal');
        if (!modal) {
            console.error('❌ Modal OCR non trouvé');
            this.showToast('Erreur: Modal scanner non disponible', 'error');
            return;
        }
        
        console.log('✅ Modal OCR trouvé, ouverture...');
        modal.classList.remove('hidden');
        
        // Start with simulation immediately
        this.startVisualSimulation();
    }
    
    startVisualSimulation() {
        const scannerStatus = document.getElementById('scannerStatus');
        const scanLine = document.getElementById('scanLine');
        
        console.log('📹 Démarrage de la simulation visuelle...');
        
        if (scannerStatus) {
            scannerStatus.textContent = 'Initialisation du scanner...';
        }
        
        if (scanLine) {
            scanLine.classList.remove('hidden');
        }
        
        // Create a visual scanner interface
        const scannerContainer = document.querySelector('#ocrModal .relative');
        if (scannerContainer) {
            const existingContent = scannerContainer.querySelector('.bg-black');
            if (existingContent) {
                existingContent.innerHTML = `
                    <div class="relative w-full aspect-[4/3] border-2 border-white/50 rounded-xl overflow-hidden bg-gray-900">
                        <div id="scanLine" class="absolute w-full h-1 bg-red-500 scan-line"></div>
                        <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl m-2"></div>
                        <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl m-2"></div>
                        <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl m-2"></div>
                        <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl m-2"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center text-white">
                                <i class="fas fa-camera text-4xl mb-4 opacity-50"></i>
                                <p class="text-lg font-medium">Scanner Actif</p>
                                <p class="text-sm opacity-75">Simulation de scan</p>
                            </div>
                        </div>
                        <div class="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm font-medium">
                            <p id="scannerStatus">Initialisation...</p>
                        </div>
                        <div class="absolute top-4 right-4">
                            <button onclick="captureImage()" class="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg">
                                <i class="fas fa-camera text-white text-xl"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        
        // Simulate scanning process
        setTimeout(() => {
            if (scannerStatus) {
                scannerStatus.textContent = 'Analyse en cours...';
            }
        }, 1000);
        
        setTimeout(() => {
            if (scannerStatus) {
                scannerStatus.textContent = 'Prêt pour la capture';
            }
        }, 2000);
    }
    
    captureImage() {
        const scannerStatus = document.getElementById('scannerStatus');
        
        console.log('📸 Capture simulée...');
        
        if (scannerStatus) {
            scannerStatus.textContent = 'Capture et analyse...';
        }
        
        // Visual feedback
        const scannerContainer = document.querySelector('#ocrModal .relative .bg-black > div');
        if (scannerContainer) {
            scannerContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            setTimeout(() => {
                scannerContainer.style.backgroundColor = '';
            }, 200);
        }
        
        // Simulate OCR processing
        setTimeout(() => {
            if (scannerStatus) {
                scannerStatus.textContent = 'Données extraites avec succès!';
            }
            
            // Mock extracted data
            const mockData = {
                licensePlate: 'AB-123-CD',
                vinNumber: '1HGCM82633A123456'
            };
            
            console.log('✅ Données extraites:', mockData);
            
            // Fill the form
            this.populateVehicleForm(mockData);
            
            setTimeout(() => {
                this.closeOCRScanner();
                this.showToast('Carte grise scannée avec succès!', 'success');
            }, 1500);
        }, 1000);
    }

    closeOCRScanner() {
        console.log('🔒 Fermeture du scanner OCR...');
        const modal = document.getElementById('ocrModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    populateVehicleForm(data) {
        const licensePlateInput = document.getElementById('licensePlate');
        const vinNumberInput = document.getElementById('vinNumber');
        
        if (licensePlateInput && data.licensePlate) {
            licensePlateInput.value = data.licensePlate;
            // Add animation to highlight the filled field
            licensePlateInput.classList.add('ring-2', 'ring-green-500');
            setTimeout(() => {
                licensePlateInput.classList.remove('ring-2', 'ring-green-500');
            }, 2000);
        }
        
        if (vinNumberInput && data.vinNumber) {
            vinNumberInput.value = data.vinNumber;
            // Add animation to highlight the filled field
            vinNumberInput.classList.add('ring-2', 'ring-green-500');
            setTimeout(() => {
                vinNumberInput.classList.remove('ring-2', 'ring-green-500');
            }, 2000);
        }
    }

    showManualForm() {
        const vehicleForm = document.getElementById('vehicleForm');
        if (vehicleForm) {
            vehicleForm.classList.remove('hidden');
        }
    }

    backToVehicleOptions() {
        const vehicleForm = document.getElementById('vehicleForm');
        if (vehicleForm) {
            vehicleForm.classList.add('hidden');
        }
    }

    // Toggle Foreign Vehicle Section
    toggleForeignVehicle() {
        const foreignSection = document.getElementById('foreignVehicleSection');
        if (foreignSection) {
            if (foreignSection.classList.contains('hidden')) {
                foreignSection.classList.remove('hidden');
            } else {
                foreignSection.classList.add('hidden');
            }
        }
    }

    // Reservation Modal
    openReservationModal() {
        const modal = document.getElementById('reservationModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadUserVehiclesForReservation();
        }
    }

    closeReservationModal() {
        const modal = document.getElementById('reservationModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    reserveStation(stationId) {
        this.selectedStationId = stationId;
        this.openReservationModal();
    }

    loadUserVehiclesForReservation() {
        const vehicleSelect = document.getElementById('vehicleSelect');
        if (!vehicleSelect) return;

        // Clear existing options
        vehicleSelect.innerHTML = '<option value="">Sélectionnez un véhicule</option>';

        // Load user vehicles
        this.loadUserVehicles().then(() => {
            this.vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.license_plate} - ${vehicle.type === 'foreign' ? 'Étranger' : 'France'}`;
                vehicleSelect.appendChild(option);
            });
        });
    }

    // UI Navigation Methods
    showOTPSection() {
        this.hideAllSections();
        const otpSection = document.getElementById('otpSection');
        if (otpSection) {
            otpSection.classList.remove('hidden');
            otpSection.style.display = 'flex';
        }
        
        // Show the OTP send form, hide verification form
        const otpSendForm = document.getElementById('otpSendForm');
        if (otpSendForm && otpSendForm.parentElement) {
            otpSendForm.parentElement.classList.remove('hidden');
        }
        
        const otpVerifySection = document.getElementById('otpVerifySection');
        if (otpVerifySection) {
            otpVerifySection.classList.add('hidden');
        }
    }

    showVehicleSection() {
        this.hideAllSections();
        const vehicleSection = document.getElementById('vehicleSection');
        if (vehicleSection) {
            vehicleSection.classList.remove('hidden');
            vehicleSection.style.display = 'block';
        }
    }

    showDashboard() {
        this.hideAllSections();
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
            dashboardSection.style.display = 'block';
        }
        
        this.loadUserVehicles();
        this.loadStations();
        this.loadUserReservations();
    }

    hideAllSections() {
        const sections = ['otpSection', 'vehicleSection', 'dashboardSection', 'otpVerifySection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('hidden');
                section.style.display = 'none';
            }
        });
    }

    // OTP Handling
    async handleSendOTP(e) {
        e.preventDefault();
        
        const contactInput = document.getElementById('contactInput');
        const contact = contactInput ? contactInput.value.trim() : '';
        
        if (!contact) {
            this.showToast('Veuillez entrer votre email', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contact: contact,
                    type: 'email'
                })
            });
            
            if (response.ok) {
                // Show verification form
                const otpSendFormParent = document.getElementById('otpSendForm')?.parentElement;
                if (otpSendFormParent) {
                    otpSendFormParent.classList.add('hidden');
                }
                
                const otpVerifySection = document.getElementById('otpVerifySection');
                if (otpVerifySection) {
                    otpVerifySection.classList.remove('hidden');
                    otpVerifySection.style.display = 'block';
                }
                
                const contactDisplay = document.getElementById('contactDisplay');
                if (contactDisplay) {
                    contactDisplay.textContent = contact;
                }
                
                // Start timer and clear inputs
                this.startOTPTimer();
                this.clearOTPInputs();
                
                this.showToast('Code envoyé avec succès!', 'success');
            } else {
                throw new Error('Erreur lors de l\'envoi du code');
            }
        } catch (error) {
            console.error('Erreur OTP:', error);
            this.showToast('Erreur lors de l\'envoi du code', 'error');
        }
    }

    async handleVerifyOTP(e) {
        e.preventDefault();
        
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length !== 6) {
            this.showToast('Veuillez entrer le code complet', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contact: document.getElementById('contactDisplay')?.textContent || '',
                    code: otp
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('teslaToken', result.token);
                localStorage.setItem('teslaUser', JSON.stringify(result.user));
                this.currentUser = result.user;
                
                // Check for pending vehicle data
                const pendingVehicle = localStorage.getItem('pendingVehicle');
                if (pendingVehicle) {
                    this.registerVehicle(JSON.parse(pendingVehicle));
                } else {
                    this.showDashboard();
                }
                
                this.showToast('Connexion réussie!', 'success');
            } else {
                throw new Error('Code invalide');
            }
        } catch (error) {
            console.error('Erreur vérification:', error);
            this.showToast('Code invalide', 'error');
        }
    }

    // Vehicle Handling
    async handleVehicleRegistration(e) {
        e.preventDefault();
        
        const licensePlate = document.getElementById('licensePlate')?.value.trim() || '';
        const vinNumber = document.getElementById('vinNumber')?.value.trim() || '';
        
        if (!licensePlate || !vinNumber) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        const vehicleData = {
            licensePlate,
            vinNumber,
            type: 'french'
        };
        
        await this.registerVehicle(vehicleData);
    }

    async handleForeignVehicleRegistration(e) {
        e.preventDefault();
        
        const licensePlate = document.getElementById('foreignLicensePlate')?.value.trim() || '';
        const vinNumber = document.getElementById('foreignVinNumber')?.value.trim() || '';
        const country = document.getElementById('country')?.value || '';
        
        if (!licensePlate || !vinNumber || !country) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        const vehicleData = {
            licensePlate,
            vinNumber,
            country,
            type: 'foreign'
        };
        
        await this.registerVehicle(vehicleData);
    }

    async registerVehicle(vehicleData) {
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                // Store vehicle data and redirect to OTP
                localStorage.setItem('pendingVehicle', JSON.stringify(vehicleData));
                this.showOTPSection();
                this.showToast('Veuillez vous identifier pour enregistrer le véhicule');
                return;
            }
            
            const response = await fetch(`${this.apiBase}/vehicles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    license_plate: vehicleData.licensePlate,
                    vin: vehicleData.vinNumber,
                    is_foreign: vehicleData.type === 'foreign',
                    country: vehicleData.country || null
                })
            });
            
            if (response.ok) {
                localStorage.removeItem('pendingVehicle');
                this.showDashboard();
                this.showToast('Véhicule enregistré avec succès!', 'success');
            } else {
                throw new Error('Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            console.error('Erreur véhicule:', error);
            this.showToast('Erreur lors de l\'enregistrement du véhicule', 'error');
        }
    }

    async loadUserVehicles() {
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) return;
            
            const response = await fetch(`${this.apiBase}/vehicles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const vehicles = await response.json();
                this.vehicles = vehicles;
                this.displayVehicles(vehicles);
            }
        } catch (error) {
            console.error('Erreur chargement véhicules:', error);
        }
    }

    displayVehicles(vehicles) {
        const vehicleInfo = document.getElementById('vehicleInfo');
        
        if (!vehicleInfo) return;
        
        if (vehicles.length === 0) {
            vehicleInfo.innerHTML = '<p class="text-gray-500 col-span-full">Aucun véhicule enregistré</p>';
            return;
        }
        
        vehicleInfo.innerHTML = vehicles.map(vehicle => `
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="tesla-red w-12 h-12 rounded-full flex items-center justify-center">
                            <i class="fas fa-car text-white"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-900">${vehicle.license_plate}</h4>
                            <p class="text-sm text-gray-500">${vehicle.is_foreign ? 'Étranger' : 'France'}</p>
                        </div>
                    </div>
                    <button class="text-red-600 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="text-sm text-gray-600">
                    <p>VIN: ${vehicle.vin}</p>
                    ${vehicle.country ? `<p>Pays: ${vehicle.country}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    async loadStations() {
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                // Load mock stations for demo
                this.displayMockStations();
                return;
            }
            
            const response = await fetch(`${this.apiBase}/stations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const stations = await response.json();
                this.stations = stations;
                this.displayStations(stations);
            } else {
                // Fallback to mock stations
                this.displayMockStations();
            }
        } catch (error) {
            console.error('Erreur chargement stations:', error);
            // Fallback to mock stations
            this.displayMockStations();
        }
    }

    displayMockStations() {
        const mockStations = [
            {
                id: 1,
                name: 'Paris - Bercy',
                address: '12 Rue de Bercy, 75012 Paris',
                available: true,
                power: 250,
                type: 'Rapide',
                price: 0.35
            },
            {
                id: 2,
                name: 'La Défense',
                address: '1 Place de la Défense, 92800 Puteaux',
                available: true,
                power: 150,
                type: 'Standard',
                price: 0.32
            },
            {
                id: 3,
                name: 'Lyon - Part-Dieu',
                address: '15 Rue du Département, 69003 Lyon',
                available: false,
                power: 150,
                type: 'Standard',
                price: 0.32
            }
        ];
        
        this.displayStations(mockStations);
    }

    displayStations(stations) {
        const stationsList = document.getElementById('stationsList');
        
        if (!stationsList) return;
        
        stationsList.innerHTML = stations.map(station => `
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="tesla-red w-12 h-12 rounded-full flex items-center justify-center">
                            <i class="fas fa-bolt text-white"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-900">${station.name}</h4>
                            <p class="text-sm text-gray-500">${station.address || station.location}</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${
                        station.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${station.available ? 'Disponible' : 'Occupé'}
                    </span>
                </div>
                <div class="text-sm text-gray-600 mb-4">
                    <p>Puissance: ${station.power} kW</p>
                    <p>Type: ${station.type}</p>
                    <p>Prix: €${station.price}/kWh</p>
                </div>
                <button onclick="reserveStation('${station.id}')" class="w-full tesla-red text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity ${!station.available ? 'opacity-50 cursor-not-allowed' : ''}" ${!station.available ? 'disabled' : ''}>
                    Réserver
                </button>
            </div>
        `).join('');
    }

    async handleReservation(e) {
        e.preventDefault();
        
        const stationSelect = document.getElementById('stationSelect');
        const vehicleSelect = document.getElementById('vehicleSelect');
        
        if (!stationSelect?.value || !vehicleSelect?.value) {
            this.showToast('Veuillez sélectionner une station et un véhicule', 'error');
            return;
        }
        
        try {
            const token = localStorage.getItem('teslaToken');
            
            const reservationData = {
                station_id: stationSelect.value,
                vehicle_id: vehicleSelect.value,
                date: new Date().toISOString().split('T')[0],
                start_time: '09:00',
                end_time: '10:00',
                charging_type: 'standard',
                estimated_price: 25.50
            };
            
            const response = await fetch(`${this.apiBase}/reservations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });
            
            if (response.ok) {
                this.closeReservationModal();
                this.showToast('Réservation effectuée avec succès!', 'success');
                this.loadUserReservations();
            } else {
                throw new Error('Erreur lors de la réservation');
            }
        } catch (error) {
            console.error('Erreur réservation:', error);
            this.showToast('Erreur lors de la réservation', 'error');
        }
    }

    async loadUserReservations() {
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) return;
            
            const response = await fetch(`${this.apiBase}/reservations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const reservations = await response.json();
                this.reservations = reservations;
                this.displayReservations(reservations);
            }
        } catch (error) {
            console.error('Erreur chargement réservations:', error);
        }
    }

    displayReservations(reservations) {
        const reservationsList = document.getElementById('reservationsList');
        
        if (!reservationsList) return;
        
        if (reservations.length === 0) {
            reservationsList.innerHTML = '<p class="text-gray-500">Aucune réservation</p>';
            return;
        }
        
        reservationsList.innerHTML = reservations.map(reservation => `
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h4 class="font-semibold text-gray-900">Réservation #${reservation.id}</h4>
                        <p class="text-sm text-gray-500">${reservation.date} - ${reservation.start_time} à ${reservation.end_time}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${reservation.status === 'confirmed' ? 'Confirmée' :
                         reservation.status === 'pending' ? 'En attente' :
                         'Terminée'}
                    </span>
                </div>
                <div class="text-sm text-gray-600">
                    <p>Station: ${reservation.station_name || 'Station #' + reservation.station_id}</p>
                    <p>Véhicule: ${reservation.vehicle_plate || 'Véhicule #' + reservation.vehicle_id}</p>
                    <p>Prix estimé: €${reservation.estimated_price}</p>
                </div>
            </div>
        `).join('');
    }

    // Authentication
    async checkAuthStatus() {
        const token = localStorage.getItem('teslaToken');
        const user = localStorage.getItem('teslaUser');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            
            const pendingVehicle = localStorage.getItem('pendingVehicle');
            if (pendingVehicle) {
                this.showVehicleSection();
            } else {
                this.showDashboard();
            }
        }
    }

    logout() {
        localStorage.removeItem('teslaToken');
        localStorage.removeItem('teslaUser');
        this.currentUser = null;
        this.showToast('Déconnexion réussie');
        this.showOTPSection();
    }

    // OTP Input handling
    handleOTPInput(e, index) {
        const input = e.target;
        const value = input.value;
        
        // Visual feedback - show dot when filled
        const dotId = `dot${index + 1}`;
        const dot = document.getElementById(dotId);
        if (dot) {
            if (value) {
                dot.classList.remove('hidden');
                input.classList.add('border-green-500', 'bg-green-50');
            } else {
                dot.classList.add('hidden');
                input.classList.remove('border-green-500', 'bg-green-50');
            }
        }
        
        if (value.length === 1) {
            // Move to next input
            const nextInput = input.parentElement.nextElementSibling?.querySelector('input');
            if (nextInput) {
                nextInput.focus();
            }
        } else if (value.length === 0 && e.inputType === 'deleteContentBackward') {
            // Move to previous input
            const prevInput = input.parentElement.previousElementSibling?.querySelector('input');
            if (prevInput) {
                prevInput.focus();
            }
        }
        
        // Check if all inputs are filled
        this.checkOTPComplete();
    }

    handleOTPKeydown(e, index) {
        if (e.key === 'Enter') {
            // Submit form
            const otpVerifyForm = document.getElementById('otpVerifyForm');
            if (otpVerifyForm) {
                otpVerifyForm.dispatchEvent(new Event('submit'));
            }
        } else if (e.key === 'Backspace' && e.target.value === '') {
            // Move to previous input
            const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
            if (prevInput) {
                prevInput.focus();
            }
        }
    }

    checkOTPComplete() {
        const otpInputs = document.querySelectorAll('.otp-input');
        const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
        
        if (allFilled) {
            // Auto-submit when all fields are filled
            setTimeout(() => {
                const otpVerifyForm = document.getElementById('otpVerifyForm');
                if (otpVerifyForm) {
                    otpVerifyForm.dispatchEvent(new Event('submit'));
                }
            }, 500);
        }
    }

    async resendOTP() {
        const contactDisplay = document.getElementById('contactDisplay');
        const contact = contactDisplay?.textContent || '';
        
        if (!contact) {
            this.showToast('Email non trouvé', 'error');
            return;
        }
        
        try {
            // Show loading state
            const resendBtn = event.target;
            const originalText = resendBtn.textContent;
            resendBtn.textContent = 'Envoi en cours...';
            resendBtn.disabled = true;
            
            const response = await fetch(`${this.apiBase}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contact: contact,
                    type: 'email'
                })
            });
            
            if (response.ok) {
                this.showToast('Code renvoyé avec succès!', 'success');
                this.startOTPTimer();
                this.clearOTPInputs();
            } else {
                throw new Error('Erreur lors du renvoi');
            }
        } catch (error) {
            console.error('Erreur renvoi OTP:', error);
            this.showToast('Erreur lors du renvoi du code', 'error');
        } finally {
            // Reset button state
            const resendBtn = event.target;
            resendBtn.textContent = originalText;
            resendBtn.disabled = false;
        }
    }

    startOTPTimer() {
        let timeLeft = 600; // 10 minutes in seconds
        const timerElement = document.getElementById('otpTimer');
        
        if (!timerElement) return;
        
        // Clear existing timer
        if (this.otpTimerInterval) {
            clearInterval(this.otpTimerInterval);
        }
        
        this.otpTimerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `Code valide pendant ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(this.otpTimerInterval);
                timerElement.textContent = 'Code expiré';
                timerElement.classList.add('text-red-600');
            }
            
            timeLeft--;
        }, 1000);
    }

    clearOTPInputs() {
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach((input, index) => {
            input.value = '';
            input.classList.remove('border-green-500', 'bg-green-50');
            const dotId = `dot${index + 1}`;
            const dot = document.getElementById(dotId);
            if (dot) {
                dot.classList.add('hidden');
            }
        });
        
        // Focus first input
        const firstInput = document.querySelector('.otp-input');
        if (firstInput) {
            firstInput.focus();
        }
    }

    backToOTPForm() {
        // Show OTP send form, hide verification form
        const otpSendForm = document.getElementById('otpSendForm');
        const otpVerifySection = document.getElementById('otpVerifySection');
        
        if (otpSendForm && otpSendForm.parentElement) {
            otpSendForm.parentElement.classList.remove('hidden');
        }
        
        if (otpVerifySection) {
            otpVerifySection.classList.add('hidden');
        }
        
        // Clear OTP inputs
        document.querySelectorAll('.otp-input').forEach(input => {
            input.value = '';
        });
        
        // Clear contact input
        const contactInput = document.getElementById('contactInput');
        if (contactInput) {
            contactInput.value = '';
            contactInput.focus();
        }
    }

    // Toast notifications
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;
        
        toastMessage.textContent = message;
        
        // Remove existing classes
        toast.className = toast.className.replace(/bg-\w+-\d+/g, '');
        
        // Add appropriate class
        if (type === 'error') {
            toast.classList.add('bg-red-500');
        } else if (type === 'warning') {
            toast.classList.add('bg-yellow-500');
        } else {
            toast.classList.add('bg-green-500');
        }
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TeslaChargeApp();
});
