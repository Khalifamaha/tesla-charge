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
        // Show Vehicle section first
        document.getElementById('otpSection').classList.add('hidden');
        document.getElementById('vehicleSection').classList.remove('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('otpVerifySection').classList.add('hidden');
        // Show vehicle options by default
        const vehicleForm = document.getElementById('vehicleForm');
        if (vehicleForm) {
            vehicleForm.classList.add('hidden');
        }
        
        this.setupEventListeners();
        this.checkAuthStatus();
        
        // Make methods globally accessible
        window.startOCRScanner = () => this.startOCRScanner();
        window.toggleForeignVehicle = () => this.toggleForeignVehicle();
        window.showManualForm = () => this.showManualForm();
        window.backToVehicleOptions = () => this.backToVehicleOptions();
        window.closeOCRScanner = () => this.closeOCRScanner();
    }

    setupEventListeners() {
        // OTP Forms
        document.getElementById('otpSendForm').addEventListener('submit', (e) => this.handleSendOTP(e));
        document.getElementById('otpVerifyForm').addEventListener('submit', (e) => this.handleVerifyOTP(e));
        
        // Vehicle Forms
        document.getElementById('vehicleForm').addEventListener('submit', (e) => this.handleVehicleRegistration(e));
        document.getElementById('foreignVehicleForm').addEventListener('submit', (e) => this.handleForeignVehicleRegistration(e));
        
        // Reservation Form
        document.getElementById('reservationForm').addEventListener('submit', (e) => this.handleReservation(e));
        
        // Station/Vehicle change listeners
        document.getElementById('stationSelect').addEventListener('change', (e) => this.updatePricing());
        document.getElementById('vehicleSelect').addEventListener('change', (e) => this.updatePricing());
        document.getElementById('startTime').addEventListener('change', (e) => this.updatePricing());
        document.getElementById('endTime').addEventListener('change', (e) => this.updatePricing());
        document.querySelectorAll('input[name="chargingType"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.updatePricing());
        });
        
        // Navigation
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
        
        // Make capture function globally accessible
        window.captureImage = () => {
            this.performCapture();
        };
    }
    
    performCapture() {
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
        
        // Stop any running camera streams
        const video = document.getElementById('scannerVideo');
        if (video && video.srcObject) {
            const stream = video.srcObject;
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }

    simulateOCRScan() {
        const scannerStatus = document.getElementById('scannerStatus');
        const scanLine = document.getElementById('scanLine');
        
        console.log('📹 Initialisation du scanner...');
        
        if (scannerStatus) {
            scannerStatus.textContent = 'Initialisation du scanner...';
        }
        
        // Check if we're on HTTPS (required for camera)
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            console.warn('⚠️ HTTPS requis pour la caméra, utilisation de la simulation');
            if (scannerStatus) {
                scannerStatus.textContent = 'HTTPS requis - Simulation activée';
            }
            setTimeout(() => {
                this.fallbackSimulation();
            }, 1000);
            return;
        }
        
        console.log('🔐 Sécurité vérifiée, tentative d\'accès caméra...');
        
        // Request camera access
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        })
        .then(stream => {
            console.log('✅ Caméra accessible!', stream);
            this.setupCameraStream(stream);
        })
        .catch(err => {
            console.error('❌ Erreur caméra:', err);
            console.log('📋 Détails de l\'erreur:', err.name, err.message);
            
            if (scannerStatus) {
                scannerStatus.textContent = `Erreur: ${err.message}`;
            }
            
            this.showToast(`Erreur caméra: ${err.message}`, 'error');
            
            // Fallback to simulation after delay
            setTimeout(() => {
                console.log('🔄 Activation de la simulation...');
                this.fallbackSimulation();
            }, 2000);
        });
    }
    
    setupCameraStream(stream) {
        const scannerStatus = document.getElementById('scannerStatus');
        const scanLine = document.getElementById('scanLine');
        
        console.log('🎥 Configuration du flux vidéo...');
        
        // Create video element
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.playsinline = true;
        
        // Add video to scanner modal
        const scannerContainer = document.querySelector('#ocrModal .relative');
        if (scannerContainer) {
            const existingContent = scannerContainer.querySelector('.bg-black');
            if (existingContent) {
                existingContent.innerHTML = `
                    <video id="scannerVideo" class="w-full aspect-[4/3] object-cover rounded-xl" autoplay playsinline></video>
                    <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl m-2"></div>
                        <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl m-2"></div>
                        <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl m-2"></div>
                        <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl m-2"></div>
                        <div id="scanLine" class="absolute w-full h-1 bg-red-500 scan-line"></div>
                        <div class="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm font-medium">
                            <p id="scannerStatus">Positionnez la carte grise dans le cadre</p>
                        </div>
                        <div class="absolute top-4 right-4">
                            <button onclick="captureImage()" class="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg">
                                <i class="fas fa-camera text-white text-xl"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                // Set video source
                const video = document.getElementById('scannerVideo');
                if (video) {
                    video.srcObject = stream;
                    video.play().then(() => {
                        console.log('▶️ Lecture vidéo démarrée');
                    }).catch(err => {
                        console.error('❌ Erreur lecture vidéo:', err);
                    });
                }
                
                if (scannerStatus) {
                    scannerStatus.textContent = 'Positionnez la carte grise dans le cadre';
                }
                
                if (scanLine) {
                    scanLine.classList.remove('hidden');
                }
                
                // Store stream for capture
                this.cameraStream = stream;
                
                // Make capture function globally accessible
                window.captureImage = () => {
                    this.captureImage();
                };
            }
        }
    }

    captureImage() {
        const scannerStatus = document.getElementById('scannerStatus');
        
        console.log('📸 Capture d\'image...');
        
        if (scannerStatus) {
            scannerStatus.textContent = 'Capture et analyse...';
        }
        
        // Use stored stream
        const stream = this.cameraStream;
        const video = document.getElementById('scannerVideo');
        
        if (!stream || !video) {
            console.error('❌ Flux vidéo non disponible');
            if (scannerStatus) {
                scannerStatus.textContent = 'Erreur: Flux vidéo non disponible';
            }
            return;
        }
        
        // Create canvas for capture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Stop camera
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        console.log('🔍 Analyse de l\'image...');
        
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

    fallbackSimulation() {
        const scannerStatus = document.getElementById('scannerStatus');
        const scanLine = document.getElementById('scanLine');
        
        if (scannerStatus) {
            scannerStatus.textContent = 'Simulation du scanner...';
        }
        
        if (scanLine) {
            scanLine.classList.remove('hidden');
        }
        
        setTimeout(() => {
            if (scannerStatus) {
                scannerStatus.textContent = 'Données extraites avec succès!';
            }
            
            const mockData = {
                licensePlate: 'AB-123-CD',
                vinNumber: '1HGCM82633A123456'
            };
            
            this.populateVehicleForm(mockData);
            
            setTimeout(() => {
                this.closeOCRScanner();
                this.showToast('Carte grise scannée avec succès!', 'success');
                
                if (scanLine) {
                    scanLine.classList.add('hidden');
                }
            }, 1500);
        }, 2000);
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

    showForeignVehicleSection() {
        this.hideAllSections();
        document.getElementById('foreignVehicleSection').classList.remove('hidden');
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
        document.getElementById('foreignVehicleSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
    }

    // Contact Type Switching
    switchContactType(type) {
        this.currentContactType = type;
        const emailTab = document.getElementById('emailTab');
        const phoneTab = document.getElementById('phoneTab');
        const contactInput = document.getElementById('contactInput');
        const contactLabel = document.getElementById('contactLabel');
        const contactIcon = document.getElementById('contactIcon');

        if (type === 'email') {
            emailTab.classList.add('bg-white', 'shadow-sm', 'text-gray-900');
            emailTab.classList.remove('text-gray-500', 'hover:text-gray-700');
            phoneTab.classList.remove('bg-white', 'shadow-sm', 'text-gray-900');
            phoneTab.classList.add('text-gray-500', 'hover:text-gray-700');
            
            contactInput.type = 'email';
            contactInput.placeholder = 'elon@tesla.com';
            contactLabel.textContent = 'Adresse Email';
            contactIcon.className = 'fas fa-envelope text-gray-400';
        } else {
            phoneTab.classList.add('bg-white', 'shadow-sm', 'text-gray-900');
            phoneTab.classList.remove('text-gray-500', 'hover:text-gray-700');
            emailTab.classList.remove('bg-white', 'shadow-sm', 'text-gray-900');
            emailTab.classList.add('text-gray-500', 'hover:text-gray-700');
            
            contactInput.type = 'tel';
            contactInput.placeholder = '+33 6 12 34 56 78';
            contactLabel.textContent = 'Numéro de téléphone';
            contactIcon.className = 'fas fa-phone text-gray-400';
        }
    }

    // OTP Handling
    async handleSendOTP(e) {
        e.preventDefault();
        
        const contact = document.getElementById('contactInput').value;
        
        if (!contact) {
            this.showToast('Veuillez remplir le champ', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    contact: contact.trim(),
                    type: this.currentContactType 
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Code envoyé avec succès!');
                document.getElementById('otpSendForm').parentElement.classList.add('hidden');
                document.getElementById('otpVerifySection').classList.remove('hidden');
                document.getElementById('contactDisplay').textContent = contact;
                this.focusFirstOTPInput();
            } else {
                this.showToast(data.error || 'Erreur lors de l\'envoi du code', 'error');
            }
        } catch (error) {
            console.error('OTP send error:', error);
            this.showToast('Erreur lors de l\'envoi du code', 'error');
        }
    }

    async handleVerifyOTP(e) {
        e.preventDefault();
        
        const otpInputs = document.querySelectorAll('.otp-input');
        const code = Array.from(otpInputs).map(input => input.value).join('');
        
        if (code.length !== 6) {
            this.showToast('Veuillez entrer le code complet à 6 chiffres', 'error');
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
                    code: code,
                    type: this.currentContactType 
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('teslaToken', data.token);
                localStorage.setItem('teslaUser', JSON.stringify(data.user));
                this.currentUser = data.user;
                this.showToast('Vérification réussie!');
                
                // Check if we have vehicle data stored from previous step
                const pendingVehicle = localStorage.getItem('pendingVehicle');
                if (pendingVehicle) {
                    const vehicleData = JSON.parse(pendingVehicle);
                    await this.registerVehicle(vehicleData);
                    localStorage.removeItem('pendingVehicle');
                } else {
                    this.showDashboard();
                }
            } else {
                this.showToast(data.error || 'Code invalide', 'error');
                this.clearOTPInputs();
                this.focusFirstOTPInput();
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            this.showToast('Erreur de vérification', 'error');
        }
    }

    handleOTPInput(e, index) {
        const input = e.target;
        if (input.value.length > 1) {
            input.value = input.value.slice(0, 1);
        }
        
        if (input.value && index < 5) {
            const nextInput = document.querySelectorAll('.otp-input')[index + 1];
            if (nextInput) nextInput.focus();
        }
    }

    handleOTPKeydown(e, index) {
        const input = e.target;
        if (e.key === 'Backspace' && !input.value && index > 0) {
            const prevInput = document.querySelectorAll('.otp-input')[index - 1];
            if (prevInput) prevInput.focus();
        }
    }

    focusFirstOTPInput() {
        const firstInput = document.querySelector('.otp-input');
        if (firstInput) firstInput.focus();
    }

    clearOTPInputs() {
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach(input => input.value = '');
    }

    // Vehicle Registration
    async handleVehicleRegistration(e) {
        e.preventDefault();
        
        const licensePlate = document.getElementById('licensePlate').value;
        const vinNumber = document.getElementById('vinNumber').value;
        
        if (!licensePlate || !vinNumber) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        // Store vehicle data and request user verification
        const vehicleData = {
            license_plate: licensePlate.toUpperCase(),
            vin: vinNumber.toUpperCase(),
            is_foreign: false,
            country: 'France'
        };
        
        localStorage.setItem('pendingVehicle', JSON.stringify(vehicleData));
        this.showOTPSection();
        this.showToast('Veuillez vous identifier pour enregistrer le véhicule');
    }

    async registerVehicle(vehicleData) {
        try {
            const token = localStorage.getItem('teslaToken');
            const response = await fetch(`${this.apiBase}/vehicles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(vehicleData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Véhicule enregistré avec succès!');
                this.showDashboard();
            } else {
                this.showToast(data.error || 'Erreur d\'enregistrement du véhicule', 'error');
            }
        } catch (error) {
            console.error('Vehicle registration error:', error);
            this.showToast('Erreur d\'enregistrement du véhicule', 'error');
        }
    }

    async handleForeignVehicleRegistration(e) {
        e.preventDefault();
        
        const country = document.getElementById('countrySelect').value;
        const licensePlate = document.getElementById('foreignLicensePlate').value;
        const vinNumber = document.getElementById('foreignVinNumber').value;
        
        if (!licensePlate || !vinNumber) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        // Store vehicle data and request user verification
        const vehicleData = {
            license_plate: licensePlate.toUpperCase(),
            vin: vinNumber.toUpperCase(),
            is_foreign: true,
            country: country,
            document_url: 'mock-document-url'
        };
        
        localStorage.setItem('pendingVehicle', JSON.stringify(vehicleData));
        this.showOTPSection();
        this.showToast('Veuillez vous identifier pour enregistrer le véhicule');
    }

    // OCR Scanner
    openOCRScanner() {
        document.getElementById('ocrModal').classList.remove('hidden');
    }

    closeOCRScanner() {
        document.getElementById('ocrModal').classList.add('hidden');
        document.getElementById('scanLine').classList.add('hidden');
        document.getElementById('scannerStatus').textContent = 'Placez la carte grise dans le cadre';
        document.getElementById('scanButton').disabled = false;
        document.getElementById('scanButton').innerHTML = '<i class="fas fa-camera mr-2"></i>Scanner';
    }

    async startOCRScan() {
        const scanButton = document.getElementById('scanButton');
        const scanLine = document.getElementById('scanLine');
        const scannerStatus = document.getElementById('scannerStatus');
        
        scanButton.disabled = true;
        scanButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyse...';
        scanLine.classList.remove('hidden');
        scannerStatus.textContent = 'Analyse en cours...';

        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                // Store OCR data and request authentication first
                const mockOCRData = {
                    license_plate: 'AB-123-CD',
                    vin: '5YJ3E7EA1J1234567'
                };
                
                setTimeout(() => {
                    const licensePlateInput = document.getElementById('licensePlate');
                    const vinNumberInput = document.getElementById('vinNumber');
                    
                    if (licensePlateInput && vinNumberInput) {
                        licensePlateInput.value = mockOCRData.license_plate;
                        vinNumberInput.value = mockOCRData.vin;
                        
                        this.closeOCRScanner();
                        this.showToast('Données extraites avec succès!');
                        this.showToast(`Immatriculation: ${mockOCRData.license_plate}, VIN: ${mockOCRData.vin}`);
                        this.showToast('Veuillez vous identifier pour finaliser l\'enregistrement');
                    } else {
                        this.showToast('Erreur: champs du formulaire non trouvés', 'error');
                    }
                }, 2000);
                return;
            }
            
            const response = await fetch(`${this.apiBase}/ocr-scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setTimeout(() => {
                    const licensePlateInput = document.getElementById('licensePlate');
                    const vinNumberInput = document.getElementById('vinNumber');
                    
                    if (licensePlateInput && vinNumberInput) {
                        licensePlateInput.value = data.data.license_plate;
                        vinNumberInput.value = data.data.vin;
                        
                        this.closeOCRScanner();
                        this.showToast('Données extraites avec succès!');
                        this.showToast(`Immatriculation: ${data.data.license_plate}, VIN: ${data.data.vin}`);
                    } else {
                        this.showToast('Erreur: champs du formulaire non trouvés', 'error');
                    }
                }, 2000);
            } else {
                this.showToast(data.error || 'Erreur lors du scan OCR', 'error');
                this.closeOCRScanner();
            }
        } catch (error) {
            console.error('OCR scan error:', error);
            this.showToast('Erreur lors du scan OCR', 'error');
            this.closeOCRScanner();
        }
    }

    // Navigation helpers
    openForeignVehicleForm() {
        this.showForeignVehicleSection();
    }

    backToVehicleForm() {
        this.showVehicleSection();
    }

    // Dashboard Methods
    async loadUserVehicles() {
        try {
            const token = localStorage.getItem('teslaToken');
            const response = await fetch(`${this.apiBase}/vehicles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.vehicles = await response.json();
                this.displayUserVehicles();
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
        }
    }

    displayUserVehicles() {
        const vehicleInfo = document.getElementById('vehicleInfo');
        vehicleInfo.innerHTML = '';

        if (this.vehicles.length === 0) {
            vehicleInfo.innerHTML = '<p class="text-gray-500 col-span-2">Aucun véhicule enregistré</p>';
            return;
        }

        this.vehicles.forEach(vehicle => {
            const vehicleCard = document.createElement('div');
            vehicleCard.className = 'bg-gray-50 p-4 rounded-lg';
            vehicleCard.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-gray-900">Tesla ${vehicle.is_foreign ? 'Étranger' : 'France'}</h4>
                    <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ${vehicle.status === 'verified' ? 'Vérifié' : 'En attente'}
                    </span>
                </div>
                <div class="space-y-1 text-sm">
                    <p><i class="fas fa-id-card mr-2 text-gray-400"></i><span class="font-mono">${vehicle.license_plate}</span></p>
                    <p><i class="fas fa-barcode mr-2 text-gray-400"></i><span class="font-mono text-xs">${vehicle.vin}</span></p>
                    ${vehicle.is_foreign ? `<p><i class="fas fa-globe mr-2 text-gray-400"></i>${vehicle.country}</p>` : ''}
                </div>
            `;
            vehicleInfo.appendChild(vehicleCard);
        });
    }

    async loadStations() {
        try {
            const token = localStorage.getItem('teslaToken');
            const response = await fetch(`${this.apiBase}/stations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.stations = await response.json();
                this.displayStations();
            }
        } catch (error) {
            console.error('Error loading stations:', error);
            this.showToast('Erreur lors du chargement des stations', 'error');
        }
    }

    displayStations() {
        const stationsList = document.getElementById('stationsList');
        stationsList.innerHTML = '';

        this.stations.forEach(station => {
            const stationCard = this.createStationCard(station);
            stationsList.innerHTML += stationCard;
        });
    }

    // Station Card HTML
    createStationCard(station) {
        const availabilityClass = station.available_slots > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const availabilityText = station.available_slots > 0 ? `${station.available_slots} disponibles` : 'Complet';
        const canReserve = station.available_slots > 0;
        
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${station.name}</h3>
                            <p class="text-sm text-gray-600 mt-1">${station.address}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${availabilityClass}">
                            ${availabilityText}
                        </span>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Bornes</span>
                            <span class="font-medium">${station.available_slots}/${station.total_slots}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Puissance</span>
                            <span class="font-medium">${station.power_kw} kW</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Prix</span>
                            <span class="font-medium">€${station.price_per_kwh}/kWh</span>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t">
                        <button 
                            onclick="app.openReservationModal(${station.id})"
                            class="w-full tesla-red text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity ${!canReserve ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${!canReserve ? 'disabled' : ''}>
                            ${canReserve ? 'Réserver maintenant' : 'Indisponible'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    logout() {
        localStorage.removeItem('teslaToken');
        localStorage.removeItem('teslaUser');
        this.currentUser = null;
        this.showToast('Déconnexion réussie');
        this.showOTPSection();
    }

    // Authentication
    async checkAuthStatus() {
        const token = localStorage.getItem('teslaToken');
        if (token) {
            try {
                const response = await fetch(`${this.apiBase}/stations`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const userData = JSON.parse(localStorage.getItem('teslaUser') || '{}');
                    this.currentUser = userData;
                    this.showDashboard();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        } else {
            // Check if there's pending vehicle data
            const pendingVehicle = localStorage.getItem('pendingVehicle');
            if (pendingVehicle) {
                this.showVehicleSection();
            } else {
                this.showOTPSection();
            }
        }
    }

    // Print Receipt Methods
    printReceipt() {
        try {
            const stationSelect = document.getElementById('stationSelect');
            const vehicleSelect = document.getElementById('vehicleSelect');
            const reservationDate = document.getElementById('reservationDate');
            const startTime = document.getElementById('startTime');
            const endTime = document.getElementById('endTime');
            const chargingType = document.querySelector('input[name="chargingType"]:checked');
            const totalPrice = document.getElementById('totalPrice');
            
            if (!stationSelect || !vehicleSelect || !reservationDate || !startTime || !endTime || !chargingType || !totalPrice) {
                this.showToast('Veuillez remplir tous les champs avant d\'imprimer', 'error');
                return;
            }
            
            if (!stationSelect.value || !vehicleSelect.value || !reservationDate.value || !startTime.value || !endTime.value) {
                this.showToast('Veuillez remplir tous les champs avant d\'imprimer', 'error');
                return;
            }
            
            const stationOption = stationSelect.options[stationSelect.selectedIndex];
            const vehicleOption = vehicleSelect.options[vehicleSelect.selectedIndex];
            
            const receiptData = {
                station: stationOption ? stationOption.textContent : 'Station non sélectionnée',
                vehicle: vehicleOption ? vehicleOption.textContent : 'Véhicule non sélectionné',
                date: new Date(reservationDate.value).toLocaleDateString('fr-FR'),
                startTime: startTime.value,
                endTime: endTime.value,
                chargingType: chargingType.value === 'super' ? 'Supercharge' : 'Standard',
                pricePerKwh: document.getElementById('pricePerKwh') ? document.getElementById('pricePerKwh').textContent : '€0.00',
                duration: document.getElementById('durationHours') ? document.getElementById('durationHours').textContent : '0h 0min',
                estimatedKwh: document.getElementById('estimatedKwh') ? document.getElementById('estimatedKwh').textContent : '0 kWh',
                totalPrice: totalPrice.textContent,
                reservationId: 'RES-' + Date.now(),
                createdAt: new Date().toLocaleString('fr-FR')
            };
            
            this.generateReceiptHTML(receiptData);
            const modal = document.getElementById('printReceiptModal');
            if (modal) {
                modal.classList.remove('hidden');
            } else {
                this.showToast('Erreur: modal de reçu non trouvé', 'error');
            }
        } catch (error) {
            console.error('Print receipt error:', error);
            this.showToast('Erreur lors de la génération du reçu', 'error');
        }
    }

    closePrintReceiptModal() {
        document.getElementById('printReceiptModal').classList.add('hidden');
    }

    generateReceiptHTML(data) {
        const receiptContent = document.getElementById('receiptContent');
        
        receiptContent.innerHTML = `
            <div class="text-center mb-6">
                <div class="tesla-red w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-bolt text-white text-2xl"></i>
                </div>
                <h4 class="text-lg font-bold text-gray-900">TeslaCharge</h4>
                <p class="text-sm text-gray-600">Reçu de Réservation</p>
            </div>
            
            <div class="border-t border-b py-4 space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Numéro de réservation:</span>
                    <span class="font-medium">${data.reservationId}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Date d'émission:</span>
                    <span class="font-medium">${data.createdAt}</span>
                </div>
            </div>
            
            <div class="py-4 space-y-3">
                <div class="space-y-2">
                    <h5 class="font-semibold text-gray-900">Détails de la Réservation</h5>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Station:</span>
                        <span class="font-medium">${data.station}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Véhicule:</span>
                        <span class="font-medium">${data.vehicle}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Date:</span>
                        <span class="font-medium">${data.date}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Heure de début:</span>
                        <span class="font-medium">${data.startTime}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Heure de fin:</span>
                        <span class="font-medium">${data.endTime}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Type de recharge:</span>
                        <span class="font-medium">${data.chargingType}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Durée estimée:</span>
                        <span class="font-medium">${data.duration}</span>
                    </div>
                </div>
                
                <div class="space-y-2 pt-3 border-t">
                    <h5 class="font-semibold text-gray-900">Détails du Prix</h5>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Prix au kWh:</span>
                        <span class="font-medium">${data.pricePerKwh}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Consommation estimée:</span>
                        <span class="font-medium">${data.estimatedKwh}</span>
                    </div>
                    <div class="flex justify-between text-sm font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span class="text-red-600">${data.totalPrice}</span>
                    </div>
                </div>
            </div>
            
            <div class="text-center pt-4 border-t">
                <p class="text-xs text-gray-500">Merci d'utiliser TeslaCharge</p>
                <p class="text-xs text-gray-500">www.tesla-charge.com</p>
            </div>
        `;
    }

    // Reservation Methods
    openReservationModal(stationId = null) {
        document.getElementById('reservationModal').classList.remove('hidden');
        this.loadReservationData(stationId);
        this.updatePricing();
    }

    closeReservationModal() {
        document.getElementById('reservationModal').classList.add('hidden');
        document.getElementById('reservationForm').reset();
    }

    async loadReservationData(stationId = null) {
        try {
            const token = localStorage.getItem('teslaToken');
            
            // Load stations
            const stationsResponse = await fetch(`${this.apiBase}/stations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const stations = await stationsResponse.json();
            
            const stationSelect = document.getElementById('stationSelect');
            stationSelect.innerHTML = '<option value="">Sélectionnez une station</option>';
            
            stations.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = `${station.name} - ${station.available_slots}/${station.total_slots} disponibles`;
                option.dataset.price = station.price_per_kwh;
                option.dataset.power = station.power_kw;
                stationSelect.appendChild(option);
            });
            
            // Load user vehicles
            const vehiclesResponse = await fetch(`${this.apiBase}/vehicles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const vehicles = await vehiclesResponse.json();
            
            const vehicleSelect = document.getElementById('vehicleSelect');
            vehicleSelect.innerHTML = '<option value="">Sélectionnez un véhicule</option>';
            
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.license_plate} - ${vehicle.vin}`;
                vehicleSelect.appendChild(option);
            });
            
            // Set default values
            const today = new Date();
            document.getElementById('reservationDate').valueAsDate = today;
            document.getElementById('reservationDate').min = today.toISOString().split('T')[0];
            
            // Pre-select station if provided
            if (stationId) {
                stationSelect.value = stationId;
            }
            
        } catch (error) {
            console.error('Error loading reservation data:', error);
            this.showToast('Erreur lors du chargement des données', 'error');
        }
    }

    updatePricing() {
        const stationSelect = document.getElementById('stationSelect');
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const chargingType = document.querySelector('input[name="chargingType"]:checked').value;
        
        if (!stationSelect.value || !startTime || !endTime) {
            this.resetPricing();
            return;
        }
        
        const selectedOption = stationSelect.options[stationSelect.selectedIndex];
        const pricePerKwh = parseFloat(selectedOption.dataset.price) || 0.35;
        const powerKw = parseInt(selectedOption.dataset.power) || 150;
        
        // Calculate duration
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        let durationMs = end - start;
        
        if (durationMs < 0) {
            durationMs += 24 * 60 * 60 * 1000; // Add 24 hours if negative
        }
        
        const durationHours = durationMs / (1000 * 60 * 60);
        const durationMinutes = Math.round((durationHours - Math.floor(durationHours)) * 60);
        
        // Calculate estimated kWh based on charging type and duration
        let estimatedKwh = 0;
        if (chargingType === 'super') {
            estimatedKwh = Math.min(250 * durationHours, 500); // Max 500kWh for supercharge
        } else {
            estimatedKwh = Math.min(150 * durationHours, 300); // Max 300kWh for standard
        }
        
        const totalPrice = estimatedKwh * pricePerKwh;
        
        // Update UI
        document.getElementById('pricePerKwh').textContent = `€${pricePerKwh.toFixed(2)}`;
        document.getElementById('durationHours').textContent = `${Math.floor(durationHours)}h ${durationMinutes}min`;
        document.getElementById('estimatedDuration').textContent = `${Math.floor(durationHours)}h ${durationMinutes}min`;
        document.getElementById('estimatedKwh').textContent = `${estimatedKwh.toFixed(1)} kWh`;
        document.getElementById('totalPrice').textContent = `€${totalPrice.toFixed(2)}`;
    }

    resetPricing() {
        document.getElementById('pricePerKwh').textContent = '€0.00';
        document.getElementById('durationHours').textContent = '0h 0min';
        document.getElementById('estimatedDuration').textContent = '--';
        document.getElementById('estimatedKwh').textContent = '0 kWh';
        document.getElementById('totalPrice').textContent = '€0.00';
    }

    async handleReservation(e) {
        try {
            e.preventDefault();
            
            const stationSelect = document.getElementById('stationSelect');
            const vehicleSelect = document.getElementById('vehicleSelect');
            const reservationDate = document.getElementById('reservationDate');
            const startTime = document.getElementById('startTime');
            const endTime = document.getElementById('endTime');
            const chargingType = document.querySelector('input[name="chargingType"]:checked');
            const totalPrice = document.getElementById('totalPrice');
            
            // Validate all required elements exist
            if (!stationSelect || !vehicleSelect || !reservationDate || !startTime || !endTime || !chargingType || !totalPrice) {
                this.showToast('Erreur: Formulaire incomplet', 'error');
                return;
            }
            
            // Validate all required fields are filled
            if (!stationSelect.value || !vehicleSelect.value || !reservationDate.value || !startTime.value || !endTime.value) {
                this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }
            
            const formData = {
                station_id: stationSelect.value,
                vehicle_id: vehicleSelect.value,
                date: reservationDate.value,
                start_time: startTime.value,
                end_time: endTime.value,
                charging_type: chargingType.value,
                estimated_price: totalPrice.textContent
            };
            
            console.log('Reservation data:', formData);
            
            const token = localStorage.getItem('teslaToken');
            if (!token) {
                this.showToast('Erreur: Vous n\'êtes pas connecté', 'error');
                return;
            }
            
            const response = await fetch(`${this.apiBase}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showToast('Réservation créée avec succès!');
                this.closeReservationModal();
                // Refresh dashboard if it exists
                if (typeof this.loadDashboard === 'function') {
                    this.loadDashboard();
                }
            } else {
                console.error('Reservation error response:', data);
                this.showToast(data.error || 'Erreur lors de la réservation', 'error');
            }
        } catch (error) {
            console.error('Reservation error:', error);
            this.showToast('Erreur lors de la réservation: ' + error.message, 'error');
        }
    }

    // Utility Methods
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-in ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Global functions for onclick handlers
function switchContactType(type) {
    app.switchContactType(type);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TeslaChargeApp();
});
