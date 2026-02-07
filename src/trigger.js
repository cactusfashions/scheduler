function onEdit(e) {
  if (!e || !e.range) return;

  const range = e.range;
  const sheet = range.getSheet();
  const row = range.getRow();
  const col = range.getColumn();

  // Ignore header
  if (row === 1) return;

  const ss = sheet.getParent();

  // Get headers
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const decisionCol = headers.indexOf('Decision') + 1;
  const statusCol   = headers.indexOf('Status') + 1;

  // Safety: required columns not found
  if (decisionCol === 0 && statusCol === 0) return;

  let targetSheetName = null;

  /* ---------- CASE 1: Status → Complete ---------- */
  if (col === statusCol) {
    const statusValue = String(range.getValue()).trim().toLowerCase();
    if (statusValue === 'complete') {
      targetSheetName = 'Completed';
    }
  }

  /* ---------- CASE 2: Decision column ---------- */
  if (col === decisionCol) {
    const decisionValue = range.getValue();
    if (decisionValue) {
      targetSheetName = decisionValue;
    }
  }

  // If no rule matched → exit
  if (!targetSheetName) return;

  // Get or create target sheet
  let targetSheet = ss.getSheetByName(targetSheetName);
  if (!targetSheet) {
    targetSheet = ss.insertSheet(targetSheetName);
    targetSheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers]);
  }

  // Capture row data BEFORE delete
  const rowData = sheet
    .getRange(row, 1, 1, headers.length)
    .getValues()[0];

  // Append then delete
  targetSheet.appendRow(rowData);
  sheet.deleteRow(row);
}
