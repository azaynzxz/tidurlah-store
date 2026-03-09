/**
 * ============================================================
 * TIDURLAH GRAFIKA — POS Google Apps Script (Normalized)
 * ============================================================
 * 
 * This script handles POS order submissions and stores data
 * across 3 normalized sheets:
 *   1. Orders       — order header info
 *   2. Order_Items  — one row per product per order
 *   3. Deliveries   — delivery details (only for delivery orders)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this entire script
 * 4. Run the `setupSpreadsheet` function ONCE to create sheets
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the deployment URL and update POS_GOOGLE_SHEETS_URL
 *    in your constants/index.ts
 * ============================================================
 */

// ============================================================
// CONFIGURATION
// ============================================================

/**
 * Set this to the ID of an EXISTING spreadsheet if you want to use one.
 * Leave empty ("") to create a new spreadsheet automatically.
 * 
 * You can find the ID in the spreadsheet URL:
 * https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
 */
var SPREADSHEET_ID = "";

/**
 * Name for the new spreadsheet (only used when creating a new one)
 */
var SPREADSHEET_NAME = "Tidurlah POS Database";


// ============================================================
// SETUP — Run this ONCE to create the sheets and headers
// ============================================================

function setupSpreadsheet() {
  var ss;
  
  if (SPREADSHEET_ID) {
    // Use existing spreadsheet
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log("Using existing spreadsheet: " + ss.getUrl());
  } else {
    // Create a new spreadsheet
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    Logger.log("✅ Created new spreadsheet: " + ss.getUrl());
    Logger.log("📋 Spreadsheet ID: " + ss.getId());
    Logger.log("");
    Logger.log("⚠️  IMPORTANT: Copy the Spreadsheet ID above and paste it");
    Logger.log("    into the SPREADSHEET_ID variable at the top of this script.");
    Logger.log("    Then re-deploy the web app.");
  }
  
  // --- Sheet 1: Orders ---
  var ordersSheet = getOrCreateSheet(ss, "Orders");
  var ordersHeaders = [
    "Order ID",
    "Timestamp",
    "Channel",
    "Cashier",
    "Customer Name",
    "Customer Phone",
    "Institution",
    "Subtotal",
    "Discount",
    "Total",
    "Down Payment",
    "Remaining Balance",
    "Payment Method",
    "Order Status",
    "Item Count",
    "Items Summary",
    "Promo Code",
    "Promo Discount",
    "Design Note",
    "Is Shipping",
    "Address",
    "Deadline"
  ];
  setupSheetHeaders(ordersSheet, ordersHeaders, "#FF5E01");
  
  // Set column widths for Orders
  ordersSheet.setColumnWidth(1, 220);  // Order ID
  ordersSheet.setColumnWidth(2, 180);  // Timestamp
  ordersSheet.setColumnWidth(3, 80);   // Channel
  ordersSheet.setColumnWidth(4, 130);  // Cashier
  ordersSheet.setColumnWidth(5, 180);  // Customer Name
  ordersSheet.setColumnWidth(6, 160);  // Customer Phone
  ordersSheet.setColumnWidth(7, 150);  // Institution
  ordersSheet.setColumnWidth(8, 120);  // Subtotal
  ordersSheet.setColumnWidth(9, 100);  // Discount
  ordersSheet.setColumnWidth(10, 120); // Total
  ordersSheet.setColumnWidth(11, 120); // Down Payment
  ordersSheet.setColumnWidth(12, 140); // Remaining Balance
  ordersSheet.setColumnWidth(13, 130); // Payment Method
  ordersSheet.setColumnWidth(14, 120); // Order Status
  ordersSheet.setColumnWidth(15, 100); // Item Count
  ordersSheet.setColumnWidth(16, 300); // Items Summary
  ordersSheet.setColumnWidth(17, 120); // Promo Code
  ordersSheet.setColumnWidth(18, 110); // Promo Discount
  ordersSheet.setColumnWidth(19, 200); // Design Note
  ordersSheet.setColumnWidth(20, 90);  // Is Shipping
  ordersSheet.setColumnWidth(21, 250); // Address
  ordersSheet.setColumnWidth(22, 140); // Deadline
  
  // Format currency columns (H:L = Subtotal through Remaining Balance)
  ordersSheet.getRange("H:L").setNumberFormat("#,##0");
  ordersSheet.getRange("R:R").setNumberFormat("#,##0"); // Promo Discount
  
  // --- Sheet 2: Order_Items ---
  var itemsSheet = getOrCreateSheet(ss, "Order_Items");
  var itemsHeaders = [
    "Order ID",
    "Product ID",
    "Product Name",
    "Quantity",
    "Unit Price",
    "Subtotal",
    "Model Code",
    "Case Variant",
    "Lamination",
    "Width (m)",
    "Height (m)",
    "Dimension Text",
    "Area"
  ];
  setupSheetHeaders(itemsSheet, itemsHeaders, "#34A853");
  
  // Set column widths for Order_Items
  itemsSheet.setColumnWidth(1, 220);  // Order ID
  itemsSheet.setColumnWidth(2, 100);  // Product ID
  itemsSheet.setColumnWidth(3, 200);  // Product Name
  itemsSheet.setColumnWidth(4, 80);   // Quantity
  itemsSheet.setColumnWidth(5, 120);  // Unit Price
  itemsSheet.setColumnWidth(6, 120);  // Subtotal
  itemsSheet.setColumnWidth(7, 120);  // Model Code
  itemsSheet.setColumnWidth(8, 130);  // Case Variant
  itemsSheet.setColumnWidth(9, 130);  // Lamination
  itemsSheet.setColumnWidth(10, 100); // Width
  itemsSheet.setColumnWidth(11, 100); // Height
  itemsSheet.setColumnWidth(12, 140); // Dimension Text
  itemsSheet.setColumnWidth(13, 100); // Area
  
  // Format currency columns
  itemsSheet.getRange("E:F").setNumberFormat("#,##0");
  
  // --- Sheet 3: Deliveries ---
  var deliveriesSheet = getOrCreateSheet(ss, "Deliveries");
  var deliveriesHeaders = [
    "Order ID",
    "Recipient Name",
    "Recipient Phone",
    "Address",
    "Ongkir",
    "Delivery Status"
  ];
  setupSheetHeaders(deliveriesSheet, deliveriesHeaders, "#4285F4");
  
  // Set column widths for Deliveries
  deliveriesSheet.setColumnWidth(1, 220);  // Order ID
  deliveriesSheet.setColumnWidth(2, 180);  // Recipient Name
  deliveriesSheet.setColumnWidth(3, 160);  // Recipient Phone
  deliveriesSheet.setColumnWidth(4, 300);  // Address
  deliveriesSheet.setColumnWidth(5, 120);  // Ongkir
  deliveriesSheet.setColumnWidth(6, 130);  // Delivery Status

  // Format currency column
  deliveriesSheet.getRange("E:E").setNumberFormat("#,##0");
  
  // --- Sheet 4: Trash (soft-deleted orders backup) ---
  var trashSheet = getOrCreateSheet(ss, "Trash");
  var trashHeaders = [
    "Order ID", "Timestamp", "Channel", "Cashier", "Customer Name",
    "Customer Phone", "Institution", "Subtotal", "Discount", "Total",
    "Down Payment", "Remaining Balance", "Payment Method", "Order Status",
    "Item Count", "Items Summary", "Promo Code", "Promo Discount",
    "Design Note", "Is Shipping", "Address", "Deadline",
    "Deleted At", "Deleted By"
  ];
  setupSheetHeaders(trashSheet, trashHeaders, "#EA4335");
  trashSheet.setFrozenRows(1);
  
  // Remove the default "Sheet1" if it's empty
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 4) {
    ss.deleteSheet(defaultSheet);
  }
  
  // Freeze header rows
  ordersSheet.setFrozenRows(1);
  itemsSheet.setFrozenRows(1);
  deliveriesSheet.setFrozenRows(1);
  
  Logger.log("");
  Logger.log("✅ Setup complete! Sheets created:");
  Logger.log("   📄 Orders (22 columns)");
  Logger.log("   📄 Order_Items (13 columns)");
  Logger.log("   📄 Deliveries (6 columns)");
  Logger.log("   📄 Trash (24 columns)");
  Logger.log("");
  Logger.log("Next step: Deploy as Web App and update POS_GOOGLE_SHEETS_URL");
}

/**
 * ============================================================
 * ONE-TIME UTILITY: FIX SWAPPED DATES
 * ============================================================
 * Run this function ONCE from the Apps Script editor to fix orders
 * where Google Sheets confused the day and month (e.g. Sept 3rd instead of March 9th).
 */
function fixSwappedDates() {
  var ss = getSpreadsheet();
  var ordersSheet = ss.getSheetByName("Orders");
  var data = ordersSheet.getDataRange().getValues();
  
  var updatedCount = 0;
  for (var i = 1; i < data.length; i++) {
    var cellValue = data[i][1]; // Column B (Timestamp)
    
    if (!cellValue) continue;
    
    // 1) If Google Sheets parsed it as a Date object but swapped day/month
    if (cellValue instanceof Date) {
      var d = cellValue.getDate();
      var m = cellValue.getMonth() + 1;
      var y = cellValue.getFullYear();
      
      // Since your app launched recently, any month after March (m > 3) is likely reversed!
      // Example: "09/03/2026" became September 3rd (Month 9, Day 3).
      // It should be March 9th (Month 3, Day 9).
      if (m > 3 && y === 2026) {
        // Swap them back, ignoring time totally
        var correctMonth = d;
        var correctDay = m;
        
        var pad2 = function(n) { return (n < 10 ? '0' : '') + n; };
        var newDateStr = y + "-" + pad2(correctMonth) + "-" + pad2(correctDay);
        
        ordersSheet.getRange(i + 1, 2).setValue(newDateStr);
        updatedCount++;
      }
    } 
    // 2) If it's a raw string in the old dd/MM/yyyy format, convert it to yyyy-MM-dd
    else if (typeof cellValue === "string") {
      var str = cellValue.trim();
      
      // Ignore the time format entirely, just grab the date.
      // E.g., "07/03/2026 12:01:53" -> "07/03/2026"
      var datePart = str.split(" ")[0];
      
      if (datePart.indexOf("/") !== -1) {
        var dateParts = datePart.split("/");
        if (dateParts.length === 3) {
          // Indonesian format is explicitly dd/MM/yyyy
          var day = dateParts[0];
          var month = dateParts[1];
          var year = dateParts[2];
          
          var pad2Str = function(n) { return (parseInt(n) < 10 && String(n).length === 1 ? '0' : '') + n; };
          var newDateStr = year + "-" + pad2Str(month) + "-" + pad2Str(day); // Only output yyyy-MM-dd
          
          ordersSheet.getRange(i + 1, 2).setValue(newDateStr);
          updatedCount++;
        }
      }
    }
  }
  
  Logger.log("✅ Done fixing dates! Updated " + updatedCount + " rows.");
}


// ============================================================
// WEB APP HANDLERS — These handle incoming requests
// ============================================================

/**
 * Handle GET requests (for testing / health check)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "health";
  
  if (action === "health") {
    return createJsonResponse({
      success: true,
      message: "Tidurlah POS API is running",
      timestamp: new Date().toISOString(),
      version: "2.0.0"
    });
  }
  
  if (action === "orders") {
    return getRecentOrders(e);
  }
  
  if (action === "dashboard") {
    return getDashboardData();
  }
  
  if (action === "monthly") {
    return getMonthlyReport(e);
  }
  
  return createJsonResponse({
    success: false,
    error: "Unknown action: " + action
  });
}

/**
 * Handle POST requests (order submissions)
 */
function doPost(e) {
  try {
    // Parse the incoming JSON
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: "Invalid JSON: " + parseError.message
      });
    }
    
    // Check if it's a status update
    if (data.action === "updateStatus") {
      return updateOrderStatus(data);
    }
    
    // Check if it's a delete
    if (data.action === "deleteOrder") {
      return deleteOrder(data);
    }

    // Check if it's a restore
    if (data.action === "restoreOrder") {
      return restoreOrder(data);
    }
    
    // Otherwise, treat as new order submission or order edit.
    return processNewOrder(data);
    
  } catch (error) {
    Logger.log("Error in doPost: " + error.message);
    return createJsonResponse({
      success: false,
      error: "Server error: " + error.message
    });
  }
}


// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Process a new order (POS or Website) and write to all 3 sheets
 */
function processNewOrder(data) {
  var ss = getSpreadsheet();
  var lock = LockService.getScriptLock();
  
  try {
    // Acquire lock to prevent concurrent writes
    lock.waitLock(10000);
    
    var orderId = data.receiptId || ("TRX-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMddHHmmss"));
    var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var channel = data.channel || "pos";
    
    // Normalize phone number
    var phone = normalizePhone(data.phoneNumber || "");
    
    // If it's an edit, we delete the existing order completely first.
    if (data.isEdit) {
      var oSheet = ss.getSheetByName("Orders");
      var iSheet = ss.getSheetByName("Order_Items");
      var dSheet = ss.getSheetByName("Deliveries");
      var tTrash = ss.getSheetByName("Trash");
      
      // Delete from Orders
      var oData = oSheet.getDataRange().getValues();
      for (var o = oData.length - 1; o >= 1; o--) {
        if (String(oData[o][0]) === String(orderId)) oSheet.deleteRow(o + 1);
      }
      
      // Delete from Order_Items
      if (iSheet) {
        var iData = iSheet.getDataRange().getValues();
        for (var o = iData.length - 1; o >= 1; o--) {
          if (String(iData[o][0]) === String(orderId)) iSheet.deleteRow(o + 1);
        }
      }
      
      // Delete from Deliveries
      if (dSheet) {
        var dData = dSheet.getDataRange().getValues();
        for (var o = dData.length - 1; o >= 1; o--) {
          if (String(dData[o][0]) === String(orderId)) dSheet.deleteRow(o + 1);
        }
      }

      // Also ensure it is removed from Trash if it was deleted previously
      if (tTrash) {
        var tData = tTrash.getDataRange().getValues();
        for (var o = tData.length - 1; o >= 1; o--) {
          if (String(tData[o][0]) === String(orderId)) tTrash.deleteRow(o + 1);
        }
      }
    }

    // --- 1. Write to Orders sheet ---
    var ordersSheet = ss.getSheetByName("Orders");
    
    // Build items summary string (for quick reference, not for querying)
    var itemsSummary = (data.items || []).map(function(item) {
      return item.name + " (" + item.quantity + ")";
    }).join(", ");
    
    var orderRow = [
      orderId,
      timestamp,
      channel,
      data.cashier || (channel === "website" ? "Website" : "POS Kasir"),
      data.customerName || "",
      phone,
      data.institution || "",
      data.subtotal || 0,
      data.discount || 0,
      data.total || 0,
      data.downPayment || 0,
      data.remainingBalance || (data.total || 0),
      data.paymentMethod || (channel === "website" ? "Pending" : "Cash"),
      data.downPayment > 0 ? "partial" : (channel === "website" ? "pending" : "done"),
      (data.items || []).length,
      itemsSummary,
      // Website-specific fields (empty for POS)
      data.promoCode || "",
      data.promoDiscount || 0,
      data.designNote || "",
      data.isShipping ? "Ya" : "",
      data.address || "",
      data.deadline || ""
    ];
    
    ordersSheet.appendRow(orderRow);
    
    // --- 2. Write to Order_Items sheet ---
    var itemsSheet = ss.getSheetByName("Order_Items");
    var items = data.items || [];
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemRow = [
        orderId,
        item.productId || "",
        item.name || "",
        item.quantity || 0,
        item.price || 0,
        item.subtotal || 0,
        item.modelCode || "",
        item.caseVariant || "",
        item.laminationVariant || "",
        item.width || "",
        item.height || "",
        item.dimensionText || "",
        item.area || ""
      ];
      
      itemsSheet.appendRow(itemRow);
    }
    
    // --- 3. Write to Deliveries sheet (if delivery info exists) ---
    var hasDelivery = (data.delivery && data.delivery.recipientName);
    var hasWebsiteShipping = (data.isShipping && data.address);
    
    if (hasDelivery || hasWebsiteShipping) {
      var deliveriesSheet = ss.getSheetByName("Deliveries");
      
      // Try to find ongkir price from items
      var ongkirPrice = 0;
      for (var j = 0; j < items.length; j++) {
        if (items[j].productId == 2002 || (items[j].name && items[j].name.toLowerCase().indexOf("ongkir") !== -1)) {
          ongkirPrice = items[j].price || items[j].subtotal || 0;
          break;
        }
      }
      
      var deliveryRow;
      if (hasDelivery) {
        // POS delivery format (separate recipient)
        deliveryRow = [
          orderId,
          data.delivery.recipientName || "",
          normalizePhone(data.delivery.recipientPhone || ""),
          data.delivery.address || "",
          ongkirPrice,
          "pending"
        ];
      } else {
        // Website shipping format (customer = recipient)
        deliveryRow = [
          orderId,
          data.customerName || "",
          phone,
          data.address || "",
          ongkirPrice,
          "pending"
        ];
      }
      
      deliveriesSheet.appendRow(deliveryRow);
    }
    
    Logger.log("✅ Order saved: " + orderId + " (" + items.length + " items)");
    
    return createJsonResponse({
      success: true,
      orderId: orderId,
      message: "Order saved successfully",
      itemCount: items.length,
      hasDelivery: !!(data.delivery && data.delivery.recipientName)
    });
    
  } catch (error) {
    Logger.log("❌ Error saving order: " + error.message);
    return createJsonResponse({
      success: false,
      error: "Failed to save order: " + error.message
    });
  } finally {
    lock.releaseLock();
  }
}


/**
 * Update order status (for future use)
 * POST body: { action: "updateStatus", orderId: "...", status: "done", deliveryStatus: "shipped" }
 */
function updateOrderStatus(data) {
  var ss = getSpreadsheet();
  
  try {
    var orderId = data.orderId;
    if (!orderId) {
      return createJsonResponse({ success: false, error: "orderId is required" });
    }
    
    // Update Orders sheet status
    if (data.status) {
      var ordersSheet = ss.getSheetByName("Orders");
      var ordersData = ordersSheet.getDataRange().getValues();
      
      for (var i = 1; i < ordersData.length; i++) {
        if (ordersData[i][0] === orderId) {
          ordersSheet.getRange(i + 1, 14).setValue(data.status); // Column N = Order Status (col 14 in new schema)
          break;
        }
      }
    }
    
    // Update Deliveries sheet status
    if (data.deliveryStatus) {
      var deliveriesSheet = ss.getSheetByName("Deliveries");
      var deliveriesData = deliveriesSheet.getDataRange().getValues();
      
      for (var j = 1; j < deliveriesData.length; j++) {
        if (deliveriesData[j][0] === orderId) {
          deliveriesSheet.getRange(j + 1, 6).setValue(data.deliveryStatus); // Column F = Delivery Status
          break;
        }
      }
    }
    
    return createJsonResponse({
      success: true,
      message: "Status updated for " + orderId
    });
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: "Failed to update status: " + error.message
    });
  }
}


/**
 * Get recent orders with their items
 * GET ?action=orders&limit=50&channel=pos
 */
function getRecentOrders(e) {
  var ss = getSpreadsheet();
  var limit = parseInt((e && e.parameter && e.parameter.limit) ? e.parameter.limit : "50");
  var channelFilter = (e && e.parameter && e.parameter.channel) ? e.parameter.channel : "";
  var cashierFilter = (e && e.parameter && e.parameter.cashier) ? e.parameter.cashier : "";
  
  try {
    var ordersSheet = ss.getSheetByName("Orders");
    var itemsSheet = ss.getSheetByName("Order_Items");
    var lastRow = ordersSheet.getLastRow();
    
    if (lastRow <= 1) {
      return createJsonResponse({ success: true, orders: [], total: 0 });
    }
    
    // Read all orders (we filter in memory for flexibility)
    var numCols = 22; // Updated column count (includes Deadline)
    var allOrders = ordersSheet.getRange(2, 1, lastRow - 1, numCols).getValues();
    
    // Build items lookup: orderId -> items[]
    var itemsLastRow = itemsSheet.getLastRow();
    var itemsMap = {};
    if (itemsLastRow > 1) {
      var allItems = itemsSheet.getRange(2, 1, itemsLastRow - 1, 13).getValues();
      for (var i = 0; i < allItems.length; i++) {
        var itemOrderId = allItems[i][0];
        if (!itemsMap[itemOrderId]) itemsMap[itemOrderId] = [];
        itemsMap[itemOrderId].push({
          productId: allItems[i][1],
          name: allItems[i][2],
          quantity: allItems[i][3],
          price: allItems[i][4],
          subtotal: allItems[i][5],
          modelCode: allItems[i][6],
          caseVariant: allItems[i][7],
          lamination: allItems[i][8],
          width: allItems[i][9],
          height: allItems[i][10],
          dimensionText: allItems[i][11],
          area: allItems[i][12]
        });
      }
    }
    
    // Filter and map orders
    var orders = [];
    
    // To support Trash viewer, if includeTrash filter is passed we search the Trash sheet instead
    var isTrashView = (e && e.parameter && e.parameter.channel === "trash");
    
    var sourceOrdersData = allOrders;
    var activeSheetName = "Orders";

    if (isTrashView) {
      var trashSheet = ss.getSheetByName("Trash");
      if (trashSheet && trashSheet.getLastRow() > 1) {
        sourceOrdersData = trashSheet.getRange(2, 1, trashSheet.getLastRow() - 1, 22).getValues();
        activeSheetName = "Trash";
      } else {
        sourceOrdersData = [];
      }
    }

    for (var j = sourceOrdersData.length - 1; j >= 0 && orders.length < limit; j--) {
      var row = sourceOrdersData[j];
      var orderId = row[0];
      if (!orderId) continue;
      
      // Apply channel filter (skip if we are looking at Trash explicitly since ALL items mapped from Trash get "deleted" status visually)
      if (!isTrashView && channelFilter && row[2] !== channelFilter) continue;
      
      // Apply cashier filter
      if (cashierFilter && row[3] !== cashierFilter) continue;
      
      orders.push({
        orderId: orderId,
        timestamp: row[1],
        channel: row[2],
        cashier: row[3],
        customerName: row[4],
        customerPhone: row[5],
        institution: row[6],
        subtotal: row[7],
        discount: row[8],
        total: row[9],
        downPayment: row[10],
        remainingBalance: row[11],
        paymentMethod: row[12],
        orderStatus: isTrashView ? "deleted" : row[13],
        itemCount: row[14],
        itemsSummary: row[15],
        promoCode: row[16],
        promoDiscount: row[17],
        designNote: row[18],
        isShipping: row[19],
        address: row[20],
        deadline: row[21],
        items: itemsMap[orderId] || []
      });
    }
    
    return createJsonResponse({
      success: true,
      orders: orders,
      total: lastRow - 1
    });
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: "Failed to fetch orders: " + error.message
    });
  }
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get or create the spreadsheet
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  
  // Fallback: try to find by name
  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  
  throw new Error("Spreadsheet not found. Please run setupSpreadsheet() first, then set SPREADSHEET_ID.");
}

/**
 * Get or create a sheet by name
 */
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Set up sheet headers with formatting
 */
function setupSheetHeaders(sheet, headers, color) {
  // Clear existing content
  sheet.clear();
  
  // Write headers
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Style the header row
  headerRange.setBackground(color);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  
  // Set row height
  sheet.setRowHeight(1, 36);
  
  // Add filter
  if (sheet.getLastColumn() > 0) {
    var fullRange = sheet.getRange(1, 1, 1, headers.length);
    // Note: createFilter might fail if filter already exists
    try {
      fullRange.createFilter();
    } catch (e) {
      // Filter might already exist, ignore
    }
  }
}

/**
 * Normalize Indonesian phone numbers
 * Converts various formats to: 628xxxxxxxxxx
 */
function normalizePhone(phone) {
  if (!phone) return "";
  
  // Remove all non-digit characters
  var digits = phone.toString().replace(/\D/g, "");
  
  // Handle different formats
  if (digits.indexOf("62") === 0) {
    return digits; // Already has country code
  }
  
  if (digits.indexOf("0") === 0) {
    return "62" + digits.substring(1); // Replace leading 0 with 62
  }
  
  if (digits.indexOf("8") === 0) {
    return "62" + digits; // Add country code
  }
  
  return digits; // Return as-is if format is unknown
}

/**
 * Create a JSON response with CORS headers
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// UTILITY — Data Migration (Optional)
// ============================================================

/**
 * Migrate old flat data to the new normalized structure.
 * Run this ONCE if you have existing data in the old format.
 * 
 * The old data lives in a SEPARATE spreadsheet, so we open it by ID.
 */
function migrateOldData() {
  // ---- CONFIGURATION ----
  var OLD_SPREADSHEET_ID = "1bK-hq2TDTGElXt0sJbrhGy2ka--leelHlOiH9EhUDhk";
  var OLD_SHEET_NAME = "Cashier Orders";
  // -----------------------
  
  // Open the OLD spreadsheet (where the data currently lives)
  var oldSS;
  try {
    oldSS = SpreadsheetApp.openById(OLD_SPREADSHEET_ID);
  } catch (e) {
    Logger.log("❌ Cannot open old spreadsheet! Make sure the ID is correct and you have access.");
    Logger.log("   Error: " + e.message);
    return;
  }
  
  var oldSheet = oldSS.getSheetByName(OLD_SHEET_NAME);
  if (!oldSheet) {
    // List available sheets to help debug
    var sheets = oldSS.getSheets();
    var sheetNames = sheets.map(function(s) { return s.getName(); });
    Logger.log("❌ Sheet '" + OLD_SHEET_NAME + "' not found in old spreadsheet!");
    Logger.log("   Available sheets: " + sheetNames.join(", "));
    return;
  }
  
  Logger.log("📖 Reading old data from: " + oldSS.getName() + " → " + OLD_SHEET_NAME);
  
  // Open the NEW spreadsheet (where we write normalized data)
  var newSS = getSpreadsheet();
  var ordersSheet = newSS.getSheetByName("Orders");
  var itemsSheet = newSS.getSheetByName("Order_Items");
  
  if (!ordersSheet || !itemsSheet) {
    Logger.log("❌ New spreadsheet doesn't have Orders/Order_Items sheets. Run setupSpreadsheet() first!");
    return;
  }
  
  var data = oldSheet.getDataRange().getValues();
  Logger.log("📊 Found " + (data.length - 1) + " rows to migrate (excluding header)");
  
  var migratedCount = 0;
  var skippedCount = 0;
  
  // Skip header row (i = 0)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var receiptId = row[0];   // Receipt ID
    var timestamp = row[1];   // Timestamp
    var cashier = row[2];     // Cashier
    var customerName = row[3]; // Customer Name
    var phone = normalizePhone(row[4]); // Phone Number
    var institution = row[5]; // Institution
    var itemsStr = row[6];    // Items (semicolon-separated string)
    var subtotal = row[7];    // Subtotal
    var discount = row[8];    // Discount
    var total = row[9];       // Total
    var paymentMethod = row[10]; // Payment Method
    
    if (!receiptId) {
      skippedCount++;
      continue; // Skip empty rows
    }
    
    // Parse items string: "ID Card 1S (13) - Casing: tanpa - Rp 104.000; Jasa Express (1) - Rp 25.000"
    var parsedItems = parseItemsString(itemsStr);
    
    // Write to Orders sheet
    var orderRow = [
      receiptId,
      timestamp,
      "migrated",  // Channel — mark old data as migrated
      cashier,
      customerName,
      phone,
      institution,
      subtotal,
      discount,
      total,
      0,  // Down Payment (not in old data)
      total, // Remaining Balance
      paymentMethod || "Cash",
      "done", // Old orders are assumed complete
      parsedItems.length,
      itemsStr, // Keep original as summary
      "",  // Promo Code
      0,   // Promo Discount
      "",  // Design Note
      "",  // Is Shipping
      "",  // Address
      ""   // Deadline
    ];
    ordersSheet.appendRow(orderRow);
    
    // Write individual items to Order_Items sheet
    for (var j = 0; j < parsedItems.length; j++) {
      var item = parsedItems[j];
      var itemRow = [
        receiptId,
        "",           // Product ID (not available in old data)
        item.name,
        item.quantity,
        item.price,
        item.subtotal,
        "",           // Model Code
        item.caseVariant || "",
        "",           // Lamination
        "",           // Width
        "",           // Height
        "",           // Dimension Text
        ""            // Area
      ];
      itemsSheet.appendRow(itemRow);
    }
    
    migratedCount++;
    
    // Log progress every 50 rows
    if (migratedCount % 50 === 0) {
      Logger.log("   ⏳ Migrated " + migratedCount + " orders so far...");
    }
  }
  
  Logger.log("");
  Logger.log("✅ Migration complete!");
  Logger.log("   📦 Orders migrated: " + migratedCount);
  Logger.log("   ⏭️  Rows skipped (empty): " + skippedCount);
  Logger.log("   📄 New spreadsheet: " + newSS.getUrl());
}

/**
 * Parse the old items string format into structured data
 * Input: "ID Card 1S (13) - Casing: tanpa - Rp 104.000; Jasa Express (1) - Rp 25.000"
 * Output: [{ name, quantity, price, subtotal, caseVariant }, ...]
 */
function parseItemsString(itemsStr) {
  if (!itemsStr) return [];
  
  var items = itemsStr.toString().split(";");
  var parsed = [];
  
  for (var i = 0; i < items.length; i++) {
    var itemStr = items[i].trim();
    if (!itemStr) continue;
    
    var result = {
      name: "",
      quantity: 1,
      price: 0,
      subtotal: 0,
      caseVariant: ""
    };
    
    // Extract quantity: "ID Card 1S (13)" → name="ID Card 1S", quantity=13
    var qtyMatch = itemStr.match(/^(.+?)\s*\((\d+)\)/);
    if (qtyMatch) {
      result.name = qtyMatch[1].trim();
      result.quantity = parseInt(qtyMatch[2]);
    }
    
    // Extract casing: "Casing: tanpa"
    var caseMatch = itemStr.match(/Casing:\s*(\w+)/i);
    if (caseMatch) {
      result.caseVariant = caseMatch[1];
    }
    
    // Extract price: "Rp 104.000"
    var priceMatch = itemStr.match(/Rp\s*([\d.]+)/);
    if (priceMatch) {
      result.subtotal = parseInt(priceMatch[1].replace(/\./g, ""));
      if (result.quantity > 0) {
        result.price = Math.round(result.subtotal / result.quantity);
      }
    }
    
    // If no quantity match, use the full string before the first " - " as the name
    if (!result.name) {
      var nameMatch = itemStr.match(/^(.+?)\s*-/);
      result.name = nameMatch ? nameMatch[1].trim() : itemStr;
    }
    
    parsed.push(result);
  }
  
  return parsed;
}


// ============================================================
// DASHBOARD & REPORTING FUNCTIONS
// ============================================================

/**
 * Helper: safely extract a Date from a Sheets cell (could be Date obj or string)
 */
function parseOrderDate(cellValue) {
  if (!cellValue) return null;
  
  // If it's already a Date object (Google Sheets returns this for date cells)
  if (cellValue instanceof Date && !isNaN(cellValue.getTime())) {
    return cellValue;
  }
  
  var str = String(cellValue).trim();
  var datePart = str.split(" ")[0]; // handles "2026-03-02" or "10/7/2025" or "10/7/2025 11:03:36"
  if (!datePart) return null;
  
  var partsSlash = datePart.split("/");
  var partsDash = datePart.split("-");
  var day, month, year;
  
  if (partsSlash.length >= 3) {
    var p0 = parseInt(partsSlash[0], 10);
    var p1 = parseInt(partsSlash[1], 10);
    year = parseInt(partsSlash[2], 10);
    
    // US format MM/dd/yyyy if year is 2025 (migrated data) or if p0 <= 12 and p1 > 12
    if ((year === 2025 && p0 <= 12 && p1 <= 31) || (p0 <= 12 && p1 > 12)) {
      month = p0;
      day = p1;
    } else {
      // Indonesian format dd/MM/yyyy
      day = p0;
      month = p1;
    }
  } else if (partsDash.length >= 3) {
    var d0 = parseInt(partsDash[0], 10);
    var d1 = parseInt(partsDash[1], 10);
    var d2 = parseInt(partsDash[2], 10);
    
    if (String(partsDash[0]).length === 4) { // yyyy-MM-dd
      year = d0; month = d1; day = d2;
    } else { // dd-MM-yyyy
      day = d0; month = d1; year = d2;
    }
  } else {
    // Ultimate fallback for custom or standard date formats correctly parsed by JS natively
    var d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    return null;
  }
  
  if (year < 100) year += 2000;
  if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    return new Date(year, month - 1, day);
  }
  
  return null;
}

/**
 * Get dashboard KPI data
 * GET ?action=dashboard
 */
function getDashboardData() {
  var ss = getSpreadsheet();
  
  try {
    var ordersSheet = ss.getSheetByName("Orders");
    var lastRow = ordersSheet.getLastRow();
    
    if (lastRow <= 1) {
      var empty = { orders: 0, revenue: 0 };
      return createJsonResponse({ success: true, today: empty, thisWeek: empty, thisMonth: empty, allTime: empty });
    }
    
    var data = ordersSheet.getRange(2, 1, lastRow - 1, 21).getValues();
    var now = new Date();
    
    // Get start of this week (Monday)
    var weekStart = new Date(now);
    var dayOfWeek = weekStart.getDay();
    var diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);
    
    // Get start of this month
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    var today = { orders: 0, revenue: 0 };
    var thisWeek = { orders: 0, revenue: 0 };
    var thisMonth = { orders: 0, revenue: 0 };
    var allTime = { orders: 0, revenue: 0 };
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var total = Number(row[9]) || 0; // Column J = Total
      
      allTime.orders++;
      allTime.revenue += total;
      
      // Parse the timestamp cell (could be Date object or string)
      var orderDate = parseOrderDate(row[1]);
      if (!orderDate) continue;
      
      // Today check
      if (orderDate.getFullYear() === now.getFullYear() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getDate() === now.getDate()) {
        today.orders++;
        today.revenue += total;
      }
      
      // This week check
      if (orderDate >= weekStart) {
        thisWeek.orders++;
        thisWeek.revenue += total;
      }
      
      // This month check
      if (orderDate >= monthStart) {
        thisMonth.orders++;
        thisMonth.revenue += total;
      }
    }
    
    return createJsonResponse({
      success: true,
      today: today,
      thisWeek: thisWeek,
      thisMonth: thisMonth,
      allTime: allTime
    });
    
  } catch (error) {
    return createJsonResponse({ success: false, error: "Dashboard error: " + error.message });
  }
}


/**
 * Get monthly report data
 * GET ?action=monthly&month=3&year=2026
 */
function getMonthlyReport(e) {
  var ss = getSpreadsheet();
  var now = new Date();
  var month = parseInt((e && e.parameter && e.parameter.month) ? e.parameter.month : (now.getMonth() + 1).toString());
  var year = parseInt((e && e.parameter && e.parameter.year) ? e.parameter.year : now.getFullYear().toString());
  
  try {
    var ordersSheet = ss.getSheetByName("Orders");
    var itemsSheet = ss.getSheetByName("Order_Items");
    var lastRow = ordersSheet.getLastRow();
    
    if (lastRow <= 1) {
      return createJsonResponse({ success: true, month: month, year: year, totals: { orders: 0, revenue: 0, avgOrderValue: 0 }, dailyBreakdown: [], topProducts: [], byCashier: [] });
    }
    
    var ordersData = ordersSheet.getRange(2, 1, lastRow - 1, 21).getValues();
    
    // Filter orders for the target month
    var monthOrders = [];
    var dailyMap = {}; // day -> { orders, revenue }
    var cashierMap = {}; // cashier -> { orders, revenue }
    
    for (var i = 0; i < ordersData.length; i++) {
      var row = ordersData[i];
      
      var orderDate = parseOrderDate(row[1]);
      if (!orderDate) continue;
      
      var orderMonth = orderDate.getMonth() + 1;
      var orderYear = orderDate.getFullYear();
      
      if (orderMonth === month && orderYear === year) {
        var day = orderDate.getDate();
        var total = Number(row[9]) || 0;
        var cashier = row[3] || "Unknown";
        var channel = row[2] || "";
        
        monthOrders.push(row);
        
        // Daily breakdown
        if (!dailyMap[day]) dailyMap[day] = { day: day, orders: 0, revenue: 0 };
        dailyMap[day].orders++;
        dailyMap[day].revenue += total;
        
        // By cashier
        if (!cashierMap[cashier]) cashierMap[cashier] = { cashier: cashier, orders: 0, revenue: 0 };
        cashierMap[cashier].orders++;
        cashierMap[cashier].revenue += total;
      }
    }
    
    // Product ranking from Order_Items
    var itemsLastRow = itemsSheet.getLastRow();
    var productMap = {}; // productName -> { quantity, revenue }
    
    if (itemsLastRow > 1) {
      var allItems = itemsSheet.getRange(2, 1, itemsLastRow - 1, 6).getValues();
      
      // Build set of order IDs in this month
      var monthOrderIds = {};
      for (var m = 0; m < monthOrders.length; m++) {
        monthOrderIds[monthOrders[m][0]] = true;
      }
      
      for (var j = 0; j < allItems.length; j++) {
        var itemOrderId = allItems[j][0];
        if (!monthOrderIds[itemOrderId]) continue;
        
        var itemName = allItems[j][2] || "Unknown";
        var itemQty = Number(allItems[j][3]) || 0;
        var itemSubtotal = Number(allItems[j][5]) || 0;
        
        if (!productMap[itemName]) productMap[itemName] = { name: itemName, quantity: 0, revenue: 0 };
        productMap[itemName].quantity += itemQty;
        productMap[itemName].revenue += itemSubtotal;
      }
    }
    
    // Sort products by revenue descending
    var topProducts = Object.keys(productMap).map(function(k) { return productMap[k]; });
    topProducts.sort(function(a, b) { return b.revenue - a.revenue; });
    topProducts = topProducts.slice(0, 20); // Top 20
    
    // Sort daily breakdown
    var dailyBreakdown = Object.keys(dailyMap).map(function(k) { return dailyMap[k]; });
    dailyBreakdown.sort(function(a, b) { return a.day - b.day; });
    
    // Sort cashier by revenue
    var byCashier = Object.keys(cashierMap).map(function(k) { return cashierMap[k]; });
    byCashier.sort(function(a, b) { return b.revenue - a.revenue; });
    
    // Calculate totals
    var totalRevenue = 0;
    for (var t = 0; t < monthOrders.length; t++) {
      totalRevenue += Number(monthOrders[t][9]) || 0;
    }
    
    return createJsonResponse({
      success: true,
      month: month,
      year: year,
      totals: {
        orders: monthOrders.length,
        revenue: totalRevenue,
        avgOrderValue: monthOrders.length > 0 ? Math.round(totalRevenue / monthOrders.length) : 0
      },
      dailyBreakdown: dailyBreakdown,
      topProducts: topProducts,
      byCashier: byCashier
    });
    
  } catch (error) {
    return createJsonResponse({ success: false, error: "Monthly report error: " + error.message });
  }
}


/**
 * Soft-delete an order: move to Trash sheet
 * POST body: { action: "deleteOrder", orderId: "...", deletedBy: "cashier name" }
 */
function deleteOrder(data) {
  var ss = getSpreadsheet();
  var lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(10000);
    
    var orderId = data.orderId;
    if (!orderId) {
      return createJsonResponse({ success: false, error: "orderId is required" });
    }
    
    var ordersSheet = ss.getSheetByName("Orders");
    var trashSheet = ss.getSheetByName("Trash");
    
    if (!trashSheet) {
      // Create Trash sheet on the fly if it doesn't exist yet
      trashSheet = ss.insertSheet("Trash");
    }
    
    var lastRow = ordersSheet.getLastRow();
    if (lastRow <= 1) {
      return createJsonResponse({ success: false, error: "No orders to delete" });
    }
    
    // Read all 22 order columns explicitly (getDataRange may miss empty trailing columns like Deadline)
    var ordersData = ordersSheet.getRange(1, 1, lastRow, 22).getValues();
    var foundRow = -1;
    
    for (var i = 1; i < ordersData.length; i++) {
      if (String(ordersData[i][0]) === String(orderId)) {
        foundRow = i;
        break;
      }
    }
    
    if (foundRow === -1) {
      return createJsonResponse({ success: false, error: "Order not found: " + orderId });
    }
    
    // Copy row to Trash with deletion metadata (all 22 order columns + 2 metadata)
    var orderRow = ordersData[foundRow];
    var trashRow = orderRow.slice(); // Clone
    trashRow.push(Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss")); // Deleted At
    trashRow.push(data.deletedBy || "Unknown"); // Deleted By
    trashSheet.appendRow(trashRow);
    
    // Delete from Orders
    ordersSheet.deleteRow(foundRow + 1);
    
    // Also delete related items from Order_Items and copy to Trash_Items
    var itemsSheet = ss.getSheetByName("Order_Items");
    var trashItemsSheet = getOrCreateSheet(ss, "Trash_Items");
    
    if (itemsSheet) {
      if (trashItemsSheet.getLastRow() === 0) {
        trashItemsSheet.appendRow(itemsSheet.getRange(1, 1, 1, itemsSheet.getLastColumn()).getValues()[0]);
      }
      var itemsData = itemsSheet.getDataRange().getValues();
      // Delete from bottom to top to avoid row shifting issues
      for (var j = itemsData.length - 1; j >= 1; j--) {
        if (String(itemsData[j][0]) === String(orderId)) {
          trashItemsSheet.appendRow(itemsData[j]);
          itemsSheet.deleteRow(j + 1);
        }
      }
    }
    
    // Also delete from Deliveries and copy to Trash_Deliveries if exists
    var deliveriesSheet = ss.getSheetByName("Deliveries");
    var trashDeliveriesSheet = getOrCreateSheet(ss, "Trash_Deliveries");
    if (deliveriesSheet) {
      if (trashDeliveriesSheet.getLastRow() === 0) {
        trashDeliveriesSheet.appendRow(deliveriesSheet.getRange(1, 1, 1, deliveriesSheet.getLastColumn()).getValues()[0]);
      }
      var delData = deliveriesSheet.getDataRange().getValues();
      for (var k = delData.length - 1; k >= 1; k--) {
        if (String(delData[k][0]) === String(orderId)) {
          trashDeliveriesSheet.appendRow(delData[k]);
          deliveriesSheet.deleteRow(k + 1);
        }
      }
    }
    
    lock.releaseLock();
    
    return createJsonResponse({
      success: true,
      message: "Order " + orderId + " moved to Trash"
    });
    
  } catch (error) {
    return createJsonResponse({ success: false, error: "Delete error: " + error.message });
  }
}

/**
 * Restore an order from Trash back to Orders
 */
function restoreOrder(data) {
  var ss = getSpreadsheet();
  var lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(10000);
    
    var orderId = data.orderId;
    if (!orderId) {
      return createJsonResponse({ success: false, error: "orderId is required" });
    }
    
    var trashSheet = ss.getSheetByName("Trash");
    var ordersSheet = ss.getSheetByName("Orders");
    
    if (!trashSheet || !ordersSheet) {
      return createJsonResponse({ success: false, error: "Sheets not found" });
    }
    
    var trashData = trashSheet.getDataRange().getValues();
    var foundRow = -1;
    for (var i = 1; i < trashData.length; i++) {
        if (String(trashData[i][0]) === String(orderId)) {
            foundRow = i;
            break;
        }
    }

    if (foundRow === -1) {
      return createJsonResponse({ success: false, error: "Order not found in Trash: " + orderId });
    }

    // Move back to Orders (strip the 2 deleted metadata columns)
    var orderRow = trashData[foundRow].slice(0, 22);
    ordersSheet.appendRow(orderRow);
    trashSheet.deleteRow(foundRow + 1);

    // Restore Items
    var trashItemsSheet = ss.getSheetByName("Trash_Items");
    var itemsSheet = ss.getSheetByName("Order_Items");
    if (trashItemsSheet && itemsSheet) {
      var tItemsData = trashItemsSheet.getDataRange().getValues();
      for (var j = tItemsData.length - 1; j >= 1; j--) {
        if (String(tItemsData[j][0]) === String(orderId)) {
          itemsSheet.appendRow(tItemsData[j]);
          trashItemsSheet.deleteRow(j + 1);
        }
      }
    }

    // Restore Deliveries
    var trashDelSheet = ss.getSheetByName("Trash_Deliveries");
    var delSheet = ss.getSheetByName("Deliveries");
    if (trashDelSheet && delSheet) {
      var tDelData = trashDelSheet.getDataRange().getValues();
      for (var k = tDelData.length - 1; k >= 1; k--) {
        if (String(tDelData[k][0]) === String(orderId)) {
          delSheet.appendRow(tDelData[k]);
          trashDelSheet.deleteRow(k + 1);
        }
      }
    }

    lock.releaseLock();
    
    return createJsonResponse({
      success: true,
      message: "Order restored successfully"
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: "Restore error: " + error.message });
  }
}
