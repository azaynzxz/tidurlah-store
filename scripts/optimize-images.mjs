#!/usr/bin/env node
// Convert all images in public/product-image to WebP (excluding GIFs)
// Optional: --update-products to rewrite public/products.json paths to .webp when available

import fs from 'fs';
import path from 'path';
import url from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const imagesRoot = path.join(projectRoot, 'public', 'product-image');
const productsJsonPath = path.join(projectRoot, 'public', 'products.json');

const args = process.argv.slice(2);
const shouldUpdateProducts = args.includes('--update-products');

/**
 * Recursively list files under a directory
 */
function listFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function isImageToConvert(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  // Skip gifs and existing webp
  if (ext === '.gif' || ext === '.webp') return false;
  // Common raster formats
  return ['.jpg', '.jpeg', '.png'].includes(ext);
}

async function convertToWebp(srcPath) {
  const dstPath = srcPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  // Skip if already exists
  if (fs.existsSync(dstPath)) return { created: false, dstPath };

  await sharp(srcPath)
    .webp({ quality: 82 })
    .toFile(dstPath);

  return { created: true, dstPath };
}

async function main() {
  if (!fs.existsSync(imagesRoot)) {
    console.error(`Images directory not found: ${imagesRoot}`);
    process.exit(1);
  }

  const files = listFilesRecursive(imagesRoot);
  const targets = files.filter(isImageToConvert);

  let createdCount = 0;
  for (const file of targets) {
    try {
      const { created } = await convertToWebp(file);
      if (created) createdCount++;
      process.stdout.write('.');
    } catch (err) {
      console.warn(`\nFailed to convert ${file}:`, err.message);
    }
  }
  process.stdout.write('\n');

  console.log(`Processed ${targets.length} files. New WebP created: ${createdCount}.`);

  if (shouldUpdateProducts && fs.existsSync(productsJsonPath)) {
    try {
      const raw = fs.readFileSync(productsJsonPath, 'utf8');
      const data = JSON.parse(raw);
      const replacePath = (p) => {
        if (!p || typeof p !== 'string') return p;
        // Only rewrite paths that live under /product-image and are jpg/jpeg/png
        if (!p.startsWith('/product-image/')) return p;
        if (/\.(gif|webp)$/i.test(p)) return p;
        const webpCandidate = p.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const diskPath = path.join(projectRoot, 'public', webpCandidate);
        if (fs.existsSync(diskPath)) return webpCandidate;
        return p; // fallback when webp not generated
      };

      for (const category of Object.keys(data)) {
        const items = data[category];
        items.forEach((item) => {
          item.image = replacePath(item.image);
          if (Array.isArray(item.additionalImages)) {
            item.additionalImages = item.additionalImages.map(replacePath);
          }
        });
      }

      fs.writeFileSync(productsJsonPath, JSON.stringify(data, null, 2) + '\n');
      console.log('Updated products.json to use .webp where available.');
    } catch (err) {
      console.warn('Failed to update products.json:', err.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


