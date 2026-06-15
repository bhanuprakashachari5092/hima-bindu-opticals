// Google Apps Script Template for Himabindhu Eye Clinic
// Copy and paste this code inside your Google Sheets Extensions -> Apps Script editor.
// Make sure to deploy as a Web App (Execute as: "Me", Who has access: "Anyone").

// Handle POST request from Rx Prescription Desk (Saving data)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Prescriptions");
    if (!sheet) {
      // Auto create tab if not found
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Prescriptions");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.patientId,
      data.prescriptionId,
      data.patientName,
      data.mobile,
      data.age,
      data.gender,
      data.date,
      data.reDistanceSph,
      data.reDistanceCyl,
      data.reDistanceAxis,
      data.reDistanceVision,
      data.reNearSph,
      data.reNearCyl,
      data.reNearAxis,
      data.reNearVision,
      data.reAdd,
      data.leDistanceSph,
      data.leDistanceCyl,
      data.leDistanceAxis,
      data.leDistanceVision,
      data.leNearSph,
      data.leNearCyl,
      data.leNearAxis,
      data.leNearVision,
      data.leAdd,
      data.pd,
      data.advice,
      data.notes
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"success": true, "message": "Prescription added successfully"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"success": false, "error": err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests from public Finder portal (Fetching data)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Prescriptions");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ "success": false, "error": "Sheet 'Prescriptions' not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var queryVal = (e.parameter.query || "").trim().toLowerCase();
    if (!queryVal) {
      return ContentService.createTextOutput(JSON.stringify({ "success": false, "error": "Query parameter is required" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    var results = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var patientId = String(row[0] || "").trim();
      var prescriptionId = String(row[1] || "").trim();
      var patientName = String(row[2] || "").trim();
      var mobile = String(row[3] || "").trim();
      
      // Check match by Patient ID, Mobile, or Name
      var cleanMobileRow = mobile.replace(/\D/g, "");
      var cleanQuery = queryVal.replace(/\D/g, "");
      
      var isMatch = false;
      if (patientId.toLowerCase() === queryVal) {
        isMatch = true;
      } else if (cleanQuery && cleanMobileRow === cleanQuery) {
        isMatch = true;
      } else if (patientName.toLowerCase().indexOf(queryVal) !== -1) {
        isMatch = true;
      }
      
      if (isMatch) {
        // Map row back to expected Prescription object format
        results.push({
          patientId: patientId,
          prescriptionId: prescriptionId,
          patientName: patientName,
          mobile: mobile,
          age: String(row[4] || ""),
          gender: String(row[5] || ""),
          date: String(row[6] || "").split("T")[0],
          rightEyeData: {
            distance: { sph: String(row[7] || ""), cyl: String(row[8] || ""), axis: String(row[9] || ""), vision: String(row[10] || "") },
            near: { sph: String(row[11] || ""), cyl: String(row[12] || ""), axis: String(row[13] || ""), vision: String(row[14] || "") },
            add: String(row[15] || "")
          },
          leftEyeData: {
            distance: { sph: String(row[16] || ""), cyl: String(row[17] || ""), axis: String(row[18] || ""), vision: String(row[19] || "") },
            near: { sph: String(row[20] || ""), cyl: String(row[21] || ""), axis: String(row[22] || ""), vision: String(row[23] || "") },
            add: String(row[24] || "")
          },
          pd: String(row[25] || ""),
          advice: (row[26] || "").split(",").map(function(s) { return s.trim(); }).filter(Boolean),
          notes: String(row[27] || ""),
          id: prescriptionId
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "success": true, "data": results }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "success": false, "error": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
