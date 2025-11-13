// --- CONFIGURATION ---
// 1. Get your Sheet ID from its URL:
//    https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
const SHEET_ID = "1hxmarJWkTSEENZTIMuqPyiIpd763VGcO8siJc_No-ek";

// 2. Get your Folder ID from its URL in Google Drive:
//    https://drive.google.com/drive/folders/THIS_IS_THE_ID
const FOLDER_ID = "14i2wwfoJMYbQoUeK3N-Gs9sLiprEynNQ";

// 3. This is the name of the sheet (tab) in your spreadsheet.
const SHEET_NAME = "loker"; // IMPORTANT: Check your spreadsheet. If the tab name is not "Sheet1", change this value!
// ---------------------


/**
 * Helper function to create a file in Drive and return its URL
 */
function createFileInDrive(folder, base64Data, mimeType, fileName) {
  const decodedFile = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedFile, mimeType, fileName);
  const file = folder.createFile(blob);
  return file.getUrl();
}

/**
 * This function runs when your React app sends a POST request.
 * It's the main entry point for your web app.
 */
function doPost(e) {
  try {
    // Enable CORS for cross-origin requests
    const output = ContentService.createTextOutput();
    
    // 1. Parse the incoming JSON data from React
    const data = JSON.parse(e.postData.contents);

    // 2. Get the destination folder in Google Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    
    // 3. Create the CV file
    const cvUrl = createFileInDrive(
      folder, 
      data.cvBase64, 
      data.cvMimeType, 
      data.cvFileName
    );
    
    // 4. Create the portfolio file (if provided)
    let fileUrl = '';
    if (data.fileBase64 && data.fileBase64.trim() !== '') {
      fileUrl = createFileInDrive(
        folder,
        data.fileBase64,
        data.fileMimeType,
        data.fileName
      );
    }
    
    // --- Now, let's write to the Google Sheet ---
    
    // 5. Open the Spreadsheet
    const spreadSheet = SpreadsheetApp.openById(SHEET_ID);
    
    // 6. Get the specific sheet (tab) by its name
    const sheet = spreadSheet.getSheetByName(SHEET_NAME);
    
    // 7. Append a new row with all the data
    //    The order must match your new columns: nama, email, nomor, source, alamat, cv, file
    sheet.appendRow([
      data.nama,
      data.email,
      data.nomor,
      data.source,
      data.alamat || '',  // Add the alamat field
      cvUrl,     // Add the new CV URL
      fileUrl    // Add the other file URL
    ]);

    // 8. Send a "success" response back to the React app with CORS headers
    const response = {
      status: 'success', 
      cvUrl: cvUrl,
      fileUrl: fileUrl 
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 9. If anything goes wrong, send an "error" response
    Logger.log('Error in doPost:', error); // Logs the error for debugging
    Logger.log('Error details:', error.toString());
    Logger.log('Error stack:', error.stack);
    
    const errorResponse = {
      status: 'error', 
      message: error.toString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request (for testing/debugging)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'Job Application API is running. Use POST to submit applications.',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}