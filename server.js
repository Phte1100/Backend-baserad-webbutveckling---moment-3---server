const express = require("express");
const cors = require('cors');
const path = require("path");
const mongoose = require("mongoose")
require('dotenv').config({path: './.env'});

/* Skapar en MySQL-anslutning
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER_ACC,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
*/

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Statiska filer från 'public'-mappen
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/moment3").then(() => {
    console.log("Connected to Mongodb");
}).catch((error) => {
    console.log("Error connecting to database: " + error);
})

// Schema för cv
const cvSchema = new mongoose.Schema({
    companyname: {
        type: String,
        required: true
    },
    jobtitle: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    startdate: {
        type: Date,
        required: true
    },
    enddate: {
        type: Date,
        required: false
    },
    description: {
        type: String,
        required: true
    }
});

const cv = mongoose.model("Cv", cvSchema, 'cv')

// Basroute som visar ett välkomstmeddelande
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to my REST API' });
});

app.get("/cv", async(req, res) => {
    try {
        let result = await cv.find({});

        return res.json(result);
    } catch(error) {
        return res.status(500).json(error)
    }
});

app.post("/cv", async(req, res) => {
    try {
    result = await cv.create(req.body);

    return res.json(result);
    } catch(error) {
        return res.status(400).json(error);
    }
});

app.get('/health', (req, res) => {
    res.send('OK');
});

// Route för att radera en CV-post baserat på ID
app.delete('/cv/:id', async (req, res) => {
    const cvId = req.params.id;
    try {
        const result = await cv.findByIdAndDelete(cvId);
        if (!result) {
            return res.status(404).json({ success: false, message: 'CV-posten hittades inte och kunde inte raderas.' });
        }
        res.json({ success: true, message: 'CV-posten har raderats framgångsrikt.' });
    } catch (error) {
        console.error('Error deleting CV post:', error);
        res.status(500).json({ success: false, message: 'Ett internt serverfel uppstod när CV-posten skulle raderas.', error: error.toString() });
    }
});

// Route för att uppdatera en CV-post baserat på ID
app.put('/cv/:id', async (req, res) => {
    const { id } = req.params;
    const { companyname, jobtitle, location, startdate, enddate, description } = req.body;

    try {
        const updatedCv = await cv.findByIdAndUpdate(id, {
            companyname,
            jobtitle,
            location,
            startdate,
            enddate,
            description
        }, { new: true, runValidators: true });

        if (!updatedCv) {
            return res.status(404).json({ message: "CV-posten hittades inte." });
        }
        res.json(updatedCv);
    } catch (error) {
        console.error('Error updating CV post:', error);
        res.status(500).json({ message: 'Ett internt serverfel uppstod när CV-posten skulle uppdateras.', error: error.toString() });
    }
});

// Startar servern och lyssnar på angiven port
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
