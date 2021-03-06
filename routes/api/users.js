const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator')

const pool = require('../../db');

// Inside are established connections ready to happen (pool needs to handle several different people logging in)

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', 
[
    check('name', 'Name is required').not().isEmpty(), 
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password', 
        'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
], 
 async (req, res) => {   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

     try {
    // See if user exists 
         let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

         if (user.rows.length > 0) {
             return res.status(400).json({ errors: [ { msg: 'User already exists' }] });
         }
    // Get users gravatar
         const avatar = gravatar.url(email, {
             s: '200',
             r: 'pg',
             d: 'mm' // acts as a default incase user doesn't have an avatar
         });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
           
         const bcryptPassword = await bcrypt.hash(password, salt);
         
         let newUser = await pool.query(
             `INSERT INTO users (name, email, password, avatar) VALUES ($1, $2, $3, $4) 
             RETURNING *`, [name, email, bcryptPassword, avatar]
         );

    // Return jsonwebtoken
         const payload = {
             user: {
                 id: newUser.rows[0].id,
                 name: newUser.rows[0].name,
                 email: newUser.rows[0].email
                 // Including a name and email makes it easier for debugging,
                 // instead of just containing a user id 
             },
         };

         const token = jwt.sign(payload,
             //config.get('jwtSecret'),
             process.env.JWT_SECRET, {
             expiresIn: 3600000,
         });

         return res.json({ token });
         
     } catch (err) {
         console.error(err.message);
         return res.status(500).send('Server error');
     }
});

module.exports = router;

