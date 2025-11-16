/**
 * Script to automatically generate katalog.json from images in public/katalog directory
 * 
 * Usage:
 *   node scripts/generate-katalog.js
 * 
 * This script will:
 * 1. Scan the public/katalog directory for image files organized in category folders
 * 2. Generate a JSON file with image metadata
 * 3. Auto-assign IDs and extract category from folder name
 * 
 * Directory structure:
 *   katalog/
 *     ├── ID Card/
 *     │   ├── design-1.webp
 *     │   └── design-2.webp
 *     ├── Lanyard/
 *     │   └── sample-1.webp
 *     ├── Banner/
 *     │   └── promo-1.webp
 *     └── Merchandise/
 *         └── item-1.webp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KATALOG_DIR = path.join(__dirname, '../public/katalog');
const OUTPUT_FILE = path.join(__dirname, '../public/katalog.json');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];

// Category folder name mapping (normalize folder names to standard category names)
const CATEGORY_MAPPING = {
  'id card': 'ID Card',
  'idcard': 'ID Card',
  'id-card': 'ID Card',
  'lanyard': 'Lanyard',
  'banner': 'Banner',
  'merchandise': 'Merchandise',
};

// Expected category folders
const EXPECTED_CATEGORIES = ['ID Card', 'Lanyard', 'Banner', 'Merchandise'];

function normalizeCategory(folderName) {
  const normalized = folderName.trim();
  const lower = normalized.toLowerCase();
  
  // Check exact match first
  if (EXPECTED_CATEGORIES.includes(normalized)) {
    return normalized;
  }
  
  // Check mapping
  if (CATEGORY_MAPPING[lower]) {
    return CATEGORY_MAPPING[lower];
  }
  
  // Default to folder name with proper capitalization
  return normalized
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function generateTitle(filename) {
  // Remove extension
  const nameWithoutExt = path.parse(filename).name;
  
  // Replace hyphens/underscores with spaces and capitalize
  const words = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return words || 'Design';
}

function scanDirectory(dir, category = null, basePath = '') {
  const items = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  // Determine category from current directory if not provided
  let currentCategory = category;
  if (!currentCategory && basePath) {
    // Extract folder name from basePath (first segment)
    const folderName = basePath.split('/')[0];
    currentCategory = normalizeCategory(folderName);
  }
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath 
      ? path.join(basePath, entry.name).replace(/\\/g, '/')
      : entry.name;
    
    if (entry.isDirectory()) {
      // If we're in the root katalog directory, use folder name as category
      const folderCategory = basePath === '' ? normalizeCategory(entry.name) : currentCategory;
      const subItems = scanDirectory(fullPath, folderCategory, relativePath);
      items.push(...subItems);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      
      if (IMAGE_EXTENSIONS.includes(ext)) {
        const title = generateTitle(entry.name);
        const finalCategory = currentCategory || 'ID Card'; // Default category
        
        items.push({
          src: `/katalog/${relativePath}`,
          title: title,
          category: finalCategory,
          description: `${finalCategory} design`
        });
      }
    }
  });
  
  return items;
}

function generateKatalog() {
  console.log('🖼️  Generating katalog.json...\n');
  
  // Check if directory exists
  if (!fs.existsSync(KATALOG_DIR)) {
    console.error(`❌ Directory not found: ${KATALOG_DIR}`);
    console.log('💡 Creating directory structure...');
    fs.mkdirSync(KATALOG_DIR, { recursive: true });
    
    // Create category folders
    EXPECTED_CATEGORIES.forEach(category => {
      const categoryDir = path.join(KATALOG_DIR, category);
      fs.mkdirSync(categoryDir, { recursive: true });
    });
    
    console.log('✅ Directory structure created with category folders:');
    EXPECTED_CATEGORIES.forEach(cat => console.log(`   - ${cat}/`));
    console.log('\n💡 Add your images to the category folders and run the script again.\n');
    return;
  }
  
  // Scan directory for images
  const images = scanDirectory(KATALOG_DIR);
  
  if (images.length === 0) {
    console.log('⚠️  No images found in katalog directory.');
    console.log(`📁 Directory: ${KATALOG_DIR}`);
    console.log('💡 Supported formats:', IMAGE_EXTENSIONS.join(', '));
    console.log('\n📂 Expected folder structure:');
    EXPECTED_CATEGORIES.forEach(cat => {
      console.log(`   katalog/${cat}/`);
      console.log(`      └── your-images.webp`);
    });
    console.log('\n💡 Tip: Organize images in category folders:');
    console.log('   - katalog/ID Card/design-1.webp');
    console.log('   - katalog/Lanyard/sample-1.webp');
    console.log('   - katalog/Banner/promo-1.webp');
    console.log('   - katalog/Merchandise/item-1.webp\n');
    return;
  }
  
  // Assign IDs sequentially
  images.forEach((img, index) => {
    img.id = index + 1;
  });
  
  // Group by category for display
  const byCategory = {};
  images.forEach(img => {
    if (!byCategory[img.category]) {
      byCategory[img.category] = [];
    }
    byCategory[img.category].push(img);
  });
  
  // Generate JSON
  const katalogData = {
    images: images
  };
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(katalogData, null, 2), 'utf8');
  
  // Display results
  console.log(`✅ Generated katalog.json with ${images.length} images:\n`);
  
  // Show by category
  EXPECTED_CATEGORIES.forEach(category => {
    const count = byCategory[category]?.length || 0;
    console.log(`   ${category}: ${count} image${count !== 1 ? 's' : ''}`);
  });
  
  // Show any unexpected categories
  Object.entries(byCategory).forEach(([category, items]) => {
    if (!EXPECTED_CATEGORIES.includes(category)) {
      console.log(`   ${category} (custom): ${items.length} image${items.length !== 1 ? 's' : ''}`);
    }
  });
  
  console.log(`\n📄 Output file: ${OUTPUT_FILE}`);
  console.log('✨ Done! Your katalog page will automatically load these images.\n');
}

// Run the script
try {
  generateKatalog();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

