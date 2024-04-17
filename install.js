// .env

require('dotenv').config({path: './.env'});


const mysql = require("mysql");

// Skapar en anslutning till databasen med specificerade inloggningsuppgifter och databasnamn


const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER_ACC,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


// Ansluter till MySQL-databasen
connection.connect((err) => {
    if (err) {
        console.error("Connection failed: " + err)
        return;
    }

    console.log("Connected to MySQL");
});

// tar bort tabellen om den redan finns
connection.query("DROP TABLE IF EXISTS cv;", (err, results) => {
    if (err) throw err;

    console.log("Tabellen cv raderas!");
});

// Skapar en ny tabell "cv" i databasen med angivna kolumner och datatyper
connection.query(`CREATE TABLE cv (
    id INT AUTO_INCREMENT PRIMARY KEY,
    companyname VARCHAR(255),
    jobtitle VARCHAR(255),
    location VARCHAR(255),
    startdate DATE,
    enddate DATE,
    description VARCHAR(700)
)`, (error, results) => {
    if(error) throw error;

    console.log("Table cv created: " + results);
});