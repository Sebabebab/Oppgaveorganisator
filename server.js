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

// Serve static files (your frontend content)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get all tasks
app.get('/tasks', (req, res) => {
    const query = 'SELECT * FROM tasks';

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows); // Return all tasks as JSON
        }
    });
});

// Endpoint to create a new task
app.post('/tasks', (req, res) => {
    const { title, info, color, status } = req.body; // Get the task details
    const query = 'INSERT INTO tasks (title, info, color, status) VALUES (?, ?, ?, ?)';

    db.run(query, [title, info, color, status], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, title, info, color, status }); // Return the created task details
        }
    });
});

// Endpoint to update a task's status
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body; // Get the new status from request body
    const query = 'UPDATE tasks SET status = ? WHERE id = ?';

    db.run(query, [status, taskId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.send(`Task with ID ${taskId} status updated to ${status}.`);
        }
    });
});

// Endpoint to delete a task by ID
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id; // Get the task ID from the URL
    const query = 'DELETE FROM tasks WHERE id = ?';

    db.run(query, [taskId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.send(`Task with ID ${taskId} deleted.`);
        }
    });
});

// Endpoint to export all tasks to a JSON file
app.get('/export-json', (req, res) => {
    const query = 'SELECT * FROM tasks'; // Get all tasks from the database

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const jsonContent = JSON.stringify(rows, null, 2); // Convert to formatted JSON
            res.setHeader('Content-Type', 'application/json'); // Set content type to JSON
            res.setHeader('Content-Disposition', 'attachment; filename="tasks.json"'); // Set as file download
            res.send(jsonContent); // Send the JSON data
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
