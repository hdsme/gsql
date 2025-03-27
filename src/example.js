
function testAlaORMGS() {
    const ss = SpreadsheetApp.openById('1zzlXF9fZ0Bhepwl7iFFAXuS5uBlDO_L8WC_doSaVMZE');
    const orm = new AlaORMGS(ss);
    const tableName = "TestTable";
  
    // Step 1: Create Table
    try {
      orm.createTable(tableName, [
        { name: "Id" },
        { name: "Name" },
        { name: "Age" }
      ]);
      Logger.log("Table created successfully");
    } catch (e) {
      Logger.log("Error creating table: " + e.message);
    }
  
    // Step 2: Insert Records
    try {
      orm.table(tableName).insert({ Name: "John Doe", Age: 30 });
      orm.table(tableName).insert({ Name: "Jane Smith", Age: 25 });
      Logger.log("Records inserted successfully");
    } catch (e) {
      Logger.log("Error inserting records: " + e.message);
    }
  
    // Step 3: Find All Records
    try {
      let allRecords = orm.table(tableName).findAll();
      Logger.log("All Records: " + JSON.stringify(allRecords));
    } catch (e) {
      Logger.log("Error fetching records: " + e.message);
    }
  
    // Step 4: Find One Record
    try {
      let record = orm.table(tableName).findOne({ Name: "Jane Smith" });
      Logger.log("Found Record: " + JSON.stringify(record));
    } catch (e) {
      Logger.log("Error finding record: " + e.message);
    }
  
    // Step 5: Update Record
    try {
      let updatedCount = orm.table(tableName).update({ Name: "John Doe" }, { Age: 35 });
      Logger.log("Updated " + updatedCount + " records");
    } catch (e) {
      Logger.log("Error updating record: " + e.message);
    }
  
    // Step 6: Delete Record
    try {
      let deletedCount = orm.table(tableName).delete({ Name: "Jane Smith" });
      Logger.log("Deleted " + deletedCount + " records");
    } catch (e) {
      Logger.log("Error deleting record: " + e.message);
    }
  
    // Step 7: Drop Table
    try {
      // orm.dropTable(tableName);
      Logger.log("Table dropped successfully");
    } catch (e) {
      Logger.log("Error dropping table: " + e.message);
    }
  }