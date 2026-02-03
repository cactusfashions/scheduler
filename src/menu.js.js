function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const mainMenu = ui.createMenu('Functions');

  // Add both submenus to main menu
  mainMenu
    .addItem('Hide Rows', 'hideRowsWhereStatusComplete')
    .addItem('Unhide Rows', 'unhideRows')
    .addToUi();
}

function hideRowsWhereStatusComplete() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ALL_TASK_SHEET);

  const HEADER_ROW = 1;

  // 1. Get headers from row 1
  const headers = sheet
    .getRange(HEADER_ROW, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  // 2. Create a header map
  const headerMap = createHeaderMap(headers);

  // 3. Get the column index for "Status"
  const statusCol = headerMap['status'] + 1;
  if (!statusCol) {
    throw new Error('Column "Status" not found.');
  }

  // 4. Get all status values below header row
  const lastRow = sheet.getLastRow();
  const statusValues = sheet
    .getRange(HEADER_ROW + 1, statusCol, lastRow - HEADER_ROW, 1)
    .getValues()
    .flat();

  // 5. Loop rows and hide those where status = "Complete"
  statusValues.forEach((row, i) => {
    if (row && row.toString().trim().toLowerCase() === 'complete') {
      sheet.hideRows(HEADER_ROW + 1 + i);
    }
  });
}

function unhideRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ALL_TASK_SHEET);

  const lastRow = sheet.getLastRow() - 1;
  sheet.showRows(2, lastRow);
}

// Helper function to create a header map
function createHeaderMap(headers) {
  const headerMap = {};
  headers.forEach((header, index) => {
    if (header !== null && header !== undefined) {
      headerMap[String(header).trim().toLowerCase()] = index;
    }
  });
  return headerMap;
}

/**
 * Returns the name of the sheet where the formula is used
 */
function GET_SHEET_NAME() {
  return SpreadsheetApp.getActiveSheet().getName();
}

/**
 * Returns the sheet ID (gid) of the current sheet
 */
function GET_SHEET_ID() {
  return SpreadsheetApp.getActiveSheet().getSheetId();
}

/**
 * Returns the sheet ID (gid) for a given sheet name
 * @param {string} sheetName - Name of the sheet
 * @return {number|string} Sheet ID or empty string if not found
 */
function GET_SHEET_ID_BY_NAME(sheetName) {
  // Validate input
  if (!sheetName) return '';

  // Get active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Get sheet by name
  const sheet = ss.getSheetByName(String(sheetName).trim());

  // If sheet does not exist
  if (!sheet) return 'Sheet not found';

  // Return numeric sheet id (gid)
  return `#gid=${sheet.getSheetId()}`;
}
