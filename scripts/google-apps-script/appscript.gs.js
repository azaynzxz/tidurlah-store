// Replace with your Google Sheet ID
const SPREADSHEET_ID = '1bK-hq2TDTGElXt0sJbrhGy2ka--leelHlOiH9EhUDhk';
const DATA_ENTRY_SHEET_NAME = "Sheet1";
const ORDER_DATA_SHEET_NAME = "OrderData";
const CASHIER_ORDERS_SHEET_NAME = "Cashier Orders";
const TIME_STAMP_COLUMN_NAME = "Timestamp";

// Admin email addresses to receive notifications
const ADMIN_EMAILS = ['achmad3zaini@gmail.com', 'halo.idcardlampung@gmail.com'];

// Initialize the sheet
var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DATA_ENTRY_SHEET_NAME);

// Parse price string to number
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return Number(priceStr.replace(/[^\d]/g, ''));
}

// Format phone number to standard format (628...)
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let digitsOnly = phone.replace(/\D/g, '');
  
  // If it starts with '0', replace with '62'
  if (digitsOnly.startsWith('0')) {
    digitsOnly = '62' + digitsOnly.substring(1);
  }
  
  // If it doesn't start with '62', add it
  if (!digitsOnly.startsWith('62')) {
    digitsOnly = '62' + digitsOnly;
  }
  
  return digitsOnly;
}

// Handle POST requests from your website
const doPost = (request = {}) => {
  try {
    const { postData: { contents, type } = {} } = request;
    
    console.log('=== doPost RECEIVED REQUEST ===');
    console.log('Raw POST data:', contents);
    console.log('Content type:', type);
    console.log('Contents length:', contents ? contents.length : 0);
    console.log('Starts with {:', contents ? contents.startsWith('{') : false);
    
    // Parse form data first to check for POS marker
    var parsedData = parseFormData(contents);
    console.log('Parsed form data keys:', Object.keys(parsedData));
    
    // Check if this is a POS order using the isPOSOrder marker
    if (parsedData.isPOSOrder === 'true' && parsedData.posData) {
      console.log('Detected POS order marker, processing POS data...');
      try {
        const posOrderData = JSON.parse(parsedData.posData);
        console.log('Successfully parsed POS data:', JSON.stringify(posOrderData));
        
        if (posOrderData.receiptId) {
          console.log('receiptId found:', posOrderData.receiptId, '- Processing as POS order');
          // Handle POS order
          const result = submitPOSOrder(posOrderData);
          
          return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
        } else {
          console.error('POS data missing receiptId:', Object.keys(posOrderData));
        }
      } catch (jsonError) {
        console.error('Error parsing POS data JSON:', jsonError.toString());
      }
    }
    
    // Check if this is a POS order (JSON format - fallback method)
    if (contents && (contents.startsWith('{') || type === 'application/json')) {
      console.log('Detected potential JSON data, attempting to parse...');
      try {
        const posOrderData = JSON.parse(contents);
        console.log('Successfully parsed JSON data:', JSON.stringify(posOrderData));
        
        // Validate that this is actually POS data by checking for receiptId
        if (posOrderData.receiptId) {
          console.log('receiptId found:', posOrderData.receiptId, '- Processing as POS order');
          // Handle POS order
          const result = submitPOSOrder(posOrderData);
          
          return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
        } else {
          console.log('JSON data detected but no receiptId found, treating as regular order');
          console.log('Available keys in JSON:', Object.keys(posOrderData));
        }
          
      } catch (jsonError) {
        console.error('Error parsing POS JSON data:', jsonError.toString());
        console.log('JSON parsing failed, falling back to regular form data parsing');
      }
    } else {
      console.log('Not JSON format, processing as regular form data');
    }
    
    console.log('Processing as regular website order...');
    // Use already parsed data
    var data = parsedData;
    
    console.log('Parsed form data:', JSON.stringify(data));
    
    // Add timestamp
    if(TIME_STAMP_COLUMN_NAME !== ""){
      data[TIME_STAMP_COLUMN_NAME] = new Date();
    }
    
    // Append to Google Sheet
    appendToGoogleSheet(data);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Order data saved successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error in doPost:', error.toString());
    console.error('Error stack:', error.stack);
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
};

// Parse the form data - IMPROVED VERSION
function parseFormData(postData) {
  var data = {};
  
  if (!postData) {
    console.error('No POST data received');
    return data;
  }
  
  var parameters = postData.split('&');
  
  for (var i = 0; i < parameters.length; i++) {
    var keyValue = parameters[i].split('=');
    if (keyValue.length >= 2) {
      var key = keyValue[0];
      var value = keyValue[1];
      
      // Handle special fields that need careful decoding
      if (key === 'DesignNote' || key === 'OrderDetails') {
        // First handle plus signs (before decoding)
        value = value.replace(/\+/g, ' ');
        // Then decode URI components
        value = decodeURIComponent(value);
      } else {
        // For other fields, handle normally
        value = value.replace(/\+/g, ' ');
        value = decodeURIComponent(value);
      }
      
      data[key] = value;
    }
  }
  
  console.log('Parsed form data:', JSON.stringify(data));
  return data;
}

// Format order details as human-readable semicolon-separated string - IMPROVED VERSION
function formatOrderDetails(orderDetailsStr) {
  if (!orderDetailsStr) {
    console.log('No order details to format');
    return '';
  }
  
  console.log('Raw order details string:', orderDetailsStr);
  
  try {
    // Clean the string before parsing
    let cleanedStr = orderDetailsStr;
    
    // Handle HTML entities
    cleanedStr = cleanedStr.replace(/&quot;/g, '"');
    cleanedStr = cleanedStr.replace(/&amp;/g, '&');
    cleanedStr = cleanedStr.replace(/&lt;/g, '<');
    cleanedStr = cleanedStr.replace(/&gt;/g, '>');
    
    // Handle URL encoding remnants
    cleanedStr = cleanedStr.replace(/%22/g, '"');
    cleanedStr = cleanedStr.replace(/%5B/g, '[');
    cleanedStr = cleanedStr.replace(/%5D/g, ']');
    cleanedStr = cleanedStr.replace(/%7B/g, '{');
    cleanedStr = cleanedStr.replace(/%7D/g, '}');
    
    console.log('Cleaned order details string:', cleanedStr);
    
    // Parse the JSON string
    const orderDetails = JSON.parse(cleanedStr);
    
    console.log('Parsed order details:', JSON.stringify(orderDetails));
    
    // Format each item and join with semicolons
    const formattedItems = orderDetails.map(item => {
      // Clean the name field
      const name = item.name ? item.name.replace(/\+/g, ' ') : 'Unknown Item';
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      
      // Format price with Indonesian locale
      const formattedPrice = Number(price).toLocaleString('id-ID');
      
      return `${name} (${quantity}) - Rp ${formattedPrice}`;
    });
    
    const result = formattedItems.join('; ');
    console.log('Formatted order details:', result);
    
    return result;
    
  } catch (error) {
    console.error('Error formatting order details:', error);
    console.error('Original string:', orderDetailsStr);
    
    // Return original string if parsing fails
    return orderDetailsStr;
  }
}

// Clean and format text fields - IMPROVED VERSION
function cleanTextFormat(text) {
  if (!text) return '';
  
  // First handle plus signs (convert to spaces)
  text = text.replace(/\+/g, ' ');
  
  // Then decode all URL-encoded characters
  try {
    text = decodeURIComponent(text);
  } catch (e) {
    console.log('Error decoding text:', e);
    // If decoding fails, manually handle common URL encodings
    text = text.replace(/%20/g, ' ')
               .replace(/%3A/g, ':')
               .replace(/%2F/g, '/')
               .replace(/%3F/g, '?')
               .replace(/%3D/g, '=')
               .replace(/%26/g, '&')
               .replace(/%25/g, '%');
  }
  
  // Format newlines and carriage returns
  text = text.replace(/%0A/g, '\n').replace(/%0D/g, '');
  
  return text;
}

// Send email notification about new order - IMPROVED VERSION
function sendOrderEmail(orderData) {
  try {
    // Create email subject
    const subject = `New Order: ${orderData.InvoiceNumber} - ${orderData.CustomerName}`;
    
    // Format the order details for email
    let orderItems = [];
    
    if (orderData.OrderDetails) {
      try {
        // Try to parse as JSON first
        let parsedItems;
        let orderDetailsStr = orderData.OrderDetails;
        
        // If it's already formatted (contains semicolons), use as is
        if (orderDetailsStr.includes(';') && orderDetailsStr.includes('Rp')) {
          orderItems = orderDetailsStr.split(';').map(item => `- ${item.trim()}`).join('\n');
        } else {
          // Try to parse as JSON
          orderDetailsStr = orderDetailsStr.replace(/&quot;/g, '"');
          parsedItems = JSON.parse(orderDetailsStr);
          
          orderItems = parsedItems.map(item => 
            `- ${item.name} (${item.quantity}) - Rp ${Number(item.price).toLocaleString('id-ID')}`
          ).join('\n');
        }
      } catch (e) {
        console.error('Error parsing order details for email:', e);
        // If parsing fails, use the string as is
        orderItems = orderData.OrderDetails;
      }
    }
    
    // Create email body
    const emailBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #FF5E01;">New Order Received</h2>
        <p><strong>Invoice:</strong> ${orderData.InvoiceNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${orderData.CustomerName}</p>
        <p><strong>Institution/Alias:</strong> ${orderData.Instansi || '-'}</p>
        <p><strong>Phone:</strong> ${orderData.PhoneNumber}</p>
        ${orderData.DesignNote ? `<p><strong>Design Note/Link:</strong> ${orderData.DesignNote}</p>` : ''}
        <p><strong>Shipping Required:</strong> ${orderData.ShippingInfo || 'No'}</p>
        ${orderData.Address ? `<p><strong>Address:</strong> ${orderData.Address}</p>` : ''}
        <p><strong>Jasa Desain:</strong> ${orderData.RequestJasaDesain || 'No'}</p>
        <p><strong>Express Print:</strong> ${orderData.IsExpressPrint || 'No'}</p>
        
        <h3>Order Details</h3>
        <pre style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${orderItems}</pre>
        
        <h3>Payment Summary</h3>
        <p><strong>Subtotal:</strong> Rp ${Number(orderData.Subtotal).toLocaleString('id-ID')}</p>
        ${orderData.PromoCode ? `<p><strong>Promo Code:</strong> ${orderData.PromoCode} (${orderData.PromoDiscount}% discount)</p>` : ''}
        <p><strong>Total:</strong> Rp ${Number(orderData.Total).toLocaleString('id-ID')}</p>
        
        <p style="margin-top: 20px;">
          View all orders in the <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}" target="_blank">Google Sheet</a>
        </p>
      </body>
    </html>
    `;
    
    // Send email to each admin
    ADMIN_EMAILS.forEach(adminEmail => {
      GmailApp.sendEmail(
        adminEmail,
        subject,
        // Plain text fallback
        `New Order: ${orderData.InvoiceNumber}\nCustomer: ${orderData.CustomerName}\nPhone: ${orderData.PhoneNumber}\nItems: ${orderItems}\nTotal: Rp ${Number(orderData.Total).toLocaleString('id-ID')}`,
        { 
          htmlBody: emailBody,
          name: "Order Notification" 
        }
      );
    });
    
    console.log('Email notifications sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

// Append data to Google Sheet - IMPROVED VERSION
function appendToGoogleSheet(data) {
  try {
    // Get headers from first row
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Clean and format CustomerName field
    if (data.CustomerName) {
      data.CustomerName = cleanTextFormat(data.CustomerName);
    }
    
    // Clean and format Instansi field
    if (data.Instansi) {
      data.Instansi = cleanTextFormat(data.Instansi);
    }
    
    // Format PhoneNumber field to standard format
    if (data.PhoneNumber) {
      data.PhoneNumber = formatPhoneNumber(data.PhoneNumber);
    }
    
    // Clean and format Address field
    if (data.Address) {
      data.Address = cleanTextFormat(data.Address);
    }
    
    // Clean and format DesignNote field properly
    if (data.DesignNote) {
      data.DesignNote = cleanTextFormat(data.DesignNote);
    }
    
    // Format order details as readable string if it exists
    if (data.OrderDetails) {
      console.log('Original OrderDetails:', data.OrderDetails);
      data.OrderDetails = formatOrderDetails(data.OrderDetails);
      console.log('Formatted OrderDetails:', data.OrderDetails);
    }
    
    // Convert shipping info to Yes/No
    if (data.ShippingInfo) {
      data.ShippingInfo = data.ShippingInfo === "true" ? "Yes" : "No";
    }
    
    // Convert express print to Yes/No
    if (data.IsExpressPrint) {
      data.IsExpressPrint = data.IsExpressPrint === "true" ? "Yes" : "No";
    }
    
    // Convert jasa desain to Yes/No
    if (data.RequestJasaDesain) {
      data.RequestJasaDesain = data.RequestJasaDesain === "true" ? "Yes" : "No";
    }
    
    // Map data to match header order
    var rowData = headers.map(headerFld => data[headerFld] || '');
    
    console.log('Row data to append:', rowData);
    
    // Append the new row
    sheet.appendRow(rowData);
    
    console.log('Data appended to sheet successfully');
    
    // Send email notification
    sendOrderEmail(data);
    
  } catch (error) {
    console.error('Error in appendToGoogleSheet:', error);
    throw error;
  }
}

// Rest of your PDF functions remain the same...
function onOpen() {
  createPdfMenu();
}

function onInstall() {
  createPdfMenu();
}

function createPdfMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('PDF Tools')
    .addItem('Save Invoice as PDF', 'showSavePdfDialog')
    .addToUi();
  
  // Add Input Order menu
  ui.createMenu('Input Order')
    .addItem('Add New Order Entry', 'showInputOrderDialog')
    .addToUi();
}

function refreshMenu() {
  createPdfMenu();
  Logger.log("PDF Tools menu has been refreshed");
}

function showSavePdfDialog() {
  const result = saveInvoicingRangeAsPdf();
  
  if (result && result.success) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <base target="_top">
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 500px;
              margin: 20px auto;
              padding: 30px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .success-icon {
              text-align: center;
              color: #4CAF50;
              font-size: 48px;
              margin-bottom: 20px;
            }
            h2 {
              color: #333;
              text-align: center;
              margin: 0 0 20px 0;
              font-size: 24px;
            }
            .file-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              border-left: 4px solid #4CAF50;
            }
            .file-name {
              color: #666;
              font-size: 14px;
              word-break: break-all;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
              text-align: center;
              transition: background 0.3s;
            }
            .button:hover {
              background: #45a049;
            }
            .link-box {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 5px;
              margin: 15px 0;
              word-break: break-all;
              font-size: 12px;
              color: #666;
            }
            .copy-button {
              background: #2196F3;
              color: white;
              border: none;
              padding: 8px 15px;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 10px;
              font-size: 12px;
            }
            .copy-button:hover {
              background: #1976D2;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h2>PDF Generated Successfully!</h2>
            
            <div class="file-info">
              <div class="file-name">
                <strong>File Name:</strong><br>
                ${result.fileName}
              </div>
            </div>
            
            <a href="${result.fileUrl}" target="_blank" class="button">
              Open PDF
            </a>
            
            <div class="link-box">
              <strong>Direct Link:</strong><br>
              ${result.fileUrl}
              <button class="copy-button" onclick="copyToClipboard('${result.fileUrl}')">
                Copy Link
              </button>
            </div>
          </div>
          
          <script>
            function copyToClipboard(text) {
              const textarea = document.createElement('textarea');
              textarea.value = text;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
              
              const button = document.querySelector('.copy-button');
              const originalText = button.textContent;
              button.textContent = 'Copied!';
              setTimeout(() => {
                button.textContent = originalText;
              }, 2000);
            }
          </script>
        </body>
      </html>
    `;
    
    SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createHtmlOutput(html)
        .setWidth(600)
        .setHeight(500),
      'PDF Download'
    );
  } else {
    SpreadsheetApp.getUi().alert('Error generating PDF: ' + (result ? result.error : 'Unknown error'));
  }
}

// Function to save a range as PDF with exact dimensions
function saveInvoicingRangeAsPdf() {
  Logger.log("--- saveInvoicingRangeAsPdf function execution started ---");
  
  const sheetName = "Invoicing";
  const rangeA1Notation = "A1:G49";
  const DPI = 96; // Standard screen DPI
  
  try {
    // Get or create the "Invoices_PDF" folder
    let folder;
    const folderName = "Invoices_PDF";
    const folderIterator = DriveApp.getFoldersByName(folderName);
    
    if (folderIterator.hasNext()) {
      folder = folderIterator.next();
      Logger.log(`Found existing folder: "${folderName}"`);
    } else {
      folder = DriveApp.createFolder(folderName);
      Logger.log(`Created new folder: "${folderName}"`);
    }

    // Open the spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`Error: Sheet "${sheetName}" not found in spreadsheet ID "${SPREADSHEET_ID}".`);
      return {
        success: false,
        error: `Sheet "${sheetName}" not found`
      };
    }
    
    Logger.log(`Found sheet "${sheetName}", preparing to export range ${rangeA1Notation}...`);
    
    // Get the range and calculate exact pixel dimensions
    const range = sheet.getRange(rangeA1Notation);
    const startRow = range.getRow();
    const endRow = range.getLastRow();
    const startCol = range.getColumn();
    const endCol = range.getLastColumn();
    
    // Calculate exact pixel dimensions
    let totalPixelWidth = 0;
    for (let col = startCol; col <= endCol; col++) {
      totalPixelWidth += sheet.getColumnWidth(col);
    }
    
    let totalPixelHeight = 0;
    for (let row = startRow; row <= endRow; row++) {
      totalPixelHeight += sheet.getRowHeight(row);
    }
    
    // Convert to inches for PDF sizing
    const widthInInches = totalPixelWidth / DPI;
    const heightInInches = totalPixelHeight / DPI;
    
    Logger.log(`Exact dimensions: ${totalPixelWidth}px x ${totalPixelHeight}px`);
    Logger.log(`Converted to inches: ${widthInInches.toFixed(4)}" x ${heightInInches.toFixed(4)}"`);
    
    // Create timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:\-]/g, '').split('.')[0]; 
    const fileName = `Invoice_${timestamp}.pdf`;
    
    // Export URL with EXACT custom dimensions
    const exportUrl = `https://docs.google.com/spreadsheets/d/${ss.getId()}/export?` +
      `format=pdf&` +
      `gid=${sheet.getSheetId()}&` +
      `range=${encodeURIComponent(rangeA1Notation)}&` +
      `size=${widthInInches.toFixed(4)}x${heightInInches.toFixed(4)}&` + // EXACT custom dimensions
      `scale=1&` + // No scaling (100%)
      `top_margin=0&bottom_margin=0&left_margin=0&right_margin=0&` + // No margins
      `gridlines=false&` +
      `printnotes=false&` +
      `horizontal_alignment=LEFT&` +
      `vertical_alignment=TOP&` +
      `printtitle=false&` +
      `sheetnames=false&` +
      `pagenum=UNDEFINED&` + // No page numbers
      `attachment=false`;
    
    Logger.log("Export URL with exact dimensions: " + exportUrl);
    
    // Try the export with exact dimensions
    const token = ScriptApp.getOAuthToken();
    const response = UrlFetchApp.fetch(exportUrl, {
      method: 'get',
      headers: {'Authorization': 'Bearer ' + token},
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const pdfBlob = response.getBlob().setName(fileName);
      const file = folder.createFile(pdfBlob);
      
      Logger.log(`Successfully saved PDF with exact dimensions: "${file.getName()}" to "${folderName}" folder. URL: ${file.getUrl()}`);
      console.log(`Successfully saved PDF with exact dimensions: "${file.getName()}" to "${folderName}" folder. URL: ${file.getUrl()}`);
      
      return {
        success: true,
        fileId: file.getId(),
        fileName: file.getName(),
        fileUrl: file.getUrl()
      };
    } else {
      // If URL method fails with exact dimensions
      Logger.log(`Error: PDF export failed with status ${response.getResponseCode()}`);
      throw new Error(`PDF export failed with status ${response.getResponseCode()}`);
    }
  } catch (e) {
    Logger.log(`Exception in saveInvoicingRangeAsPdf: ${e.toString()}\nStack: ${e.stack}`);
    console.error(`Exception in saveInvoicingRangeAsPdf: ${e.toString()}\nStack: ${e.stack}`);
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Creates a web app entry point that allows for direct download of the generated PDF.
 * To use this:
 * 1. Deploy the script as a web app (Publish > Deploy as web app)
 * 2. Set access to "Anyone, even anonymous" or appropriate level
 * 3. Visit the web app URL to generate and download the PDF
 */
function doGet(request = {}) {
  try {
    const { parameter = {} } = request;
    
    console.log('=== doGet RECEIVED REQUEST ===');
    console.log('Query parameters:', JSON.stringify(parameter));
    console.log('isPOSOrder parameter:', parameter.isPOSOrder);
    console.log('posData parameter exists:', !!parameter.posData);
    console.log('posData parameter length:', parameter.posData ? parameter.posData.length : 0);
    
    // Check if this is a POS order
    if (parameter.isPOSOrder === 'true' && parameter.posData) {
      console.log('Detected POS order via GET request');
      try {
        // Decode base64 encoded POS data
        const posDataDecoded = Utilities.base64Decode(decodeURIComponent(parameter.posData));
        const posDataString = Utilities.newBlob(posDataDecoded).getDataAsString();
        const posOrderData = JSON.parse(posDataString);
        
        console.log('Successfully decoded and parsed POS data:', JSON.stringify(posOrderData));
        
        if (posOrderData.receiptId) {
          console.log('receiptId found:', posOrderData.receiptId, '- Processing as POS order');
          // Handle POS order
          const result = submitPOSOrder(posOrderData);
          
          return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
        } else {
          console.error('POS data missing receiptId:', Object.keys(posOrderData));
        }
      } catch (decodeError) {
        console.error('Error decoding/parsing POS data:', decodeError.toString());
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Error decoding POS data: ' + decodeError.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Default behavior: PDF generation (existing functionality)
    console.log('Processing as PDF generation request');
    // Create the PDF and get the file info
    const result = saveInvoicingRangeAsPdf();
    
    if (result && result.success) {
      // Create HTML with auto-download script
      const fileId = result.fileId;
      const fileName = result.fileName;
      
      const htmlTemplate = HtmlService.createTemplate(
        `<!DOCTYPE html>
        <html>
          <head>
            <base target="_top">
            <script>
              window.onload = function() {
                // Redirect to the direct download URL
                window.location.href = 'https://drive.google.com/uc?export=download&id=<?= fileId ?>';
                
                // Show status
                document.getElementById('status').innerHTML = 'Your download should begin automatically. If not, <a href="https://drive.google.com/uc?export=download&id=<?= fileId ?>">click here</a>.';
              }
            </script>
          </head>
          <body>
            <h3>Downloading Invoice PDF...</h3>
            <p id="status">Preparing download...</p>
          </body>
        </html>`
      );
      
      // Bind the file ID to the template
      htmlTemplate.fileId = fileId;
      
      // Return the HTML page that triggers the download
      return HtmlService.createHtmlOutput(htmlTemplate.evaluate())
        .setTitle('Invoice PDF Download');
    } else {
      // Return error page
      return HtmlService.createHtmlOutput(
        `<h3>Error Generating PDF</h3>
         <p>${result ? result.error : 'Unknown error occurred'}</p>
         <p><a href="javascript:history.back()">Go Back</a></p>`
      );
    }
  } catch (error) {
    console.error('Error in doGet:', error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to show Input Order dialog
function showInputOrderDialog() {
  const html = HtmlService.createHtmlOutputFromFile('InputOrderDialog')
    .setWidth(800)
    .setHeight(500)
    .setTitle('Input Order Entry');
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Input Order Entry');
}



// Function to get customer data from Sheet1 for dropdowns
function getCustomerData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DATA_ENTRY_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    const customers = [];
    const uniqueCustomers = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const customerName = data[i][2]; // Column C (CustomerName)
      const instansi = data[i][3]; // Column D (Instansi)
      const phoneNumber = data[i][4]; // Column E (PhoneNumber)
      const orderDetails = data[i][7]; // Column H (OrderDetails)
      
      if (customerName && !uniqueCustomers.has(customerName)) {
        uniqueCustomers.add(customerName);
        customers.push({
          name: customerName,
          instansi: instansi || '',
          phone: phoneNumber || '',
          orderDetails: orderDetails || ''
        });
      }
    }
    
    return customers;
  } catch (error) {
    console.error('Error getting customer data:', error);
    return [];
  }
}

// Function to get unique order types from Sheet1
function getOrderTypes() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DATA_ENTRY_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const orderTypes = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const orderDetails = data[i][7]; // Column H (OrderDetails)
      if (orderDetails) {
        orderTypes.add(orderDetails);
      }
    }
    
    return Array.from(orderTypes);
  } catch (error) {
    console.error('Error getting order types:', error);
    return [];
  }
}

// Function to submit order data to OrderData sheet
function submitOrderData(formData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(ORDER_DATA_SHEET_NAME);
    
    // Get the last row to append data
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    
    // Prepare data for columns D-N (extended to include Discount, Down Payment, and Extracted Price)
    const rowData = [
      formData.bayar,              // Column D - Bayar
      formData.nama,               // Column E - Nama
      formData.instansi,           // Column F - Instansi
      formData.nomor,              // Column G - Nomor
      formData.jenisPesanan,       // Column H - Jenis Pesanan
      formData.qty,                // Column I - QTY
      formData.tgl,                // Column J - TGL
      formData.dl,                 // Column K - DL
      formData.discount || '',     // Column L - Discount
      formData.downPayment || '',  // Column M - Down Payment
      formData.extractedPrice || '' // Column N - Extracted Price
    ];
    
    // Set data in columns D-N for the new row
    const range = sheet.getRange(newRow, 4, 1, 11); // Row, Column D (4), 1 row, 11 columns (D-N)
    range.setValues([rowData]);
    
    console.log('Order data submitted successfully');
    return { success: true, message: 'Order entry added successfully!' };
    
  } catch (error) {
    console.error('Error submitting order data:', error);
    return { success: false, error: error.toString() };
    }
}

// Function to handle POS orders submission
function submitPOSOrder(posOrderData) {
  try {
    console.log('=== POS ORDER PROCESSING START ===');
    console.log('Received POS order data:', JSON.stringify(posOrderData));
    console.log('Looking for sheet:', CASHIER_ORDERS_SHEET_NAME);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CASHIER_ORDERS_SHEET_NAME);
    
    if (!sheet) {
      console.error(`Sheet "${CASHIER_ORDERS_SHEET_NAME}" not found`);
      console.log('Available sheets:', spreadsheet.getSheets().map(s => s.getName()));
      throw new Error(`Sheet "${CASHIER_ORDERS_SHEET_NAME}" not found`);
    }
    
    console.log('Found sheet:', sheet.getName());
    
    // Validate posOrderData structure
    if (!posOrderData.items || !Array.isArray(posOrderData.items)) {
      throw new Error('Invalid POS order data: items array missing');
    }
    
    // Format items as readable string
    const formattedItems = posOrderData.items.map(item => {
      let itemStr = `${item.name || 'Unknown Item'} (${item.quantity || 0})`;
      
      // Add model code if available
      if (item.modelCode) {
        itemStr += ` [${item.modelCode}]`;
      }
      
      // Add dimensions if available
      if (item.width && item.height) {
        itemStr += ` (${item.width}m x ${item.height}m)`;
      }
      
      // Add case variant if available
      if (item.caseVariant) {
        itemStr += ` - Casing: ${item.caseVariant}`;
      }
      
      // Add lamination if available
      if (item.laminationVariant) {
        itemStr += ` - Laminasi: ${item.laminationVariant}`;
      }
      
      const subtotal = item.subtotal || 0;
      itemStr += ` - Rp ${subtotal.toLocaleString('id-ID')}`;
      
      return itemStr;
    }).join('; ');
    
    console.log('Formatted items:', formattedItems);
    
    // Prepare row data according to sheet columns:
    // Receipt ID | Timestamp | Cashier | Customer Name | Phone Number | Institution | Items | Subtotal | Discount | Total | Payment Method
    const rowData = [
      posOrderData.receiptId || '',
      new Date(),
      posOrderData.cashier || 'POS Kasir',
      posOrderData.customerName || '',
      posOrderData.phoneNumber || '',
      posOrderData.institution || '',
      formattedItems,
      posOrderData.subtotal || 0,
      posOrderData.discount || 0,
      posOrderData.total || 0,
      posOrderData.paymentMethod || 'Cash'
    ];
    
    console.log('Row data to append:', rowData);
    
    // Append the new row
    sheet.appendRow(rowData);
    
    console.log('POS order data appended to sheet successfully');
    console.log('=== POS ORDER PROCESSING END ===');
    
    // Send email notification for POS orders
    sendPOSOrderEmail(posOrderData, formattedItems);
    
    return { success: true, message: 'POS order saved successfully!' };
    
  } catch (error) {
    console.error('Error in submitPOSOrder:', error.toString());
    console.error('Error stack:', error.stack);
    return { success: false, error: error.toString() };
  }
}

// Send email notification for POS orders
function sendPOSOrderEmail(orderData, formattedItems) {
  try {
    const subject = `New POS Order: ${orderData.receiptId} - ${orderData.cashier}`;
    
    const emailBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #FF5E01;">New POS Order Received</h2>
        <p><strong>Receipt ID:</strong> ${orderData.receiptId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Cashier:</strong> ${orderData.cashier}</p>
        
        ${orderData.customerName ? `<p><strong>Customer:</strong> ${orderData.customerName}</p>` : ''}
        ${orderData.phoneNumber ? `<p><strong>Phone:</strong> ${orderData.phoneNumber}</p>` : ''}
        ${orderData.institution ? `<p><strong>Institution:</strong> ${orderData.institution}</p>` : ''}
        
        <h3>Order Details</h3>
        <pre style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${formattedItems}</pre>
        
        <h3>Payment Summary</h3>
        <p><strong>Subtotal:</strong> Rp ${Number(orderData.subtotal).toLocaleString('id-ID')}</p>
        ${orderData.discount > 0 ? `<p><strong>Discount:</strong> Rp ${Number(orderData.discount).toLocaleString('id-ID')}</p>` : ''}
        <p><strong>Total:</strong> Rp ${Number(orderData.total).toLocaleString('id-ID')}</p>
        <p><strong>Payment Method:</strong> ${orderData.paymentMethod || 'Cash'}</p>
        
        <p style="margin-top: 20px;">
          View all orders in the <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}" target="_blank">Google Sheet</a>
        </p>
      </body>
    </html>
    `;
    
    // Send email to each admin
    ADMIN_EMAILS.forEach(adminEmail => {
      GmailApp.sendEmail(
        adminEmail,
        subject,
        // Plain text fallback
        `New POS Order: ${orderData.receiptId}\nCashier: ${orderData.cashier}\nItems: ${formattedItems}\nTotal: Rp ${Number(orderData.total).toLocaleString('id-ID')}`,
        { 
          htmlBody: emailBody,
          name: "POS Order Notification" 
        }
      );
    });
    
    console.log('POS order email notifications sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending POS order email notification:', error);
    return false;
  }
}

// Test function for POS order submission - you can run this directly in Apps Script
function testPOSOrder() {
  const testData = {
    receiptId: "TRX-TEST-" + new Date().getTime(),
    cashier: "Test Kasir",
    customerName: "Test Customer",
    phoneNumber: "081234567890",
    institution: "Test Institution",
    items: [
      {
        name: "Test Product 1",
        quantity: 2,
        price: 50000,
        subtotal: 100000,
        modelCode: "TEST-001"
      },
      {
        name: "Test Product 2",
        quantity: 1,
        price: 75000,
        subtotal: 75000,
        caseVariant: "Hard Case"
      }
    ],
    subtotal: 175000,
    discount: 0,
    total: 175000,
    paymentMethod: "Cash"
  };
  
  console.log('Testing POS order submission...');
  const result = submitPOSOrder(testData);
  console.log('Test result:', result);
  return result;
}