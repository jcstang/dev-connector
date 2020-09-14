const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const config = require('config');

console.log('process env node_env');
console.log(process.env.NODE_ENV);
const expiresTime = process.env.NODE_ENV === 'production' ? 3600 : 360000;
console.log(expiresTime);

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'please include valid email').isEmail(),
    check(
      'password',
      'please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // ** check for errors on user input
    // express-validator uses an array of errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // ** destructring req.body - for ease of use
    const { name, email, password } = req.body;

    try {
      // * see if user esists
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: 'user already exists' }] });
      }

      // Get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      // * construct user first before save attempt
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // ** SAVE the user **
      try {
        await user.save();
      } catch (error) {
        console.log(error.message);
      }

      // return jsonwebtoken
      // payload to pass to sign func
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: expiresTime },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // res.send('user registered');
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }

    // res.status(200).send('successfully registered user........');
  }
);

module.exports = router;
