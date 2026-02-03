// Add new tasks in sheet
function addNewTask(data) {
  const {
    category = '',
    task = '',
    priority = '',
    dueDate = '',
    decision = '',
    delegateTo = ''
  } = data || {};

  try {
    if (!category || !task) {
      throw new Error('All fields are required');
    }

    const sheet = new SheetManager(SCHEDULER_SS_ID, ALL_TASKS_SHEET);
    const timestamp = new Date();
    const rowData = [
      {
        id: getNewId(),
        timestamp: timestamp,
        category,
        task,
        priority,
        'due date': dueDate,
        decision,
        'delegate to': delegateTo
      }
    ];

    sheet.appendRowData(rowData);
    return new ScriptResponse(200, 'Task created successfully.');
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

/**
 * Generates next incremental ID in 4-digit format (0001, 0002...)
 * Finds the highest existing ID and increments it
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Sheet instance
 * @param {number} idCol - Column number where ID exists (1-based)
 * @return {string} Next formatted ID
 */
function getNewId() {
  try {
    const ss = SpreadsheetApp.openById(SCHEDULER_SS_ID);
    const sheet = ss.getSheetByName(ALL_TASKS_SHEET);
    if (!sheet) {
      throw new Error('Sheet is required');
    }

    const lastRow = sheet.getLastRow();

    // No data rows (assuming row 1 is header)
    if (lastRow < 2) {
      return '0001';
    }

    // Get all existing IDs (excluding header)
    const idValues = sheet
      .getRange(2, 1, lastRow - 1, 1)
      .getValues()
      .flat()
      .filter((v) => v !== '' && !isNaN(v)); // keep only valid numbers

    // If column exists but no valid IDs
    if (idValues.length === 0) {
      return '0001';
    }

    // Find highest numeric ID (e.g. "0007" → 7)
    const maxId = Math.max(...idValues.map((v) => Number(v)));

    const nextNumber = maxId + 1;

    // Pad with leading zeros → "0008"
    return String(nextNumber).padStart(4, '0');
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}
