# AlaORMGS

**Google Apps Script SQL Toolkit and Object Relational Mapper (ORM)**

AlaORMGS is an Object Relational Mapper (ORM) for Google Apps Script that extends the functionality of the [AlaSQLGS](https://script.google.com/macros/library/versions/d/1XWR3NzQW6fINaIaROhzsxXqRREfKXAdbKoATNbpygoune43oCmez1N8U) library. It enables seamless SQL-based interactions with structured data within Google Apps Script projects.

## Features

- ORM capabilities built on top of **AlaSQLGS**
- Simplified SQL-based data manipulation in Google Sheets, Google Drive, and other Apps Script services
- Supports **lazy loading** for improved performance
- Compatible with **AlaSQL.js**, allowing advanced SQL queries

## Installation

### Adding AlaORMGS to Your Project

1. Open your **Google Apps Script** project.
2. Click **"Add a library"** in the left pane under **Libraries**.
3. Enter the **Script ID**: `1JINT-_ENgF1zeo0OVjvMxLusgHzlRqv_ZxVWS7cRHOjSMwA6IjwFRSot`.
4. Click **"Look up"**, select the highest version, and set the identifier to `AlaORMGS`.
5. Press **"Add"** to include the library in your project.

### Loading the Library

To load **AlaORMGS** in your script:

```js
const orm = AlaORMGS.load();
```

The library supports **lazy loading** to optimize performance.

## Usage

### Creating a Table

```js
const orm = AlaORMGS.load();

orm.createTable("Users", [
  { name: "id" },
  { name: "name" },
  { name: "email" }
]);
```

### Inserting Data

```js
orm.insert("Users", { id: 1, name: "Alice", email: "alice@example.com" });
```

### Querying Data

```js
const users = orm.select("Users", "name, email", "id = 1");
Logger.log(users);
```

### Updating Data

```js
orm.update("Users", { name: "Alice Smith" }, "id = 1");
```

### Deleting Data

```js
orm.delete("Users", "id = 1");
```

### Example: Working with Google Sheets

```js
const sheetOrm = AlaORMGS.load();
sheetOrm.createTable("Orders", [
  { name: "order_id", type: "NUMBER", primaryKey: true },
  { name: "customer", type: "STRING" },
  { name: "total", type: "NUMBER" }
]);

sheetOrm.insert("Orders", { order_id: 101, customer: "Bob", total: 250 });
const orders = sheetOrm.select("Orders");
Logger.log(orders);
```

### Example: Filtering and Sorting

```js
const results = orm.select("Users", "*", "name LIKE 'A%' ORDER BY name ASC");
Logger.log(results);
```

### Example: CRUD Operations

#### Finding a Single Record

```js
Logger.log(orm.table('Settings').findOne({ mode: "theme" }));
```

#### Finding All Records

```js
Logger.log(orm.table('Settings').findAll());
```

#### Finding Records with Criteria

```js
Logger.log(orm.table('Settings').findWhere({ mode: "dark" }));
```

#### Inserting a Record

```js
Logger.log(orm.table('Users').insert({ Name: "Charlie", Age: "30", City: "Boston" }));
```

#### Updating a Record

```js
Logger.log(orm.table('Users').update({ Name: "Charlie" }, { City: "San Francisco" }));
```

#### Deleting a Record

```js
Logger.log(orm.table('Users').delete({ Name: "Charlie" }));
```

## Copying the Library

A Google Apps Script project for AlaORMGS is available [here](https://script.google.com/macros/library/d/1JINT-_ENgF1zeo0OVjvMxLusgHzlRqv_ZxVWS7cRHOjSMwA6IjwFRSot/1).

1. Open the Apps Script project.
2. Click **"Overview"** in the left pane.
3. Click the **copy icon** in the upper right corner to clone the project.

## Additional Resources

- **AlaSQLGS Documentation**: [here](https://github.com/oshliaer/alasqlgs)
- **AlaSQL.js Library**: [GitHub](https://github.com/agershun/alasql)

## License

AlaORMGS is released under the **MIT License**.

