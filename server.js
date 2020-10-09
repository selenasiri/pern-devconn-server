require('dotenv').config();
const express = require('express');
require('./db');
const cors = require('cors');

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json()); //req.body

//Define Routes

app.use('/apiauth', require('./routes/api/auth.js'));

// app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

