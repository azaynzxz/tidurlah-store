# POS Integration with Google Sheets

## Overview
This document outlines the changes made to integrate POS (Point of Sale) orders with Google Sheets, allowing the POSDashboard to send data to a separate "Cashier Orders" sheet while maintaining the existing website order functionality.

## Changes Made

### 1. Google Apps Script Updates (`appscript.gs.js`)

#### New Constants
```javascript
const CASHIER_ORDERS_SHEET_NAME = "Cashier Orders";
```

#### New Functions Added
- `submitPOSOrder(posOrderData)` - Handles POS order data submission
- `sendPOSOrderEmail(orderData, formattedItems)` - Sends email notifications for POS orders

#### Enhanced doPost Function
- Now detects JSON format data (POS orders) vs form data (website orders)
- Routes POS orders to `submitPOSOrder()` function
- Maintains backward compatibility with existing website orders

### 2. Client-Side API Updates (`src/utils/api.ts`)

#### New Interface
```typescript
export interface POSOrderData {
  receiptId: string;
  cashier: string;
  customerName?: string;
  phoneNumber?: string;
  institution?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    modelCode?: string;
    caseVariant?: string;
    laminationVariant?: string;
    width?: number;
    height?: number;
    dimensionText?: string;
    area?: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: string;
}
```

#### New Function
- `submitPOSOrder(posOrderData: POSOrderData)` - Submits POS orders to Google Sheets

### 3. POSDashboard Updates (`src/components/pos/POSDashboard.tsx`)

#### Enhanced Order Processing
- `handleProcessOrder()` now submits data to Google Sheets before generating receipt
- Proper error handling with user feedback
- Data formatting to match "Cashier Orders" sheet columns

## Google Sheets Structure

### "Cashier Orders" Sheet Columns
| Column | Description |
|--------|-------------|
| Receipt ID | Unique transaction identifier |
| Timestamp | Order date and time |
| Cashier | POS operator name |
| Customer Name | Customer name (optional) |
| Phone Number | Customer phone (optional) |
| Institution | Customer institution (optional) |
| Items | Formatted list of ordered items |
| Subtotal | Order subtotal amount |
| Discount | Applied discount amount |
| Total | Final total amount |
| Payment Method | Payment method used |

## Data Flow

### POS Orders
1. User completes order in POSDashboard
2. Order data is formatted as JSON
3. Data is sent to Google Apps Script endpoint
4. Apps Script detects JSON format and routes to POS handler
5. Data is saved to "Cashier Orders" sheet
6. Email notification is sent to admins
7. Receipt is generated and downloaded

### Website Orders (Unchanged)
1. User completes order on website
2. Order data is formatted as form data
3. Data is sent to Google Apps Script endpoint
4. Apps Script processes as regular website order
5. Data is saved to "Sheet1" 
6. Email notification is sent to admins
7. User is redirected to WhatsApp

## Key Features

### Automatic Detection
- Google Apps Script automatically detects the data format
- JSON data → POS orders → "Cashier Orders" sheet
- Form data → Website orders → "Sheet1" sheet

### Email Notifications
- Separate email templates for POS and website orders
- Includes all relevant order information
- Sent to admin email addresses

### Error Handling
- Client-side error handling with user feedback
- Server-side error logging and reporting
- Graceful fallback for parsing errors

### Data Formatting
- Items are formatted as readable strings with all options
- Proper handling of dimensional products (banners)
- Support for model codes, casing, and lamination options

## Testing

### To Test POS Integration:

#### Method 1: Direct Apps Script Test
1. Open Google Apps Script editor
2. Run the `testPOSOrder()` function directly
3. Check the execution log for detailed debugging info
4. Verify test data appears in "Cashier Orders" sheet

#### Method 2: Frontend Test
1. Open POSDashboard (`/cashier/pos`)
2. Add products to cart
3. Click "Proses Pesanan"
4. Check browser console for debugging info
5. Verify data appears in "Cashier Orders" sheet
6. Check email notifications are received

### Debugging Steps:
1. Check Google Apps Script execution logs for detailed POS processing info
2. Verify "Cashier Orders" sheet exists with correct column headers
3. Check browser console for client-side errors
4. Run `testPOSOrder()` function in Apps Script to test server-side processing

### To Verify Website Orders Still Work:
1. Open main website (`/`)
2. Add products to cart
3. Complete order form
4. Verify data appears in "Sheet1" sheet
5. Check email notifications and WhatsApp redirect

## Maintenance Notes

### Adding New POS Features
- Update `POSOrderData` interface in `api.ts`
- Modify `submitPOSOrder()` function in Apps Script
- Update email template as needed

### Column Changes
- If "Cashier Orders" sheet columns change, update the `rowData` array in `submitPOSOrder()` Apps Script function
- Update the `POSOrderData` interface accordingly

### Debugging
- Check browser console for client-side errors
- Check Apps Script logs for server-side issues
- Verify sheet permissions and structure

## Troubleshooting

### Issue: POS orders going to "Sheet1" instead of "Cashier Orders"
**Causes:**
- JSON parsing failed in `doPost` function
- `receiptId` missing from POS data
- Sheet name mismatch

**Solutions:**
1. Run `testPOSOrder()` function in Apps Script to test direct submission
2. Check Apps Script logs for JSON parsing errors
3. Verify "Cashier Orders" sheet exists with exact name
4. Check browser console for client-side data format

### Issue: Empty data in "Cashier Orders" sheet
**Causes:**
- Data structure mismatch between client and server
- Missing required fields in POS data
- Column header mismatch

**Solutions:**
1. Check Apps Script logs for detailed POS processing info
2. Verify column headers match: Receipt ID, Timestamp, Cashier, Customer Name, Phone Number, Institution, Items, Subtotal, Discount, Total, Payment Method
3. Run test function to verify server-side processing

### Issue: No email notifications
**Causes:**
- Email function error
- Invalid admin email addresses
- Gmail API permissions

**Solutions:**
1. Check Apps Script logs for email sending errors
2. Verify admin email addresses in `ADMIN_EMAILS` constant
3. Test email function separately
