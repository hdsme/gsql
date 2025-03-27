class AlaORMGS {
    /**
     * Constructor initializes the ORM with the given spreadsheet.
     * @param {SpreadsheetApp.Spreadsheet} spreadsheet - The Google Spreadsheet instance.
     * @param {boolean} debug - Enables logging if set to true.
     */
    constructor(spreadsheet, debug = false) {
      this.alasql = AlaSQLGS.load();
      this.spreadsheet = spreadsheet;
      this.sheet = null;
      this.columns = [];
      this.jsonData = [];
      this.tables = {}; // Stores metadata of created tables
      this.debug = debug;
    }
  
    /**
     * Logs messages if debug mode is enabled.
     * @param {string} message - The message to log.
     */
    log(message) {
      if (this.debug) {
        Logger.log(message);
      }
    }
  
    /**
     * Creates a new table (sheet) with specified columns.
     * @param {string} tableName - The name of the new sheet.
     * @param {Array<Object>} columns - Array of column objects { name: "ColumnName" }.
     */
    createTable(tableName, columns) {
      let existingSheets = this.spreadsheet.getSheets().map(sheet => sheet.getName());
      if (existingSheets.includes(tableName)) {
        throw new Error(`Table "${tableName}" already exists.`);
      }
  
      let sheet = this.spreadsheet.insertSheet(tableName);
      sheet.clear();
      sheet.appendRow(columns.map(col => col.name));
  
      this.tables[tableName] = { sheet, columns };
      this.log(`Created table: ${tableName}`);
    }
  
    /**
     * Drops (deletes) an existing table (sheet).
     * @param {string} tableName - The name of the table to delete.
     */
    dropTable(tableName) {
      let sheet = this.spreadsheet.getSheetByName(tableName);
      if (!sheet) {
        throw new Error(`Table "${tableName}" not found.`);
      }
  
      this.spreadsheet.deleteSheet(sheet);
      delete this.tables[tableName];
      this.log(`Dropped table: ${tableName}`);
    }
  
    /**
     * Selects a table (sheet) for operations.
     * @param {string} sheetName - The name of the sheet to use.
     * @returns {AlaORMGS} - Returns the current instance for chaining.
     */
    table(sheetName) {
      this.sheet = this.spreadsheet.getSheetByName(sheetName);
      if (!this.sheet) {
        throw new Error(`Sheet "${sheetName}" not found.`);
      }
  
      let data = this.sheet.getDataRange().getValues();
      this.columns = data[0];
      if (this.columns[0] !== "Id") {
        throw new Error(`First column must be "Id". Found "${this.columns[0]}" instead.`);
      }
  
      this.jsonData = data.slice(1);
      this.log(`Switched to table: ${sheetName}`);
      return this;
    }
  
    /**
     * Retrieves all rows from the selected table.
     * @returns {Array<Object>} - Array of row objects.
     */
    findAll() {
      return this._measureExecutionTime(() => {
        return this.jsonData.map(row => this._convertToObject(row));
      }, 'findAll');
    }
  
    /**
     * Finds a single row based on criteria.
     * @param {Object} criteria - Key-value pairs to filter rows.
     * @returns {Object|null} - The first matching row or null if not found.
     */
    findOne(criteria) {
      return this._measureExecutionTime(() => {
        let query = `SELECT * FROM ? WHERE ` + this._buildWhereClause(criteria) + ` LIMIT 1`;
        this.log(query);
  
        let result = this.alasql(query, [this.jsonData]);
        return result.length ? this._convertToObject(result[0]) : null;
      }, 'findOne');
    }
  
    /**
     * Finds all rows matching the given criteria.
     * @param {Object} criteria - Key-value pairs for filtering rows.
     * @returns {Array<Object>} - Array of matching rows.
     */
    findWhere(criteria) {
      return this._measureExecutionTime(() => {
        let query = `SELECT * FROM ? WHERE ` + this._buildWhereClause(criteria);
        this.log(query);
  
        return this.alasql(query, [this.jsonData]).map(row => this._convertToObject(row));
      }, 'findWhere');
    }
  
    /**
     * Inserts a new row into the table.
     * @param {Object} data - Key-value pairs representing row data.
     * @returns {Object} - The inserted row with assigned ID.
     */
    insert(data) {
      return this._measureExecutionTime(() => {
        let lastRow = this.sheet.getLastRow();
        let newId = lastRow;
        let newRow = [newId, ...this.columns.slice(1).map(col => data[col] || "")];
  
        this.sheet.appendRow(newRow);
        this.log(`Inserted row with Id: ${newId}`);
        return { Id: newId, ...data };
      }, 'insert');
    }
  
    /**
     * Updates existing rows based on criteria.
     * @param {Object} criteria - Key-value pairs to find rows to update.
     * @param {Object} newData - Key-value pairs of data to update.
     * @returns {number} - Count of updated rows.
     */
    update(criteria, newData) {
      return this._measureExecutionTime(() => {
        let updatedCount = 0;
        const range = this.sheet.getDataRange();
        const values = range.getValues();
  
        values.slice(1).forEach((row, rowIndex) => {
          let rowObj = this._convertToObject(row);
          if (this._matchesCriteria(rowObj, criteria)) {
            this.columns.forEach((col, colIndex) => {
              if (newData[col] !== undefined && col !== "Id") {
                values[rowIndex + 1][colIndex] = newData[col];
              }
            });
            updatedCount++;
          }
        });
  
        range.setValues(values);
        this.log(`Updated ${updatedCount} rows`);
        return updatedCount;
      }, 'update');
    }
  
    /**
     * Deletes rows that match the given criteria.
     * @param {Object} criteria - Key-value pairs to filter rows to delete.
     * @returns {number} - Count of deleted rows.
     */
    delete(criteria) {
      return this._measureExecutionTime(() => {
        let deletedCount = 0;
        const range = this.sheet.getDataRange();
        const values = range.getValues();
  
        const newValues = [this.columns, ...values.slice(1).filter(row => {
          const rowObj = this._convertToObject(row);
          if (this._matchesCriteria(rowObj, criteria)) {
            deletedCount++;
            return false;
          }
          return true;
        })];
  
        this.sheet.clear();
        this.sheet.getRange(1, 1, newValues.length, newValues[0].length).setValues(newValues);
        this.log(`Deleted ${deletedCount} rows`);
        return deletedCount;
      }, 'delete');
    }
  
    // Helper Functions
  
    _convertToObject(row) {
      let obj = {};
      this.columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    }
  
    _buildWhereClause(criteria) {
      return Object.keys(criteria)
        .map(key => {
          let index = this.columns.indexOf(key);
          if (index === -1) throw new Error(`Column "${key}" not found.`);
          return `[${index}] = '${criteria[key]}'`;
        })
        .join(" AND ");
    }
  
    _matchesCriteria(row, criteria) {
      return Object.keys(criteria).every(key => row[key] == criteria[key]);
    }
  
    _measureExecutionTime(func, name) {
      const start = new Date().getTime();
      const result = func.apply(this);
      const end = new Date().getTime();
      this.log(`${name} executed in ${end - start} ms`);
      return result;
    }
  }
  
  /**
   * Factory function to create an ORM instance.
   * @param {SpreadsheetApp.Spreadsheet} ss - The Google Spreadsheet instance.
   * @param {boolean} debug - Enable logging.
   * @returns {AlaORMGS} - The ORM instance.
   */
  function load(ss, debug = false) {
    return new AlaORMGS(ss, debug);
  }
  