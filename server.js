// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
app.use(bodyParser.json());

//  Adds a new transaction (income or expense)....
app.post('/transactions', (req, res) => {
    const transactions = Array.isArray(req.body) ? req.body : [req.body]; 
    const sql = `INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;
    db.serialize(() => {
        const stmt = db.prepare(sql);

        transactions.forEach(transaction => {
            // Validate transaction data
            if (!transaction.type || !transaction.category || !transaction.amount || !transaction.date || !transaction.description) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            stmt.run(transaction.type, transaction.category, transaction.amount, transaction.date, transaction.description);
        });

        stmt.finalize();
    });

    res.status(201).json({ message: "Transactions added successfully" });
});

//Retrieve all transactions....
app.get('/transactions', (req, res) => {
    db.all(`SELECT * FROM transactions`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Retrieve a transaction by ID.....
app.get('/transactions/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM transactions WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(row);
    });
});

// Update a transaction by ID
app.put('/transactions/:id', (req, res) => {
    const id = req.params.id;
    const { type, category, amount, date, description } = req.body;

    const query = `UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?`;
    db.run(query, [type, category, amount, date, description, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ message: 'Transaction updated successfully!' });
    });
});

// Delete a transaction by ID
app.delete('/transactions/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM transactions WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted successfully!' });
    });
});

// Retrieve a summary of transactions
app.get('/summary', (req, res) => {
    const query = `
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
            (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) AS balance
        FROM transactions
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
