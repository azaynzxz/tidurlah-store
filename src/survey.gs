// Survey Google Sheet ID
const SURVEY_SPREADSHEET_ID = '17wOp8Xgin6u6NNBPbfTnBDeu693uHAgAIF6CkY7a2rI';
const SURVEY_SHEET_NAME = "Survey Responses";
const TIME_STAMP_COLUMN_NAME = "Timestamp";

// Admin email addresses to receive notifications
const ADMIN_EMAILS = ['achmad3zaini@gmail.com', 'halo.idcardlampung@gmail.com'];

// Initialize the sheet
function getSheet() {
  const ss = SpreadsheetApp.openById(SURVEY_SPREADSHEET_ID);
  if (!ss) {
    throw new Error(`Could not open spreadsheet with ID: ${SURVEY_SPREADSHEET_ID}`);
  }
  Logger.log(`Successfully opened spreadsheet: ${ss.getName()}`);

  const sheet = ss.getSheetByName(SURVEY_SHEET_NAME);
  if (!sheet) {
    throw new Error(`Could not find sheet named: ${SURVEY_SHEET_NAME}`);
  }
  Logger.log(`Successfully found sheet: ${SURVEY_SHEET_NAME}`);

  return sheet;
}

// Clean and format text fields
function cleanTextFormat(text) {
  if (!text) return '';
  return text.replace(/\+/g, ' ').replace(/%0A/g, '\n').replace(/%0D/g, '');
}

// Parse form data from URL-encoded string
function parseFormData(contents) {
  Logger.log(`Parsing form data: ${contents}`);
  var data = {};
  if (!contents) return data;

  var params = contents.split('&');
  params.forEach(function(param) {
    var parts = param.split('=');
    if (parts.length === 2) {
      var key = decodeURIComponent(parts[0]);
      var value = decodeURIComponent(parts[1]);
      
      // For all fields, store the decoded value directly
      data[key] = value;
      Logger.log(`Parsed form field - ${key}: ${value}`);
    }
  });
  
  return data;
}

// Handle POST requests from the survey website
function doPost(request = {}) {
  try {
    Logger.log("Received POST request");
    Logger.log("Request data: " + JSON.stringify(request));
    
    // Set CORS headers
    var headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // Parse the form data
    var data = {};
    if (request.postData) {
      Logger.log("Request postData type: " + request.postData.type);
      Logger.log("Request postData contents: " + request.postData.contents);
      
      if (request.postData.type === "application/x-www-form-urlencoded") {
        data = parseFormData(request.postData.contents);
      } else {
        try {
          data = JSON.parse(request.postData.contents);
        } catch (e) {
          Logger.log("Error parsing JSON: " + e.toString());
          data = parseFormData(request.postData.contents);
        }
      }
    }
    
    Logger.log("Parsed data: " + JSON.stringify(data));
    
    // Add timestamp
    data[TIME_STAMP_COLUMN_NAME] = new Date();
    
    // Get the sheet
    var sheet = getSheet();
    
    // Append to Google Sheet
    appendToSurveySheet(sheet, data);
    Logger.log("Successfully appended data to sheet");
    
    // Send email notification
    sendSurveyNotification(data);
    Logger.log("Successfully sent email notification");
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Survey response saved successfully"
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
    
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    Logger.log("Error stack: " + error.stack);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

// Append data to Survey Sheet
function appendToSurveySheet(sheet, data) {
  try {
    // Get headers from first row
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("Sheet headers: " + JSON.stringify(headers));
    
    // Map data to match header order
    var rowData = headers.map(header => {
      let value = data[header] || '';
      
      // Clean text format for all string values
      if (typeof value === 'string') {
        // For UsefulFeatures, make sure we preserve the comma-space format
        if (header === 'UsefulFeatures') {
          value = value.trim();
        } else {
          value = cleanTextFormat(value);
        }
      }
      
      Logger.log(`Mapping header '${header}' to value: ${value}`);
      return value;
    });
    
    Logger.log("Row data to append: " + JSON.stringify(rowData));
    
    // Append the new row
    sheet.appendRow(rowData);
    Logger.log("Successfully appended row");
    return true;
  } catch (error) {
    Logger.log("Error in appendToSurveySheet: " + error.toString());
    Logger.log("Error stack: " + error.stack);
    throw error;
  }
}

// Send email notification about new survey response
function sendSurveyNotification(surveyData) {
  try {
    // Create email subject
    const subject = `New Survey Response from ${surveyData.Name || 'Anonymous'}`;
    
    // Create email body
    const emailBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #FF5E01;">New Survey Response Received</h2>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        
        <h3>Response Details</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <p><strong>Name/Alias:</strong> ${surveyData.Name || 'Anonymous'}</p>
          <p><strong>Found Website Through:</strong> ${surveyData.FoundThrough || '-'}</p>
          <p><strong>Navigation Ease:</strong> ${surveyData.NavigationEase || '-'}</p>
          <p><strong>Product Finding:</strong> ${surveyData.ProductFinding || '-'}</p>
          <p><strong>Loading Speed:</strong> ${surveyData.LoadingSpeed || '-'}</p>
          <p><strong>Product Info Satisfaction:</strong> ${surveyData.ProductInfoSatisfaction || '-'}</p>
          <p><strong>Checkout Process:</strong> ${surveyData.CheckoutProcess || '-'}</p>
          <p><strong>Price Comparison:</strong> ${surveyData.PriceComparison || '-'}</p>
          <p><strong>Useful Features:</strong> ${Array.isArray(surveyData.UsefulFeatures) ? surveyData.UsefulFeatures.join(', ') : surveyData.UsefulFeatures || '-'}</p>
          <p><strong>Desired Features:</strong> ${surveyData.DesiredFeatures || '-'}</p>
          <p><strong>Likelihood to Recommend:</strong> ${surveyData.RecommendLikelihood || '-'}</p>
          <p><strong>Improvement Suggestions:</strong> ${surveyData.ImprovementSuggestions || '-'}</p>
        </div>
        
        <p style="margin-top: 20px;">
          View all responses in the <a href="https://docs.google.com/spreadsheets/d/${SURVEY_SPREADSHEET_ID}" target="_blank">Google Sheet</a>
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
        `New Survey Response\nName: ${surveyData.Name || 'Anonymous'}\nDate: ${new Date().toLocaleString()}`,
        { 
          htmlBody: emailBody,
          name: "Survey Notification" 
        }
      );
    });
    
    return true;
  } catch (error) {
    Logger.log("Error sending survey notification: " + error.toString());
    return false;
  }
}

// Test function to verify sheet access
function testSheetAccess() {
  try {
    var sheet = getSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("Headers: " + JSON.stringify(headers));
    Logger.log("Sheet is ready to receive data");
    return true;
  } catch (error) {
    Logger.log("Error testing sheet access: " + error.toString());
    throw error;
  }
} 