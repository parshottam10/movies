require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 4880;

app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'User_authentication',
});


db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});


app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        
        const [results] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

        if (results.length > 0) {
            return res.status(400).json({ message: 'Username already exists!' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        await db.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        
        const [results] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password!' });
        }

        const user = results[0];


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password!' });
        }

        res.status(200).json({ message: 'Login successful!', user: { id: user.id, username: user.username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
