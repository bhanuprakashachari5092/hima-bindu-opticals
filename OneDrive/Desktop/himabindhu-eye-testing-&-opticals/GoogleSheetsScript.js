// Google Apps Script Template for Himabindhu Eye Clinic
// Copy and paste this code inside your Google Sheets Extensions -> Apps Script editor.
// Make sure to deploy as a Web App (Execute as: "Me", Who has access: "Anyone").

// Handle POST request from Rx Prescription Desk & Welcome Desk (Saving data)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "";
    
    if (action === "registerPatient") {
      var sheet = getOrCreateSheet("Patients");
      sheet.appendRow([
        data.patient.patientId,
        data.patient.name,
        data.patient.mobile,
        data.patient.age,
        data.patient.gender,
        data.patient.date,
        "Waiting" // status
      ]);
      return jsonResponse({ success: true, message: "Patient registered successfully" });
    }
    
    if (action === "deletePatient") {
      var sheet = getOrCreateSheet("Patients");
      var patientId = data.patientId;
      var rows = sheet.getDataRange().getValues();
      var deleted = false;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim() === patientId) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      return jsonResponse({ success: deleted, message: deleted ? "Patient deleted" : "Patient not found" });
    }
    
    if (action === "deletePrescription") {
      var sheet = getOrCreateSheet("Prescriptions");
      var rxId = data.prescriptionId;
      var rows = sheet.getDataRange().getValues();
      var deleted = false;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][1]).trim() === rxId) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      return jsonResponse({ success: deleted, message: deleted ? "Prescription deleted" : "Prescription not found" });
    }
    
    if (action === "savePrescription") {
      var sheet = getOrCreateSheet("Prescriptions");
      var rx = data.prescription || data;
      
      // Check if prescription already exists to update it, or append new row
      var rows = sheet.getDataRange().getValues();
      var foundIndex = -1;
      var pId = rx.prescriptionId || rx.id;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][1]).trim() === pId) {
          foundIndex = i + 1;
          break;
        }
      }
      
      var rowValues = [
        rx.patientId,
        pId,
        rx.patientName,
        rx.mobile,
        rx.age,
        rx.gender,
        rx.date,
        rx.reDistanceSph || (rx.rightEyeData && rx.rightEyeData.distance ? rx.rightEyeData.distance.sph : ""),
        rx.reDistanceCyl || (rx.rightEyeData && rx.rightEyeData.distance ? rx.rightEyeData.distance.cyl : ""),
        rx.reDistanceAxis || (rx.rightEyeData && rx.rightEyeData.distance ? rx.rightEyeData.distance.axis : ""),
        rx.reDistanceVision || (rx.rightEyeData && rx.rightEyeData.distance ? rx.rightEyeData.distance.vision : ""),
        rx.reNearSph || (rx.rightEyeData && rx.rightEyeData.near ? rx.rightEyeData.near.sph : ""),
        rx.reNearCyl || (rx.rightEyeData && rx.rightEyeData.near ? rx.rightEyeData.near.cyl : ""),
        rx.reNearAxis || (rx.rightEyeData && rx.rightEyeData.near ? rx.rightEyeData.near.axis : ""),
        rx.reNearVision || (rx.rightEyeData && rx.rightEyeData.near ? rx.rightEyeData.near.vision : ""),
        rx.reAdd || (rx.rightEyeData ? rx.rightEyeData.add : ""),
        rx.leDistanceSph || (rx.leftEyeData && rx.leftEyeData.distance ? rx.leftEyeData.distance.sph : ""),
        rx.leDistanceCyl || (rx.leftEyeData && rx.leftEyeData.distance ? rx.leftEyeData.distance.cyl : ""),
        rx.leDistanceAxis || (rx.leftEyeData && rx.leftEyeData.distance ? rx.leftEyeData.distance.axis : ""),
        rx.leDistanceVision || (rx.leftEyeData && rx.leftEyeData.distance ? rx.leftEyeData.distance.vision : ""),
        rx.leNearSph || (rx.leftEyeData && rx.leftEyeData.near ? rx.leftEyeData.near.sph : ""),
        rx.leNearCyl || (rx.leftEyeData && rx.leftEyeData.near ? rx.leftEyeData.near.cyl : ""),
        rx.leNearAxis || (rx.leftEyeData && rx.leftEyeData.near ? rx.leftEyeData.near.axis : ""),
        rx.leNearVision || (rx.leftEyeData && rx.leftEyeData.near ? rx.leftEyeData.near.vision : ""),
        rx.leAdd || (rx.leftEyeData ? rx.leftEyeData.add : ""),
        rx.pd,
        Array.isArray(rx.advice) ? rx.advice.join(", ") : (rx.advice || ""),
        rx.notes,
        rx.frameName || "",
        rx.lensType || "",
        rx.orderPrice || "",
        rx.orderStatus || "Pending",
        rx.isOrderSent ? "TRUE" : "FALSE",
        rx.isNotified ? "TRUE" : "FALSE",
        rx.actualCost || "",
        rx.receivedCost || "",
        rx.balanceCost || ""
      ];
      
      if (foundIndex !== -1) {
        sheet.getRange(foundIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
      
      // Update patient status in Patients tab if exists
      var patSheet = getOrCreateSheet("Patients");
      var patRows = patSheet.getDataRange().getValues();
      for (var j = 1; j < patRows.length; j++) {
        if (String(patRows[j][0]).trim() === rx.patientId) {
          patSheet.getRange(j + 1, 7).setValue("Prescribed");
          break;
        }
      }
      
      return jsonResponse({ success: true, message: "Prescription saved successfully" });
    }
    
    if (action === "saveOrder") {
      var sheet = getOrCreateSheet("Prescriptions");
      var rxId = data.prescriptionId;
      var order = data.orderData;
      var rows = sheet.getDataRange().getValues();
      var foundIndex = -1;
      
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][1]).trim() === rxId) {
          foundIndex = i + 1;
          break;
        }
      }
      
      if (foundIndex !== -1) {
        if (order.frameName !== undefined) sheet.getRange(foundIndex, 29).setValue(order.frameName);
        if (order.lensType !== undefined) sheet.getRange(foundIndex, 30).setValue(order.lensType);
        if (order.orderPrice !== undefined) sheet.getRange(foundIndex, 31).setValue(order.orderPrice);
        if (order.orderStatus !== undefined) sheet.getRange(foundIndex, 32).setValue(order.orderStatus);
        if (order.isOrderSent !== undefined) sheet.getRange(foundIndex, 33).setValue(order.isOrderSent ? "TRUE" : "FALSE");
        if (order.isNotified !== undefined) sheet.getRange(foundIndex, 34).setValue(order.isNotified ? "TRUE" : "FALSE");
        if (order.actualCost !== undefined) sheet.getRange(foundIndex, 35).setValue(order.actualCost);
        if (order.receivedCost !== undefined) sheet.getRange(foundIndex, 36).setValue(order.receivedCost);
        if (order.balanceCost !== undefined) sheet.getRange(foundIndex, 37).setValue(order.balanceCost);
        
        if (order.reSphDist !== undefined) sheet.getRange(foundIndex, 8).setValue(order.reSphDist);
        if (order.reCylDist !== undefined) sheet.getRange(foundIndex, 9).setValue(order.reCylDist);
        if (order.reAxisDist !== undefined) sheet.getRange(foundIndex, 10).setValue(order.reAxisDist);
        if (order.reVisionDist !== undefined) sheet.getRange(foundIndex, 11).setValue(order.reVisionDist);
        if (order.reVisionNear !== undefined) sheet.getRange(foundIndex, 15).setValue(order.reVisionNear);
        if (order.reAdd !== undefined) sheet.getRange(foundIndex, 16).setValue(order.reAdd);
        
        if (order.leSphDist !== undefined) sheet.getRange(foundIndex, 17).setValue(order.leSphDist);
        if (order.leCylDist !== undefined) sheet.getRange(foundIndex, 18).setValue(order.leCylDist);
        if (order.leAxisDist !== undefined) sheet.getRange(foundIndex, 19).setValue(order.leAxisDist);
        if (order.leVisionDist !== undefined) sheet.getRange(foundIndex, 20).setValue(order.leVisionDist);
        if (order.leVisionNear !== undefined) sheet.getRange(foundIndex, 24).setValue(order.leVisionNear);
        if (order.leAdd !== undefined) sheet.getRange(foundIndex, 25).setValue(order.leAdd);
        
        if (order.pd !== undefined) sheet.getRange(foundIndex, 26).setValue(order.pd);
        if (order.notes !== undefined) sheet.getRange(foundIndex, 28).setValue(order.notes);
        
        return jsonResponse({ success: true, message: "Order updated successfully" });
      }
      return jsonResponse({ success: false, message: "Prescription not found for updating order" });
    }
    
    // Legacy support fallback
    var sheet = getOrCreateSheet("Prescriptions");
    sheet.appendRow([
      data.patientId, data.prescriptionId, data.patientName, data.mobile, data.age, data.gender, data.date,
      data.reDistanceSph, data.reDistanceCyl, data.reDistanceAxis, data.reDistanceVision,
      data.reNearSph, data.reNearCyl, data.reNearAxis, data.reNearVision, data.reAdd,
      data.leDistanceSph, data.leDistanceCyl, data.leDistanceAxis, data.leDistanceVision,
      data.leNearSph, data.leNearCyl, data.leNearAxis, data.leNearVision, data.leAdd,
      data.pd, data.advice, data.notes
    ]);
    return jsonResponse({ success: true, message: "Data appended (Legacy)" });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// Handle GET requests from portal (Fetching data)
function doGet(e) {
  try {
    var action = e.parameter.action || "";
    
    if (action === "getPatients") {
      var sheet = getOrCreateSheet("Patients");
      var data = sheet.getDataRange().getValues();
      var patients = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        patients.push({
          patientId: String(row[0] || ""),
          name: String(row[1] || ""),
          mobile: String(row[2] || ""),
          age: Number(row[3] || 0),
          gender: String(row[4] || ""),
          date: String(row[5] || "").split("T")[0],
          status: String(row[6] || "Waiting")
        });
      }
      return jsonResponse({ success: true, data: patients });
    }
    
    if (action === "getPrescriptions") {
      var sheet = getOrCreateSheet("Prescriptions");
      return jsonResponse({ success: true, data: getAllPrescriptionsList(sheet) });
    }
    
    // Default search or get all action
    var queryVal = (e.parameter.query || "").trim().toLowerCase();
    var sheet = getOrCreateSheet("Prescriptions");
    if (!queryVal) {
      return jsonResponse({ success: true, data: getAllPrescriptionsList(sheet) });
    }
    
    var allPrescriptions = getAllPrescriptionsList(sheet);
    var results = [];
    
    for (var i = 0; i < allPrescriptions.length; i++) {
      var rx = allPrescriptions[i];
      var cleanMobileRow = rx.mobile.replace(/\D/g, "");
      var cleanQuery = queryVal.replace(/\D/g, "");
      
      var isMatch = false;
      if (rx.patientId.toLowerCase() === queryVal) {
        isMatch = true;
      } else if (cleanQuery && cleanMobileRow === cleanQuery) {
        isMatch = true;
      } else if (rx.patientName.toLowerCase().indexOf(queryVal) !== -1) {
        isMatch = true;
      }
      
      if (isMatch) {
        results.push(rx);
      }
    }
    return jsonResponse({ success: true, data: results });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function getAllPrescriptionsList(sheet) {
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    list.push({
      patientId: String(row[0] || ""),
      prescriptionId: String(row[1] || ""),
      patientName: String(row[2] || ""),
      mobile: String(row[3] || ""),
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
      frameName: String(row[28] || ""),
      lensType: String(row[29] || ""),
      orderPrice: String(row[30] || ""),
      orderStatus: String(row[31] || "Pending"),
      isOrderSent: String(row[32] || "").toUpperCase() === "TRUE",
      isNotified: String(row[33] || "").toUpperCase() === "TRUE",
      actualCost: String(row[34] || ""),
      receivedCost: String(row[35] || ""),
      balanceCost: String(row[36] || ""),
      id: String(row[1] || "")
    });
  }
  return list;
}

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
