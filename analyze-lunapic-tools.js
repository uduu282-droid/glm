/**
 * Analyze LunaPic Editor Tools
 * Captures all available tools and features from the editor interface
 */

const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Analyzing LunaPic Editor Tools...\n');
  console.log('=' .repeat(60));
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to editor
    console.log('📥 Loading LunaPic editor...\n');
    await page.goto('https://www2.lunapic.com/editor/?action=transparent', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Extract all tools and menu items
    const tools = await page.evaluate(() => {
      const results = {
        menuLinks: [],
        toolButtons: [],
        imageTools: [],
        allInteractive: []
      };
      
      // Get all links
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        const text = link.innerText?.trim() || link.getAttribute('title') || '';
        const href = link.href;
        if (text && text.length > 0) {
          results.menuLinks.push({ text, href });
        }
      });
      
      // Get all images with titles (tools)
      const images = document.querySelectorAll('img[title], img[alt]');
      images.forEach(img => {
        const title = img.title || img.alt || '';
        const src = img.src;
        if (title && title.length > 0) {
          results.toolButtons.push({ title, src });
        }
      });
      
      // Get all buttons
      const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
      buttons.forEach(btn => {
        const text = btn.value || btn.innerText || btn.name || '';
        if (text && text.length > 0) {
          results.allInteractive.push({ type: 'button', text });
        }
      });
      
      // Look for specific tool categories
      const toolSections = document.querySelectorAll('[class*="menu"], [class*="tool"], [class*="nav"]');
      toolSections.forEach(section => {
        if (section.className && section.className.includes('menu')) {
          const menuName = section.className;
          const items = section.querySelectorAll('a, img[title]');
          items.forEach(item => {
            const text = item.innerText || item.title || item.alt || '';
            if (text) {
              results.allInteractive.push({ type: 'menu_item', category: menuName, text });
            }
          });
        }
      });
      
      return results;
    });
    
    console.log('📊 RESULTS SUMMARY\n');
    console.log('-'.repeat(60));
    console.log(`Menu Links: ${tools.menuLinks.length}`);
    console.log(`Tool Buttons: ${tools.toolButtons.length}`);
    console.log(`Interactive Elements: ${tools.allInteractive.length}\n`);
    
    console.log('🛠️ MENU LINKS (Top 30):\n');
    console.log('-'.repeat(60));
    tools.menuLinks.slice(0, 30).forEach((item, i) => {
      console.log(`${i+1}. ${item.text}`);
      if (item.href && !item.href.startsWith('#')) {
        console.log(`   URL: ${item.href.substring(0, 80)}...`);
      }
    });
    
    console.log('\n\n🎨 TOOL BUTTONS (Top 30):\n');
    console.log('-'.repeat(60));
    tools.toolButtons.slice(0, 30).forEach((item, i) => {
      console.log(`${i+1}. ${item.title}`);
    });
    
    console.log('\n\n📋 INTERACTIVE ELEMENTS BY CATEGORY:\n');
    console.log('-'.repeat(60));
    
    // Group by category
    const categorized = {};
    tools.allInteractive.forEach(item => {
      const key = item.category || item.type;
      if (!categorized[key]) categorized[key] = [];
      categorized[key].push(item.text);
    });
    
    Object.entries(categorized).forEach(([category, items]) => {
      console.log(`\n${category}:`);
      items.slice(0, 15).forEach((item, i) => {
        console.log(`  - ${item}`);
      });
    });
    
    // Save full results
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'lunapic-full-tools.json');
    fs.writeFileSync(outputPath, JSON.stringify(tools, null, 2));
    console.log(`\n\n💾 Full results saved to: ${outputPath}\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
