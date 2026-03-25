import axios from 'axios';

/**
 * AI-Images Generator - Using Discovered API
 * 
 * Endpoint: https://open-ai21.p.rapidapi.com/texttoimage2
 * Platform: RapidAPI
 */

const RAPIDAPI_KEY = 'ebbd999ebemsh25e7e9f6544cc1dp1950ffjsn1f6ac8266b48';
const RAPIDAPI_HOST = 'open-ai21.p.rapidapi.com';

async function generateImage(prompt) {
    try {
        console.log(`\n🎨 Generating image for: "${prompt}"\n`);
        
        const response = await axios.post(
            `https://${RAPIDAPI_HOST}/texttoimage2`,
            {
                text: prompt
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST
                }
            }
        );
        
        console.log('✅ Image generated successfully!\n');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error generating image:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        throw error;
    }
}

// Test it
if (process.argv[1].includes('ai_images_api.js')) {
    const prompt = process.argv[2] || 'a beautiful sunset over mountains';
    generateImage(prompt).catch(console.error);
}

export default generateImage;
