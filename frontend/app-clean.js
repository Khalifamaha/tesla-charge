class TeslaChargeApp {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.currentUser = null;
        this.currentContactType = 'email';
        this.stations = [];
        this.vehicles = [];
        
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
        
        console.log('🎯 Initialisation terminée');
    }

    setupEventListeners() {
        // OTP Forms
        document.getElementById('otpSendForm').addEventListener('submit', (e) => this.handleSendOTP(e));
        document.getElementById('otpVerifyForm').addEventListener('submit', (e) => this.handleVerifyOTP(e));
        
        // Vehicle Forms
        document.getElementById('manualVehicleForm').addEventListener('submit', (e) => this.handleVehicleRegistration(e));
        document.getElementById('foreignVehicleForm').addEventListener('submit', (e) => this.handleForeignVehicleRegistration(e));
        
        // Dashboard
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
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

    // Toggle Foreign Vehicle Section
    toggleForeignVehicle() {
        const foreignSection = document.getElementById('foreignVehicleSection');
        if (foreignSection.classList.contains('hidden')) {
            foreignSection.classList.remove('hidden');
        } else {
            foreignSection.classList.add('hidden');
        }
    }

    // UI Navigation Methods
    showOTPSection() {
        this.hideAllSections();
        document.getElementById('otpSection').classList.remove('hidden');
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
        document.getElementById('vehicleSection').classList.remove('hidden');
    }

    showDashboard() {
        this.hideAllSections();
        document.getElementById('dashboardSection').classList.remove('hidden');
        this.loadUserVehicles();
        this.loadStations();
    }

    hideAllSections() {
        document.getElementById('otpSection').classList.add('hidden');
        document.getElementById('vehicleSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('otpVerifySection').classList.add('hidden');
    }

    // OTP Handling
    async handleSendOTP(e) {
        e.preventDefault();
        
        const contactInput = document.getElementById('contactInput');
        const contact = contactInput.value.trim();
        
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
                document.getElementById('otpSendForm').parentElement.classList.add('hidden');
                document.getElementById('otpVerifySection').classList.remove('hidden');
                document.getElementById('contactDisplay').textContent = contact;
                
                // Clear OTP inputs
                document.querySelectorAll('.otp-input').forEach(input => {
                    input.value = '';
                });
                document.querySelector('.otp-input').focus();
                
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
                    contact: document.getElementById('contactDisplay').textContent,
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
        
        const licensePlate = document.getElementById('licensePlate').value.trim();
        const vinNumber = document.getElementById('vinNumber').value.trim();
        
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
        
        const licensePlate = document.getElementById('foreignLicensePlate').value.trim();
        const vinNumber = document.getElementById('foreignVinNumber').value.trim();
        const country = document.getElementById('country').value;
        
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
                body: JSON.stringify(vehicleData)
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
                            <h4 class="font-semibold text-gray-900">${vehicle.licensePlate}</h4>
                            <p class="text-sm text-gray-500">${vehicle.type === 'foreign' ? 'Étranger' : 'France'}</p>
                        </div>
                    </div>
                    <button class="text-red-600 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="text-sm text-gray-600">
                    <p>VIN: ${vehicle.vinNumber}</p>
                    ${vehicle.country ? `<p>Pays: ${vehicle.country}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    async loadStations() {
        try {
            const response = await fetch(`${this.apiBase}/stations`);
            
            if (response.ok) {
                const stations = await response.json();
                this.displayStations(stations);
            }
        } catch (error) {
            console.error('Erreur chargement stations:', error);
        }
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
                            <p class="text-sm text-gray-500">${station.location}</p>
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
                </div>
                <button onclick="reserveStation('${station.id}')" class="w-full tesla-red text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Réserver
                </button>
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
        this.showVehicleSection();
    }

    // OTP Input handling
    handleOTPInput(e, index) {
        const input = e.target;
        const value = input.value;
        
        if (value.length === 1) {
            // Move to next input
            const nextInput = input.parentElement.children[index + 1];
            if (nextInput && nextInput.tagName === 'INPUT') {
                nextInput.focus();
            }
        } else if (value.length === 0 && e.inputType === 'deleteContentBackward') {
            // Move to previous input
            const prevInput = input.parentElement.children[index - 1];
            if (prevInput && prevInput.tagName === 'INPUT') {
                prevInput.focus();
            }
        }
    }

    handleOTPKeydown(e, index) {
        if (e.key === 'Enter') {
            // Submit form
            document.getElementById('otpVerifyForm').dispatchEvent(new Event('submit'));
        } else if (e.key === 'Backspace' && e.target.value === '') {
            // Move to previous input
            const prevInput = e.target.parentElement.children[index - 1];
            if (prevInput && prevInput.tagName === 'INPUT') {
                prevInput.focus();
            }
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
