# Unused Components and Files

This directory contains components and files that are not currently used in the application routes but are kept for potential future use or reference.

## Moved Files:

### React Components:
- **ChatBotDemo.tsx** - Demo page for ChatBot component functionality
- **IDCardLampung.tsx** - Standalone microsite component for ID Card Lampung
- **Index.tsx.backup** - Backup copy of the main Index component

### Data Files:
- **idcard_lampung_json.json** - JSON data file used by IDCardLampung component

### Blog Content Files:
- **blog/** directory containing:
  - Text files with blog content (Blog 1.txt, Blog 2.txt, etc.)
  - FAQ.txt - Frequently Asked Questions content
  - kebijakan-privacy.txt - Privacy policy content
  - panduan-desain.txt - Design guide content
  - Proses-Return.txt - Return process content
  - **panduan desain/** subdirectory with images:
    - Various design guide images (.webp, .jpg files)

## Why These Files Were Moved:

1. **Not referenced in App.tsx routes** - These components don't have corresponding routes defined
2. **Demo/Development purposes** - Some files were created for testing or demonstration
3. **Legacy content** - Some files may be outdated or replaced by newer implementations
4. **Backup files** - Backup copies that are no longer needed in the main directory

## How to Restore:

If you need to use any of these components again:

1. Move the desired file back to `src/pages/` directory
2. Add the corresponding route in `src/App.tsx`
3. Update any import statements if needed
4. Test the functionality

## Current Active Routes:

The following components are currently active and used in routes:
- Index.tsx (/, /product/:slug)
- NotFound.tsx (*)
- Survey.tsx (/survey)
- Blog.tsx (/blog)
- BlogPost.tsx (/blog/:title)
- Spotlight.tsx (/hello)
- Cashier.tsx (/cashier)
- Receipt.tsx (/receipt)
- Loker.tsx (/loker, /loker/:jobSlug)

---
*Last updated: $(date)*






