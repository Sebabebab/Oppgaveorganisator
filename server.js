const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Connect to SQLite database
const db = new sqlite3.Database('./oppgaveplanlegger.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get all tasks
app.get('/tasks', (req, res) => {
    const query = 'SELECT * FROM tasks';

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Endpoint to create a new task
app.post('/tasks', (req, res) => {
    const { title, info, color, status } = req.body;
    const query = 'INSERT INTO tasks (title, info, color, status) VALUES (?, ?, ?, ?)';

    db.run(query, [title, info, color, status], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, title, info, color, status });
        }
    });
});

// Endpoint to delete a task
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const query = 'DELETE FROM tasks WHERE id = ?';

    db.run(query, [taskId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.send(`Task with ID ${taskId} deleted.`);
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
