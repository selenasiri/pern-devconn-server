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
   
// @route   POST api/auth (login)
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

         if (user.rows.length === 0) {
            return res.status(401).json({ errors: [ { msg: 'Invalid Credentials' }] });
         } // 401 => invalid authentication 
     
         //compares an encrypted password (user.password) to  password (defined in const above):
         const isMatch = await bcrypt.compare(password, user.rows[0].password);

         if (!isMatch) {
            return res.status(401).json({ errors: [ { msg: 'Invalid Credentials' }] });
         }
         
        // Return jsonwebtoken
         const payload = {
             user: {
                 id: user.rows[0].id,
                 name: user.rows[0].name,
                 email: user.rows[0].email
                 // Including a name and email makes it easier for debugging,
                 // instead of just containing a user id 
             },
         };

         const token = jwt.sign(payload,
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

