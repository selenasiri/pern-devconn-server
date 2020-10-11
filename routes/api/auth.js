const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const pool = require('../../db');
const auth = require('../../middleware/auth');

const router = express.Router();

// @route   GET api/auth
// @desc    Authenticate user & get token
// @access  Public

router.get('/', auth, async (req, res) => {
    try {
        const user = await pool.query(`SELECT id, name, email, avatar, date FROM users WHERE id = $1`, [
             req.user.id
        ]);

        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');  
    }  
})
   
    
module.exports = router; 

