class TeslaChargeApp {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.currentUser = null;
        this.currentContactType = 'email';
        this.stations = [];
        this.vehicles = [];
        this.reservations = [];
        this.otpTimerInterval = null;
        
        this.init();
    }

    init() {
        console.log('🚀 Initialisation de TeslaCharge App...');
        
        // Show Vehicle section first
        this.showVehicleSection();
        
        this.setupEventListeners();
        this.checkAuthStatus();
        
        // Make methods globally accessible
        window.app = this;
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
        window.updateRecapitulatif = () => this.updateRecapitulatif();
        window.toggleForeignVehicleForm = () => this.toggleForeignVehicleForm();
        
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
        
        // Add event listeners for real-time recapitulatif updates
        const stationSelect = document.getElementById('stationSelect');
        const vehicleSelect = document.getElementById('vehicleSelect');
        const reservationDate = document.getElementById('reservationDate');
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        const chargingType = document.getElementById('chargingType');
        
        if (stationSelect) {
            stationSelect.addEventListener('change', () => this.updateRecapitulatif());
        }
        if (vehicleSelect) {
            vehicleSelect.addEventListener('change', () => this.updateRecapitulatif());
        }
        if (reservationDate) {
            reservationDate.addEventListener('change', () => this.updateRecapitulatif());
        }
        if (startTime) {
            startTime.addEventListener('change', () => this.updateRecapitulatif());
        }
        if (endTime) {
            endTime.addEventListener('change', () => this.updateRecapitulatif());
        }
        if (chargingType) {
            chargingType.addEventListener('change', () => this.updateRecapitulatif());
        }
        
        // Foreign Vehicle Form
        const addForeignVehicleForm = document.getElementById('addForeignVehicleForm');
        if (addForeignVehicleForm) {
            addForeignVehicleForm.addEventListener('submit', (e) => this.handleAddForeignVehicle(e));
        }
        
        // OTP Input handling
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => this.handleOTPInput(e, index));
            input.addEventListener('keydown', (e) => this.handleOTPKeydown(e, index));
        });
    }

    // UI Navigation Methods
    showOTPSection() {
        console.log('📧 Affichage de la section OTP...');
        
        this.hideAllSections();
        
        const otpSection = document.getElementById('otpSection');
        if (otpSection) {
            otpSection.classList.remove('hidden');
            otpSection.style.display = 'flex';
        }
        
        // Show send form, hide verify form
        const sendContainer = document.getElementById('otpSendContainer');
        const verifyContainer = document.getElementById('otpVerifyContainer');
        
        if (sendContainer) {
            sendContainer.classList.remove('hidden');
        }
        
        if (verifyContainer) {
            verifyContainer.classList.add('hidden');
        }
        
        console.log('✅ Section OTP affichée');
    }

    showOTPVerifySection() {
        console.log('🔢 Affichage de la section vérification OTP...');
        
        const sendContainer = document.getElementById('otpSendContainer');
        const verifyContainer = document.getElementById('otpVerifyContainer');
        
        if (sendContainer) {
            sendContainer.classList.add('hidden');
        }
        
        if (verifyContainer) {
            verifyContainer.classList.remove('hidden');
        }
        
        console.log('✅ Section vérification OTP affichée');
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
        const sections = ['otpSection', 'vehicleSection', 'dashboardSection'];
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
                const contactDisplay = document.getElementById('contactDisplay');
                if (contactDisplay) {
                    contactDisplay.textContent = contact;
                }
                
                this.showOTPVerifySection();
                this.startOTPTimer();
                this.clearOTPInputs();
                
                this.showToast('Code envoyé avec succès!', 'success');
            } else {
                throw new Error('Erreur lors de l\'envoi du code');
            }
        } catch (error) {
            console.error('❌ Erreur OTP détaillée:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                contact: contact,
                timestamp: new Date().toISOString()
            });
            
            // Show specific error messages
            if (error.message.includes('Failed to fetch')) {
                this.showToast('Erreur de connexion au serveur', 'error');
            } else if (error.message.includes('Network')) {
                this.showToast('Erreur réseau', 'error');
            } else {
                this.showToast('Erreur lors de l\'envoi du code', 'error');
            }
        }
    }

    async handleVerifyOTP(e) {
        e.preventDefault();
        
        console.log('🔍 Début de la vérification OTP...');
        
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        console.log(`📋 Code OTP saisi: "${otp}"`);
        console.log(`📋 Longueur du code: ${otp.length}`);
        
        if (otp.length !== 6) {
            console.log('❌ Code incomplet');
            this.showToast('Veuillez entrer le code complet', 'error');
            return;
        }
        
        const contactDisplay = document.getElementById('contactDisplay');
        const contact = contactDisplay?.textContent || '';
        
        console.log(`📧 Email de contact: "${contact}"`);
        
        try {
            console.log('📡 Envoi de la requête de vérification...');
            
            const response = await fetch(`${this.apiBase}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contact: contact,
                    code: otp,
                    type: 'email'
                })
            });
            
            console.log(`📡 Status de la réponse: ${response.status}`);
            
            if (response.ok) {
                console.log('✅ Réponse OK, traitement des données...');
                const result = await response.json();
                console.log('📋 Données reçues:', result);
                
                localStorage.setItem('teslaToken', result.token);
                localStorage.setItem('teslaUser', JSON.stringify(result.user));
                this.currentUser = result.user;
                
                // Check for pending vehicle data
                const pendingVehicle = localStorage.getItem('pendingVehicle');
                if (pendingVehicle) {
                    console.log('🚗 Véhicule en attente trouvé, enregistrement...');
                    await this.registerVehicle(JSON.parse(pendingVehicle));
                    localStorage.removeItem('pendingVehicle');
                } else {
                    console.log('📊 Affichage du dashboard');
                    this.showDashboard();
                }
                
                this.showToast('Connexion réussie!', 'success');
            } else {
                console.log('❌ Réponse non OK');
                const errorText = await response.text();
                console.log('📋 Erreur serveur:', errorText);
                throw new Error(`Code invalide: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Erreur vérification OTP détaillée:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                contact: contact,
                otp: otp,
                timestamp: new Date().toISOString()
            });
            
            // Show specific error messages
            if (error.message.includes('Failed to fetch')) {
                this.showToast('Erreur de connexion au serveur', 'error');
            } else if (error.message.includes('Network')) {
                this.showToast('Erreur réseau', 'error');
            } else if (error.message.includes('Code invalide')) {
                this.showToast('Code OTP invalide', 'error');
            } else if (error.message.includes('expired')) {
                this.showToast('Code OTP expiré', 'error');
            } else {
                this.showToast(`Erreur: ${error.message}`, 'error');
            }
            
            // Clear OTP inputs on error
            this.clearOTPInputs();
        }
    }

    // OTP Input handling
    handleOTPInput(e, index) {
        const input = e.target;
        const value = input.value;
        
        console.log(`🔢 Champ ${index + 1}: "${value}"`);
        
        // Visual feedback - show dot when filled
        const dot = document.querySelector(`[data-dot="${index}"]`);
        if (dot) {
            if (value) {
                dot.classList.remove('hidden');
                input.classList.add('otp-input-filled');
            } else {
                dot.classList.add('hidden');
                input.classList.remove('otp-input-filled');
            }
        }
        
        if (value.length === 1) {
            // Move to next input
            const nextInput = document.querySelector(`[data-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        } else if (value.length === 0 && e.inputType === 'deleteContentBackward') {
            // Move to previous input
            const prevInput = document.querySelector(`[data-index="${index - 1}"]`);
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
            const prevInput = document.querySelector(`[data-index="${index - 1}"]`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    }

    checkOTPComplete() {
        const otpInputs = document.querySelectorAll('.otp-input');
        const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
        
        console.log(`🔍 Vérification complète: ${allFilled}`);
        console.log(`📋 Nombre de champs: ${otpInputs.length}`);
        console.log(`📋 Champs remplis: ${Array.from(otpInputs).map(input => input.value).join(',')}`);
        
        if (allFilled) {
            console.log('🚀 Auto-soumission du formulaire OTP dans 500ms...');
            // Auto-submit when all fields are filled
            setTimeout(() => {
                const otpVerifyForm = document.getElementById('otpVerifyForm');
                if (otpVerifyForm) {
                    console.log('📤 Soumission automatique du formulaire');
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
        
        console.log('⏱️ Démarrage du timer OTP');
        
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
            input.classList.remove('otp-input-filled');
            const dot = document.querySelector(`[data-dot="${index}"]`);
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
        console.log('🔙 Retour au formulaire OTP');
        
        // Show send form, hide verification form
        const sendContainer = document.getElementById('otpSendContainer');
        const verifyContainer = document.getElementById('otpVerifyContainer');
        
        if (sendContainer) {
            sendContainer.classList.remove('hidden');
        }
        
        if (verifyContainer) {
            verifyContainer.classList.add('hidden');
        }
        
        // Clear OTP inputs
        this.clearOTPInputs();
        
        // Clear timer
        if (this.otpTimerInterval) {
            clearInterval(this.otpTimerInterval);
        }
        
        // Clear contact input
        const contactInput = document.getElementById('contactInput');
        if (contactInput) {
            contactInput.value = '';
            contactInput.focus();
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
        
        console.log('🚗 Enregistrement du véhicule français...');
        console.log(`📋 Plaque: ${licensePlate}`);
        console.log(`📋 VIN: ${vinNumber}`);
        
        const vehicleData = {
            licensePlate,
            vinNumber,
            type: 'french'
        };
        
        // Store vehicle data and redirect to OTP
        localStorage.setItem('pendingVehicle', JSON.stringify(vehicleData));
        this.showOTPSection();
        this.showToast('Veuillez vous identifier pour enregistrer le véhicule', 'info');
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
        
        console.log('🌍 Enregistrement du véhicule étranger...');
        console.log(`📋 Plaque: ${licensePlate}`);
        console.log(`📋 VIN: ${vinNumber}`);
        console.log(`📋 Pays: ${country}`);
        
        const vehicleData = {
            licensePlate,
            vinNumber,
            country,
            type: 'foreign'
        };
        
        // Store vehicle data and redirect to OTP
        localStorage.setItem('pendingVehicle', JSON.stringify(vehicleData));
        this.showOTPSection();
        this.showToast('Veuillez vous identifier pour enregistrer le véhicule', 'info');
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
        modal.style.display = 'flex';
        
        // Always use visual simulation for localhost development
        console.log('📷 Développement localhost - utilisation de la simulation visuelle');
        this.showToast('Mode simulation activé (développement)', 'info');
        this.startVisualSimulation();
    }
    
    async startRealCamera() {
        console.log('📷 Démarrage de la caméra réelle...');
        
        // Check if we're in HTTPS context
        const isSecureContext = window.isSecureContext || window.location.protocol === 'https:';
        console.log(`🔒 Contexte sécurisé: ${isSecureContext}`);
        
        if (!isSecureContext) {
            console.warn('⚠️ Accès caméra nécessite HTTPS - utilisation de la simulation');
            this.showToast('Pour utiliser la caméra, veuillez utiliser HTTPS', 'warning');
            this.startVisualSimulation();
            return;
        }
        
        try {
            console.log('📡 Demande d\'accès à la caméra...');
            
            // Request camera access with better error handling
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingEnvironment: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            
            console.log('✅ Caméra accessible!');
            
            // Create video element
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            
            // Create canvas for image capture
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            
            // Update modal with real camera feed
            this.updateModalWithRealCamera(videoElement, canvas);
            
            // Store stream for later use
            this.cameraStream = stream;
            
        } catch (error) {
            console.error('❌ Erreur caméra:', error);
            console.log('📷 Détail de l\'erreur:', error.name, error.message);
            
            // Handle specific camera errors
            if (error.name === 'NotAllowedError') {
                this.showToast('Permission caméra refusée. Veuillez autoriser l\'accès dans les paramètres.', 'error');
            } else if (error.name === 'NotFoundError') {
                this.showToast('Aucune caméra trouvée sur cet appareil.', 'error');
            } else if (error.name === 'NotReadableError') {
                this.showToast('Caméra déjà utilisée par une autre application.', 'error');
            } else if (error.name === 'OverconstrainedError') {
                this.showToast('Contraintes caméra non satisfaites.', 'error');
            } else {
                console.log('📷 Utilisation de la simulation visuelle...');
                this.showToast('Erreur caméra, utilisation de la simulation', 'warning');
                this.startVisualSimulation();
            }
        }
    }
    
    updateModalWithRealCamera(videoElement, canvas) {
        const scannerContainer = document.querySelector('#ocrModal .relative');
        if (!scannerContainer) return;
        
        const existingContent = scannerContainer.querySelector('.bg-black');
        if (existingContent) {
            existingContent.innerHTML = `
                <div class="relative w-full aspect-[4/3] border-2 border-white/50 rounded-xl overflow-hidden bg-black">
                    <video id="cameraVideo" class="w-full h-full object-cover" autoplay playsinline></video>
                    <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div class="absolute inset-0 border-2 border-green-500 rounded-xl m-8"></div>
                        <div class="absolute top-4 left-4 right-4 bottom-4 text-white text-center">
                            <div class="bg-black/70 backdrop-blur-sm rounded-lg p-4 max-w-sm">
                                <p class="text-sm font-medium mb-2">📷 Positionnez la carte grise</p>
                                <p class="text-xs opacity-75">Assurez-vous que le texte est lisible et bien éclairé</p>
                            </div>
                        </div>
                    </div>
                    <div class="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm font-medium">
                        <p id="scannerStatus">Caméra active - Positionnez la carte</p>
                    </div>
                    <div class="absolute top-4 right-4">
                        <button onclick="captureImage()" class="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg">
                            <i class="fas fa-camera text-white text-xl"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Add video element to container
            const videoContainer = existingContent.querySelector('.relative');
            if (videoContainer && videoElement) {
                videoContainer.appendChild(videoElement);
            }
        }
        
        // Make capture function globally accessible
        window.captureImage = () => {
            this.captureRealImage(canvas);
        };
    }
    
    async captureRealImage(canvas) {
        const videoElement = document.getElementById('cameraVideo');
        const scannerStatus = document.getElementById('scannerStatus');
        
        if (!videoElement || !canvas) {
            console.error('❌ Éléments vidéo ou canvas non trouvés');
            return;
        }
        
        console.log('📸 Capture de l\'image...');
        
        if (scannerStatus) {
            scannerStatus.textContent = 'Capture et analyse...';
        }
        
        // Visual feedback
        const videoContainer = document.querySelector('#ocrModal .relative .bg-black');
        if (videoContainer) {
            videoContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            setTimeout(() => {
                videoContainer.style.backgroundColor = '';
            }, 200);
        }
        
        // Draw video frame to canvas
        const context = canvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob(async (blob) => {
            console.log('📸 Image capturée, envoi pour OCR...');
            
            // Here you would normally send to OCR service
            // For demo, we'll simulate OCR processing
            setTimeout(() => {
                if (scannerStatus) {
                    scannerStatus.textContent = 'Analyse OCR en cours...';
                }
                
                // Simulate OCR results
                setTimeout(() => {
                    const mockData = {
                        licensePlate: this.extractLicensePlate(context, canvas),
                        vinNumber: this.extractVIN(context, canvas)
                    };
                    
                    console.log('✅ Données OCR extraites:', mockData);
                    
                    // Fill form
                    this.populateVehicleForm(mockData);
                    
                    if (scannerStatus) {
                        scannerStatus.textContent = 'Données extraites avec succès!';
                    }
                    
                    setTimeout(() => {
                        this.closeOCRScanner();
                        this.showToast('Carte grise scannée avec succès!', 'success');
                    }, 1500);
                }, 2000);
            }, 1000);
        }, 'image/jpeg', 0.8);
    }
    
    extractLicensePlate(context, canvas) {
        // Simulate license plate extraction
        const plates = ['AB-123-CD', 'XY-987-ZT', 'DE-AB-1234', 'IT-A12345'];
        return plates[Math.floor(Math.random() * plates.length)];
    }
    
    extractVIN(context, canvas) {
        // Simulate VIN extraction
        const vins = ['1HGCM82633A123456', 'WBA1A123456789012', 'JTDKB20U123456', 'VF1ABC1A123456'];
        return vins[Math.floor(Math.random() * vins.length)];
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
                            <button onclick="window.app.captureSimulatedImage()" class="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg">
                                <i class="fas fa-camera text-white text-xl"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        
        // Simulate scanning process
        setTimeout(() => {
            const status = document.getElementById('scannerStatus');
            if (status) {
                status.textContent = 'Analyse en cours...';
            }
        }, 1000);
        
        setTimeout(() => {
            const status = document.getElementById('scannerStatus');
            if (status) {
                status.textContent = 'Prêt pour la capture';
            }
        }, 2000);
    }
    
    captureSimulatedImage() {
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
                licensePlate: this.extractLicensePlate(),
                vinNumber: this.extractVIN()
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
    
    extractLicensePlate() {
        // Simulate license plate extraction
        const plates = ['AB-123-CD', 'XY-987-ZT', 'DE-AB-1234', 'IT-A12345'];
        return plates[Math.floor(Math.random() * plates.length)];
    }
    
    extractVIN() {
        // Simulate VIN extraction
        const vins = ['1HGCM82633A123456', 'WBA1A123456789012', 'JTDKB20U123456', 'VF1ABC1A123456'];
        return vins[Math.floor(Math.random() * vins.length)];
    }

    closeOCRScanner() {
        console.log('🔒 Fermeture du scanner OCR...');
        const modal = document.getElementById('ocrModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
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

    // Other methods
    toggleForeignVehicle() {
        const foreignSection = document.getElementById('foreignVehicleSection');
        if (foreignSection) {
            foreignSection.classList.toggle('hidden');
        }
    }

    showManualForm() {
        this.showToast('Formulaire manuel en développement', 'info');
    }

    backToVehicleOptions() {
        this.showToast('Retour en développement', 'info');
    }

    // Authentication
    async checkAuthStatus() {
        const token = localStorage.getItem('teslaToken');
        const user = localStorage.getItem('teslaUser');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            this.showDashboard();
        }
    }

    logout() {
        localStorage.removeItem('teslaToken');
        localStorage.removeItem('teslaUser');
        this.currentUser = null;
        this.showToast('Déconnexion réussie');
        this.showOTPSection();
    }

    // Reservation Methods - COMPLETE IMPLEMENTATION
    async handleReservation(e) {
        e.preventDefault();
        
        console.log('🎫 Début de la réservation...');
        
        const stationSelect = document.getElementById('stationSelect');
        const vehicleSelect = document.getElementById('vehicleSelect');
        const reservationDate = document.getElementById('reservationDate');
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        const chargingType = document.getElementById('chargingType');
        
        if (!stationSelect?.value || !vehicleSelect?.value || !reservationDate?.value || !startTime?.value || !endTime?.value || !chargingType?.value) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                console.log('❌ Token non trouvé, redirection vers OTP');
                this.showOTPSection();
                return;
            }
            
            console.log('📡 Envoi de la requête de réservation...');
            
            // Calculate duration and estimated price
            const start = new Date(`2000-01-01T${startTime.value}`);
            const end = new Date(`2000-01-01T${endTime.value}`);
            const duration = (end - start) / (1000 * 60 * 60); // in hours
            
            const prices = {
                'standard': 0.32,
                'rapide': 0.45,
                'ultra': 0.65
            };
            
            const estimatedPrice = (duration * prices[chargingType.value]).toFixed(2);
            
            const reservationData = {
                station_id: stationSelect.value,
                vehicle_id: vehicleSelect.value,
                date: reservationDate.value,
                start_time: startTime.value,
                end_time: endTime.value,
                charging_type: chargingType.value,
                estimated_price: parseFloat(estimatedPrice)
            };
            
            console.log('📋 Données de réservation:', reservationData);
            
            const response = await fetch(`${this.apiBase}/reservations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });
            
            console.log(`📡 Status de la réservation: ${response.status}`);
            
            if (response.ok) {
                console.log('✅ Réservation effectuée avec succès!');
                this.closeReservationModal();
                this.showToast('Réservation effectuée avec succès!', 'success');
                
                // Create new reservation object for immediate display
                const stationSelect = document.getElementById('stationSelect');
                const vehicleSelect = document.getElementById('vehicleSelect');
                const reservationDate = document.getElementById('reservationDate');
                const startTime = document.getElementById('startTime');
                const endTime = document.getElementById('endTime');
                const chargingType = document.getElementById('chargingType');
                
                const newReservation = {
                    id: Date.now(), // Temporary ID
                    station_name: stationSelect.options[stationSelect.selectedIndex]?.text || 'Station inconnue',
                    vehicle_plate: vehicleSelect.options[vehicleSelect.selectedIndex]?.text || 'Véhicule inconnu',
                    date: reservationDate.value,
                    start_time: startTime.value,
                    end_time: endTime.value,
                    charging_type: chargingType.value,
                    estimated_price: parseFloat(estimatedPrice),
                    status: 'confirmed'
                };
                
                // Load reservations with the new one
                this.loadUserReservations(newReservation);
            } else {
                console.log('❌ Erreur lors de la réservation');
                const errorText = await response.text();
                console.log('📋 Erreur serveur:', errorText);
                throw new Error(`Erreur lors de la réservation: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Erreur réservation:', error);
            console.error('📋 Détails de l\'erreur:', {
                message: error.message,
                stack: error.stack
            });
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    async openReservationModal(stationId) {
        console.log('🎫 Ouverture du modal de réservation...');
        
        const modal = document.getElementById('reservationModal');
        if (!modal) {
            console.error('❌ Modal de réservation non trouvé');
            this.showToast('Erreur: Modal réservation non disponible', 'error');
            return;
        }
        
        console.log('✅ Modal trouvé, ouverture...');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        // Load stations and vehicles for dropdowns
        await this.loadStationsForReservation();
        await this.loadUserVehiclesForReservation();
        
        // Pre-select station if provided
        if (stationId) {
            const stationSelect = document.getElementById('stationSelect');
            if (stationSelect) {
                stationSelect.value = stationId;
            }
        }
        
        console.log('✅ Modal de réservation ouvert');
    }

    closeReservationModal() {
        console.log('🔒 Fermeture du modal de réservation...');
        const modal = document.getElementById('reservationModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    async loadStationsForReservation() {
        console.log('⚡ Chargement des stations pour réservation...');
        
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                console.log('❌ Token non trouvé');
                this.loadMockStationsForReservation();
                return;
            }
            
            const response = await fetch(`${this.apiBase}/stations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const stations = await response.json();
                console.log('✅ Stations chargées:', stations);
                this.populateStationSelect(stations);
            } else {
                console.log('⚠️ Erreur chargement stations, utilisation des données mock');
                this.loadMockStationsForReservation();
            }
        } catch (error) {
            console.error('❌ Erreur chargement stations:', error);
            this.loadMockStationsForReservation();
        }
    }

    loadMockStationsForReservation() {
        const mockStations = [
            { id: 1, name: 'Paris - Bercy', address: '12 Rue de Bercy, 75012 Paris', available: true, power: 250, type: 'Rapide', price: 0.35 },
            { id: 2, name: 'La Défense', address: '1 Place de la Défense, 92800 Puteaux', available: true, power: 150, type: 'Standard', price: 0.32 },
            { id: 3, name: 'Lyon - Part-Dieu', address: '15 Rue du Département, 69003 Lyon', available: false, power: 150, type: 'Standard', price: 0.32 }
        ];
        
        this.populateStationSelect(mockStations);
    }

    populateStationSelect(stations) {
        const stationSelect = document.getElementById('stationSelect');
        if (!stationSelect) return;
        
        // Clear existing options
        stationSelect.innerHTML = '<option value="">Sélectionnez une station</option>';
        
        // Add station options
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id;
            option.textContent = `${station.name} - ${station.power}kW - €${station.price}/kWh`;
            stationSelect.appendChild(option);
        });
    }

    async loadUserVehiclesForReservation() {
        console.log('🚗 Chargement des véhicules pour réservation...');
        
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                console.log('❌ Token non trouvé');
                this.loadMockVehiclesForReservation();
                return;
            }
            
            const response = await fetch(`${this.apiBase}/vehicles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const vehicles = await response.json();
                console.log('✅ Véhicules chargés:', vehicles);
                this.populateVehicleSelect(vehicles);
            } else {
                console.log('⚠️ Erreur chargement véhicules, utilisation des données mock');
                this.loadMockVehiclesForReservation();
            }
        } catch (error) {
            console.error('❌ Erreur chargement véhicules:', error);
            this.loadMockVehiclesForReservation();
        }
    }

    loadMockVehiclesForReservation() {
        const mockVehicles = [
            { id: 1, license_plate: 'AB-123-CD', vin: '1HGCM82633A123456', is_foreign: false },
            { id: 2, license_plate: 'DE-AB-1234', vin: 'WBA1A123456789012', is_foreign: true, country: 'Allemagne' }
        ];
        
        this.populateVehicleSelect(mockVehicles);
    }

    populateVehicleSelect(vehicles) {
        const vehicleSelect = document.getElementById('vehicleSelect');
        if (!vehicleSelect) return;
        
        // Clear existing options
        vehicleSelect.innerHTML = '<option value="">Sélectionnez un véhicule</option>';
        
        // Add vehicle options
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.license_plate} - ${vehicle.is_foreign ? 'Étranger' : 'France'}`;
            vehicleSelect.appendChild(option);
        });
    }

    reserveStation(stationId) {
        console.log(`🎫 Réservation de la station ${stationId}...`);
        this.openReservationModal(stationId);
    }

    // Dashboard methods
    async registerVehicle(vehicleData) {
        console.log('🚗 Enregistrement du véhicule:', vehicleData);
        
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                console.log('❌ Token non trouvé, redirection vers OTP');
                this.showOTPSection();
                return;
            }
            
            console.log('📡 Envoi de la requête d\'enregistrement...');
            
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
            
            console.log(`📡 Status de l'enregistrement: ${response.status}`);
            
            if (response.ok) {
                console.log('✅ Véhicule enregistré avec succès!');
                this.showToast('Véhicule enregistré avec succès!', 'success');
                this.showDashboard();
            } else {
                console.log('❌ Erreur lors de l\'enregistrement');
                const errorText = await response.text();
                console.log('📋 Erreur serveur:', errorText);
                throw new Error(`Erreur lors de l'enregistrement: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Erreur enregistrement véhicule:', error);
            console.error('📋 Détails de l\'erreur:', {
                message: error.message,
                stack: error.stack
            });
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    async loadUserVehicles() {
        console.log('🚗 Chargement des véhicules...');
        // Mock data for now
        const mockVehicles = [
            { id: 1, license_plate: 'AB-123-CD', vin: '1HGCM82633A123456', is_foreign: false },
            { id: 2, license_plate: 'DE-AB-1234', vin: 'WBA1A123456789012', is_foreign: true, country: 'Allemagne' }
        ];
        
        const vehicleInfo = document.getElementById('vehicleInfo');
        if (vehicleInfo) {
            vehicleInfo.innerHTML = `
                <div class="space-y-6">
                    <!-- French Vehicles Section -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i class="fas fa-car text-red-600"></i>
                            Véhicules Français
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${mockVehicles.filter(v => !v.is_foreign).map(vehicle => `
                                <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="flex items-center gap-3">
                                            <div class="tesla-red w-12 h-12 rounded-full flex items-center justify-center">
                                                <i class="fas fa-car text-white"></i>
                                            </div>
                                            <div>
                                                <h4 class="font-semibold text-gray-900">${vehicle.license_plate}</h4>
                                                <p class="text-sm text-gray-500">France</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        <p>VIN: ${vehicle.vin}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Foreign Vehicle Form (Hidden by default) -->
                    <div id="foreignVehicleForm" class="hidden">
                        <div class="glass-effect rounded-2xl shadow-xl p-8 animate-in">
                            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <i class="fas fa-globe text-red-600"></i>
                                Enregistrer un Véhicule Étranger
                            </h3>
                            <form id="addForeignVehicleForm" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Immatriculation</label>
                                        <input type="text" id="newForeignLicensePlate" required placeholder="DE-AB-1234" class="block w-full px-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-xl ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-red-600 transition-all">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de châssis (VIN)</label>
                                        <input type="text" id="newForeignVinNumber" required placeholder="WBA1A123456789012" class="block w-full px-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-xl ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-red-600 transition-all">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Pays d'immatriculation</label>
                                    <select id="newForeignCountry" required class="block w-full px-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-xl ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-red-600 transition-all">
                                        <option value="">Sélectionnez un pays</option>
                                        <option value="Allemagne">Allemagne</option>
                                        <option value="Belgique">Belgique</option>
                                        <option value="Espagne">Espagne</option>
                                        <option value="Italie">Italie</option>
                                        <option value="Luxembourg">Luxembourg</option>
                                        <option value="Pays-Bas">Pays-Bas</option>
                                        <option value="Portugal">Portugal</option>
                                        <option value="Suisse">Suisse</option>
                                        <option value="Royaume-Uni">Royaume-Uni</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                                <div class="flex gap-4">
                                    <button type="button" onclick="toggleForeignVehicleForm()" class="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                                        <i class="fas fa-times mr-2"></i>
                                        Annuler
                                    </button>
                                    <button type="submit" class="flex-1 tesla-red text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                                        <i class="fas fa-check mr-2"></i>
                                        Enregistrer le Véhicule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Foreign Vehicles Section -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i class="fas fa-globe text-red-600"></i>
                            Véhicules Étrangers
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${mockVehicles.filter(v => v.is_foreign).map(vehicle => `
                                <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="flex items-center gap-3">
                                            <div class="tesla-red w-12 h-12 rounded-full flex items-center justify-center">
                                                <i class="fas fa-globe text-white"></i>
                                            </div>
                                            <div>
                                                <h4 class="font-semibold text-gray-900">${vehicle.license_plate}</h4>
                                                <p class="text-sm text-gray-500">${vehicle.country}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        <p>VIN: ${vehicle.vin}</p>
                                        <p>Pays: ${vehicle.country}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async loadStations() {
        console.log('⚡ Chargement des stations...');
        // Mock data for now
        const mockStations = [
            { id: 1, name: 'Paris - Bercy', address: '12 Rue de Bercy, 75012 Paris', available: true, power: 250, type: 'Rapide', price: 0.35 },
            { id: 2, name: 'La Défense', address: '1 Place de la Défense, 92800 Puteaux', available: true, power: 150, type: 'Standard', price: 0.32 },
            { id: 3, name: 'Lyon - Part-Dieu', address: '15 Rue du Département, 69003 Lyon', available: false, power: 150, type: 'Standard', price: 0.32 }
        ];
        
        const stationsList = document.getElementById('stationsList');
        if (stationsList) {
            stationsList.innerHTML = mockStations.map(station => `
                <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="tesla-red w-12 h-12 rounded-full flex items-center justify-center">
                                <i class="fas fa-bolt text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-900">${station.name}</h4>
                                <p class="text-sm text-gray-500">${station.address}</p>
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
                    <button onclick="reserveStation('${station.id}')" class="w-full tesla-red text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
                        Réserver
                    </button>
                </div>
            `).join('');
        }
    }

    async loadUserReservations(newReservation = null) {
        console.log('📅 Chargement des réservations...');
        
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                console.log('❌ Token non trouvé, utilisation des données mock');
                this.loadMockReservations(newReservation);
                return;
            }
            
            const response = await fetch(`${this.apiBase}/reservations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const reservations = await response.json();
                console.log('✅ Réservations chargées:', reservations);
                
                // Add new reservation if provided
                let allReservations = reservations;
                if (newReservation) {
                    console.log('🆕 Ajout de la nouvelle réservation:', newReservation);
                    allReservations = [newReservation, ...reservations];
                }
                
                this.displayReservations(allReservations);
            } else {
                console.log('⚠️ Erreur chargement réservations, utilisation des données mock');
                this.loadMockReservations(newReservation);
            }
        } catch (error) {
            console.error('❌ Erreur chargement réservations:', error);
            this.loadMockReservations(newReservation);
        }
    }

    displayReservations(reservations) {
        const reservationsList = document.getElementById('reservationsList');
        if (!reservationsList) return;
        
        if (reservations.length === 0) {
            reservationsList.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <i class="fas fa-calendar text-gray-400 text-xl"></i>
                    </div>
                    <p class="text-gray-500">Aucune réservation</p>
                </div>
            `;
            return;
        }
        
        reservationsList.innerHTML = reservations.map((reservation, index) => `
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200 ${index === 0 ? 'ring-2 ring-green-500 ring-offset-2' : ''}">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h4 class="font-semibold text-gray-900">
                            ${index === 0 ? '🆕 ' : ''}Réservation #${reservation.id}
                        </h4>
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
                    <p><strong>Station:</strong> ${reservation.station_name || `Station #${reservation.station_id}`}</p>
                    <p><strong>Véhicule:</strong> ${reservation.vehicle_plate || `Véhicule #${reservation.vehicle_id}`}</p>
                    <p><strong>Type:</strong> ${reservation.charging_type || 'Standard'}</p>
                    <p><strong>Prix:</strong> €${reservation.estimated_price || '0.00'}</p>
                </div>
            </div>
        `).join('');
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
        } else if (type === 'info') {
            toast.classList.add('bg-blue-500');
        } else {
            toast.classList.add('bg-green-500');
        }
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Real-time recapitulatif updates
    updateRecapitulatif() {
        const stationSelect = document.getElementById('stationSelect');
        const vehicleSelect = document.getElementById('vehicleSelect');
        const reservationDate = document.getElementById('reservationDate');
        const startTime = document.getElementById('startTime');
        const endTime = document.getElementById('endTime');
        const chargingType = document.getElementById('chargingType');
        
        const recapStation = document.getElementById('recapStation');
        const recapVehicle = document.getElementById('recapVehicle');
        const recapDate = document.getElementById('recapDate');
        const recapTime = document.getElementById('recapTime');
        const recapType = document.getElementById('recapType');
        const recapPrice = document.getElementById('recapPrice');
        
        // Update station
        if (recapStation && stationSelect) {
            const selectedOption = stationSelect.options[stationSelect.selectedIndex];
            recapStation.textContent = `Station: ${selectedOption ? selectedOption.textContent : 'Non sélectionnée'}`;
        }
        
        // Update vehicle
        if (recapVehicle && vehicleSelect) {
            const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
            recapVehicle.textContent = `Véhicule: ${selectedOption ? selectedOption.textContent : 'Non sélectionné'}`;
        }
        
        // Update date
        if (recapDate && reservationDate) {
            recapDate.textContent = `Date: ${reservationDate.value || 'Non sélectionnée'}`;
        }
        
        // Update time
        if (recapTime && startTime && endTime) {
            recapTime.textContent = `Temps: ${startTime.value || 'Non sélectionné'} - ${endTime.value || 'Non sélectionné'}`;
        }
        
        // Update type
        if (recapType && chargingType) {
            const typeNames = {
                'standard': 'Standard (22kW)',
                'rapide': 'Rapide (50kW)',
                'ultra': 'Ultra (150kW)'
            };
            recapType.textContent = `Type: ${typeNames[chargingType.value] || 'Non sélectionné'}`;
        }
        
        // Update price
        if (recapPrice && startTime && endTime && chargingType) {
            const start = new Date(`2000-01-01T${startTime.value}`);
            const end = new Date(`2000-01-01T${endTime.value}`);
            const duration = (end - start) / (1000 * 60 * 60); // in hours
            
            const prices = {
                'standard': 0.32,
                'rapide': 0.45,
                'ultra': 0.65
            };
            
            const estimatedPrice = (duration * prices[chargingType.value]).toFixed(2);
            recapPrice.textContent = `Prix estimé: €${estimatedPrice}`;
        }
    }

    // Foreign Vehicle Form Methods
    toggleForeignVehicleForm() {
        console.log('🌍 Basculement du formulaire véhicule étranger...');
        const form = document.getElementById('foreignVehicleForm');
        if (form) {
            form.classList.toggle('hidden');
        }
    }

    async handleAddForeignVehicle(e) {
        e.preventDefault();
        
        console.log('🌍 Ajout d\'un véhicule étranger...');
        
        const licensePlate = document.getElementById('newForeignLicensePlate')?.value.trim() || '';
        const vinNumber = document.getElementById('newForeignVinNumber')?.value.trim() || '';
        const country = document.getElementById('newForeignCountry')?.value || '';
        
        if (!licensePlate || !vinNumber || !country) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        try {
            const token = localStorage.getItem('teslaToken');
            
            if (!token) {
                console.log('❌ Token non trouvé, redirection vers OTP');
                this.showOTPSection();
                return;
            }
            
            console.log('📡 Envoi de la requête d\'enregistrement...');
            
            const response = await fetch(`${this.apiBase}/vehicles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    license_plate: licensePlate,
                    vin: vinNumber,
                    is_foreign: true,
                    country: country
                })
            });
            
            console.log(`📡 Status de l'enregistrement: ${response.status}`);
            
            if (response.ok) {
                console.log('✅ Véhicule étranger enregistré avec succès!');
                this.showToast('Véhicule étranger enregistré avec succès!', 'success');
                
                // Clear form
                document.getElementById('newForeignLicensePlate').value = '';
                document.getElementById('newForeignVinNumber').value = '';
                document.getElementById('newForeignCountry').value = '';
                
                // Hide form
                this.toggleForeignVehicleForm();
                
                // Reload vehicles
                this.loadUserVehicles();
            } else {
                console.log('❌ Erreur lors de l\'enregistrement');
                const errorText = await response.text();
                console.log('📋 Erreur serveur:', errorText);
                throw new Error(`Erreur lors de l'enregistrement: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Erreur enregistrement véhicule étranger:', error);
            console.error('📋 Détails de l\'erreur:', {
                message: error.message,
                stack: error.stack
            });
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM chargé, initialisation de l\'application...');
    window.app = new TeslaChargeApp();
});
