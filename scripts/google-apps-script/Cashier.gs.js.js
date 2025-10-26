// POS-specific Google Apps Script for Cashier Orders
// Replace with your POS Google Sheet ID
const POS_SPREADSHEET_ID = '1Fs_dpT85Fvp2XODXxNPiH1zu5oT1ud8rzyuMxzZdhA4';
const CASHIER_ORDERS_SHEET_NAME = "Cashier Orders";

// Admin email addresses to receive notifications
const ADMIN_EMAILS = ['achmad3zaini@gmail.com', 'halo.idcardlampung@gmail.com'];

// Handle POST requests from POS system
const doPost = (request = {}) => {
  try {
    const { postData: { contents, type } = {} } = request;
    
    console.log('=== POS doPost RECEIVED REQUEST ===');
    console.log('Raw POST data:', contents);
    console.log('Content type:', type);
    console.log('Contents length:', contents ? contents.length : 0);
    
    if (!contents) {
      throw new Error('No POST data received');
    }
    
    // Parse the POS order data (should be JSON)
    let posOrderData;
    try {
      posOrderData = JSON.parse(contents);
      console.log('Successfully parsed POS JSON data:', JSON.stringify(posOrderData));
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.toString());
      throw new Error('Invalid JSON data received');
    }
    
    // Validate POS order data
    if (!posOrderData.receiptId) {
      throw new Error('Missing receiptId in POS order data');
    }
    
    // Process the POS order
    const result = submitPOSOrder(posOrderData);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error in POS doPost:', error.toString());
    console.error('Error stack:', error.stack);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
};

// Handle GET requests (for testing and fallback)
const doGet = (request = {}) => {
  try {
    const { parameter = {} } = request;
    
    console.log('=== POS doGet RECEIVED REQUEST ===');
    console.log('Query parameters:', JSON.stringify(parameter));
    
    // Check if this is a POS order with parameters
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
          throw new Error('POS data missing receiptId');
        }
      } catch (decodeError) {
        console.error('Error decoding/parsing POS data:', decodeError.toString());
        throw new Error('Error processing POS data: ' + decodeError.toString());
      }
    }
    
    // Return test page for non-POS requests
    return HtmlService.createHtmlOutput(`
      <html>
        <body>
          <h2>POS Order System - Test Page</h2>
          <p>This is the POS-specific Google Apps Script endpoint.</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
          <p>Sheet ID: ${POS_SPREADSHEET_ID}</p>
          <p>Target Sheet: ${CASHIER_ORDERS_SHEET_NAME}</p>
          <button onclick="testPOSOrder()">Test POS Order Submission</button>
          <div id="result"></div>
          
          <script>
            function testPOSOrder() {
              document.getElementById('result').innerHTML = 'Testing...';
              
              const testData = {
                receiptId: "TRX-TEST-" + new Date().getTime(),
                cashier: "Test Kasir",
                customerName: "Test Customer",
                phoneNumber: "081234567890",
                institution: "Test Institution",
                delivery: {
                  recipientName: "Test Recipient",
                  recipientPhone: "081987654321",
                  address: "Jl. Test No. 123, Kelurahan Test, Kecamatan Test, Kota Test"
                },
                items: [
                  {
                    name: "Test Product",
                    quantity: 1,
                    price: 50000,
                    subtotal: 50000
                  }
                ],
                subtotal: 50000,
                discount: 0,
                total: 50000,
                paymentMethod: "Cash"
              };
              
              fetch(window.location.href, {
                method: 'POST',
                body: JSON.stringify(testData)
              })
              .then(response => response.json())
              .then(data => {
                document.getElementById('result').innerHTML = 
                  '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
              })
              .catch(error => {
                document.getElementById('result').innerHTML = 
                  '<div style="color: red;">Error: ' + error.message + '</div>';
              });
            }
          </script>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error in POS doGet:', error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
};

// Function to handle POS orders submission
function submitPOSOrder(posOrderData) {
  try {
    console.log('=== POS ORDER PROCESSING START ===');
    console.log('Received POS order data:', JSON.stringify(posOrderData));
    console.log('Looking for sheet:', CASHIER_ORDERS_SHEET_NAME);
    
    const spreadsheet = SpreadsheetApp.openById(POS_SPREADSHEET_ID);
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
    
    // Format delivery information
    let deliveryInfo = '';
    if (posOrderData.delivery) {
      deliveryInfo = `Penerima: ${posOrderData.delivery.recipientName || ''}\nTelepon: ${posOrderData.delivery.recipientPhone || ''}\nAlamat: ${posOrderData.delivery.address || ''}`;
    }
    
    // Prepare row data according to sheet columns:
    // Receipt ID | Timestamp | Cashier | Customer Name | Phone Number | Institution | Items | Subtotal | Discount | Total | Payment Method | Pengiriman
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
      posOrderData.paymentMethod || 'Cash',
      deliveryInfo
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
        
        ${orderData.delivery ? `
        <h3>Delivery Information</h3>
        <p><strong>Recipient:</strong> ${orderData.delivery.recipientName}</p>
        <p><strong>Recipient Phone:</strong> ${orderData.delivery.recipientPhone}</p>
        <p><strong>Address:</strong></p>
        <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${orderData.delivery.address}</p>
        ` : ''}
        
        <h3>Order Details</h3>
        <pre style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${formattedItems}</pre>
        
        <h3>Payment Summary</h3>
        <p><strong>Subtotal:</strong> Rp ${Number(orderData.subtotal).toLocaleString('id-ID')}</p>
        ${orderData.discount > 0 ? `<p><strong>Discount:</strong> Rp ${Number(orderData.discount).toLocaleString('id-ID')}</p>` : ''}
        <p><strong>Total:</strong> Rp ${Number(orderData.total).toLocaleString('id-ID')}</p>
        <p><strong>Payment Method:</strong> ${orderData.paymentMethod || 'Cash'}</p>
        
        <p style="margin-top: 20px;">
          View all POS orders in the <a href="https://docs.google.com/spreadsheets/d/${POS_SPREADSHEET_ID}" target="_blank">POS Google Sheet</a>
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
        `New POS Order: ${orderData.receiptId}\nCashier: ${orderData.cashier}${orderData.delivery ? `\nDelivery: ${orderData.delivery.recipientName} - ${orderData.delivery.address}` : ''}\nItems: ${formattedItems}\nTotal: Rp ${Number(orderData.total).toLocaleString('id-ID')}`,
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
    delivery: {
      recipientName: "Test Recipient",
      recipientPhone: "081987654321",
      address: "Jl. Test No. 123, Kelurahan Test, Kecamatan Test, Kota Test, Provinsi Test 12345"
    },
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
