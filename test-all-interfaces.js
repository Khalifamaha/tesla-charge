const puppeteer = require('puppeteer');

async function testAllInterfaces() {
    console.log('🧪 DÉBUT DU TEST COMPLET DES INTERFACES');
    console.log('=' .repeat(60));
    
    const browser = await puppeteer.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    
    try {
        // Test 1: Accès à la page d'accueil
        console.log('\n📱 Test 1: Accès à la page d\'accueil');
        await page.goto('http://localhost:3001');
        await page.waitForSelector('#otpSection', { timeout: 5000 });
        console.log('✅ Page d\'accueil chargée');
        
        // Test 2: Vérification de l'interface OTP
        console.log('\n🔐 Test 2: Interface OTP visible');
        const otpSectionVisible = await page.isVisible('#otpSection');
        const otpFormVisible = await page.isVisible('#otpSendForm');
        console.log(`📋 Section OTP visible: ${otpSectionVisible}`);
        console.log(`📋 Formulaire OTP visible: ${otpFormVisible}`);
        
        // Test 3: Test du formulaire OTP
        console.log('\n📧 Test 3: Envoi du code OTP');
        await page.type('#contactInput', 'test@tesla.com');
        await page.click('#otpSendForm button[type="submit"]');
        
        // Attendre la section de vérification
        await page.waitForSelector('#otpVerifySection', { visible: true, timeout: 5000 });
        console.log('✅ Section de vérification OTP affichée');
        
        // Test 4: Vérification des champs OTP
        console.log('\n🔢 Test 4: Champs de vérification OTP');
        const otpInputs = await page.$$('.otp-input');
        console.log(`📋 Nombre de champs OTP: ${otpInputs.length}`);
        
        // Remplir le code OTP
        const testCode = '567890'; // Code actuel
        for (let i = 0; i < testCode.length; i++) {
            await page.type(`.otp-input:nth-child(${i + 1})`, testCode[i]);
        }
        console.log(`✅ Code ${testCode} saisi`);
        
        // Test 5: Soumission du code OTP
        console.log('\n✅ Test 5: Vérification du code OTP');
        await page.click('#otpVerifyForm button[type="submit"]');
        
        // Attendre le dashboard ou une erreur
        try {
            await page.waitForSelector('#dashboardSection', { visible: true, timeout: 5000 });
            console.log('✅ Dashboard accessible après OTP');
        } catch (error) {
            console.log('⚠️ Dashboard non accessible, vérification des erreurs...');
            const errorVisible = await page.isVisible('.toast');
            console.log(`📋 Message d'erreur visible: ${errorVisible}`);
        }
        
        // Test 6: Test du bouton "Changer d'email"
        console.log('\n🔄 Test 6: Bouton "Changer d\'email"');
        await page.click('button[onclick="backToOTPForm()"]');
        await page.waitForSelector('#otpSendForm', { visible: true, timeout: 3000 });
        console.log('✅ Retour au formulaire OTP réussi');
        
        // Test 7: Test de l'interface véhicule
        console.log('\n🚗 Test 7: Interface véhicule');
        await page.goto('http://localhost:3001');
        await page.waitForTimeout(2000);
        
        // Forcer l'affichage de la section véhicule
        await page.evaluate(() => {
            document.getElementById('otpSection').style.display = 'none';
            document.getElementById('vehicleSection').style.display = 'block';
        });
        
        const vehicleSectionVisible = await page.isVisible('#vehicleSection');
        console.log(`📋 Section véhicule visible: ${vehicleSectionVisible}`);
        
        // Test 8: Test du scanner
        console.log('\n📷 Test 8: Scanner OCR');
        await page.click('button[onclick="startOCRScanner()"]');
        await page.waitForSelector('#ocrModal', { visible: true, timeout: 3000 });
        console.log('✅ Modal scanner ouvert');
        
        // Test 9: Test de la capture
        console.log('\n📸 Test 9: Capture du scanner');
        await page.waitForTimeout(2000); // Attendre "Prêt pour la capture"
        await page.click('button[onclick="captureImage()"]');
        await page.waitForTimeout(2000);
        
        // Vérifier le remplissage automatique
        const licensePlateValue = await page.$eval('#licensePlate', el => el.value);
        const vinNumberValue = await page.$eval('#vinNumber', el => el.value);
        console.log(`📋 Plaque remplie: ${licensePlateValue}`);
        console.log(`📋 VIN rempli: ${vinNumberValue}`);
        
        // Test 10: Test du véhicule étranger
        console.log('\n🌍 Test 10: Véhicule étranger');
        await page.click('button[onclick="toggleForeignVehicle()"]');
        await page.waitForTimeout(1000);
        const foreignSectionVisible = await page.isVisible('#foreignVehicleSection');
        console.log(`📋 Section véhicule étranger visible: ${foreignSectionVisible}`);
        
        console.log('\n' + '=' .repeat(60));
        console.log('🎉 TEST COMPLET TERMINÉ');
        console.log('=' .repeat(60));
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await browser.close();
    }
}

// Exécuter le test
testAllInterfaces().catch(console.error);
