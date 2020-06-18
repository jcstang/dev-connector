const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
  check('name', 'name is required').not().isEmpty(),
  check('email', 'please include valid email').isEmail(),
  check('password', 'please enter a password with 6 or more characters').isLength({ min: 6 })
], (req, res) => {
  // express-validator uses an array of errors.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  res.status(200).send('successfully registered user........');
});

module.exports = router;