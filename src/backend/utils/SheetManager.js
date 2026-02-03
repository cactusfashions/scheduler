// SheetManager class to manage Google Sheet operations with clean error and response handling
class SheetManager {
  constructor(spreadsheetId, sheetName, headerRowNo = 1) {
    this.headerRowNo = headerRowNo;
    const spreadsheet = spreadsheetId
      ? SpreadsheetApp.openById(spreadsheetId)
      : SpreadsheetApp.getActiveSpreadsheet();

    this.sheet = sheetName
      ? spreadsheet.getSheetByName(sheetName)
      : spreadsheet.getActiveSheet();

    if (sheetName && !this.sheet) {
      throw new ScriptError(404, `Sheet "${sheetName}" could not be found.`);
    }
  }

  // Get header mapping from a given row (default: row 1)
  getHeaders(headerRowNo = 1) {
    if (headerRowNo === 1) {
      headerRowNo = this.headerRowNo;
    }
    try {
      const headerRow = this.sheet
        .getRange(headerRowNo, 1, 1, this.sheet.getLastColumn())
        .getValues()[0];

      const headerMap = headerRow.reduce((obj, header, index) => {
        if (typeof header === 'string' && header.length > 0) {
          obj[`${header.trim().toLowerCase()}`] = index;
        }
        return obj;
      }, {});

      return new ScriptResponse(200, headerMap, 'Headers fetched successfully');
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  getRowNumber(colHeading, value) {
    // Validate inputs
    if (!colHeading || typeof colHeading !== 'string') {
      throw new ScriptError(400, 'Column heading must be a non-empty string');
    }

    if (value === undefined || value === null) {
      throw new ScriptError(400, 'Value is required to find the row number');
    }

    try {
      const dataResp = this.getData();
      if (!dataResp.success)
        throw new ScriptError(500, 'Failed to fetch sheet data');

      const data = JSON.parse(dataResp.data);

      const searchKey = colHeading.trim().toLowerCase();
      const searchValue = value.toString().trim().toLowerCase();

      const findRow = data.findIndex((row) => {
        const cellValue = row[searchKey];
        return (
          cellValue && cellValue.toString().trim().toLowerCase() === searchValue
        );
      });

      return new ScriptResponse(200, findRow + 2, `Row found successfully`);
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  // Get all data mapped with header keys using batch processing
  getDataInBatches(header) {
    if (!header || Object.keys(header).length === 0) {
      throw new ScriptError(400, 'Header cannot be empty');
    }

    try {
      const lastRow = this.sheet.getLastRow();
      const lastColumn = this.sheet.getLastColumn();

      const allData = [];

      if (lastRow < 1) {
        return new ScriptResponse(
          200,
          JSON.stringify(allData),
          'No data found'
        );
      }

      const numRows = lastRow - 1 || 1;

      const batchData =
        this.sheet.getRange(2, 1, numRows, lastColumn).getValues() || [];

      const mappedBatch = batchData.map((row) => {
        const rowData = {};
        for (const key in header) {
          rowData[key] = row[header[key]];
        }
        return rowData;
      });

      allData.push(...mappedBatch);

      return new ScriptResponse(
        200,
        JSON.stringify(allData),
        'Data fetched in batches successfully'
      );
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  // Wrapper for backward compatibility
  getData() {
    try {
      const headerResp = this.getHeaders();
      if (
        !headerResp ||
        !headerResp.data ||
        Object.keys(headerResp.data).length === 0
      ) {
        throw new ScriptError(400, 'Header row could not be read or is empty');
      }
      const header = headerResp.data;
      return this.getDataInBatches(header);
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  // Find the first empty row from row 2
  getLastEmptyRow() {
    try {
      const lastRow = this.sheet.getLastRow();
      const lastColumn = this.sheet.getLastColumn();

      const sheetData = this.sheet
        .getRange(2, 1, lastRow, lastColumn)
        .getValues();

      const rowNumber = sheetData.findIndex((row) =>
        row.every((cell) => cell === null || cell === '')
      );
      const result = rowNumber === -1 ? lastRow + 1 : rowNumber + 2;

      if (result === rowNumber + 2) {
        this.sheet.insertRowsAfter(lastRow, 1);
      }

      return new ScriptResponse(200, result, 'Next empty row identified');
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  // Append data to sheet using rowData array and optional headers
  appendRowData(rowData, headers = {}) {
    if (!rowData || rowData.length === 0) {
      throw new ScriptError(400, 'No data provided to append to sheet');
    }

    if (!headers || Object.keys(headers).length === 0) {
      const headerResp = this.getHeaders();
      if (
        !headerResp ||
        !headerResp.data ||
        Object.keys(headerResp.data).length === 0
      ) {
        throw new ScriptError(400, 'No headers found to append data');
      }
      headers = headerResp.data;
    }

    const headersKey = Object.keys(headers);

    const newRows = [];

    for (let i = 0; i < rowData.length; i++) {
      const tempRow = [];
      for (let j = 0; j < headersKey.length; j++) {
        const headerName = headersKey[j];
        const colIndex = headers[headerName];
        tempRow[colIndex] = rowData[i][headerName] || '';
      }
      newRows.push(tempRow);
    }

    console.log(newRows);

    try {
      const rowResp = this.getLastEmptyRow();
      const startRow = rowResp.data;

      this.sheet
        .getRange(startRow, 1, newRows.length, headersKey.length)
        .setValues(newRows);
      return new ScriptResponse(
        200,
        { startRow },
        `Rows appended successfully at row no: ${startRow}`
      );
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  // Update cell in target row after the seleceted column respectively
  updateMultipleCell(rowNumber, columnNumber, values = []) {
    if (typeof rowNumber !== 'number' || rowNumber < 1) {
      throw new ScriptError(
        400,
        'Row number must be a positive integer (1-based index)'
      );
    }
    if (typeof columnNumber !== 'number' || columnNumber < 1) {
      throw new ScriptError(
        400,
        'Column number must be a positive integer (1-based index)'
      );
    }
    if (!Array.isArray(values) || values.length === 0) {
      throw new ScriptError(
        400,
        'Values must be a non-empty array to update cells'
      );
    }

    try {
      const range = this.sheet.getRange(
        rowNumber,
        columnNumber,
        1,
        values.length
      );
      range.setValues([values]);
      return new ScriptResponse(
        200,
        values,
        `Cell updated successfully at row: ${rowNumber}, column: ${columnNumber}`
      );
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  // Delete a specific row from the sheet
  deleteRow(row) {
    if (typeof row !== 'number' || row < 2) {
      throw new ScriptError(
        400,
        'Row number must be greater than or equal to 2 (cannot delete header row)'
      );
    }

    try {
      this.sheet.deleteRow(row);
      return new ScriptResponse(200, row, `Row ${row} deleted successfully.`);
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  // Filter rows by multiple column values
  filterRowsByColumnValues(criteria = {}) {
    try {
      const dataResp = this.getData();
      if (!dataResp.success)
        throw new ScriptError(500, 'Failed to fetch sheet data');

      const filtered = dataResp.data.filter((row) => {
        return Object.entries(criteria).every(([key, value]) => {
          return row[key.toLowerCase()] === value;
        });
      });

      return new ScriptResponse(
        200,
        filtered,
        `Filtered rows by provided criteria`
      );
    } catch (error) {
      throw new ScriptError(500, error.message, error);
    }
  }

  getTargetRowData(targetRowNo) {
    const headerMap = this.getHeaders();
    const targetRowData = this.sheet
      .getRange(targetRowNo, 1, 1, this.sheet.getLastColumn())
      .getValues();

    const rowData = {};
    Object.keys(headerMap.data).forEach((header) => {
      rowData[header] = targetRowData[0][headerMap.data[header]];
    });
    // console.log(JSON.stringify(rowData))
    return new ScriptResponse(
      200,
      rowData,
      'Target row data fetched successfully'
    );
  }

  getTargetColumnData(columnNo) {
    return this.sheet
      .getRange(this.headerRowNo + 1, columnNo, this.sheet.getLastRow(), 1)
      .getValues()
      .flat();
  }

  //  Get the refrence of target cell
  getCell(rowNo, columnNo) {
    return this.sheet.getRange(rowNo, columnNo);
  }

  //  Get the refrence of target row
  getTargetRowRange(rowNo) {
    return this.sheet.getRange(rowNo, 1, 1, this.sheet.getLastColumn());
  }
}
