// Replace with your Google Sheet ID
const SPREADSHEET_ID = '1bK-hq2TDTGElXt0sJbrhGy2ka--leelHlOiH9EhUDhk';
const DATA_ENTRY_SHEET_NAME = "Sheet1";
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
    
    // Parse the incoming data
    var data = parseFormData(contents);
    
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
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
};

// Parse the form data
function parseFormData(postData) {
  var data = {};
  var parameters = postData.split('&');
  
  for (var i = 0; i < parameters.length; i++) {
    var keyValue = parameters[i].split('=');
    if (keyValue.length >= 2) {
      // For DesignNote, we need to handle it specially since we manually encoded it
      if (keyValue[0] === 'DesignNote') {
        data[keyValue[0]] = decodeURIComponent(keyValue[1]);
      } else {
        // For other fields, handle normally
        var value = keyValue[1].replace(/\+/g, ' ');
        data[keyValue[0]] = decodeURIComponent(value);
      }
    }
  }
  
  return data;
}

// Format order details as human-readable semicolon-separated string
function formatOrderDetails(orderDetailsStr) {
  try {
    // Parse the JSON string
    const orderDetails = JSON.parse(orderDetailsStr);
    
    // Format each item and join with semicolons
    return orderDetails.map(item => {
      // Replace '+' with spaces in the name
      const name = item.name.replace(/\+/g, ' ');
      return `${name} (${item.quantity}) - Rp ${Number(item.price).toLocaleString('id-ID')}`;
    }).join('; ');
  } catch (error) {
    console.error('Error formatting order details:', error);
    return orderDetailsStr; // Return original if parsing fails
  }
}

// Clean and format text fields
function cleanTextFormat(text) {
  if (!text) return '';
  
  // Format newlines only (+ is already handled in parseFormData)
  return text.replace(/%0A/g, '\n').replace(/%0D/g, '');
}

// Send email notification about new order
function sendOrderEmail(orderData) {
  try {
    // Create email subject
    const subject = `New Order: ${orderData.InvoiceNumber} - ${orderData.CustomerName}`;
    
    // Format the order details for email
    let orderItems = [];
    try {
      const parsedItems = JSON.parse(orderData.OrderDetails.replace(/&quot;/g, '"'));
      orderItems = parsedItems.map(item => 
        `- ${item.name} (${item.quantity}) - Rp ${Number(item.price).toLocaleString('id-ID')}`
      ).join('\n');
    } catch (e) {
      // If parsing fails, use the formatted string as is
      orderItems = orderData.OrderDetails;
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
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

// Append data to Google Sheet
function appendToGoogleSheet(data) {
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
  
  // DesignNote is already properly decoded in parseFormData
  
  // Format order details as readable string if it exists
  if (data.OrderDetails) {
    data.OrderDetails = formatOrderDetails(data.OrderDetails);
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
  
  // Append the new row
  sheet.appendRow(rowData);
  
  // Send email notification
  sendOrderEmail(data);
}

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
function doGet() {
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
}
