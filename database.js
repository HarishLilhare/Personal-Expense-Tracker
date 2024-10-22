
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./expenseTracker.db');

db.serialize(() => {
    // Create the transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT
    )`);

    // Create the categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
    )`);

    // I have Insert default categories 
    const categories = [
        { name: 'Salary', type: 'income' },
        { name: 'Freelance', type: 'income' },
        { name: 'Food', type: 'expense' },
        { name: 'Rent', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Utilities', type: 'expense' },
        { name: 'Transport', type: 'expense' }
    ];


    categories.forEach(category => {
        db.run(`INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)`, [category.name, category.type]);
    });

    console.log("Running Successful.");
});


module.exports = db;
