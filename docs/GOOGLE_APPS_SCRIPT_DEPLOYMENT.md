# Google Apps Script Deployment Guide for Job Applications

## Fixing 403 Error

The 403 error occurs when the Google Apps Script web app is not properly deployed or configured. Follow these steps:

### Step 1: Deploy as Web App

1. Open your Google Apps Script project
2. Click **Deploy** → **New deployment**
3. Click the gear icon ⚙️ next to **Select type** → Choose **Web app**
4. Configure the deployment:
   - **Description**: "Job Application Handler" (optional)
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone** (important! This allows anonymous access)
5. Click **Deploy**
6. Copy the **Web app URL** (this is your API endpoint)

### Step 2: Update the Script Code

Make sure your `doPost` function matches the code in `docs/archive/loker_appscript.js`:

- Handles JSON POST requests
- Creates files in Google Drive
- Saves data to Google Sheets
- Returns JSON response

### Step 3: Verify Configuration

Check these settings in your script:

1. **Sheet ID**: Must match your Google Sheet ID
2. **Folder ID**: Must match your Google Drive folder ID
3. **Sheet Name**: Must match the tab name in your spreadsheet (default: "loker")

### Step 4: Test the Deployment

After deploying, test the endpoint:

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test","email":"test@test.com","nomor":"123","source":"Test","cvBase64":"test","cvMimeType":"application/pdf","cvFileName":"test.pdf","fileBase64":"","fileMimeType":"","fileName":""}'
```

### Common Issues

1. **403 Forbidden**: 
   - Make sure "Who has access" is set to **Anyone**
   - Redeploy the script after making changes
   - Check that the script is not in "Test" mode

2. **401 Unauthorized**:
   - Make sure "Execute as" is set to **Me**
   - Authorize the script when prompted

3. **500 Internal Server Error**:
   - Check the Apps Script execution logs (View → Execution log)
   - Verify Sheet ID, Folder ID, and Sheet Name are correct
   - Check that the Google Drive folder and Sheet are accessible

### Important Notes

- After updating the script code, you must create a **new deployment** or **update the existing deployment**
- The deployment URL will change if you create a new deployment
- Always test with a small payload first
- Check execution logs in Apps Script for detailed error messages


