const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');

const app = express();

// =============================
// EJS
// =============================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =============================
// Middleware
// =============================
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// =============================
// MySQL
// =============================
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$',
    database: 'c237_studentlistapp',
    waitForConnections: true,
    connectionLimit: 10
});

// =============================
// Multer (Image Upload)
// =============================
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }

});

const upload = multer({
    storage: storage
});

// =============================
// Format Date
// =============================
const formatDate = (dateString) => {

    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    };

    return new Date(dateString).toLocaleDateString('en-US', options);

};

// =============================
// Home Page
// =============================
app.get('/', (req, res) => {

    db.query('SELECT * FROM student', (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }

        res.render('index', {
            students: results,
            formatDate
        });

    });

});

// =============================
// Add Student Page
// =============================
app.get('/student', (req, res) => {
    res.render('addStudent');
});

// =============================
// Add Student
// =============================
app.post('/student', upload.single('image'), (req, res) => {

    const { name, dob, contact } = req.body;

    const image = req.file
        ? req.file.filename
        : '';

    const query =
        'INSERT INTO student(name,dob,contact,image) VALUES (?,?,?,?)';

    db.query(
        query,
        [name, dob, contact, image],
        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).send("Database Error");
            }

            res.redirect('/');

        });

});

// =============================
// View Student
// =============================
app.get('/student/:id', (req, res) => {

    db.query(
        'SELECT * FROM student WHERE studentId=?',
        [req.params.id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).send("Database Error");
            }

            if (results.length == 0) {
                return res.status(404).send("Student not found");
            }

            res.render('student', {
                student: results[0],
                formatDate
            });

        });

});

// =============================
// Edit Student Page
// =============================
app.get('/student/:id/edit', (req, res) => {

    db.query(
        'SELECT * FROM student WHERE studentId=?',
        [req.params.id],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).send("Database Error");
            }

            if (results.length == 0) {
                return res.status(404).send("Student not found");
            }

            res.render('editStudent', {
                student: results[0]
            });

        });

});

// =============================
// Update Student
// =============================
app.post('/student/:id/edit', upload.single('image'), (req, res) => {

    const { name, dob, contact, oldImage } = req.body;

    const image = req.file
        ? req.file.filename
        : oldImage;

    const query = `
    UPDATE student
    SET
    name=?,
    dob=?,
    contact=?,
    image=?
    WHERE studentId=?
    `;

    db.query(
        query,
        [name, dob, contact, image, req.params.id],
        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).send("Update Error");
            }

            res.redirect(`/student/${req.params.id}`);

        });

});

// =============================
// Delete Student
// =============================
app.post('/student/:id/delete', (req, res) => {

    db.query(
        'DELETE FROM student WHERE studentId=?',
        [req.params.id],
        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).send("Delete Error");
            }

            res.redirect('/');

        });

});

// =============================
// Server
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});