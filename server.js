const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();


const db = new sqlite3.Database('./oppgaveplanlegger.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});


app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));


app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id; 
    const { status } = req.body; 
    const query = 'UPDATE tasks SET status = ? WHERE id = ?';

    db.run(query, [status, taskId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.send(`Task with ID ${taskId} status updated to ${status}.`);
        }
    });
});


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


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
