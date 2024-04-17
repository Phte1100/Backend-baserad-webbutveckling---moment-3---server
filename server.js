const express = require("express");
const cors = require('cors');
const mysql = require("mysql");
const path = require("path");
require('dotenv').config({path: './.env'});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Statiska filer från 'public'-mappen
app.use(express.urlencoded({ extended: true }));

// Skapar en MySQL-anslutning
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER_ACC,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

connection.connect(err => {
    if (err) {
        console.error("Connection failed: " + err);
        return;
    }
    console.log("Connected to MySQL");
});

// Basroute som visar ett välkomstmeddelande
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to my REST API' });
});

// Route för att hämta alla CV-poster
app.get('/api/cv', (req, res) => {
    connection.query("SELECT * FROM cv", (err, rows) => {
        if (err) {
            console.error(err.message);
            // 500 Internal Server Error
            return res.status(500).json({ error: "Ett fel uppstod när cv:et skulle hämtas." });
        }
        res.json(rows);
    });
});

// Health check route för att verifiera att servern är uppe
app.get('/health', (req, res) => {
    res.send('OK');
});

// Route för att skapa en ny CV-post
app.post('/api/cv', (req, res) => {
    const { companyname, jobtitle, location, startdate, enddate, description } = req.body;
    if (companyname && jobtitle && location && startdate && enddate && description) {
        connection.query("INSERT INTO cv (companyname, jobtitle, location, startdate, enddate, description) VALUES (?, ?, ?, ?, ?, ?)",
            [companyname, jobtitle, location, startdate, enddate, description], (error, results) => {
                if (error) {
                    console.error('Error inserting into cv:', error);
                    return res.status(500).json({ error: "Kunde inte lägga till i databasen." });
                }
                // 201 Created
                res.status(201).json({ message: "Data tillagd i cv" });
            });
    } else {
        // 400 Bad Request
        res.status(400).json({ error: "Du måste fylla i alla fält!" });
    }
});

// Route för att radera en CV-post baserat på ID
app.delete('/api/cv/:id', (req, res) => {
    const cvId = req.params.id;
    connection.query('DELETE FROM cv WHERE id = ?', [cvId], (error, results) => {
        if (error) {
            console.error('Error deleting from cv:', error);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true, message: 'CV post raderad' });
    });
});

/*
Hur en PUT skulle kunna se ut.

app.put('/api/cv/:id', (req, res) => {
    const cvId = req.params.id;
    const { companyname, jobtitle, location, startdate, enddate, description } = req.body;
    const query = `UPDATE cv SET companyname = ?, jobtitle = ?, location = ?, startdate = ?, enddate = ?, description = ? WHERE id = ?`;
    const params = [companyname, jobtitle, location, startdate, enddate, description, cvId];

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error('Error updating cv:', error);
            return res.status(500).json({ error: "Kunde inte uppdatera informationen i databasen." });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Ingen post med det angivna ID:et hittades." });
        }

        res.json({ success: true, message: 'CV post uppdaterad', updatedId: cvId });
    });
});
*/

// Startar servern och lyssnar på angiven port
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
