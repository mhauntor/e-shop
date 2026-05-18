/**
 * AMARDOKAN ALL-IN-ONE SCRIPT (Updated with Delivery Charge, Master Sync & Tracking Images)
 */

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ১. ক্যাটালগ ডাটা রিড করা
    if (data.action === "get_catalog") {
      const sheet = ss.getSheetByName("Catalog"); 
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Catalog sheet not found" })).setMimeType(ContentService.MimeType.JSON);
      
      const values = sheet.getDataRange().getValues();
      const headers = values[0]; 
      const catalog = [];
      for (let i = 1; i < values.length; i++) {
        const item = {};
        headers.forEach((header, index) => {
          let val = values[i][index];
          if ((header === "Category" || header === "OptionType" || header === "Size") && typeof val === "string") {
            item[header] = val.split(",").map(s => s.trim());
          } else {
            item[header] = val;
          }
        });
        catalog.push(item);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, catalog: catalog })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ২. নতুন অর্ডার প্রসেস করা
    if (data.action === "order") {
      const today = Utilities.formatDate(new Date(), "GMT+6", "dd-MM-yyyy");
      let sheet = ss.getSheetByName(today);
      
      // কলামের নতুন সিরিয়াল (DeliveryCharge সহ মোট ১৪টি কলাম)
      const headers = ["OrderID", "Timestamp", "Name", "Phone", "Address", "Area", "Products", "Images", "DeliveryCharge", "Total", "Note", "Status", "IP", "Browser"];
      
      if (!sheet) {
        sheet = ss.insertSheet(today);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#f3f3f3");
        sheet.setFrozenRows(1);
      }
      
      const rowData = [
        data.orderId, 
        data.timestamp, 
        data.name, 
        data.phone, 
        data.address, 
        data.area || "", 
        data.products, 
        data.images, 
        data.deliveryCharge || 0, // ডেলিভারি চার্জ
        data.total, 
        data.note || "", 
        data.status || "Pending", 
        data.ip, 
        data.browser
      ];
      
      sheet.appendRow(rowData); // ডেইলি শিটে সেভ
      
      // অর্ডার মাস্টার শিটে সেভ (এটি নিশ্চিত করা হয়েছে)
      let masterSheet = ss.getSheetByName("Order Master");
      if (!masterSheet) {
        masterSheet = ss.insertSheet("Order Master");
        masterSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#e0e0e0");
        masterSheet.setFrozenRows(1);
      }
      masterSheet.appendRow(rowData); // মাস্টার শিটে সেভ
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, orderId: data.orderId })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ৩. অর্ডার ট্র্যাক করা
    if (data.action === "track") {
      const query = String(data.query || "").trim();
      const masterSheet = ss.getSheetByName("Order Master");
      
      if (!masterSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Order Master sheet not found" })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const values = masterSheet.getDataRange().getValues();
      const results = [];
      
      // Header row (0) is skipped
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const orderIdStr = String(row[0] || ""); // Column A (Index 0)
        const phoneStr = String(row[3] || "");   // Column D (Index 3)
        
        if (orderIdStr === query || phoneStr.includes(query)) {
          results.push({
            orderId: orderIdStr,
            timestamp: row[1],
            name: row[2],
            phone: row[3],
            address: row[4],
            products: row[6],
            images: row[7],
            deliveryCharge: row[8],
            total: row[9],
            status: row[11] || "Pending"
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        orders: results
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Invalid action" })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ৩. অটো মাস্টার সিঙ্ক (১৪টি কলামের জন্য আপডেট করা হয়েছে)
 */
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const sheetName = sheet.getName();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName("Order Master");
  
  if (sheetName === "Order Master" || !masterSheet) return;
  const datePattern = /^\d{2}-\d{2}-\d{4}$/;
  if (!datePattern.test(sheetName)) return;
  
  const row = range.getRow();
  if (row === 1) return;
  
  const orderId = sheet.getRange(row, 1).getValue();
  if (!orderId) return;
  
  const masterData = masterSheet.getDataRange().getValues();
  for (let i = 1; i < masterData.length; i++) {
    if (masterData[i][0] === orderId) {
      // ১৪টি কলামই কপি করা হবে
      const updatedRowValues = sheet.getRange(row, 1, 1, 14).getValues(); 
      masterSheet.getRange(i + 1, 1, 1, 14).setValues(updatedRowValues);
      break;
    }
  }
}
