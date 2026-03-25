import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function simpleImageCapture() {
    console.log('📸 Simple Image Capture Test\n');
    console.log('=' .repeat(70));
    
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // Create test image
        const pngHeader = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64,
            0x08, 0x02, 0x00, 0x00, 0x00, 0xFF, 0x80, 0x20,
            0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47, 0x42,
            0x00, 0xAE, 0xCE, 0x1C, 0xE9, 0x00, 0x00, 0x00,
            0x04, 0x67, 0x41, 0x4D, 0x41, 0x00, 0x00, 0xB1,
            0x8F, 0x0B, 0xFC, 0x61, 0x05, 0x00, 0x00, 0x00,
            0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, 0x0E,
            0xC3, 0x00, 0x00, 0x0E, 0xC3, 0x01, 0xC7, 0x6F,
            0xA8, 0x64, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45,
            0x58, 0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61,
            0x72, 0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65,
            0x20, 0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65,
            0x61, 0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00,
            0x00, 0x00, 0x19, 0x49, 0x44, 0x41, 0x54, 0x78,
            0xDA, 0x62, 0x60, 0x60, 0x60, 0x60, 0x60, 0x60,
            0x18, 0x63, 0x60, 0x18, 0x00, 0x00, 0x00, 0x69,
            0x00, 0x01, 0xD4, 0xDD, 0xDE, 0x00, 0x00, 0x00,
            0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60,
            0x82
        ]);
        
        const testImagePath = path.join(__dirname, 'simple_test.png');
        fs.writeFileSync(testImagePath, pngHeader);
        console.log('✅ Test image created\n');
        
        console.log('🌐 Loading site...\n');
        await page.goto('https://imgupscaler.ai/ai-photo-editor/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('📤 Uploading image...\n');
        const fileInput = await page.$('input[type="file"]');
        
        if (fileInput) {
            await fileInput.uploadFile(testImagePath);
            console.log('✅ Image uploaded\n');
            
            console.log('⏳ Waiting for processing (45 seconds)...\n');
            await new Promise(resolve => setTimeout(resolve, 45000));
            
            // Get ALL images from the page
            console.log('🔍 Checking ALL images on page...\n');
            
            const allImages = await page.evaluate(() => {
                const images = document.querySelectorAll('img');
                return Array.from(images).map(img => ({
                    src: img.src,
                    alt: img.alt,
                    id: img.id,
                    className: img.className,
                    width: img.width,
                    height: img.height
                })).filter(img => img.src && !img.src.includes('iconify'));
            });
            
            console.log(`Found ${allImages.length} images:\n`);
            
            allImages.forEach((img, i) => {
                console.log(`${i + 1}. ${img.src.substring(0, 150)}...`);
                console.log(`   Size: ${img.width}x${img.height}`);
                console.log(`   Alt: ${img.alt || 'N/A'}\n`);
            });
            
            // Look for enhanced/processed images specifically
            const enhancedImages = allImages.filter(img => 
                img.src.includes('enhanced') || 
                img.src.includes('upscaled') || 
                img.src.includes('processed') ||
                img.src.includes('result') ||
                img.src.includes('output') ||
                img.src.includes('pbsimgs')
            );
            
            if (enhancedImages.length > 0) {
                console.log('\n✅ ENHANCED/PROCESSED IMAGES FOUND:\n');
                enhancedImages.forEach((img, i) => {
                    console.log(`${i + 1}. ${img.src}\n`);
                });
            } else {
                console.log('\n⚠️ No obviously enhanced images found\n');
            }
            
            // Save results
            const outputDir = path.join(__dirname, 'simple_capture_results');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            fs.writeFileSync(
                path.join(outputDir, 'all_images.json'),
                JSON.stringify({ allImages, enhancedImages }, null, 2)
            );
            
            console.log('\n📁 Results saved to:', outputDir, '\n');
            
        } else {
            console.log('❌ File input not found\n');
        }
        
        fs.unlinkSync(testImagePath);
        await browser.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

simpleImageCapture().catch(console.error);
