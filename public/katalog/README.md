# Katalog Images Directory

This directory contains images for the Katalog (Design Gallery) page. Images are automatically loaded from `public/katalog.json`.

## Quick Start

### Option 1: Automatic (Recommended)
1. **Organize images in category folders:**
   ```
   public/katalog/
     ├── ID Card/
     │   ├── design-1.webp
     │   └── design-2.webp
     ├── Lanyard/
     │   └── sample-1.webp
     ├── Banner/
     │   └── promo-1.webp
     └── Merchandise/
         └── item-1.webp
   ```

2. **Run the generator script:**
   ```bash
   npm run generate-katalog
   ```

3. **Done!** The katalog page will automatically load your images.

### Option 2: Manual JSON Editing
1. Add your images to category folders
2. Edit `public/katalog.json` and add your image entries:
   ```json
   {
     "images": [
       {
         "id": 1,
         "src": "/katalog/ID Card/your-image.webp",
         "title": "Your Design Title",
         "category": "ID Card",
         "description": "Optional description"
       }
     ]
   }
   ```

## Image Requirements

- **Format**: WebP format recommended for best performance (.webp, .jpg, .png, .gif)
- **Aspect Ratio**: Any ratio works! The gallery uses Pinterest-style masonry layout
- **Naming**: Use descriptive names like `design-1.webp`, `sample-banner.webp`, etc.

## Category Folders

**Required folder structure:**
```
katalog/
  ├── ID Card/          ← Images for ID Card designs
  ├── Lanyard/          ← Images for Lanyard designs
  ├── Banner/           ← Images for Banner designs
  └── Merchandise/      ← Images for Merchandise designs
```

The script automatically:
- ✅ Uses folder name as category
- ✅ Generates titles from filenames
- ✅ Assigns sequential IDs
- ✅ Scans all images in each folder

## Directory Structure

**Organize by category folders:**
```
katalog/
  ├── ID Card/
  │   ├── design-1.webp
  │   ├── design-2.webp
  │   └── corporate-id.webp
  ├── Lanyard/
  │   ├── sample-1.webp
  │   └── custom-lanyard.webp
  ├── Banner/
  │   ├── promo-1.webp
  │   └── event-banner.webp
  └── Merchandise/
      ├── item-1.webp
      └── custom-merch.webp
```

**Note:** Folder names are case-sensitive. Use exact names: `ID Card`, `Lanyard`, `Banner`, `Merchandise`

## Script Usage

```bash
# Generate/update katalog.json from images
npm run generate-katalog
```

The script will:
- ✅ Scan all images in category folders (`ID Card/`, `Lanyard/`, `Banner/`, `Merchandise/`)
- ✅ Auto-assign sequential IDs
- ✅ Extract category from folder name
- ✅ Generate titles from filenames
- ✅ Create/update `public/katalog.json`
- ✅ Create folder structure if it doesn't exist

## Manual JSON Structure

If you prefer to edit `katalog.json` manually:

```json
{
  "images": [
    {
      "id": 1,
      "src": "/katalog/image-path.webp",
      "title": "Design Title",
      "category": "ID Card",
      "description": "Optional description"
    }
  ]
}
```

**Note**: IDs must be unique. The page automatically generates categories from the images array.

