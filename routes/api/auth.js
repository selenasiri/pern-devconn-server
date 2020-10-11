const express = require('express');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const pool = require('../../db');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

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
   
// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public (to get token and make req to private routs)
router.post('/', 
[
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], 
 async (req, res) => {   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

     try {
    // See if user exists 
         let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

         if (user.rows.length > 0) {
             res.status(400).json({ errors: [ { msg: 'User already exists' }] });
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
                 name: newUser.rows[0].id,
                 email: newUser.rows[0].id
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

