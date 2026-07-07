const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Set up template engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true })); // Parses incoming form data
app.use(express.static(path.join(__dirname, 'public'))); // Serves static files if needed

// MySQL Connection Pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$', 
    database: 'c237_studentlistapp',
    waitForConnections: true,
    connectionLimit: 10
});

// Helper function to format dates nicely for the UI (e.g., "May 08, 2007")
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// 1. GET Route: Display all students (index.ejs)
app.get('/', (req, res) => {
    const query = 'SELECT * FROM student';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }
        res.render('index', { students: results, formatDate });
    });
});

// 2. GET Route: Render the form to add a new student (addStudent.ejs)
app.get('/student', (req, res) => {
    res.render('addStudent');
});

// 3. POST Route: Handle the student form submission
app.post('/student', (req, res) => {
    const { name, dob, contact, image } = req.body;
    const query = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';
    
    db.query(query, [name, dob, contact, image], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting student data');
        }
        // Successfully added, redirect back to home view
        res.redirect('/');
    });
});

// 4. GET Route: View a specific student's details (student.ejs)
app.get('/student/:id', (req, res) => {
    const studentId = req.params.id;
    const query = 'SELECT * FROM student WHERE studentId = ?';
    
    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.status(404).send('Student not found');
        }
        
        // Pass the single student record and the date formatter to student.ejs
        res.render('student', { student: results[0], formatDate });
    });
});

// 5. GET Route: Render the form to edit an existing student
app.get('/student/:id/edit', (req, res) => {
    const studentId = req.params.id;
    const query = 'SELECT * FROM student WHERE studentId = ?';

    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.status(404).send('Student not found');
        }

        res.render('editStudent', { student: results[0] });
    });
});

// 6. POST Route: Handle updating a student
app.post('/student/:id/edit', (req, res) => {
    const studentId = req.params.id;
    const { name, dob, contact, image } = req.body;
    const query = 'UPDATE student SET name = ?, dob = ?, contact = ?, image = ? WHERE studentId = ?';

    db.query(query, [name, dob, contact, image, studentId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating student data');
        }
        res.redirect(`/student/${studentId}`);
    });
});

// 7. POST Route: Delete a student
app.post('/student/:id/delete', (req, res) => {
    const studentId = req.params.id;
    const query = 'DELETE FROM student WHERE studentId = ?';

    db.query(query, [studentId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting student');
        }
        res.redirect('/');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));