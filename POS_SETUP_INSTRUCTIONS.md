# POS Integration Setup Instructions

## Step 1: Create New Google Sheet for POS Orders

1. **Create a new Google Sheet** for POS orders
2. **Name the sheet exactly**: `Cashier Orders`
3. **Set up columns in this exact order:**
   - Column A: `Receipt ID`
   - Column B: `Timestamp`
   - Column C: `Cashier`
   - Column D: `Customer Name`
   - Column E: `Phone Number`
   - Column F: `Institution`
   - Column G: `Items`
   - Column H: `Subtotal`
   - Column I: `Discount`
   - Column J: `Total`
   - Column K: `Payment Method`

4. **Copy the Google Sheet ID** from the URL (the long string between `/d/` and `/edit`)

## Step 2: Create New Google Apps Script Project

1. **Go to [script.google.com](https://script.google.com)**
2. **Click "New Project"**
3. **Delete the default code**
4. **Copy and paste the entire content from `pos-appscript.gs.js`**
5. **Update the Sheet ID:**
   - Find the line: `const POS_SPREADSHEET_ID = 'YOUR_POS_SHEET_ID_HERE';`
   - Replace `YOUR_POS_SHEET_ID_HERE` with your actual Google Sheet ID

## Step 3: Deploy the Apps Script

1. **Click "Deploy" > "New deployment"**
2. **Choose type: "Web app"**
3. **Set execute as: "Me"**
4. **Set access: "Anyone"**
5. **Click "Deploy"**
6. **Copy the Web app URL** (it will look like: `https://script.google.com/macros/s/[LONG_ID]/exec`)

## Step 4: Update Frontend Code

1. **Open `src/constants/index.ts`**
2. **Find the line:** `export const POS_GOOGLE_SHEETS_URL = 'YOUR_POS_APPS_SCRIPT_URL_HERE';`
3. **Replace `YOUR_POS_APPS_SCRIPT_URL_HERE`** with your Apps Script Web app URL from Step 3

## Step 5: Test the Integration

### Test 1: Direct Apps Script Test
1. **Open your Apps Script project**
2. **Run the `testPOSOrder()` function**
3. **Check the execution logs**
4. **Verify data appears in your "Cashier Orders" sheet**

### Test 2: Frontend Test
1. **Open your POS dashboard** (`/cashier/pos`)
2. **Add products to cart**
3. **Click "Proses Pesanan"**
4. **Check browser console for logs**
5. **Verify data appears in "Cashier Orders" sheet**
6. **Check for email notifications**

## Expected Results

### Browser Console Should Show:
```
Submitting POS order: [object]
POS order JSON: [json string]
Using POS endpoint: [your apps script URL]
POS order submission completed
```

### Apps Script Logs Should Show:
```
=== POS doPost RECEIVED REQUEST ===
Raw POST data: [json string]
Successfully parsed POS JSON data: [parsed data]
=== POS ORDER PROCESSING START ===
Looking for sheet: Cashier Orders
Found sheet: Cashier Orders
Formatted items: [formatted items string]
Row data to append: [array of values]
POS order data appended to sheet successfully
=== POS ORDER PROCESSING END ===
POS order email notifications sent successfully
```

## Benefits of This Approach

✅ **Completely separate** from website orders  
✅ **Dedicated POS endpoint** - no routing confusion  
✅ **Simple POST request** - no complex URL encoding  
✅ **Clean architecture** - each system has its own script  
✅ **Easy maintenance** - modify POS logic independently  
✅ **Better debugging** - separate logs for each system  

## Troubleshooting

### Issue: "Sheet not found"
- Verify sheet name is exactly `Cashier Orders`
- Check the Google Sheet ID is correct

### Issue: "No POST data received"
- Check the Apps Script URL is correct in constants
- Verify the deployment is set to "Anyone" access

### Issue: Data not appearing
- Check Apps Script execution logs
- Verify column headers match exactly
- Check email notifications for errors

### Issue: Permission errors
- Make sure the Apps Script is deployed with "Execute as: Me"
- Check that the sheet is accessible by the script owner

## Next Steps After Setup

1. **Test thoroughly** with different product types
2. **Verify email notifications** are working
3. **Check data formatting** in the sheet
4. **Monitor Apps Script quotas** (shouldn't be an issue for normal usage)
5. **Set up backup/export** procedures if needed

Once this is working, your POS system will be completely independent from the website orders, with its own dedicated Google Sheet and Apps Script endpoint!



