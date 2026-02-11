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
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[header] = index;
  });

  const decisionCol = headerMap['Decision'] + 1;
  const statusCol = headerMap['Status'] + 1;

  // Safety: required columns not found
  if (decisionCol === 0 && statusCol === 0) return;

  let targetSheetName = null;

  /* ---------- CASE 1: Decision column ---------- */
  if (col === decisionCol) {
    const decisionValue = range.getValue();
    if (decisionValue) {
      if (
        decisionValue.toString().trim().toLowerCase() === 'delete' &&
        openDeleteDialog()
      ) {
        sheet.deleteRow(row);
      } else {
        targetSheetName = decisionValue;
      }
    }
  }
  /* ---------- CASE 2: Status → Complete or Done ---------- */
  if (col === statusCol) {
    const statusValue = String(range.getValue()).trim().toLowerCase();
    if (statusValue === 'done') {
      // Check if we're already in the Completed sheet
      if (sheet.getName() === 'Completed') {
        // In Completed sheet, just show standard dialog and delete if confirmed
        if (openDeleteDialog()) {
          sheet.deleteRow(row);
        }
        return; // Exit early - no need to move rows
      } else {
        // In other sheets, show dialog and either move to Completed or delete
        if (!openDeleteDialog(true)) {
          targetSheetName = 'Completed';
        } else {
          sheet.deleteRow(row);
          return; // Exit early - row deleted
        }
      }
    }
  }

  // If no rule matched → exit
  if (!targetSheetName) return;

  // Get or create target sheet
  const targetSheet = ss.getSheetByName(targetSheetName);
  if (!targetSheet)
    throw new Error(`Could not find sheet "${targetSheetName}"`);

  const targetSheetHeaders = targetSheet
    .getRange(1, 1, 1, targetSheet.getLastColumn())
    .getValues()[0];

  // Capture row data BEFORE delete
  const rowData = sheet.getRange(row, 1, 1, headers.length).getValues()[0];

  // Append then delete
  // Clear the status value when moving to Completed sheet
  const targetRowData = targetSheetHeaders.map((targetSheetHeader) => {
    const value = rowData[headerMap[targetSheetHeader]] || '';
    // Clear status when moving to Completed sheet
    if (
      targetSheetName === 'Completed' &&
      targetSheetHeader.toLowerCase() === 'status'
    ) {
      return '';
    }
    return value;
  });
  targetSheet.appendRow(targetRowData);
  sheet.deleteRow(row);
}

// Open dialog to confirm deletion
function openDeleteDialog(completed = false) {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Delete Task',
    completed
      ? 'Are you sure you want to delete? By clicking No you can keep it as completed'
      : 'Are you sure you want to delete this task?',
    ui.ButtonSet.YES_NO
  );
  if (result === ui.Button.NO) {
    return;
  }
  return true;
}
